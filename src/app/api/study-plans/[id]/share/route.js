import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";
import { sendShareInvitation } from "@/lib/email";

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

    const { email, role = "editor" } = await request.json();
    if (!email) return createErrorResponse("Email is required", 400);
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return createErrorResponse("Invalid email format", 400);
    }
    if (!["viewer", "editor"].includes(role)) {
      return createErrorResponse("Role must be viewer or editor", 400);
    }

    const { studyPlans, users } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    const canEdit =
      plan.createdBy.equals(auth.user._id) ||
      plan.sharedWith.some(
        (s) =>
          ((s.userId && s.userId.equals(auth.user._id)) ||
            s.email === auth.user.email.toLowerCase()) &&
          s.role === "editor"
      );

    if (!canEdit)
      return createErrorResponse(
        "You do not have permission to share this study plan",
        403
      );

    // Check if sharing with creator
    const creator = await users.findOne({ _id: plan.createdBy });
    if (creator && creator.email === email.toLowerCase()) {
      return createErrorResponse("Cannot share with the creator", 400);
    }

    // Check if already shared
    if (
      plan.sharedWith.some((s) => s.email.toLowerCase() === email.toLowerCase())
    ) {
      return createErrorResponse(
        "Study plan already shared with this email",
        400
      );
    }

    // Find user by email (may or may not exist)
    const targetUser = await users.findOne({ email: email.toLowerCase() });

    // Add to sharedWith array
    const shareEntry = {
      email: email.toLowerCase(),
      role,
      sharedAt: new Date(),
    };

    // If user exists, add their userId
    if (targetUser) {
      shareEntry.userId = targetUser._id;
    }

    await studyPlans.updateOne(
      { _id: planId },
      {
        $push: {
          sharedWith: shareEntry,
        },
      }
    );

    // Send email invitation
    try {
      const sharedByName =
        auth.user.displayName || auth.user.email.split("@")[0];
      const studyPlanTitle = `${plan.courseCode} - ${plan.title}`;
      await sendShareInvitation(email, sharedByName, studyPlanTitle, id, role);
    } catch (emailError) {
      console.error("Failed to send share invitation email:", emailError);
      // Don't fail the request if email fails
    }

    return createSuccessResponse({
      message: "Study plan shared successfully",
      shared: { email, role, sharedAt: shareEntry.sharedAt },
    });
  } catch (error) {
    console.error("Error sharing study plan:", error);
    return createErrorResponse("Failed to share study plan", 500);
  }
}
