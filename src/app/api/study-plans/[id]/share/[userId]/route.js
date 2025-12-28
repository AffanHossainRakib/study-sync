import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * DELETE /api/study-plans/:id/share/:userId
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id, userId } = params;
    const planId = toObjectId(id);
    const targetUserId = toObjectId(userId);

    if (!planId || !targetUserId)
      return createErrorResponse("Invalid IDs", 400);

    const { studyPlans } = await getCollections();
    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    const isCreator = plan.createdBy.equals(auth.user._id);
    const isSelf = auth.user._id.equals(targetUserId);

    if (!isCreator && !isSelf) {
      return createErrorResponse(
        "You do not have permission to remove this collaborator",
        403
      );
    }

    await studyPlans.updateOne(
      { _id: planId },
      { $pull: { sharedWith: { userId: targetUserId } } }
    );

    return createSuccessResponse({
      message: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return createErrorResponse("Failed to remove collaborator", 500);
  }
}
