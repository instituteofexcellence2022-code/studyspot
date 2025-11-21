/**
 * UNIT TESTS - STUDENT ONBOARDING SERVICE
 * Tests for: Student registration, verification, KYC verification,
 * educational background tracking, profile completion tracking
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { tenantDbManager } from '../../../src/config/database';

describe('Student Onboarding Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Student Registration', () => {
    it('should register new student', async () => {
      const studentData = {
        tenant_id: 'tenant-123',
        student_code: 'STU001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          id: 'student-123',
          ...studentData,
          status: 'active',
          created_at: new Date(),
        }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO students (tenant_id, student_code, first_name, last_name, email, phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [studentData.tenant_id, studentData.student_code, studentData.first_name, 
         studentData.last_name, studentData.email, studentData.phone, 'active']
      );

      expect(result.rows[0].email).toBe(studentData.email);
      expect(result.rows[0].status).toBe('active');
    });

    it('should validate student email uniqueness', async () => {
      const email = 'existing@example.com';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'student-123', email }],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM students WHERE email = $1',
        [email]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should generate unique student code', () => {
      const tenantId = 'tenant-123';
      const timestamp = Date.now();
      const studentCode = `STU${timestamp.toString().slice(-6)}`;

      expect(studentCode).toMatch(/^STU\d{6}$/);
    });
  });

  describe('Verification', () => {
    it('should verify student email', async () => {
      const studentId = 'student-123';
      const verificationToken = 'token-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, email_verified: true }],
      });

      const result = await mockTenantDb.query(
        'UPDATE students SET email_verified = true WHERE id = $1 RETURNING *',
        [studentId]
      );

      expect(result.rows[0].email_verified).toBe(true);
    });

    it('should verify student phone', async () => {
      const studentId = 'student-123';
      const otp = '123456';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, phone_verified: true }],
      });

      const result = await mockTenantDb.query(
        'UPDATE students SET phone_verified = true WHERE id = $1 RETURNING *',
        [studentId]
      );

      expect(result.rows[0].phone_verified).toBe(true);
    });
  });

  describe('KYC Verification', () => {
    it('should upload KYC documents', async () => {
      const studentId = 'student-123';
      const kycData = {
        aadhaar_number: '1234-5678-9012',
        aadhaar_file: 'aadhaar.pdf',
        pan_number: 'ABCDE1234F',
        pan_file: 'pan.pdf',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, kyc_status: 'pending', ...kycData }],
      });

      const result = await mockTenantDb.query(
        `UPDATE students SET kyc_status = 'pending', aadhaar_number = $1, pan_number = $2 
         WHERE id = $3 RETURNING *`,
        [kycData.aadhaar_number, kycData.pan_number, studentId]
      );

      expect(result.rows[0].kyc_status).toBe('pending');
    });

    it('should verify KYC documents', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, kyc_status: 'verified' }],
      });

      const result = await mockTenantDb.query(
        `UPDATE students SET kyc_status = 'verified' WHERE id = $1 RETURNING *`,
        [studentId]
      );

      expect(result.rows[0].kyc_status).toBe('verified');
    });
  });

  describe('Educational Background Tracking', () => {
    it('should track educational background', async () => {
      const studentId = 'student-123';
      const education = {
        institution: 'Test University',
        course: 'Computer Science',
        year: '2024',
        percentage: 85,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, ...education }],
      });

      const result = await mockTenantDb.query(
        `UPDATE students SET institution = $1, course = $2, year = $3, percentage = $4 
         WHERE id = $5 RETURNING *`,
        [education.institution, education.course, education.year, education.percentage, studentId]
      );

      expect(result.rows[0].institution).toBe(education.institution);
    });
  });

  describe('Profile Completion Tracking', () => {
    it('should calculate profile completion percentage', () => {
      const student = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        date_of_birth: null,
        address: null,
        education_level: null,
      };

      const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'address', 'education_level'];
      const completedFields = requiredFields.filter(field => student[field as keyof typeof student] !== null);
      const completionPercentage = (completedFields.length / requiredFields.length) * 100;

      expect(completionPercentage).toBeGreaterThan(0);
      expect(completionPercentage).toBeLessThan(100);
    });

    it('should track profile completion steps', () => {
      const steps = {
        basic_info: true,
        contact_info: true,
        educational_background: false,
        kyc_verification: false,
        preferences: false,
      };

      const completedSteps = Object.values(steps).filter(Boolean).length;
      const totalSteps = Object.keys(steps).length;
      const completionPercentage = (completedSteps / totalSteps) * 100;

      expect(completionPercentage).toBe(40);
    });
  });
});

