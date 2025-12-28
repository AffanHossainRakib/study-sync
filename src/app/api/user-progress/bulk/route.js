import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * POST /api/user-progress/bulk
 * Mark multiple resources as complete/incomplete
 * Body: resourceIds (array), completed (boolean)
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { resourceIds, completed } = await request.json();

    if (
      !resourceIds ||
      !Array.isArray(resourceIds) ||
      completed === undefined
    ) {
      return createErrorResponse(
        "resourceIds (array) and completed status are required",
        400
      );
    }

    const { userProgress } = await getCollections();
    const results = [];
    const now = new Date();

    for (const resourceId of resourceIds) {
      const resId = toObjectId(resourceId);
      if (!resId) {
        results.push({
          resourceId,
          success: false,
          error: "Invalid resource ID",
        });
        continue;
      }

      try {
        // Find existing progress entry
        const existingProgress = await userProgress.findOne({
          userId: auth.user._id,
          resourceId: resId,
        });

        if (existingProgress) {
          // Update existing entry
          await userProgress.updateOne(
            { _id: existingProgress._id },
            {
              $set: {
                completed,
                completedAt: completed ? now : null,
                updatedAt: now,
              },
            }
          );
        } else {
          // Create new entry
          await userProgress.insertOne({
            userId: auth.user._id,
            resourceId: resId,
            completed,
            completedAt: completed ? now : null,
            progress: 0,
            timeSpent: 0,
            notes: "",
            lastAccessedAt: now,
            createdAt: now,
            updatedAt: now,
          });
        }

        results.push({
          resourceId,
          success: true,
        });
      } catch (error) {
        results.push({
          resourceId,
          success: false,
          error: error.message,
        });
      }
    }

    return createSuccessResponse({
      message: "Bulk update completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk toggle:", error);
    return createErrorResponse("Failed to bulk update completion", 500);
  }
}
