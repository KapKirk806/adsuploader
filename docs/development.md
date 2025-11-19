# Development Guide

Complete guide for developing and contributing to AdsUploader.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Database Migrations](#database-migrations)
- [Adding New Features](#adding-new-features)
- [Performance Optimization](#performance-optimization)
- [Security Guidelines](#security-guidelines)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

Ensure you have the required tools installed:

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
psql --version  # Should be 14+
redis-cli --version  # Should be 6+
git --version
```

### Initial Setup

1. **Clone and install:**
```bash
git clone <repository-url>
cd adsuploader
npm install  # Install root dependencies if any
cd backend && npm install
cd ../frontend && npm install
```

2. **Database setup:**
```bash
# Create database
createdb adsuploader_dev

# Run migrations
cd backend
npm run migrate:up
```

3. **Configure environment:**
```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your credentials
```

4. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (if not running as service)
redis-server
```

### IDE Setup

**VSCode (Recommended):**

Install recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- PostgreSQL (for database queries)
- GitLens

**.vscode/settings.json:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Project Structure

```
adsuploader/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (database, redis, logger)
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models (if using ORM)
│   │   ├── middleware/      # Express middleware (auth, logging, validation)
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions, helpers
│   │   ├── types/           # TypeScript type definitions
│   │   ├── jobs/            # BullMQ job processors
│   │   └── server.ts        # Express app entry point
│   ├── migrations/          # Database migrations
│   ├── uploads/             # Uploaded files (gitignored)
│   ├── logs/                # Log files (gitignored)
│   └── tests/               # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls, utilities
│   │   ├── stores/          # Zustand state management
│   │   ├── types/           # TypeScript types
│   │   ├── assets/          # Static assets (images, fonts)
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Public static files
│   └── tests/               # Frontend tests
└── docs/                    # Documentation
```

## Coding Standards

### TypeScript

**Always use strict typing:**
```typescript
// ❌ Bad
function processJob(job: any) {
  return job.data;
}

// ✅ Good
interface JobData {
  campaignName: string;
  files: File[];
}

function processJob(job: Job<JobData>): JobData {
  return job.data;
}
```

**Prefer interfaces over types for objects:**
```typescript
// ✅ Preferred
interface User {
  id: number;
  email: string;
  name: string;
}

// ⚠️ Use types for unions, intersections
type Status = 'pending' | 'processing' | 'completed' | 'failed';
```

### Naming Conventions

**Variables and functions:** camelCase
```typescript
const uploadedFiles = [];
function processUploadJob() { }
```

**Classes and interfaces:** PascalCase
```typescript
class UploadService { }
interface CampaignTemplate { }
```

**Constants:** UPPER_SNAKE_CASE
```typescript
const MAX_FILE_SIZE = 104857600;
const DEFAULT_PAGE_SIZE = 20;
```

**Files:**
- Components: PascalCase (`UploadForm.tsx`)
- Services: camelCase (`authService.ts`)
- Utilities: camelCase (`validators.ts`)

### Code Organization

**Controller-Service Pattern:**
```typescript
// controllers/uploadController.ts
export const createUpload = async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const validatedData = validateUploadRequest(req.body);

    // 2. Call service
    const result = await uploadService.createUpload(validatedData);

    // 3. Return response
    res.status(201).json(result);
  } catch (error) {
    // 4. Handle errors
    handleError(error, res);
  }
};

// services/uploadService.ts
export class UploadService {
  async createUpload(data: UploadData) {
    // Business logic here
    // Database operations
    // External API calls
    return result;
  }
}
```

### Error Handling

**Always use try-catch for async operations:**
```typescript
// ✅ Good
async function fetchUser(id: number) {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return user.rows[0];
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    throw new Error('User fetch failed');
  }
}
```

**Custom error classes:**
```typescript
class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}
```

### Comments and Documentation

**Use JSDoc for public functions:**
```typescript
/**
 * Creates a new upload job and queues it for processing
 * @param userId - ID of the user creating the job
 * @param files - Array of files to upload
 * @param config - Campaign configuration
 * @returns Created job with status and ID
 * @throws ValidationError if files are invalid
 * @throws NotFoundError if ad account doesn't exist
 */
async function createUploadJob(
  userId: number,
  files: File[],
  config: CampaignConfig
): Promise<UploadJob> {
  // Implementation
}
```

**Inline comments for complex logic:**
```typescript
// Group files by variation pattern (e.g., ad_v1, ad_v2)
const variationGroups = files.reduce((groups, file) => {
  const pattern = extractVariationPattern(file.name);
  if (!groups[pattern]) {
    groups[pattern] = [];
  }
  groups[pattern].push(file);
  return groups;
}, {} as Record<string, File[]>);
```

## Development Workflow

### Git Workflow

**Branch naming:**
- Feature: `feature/user-authentication`
- Bug fix: `fix/upload-job-error`
- Hotfix: `hotfix/security-patch`
- Refactor: `refactor/upload-service`

**Commit messages:**
```
feat: Add Google Drive integration for file selection
fix: Resolve race condition in job queue processor
refactor: Extract file validation into separate service
docs: Update API reference with new endpoints
test: Add integration tests for upload flow
```

**Pull request workflow:**
1. Create feature branch from `main`
2. Make changes with clear commits
3. Write/update tests
4. Update documentation
5. Create pull request with description
6. Request code review
7. Address feedback
8. Merge when approved

### Code Review Checklist

**For reviewers:**
- [ ] Code follows project conventions
- [ ] No security vulnerabilities introduced
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No performance regressions
- [ ] Error handling is appropriate
- [ ] Logging is adequate
- [ ] No sensitive data in logs or code

## Testing

### Backend Testing

**Unit tests with Jest:**
```typescript
// tests/services/uploadService.test.ts
describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    service = new UploadService();
  });

  describe('createUpload', () => {
    it('should create upload job with valid data', async () => {
      const data = {
        userId: 1,
        files: [mockFile],
        campaignName: 'Test Campaign'
      };

      const result = await service.createUpload(data);

      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.total_files).toBe(1);
    });

    it('should throw validation error for invalid files', async () => {
      const data = {
        userId: 1,
        files: [],
        campaignName: 'Test Campaign'
      };

      await expect(service.createUpload(data))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

**Integration tests:**
```typescript
// tests/integration/upload.test.ts
describe('Upload API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDb();

    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'test123' });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  it('should create upload job', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .field('campaign_name', 'Test Campaign')
      .attach('files', 'tests/fixtures/test-image.jpg');

    expect(response.status).toBe(201);
    expect(response.body.job.id).toBeDefined();
  });
});
```

**Running tests:**
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- uploadService.test.ts

# Watch mode
npm run test:watch
```

