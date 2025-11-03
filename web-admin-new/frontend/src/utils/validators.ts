/**
 * Validation utility functions
 */

import { VALIDATION } from '../config/constants';

export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= VALIDATION.PASSWORD_MIN_LENGTH &&
    password.length <= VALIDATION.PASSWORD_MAX_LENGTH
  );
};

export const isValidName = (name: string): boolean => {
  return (
    name.length >= VALIDATION.NAME_MIN_LENGTH &&
    name.length <= VALIDATION.NAME_MAX_LENGTH
  );
};

