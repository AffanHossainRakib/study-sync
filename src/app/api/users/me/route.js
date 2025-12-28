import { getCollections } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { users } = await getCollections();
    const user = await users.findOne({ _id: auth.user._id });

    if (!user) return createErrorResponse("User not found", 404);

    return createSuccessResponse({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return createErrorResponse("Failed to fetch user profile", 500);
  }
}

/**
 * PUT /api/users/me
 * Update current user profile
 */
export async function PUT(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const updates = await request.json();
    const allowedFields = ["displayName", "photoURL", "bio", "preferences"];

    const { users } = await getCollections();

    const updateDoc = {};
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateDoc[field] = updates[field];
      }
    });

    if (Object.keys(updateDoc).length === 0) {
      return createErrorResponse("No valid fields to update", 400);
    }

    updateDoc.updatedAt = new Date();

    await users.updateOne({ _id: auth.user._id }, { $set: updateDoc });

    const updatedUser = await users.findOne({ _id: auth.user._id });

    return createSuccessResponse({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return createErrorResponse("Failed to update user profile", 500);
  }
}
