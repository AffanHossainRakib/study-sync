import { authenticate, createErrorResponse, createSuccessResponse } from "@/lib/auth";

export async function GET(request) {
    const auth = await authenticate(request);
    if (auth.error) {
        return createErrorResponse(auth.message, auth.status);
    }

    return createSuccessResponse(auth.user);
}
