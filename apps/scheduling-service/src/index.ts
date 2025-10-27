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

const app = express();
const PORT = process.env.PORT || 3021;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulingdb';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

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

const schedulingQueue = new Queue('schedulingQueue', { connection });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const ScheduledPostSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrls: [String],
  hashtags: [String],
  mentions: [String],
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'published', 'failed', 'cancelled'], default: 'scheduled' },
  priority: { type: Number, default: 1 }, // 1 = low, 2 = medium, 3 = high
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ScheduledPost = mongoose.model('ScheduledPost', ScheduledPostSchema);

const ContentCalendarSchema = new mongoose.Schema({
  calendarId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  platforms: [String],
  schedule: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], required: true },
    times: [String], // ["09:00", "15:00", "20:00"]
    days: [String], // ["monday", "tuesday", "wednesday"]
    timezone: { type: String, default: 'UTC' }
  },
  contentTypes: [String], // ["text", "image", "video", "link"]
  hashtags: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ContentCalendar = mongoose.model('ContentCalendar', ContentCalendarSchema);

const OptimalTimingSchema = new mongoose.Schema({
  timingId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  audienceData: {
    activeHours: { type: Map, of: Number },
    bestDays: { type: Map, of: Number },
    timezone: String
  },
  recommendations: {
    bestTimes: [String],
    bestDays: [String],
    avoidTimes: [String],
    avoidDays: [String]
  },
  confidence: Number,
  lastUpdated: { type: Date, default: Date.now }
});
const OptimalTiming = mongoose.model('OptimalTiming', OptimalTimingSchema);

