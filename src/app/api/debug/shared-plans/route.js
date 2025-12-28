import { getCollections } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/debug/shared-plans
 * Debug endpoint to check shared plans data
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { studyPlans } = await getCollections();

    // Find all plans that have sharedWith data
    const plansWithSharing = await studyPlans
      .find({ sharedWith: { $exists: true, $ne: [] } })
      .toArray();

    // Find plans shared with this user
    const sharedWithMe = await studyPlans
      .find({
        $or: [
          { "sharedWith.userId": auth.user._id },
          { "sharedWith.email": auth.user.email.toLowerCase() },
        ],
      })
      .toArray();

    return createSuccessResponse({
      currentUser: {
        _id: auth.user._id,
        email: auth.user.email,
      },
      totalPlansWithSharing: plansWithSharing.length,
      plansSharedWithMe: sharedWithMe.length,
      details: plansWithSharing.map((p) => ({
        _id: p._id,
        title: p.title,
        sharedWith: p.sharedWith,
      })),
      sharedWithMeDetails: sharedWithMe.map((p) => ({
        _id: p._id,
        title: p.title,
        sharedWith: p.sharedWith,
      })),
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return createErrorResponse("Debug failed", 500);
  }
}
