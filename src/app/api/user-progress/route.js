import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/user-progress
 * Get user progress for resources in a study plan instance
 */
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId");
    const resourceId = searchParams.get("resourceId");

    const { userProgress } = await getCollections();

    let query = { userId: auth.user._id };

    if (instanceId) {
      const instId = toObjectId(instanceId);
      if (instId) query.instanceId = instId;
    }

    if (resourceId) {
      const resId = toObjectId(resourceId);
      if (resId) query.resourceId = resId;
    }

    const progress = await userProgress.find(query).toArray();

    return createSuccessResponse({ progress });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return createErrorResponse("Failed to fetch user progress", 500);
  }
}

/**
 * POST /api/user-progress
 * Create or update user progress for a resource
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const body = await request.json();
    const { instanceId, resourceId, completed, progress, timeSpent, notes } =
      body;

    const instId = toObjectId(instanceId);
    const resId = toObjectId(resourceId);

    if (!instId || !resId) {
      return createErrorResponse("Invalid instanceId or resourceId", 400);
    }

    const { userProgress, instances } = await getCollections();

    // Verify instance ownership
    const instance = await instances.findOne({ _id: instId });
    if (!instance) return createErrorResponse("Instance not found", 404);

    if (!instance.userId.equals(auth.user._id)) {
      return createErrorResponse(
        "You do not have permission to update this progress",
        403
      );
    }

    // Find existing progress or create new
    const existingProgress = await userProgress.findOne({
      userId: auth.user._id,
      instanceId: instId,
      resourceId: resId,
    });

    const now = new Date();

    if (existingProgress) {
      // Update existing progress
      const updateDoc = {
        completed:
          completed !== undefined ? completed : existingProgress.completed,
        progress: progress !== undefined ? progress : existingProgress.progress,
        timeSpent:
          timeSpent !== undefined ? timeSpent : existingProgress.timeSpent,
        notes: notes !== undefined ? notes : existingProgress.notes,
        lastAccessedAt: now,
        updatedAt: now,
      };

      if (completed && !existingProgress.completed) {
        updateDoc.completedAt = now;
      }

      await userProgress.updateOne(
        { _id: existingProgress._id },
        { $set: updateDoc }
      );

      const updated = await userProgress.findOne({ _id: existingProgress._id });

      return createSuccessResponse({
        message: "Progress updated successfully",
        progress: updated,
      });
    } else {
      // Create new progress
      const newProgress = {
        userId: auth.user._id,
        instanceId: instId,
        resourceId: resId,
        completed: completed || false,
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        notes: notes || "",
        completedAt: completed ? now : null,
        lastAccessedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await userProgress.insertOne(newProgress);

      return createSuccessResponse(
        {
          message: "Progress created successfully",
          progress: { ...newProgress, _id: result.insertedId },
        },
        201
      );
    }
  } catch (error) {
    console.error("Error saving user progress:", error);
    return createErrorResponse("Failed to save user progress", 500);
  }
}
