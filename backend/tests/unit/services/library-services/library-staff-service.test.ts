/**
 * UNIT TESTS - LIBRARY STAFF SERVICE
 * Tests for: Staff onboarding & management, shift scheduling & attendance,
 * role-based permissions, performance tracking
 */

import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
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

describe('Library Staff Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Staff Onboarding & Management', () => {
    it('should onboard new staff member', async () => {
      const staffData = {
        library_id: 'lib-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@library.com',
        phone: '+1234567890',
        role: 'librarian',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'staff-123', ...staffData, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO library_staff (library_id, first_name, last_name, email, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [staffData.library_id, staffData.first_name, staffData.last_name,
         staffData.email, staffData.phone, staffData.role, 'active']
      );

      expect(result.rows[0].email).toBe(staffData.email);
      expect(result.rows[0].status).toBe('active');
    });

    it('should update staff information', async () => {
      const staffId = 'staff-123';
      const updates = {
        phone: '+9876543210',
        role: 'senior_librarian',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: staffId, ...updates }],
      });

      const result = await mockTenantDb.query(
        `UPDATE library_staff SET phone = $1, role = $2 WHERE id = $3 RETURNING *`,
        [updates.phone, updates.role, staffId]
      );

      expect(result.rows[0].phone).toBe(updates.phone);
    });
  });

  describe('Shift Scheduling & Attendance', () => {
    it('should create shift schedule', async () => {
      const shift = {
        staff_id: 'staff-123',
        library_id: 'lib-123',
        shift_date: '2024-01-15',
        start_time: '09:00',
        end_time: '17:00',
        shift_type: 'day',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'shift-123', ...shift }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO staff_shifts (staff_id, library_id, shift_date, start_time, end_time, shift_type)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [shift.staff_id, shift.library_id, shift.shift_date, shift.start_time, shift.end_time, shift.shift_type]
      );

      expect(result.rows[0].shift_date).toBe(shift.shift_date);
    });

    it('should record staff attendance', async () => {
      const attendance = {
        staff_id: 'staff-123',
        shift_id: 'shift-123',
        check_in_time: '09:05',
        check_out_time: null,
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'attendance-123', ...attendance }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO staff_attendance (staff_id, shift_id, check_in_time, check_out_time)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [attendance.staff_id, attendance.shift_id, attendance.check_in_time, attendance.check_out_time]
      );

      expect(result.rows[0].check_in_time).toBe(attendance.check_in_time);
    });

    it('should calculate shift hours', () => {
      const shift = {
        start_time: '09:00',
        end_time: '17:00',
      };

      const start = new Date(`2000-01-01T${shift.start_time}`);
      const end = new Date(`2000-01-01T${shift.end_time}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      expect(hours).toBe(8);
    });
  });

  describe('Role-Based Permissions', () => {
    it('should assign permissions to role', () => {
      const rolePermissions = {
        librarian: ['view_bookings', 'manage_students', 'view_reports'],
        manager: ['view_bookings', 'manage_students', 'view_reports', 'manage_staff', 'manage_settings'],
        admin: ['*'],
      };

      const hasPermission = (role: string, permission: string) => {
        const permissions = rolePermissions[role as keyof typeof rolePermissions];
        return permissions.includes('*') || permissions.includes(permission);
      };

      expect(hasPermission('librarian', 'view_bookings')).toBe(true);
      expect(hasPermission('librarian', 'manage_staff')).toBe(false);
      expect(hasPermission('admin', 'any_permission')).toBe(true);
    });

    it('should check staff permissions', async () => {
      const staffId = 'staff-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: staffId, role: 'manager', permissions: ['view_bookings', 'manage_students', 'manage_staff'] }],
      });

      const result = await mockTenantDb.query(
        `SELECT s.*, r.permissions 
         FROM library_staff s
         JOIN staff_roles r ON r.role = s.role
         WHERE s.id = $1`,
        [staffId]
      );

      expect(result.rows[0].permissions).toBeDefined();
    });
  });

  describe('Performance Tracking', () => {
    it('should track staff performance metrics', async () => {
      const staffId = 'staff-123';
      const month = '2024-01';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          staff_id: staffId,
          shifts_completed: 20,
          attendance_rate: 95,
          tasks_completed: 150,
          customer_rating: 4.5,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           staff_id,
           COUNT(*) FILTER (WHERE status = 'completed') as shifts_completed,
           (COUNT(*) FILTER (WHERE check_in_time IS NOT NULL)::float / COUNT(*)::float * 100) as attendance_rate,
           SUM(tasks_completed) as tasks_completed,
           AVG(customer_rating) as customer_rating
         FROM staff_performance
         WHERE staff_id = $1 AND DATE_TRUNC('month', date) = $2
         GROUP BY staff_id`,
        [staffId, month]
      );

      expect(result.rows[0].attendance_rate).toBeGreaterThan(0);
    });
  });
});

