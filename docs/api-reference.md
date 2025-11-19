# API Reference

Complete API documentation for AdsUploader backend.

## Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

Login or register to receive a JWT token. Tokens expire based on `JWT_EXPIRATION` configuration (default: 7 days).

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "error": "Error type or message",
  "message": "Detailed error message",
  "details": { ... }
}
```

## Rate Limiting

Rate limits are applied per IP address:
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes

---

## Authentication Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "company": "Acme Inc"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
- Email: Valid email format, unique
- Password: Minimum 8 characters
- Name: Required, 1-100 characters

---

### Login

Authenticate with email and password.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "role": "user"
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "company": "Acme Inc",
  "role": "user",
  "profile_picture": "https://...",
  "settings": {
    "notifications_enabled": true,
    "default_campaign_objective": "CONVERSIONS"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PATCH /api/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "company": "New Company Inc",
  "profile_picture": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### Change Password

Change user password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Ad Account Endpoints

### List Ad Accounts

Get all ad accounts for the authenticated user.

**Endpoint:** `GET /api/ad-accounts`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "accounts": [
    {
      "id": 1,
      "user_id": 1,
      "account_id": "act_123456789",
      "account_name": "My Ad Account",
      "access_token": "encrypted_token",
      "status": "active",
      "currency": "USD",
      "timezone": "America/Los_Angeles",
      "created_at": "2024-01-15T10:30:00Z",
      "last_synced": "2024-01-20T14:22:00Z"
    }
  ]
}
```

---

### Connect Ad Account

Connect a new Meta ad account.

**Endpoint:** `POST /api/ad-accounts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "account_id": "act_123456789",
  "access_token": "meta_user_access_token"
}
```

**Response:** `201 Created`
```json
{
  "message": "Ad account connected successfully",
  "account": {
    "id": 1,
    "account_id": "act_123456789",
    "account_name": "My Ad Account",
    "status": "active"
  }
}
```

---

### Disconnect Ad Account

Remove an ad account connection.

**Endpoint:** `DELETE /api/ad-accounts/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Ad account disconnected successfully"
}
```

---

## Campaign Template Endpoints

### List Templates

Get all campaign templates.

