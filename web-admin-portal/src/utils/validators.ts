// ============================================
// VALIDATION UTILITIES
// ============================================

import { VALIDATION } from '../config/constants';

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Validate password
 */
export const isValidPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }

  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  return VALIDATION.PHONE_REGEX.test(phone);
};

/**
 * Validate name
 */
export const isValidName = (name: string): boolean => {
  if (!name) return false;
  return (
    name.length >= VALIDATION.NAME_MIN_LENGTH &&
    name.length <= VALIDATION.NAME_MAX_LENGTH
  );
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validate min length
 */
export const minLength = (value: string, length: number): boolean => {
  if (!value) return false;
  return value.length >= length;
};

/**
 * Validate max length
 */
export const maxLength = (value: string, length: number): boolean => {
  if (!value) return true; // Allow empty
  return value.length <= length;
};

/**
 * Validate number range
 */
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate file size
 */
export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Check if only digits
  if (!/^\d+$/.test(cleaned)) return false;

  // Check length (13-19 digits for most cards)
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDate = (date: string): boolean => {
  if (!date) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate IP address (IPv4)
 */
export const isValidIPv4 = (ip: string): boolean => {
  if (!ip) return false;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};

/**
 * Validate port number
 */
export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color: string): boolean => {
  if (!color) return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Validate JSON string
 */
export const isValidJSON = (str: string): boolean => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Password strength calculator
 */
export const getPasswordStrength = (password: string): {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
} => {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, level: 'weak', feedback: ['Password is required'] };
  }

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) feedback.push('Use at least 8 characters');

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Use both uppercase and lowercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include at least one number');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push('Include at least one special character');

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Avoid repeating characters');
  }

  if (/^[0-9]+$/.test(password)) {
    score = 0;
    feedback.push('Don\'t use only numbers');
  }

  if (/^[a-zA-Z]+$/.test(password)) {
    score--;
    feedback.push('Include numbers or special characters');
  }

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score <= 1) level = 'weak';
  else if (score === 2) level = 'fair';
  else if (score === 3) level = 'good';
  else if (score === 4) level = 'strong';
  else level = 'very-strong';

  return { score, level, feedback };
};

