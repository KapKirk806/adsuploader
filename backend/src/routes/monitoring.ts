import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import { MetricsCollector } from '../utils/monitoring';
import logger from '../config/logger';
import os from 'os';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Health check endpoint
 * Returns status of all services
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        redis: 'unknown',
        memory: 'unknown',
        cpu: 'unknown',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Check database
    try {
      await pool.query('SELECT 1');
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
      logger.error('Database health check failed', { error });
    }

    // Check Redis
    try {
      await redis.ping();
      health.services.redis = 'healthy';
    } catch (error) {
      health.services.redis = 'unhealthy';
      health.status = 'degraded';
      logger.error('Redis health check failed', { error });
    }

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    health.services.memory = memoryUsagePercent < 90 ? 'healthy' : 'warning';

    // CPU usage
    const cpuUsage = process.cpuUsage();
    health.services.cpu = 'healthy'; // Simplified for now

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error', { error });
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Metrics endpoint (requires authentication)
 * Returns performance metrics
 */
router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),

      // System metrics
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)}GB`,
        loadAverage: os.loadavg(),
      },

      // Process metrics
      process: {
        pid: process.pid,
        version: process.version,
        memoryUsage: {
          rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
          external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)}MB`,
        },
        cpuUsage: process.cpuUsage(),
      },

      // Application metrics
      application: MetricsCollector.getAllMetrics(),

      // Database stats
      database: await getDatabaseStats(),

      // Redis stats
      redis: await getRedisStats(),
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error', { error });
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Logs endpoint (requires authentication)
 * Returns recent logs
 */
router.get('/logs', authenticate, async (req: Request, res: Response) => {
  try {
    const { level = 'all', limit = 100 } = req.query;

    // In production, this would query a log aggregation service
    // For now, return a message about log location
    res.json({
      message: 'Logs are written to console and files',
      logLocation: process.env.LOG_DIR || './logs',
      levels: ['error', 'warn', 'info', 'debug'],
      requestedLevel: level,
      limit: Number(limit),
      note: 'In production, integrate with log aggregation service like ELK, Datadog, or Papertrail',
    });
  } catch (error) {
    logger.error('Logs endpoint error', { error });
    res.status(500).json({
      error: 'Failed to fetch logs',
    });
  }
});

/**
 * Error rate endpoint
 */
router.get('/error-rate', authenticate, async (req: Request, res: Response) => {
  try {
    // Query recent errors from activity logs
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE action LIKE '%error%' OR action = 'failed') as error_count,
        COUNT(*) as total_count,
        date_trunc('hour', created_at) as hour
      FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY hour
      ORDER BY hour DESC
    `);

    res.json({
      errorRate: result.rows,
      period: '24 hours',
    });
  } catch (error) {
    logger.error('Error rate endpoint error', { error });
    res.status(500).json({
      error: 'Failed to calculate error rate',
    });
  }
});

/**
 * Frontend error reporting endpoint
 * Receives error reports from frontend clients
 */
router.post('/errors', async (req: Request, res: Response) => {
  try {
    const { errors } = req.body;

    if (!Array.isArray(errors)) {
      return res.status(400).json({
        error: 'Invalid request format. Expected { errors: [...] }',
      });
    }

    // Log each error with appropriate severity
    for (const error of errors) {
      const logLevel = error.severity === 'critical' || error.severity === 'high' ? 'error' : 'warn';

      logger[logLevel]('Frontend error reported', {
        message: error.message,
        stack: error.stack,
        componentStack: error.componentStack,
        url: error.url,
        userAgent: error.userAgent,
        timestamp: error.timestamp,
        severity: error.severity,
        userId: error.userId,
        context: error.context,
        requestId: (req as any).requestId,
      });

      // Store critical errors in activity log for tracking
      if (error.severity === 'critical' || error.severity === 'high') {
        try {
          await pool.query(
            `INSERT INTO activity_logs (user_id, action, details, ip_address)
             VALUES ($1, $2, $3, $4)`,
            [
              error.userId || null,
              'frontend_error',
              JSON.stringify({
                message: error.message,
                url: error.url,
                severity: error.severity,
                stack: error.stack?.substring(0, 500), // Truncate long stacks
              }),
              req.ip,
            ]
          );
        } catch (dbError) {
          logger.error('Failed to log frontend error to database', { dbError });
        }
      }
    }

    res.status(200).json({
      success: true,
      received: errors.length,
      message: 'Error reports received and logged',
    });
  } catch (error) {
    logger.error('Error reporting endpoint error', { error });
    res.status(500).json({
      error: 'Failed to process error reports',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Frontend performance metrics endpoint
 * Receives performance data from frontend clients
 */
router.post('/performance', async (req: Request, res: Response) => {
  try {
    const { metric, duration, context, timestamp } = req.body;

    if (!metric || typeof duration !== 'number') {
      return res.status(400).json({
        error: 'Invalid request format. Expected { metric: string, duration: number }',
      });
    }

    // Log performance metric
    logger.info('Frontend performance metric', {
      metric,
      duration: `${duration}ms`,
      timestamp,
      context,
      requestId: (req as any).requestId,
    });

    // Track in metrics collector
    MetricsCollector.recordMetric(metric, duration);

    // Log slow metrics as warnings
    if (duration > 3000) {
      logger.warn('Slow frontend operation detected', {
        metric,
        duration: `${duration}ms`,
        context,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Performance metric received',
    });
  } catch (error) {
    logger.error('Performance metric endpoint error', { error });
    res.status(500).json({
      error: 'Failed to process performance metric',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get database statistics
 */
async function getDatabaseStats() {
  try {
    const connectionResult = await pool.query('SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()');
    const sizeResult = await pool.query("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
    const tableStatsResult = await pool.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `);

    return {
      connections: connectionResult.rows[0].count,
      databaseSize: sizeResult.rows[0].size,
      topTables: tableStatsResult.rows,
    };
  } catch (error) {
    logger.error('Failed to get database stats', { error });
    return { error: 'Failed to fetch stats' };
  }
}

/**
 * Get Redis statistics
 */
async function getRedisStats() {
  try {
    const info = await redis.info();
    const dbSize = await redis.dbsize();

    return {
      connected: true,
      dbSize,
      memory: info.match(/used_memory_human:(.*)/)?.[1] || 'unknown',
      uptime: info.match(/uptime_in_seconds:(.*)/)?.[1] || 'unknown',
    };
  } catch (error) {
    logger.error('Failed to get Redis stats', { error });
    return { connected: false, error: 'Failed to fetch stats' };
  }
}

export default router;
