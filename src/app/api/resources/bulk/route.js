import { getCollections, toObjectId, getResourceTotalTime } from "@/lib/db";
import { createErrorResponse, createSuccessResponse } from "@/lib/auth";

/**
 * GET /api/resources/bulk
 * Get multiple resources by IDs
 * Query param: ids (comma-separated)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return createErrorResponse("ids parameter is required", 400);
    }

    const idArray = ids
      .split(",")
      .map((id) => toObjectId(id))
      .filter(Boolean);

    if (idArray.length === 0) {
      return createErrorResponse("No valid resource IDs provided", 400);
    }

    const { resources } = await getCollections();

    const foundResources = await resources
      .find({ _id: { $in: idArray } })
      .toArray();

    const resourcesWithTime = foundResources.map((resource) => ({
      ...resource,
      totalTime: getResourceTotalTime(resource),
    }));

    return createSuccessResponse(resourcesWithTime);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return createErrorResponse("Failed to fetch resources", 500);
  }
}
