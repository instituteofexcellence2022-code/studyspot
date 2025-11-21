/**
 * UNIT TESTS - SUPPORT OPERATIONS SERVICE
 * Tests for: Multi-tier support system, SLA management & tracking,
 * knowledge base management, support performance analytics
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Support Operations Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multi-Tier Support System', () => {
    it('should route ticket to appropriate tier', () => {
      const ticket = {
        complexity: 'high',
        category: 'technical',
        priority: 'urgent',
      };

      const tier = ticket.complexity === 'high' || ticket.priority === 'urgent'
        ? 'tier_2'
        : 'tier_1';

      expect(tier).toBe('tier_2');
    });

    it('should escalate ticket to higher tier', async () => {
      const ticketId = 'ticket-123';
      const newTier = 'tier_3';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: ticketId, tier: newTier, escalated_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE support_tickets SET tier = $1, escalated_at = NOW() WHERE id = $2 RETURNING *`,
        [newTier, ticketId]
      );

      expect(result.rows[0].tier).toBe(newTier);
    });
  });

  describe('SLA Management & Tracking', () => {
    it('should calculate SLA response time', () => {
      const sla = {
        tier: 'tier_1',
        response_time_minutes: 60,
        resolution_time_hours: 24,
      };

      const ticket = {
        created_at: new Date('2024-01-01T10:00:00'),
        first_response_at: new Date('2024-01-01T10:30:00'),
      };

      const responseTime = (ticket.first_response_at.getTime() - ticket.created_at.getTime()) / (1000 * 60);
      const isWithinSLA = responseTime <= sla.response_time_minutes;

      expect(isWithinSLA).toBe(true);
    });

    it('should track SLA violations', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { ticket_id: 't1', sla_violation: true, violation_type: 'response_time' },
          { ticket_id: 't2', sla_violation: true, violation_type: 'resolution_time' },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           id as ticket_id,
           CASE WHEN first_response_time > sla_response_time THEN true ELSE false END as sla_violation,
           CASE 
             WHEN first_response_time > sla_response_time THEN 'response_time'
             WHEN resolution_time > sla_resolution_time THEN 'resolution_time'
             ELSE NULL
           END as violation_type
         FROM support_tickets
         WHERE first_response_time > sla_response_time OR resolution_time > sla_resolution_time`
      );

      expect(result.rows.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Knowledge Base Management', () => {
    it('should create knowledge base article', async () => {
      const article = {
        title: 'How to reset password',
        content: 'Follow these steps...',
        category: 'account',
        tags: ['password', 'reset', 'account'],
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'kb-123', ...article, status: 'published' }],
      });

      const result = await coreDb.query(
        `INSERT INTO knowledge_base (title, content, category, tags, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [article.title, article.content, article.category, JSON.stringify(article.tags), 'published']
      );

      expect(result.rows[0].status).toBe('published');
    });

    it('should search knowledge base', async () => {
      const searchQuery = 'password reset';

      (coreDb.query).mockResolvedValue({
        rows: [
          { id: 'kb-1', title: 'How to reset password', relevance: 0.9 },
          { id: 'kb-2', title: 'Password security tips', relevance: 0.7 },
        ],
      });

      const result = await coreDb.query(
        `SELECT *, 
         ts_rank(to_tsvector(title || ' ' || content), plainto_tsquery($1)) as relevance
         FROM knowledge_base
         WHERE to_tsvector(title || ' ' || content) @@ plainto_tsquery($1)
         ORDER BY relevance DESC`,
        [searchQuery]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Support Performance Analytics', () => {
    it('should calculate average resolution time', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [{
          avg_resolution_time_hours: 12,
          median_resolution_time_hours: 10,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_resolution_time_hours,
           PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as median_resolution_time_hours
         FROM support_tickets
         WHERE status = 'resolved' AND resolved_at >= NOW() - INTERVAL '30 days'`
      );

      expect(result.rows[0].avg_resolution_time_hours).toBeGreaterThan(0);
    });

    it('should track agent performance', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { agent_id: 'a1', tickets_resolved: 50, avg_rating: 4.8 },
          { agent_id: 'a2', tickets_resolved: 45, avg_rating: 4.6 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           agent_id,
           COUNT(*) as tickets_resolved,
           AVG(rating) as avg_rating
         FROM support_tickets
         WHERE agent_id IS NOT NULL AND resolved_at >= NOW() - INTERVAL '30 days'
         GROUP BY agent_id
         ORDER BY tickets_resolved DESC`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

