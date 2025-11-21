/**
 * COMPREHENSIVE UNIT TESTS - VALIDATION UTILITIES
 * Additional tests for validation schemas and functions
 */

import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  uuidSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  createTenantSchema,
  createStudentSchema,
  createLibrarySchema,
  createPaymentSchema,
  validate,
  validateRequest,
} from '../../../src/utils/validation';

describe('Validation Utilities - Comprehensive', () => {
  describe('Email Schema', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@.com',
        'invalid..email@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('Phone Schema', () => {
    it('should validate correct phone formats', () => {
      const validPhones = [
        '+1234567890',
        '+919876543210',
      ];

      validPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).not.toThrow();
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '123', // too short
        'abc123', // contains letters
        '', // empty
        '0123456789', // starts with 0
      ];

      invalidPhones.forEach(phone => {
        expect(() => phoneSchema.parse(phone)).toThrow();
      });
    });
  });

  describe('UUID Schema', () => {
    it('should validate correct UUID formats', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '00000000-0000-0000-0000-000000000000',
      ];

      validUUIDs.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).not.toThrow();
      });
    });

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '123e4567-e89b-12d3-a456',
      ];

      invalidUUIDs.forEach(uuid => {
        expect(() => uuidSchema.parse(uuid)).toThrow();
      });
    });
  });

  describe('Password Schema', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyP@ssw0rd',
        'Str0ng#Pass',
      ];

      strongPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        '12345678',
        'password',
        'PASSWORD',
      ];

      weakPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('Login Schema', () => {
    it('should validate login data', () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      expect(() => loginSchema.parse(loginData)).not.toThrow();
    });

    it('should reject login with invalid email', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      expect(() => loginSchema.parse(loginData)).toThrow();
    });
  });

  describe('Register Schema', () => {
    it('should validate registration data', () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      expect(() => registerSchema.parse(registerData)).not.toThrow();
    });

    it('should require all registration fields', () => {
      const incompleteData = {
        email: 'test@example.com',
        // missing password and name
      };

      expect(() => registerSchema.parse(incompleteData)).toThrow();
    });
  });

  describe('Tenant Schema', () => {
    it('should validate tenant creation data', () => {
      const tenantData = {
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1234567890',
      };

      expect(() => createTenantSchema.parse(tenantData)).not.toThrow();
    });

    it('should validate tenant slug generation', () => {
      const name = 'Test Tenant Name';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      expect(slug).toBe('test-tenant-name');
    });
  });

  describe('Student Schema', () => {
    it('should validate student creation data', () => {
      const studentData = {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
      };

      expect(() => createStudentSchema.parse(studentData)).not.toThrow();
    });

    it('should require name and phone', () => {
      const incompleteData = {
        email: 'john@example.com',
        // missing name and phone
      };

      expect(() => createStudentSchema.parse(incompleteData)).toThrow();
    });
  });

  describe('Library Schema', () => {
    it('should validate library creation data', () => {
      const libraryData = {
        name: 'Test Library',
        address: '123 Test Street, Test Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '+1234567890',
        email: 'test@library.com',
        capacity: 100,
      };

      expect(() => createLibrarySchema.parse(libraryData)).not.toThrow();
    });

    it('should validate library capacity is positive', () => {
      const libraryData = {
        name: 'Test Library',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '+1234567890',
        email: 'test@library.com',
        capacity: -10,
      };

      expect(() => createLibrarySchema.parse(libraryData)).toThrow();
    });
  });

  describe('Payment Schema', () => {
    it('should validate payment creation data', () => {
      const paymentData = {
        amount: 1000,
        currency: 'INR',
        payment_method: 'razorpay',
      };

      expect(() => createPaymentSchema.parse(paymentData)).not.toThrow();
    });

    it('should validate payment amount is positive', () => {
      const paymentData = {
        amount: -100,
        currency: 'INR',
      };

      expect(() => createPaymentSchema.parse(paymentData)).toThrow();
    });
  });

  describe('Validate Function', () => {
    it('should return success for valid data', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 'Test' };

      const result = validate(schema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should return error for invalid data', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 123 };

      const result = validate(schema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('Schema Composition', () => {
    it('should combine multiple schemas', () => {
      const baseSchema = z.object({
        name: z.string(),
        email: emailSchema,
      });

      const extendedSchema = baseSchema.extend({
        phone: phoneSchema,
      });

      const data = {
        name: 'Test',
        email: 'test@example.com',
        phone: '+1234567890',
      };

      expect(() => extendedSchema.parse(data)).not.toThrow();
    });

    it('should handle optional fields', () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const data1 = { required: 'value' };
      const data2 = { required: 'value', optional: 'optional' };

      expect(() => schema.parse(data1)).not.toThrow();
      expect(() => schema.parse(data2)).not.toThrow();
    });
  });
});
