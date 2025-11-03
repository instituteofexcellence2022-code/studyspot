const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const analyticsService = require('./analyticsService');

class AIService {
  constructor() {
    // In production, this would connect to OpenAI API or custom ML models
    this.isAIEnabled = process.env.AI_SERVICE_ENABLED === 'true';
    this.openAIApiKey = process.env.OPENAI_API_KEY;
  }

  // Generate personalized study recommendations
  async generateStudyRecommendations(userId) {
    try {
      // Get user's study history and patterns
      const userHistory = await this.getUserStudyHistory(userId);
      const studyPatterns = await this.analyzeStudyPatterns(userId);
      const performance = await this.getUserPerformance(userId);

      // Generate recommendations based on user data
      const recommendations = {
        studySchedule: this.recommendOptimalStudyTimes(studyPatterns),
        libraries: await this.recommendLibraries(userId, userHistory),
        studyDuration: this.recommendStudyDuration(performance),
        breakSchedule: this.recommendBreaks(studyPatterns),
        focusAreas: this.identifyWeakAreas(performance),
        resources: this.recommendResources(performance)
      };

      logger.info('Study recommendations generated', {
        userId: userId,
        recommendationCount: Object.keys(recommendations).length
      });

      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      logger.error('Failed to generate study recommendations', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's study history
  async getUserStudyHistory(userId) {
    try {
      const history = await query(`
        SELECT 
          b.booking_date,
          b.start_time,
          b.end_time,
          b.booking_type,
          b.status,
          l.name as library_name,
          l.amenities,
          EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600 as duration_hours
        FROM bookings b
        JOIN libraries l ON b.library_id = l.id
        WHERE b.user_id = $1 AND b.status = 'completed'
        ORDER BY b.booking_date DESC
        LIMIT 50
      `, [userId]);

      return history.rows;
    } catch (error) {
      logger.error('Failed to get user study history', error);
      return [];
    }
  }

  // Analyze study patterns using ML algorithms
  async analyzeStudyPatterns(userId) {
    try {
      const patterns = await query(`
        SELECT 
          EXTRACT(HOUR FROM start_time) as preferred_hour,
          EXTRACT(DOW FROM booking_date) as preferred_day,
          AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) as avg_duration,
          COUNT(*) as session_count,
          booking_type,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
        FROM bookings
        WHERE user_id = $1
        GROUP BY 
          EXTRACT(HOUR FROM start_time),
          EXTRACT(DOW FROM booking_date),
          booking_type
        ORDER BY session_count DESC
      `, [userId]);

      // Analyze patterns
      const analysis = {
        preferredTimeSlots: this.findPreferredTimeSlots(patterns.rows),
        preferredDays: this.findPreferredDays(patterns.rows),
        averageSessionLength: this.calculateAverageSessionLength(patterns.rows),
        bookingTypePreference: this.findBookingTypePreference(patterns.rows),
        consistencyScore: this.calculateConsistencyScore(patterns.rows),
        cancellationRate: this.calculateCancellationRate(patterns.rows)
      };

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze study patterns', error);
      return {};
    }
  }

  // Get user performance metrics
  async getUserPerformance(userId) {
    try {
      const performance = await query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
          AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) as avg_session_duration,
          SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600) as total_study_hours,
          COUNT(DISTINCT DATE(booking_date)) as unique_study_days,
          MAX(booking_date) as last_session_date
        FROM bookings
        WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      `, [userId]);

      const metrics = performance.rows[0];

      return {
        totalSessions: parseInt(metrics.total_sessions),
        completedSessions: parseInt(metrics.completed_sessions),
        averageSessionDuration: parseFloat(metrics.avg_session_duration) || 0,
        totalStudyHours: parseFloat(metrics.total_study_hours) || 0,
        uniqueStudyDays: parseInt(metrics.unique_study_days),
        lastSessionDate: metrics.last_session_date,
        completionRate: metrics.total_sessions > 0 
          ? (parseInt(metrics.completed_sessions) / parseInt(metrics.total_sessions) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      logger.error('Failed to get user performance', error);
      return {};
    }
  }

  // Recommend optimal study times based on patterns
  recommendOptimalStudyTimes(patterns) {
    const { preferredTimeSlots, preferredDays, consistencyScore } = patterns;

    const recommendations = [];

    // Recommend based on past success
    if (preferredTimeSlots && preferredTimeSlots.length > 0) {
      preferredTimeSlots.slice(0, 3).forEach(slot => {
        recommendations.push({
          timeSlot: `${slot.hour}:00 - ${slot.hour + 2}:00`,
          confidence: slot.confidence,
          reason: 'Based on your most productive study hours'
        });
      });
    }

    // Add variety recommendations
    if (consistencyScore < 50) {
      recommendations.push({
        timeSlot: 'Morning (6:00 - 9:00)',
        confidence: 70,
        reason: 'Try morning sessions to improve consistency'
      });
    }

    return recommendations;
  }

  // Recommend libraries based on user preferences
  async recommendLibraries(userId, userHistory) {
    try {
      // Get libraries user has visited
      const visitedLibraries = userHistory.map(h => h.library_name);

      // Get all active libraries with ratings
      const libraries = await query(`
        SELECT 
          l.id,
          l.name,
          l.address,
          l.amenities,
          l.pricing,
          l.latitude,
          l.longitude,
          COUNT(b.id) as booking_count,
          AVG(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completion_rate
        FROM libraries l
        LEFT JOIN bookings b ON l.id = b.library_id
        WHERE l.status = 'active'
        GROUP BY l.id, l.name, l.address, l.amenities, l.pricing, l.latitude, l.longitude
        ORDER BY booking_count DESC, completion_rate DESC
        LIMIT 10
      `);

      const recommendations = libraries.rows.map(lib => ({
        libraryId: lib.id,
        libraryName: lib.name,
        address: lib.address,
        amenities: lib.amenities,
        confidence: this.calculateLibraryRecommendationScore(lib, visitedLibraries),
        reason: this.generateLibraryRecommendationReason(lib, visitedLibraries)
      }));

      return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    } catch (error) {
      logger.error('Failed to recommend libraries', error);
      return [];
    }
  }

  // Recommend study duration
  recommendStudyDuration(performance) {
    const { averageSessionDuration, completionRate } = performance;

    let recommendedDuration = 2; // Default 2 hours
    let reason = 'Standard study session duration';

    if (averageSessionDuration > 0) {
      if (completionRate > 80) {
        // User completes sessions well, can handle longer sessions
        recommendedDuration = Math.min(averageSessionDuration + 0.5, 4);
        reason = 'Your high completion rate suggests you can handle longer sessions';
      } else if (completionRate < 60) {
        // User struggles with completion, recommend shorter sessions
        recommendedDuration = Math.max(averageSessionDuration - 0.5, 1);
        reason = 'Shorter sessions may improve your completion rate';
      } else {
        recommendedDuration = averageSessionDuration;
        reason = 'Based on your average successful session length';
      }
    }

    return {
      duration: Math.round(recommendedDuration * 2) / 2, // Round to nearest 0.5
      unit: 'hours',
      reason: reason,
      confidence: completionRate > 70 ? 85 : 65
    };
  }

  // Recommend break schedule (Pomodoro technique)
  recommendBreaks(patterns) {
    const { averageSessionLength } = patterns;

    const breakSchedule = [];

    if (averageSessionLength >= 2) {
      // For sessions 2+ hours, recommend Pomodoro
      breakSchedule.push({
        technique: 'Pomodoro Technique',
        description: '25 minutes focus, 5 minutes break',
        breaks: [
          { after: 25, duration: 5, type: 'short' },
          { after: 50, duration: 5, type: 'short' },
          { after: 75, duration: 5, type: 'short' },
          { after: 100, duration: 15, type: 'long' }
        ],
        confidence: 90
      });
    } else {
      // For shorter sessions, simpler break schedule
      breakSchedule.push({
        technique: 'Simple Break Schedule',
        description: '45 minutes focus, 10 minutes break',
        breaks: [
          { after: 45, duration: 10, type: 'medium' }
        ],
        confidence: 75
      });
    }

    return breakSchedule;
  }

  // Identify weak areas that need improvement
  identifyWeakAreas(performance) {
    const weakAreas = [];

    if (performance.completionRate < 70) {
      weakAreas.push({
        area: 'Session Completion',
        score: performance.completionRate,
        recommendation: 'Try shorter study sessions or use the Pomodoro technique',
        priority: 'high'
      });
    }

    if (performance.averageSessionDuration < 1.5) {
      weakAreas.push({
        area: 'Study Duration',
        score: (performance.averageSessionDuration / 3 * 100).toFixed(2),
        recommendation: 'Gradually increase your study session length',
        priority: 'medium'
      });
    }

    if (performance.uniqueStudyDays < 15) {
      weakAreas.push({
        area: 'Study Consistency',
        score: (performance.uniqueStudyDays / 30 * 100).toFixed(2),
        recommendation: 'Aim for more regular study sessions throughout the month',
        priority: 'high'
      });
    }

    return weakAreas;
  }

  // Recommend study resources
  recommendResources(performance) {
    const resources = [];

    // Based on performance, recommend different resources
    if (performance.completionRate < 60) {
      resources.push({
        type: 'article',
        title: 'How to Stay Focused While Studying',
        description: 'Tips and techniques to improve concentration',
        url: '/resources/focus-tips',
        relevance: 95
      });
    }

    if (performance.uniqueStudyDays < 10) {
      resources.push({
        type: 'guide',
        title: 'Building a Consistent Study Habit',
        description: 'Step-by-step guide to develop regular study patterns',
        url: '/resources/study-habits',
        relevance: 90
      });
    }

    // Always recommend productivity tools
    resources.push({
      type: 'tool',
      title: 'Pomodoro Study Timer',
      description: 'Built-in timer to help you stay on track',
      url: '/tools/pomodoro',
      relevance: 85
    });

    return resources.sort((a, b) => b.relevance - a.relevance);
  }

  // Helper functions for pattern analysis
  findPreferredTimeSlots(patterns) {
    const timeSlots = {};
    patterns.forEach(p => {
      const hour = parseInt(p.preferred_hour);
      if (!timeSlots[hour]) {
        timeSlots[hour] = { hour, count: 0 };
      }
      timeSlots[hour].count += parseInt(p.session_count);
    });

    return Object.values(timeSlots)
      .map(slot => ({
        hour: slot.hour,
        count: slot.count,
        confidence: Math.min((slot.count / patterns.length * 100), 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  findPreferredDays(patterns) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = {};

    patterns.forEach(p => {
      const day = parseInt(p.preferred_day);
      if (!dayCounts[day]) {
        dayCounts[day] = 0;
      }
      dayCounts[day] += parseInt(p.session_count);
    });

    return Object.entries(dayCounts)
      .map(([day, count]) => ({
        day: days[day],
        count: count,
        confidence: Math.min((count / patterns.length * 100), 100)
      }))
      .sort((a, b) => b.count - a.count);
  }

  calculateAverageSessionLength(patterns) {
    if (patterns.length === 0) return 2; // Default 2 hours

    const totalDuration = patterns.reduce((sum, p) => sum + parseFloat(p.avg_duration || 0), 0);
    return totalDuration / patterns.length;
  }

  findBookingTypePreference(patterns) {
    const types = {};
    patterns.forEach(p => {
      const type = p.booking_type;
      if (!types[type]) {
        types[type] = 0;
      }
      types[type] += parseInt(p.session_count);
    });

    return Object.entries(types)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  calculateConsistencyScore(patterns) {
    // Measure how consistent the user is with their study schedule
    if (patterns.length === 0) return 0;

    const totalSessions = patterns.reduce((sum, p) => sum + parseInt(p.session_count), 0);
    const variance = patterns.reduce((sum, p) => {
      const sessionCount = parseInt(p.session_count);
      const avg = totalSessions / patterns.length;
      return sum + Math.pow(sessionCount - avg, 2);
    }, 0) / patterns.length;

    // Lower variance = higher consistency
    const consistencyScore = Math.max(0, 100 - (variance * 10));
    return Math.round(consistencyScore);
  }

  calculateCancellationRate(patterns) {
    const totalSessions = patterns.reduce((sum, p) => sum + parseInt(p.session_count), 0);
    const cancelledSessions = patterns.reduce((sum, p) => sum + parseInt(p.cancelled_count || 0), 0);

    return totalSessions > 0 ? (cancelledSessions / totalSessions * 100).toFixed(2) : 0;
  }

  calculateLibraryRecommendationScore(library, visitedLibraries) {
    let score = 50; // Base score

    // Increase score for popular libraries
    if (library.booking_count > 100) score += 20;
    else if (library.booking_count > 50) score += 10;

    // Increase score for high completion rate
    if (library.completion_rate > 0.8) score += 20;
    else if (library.completion_rate > 0.6) score += 10;

    // Slight preference for new libraries user hasn't tried
    if (!visitedLibraries.includes(library.name)) score += 10;

    return Math.min(score, 100);
  }

  generateLibraryRecommendationReason(library, visitedLibraries) {
    if (!visitedLibraries.includes(library.name)) {
      return 'New library for you to explore';
    }

    if (library.completion_rate > 0.8) {
      return 'High success rate for completing study sessions';
    }

    if (library.booking_count > 100) {
      return 'Popular choice among students';
    }

    return 'Recommended based on amenities and location';
  }

  // Predict success probability for a booking
  async predictSuccessProbability(userId, bookingDetails) {
    try {
      const userHistory = await this.getUserStudyHistory(userId);
      const patterns = await this.analyzeStudyPatterns(userId);

      // Calculate probability based on multiple factors
      let probability = 50; // Base probability

      // Factor 1: User's overall completion rate
      const completionRate = parseFloat(patterns.consistencyScore || 50);
      probability += (completionRate - 50) * 0.5;

      // Factor 2: Time slot preference match
      const bookingHour = new Date(bookingDetails.startTime).getHours();
      const isPreferredTime = patterns.preferredTimeSlots?.some(slot => 
        Math.abs(slot.hour - bookingHour) <= 1
      );
      if (isPreferredTime) probability += 15;

      // Factor 3: Session duration match
      const sessionDuration = (new Date(bookingDetails.endTime) - new Date(bookingDetails.startTime)) / (1000 * 60 * 60);
      if (Math.abs(sessionDuration - patterns.averageSessionLength) < 0.5) probability += 10;

      // Factor 4: Day of week preference
      const bookingDay = new Date(bookingDetails.date).getDay();
      const isPreferredDay = patterns.preferredDays?.some(day => 
        day.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDay]
      );
      if (isPreferredDay) probability += 10;

      // Normalize to 0-100
      probability = Math.max(0, Math.min(100, probability));

      return {
        success: true,
        data: {
          probability: Math.round(probability),
          confidence: probability > 70 ? 'high' : probability > 50 ? 'medium' : 'low',
          factors: {
            completionRate: completionRate,
            preferredTimeMatch: isPreferredTime,
            durationMatch: Math.abs(sessionDuration - patterns.averageSessionLength) < 0.5,
            preferredDayMatch: isPreferredDay
          },
          recommendations: this.generateSuccessRecommendations(probability, patterns)
        }
      };
    } catch (error) {
      logger.error('Failed to predict success probability', error);
      return { success: false, error: error.message };
    }
  }

  generateSuccessRecommendations(probability, patterns) {
    const recommendations = [];

    if (probability < 60) {
      recommendations.push('Consider booking during your most productive hours');
      recommendations.push('Try a shorter session to improve completion chances');
    }

    if (patterns.consistencyScore < 50) {
      recommendations.push('Build consistency by booking regular study times');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great choice! This booking aligns well with your study patterns');
    }

    return recommendations;
  }
}

module.exports = new AIService();