### Frontend Testing

**Component tests with React Testing Library:**
```typescript
// tests/components/UploadForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadForm } from '../components/UploadForm';

describe('UploadForm', () => {
  it('renders upload form', () => {
    render(<UploadForm />);
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
  });

  it('validates file selection', async () => {
    render(<UploadForm />);

    const input = screen.getByLabelText('Select files');
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('1 file selected')).toBeInTheDocument();
  });
});
```

## Debugging

### Backend Debugging

**Using debugger in VSCode:**

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Logging for debugging:**
```typescript
// Use logger instead of console.log
import logger from './config/logger';

logger.debug('Processing upload', { jobId, fileCount });
logger.info('Upload completed', { jobId, duration });
logger.warn('Slow upload detected', { jobId, duration });
logger.error('Upload failed', { jobId, error });
```

**Database query debugging:**
```typescript
// Enable query logging in development
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
DatabaseMonitor.logQuery(result.command, Date.now() - startTime, [userId]);
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Profile component renders

**Network debugging:**
```typescript
// services/api.ts
api.interceptors.request.use(request => {
  console.log('Request:', request.method, request.url, request.data);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

**Performance profiling:**
```typescript
// Profile component render time
import { usePerformanceTracking } from './services/errorReporting';

function ExpensiveComponent() {
  const trackPerformance = usePerformanceTracking('ExpensiveComponent');

  useEffect(() => {
    // Component mounted
    return trackPerformance; // Log render time
  }, []);

  return <div>Content</div>;
}
```

### Monitoring Endpoints for Debugging

**Health check:**
```bash
curl http://localhost:3001/api/monitoring/health
```

**System metrics:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/monitoring/metrics
```

**Error rate:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/monitoring/error-rate
```

## Database Migrations

### Creating Migrations

**Using node-pg-migrate:**
```bash
# Create new migration
npm run migrate create add-user-settings-column

# This creates: migrations/1234567890_add-user-settings-column.js
```

**Migration file structure:**
```javascript
// migrations/1234567890_add-user-settings-column.js
exports.up = (pgm) => {
  pgm.addColumn('users', {
    settings: {
      type: 'jsonb',
      notNull: true,
      default: '{}'
    }
  });

  // Create index
  pgm.createIndex('users', 'settings', {
    method: 'gin'
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('users', 'settings');
  pgm.dropColumn('users', 'settings');
};
```

**Running migrations:**
```bash
# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Rollback to specific migration
npm run migrate down -- -t 1234567890
```

### Migration Best Practices

1. **Always provide rollback (down) migration**
2. **Use transactions for data migrations**
3. **Test migrations on production-like data**
4. **Never modify existing migrations** (create new ones instead)
5. **Add indexes for foreign keys and frequently queried columns**

## Adding New Features

### Step-by-Step Process

**1. Plan the feature:**
- Define requirements
- Design database schema changes
- Plan API endpoints
- Design UI/UX

**2. Create database migration (if needed):**
```bash
npm run migrate create add-feature-name
```

**3. Implement backend:**
```typescript
// 1. Add types
interface NewFeatureData {
  // ...
}

// 2. Create service
class NewFeatureService {
  async create(data: NewFeatureData) { }
  async update(id: number, data: Partial<NewFeatureData>) { }
  async delete(id: number) { }
  async getById(id: number) { }
  async list(filters: any) { }
}

// 3. Create controller
const newFeatureController = {
  create: async (req: Request, res: Response) => { },
  // ...
};

// 4. Add routes
router.post('/api/new-feature', authenticate, newFeatureController.create);
router.get('/api/new-feature', authenticate, newFeatureController.list);
router.get('/api/new-feature/:id', authenticate, newFeatureController.getById);
router.patch('/api/new-feature/:id', authenticate, newFeatureController.update);
router.delete('/api/new-feature/:id', authenticate, newFeatureController.delete);
```

**4. Implement frontend:**
```typescript
// 1. Add types
interface NewFeature {
  id: number;
  // ...
}

// 2. Create API service
const newFeatureApi = {
  create: (data: NewFeatureData) => api.post('/api/new-feature', data),
  list: () => api.get('/api/new-feature'),
  getById: (id: number) => api.get(`/api/new-feature/${id}`),
  update: (id: number, data: Partial<NewFeatureData>) =>
    api.patch(`/api/new-feature/${id}`, data),
  delete: (id: number) => api.delete(`/api/new-feature/${id}`),
};

// 3. Create Zustand store
const useNewFeatureStore = create<NewFeatureStore>((set) => ({
  items: [],
  loading: false,
  fetchItems: async () => {
    set({ loading: true });
    const response = await newFeatureApi.list();
    set({ items: response.data, loading: false });
  },
}));

// 4. Create components
function NewFeatureList() {
  const { items, loading, fetchItems } = useNewFeatureStore();
  // ...
}
```

**5. Add tests:**
- Backend unit tests
- Backend integration tests
- Frontend component tests

**6. Update documentation:**
- API reference
- Features guide
- User guide

## Performance Optimization

### Backend Performance

**1. Database optimization:**
```typescript
// ❌ N+1 query problem
const jobs = await getJobs();
for (const job of jobs) {
  job.creatives = await getCreativesForJob(job.id); // N queries
}

// ✅ Use JOIN or batch query
const jobs = await pool.query(`
  SELECT
    j.*,
    json_agg(c.*) as creatives
  FROM upload_jobs j
  LEFT JOIN creatives c ON c.job_id = j.id
  GROUP BY j.id
`);
```

**2. Caching:**
```typescript
// Cache frequently accessed data
const getCampaignTemplate = async (id: number) => {
  const cacheKey = `template:${id}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const template = await db.query('SELECT * FROM campaign_templates WHERE id = $1', [id]);

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(template));

  return template;
};
```

**3. Async processing:**
```typescript
// ❌ Synchronous processing blocks response
app.post('/api/jobs', async (req, res) => {
  const files = await processFiles(req.files); // Takes 30 seconds
  await uploadToMeta(files); // Takes 60 seconds
  res.json({ success: true });
});

