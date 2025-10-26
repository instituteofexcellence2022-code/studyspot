const {
  query
} = require('../config/database');
const {
  logger
} = require('../utils/logger');
class AnalyticsService {
  constructor() {
    this.metrics = new Map();
  }

  // Track user event
  async trackEvent(userId, eventType, eventData = {}, metadata = {}) {
    try {
      const eventRecord = {
        user_id: userId,
        event_type: eventType,
        event_data: JSON.stringify(eventData),
        metadata: JSON.stringify(metadata),
        timestamp: new Date().toISOString(),
        created_at: new Date()
      };

      // Store in database
      await query(`
        INSERT INTO analytics_events (user_id, event_type, event_data, metadata, timestamp)
        VALUES ($1, $2, $3, $4, $5)
      `, [eventRecord.user_id, eventRecord.event_type, eventRecord.event_data, eventRecord.metadata, eventRecord.timestamp]);

      // Update in-memory metrics
      this.updateMetrics(eventType, eventData);
      logger.info('Analytics event tracked', {
        userId: userId,
        eventType: eventType,
        eventData: eventData
      });
      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to track analytics event', {
        userId: userId,
        eventType: eventType,
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update in-memory metrics
  updateMetrics(eventType, eventData) {
    const key = `${eventType}_${new Date().toISOString().split('T')[0]}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        count: 0,
        eventType: eventType,
        date: new Date().toISOString().split('T')[0],
        data: {}
      });
    }
    const metric = this.metrics.get(key);
    metric.count += 1;

    // Aggregate event-specific data
    if (eventData) {
      Object.keys(eventData).forEach(dataKey => {
        if (typeof eventData[dataKey] === 'number') {
          if (!metric.data[dataKey]) {
            metric.data[dataKey] = {
              sum: 0,
              count: 0,
              avg: 0
            };
          }
          metric.data[dataKey].sum += eventData[dataKey];
          metric.data[dataKey].count += 1;
          metric.data[dataKey].avg = metric.data[dataKey].sum / metric.data[dataKey].count;
        }
      });
    }
  }

  // Get booking analytics
  async getBookingAnalytics(dateFrom = null, dateTo = null, groupBy = 'day') {
    try {
      let whereClause = '';
      const queryParams = [];
      let paramCount = 0;
      if (dateFrom) {
        whereClause += ` AND booking_date >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereClause += ` AND booking_date <= $${++paramCount}`;
        queryParams.push(dateTo);
      }
      let groupByClause = '';
      switch (groupBy) {
        case 'hour':
          groupByClause = 'DATE_TRUNC(\'hour\', booking_date)';
          break;
        case 'day':
          groupByClause = 'DATE(booking_date)';
          break;
        case 'week':
          groupByClause = 'DATE_TRUNC(\'week\', booking_date)';
          break;
        case 'month':
          groupByClause = 'DATE_TRUNC(\'month\', booking_date)';
          break;
        default:
          groupByClause = 'DATE(booking_date)';
      }
      const analyticsQuery = `
        SELECT 
          ${groupByClause} as period,
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
          AVG(total_amount) as avg_booking_amount,
          SUM(total_amount) as total_revenue,
          COUNT(DISTINCT user_id) as unique_users
        FROM bookings
        WHERE 1=1 ${whereClause}
        GROUP BY ${groupByClause}
        ORDER BY period DESC
      `;
      const result = await query(analyticsQuery, queryParams);
      return {
        success: true,
        data: result.rows.map(row => ({
          period: row.period,
          totalBookings: parseInt(row.total_bookings),
          confirmedBookings: parseInt(row.confirmed_bookings),
          cancelledBookings: parseInt(row.cancelled_bookings),
          completedBookings: parseInt(row.completed_bookings),
          avgBookingAmount: parseFloat(row.avg_booking_amount) || 0,
          totalRevenue: parseFloat(row.total_revenue) || 0,
          uniqueUsers: parseInt(row.unique_users)
        }))
      };
    } catch (error) {
      logger.error('Failed to get booking analytics', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(dateFrom = null, dateTo = null, groupBy = 'day') {
    try {
      let whereClause = '';
      const queryParams = [];
      let paramCount = 0;
      if (dateFrom) {
        whereClause += ` AND created_at >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereClause += ` AND created_at <= $${++paramCount}`;
        queryParams.push(dateTo);
      }
      let groupByClause = '';
      switch (groupBy) {
        case 'hour':
          groupByClause = 'DATE_TRUNC(\'hour\', created_at)';
          break;
        case 'day':
          groupByClause = 'DATE(created_at)';
          break;
        case 'week':
          groupByClause = 'DATE_TRUNC(\'week\', created_at)';
          break;
        case 'month':
          groupByClause = 'DATE_TRUNC(\'month\', created_at)';
          break;
        default:
          groupByClause = 'DATE(created_at)';
      }
      const analyticsQuery = `
        SELECT 
          ${groupByClause} as period,
          COUNT(*) as total_payments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
          AVG(amount) as avg_payment_amount,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
          COUNT(DISTINCT user_id) as unique_payers
        FROM payments
        WHERE 1=1 ${whereClause}
        GROUP BY ${groupByClause}
        ORDER BY period DESC
      `;
      const result = await query(analyticsQuery, queryParams);
      return {
        success: true,
        data: result.rows.map(row => ({
          period: row.period,
          totalPayments: parseInt(row.total_payments),
          successfulPayments: parseInt(row.successful_payments),
          failedPayments: parseInt(row.failed_payments),
          refundedPayments: parseInt(row.refunded_payments),
          avgPaymentAmount: parseFloat(row.avg_payment_amount) || 0,
          totalRevenue: parseFloat(row.total_revenue) || 0,
          uniquePayers: parseInt(row.unique_payers)
        }))
      };
    } catch (error) {
      logger.error('Failed to get payment analytics', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user analytics
  async getUserAnalytics(dateFrom = null, dateTo = null) {
    try {
      let whereClause = '';
      const queryParams = [];
      let paramCount = 0;
      if (dateFrom) {
        whereClause += ` AND created_at >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereClause += ` AND created_at <= $${++paramCount}`;
        queryParams.push(dateTo);
      }
      const analyticsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as student_users,
          COUNT(CASE WHEN role = 'library_staff' THEN 1 END) as library_staff_users,
          COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as admin_users,
          COUNT(DISTINCT DATE(created_at)) as signup_days
        FROM users
        WHERE 1=1 ${whereClause}
      `;
      const result = await query(analyticsQuery, queryParams);
      const row = result.rows[0];
      return {
        success: true,
        data: {
          totalUsers: parseInt(row.total_users),
          activeUsers: parseInt(row.active_users),
          inactiveUsers: parseInt(row.inactive_users),
          studentUsers: parseInt(row.student_users),
          libraryStaffUsers: parseInt(row.library_staff_users),
          adminUsers: parseInt(row.admin_users),
          signupDays: parseInt(row.signup_days)
        }
      };
    } catch (error) {
      logger.error('Failed to get user analytics', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get library analytics
  async getLibraryAnalytics(dateFrom = null, dateTo = null) {
    try {
      let whereClause = '';
      const queryParams = [];
      let paramCount = 0;
      if (dateFrom) {
        whereClause += ` AND b.booking_date >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }
      if (dateTo) {
        whereClause += ` AND b.booking_date <= $${++paramCount}`;
        queryParams.push(dateTo);
      }
      const analyticsQuery = `
        SELECT 
          l.id,
          l.name,
          l.capacity,
          COUNT(b.id) as total_bookings,
          COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
          AVG(b.total_amount) as avg_booking_amount,
          SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as total_revenue,
          COUNT(DISTINCT b.user_id) as unique_users
        FROM libraries l
        LEFT JOIN bookings b ON l.id = b.library_id AND 1=1 ${whereClause}
        WHERE l.status = 'active'
        GROUP BY l.id, l.name, l.capacity
        ORDER BY total_bookings DESC
      `;
      const result = await query(analyticsQuery, queryParams);
      return {
        success: true,
        data: result.rows.map(row => ({
          libraryId: row.id,
          libraryName: row.name,
          capacity: parseInt(row.capacity),
          totalBookings: parseInt(row.total_bookings),
          confirmedBookings: parseInt(row.confirmed_bookings),
          cancelledBookings: parseInt(row.cancelled_bookings),
          avgBookingAmount: parseFloat(row.avg_booking_amount) || 0,
          totalRevenue: parseFloat(row.total_revenue) || 0,
          uniqueUsers: parseInt(row.unique_users),
          utilizationRate: row.capacity > 0 ? parseInt(row.confirmed_bookings) / row.capacity * 100 : 0
        }))
      };
    } catch (error) {
      logger.error('Failed to get library analytics', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get dashboard summary
  async getDashboardSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      // Get today's stats
      const todayStats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM bookings WHERE DATE(booking_date) = $1) as today_bookings,
          (SELECT COUNT(*) FROM payments WHERE DATE(created_at) = $1 AND status = 'completed') as today_payments,
          (SELECT SUM(amount) FROM payments WHERE DATE(created_at) = $1 AND status = 'completed') as today_revenue
      `, [today]);

      // Get this month's stats
      const monthStats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM bookings WHERE booking_date >= $1) as month_bookings,
          (SELECT COUNT(*) FROM payments WHERE created_at >= $1 AND status = 'completed') as month_payments,
          (SELECT SUM(amount) FROM payments WHERE created_at >= $1 AND status = 'completed') as month_revenue
      `, [`${thisMonth}-01`]);

      // Get total stats
      const totalStats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
          (SELECT COUNT(*) FROM libraries WHERE status = 'active') as total_libraries,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT SUM(amount) FROM payments WHERE status = 'completed') as total_revenue
      `);
      return {
        success: true,
        data: {
          today: {
            bookings: parseInt(todayStats.rows[0].today_bookings),
            payments: parseInt(todayStats.rows[0].today_payments),
            revenue: parseFloat(todayStats.rows[0].today_revenue) || 0
          },
          thisMonth: {
            bookings: parseInt(monthStats.rows[0].month_bookings),
            payments: parseInt(monthStats.rows[0].month_payments),
            revenue: parseFloat(monthStats.rows[0].month_revenue) || 0
          },
          total: {
            users: parseInt(totalStats.rows[0].total_users),
            libraries: parseInt(totalStats.rows[0].total_libraries),
            bookings: parseInt(totalStats.rows[0].total_bookings),
            revenue: parseFloat(totalStats.rows[0].total_revenue) || 0
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get dashboard summary', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get real-time metrics
  getRealTimeMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const metrics = [];
    this.metrics.forEach((metric, key) => {
      if (key.includes(today)) {
        metrics.push({
          eventType: metric.eventType,
          date: metric.date,
          count: metric.count,
          data: metric.data
        });
      }
    });
    return {
      success: true,
      data: {
        date: today,
        metrics: metrics
      }
    };
  }

  // Clear old metrics (run periodically)
  clearOldMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const keysToDelete = [];
    this.metrics.forEach((metric, key) => {
      if (!key.includes(today)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => {
      this.metrics.delete(key);
    });
    logger.info('Cleared old analytics metrics', {
      deletedCount: keysToDelete.length
    });
  }

  // ML-Powered Insights: Predict future trends
  async getPredictiveTrends(dateFrom = null, dateTo = null) {
    try {
      const bookingAnalytics = await this.getBookingAnalytics(dateFrom, dateTo, 'day');
      if (!bookingAnalytics.success || bookingAnalytics.data.length < 7) {
        return {
          success: false,
          error: 'Insufficient data for prediction'
        };
      }
      const data = bookingAnalytics.data;

      // Simple linear regression for trend prediction
      const predictions = this.calculateTrendPredictions(data);

      // Calculate growth rate
      const growthRate = this.calculateGrowthRate(data);

      // Identify patterns
      const patterns = this.identifyPatterns(data);
      return {
        success: true,
        data: {
          predictions: predictions,
          growthRate: growthRate,
          patterns: patterns,
          confidence: this.calculatePredictionConfidence(data),
          insights: this.generatePredictiveInsights(predictions, growthRate, patterns)
        }
      };
    } catch (error) {
      logger.error('Failed to get predictive trends', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate trend predictions using linear regression
  calculateTrendPredictions(data) {
    const n = data.length;
    const values = data.map(d => d.totalBookings);

    // Calculate linear regression
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 7 days
    const predictions = [];
    for (let i = n; i < n + 7; i++) {
      predictions.push({
        day: i - n + 1,
        predictedBookings: Math.max(0, Math.round(slope * i + intercept)),
        confidence: this.calculateDayConfidence(i - n + 1)
      });
    }
    return predictions;
  }

  // Calculate growth rate
  calculateGrowthRate(data) {
    if (data.length < 2) return 0;
    const firstWeek = data.slice(0, 7).reduce((sum, d) => sum + d.totalBookings, 0);
    const lastWeek = data.slice(-7).reduce((sum, d) => sum + d.totalBookings, 0);
    const growth = (lastWeek - firstWeek) / firstWeek * 100;
    return {
      percentage: parseFloat(growth.toFixed(2)),
      trend: growth > 5 ? 'increasing' : growth < -5 ? 'decreasing' : 'stable',
      firstWeekAvg: (firstWeek / 7).toFixed(2),
      lastWeekAvg: (lastWeek / 7).toFixed(2)
    };
  }

  // Identify patterns in data
  identifyPatterns(data) {
    const patterns = {
      weekdayTrend: this.analyzeWeekdayPattern(data),
      peakDays: this.findPeakDays(data),
      seasonality: this.detectSeasonality(data)
    };
    return patterns;
  }

  // Analyze weekday patterns
  analyzeWeekdayPattern(data) {
    const weekdayBookings = {};
    data.forEach(d => {
      const date = new Date(d.period);
      const dayOfWeek = date.getDay();
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      if (!weekdayBookings[dayName]) {
        weekdayBookings[dayName] = {
          total: 0,
          count: 0
        };
      }
      weekdayBookings[dayName].total += d.totalBookings;
      weekdayBookings[dayName].count += 1;
    });
    return Object.entries(weekdayBookings).map(([day, stats]) => ({
      day: day,
      avgBookings: (stats.total / stats.count).toFixed(2),
      totalBookings: stats.total
    })).sort((a, b) => b.avgBookings - a.avgBookings);
  }

  // Find peak days
  findPeakDays(data) {
    const sorted = [...data].sort((a, b) => b.totalBookings - a.totalBookings);
    return sorted.slice(0, 5).map(d => ({
      date: d.period,
      bookings: d.totalBookings,
      revenue: d.totalRevenue
    }));
  }

  // Detect seasonality
  detectSeasonality(data) {
    if (data.length < 30) return {
      detected: false
    };
    const avgBookings = data.reduce((sum, d) => sum + d.totalBookings, 0) / data.length;
    const variance = data.reduce((sum, d) => sum + Math.pow(d.totalBookings - avgBookings, 2), 0) / data.length;
    return {
      detected: variance > avgBookings * 0.5,
      avgBookings: avgBookings.toFixed(2),
      variance: variance.toFixed(2),
      stability: variance < avgBookings * 0.3 ? 'stable' : variance < avgBookings ? 'moderate' : 'volatile'
    };
  }

  // Calculate prediction confidence
  calculatePredictionConfidence(data) {
    const variance = this.detectSeasonality(data).variance;
    const avgBookings = data.reduce((sum, d) => sum + d.totalBookings, 0) / data.length;
    const confidence = Math.max(0, Math.min(100, 100 - variance / avgBookings * 50));
    return {
      score: parseFloat(confidence.toFixed(2)),
      level: confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low'
    };
  }

  // Calculate day confidence (decreases with distance)
  calculateDayConfidence(day) {
    return Math.max(50, 100 - day * 7);
  }

  // Generate predictive insights
  generatePredictiveInsights(predictions, growthRate, patterns) {
    const insights = [];

    // Growth insights
    if (growthRate.trend === 'increasing') {
      insights.push({
        type: 'growth',
        priority: 'high',
        message: `Bookings are growing at ${growthRate.percentage}% - consider increasing capacity`,
        recommendation: 'Add more seats or extend hours during peak times'
      });
    } else if (growthRate.trend === 'decreasing') {
      insights.push({
        type: 'decline',
        priority: 'high',
        message: `Bookings declining by ${Math.abs(growthRate.percentage)}% - action needed`,
        recommendation: 'Review pricing, run promotions, or improve services'
      });
    }

    // Weekday insights
    if (patterns.weekdayTrend.length > 0) {
      const bestDay = patterns.weekdayTrend[0];
      const worstDay = patterns.weekdayTrend[patterns.weekdayTrend.length - 1];
      insights.push({
        type: 'pattern',
        priority: 'medium',
        message: `${bestDay.day} is your busiest day (${bestDay.avgBookings} avg bookings)`,
        recommendation: `Consider special offers on ${worstDay.day} to balance demand`
      });
    }

    // Prediction insights
    const avgPrediction = predictions.reduce((sum, p) => sum + p.predictedBookings, 0) / predictions.length;
    const currentAvg = parseFloat(growthRate.lastWeekAvg);
    if (avgPrediction > currentAvg * 1.1) {
      insights.push({
        type: 'forecast',
        priority: 'medium',
        message: 'Increased demand expected next week',
        recommendation: 'Ensure adequate staffing and resources'
      });
    }
    return insights;
  }

  // Get anomaly detection
  async detectAnomalies(dateFrom = null, dateTo = null) {
    try {
      const bookingAnalytics = await this.getBookingAnalytics(dateFrom, dateTo, 'day');
      if (!bookingAnalytics.success || bookingAnalytics.data.length < 7) {
        return {
          success: false,
          error: 'Insufficient data for anomaly detection'
        };
      }
      const data = bookingAnalytics.data;
      const avgBookings = data.reduce((sum, d) => sum + d.totalBookings, 0) / data.length;
      const stdDev = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.totalBookings - avgBookings, 2), 0) / data.length);

      // Detect anomalies (values beyond 2 standard deviations)
      const anomalies = data.filter(d => {
        const deviation = Math.abs(d.totalBookings - avgBookings);
        return deviation > stdDev * 2;
      }).map(d => ({
        date: d.period,
        bookings: d.totalBookings,
        expected: avgBookings.toFixed(2),
        deviation: ((d.totalBookings - avgBookings) / avgBookings * 100).toFixed(2) + '%',
        type: d.totalBookings > avgBookings ? 'spike' : 'drop'
      }));
      return {
        success: true,
        data: {
          anomalies: anomalies,
          statistics: {
            average: avgBookings.toFixed(2),
            stdDeviation: stdDev.toFixed(2),
            threshold: (stdDev * 2).toFixed(2)
          },
          insights: anomalies.length > 0 ? `Found ${anomalies.length} anomalies in the data` : 'No significant anomalies detected - data is stable'
        }
      };
    } catch (error) {
      logger.error('Failed to detect anomalies', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get cohort analysis
  async getCohortAnalysis(cohortType = 'monthly') {
    try {
      const cohortQuery = `
        SELECT 
          DATE_TRUNC('${cohortType}', u.created_at) as cohort,
          COUNT(DISTINCT u.id) as users,
          COUNT(DISTINCT b.id) as bookings,
          AVG(b.total_amount) as avg_booking_value,
          COUNT(DISTINCT b.id) / COUNT(DISTINCT u.id) as bookings_per_user
        FROM users u
        LEFT JOIN bookings b ON u.id = b.user_id
        WHERE u.created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('${cohortType}', u.created_at)
        ORDER BY cohort DESC
      `;
      const result = await query(cohortQuery);
      return {
        success: true,
        data: result.rows.map(row => ({
          cohort: row.cohort,
          users: parseInt(row.users),
          bookings: parseInt(row.bookings),
          avgBookingValue: parseFloat(row.avg_booking_value) || 0,
          bookingsPerUser: parseFloat(row.bookings_per_user) || 0
        }))
      };
    } catch (error) {
      logger.error('Failed to get cohort analysis', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
module.exports = new AnalyticsService();