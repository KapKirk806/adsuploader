# Features Guide

Complete guide to all features in AdsUploader, how they work, and how to use them.

## Authentication

### Email/Password Registration
- **Location**: `/register`
- **How it works**: bcrypt hashes password, stores in database, returns JWT token
- **Files**: `frontend/src/pages/Register.tsx`, `backend/src/controllers/authController.ts`

### Facebook OAuth Login
- **Location**: `/login` → "Continue with Facebook"
- **How it works**: Redirects to Facebook, exchanges code for token, fetches user profile
- **Files**: `frontend/src/pages/Login.tsx`, `backend/src/controllers/authController.ts`
- **Setup Required**: Meta App ID and Secret in `.env`

### Password Reset
- **Location**: `/forgot-password` → email link → `/reset-password?token=xxx`
- **How it works**: Generates reset token, sends email (not implemented), validates token, updates password
- **Files**: `frontend/src/pages/ForgotPassword.tsx`, `frontend/src/pages/ResetPassword.tsx`

## Bulk Upload

### File Upload
- **Location**: `/upload`
- **Supported Formats**: JPG, PNG, GIF (images) / MP4, MOV (videos)
- **Max Files**: 100 per upload
- **How it works**:
  1. User selects files (drag-drop or click)
  2. Files validated client-side (type, size)
  3. Uploaded to `/api/uploads/files` via multipart/form-data
  4. Backend processes each file (extract metadata)
  5. Variation detection groups related files
  6. Job created in database and queue

### Variation Detection
- **Purpose**: Group related files for A/B testing (e.g., product_v1, product_v2)
- **Patterns Supported**:
  - `image_v1`, `image_v2` (sequential numbers)
  - `image_001`, `image_002` (zero-padded)
  - `image_a`, `image_b` (letters)
  - `image(1)`, `image(2)` (parentheses)
- **Implementation**: `backend/src/utils/variationDetector.ts`
- **Example**:
  ```
  product_red_v1.jpg   → Group: "product_red", Number: 1
  product_red_v2.jpg   → Group: "product_red", Number: 2
  product_blue_v1.jpg  → Group: "product_blue", Number: 1
  ```

### Google Drive Import
- **Location**: `/upload` → "Import from Google Drive"
- **How it works**:
  1. Click button → OAuth flow to Google
  2. Grant permissions → callback with tokens
  3. Browse files → select images/videos
  4. Files added to upload queue (URLs, not downloaded yet)
- **Files**: `frontend/src/components/GoogleDrivePicker.tsx`, `backend/src/services/googleDrive.ts`

## Campaign Templates

### Create Template
- **Location**: `/templates` → "New Template"
- **Fields**:
  - Name, Description
  - Objective (CONVERSIONS, LINK_CLICKS, etc.)
  - Campaign settings (JSON)
  - Ad Set settings (JSON)
  - Ad settings (JSON)
- **Use Case**: Save settings for "Black Friday Campaign" and reuse

### Set Default Template
- **Purpose**: Auto-select template when uploading
- **How**: Click "Set Default" button on template
- **Behavior**: Upload page pre-selects this template

### Template Configuration
Templates store Meta API settings as JSON:

```json
{
  "campaign_config": {
    "special_ad_categories": [],
    "objective": "CONVERSIONS"
  },
  "adset_config": {
    "optimization_goal": "OFFSITE_CONVERSIONS",
    "billing_event": "IMPRESSIONS",
    "bid_amount": 100,
    "daily_budget": 5000
  },
  "ad_config": {
    "call_to_action": {
      "type": "SHOP_NOW"
    }
  }
}
```

## Job Processing

### Job Queue (BullMQ)
- **Purpose**: Process uploads asynchronously without blocking
- **Flow**:
  1. User clicks "Publish to Meta"
  2. Job added to Redis queue
  3. Worker picks up job
  4. Processes each creative sequentially
  5. Updates progress in real-time
  6. Marks job complete/failed

