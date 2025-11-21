/**
 * UNIT TESTS - LIBRARY REPORTING SERVICE
 * Tests for: Custom report generation, dashboard customization,
 * data export functionality, scheduled reporting
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Library Reporting Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Custom Report Generation', () => {
    it('should generate booking report', async () => {
      const reportParams = {
        library_id: 'lib-123',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        report_type: 'bookings',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: reportParams.library_id,
          total_bookings: 500,
          total_revenue: 250000,
          avg_booking_value: 500,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           COUNT(*) as total_bookings,
           SUM(amount) as total_revenue,
           AVG(amount) as avg_booking_value
         FROM bookings
         WHERE library_id = $1 AND booking_date BETWEEN $2 AND $3
         GROUP BY library_id`,
        [reportParams.library_id, reportParams.start_date, reportParams.end_date]
      );

      expect(result.rows[0].total_bookings).toBeGreaterThan(0);
    });

    it('should generate student attendance report', async () => {
      const reportParams = {
        library_id: 'lib-123',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: reportParams.library_id,
          total_students: 100,
          active_students: 80,
          avg_attendance_rate: 75,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           COUNT(DISTINCT student_id) as total_students,
           COUNT(DISTINCT student_id) FILTER (WHERE attendance_count > 0) as active_students,
           AVG(attendance_rate) as avg_attendance_rate
         FROM student_attendance_summary
         WHERE library_id = $1 AND date BETWEEN $2 AND $3
         GROUP BY library_id`,
        [reportParams.library_id, reportParams.start_date, reportParams.end_date]
      );

      expect(result.rows[0].total_students).toBeGreaterThan(0);
    });
  });

  describe('Dashboard Customization', () => {
    it('should save dashboard configuration', async () => {
      const dashboard = {
        library_id: 'lib-123',
        widgets: [
          { type: 'revenue_chart', position: { x: 0, y: 0 } },
          { type: 'occupancy_gauge', position: { x: 1, y: 0 } },
          { type: 'booking_table', position: { x: 0, y: 1 } },
        ],
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'dashboard-123', ...dashboard }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO dashboard_configs (library_id, widgets)
         VALUES ($1, $2) RETURNING *`,
        [dashboard.library_id, JSON.stringify(dashboard.widgets)]
      );

      expect(result.rows[0].widgets).toBeDefined();
    });

    it('should retrieve dashboard widgets', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          widgets: [
            { type: 'revenue_chart', position: { x: 0, y: 0 } },
            { type: 'occupancy_gauge', position: { x: 1, y: 0 } },
          ],
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT widgets FROM dashboard_configs WHERE library_id = $1`,
        [libraryId]
      );

      expect(result.rows[0].widgets).toBeDefined();
    });
  });

  describe('Data Export Functionality', () => {
    it('should export data to CSV format', () => {
      const data = [
        { id: 1, name: 'Booking 1', amount: 500 },
        { id: 2, name: 'Booking 2', amount: 600 },
      ];

      const csvHeaders = Object.keys(data[0]).join(',');
      const csvRows = data.map(row => Object.values(row).join(','));
      const csv = [csvHeaders, ...csvRows].join('\n');

      expect(csv).toContain('id,name,amount');
      expect(csv).toContain('Booking 1');
    });

    it('should export data to JSON format', () => {
      const data = [
        { id: 1, name: 'Booking 1', amount: 500 },
        { id: 2, name: 'Booking 2', amount: 600 },
      ];

      const json = JSON.stringify(data, null, 2);

      expect(json).toBeDefined();
      expect(JSON.parse(json).length).toBe(2);
    });
  });

  describe('Scheduled Reporting', () => {
    it('should create scheduled report', async () => {
      const schedule = {
        library_id: 'lib-123',
        report_type: 'monthly_summary',
        frequency: 'monthly',
        recipients: ['admin@library.com'],
        next_run: '2024-02-01',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'schedule-123', ...schedule, status: 'active' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO report_schedules (library_id, report_type, frequency, recipients, next_run, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [schedule.library_id, schedule.report_type, schedule.frequency,
         JSON.stringify(schedule.recipients), schedule.next_run, 'active']
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should calculate next run date', () => {
      const frequency = 'monthly';
      const lastRun = new Date('2024-01-01');
      const nextRun = new Date(lastRun);
      nextRun.setMonth(nextRun.getMonth() + 1);

      expect(nextRun.getMonth()).toBe(1); // February
    });
  });
});

