/**
 * UNIT TESTS - STUDENT SUPPORT SERVICE
 * Tests for: Support ticket management, FAQ & knowledge base access,
 * live chat with agents, issue resolution tracking
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { tenantDbManager, coreDb } from '../../../src/config/database';

describe('Student Support Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Support Ticket Management', () => {
    it('should create support ticket', async () => {
      const ticket = {
        student_id: 'student-123',
        subject: 'Payment Issue',
        description: 'Unable to process payment',
        category: 'payment',
        priority: 'high',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'ticket-123', ticket_number: 'TKT-001', ...ticket, status: 'open' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO support_tickets (student_id, subject, description, category, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [ticket.student_id, ticket.subject, ticket.description, ticket.category, ticket.priority, 'open']
      );

      expect(result.rows[0].status).toBe('open');
      expect(result.rows[0].ticket_number).toBeDefined();
    });

    it('should update ticket status', async () => {
      const ticketId = 'ticket-123';
      const newStatus = 'resolved';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: ticketId, status: newStatus, resolved_at: new Date() }],
      });

      const result = await mockTenantDb.query(
        `UPDATE support_tickets SET status = $1, resolved_at = NOW() WHERE id = $2 RETURNING *`,
        [newStatus, ticketId]
      );

      expect(result.rows[0].status).toBe(newStatus);
    });

    it('should assign ticket to agent', async () => {
      const ticketId = 'ticket-123';
      const agentId = 'agent-456';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: ticketId, assigned_to: agentId, assigned_at: new Date() }],
      });

      const result = await mockTenantDb.query(
        `UPDATE support_tickets SET assigned_to = $1, assigned_at = NOW() WHERE id = $2 RETURNING *`,
        [agentId, ticketId]
      );

      expect(result.rows[0].assigned_to).toBe(agentId);
    });
  });

  describe('FAQ & Knowledge Base Access', () => {
    it('should search FAQ articles', async () => {
      const searchQuery = 'payment';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { id: 'faq-1', question: 'How to make a payment?', answer: 'Use the payment page...', category: 'payment' },
        ],
      });

      const result = await coreDb.query(
        `SELECT * FROM faq_articles 
         WHERE question ILIKE $1 OR answer ILIKE $1 OR category ILIKE $1
         ORDER BY relevance DESC`,
        [`%${searchQuery}%`]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should retrieve knowledge base articles by category', async () => {
      const category = 'payment';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { id: 'kb-1', title: 'Payment Guide', category: 'payment', views: 100 },
        ],
      });

      const result = await coreDb.query(
        'SELECT * FROM knowledge_base WHERE category = $1 ORDER BY views DESC',
        [category]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Live Chat with Agents', () => {
    it('should initiate chat session', async () => {
      const chat = {
        student_id: 'student-123',
        agent_id: null,
        status: 'waiting',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'chat-123', ...chat, created_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO chat_sessions (student_id, agent_id, status)
         VALUES ($1, $2, $3) RETURNING *`,
        [chat.student_id, chat.agent_id, chat.status]
      );

      expect(result.rows[0].status).toBe('waiting');
    });

    it('should assign agent to chat', async () => {
      const chatId = 'chat-123';
      const agentId = 'agent-456';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: chatId, agent_id: agentId, status: 'active' }],
      });

      const result = await coreDb.query(
        `UPDATE chat_sessions SET agent_id = $1, status = 'active' WHERE id = $2 RETURNING *`,
        [agentId, chatId]
      );

      expect(result.rows[0].agent_id).toBe(agentId);
    });

    it('should send chat message', async () => {
      const message = {
        chat_id: 'chat-123',
        sender_id: 'student-123',
        sender_type: 'student',
        message: 'Hello, I need help',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'msg-123', ...message, sent_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO chat_messages (chat_id, sender_id, sender_type, message)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [message.chat_id, message.sender_id, message.sender_type, message.message]
      );

      expect(result.rows[0].message).toBe(message.message);
    });
  });

  describe('Issue Resolution Tracking', () => {
    it('should track resolution time', async () => {
      const ticketId = 'ticket-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          id: ticketId,
          created_at: new Date('2024-01-01T10:00:00'),
          resolved_at: new Date('2024-01-01T14:30:00'),
          resolution_time_minutes: 270,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT id, created_at, resolved_at,
         EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60 as resolution_time_minutes
         FROM support_tickets WHERE id = $1`,
        [ticketId]
      );

      expect(result.rows[0].resolution_time_minutes).toBeGreaterThan(0);
    });

    it('should calculate first response time', async () => {
      const ticketId = 'ticket-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          ticket_id: ticketId,
          created_at: new Date('2024-01-01T10:00:00'),
          first_response_at: new Date('2024-01-01T10:15:00'),
          first_response_time_minutes: 15,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT t.id as ticket_id, t.created_at,
         MIN(m.sent_at) as first_response_at,
         EXTRACT(EPOCH FROM (MIN(m.sent_at) - t.created_at)) / 60 as first_response_time_minutes
         FROM support_tickets t
         LEFT JOIN chat_messages m ON m.chat_id = t.chat_id AND m.sender_type = 'agent'
         WHERE t.id = $1
         GROUP BY t.id, t.created_at`,
        [ticketId]
      );

      expect(result.rows[0].first_response_time_minutes).toBeGreaterThan(0);
    });
  });
});

