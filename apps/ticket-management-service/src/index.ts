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

const app = express();
const PORT = process.env.PORT || 3024;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketdb';
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

const ticketQueue = new Queue('ticketQueue', { connection });
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

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Mongoose Schemas
const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report', 'account', 'payment'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'assigned', 'in_progress', 'pending_customer', 'resolved', 'closed'], 
    default: 'open' 
  },
  assignedTo: { type: String, default: null },
  assignedTeam: { type: String, default: null },
  createdBy: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  sla: {
    responseTime: Number, // hours
    resolutionTime: Number, // hours
    responseDeadline: Date,
    resolutionDeadline: Date
  },
  escalation: {
    level: { type: Number, default: 0 },
    escalatedAt: Date,
    escalatedBy: String,
    reason: String
  },
  resolution: {
    solution: String,
    resolvedAt: Date,
    resolvedBy: String,
    customerSatisfaction: Number // 1-5 rating
  },
  history: [{
    action: String,
    description: String,
    performedBy: String,
    performedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report', 'account', 'payment'], 
    required: true 
  },
  members: [{
    userId: String,
    name: String,
    email: String,
    role: { type: String, enum: ['lead', 'member'], default: 'member' },
    skills: [String],
    workload: { type: Number, default: 0 }, // current active tickets
    maxWorkload: { type: Number, default: 10 }
  }],
  sla: {
    responseTime: Number, // hours
    resolutionTime: Number // hours
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Team = mongoose.model('Team', TeamSchema);

const EscalationRuleSchema = new mongoose.Schema({
  ruleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  conditions: {
    category: [String],
    priority: [String],
    timeOpen: Number, // hours
    customerType: String
  },
  actions: {
    escalateTo: String, // team or user
    changePriority: String,
    notify: [String], // email, sms, slack
    autoResponse: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const EscalationRule = mongoose.model('EscalationRule', EscalationRuleSchema);

const SLASchema = new mongoose.Schema({
  slaId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  responseTime: { type: Number, required: true }, // hours
  resolutionTime: { type: Number, required: true }, // hours
  businessHours: {
    start: String, // "09:00"
    end: String, // "17:00"
    timezone: String,
    workingDays: [String] // ["monday", "tuesday", ...]
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const SLA = mongoose.model('SLA', SLASchema);

// Worker to process ticket jobs
const worker = new Worker('ticketQueue', async (job: Job) => {
  logger.info(`Processing ticket job ${job.id} of type ${job.name}`);
  const { jobType, data } = job.data;

  try {
    switch (jobType) {
      case 'auto_assign':
        await autoAssignTicket(data);
        break;
      case 'escalate_ticket':
        await escalateTicket(data);
        break;
      case 'check_sla':
        await checkSLA(data);
        break;
      case 'send_notification':
        await sendNotification(data);
        break;
      case 'auto_resolve':
        await autoResolveTicket(data);
        break;
      default:
        logger.warn(`Unknown ticket job type: ${jobType}`);
    }
  } catch (error: any) {
    logger.error(`Error processing ticket job ${job.id}:`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  logger.error(`Ticket job ${job?.id} failed with error ${err.message}`);
});

// Helper functions
async function autoAssignTicket(data: any) {
  const { ticketId, category, priority, description } = data;
  
  try {
    // Find the best team for this ticket
    const team = await findBestTeam(category, priority);
    
    if (!team) {
      logger.warn(`No team found for category: ${category}`);
      return;
    }
    
    // Find the best member within the team
    const member = await findBestMember(team, priority, description);
    
    if (!member) {
      logger.warn(`No available member found in team: ${team.name}`);
      return;
    }
    
    // Update ticket with assignment
    await Ticket.findOneAndUpdate(
      { ticketId },
      {
        assignedTo: member.userId,
        assignedTeam: team.teamId,
        status: 'assigned',
        $push: {
          history: {
            action: 'assigned',
            description: `Automatically assigned to ${member.name} (${team.name})`,
            performedBy: 'system',
            metadata: { teamId: team.teamId, memberId: member.userId }
          }
        },
        updatedAt: new Date()
      }
    );
    
    // Update member workload
    await Team.findOneAndUpdate(
      { 'members.userId': member.userId },
      { $inc: { 'members.$.workload': 1 } }
    );
    
    // Calculate SLA deadlines
    const sla = await SLA.findOne({ category, priority });
    if (sla) {
      const responseDeadline = moment().add(sla.responseTime, 'hours').toDate();
      const resolutionDeadline = moment().add(sla.resolutionTime, 'hours').toDate();
      
      await Ticket.findOneAndUpdate(
        { ticketId },
        {
          sla: {
            responseTime: sla.responseTime,
            resolutionTime: sla.resolutionTime,
            responseDeadline,
            resolutionDeadline
          }
        }
      );
    }
    
    logger.info(`Ticket ${ticketId} assigned to ${member.name} in team ${team.name}`);
    
    // Send notification to assigned member
    await ticketQueue.add('notify_assignment', {
      jobType: 'send_notification',
      data: {
        type: 'assignment',
        recipient: member.email,
        ticketId,
        title: `New ticket assigned: ${data.title}`,
        message: `You have been assigned ticket ${ticketId}. Priority: ${priority}`
      }
    });
    
  } catch (error: any) {
    logger.error(`Error auto-assigning ticket ${ticketId}:`, error);
    throw error;
  }
}

async function findBestTeam(category: string, priority: string) {
  // Find teams that handle this category
  const teams = await Team.find({
    category,
    isActive: true
  });
  
  if (teams.length === 0) {
    // Fallback to general team
    return await Team.findOne({ category: 'general', isActive: true });
  }
  
  // For critical priority, prefer teams with lower average workload
  if (priority === 'critical') {
    return teams.sort((a, b) => {
      const aWorkload = a.members.reduce((sum, member) => sum + member.workload, 0) / a.members.length;
      const bWorkload = b.members.reduce((sum, member) => sum + member.workload, 0) / b.members.length;
      return aWorkload - bWorkload;
    })[0];
  }
  
  // Default: return first available team
  return teams[0];
}

async function findBestMember(team: any, priority: string, description: string) {
  // Filter available members (workload < maxWorkload)
  const availableMembers = team.members.filter((member: any) => 
    member.workload < member.maxWorkload
  );
  
  if (availableMembers.length === 0) {
    return null;
  }
  
  // For critical priority, prefer leads
  if (priority === 'critical') {
    const leads = availableMembers.filter((member: any) => member.role === 'lead');
    if (leads.length > 0) {
      return leads.sort((a: any, b: any) => a.workload - b.workload)[0];
    }
  }
  
  // Use AI to match skills with ticket description
  if (OPENAI_API_KEY && description) {
    try {
      const skills = availableMembers.map((member: any) => member.skills).flat();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Given this ticket description: "${description}" and these available skills: ${skills.join(', ')}, which skills are most relevant? Return only the most relevant skills as a comma-separated list.`
        }]
      });
      
      const relevantSkills = response.choices[0].message.content?.split(',').map(s => s.trim()) || [];
      
      // Find member with most relevant skills
      const scoredMembers = availableMembers.map((member: any) => ({
        ...member,
        score: member.skills.filter((skill: string) => relevantSkills.includes(skill)).length
      }));
      
      const bestMember = scoredMembers.sort((a, b) => b.score - a.score)[0];
      if (bestMember.score > 0) {
        return bestMember;
      }
    } catch (error) {
      logger.error('Error in AI skill matching:', error);
    }
  }
  
  // Fallback: return member with lowest workload
  return availableMembers.sort((a: any, b: any) => a.workload - b.workload)[0];
}

async function escalateTicket(data: any) {
  const { ticketId, reason, escalatedBy } = data;
  
  try {
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    
    // Find escalation rules
    const rules = await EscalationRule.find({
      isActive: true,
      'conditions.category': ticket.category,
      'conditions.priority': ticket.priority
    });
    
    for (const rule of rules) {
      // Check if escalation conditions are met
      const timeOpen = moment().diff(moment(ticket.createdAt), 'hours');
      
      if (timeOpen >= rule.conditions.timeOpen) {
        // Execute escalation actions
        if (rule.actions.escalateTo) {
          // Find escalation target (team or user)
          const escalationTarget = await findEscalationTarget(rule.actions.escalateTo);
          
          if (escalationTarget) {
            await Ticket.findOneAndUpdate(
              { ticketId },
              {
                assignedTo: escalationTarget.userId || null,
                assignedTeam: escalationTarget.teamId || escalationTarget.teamId,
                priority: rule.actions.changePriority || ticket.priority,
                'escalation.level': ticket.escalation.level + 1,
                'escalation.escalatedAt': new Date(),
                'escalation.escalatedBy': escalatedBy || 'system',
                'escalation.reason': reason || rule.name,
                $push: {
                  history: {
                    action: 'escalated',
                    description: `Escalated to ${escalationTarget.name || escalationTarget.teamName}`,
                    performedBy: escalatedBy || 'system',
                    metadata: { ruleId: rule.ruleId, reason }
                  }
                },
                updatedAt: new Date()
              }
            );
            
            logger.info(`Ticket ${ticketId} escalated to ${escalationTarget.name || escalationTarget.teamName}`);
          }
        }
        
        // Send notifications
        if (rule.actions.notify) {
          for (const notificationType of rule.actions.notify) {
            await ticketQueue.add('notify_escalation', {
              jobType: 'send_notification',
              data: {
                type: 'escalation',
                notificationType,
                ticketId,
                title: `Ticket Escalated: ${ticket.title}`,
                message: `Ticket ${ticketId} has been escalated. Reason: ${reason || rule.name}`
              }
            });
          }
        }
        
        break; // Only apply first matching rule
      }
    }
    
  } catch (error: any) {
    logger.error(`Error escalating ticket ${ticketId}:`, error);
    throw error;
  }
}

async function findEscalationTarget(target: string) {
  // This could be a team ID, user ID, or role
  // For now, implement simple logic
  if (target.startsWith('team:')) {
    const teamId = target.replace('team:', '');
    const team = await Team.findOne({ teamId });
    if (team) {
      const lead = team.members.find(member => member.role === 'lead');
      return lead ? { userId: lead.userId, name: lead.name, teamId } : null;
    }
  }
  
  return null;
}

async function checkSLA(data: any) {
  const { ticketId } = data;
  
  try {
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket || ticket.status === 'resolved' || ticket.status === 'closed') {
      return;
    }
    
    const now = new Date();
    const sla = ticket.sla;
    
    // Check response SLA
    if (sla.responseDeadline && now > sla.responseDeadline && ticket.status === 'open') {
      await ticketQueue.add('escalate_response_sla', {
        jobType: 'escalate_ticket',
        data: {
          ticketId,
          reason: 'Response SLA breached',
          escalatedBy: 'system'
        }
      });
    }
    
    // Check resolution SLA
    if (sla.resolutionDeadline && now > sla.resolutionDeadline) {
      await ticketQueue.add('escalate_resolution_sla', {
        jobType: 'escalate_ticket',
        data: {
          ticketId,
          reason: 'Resolution SLA breached',
          escalatedBy: 'system'
        }
      });
    }
    
  } catch (error: any) {
    logger.error(`Error checking SLA for ticket ${ticketId}:`, error);
    throw error;
  }
}

async function sendNotification(data: any) {
  const { type, recipient, ticketId, title, message, notificationType = 'email' } = data;
  
  try {
    switch (notificationType) {
      case 'email':
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: recipient,
          subject: title,
          html: `
            <h2>${title}</h2>
            <p>${message}</p>
            <p>Ticket ID: ${ticketId}</p>
            <p>You can view the ticket details in the StudySpot portal.</p>
          `
        });
        break;
        
      case 'sms':
        if (process.env.TWILIO_PHONE_NUMBER) {
          await twilioClient.messages.create({
            body: `${title}\n${message}\nTicket: ${ticketId}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipient
          });
        }
        break;
    }
    
    logger.info(`Notification sent to ${recipient} for ticket ${ticketId}`);
    
  } catch (error: any) {
    logger.error(`Error sending notification:`, error);
    throw error;
  }
}

async function autoResolveTicket(data: any) {
  const { ticketId, solution } = data;
  
  try {
    await Ticket.findOneAndUpdate(
      { ticketId },
      {
        status: 'resolved',
        'resolution.solution': solution,
        'resolution.resolvedAt': new Date(),
        'resolution.resolvedBy': 'system',
        $push: {
          history: {
            action: 'auto_resolved',
            description: 'Ticket automatically resolved by system',
            performedBy: 'system',
            metadata: { solution }
          }
        },
        updatedAt: new Date()
      }
    );
    
    logger.info(`Ticket ${ticketId} auto-resolved`);
    
  } catch (error: any) {
    logger.error(`Error auto-resolving ticket ${ticketId}:`, error);
    throw error;
  }
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Ticket Management Service is healthy', uptime: process.uptime() });
});

// Create Ticket
app.post('/tickets', async (req, res) => {
  try {
    const ticketData = {
      ticketId: uuidv4(),
      ...req.body,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    // Add to history
    ticket.history.push({
      action: 'created',
      description: 'Ticket created',
      performedBy: ticketData.createdBy,
      metadata: { source: 'api' }
    });
    await ticket.save();
    
    // Trigger auto-assignment
    await ticketQueue.add('auto_assign', {
      jobType: 'auto_assign',
      data: {
        ticketId: ticket.ticketId,
        category: ticket.category,
        priority: ticket.priority,
        description: ticket.description
      }
    });
    
    // Schedule SLA check
    await ticketQueue.add('sla_check', {
      jobType: 'check_sla',
      data: { ticketId: ticket.ticketId }
    }, {
      delay: 5 * 60 * 1000 // Check after 5 minutes
    });
    
    res.status(201).json(ticket);
  } catch (error: any) {
    logger.error('Error creating ticket:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get Tickets
app.get('/tickets', async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category, 
      assignedTo, 
      assignedTeam,
      createdBy,
      limit = 50,
      page = 1 
    } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    if (createdBy) filter.createdBy = createdBy;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    const total = await Ticket.countDocuments(filter);
    
    res.status(200).json({
      tickets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Single Ticket
app.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(ticket);
  } catch (error: any) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Ticket
app.put('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updates = req.body;
    
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      {
        ...updates,
        updatedAt: new Date(),
        $push: {
          history: {
            action: 'updated',
            description: 'Ticket updated',
            performedBy: updates.updatedBy || 'system',
            metadata: updates
          }
        }
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(ticket);
  } catch (error: any) {
    logger.error('Error updating ticket:', error);
    res.status(400).json({ message: error.message });
  }
});

// Team Management
app.post('/teams', async (req, res) => {
  try {
    const team = new Team({
      teamId: uuidv4(),
      ...req.body
    });
    await team.save();
    res.status(201).json(team);
  } catch (error: any) {
    logger.error('Error creating team:', error);
    res.status(400).json({ message: error.message });
  }
});

app.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true });
    res.status(200).json(teams);
  } catch (error: any) {
    logger.error('Error fetching teams:', error);
    res.status(500).json({ message: error.message });
  }
});

// Escalation Rules
app.post('/escalation-rules', async (req, res) => {
  try {
    const rule = new EscalationRule({
      ruleId: uuidv4(),
      ...req.body
    });
    await rule.save();
    res.status(201).json(rule);
  } catch (error: any) {
    logger.error('Error creating escalation rule:', error);
    res.status(400).json({ message: error.message });
  }
});

// SLA Management
app.post('/slas', async (req, res) => {
  try {
    const sla = new SLA({
      slaId: uuidv4(),
      ...req.body
    });
    await sla.save();
    res.status(201).json(sla);
  } catch (error: any) {
    logger.error('Error creating SLA:', error);
    res.status(400).json({ message: error.message });
  }
});

// Analytics Dashboard
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const endDate = new Date();
    const startDate = moment().subtract(parseInt(period as string), 'days').toDate();
    
    const filter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    // Ticket statistics
    const stats = await Ticket.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          openTickets: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          resolvedTickets: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgResolutionTime: { $avg: '$resolution.resolvedAt' }
        }
      }
    ]);
    
    // Priority distribution
    const priorityDistribution = await Ticket.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Category distribution
    const categoryDistribution = await Ticket.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Team performance
    const teamPerformance = await Ticket.aggregate([
      { $match: { ...filter, assignedTeam: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTeam',
          ticketCount: { $sum: 1 },
          avgResolutionTime: { $avg: '$resolution.resolvedAt' }
        }
      },
      { $sort: { ticketCount: -1 } }
    ]);
    
    res.status(200).json({
      period: { startDate, endDate },
      summary: stats[0] || {},
      priorityDistribution,
      categoryDistribution,
      teamPerformance
    });
  } catch (error: any) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected to Ticket Management Service:', socket.id);
  
  socket.on('subscribe-tickets', (data) => {
    socket.join(`tickets-${data.teamId || data.userId}`);
    logger.info(`Client subscribed to ticket updates`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected from Ticket Management Service:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('*/5 * * * *', async () => {
  // Check SLA every 5 minutes
  const tickets = await Ticket.find({
    status: { $in: ['open', 'assigned', 'in_progress'] }
  });
  
  for (const ticket of tickets) {
    await ticketQueue.add('sla_check', {
      jobType: 'check_sla',
      data: { ticketId: ticket.ticketId }
    });
  }
});

cron.schedule('0 */1 * * *', async () => {
  // Escalation check every hour
  const tickets = await Ticket.find({
    status: { $in: ['open', 'assigned', 'in_progress'] },
    'escalation.level': { $lt: 3 } // Max 3 escalation levels
  });
  
  for (const ticket of tickets) {
    await ticketQueue.add('escalation_check', {
      jobType: 'escalate_ticket',
      data: {
        ticketId: ticket.ticketId,
        reason: 'Scheduled escalation check',
        escalatedBy: 'system'
      }
    });
  }
});

server.listen(PORT, () => {
  logger.info(`Ticket Management Service running on port ${PORT}`);
  console.log(`Ticket Management Service running on port ${PORT}`);
});
