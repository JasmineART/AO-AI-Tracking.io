/**
 * Data Validation Utilities
 * Ensures data integrity throughout the application
 */

import errorMonitor from './errorMonitoring';

export const validators = {
  /**
   * Validate project data structure
   */
  validateProject(project) {
    const errors = [];

    if (!project) {
      errors.push('Project object is null or undefined');
      return { valid: false, errors };
    }

    // Required fields
    if (!project.id) errors.push('Project ID is required');
    if (!project.name || typeof project.name !== 'string') {
      errors.push('Project name is required and must be a string');
    }
    if (!project.userId) errors.push('User ID is required');

    // Optional but validated fields
    if (project.readinessScore !== undefined) {
      const score = Number(project.readinessScore);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.push('Readiness score must be between 0 and 100');
      }
    }

    if (project.status && !['Active', 'In Progress', 'Completed', 'Deployed', 'Planning'].includes(project.status)) {
      errors.push('Invalid project status');
    }

    if (project.type && !['AI Integration', 'Automation', 'Data Analytics', 'Machine Learning', 'Process Optimization', 'Other'].includes(project.type)) {
      errors.push('Invalid project type');
    }

    const valid = errors.length === 0;
    
    if (!valid) {
      errorMonitor.logError({
        type: 'Validation Error',
        message: 'Project validation failed',
        errors,
        data: project,
        timestamp: new Date().toISOString()
      });
    }

    return { valid, errors };
  },

  /**
   * Validate user authentication state
   */
  validateUser(user) {
    const errors = [];

    if (!user) {
      errors.push('User object is null or undefined');
      return { valid: false, errors };
    }

    if (!user.uid) errors.push('User UID is required');
    if (!user.email && !user.isDemo) errors.push('User email is required for non-demo users');

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate Firebase data
   */
  validateFirebaseData(data, schema) {
    const errors = [];

    if (!data) {
      errors.push('Data is null or undefined');
      return { valid: false, errors };
    }

    // Check schema if provided
    if (schema) {
      Object.keys(schema).forEach(key => {
        if (schema[key].required && !data[key]) {
          errors.push(`Required field '${key}' is missing`);
        }

        if (data[key] && schema[key].type) {
          const actualType = typeof data[key];
          if (actualType !== schema[key].type) {
            errors.push(`Field '${key}' should be ${schema[key].type} but got ${actualType}`);
          }
        }
      });
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate AI insights data
   */
  validateAIInsights(insights) {
    const errors = [];

    if (!insights) {
      errors.push('Insights object is null or undefined');
      return { valid: false, errors };
    }

    if (!insights.summary || typeof insights.summary !== 'string') {
      errors.push('Summary is required and must be a string');
    }

    if (!Array.isArray(insights.recommendations)) {
      errors.push('Recommendations must be an array');
    }

    if (!Array.isArray(insights.trends)) {
      errors.push('Trends must be an array');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Sanitize user input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Validate date fields
   */
  validateDate(date, fieldName = 'date') {
    const errors = [];

    if (!date) {
      errors.push(`${fieldName} is required`);
      return { valid: false, errors };
    }

    const timestamp = new Date(date).getTime();
    if (isNaN(timestamp)) {
      errors.push(`${fieldName} is not a valid date`);
    }

    return { valid: errors.length === 0, errors };
  }
};

/**
 * Automatic data validation wrapper
 */
export const withValidation = (fn, validator) => {
  return async (...args) => {
    try {
      // Validate input
      const validation = validator(...args);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Execute function
      return await fn(...args);
    } catch (error) {
      errorMonitor.logError({
        type: 'Validation Wrapper Error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  };
};

export default validators;