const QueueManagementSchema = new mongoose.Schema({
  queueId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  queueSettings: {
    maxPostsPerDay: { type: Number, default: 10 },
    minIntervalMinutes: { type: Number, default: 30 },
    maxIntervalMinutes: { type: Number, default: 240 },
    avoidTimes: [String], // ["12:00-13:00", "18:00-19:00"]
    priorityOrder: { type: String, enum: ['fifo', 'priority', 'optimal'], default: 'optimal' }
  },
  currentQueue: [{
    postId: String,
    scheduledTime: Date,
    priority: Number
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const QueueManagement = mongoose.model('QueueManagement', QueueManagementSchema);

// Worker to process scheduled posts
const worker = new Worker('schedulingQueue', async (job: Job) => {
  logger.info(`Processing scheduling job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'publish_post':
        await publishPost(data);
        break;
      case 'optimize_schedule':
        await optimizeSchedule(data);
        break;
      case 'manage_queue':
        await manageQueue(data);
        break;
      case 'bulk_schedule':
        await bulkSchedule(data);
        break;
      default:
        logger.warn(`Unknown scheduling job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing scheduling job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Scheduling job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function publishPost(data: any) {
  const { postId, platform, content, mediaUrls, hashtags, mentions } = data;
  
  try {
    // Simulate platform-specific posting
    logger.info(`Publishing post ${postId} to ${platform}`);
    
    // Update post status
    await ScheduledPost.findOneAndUpdate(
      { postId },
      { 
        status: 'published',
        updatedAt: new Date()
      }
    );
    
    // Emit real-time update
    io.emit('post-published', {
      postId,
      platform,
      content,
      publishedAt: new Date()
    });
    
    logger.info(`Post ${postId} published successfully to ${platform}`);
  } catch (error: any) {
    logger.error(`Error publishing post ${postId}:`, error);
    
    // Update post status to failed
    await ScheduledPost.findOneAndUpdate(
      { postId },
      { 
        status: 'failed',
        retryCount: { $inc: 1 },
        updatedAt: new Date()
      }
    );
    
    throw error;
  }
}

async function optimizeSchedule(data: any) {
  const { platform, audienceData } = data;
  
  try {
    // Analyze audience data to determine optimal posting times
    const optimalTimes = calculateOptimalTimes(audienceData);
    
    const optimalTiming = new OptimalTiming({
      timingId: uuidv4(),
      platform,
      audienceData,
      recommendations: optimalTimes,
      confidence: calculateConfidence(audienceData)
    });
    
    await optimalTiming.save();
    
    logger.info(`Optimal timing calculated for ${platform}:`, optimalTimes);
    
    // Emit optimization update
    io.emit('schedule-optimized', {
      platform,
      optimalTimes,
      confidence: optimalTiming.confidence
    });
  } catch (error: any) {
    logger.error('Error optimizing schedule:', error);
    throw error;
  }
}

async function manageQueue(data: any) {
  const { platform, queueSettings } = data;
  
  try {
    // Get scheduled posts for the platform
    const scheduledPosts = await ScheduledPost.find({
      platform,
      status: 'scheduled',
      scheduledTime: { $gte: new Date() }
    }).sort({ priority: -1, scheduledTime: 1 });
    
    // Apply queue management rules
    const optimizedQueue = optimizeQueueOrder(scheduledPosts, queueSettings);
    
    // Update queue management record
    await QueueManagement.findOneAndUpdate(
      { platform },
      {
        queueSettings,
        currentQueue: optimizedQueue.map(post => ({
          postId: post.postId,
          scheduledTime: post.scheduledTime,
          priority: post.priority
        })),
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    logger.info(`Queue managed for ${platform}: ${optimizedQueue.length} posts`);
  } catch (error: any) {
    logger.error('Error managing queue:', error);
    throw error;
  }
}

async function bulkSchedule(data: any) {
  const { posts, calendarId } = data;
  
  try {
    const scheduledPosts = [];
    
    for (const post of posts) {
      const scheduledPost = new ScheduledPost({
        postId: uuidv4(),
        ...post,
        status: 'scheduled'
      });
      
      await scheduledPost.save();
      scheduledPosts.push(scheduledPost);
      
      // Schedule the post for publishing
      await schedulingQueue.add('publish_post', {
        jobType: 'publish_post',
        data: {
          postId: scheduledPost.postId,
          platform: scheduledPost.platform,
          content: scheduledPost.content,
          mediaUrls: scheduledPost.mediaUrls,
          hashtags: scheduledPost.hashtags,
          mentions: scheduledPost.mentions
        }
      }, {
        delay: scheduledPost.scheduledTime.getTime() - Date.now()
      });
    }
    
    logger.info(`Bulk scheduled ${scheduledPosts.length} posts`);
    
    // Emit bulk schedule update
    io.emit('bulk-scheduled', {
      calendarId,
      postsCount: scheduledPosts.length,
      scheduledAt: new Date()
    });
  } catch (error: any) {
    logger.error('Error bulk scheduling posts:', error);
    throw error;
  }
}

function calculateOptimalTimes(audienceData: any) {
  const { activeHours, bestDays, timezone } = audienceData;
  
  // Simple algorithm to find optimal times
  const optimalTimes = [];
  const avoidTimes = [];
  
  // Find peak hours (highest activity)
  const sortedHours = Object.entries(activeHours || {})
    .sort(([,a], [,b]) => (b as number) - (a as number));
  
  // Top 3 active hours become optimal times
  for (let i = 0; i < Math.min(3, sortedHours.length); i++) {
    optimalTimes.push(sortedHours[i][0]);
  }
  
  // Hours with very low activity become avoid times
  const avgActivity = Object.values(activeHours || {}).reduce((a: number, b: number) => a + b, 0) / Object.keys(activeHours || {}).length;
  for (const [hour, activity] of Object.entries(activeHours || {})) {
    if ((activity as number) < avgActivity * 0.3) {
      avoidTimes.push(hour);
    }
  }
  
  return {
    bestTimes: optimalTimes,
    bestDays: Object.keys(bestDays || {}),
    avoidTimes,
    avoidDays: []
  };
}

function calculateConfidence(audienceData: any) {
  const { activeHours } = audienceData;
  
  if (!activeHours || Object.keys(activeHours).length === 0) {
    return 0.1; // Low confidence with no data
  }
  
  // Calculate confidence based on data quality and consistency
  const values = Object.values(activeHours);
  const variance = calculateVariance(values as number[]);
  const dataPoints = values.length;
  
  // Higher confidence with more data points and lower variance
  const confidence = Math.min(0.9, (dataPoints / 24) * (1 - variance));
  return Math.max(0.1, confidence);
}

function calculateVariance(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return variance / (mean * mean); // Normalized variance
}

function optimizeQueueOrder(posts: any[], queueSettings: any) {
  const { priorityOrder, maxPostsPerDay, minIntervalMinutes } = queueSettings;
  
  let optimizedPosts = [...posts];
  
  switch (priorityOrder) {
    case 'priority':
      optimizedPosts.sort((a, b) => b.priority - a.priority);
      break;
    case 'fifo':
      optimizedPosts.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
      break;
    case 'optimal':
      // Sort by priority first, then by optimal timing
      optimizedPosts.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.scheduledTime.getTime() - b.scheduledTime.getTime();
      });
      break;
  }
  
  // Apply interval constraints
  const constrainedPosts = [];
  let lastPostTime = 0;
  
  for (const post of optimizedPosts) {
    const postTime = post.scheduledTime.getTime();
    const timeDiff = postTime - lastPostTime;
    
    if (timeDiff >= minIntervalMinutes * 60 * 1000) {
      constrainedPosts.push(post);
      lastPostTime = postTime;
    }
  }
  
  return constrainedPosts.slice(0, maxPostsPerDay);
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Scheduling Service is healthy', uptime: process.uptime() });
});

// Schedule Post
app.post('/schedule', async (req, res) => {
  try {
    const scheduledPost = new ScheduledPost({
      postId: uuidv4(),
      ...req.body,
      status: 'scheduled'
    });
    
    await scheduledPost.save();
    
    // Add to scheduling queue
    await schedulingQueue.add('publish_post', {
      jobType: 'publish_post',
      data: {
        postId: scheduledPost.postId,
        platform: scheduledPost.platform,
        content: scheduledPost.content,
        mediaUrls: scheduledPost.mediaUrls,
        hashtags: scheduledPost.hashtags,
        mentions: scheduledPost.mentions
      }
    }, {
      delay: scheduledPost.scheduledTime.getTime() - Date.now()
    });
    
    res.status(201).json(scheduledPost);
  } catch (error: any) {
    logger.error('Error scheduling post:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Scheduled Posts
app.get('/schedule', async (req, res) => {
  try {
    const { platform, status, limit = 100 } = req.query;
    const filter: any = {};
    
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    
    const posts = await ScheduledPost.find(filter)
      .sort({ scheduledTime: 1 })
      .limit(parseInt(limit as string));
    
    res.status(200).json(posts);
  } catch (error: any) {
    logger.error('Error fetching scheduled posts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Content Calendar Management
app.post('/calendar', async (req, res) => {
  try {
    const calendar = new ContentCalendar({
      calendarId: uuidv4(),
      ...req.body
    });
    
    await calendar.save();
    res.status(201).json(calendar);
  } catch (error: any) {
    logger.error('Error creating content calendar:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/calendar', async (req, res) => {
  try {
    const calendars = await ContentCalendar.find({ isActive: true });
    res.status(200).json(calendars);
  } catch (error: any) {
    logger.error('Error fetching content calendars:', error);
    res.status(500).json({ message: error.message });
  }
});

// Optimal Timing
app.post('/timing/optimize', async (req, res) => {
  try {
    const { platform, audienceData } = req.body;
    
    await schedulingQueue.add('optimize_schedule', {
      jobType: 'optimize_schedule',
      data: { platform, audienceData }
    });
    
    res.status(202).json({ message: 'Schedule optimization triggered' });
  } catch (error: any) {
    logger.error('Error triggering schedule optimization:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/timing/optimal', async (req, res) => {
  try {
    const { platform } = req.query;
    const filter = platform ? { platform } : {};
    
    const optimalTimings = await OptimalTiming.find(filter)
      .sort({ lastUpdated: -1 });
    
    res.status(200).json(optimalTimings);
  } catch (error: any) {
    logger.error('Error fetching optimal timings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Queue Management
app.post('/queue/manage', async (req, res) => {
  try {
    const { platform, queueSettings } = req.body;
    
    await schedulingQueue.add('manage_queue', {
      jobType: 'manage_queue',
      data: { platform, queueSettings }
    });
    
    res.status(202).json({ message: 'Queue management triggered' });
  } catch (error: any) {
    logger.error('Error triggering queue management:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/queue/status', async (req, res) => {
  try {
    const { platform } = req.query;
    const filter = platform ? { platform } : {};
    
    const queueStatus = await QueueManagement.find(filter);
    res.status(200).json(queueStatus);
  } catch (error: any) {
    logger.error('Error fetching queue status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk Operations
app.post('/bulk/schedule', async (req, res) => {
  try {
    const { posts, calendarId } = req.body;
    
    await schedulingQueue.add('bulk_schedule', {
      jobType: 'bulk_schedule',
      data: { posts, calendarId }
    });
    
    res.status(202).json({ message: 'Bulk scheduling triggered' });
  } catch (error: any) {
    logger.error('Error triggering bulk scheduling:', error);
    res.status(500).json({ message: error.message });
  }
});

// Analytics
app.get('/analytics', async (req, res) => {
  try {
    const { platform, period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    const filter: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    if (platform) filter.platform = platform;
    
    const stats = await ScheduledPost.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalScheduled: { $sum: 1 },
          totalPublished: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          avgRetryCount: { $avg: '$retryCount' }
        }
      }
    ]);
    
    const platformDistribution = await ScheduledPost.aggregate([
      { $match: filter },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      period: { startDate, endDate },
      summary: stats[0] || {},
      platformDistribution
    });
  } catch (error: any) {
    logger.error('Error fetching scheduling analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Scheduling Service:', socket.id);
  
  socket.on('subscribe-schedule', (data) => {
    socket.join(`schedule-${data.platform}`);
    logger.info(`Client subscribed to ${data.platform} schedule updates`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Scheduling Service:', socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Scheduling Service running on port ${PORT}`);
  console.log(`Scheduling Service running on port ${PORT}`);
});
