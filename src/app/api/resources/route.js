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
    const { type, title, url, pages, minsPerPage, estimatedMins } = body;

    if (!type || !url) {
      return createErrorResponse("Type and URL are required", 400);
    }

    const { resources } = await getCollections();

    let finalMetadata = {};
    let finalTitle = title || "Untitled Resource";
    let resourcesToCreate = [];

    // Handle different resource types
    if (type === "youtube-video" && url) {
      try {
        // Pass the full URL to getVideoMetadata, not just the video ID
        const ytMetadata = await getVideoMetadata(url);
        finalMetadata = { ...ytMetadata };
        finalTitle = ytMetadata.title || finalTitle;
      } catch (ytError) {
        console.error("Failed to fetch YouTube metadata:", ytError);
        return createErrorResponse(
          ytError.message || "Failed to fetch video metadata",
          500
        );
      }

      resourcesToCreate.push({
        type,
        title: finalTitle,
        url,
        metadata: finalMetadata,
        addedBy: auth.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (type === "youtube-playlist" && url) {
      try {
        const playlistId = url.match(/[?&]list=([^&]+)/)?.[1];
        if (!playlistId) {
          return createErrorResponse("Invalid playlist URL", 400);
        }

        // getPlaylistVideos expects a URL, not just the ID
        const videos = await getPlaylistVideos(url);

        // Create individual resources for each video in playlist
        resourcesToCreate = videos.map((video) => ({
          type: "youtube-video",
          title: video.title,
          url: video.url,
          metadata: {
            duration: video.duration,
            videoId: video.videoId,
            thumbnail: video.thumbnailUrl,
          },
          addedBy: auth.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      } catch (ytError) {
        console.error("Failed to fetch playlist:", ytError);
        return createErrorResponse(
          ytError.message || "Failed to fetch playlist videos",
          500
        );
      }
    } else if (type === "pdf") {
      if (!title || !pages) {
        return createErrorResponse("Title and pages are required for PDF", 400);
      }

      finalMetadata = {
        pages: parseInt(pages),
        minsPerPage: parseInt(minsPerPage) || 3,
      };

      resourcesToCreate.push({
        type,
        title,
        url,
        metadata: finalMetadata,
        addedBy: auth.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (type === "article") {
      if (!title || !estimatedMins) {
        return createErrorResponse(
          "Title and estimated minutes are required for article",
          400
        );
      }

      finalMetadata = {
        estimatedMins: parseInt(estimatedMins),
      };

      resourcesToCreate.push({
        type,
        title,
        url,
        metadata: finalMetadata,
        addedBy: auth.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (type === "google-drive" || type === "custom-link") {
      // For google-drive and custom-link, store the URL with title and optional estimatedMins
      const metadata = {};
      if (estimatedMins) {
        metadata.estimatedMins = parseInt(estimatedMins);
      }
      resourcesToCreate.push({
        type,
        title: title || url,
        url,
        metadata,
        addedBy: auth.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      return createErrorResponse(`Unsupported resource type: ${type}`, 400);
    }

    // Insert resources
    if (resourcesToCreate.length === 0) {
      return createErrorResponse("No resources to create", 400);
    }

    if (resourcesToCreate.length === 1) {
      // Single resource - check if it already exists
      const existingResource = await resources.findOne({
        url: resourcesToCreate[0].url,
      });

      if (existingResource) {
        // Resource already exists, return it
        return createSuccessResponse(
          {
            message: "Resource already exists",
            resource: existingResource,
            isNew: false,
          },
          200
        );
      }

      // Create new resource
      const result = await resources.insertOne(resourcesToCreate[0]);
      return createSuccessResponse(
        {
          message: "Resource created successfully",
          resource: { ...resourcesToCreate[0], _id: result.insertedId },
          isNew: true,
        },
        201
      );
    } else {
      // Multiple resources (playlist)
      // Check which resources already exist
      const urls = resourcesToCreate.map((r) => r.url);
      const existingResources = await resources
        .find({ url: { $in: urls } })
        .toArray();
      const existingUrlMap = new Map(existingResources.map((r) => [r.url, r]));

      // Separate new and existing resources
      const newResources = [];
      const finalResources = [];

      for (const resource of resourcesToCreate) {
        const existing = existingUrlMap.get(resource.url);
        if (existing) {
          // Use existing resource
          finalResources.push(existing);
        } else {
          // Mark for insertion
          newResources.push(resource);
        }
      }

      // Insert only new resources
      if (newResources.length > 0) {
        const result = await resources.insertMany(newResources);
        const insertedResources = newResources.map((r, i) => ({
          ...r,
          _id: result.insertedIds[i],
        }));
        finalResources.push(...insertedResources);
      }

      const newCount = newResources.length;
      const existingCount = existingResources.length;
      const message =
        existingCount > 0
          ? `${newCount} new resource(s) created, ${existingCount} already existed`
          : `${newCount} resource(s) created successfully`;

      return createSuccessResponse(
        {
          message,
          resources: finalResources,
          newCount,
          existingCount,
          isNew: newCount > 0,
        },
        201
      );
    }
  } catch (error) {
    console.error("Error creating resource:", error);
    return createErrorResponse("Failed to create resource", 500);
  }
}
