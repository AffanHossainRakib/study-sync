import admin from "firebase-admin";

/**
 * Firebase Admin SDK Configuration for Next.js
 * Initializes Firebase Admin with service account credentials
 */

if (!admin.apps.length) {
  try {
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      "base64"
    ).toString("utf8");

    const serviceAccount = JSON.parse(decoded);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
    throw error;
  }
}

export default admin;
