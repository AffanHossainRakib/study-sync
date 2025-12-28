import { getCollections } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";
import { sendTestEmail } from "@/lib/email";

/**
 * POST /api/notifications/test-email
 * Send a test email to verify email configuration
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { users } = await getCollections();
    const user = await users.findOne({ _id: auth.user._id });

    if (!user) return createErrorResponse("User not found", 404);

    const result = await sendTestEmail(user.email);

    if (!result.success) {
      return createErrorResponse(
        result.message || "Failed to send test email",
        500
      );
    }

    return createSuccessResponse({
      message: `Test email sent successfully to ${user.email}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return createErrorResponse("Failed to send test email", 500);
  }
}
