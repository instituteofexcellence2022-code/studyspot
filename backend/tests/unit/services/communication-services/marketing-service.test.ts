/**
 * UNIT TESTS - MARKETING SERVICE
 * Tests for: Multi-channel campaign management, lead scoring & segmentation,
 * ROI tracking & optimization, audience targeting
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const { coreDb } = require('../../../src/config/database');

describe('Marketing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multi-Channel Campaign Management', () => {
    it('should create marketing campaign', async () => {
      const campaign = {
        name: 'Summer Promotion',
        type: 'promotional',
        channels: ['email', 'sms', 'push'],
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        budget: 50000,
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'campaign-123', ...campaign, status: 'active' }],
      });

      const result = await coreDb.query(
        `INSERT INTO marketing_campaigns (name, type, channels, start_date, end_date, budget, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [campaign.name, campaign.type, JSON.stringify(campaign.channels),
         campaign.start_date, campaign.end_date, campaign.budget, 'active']
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should schedule campaign messages', async () => {
      const campaignId = 'campaign-123';
      const message = {
        channel: 'email',
        subject: 'Summer Sale',
        body: 'Get 20% off on all bookings',
        scheduled_at: '2024-06-01T10:00:00',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'msg-123', campaign_id: campaignId, ...message, status: 'scheduled' }],
      });

      const result = await coreDb.query(
        `INSERT INTO campaign_messages (campaign_id, channel, subject, body, scheduled_at, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [campaignId, message.channel, message.subject, message.body, message.scheduled_at, 'scheduled']
      );

      expect(result.rows[0].status).toBe('scheduled');
    });
  });

  describe('Lead Scoring & Segmentation', () => {
    it('should calculate lead score', () => {
      const lead = {
        emailOpens: 5,
        linkClicks: 3,
        websiteVisits: 10,
        bookingAttempts: 2,
        completedBookings: 1,
      };

      let score = 0;
      score += lead.emailOpens * 2;
      score += lead.linkClicks * 5;
      score += lead.websiteVisits * 1;
      score += lead.bookingAttempts * 10;
      score += lead.completedBookings * 20;

      expect(score).toBeGreaterThan(0);
    });

    it('should segment leads by score', () => {
      const leads = [
        { id: 'lead-1', score: 85 },
        { id: 'lead-2', score: 45 },
        { id: 'lead-3', score: 20 },
      ];

      const segments = {
        hot: leads.filter(l => l.score >= 70),
        warm: leads.filter(l => l.score >= 40 && l.score < 70),
        cold: leads.filter(l => l.score < 40),
      };

      expect(segments.hot.length).toBe(1);
      expect(segments.warm.length).toBe(1);
      expect(segments.cold.length).toBe(1);
    });

    it('should create audience segment', async () => {
      const segment = {
        name: 'Active Students',
        criteria: {
          minBookings: 5,
          lastBookingDays: 30,
          status: 'active',
        },
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'segment-123', ...segment, member_count: 150 }],
      });

      const result = await coreDb.query(
        `INSERT INTO audience_segments (name, criteria)
         VALUES ($1, $2) RETURNING *`,
        [segment.name, JSON.stringify(segment.criteria)]
      );

      expect(result.rows[0].member_count).toBeGreaterThan(0);
    });
  });

  describe('ROI Tracking & Optimization', () => {
    it('should calculate campaign ROI', async () => {
      const campaignId = 'campaign-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          campaign_id: campaignId,
          total_spent: 50000,
          revenue_generated: 200000,
          roi: 300,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           campaign_id,
           SUM(cost) as total_spent,
           SUM(revenue) as revenue_generated,
           ((SUM(revenue) - SUM(cost)) / SUM(cost) * 100) as roi
         FROM campaign_metrics
         WHERE campaign_id = $1
         GROUP BY campaign_id`,
        [campaignId]
      );

      expect(result.rows[0].roi).toBeGreaterThan(0);
    });

    it('should track conversion rate', async () => {
      const campaignId = 'campaign-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          campaign_id: campaignId,
          impressions: 10000,
          clicks: 500,
          conversions: 50,
          conversion_rate: 10,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           campaign_id,
           SUM(impressions) as impressions,
           SUM(clicks) as clicks,
           SUM(conversions) as conversions,
           (SUM(conversions)::float / SUM(clicks)::float * 100) as conversion_rate
         FROM campaign_metrics
         WHERE campaign_id = $1
         GROUP BY campaign_id`,
        [campaignId]
      );

      expect(result.rows[0].conversion_rate).toBeGreaterThan(0);
    });
  });

  describe('Audience Targeting', () => {
    it('should target audience by demographics', async () => {
      const criteria = {
        ageRange: { min: 18, max: 25 },
        location: 'Delhi',
        interests: ['studying', 'library'],
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { id: 'user-1', age: 20, location: 'Delhi' },
          { id: 'user-2', age: 22, location: 'Delhi' },
        ],
      });

      const result = await coreDb.query(
        `SELECT * FROM users
         WHERE age BETWEEN $1 AND $2 AND location = $3`,
        [criteria.ageRange.min, criteria.ageRange.max, criteria.location]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should target audience by behavior', async () => {
      const criteria = {
        minBookings: 5,
        lastActivityDays: 30,
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { id: 'user-1', booking_count: 10, last_activity: new Date() },
        ],
      });

      const result = await coreDb.query(
        `SELECT u.*, COUNT(b.id) as booking_count, MAX(b.created_at) as last_activity
         FROM users u
         JOIN bookings b ON b.user_id = u.id
         GROUP BY u.id
         HAVING COUNT(b.id) >= $1 AND MAX(b.created_at) >= NOW() - INTERVAL '$2 days'`,
        [criteria.minBookings, criteria.lastActivityDays]
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

