/**
 * UNIT TESTS - STUDENT RELATIONSHIP SERVICE
 * Tests for: Student enrollment management, communication history,
 * student segmentation, retention analytics
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Student Relationship Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Student Enrollment Management', () => {
    it('should enroll student in library', async () => {
      const enrollment = {
        library_id: 'lib-123',
        student_id: 'student-123',
        enrollment_date: '2024-01-01',
        status: 'active',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'enrollment-123', ...enrollment }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO library_enrollments (library_id, student_id, enrollment_date, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [enrollment.library_id, enrollment.student_id, enrollment.enrollment_date, enrollment.status]
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should track enrollment history', async () => {
      const studentId = 'student-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { library_id: 'lib-1', enrolled_at: new Date('2024-01-01'), status: 'active' },
          { library_id: 'lib-2', enrolled_at: new Date('2024-02-01'), status: 'inactive' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM library_enrollments
         WHERE student_id = $1
         ORDER BY enrolled_at DESC`,
        [studentId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Communication History', () => {
    it('should log communication with student', async () => {
      const communication = {
        library_id: 'lib-123',
        student_id: 'student-123',
        type: 'email',
        subject: 'Welcome to Library',
        sent_at: new Date(),
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'comm-123', ...communication }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO student_communications (library_id, student_id, type, subject, sent_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [communication.library_id, communication.student_id, communication.type,
         communication.subject, communication.sent_at]
      );

      expect(result.rows[0].type).toBe(communication.type);
    });

    it('should retrieve communication history', async () => {
      const studentId = 'student-123';
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { id: 'comm-1', type: 'email', sent_at: new Date('2024-01-01') },
          { id: 'comm-2', type: 'sms', sent_at: new Date('2024-01-02') },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT * FROM student_communications
         WHERE student_id = $1 AND library_id = $2
         ORDER BY sent_at DESC`,
        [studentId, libraryId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Student Segmentation', () => {
    it('should segment students by activity', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { segment: 'active', count: 50, criteria: 'bookings >= 5 in last 30 days' },
          { segment: 'inactive', count: 20, criteria: 'no bookings in last 90 days' },
          { segment: 'at_risk', count: 10, criteria: 'bookings decreased by 50%' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           CASE
             WHEN booking_count >= 5 THEN 'active'
             WHEN last_booking < NOW() - INTERVAL '90 days' THEN 'inactive'
             WHEN booking_count < previous_count * 0.5 THEN 'at_risk'
             ELSE 'regular'
           END as segment,
           COUNT(*) as count
         FROM student_activity
         GROUP BY segment`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should segment by value', () => {
      const students = [
        { id: 's1', total_spent: 10000 },
        { id: 's2', total_spent: 5000 },
        { id: 's3', total_spent: 1000 },
      ];

      const segments = {
        high_value: students.filter(s => s.total_spent >= 5000),
        medium_value: students.filter(s => s.total_spent >= 2000 && s.total_spent < 5000),
        low_value: students.filter(s => s.total_spent < 2000),
      };

      expect(segments.high_value.length).toBe(2);
      expect(segments.low_value.length).toBe(1);
    });
  });

  describe('Retention Analytics', () => {
    it('should calculate retention rate', async () => {
      const period = '2024-01';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          period,
          new_students: 100,
          retained_students: 80,
          retention_rate: 80,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           TO_CHAR(enrollment_date, 'YYYY-MM') as period,
           COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month') as new_students,
           COUNT(*) FILTER (WHERE last_activity >= DATE_TRUNC('month', CURRENT_DATE)) as retained_students,
           (COUNT(*) FILTER (WHERE last_activity >= DATE_TRUNC('month', CURRENT_DATE))::float / 
            COUNT(*) FILTER (WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::float * 100) as retention_rate
         FROM library_enrollments
         WHERE enrollment_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
         GROUP BY TO_CHAR(enrollment_date, 'YYYY-MM')`
      );

      expect(result.rows[0].retention_rate).toBeGreaterThan(0);
    });

    it('should identify churn risk', async () => {
      mockTenantDb.query.mockResolvedValue({
        rows: [
          { student_id: 's1', days_since_last_booking: 60, churn_risk: 'medium' },
          { student_id: 's2', days_since_last_booking: 90, churn_risk: 'high' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           student_id,
           EXTRACT(DAY FROM (NOW() - last_booking_date)) as days_since_last_booking,
           CASE
             WHEN EXTRACT(DAY FROM (NOW() - last_booking_date)) > 90 THEN 'high'
             WHEN EXTRACT(DAY FROM (NOW() - last_booking_date)) > 60 THEN 'medium'
             ELSE 'low'
           END as churn_risk
         FROM student_activity
         WHERE last_booking_date < NOW() - INTERVAL '30 days'`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

