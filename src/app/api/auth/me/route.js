import {
  authenticate,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/auth";

export async function GET(request) {
  const auth = await authenticate(request);
  if (auth.error) {
    return createErrorResponse(auth.message, auth.status);
  }

  // Serialize user object to ensure all fields are properly sent
  const serializedUser = {
    ...auth.user,
    _id: auth.user._id.toString(),
    role: auth.user.role || "user", // Ensure role is always present
  };

  return createSuccessResponse(serializedUser);
}
