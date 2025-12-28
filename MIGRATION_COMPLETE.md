# Server Migration to Next.js - Complete! ✅

## What Was Done

Successfully migrated the Express.js backend server to Next.js API routes. The backend is now fully integrated into the Next.js application.

## Migration Summary

### ✅ Completed

1. **Database Setup**

   - Created MongoDB connection handler with caching (`src/lib/mongodb.js`)
   - Migrated all Mongoose models to ES6 modules:
     - User
     - StudyPlan
     - Instance
     - Resource
     - UserProgress

2. **Authentication & Middleware**

   - Firebase Admin SDK configuration (`src/lib/firebase-admin.js`)
   - Authentication middleware for API routes (`src/lib/auth.js`)
   - Helper functions for auth and responses

3. **Services**

   - YouTube API service (`src/lib/youtube.js`)
   - Video and playlist metadata fetching

4. **API Routes Migrated**

   - ✅ `/api/study-plans` - CRUD operations, sharing, collaboration
   - ✅ `/api/instances` - User study plan instances with progress tracking
   - ✅ `/api/resources` - Resource management with YouTube integration
   - ✅ `/api/user-progress` - Global resource completion tracking
   - ✅ `/api/users/me` - User profile management
   - ✅ `/api/users/me/notifications` - Notification preferences

5. **Dependencies**
   - Added `firebase-admin`, `googleapis`, and `mongoose` to package.json

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
cd study-sync
npm install
\`\`\`

### 2. Configure Environment Variables

Copy the example file:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Update `.env.local` with your credentials:

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studysync
FIREBASE_SERVICE_ACCOUNT_KEY=<base64_encoded_service_account>
YOUTUBE_API_KEY=your_youtube_api_key
\`\`\`

**To encode your Firebase service account:**
\`\`\`bash

# On Linux/Mac

base64 -w 0 serviceAccountKey.json

# On Windows (PowerShell)

[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("serviceAccountKey.json"))
\`\`\`

### 3. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Your Next.js app with integrated backend will run on `http://localhost:3000`

## API Endpoints

All endpoints are now available at:

- Base URL: `http://localhost:3000/api`

### Study Plans

- `GET /api/study-plans` - Get public/user plans
- `POST /api/study-plans` - Create plan
- `GET /api/study-plans/:id` - Get single plan
- `PUT /api/study-plans/:id` - Update plan
- `DELETE /api/study-plans/:id` - Delete plan
- `POST /api/study-plans/:id/share` - Share with user
- `DELETE /api/study-plans/:id/share/:userId` - Remove collaborator

### Instances

- `GET /api/instances` - Get user instances
- `POST /api/instances` - Create instance
- `GET /api/instances/:id` - Get instance with progress
- `PUT /api/instances/:id` - Update instance
- `DELETE /api/instances/:id` - Delete instance

### Resources

- `POST /api/resources` - Create/get resource
- `GET /api/resources?ids=id1,id2` - Get multiple resources
- `GET /api/resources/:id` - Get single resource

### User Progress

- `GET /api/user-progress` - Get user's progress
- `POST /api/user-progress` - Update completion status

### User Profile

- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/me/notifications` - Get notification settings
- `PUT /api/users/me/notifications` - Update notification settings

## What's NOT Migrated (Intentionally)

### Cron Job Scheduler

The email reminder scheduler (`reminderScheduler.js`) is **NOT migrated** because:

- Next.js API routes are stateless (no persistent background jobs)
- Cron jobs need continuous running process

### Options for Scheduler:

**Option 1: Vercel Cron Jobs** (Recommended if deploying to Vercel)
Create `vercel.json`:
\`\`\`json
{
"crons": [{
"path": "/api/cron/reminders",
"schedule": "0 * * * *"
}]
}
\`\`\`

**Option 2: Keep Minimal Express Server** (Easy)
Keep `study-sync-server` running ONLY for cron jobs:

1. Remove all routes except cron scheduler
2. Run on separate port (5000)
3. Only handles automated emails

**Option 3: External Scheduler** (Production)
Use services like:

- AWS Lambda with EventBridge
- Render Cron Jobs
- Cloudflare Workers with Cron Triggers

## Testing the Migration

### 1. Test MongoDB Connection

\`\`\`bash
curl http://localhost:3000/api/study-plans
\`\`\`

### 2. Test Authenticated Endpoint

Get your Firebase token from browser dev tools, then:
\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/me
\`\`\`

### 3. Update Frontend API URL

The frontend is already configured to use relative URLs (`/api/...`), so no changes needed!

## Benefits of This Migration

✅ **Single Deployment** - One app instead of two  
✅ **No CORS Issues** - Frontend and backend on same origin  
✅ **Simplified Architecture** - Easier to maintain  
✅ **Better Integration** - Shared code between frontend/backend  
✅ **Faster Development** - Hot reload for both frontend and backend  
✅ **Edge Deployment Ready** - Can deploy to Vercel/Netlify

## Deployment

### Vercel (Recommended)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Add environment variables in Vercel dashboard.

### Other Platforms

The app can be deployed to any platform supporting Next.js:

- Netlify
- AWS Amplify
- Google Cloud Run
- Railway

## Troubleshooting

### MongoDB Connection Issues

- Ensure IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)
- Check MONGODB_URI format
- Verify network/DNS settings

### Firebase Auth Issues

- Verify service account key is correctly base64 encoded
- Check Firebase project settings
- Ensure Firebase Admin SDK is initialized

### YouTube API Issues

- Verify API key is valid
- Check quota limits in Google Cloud Console
- Ensure YouTube Data API v3 is enabled

## Next Steps

1. ✅ Backend migrated to Next.js API routes
2. ⏭️ Choose scheduler solution for email reminders
3. ⏭️ Update frontend API calls (if using absolute URLs)
4. ⏭️ Deploy to production
5. ⏭️ Remove old `study-sync-server` (or keep minimal version for cron)

## Need Help?

- Check Next.js API routes docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- MongoDB connection issues: Check `.env.local` and Atlas settings
- Firebase auth: Verify service account permissions