// ✅ Queue for background processing
app.post('/api/jobs', async (req, res) => {
  const job = await createJob(req.body);
  await uploadQueue.add('process-upload', { jobId: job.id });
  res.json({ job, message: 'Processing started' });
});
```

### Frontend Performance

**1. Lazy loading:**
```typescript
// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/analytics" element={<Analytics />} />
  </Routes>
</Suspense>
```

**2. Memoization:**
```typescript
// Memoize expensive calculations
const ExpensiveComponent = ({ items }: Props) => {
  const processedData = useMemo(() => {
    return items.map(item => expensiveCalculation(item));
  }, [items]);

  return <div>{processedData}</div>;
};
```

**3. Virtual scrolling:**
```typescript
// Use virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

function LargeList({ items }: Props) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

## Security Guidelines

### Input Validation

**Always validate and sanitize user input:**
```typescript
import { body, validationResult } from 'express-validator';

router.post('/api/jobs',
  authenticate,
  [
    body('campaign_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .escape(),
    body('ad_account_id')
      .isInt()
      .toInt(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### SQL Injection Prevention

**Always use parameterized queries:**
```typescript
// ❌ NEVER do this
const userId = req.params.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;
const result = await pool.query(query);

// ✅ Always use parameterized queries
const userId = req.params.id;
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### Authentication and Authorization

