# Quick Start Guide

Get up and running with AdsUploader in 5 minutes.

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- PostgreSQL 14+ running
- Redis 6+ running
- A Meta Business account with API access
- (Optional) Google Drive API credentials for Drive integration

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd adsuploader
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create database
createdb adsuploader

# Run migrations
cd backend
npm run migrate:up
```

The migrations will create all necessary tables:
- `users` - User accounts and authentication
- `ad_accounts` - Connected Meta ad accounts
- `campaign_templates` - Reusable campaign configurations
- `upload_jobs` - Bulk upload job tracking
- `creatives` - Ad creative files and metadata
- `team_members` - Team collaboration
- `activity_logs` - Audit trail
- `google_drive_connections` - Google Drive OAuth tokens

### 4. Environment Configuration

Create `.env` files in both backend and frontend directories:

**backend/.env**
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=adsuploader

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=7d

# Meta API
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_API_VERSION=v18.0

# Google Drive API (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google-drive/callback

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
```

### 5. Start the Application

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## First Steps

### 1. Create an Account

Navigate to http://localhost:5173 and click "Sign Up" to create your account.

### 2. Connect Your Meta Ad Account

1. Go to Settings > Ad Accounts
2. Click "Connect Meta Ad Account"
3. Authenticate with Facebook
4. Select the ad account you want to use

### 3. (Optional) Connect Google Drive

1. Go to Settings > Integrations
2. Click "Connect Google Drive"
3. Authorize the application
4. Your Drive files will now appear in the file browser

### 4. Create Your First Upload

1. Go to "New Upload"
2. Select your ad account
3. Choose files (drag & drop or browse)
4. Configure campaign settings
5. Click "Start Upload"

The system will:
- Process and validate your files
- Extract metadata (dimensions, duration, file size)
- Detect variations automatically (e.g., `ad_v1.jpg`, `ad_v2.jpg`)
- Upload to Meta Ads in the background
- Track progress in real-time

## Quick Reference

### Common Tasks

**View Upload History**
```
Dashboard > Uploads
```

**Create Campaign Template**
```
Templates > New Template
```

**Monitor System Health**
```
GET http://localhost:3001/api/monitoring/health
```

**View Logs**
```
backend/logs/combined.log
backend/logs/error.log
```

### Default File Support

**Images:**
- JPG, PNG, GIF, WEBP
- Recommended: 1200x628px or 1080x1080px
- Max size: 30MB

**Videos:**
- MP4, MOV, AVI, MKV
- Recommended: 1080x1920px (9:16) or 1920x1080px (16:9)
- Max size: 4GB
- Max duration: 240 minutes

### Variation Detection Patterns

The system automatically groups related files:

```
image_v1.jpg      →  Variation group 1
image_v2.jpg      →  Variation group 1
image_v3.jpg      →  Variation group 1

banner_001.jpg    →  Variation group 2
banner_002.jpg    →  Variation group 2

creative_a.jpg    →  Variation group 3
creative_b.jpg    →  Variation group 3
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials
psql -U postgres -d adsuploader
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### File Upload Issues

Check the upload directory permissions:
```bash
cd backend
mkdir -p uploads
chmod 755 uploads
```

### Meta API Authentication Issues

1. Verify your Meta App is in Development/Live mode
2. Check that your callback URL is whitelisted in Meta App settings
3. Ensure your access token has the required permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`

### Port Already in Use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

## Next Steps

- Read the [Features Guide](./features.md) for detailed feature documentation
- Check the [API Reference](./api-reference.md) for API endpoints
- Review [Design Decisions](./design-decisions.md) to understand the architecture
- See [Development Guide](./development.md) for contribution guidelines
- Read [Deployment Guide](./deployment.md) for production setup

## Getting Help

- Check the [README](../README.md) for architecture overview
- Review [Features Documentation](./features.md)
- Search existing issues on GitHub
- Create a new issue with detailed information

## Production Checklist

Before deploying to production:

- [ ] Change all default secrets (JWT_SECRET, database passwords)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure database backups
- [ ] Set up log aggregation (ELK, Datadog, etc.)
- [ ] Configure rate limiting for public endpoints
- [ ] Review and adjust file size limits
- [ ] Set up monitoring alerts
- [ ] Test all authentication flows
- [ ] Verify Meta API webhook signatures
- [ ] Configure proper error reporting
- [ ] Set up CDN for static assets (optional)
- [ ] Load test the application

See the [Deployment Guide](./deployment.md) for detailed production setup instructions.
