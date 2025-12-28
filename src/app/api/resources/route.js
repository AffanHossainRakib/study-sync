import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";
import { getVideoMetadata, getPlaylistVideos } from "@/lib/youtube";

/**
 * GET /api/resources
 * Get resources with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studyPlanId = searchParams.get("studyPlanId");

    if (!studyPlanId) {
      return createErrorResponse(
        "studyPlanId query parameter is required",
        400
      );
    }

    const planId = toObjectId(studyPlanId);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { resources, studyPlans } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    const planResources = await resources
      .find({ _id: { $in: plan.resourceIds } })
      .toArray();

    return createSuccessResponse({ resources: planResources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return createErrorResponse("Failed to fetch resources", 500);
  }
}

/**
 * POST /api/resources
 * Create a new resource and add it to a study plan
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const body = await request.json();
    const { studyPlanId, type, title, url, description, metadata = {} } = body;

    const planId = toObjectId(studyPlanId);
    if (!planId) return createErrorResponse("Invalid study plan ID", 400);

    const { resources, studyPlans } = await getCollections();

    const plan = await studyPlans.findOne({ _id: planId });
    if (!plan) return createErrorResponse("Study plan not found", 404);

    // Check edit permissions
    const canEdit =
      plan.createdBy.equals(auth.user._id) ||
      plan.sharedWith.some(
        (s) => s.userId.equals(auth.user._id) && s.role === "editor"
      );

    if (!canEdit) {
      return createErrorResponse(
        "You do not have permission to add resources to this study plan",
        403
      );
    }

    let finalMetadata = { ...metadata };

    // Fetch YouTube metadata if type is youtube
    if (type === "youtube-video" && url) {
      try {
        const videoId = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
        )?.[1];
        if (videoId) {
          const ytMetadata = await getVideoMetadata(videoId);
          finalMetadata = { ...finalMetadata, ...ytMetadata };
        }
      } catch (ytError) {
        console.warn("Failed to fetch YouTube metadata:", ytError);
      }
    } else if (type === "youtube-playlist" && url) {
      try {
        const playlistId = url.match(/[?&]list=([^&]+)/)?.[1];
        if (playlistId) {
          const videos = await getPlaylistVideos(playlistId);
          finalMetadata.videos = videos;
          finalMetadata.videoCount = videos.length;
          finalMetadata.duration = videos.reduce(
            (sum, v) => sum + (v.duration || 0),
            0
          );
        }
      } catch (ytError) {
        console.warn("Failed to fetch playlist metadata:", ytError);
      }
    }

    const newResource = {
      studyPlanId: planId,
      type,
      title: title || finalMetadata.title || "Untitled Resource",
      url: url || "",
      description: description || "",
      metadata: finalMetadata,
      addedBy: auth.user._id,
      order: plan.resourceIds.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await resources.insertOne(newResource);

    // Add to study plan
    await studyPlans.updateOne(
      { _id: planId },
      {
        $push: { resourceIds: result.insertedId },
        $set: {
          lastModifiedBy: auth.user._id,
          lastModifiedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return createSuccessResponse(
      {
        message: "Resource created successfully",
        resource: { ...newResource, _id: result.insertedId },
      },
      201
    );
  } catch (error) {
    console.error("Error creating resource:", error);
    return createErrorResponse("Failed to create resource", 500);
  }
}
