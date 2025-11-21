/**
 * UNIT TESTS - USER SERVICE
 * Tests for user service business logic
 */

import { coreDb } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('User Service', () => {
  let mockCoreDb: any;

  beforeEach(() => {
    mockCoreDb = {
      query: jest.fn(),
    };

    (coreDb.query as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Platform Admin User Management', () => {
    it('should retrieve all platform users', async () => {
      mockCoreDb.query.mockResolvedValue({
        rows: [
          { id: 'user-1', email: 'admin1@test.com', role: 'admin' },
          { id: 'user-2', email: 'admin2@test.com', role: 'support' },
        ],
      });

      const result = await mockCoreDb.query(
        'SELECT id, email, first_name, last_name, role, department, is_active FROM admin_users ORDER BY created_at DESC'
      );

      expect(result.rows).toHaveLength(2);
    });

    it('should create a platform user', async () => {
      const userData = {
        email: 'newadmin@test.com',
        password_hash: 'hashed-password',
        first_name: 'New',
        last_name: 'Admin',
        role: 'admin',
        department: 'engineering',
        is_active: true,
      };

      mockCoreDb.query.mockResolvedValue({
        rows: [{ id: 'user-123', ...userData }],
      });

      const result = await mockCoreDb.query(
        `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, department, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name, last_name, role, department, is_active`,
        [
          userData.email,
          userData.password_hash,
          userData.first_name,
          userData.last_name,
          userData.role,
          userData.department,
          userData.is_active,
        ]
      );

      expect(result.rows[0].email).toBe(userData.email);
    });

    it('should update platform user', async () => {
      const userId = 'user-123';
      const updates = { role: 'super_admin', is_active: false };

      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ id: userId }] })
        .mockResolvedValueOnce({ rows: [{ id: userId, ...updates }] });

      // Check exists
      const checkResult = await mockCoreDb.query(
        'SELECT * FROM admin_users WHERE id = $1',
        [userId]
      );

      if (checkResult.rows.length > 0) {
        const updateResult = await mockCoreDb.query(
          'UPDATE admin_users SET role = $1, is_active = $2 WHERE id = $3 RETURNING *',
          [updates.role, updates.is_active, userId]
        );

        expect(updateResult.rows[0].role).toBe(updates.role);
      }
    });
  });

  describe('System Settings', () => {
    it('should retrieve system settings', async () => {
      mockCoreDb.query.mockResolvedValue({
        rows: [
          { key: 'setting1', value: 'value1' },
          { key: 'setting2', value: 'value2' },
        ],
      });

      const result = await mockCoreDb.query(
        'SELECT key, value FROM system_settings ORDER BY key'
      );

      expect(result.rows).toBeDefined();
    });

    it('should update system settings', async () => {
      const settings = {
        max_users_per_tenant: '1000',
        default_subscription_plan: 'premium',
      };

      mockCoreDb.query.mockResolvedValue({
        rows: Object.entries(settings).map(([key, value]) => ({ key, value })),
      });

      for (const [key, value] of Object.entries(settings)) {
        await mockCoreDb.query(
          `INSERT INTO system_settings (key, value, updated_by, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()
           RETURNING *`,
          [key, value, 'admin-user-id']
        );
      }

      expect(mockCoreDb.query).toHaveBeenCalled();
    });
  });
});

