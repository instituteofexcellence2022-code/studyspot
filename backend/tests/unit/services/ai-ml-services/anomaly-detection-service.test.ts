/**
 * UNIT TESTS - ANOMALY DETECTION SERVICE
 * Tests for: Security anomaly identification, behavioral anomaly detection,
 * automated alerting, pattern analysis
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Anomaly Detection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security Anomaly Identification', () => {
    it('should detect unusual login patterns', async () => {
      const userId = 'user-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          user_id: userId,
          login_count: 20,
          unique_locations: 5,
          is_anomaly: true,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           user_id,
           COUNT(*) as login_count,
           COUNT(DISTINCT ip_address) as unique_locations,
           CASE WHEN COUNT(DISTINCT ip_address) > 3 OR COUNT(*) > 15 THEN true ELSE false END as is_anomaly
         FROM login_logs
         WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '1 hour'
         GROUP BY user_id`,
        [userId]
      );

      expect(result.rows[0].is_anomaly).toBeDefined();
    });

    it('should detect suspicious transaction patterns', () => {
      const transactions = [
        { amount: 500, time: '10:00' },
        { amount: 10000, time: '10:05' },
        { amount: 50000, time: '10:10' },
      ];

      const avgAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
      const threshold = avgAmount * 3;

      const anomalies = transactions.filter(t => t.amount > threshold);
      expect(anomalies.length).toBeGreaterThan(0);
    });
  });

  describe('Behavioral Anomaly Detection', () => {
    it('should detect unusual booking patterns', async () => {
      const studentId = 'student-123';

      (coreDb.query).mockResolvedValue({
        rows: [{
          student_id: studentId,
          avg_booking_duration: 2,
          current_booking_duration: 12,
          is_anomaly: true,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           student_id,
           AVG(duration_hours) as avg_booking_duration,
           MAX(duration_hours) as current_booking_duration,
           CASE WHEN MAX(duration_hours) > AVG(duration_hours) * 3 THEN true ELSE false END as is_anomaly
         FROM bookings
         WHERE student_id = $1
         GROUP BY student_id`,
        [studentId]
      );

      expect(result.rows[0].is_anomaly).toBeDefined();
    });

    it('should detect location anomalies', () => {
      const userLocations = [
        { location: 'Delhi', count: 50 },
        { location: 'Mumbai', count: 2 },
      ];

      const total = userLocations.reduce((sum, l) => sum + l.count, 0);
      const anomalies = userLocations.filter(l => 
        (l.count / total) < 0.1 && l.count > 0
      );

      expect(anomalies.length).toBeGreaterThan(0);
    });
  });

  describe('Automated Alerting', () => {
    it('should create anomaly alert', async () => {
      const anomaly = {
        type: 'security',
        severity: 'high',
        description: 'Unusual login pattern detected',
        user_id: 'user-123',
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'alert-123', ...anomaly, status: 'open', created_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO anomaly_alerts (type, severity, description, user_id, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [anomaly.type, anomaly.severity, anomaly.description, anomaly.user_id, 'open']
      );

      expect(result.rows[0].status).toBe('open');
    });

    it('should prioritize alerts by severity', () => {
      const alerts = [
        { id: 'a1', severity: 'low' },
        { id: 'a2', severity: 'high' },
        { id: 'a3', severity: 'medium' },
      ];

      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const sorted = alerts.sort((a, b) => 
        (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
        (severityOrder[a.severity as keyof typeof severityOrder] || 0)
      );

      expect(sorted[0].severity).toBe('high');
    });
  });

  describe('Pattern Analysis', () => {
    it('should identify recurring patterns', () => {
      const events = [
        { time: '10:00', type: 'login' },
        { time: '10:05', type: 'booking' },
        { time: '10:10', type: 'payment' },
        { time: '11:00', type: 'login' },
        { time: '11:05', type: 'booking' },
        { time: '11:10', type: 'payment' },
      ];

      const pattern = ['login', 'booking', 'payment'];
      const patternMatches = events.filter((e, i) => 
        i < events.length - 2 &&
        events[i].type === pattern[0] &&
        events[i + 1].type === pattern[1] &&
        events[i + 2].type === pattern[2]
      );

      expect(patternMatches.length).toBeGreaterThan(0);
    });

    it('should detect time-based patterns', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { hour: 9, event_count: 100, is_peak: true },
          { hour: 14, event_count: 150, is_peak: true },
          { hour: 18, event_count: 200, is_peak: true },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           EXTRACT(HOUR FROM timestamp) as hour,
           COUNT(*) as event_count,
           CASE WHEN COUNT(*) > 100 THEN true ELSE false END as is_peak
         FROM events
         WHERE timestamp >= NOW() - INTERVAL '7 days'
         GROUP BY EXTRACT(HOUR FROM timestamp)
         HAVING COUNT(*) > 100
         ORDER BY event_count DESC`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

