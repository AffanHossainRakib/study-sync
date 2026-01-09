import admin from "@/lib/firebase-admin";
import { getCollections, schemas } from "@/lib/db";

export async function authenticate(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: true, status: 401, message: "No token provided" };
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { users } = await getCollections();
    let user = await users.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      const newUser = schemas.user({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName:
          decodedToken.name || decodedToken.email?.split("@")[0] || "",
        photoURL: decodedToken.picture || "",
      });
      const result = await users.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Ensure role field exists (for users created before role was added)
      if (!user.role) {
        await users.updateOne({ _id: user._id }, { $set: { role: "user" } });
        user.role = "user";
      }
    }

    return { error: false, user, firebaseUser: decodedToken };
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    console.error("Error details:", error);
    return { error: true, status: 401, message: "Invalid or expired token" };
  }
}

export async function optionalAuth(request) {
  try {
    const auth = await authenticate(request);
    if (auth.error) return { error: false, user: null, firebaseUser: null };
    return auth;
  } catch {
    return { error: false, user: null, firebaseUser: null };
  }
}

export function createErrorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export function createSuccessResponse(data, status = 200) {
  return Response.json(data, { status });
}