**Protect routes:**
```typescript
// middleware/auth.ts
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = await getUserById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check ownership
export const checkOwnership = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user.id;

    const hasAccess = await checkUserHasAccess(userId, resource, resourceId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
```

### Sensitive Data

**Never log sensitive data:**
```typescript
// ❌ Bad
logger.info('User login', { email, password });

// ✅ Good
logger.info('User login', { email, passwordProvided: !!password });

// Use sanitization
const sanitizeBody = (body: any) => {
  const sensitive = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...body };
  sensitive.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  return sanitized;
};
```

## Troubleshooting

### Common Issues

**1. Database connection errors:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection settings
psql -U postgres -d adsuploader_dev

# Verify .env settings match database config
```

**2. Redis connection errors:**
```bash
# Check Redis is running
redis-cli ping

# Check connection
redis-cli -h localhost -p 6379
```

**3. Port conflicts:**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

**4. TypeScript errors:**
```bash
# Clean build and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**5. File upload issues:**
```bash
# Check upload directory exists and has correct permissions
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Getting Help

- Check existing documentation
- Search closed issues on GitHub
- Ask in development chat/forum
- Create detailed issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment details
  - Relevant logs/errors

## Next Steps

- Read [Design Decisions](./design-decisions.md) to understand architectural choices
- Check [API Reference](./api-reference.md) for endpoint documentation
- Review [Features Guide](./features.md) for feature details
- See [Deployment Guide](./deployment.md) for production setup
