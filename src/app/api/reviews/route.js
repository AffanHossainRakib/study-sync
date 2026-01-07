import { authenticate, createErrorResponse, createSuccessResponse } from "@/lib/auth";
import { getCollections, schemas } from "@/lib/db";

export async function POST(request) {
    const auth = await authenticate(request);
    if (auth.error) {
        return createErrorResponse(auth.message, auth.status);
    }

    try {
        const body = await request.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            return createErrorResponse("Rating must be between 1 and 5", 400);
        }

        if (!comment || typeof comment !== "string") {
            return createErrorResponse("Comment is required", 400);
        }

        const { reviews } = await getCollections();

        const newReview = schemas.review({
            userId: auth.user._id,
            rating,
            comment,
        });

        const result = await reviews.insertOne(newReview);

        return createSuccessResponse({ ...newReview, _id: result.insertedId }, 201);
    } catch (error) {
        console.error("Error creating review:", error);
        return createErrorResponse("Internal server error", 500);
    }
}

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) {
        return createErrorResponse(auth.message, auth.status);
    }

    // Check for admin role
    if (auth.user.role !== "admin") {
        return createErrorResponse("Forbidden: Admin access required", 403);
    }

    try {
        const { reviews, users } = await getCollections();

        // Fetch all reviews, sorted by newest first
        const allReviews = await reviews.find().sort({ createdAt: -1 }).toArray();

        // Enrich with user info (basic info only for privacy)
        const distinctUserIds = [...new Set(allReviews.map(r => r.userId))];
        const userMap = {};

        if (distinctUserIds.length > 0) {
            const reviewers = await users.find(
                { _id: { $in: distinctUserIds } },
                { projection: { displayName: 1, email: 1, photoURL: 1 } }
            ).toArray();

            reviewers.forEach(u => {
                userMap[u._id.toString()] = u;
            });
        }

        const enrichedReviews = allReviews.map(review => ({
            ...review,
            user: userMap[review.userId.toString()] || null
        }));

        return createSuccessResponse(enrichedReviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return createErrorResponse("Internal server error", 500);
    }
}
