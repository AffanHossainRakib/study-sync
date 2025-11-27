# StudySync Database Schema

## Overview
This document defines the MongoDB collections and their relationships for the StudySync application.

---

## Collections

### 1. `users`
Stores user information synced from Firebase Authentication.

```javascript
{
  _id: ObjectId,
  firebaseUid: String, // Firebase Auth UID (unique, indexed)
  email: String, // User's email (unique, indexed)
  displayName: String, // User's display name
  photoURL: String, // Optional profile picture URL
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `firebaseUid` (unique)
- `email` (unique)

---

### 2. `resources`
Global pool of learning resources (videos, PDFs, articles). De-duplicated by URL.

```javascript
{
  _id: ObjectId,
  url: String, // Unique resource URL (indexed)
  title: String, // Resource title
  type: String, // Enum: 'youtube-video' | 'pdf' | 'article'

  // Type-specific metadata
  metadata: {
    // For YouTube videos:
    duration: Number, // Duration in minutes
    videoId: String, // YouTube video ID
    thumbnailUrl: String, // Video thumbnail

    // For PDFs:
    pages: Number, // Total pages
    minsPerPage: Number, // Estimated minutes per page

    // For Articles:
    estimatedMins: Number // User-provided estimate
  },

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `url` (unique)
- `type`

**Notes:**
- URL is the unique identifier to prevent duplicates
- When adding a resource, always check if URL exists first
- Total time calculation:
  - YouTube: `metadata.duration`
  - PDF: `metadata.pages * metadata.minsPerPage`
  - Article: `metadata.estimatedMins`

---

### 3. `studyPlans`
Study plan templates (classes). Can be shared and used to create instances.

```javascript
{
  _id: ObjectId,
  title: String, // Plan title
  shortDescription: String, // Brief description (1-2 lines)
  fullDescription: String, // Detailed description
  courseCode: String, // e.g., "CSE110", "EEE220", "ECO101"

  // Resources in this plan (order matters)
  resourceIds: [ObjectId], // Array of resource _ids from resources collection

  // Ownership and sharing
  createdBy: ObjectId, // Reference to users._id
  sharedWith: [
    {
      userId: ObjectId, // Reference to users._id
      email: String, // For display purposes
      role: String, // Always 'editor' for now
      sharedAt: Date
    }
  ],

  // Visibility
  isPublic: Boolean, // If true, visible in "All Plans" page

  // Tracking
  lastModifiedBy: ObjectId, // Reference to users._id
  lastModifiedAt: Date,

  // Stats (optional, for future use)
  instanceCount: Number, // How many instances created from this plan
  viewCount: Number, // Page view count

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdBy`
- `isPublic`
- `courseCode`
- `sharedWith.userId`

**Notes:**
- `resourceIds` maintains order of resources in the plan
- Creator can delete plan, shared users cannot
- Both creator and shared users can edit resources

---

### 4. `instances`
User's active study plans. Created from study plan templates, with personal progress tracking.

```javascript
{
  _id: ObjectId,
  studyPlanId: ObjectId, // Reference to studyPlans._id (original template)
  userId: ObjectId, // Reference to users._id (who created this instance)

  // Snapshot of resources at instance creation time
  // Can be modified independently of the original study plan
  snapshotResourceIds: [ObjectId], // Array of resource _ids (maintains order)

  // Optional user customizations
  customTitle: String, // Optional: user can rename their instance
  notes: String, // Personal notes about this study plan
  deadline: Date, // Optional: user's target completion date

  startedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`
- `studyPlanId`
- `userId + studyPlanId` (compound index for user's instances of specific plan)

**Notes:**
- `snapshotResourceIds` is copied from `studyPlans.resourceIds` at creation
- User can add/remove/reorder resources in instance without affecting template
- Multiple users can create instances from the same study plan
- Same user can create multiple instances from the same study plan

---

### 5. `userProgress`
Tracks global resource completion status per user. Powers the "already completed" feature.

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users._id
  resourceId: ObjectId, // Reference to resources._id
  completed: Boolean, // true = completed, false = marked as incomplete
  completedAt: Date, // When marked as complete (null if not completed)

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId + resourceId` (unique compound index)
- `userId`
- `resourceId`

**Notes:**
- One document per user-resource pair
- If a user marks a resource complete, it's complete everywhere (global)
- Can toggle between complete/incomplete (re-watching content)
- Used to calculate instance progress

---

## Relationships Diagram

```
users (Firebase UID, email)
  ↓ creates
studyPlans (template/class)
  ↓ references
resources (global pool, de-duplicated by URL)
  ↓ tracked by
userProgress (user × resource completion)

users
  ↓ creates instance from
studyPlans
  ↓ creates
instances (personal copy with snapshot)
  ↓ references
resources (via snapshotResourceIds)
```

---

## Key Queries and Operations

### Creating a Study Plan
1. User creates study plan (inserts into `studyPlans`)
2. User adds resources:
   - Check if `resources.url` exists
   - If yes: reuse existing `_id`
   - If no: create new resource document
   - Add resource `_id` to `studyPlans.resourceIds`

### Starting an Instance
1. User clicks "Start This Plan" on `/plans/[id]`
2. Copy `studyPlans.resourceIds` → `instances.snapshotResourceIds`
3. Create new instance document with `userId` and `studyPlanId`

### Calculating Instance Progress
```javascript
// Pseudo-code
const instance = await Instance.findById(instanceId).populate('snapshotResourceIds');
const userProgress = await UserProgress.find({
  userId: currentUser._id,
  resourceId: { $in: instance.snapshotResourceIds }
});

const completedResources = userProgress.filter(p => p.completed).length;
const totalResources = instance.snapshotResourceIds.length;

const completedTime = instance.snapshotResourceIds
  .filter(res => userProgress.find(p => p.resourceId === res._id && p.completed))
  .reduce((sum, res) => sum + calculateResourceTime(res), 0);

const totalTime = instance.snapshotResourceIds
  .reduce((sum, res) => sum + calculateResourceTime(res), 0);

return {
  resourceProgress: `${completedResources}/${totalResources}`,
  resourcePercent: (completedResources / totalResources) * 100,
  timeProgress: `${completedTime}/${totalTime} mins`,
  timePercent: (completedTime / totalTime) * 100,
  remainingTime: totalTime - completedTime
};
```

### Marking Resource as Complete
1. Check if `userProgress` document exists for `userId + resourceId`
2. If exists: update `completed` and `completedAt`
3. If not exists: create new document with `completed: true`

### Sharing a Study Plan
1. Validate that email exists in `users` collection
2. Add to `studyPlans.sharedWith` array:
   ```javascript
   {
     userId: targetUser._id,
     email: targetUser.email,
     role: 'editor',
     sharedAt: new Date()
   }
   ```

### Fetching User's Study Plans
```javascript
// Plans created by user OR shared with user
const myPlans = await StudyPlan.find({
  $or: [
    { createdBy: currentUser._id },
    { 'sharedWith.userId': currentUser._id }
  ]
});
```

### Adding Resource to Instance
1. User adds YouTube video/PDF/article to instance
2. Check if resource URL exists in `resources` collection
3. If yes: get existing `_id`
4. If no:
   - For YouTube: fetch metadata via API, create new resource
   - For PDF/Article: use user-provided metadata, create new resource
5. Add resource `_id` to `instances.snapshotResourceIds`

---

## Sample Documents

### Sample User
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firebaseUid": "firebase_uid_abc123",
  "email": "john@example.com",
  "displayName": "John Doe",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Sample Resource (YouTube Video)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "CS50 Lecture 1 - C Programming",
  "type": "youtube-video",
  "metadata": {
    "duration": 90,
    "videoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Sample Resource (PDF)
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "url": "https://example.com/textbook-chapter1.pdf",
  "title": "Data Structures - Chapter 1",
  "type": "pdf",
  "metadata": {
    "pages": 50,
    "minsPerPage": 3
  },
  "createdAt": "2025-01-15T11:00:00Z",
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

### Sample Study Plan
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "CS50 Midterm Prep",
  "shortDescription": "Complete preparation plan for CS50 midterm covering C programming and data structures",
  "fullDescription": "This study plan covers all essential topics for the CS50 midterm including pointers, arrays, linked lists, and recursion.",
  "courseCode": "CSE110",
  "resourceIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "createdBy": "507f1f77bcf86cd799439011",
  "sharedWith": [
    {
      "userId": "507f1f77bcf86cd799439099",
      "email": "jane@example.com",
      "role": "editor",
      "sharedAt": "2025-01-16T09:00:00Z"
    }
  ],
  "isPublic": true,
  "lastModifiedBy": "507f1f77bcf86cd799439011",
  "lastModifiedAt": "2025-01-15T12:00:00Z",
  "instanceCount": 5,
  "viewCount": 120,
  "createdAt": "2025-01-15T11:30:00Z",
  "updatedAt": "2025-01-15T12:00:00Z"
}
```

### Sample Instance
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "studyPlanId": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "snapshotResourceIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "customTitle": "My CS50 Prep - Week 1",
  "notes": "Focus on pointers first, review linked lists on weekend",
  "deadline": "2025-01-30T23:59:59Z",
  "startedAt": "2025-01-15T13:00:00Z",
  "createdAt": "2025-01-15T13:00:00Z",
  "updatedAt": "2025-01-15T13:00:00Z"
}
```

### Sample User Progress
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "userId": "507f1f77bcf86cd799439011",
  "resourceId": "507f1f77bcf86cd799439012",
  "completed": true,
  "completedAt": "2025-01-16T15:30:00Z",
  "createdAt": "2025-01-15T13:00:00Z",
  "updatedAt": "2025-01-16T15:30:00Z"
}
```

---

## MongoDB Schema Definitions (Mongoose)

### User Schema
```javascript
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  displayName: { type: String },
  photoURL: { type: String }
}, { timestamps: true });
```

### Resource Schema
```javascript
const ResourceSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['youtube-video', 'pdf', 'article'],
    index: true
  },
  metadata: {
    // YouTube
    duration: Number,
    videoId: String,
    thumbnailUrl: String,
    // PDF
    pages: Number,
    minsPerPage: Number,
    // Article
    estimatedMins: Number
  }
}, { timestamps: true });
```

### StudyPlan Schema
```javascript
const StudyPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String },
  courseCode: { type: String, required: true, index: true },
  resourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    role: { type: String, default: 'editor' },
    sharedAt: { type: Date, default: Date.now }
  }],
  isPublic: { type: Boolean, default: false, index: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedAt: { type: Date, default: Date.now },
  instanceCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for shared plans
StudyPlanSchema.index({ 'sharedWith.userId': 1 });
```

### Instance Schema
```javascript
const InstanceSchema = new mongoose.Schema({
  studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  snapshotResourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  customTitle: String,
  notes: String,
  deadline: Date,
  startedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for user's instances
InstanceSchema.index({ userId: 1, studyPlanId: 1 });
```

### UserProgress Schema
```javascript
const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
  completed: { type: Boolean, default: false },
  completedAt: Date
}, { timestamps: true });

// Unique compound index
UserProgressSchema.index({ userId: 1, resourceId: 1 }, { unique: true });
```

---

## Notes for Implementation

1. **De-duplication**: Always check `resources.url` before creating new resource
2. **Populate Queries**: Use `.populate()` to fetch related documents (resources in plans, user info, etc.)
3. **Transactions**: Consider using MongoDB transactions for operations that modify multiple collections (e.g., creating instance + updating study plan instance count)
4. **Soft Deletes**: Consider adding `deletedAt` field instead of hard deletes for study plans (future feature)
5. **Performance**: Add indexes for frequently queried fields (already noted in schemas)
6. **Validation**: Implement validation middleware in Mongoose schemas
7. **Error Handling**: Handle duplicate key errors gracefully (e.g., when adding existing resource URL)

---

## API Endpoints Summary

See `API_ENDPOINTS.md` for detailed endpoint specifications.

Quick reference:
- **Study Plans**: CRUD + share
- **Resources**: Create/get (with YouTube API integration)
- **Instances**: CRUD + modify resources
- **User Progress**: Toggle complete/incomplete
- **Auth**: Firebase token verification middleware
