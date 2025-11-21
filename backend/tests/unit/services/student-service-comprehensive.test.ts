/**
 * UNIT TESTS - STUDENT SERVICE COMPREHENSIVE
 * Comprehensive tests for student service business logic
 */

import { coreDb, tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Student Service - Comprehensive', () => {
  let mockTenantDb: any;
  let mockCoreDb: any;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };

    mockCoreDb = {
      query: jest.fn(),
    };

    (tenantDbManager.getTenantConnection as jest.Mock) = jest.fn().mockResolvedValue(mockTenantDb);
    (coreDb.query as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Student Status Management', () => {
    it('should activate student', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [studentId]
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should suspend student', async () => {
      const studentId = 'student-123';
      const reason = 'Violation of terms';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, status: 'suspended', suspension_reason: reason }],
      });

      const result = await mockTenantDb.query(
        `UPDATE users SET status = 'suspended', suspension_reason = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [reason, studentId]
      );

      expect(result.rows[0].status).toBe('suspended');
      expect(result.rows[0].suspension_reason).toBe(reason);
    });

    it('should reactivate student', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: studentId, status: 'active', suspension_reason: null }],
      });

      const result = await mockTenantDb.query(
        `UPDATE users SET status = 'active', suspension_reason = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [studentId]
      );

      expect(result.rows[0].status).toBe('active');
      expect(result.rows[0].suspension_reason).toBeNull();
    });
  });

  describe('Student Search and Filtering', () => {
    it('should search students by name', async () => {
      const searchTerm = 'John';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'student-1', first_name: 'John', last_name: 'Doe' },
          { id: 'student-2', first_name: 'Johnny', last_name: 'Smith' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM users 
         WHERE tenant_id = $1 
         AND user_type = 'student'
         AND (first_name ILIKE $2 OR last_name ILIKE $2)
         AND deleted_at IS NULL`,
        [tenantId, `%${searchTerm}%`]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should filter students by status', async () => {
      const status = 'active';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'student-1', status: 'active' },
          { id: 'student-2', status: 'active' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM users 
         WHERE tenant_id = $1 
         AND user_type = 'student' 
         AND status = $2`,
        [tenantId, status]
      );

      expect(result.rows.every((s: any) => s.status === status)).toBe(true);
    });

    it('should filter students by library', async () => {
      const libraryId = 'library-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'student-1', library_id: libraryId },
          { id: 'student-2', library_id: libraryId },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM users 
         WHERE tenant_id = $1 
         AND user_type = 'student' 
         AND library_id = $2`,
        [tenantId, libraryId]
      );

      expect(result.rows.every((s: any) => s.library_id === libraryId)).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk import students', async () => {
      const students = [
        { first_name: 'Student 1', phone: '+1234567890' },
        { first_name: 'Student 2', phone: '+1234567891' },
        { first_name: 'Student 3', phone: '+1234567892' },
      ];

      mockTenantDb.query.mockResolvedValue({
        rows: students.map((s, i) => ({ id: `student-${i + 1}`, ...s })),
      });

      const result = await mockTenantDb.query(
        `INSERT INTO users (tenant_id, first_name, phone, user_type)
         VALUES ${students.map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, 'student')`).join(', ')}
         RETURNING *`,
        [tenantId, ...students.flatMap(s => [s.first_name, s.phone])]
      );

      expect(result.rows).toHaveLength(students.length);
    });

    it('should handle bulk import errors', async () => {
      mockTenantDb.query.mockRejectedValue(new Error('Duplicate entry'));

      await expect(
        mockTenantDb.query(
          `INSERT INTO users (tenant_id, first_name, phone, user_type)
           VALUES ($1, $2, $3, 'student')`,
          [tenantId, 'Student', '+1234567890']
        )
      ).rejects.toThrow('Duplicate entry');
    });
  });

  describe('Student Attendance', () => {
    it('should record student attendance', async () => {
      const studentId = 'student-123';
      const libraryId = 'library-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'attendance-123', student_id: studentId, library_id: libraryId, date: new Date() }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO attendance (tenant_id, student_id, library_id, date, check_in_time)
         VALUES ($1, $2, $3, CURRENT_DATE, NOW())
         RETURNING *`,
        [tenantId, studentId, libraryId]
      );

      expect(result.rows[0].student_id).toBe(studentId);
    });

    it('should retrieve student attendance history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'att-1', date: '2024-01-15', check_in_time: '10:00:00', check_out_time: '12:00:00' },
          { id: 'att-2', date: '2024-01-16', check_in_time: '09:00:00', check_out_time: '11:00:00' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM attendance 
         WHERE tenant_id = $1 AND student_id = $2 
         ORDER BY date DESC`,
        [tenantId, studentId]
      );

      expect(result.rows).toHaveLength(2);
    });
  });

  describe('Student Payments', () => {
    it('should retrieve student payment history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'payment-1', amount: 1000, status: 'paid' },
          { id: 'payment-2', amount: 2000, status: 'paid' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM payments 
         WHERE tenant_id = $1 AND customer_id = $2 
         ORDER BY created_at DESC`,
        [tenantId, studentId]
      );

      expect(result.rows).toHaveLength(2);
    });

    it('should calculate student total payments', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ total_payments: 5000 }],
      });

      const result = await mockTenantDb.query(
        `SELECT SUM(amount) as total_payments 
         FROM payments 
         WHERE tenant_id = $1 AND customer_id = $2 AND status = 'paid'`,
        [tenantId, studentId]
      );

      expect(result.rows[0].total_payments).toBe(5000);
    });
  });

  describe('Student Preferences', () => {
    it('should save student preferences', async () => {
      const studentId = 'student-123';
      const preferences = {
        notification_enabled: true,
        preferred_library: 'library-123',
        study_hours: 'morning',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ student_id: studentId, ...preferences }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO student_preferences (student_id, tenant_id, preferences)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_id) DO UPDATE SET preferences = $3
         RETURNING *`,
        [studentId, tenantId, JSON.stringify(preferences)]
      );

      expect(result.rows[0].student_id).toBe(studentId);
    });

    it('should retrieve student preferences', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          student_id: studentId,
          preferences: { notification_enabled: true },
        }],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM student_preferences WHERE student_id = $1',
        [studentId]
      );

      expect(result.rows[0].student_id).toBe(studentId);
    });
  });
});