**Endpoint:** `GET /api/templates`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (optional): Search by name
- `objective` (optional): Filter by campaign objective
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "templates": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Conversion Campaign Template",
      "campaign_objective": "CONVERSIONS",
      "targeting": {
        "age_min": 25,
        "age_max": 45,
        "genders": [1, 2],
        "locations": {
          "countries": ["US", "CA"]
        },
        "interests": [{"id": "6003139266461", "name": "Technology"}]
      },
      "budget": {
        "daily_budget": 5000,
        "optimization_goal": "CONVERSIONS"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "is_default": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Create Template

Create a new campaign template.

**Endpoint:** `POST /api/templates`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Campaign Template",
  "campaign_objective": "CONVERSIONS",
  "targeting": {
    "age_min": 25,
    "age_max": 45,
    "genders": [1, 2],
    "locations": {
      "countries": ["US"]
    }
  },
  "budget": {
    "daily_budget": 5000,
    "optimization_goal": "CONVERSIONS"
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Template created successfully",
  "template": { ... }
}
```

---

### Get Template

Get a specific template by ID.

**Endpoint:** `GET /api/templates/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "template": { ... }
}
```

---

### Update Template

Update an existing template.

**Endpoint:** `PATCH /api/templates/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Template Name",
  "targeting": {
    "age_min": 30,
    "age_max": 50
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Template updated successfully",
  "template": { ... }
}
```

---

### Delete Template

Delete a template.

**Endpoint:** `DELETE /api/templates/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Template deleted successfully"
}
```

---

## Upload Job Endpoints

### List Upload Jobs

Get all upload jobs with filtering and pagination.

**Endpoint:** `GET /api/jobs`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (pending, processing, completed, failed, cancelled)
- `ad_account_id` (optional): Filter by ad account
- `search` (optional): Search by campaign name
- `from_date` (optional): Filter from date (ISO 8601)
- `to_date` (optional): Filter to date (ISO 8601)
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort field (created_at, updated_at, status)
- `order` (optional): Sort order (asc, desc)

**Response:** `200 OK`
```json
{
  "jobs": [
    {
      "id": 1,
      "user_id": 1,
      "ad_account_id": 1,
      "template_id": 1,
      "campaign_name": "Summer Sale Campaign",
      "status": "completed",
      "total_files": 25,
      "processed_files": 25,
      "failed_files": 0,
      "progress": {
        "completed": 25,
        "total": 25,
        "percentage": 100,
        "current_step": "Completed"
      },
      "metadata": {
        "source": "google_drive",
        "variation_groups": 5
      },
      "created_at": "2024-01-20T10:00:00Z",
      "updated_at": "2024-01-20T10:15:00Z",
      "completed_at": "2024-01-20T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Create Upload Job

Create a new bulk upload job.

**Endpoint:** `POST /api/jobs`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `ad_account_id`: Ad account ID (required)
- `template_id`: Campaign template ID (optional)
- `campaign_name`: Campaign name (required)
- `files[]`: Upload files (required, multiple files)
- `settings`: JSON string with campaign settings (optional)

**Request Example (using FormData):**
```javascript
const formData = new FormData();
formData.append('ad_account_id', '1');
formData.append('campaign_name', 'Summer Sale Campaign');
formData.append('template_id', '5');
formData.append('files', file1);
formData.append('files', file2);
formData.append('settings', JSON.stringify({
  start_time: '2024-02-01T00:00:00Z',
  end_time: '2024-02-28T23:59:59Z'
}));

fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
});
```

**Response:** `201 Created`
```json
{
  "message": "Upload job created successfully",
  "job": {
    "id": 1,
    "status": "pending",
    "total_files": 10,
    "processed_files": 0,
    "queue_id": "bull-job-id-123"
  }
}
```

---

### Get Upload Job

Get details of a specific upload job.

**Endpoint:** `GET /api/jobs/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "job": {
    "id": 1,
    "campaign_name": "Summer Sale Campaign",
    "status": "processing",
    "total_files": 25,
    "processed_files": 10,
    "failed_files": 0,
    "progress": {
      "completed": 10,
      "total": 25,
      "percentage": 40,
      "current_step": "Uploading creatives"
    },
    "creatives": [
      {
        "id": 1,
        "filename": "banner_v1.jpg",
        "status": "uploaded",
        "meta_creative_id": "12345678",
        "file_size": 245632,
        "dimensions": "1200x628",
        "variation_group": "banner_v",
        "uploaded_at": "2024-01-20T10:05:00Z"
      }
    ],
    "errors": [],
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:10:00Z"
  }
}
```

---

### Cancel Upload Job

Cancel a pending or processing upload job.

**Endpoint:** `POST /api/jobs/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Job cancelled successfully",
  "job": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

### Retry Failed Job

Retry a failed upload job.

**Endpoint:** `POST /api/jobs/:id/retry`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Job retry initiated",
  "job": {
    "id": 1,
    "status": "pending"
  }
}
```

---

### Delete Upload Job

Delete an upload job and its associated data.

**Endpoint:** `DELETE /api/jobs/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Job deleted successfully"
}
```

---

### Bulk Delete Jobs

Delete multiple jobs at once.

**Endpoint:** `POST /api/jobs/bulk-delete`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "job_ids": [1, 2, 3, 4, 5]
}
```

**Response:** `200 OK`
```json
{
  "message": "5 jobs deleted successfully",
  "deleted_count": 5
}
```

---

### Export Jobs

Export jobs data to CSV.

**Endpoint:** `GET /api/jobs/export`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- Same as list jobs endpoint for filtering

**Response:** `200 OK`
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="jobs-export-2024-01-20.csv"`

---

## Creative Endpoints

### List Creatives

Get all creatives for a job.

**Endpoint:** `GET /api/jobs/:jobId/creatives`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "creatives": [
    {
      "id": 1,
      "job_id": 1,
      "filename": "summer_sale_v1.mp4",
      "file_path": "uploads/user-1/job-1/summer_sale_v1.mp4",
      "file_size": 15728640,
      "file_type": "video/mp4",
      "status": "uploaded",
      "meta_creative_id": "12345678",
      "meta_ad_id": "87654321",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "duration": 30,
        "format": "mp4"
      },
      "variation_group": "summer_sale_v",
      "uploaded_at": "2024-01-20T10:05:00Z",
      "error_message": null
    }
  ]
}
```

---

## Google Drive Endpoints

### Connect Google Drive

Initiate OAuth flow to connect Google Drive.

**Endpoint:** `GET /api/google-drive/auth`

**Headers:** `Authorization: Bearer <token>`

**Response:** `302 Redirect`
- Redirects to Google OAuth consent screen

---

### OAuth Callback

Google Drive OAuth callback (handled automatically).

**Endpoint:** `GET /api/google-drive/callback`

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: CSRF token

---

### List Drive Files

List files from connected Google Drive.

**Endpoint:** `GET /api/google-drive/files`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `folder_id` (optional): Specific folder ID
- `search` (optional): Search query
- `mime_type` (optional): Filter by MIME type
- `page_token` (optional): Pagination token

**Response:** `200 OK`
```json
{
  "files": [
    {
      "id": "1abc...",
      "name": "campaign_video.mp4",
      "mimeType": "video/mp4",
      "size": 15728640,
      "thumbnailLink": "https://...",
      "webViewLink": "https://drive.google.com/...",
      "modifiedTime": "2024-01-20T10:00:00Z"
    }
  ],
  "nextPageToken": "token123"
}
```

---

### Download Drive File

Download a file from Google Drive for upload job.

**Endpoint:** `POST /api/google-drive/download`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "file_id": "1abc...",
  "job_id": 1
}
```

