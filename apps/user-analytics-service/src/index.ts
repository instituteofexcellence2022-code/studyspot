import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import { Queue, Worker, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import moment from 'moment';
import axios from 'axios';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import natural from 'natural';
import nlp from 'compromise';
import OpenAI from 'openai';
import _ from 'lodash';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

const app = express();
const PORT = process.env.PORT || 3027;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/useranalyticsdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());
app.use(cors());

// Setup HTTP server for Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const analyticsQueue = new Queue('analyticsQueue', { connection });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const UserActivitySchema = new mongoose.Schema({
  activityId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'parent', 'staff'], 
    required: true 
  },
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String,
    browser: String,
    os: String,
    location: {
      country: String,
      city: String,
      coordinates: [Number]
    }
  },
  timestamp: { type: Date, default: Date.now },
  sessionId: String,
  duration: Number // seconds
});
const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

const StudentPerformanceSchema = new mongoose.Schema({
  performanceId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  studentId: { type: String, required: true },
  courseId: String,
  subjectId: String,
  metrics: {
    attendance: {
      totalClasses: { type: Number, default: 0 },
      attendedClasses: { type: Number, default: 0 },
      attendanceRate: { type: Number, default: 0 },
      lastAttendance: Date
    },
    academic: {
      assignments: { type: Number, default: 0 },
      completedAssignments: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      grade: String,
      rank: Number
    },
    behavior: {
      positiveActions: { type: Number, default: 0 },
      negativeActions: { type: Number, default: 0 },
      behaviorScore: { type: Number, default: 100 },
      lastIncident: Date
    },
    engagement: {
      loginFrequency: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 }, // minutes
      interactions: { type: Number, default: 0 },
      lastActivity: Date
    }
  },
  trends: {
    attendanceTrend: [Number], // Last 30 days
    scoreTrend: [Number], // Last 30 days
    behaviorTrend: [Number], // Last 30 days
    engagementTrend: [Number] // Last 30 days
  },
  predictions: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    predictedScore: Number,
    predictedAttendance: Number,
    recommendations: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const StudentPerformance = mongoose.model('StudentPerformance', StudentPerformanceSchema);

const UserBehaviorSchema = new mongoose.Schema({
  behaviorId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  userType: { type: String, required: true },
  behaviorPattern: {
    loginPattern: {
      preferredTime: String, // "09:00-10:00"
      frequency: Number, // logins per day
      consistency: Number, // 0-100
      lastLogin: Date
    },
    navigationPattern: {
      mostVisitedPages: [String],
      averageSessionDuration: Number,
      bounceRate: Number,
      pageViewsPerSession: Number
    },
    interactionPattern: {
      preferredFeatures: [String],
      interactionFrequency: Number,
      responseTime: Number, // average response time
      helpSeekingBehavior: Number // 0-100
    },
    learningPattern: {
      preferredLearningStyle: String,
      studyTime: Number, // minutes per day
      concentrationSpan: Number, // minutes
      breakFrequency: Number
    }
  },
  insights: {
    personalityTraits: [String],
    learningPreferences: [String],
    riskFactors: [String],
    strengths: [String],
    improvementAreas: [String]
  },
  aiAnalysis: {
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    engagementLevel: { type: String, enum: ['high', 'medium', 'low'] },
    motivationLevel: { type: String, enum: ['high', 'medium', 'low'] },
    stressLevel: { type: String, enum: ['low', 'medium', 'high'] },
    recommendations: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const UserBehavior = mongoose.model('UserBehavior', UserBehaviorSchema);

const AnalyticsReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: ['user_activity', 'student_performance', 'behavior_analysis', 'engagement', 'custom'], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  filters: mongoose.Schema.Types.Mixed,
  data: mongoose.Schema.Types.Mixed,
  visualizations: [{
    type: { type: String, enum: ['chart', 'table', 'metric', 'graph'] },
    title: String,
    data: mongoose.Schema.Types.Mixed,
    config: mongoose.Schema.Types.Mixed
  }],
  insights: [String],
  recommendations: [String],
  generatedBy: String,
  generatedAt: { type: Date, default: Date.now },
  isScheduled: { type: Boolean, default: false },
  scheduleConfig: mongoose.Schema.Types.Mixed
});
const AnalyticsReport = mongoose.model('AnalyticsReport', AnalyticsReportSchema);

const UserSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  duration: Number, // seconds
  pages: [{
    page: String,
    timestamp: Date,
    duration: Number,
    interactions: Number
  }],
  device: {
    type: String,
    os: String,
    browser: String,
    screenResolution: String
  },
  location: {
    country: String,
    city: String,
    coordinates: [Number]
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const UserSession = mongoose.model('UserSession', UserSessionSchema);

// Worker to process analytics jobs
const worker = new Worker('analyticsQueue', async (job: Job) => {
  logger.info(`Processing analytics job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'track_activity':
        await trackUserActivity(data);
        break;
      case 'analyze_performance':
        await analyzeStudentPerformance(data);
        break;
      case 'update_behavior':
        await updateUserBehavior(data);
        break;
      case 'generate_report':
        await generateAnalyticsReport(data);
        break;
      case 'predict_risks':
        await predictStudentRisks(data);
        break;
      default:
        logger.warn(`Unknown analytics job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing analytics job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Analytics job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function trackUserActivity(data: any) {
  const { tenantId, userId, userType, action, resource, details, metadata } = data;
  
  try {
    const activity = new UserActivity({
      activityId: uuidv4(),
      tenantId,
      userId,
      userType,
      action,
      resource: resource?.type,
      resourceId: resource?.id,
      details,
      metadata,
      timestamp: new Date()
    });
    
    await activity.save();
    
    // Update user behavior based on activity
    await analyticsQueue.add('update_behavior', {
      jobType: 'update_behavior',
      data: { tenantId, userId, userType, activity }
    });
    
    // Update student performance if applicable
    if (userType === 'student') {
      await analyticsQueue.add('analyze_performance', {
        jobType: 'analyze_performance',
        data: { tenantId, studentId: userId, activity }
      });
    }
    
    logger.info(`User activity tracked: ${userId} - ${action}`);
    
  } catch (error: any) {
    logger.error(`Error tracking user activity:`, error);
    throw error;
  }
}

async function analyzeStudentPerformance(data: any) {
  const { tenantId, studentId, activity } = data;
  
  try {
    let performance = await StudentPerformance.findOne({ tenantId, studentId });
    
    if (!performance) {
      performance = new StudentPerformance({
        performanceId: uuidv4(),
        tenantId,
        studentId,
        metrics: {
          attendance: { totalClasses: 0, attendedClasses: 0, attendanceRate: 0 },
          academic: { assignments: 0, completedAssignments: 0, averageScore: 0 },
          behavior: { positiveActions: 0, negativeActions: 0, behaviorScore: 100 },
          engagement: { loginFrequency: 0, timeSpent: 0, interactions: 0 }
        },
        trends: {
          attendanceTrend: [],
          scoreTrend: [],
          behaviorTrend: [],
          engagementTrend: []
        }
      });
    }
    
    // Update metrics based on activity
    switch (activity.action) {
      case 'attendance_marked':
        performance.metrics.attendance.attendedClasses += 1;
        performance.metrics.attendance.lastAttendance = new Date();
        break;
      case 'assignment_submitted':
        performance.metrics.academic.completedAssignments += 1;
        if (activity.details?.score) {
          const totalScore = performance.metrics.academic.totalScore + activity.details.score;
          performance.metrics.academic.averageScore = totalScore / performance.metrics.academic.completedAssignments;
        }
        break;
      case 'positive_action':
        performance.metrics.behavior.positiveActions += 1;
        break;
      case 'negative_action':
        performance.metrics.behavior.negativeActions += 1;
        break;
      case 'login':
        performance.metrics.engagement.loginFrequency += 1;
        performance.metrics.engagement.lastActivity = new Date();
        break;
    }
    
    // Calculate derived metrics
    performance.metrics.attendance.attendanceRate = 
      performance.metrics.attendance.totalClasses > 0 
        ? (performance.metrics.attendance.attendedClasses / performance.metrics.attendance.totalClasses) * 100 
        : 0;
    
    performance.metrics.behavior.behaviorScore = Math.max(0, 
      100 - (performance.metrics.behavior.negativeActions * 5) + (performance.metrics.behavior.positiveActions * 2)
    );
    
    // Update trends (simplified - in real implementation, this would be more sophisticated)
    performance.trends.attendanceTrend.push(performance.metrics.attendance.attendanceRate);
    performance.trends.scoreTrend.push(performance.metrics.academic.averageScore);
    performance.trends.behaviorTrend.push(performance.metrics.behavior.behaviorScore);
    performance.trends.engagementTrend.push(performance.metrics.engagement.loginFrequency);
    
    // Keep only last 30 days of trends
    if (performance.trends.attendanceTrend.length > 30) {
      performance.trends.attendanceTrend = performance.trends.attendanceTrend.slice(-30);
      performance.trends.scoreTrend = performance.trends.scoreTrend.slice(-30);
      performance.trends.behaviorTrend = performance.trends.behaviorTrend.slice(-30);
      performance.trends.engagementTrend = performance.trends.engagementTrend.slice(-30);
    }
    
    performance.updatedAt = new Date();
    await performance.save();
    
    // Generate predictions and recommendations
    await analyticsQueue.add('predict_risks', {
      jobType: 'predict_risks',
      data: { tenantId, studentId, performance }
    });
    
    logger.info(`Student performance analyzed: ${studentId}`);
    
  } catch (error: any) {
    logger.error(`Error analyzing student performance:`, error);
    throw error;
  }
}

async function updateUserBehavior(data: any) {
  const { tenantId, userId, userType, activity } = data;
  
  try {
    let behavior = await UserBehavior.findOne({ tenantId, userId });
    
    if (!behavior) {
      behavior = new UserBehavior({
        behaviorId: uuidv4(),
        tenantId,
        userId,
        userType,
        behaviorPattern: {
          loginPattern: { preferredTime: '', frequency: 0, consistency: 0 },
          navigationPattern: { mostVisitedPages: [], averageSessionDuration: 0, bounceRate: 0, pageViewsPerSession: 0 },
          interactionPattern: { preferredFeatures: [], interactionFrequency: 0, responseTime: 0, helpSeekingBehavior: 0 },
          learningPattern: { preferredLearningStyle: '', studyTime: 0, concentrationSpan: 0, breakFrequency: 0 }
        },
        insights: { personalityTraits: [], learningPreferences: [], riskFactors: [], strengths: [], improvementAreas: [] },
        aiAnalysis: { sentiment: 'neutral', engagementLevel: 'medium', motivationLevel: 'medium', stressLevel: 'low', recommendations: [] }
      });
    }
    
    // Update behavior patterns based on activity
    const hour = new Date().getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
    
    if (activity.action === 'login') {
      behavior.behaviorPattern.loginPattern.frequency += 1;
      behavior.behaviorPattern.loginPattern.lastLogin = new Date();
      
      // Update preferred time (simplified)
      if (!behavior.behaviorPattern.loginPattern.preferredTime) {
        behavior.behaviorPattern.loginPattern.preferredTime = timeSlot;
      }
    }
    
    if (activity.resource) {
      const page = activity.resource;
      const existingIndex = behavior.behaviorPattern.navigationPattern.mostVisitedPages.indexOf(page);
      
      if (existingIndex >= 0) {
        // Move to front (most recent)
        behavior.behaviorPattern.navigationPattern.mostVisitedPages.splice(existingIndex, 1);
      }
      behavior.behaviorPattern.navigationPattern.mostVisitedPages.unshift(page);
      
      // Keep only top 10
      behavior.behaviorPattern.navigationPattern.mostVisitedPages = 
        behavior.behaviorPattern.navigationPattern.mostVisitedPages.slice(0, 10);
    }
    
    // AI Analysis (if OpenAI is available)
    if (OPENAI_API_KEY && activity.details?.content) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Analyze this user activity and provide insights: Action: ${activity.action}, Resource: ${activity.resource}, Details: ${JSON.stringify(activity.details)}. Return JSON with sentiment, engagementLevel, motivationLevel, and recommendations.`
          }]
        });
        
        const analysis = JSON.parse(response.choices[0].message.content || '{}');
        behavior.aiAnalysis = { ...behavior.aiAnalysis, ...analysis };
      } catch (error) {
        logger.error('Error in AI behavior analysis:', error);
      }
    }
    
    behavior.updatedAt = new Date();
    await behavior.save();
    
    logger.info(`User behavior updated: ${userId}`);
    
  } catch (error: any) {
    logger.error(`Error updating user behavior:`, error);
    throw error;
  }
}

async function generateAnalyticsReport(data: any) {
  const { tenantId, reportType, filters, generatedBy } = data;
  
  try {
    let reportData;
    let insights = [];
    let recommendations = [];
    
    switch (reportType) {
      case 'user_activity':
        reportData = await generateUserActivityReport(tenantId, filters);
        insights = generateActivityInsights(reportData);
        recommendations = generateActivityRecommendations(reportData);
        break;
      case 'student_performance':
        reportData = await generateStudentPerformanceReport(tenantId, filters);
        insights = generatePerformanceInsights(reportData);
        recommendations = generatePerformanceRecommendations(reportData);
        break;
      case 'behavior_analysis':
        reportData = await generateBehaviorAnalysisReport(tenantId, filters);
        insights = generateBehaviorInsights(reportData);
        recommendations = generateBehaviorRecommendations(reportData);
        break;
      case 'engagement':
        reportData = await generateEngagementReport(tenantId, filters);
        insights = generateEngagementInsights(reportData);
        recommendations = generateEngagementRecommendations(reportData);
        break;
      default:
        reportData = await generateGeneralReport(tenantId, filters);
        insights = generateGeneralInsights(reportData);
        recommendations = generateGeneralRecommendations(reportData);
    }
    
    const report = new AnalyticsReport({
      reportId: uuidv4(),
      tenantId,
      reportType,
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      description: `Analytics report for ${reportType}`,
      filters,
      data: reportData,
      insights,
      recommendations,
      generatedBy,
      generatedAt: new Date()
    });
    
    await report.save();
    
    logger.info(`Analytics report generated: ${reportType} for tenant ${tenantId}`);
    
    return report;
    
  } catch (error: any) {
    logger.error(`Error generating analytics report:`, error);
    throw error;
  }
}

async function predictStudentRisks(data: any) {
  const { tenantId, studentId, performance } = data;
  
  try {
    const riskFactors = [];
    let riskLevel = 'low';
    
    // Analyze risk factors
    if (performance.metrics.attendance.attendanceRate < 70) {
      riskFactors.push('Low attendance rate');
      riskLevel = 'medium';
    }
    
    if (performance.metrics.academic.averageScore < 50) {
      riskFactors.push('Low academic performance');
      riskLevel = 'high';
    }
    
    if (performance.metrics.behavior.behaviorScore < 60) {
      riskFactors.push('Behavioral issues');
      riskLevel = 'medium';
    }
    
    if (performance.metrics.engagement.loginFrequency < 3) {
      riskFactors.push('Low engagement');
      riskLevel = 'medium';
    }
    
    // Generate recommendations
    const recommendations = [];
    if (riskFactors.includes('Low attendance rate')) {
      recommendations.push('Implement attendance tracking and parent notifications');
    }
    if (riskFactors.includes('Low academic performance')) {
      recommendations.push('Provide additional academic support and tutoring');
    }
    if (riskFactors.includes('Behavioral issues')) {
      recommendations.push('Schedule counseling sessions and behavior intervention');
    }
    if (riskFactors.includes('Low engagement')) {
      recommendations.push('Increase interactive content and gamification');
    }
    
    // Update performance with predictions
    await StudentPerformance.findOneAndUpdate(
      { tenantId, studentId },
      {
        'predictions.riskLevel': riskLevel,
        'predictions.recommendations': recommendations,
        updatedAt: new Date()
      }
    );
    
    logger.info(`Student risk prediction completed: ${studentId} - ${riskLevel} risk`);
    
  } catch (error: any) {
    logger.error(`Error predicting student risks:`, error);
    throw error;
  }
}

// Report generation functions
async function generateUserActivityReport(tenantId: string, filters: any) {
  const matchFilter: any = { tenantId };
  if (filters?.startDate && filters?.endDate) {
    matchFilter.timestamp = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }
  if (filters?.userType) {
    matchFilter.userType = filters.userType;
  }
  
  const activities = await UserActivity.find(matchFilter).sort({ timestamp: -1 });
  
  return {
    totalActivities: activities.length,
    activitiesByType: _.groupBy(activities, 'userType'),
    activitiesByAction: _.groupBy(activities, 'action'),
    topResources: _.countBy(activities, 'resource'),
    hourlyDistribution: generateHourlyDistribution(activities),
    dailyDistribution: generateDailyDistribution(activities)
  };
}

async function generateStudentPerformanceReport(tenantId: string, filters: any) {
  const matchFilter: any = { tenantId };
  if (filters?.courseId) {
    matchFilter.courseId = filters.courseId;
  }
  
  const performances = await StudentPerformance.find(matchFilter);
  
  return {
    totalStudents: performances.length,
    averageAttendance: _.meanBy(performances, p => p.metrics.attendance.attendanceRate),
    averageScore: _.meanBy(performances, p => p.metrics.academic.averageScore),
    averageBehaviorScore: _.meanBy(performances, p => p.metrics.behavior.behaviorScore),
    riskDistribution: _.countBy(performances, p => p.predictions.riskLevel),
    topPerformers: performances
      .sort((a, b) => b.metrics.academic.averageScore - a.metrics.academic.averageScore)
      .slice(0, 10),
    atRiskStudents: performances.filter(p => p.predictions.riskLevel === 'high')
  };
}

async function generateBehaviorAnalysisReport(tenantId: string, filters: any) {
  const matchFilter: any = { tenantId };
  if (filters?.userType) {
    matchFilter.userType = filters.userType;
  }
  
  const behaviors = await UserBehavior.find(matchFilter);
  
  return {
    totalUsers: behaviors.length,
    engagementLevels: _.countBy(behaviors, b => b.aiAnalysis.engagementLevel),
    motivationLevels: _.countBy(behaviors, b => b.aiAnalysis.motivationLevel),
    stressLevels: _.countBy(behaviors, b => b.aiAnalysis.stressLevel),
    commonPersonalityTraits: _.flatten(behaviors.map(b => b.insights.personalityTraits)),
    learningPreferences: _.flatten(behaviors.map(b => b.insights.learningPreferences)),
    topPages: _.flatten(behaviors.map(b => b.behaviorPattern.navigationPattern.mostVisitedPages))
  };
}

async function generateEngagementReport(tenantId: string, filters: any) {
  const matchFilter: any = { tenantId };
  if (filters?.startDate && filters?.endDate) {
    matchFilter.timestamp = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }
  
  const activities = await UserActivity.find(matchFilter);
  const sessions = await UserSession.find(matchFilter);
  
  return {
    totalSessions: sessions.length,
    averageSessionDuration: _.meanBy(sessions, s => s.duration),
    totalPageViews: _.sumBy(sessions, s => s.pages.length),
    bounceRate: calculateBounceRate(sessions),
    userRetention: calculateUserRetention(activities),
    peakHours: generatePeakHours(activities),
    deviceDistribution: _.countBy(sessions, s => s.device.type)
  };
}

async function generateGeneralReport(tenantId: string, filters: any) {
  const userActivity = await generateUserActivityReport(tenantId, filters);
  const studentPerformance = await generateStudentPerformanceReport(tenantId, filters);
  const behaviorAnalysis = await generateBehaviorAnalysisReport(tenantId, filters);
  const engagement = await generateEngagementReport(tenantId, filters);
  
  return {
    userActivity,
    studentPerformance,
    behaviorAnalysis,
    engagement,
    summary: {
      totalUsers: userActivity.totalActivities,
      totalStudents: studentPerformance.totalStudents,
      averageEngagement: engagement.totalSessions,
      riskLevel: studentPerformance.riskDistribution
    }
  };
}

// Helper functions for report generation
function generateHourlyDistribution(activities: any[]) {
  const hourly = Array(24).fill(0);
  activities.forEach(activity => {
    const hour = new Date(activity.timestamp).getHours();
    hourly[hour]++;
  });
  return hourly;
}

function generateDailyDistribution(activities: any[]) {
  const daily = Array(7).fill(0);
  activities.forEach(activity => {
    const day = new Date(activity.timestamp).getDay();
    daily[day]++;
  });
  return daily;
}

function calculateBounceRate(sessions: any[]) {
  const singlePageSessions = sessions.filter(s => s.pages.length === 1).length;
  return sessions.length > 0 ? (singlePageSessions / sessions.length) * 100 : 0;
}

function calculateUserRetention(activities: any[]) {
  const userActivityCounts = _.countBy(activities, 'userId');
  const activeUsers = Object.keys(userActivityCounts).length;
  const highlyActiveUsers = Object.values(userActivityCounts).filter(count => count > 10).length;
  
  return {
    totalActiveUsers: activeUsers,
    highlyActiveUsers,
    retentionRate: activeUsers > 0 ? (highlyActiveUsers / activeUsers) * 100 : 0
  };
}

function generatePeakHours(activities: any[]) {
  const hourly = generateHourlyDistribution(activities);
  const maxActivity = Math.max(...hourly);
  const peakHours = hourly.map((count, hour) => ({ hour, count }))
    .filter(h => h.count >= maxActivity * 0.8)
    .map(h => h.hour);
  
  return peakHours;
}

// Insight generation functions
function generateActivityInsights(data: any): string[] {
  const insights = [];
  
  if (data.totalActivities > 1000) {
    insights.push('High user activity indicates strong platform engagement');
  }
  
  const topAction = Object.keys(data.activitiesByAction)[0];
  if (topAction) {
    insights.push(`Most common user action: ${topAction}`);
  }
  
  return insights;
}

function generatePerformanceInsights(data: any): string[] {
  const insights = [];
  
  if (data.averageAttendance > 85) {
    insights.push('Excellent attendance rates across all students');
  } else if (data.averageAttendance < 70) {
    insights.push('Attendance rates need improvement');
  }
  
  if (data.averageScore > 80) {
    insights.push('Strong academic performance across the board');
  } else if (data.averageScore < 60) {
    insights.push('Academic performance requires attention');
  }
  
  const atRiskCount = data.atRiskStudents.length;
  if (atRiskCount > 0) {
    insights.push(`${atRiskCount} students identified as high-risk and need immediate attention`);
  }
  
  return insights;
}

function generateBehaviorInsights(data: any): string[] {
  const insights = [];
  
  const highEngagement = data.engagementLevels.high || 0;
  const totalUsers = data.totalUsers;
  
  if (totalUsers > 0 && (highEngagement / totalUsers) > 0.7) {
    insights.push('High user engagement levels indicate effective platform design');
  }
  
  const commonTraits = _.countBy(data.commonPersonalityTraits);
  const topTrait = Object.keys(commonTraits)[0];
  if (topTrait) {
    insights.push(`Most common personality trait: ${topTrait}`);
  }
  
  return insights;
}

function generateEngagementInsights(data: any): string[] {
  const insights = [];
  
  if (data.averageSessionDuration > 30) {
    insights.push('Users spend significant time on the platform, indicating high engagement');
  }
  
  if (data.bounceRate < 30) {
    insights.push('Low bounce rate indicates good content quality and user experience');
  }
  
  if (data.userRetention.retentionRate > 70) {
    insights.push('High user retention rate shows strong platform value');
  }
  
  return insights;
}

function generateGeneralInsights(data: any): string[] {
  return [
    ...generateActivityInsights(data.userActivity),
    ...generatePerformanceInsights(data.studentPerformance),
    ...generateBehaviorInsights(data.behaviorAnalysis),
    ...generateEngagementInsights(data.engagement)
  ];
}

// Recommendation generation functions
function generateActivityRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (data.totalActivities < 100) {
    recommendations.push('Consider implementing gamification to increase user activity');
  }
  
  return recommendations;
}

function generatePerformanceRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (data.averageAttendance < 70) {
    recommendations.push('Implement automated attendance reminders and parent notifications');
  }
  
  if (data.averageScore < 60) {
    recommendations.push('Provide additional learning resources and tutoring support');
  }
  
  if (data.atRiskStudents.length > 0) {
    recommendations.push('Develop intervention programs for at-risk students');
  }
  
  return recommendations;
}

function generateBehaviorRecommendations(data: any): string[] {
  const recommendations = [];
  
  const lowEngagement = data.engagementLevels.low || 0;
  const totalUsers = data.totalUsers;
  
  if (totalUsers > 0 && (lowEngagement / totalUsers) > 0.3) {
    recommendations.push('Implement personalized content recommendations to increase engagement');
  }
  
  return recommendations;
}

function generateEngagementRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (data.bounceRate > 50) {
    recommendations.push('Improve landing page design and content to reduce bounce rate');
  }
  
  if (data.userRetention.retentionRate < 50) {
    recommendations.push('Implement user onboarding improvements and retention strategies');
  }
  
  return recommendations;
}

function generateGeneralRecommendations(data: any): string[] {
  return [
    ...generateActivityRecommendations(data.userActivity),
    ...generatePerformanceRecommendations(data.studentPerformance),
    ...generateBehaviorRecommendations(data.behaviorAnalysis),
    ...generateEngagementRecommendations(data.engagement)
  ];
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'User Analytics Service is healthy', uptime: process.uptime() });
});

// Track User Activity
app.post('/track', async (req, res) => {
  try {
    const { tenantId, userId, userType, action, resource, details, metadata } = req.body;
    
    await analyticsQueue.add('track_activity', {
      jobType: 'track_activity',
      data: { tenantId, userId, userType, action, resource, details, metadata }
    });
    
    res.status(202).json({ message: 'Activity tracking initiated' });
  } catch (error: any) {
    logger.error('Error tracking activity:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get User Analytics
app.get('/analytics/users', async (req, res) => {
  try {
    const { tenantId, userId, userType, startDate, endDate, limit = 100 } = req.query;
    
    const filter: any = { tenantId };
    if (userId) filter.userId = userId;
    if (userType) filter.userType = userType;
    if (startDate && endDate) {
      filter.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    const activities = await UserActivity.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string));
    
    res.status(200).json(activities);
  } catch (error: any) {
    logger.error('Error fetching user analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Student Performance
app.get('/analytics/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req.query;
    
    const performance = await StudentPerformance.findOne({ tenantId, studentId });
    
    if (!performance) {
      return res.status(404).json({ message: 'Student performance data not found' });
    }
    
    res.status(200).json(performance);
  } catch (error: any) {
    logger.error('Error fetching student performance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get User Behavior
app.get('/analytics/behavior/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenantId } = req.query;
    
    const behavior = await UserBehavior.findOne({ tenantId, userId });
    
    if (!behavior) {
      return res.status(404).json({ message: 'User behavior data not found' });
    }
    
    res.status(200).json(behavior);
  } catch (error: any) {
    logger.error('Error fetching user behavior:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate Analytics Report
app.post('/reports', async (req, res) => {
  try {
    const { tenantId, reportType, filters, generatedBy } = req.body;
    
    const report = await generateAnalyticsReport({
      tenantId,
      reportType,
      filters,
      generatedBy
    });
    
    res.status(201).json(report);
  } catch (error: any) {
    logger.error('Error generating report:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Analytics Reports
app.get('/reports', async (req, res) => {
  try {
    const { tenantId, reportType, limit = 50, page = 1 } = req.query;
    
    const filter: any = { tenantId };
    if (reportType) filter.reportType = reportType;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const reports = await AnalyticsReport.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await AnalyticsReport.countDocuments(filter);
    
    res.status(200).json({
      reports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export Analytics Data
app.post('/export', async (req, res) => {
  try {
    const { tenantId, dataType, format = 'csv', filters } = req.body;
    
    let data;
    let filename;
    
    switch (dataType) {
      case 'user_activity':
        data = await UserActivity.find({ tenantId, ...filters });
        filename = `user_activity_${moment().format('YYYY-MM-DD')}`;
        break;
      case 'student_performance':
        data = await StudentPerformance.find({ tenantId, ...filters });
        filename = `student_performance_${moment().format('YYYY-MM-DD')}`;
        break;
      case 'user_behavior':
        data = await UserBehavior.find({ tenantId, ...filters });
        filename = `user_behavior_${moment().format('YYYY-MM-DD')}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid data type' });
    }
    
    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      
      // Add headers
      const headers = Object.keys(data[0] || {});
      worksheet.addRow(headers);
      
      // Add data
      data.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ message: 'Invalid format' });
    }
    
  } catch (error: any) {
    logger.error('Error exporting data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Analytics
app.get('/dashboard', async (req, res) => {
  try {
    const { tenantId, period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    const filters = { startDate, endDate };
    
    // Get all analytics data
    const userActivity = await generateUserActivityReport(tenantId as string, filters);
    const studentPerformance = await generateStudentPerformanceReport(tenantId as string, filters);
    const behaviorAnalysis = await generateBehaviorAnalysisReport(tenantId as string, filters);
    const engagement = await generateEngagementReport(tenantId as string, filters);
    
    res.status(200).json({
      period: { startDate, endDate },
      userActivity,
      studentPerformance,
      behaviorAnalysis,
      engagement,
      summary: {
        totalUsers: userActivity.totalActivities,
        totalStudents: studentPerformance.totalStudents,
        averageEngagement: engagement.totalSessions,
        riskLevel: studentPerformance.riskDistribution
      }
    });
  } catch (error: any) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to User Analytics Service:', socket.id);
  
  socket.on('subscribe-analytics', (data) => {
    socket.join(`analytics-${data.tenantId}`);
    logger.info(`Client subscribed to analytics updates for tenant ${data.tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from User Analytics Service:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('0 */1 * * *', async () => {
  // Update analytics every hour
  const tenants = await UserActivity.distinct('tenantId');
  
  for (const tenantId of tenants) {
    await analyticsQueue.add('generate_report', {
      jobType: 'generate_report',
      data: { tenantId, reportType: 'engagement', generatedBy: 'system' }
    });
  }
});

cron.schedule('0 0 * * *', async () => {
  // Daily analytics processing
  const tenants = await UserActivity.distinct('tenantId');
  
  for (const tenantId of tenants) {
    await analyticsQueue.add('generate_report', {
      jobType: 'generate_report',
      data: { tenantId, reportType: 'user_activity', generatedBy: 'system' }
    });
  }
});

server.listen(PORT, () => {
  logger.info(`User Analytics Service running on port ${PORT}`);
  console.log(`User Analytics Service running on port ${PORT}`);
});
