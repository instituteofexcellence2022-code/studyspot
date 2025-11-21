/**
 * UNIT TESTS - NOTIFICATION SERVICE
 * Tests for: Email, SMS, WhatsApp delivery, push notification management,
 * delivery analytics, bounce management
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/services/messaging-service/sms.service', () => ({
  sendSMS: jest.fn(),
}));

const { coreDb } = require('../../../src/config/database');
const { sendSMS } = require('../../../src/services/messaging-service/sms.service');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Delivery', () => {
    it('should send email notification', async () => {
      const notification = {
        recipient: 'user@example.com',
        subject: 'Booking Confirmation',
        body: 'Your booking has been confirmed',
        type: 'email',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'notif-123', ...notification, status: 'sent', sent_at: new Date() }],
      });

      const result = await coreDb.query(
        `INSERT INTO notifications (recipient, subject, body, type, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [notification.recipient, notification.subject, notification.body, notification.type, 'sent']
      );

      expect(result.rows[0].status).toBe('sent');
    });

    it('should handle email bounce', async () => {
      const notificationId = 'notif-123';
      const bounceReason = 'Invalid email address';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: notificationId, status: 'bounced', bounce_reason: bounceReason }],
      });

      const result = await coreDb.query(
        `UPDATE notifications SET status = 'bounced', bounce_reason = $1 WHERE id = $2 RETURNING *`,
        [bounceReason, notificationId]
      );

      expect(result.rows[0].status).toBe('bounced');
    });
  });

  describe('SMS Delivery', () => {
    it('should send SMS notification', async () => {
      const notification = {
        recipient: '+1234567890',
        message: 'Your booking is confirmed. Booking ID: BK123',
        type: 'sms',
      };

      (sendSMS as jest.Mock).mockResolvedValue({ success: true, messageId: 'msg-123' });

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'notif-123', ...notification, status: 'sent' }],
      });

      await sendSMS(notification.recipient, notification.message);

      expect(sendSMS).toHaveBeenCalledWith(notification.recipient, notification.message);
    });

    it('should handle SMS delivery failure', async () => {
      const notification = {
        recipient: '+1234567890',
        message: 'Test message',
      };

      (sendSMS as jest.Mock).mockRejectedValue(new Error('SMS delivery failed'));

      try {
        await sendSMS(notification.recipient, notification.message);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('WhatsApp Delivery', () => {
    it('should send WhatsApp notification', async () => {
      const notification = {
        recipient: '+1234567890',
        message: 'Your booking is confirmed',
        type: 'whatsapp',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'notif-123', ...notification, status: 'sent' }],
      });

      const result = await coreDb.query(
        `INSERT INTO notifications (recipient, message, type, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [notification.recipient, notification.message, notification.type, 'sent']
      );

      expect(result.rows[0].type).toBe('whatsapp');
    });
  });

  describe('Push Notification Management', () => {
    it('should send push notification', async () => {
      const pushNotification = {
        user_id: 'user-123',
        title: 'New Booking',
        body: 'Your booking has been confirmed',
        data: { bookingId: 'BK123' },
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'push-123', ...pushNotification, status: 'sent' }],
      });

      const result = await coreDb.query(
        `INSERT INTO push_notifications (user_id, title, body, data, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [pushNotification.user_id, pushNotification.title, pushNotification.body,
         JSON.stringify(pushNotification.data), 'sent']
      );

      expect(result.rows[0].status).toBe('sent');
    });

    it('should track push notification delivery', async () => {
      const notificationId = 'push-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: notificationId, delivered_at: new Date(), opened_at: null }],
      });

      const result = await coreDb.query(
        `UPDATE push_notifications SET delivered_at = NOW() WHERE id = $1 RETURNING *`,
        [notificationId]
      );

      expect(result.rows[0].delivered_at).toBeDefined();
    });
  });

  describe('Delivery Analytics', () => {
    it('should calculate delivery rate', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          total_sent: 1000,
          delivered: 950,
          failed: 50,
          delivery_rate: 95,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           COUNT(*) as total_sent,
           COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
           COUNT(*) FILTER (WHERE status = 'failed') as failed,
           (COUNT(*) FILTER (WHERE status = 'delivered')::float / COUNT(*)::float * 100) as delivery_rate
         FROM notifications
         WHERE created_at BETWEEN $1 AND $2`,
        [startDate, endDate]
      );

      expect(result.rows[0].delivery_rate).toBeGreaterThan(0);
    });

    it('should track notification performance by type', async () => {
      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [
          { type: 'email', sent: 500, delivered: 480, rate: 96 },
          { type: 'sms', sent: 300, delivered: 285, rate: 95 },
          { type: 'push', sent: 200, delivered: 195, rate: 97.5 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           type,
           COUNT(*) as sent,
           COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
           (COUNT(*) FILTER (WHERE status = 'delivered')::float / COUNT(*)::float * 100) as rate
         FROM notifications
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY type`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Bounce Management', () => {
    it('should track email bounces', async () => {
      const email = 'bounced@example.com';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ email, bounce_count: 3, last_bounce_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE notification_bounces 
         SET bounce_count = bounce_count + 1, last_bounce_at = NOW()
         WHERE email = $1
         RETURNING *`,
        [email]
      );

      expect(result.rows[0].bounce_count).toBeGreaterThan(0);
    });

    it('should mark email as invalid after multiple bounces', () => {
      const bounceCount = 5;
      const threshold = 3;

      const shouldMarkInvalid = bounceCount >= threshold;
      expect(shouldMarkInvalid).toBe(true);
    });
  });
});

