/**
 * Validation Utilities
 * 
 * Provides reusable validation functions for common input scenarios
 */

const {
  AppError
} = require('../middleware/errorHandler');

/**
 * Validate pagination parameters
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @returns {Object} - Validated page and limit
 */
const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;
  if (parsedPage < 1) {
    throw new AppError('Page must be >= 1', 400, 'INVALID_PAGE');
  }
  if (parsedLimit < 1 || parsedLimit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
  }
  return {
    page: parsedPage,
    limit: parsedLimit
  };
};

/**
 * Validate UUID format
 * @param {string} id - UUID string
 * @returns {boolean} - True if valid UUID
 */
const validateUUID = id => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate email format
 * @param {string} email - Email string
 * @returns {boolean} - True if valid email
 */
const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string
 * @returns {boolean} - True if valid date
 */
const validateDate = date => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const parsedDate = new Date(date);
  return parsedDate.toString() !== 'Invalid Date';
};

/**
 * Validate time format (HH:mm)
 * @param {string} time - Time string
 * @returns {boolean} - True if valid time
 */
const validateTime = time => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @returns {boolean} - True if valid
 */
const validateEnum = (value, allowedValues, fieldName = 'Field') => {
  if (!allowedValues.includes(value)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, 400, 'INVALID_ENUM_VALUE');
  }
  return true;
};

/**
 * Validate required fields
 * @param {Object} data - Data object
 * @param {Array} requiredFields - Array of required field names
 */
const validateRequired = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400, 'MISSING_REQUIRED_FIELDS');
  }
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 */
const validateLength = (str, min, max, fieldName = 'Field') => {
  if (str.length < min) {
    throw new AppError(`${fieldName} must be at least ${min} characters`, 400, 'FIELD_TOO_SHORT');
  }
  if (str.length > max) {
    throw new AppError(`${fieldName} must be at most ${max} characters`, 400, 'FIELD_TOO_LONG');
  }
};

/**
 * Validate number range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 */
const validateRange = (num, min, max, fieldName = 'Field') => {
  if (num < min || num > max) {
    throw new AppError(`${fieldName} must be between ${min} and ${max}`, 400, 'INVALID_RANGE');
  }
};
module.exports = {
  validatePagination,
  validateUUID,
  validateEmail,
  validateDate,
  validateTime,
  validateEnum,
  validateRequired,
  validateLength,
  validateRange
};