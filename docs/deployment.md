# Deployment Guide

Production deployment guide for AdsUploader.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Deployment Options](#deployment-options)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Security Hardening](#security-hardening)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling](#scaling)
- [CI/CD Pipeline](#cicd-pipeline)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Security
- [ ] All default passwords changed
- [ ] JWT_SECRET is a strong, random value (minimum 64 characters)
- [ ] Database credentials are secure
- [ ] Meta API credentials are properly configured
- [ ] Google Drive API credentials are properly configured
- [ ] CORS origins are restricted to your domain(s)
- [ ] Rate limiting is configured
- [ ] SSL/TLS certificates are obtained and configured
- [ ] Sensitive data is not logged
- [ ] Environment variables are not committed to git

### Performance
- [ ] Database indexes are created
- [ ] Redis is configured and running
- [ ] File upload limits are set appropriately
- [ ] Static assets are minified and compressed
- [ ] CDN is configured (optional but recommended)

### Monitoring
- [ ] Log aggregation is configured
- [ ] Error tracking is set up
- [ ] Performance monitoring is enabled
- [ ] Health check endpoints are working
- [ ] Alerts are configured

### Testing
- [ ] All tests are passing
- [ ] Integration tests completed successfully
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Meta API integration tested with real account

### Documentation
- [ ] API documentation is up to date
- [ ] Deployment runbook is prepared
- [ ] Rollback procedure is documented
- [ ] Team is trained on new features

## Infrastructure Requirements

### Minimum Requirements

**Application Server:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS or similar

**Database Server:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 100GB SSD (expandable)
- PostgreSQL 14+

**Cache Server:**
- CPU: 1 core
- RAM: 2GB
- Redis 6+

### Recommended for Production

**Application Server (per instance):**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- OS: Ubuntu 22.04 LTS

**Database Server:**
- CPU: 4 cores
- RAM: 16GB
- Storage: 500GB SSD with automatic backups
- PostgreSQL 14+ with replication

**Cache Server:**
- CPU: 2 cores
- RAM: 4GB
- Redis 6+ with persistence

**Load Balancer:**
- Nginx or AWS ALB
- SSL termination
- Health checks enabled

## Deployment Options

### Option 1: Traditional VPS/Server

**Providers:** DigitalOcean, Linode, Vultr, AWS EC2

**Pros:**
- Full control
- Predictable costs
- Simple architecture

**Cons:**
- Manual scaling
- Requires DevOps knowledge
- Manual updates and patches

### Option 2: Platform as a Service (PaaS)

**Providers:** Heroku, Render, Railway, DigitalOcean App Platform

**Pros:**
- Easy deployment
- Auto-scaling
- Managed databases
- Zero-downtime deploys

**Cons:**
- Higher cost
- Less control
- Potential vendor lock-in

### Option 3: Containerized (Docker)

**Providers:** AWS ECS, Google Cloud Run, Azure Container Instances

**Pros:**
- Consistent environments
- Easy scaling
- Better resource utilization

**Cons:**
- Container orchestration complexity
- Learning curve

### Option 4: Kubernetes

**Providers:** AWS EKS, Google GKE, Azure AKS

**Pros:**
- Auto-scaling
- Self-healing
- Rolling updates
- Best for large scale

**Cons:**
- High complexity
- Requires dedicated DevOps
- Overkill for small deployments

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```bash
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=adsuploader_prod
DB_PASSWORD=strong_random_password_here
DB_NAME=adsuploader_prod
DB_SSL=true
DB_MAX_CONNECTIONS=20

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password
REDIS_TLS=true

# Authentication
JWT_SECRET=very_long_random_string_minimum_64_characters_for_production_security
JWT_EXPIRATION=7d

# Meta API
META_APP_ID=your_production_meta_app_id
META_APP_SECRET=your_production_meta_app_secret
META_API_VERSION=v18.0

# Google Drive API
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-drive/callback

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_DIR=/var/adsuploader/uploads

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/adsuploader

# Monitoring
SENTRY_DSN=your_sentry_dsn_if_using_sentry
```

**Frontend (.env.production):**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_ENVIRONMENT=production
```

### Generating Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate random password
openssl rand -base64 32
```

## Database Setup

### Production Database Configuration

**1. Create production database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create user
CREATE USER adsuploader_prod WITH PASSWORD 'strong_password';

# Create database
CREATE DATABASE adsuploader_prod OWNER adsuploader_prod;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE adsuploader_prod TO adsuploader_prod;
```

**2. Configure PostgreSQL for production:**

Edit `/etc/postgresql/14/main/postgresql.conf`:
```conf
# Connection Settings
max_connections = 100
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# Security
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
```

**3. Run migrations:**
```bash
cd backend
NODE_ENV=production npm run migrate:up
```

**4. Create indexes:**
```sql
-- Add indexes for performance
CREATE INDEX idx_upload_jobs_user_id ON upload_jobs(user_id);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);
CREATE INDEX idx_upload_jobs_created_at ON upload_jobs(created_at DESC);
CREATE INDEX idx_creatives_job_id ON creatives(job_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

## Security Hardening

### Server Security

**1. Firewall configuration:**
```bash
# Install UFW
sudo apt-get install ufw

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

**2. Automatic security updates:**
```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

**3. Fail2ban for brute-force protection:**
```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Application Security

**1. Helmet.js security headers:**

Already configured in `backend/src/server.ts`, verify settings:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://graph.facebook.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**2. CORS configuration:**
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
}));
```

**3. Rate limiting:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

**4. File upload security:**
```typescript
// Validate file types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Validate file size
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '104857600');

// Sanitize filenames
const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};
```

## SSL/TLS Configuration

### Option 1: Let's Encrypt (Free)

**Using Certbot:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Option 2: Nginx Reverse Proxy

**Nginx configuration (`/etc/nginx/sites-available/adsuploader`):**
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server - Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend static files
    root /var/www/adsuploader/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}

# HTTPS server - Backend API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;

        # Increase max body size for file uploads
        client_max_body_size 100M;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/adsuploader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Logging

### Log Aggregation

**Option 1: File-based logging with rotation:**

Install logrotate configuration:
```bash
# /etc/logrotate.d/adsuploader
/var/log/adsuploader/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload adsuploader
    endscript
}
```

**Option 2: Centralized logging (recommended):**

**Using ELK Stack (Elasticsearch, Logstash, Kibana):**
```bash
# Install Filebeat
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt-get update && sudo apt-get install filebeat

# Configure Filebeat
sudo nano /etc/filebeat/filebeat.yml
```

**filebeat.yml:**
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/adsuploader/*.log
  json.keys_under_root: true
  json.add_error_key: true

output.elasticsearch:
  hosts: ["your-elasticsearch-host:9200"]
  username: "elastic"
  password: "your-password"

setup.kibana:
  host: "your-kibana-host:5601"
```

### Application Performance Monitoring

**Using PM2 for Node.js monitoring:**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name adsuploader-backend

# Enable monitoring
pm2 monitor

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

**PM2 ecosystem config (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'adsuploader-backend',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/adsuploader/pm2-error.log',
    out_file: '/var/log/adsuploader/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],
};
```

### Health Check Monitoring

**Setup monitoring with Uptime Robot, Pingdom, or custom:**

```bash
# Create health check script
# /usr/local/bin/check-adsuploader-health.sh

#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/monitoring/health)

if [ $RESPONSE != "200" ]; then
    echo "Health check failed with status: $RESPONSE"
    # Send alert (email, Slack, PagerDuty, etc.)
    # Restart service if needed
    systemctl restart adsuploader
fi
```

**Add to crontab:**
```bash
# Run health check every 5 minutes
*/5 * * * * /usr/local/bin/check-adsuploader-health.sh
```

### Error Tracking

**Using Sentry (recommended):**

```bash
npm install @sentry/node @sentry/tracing
```

**Initialize Sentry in backend:**
```typescript
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
});

