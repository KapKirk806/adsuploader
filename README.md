# AdsUploader

A professional bulk ad upload automation platform for Meta (Facebook/Instagram) Ads. Upload 100+ ad creatives in minutes instead of hours.

## 🚀 Overview

AdsUploader is a full-stack web application that automates the tedious process of creating Meta ad campaigns. Instead of manually uploading ads one-by-one through Meta Ads Manager, users can:

- Upload 100+ images/videos at once
- Automatically detect variations (image_v1, image_v2, etc.)
- Create campaigns, ad sets, and ads via Meta Marketing API
- Import files directly from Google Drive
- Collaborate with team members
- Track job progress in real-time

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## ✨ Features

### Core Features

#### 🎯 Bulk Ad Upload
- Upload up to 100 files at once (images: JPG, PNG, GIF / videos: MP4, MOV)
- Drag-and-drop interface with Ant Design Upload component
- Automatic file processing with metadata extraction (dimensions, aspect ratios, duration)
- Real-time progress tracking with job queue system

#### 🔄 Variation Detection
- Intelligent pattern matching for file variations
- Supports multiple naming conventions:
  - Sequential numbers: `image_v1`, `image_v2`, `image_001`, `image_002`
  - Letters: `image_a`, `image_variant_a`
  - Parentheses: `image(1)`, `image(2)`
- Groups related files automatically for A/B testing

#### 📝 Campaign Templates
- Save campaign configurations as reusable templates
- Set default templates for quick uploads
- Template includes: objective, campaign settings, ad set config, ad config
- CRUD operations with modal-based UI

#### 📊 Job Management
- Real-time job progress tracking with BullMQ + Redis
- Job statuses: pending → processing → completed/failed/cancelled
- Detailed progress: total ads, completed ads, failed ads, percentage
- Search, filter, sort jobs
- Bulk operations (cancel multiple jobs)
- Export to CSV

### Advanced Features

#### 🔐 Authentication & Authorization
- Email/password authentication with bcrypt hashing
- Facebook OAuth integration for seamless Meta account connection
- JWT-based session management
- Protected routes with React Router
- Password reset flow with email tokens

#### 👥 Team Collaboration
- Invite team members by email
- Role-based access control (owner/admin/member)
- Team member management (view, edit roles, remove)
- Activity audit logs

#### 📱 Meta API Integration
- Direct integration with Meta Marketing API
- Sync ad accounts from Meta
- Create campaigns, ad sets, and ads programmatically
- Upload images and videos to Meta
- Real API with mock fallback for development

#### ☁️ Google Drive Integration
- OAuth 2.0 authentication with Google
- Browse and select files from Google Drive
- Filter by media types (images/videos)
- Multi-file selection
- Direct import to upload flow

#### 📈 Activity Logs
- Complete audit trail of all user actions
- Track: create, update, delete, login, logout, upload, publish
- Search and filter logs by action, user, date range
- IP address and user agent tracking
- Pagination and sorting

#### ⚙️ User Profile & Settings
- Edit profile (name, email, avatar)
- Change password with validation
- Upload profile picture
- Notification preferences (email notifications, job completion, errors)
- Timezone and currency settings
- Account deletion (danger zone)

### UX Enhancements

#### 🔍 Search & Filter
- Search jobs by ID, campaign ID, status
- Filter activity logs by action type, date range
- Filter ad accounts, templates, team members
- Real-time search results

#### 📊 Sorting & Pagination
- Sort all tables by any column
- Default sorting (newest first for jobs)
- Page size selector (10/20/50/100 items)
- Show total count
- Responsive pagination

#### ✅ Bulk Operations
- Select multiple jobs with checkboxes
- Bulk cancel pending/processing jobs
- Selection counter and clear button
- Disabled states for completed/failed items

#### 📥 Export Functionality
- Export jobs to CSV
- Auto-generated filename with timestamp
- All job data included (ID, status, progress, dates)

#### 💡 Tooltips & Help
- Helpful tooltips on action buttons
- Inline help text for complex features
- Empty states with helpful messages
- Loading skeletons (Ant Design built-in)

#### 🛡️ Error Handling
- React Error Boundary catches all component errors
- Friendly error messages for users
- Development-only error details
- Reload and retry buttons
- Form validation with helpful messages

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache/Queue**: Redis 7+
- **Job Queue**: BullMQ
- **Authentication**: JWT + bcrypt
- **File Processing**: Sharp (images), FFmpeg (videos)
- **External APIs**:
  - Meta Marketing API
  - Google Drive API (googleapis)

