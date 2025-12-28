import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  optionalAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/resources/:id
 */
export async function GET(request, { params }) {
  try {
    const auth = await optionalAuth(request);
    const { id } = params;
    const resourceId = toObjectId(id);
    if (!resourceId) return createErrorResponse("Invalid resource ID", 400);

    const { resources, studyPlans } = await getCollections();

    const resource = await resources.findOne({ _id: resourceId });
    if (!resource) return createErrorResponse("Resource not found", 404);

    const plan = await studyPlans.findOne({ _id: resource.studyPlanId });
    if (!plan)
      return createErrorResponse("Associated study plan not found", 404);

    // Check access
    const hasAccess = auth.user
      ? plan.createdBy.equals(auth.user._id) ||
        plan.sharedWith.some((s) => s.userId.equals(auth.user._id)) ||
        plan.isPublic
      : plan.isPublic;

    if (!hasAccess) return createErrorResponse("Access denied", 403);

    return createSuccessResponse(resource);
  } catch (error) {
    console.error("Error fetching resource:", error);
    return createErrorResponse("Failed to fetch resource", 500);
  }
}

/**
 * PUT /api/resources/:id
 */
export async function PUT(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = params;
    const resourceId = toObjectId(id);
    if (!resourceId) return createErrorResponse("Invalid resource ID", 400);

    const { resources, studyPlans } = await getCollections();

    const resource = await resources.findOne({ _id: resourceId });
    if (!resource) return createErrorResponse("Resource not found", 404);

    const plan = await studyPlans.findOne({ _id: resource.studyPlanId });
    if (!plan)
      return createErrorResponse("Associated study plan not found", 404);

    // Check edit permissions
    const canEdit =
      plan.createdBy.equals(auth.user._id) ||
      plan.sharedWith.some(
        (s) => s.userId.equals(auth.user._id) && s.role === "editor"
      );

    if (!canEdit) {
      return createErrorResponse(
        "You do not have permission to edit this resource",
        403
      );
    }

    const updates = await request.json();
    const allowedFields = ["title", "url", "description", "metadata", "order"];

    const updateDoc = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateDoc[field] = updates[field];
      }
    });

    updateDoc.updatedAt = new Date();

    await resources.updateOne({ _id: resourceId }, { $set: updateDoc });

    const updatedResource = await resources.findOne({ _id: resourceId });

    return createSuccessResponse({
      message: "Resource updated successfully",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    return createErrorResponse("Failed to update resource", 500);
  }
}

/**
 * DELETE /api/resources/:id
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = params;
    const resourceId = toObjectId(id);
    if (!resourceId) return createErrorResponse("Invalid resource ID", 400);

    const { resources, studyPlans } = await getCollections();

    const resource = await resources.findOne({ _id: resourceId });
    if (!resource) return createErrorResponse("Resource not found", 404);

    const plan = await studyPlans.findOne({ _id: resource.studyPlanId });
    if (!plan)
      return createErrorResponse("Associated study plan not found", 404);

    // Check edit permissions
    const canEdit = plan.createdBy.equals(auth.user._id);

    if (!canEdit) {
      return createErrorResponse("Only the creator can delete resources", 403);
    }

    await resources.deleteOne({ _id: resourceId });

    // Remove from study plan
    await studyPlans.updateOne(
      { _id: resource.studyPlanId },
      {
        $pull: { resourceIds: resourceId },
        $set: {
          lastModifiedBy: auth.user._id,
          lastModifiedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return createSuccessResponse({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return createErrorResponse("Failed to delete resource", 500);
  }
}