// Add request handler
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add error handler (before other error handlers)
app.use(Sentry.Handlers.errorHandler());
```

## Backup and Recovery

### Database Backups

**Automated daily backups:**
```bash
# /usr/local/bin/backup-adsuploader-db.sh

#!/bin/bash
BACKUP_DIR="/var/backups/adsuploader"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="adsuploader_prod"
DB_USER="adsuploader_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -F c -b -v -f "$BACKUP_DIR/backup_$TIMESTAMP.dump" $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.dump"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.dump.gz" s3://your-backup-bucket/database/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.dump.gz"
```

**Add to crontab:**
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-adsuploader-db.sh
```

### Restore from Backup

```bash
# List available backups
ls -lh /var/backups/adsuploader/

# Restore from backup
gunzip backup_20240120_020000.dump.gz
pg_restore -U adsuploader_prod -d adsuploader_prod -c backup_20240120_020000.dump
```

### File Backups

**Backup uploaded files:**
```bash
# /usr/local/bin/backup-adsuploader-files.sh

#!/bin/bash
BACKUP_DIR="/var/backups/adsuploader/files"
UPLOAD_DIR="/var/adsuploader/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C $UPLOAD_DIR .

# Upload to S3
aws s3 cp "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" s3://your-backup-bucket/uploads/

# Keep only last 7 days of file backups
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
```

## Scaling

### Vertical Scaling

**Increase server resources:**
- Upgrade CPU and RAM
- Add more storage
- Use faster SSD storage

