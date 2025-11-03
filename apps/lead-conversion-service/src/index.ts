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
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 3025;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadconversiondb';
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

const leadQueue = new Queue('leadQueue', { connection });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Email configuration
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// SMS configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const LeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  company: String,
  jobTitle: String,
  industry: String,
  companySize: String,
  source: { type: String, required: true }, // website, social, referral, etc.
  status: { 
    type: String, 
    enum: ['new', 'qualified', 'contacted', 'nurturing', 'hot', 'converted', 'lost'], 
    default: 'new' 
  },
  score: { type: Number, default: 0, min: 0, max: 100 },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  assignedTo: { type: String, default: null }, // sales team member
  assignedTeam: { type: String, default: null }, // sales team
  aiAgent: { type: String, default: null }, // AI agent handling the lead
  conversionProbability: { type: Number, default: 0, min: 0, max: 100 },
  tags: [String],
  customFields: { type: mongoose.Schema.Types.Mixed },
  interactions: [{
    type: { type: String, enum: ['email', 'call', 'meeting', 'demo', 'proposal', 'ai_chat'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: String, // user ID or 'ai_agent'
    outcome: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  nurturing: {
    stage: { type: String, enum: ['awareness', 'interest', 'consideration', 'intent', 'evaluation'], default: 'awareness' },
    campaign: String,
    lastTouch: Date,
    touchCount: { type: Number, default: 0 },
    nextAction: String,
    nextActionDate: Date
  },
  conversion: {
    convertedAt: Date,
    convertedBy: String, // user ID or 'ai_agent'
    conversionValue: Number,
    conversionType: String, // subscription, one-time, etc.
    paymentMethod: String,
    subscriptionId: String,
    customerId: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', LeadSchema);

const AIAgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['qualifier', 'nurturer', 'closer', 'follow_up', 'demo_scheduler'], 
    required: true 
  },
  personality: {
    tone: { type: String, enum: ['professional', 'friendly', 'consultative', 'urgent'], default: 'professional' },
    style: { type: String, enum: ['formal', 'casual', 'technical', 'sales'], default: 'sales' }
  },
  capabilities: [String], // email, sms, call, demo, proposal
  rules: {
    leadScoreThreshold: { type: Number, default: 70 },
    maxInteractions: { type: Number, default: 10 },
    escalationThreshold: { type: Number, default: 85 },
    workingHours: {
      start: String, // "09:00"
      end: String, // "17:00"
      timezone: String,
      workingDays: [String]
    }
  },
  performance: {
    leadsHandled: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // minutes
    customerSatisfaction: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const AIAgent = mongoose.model('AIAgent', AIAgentSchema);

const SalesTeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  members: [{
    userId: String,
    name: String,
    email: String,
    role: { type: String, enum: ['manager', 'senior', 'junior'], default: 'junior' },
    specialties: [String],
    workload: { type: Number, default: 0 },
    maxWorkload: { type: Number, default: 20 },
    performance: {
      leadsAssigned: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      avgDealSize: { type: Number, default: 0 }
    }
  }],
  criteria: {
    minLeadScore: { type: Number, default: 80 },
    preferredIndustries: [String],
    preferredCompanySizes: [String],
    maxResponseTime: { type: Number, default: 60 } // minutes
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const SalesTeam = mongoose.model('SalesTeam', SalesTeamSchema);

const ConversionCampaignSchema = new mongoose.Schema({
  campaignId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['email_sequence', 'sms_sequence', 'mixed_sequence', 'ai_nurturing'], 
    required: true 
  },
  targetAudience: {
    leadScore: { min: Number, max: Number },
    industries: [String],
    companySizes: [String],
    sources: [String]
  },
  content: [{
    step: Number,
    type: { type: String, enum: ['email', 'sms', 'call', 'demo'] },
    subject: String,
    content: String,
    delay: Number, // hours after previous step
    conditions: mongoose.Schema.Types.Mixed
  }],
  aiAgent: String, // AI agent ID
  performance: {
    leadsEnrolled: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgTimeToConvert: { type: Number, default: 0 } // days
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ConversionCampaign = mongoose.model('ConversionCampaign', ConversionCampaignSchema);

// Worker to process lead jobs
const worker = new Worker('leadQueue', async (job: Job) => {
  logger.info(`Processing lead job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'qualify_lead':
        await qualifyLead(data);
        break;
      case 'assign_ai_agent':
        await assignAIAgent(data);
        break;
      case 'route_to_sales':
        await routeToSalesTeam(data);
        break;
      case 'nurture_lead':
        await nurtureLead(data);
        break;
      case 'convert_lead':
        await convertLead(data);
        break;
      case 'follow_up':
        await followUpLead(data);
        break;
      default:
        logger.warn(`Unknown lead job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing lead job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Lead job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function qualifyLead(data: any) {
  const { leadId, leadData } = data;
  
  try {
    // Calculate lead score using AI and multiple factors
    const score = await calculateLeadScore(leadData);
    
    // Determine priority based on score
    const priority = determinePriority(score);
    
    // Calculate conversion probability
    const conversionProbability = await calculateConversionProbability(leadData, score);
    
    // Update lead with qualification data
    await Lead.findOneAndUpdate(
      { leadId },
      {
        score,
        priority,
        conversionProbability,
        status: score >= 70 ? 'qualified' : 'new',
        updatedAt: new Date()
      }
    );
    
    logger.info(`Lead ${leadId} qualified with score: ${score}, priority: ${priority}`);
    
    // Trigger next action based on score
    if (score >= 80) {
      // High-potential lead - route to sales team
      await leadQueue.add('route_to_sales', {
        jobType: 'route_to_sales',
        data: { leadId, reason: 'high_score' }
      });
    } else if (score >= 50) {
      // Medium potential - assign AI agent for nurturing
      await leadQueue.add('assign_ai_agent', {
        jobType: 'assign_ai_agent',
        data: { leadId, agentType: 'nurturer' }
      });
    } else {
      // Low potential - assign AI agent for qualification
      await leadQueue.add('assign_ai_agent', {
        jobType: 'assign_ai_agent',
        data: { leadId, agentType: 'qualifier' }
      });
    }
    
  } catch (error: any) {
    logger.error(`Error qualifying lead ${leadId}:`, error);
    throw error;
  }
}

async function calculateLeadScore(leadData: any): Promise<number> {
  let score = 0;
  
  // Company size scoring
  const companySizeScores = {
    '1-10': 20,
    '11-50': 40,
    '51-200': 60,
    '201-1000': 80,
    '1000+': 100
  };
  score += companySizeScores[leadData.companySize as keyof typeof companySizeScores] || 0;
  
  // Industry scoring (high-value industries)
  const industryScores = {
    'technology': 30,
    'finance': 25,
    'healthcare': 25,
    'education': 20,
    'manufacturing': 15,
    'retail': 10
  };
  score += industryScores[leadData.industry as keyof typeof industryScores] || 0;
  
  // Job title scoring
  const titleScores = {
    'ceo': 30,
    'cto': 25,
    'vp': 20,
    'director': 15,
    'manager': 10
  };
  const titleLower = leadData.jobTitle?.toLowerCase() || '';
  for (const [title, points] of Object.entries(titleScores)) {
    if (titleLower.includes(title)) {
      score += points;
      break;
    }
  }
  
  // Source scoring
  const sourceScores = {
    'referral': 25,
    'website': 20,
    'social': 15,
    'email': 10,
    'paid': 5
  };
  score += sourceScores[leadData.source as keyof typeof sourceScores] || 0;
  
  // Use AI for additional scoring if available
  if (OPENAI_API_KEY && leadData.company && leadData.industry) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Rate this lead's potential from 0-100 based on: Company: ${leadData.company}, Industry: ${leadData.industry}, Job Title: ${leadData.jobTitle}, Company Size: ${leadData.companySize}. Consider factors like budget, decision-making authority, and fit with B2B SaaS products. Return only a number.`
        }]
      });
      
      const aiScore = parseInt(response.choices[0].message.content || '0');
      if (aiScore > 0) {
        score = Math.round((score + aiScore) / 2); // Average with AI score
      }
    } catch (error) {
      logger.error('Error in AI lead scoring:', error);
    }
  }
  
  return Math.min(Math.max(score, 0), 100);
}

function determinePriority(score: number): string {
  if (score >= 90) return 'critical';
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

async function calculateConversionProbability(leadData: any, score: number): Promise<number> {
  let probability = score; // Base probability on score
  
  // Adjust based on industry trends
  const industryMultipliers = {
    'technology': 1.2,
    'finance': 1.1,
    'healthcare': 1.0,
    'education': 0.9,
    'manufacturing': 0.8,
    'retail': 0.7
  };
  
  const multiplier = industryMultipliers[leadData.industry as keyof typeof industryMultipliers] || 1.0;
  probability *= multiplier;
  
  // Adjust based on company size
  const sizeMultipliers = {
    '1-10': 0.7,
    '11-50': 0.9,
    '51-200': 1.1,
    '201-1000': 1.3,
    '1000+': 1.5
  };
  
  const sizeMultiplier = sizeMultipliers[leadData.companySize as keyof typeof sizeMultipliers] || 1.0;
  probability *= sizeMultiplier;
  
  return Math.min(Math.round(probability), 100);
}

async function assignAIAgent(data: any) {
  const { leadId, agentType } = data;
  
  try {
    // Find available AI agent of the specified type
    const agent = await AIAgent.findOne({
      type: agentType,
      isActive: true
    });
    
    if (!agent) {
      logger.warn(`No available AI agent found for type: ${agentType}`);
      return;
    }
    
    // Update lead with AI agent assignment
    await Lead.findOneAndUpdate(
      { leadId },
      {
        aiAgent: agent.agentId,
        status: 'nurturing',
        updatedAt: new Date()
      }
    );
    
    logger.info(`Lead ${leadId} assigned to AI agent ${agent.name}`);
    
    // Start AI agent interaction
    await leadQueue.add('ai_interaction', {
      jobType: 'nurture_lead',
      data: { leadId, agentId: agent.agentId }
    });
    
  } catch (error: any) {
    logger.error(`Error assigning AI agent to lead ${leadId}:`, error);
    throw error;
  }
}

async function routeToSalesTeam(data: any) {
  const { leadId, reason } = data;
  
  try {
    const lead = await Lead.findOne({ leadId });
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }
    
    // Find best sales team based on lead criteria
    const salesTeam = await findBestSalesTeam(lead);
    
    if (!salesTeam) {
      logger.warn(`No suitable sales team found for lead ${leadId}`);
      return;
    }
    
    // Find best team member
    const teamMember = await findBestTeamMember(salesTeam, lead);
    
    if (!teamMember) {
      logger.warn(`No available team member found in ${salesTeam.name}`);
      return;
    }
    
    // Update lead with sales team assignment
    await Lead.findOneAndUpdate(
      { leadId },
      {
        assignedTo: teamMember.userId,
        assignedTeam: salesTeam.teamId,
        status: 'hot',
        priority: 'high',
        updatedAt: new Date()
      }
    );
    
    // Update team member workload
    await SalesTeam.findOneAndUpdate(
      { 'members.userId': teamMember.userId },
      { $inc: { 'members.$.workload': 1 } }
    );
    
    logger.info(`Lead ${leadId} routed to sales team ${salesTeam.name}, member ${teamMember.name}`);
    
    // Send notification to sales team member
    await leadQueue.add('notify_sales', {
      jobType: 'send_notification',
      data: {
        type: 'lead_assignment',
        recipient: teamMember.email,
        leadId,
        title: `High-Potential Lead Assigned: ${lead.firstName} ${lead.lastName}`,
        message: `Lead ${leadId} has been assigned to you. Score: ${lead.score}, Priority: ${lead.priority}`
      }
    });
    
  } catch (error: any) {
    logger.error(`Error routing lead ${leadId} to sales team:`, error);
    throw error;
  }
}

async function findBestSalesTeam(lead: any) {
  const teams = await SalesTeam.find({
    isActive: true,
    'criteria.minLeadScore': { $lte: lead.score },
    $or: [
      { 'criteria.preferredIndustries': { $in: [lead.industry] } },
      { 'criteria.preferredIndustries': { $size: 0 } }
    ]
  });
  
  if (teams.length === 0) {
    return await SalesTeam.findOne({ isActive: true }); // Fallback to any active team
  }
  
  // Return team with best match
  return teams[0];
}

async function findBestTeamMember(team: any, lead: any) {
  const availableMembers = team.members.filter((member: any) => 
    member.workload < member.maxWorkload
  );
  
  if (availableMembers.length === 0) {
    return null;
  }
  
  // For high-priority leads, prefer senior members
  if (lead.priority === 'high' || lead.priority === 'critical') {
    const seniorMembers = availableMembers.filter((member: any) => 
      member.role === 'senior' || member.role === 'manager'
    );
    if (seniorMembers.length > 0) {
      return seniorMembers.sort((a: any, b: any) => a.workload - b.workload)[0];
    }
  }
  
  // Return member with lowest workload
  return availableMembers.sort((a: any, b: any) => a.workload - b.workload)[0];
}

async function nurtureLead(data: any) {
  const { leadId, agentId } = data;
  
  try {
    const lead = await Lead.findOne({ leadId });
    const agent = await AIAgent.findOne({ agentId });
    
    if (!lead || !agent) {
      throw new Error(`Lead ${leadId} or agent ${agentId} not found`);
    }
    
    // Generate personalized nurturing content
    const content = await generateNurturingContent(lead, agent);
    
    // Send nurturing message
    await sendNurturingMessage(lead, agent, content);
    
    // Update lead interaction history
    await Lead.findOneAndUpdate(
      { leadId },
      {
        $push: {
          interactions: {
            type: 'ai_chat',
            content: content.message,
            performedBy: 'ai_agent',
            outcome: 'sent',
            metadata: { agentId, contentType: content.type }
          }
        },
        'nurturing.lastTouch': new Date(),
        'nurturing.touchCount': { $inc: 1 },
        updatedAt: new Date()
      }
    );
    
    // Schedule next interaction
    const nextActionDelay = content.nextActionDelay || 24; // hours
    await leadQueue.add('follow_up', {
      jobType: 'follow_up',
      data: { leadId, agentId }
    }, {
      delay: nextActionDelay * 60 * 60 * 1000
    });
    
    logger.info(`AI agent ${agent.name} nurtured lead ${leadId}`);
    
  } catch (error: any) {
    logger.error(`Error nurturing lead ${leadId}:`, error);
    throw error;
  }
}

async function generateNurturingContent(lead: any, agent: any) {
  if (!OPENAI_API_KEY) {
    return {
      type: 'email',
      message: `Hi ${lead.firstName}, thank you for your interest in StudySpot. We'd love to help you with your educational needs.`,
      nextActionDelay: 24
    };
  }
  
  try {
    const prompt = `Generate a personalized nurturing message for a lead with these details:
    Name: ${lead.firstName} ${lead.lastName}
    Company: ${lead.company}
    Industry: ${lead.industry}
    Job Title: ${lead.jobTitle}
    Company Size: ${lead.companySize}
    Lead Score: ${lead.score}
    
    Agent Personality: ${agent.personality.tone}, ${agent.personality.style}
    Agent Type: ${agent.type}
    
    Generate a professional, personalized message that:
    1. Acknowledges their role and company
    2. Provides value relevant to their industry
    3. Introduces StudySpot's benefits
    4. Includes a clear next step
    5. Matches the agent's personality
    
    Return JSON format: {"type": "email", "message": "content", "nextActionDelay": hours}`
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    logger.error('Error generating nurturing content:', error);
    return {
      type: 'email',
      message: `Hi ${lead.firstName}, thank you for your interest in StudySpot. We'd love to help you with your educational needs.`,
      nextActionDelay: 24
    };
  }
}

async function sendNurturingMessage(lead: any, agent: any, content: any) {
  try {
    if (content.type === 'email') {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: lead.email,
        subject: `StudySpot - ${content.subject || 'Personalized Solution for Your Needs'}`,
        html: content.message
      });
    } else if (content.type === 'sms' && lead.phone) {
      await twilioClient.messages.create({
        body: content.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: lead.phone
      });
    }
    
    logger.info(`Nurturing message sent to lead ${lead.leadId} via ${content.type}`);
  } catch (error) {
    logger.error('Error sending nurturing message:', error);
  }
}

async function convertLead(data: any) {
  const { leadId, conversionData } = data;
  
  try {
    const lead = await Lead.findOne({ leadId });
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }
    
    // Process payment if provided
    let customerId = null;
    let subscriptionId = null;
    
    if (conversionData.paymentMethod === 'stripe' && conversionData.paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(conversionData.paymentIntentId);
      if (paymentIntent.status === 'succeeded') {
        customerId = paymentIntent.customer as string;
        subscriptionId = conversionData.subscriptionId;
      }
    }
    
    // Update lead with conversion data
    await Lead.findOneAndUpdate(
      { leadId },
      {
        status: 'converted',
        conversion: {
          convertedAt: new Date(),
          convertedBy: conversionData.convertedBy || 'ai_agent',
          conversionValue: conversionData.conversionValue || 0,
          conversionType: conversionData.conversionType || 'subscription',
          paymentMethod: conversionData.paymentMethod,
          subscriptionId,
          customerId
        },
        $push: {
          interactions: {
            type: 'conversion',
            content: `Lead converted to customer`,
            performedBy: conversionData.convertedBy || 'ai_agent',
            outcome: 'converted',
            metadata: conversionData
          }
        },
        updatedAt: new Date()
      }
    );
    
    // Update AI agent performance
    if (lead.aiAgent) {
      await AIAgent.findOneAndUpdate(
        { agentId: lead.aiAgent },
        {
          $inc: { 'performance.conversions': 1 },
          $set: { 'performance.conversionRate': await calculateAgentConversionRate(lead.aiAgent) }
        }
      );
    }
    
    // Update sales team performance if assigned
    if (lead.assignedTo) {
      await SalesTeam.findOneAndUpdate(
        { 'members.userId': lead.assignedTo },
        {
          $inc: { 'members.$.performance.conversions': 1 },
          $set: { 'members.$.performance.conversionRate': await calculateMemberConversionRate(lead.assignedTo) }
        }
      );
    }
    
    logger.info(`Lead ${leadId} converted to customer`);
    
    // Send conversion notification
    await leadQueue.add('notify_conversion', {
      jobType: 'send_notification',
      data: {
        type: 'conversion',
        leadId,
        title: `Lead Converted: ${lead.firstName} ${lead.lastName}`,
        message: `Lead ${leadId} has been converted to a customer. Value: $${conversionData.conversionValue || 0}`
      }
    });
    
  } catch (error: any) {
    logger.error(`Error converting lead ${leadId}:`, error);
    throw error;
  }
}

async function followUpLead(data: any) {
  const { leadId, agentId } = data;
  
  try {
    const lead = await Lead.findOne({ leadId });
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }
    
    // Check if lead should be escalated to sales team
    if (lead.score >= 80 && lead.status !== 'hot') {
      await leadQueue.add('route_to_sales', {
        jobType: 'route_to_sales',
        data: { leadId, reason: 'high_score_follow_up' }
      });
      return;
    }
    
    // Continue nurturing if still in nurturing stage
    if (lead.status === 'nurturing' && lead.nurturing.touchCount < 10) {
      await leadQueue.add('nurture_lead', {
        jobType: 'nurture_lead',
        data: { leadId, agentId }
      });
    } else {
      // Mark as lost if too many touches without conversion
      await Lead.findOneAndUpdate(
        { leadId },
        {
          status: 'lost',
          updatedAt: new Date()
        }
      );
    }
    
  } catch (error: any) {
    logger.error(`Error following up lead ${leadId}:`, error);
    throw error;
  }
}

async function calculateAgentConversionRate(agentId: string): Promise<number> {
  const agent = await AIAgent.findOne({ agentId });
  if (!agent) return 0;
  
  const conversions = agent.performance.conversions;
  const leadsHandled = agent.performance.leadsHandled;
  
  return leadsHandled > 0 ? Math.round((conversions / leadsHandled) * 100) : 0;
}

async function calculateMemberConversionRate(userId: string): Promise<number> {
  const team = await SalesTeam.findOne({ 'members.userId': userId });
  if (!team) return 0;
  
  const member = team.members.find(m => m.userId === userId);
  if (!member) return 0;
  
  const conversions = member.performance.conversions;
  const leadsAssigned = member.performance.leadsAssigned;
  
  return leadsAssigned > 0 ? Math.round((conversions / leadsAssigned) * 100) : 0;
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Lead Conversion Service is healthy', uptime: process.uptime() });
});

