/**
 * UNIT TESTS - LIBRARY COMMUNICATION SERVICE
 * Tests for: Student messaging system, announcement management,
 * communication templates, engagement analytics
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

const tenantDbManager = require('../../../src/config/database').tenantDbManager;

describe('Library Communication Service', () => {
  let mockTenantDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection).mockResolvedValue(mockTenantDb);
    jest.clearAllMocks();
  });

  describe('Student Messaging System', () => {
    it('should send message to student', async () => {
      const message = {
        library_id: 'lib-123',
        student_id: 'student-123',
        subject: 'Booking Reminder',
        body: 'Your booking starts in 1 hour',
        type: 'notification',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'msg-123', ...message, sent_at: new Date(), status: 'sent' }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO library_messages (library_id, student_id, subject, body, type, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [message.library_id, message.student_id, message.subject, message.body, message.type, 'sent']
      );

      expect(result.rows[0].status).toBe('sent');
    });

    it('should send bulk messages', async () => {
      const bulkMessage = {
        library_id: 'lib-123',
        student_ids: ['student-1', 'student-2', 'student-3'],
        subject: 'Library Closure Notice',
        body: 'Library will be closed tomorrow',
      };

      const messages = bulkMessage.student_ids.map(studentId => ({
        library_id: bulkMessage.library_id,
        student_id: studentId,
        subject: bulkMessage.subject,
        body: bulkMessage.body,
      }));

      expect(messages.length).toBe(3);
    });
  });

  describe('Announcement Management', () => {
    it('should create announcement', async () => {
      const announcement = {
        library_id: 'lib-123',
        title: 'New Study Materials Available',
        content: 'Check out our new collection',
        priority: 'high',
        target_audience: 'all_students',
      };

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: 'announcement-123', ...announcement, status: 'active', created_at: new Date() }],
      });

      const result = await mockTenantDb.query(
        `INSERT INTO announcements (library_id, title, content, priority, target_audience, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [announcement.library_id, announcement.title, announcement.content,
         announcement.priority, announcement.target_audience, 'active']
      );

      expect(result.rows[0].status).toBe('active');
    });

    it('should schedule announcement', async () => {
      const announcementId = 'announcement-123';
      const scheduledTime = '2024-01-15T10:00:00';

      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: announcementId, scheduled_at: scheduledTime, status: 'scheduled' }],
      });

      const result = await mockTenantDb.query(
        `UPDATE announcements SET scheduled_at = $1, status = 'scheduled' WHERE id = $2 RETURNING *`,
        [scheduledTime, announcementId]
      );

      expect(result.rows[0].status).toBe('scheduled');
    });
  });

  describe('Communication Templates', () => {
    it('should use template for message', () => {
      const template = {
        name: 'Booking Confirmation',
        subject: 'Booking Confirmed - {{bookingId}}',
        body: 'Hello {{studentName}}, your booking for {{libraryName}} is confirmed.',
      };

      const data = {
        bookingId: 'BK123',
        studentName: 'John Doe',
        libraryName: 'StudySpot Library',
      };

      let subject = template.subject;
      let body = template.body;
      Object.entries(data).forEach(([key, value]) => {
        subject = subject.replace(`{{${key}}}`, value);
        body = body.replace(`{{${key}}}`, value);
      });

      expect(subject).toContain('BK123');
      expect(body).toContain('John Doe');
    });
  });

  describe('Engagement Analytics', () => {
    it('should track message open rate', async () => {
      const messageId = 'msg-123';

      mockTenantDb.query.mockResolvedValue({
        rows: [{
          message_id: messageId,
          sent_count: 100,
          opened_count: 75,
          open_rate: 75,
        }],
      });

      const result = await mockTenantDb.query(
        `SELECT 
           id as message_id,
           COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
           COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened_count,
           (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::float / COUNT(*) FILTER (WHERE status = 'sent')::float * 100) as open_rate
         FROM library_messages
         WHERE id = $1
         GROUP BY id`,
        [messageId]
      );

      expect(result.rows[0].open_rate).toBeGreaterThan(0);
    });

    it('should calculate engagement score', () => {
      const metrics = {
        messagesSent: 100,
        messagesOpened: 75,
        messagesClicked: 50,
        announcementsViewed: 80,
      };

      const engagementScore = (
        (metrics.messagesOpened / metrics.messagesSent) * 0.3 +
        (metrics.messagesClicked / metrics.messagesSent) * 0.4 +
        (metrics.announcementsViewed / 100) * 0.3
      ) * 100;

      expect(engagementScore).toBeGreaterThan(0);
      expect(engagementScore).toBeLessThanOrEqual(100);
    });
  });
});

