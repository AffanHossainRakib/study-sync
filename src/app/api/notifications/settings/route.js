import { getCollections } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/notifications/settings
 * Get user's notification settings
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { users } = await getCollections();
    const user = await users.findOne({ _id: auth.user._id });

    if (!user) return createErrorResponse("User not found", 404);

    const settings = user.notificationSettings || {
      emailReminders: true,
      reminderTime: "09:00",
      reminderFrequency: "daily",
      customDays: [1, 2, 3, 4, 5],
      deadlineWarnings: true,
      weeklyDigest: true,
    };

    return createSuccessResponse({ settings });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return createErrorResponse("Failed to fetch notification settings", 500);
  }
}

/**
 * PUT /api/notifications/settings
 * Update user's notification settings
 */
export async function PUT(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const updates = await request.json();
    const allowedFields = [
      "emailReminders",
      "reminderTime",
      "reminderFrequency",
      "customDays",
      "deadlineWarnings",
      "weeklyDigest",
    ];

    const { users } = await getCollections();

    const updateDoc = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateDoc[`notificationSettings.${field}`] = updates[field];
      }
    });

    if (Object.keys(updateDoc).length === 0) {
      return createErrorResponse("No valid fields to update", 400);
    }

    updateDoc.updatedAt = new Date();

    await users.updateOne({ _id: auth.user._id }, { $set: updateDoc });

    const updatedUser = await users.findOne({ _id: auth.user._id });

    return createSuccessResponse({
      message: "Notification settings updated successfully",
      settings: updatedUser.notificationSettings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return createErrorResponse("Failed to update notification settings", 500);
  }
}
