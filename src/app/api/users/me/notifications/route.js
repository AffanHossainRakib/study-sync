import { getCollections } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/users/me/notifications
 * Get user's notifications
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { users } = await getCollections();
    const user = await users.findOne({ _id: auth.user._id });

    if (!user) return createErrorResponse("User not found", 404);

    const notifications = user.notifications || [];

    // Sort by createdAt desc
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return createSuccessResponse({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return createErrorResponse("Failed to fetch notifications", 500);
  }
}

/**
 * PUT /api/users/me/notifications
 * Mark notifications as read or clear them
 */
export async function PUT(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { action, notificationIds } = await request.json();

    if (!action || !["markRead", "markAllRead", "delete"].includes(action)) {
      return createErrorResponse(
        "Invalid action. Must be markRead, markAllRead, or delete",
        400
      );
    }

    const { users } = await getCollections();

    if (action === "markAllRead") {
      await users.updateOne(
        { _id: auth.user._id },
        { $set: { "notifications.$[].read": true } }
      );

      return createSuccessResponse({
        message: "All notifications marked as read",
      });
    }

    if (
      action === "markRead" &&
      notificationIds &&
      notificationIds.length > 0
    ) {
      await users.updateOne(
        { _id: auth.user._id },
        {
          $set: {
            "notifications.$[elem].read": true,
          },
        },
        {
          arrayFilters: [{ "elem.id": { $in: notificationIds } }],
        }
      );

      return createSuccessResponse({ message: "Notifications marked as read" });
    }

    if (action === "delete" && notificationIds && notificationIds.length > 0) {
      await users.updateOne(
        { _id: auth.user._id },
        {
          $pull: {
            notifications: { id: { $in: notificationIds } },
          },
        }
      );

      return createSuccessResponse({ message: "Notifications deleted" });
    }

    return createErrorResponse("Invalid request parameters", 400);
  } catch (error) {
    console.error("Error updating notifications:", error);
    return createErrorResponse("Failed to update notifications", 500);
  }
}
