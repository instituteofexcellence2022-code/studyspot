const { query } = require('../config/database');
const { logger } = require('../utils/logger');

class StudyToolsService {
  constructor() {
    this.activeTimers = new Map(); // In-memory store for active timers
    this.pomodoroDefaults = {
      focusDuration: 25, // minutes
      shortBreak: 5,
      longBreak: 15,
      sessionsBeforeLongBreak: 4
    };
  }

  // Create a new study session
  async createStudySession(userId, sessionData) {
    try {
      const { bookingId, type = 'pomodoro', customSettings = null } = sessionData;

      const settings = customSettings || this.pomodoroDefaults;

      const result = await query(`
        INSERT INTO study_sessions (
          user_id, booking_id, session_type, settings, status, 
          started_at, total_focus_time, total_break_time
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), 0, 0)
        RETURNING id, user_id, booking_id, session_type, settings, status, started_at, created_at
      `, [
        userId,
        bookingId || null,
        type,
        JSON.stringify(settings),
        'active'
      ]);

      const session = result.rows[0];

      logger.info('Study session created', {
        userId: userId,
        sessionId: session.id,
        type: type
      });

      return { success: true, data: session };
    } catch (error) {
      logger.error('Failed to create study session', error);
      return { success: false, error: error.message };
    }
  }

  // Start a timer (focus or break)
  async startTimer(userId, sessionId, timerType = 'focus', duration) {
    try {
      // Create timer record
      const result = await query(`
        INSERT INTO study_timers (
          session_id, user_id, timer_type, duration_minutes, 
          started_at, status
        )
        VALUES ($1, $2, $3, $4, NOW(), $5)
        RETURNING id, session_id, timer_type, duration_minutes, started_at, status
      `, [sessionId, userId, timerType, duration, 'running']);

      const timer = result.rows[0];

      // Store in memory for quick access
      this.activeTimers.set(timer.id, {
        ...timer,
        userId: userId,
        endTime: new Date(Date.now() + duration * 60 * 1000)
      });

      logger.info('Timer started', {
        userId: userId,
        timerId: timer.id,
        type: timerType,
        duration: duration
      });

      return { success: true, data: timer };
    } catch (error) {
      logger.error('Failed to start timer', error);
      return { success: false, error: error.message };
    }
  }

