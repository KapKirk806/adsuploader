# AdsUploader Backend API

Backend API for AdsUploader - A Meta Ads bulk upload automation platform.

## Features

- 🔐 Facebook OAuth authentication
- 📁 Bulk file upload with automatic variation detection
- 🎯 Campaign template management
- 🚀 Async job processing with BullMQ
- 📊 Real-time progress tracking
- 🔄 Google Drive integration
- 👥 Team collaboration features
- 📈 Analytics and reporting

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **File Processing**: Sharp (images) + FFmpeg (videos)
- **Authentication**: Passport.js + JWT
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- FFmpeg (for video processing)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create database:
```bash
createdb adsuploader
```

4. Run migrations:
```bash
psql -d adsuploader -f migrations/001_initial_schema.sql
```

5. Start Redis:
```bash
redis-server
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run integration tests:
```bash
npm run test:integration
```

Run tests with coverage:
```bash
npm run test -- --coverage
```

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback
- `POST /api/auth/refresh` - Refresh access token

### Ad Accounts
- `GET /api/ad-accounts` - List user's ad accounts
- `POST /api/ad-accounts` - Connect new ad account
- `GET /api/ad-accounts/:id` - Get ad account details
- `PUT /api/ad-accounts/:id` - Update ad account
- `DELETE /api/ad-accounts/:id` - Remove ad account

### Templates
- `GET /api/templates` - List campaign templates
- `POST /api/templates` - Create new template
- `GET /api/templates/:id` - Get template details
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Uploads
- `POST /api/uploads/files` - Upload files
- `POST /api/uploads/google-drive` - Import from Google Drive
- `GET /api/uploads/:jobId/files` - Get uploaded files for job

### Jobs
- `POST /api/jobs` - Create new upload job
- `GET /api/jobs` - List user's jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/:id/progress` - Get job progress
- `POST /api/jobs/:id/publish` - Publish ads to Meta
- `DELETE /api/jobs/:id` - Cancel job

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── __tests__/       # Test files
│   └── server.ts        # Main server file
├── migrations/          # Database migrations
├── uploads/             # Temporary file storage
└── logs/                # Application logs
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - Secret for JWT tokens
- `FACEBOOK_APP_ID` - Facebook OAuth app ID
- `FACEBOOK_APP_SECRET` - Facebook OAuth app secret

## License

MIT
