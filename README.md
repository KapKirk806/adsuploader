# AdsUploader - Meta Ads Bulk Upload Automation

A complete clone of AdsUploader.com and Rapid-Ads.com - automate bulk creative testing for Meta (Facebook/Instagram) Ads.

## 🚀 Features

### Core Features
- **Bulk Upload**: Upload 100+ ad creatives in minutes
- **Automatic Variation Detection**: Smart grouping of creative variations (image_v1, image_v2, etc.)
- **Campaign Templates**: Save and reuse campaign configurations
- **Job Queue Processing**: Async processing with BullMQ and Redis
- **Progress Tracking**: Real-time job progress and status updates
- **Meta API Integration**: Direct publishing to Meta Ads (with mock mode for development)
- **File Processing**: Automatic aspect ratio detection, thumbnail generation, metadata extraction

### Advanced Features
- **Multi-Format Support**: Images (JPG, PNG, GIF, WebP) and Videos (MP4, MOV, AVI)
- **Aspect Ratio Auto-Detection**: Automatically detects 1:1, 1.91:1, 4:5, 9:16, 16:9 formats
- **Template System**: Reusable campaign configurations with default templates
- **Error Handling**: Comprehensive error logging and retry mechanisms
- **Rate Limiting**: API rate limiting for security
- **File Validation**: Type and size validation before upload

## 📊 Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **File Processing**: Sharp (images), FFmpeg (videos)
- **Authentication**: Passport.js + JWT
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 🏗️ Project Structure

```
adsuploader/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis, Logger configs
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (Meta API, Job Queue)
│   │   ├── utils/           # Utilities (file processor, variation detector)
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Main server file
│   ├── migrations/          # Database migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app component
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- FFmpeg (for video processing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd adsuploader
```

2. **Set up the database**
```bash
createdb adsuploader
psql -d adsuploader -f backend/migrations/001_initial_schema.sql
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

4. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

5. **Start Redis**
```bash
redis-server
```

### Running the Application

**Development Mode:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Documentation: `http://localhost:5000/api`

**Production Mode:**

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview
```

## 📝 API Endpoints

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/set-default` - Set as default

### Uploads
- `POST /api/uploads/files` - Upload files
- `GET /api/uploads/:jobId/files` - Get job files
- `POST /api/uploads/:jobId/publish` - Publish to Meta

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/:id/progress` - Get job progress
- `DELETE /api/jobs/:id` - Cancel job
- `GET /api/jobs/stats` - Get statistics

## 🎯 How It Works

1. **Upload**: Users upload images/videos via drag-and-drop
2. **Detection**: System automatically detects variation groups (e.g., product_v1, product_v2)
3. **Processing**: Files are processed to extract metadata (dimensions, aspect ratios, duration)
4. **Configuration**: Users select a campaign template with pre-configured settings
5. **Publishing**: Job is queued and processed asynchronously via BullMQ
6. **Meta API**: Each creative is uploaded to Meta and ads are created via the Marketing API
7. **Tracking**: Real-time progress updates show completion status

## 🔑 Key Differences from Competitors

### vs AdsUploader.com
- ✅ Open source
- ✅ Self-hosted option
- ✅ No monthly fees
- ✅ Full customization

### vs Rapid-Ads.com
- ✅ Complete source code access
- ✅ Advanced variation detection
- ✅ Built-in testing with mocks
- ✅ Modern tech stack

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:integration

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/adsuploader

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Facebook OAuth (optional for development)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# Meta API
META_API_VERSION=v18.0
```

## 📈 Performance

- **Upload Speed**: 100 files in ~5-10 minutes
- **API Publishing**: Direct to Meta Marketing API
- **Concurrent Processing**: 5 jobs simultaneously
- **Queue Management**: Automatic retry with exponential backoff
- **Error Recovery**: Individual creative failures don't stop entire job

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Backend API with all core features
- [x] Frontend UI with dashboard, upload, templates, jobs
- [x] Meta API integration with mock mode
- [x] Job queue processing
- [x] Variation detection

### Phase 2 (Future)
- [ ] Facebook OAuth authentication
- [ ] Google Drive integration
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] A/B testing tools
- [ ] Automated optimization rules

### Phase 3 (Advanced)
- [ ] Multi-platform support (TikTok, Google Ads)
- [ ] AI-powered copy generation
- [ ] Predictive performance scoring
- [ ] White-label options
- [ ] API for external integrations

## 🐛 Known Limitations

1. **Authentication**: Facebook OAuth not yet implemented (mock auth for development)
2. **Google Drive**: Integration not yet implemented
3. **Team Features**: Multi-user collaboration pending
4. **Meta API**: Requires real Facebook App credentials for production use

## 📜 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 💬 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/adsuploader/issues)
- Documentation: See `/backend/README.md` and `/frontend/README.md`

## 🎉 Acknowledgments

Built as a clone of AdsUploader.com and Rapid-Ads.com, demonstrating modern full-stack development practices.
