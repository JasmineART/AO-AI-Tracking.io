/**
 * Security Utilities for Input Validation and Sanitization
 * Protects against XSS, SQL Injection, and other common attacks
 */

// ===== INPUT VALIDATION =====

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return typeof email === 'string' && emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate string length
 */
export const isValidLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate URL format
 */
export const isValidURL = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate phone number (flexible format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return typeof phone === 'string' && phoneRegex.test(phone) && phone.length <= 20;
};

/**
 * Validate alphanumeric with specific allowed characters
 */
export const isAlphanumeric = (str, allowSpaces = false, allowDashes = false) => {
  let regex = /^[a-zA-Z0-9]+$/;
  if (allowSpaces && allowDashes) {
    regex = /^[a-zA-Z0-9\s-]+$/;
  } else if (allowSpaces) {
    regex = /^[a-zA-Z0-9\s]+$/;
  } else if (allowDashes) {
    regex = /^[a-zA-Z0-9-]+$/;
  }
  return typeof str === 'string' && regex.test(str);
};

/**
 * Validate number within range
 */
export const isValidNumber = (num, min = -Infinity, max = Infinity) => {
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  return typeof parsed === 'number' && !isNaN(parsed) && parsed >= min && parsed <= max;
};

// ===== INPUT SANITIZATION =====

/**
 * Sanitize string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize HTML by escaping dangerous characters
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Limit length
};

// ===== CONTENT SECURITY =====

/**
 * Check for potential SQL injection patterns
 */
export const containsSQLInjection = (str) => {
  if (typeof str !== 'string') return false;
  
  const sqlPatterns = [
    /(\bOR\b|\bAND\b).*=.*/i,
    /UNION.*SELECT/i,
    /INSERT.*INTO/i,
    /DELETE.*FROM/i,
    /DROP.*TABLE/i,
    /UPDATE.*SET/i,
    /;\s*DROP/i,
    /--/,
    /\/\*/,
    /xp_/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
};

/**
 * Check for XSS attack patterns
 */
export const containsXSS = (str) => {
  if (typeof str !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // event handlers like onclick=
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\(/gi,
    /expression\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(str));
};

/**
 * Validate and sanitize user input
 */
export const validateAndSanitize = (input, options = {}) => {
  const {
    type = 'string',
    minLength = 0,
    maxLength = 1000,
    required = false,
    allowHTML = false
  } = options;
  
  // Check if required
  if (required && (!input || (typeof input === 'string' && input.trim() === ''))) {
    return { valid: false, error: 'This field is required', sanitized: '' };
  }
  
  // Type-specific validation
  if (type === 'email') {
    if (!isValidEmail(input)) {
      return { valid: false, error: 'Invalid email format', sanitized: '' };
    }
  }
  
  if (type === 'url') {
    if (!isValidURL(input)) {
      return { valid: false, error: 'Invalid URL format', sanitized: '' };
    }
  }
  
  if (type === 'phone') {
    if (!isValidPhone(input)) {
      return { valid: false, error: 'Invalid phone number', sanitized: '' };
    }
  }
  
  // String validation
  if (typeof input === 'string') {
    if (!isValidLength(input, minLength, maxLength)) {
      return {
        valid: false,
        error: `Length must be between ${minLength} and ${maxLength} characters`,
        sanitized: ''
      };
    }
    
    // Security checks
    if (containsSQLInjection(input)) {
      return { valid: false, error: 'Invalid input detected', sanitized: '' };
    }
    
    if (containsXSS(input)) {
      return { valid: false, error: 'Invalid input detected', sanitized: '' };
    }
  }
  
  // Sanitize
  const sanitized = allowHTML ? escapeHtml(input) : sanitizeString(input);
  
  return { valid: true, error: null, sanitized };
};

// ===== RATE LIMITING =====

/**
 * Simple client-side rate limiter using localStorage
 */
class RateLimiter {
  constructor(key, maxAttempts, windowMs) {
    this.key = `rateLimit_${key}`;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  getAttempts() {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];
      
      const attempts = JSON.parse(data);
      const now = Date.now();
      
      // Filter out old attempts outside the time window
      return attempts.filter(timestamp => now - timestamp < this.windowMs);
    } catch {
      return [];
    }
  }
  
  recordAttempt() {
    try {
      const attempts = this.getAttempts();
      attempts.push(Date.now());
      localStorage.setItem(this.key, JSON.stringify(attempts));
    } catch (error) {
      console.warn('Failed to record rate limit attempt:', error);
    }
  }
  
  isAllowed() {
    const attempts = this.getAttempts();
    return attempts.length < this.maxAttempts;
  }
  
  getRemainingAttempts() {
    const attempts = this.getAttempts();
    return Math.max(0, this.maxAttempts - attempts.length);
  }
  
  getTimeUntilReset() {
    const attempts = this.getAttempts();
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }
  
  reset() {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.warn('Failed to reset rate limit:', error);
    }
  }
}

/**
 * Create rate limiter for login attempts
 */
export const createLoginRateLimiter = () => {
  const maxAttempts = parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5;
  const timeoutMinutes = parseInt(process.env.REACT_APP_LOGIN_TIMEOUT_MINUTES) || 15;
  return new RateLimiter('login', maxAttempts, timeoutMinutes * 60 * 1000);
};

/**
 * Create rate limiter for API calls
 */
export const createAPIRateLimiter = (endpoint, maxAttempts = 10, windowMs = 60000) => {
  return new RateLimiter(`api_${endpoint}`, maxAttempts, windowMs);
};

// ===== CSRF PROTECTION =====

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token
 */
export const storeCSRFToken = () => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Get CSRF token
 */
export const getCSRFToken = () => {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = storeCSRFToken();
  }
  return token;
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token) => {
  const storedToken = sessionStorage.getItem('csrf_token');
  return storedToken === token;
};

export default {
  isValidEmail,
  isValidLength,
  isValidURL,
  isValidPhone,
  isAlphanumeric,
  isValidNumber,
  sanitizeString,
  escapeHtml,
  sanitizeObject,
  sanitizeFilename,
  containsSQLInjection,
  containsXSS,
  validateAndSanitize,
  createLoginRateLimiter,
  createAPIRateLimiter,
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  validateCSRFToken
};