**Response:** `200 OK`
```json
{
  "message": "File downloaded successfully",
  "file": {
    "filename": "campaign_video.mp4",
    "size": 15728640,
    "path": "uploads/user-1/job-1/campaign_video.mp4"
  }
}
```

---

### Disconnect Google Drive

Disconnect Google Drive integration.

**Endpoint:** `DELETE /api/google-drive/disconnect`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Google Drive disconnected successfully"
}
```

---

## Team Endpoints

### List Team Members

Get all team members.

**Endpoint:** `GET /api/team`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "members": [
    {
      "id": 1,
      "user_id": 1,
      "member_user_id": 2,
      "member_email": "member@example.com",
      "member_name": "Team Member",
      "role": "editor",
      "permissions": {
        "can_create_jobs": true,
        "can_edit_templates": true,
        "can_delete_jobs": false,
        "can_manage_team": false
      },
      "invited_at": "2024-01-15T10:30:00Z",
      "joined_at": "2024-01-15T11:00:00Z",
      "status": "active"
    }
  ]
}
```

---

### Invite Team Member

Invite a new team member.

**Endpoint:** `POST /api/team/invite`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "role": "editor",
  "permissions": {
    "can_create_jobs": true,
    "can_edit_templates": true,
    "can_delete_jobs": false
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Team member invited successfully",
  "invitation": {
    "id": 1,
    "email": "newmember@example.com",
    "role": "editor",
    "status": "pending"
  }
}
```

---

### Update Team Member

Update team member role and permissions.

**Endpoint:** `PATCH /api/team/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "admin",
  "permissions": {
    "can_manage_team": true
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Team member updated successfully",
  "member": { ... }
}
```

---

### Remove Team Member

Remove a team member.

**Endpoint:** `DELETE /api/team/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Team member removed successfully"
}
```

---

## Activity Log Endpoints

### List Activity Logs

Get activity logs with filtering.

**Endpoint:** `GET /api/activity`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `action` (optional): Filter by action type
- `from_date` (optional): Filter from date
- `to_date` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "job_created",
      "details": {
        "job_id": 1,
        "campaign_name": "Summer Sale Campaign",
        "total_files": 25
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "pages": 10
  }
}
```

---

## Monitoring Endpoints

### Health Check

Check system health (public endpoint).

**Endpoint:** `GET /api/monitoring/health`

**Response:** `200 OK` (healthy) or `503 Service Unavailable` (unhealthy)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy",
    "cpu": "healthy"
  },
  "version": "1.0.0",
  "environment": "production"
}
```

---

### System Metrics

Get system performance metrics.

**Endpoint:** `GET /api/monitoring/metrics`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "timestamp": "2024-01-20T10:00:00Z",
  "uptime": 86400,
  "system": {
    "platform": "linux",
    "arch": "x64",
    "cpus": 4,
    "totalMemory": "16.00GB",
    "freeMemory": "8.50GB",
    "loadAverage": [0.5, 0.7, 0.6]
  },
  "process": {
    "pid": 1234,
    "version": "v18.17.0",
    "memoryUsage": {
      "rss": "150.25MB",
      "heapTotal": "120.50MB",
      "heapUsed": "95.75MB"
    }
  },
  "application": {
    "http_request_duration_ms": {
      "count": 15000,
      "min": 5,
      "max": 2500,
      "avg": 125,
      "p50": 100,
      "p95": 450,
      "p99": 850
    }
  },
  "database": {
    "connections": 10,
    "databaseSize": "2.5GB",
    "topTables": [...]
  },
  "redis": {
    "connected": true,
    "dbSize": 1250,
    "memory": "50MB"
  }
}
```

