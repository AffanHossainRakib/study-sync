import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * POST /api/study-plans/:id/share
 */
export async function POST(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { id } = await params;
    const planId = toObjectId(id);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { email } = await request.json();
    if (!email) return createErrorResponse("Email is required", 400);

    const { studyPlans, users } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    const canEdit =
      plan.createdBy.equals(auth.user._id) ||
      plan.sharedWith.some((s) => s.userId.equals(auth.user._id));

    if (!canEdit)
      return createErrorResponse(
        "You do not have permission to share this study plan",
        403
      );

    const targetUser = await users.findOne({ email });
    if (!targetUser)
      return createErrorResponse("User with this email not found", 404);

    if (plan.createdBy.equals(targetUser._id)) {
      return createErrorResponse("Cannot share with the creator", 400);
    }

    if (plan.sharedWith.some((s) => s.userId.equals(targetUser._id))) {
      return createErrorResponse(
        "Study plan already shared with this user",
        400
      );
    }

    await studyPlans.updateOne(
      { _id: planId },
      {
        $push: {
          sharedWith: {
            userId: targetUser._id,
            email: targetUser.email,
            role: "editor",
            sharedAt: new Date(),
          },
        },
      }
    );

    return createSuccessResponse({ message: "Study plan shared successfully" });
  } catch (error) {
    console.error("Error sharing study plan:", error);
    return createErrorResponse("Failed to share study plan", 500);
  }
}
