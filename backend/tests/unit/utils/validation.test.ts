/**
 * UNIT TESTS - VALIDATION UTILITIES
 */

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
import { z } from 'zod';

describe('Validation Utilities', () => {
  describe('Common Schemas', () => {
    describe('emailSchema', () => {
      it('should validate valid email', () => {
        expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      });

      it('should reject invalid email', () => {
        expect(() => emailSchema.parse('invalid-email')).toThrow();
      });
    });

    describe('phoneSchema', () => {
      it('should validate valid phone number', () => {
        expect(() => phoneSchema.parse('+1234567890')).not.toThrow();
        expect(() => phoneSchema.parse('1234567890')).not.toThrow();
      });

      it('should reject invalid phone number', () => {
        expect(() => phoneSchema.parse('123')).toThrow();
        expect(() => phoneSchema.parse('abc')).toThrow();
      });
    });

    describe('uuidSchema', () => {
      it('should validate valid UUID', () => {
        const validUUID = '550e8400-e29b-41d4-a716-446655440000';
        expect(() => uuidSchema.parse(validUUID)).not.toThrow();
      });

      it('should reject invalid UUID', () => {
        expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
      });
    });

    describe('passwordSchema', () => {
      it('should validate strong password', () => {
        const strongPassword = 'Password123!';
        expect(() => passwordSchema.parse(strongPassword)).not.toThrow();
      });

      it('should reject weak password', () => {
        expect(() => passwordSchema.parse('weak')).toThrow();
        expect(() => passwordSchema.parse('password')).toThrow(); // No uppercase, number, special
        expect(() => passwordSchema.parse('PASSWORD123')).toThrow(); // No lowercase, special
      });
    });
  });

  describe('Auth Schemas', () => {
    describe('loginSchema', () => {
      it('should validate valid login data', () => {
        const data = {
          email: 'test@example.com',
          password: 'password123',
        };
        expect(() => loginSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid login data', () => {
        expect(() => loginSchema.parse({ email: 'invalid' })).toThrow();
        expect(() => loginSchema.parse({ password: '123' })).toThrow();
      });
    });

    describe('registerSchema', () => {
      it('should validate valid registration data', () => {
        const data = {
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        };
        expect(() => registerSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid registration data', () => {
        expect(() => registerSchema.parse({ email: 'invalid' })).toThrow();
        expect(() => registerSchema.parse({ password: 'weak' })).toThrow();
      });
    });
  });

  describe('Tenant Schemas', () => {
    describe('createTenantSchema', () => {
      it('should validate valid tenant data', () => {
        const data = {
          name: 'Test Library',
          email: 'test@library.com',
          phone: '+1234567890',
        };
        expect(() => createTenantSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid tenant data', () => {
        expect(() => createTenantSchema.parse({ name: 'A' })).toThrow();
        expect(() => createTenantSchema.parse({ email: 'invalid' })).toThrow();
      });
    });
  });

  describe('Student Schemas', () => {
    describe('createStudentSchema', () => {
      it('should validate valid student data', () => {
        const data = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        };
        expect(() => createStudentSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid student data', () => {
        expect(() => createStudentSchema.parse({ name: 'A' })).toThrow();
      });
    });
  });

  describe('Library Schemas', () => {
    describe('createLibrarySchema', () => {
      it('should validate valid library data', () => {
        const data = {
          name: 'Test Library',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          phone: '+1234567890',
          email: 'test@library.com',
          capacity: 50,
        };
        expect(() => createLibrarySchema.parse(data)).not.toThrow();
      });

      it('should reject invalid library data', () => {
        expect(() => createLibrarySchema.parse({ name: 'A' })).toThrow();
        expect(() => createLibrarySchema.parse({ pincode: '123' })).toThrow();
      });
    });
  });

  describe('Payment Schemas', () => {
    describe('createPaymentSchema', () => {
      it('should validate valid payment data', () => {
        const data = {
          amount: 1000,
          currency: 'INR' as const,
        };
        expect(() => createPaymentSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid payment data', () => {
        expect(() => createPaymentSchema.parse({ amount: -100 })).toThrow();
        expect(() => createPaymentSchema.parse({ amount: 1000, currency: 'USD' })).not.toThrow();
      });
    });
  });

  describe('validate function', () => {
    it('should return success for valid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 'Test' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Test' });
    });

    it('should return errors for invalid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 123 });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateRequest middleware', () => {
    it('should validate request body', async () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateRequest(schema);

      const mockRequest = { body: { name: 'Test' } };
      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await middleware(mockRequest, mockReply);

      expect(mockRequest.validatedBody).toEqual({ name: 'Test' });
      expect(mockReply.status).not.toHaveBeenCalled();
    });

    it('should reject invalid request body', async () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateRequest(schema);

      const mockRequest = { body: { name: 123 } };
      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await middleware(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalled();
    });
  });
});