---

### Error Rate

Get error rate statistics.

**Endpoint:** `GET /api/monitoring/error-rate`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "errorRate": [
    {
      "hour": "2024-01-20T10:00:00Z",
      "error_count": 5,
      "total_count": 1000
    }
  ],
  "period": "24 hours"
}
```

---

### Report Frontend Errors

Receive error reports from frontend.

**Endpoint:** `POST /api/monitoring/errors`

**Request Body:**
```json
{
  "errors": [
    {
      "message": "TypeError: Cannot read property 'map' of undefined",
      "stack": "TypeError: Cannot read...\n    at Component...",
      "url": "http://localhost:5173/dashboard",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-20T10:00:00Z",
      "severity": "high",
      "context": {
        "viewport": {"width": 1920, "height": 1080}
      }
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "received": 1,
  "message": "Error reports received and logged"
}
```

---

### Report Performance Metrics

Receive performance metrics from frontend.

**Endpoint:** `POST /api/monitoring/performance`

**Request Body:**
```json
{
  "metric": "Component Render: Dashboard",
  "duration": 1250,
  "context": {
    "component": "Dashboard",
    "props_count": 5
  },
  "timestamp": "2024-01-20T10:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Performance metric received"
}
```

---

## Error Codes

Common HTTP status codes used:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

## Common Error Responses

### Validation Error

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Authentication Error

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Rate Limit Error

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in 15 minutes.",
  "retry_after": 900
}
```

## Webhooks

Meta Ads webhooks are supported for real-time updates. Configure webhook URL in your Meta App settings:

```
POST https://your-domain.com/api/webhooks/meta
```

Supported webhook events:
- Ad creative status updates
- Campaign delivery updates
- Billing events

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

// Create upload job
const createJob = async (files: File[], campaignName: string) => {
  const formData = new FormData();
  formData.append('ad_account_id', '1');
  formData.append('campaign_name', campaignName);
  files.forEach(file => formData.append('files', file));

  const response = await api.post('/api/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
};

// Get job status
const getJobStatus = async (jobId: number) => {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data.job;
};
```

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**List Jobs:**
```bash
curl -X GET http://localhost:3001/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Upload Job:**
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "ad_account_id=1" \
  -F "campaign_name=My Campaign" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.jpg"
```

---

## Pagination

List endpoints support pagination:

**Request:**
```
GET /api/jobs?page=2&limit=20
```

**Response:**
```json
{
  "jobs": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

**Request:**
```
GET /api/jobs?status=completed&sort=created_at&order=desc&search=summer
```

**Available filters:**
- `search` - Text search
- `status` - Filter by status
- `from_date` - Filter from date
- `to_date` - Filter to date
- `sort` - Sort field
- `order` - Sort order (asc/desc)

## File Upload Limits

- Maximum file size: 100MB (configurable via `MAX_FILE_SIZE`)
- Supported image formats: JPG, PNG, GIF, WEBP
- Supported video formats: MP4, MOV, AVI, MKV
- Maximum files per job: 1000

## Best Practices

1. **Always handle errors**: Check response status and handle errors appropriately
2. **Use pagination**: Don't fetch all records at once for large datasets
3. **Respect rate limits**: Implement exponential backoff for rate limit errors
4. **Validate before upload**: Check file sizes and formats client-side before uploading
5. **Poll job status**: Use polling with increasing intervals (1s, 2s, 5s, 10s, etc.)
6. **Keep tokens secure**: Never expose JWT tokens in client-side code or logs
7. **Use HTTPS**: Always use HTTPS in production to protect sensitive data

## Need Help?

- Check the [Features Guide](./features.md) for feature documentation
- Review [Design Decisions](./design-decisions.md) for architecture details
- See [Development Guide](./development.md) for development workflows
- Read [Quick Start](./quick-start.md) for getting started
