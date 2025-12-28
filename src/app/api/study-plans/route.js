import { getCollections, toObjectId } from "@/lib/db";
import {
  authenticate,
  optionalAuth,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

/**
 * GET /api/study-plans
 * Get all public study plans OR user's own plans
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "public";
    const search = searchParams.get("search");
    const courseCode = searchParams.get("courseCode");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    const auth = await optionalAuth(request);
    const { studyPlans, users, resources } = await getCollections();

    let query = {};

    if (view === "public") {
      query.isPublic = true;
    } else if (view === "my") {
      if (!auth.user) {
        return createErrorResponse("Authentication required", 401);
      }
      query = {
        $or: [
          { createdBy: auth.user._id },
          { "sharedWith.userId": auth.user._id },
        ],
      };
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { shortDescription: { $regex: search, $options: "i" } },
          { fullDescription: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (courseCode) {
      query.courseCode = { $regex: courseCode, $options: "i" };
    }

    let sortOption = {};
    switch (sort) {
      case "popular":
        sortOption = { instanceCount: -1, createdAt: -1 };
        break;
      case "shortest":
        sortOption = { resourceIds: 1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const totalPlans = await studyPlans.countDocuments(query);
    const totalPages = Math.ceil(totalPlans / limit);

    const plans = await studyPlans
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate creator info and calculate stats
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const creator = await users.findOne({ _id: plan.createdBy });
        const planResources = await resources
          .find({ _id: { $in: plan.resourceIds || [] } })
          .toArray();

        const totalTime = planResources.reduce((sum, resource) => {
          if (resource.type === "youtube-video")
            return sum + (resource.metadata?.duration || 0);
          if (resource.type === "pdf")
            return (
              sum +
              (resource.metadata?.pages || 0) *
                (resource.metadata?.minsPerPage || 0)
            );
          if (resource.type === "article")
            return sum + (resource.metadata?.estimatedMins || 0);
          return sum;
        }, 0);

        return {
          ...plan,
          createdBy: creator
            ? {
                _id: creator._id,
                displayName: creator.displayName,
                email: creator.email,
                photoURL: creator.photoURL,
              }
            : null,
          totalTime,
          resourceCount: plan.resourceIds?.length || 0,
        };
      })
    );

    return createSuccessResponse({
      plans: plansWithStats,
      pagination: {
        currentPage: page,
        totalPages,
        totalPlans,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching study plans:", error);
    return createErrorResponse("Failed to fetch study plans", 500);
  }
}

/**
 * POST /api/study-plans
 * Create a new study plan
 */
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return createErrorResponse(auth.message, auth.status);

    const body = await request.json();
    const {
      title,
      shortDescription,
      fullDescription,
      courseCode,
      isPublic = false,
    } = body;

    if (!title || !shortDescription || !courseCode) {
      return createErrorResponse(
        "Title, short description, and course code are required",
        400
      );
    }

    const { studyPlans, users } = await getCollections();

    const newPlan = {
      title,
      shortDescription,
      fullDescription: fullDescription || "",
      courseCode,
      resourceIds: [],
      createdBy: auth.user._id,
      sharedWith: [],
      isPublic,
      lastModifiedBy: auth.user._id,
      lastModifiedAt: new Date(),
      instanceCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await studyPlans.insertOne(newPlan);
    const creator = await users.findOne({ _id: auth.user._id });

    return createSuccessResponse(
      {
        message: "Study plan created successfully",
        studyPlan: {
          ...newPlan,
          _id: result.insertedId,
          createdBy: {
            _id: creator._id,
            displayName: creator.displayName,
            email: creator.email,
          },
        },
      },
      201
    );
  } catch (error) {
    console.error("Error creating study plan:", error);
    return createErrorResponse("Failed to create study plan", 500);
  }
}
