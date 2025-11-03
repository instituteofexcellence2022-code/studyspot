/**
 * Dashboard Service
 * Provides dashboard metrics and analytics for library owners/staff
 */

const {
  pool
} = require('../config/database');
const {
  logger
} = require('../utils/logger');

/**
 * Get real-time metrics for dashboard
 */
async function getDashboardMetrics(userId, userRole, libraryId = null, tenantId = null) {
  try {
    const metrics = {};

    // Build WHERE clause based on user role
    let whereClause = '';
    const params = [];
    if (userRole === 'super_admin') {
      // Super admin sees everything
      whereClause = '1=1';
    } else if (userRole === 'library_owner' && tenantId) {
      // Library owner sees all their branches
      whereClause = 'l.tenant_id = $1';
      params.push(tenantId);
    } else if (libraryId) {
      // Branch-level roles see their library only
      whereClause = 'l.id = $1';
      params.push(libraryId);
    } else {
      throw new Error('Insufficient access information');
    }

    // 1. Total Students
    const studentQuery = `
      SELECT COUNT(*) as total
      FROM users u
      INNER JOIN libraries l ON u.library_id = l.id
      WHERE u.role = 'student' AND ${whereClause}
    `;
    const studentResult = await pool.query(studentQuery, params);
    metrics.totalStudents = parseInt(studentResult.rows[0]?.total || 0);

    // 2. Active Students (attended in last 7 days)
    const activeStudentQuery = `
      SELECT COUNT(DISTINCT user_id) as active
      FROM attendance a
      INNER JOIN libraries l ON a.library_id = l.id
      WHERE a.check_in_time >= NOW() - INTERVAL '7 days' AND ${whereClause}
    `;
    const activeResult = await pool.query(activeStudentQuery, params);
    metrics.activeStudents = parseInt(activeResult.rows[0]?.active || 0);

    // 3. Current Occupancy
    const occupancyQuery = `
      SELECT COUNT(*) as occupied
      FROM attendance a
      INNER JOIN libraries l ON a.library_id = l.id
      WHERE a.check_in_time IS NOT NULL 
        AND a.check_out_time IS NULL 
        AND ${whereClause}
    `;
    const occupancyResult = await pool.query(occupancyQuery, params);
    metrics.currentOccupancy = parseInt(occupancyResult.rows[0]?.occupied || 0);

    // 4. Total Seats
    const seatsQuery = `
      SELECT SUM(total_seats) as total
      FROM libraries l
      WHERE ${whereClause}
    `;
    const seatsResult = await pool.query(seatsQuery, params);
    metrics.totalSeats = parseInt(seatsResult.rows[0]?.total || 0);
    metrics.occupancyRate = metrics.totalSeats > 0 ? (metrics.currentOccupancy / metrics.totalSeats * 100).toFixed(1) : 0;

    // 5. Today's Revenue
    const todayRevenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE DATE(p.created_at) = CURRENT_DATE 
        AND p.status = 'completed'
        AND ${whereClause}
    `;
    const revenueResult = await pool.query(todayRevenueQuery, params);
    metrics.todayRevenue = parseFloat(revenueResult.rows[0]?.revenue || 0);

    // 6. This Month's Revenue
    const monthRevenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        AND p.status = 'completed'
        AND ${whereClause}
    `;
    const monthResult = await pool.query(monthRevenueQuery, params);
    metrics.monthRevenue = parseFloat(monthResult.rows[0]?.revenue || 0);

    // 7. Pending Payments
    const pendingQuery = `
      SELECT COUNT(*) as pending
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE p.status = 'pending' AND ${whereClause}
    `;
    const pendingResult = await pool.query(pendingQuery, params);
    metrics.pendingPayments = parseInt(pendingResult.rows[0]?.pending || 0);

    // 8. New Students (this month)
    const newStudentsQuery = `
      SELECT COUNT(*) as new_count
      FROM users u
      INNER JOIN libraries l ON u.library_id = l.id
      WHERE u.role = 'student' 
        AND DATE_TRUNC('month', u.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        AND ${whereClause}
    `;
    const newResult = await pool.query(newStudentsQuery, params);
    metrics.newStudents = parseInt(newResult.rows[0]?.new_count || 0);
    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

/**
 * Get revenue trend data for charts (last 30 days)
 */
async function getRevenueTrend(userId, userRole, libraryId = null, tenantId = null, days = 30) {
  try {
    let whereClause = '';
    const params = [days];
    if (userRole === 'super_admin') {
      whereClause = '1=1';
    } else if (userRole === 'library_owner' && tenantId) {
      whereClause = 'l.tenant_id = $2';
      params.push(tenantId);
    } else if (libraryId) {
      whereClause = 'l.id = $2';
      params.push(libraryId);
    }
    const query = `
      SELECT 
        DATE(p.created_at) as date,
        COALESCE(SUM(p.amount), 0) as revenue,
        COUNT(p.id) as transaction_count
      FROM payments p
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE p.created_at >= CURRENT_DATE - $1::integer
        AND p.status = 'completed'
        AND ${whereClause}
      GROUP BY DATE(p.created_at)
      ORDER BY DATE(p.created_at)
    `;
    const result = await pool.query(query, params);
    return {
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        transactions: parseInt(row.transaction_count)
      }))
    };
  } catch (error) {
    logger.error('Error fetching revenue trend:', error);
    throw error;
  }
}

