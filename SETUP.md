# Setup Guide

Detailed setup instructions for AdsUploader.

## Quick Start (Development)

### 1. Install Prerequisites

**macOS:**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis

# Install FFmpeg
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql

# Install Redis
sudo apt-get install -y redis-server
sudo systemctl start redis

# Install FFmpeg
sudo apt-get install -y ffmpeg
```

**Windows:**
```bash
# Install using Chocolatey
choco install nodejs postgresql redis ffmpeg
```

### 2. Database Setup

```bash
# Create database
createdb adsuploader

# Or if using sudo
sudo -u postgres createdb adsuploader

# Run migrations
psql -d adsuploader -f backend/migrations/001_initial_schema.sql

# Verify tables
psql -d adsuploader -c "\dt"
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor

# Run in development mode
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
✅ Redis connected successfully
⚠️  Meta API running in MOCK MODE (no credentials configured)
🚀 Server running on port 5000 in development mode
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Test the Application

1. Open browser to `http://localhost:3000`
2. Navigate to Dashboard
3. Go to Upload page
4. Try uploading some test images
5. Check Jobs page to see progress

## Production Setup

### 1. Environment Configuration

Create production `.env` files:

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@your-db-host:5432/adsuploader
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=your-very-secure-random-secret
FACEBOOK_APP_ID=your-real-facebook-app-id
FACEBOOK_APP_SECRET=your-real-facebook-app-secret
```

### 2. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 3. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/server.js --name adsuploader-api

# Serve frontend (with nginx recommended)
# Or use serve
npm install -g serve
pm2 start "serve -s dist -l 3000" --name adsuploader-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4. Nginx Configuration (Recommended)

Create `/etc/nginx/sites-available/adsuploader`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/adsuploader/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Enable and restart nginx:
```bash
sudo ln -s /etc/nginx/sites-available/adsuploader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Meta API Setup (Production)

### 1. Create Facebook App

1. Go to https://developers.facebook.com/
2. Create a new app
3. Add "Marketing API" product
4. Get App ID and App Secret
5. Configure OAuth redirect URI: `https://your-domain.com/api/auth/facebook/callback`

### 2. Request Permissions

Required permissions:
- `ads_management`
- `ads_read`
- `business_management`

### 3. App Review

Submit app for review to get advanced access to Marketing API.

### 4. Update Environment

Add to `.env`:
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=https://your-domain.com/api/auth/facebook/callback
```

## Database Backups

### Automated Backups

Create backup script `/usr/local/bin/backup-adsuploader.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/adsuploader"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump adsuploader > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /path/to/adsuploader/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /usr/local/bin/backup-adsuploader.sh
crontab -e

# Add line:
0 2 * * * /usr/local/bin/backup-adsuploader.sh
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs adsuploader-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Application Logs

Logs are stored in `backend/logs/`:
- `error.log` - Error logs
- `combined.log` - All logs

## Troubleshooting

### Database Connection Errors

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -d adsuploader -c "SELECT 1"

# Reset password if needed
sudo -u postgres psql
ALTER USER your_user WITH PASSWORD 'new_password';
```

### Redis Connection Errors

```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
# Should return PONG
```

### File Upload Errors

```bash
# Check upload directory permissions
chmod 755 backend/uploads
chown -R your-user:your-group backend/uploads

# Check disk space
df -h
```

### FFmpeg Not Found

```bash
# Verify FFmpeg installation
which ffmpeg
ffmpeg -version

# Reinstall if needed
# macOS: brew reinstall ffmpeg
# Linux: sudo apt-get install --reinstall ffmpeg
```

## Performance Tuning

### PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
maintenance_work_mem = 128MB
```

Restart: `sudo systemctl restart postgresql`

### Redis

Edit `/etc/redis/redis.conf`:

```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

Restart: `sudo systemctl restart redis`

### Node.js

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" pm2 start dist/server.js
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ random characters)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (allow only 80, 443)
- [ ] Set up regular backups
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Set up monitoring alerts

## Support

If you encounter issues:

1. Check logs: `pm2 logs` and `backend/logs/`
2. Verify all services are running
3. Check GitHub issues
4. Create a new issue with error details
