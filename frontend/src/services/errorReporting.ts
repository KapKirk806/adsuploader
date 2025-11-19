import { api } from './api';

/**
 * Frontend error reporting service
 * Captures errors and sends them to backend for monitoring
 */

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

class ErrorReportingService {
  private queue: ErrorReport[] = [];
  private isSending: boolean = false;
  private maxQueueSize: number = 50;

  /**
   * Report an error to the backend
   */
  async reportError(error: Error, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', context?: Record<string, any>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity,
      context: {
        ...context,
        // Include useful browser context
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
      },
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorReporting]', report);
    }

    // Add to queue
    this.queue.push(report);

    // Limit queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }

    // Send immediately for critical errors
    if (severity === 'critical') {
      await this.flush();
    } else {
      // Otherwise batch send
      this.scheduleSend();
    }
  }

  /**
   * Report a React component error
   */
  async reportComponentError(error: Error, errorInfo: { componentStack?: string }, context?: Record<string, any>) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: 'high',
      context,
    };

    console.error('[ComponentError]', report);

    this.queue.push(report);
    await this.flush();
  }

  /**
   * Report an API error
   */
  async reportAPIError(endpoint: string, method: string, error: any, context?: Record<string, any>) {
    const report: ErrorReport = {
      message: `API Error: ${method} ${endpoint}`,
      stack: error.stack || new Error().stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      severity: error.response?.status >= 500 ? 'high' : 'medium',
      context: {
        ...context,
        api: {
          endpoint,
          method,
          statusCode: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
        },
      },
    };

    console.error('[APIError]', report);

    this.queue.push(report);
    this.scheduleSend();
  }

  /**
   * Schedule a batch send of errors
   */
  private scheduleSend() {
    if (!this.isSending && this.queue.length > 0) {
      setTimeout(() => {
        this.flush();
      }, 5000); // Send after 5 seconds
    }
  }

  /**
   * Flush the error queue to backend
   */
  private async flush() {
    if (this.isSending || this.queue.length === 0) {
      return;
    }

    this.isSending = true;
    const errorsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send to backend
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ errors: errorsToSend }),
      });
    } catch (error) {
      // If sending fails, put errors back in queue
      console.error('[ErrorReporting] Failed to send errors:', error);
      this.queue.unshift(...errorsToSend);
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Get queue size for debugging
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const errorReporting = new ErrorReportingService();

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandling() {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReporting.reportError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      'high',
      {
        reason: event.reason,
        promise: 'unhandled',
      }
    );
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    errorReporting.reportError(
      event.error || new Error(event.message),
      'medium',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  // Log when user leaves page (flush pending errors)
  window.addEventListener('beforeunload', () => {
    errorReporting['flush']();
  });
}

/**
 * Performance monitoring
 */
export function logPerformanceMetric(name: string, duration: number, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration}ms`, context);
  }

  // Send to backend for aggregation
  fetch('/api/monitoring/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify({
      metric: name,
      duration,
      context,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error);
}

/**
 * Custom hook for tracking component render time
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    if (duration > 1000) {
      // Log slow renders (>1s)
      logPerformanceMetric(`Component Render: ${componentName}`, duration);
    }
  };
}
