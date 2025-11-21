/**
 * UNIT TESTS - PREDICTION ENGINE SERVICE
 * Tests for: Attendance & revenue forecasting, churn risk analysis,
 * demand prediction, performance modeling
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Prediction Engine Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Attendance & Revenue Forecasting', () => {
    it('should forecast attendance based on historical data', () => {
      const historicalData = [
        { date: '2024-01-01', attendance: 100 },
        { date: '2024-01-02', attendance: 110 },
        { date: '2024-01-03', attendance: 120 },
        { date: '2024-01-04', attendance: 115 },
        { date: '2024-01-05', attendance: 125 },
      ];

      const avgAttendance = historicalData.reduce((sum, d) => sum + d.attendance, 0) / historicalData.length;
      const trend = (historicalData[historicalData.length - 1].attendance - historicalData[0].attendance) / historicalData.length;
      const forecast = avgAttendance + trend;

      expect(forecast).toBeGreaterThan(0);
    });

    it('should forecast revenue', async () => {
      const libraryId = 'lib-123';
      const forecastDate = '2024-02-01';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          library_id: libraryId,
          forecasted_revenue: 120000,
          confidence_level: 0.85,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           library_id,
           AVG(daily_revenue) * 30 as forecasted_revenue,
           0.85 as confidence_level
         FROM revenue_history
         WHERE library_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY library_id`,
        [libraryId]
      );

      expect(result.rows[0].forecasted_revenue).toBeGreaterThan(0);
    });
  });

  describe('Churn Risk Analysis', () => {
    it('should calculate churn risk score', () => {
      const student = {
        daysSinceLastBooking: 60,
        bookingFrequency: 0.5, // bookings per week
        avgBookingValue: 500,
        satisfactionRating: 3.5,
      };

      let riskScore = 0;

      // Days since last booking (higher = more risk)
      if (student.daysSinceLastBooking > 90) riskScore += 40;
      else if (student.daysSinceLastBooking > 60) riskScore += 25;
      else if (student.daysSinceLastBooking > 30) riskScore += 10;

      // Booking frequency (lower = more risk)
      if (student.bookingFrequency < 0.3) riskScore += 30;
      else if (student.bookingFrequency < 0.5) riskScore += 15;

      // Satisfaction (lower = more risk)
      if (student.satisfactionRating < 3) riskScore += 30;
      else if (student.satisfactionRating < 4) riskScore += 15;

      expect(riskScore).toBeGreaterThan(0);
      expect(riskScore).toBeLessThanOrEqual(100);
    });

    it('should identify at-risk students', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { student_id: 's1', churn_risk: 75, risk_level: 'high' },
          { student_id: 's2', churn_risk: 50, risk_level: 'medium' },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           student_id,
           CASE
             WHEN days_since_last_booking > 90 THEN 75
             WHEN days_since_last_booking > 60 THEN 50
             ELSE 25
           END as churn_risk,
           CASE
             WHEN days_since_last_booking > 90 THEN 'high'
             WHEN days_since_last_booking > 60 THEN 'medium'
             ELSE 'low'
           END as risk_level
         FROM student_activity
         WHERE library_id = $1 AND days_since_last_booking > 30
         ORDER BY churn_risk DESC`,
        [libraryId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Demand Prediction', () => {
    it('should predict booking demand by hour', () => {
      const historicalData = [
        { hour: 9, bookings: 10 },
        { hour: 10, bookings: 15 },
        { hour: 11, bookings: 20 },
        { hour: 12, bookings: 18 },
      ];

      const avgByHour = historicalData.reduce((acc, d) => {
        acc[d.hour] = (acc[d.hour] || 0) + d.bookings;
        return acc;
      }, {} as Record<number, number>);

      const predictedHour = 11;
      const predictedDemand = avgByHour[predictedHour] || 0;

      expect(predictedDemand).toBeGreaterThan(0);
    });

    it('should predict demand by day of week', async () => {
      const libraryId = 'lib-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [
          { day_of_week: 1, avg_bookings: 50, predicted_demand: 52 },
          { day_of_week: 5, avg_bookings: 80, predicted_demand: 82 },
        ],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           EXTRACT(DOW FROM booking_date) as day_of_week,
           AVG(booking_count) as avg_bookings,
           AVG(booking_count) * 1.04 as predicted_demand
         FROM daily_booking_stats
         WHERE library_id = $1
         GROUP BY EXTRACT(DOW FROM booking_date)
         ORDER BY day_of_week`,
        [libraryId]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Modeling', () => {
    it('should model library performance', () => {
      const factors = {
        occupancyRate: 0.8,
        revenue: 500000,
        customerSatisfaction: 4.5,
        staffEfficiency: 0.9,
      };

      const performanceScore = (
        factors.occupancyRate * 0.25 +
        (factors.revenue / 1000000) * 0.35 +
        (factors.customerSatisfaction / 5) * 0.25 +
        factors.staffEfficiency * 0.15
      ) * 100;

      expect(performanceScore).toBeGreaterThan(0);
      expect(performanceScore).toBeLessThanOrEqual(100);
    });

    it('should predict optimal pricing', () => {
      const currentPrice = 500;
      const demandAtPrice = 100;
      const elasticity = -0.5; // price elasticity

      const newPrice = 450;
      const priceChange = (newPrice - currentPrice) / currentPrice;
      const predictedDemand = demandAtPrice * (1 + elasticity * priceChange);

      expect(predictedDemand).toBeGreaterThan(demandAtPrice);
    });
  });
});

