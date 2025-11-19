import logger from '../config/logger';

/**
 * Database query monitoring
 * Logs slow queries and errors
 */
export class DatabaseMonitor {
  static logQuery(query: string, duration: number, params?: any[]) {
    const logData = {
      query: query.substring(0, 200), // Truncate long queries
      duration: `${duration}ms`,
      params: params?.length || 0,
    };

    if (duration > 1000) {
      logger.warn('Slow database query detected', logData);
    } else {
      logger.debug('Database query executed', logData);
    }
  }

  static logQueryError(query: string, error: any, params?: any[]) {
    logger.error('Database query error', {
      query: query.substring(0, 200),
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
      },
      params: params?.length || 0,
    });
  }
}

/**
 * External API monitoring
 * Tracks calls to Meta API, Google Drive, etc.
 */
export class APIMonitor {
  static logAPICall(
    service: string,
    endpoint: string,
    method: string,
    duration: number,
    statusCode?: number
  ) {
    const logData = {
      service,
      endpoint,
      method,
      duration: `${duration}ms`,
      statusCode,
    };

    if (statusCode && statusCode >= 400) {
      logger.error(`${service} API error`, logData);
    } else if (duration > 3000) {
      logger.warn(`Slow ${service} API call`, logData);
    } else {
      logger.info(`${service} API call`, logData);
    }
  }

  static logAPIError(service: string, endpoint: string, error: any) {
    logger.error(`${service} API error`, {
      service,
      endpoint,
      error: {
        message: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      },
    });
  }
}

/**
 * Job queue monitoring
 * Tracks job processing performance
 */
export class JobMonitor {
  static logJobStart(jobId: number, jobType: string) {
    logger.info('Job started', {
      jobId,
      jobType,
      timestamp: new Date().toISOString(),
    });
  }

  static logJobProgress(jobId: number, progress: { completed: number; total: number; percentage: number }) {
    logger.debug('Job progress update', {
      jobId,
      completed: progress.completed,
      total: progress.total,
      percentage: `${progress.percentage}%`,
    });
  }

  static logJobComplete(jobId: number, duration: number, result: { completed: number; failed: number }) {
    logger.info('Job completed', {
      jobId,
      duration: `${duration}ms`,
      totalAds: result.completed + result.failed,
      completedAds: result.completed,
      failedAds: result.failed,
      successRate: `${((result.completed / (result.completed + result.failed)) * 100).toFixed(2)}%`,
    });
  }

  static logJobError(jobId: number, error: any, context?: any) {
    logger.error('Job error', {
      jobId,
      error: {
        message: error.message,
        stack: error.stack,
      },
      context,
    });
  }
}

/**
 * Business logic monitoring
 * Track important business events
 */
export class BusinessMonitor {
  static logUserAction(userId: number, action: string, resource: string, resourceId?: number) {
    logger.info('User action', {
      userId,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
    });
  }

  static logAuthEvent(event: string, userId?: number, email?: string, success: boolean = true) {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication event', {
      event,
      userId,
      email,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  static logSecurityEvent(event: string, details: any) {
    logger.warn('Security event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Performance metrics collector
 */
export class MetricsCollector {
  private static metrics: Map<string, number[]> = new Map();

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 1000 values
    const values = this.metrics.get(name)!;
    if (values.length > 1000) {
      values.shift();
    }
  }

  static getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  static getAllMetrics() {
    const result: any = {};
    for (const [name, _] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }
}

/**
 * File processing monitoring
 */
export class FileMonitor {
  static logFileProcessing(filename: string, fileType: string, size: number, duration: number) {
    logger.info('File processed', {
      filename,
      fileType,
      size: `${(size / 1024 / 1024).toFixed(2)}MB`,
      duration: `${duration}ms`,
      processingSpeed: `${((size / 1024 / 1024) / (duration / 1000)).toFixed(2)}MB/s`,
    });
  }

  static logFileError(filename: string, error: any) {
    logger.error('File processing error', {
      filename,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
}
