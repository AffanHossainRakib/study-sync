# 📚 StudySync - Collaborative Study Plan Manager

> A modern web application for creating, sharing, and tracking study plans with built-in progress monitoring and resource management.

## 🌟 Features

### 📋 Study Plan Management
- **Create Study Plans** - Build structured study plans with curated resources
- **Public/Private Plans** - Share publicly or keep private
- **Collaborative Editing** - Share plans with collaborators for joint editing
- **Course Organization** - Organize plans by course codes (CSE110, EEE220, etc.)

### 🎯 Resource Integration
- **YouTube Videos** - Auto-fetch video metadata (title, duration, thumbnail)
- **YouTube Playlists** - Bulk import entire playlists
- **PDF Documents** - Add PDFs with page count and reading time estimates
- **Articles** - Track online articles with custom time estimates
- **Smart De-duplication** - Resources are globally shared to prevent duplicates

### 📊 Progress Tracking
- **Instance-based System** - Start personal instances of any study plan
- **Global Progress** - Mark resources complete across all instances
- **Time-based Tracking** - Monitor progress by both resources and estimated time
- **Custom Deadlines** - Set personal deadlines for study plan completion

### 🤝 Collaboration
- **Share via Email** - Invite collaborators to edit your study plans
- **Public Discovery** - Browse and clone public community plans
- **Permission Management** - Control who can view and edit your plans

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- MongoDB database (MongoDB Atlas recommended)
- Firebase project (for authentication)
- YouTube Data API v3 key (optional, for YouTube integration)

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/AffanHossainRakib/study-sync.git
cd study-sync
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd ../study-sync-server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create `.env` file:
```env
PORT=3001
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
YOUTUBE_API_KEY=your_youtube_api_key
```

4. **Add Firebase Admin credentials**
Place `serviceAccountKey.json` in the root directory or set `FIREBASE_SERVICE_ACCOUNT` env variable

5. **Start the server**
```bash
npm run dev
```

Server runs on [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
study-sync/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── plans/             # Study plan pages
│   │   ├── my-plans/          # User's study plans
│   │   ├── instances/         # Active study instances
│   │   └── create-plan/       # Create new plan
│   ├── components/            # React components
│   │   ├── Auth/             # Login/signup forms
│   │   ├── Home/             # Landing page sections
│   │   ├── layouts/          # Layout components
│   │   └── ui/               # UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and API client
│   └── providers/            # Context providers
├── public/                   # Static assets
└── DOCS/                     # Documentation
    └── DATABASE_SCHEMA.md    # Database schema

study-sync-server/
├── src/
│   ├── config/              # Database and Firebase config
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   └── services/            # External services (YouTube)
├── DOCS/                    # API documentation
│   ├── API_DOCUMENTATION.md
│   └── BACKEND_SUMMARY.md
└── index.js                 # Server entry point
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide Icons
- **Drag & Drop**: @dnd-kit
- **Authentication**: Firebase Auth
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Firebase Admin SDK
- **External APIs**: YouTube Data API v3

## 📖 Key Concepts

### Study Plans vs Instances
- **Study Plan** - A template/class containing curated resources
- **Instance** - A personal copy of a study plan with progress tracking
- Users can create multiple instances from the same study plan
- Instances can be customized independently of the original plan

### Global Resource Pool
- Resources (videos, PDFs, articles) are stored once and referenced by ID
- Prevents duplication when the same resource is used in multiple plans
- URL-based de-duplication ensures consistency

### Global Progress Tracking
- Marking a resource complete applies across ALL instances
- Allows users to see previously completed content
- Progress is user-specific and persistent

## 🎨 Features in Detail

### Study Plan Creation
1. Enter basic info (title, description, course code)
2. Add resources (YouTube videos/playlists, PDFs, articles)
3. Auto-fetch metadata for YouTube videos
4. Reorder resources via drag-and-drop
5. Toggle public/private visibility
6. Share with collaborators via email

### Instance Management
1. Browse public plans or your own plans
2. Click "Start This Plan" to create an instance
3. Add personal notes and deadlines
4. Track progress with visual indicators
5. Mark resources complete as you study
6. View time-based and resource-based progress

### Progress Tracking
- **Resource Progress**: X/Y resources completed
- **Time Progress**: X/Y minutes completed
- **Visual Progress Bars**: See completion at a glance
- **Remaining Time**: Know how much study time is left

## 🔒 Authentication Flow

1. User signs up/logs in via Firebase (email/password or Google)
2. Frontend receives Firebase ID token
3. Token included in `Authorization: Bearer <token>` header
4. Backend verifies token with Firebase Admin SDK
5. User auto-created in MongoDB on first login
6. Subsequent requests use the same token

## 📡 API Overview

### Study Plans
- `GET /api/study-plans` - List plans (public or user's)
- `GET /api/study-plans/:id` - Get single plan
- `POST /api/study-plans` - Create plan
- `PUT /api/study-plans/:id` - Update plan
- `DELETE /api/study-plans/:id` - Delete plan
- `POST /api/study-plans/:id/share` - Share with collaborator

### Instances
- `GET /api/instances` - List user's instances
- `GET /api/instances/:id` - Get instance with progress
- `POST /api/instances` - Create new instance
- `PUT /api/instances/:id` - Update instance
- `DELETE /api/instances/:id` - Delete instance

### Resources & Progress
- `POST /api/resources` - Create/get resource
- `POST /api/user-progress` - Toggle resource completion
- `GET /api/user-progress/check` - Check completion status

See [API Documentation](study-sync-server/DOCS/API_DOCUMENTATION.md) for complete details.

## 🗄️ Database Schema

The application uses 5 MongoDB collections:

1. **users** - Firebase user sync
2. **resources** - Global resource pool
3. **studyPlans** - Study plan templates
4. **instances** - User's active plans
5. **userProgress** - Global completion tracking

See [Database Schema](DOCS/DATABASE_SCHEMA.md) for detailed schema documentation.

## 🚧 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Study groups and social features
- [ ] Spaced repetition reminders
- [ ] Export to PDF/Calendar
- [ ] Chrome extension for quick resource addition
- [ ] AI-powered study plan recommendations

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Affan Hossain Rakib**
- GitHub: [@AffanHossainRakib](https://github.com/AffanHossainRakib)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)
- Hosted on [Vercel](https://vercel.com)

---

Made with ❤️ for students who want to study smarter, not harder.
