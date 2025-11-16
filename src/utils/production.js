/**
 * Production Utilities
 * Handles production-specific configurations and optimizations
 */

// Environment check utilities
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';

// Production-safe console logging
export const devLog = (...args) => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

export const devError = (...args) => {
  if (isDevelopment()) {
    console.error(...args);
  }
};

export const devWarn = (...args) => {
  if (isDevelopment()) {
    console.warn(...args);
  }
};

// Performance optimization utilities
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory leak prevention
export const cleanupTimer = (timerId) => {
  if (timerId) {
    clearTimeout(timerId);
    clearInterval(timerId);
  }
};

// Production error reporter
export const reportError = (error, context = {}) => {
  if (isProduction()) {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     error: error.message,
    //     stack: error.stack,
    //     context,
    //     timestamp: new Date().toISOString(),
    //     userAgent: navigator.userAgent,
    //     url: window.location.href
    //   })
    // });
  } else {
    console.error('Production Error:', error, context);
  }
};

// Safe async function wrapper
export const safeAsync = (asyncFn, fallback = null) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      reportError(error, { function: asyncFn.name, args });
      return fallback;
    }
  };
};

// Component display name for production debugging
export const withDisplayName = (Component, name) => {
  Component.displayName = name;
  return Component;
};

// Production build checks
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID'
  ];

  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0 && isProduction()) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
};

export default {
  isDevelopment,
  isProduction,
  devLog,
  devError,
  devWarn,
  debounce,
  throttle,
  cleanupTimer,
  reportError,
  safeAsync,
  withDisplayName,
  validateEnvironment
};