**Database optimization:**
```sql
-- Analyze tables for better query planning
ANALYZE;

-- Vacuum to reclaim space
VACUUM ANALYZE;

-- Create materialized views for complex queries
CREATE MATERIALIZED VIEW job_stats AS
SELECT
  user_id,
  COUNT(*) as total_jobs,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_jobs,
  SUM(total_files) as total_files_processed
FROM upload_jobs
GROUP BY user_id;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW job_stats;
```

### Horizontal Scaling

**Load balancing with multiple app servers:**

**Nginx load balancer configuration:**
```nginx
upstream adsuploader_backend {
    least_conn;
    server 10.0.1.10:3001;
    server 10.0.1.11:3001;
    server 10.0.1.12:3001;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://adsuploader_backend;
        # ... other proxy settings
    }
}
```

**Session persistence:**
Since we use JWT tokens, no session store is needed. Tokens work across all instances.

**Shared file storage:**
- Use S3, Google Cloud Storage, or Azure Blob Storage
- Mount shared NFS volume across instances
- Use distributed file system

### Database Scaling

**Read replicas for heavy read workloads:**
```typescript
// Use read replica for queries
const readPool = new Pool({
  host: process.env.DB_READ_HOST,
  // ... other config
});

const writePool = new Pool({
  host: process.env.DB_WRITE_HOST,
  // ... other config
});

// Read operations
const jobs = await readPool.query('SELECT * FROM upload_jobs WHERE user_id = $1', [userId]);

// Write operations
const result = await writePool.query('INSERT INTO upload_jobs ...');
```

**Connection pooling:**
```typescript
const pool = new Pool({
  max: 20, // Maximum connections
  min: 5,  // Minimum connections
  idle: 10000, // Idle timeout
  connectionTimeoutMillis: 2000,
});
```

### Redis Clustering

**For high availability:**
```bash
# Redis Sentinel for automatic failover
# Or use Redis Cluster for data sharding
```

## CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test

      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to server
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          SERVER_USER: ${{ secrets.SERVER_USER }}
        run: |
          echo "$SSH_PRIVATE_KEY" > deploy_key
          chmod 600 deploy_key

          ssh -i deploy_key -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST << 'EOF'
            cd /var/www/adsuploader
            git pull origin main
            cd backend && npm install --production && npm run build
            cd ../frontend && npm install && npm run build
            pm2 restart adsuploader-backend
            sudo systemctl reload nginx
          EOF

          rm deploy_key
```

## Maintenance

### Regular Tasks

**Daily:**
- [ ] Check error logs
- [ ] Monitor system health
- [ ] Check disk space
- [ ] Verify backups completed

**Weekly:**
- [ ] Review performance metrics
- [ ] Check for slow queries
- [ ] Review security logs
- [ ] Update dependencies (after testing)

**Monthly:**
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Review and rotate logs
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Test backup restoration

### Database Maintenance

```sql
-- Weekly maintenance
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE adsuploader_prod;

-- Check for bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update minor/patch versions
npm update

# For major updates, test thoroughly
npm install package@latest

# Test before deploying
npm test
npm run build
```

## Troubleshooting

### High CPU Usage

```bash
# Check process CPU usage
top

# Check Node.js process
pm2 monit

# Analyze with profiling
node --prof dist/server.js
```

### High Memory Usage

```bash
# Check memory usage
free -h

# Check Node.js heap usage
pm2 monit

# Take heap snapshot
node --inspect dist/server.js
```

### Database Connection Issues

```bash
# Check connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '1 hour';
```

### Slow Database Queries

```sql
-- Enable query logging
ALTER DATABASE adsuploader_prod SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Find large files
du -h /var/adsuploader/uploads | sort -rh | head -20

# Clean old logs
find /var/log/adsuploader -name "*.log" -mtime +30 -delete

# Clean old uploads (if applicable)
find /var/adsuploader/uploads -mtime +90 -delete
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Rollback Procedure

If deployment fails:

1. **Identify the issue**
   ```bash
   # Check logs
   pm2 logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Rollback code**
   ```bash
   cd /var/www/adsuploader
   git log  # Find previous working commit
   git checkout <previous-commit-hash>
   ```

3. **Rebuild and restart**
   ```bash
   cd backend && npm install && npm run build
   pm2 restart adsuploader-backend
   ```

4. **Rollback database** (if migrations were run)
   ```bash
   npm run migrate:down
   ```

5. **Verify system**
   ```bash
   curl https://api.yourdomain.com/api/monitoring/health
   ```

## Next Steps

After successful deployment:
- Monitor logs and metrics closely for first 24 hours
- Test all critical features
- Verify backups are working
- Document any deployment-specific configurations
- Train team on monitoring and troubleshooting

## Support

For deployment issues:
- Check [Troubleshooting](#troubleshooting) section
- Review application logs
- Check monitoring dashboards
- Consult [Development Guide](./development.md) for debugging tips
