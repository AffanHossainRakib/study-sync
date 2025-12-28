import { MongoClient } from "mongodb";

/**
 * MongoDB connection for Next.js API Routes
 * Uses native MongoDB driver with connection caching
 */

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const MONGODB_URI = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

/**
 * Get database instance
 */
export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db("study_sync");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default clientPromise;
