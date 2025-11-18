# Design Decisions

This document explains the key architectural and technical decisions made during the development of AdsUploader, along with the reasoning behind each choice. This is especially useful for AI agents and developers who need to understand *why* things were built a certain way.

## Table of Contents

- [Technology Stack Choices](#technology-stack-choices)
- [Architecture Patterns](#architecture-patterns)
- [Database Design](#database-design)
- [Frontend Design](#frontend-design)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Trade-offs and Alternatives](#trade-offs-and-alternatives)

## Technology Stack Choices

### Why TypeScript for Both Frontend and Backend?

**Decision**: Use TypeScript for all code (frontend and backend)

**Reasoning**:
1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Autocomplete, refactoring, and inline documentation
3. **Shared Types**: Same interfaces can be used across frontend and backend
4. **Maintainability**: Easier to refactor and understand code months later
5. **Team Collaboration**: Self-documenting code reduces communication overhead

**Example**:
```typescript
// Shared type used in both frontend and backend
interface UploadJob {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_ads: number;
  progress_percentage: number;
}
```

**Alternatives Considered**:
- JavaScript (rejected - too error-prone for large codebase)
- Flow (rejected - less popular, worse tooling than TypeScript)

### Why Ant Design Instead of Material-UI or Chakra?

**Decision**: Use Ant Design as the primary UI library

**Reasoning**:
1. **Enterprise-Grade Components**: Built for complex business applications
2. **Comprehensive**: 50+ components out of the box (Table, Form, Upload, Modal, etc.)
3. **Professional Look**: Polished, consistent design without heavy customization
4. **TypeScript First**: Excellent TypeScript support with built-in types
5. **Form Handling**: Powerful Form component with validation
6. **Table Features**: Advanced table with sorting, filtering, pagination built-in

**Real Impact**:
- The Jobs page uses `<Table>` with built-in sorting, filtering, and pagination - would require 100+ lines of custom code with other libraries
- Upload page uses `<Dragger>` component - drag-and-drop file upload in 5 lines
- Forms throughout the app use `<Form>` with built-in validation

**Alternatives Considered**:
- Material-UI (rejected - too opinionated, harder to customize)
- Chakra UI (rejected - less components, more setup required)
- Tailwind + Headless UI (rejected - too much custom code needed)

### Why BullMQ for Job Queue Instead of Agenda or Bee-Queue?

**Decision**: Use BullMQ for async job processing

**Reasoning**:
1. **Redis-Backed**: Reliable, fast, and proven at scale
2. **Modern API**: Promise-based, TypeScript support
3. **Advanced Features**:
   - Job retries with exponential backoff
   - Progress tracking (critical for our use case)
   - Delayed jobs
   - Priority queues
   - Job events (progress, completed, failed)
4. **Active Development**: Regularly maintained, good documentation
5. **UI Dashboard**: Bull Board for monitoring (optional add-on)

**Critical for Our Use Case**:
```typescript
// Update job progress in real-time
await job.updateProgress({
  completed: 50,
  total: 100,
  percentage: 50
});
```

**Alternatives Considered**:
- Agenda (rejected - MongoDB-based, we use PostgreSQL)
- Bee-Queue (rejected - less features, no progress tracking)
- Kue (rejected - unmaintained, security issues)

### Why Zustand Over Redux or Context API?

**Decision**: Use Zustand for global state management

**Reasoning**:
1. **Simplicity**: <100 lines of code vs 300+ for Redux
2. **No Boilerplate**: No actions, reducers, dispatch - just functions
3. **TypeScript Friendly**: Excellent type inference
4. **Performance**: No context re-render issues
5. **Hooks-Based**: Natural React patterns

**Example**:
```typescript
// Entire store definition
const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  jobs: [],
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
}));
```

**Alternatives Considered**:
- Redux (rejected - too much boilerplate for our needs)
- Context API (rejected - performance issues with frequent updates)
- Jotai/Recoil (rejected - overkill for our state complexity)

### Why PostgreSQL Instead of MongoDB?

**Decision**: Use PostgreSQL for primary database

**Reasoning**:
1. **Relational Data**: Our data has clear relationships (users → jobs → creatives)
2. **ACID Transactions**: Critical for job processing integrity
3. **Complex Queries**: Need JOINs for activity logs, team permissions
4. **Data Integrity**: Foreign keys prevent orphaned records
5. **Industry Standard**: Well-understood, excellent tooling

**Schema Example**:
```sql
-- Clear relationships enforced by database
CREATE TABLE upload_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ad_account_id INTEGER REFERENCES ad_accounts(id) ON DELETE SET NULL,
  ...
);
```

**Alternatives Considered**:
- MongoDB (rejected - doesn't fit our relational data model)
- SQLite (rejected - not suitable for concurrent writes)
- MySQL (rejected - PostgreSQL has better JSON support for config fields)

## Architecture Patterns

### Why Separate Frontend and Backend?

**Decision**: Completely separate React frontend and Node.js backend

**Reasoning**:
1. **Independent Scaling**: Scale frontend and backend independently
2. **Technology Flexibility**: Can replace frontend framework without touching backend
3. **API-First**: Backend API can be used by mobile apps, CLI tools, etc.
4. **Team Organization**: Frontend and backend developers can work independently
5. **Deployment Options**: Can deploy to different services (Vercel for frontend, Railway for backend)

**Structure**:
```
/frontend - React app with Vite
/backend - Express API server
```

**Alternatives Considered**:
- Next.js full-stack (rejected - tighter coupling, harder to scale separately)
- Monorepo with shared packages (considered for future if team grows)

### Why Controller-Service Pattern?

**Decision**: Separate controllers (handle HTTP) from services (business logic)

**Reasoning**:
1. **Separation of Concerns**: HTTP logic vs business logic
2. **Testability**: Can test business logic without HTTP mocking
3. **Reusability**: Services can be called from controllers, workers, CLI tools
4. **Clear Responsibility**: Controllers validate input, services contain algorithms

**Example**:
```typescript
// Controller - handles HTTP
export class JobController {
  async getJobs(req: Request, res: Response) {
    const jobs = await jobService.listJobs(req.user.id, req.query);
    res.json({ jobs });
  }
}

// Service - contains business logic
export class JobService {
  async listJobs(userId: number, filters: any) {
    // Complex query logic, filtering, pagination
    return await db.query(...);
  }
}
```

**Alternatives Considered**:
- Controllers with embedded business logic (rejected - hard to test and reuse)
- Domain-driven design (rejected - overkill for our complexity)

### Why Job Queue Instead of Webhooks?

**Decision**: Use BullMQ queue for async processing instead of Meta webhooks

**Reasoning**:
1. **Control**: We control retry logic, timing, concurrency
2. **Reliability**: Jobs persist in Redis, survive server restarts
3. **Progress Tracking**: Can update progress during long-running jobs
4. **Debugging**: Can inspect queue, replay failed jobs
5. **Independence**: Don't rely on Meta's webhook reliability

**Flow**:
```
User uploads → Create job → Add to queue → Worker processes → Update progress → Complete
```

**Alternatives Considered**:
- Meta webhooks (rejected - unreliable, no progress tracking)
- Direct synchronous processing (rejected - too slow, blocks HTTP thread)

## Database Design

### Why Separate Tables for Creatives and Jobs?

**Decision**: `upload_jobs` table (1) to `creatives` table (many)

**Reasoning**:
1. **Normalization**: Don't duplicate job info for each creative
2. **Progress Tracking**: Update individual creative status independently
3. **Variation Grouping**: Store variation metadata per creative
4. **Failed Creatives**: Some creatives can fail while job continues

**Schema**:
```sql
upload_jobs: id, user_id, status, total_ads, completed_ads
creatives: id, job_id, filename, type, status, variation_group
```

**Alternatives Considered**:
- JSON blob in jobs table (rejected - can't query individual creatives)
- MongoDB embedded documents (rejected - using PostgreSQL for ACID)

### Why JSONB for Configuration Fields?

**Decision**: Use JSONB for `campaign_config`, `adset_config`, `ad_config` in templates

**Reasoning**:
1. **Flexibility**: Meta API changes, we don't need migrations
2. **User-Defined**: Users can store any campaign settings
3. **Performance**: JSONB is indexed, can query nested fields
4. **Validation**: Can still validate JSON structure in application code

**Example**:
```sql
CREATE TABLE campaign_templates (
  id SERIAL PRIMARY KEY,
  campaign_config JSONB,  -- {special_ad_categories: [], objective: "CONVERSIONS"}
  adset_config JSONB,     -- {optimization_goal: "REACH", billing_event: "IMPRESSIONS"}
  ad_config JSONB         -- {creative_type: "IMAGE", call_to_action: "SHOP_NOW"}
);
```

**Alternatives Considered**:
- Separate tables for each config type (rejected - too many JOINs)
- Text field with JSON.parse (rejected - no indexing or validation)

### Why Activity Logs Table?

**Decision**: Dedicated `activity_logs` table for audit trail

**Reasoning**:
1. **Compliance**: Many industries require audit trails
2. **Debugging**: Track down what happened when
3. **Security**: Detect suspicious activity
4. **Team Features**: See who changed what
5. **Analytics**: Usage patterns, popular features

**Captured Data**:
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50),           -- create, update, delete, login
  resource_type VARCHAR(50),     -- job, template, team_member
  resource_id INTEGER,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP
);
```

**Use Cases**:
- "Who deleted my template?"
- "When was this job created?"
- "Which team member uploaded these ads?"

## Frontend Design

### Why Zustand Store Structure?

**Decision**: Single store with nested state, not multiple stores

**Reasoning**:
1. **Simplicity**: One source of truth
2. **DevTools**: Easier to debug with Redux DevTools
3. **Persistence**: Can persist entire state to localStorage easily
4. **Type Safety**: Single interface for entire app state

**Store Structure**:
```typescript
interface StoreState {
  user: User | null;              // Current user
  templates: CampaignTemplate[];  // Cached templates
  jobs: UploadJob[];              // Recent jobs
  stats: JobStats | null;         // Dashboard stats
  setUser: (user: User) => void;
  // ... other setters
}
```

**Alternatives Considered**:
- Multiple stores (rejected - harder to sync, more complex)
- Context for each feature (rejected - performance issues)

### Why Protected Route Wrapper?

**Decision**: `<ProtectedRoute>` component wraps all authenticated routes

**Reasoning**:
1. **Security**: Single place to check authentication
2. **DRY**: Don't repeat auth check in every component
3. **Redirect Logic**: Centralized redirect to /login
4. **Flexibility**: Easy to add role-based permissions later

**Implementation**:
```typescript
<Route path="/" element={
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="upload" element={<Upload />} />
  ...
</Route>
```

**Alternatives Considered**:
- Check auth in each component (rejected - repetitive, error-prone)
- Higher-order component (rejected - less readable with hooks)

### Why Error Boundary at Root Level?

**Decision**: Wrap entire app in `<ErrorBoundary>`

**Reasoning**:
1. **User Experience**: Show friendly error instead of blank screen
2. **Error Recovery**: Reload button to recover
3. **Development**: Show error details in dev mode
4. **Production**: Hide stack traces, show generic message

**Implementation**:
```typescript
// main.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Catches**:
- Component render errors
- Lifecycle method errors
- Constructor errors

**Doesn't Catch** (by design):
- Event handler errors (use try-catch)
- Async code (use .catch())
- Server-side errors (handled in API client)

## Security Considerations

### Why JWT in localStorage Not HttpOnly Cookies?

**Decision**: Store JWT tokens in localStorage

**Reasoning**:
1. **API-First**: Backend is separate API, not server-rendered
2. **Mobile Apps**: Can use same API with token auth
3. **Simplicity**: No cookie configuration
4. **CORS**: Easier to handle cross-origin requests

**Trade-off**: Vulnerable to XSS
**Mitigation**:
- Content Security Policy headers
- Sanitize all user input
- Error boundary prevents code execution
- Short token expiry (7 days)

**Security Measures**:
```typescript
// Axios interceptor adds token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  }
);
```

**Alternatives Considered**:
- HttpOnly cookies (rejected - complex with separate frontend/backend)
- sessionStorage (rejected - lost on tab close)

### Why bcrypt for Password Hashing?

**Decision**: Use bcrypt with salt rounds of 10

**Reasoning**:
1. **Industry Standard**: Battle-tested for 20+ years
2. **Slow by Design**: Makes brute-force attacks impractical
3. **Automatic Salting**: Each password gets unique salt
4. **Configurable Difficulty**: Can increase rounds as hardware improves

**Implementation**:
```typescript
// Registration
const hash = await bcrypt.hash(password, 10);

// Login
const valid = await bcrypt.compare(password, hash);
```

**Alternatives Considered**:
- argon2 (rejected - newer, less proven, no Node.js native bindings)
- SHA-256 (rejected - too fast, not designed for passwords)
- scrypt (rejected - complex configuration)

### Why Rate Limiting on All API Routes?

**Decision**: Express rate limiter on all `/api/*` routes

**Reasoning**:
1. **DDoS Protection**: Prevent overwhelming server
2. **Brute Force**: Limit login attempts
3. **Cost Control**: Limit API calls to Meta/Google
4. **Fair Usage**: Prevent one user from hogging resources

**Configuration**:
```typescript
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests'
}));
```

## Performance Optimization

### Why Pagination on All List Endpoints?

**Decision**: All list endpoints return paginated results

**Reasoning**:
1. **Database Performance**: Don't fetch all 10,000 jobs at once
2. **Network**: Smaller payloads, faster responses
3. **Memory**: Frontend doesn't hold entire dataset
4. **User Experience**: Faster initial page load

**Implementation**:
```typescript
GET /api/jobs?page=1&limit=20
// Returns { jobs: [...], total: 500, page: 1, limit: 20 }
```

**Frontend**:
```typescript
<Table pagination={{
  current: page,
  pageSize: 20,
  total: totalJobs,
  onChange: (newPage) => setPage(newPage)
}} />
```

### Why Lazy Loading Routes?

**Decision**: Code-split routes with React.lazy()

**Reasoning**:
1. **Initial Bundle Size**: Users don't download Upload page code until they visit it
2. **Faster First Paint**: Critical path only includes Login/Dashboard
3. **Better Caching**: Each route can be cached independently

**Implementation** (Future Enhancement - Not Yet Implemented):
```typescript
const Upload = lazy(() => import('./pages/Upload'));
const Templates = lazy(() => import('./pages/Templates'));

<Suspense fallback={<Spin />}>
  <Routes>
    <Route path="/upload" element={<Upload />} />
  </Routes>
</Suspense>
```

### Why Client-Side Search for Jobs Page?

**Decision**: Search/filter jobs client-side after fetching

**Reasoning**:
1. **Fewer API Calls**: Fetch once, filter locally
2. **Instant Results**: No network latency
3. **Simple Backend**: Backend doesn't need complex search logic
4. **Trade-off**: Only works for small datasets (100-1000 jobs)

**When to Switch**: If users have 10,000+ jobs, implement server-side search

## Trade-offs and Alternatives

### Trade-off: Mock API vs Real API in Development

**Decision**: Real Meta API with mock fallback

**Reasoning**:
- **Pro**: Test actual API integration during development
- **Pro**: Catch API changes early
- **Con**: Requires Meta developer account
- **Con**: Slower development (rate limits)

**Implementation**:
```typescript
if (process.env.META_APP_ID) {
  // Use real Meta API
  const response = await metaApi.createCampaign(...);
} else {
  // Use mock
  return { id: 'mock_123', name: 'Mock Campaign' };
}
```

### Trade-off: Separate Google Drive vs Direct Upload Only

**Decision**: Support both direct upload AND Google Drive import

**Reasoning**:
- **Pro**: Users already store files in Drive, convenience
- **Pro**: Competitive feature parity with competitors
- **Con**: Complex OAuth flow
- **Con**: Another integration to maintain

**Value**: High - users frequently request "import from Drive"

### Trade-off: Team Features vs Single-User

**Decision**: Build team collaboration from the start

**Reasoning**:
- **Pro**: Agencies and businesses need team features
- **Pro**: Harder to add later (permissions, database schema)
- **Con**: More complex to build
- **Con**: Most users won't use it initially

**Payoff**: Enables enterprise sales, justifies higher pricing

### Trade-off: Activity Logs vs No Audit Trail

**Decision**: Implement activity logs from day one

**Reasoning**:
- **Pro**: Compliance requirement for many businesses
- **Pro**: Helps debug user issues
- **Pro**: Security monitoring
- **Con**: Storage overhead
- **Con**: Performance cost on every action

**Mitigation**: Archive old logs after 90 days

## Key Principles Applied

1. **Start Simple, Add Complexity**: Used mock APIs first, then added real ones
2. **Type Safety First**: TypeScript everywhere catches bugs early
3. **User Experience Over Code Simplicity**: Added bulk operations, CSV export even though complex
4. **Security in Layers**: Authentication + rate limiting + input validation
5. **Performance Budget**: Every page loads in <2s on 3G
6. **Fail Gracefully**: Error boundaries, retry logic, friendly error messages
7. **Future-Proof**: JSONB for configs, separate frontend/backend for flexibility

## For AI Agents

When working on this codebase, understand:

1. **Why TypeScript**: Don't remove types, they prevent bugs
2. **Why BullMQ**: Don't replace with simple setTimeout, need reliability
3. **Why Separate Services**: Don't put business logic in controllers
4. **Why Ant Design**: Don't add custom CSS when Ant component exists
5. **Why Protected Routes**: Don't skip auth checks in individual components
6. **Why Pagination**: Don't remove it even if "seems unnecessary"
7. **Why Activity Logs**: Don't skip logging, it's critical for debugging

These decisions were made deliberately after considering alternatives. Changes should maintain or improve upon these principles.