**Key Backend Libraries**:
- `express` - Web framework
- `pg` - PostgreSQL client
- `ioredis` - Redis client
- `bullmq` - Job queue
- `jsonwebtoken` - JWT tokens
- `bcrypt` - Password hashing
- `multer` - File uploads
- `winston` - Logging
- `helmet` - Security headers
- `cors` - CORS handling

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **Routing**: React Router 6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Handling**: dayjs
- **Styling**: CSS + Ant Design themes

**Key Frontend Libraries**:
- `react` + `react-dom` - Core React
- `antd` + `@ant-design/icons` - UI components
- `react-router-dom` - Routing
- `zustand` - State management
- `axios` - API calls
- `recharts` - Charts for analytics
- `react-dropzone` - File drag-and-drop

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **Testing**: Jest (configured, not fully implemented)
- **Database Migrations**: SQL files

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   Services  │         │
│  │             │  │             │  │             │         │
│  │ - Dashboard │  │ - Layout    │  │ - API       │         │
│  │ - Upload    │  │ - Protected │  │ - Auth      │         │
│  │ - Jobs      │  │   Route     │  │             │         │
│  │ - Templates │  │ - Error     │  │             │         │
│  │ - Team      │  │   Boundary  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Node.js/Express)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │ Controllers │  │  Services   │         │
│  │             │  │             │  │             │         │
│  │ - Auth      │  │ - Auth      │  │ - Meta API  │         │
│  │ - Jobs      │  │ - Jobs      │  │ - Google    │         │
│  │ - Uploads   │  │ - Uploads   │  │   Drive     │         │
│  │ - Templates │  │ - Templates │  │ - Job Queue │         │
│  │ - Team      │  │ - Team      │  │ - File      │         │
│  └─────────────┘  └─────────────┘  │   Processor │         │
│                                     └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │  Meta API    │
│              │    │              │    │              │
│ - Users      │    │ - Job Queue  │    │ - Campaigns  │
│ - Jobs       │    │ - Sessions   │    │ - Ad Sets    │
│ - Templates  │    │ - Cache      │    │ - Ads        │
│ - Team       │    │              │    │ - Images     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Data Flow

#### 1. User Upload Flow

```
User selects files → Frontend validates → Upload to backend
                                              ↓
                                    Create job in database
                                              ↓
                                    Add job to BullMQ queue
                                              ↓
                                    Worker processes job:
                                    1. Extract file metadata
                                    2. Detect variations
                                    3. Upload to Meta API
                                    4. Create ads
                                    5. Update progress
                                              ↓
                                    Job completed/failed
                                              ↓
                                    Frontend polls for updates
```

#### 2. Authentication Flow

```
User enters credentials → Backend validates
                              ↓
                    Check bcrypt hash (email/password)
                    OR validate OAuth token (Facebook)
                              ↓
                    Generate JWT token
                              ↓
                    Return token to frontend
                              ↓
                    Store in localStorage
                              ↓
                    Include in all subsequent requests
```

### Database Schema

**Key Tables**:

1. **users** - User accounts
   - id, email, password_hash, name, avatar_url, role, facebook_id

2. **ad_accounts** - Synced Meta ad accounts
   - id, user_id, facebook_ad_account_id, name, currency, timezone

3. **campaign_templates** - Reusable campaign configs
   - id, user_id, name, objective, campaign_config, adset_config, ad_config

4. **upload_jobs** - Bulk upload jobs
   - id, user_id, status, total_ads, completed_ads, progress_percentage

5. **creatives** - Individual ad creatives
   - id, job_id, filename, type, aspect_ratio, variation_group

6. **team_members** - Team collaboration
   - id, user_id, role, invited_by, status

7. **activity_logs** - Audit trail
   - id, user_id, action, resource_type, description, ip_address

8. **google_drive_connections** - OAuth tokens
   - id, user_id, access_token, refresh_token, expires_at

### API Design

**RESTful API Endpoints**:

