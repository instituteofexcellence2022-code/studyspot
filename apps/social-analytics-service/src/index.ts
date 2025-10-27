import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import moment from 'moment';
import axios from 'axios';
import natural from 'natural';
import nlp from 'compromise';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3020;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialanalyticsdb';

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

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const PostAnalyticsSchema = new mongoose.Schema({
  analyticsId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  postId: { type: String, required: true },
  content: String,
  metrics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 }
  },
  hashtags: [String],
  mentions: [String],
  postedAt: { type: Date, required: true },
  analyzedAt: { type: Date, default: Date.now }
});
const PostAnalytics = mongoose.model('PostAnalytics', PostAnalyticsSchema);

const AudienceInsightsSchema = new mongoose.Schema({
  insightsId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  demographics: {
    ageGroups: { type: Map, of: Number },
    genders: { type: Map, of: Number },
    locations: { type: Map, of: Number },
    languages: { type: Map, of: Number }
  },
  interests: { type: Map, of: Number },
  behavior: {
    activeHours: { type: Map, of: Number },
    deviceTypes: { type: Map, of: Number },
    contentTypes: { type: Map, of: Number }
  },
  growthMetrics: {
    followersCount: Number,
    followersGrowth: Number,
    engagementRate: Number,
    reachRate: Number
  },
  analyzedAt: { type: Date, default: Date.now }
});
const AudienceInsights = mongoose.model('AudienceInsights', AudienceInsightsSchema);

const CompetitorAnalysisSchema = new mongoose.Schema({
  analysisId: { type: String, required: true, unique: true },
  competitorName: { type: String, required: true },
  platform: { type: String, required: true },
  metrics: {
    followersCount: Number,
    postsCount: Number,
    avgEngagementRate: Number,
    avgReach: Number,
    avgLikes: Number,
    avgComments: Number,
    avgShares: Number
  },
  topHashtags: [String],
  topContentTypes: [String],
  postingFrequency: Number,
  bestPerformingPosts: [{
    postId: String,
    content: String,
    engagementRate: Number,
    reach: Number
  }],
  analyzedAt: { type: Date, default: Date.now }
});
const CompetitorAnalysis = mongoose.model('CompetitorAnalysis', CompetitorAnalysisSchema);

const TrendAnalysisSchema = new mongoose.Schema({
  trendId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  trendType: { type: String, enum: ['hashtag', 'topic', 'keyword'], required: true },
  trendName: { type: String, required: true },
  volume: Number,
  growth: Number,
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'] },
  relatedTrends: [String],
  peakTime: Date,
  analyzedAt: { type: Date, default: Date.now }
});
const TrendAnalysis = mongoose.model('TrendAnalysis', TrendAnalysisSchema);

const ROIAnalysisSchema = new mongoose.Schema({
  roiId: { type: String, required: true, unique: true },
  campaignId: String,
  platform: { type: String, required: true },
  period: {
    startDate: Date,
    endDate: Date
  },
  investment: {
    adSpend: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    toolCosts: { type: Number, default: 0 }
  },
  returns: {
    leads: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    brandAwareness: Number,
    engagement: Number
  },
  metrics: {
    costPerLead: Number,
    costPerConversion: Number,
    revenuePerDollar: Number,
    roi: Number
  },
  analyzedAt: { type: Date, default: Date.now }
});
const ROIAnalysis = mongoose.model('ROIAnalysis', ROIAnalysisSchema);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Social Analytics Service is healthy', uptime: process.uptime() });
});