  // Complete a timer
  async completeTimer(userId, timerId) {
    try {
      const result = await query(`
        UPDATE study_timers 
        SET status = 'completed', completed_at = NOW(), 
            actual_duration = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
        WHERE id = $1 AND user_id = $2
        RETURNING id, session_id, timer_type, duration_minutes, actual_duration, status
      `, [timerId, userId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Timer not found' };
      }

      const timer = result.rows[0];

      // Update session totals
      if (timer.timer_type === 'focus') {
        await query(`
          UPDATE study_sessions 
          SET total_focus_time = total_focus_time + $1
          WHERE id = $2
        `, [timer.actual_duration, timer.session_id]);
      } else {
        await query(`
          UPDATE study_sessions 
          SET total_break_time = total_break_time + $1
          WHERE id = $2
        `, [timer.actual_duration, timer.session_id]);
      }

      // Remove from active timers
      this.activeTimers.delete(timerId);

      // Calculate focus score
      const focusScore = this.calculateFocusScore(timer);

      logger.info('Timer completed', {
        userId: userId,
        timerId: timerId,
        focusScore: focusScore
      });

      return { 
        success: true, 
        data: { ...timer, focusScore } 
      };
    } catch (error) {
      logger.error('Failed to complete timer', error);
      return { success: false, error: error.message };
    }
  }

  // Pause a timer
  async pauseTimer(userId, timerId) {
    try {
      const result = await query(`
        UPDATE study_timers 
        SET status = 'paused', paused_at = NOW()
        WHERE id = $1 AND user_id = $2 AND status = 'running'
        RETURNING id, status, paused_at
      `, [timerId, userId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Timer not found or not running' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to pause timer', error);
      return { success: false, error: error.message };
    }
  }

  // Resume a timer
  async resumeTimer(userId, timerId) {
    try {
      const result = await query(`
        UPDATE study_timers 
        SET status = 'running', paused_at = NULL
        WHERE id = $1 AND user_id = $2 AND status = 'paused'
        RETURNING id, status
      `, [timerId, userId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Timer not found or not paused' };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to resume timer', error);
      return { success: false, error: error.message };
    }
  }

  // Get active study session
  async getActiveSession(userId) {
    try {
      const result = await query(`
        SELECT 
          s.*,
          (
            SELECT json_agg(t.*)
            FROM study_timers t
            WHERE t.session_id = s.id
            ORDER BY t.started_at DESC
          ) as timers
        FROM study_sessions s
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.started_at DESC
        LIMIT 1
      `, [userId]);

      if (result.rows.length === 0) {
        return { success: true, data: null };
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to get active session', error);
      return { success: false, error: error.message };
    }
  }

  // End study session
  async endStudySession(userId, sessionId) {
    try {
      // Complete any running timers
      await query(`
        UPDATE study_timers 
        SET status = 'completed', completed_at = NOW(),
            actual_duration = EXTRACT(EPOCH FROM (NOW() - started_at)) / 60
        WHERE session_id = $1 AND status IN ('running', 'paused')
      `, [sessionId]);

      // End the session
      const result = await query(`
        UPDATE study_sessions 
        SET status = 'completed', ended_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING id, total_focus_time, total_break_time, started_at, ended_at
      `, [sessionId, userId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Session not found' };
      }

      const session = result.rows[0];

      // Calculate session statistics
      const stats = await this.calculateSessionStats(sessionId);

      return { 
        success: true, 
        data: { ...session, statistics: stats } 
      };
    } catch (error) {
      logger.error('Failed to end study session', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate focus score
  calculateFocusScore(timer) {
    const { duration_minutes, actual_duration } = timer;
    
    if (!actual_duration || actual_duration === 0) return 0;

    // Score based on how close actual duration is to planned duration
    const completionRatio = actual_duration / duration_minutes;
    
    if (completionRatio >= 0.9 && completionRatio <= 1.1) {
      return 100; // Perfect execution
    } else if (completionRatio >= 0.7 && completionRatio <= 1.3) {
      return 80; // Good execution
    } else if (completionRatio >= 0.5) {
      return 60; // Acceptable
    } else {
      return 40; // Needs improvement
    }
  }

  // Calculate session statistics
  async calculateSessionStats(sessionId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_timers,
          COUNT(CASE WHEN timer_type = 'focus' THEN 1 END) as focus_timers,
          COUNT(CASE WHEN timer_type = 'break' THEN 1 END) as break_timers,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_timers,
          AVG(CASE WHEN timer_type = 'focus' THEN actual_duration END) as avg_focus_duration,
          SUM(CASE WHEN timer_type = 'focus' THEN actual_duration ELSE 0 END) as total_focus_time,
          SUM(CASE WHEN timer_type = 'break' THEN actual_duration ELSE 0 END) as total_break_time
        FROM study_timers
        WHERE session_id = $1
      `, [sessionId]);

      const stats = result.rows[0];

      return {
        totalTimers: parseInt(stats.total_timers),
        focusTimers: parseInt(stats.focus_timers),
        breakTimers: parseInt(stats.break_timers),
        completedTimers: parseInt(stats.completed_timers),
        avgFocusDuration: parseFloat(stats.avg_focus_duration) || 0,
        totalFocusTime: parseFloat(stats.total_focus_time) || 0,
        totalBreakTime: parseFloat(stats.total_break_time) || 0,
        completionRate: stats.total_timers > 0 
          ? ((parseInt(stats.completed_timers) / parseInt(stats.total_timers)) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      logger.error('Failed to calculate session stats', error);
      return {};
    }
  }

  // Get study session history
  async getSessionHistory(userId, options = {}) {
    try {
      const { limit = 20, offset = 0, dateFrom, dateTo } = options;

      let whereClause = 'WHERE s.user_id = $1';
      const queryParams = [userId];
      let paramCount = 1;

      if (dateFrom) {
        whereClause += ` AND s.started_at >= $${++paramCount}`;
        queryParams.push(dateFrom);
      }

      if (dateTo) {
        whereClause += ` AND s.started_at <= $${++paramCount}`;
        queryParams.push(dateTo);
      }

      const sessionsQuery = `
        SELECT 
          s.id,
          s.session_type,
          s.status,
          s.total_focus_time,
          s.total_break_time,
          s.started_at,
          s.ended_at,
          s.settings,
          (
            SELECT COUNT(*)
            FROM study_timers t
            WHERE t.session_id = s.id AND t.status = 'completed'
          ) as completed_timers
        FROM study_sessions s
        ${whereClause}
        ORDER BY s.started_at DESC
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      queryParams.push(limit, offset);

      const result = await query(sessionsQuery, queryParams);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get session history', error);
      return { success: false, error: error.message };
    }
  }

  // Get study statistics
  async getStudyStatistics(userId, period = '30days') {
    try {
      let dateFilter = "started_at >= NOW() - INTERVAL '30 days'";
      
      if (period === '7days') {
        dateFilter = "started_at >= NOW() - INTERVAL '7 days'";
      } else if (period === '90days') {
        dateFilter = "started_at >= NOW() - INTERVAL '90 days'";
      }

      const result = await query(`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(total_focus_time) as total_focus_time,
          SUM(total_break_time) as total_break_time,
          AVG(total_focus_time) as avg_focus_time,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
          MAX(total_focus_time) as longest_session,
          MIN(total_focus_time) FILTER (WHERE total_focus_time > 0) as shortest_session
        FROM study_sessions
        WHERE user_id = $1 AND ${dateFilter}
      `, [userId]);

      const stats = result.rows[0];

      // Get daily breakdown
      const dailyResult = await query(`
        SELECT 
          DATE(started_at) as date,
          COUNT(*) as sessions,
          SUM(total_focus_time) as focus_time
        FROM study_sessions
        WHERE user_id = $1 AND ${dateFilter}
        GROUP BY DATE(started_at)
        ORDER BY date DESC
      `, [userId]);

      return {
        success: true,
        data: {
          summary: {
            totalSessions: parseInt(stats.total_sessions),
            totalFocusTime: parseFloat(stats.total_focus_time) || 0,
            totalBreakTime: parseFloat(stats.total_break_time) || 0,
            avgFocusTime: parseFloat(stats.avg_focus_time) || 0,
            completedSessions: parseInt(stats.completed_sessions),
            longestSession: parseFloat(stats.longest_session) || 0,
            shortestSession: parseFloat(stats.shortest_session) || 0,
            completionRate: stats.total_sessions > 0
              ? ((parseInt(stats.completed_sessions) / parseInt(stats.total_sessions)) * 100).toFixed(2)
              : 0
          },
          daily: dailyResult.rows.map(row => ({
            date: row.date,
            sessions: parseInt(row.sessions),
            focusTime: parseFloat(row.focus_time) || 0
          }))
        }
      };
    } catch (error) {
      logger.error('Failed to get study statistics', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StudyToolsService();
