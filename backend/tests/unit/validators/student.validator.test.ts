/**
 * UNIT TESTS - STUDENT VALIDATOR
 * Tests for student validation schemas
 */

import {
  createStudentSchema,
  updateStudentSchema,
  getStudentsQuerySchema,
  getStudentParamsSchema,
  suspendStudentSchema,
} from '../../../src/validators/student.validator';

describe('Student Validator Schemas', () => {
  describe('createStudentSchema', () => {
    it('should validate valid student data', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '1234567890', // 10 digits without +
        date_of_birth: '2000-01-01', // YYYY-MM-DD format
        gender: 'male',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
      };

      const result = createStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        first_name: 'John',
        phone: '1234567890',
        email: 'invalid-email',
      };

      const result = createStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const invalidData = {
        first_name: 'John',
        phone: '123', // Too short, needs 10 digits
      };

      const result = createStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('phone'))).toBe(true);
      }
    });

    it('should reject invalid pincode', () => {
      const invalidData = {
        first_name: 'John',
        phone: '+1234567890',
        pincode: '12345', // Invalid format
      };

      const result = createStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require first_name', () => {
      const invalidData = {
        phone: '1234567890',
      };

      const result = createStudentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('first_name'))).toBe(true);
      }
    });
  });

  describe('updateStudentSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        first_name: 'Updated Name',
      };

      const result = updateStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty update (all fields optional)', () => {
      const result = updateStudentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('getStudentsQuerySchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        page: '1',
        limit: '20',
        search: 'john',
        status: 'active',
      };

      const result = getStudentsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const result = getStudentsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('getStudentParamsSchema', () => {
    it('should validate UUID parameter', () => {
      const validParams = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = getStudentParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidParams = {
        id: 'invalid-uuid',
      };

      const result = getStudentParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('suspendStudentSchema', () => {
    it('should validate suspend reason', () => {
      const validData = {
        reason: 'Violation of terms',
      };

      const result = suspendStudentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow empty reason (optional)', () => {
      // suspendStudentSchema has reason as optional, so empty object should pass
      const result = suspendStudentSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});

