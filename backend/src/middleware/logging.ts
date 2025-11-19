import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Request logging middleware
 * Logs all incoming requests with unique ID for tracing
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID for tracing
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    body: sanitizeBody(req.body),
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - (req.startTime || 0);

    logger.info('Outgoing response', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      userId: (req as any).user?.id,
    });

    // Log slow requests (>2 seconds)
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: any): any {
  if (!body) return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'access_token', 'refresh_token'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Error logging middleware
 * Captures and logs all errors with full context
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode,
    },
    userId: (req as any).user?.id,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
  });

  next(err);
};

/**
 * Performance monitoring middleware
 * Tracks response times and logs metrics
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = `${req.method} ${req.route?.path || req.path}`;

    // Log performance metrics
    logger.debug('Performance metric', {
      requestId: req.requestId,
      route,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      method: req.method,
      path: req.path,
    });

    // Alert on very slow requests (>5 seconds)
    if (duration > 5000) {
      logger.error('Very slow request detected', {
        requestId: req.requestId,
        route,
        duration: `${duration}ms`,
        method: req.method,
        path: req.path,
      });
    }
  });

  next();
};
