import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/instances/:id
 */
export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const instanceId = toObjectId(id);
    if (!instanceId) return createErrorResponse("Invalid instance ID", 400);

    const { instances, studyPlans, resources } = await getCollections();

    const instance = await instances.findOne({ _id: instanceId });
    if (!instance) return createErrorResponse("Instance not found", 404);

    if (!instance.userId.equals(auth.user._id)) {
      return createErrorResponse(
        "You do not have permission to access this instance",
        403
      );
    }

    const plan = await studyPlans.findOne({ _id: instance.studyPlanId });
    if (!plan) {
      return createSuccessResponse({
        ...instance,
        studyPlan: null,
      });
    }

    // Use snapshotResourceIds if available, otherwise fall back to plan.resourceIds (for backward compatibility)
    const resourceIds = instance.snapshotResourceIds && instance.snapshotResourceIds.length > 0
      ? instance.snapshotResourceIds
      : plan.resourceIds || [];

    const planResources = await resources
      .find({ _id: { $in: resourceIds } })
      .toArray();

    // Get user progress for resources (GLOBAL - not per instance)
    // If a resource is marked complete in any instance, it shows as complete everywhere
    const { userProgress } = await getCollections();
    const progressRecords = await userProgress
      .find({
        userId: auth.user._id,
        resourceId: { $in: planResources.map((r) => r._id) },
      })
      .toArray();

    // Create a map of resourceId -> completed status
    const progressMap = new Map();
    progressRecords.forEach((p) => {
      progressMap.set(p.resourceId.toString(), p.completed);
    });

    // Mark resources with completion status
    const resourcesWithStatus = planResources.map((resource) => ({
      ...resource,
      completed: progressMap.get(resource._id.toString()) || false,
      completedAt: progressRecords.find(
        (p) => p.resourceId.toString() === resource._id.toString() && p.completed
      )?.completedAt || null,
    }));

    const completedResources = resourcesWithStatus.filter((r) => r.completed);

    const totalTime = planResources.reduce((sum, r) => {
      if (r.type === "youtube-video") return sum + (r.metadata?.duration || 0);
      if (r.type === "pdf")
        return sum + (r.metadata?.pages || 0) * (r.metadata?.minsPerPage || 0);
      if (r.type === "article" || r.type === "google-drive" || r.type === "custom-link")
        return sum + (r.metadata?.estimatedMins || 0);
      return sum;
    }, 0);

    const completedTime = completedResources.reduce((sum, r) => {
      if (r.type === "youtube-video")
        return sum + (r.metadata?.duration || 0);
      if (r.type === "pdf")
        return (
          sum + (r.metadata?.pages || 0) * (r.metadata?.minsPerPage || 0)
        );
      if (r.type === "article" || r.type === "google-drive" || r.type === "custom-link")
        return sum + (r.metadata?.estimatedMins || 0);
      return sum;
    }, 0);

    const resourcePercent =
      planResources.length > 0
        ? Math.round((completedResources.length / planResources.length) * 100)
        : 0;

    const timePercent =
      totalTime > 0 ? Math.round((completedTime / totalTime) * 100) : 0;

    return createSuccessResponse({
      ...instance,
      studyPlanId: {
        _id: plan._id,
        title: plan.title,
        courseCode: plan.courseCode,
        shortDescription: plan.shortDescription,
        fullDescription: plan.fullDescription,
      },
      resources: resourcesWithStatus,
      totalResources: planResources.length,
      completedResources: completedResources.length, // Count, not array
      totalTime,
      completedTime,
      remainingTime: totalTime - completedTime,
      resourcePercent,
      timePercent,
      startedAt: instance.startDate,
      deadline: instance.endDate,
      studyPlan: {
        ...plan,
        resourceIds: planResources,
        totalTime,
        resourceCount: planResources.length,
      },
    });
  } catch (error) {
    console.error("Error fetching instance:", error);
    return createErrorResponse("Failed to fetch instance", 500);
  }
}

/**
 * PUT /api/instances/:id
 */
export async function PUT(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const instanceId = toObjectId(id);
    if (!instanceId) return createErrorResponse("Invalid instance ID", 400);

    const { instances } = await getCollections();

    const instance = await instances.findOne({ _id: instanceId });
    if (!instance) return createErrorResponse("Instance not found", 404);

    if (!instance.userId.equals(auth.user._id)) {
      return createErrorResponse(
        "You do not have permission to update this instance",
        403
      );
    }

    const updates = await request.json();
    const allowedFields = [
      "startDate",
      "endDate",
      "status",
      "progress",
      "completedResources",
      "resourceSchedule",
      "reminderTime",
      "reminderEnabled",
      "notes",
    ];

    const updateDoc = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === "startDate" || field === "endDate") {
          updateDoc[field] = new Date(updates[field]);
        } else if (field === "completedResources") {
          updateDoc[field] = updates[field]
            .map((id) => toObjectId(id))
            .filter(Boolean);
        } else {
          updateDoc[field] = updates[field];
        }
      }
    });

    updateDoc.updatedAt = new Date();

    await instances.updateOne({ _id: instanceId }, { $set: updateDoc });

    const updatedInstance = await instances.findOne({ _id: instanceId });

    return createSuccessResponse({
      message: "Instance updated successfully",
      instance: updatedInstance,
    });
  } catch (error) {
    console.error("Error updating instance:", error);
    return createErrorResponse("Failed to update instance", 500);
  }
}

/**
 * DELETE /api/instances/:id
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const instanceId = toObjectId(id);
    if (!instanceId) return createErrorResponse("Invalid instance ID", 400);

    const { instances, studyPlans } = await getCollections();

    const instance = await instances.findOne({ _id: instanceId });
    if (!instance) return createErrorResponse("Instance not found", 404);

    if (!instance.userId.equals(auth.user._id)) {
      return createErrorResponse(
        "You do not have permission to delete this instance",
        403
      );
    }

    await instances.deleteOne({ _id: instanceId });

    // Decrement instance count
    await studyPlans.updateOne(
      { _id: instance.studyPlanId },
      { $inc: { instanceCount: -1 } }
    );

    return createSuccessResponse({ message: "Instance deleted successfully" });
  } catch (error) {
    console.error("Error deleting instance:", error);
    return createErrorResponse("Failed to delete instance", 500);
  }
}