### Job Statuses
- **pending**: Just created, waiting in queue
- **processing**: Worker is actively processing
- **completed**: All ads created successfully
- **failed**: Errors occurred during processing
- **cancelled**: User cancelled before completion

### Progress Tracking
- **Real-time Updates**: Frontend polls `/api/jobs/:id/progress` every 2 seconds
- **Metrics**:
  - `total_ads`: Total number of ads to create
  - `completed_ads`: Successfully created
  - `failed_ads`: Failed creations
  - `progress_percentage`: Overall progress

## Meta API Integration

### Ad Account Sync
- **Location**: `/ad-accounts` → "Sync from Meta"
- **How it works**:
  1. Fetches user's ad accounts from Meta Marketing API
  2. Stores in local database
  3. Shows account name, ID, currency, timezone
- **Requirement**: User must complete Facebook OAuth first

### Ad Creation Flow
When a job is processed:
```
1. Upload image/video to Meta
   → POST /v18.0/{ad_account_id}/adimages or advideos
   → Returns: {hash: 'abc123'}

2. Create ad creative
   → POST /v18.0/act_{ad_account_id}/adcreatives
   → Uses: image hash, template settings
   → Returns: {id: '12345'}

3. Create ad
   → POST /v18.0/act_{ad_account_id}/ads
   → Links: creative_id, adset_id
   → Returns: {id: '67890'}

4. Update job progress
```

### Mock Mode
- **Purpose**: Develop without Meta credentials
- **Behavior**: Returns fake data when `META_APP_ID` not set
- **Files**: `backend/src/services/metaApi.ts` (has if/else for mock)

## Team Collaboration

### Invite Members
- **Location**: `/team` → "Invite Member"
- **Roles**:
  - **Owner**: Full access, can't be removed
  - **Admin**: Manage team, templates, uploads
  - **Member**: Create uploads, view jobs
- **How it works**: Email invitation (not sent yet), user must already have account

### Role Management
- **Change Roles**: Select dropdown in team table
- **Permissions**: Enforced in backend (check `req.user.role`)
- **Future**: Email invites, granular permissions

## Activity Logs

### What's Tracked
- User actions: login, logout, register
- CRUD operations: create, update, delete
- Resources: jobs, templates, team members, ad accounts
- Metadata: IP address, user agent, timestamp

### Search & Filter
- **Search**: Any text field (user name, action, description)
- **Filter by Action**: Dropdown (create, update, delete, etc.)
- **Date Range**: Picker for start/end dates
- **Pagination**: 20 logs per page

### Use Cases
- **Audit**: "Who deleted my template?"
- **Debug**: "When did this job fail?"
- **Security**: "Unusual login activity?"

## User Profile & Settings

### Profile Management
- **Location**: `/profile`
- **Editable**:
  - Name, Email
  - Profile picture (avatar)
  - Password (requires current password)

### Settings
- **Location**: `/settings`
- **Preferences**:
  - Email notifications (on/off)
  - Timezone (for date displays)
  - Default currency
  - Default ad account

### Account Deletion
- **Location**: `/settings` → Danger Zone
- **Warning**: Permanent, deletes all data
- **Implementation**: Soft delete (future) or hard delete (current)

## Advanced Features

### Search & Filter
Every list page has search:
- **Jobs**: Search by ID, campaign ID, status
- **Templates**: Search by name
- **Team**: Search by name, email
- **Activity Logs**: Search all fields

### Sorting
Tables sortable by clicking column headers:
- **Jobs**: Sort by ID, status, progress, dates
- **Default Sort**: Created date descending (newest first)

### Bulk Operations
- **Jobs Page**: Select multiple jobs → "Bulk Cancel"
- **Future**: Bulk delete templates, bulk assign team members

### CSV Export
- **Jobs Page**: Export button → downloads CSV
- **Includes**: All job data (ID, status, progress, dates)
- **Filename**: `jobs-2024-01-15T10:30:00.000Z.csv`

