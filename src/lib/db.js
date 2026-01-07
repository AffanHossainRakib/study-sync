import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

/**
 * Database collections helper
 * Provides typed access to MongoDB collections
 */

export async function getCollections() {
  const db = await getDb();

  return {
    users: db.collection("users"),
    studyPlans: db.collection("studyplans"),
    instances: db.collection("instances"),
    resources: db.collection("resources"),
    userProgress: db.collection("userprogresses"),
    reviews: db.collection("reviews"),
  };
}

/**
 * Helper to validate and convert ObjectId
 */
export function toObjectId(id) {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  if (ObjectId.isValid(id)) return new ObjectId(id);
  return null;
}

/**
 * Helper to ensure indexes are created
 */
export async function ensureIndexes() {
  const collections = await getCollections();

  // Users indexes
  await collections.users.createIndex({ firebaseUid: 1 }, { unique: true });
  await collections.users.createIndex({ email: 1 }, { unique: true });

  // Study Plans indexes
  await collections.studyPlans.createIndex({ createdBy: 1 });
  await collections.studyPlans.createIndex({ isPublic: 1 });
  await collections.studyPlans.createIndex({ courseCode: 1 });
  await collections.studyPlans.createIndex({ "sharedWith.userId": 1 });

  // Instances indexes
  await collections.instances.createIndex({ userId: 1 });
  await collections.instances.createIndex({ studyPlanId: 1 });
  await collections.instances.createIndex({ userId: 1, studyPlanId: 1 });

  // Resources indexes
  await collections.resources.createIndex({ url: 1 }, { unique: true });
  await collections.resources.createIndex({ type: 1 });

  // User Progress indexes
  await collections.userProgress.createIndex({ userId: 1 });
  await collections.userProgress.createIndex({ resourceId: 1 });
  await collections.userProgress.createIndex(
    { userId: 1, resourceId: 1 },
    { unique: true }
  );

  // Reviews indexes
  await collections.reviews.createIndex({ userId: 1 });
  await collections.reviews.createIndex({ createdAt: -1 });
}

/**
 * Schema validation helpers
 */
export const schemas = {
  user: (data) => ({
    firebaseUid: data.firebaseUid,
    email: data.email,
    displayName: data.displayName || "",
    photoURL: data.photoURL || "",
    role: data.role || "user",
    notificationSettings: data.notificationSettings || {
      emailReminders: true,
      reminderTime: "09:00",
      reminderFrequency: "daily",
      customDays: [1, 2, 3, 4, 5],
      deadlineWarnings: true,
      weeklyDigest: true,
    },
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),

  studyPlan: (data) => ({
    title: data.title,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription || "",
    courseCode: data.courseCode,
    resourceIds: (data.resourceIds || [])
      .map((id) => toObjectId(id))
      .filter(Boolean),
    createdBy: toObjectId(data.createdBy),
    sharedWith: data.sharedWith || [],
    isPublic: data.isPublic || false,
    lastModifiedBy: toObjectId(data.lastModifiedBy),
    lastModifiedAt: new Date(),
    instanceCount: data.instanceCount || 0,
    viewCount: data.viewCount || 0,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),

  instance: (data) => ({
    studyPlanId: toObjectId(data.studyPlanId),
    userId: toObjectId(data.userId),
    snapshotResourceIds: (data.snapshotResourceIds || [])
      .map((id) => toObjectId(id))
      .filter(Boolean),
    customTitle: data.customTitle || "",
    notes: data.notes || "",
    deadline: data.deadline ? new Date(data.deadline) : null,
    startedAt: data.startedAt || new Date(),
    customReminders: data.customReminders || [],
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),

  resource: (data) => ({
    url: data.url,
    title: data.title,
    type: data.type,
    metadata: data.metadata || {},
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),

  userProgress: (data) => ({
    userId: toObjectId(data.userId),
    resourceId: toObjectId(data.resourceId),
    completed: data.completed || false,
    completedAt: data.completed ? data.completedAt || new Date() : null,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),

  review: (data) => ({
    userId: toObjectId(data.userId),
    rating: data.rating,
    comment: data.comment,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date(),
  }),
};

/**
 * Helper to calculate resource total time
 */
export function getResourceTotalTime(resource) {
  if (resource.type === "youtube-video") {
    return resource.metadata?.duration || 0;
  } else if (resource.type === "pdf") {
    return (
      (resource.metadata?.pages || 0) * (resource.metadata?.minsPerPage || 0)
    );
  } else if (resource.type === "article" || resource.type === "google-drive" || resource.type === "custom-link") {
    return resource.metadata?.estimatedMins || 0;
  }
  return 0;
}
