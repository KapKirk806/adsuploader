# AdsUploader Frontend

React + TypeScript + Vite frontend for AdsUploader.

## Features

- 📊 Dashboard with job statistics
- 📤 Bulk file upload with drag-and-drop
- 📋 Campaign template management
- 📈 Job progress tracking
- 🎨 Modern UI with Ant Design
- ⚡ Fast build with Vite

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **File Upload**: React Dropzone

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Layout.tsx   # Main app layout
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   ├── Templates.tsx
│   └── Jobs.tsx
├── services/        # API services
│   └── api.ts
├── store/           # State management
│   └── useStore.ts
├── types/           # TypeScript types
│   └── index.ts
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Features

### Dashboard
- View overall statistics (total jobs, completed, processing)
- See recent upload jobs
- Quick navigation to job details

### Upload
- Drag-and-drop file upload
- Support for images and videos
- Automatic variation detection
- Template selection
- Real-time upload progress

### Templates
- Create and manage campaign templates
- Set default template
- Configure campaign objectives
- Reusable campaign configurations

### Jobs
- List all upload jobs
- Filter by status (pending, processing, completed, failed)
- View job progress in real-time
- Cancel pending/processing jobs
- View detailed job information

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api`.

All API calls are handled through the `api.ts` service with automatic:
- Authentication token injection
- Error handling
- Request/response interceptors

## License

MIT
