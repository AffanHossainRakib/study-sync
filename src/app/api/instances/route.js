import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/instances
 * Get user's study plan instances
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const studyPlanId = searchParams.get("studyPlanId");

    const { instances, studyPlans, resources } = await getCollections();

    let query = { userId: auth.user._id };
    if (status) query.status = status;
    if (studyPlanId) {
      const planId = toObjectId(studyPlanId);
      if (planId) query.studyPlanId = planId;
    }

    const userInstances = await instances
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const { userProgress } = await getCollections();

    const instancesWithDetails = await Promise.all(
      userInstances.map(async (instance) => {
        const plan = await studyPlans.findOne({ _id: instance.studyPlanId });
        if (!plan) return { ...instance, studyPlan: null };

        // Use snapshotResourceIds if available, otherwise fall back to plan.resourceIds (for backward compatibility)
        const resourceIds =
          instance.snapshotResourceIds &&
            instance.snapshotResourceIds.length > 0
            ? instance.snapshotResourceIds
            : plan.resourceIds || [];

        const planResources = await resources
          .find({ _id: { $in: resourceIds } })
          .toArray();

        // Get user progress for resources (GLOBAL - not per instance)
        // If a resource is marked complete in any instance, it shows as complete everywhere
        const progressRecords = await userProgress
          .find({
            userId: auth.user._id,
            resourceId: { $in: planResources.map((r) => r._id) },
          })
          .toArray();

        // Create a map of resourceId -> completed status
        const progressMap = new Map();
        progressRecords.forEach((p) => {
          if (p.completed) {
            progressMap.set(p.resourceId.toString(), true);
          }
        });

        const totalTime = planResources.reduce((sum, r) => {
          if (r.type === "youtube-video")
            return sum + (r.metadata?.duration || 0);
          if (r.type === "pdf")
            return (
              sum + (r.metadata?.pages || 0) * (r.metadata?.minsPerPage || 0)
            );
          if (
            r.type === "article" ||
            r.type === "google-drive" ||
            r.type === "custom-link"
          )
            return sum + (r.metadata?.estimatedMins || 0);
          return sum;
        }, 0);

        const completedResources = planResources.filter((r) =>
          progressMap.get(r._id.toString())
        );

        const completedTime = completedResources.reduce((sum, r) => {
          if (r.type === "youtube-video")
            return sum + (r.metadata?.duration || 0);
          if (r.type === "pdf")
            return (
              sum + (r.metadata?.pages || 0) * (r.metadata?.minsPerPage || 0)
            );
          if (
            r.type === "article" ||
            r.type === "google-drive" ||
            r.type === "custom-link"
          )
            return sum + (r.metadata?.estimatedMins || 0);
          return sum;
        }, 0);

        const resourcePercent =
          planResources.length > 0
            ? Math.round(
              (completedResources.length / planResources.length) * 100
            )
            : 0;

        const timePercent =
          totalTime > 0 ? Math.round((completedTime / totalTime) * 100) : 0;

        return {
          ...instance,
          totalResources: planResources.length,
          completedResources: completedResources.length, // Count, not array
          totalTime,
          completedTime,
          remainingTime: totalTime - completedTime,
          resourcePercent,
          timePercent,
          progress: resourcePercent,
          deadline: instance.endDate,
          studyPlan: {
            _id: plan._id,
            title: plan.title,
            shortDescription: plan.shortDescription,
            courseCode: plan.courseCode,
            totalTime,
            resourceCount: planResources.length,
          },
        };
      })
    );

    return createSuccessResponse({ instances: instancesWithDetails });
  } catch (error) {
    console.error("Error fetching instances:", error);
    return createErrorResponse("Failed to fetch instances", 500);
  }
}

/**
 * POST /api/instances
 * Create a new study plan instance
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const body = await request.json();
    const { studyPlanId, startDate, endDate, reminderTime, resourceSchedule } =
      body;

    const planId = toObjectId(studyPlanId);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { instances, studyPlans } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return createErrorResponse("End date must be after start date", 400);
    }

    // Snapshot the plan's resources at creation time
    // This ensures instances are independent of plan changes
    const snapshotResourceIds = plan.resourceIds || [];

    const newInstance = {
      userId: auth.user._id,
      studyPlanId: planId,
      snapshotResourceIds: snapshotResourceIds, // Snapshot of resources at creation
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "active",
      progress: 0,
      completedResources: [],
      resourceSchedule: resourceSchedule || [],
      reminderTime: reminderTime || "09:00",
      reminderEnabled: true,
      customReminders: auth.user.notificationSettings?.customReminders || [],
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await instances.insertOne(newInstance);

    // Increment instance count
    await studyPlans.updateOne({ _id: planId }, { $inc: { instanceCount: 1 } });

    return createSuccessResponse(
      {
        message: "Instance created successfully",
        instance: { ...newInstance, _id: result.insertedId },
      },
      201
    );
  } catch (error) {
    console.error("Error creating instance:", error);
    return createErrorResponse("Failed to create instance", 500);
  }
}
