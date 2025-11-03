import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import axios from 'axios';
import mongoose from 'mongoose';
import { Queue, Worker, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import natural from 'natural';
import nlp from 'compromise';
import OpenAI from 'openai';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3019;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/engagementdb';
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

const engagementQueue = new Queue('engagementQueue', { connection });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const EngagementRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  platform: { type: String, required: true },
  triggerKeywords: [String],
  triggerHashtags: [String],
  triggerMentions: [String],
  actionType: { type: String, enum: ['like', 'comment', 'share', 'follow', 'dm'], required: true },
  actionTemplate: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const EngagementRule = mongoose.model('EngagementRule', EngagementRuleSchema);

const LeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  username: { type: String, required: true },
  profileUrl: String,
  bio: String,
  followersCount: Number,
  engagementRate: Number,
  interests: [String],
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  status: { type: String, enum: ['prospect', 'contacted', 'qualified', 'converted'], default: 'prospect' },
  lastEngagement: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', LeadSchema);

const SentimentSchema = new mongoose.Schema({
  sentimentId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  contentId: String,
  content: String,
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
  confidence: Number,
  keywords: [String],
  author: String,
  createdAt: { type: Date, default: Date.now }
});
const Sentiment = mongoose.model('Sentiment', SentimentSchema);

// Worker to process engagement jobs
const worker = new Worker('engagementQueue', async (job: Job) => {
  logger.info(`Processing engagement job ${job.id} of type ${job.name}`);
  const { engagementType, data } = job.data;

  try {
    switch (engagementType) {
      case 'auto_engage':
        await processAutoEngagement(data);
        break;
      case 'lead_generation':
        await processLeadGeneration(data);
        break;
      case 'sentiment_analysis':
        await processSentimentAnalysis(data);
        break;
      case 'crisis_detection':
        await processCrisisDetection(data);
        break;
      default:
        logger.warn(`Unknown engagement type: ${engagementType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing engagement job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Engagement job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function processAutoEngagement(data: any) {
  const { platform, content, userId, postId } = data;
  
  // Analyze content for engagement opportunities
  const doc = nlp(content);
  const keywords = doc.nouns().out('array');
  const hashtags = content.match(/#\w+/g) || [];
  
  // Find matching engagement rules
  const rules = await EngagementRule.find({
    platform,
    isActive: true,
    $or: [
      { triggerKeywords: { $in: keywords } },
      { triggerHashtags: { $in: hashtags } }
    ]
  });
  
  for (const rule of rules) {
    switch (rule.actionType) {
      case 'like':
        await performLike(platform, postId);
        break;
      case 'comment':
        await performComment(platform, postId, rule.actionTemplate);
        break;
      case 'share':
        await performShare(platform, postId);
        break;
      case 'follow':
        await performFollow(platform, userId);
        break;
    }
    logger.info(`Executed ${rule.actionType} action for rule ${rule.name}`);
  }
}

async function processLeadGeneration(data: any) {
  const { platform, userData, content } = data;
  
  // Analyze user profile for lead potential
  const leadScore = calculateLeadScore(userData, content);
  
  if (leadScore > 0.7) { // High potential lead
    const lead = new Lead({
      leadId: uuidv4(),
      platform,
      username: userData.username,
      profileUrl: userData.profileUrl,
      bio: userData.bio,
      followersCount: userData.followersCount,
      engagementRate: userData.engagementRate,
      interests: extractInterests(userData.bio, content),
      status: 'prospect'
    });
    
    await lead.save();
    logger.info(`New lead identified: ${userData.username} (Score: ${leadScore})`);
    
    // Trigger automated outreach
    await engagementQueue.add('outreach', {
      engagementType: 'outreach',
      data: { leadId: lead.leadId, platform }
    });
  }
}

async function processSentimentAnalysis(data: any) {
  const { platform, content, author, contentId } = data;
  
  // Use OpenAI for sentiment analysis
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "user",
      content: `Analyze the sentiment of this social media post and respond with JSON format: {"sentiment": "positive/negative/neutral", "confidence": 0.0-1.0, "keywords": ["keyword1", "keyword2"]}\n\nPost: ${content}`
    }]
  });
  
  try {
    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    const sentiment = new Sentiment({
      sentimentId: uuidv4(),
      platform,
      contentId,
      content,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      keywords: analysis.keywords || [],
      author
    });
    
    await sentiment.save();
    logger.info(`Sentiment analysis completed for ${platform} post: ${analysis.sentiment}`);
    
    // If negative sentiment detected, trigger crisis management
    if (analysis.sentiment === 'negative' && analysis.confidence > 0.8) {
      await engagementQueue.add('crisis_response', {
        engagementType: 'crisis_response',
        data: { sentimentId: sentiment.sentimentId, platform, content, author }
      });
    }
  } catch (error) {
    logger.error('Error parsing sentiment analysis response:', error);
  }
}

async function processCrisisDetection(data: any) {
  const { sentimentId, platform, content, author } = data;
  
  logger.warn(`Crisis detected: Negative sentiment from ${author} on ${platform}`);
  
  // Implement crisis response logic
  // This could include:
  // - Automated response generation
  // - Escalation to human team
  // - Damage control measures
  
  // For now, log the crisis
  logger.error(`CRISIS ALERT: Negative sentiment detected from ${author} on ${platform}: ${content}`);
}

function calculateLeadScore(userData: any, content: string): number {
  let score = 0;
  
  // Follower count factor
  if (userData.followersCount > 10000) score += 0.3;
  else if (userData.followersCount > 1000) score += 0.2;
  else if (userData.followersCount > 100) score += 0.1;
  
  // Engagement rate factor
  if (userData.engagementRate > 0.05) score += 0.3;
  else if (userData.engagementRate > 0.02) score += 0.2;
  else if (userData.engagementRate > 0.01) score += 0.1;
  
  // Bio analysis
  const bio = userData.bio?.toLowerCase() || '';
  if (bio.includes('business') || bio.includes('entrepreneur')) score += 0.2;
  if (bio.includes('contact') || bio.includes('email')) score += 0.1;
  
  // Content analysis
  const contentLower = content.toLowerCase();
  if (contentLower.includes('interested') || contentLower.includes('looking for')) score += 0.1;
  
  return Math.min(score, 1.0);
}

function extractInterests(bio: string, content: string): string[] {
  const text = `${bio} ${content}`.toLowerCase();
  const interests: string[] = [];
  
  const interestKeywords = [
    'technology', 'business', 'marketing', 'education', 'health', 'fitness',
    'travel', 'food', 'fashion', 'art', 'music', 'sports', 'finance'
  ];
  
  interestKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      interests.push(keyword);
    }
  });
  
  return interests;
}

// Platform-specific engagement functions (simplified)
async function performLike(platform: string, postId: string) {
  logger.info(`Liking ${platform} post: ${postId}`);
  // Implement platform-specific like API call
}

async function performComment(platform: string, postId: string, template: string) {
  logger.info(`Commenting on ${platform} post ${postId}: ${template}`);
  // Implement platform-specific comment API call
}

async function performShare(platform: string, postId: string) {
  logger.info(`Sharing ${platform} post: ${postId}`);
  // Implement platform-specific share API call
}

async function performFollow(platform: string, userId: string) {
  logger.info(`Following ${platform} user: ${userId}`);
  // Implement platform-specific follow API call
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Engagement Service is healthy', uptime: process.uptime() });
});

// Engagement Rules Management
app.post('/rules', async (req, res) => {
  try {
    const rule = new EngagementRule({
      ruleId: uuidv4(),
      ...req.body
    });
    await rule.save();
    res.status(201).json(rule);
  } catch (error: any) {
    logger.error('Error creating engagement rule:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/rules', async (req, res) => {
  try {
    const rules = await EngagementRule.find();
    res.status(200).json(rules);
  } catch (error: any) {
    logger.error('Error fetching engagement rules:', error);
    res.status(500).json({ message: error.message });
  }
});

// Lead Management
app.post('/leads', async (req, res) => {
  try {
    const lead = new Lead({
      leadId: uuidv4(),
      ...req.body
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error: any) {
    logger.error('Error creating lead:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error: any) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({ message: error.message });
  }
});

// Trigger Engagement
app.post('/engage', async (req, res) => {
  const { engagementType, data } = req.body;
  
  try {
    await engagementQueue.add('engagement', { engagementType, data });
    res.status(202).json({ message: 'Engagement triggered successfully' });
  } catch (error: any) {
    logger.error('Error triggering engagement:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sentiment Analysis
app.post('/sentiment', async (req, res) => {
  const { platform, content, author, contentId } = req.body;
  
  try {
    await engagementQueue.add('sentiment', {
      engagementType: 'sentiment_analysis',
      data: { platform, content, author, contentId }
    });
    res.status(202).json({ message: 'Sentiment analysis triggered' });
  } catch (error: any) {
    logger.error('Error triggering sentiment analysis:', error);
    res.status(500).json({ message: error.message });
  }
});

// Analytics
app.get('/analytics', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ status: 'qualified' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    
    const positiveSentiment = await Sentiment.countDocuments({ sentiment: 'positive' });
    const negativeSentiment = await Sentiment.countDocuments({ sentiment: 'negative' });
    const neutralSentiment = await Sentiment.countDocuments({ sentiment: 'neutral' });
    
    res.status(200).json({
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
        converted: convertedLeads,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
      },
      sentiment: {
        positive: positiveSentiment,
        negative: negativeSentiment,
        neutral: neutralSentiment,
        total: positiveSentiment + negativeSentiment + neutralSentiment
      }
    });
  } catch (error: any) {
    logger.error('Error fetching engagement analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Engagement Service:', socket.id);
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Engagement Service:', socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Engagement Service running on port ${PORT}`);
  console.log(`Engagement Service running on port ${PORT}`);
});
