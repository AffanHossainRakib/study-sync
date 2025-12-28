import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * DELETE /api/study-plans/:id/share/:userId
 * Remove shared access - accepts either userId (ObjectId) or email address
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id, userId } = await params;
    const planId = toObjectId(id);

    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { studyPlans } = await getCollections();
    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    // Check if user has permission (creator or editor)
    const isCreator = plan.createdBy.equals(auth.user._id);
    const isEditor = plan.sharedWith.some(
      (s) => s.userId && s.userId.equals(auth.user._id) && s.role === "editor"
    );

    if (!isCreator && !isEditor) {
      return createErrorResponse(
        "You do not have permission to remove collaborators",
        403
      );
    }

    // Try to parse as ObjectId first, if fails treat as email
    const targetUserId = toObjectId(userId);
    let result;

    if (targetUserId) {
      // Remove by userId
      const isSelf = auth.user._id.equals(targetUserId);
      if (!isCreator && !isSelf) {
        return createErrorResponse(
          "You do not have permission to remove this collaborator",
          403
        );
      }

      result = await studyPlans.updateOne(
        { _id: planId },
        { $pull: { sharedWith: { userId: targetUserId } } }
      );
    } else {
      // Remove by email
      const email = decodeURIComponent(userId).toLowerCase();
      result = await studyPlans.updateOne(
        { _id: planId },
        { $pull: { sharedWith: { email } } }
      );
    }

    if (result.modifiedCount === 0) {
      return createErrorResponse("Shared access not found", 404);
    }

    return createSuccessResponse({
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return createErrorResponse("Failed to remove collaborator", 500);
  }
}
