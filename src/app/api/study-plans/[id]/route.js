import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  optionalAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/study-plans/:id
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    console.log("Received plan ID:", id, "Length:", id?.length);
    const planId = toObjectId(id);
    if (!planId) {
      console.error("Invalid ObjectId:", id, "Must be 24 hex characters");
      return createErrorResponse(
        `Invalid study plan ID format. Expected 24 hex characters, got ${id?.length || 0}`,
        400
      );
    }

    const auth = await optionalAuth(request);
    const { studyPlans, users, resources } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    // Check access
    const hasAccess = auth.user
      ? plan.createdBy.equals(auth.user._id) ||
        plan.sharedWith.some((s) => s.userId.equals(auth.user._id)) ||
        plan.isPublic
      : plan.isPublic;

    if (!hasAccess) return createErrorResponse("Access denied", 403);

    // Increment view count for public plans
    if (plan.isPublic) {
      await studyPlans.updateOne({ _id: planId }, { $inc: { viewCount: 1 } });
    }

    // Populate data
    const creator = await users.findOne({ _id: plan.createdBy });
    const planResources = await resources
      .find({ _id: { $in: plan.resourceIds } })
      .toArray();

    const totalTime = planResources.reduce((sum, r) => {
      if (r.type === "youtube-video") return sum + (r.metadata?.duration || 0);
      if (r.type === "pdf")
        return sum + (r.metadata?.pages || 0) * (r.metadata?.minsPerPage || 0);
      if (r.type === "article") return sum + (r.metadata?.estimatedMins || 0);
      return sum;
    }, 0);

    return createSuccessResponse({
      ...plan,
      createdBy: creator
        ? {
            _id: creator._id,
            displayName: creator.displayName,
            email: creator.email,
          }
        : null,
      resourceIds: planResources,
      totalTime,
      resourceCount: planResources.length,
      canEdit: auth.user
        ? plan.createdBy.equals(auth.user._id) ||
          plan.sharedWith.some((s) => s.userId.equals(auth.user._id))
        : false,
    });
  } catch (error) {
    console.error("Error fetching study plan:", error);
    return createErrorResponse("Failed to fetch study plan", 500);
  }
}

/**
 * PUT /api/study-plans/:id
 */
export async function PUT(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const planId = toObjectId(id);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { studyPlans } = await getCollections();
    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    // Check edit permissions
    const canEdit =
      plan.createdBy.equals(auth.user._id) ||
      plan.sharedWith.some(
        (s) => s.userId.equals(auth.user._id) && s.role === "editor"
      );

    if (!canEdit)
      return createErrorResponse(
        "You do not have permission to edit this study plan",
        403
      );

    const updates = await request.json();
    const allowedFields = [
      "title",
      "shortDescription",
      "fullDescription",
      "courseCode",
      "isPublic",
      "resourceIds",
    ];

    const updateDoc = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateDoc[field] =
          field === "resourceIds"
            ? updates[field].map((id) => toObjectId(id)).filter(Boolean)
            : updates[field];
      }
    });

    updateDoc.lastModifiedBy = auth.user._id;
    updateDoc.lastModifiedAt = new Date();
    updateDoc.updatedAt = new Date();

    await studyPlans.updateOne({ _id: planId }, { $set: updateDoc });

    const updatedPlan = await studyPlans.findOne({ _id: planId });

    return createSuccessResponse({
      message: "Study plan updated successfully",
      studyPlan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating study plan:", error);
    return createErrorResponse("Failed to update study plan", 500);
  }
}

/**
 * DELETE /api/study-plans/:id
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const planId = toObjectId(id);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { studyPlans } = await getCollections();
    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    if (!plan.createdBy.equals(auth.user._id)) {
      return createErrorResponse(
        "Only the creator can delete this study plan",
        403
      );
    }

    await studyPlans.deleteOne({ _id: planId });

    return createSuccessResponse({
      message: "Study plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting study plan:", error);
    return createErrorResponse("Failed to delete study plan", 500);
  }
}
