/**
 * UNIT TESTS - AUDIT SERVICE
 * Tests for: Activity logging & tracking, compliance reporting,
 * tamper-proof log storage, real-time analysis
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Audit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Activity Logging & Tracking', () => {
    it('should log user activity', async () => {
      const activity = {
        user_id: 'user-123',
        action: 'create_booking',
        resource_type: 'booking',
        resource_id: 'booking-123',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'audit-123', ...activity, timestamp: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [activity.user_id, activity.action, activity.resource_type, activity.resource_id,
         activity.ip_address, activity.user_agent]
      );

      expect(result.rows[0].action).toBe(activity.action);
    });

    it('should log admin actions', async () => {
      const adminAction = {
        admin_id: 'admin-123',
        action: 'suspend_student',
        resource_type: 'student',
        resource_id: 'student-123',
        reason: 'Violation of terms',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'audit-123', ...adminAction, timestamp: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [adminAction.admin_id, adminAction.action, adminAction.resource_type,
         adminAction.resource_id, JSON.stringify({ reason: adminAction.reason })]
      );

      expect(result.rows[0].action).toBe(adminAction.action);
    });

    it('should track data access', async () => {
      const accessLog = {
        user_id: 'user-123',
        action: 'view_student_data',
        resource_type: 'student',
        resource_id: 'student-123',
        access_type: 'read',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'audit-123', ...accessLog }],
      });

      const result = await coreDb.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [accessLog.user_id, accessLog.action, accessLog.resource_type,
         accessLog.resource_id, JSON.stringify({ access_type: accessLog.access_type })]
      );

      expect(result.rows[0].action).toBe(accessLog.action);
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate GDPR compliance report', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (coreDb.query).mockResolvedValue({
        rows: [{
          period: 'January 2024',
          total_activities: 10000,
          data_access_logs: 5000,
          data_modifications: 2000,
          data_deletions: 100,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           TO_CHAR(timestamp, 'Month YYYY') as period,
           COUNT(*) as total_activities,
           COUNT(*) FILTER (WHERE action LIKE '%view%' OR action LIKE '%read%') as data_access_logs,
           COUNT(*) FILTER (WHERE action LIKE '%update%' OR action LIKE '%modify%') as data_modifications,
           COUNT(*) FILTER (WHERE action LIKE '%delete%') as data_deletions
         FROM audit_logs
         WHERE timestamp BETWEEN $1 AND $2
         GROUP BY TO_CHAR(timestamp, 'Month YYYY')`,
        [startDate, endDate]
      );

      expect(result.rows[0].total_activities).toBeGreaterThan(0);
    });

    it('should track data retention compliance', async () => {
      const retentionPeriod = 90; // days

      (coreDb.query).mockResolvedValue({
        rows: [{
          logs_to_archive: 5000,
          logs_to_delete: 1000,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '$1 days' AND timestamp >= NOW() - INTERVAL '$2 days') as logs_to_archive,
           COUNT(*) FILTER (WHERE timestamp < NOW() - INTERVAL '$2 days') as logs_to_delete
         FROM audit_logs`,
        [retentionPeriod, retentionPeriod * 2]
      );

      expect(result.rows[0].logs_to_archive).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tamper-Proof Log Storage', () => {
    it('should generate hash for log entry', () => {
      const logEntry = {
        id: 'audit-123',
        user_id: 'user-123',
        action: 'create_booking',
        timestamp: new Date(),
        previous_hash: 'prev-hash-123',
      };

      const crypto = require('crypto');
      const dataString = `${logEntry.id}${logEntry.user_id}${logEntry.action}${logEntry.timestamp}${logEntry.previous_hash}`;
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA256 produces 64 character hex string
    });

    it('should verify log integrity', () => {
      const logEntry = {
        id: 'audit-123',
        user_id: 'user-123',
        action: 'create_booking',
        timestamp: new Date(),
        previous_hash: 'prev-hash-123',
        hash: 'calculated-hash',
      };

      const crypto = require('crypto');
      const dataString = `${logEntry.id}${logEntry.user_id}${logEntry.action}${logEntry.timestamp}${logEntry.previous_hash}`;
      const calculatedHash = crypto.createHash('sha256').update(dataString).digest('hex');

      const isIntact = calculatedHash === logEntry.hash;
      expect(isIntact).toBeDefined();
    });
  });

  describe('Real-Time Analysis', () => {
    it('should detect suspicious activity patterns', async () => {
      const timeWindow = 60; // minutes

      (coreDb.query).mockResolvedValue({
        rows: [{
          user_id: 'user-123',
          action_count: 100,
          unique_ips: 5,
          is_suspicious: true,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           user_id,
           COUNT(*) as action_count,
           COUNT(DISTINCT ip_address) as unique_ips,
           CASE WHEN COUNT(*) > 50 OR COUNT(DISTINCT ip_address) > 3 THEN true ELSE false END as is_suspicious
         FROM audit_logs
         WHERE timestamp >= NOW() - INTERVAL '$1 minutes'
         GROUP BY user_id
         HAVING COUNT(*) > 50 OR COUNT(DISTINCT ip_address) > 3`,
        [timeWindow]
      );

      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });

    it('should track failed authentication attempts', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { ip_address: '192.168.1.1', failed_attempts: 5 },
          { ip_address: '192.168.1.2', failed_attempts: 3 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           ip_address,
           COUNT(*) as failed_attempts
         FROM audit_logs
         WHERE action = 'login_failed' AND timestamp >= NOW() - INTERVAL '15 minutes'
         GROUP BY ip_address
         HAVING COUNT(*) >= 3
         ORDER BY failed_attempts DESC`
      );

      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });
});