// Post Analytics
app.post('/analytics/posts', async (req, res) => {
  try {
    const analytics = new PostAnalytics({
      analyticsId: uuidv4(),
      ...req.body
    });
    await analytics.save();
    res.status(201).json(analytics);
  } catch (error: any) {
    logger.error('Error creating post analytics:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/analytics/posts', async (req, res) => {
  try {
    const { platform, startDate, endDate, limit = 100 } = req.query;
    const filter: any = {};
    
    if (platform) filter.platform = platform;
    if (startDate && endDate) {
      filter.postedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const posts = await PostAnalytics.find(filter)
      .sort({ postedAt: -1 })
      .limit(parseInt(limit as string));
    
    res.status(200).json(posts);
  } catch (error: any) {
    logger.error('Error fetching post analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Audience Insights
app.post('/analytics/audience', async (req, res) => {
  try {
    const insights = new AudienceInsights({
      insightsId: uuidv4(),
      ...req.body
    });
    await insights.save();
    res.status(201).json(insights);
  } catch (error: any) {
    logger.error('Error creating audience insights:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/analytics/audience', async (req, res) => {
  try {
    const { platform } = req.query;
    const filter = platform ? { platform } : {};
    
    const insights = await AudienceInsights.find(filter)
      .sort({ analyzedAt: -1 })
      .limit(1);
    
    res.status(200).json(insights[0] || null);
  } catch (error: any) {
    logger.error('Error fetching audience insights:', error);
    res.status(500).json({ message: error.message });
  }
});

// Competitor Analysis
app.post('/analytics/competitors', async (req, res) => {
  try {
    const analysis = new CompetitorAnalysis({
      analysisId: uuidv4(),
      ...req.body
    });
    await analysis.save();
    res.status(201).json(analysis);
  } catch (error: any) {
    logger.error('Error creating competitor analysis:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/analytics/competitors', async (req, res) => {
  try {
    const { platform } = req.query;
    const filter = platform ? { platform } : {};
    
    const competitors = await CompetitorAnalysis.find(filter)
      .sort({ analyzedAt: -1 });
    
    res.status(200).json(competitors);
  } catch (error: any) {
    logger.error('Error fetching competitor analysis:', error);
    res.status(500).json({ message: error.message });
  }
});

// Trend Analysis
app.post('/analytics/trends', async (req, res) => {
  try {
    const trend = new TrendAnalysis({
      trendId: uuidv4(),
      ...req.body
    });
    await trend.save();
    res.status(201).json(trend);
  } catch (error: any) {
    logger.error('Error creating trend analysis:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/analytics/trends', async (req, res) => {
  try {
    const { platform, trendType, limit = 50 } = req.query;
    const filter: any = {};
    
    if (platform) filter.platform = platform;
    if (trendType) filter.trendType = trendType;
    
    const trends = await TrendAnalysis.find(filter)
      .sort({ volume: -1 })
      .limit(parseInt(limit as string));
    
    res.status(200).json(trends);
  } catch (error: any) {
    logger.error('Error fetching trend analysis:', error);
    res.status(500).json({ message: error.message });
  }
});

// ROI Analysis
app.post('/analytics/roi', async (req, res) => {
  try {
    const roi = new ROIAnalysis({
      roiId: uuidv4(),
      ...req.body
    });
    
    // Calculate ROI metrics
    const { investment, returns } = roi;
    roi.metrics = {
      costPerLead: investment.adSpend / Math.max(returns.leads, 1),
      costPerConversion: investment.adSpend / Math.max(returns.conversions, 1),
      revenuePerDollar: returns.revenue / Math.max(investment.adSpend, 1),
      roi: ((returns.revenue - investment.adSpend) / Math.max(investment.adSpend, 1)) * 100
    };
    
    await roi.save();
    res.status(201).json(roi);
  } catch (error: any) {
    logger.error('Error creating ROI analysis:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/analytics/roi', async (req, res) => {
  try {
    const { platform, startDate, endDate } = req.query;
    const filter: any = {};
    
    if (platform) filter.platform = platform;
    if (startDate && endDate) {
      filter['period.startDate'] = { $gte: new Date(startDate as string) };
      filter['period.endDate'] = { $lte: new Date(endDate as string) };
    }
    
    const roiAnalyses = await ROIAnalysis.find(filter)
      .sort({ analyzedAt: -1 });
    
    res.status(200).json(roiAnalyses);
  } catch (error: any) {
    logger.error('Error fetching ROI analysis:', error);
    res.status(500).json({ message: error.message });
  }
});

// Comprehensive Analytics Dashboard
app.get('/analytics/dashboard', async (req, res) => {
  try {
    const { platform, period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    const filter: any = {
      postedAt: { $gte: startDate, $lte: endDate }
    };
    if (platform) filter.platform = platform;
    
    // Aggregate post analytics
    const postStats = await PostAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          totalViews: { $sum: '$metrics.views' },
          totalReach: { $sum: '$metrics.reach' },
          avgEngagementRate: { $avg: '$metrics.engagementRate' },
          avgClickThroughRate: { $avg: '$metrics.clickThroughRate' }
        }
      }
    ]);
    
    // Get top performing posts
    const topPosts = await PostAnalytics.find(filter)
      .sort({ 'metrics.engagementRate': -1 })
      .limit(10);
    
    // Get trending hashtags
    const trendingHashtags = await PostAnalytics.aggregate([
      { $match: filter },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Get platform distribution
    const platformDistribution = await PostAnalytics.aggregate([
      { $match: filter },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      period: { startDate, endDate },
      summary: postStats[0] || {},
      topPosts,
      trendingHashtags,
      platformDistribution
    });
  } catch (error: any) {
    logger.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Custom Reports
app.post('/analytics/reports', async (req, res) => {
  try {
    const { reportType, filters, metrics, groupBy } = req.body;
    
    let reportData;
    
    switch (reportType) {
      case 'performance':
        reportData = await generatePerformanceReport(filters, metrics, groupBy);
        break;
      case 'audience':
        reportData = await generateAudienceReport(filters, metrics, groupBy);
        break;
      case 'competitor':
        reportData = await generateCompetitorReport(filters, metrics, groupBy);
        break;
      case 'trend':
        reportData = await generateTrendReport(filters, metrics, groupBy);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    res.status(200).json({
      reportType,
      generatedAt: new Date(),
      data: reportData
    });
  } catch (error: any) {
    logger.error('Error generating custom report:', error);
    res.status(500).json({ message: error.message });
  }
});

// Helper functions for report generation
async function generatePerformanceReport(filters: any, metrics: string[], groupBy: string) {
  const matchStage: any = {};
  if (filters.platform) matchStage.platform = filters.platform;
  if (filters.dateRange) {
    matchStage.postedAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }
  
  const groupStage: any = { _id: groupBy };
  metrics.forEach(metric => {
    groupStage[metric] = { $sum: `$metrics.${metric}` };
  });
  
  return await PostAnalytics.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { _id: 1 } }
  ]);
}

async function generateAudienceReport(filters: any, metrics: string[], groupBy: string) {
  const matchStage: any = {};
  if (filters.platform) matchStage.platform = filters.platform;
  
  return await AudienceInsights.find(matchStage)
    .sort({ analyzedAt: -1 })
    .limit(1);
}

async function generateCompetitorReport(filters: any, metrics: string[], groupBy: string) {
  const matchStage: any = {};
  if (filters.platform) matchStage.platform = filters.platform;
  
  return await CompetitorAnalysis.find(matchStage)
    .sort({ analyzedAt: -1 });
}

async function generateTrendReport(filters: any, metrics: string[], groupBy: string) {
  const matchStage: any = {};
  if (filters.platform) matchStage.platform = filters.platform;
  if (filters.trendType) matchStage.trendType = filters.trendType;
  
  return await TrendAnalysis.find(matchStage)
    .sort({ volume: -1 })
    .limit(50);
}

// Socket.IO for real-time analytics updates
io.on('connection', (socket) => {
  logger.info('Client connected to Social Analytics Service:', socket.id);
  
  socket.on('subscribe-analytics', (data) => {
    socket.join(`analytics-${data.platform}`);
    logger.info(`Client subscribed to ${data.platform} analytics`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Social Analytics Service:', socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Social Analytics Service running on port ${PORT}`);
  console.log(`Social Analytics Service running on port ${PORT}`);
});
