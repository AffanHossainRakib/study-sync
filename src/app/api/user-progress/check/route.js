import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/user-progress/check
 * Check if specific resources are completed by the user
 * Query param: resourceIds (comma-separated)
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { searchParams } = new URL(request.url);
    const resourceIds = searchParams.get("resourceIds");

    if (!resourceIds) {
      return createErrorResponse("resourceIds parameter is required", 400);
    }

    const idArray = resourceIds
      .split(",")
      .map((id) => toObjectId(id))
      .filter(Boolean);

    if (idArray.length === 0) {
      return createErrorResponse("No valid resource IDs provided", 400);
    }

    const { userProgress } = await getCollections();

    const progress = await userProgress
      .find({
        userId: auth.user._id,
        resourceId: { $in: idArray },
      })
      .toArray();

    // Create a map of resourceId -> completion status
    const completionMap = {};
    idArray.forEach((id) => {
      const progressEntry = progress.find((p) => p.resourceId.equals(id));
      completionMap[id.toString()] = {
        completed: progressEntry?.completed || false,
        completedAt: progressEntry?.completedAt || null,
      };
    });

    return createSuccessResponse(completionMap);
  } catch (error) {
    console.error("Error checking resources completion:", error);
    return createErrorResponse("Failed to check completion status", 500);
  }
}
