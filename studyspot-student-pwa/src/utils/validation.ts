/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }

  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }

  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }

  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Check if it's 10 digits
  if (!/^\d{10}$/.test(cleanPhone)) {
    return 'Phone number must be 10 digits';
  }

  return null;
};

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name) {
    return `${fieldName} is required`;
  }

  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }

  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }

  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) {
    errors.firstName = firstNameError;
  }

  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) {
    errors.lastName = lastNameError;
  }

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

