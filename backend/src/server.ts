import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import configuration
import { pool } from './config/database';
import { redis } from './config/redis';
import logger from './config/logger';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { requestLogger, errorLogger, performanceMonitor } from './middleware/logging';

// Import routes
import authRoutes from './routes/auth';
import adAccountRoutes from './routes/adAccounts';
import templateRoutes from './routes/templates';
import uploadRoutes from './routes/uploads';
import jobRoutes from './routes/jobs';
import googleDriveRoutes from './routes/googleDrive';
import teamRoutes from './routes/team';
import monitoringRoutes from './routes/monitoring';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression middleware
app.use(compression());

// Request logging and tracing middleware
app.use(requestLogger);
app.use(performanceMonitor);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting
app.use('/api', apiLimiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    // Check Redis connection
    await redis.ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'AdsUploader API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      adAccounts: '/api/ad-accounts',
      templates: '/api/templates',
      uploads: '/api/uploads',
      jobs: '/api/jobs',
    },
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ad-accounts', adAccountRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/google-drive', googleDriveRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/monitoring', monitoringRoutes);

// 404 handler
app.use(notFoundHandler);

// Error logging middleware
app.use(errorLogger);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📝 API documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing gracefully...');

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await pool.end();
      logger.info('Database connection pool closed');

      await redis.quit();
      logger.info('Redis connection closed');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
