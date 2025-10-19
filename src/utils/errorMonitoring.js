/**
 * Error Monitoring and Logging System
 * Provides comprehensive error tracking and reporting
 */

class ErrorMonitor {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // React error boundary fallback
    this.setupReactErrorHandler();

    this.initialized = true;
    console.log('✅ Error monitoring initialized');
  }

  setupReactErrorHandler() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if it's a React error
      if (args[0]?.includes?.('React') || args[0]?.includes?.('Component')) {
        this.logError({
          type: 'React Error',
          message: args.join(' '),
          timestamp: new Date().toISOString()
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  logError(error) {
    this.errors.push(error);
    
    // Keep only last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Logged:', error);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(error);
    }
  }

  reportToService(error) {
    // Placeholder for external error tracking service (Sentry, LogRocket, etc.)
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(error)
    // });
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      recent: this.errors.slice(-10)
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
const errorMonitor = new ErrorMonitor();

export default errorMonitor;