```
Authentication:
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/password
GET    /api/auth/facebook          - Get Facebook OAuth URL
GET    /api/auth/facebook/callback - Handle OAuth callback
GET    /api/auth/me                - Get current user
POST   /api/auth/change-password   - Change password
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
PUT    /api/auth/profile           - Update profile
POST   /api/auth/avatar            - Upload avatar
DELETE /api/auth/account           - Delete account

Ad Accounts:
GET    /api/ad-accounts            - List user's ad accounts
POST   /api/ad-accounts/sync       - Sync from Meta API
GET    /api/ad-accounts/:id        - Get single account
DELETE /api/ad-accounts/:id        - Remove account

Templates:
GET    /api/templates              - List templates
POST   /api/templates              - Create template
GET    /api/templates/:id          - Get template
PUT    /api/templates/:id          - Update template
DELETE /api/templates/:id          - Delete template
POST   /api/templates/:id/set-default - Set default

Uploads:
POST   /api/uploads/files          - Upload files
GET    /api/uploads/:id/files      - Get job files
POST   /api/uploads/:id/publish    - Publish to Meta

Jobs:
GET    /api/jobs                   - List jobs (with filters)
GET    /api/jobs/:id               - Get job details
GET    /api/jobs/:id/progress      - Get real-time progress
DELETE /api/jobs/:id               - Cancel job
GET    /api/jobs/stats             - Get job statistics

Team:
GET    /api/team                   - List team members
POST   /api/team/invite            - Invite member
PUT    /api/team/:id               - Update member role
DELETE /api/team/:id               - Remove member

Activity Logs:
GET    /api/activity-logs          - Get audit logs (with filters)

Google Drive:
GET    /api/google-drive/connect   - Get OAuth URL
GET    /api/google-drive/callback  - Handle OAuth callback
GET    /api/google-drive/files     - List files
GET    /api/google-drive/status    - Check connection status

Settings:
GET    /api/settings               - Get user settings
PUT    /api/settings               - Update settings
```

### Job Queue Architecture

**BullMQ Worker Process**:

```typescript
// Job processing flow
1. Job received from queue
2. Update status to "processing"
3. For each creative:
   a. Read file from uploads directory
   b. Extract metadata (Sharp for images, FFmpeg for videos)
   c. Upload to Meta API (create image/video object)
   d. Create ad creative in Meta
   e. Create ad in ad set
   f. Update progress
   g. Handle errors (retry or mark as failed)
4. Update status to "completed" or "failed"
5. Log completion time
```

**Why BullMQ?**
- Redis-backed queue for reliability
- Job retries with exponential backoff
- Progress tracking
- Concurrent processing (multiple workers)
- Scheduled jobs support

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Quick Start Guide](./docs/quick-start.md) - Get up and running in 5 minutes
- [Architecture Deep Dive](./docs/architecture.md) - Detailed system design
- [API Reference](./docs/api-reference.md) - Complete API documentation
- [Features Guide](./docs/features.md) - How to use each feature
- [Development Guide](./docs/development.md) - For developers
- [Deployment Guide](./docs/deployment.md) - Production deployment
- [Design Decisions](./docs/design-decisions.md) - Why we built it this way

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 7+
- Meta (Facebook) Developer App credentials
- Google Cloud Console project (for Google Drive)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd adsuploader
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**
```bash
# Backend .env
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

4. **Set up database**
```bash
# Create database
createdb adsuploader

# Run migrations
psql -d adsuploader -f backend/migrations/001_initial_schema.sql
```

5. **Start Redis**
```bash
redis-server
```

6. **Start backend**
```bash
cd backend
npm run dev
```

7. **Start frontend**
```bash
cd frontend
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

See [Quick Start Guide](./docs/quick-start.md) for detailed setup instructions.

## 📁 Project Structure

```
adsuploader/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, Redis, Logger)
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (Meta API, Google Drive, Queue)
│   │   ├── utils/           # Helpers (variation detection, file processing)
│   │   ├── types/           # TypeScript type definitions
│   │   └── server.ts        # Express app entry point
│   ├── migrations/          # SQL database migrations
│   ├── uploads/             # Temporary file storage
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (Dashboard, Upload, etc.)
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Main app component with routing
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                    # Documentation
├── README.md
└── .gitignore
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Write/update tests as needed
4. Update documentation
5. Submit a pull request

### Code Style

- TypeScript for all code
- ESLint for linting
- Prettier for formatting (recommended)
- Follow existing patterns and naming conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **Ant Design** - Beautiful React UI components
- **Meta Marketing API** - Ad creation and management
- **BullMQ** - Reliable job queue system
- **Sharp & FFmpeg** - Image and video processing

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check the [documentation](./docs/)
- Contact the development team

---

Built with ❤️ for marketers and advertisers who deserve better tools.