// Create Lead
app.post('/leads', async (req, res) => {
  try {
    const leadData = {
      leadId: uuidv4(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const lead = new Lead(leadData);
    await lead.save();
    
    // Trigger lead qualification
    await leadQueue.add('qualify_lead', {
      jobType: 'qualify_lead',
      data: { leadId: lead.leadId, leadData }
    });
    
    res.status(201).json(lead);
  } catch (error: any) {
    logger.error('Error creating lead:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Leads
app.get('/leads', async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      assignedTeam,
      aiAgent,
      limit = 50,
      page = 1 
    } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    if (aiAgent) filter.aiAgent = aiAgent;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const leads = await Lead.find(filter)
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Lead.countDocuments(filter);
    
    res.status(200).json({
      leads,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({ message: error.message });
  }
});

// AI Agent Management
app.post('/ai-agents', async (req, res) => {
  try {
    const agent = new AIAgent({
      agentId: uuidv4(),
      ...req.body
    });
    await agent.save();
    res.status(201).json(agent);
  } catch (error: any) {
    logger.error('Error creating AI agent:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/ai-agents', async (req, res) => {
  try {
    const agents = await AIAgent.find({ isActive: true });
    res.status(200).json(agents);
  } catch (error: any) {
    logger.error('Error fetching AI agents:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sales Team Management
app.post('/sales-teams', async (req, res) => {
  try {
    const team = new SalesTeam({
      teamId: uuidv4(),
      ...req.body
    });
    await team.save();
    res.status(201).json(team);
  } catch (error: any) {
    logger.error('Error creating sales team:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/sales-teams', async (req, res) => {
  try {
    const teams = await SalesTeam.find({ isActive: true });
    res.status(200).json(teams);
  } catch (error: any) {
    logger.error('Error fetching sales teams:', error);
    res.status(500).json({ message: error.message });
  }
});

// Conversion Analytics
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    const filter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    // Lead statistics
    const stats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: { $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] } },
          convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          avgLeadScore: { $avg: '$score' },
          avgConversionProbability: { $avg: '$conversionProbability' }
        }
      }
    ]);
    
    // AI Agent performance
    const agentPerformance = await AIAgent.aggregate([
      {
        $group: {
          _id: null,
          totalAgents: { $sum: 1 },
          avgConversionRate: { $avg: '$performance.conversionRate' },
          totalConversions: { $sum: '$performance.conversions' }
        }
      }
    ]);
    
    // Sales team performance
    const teamPerformance = await SalesTeam.aggregate([
      {
        $group: {
          _id: null,
          totalTeams: { $sum: 1 },
          avgTeamConversionRate: { $avg: '$members.performance.conversionRate' },
          totalTeamConversions: { $sum: '$members.performance.conversions' }
        }
      }
    ]);
    
    // Conversion funnel
    const funnel = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      period: { startDate, endDate },
      summary: stats[0] || {},
      agentPerformance: agentPerformance[0] || {},
      teamPerformance: teamPerformance[0] || {},
      funnel
    });
  } catch (error: any) {
    logger.error('Error fetching conversion analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Lead Conversion Service:', socket.id);
  
  socket.on('subscribe-leads', (data) => {
    socket.join(`leads-${data.teamId || data.userId}`);
    logger.info(`Client subscribed to lead updates`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Lead Conversion Service:', socket.id);
  });
});

server.listen(PORT, () => {
  logger.info(`Lead Conversion Service running on port ${PORT}`);
  console.log(`Lead Conversion Service running on port ${PORT}`);
});