/**
 * Get recent activity feed
 */
async function getRecentActivity(userId, userRole, libraryId = null, tenantId = null, limit = 20) {
  try {
    let whereClause = '';
    const params = [limit];
    if (userRole === 'super_admin') {
      whereClause = '1=1';
    } else if (userRole === 'library_owner' && tenantId) {
      whereClause = 'l.tenant_id = $2';
      params.push(tenantId);
    } else if (libraryId) {
      whereClause = 'l.id = $2';
      params.push(libraryId);
    }

    // Get mix of different activities
    const activities = [];

    // Recent bookings
    const bookingsQuery = `
      SELECT 
        'booking' as type,
        b.id,
        b.created_at,
        u.name as user_name,
        l.name as library_name,
        b.status
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN libraries l ON b.library_id = l.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $1
    `;
    const bookings = await pool.query(bookingsQuery, params);
    activities.push(...bookings.rows);

    // Recent payments
    const paymentsQuery = `
      SELECT 
        'payment' as type,
        p.id,
        p.created_at,
        u.name as user_name,
        l.name as library_name,
        p.amount,
        p.status
      FROM payments p
      INNER JOIN users u ON p.user_id = u.id
      INNER JOIN libraries l ON p.library_id = l.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $1
    `;
    const payments = await pool.query(paymentsQuery, params);
    activities.push(...payments.rows);

    // Recent student registrations
    const studentsQuery = `
      SELECT 
        'student_registered' as type,
        u.id,
        u.created_at,
        u.name as user_name,
        l.name as library_name
      FROM users u
      INNER JOIN libraries l ON u.library_id = l.id
      WHERE u.role = 'student' AND ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $1
    `;
    const students = await pool.query(studentsQuery, params);
    activities.push(...students.rows);

    // Sort all activities by date and limit
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limitedActivities = activities.slice(0, limit);
    return {
      success: true,
      data: limitedActivities
    };
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    throw error;
  }
}

/**
 * Get attendance trends (last 7 days)
 */
async function getAttendanceTrend(userId, userRole, libraryId = null, tenantId = null) {
  try {
    let whereClause = '';
    const params = [];
    if (userRole === 'super_admin') {
      whereClause = '1=1';
    } else if (userRole === 'library_owner' && tenantId) {
      whereClause = 'l.tenant_id = $1';
      params.push(tenantId);
    } else if (libraryId) {
      whereClause = 'l.id = $1';
      params.push(libraryId);
    }
    const query = `
      SELECT 
        DATE(a.check_in_time) as date,
        COUNT(DISTINCT a.user_id) as unique_visitors,
        COUNT(*) as total_check_ins
      FROM attendance a
      INNER JOIN libraries l ON a.library_id = l.id
      WHERE a.check_in_time >= CURRENT_DATE - INTERVAL '7 days'
        AND ${whereClause}
      GROUP BY DATE(a.check_in_time)
      ORDER BY DATE(a.check_in_time)
    `;
    const result = await pool.query(query, params);
    return {
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        uniqueVisitors: parseInt(row.unique_visitors),
        totalCheckIns: parseInt(row.total_check_ins)
      }))
    };
  } catch (error) {
    logger.error('Error fetching attendance trend:', error);
    throw error;
  }
}

/**
 * Get top performing branches (for library owners)
 */
async function getTopBranches(tenantId, limit = 5) {
  try {
    const query = `
      SELECT 
        l.id,
        l.name,
        l.city,
        COUNT(DISTINCT b.user_id) as student_count,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        l.total_seats,
        COUNT(DISTINCT a.user_id) as active_users
      FROM libraries l
      LEFT JOIN bookings b ON l.id = b.library_id
      LEFT JOIN payments p ON l.id = p.library_id AND p.status = 'completed'
      LEFT JOIN attendance a ON l.id = a.library_id 
        AND a.check_in_time >= CURRENT_DATE - INTERVAL '30 days'
      WHERE l.tenant_id = $1
      GROUP BY l.id, l.name, l.city, l.total_seats
      ORDER BY total_revenue DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [tenantId, limit]);
    return {
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        city: row.city,
        studentCount: parseInt(row.student_count),
        revenue: parseFloat(row.total_revenue),
        totalSeats: row.total_seats,
        activeUsers: parseInt(row.active_users)
      }))
    };
  } catch (error) {
    logger.error('Error fetching top branches:', error);
    throw error;
  }
}
module.exports = {
  getDashboardMetrics,
  getRevenueTrend,
  getRecentActivity,
  getAttendanceTrend,
  getTopBranches
};