### Error Handling
- **Error Boundary**: Catches React crashes, shows friendly message
- **Form Validation**: Real-time validation on all forms
- **API Errors**: Toasts (Ant Design message) for errors
- **Retry Logic**: Failed API calls retry with exponential backoff (in job queue)

## Technical Details

### File Processing
Images: Sharp library
```typescript
const metadata = await sharp(filePath).metadata();
// Extract: width, height, format
// Calculate aspect ratio: 1:1, 16:9, etc.
```

Videos: FFmpeg
```typescript
ffmpeg.ffprobe(filePath, (err, metadata) => {
  // Extract: width, height, duration, codec
});
```

### Job Queue Worker
```typescript
queue.process('upload-job', async (job) => {
  const { jobId } = job.data;

  // Update status
  await updateJobStatus(jobId, 'processing');

  // Process each creative
  for (const creative of creatives) {
    const hash = await uploadToMeta(creative);
    await createAd(hash, creative);
    await job.updateProgress({
      completed: ++completed,
      total: total
    });
  }

  await updateJobStatus(jobId, 'completed');
});
```

### Protected Routes
```typescript
// All routes under "/" require authentication
<Route path="/" element={
  <ProtectedRoute>  {/* Checks localStorage for token */}
    <Layout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
  ...
</Route>
```

## Feature Roadmap

### Completed ✅
- Bulk upload
- Variation detection
- Templates
- Job queue
- Meta API integration
- Google Drive import
- Team collaboration
- Activity logs
- Profile & settings
- Search, sort, filter, export

### In Progress 🚧
- Email sending (for password reset, invites)
- Real-time WebSocket updates (instead of polling)
- Analytics dashboard with charts

### Planned 📋
- A/B testing tools
- Automated optimization rules
- Multi-platform support (TikTok, Google Ads)
- AI-powered copy generation
- White-label options
- Public API for integrations

## For Developers

### Adding a New Feature

1. **Backend**:
   - Add database table (if needed) in `migrations/`
   - Create controller in `controllers/`
   - Create service (business logic) in `services/`
   - Add routes in `routes/`
   - Mount routes in `server.ts`

2. **Frontend**:
   - Create page in `pages/` (if main feature)
   - Create component in `components/` (if reusable)
   - Add API method in `services/api.ts`
   - Add types in `types/index.ts`
   - Add route in `App.tsx`

3. **Testing**:
   - Write integration test in `backend/test-integration.js`
   - Manual test in browser
   - Check activity logs created

### Common Patterns

**Creating a new page**:
```typescript
// frontend/src/pages/MyFeature.tsx
import { useState, useEffect } from 'react';
import { Card, Table, Button } from 'antd';
import { api } from '../services/api';

export default function MyFeature() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.getMyData();
      setData(result);
    } catch (error) {
      message.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Table dataSource={data} loading={loading} />
    </Card>
  );
}
```

**Creating a new API endpoint**:
```typescript
// backend/src/controllers/myController.ts
export class MyController {
  async getData(req: AuthRequest, res: Response) {
    const data = await myService.fetchData(req.user.id);
    res.json({ data });
  }
}

// backend/src/routes/my.ts
router.get('/', myController.getData);

// backend/src/server.ts
app.use('/api/my', myRoutes);
```

## Troubleshooting

### "Failed to load jobs"
- Check backend is running: `cd backend && npm run dev`
- Check logs: Look for errors in terminal
- Check database: `psql adsuploader` → `SELECT COUNT(*) FROM upload_jobs;`

### "Authentication failed"
- Clear localStorage: `localStorage.clear()` in browser console
- Check JWT secret in `.env`
- Re-login

### "Google Drive not connecting"
- Check Google OAuth credentials in `.env`
- Check redirect URI in Google Cloud Console matches
- Check scopes include `drive.readonly`

### "Meta API errors"
- Check Meta App ID and Secret in `.env`
- Check user granted permissions in Facebook settings
- Check Meta API version compatibility

For more help, see logs in `/backend/logs/` directory.
