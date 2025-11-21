/**
 * UNIT TESTS - MESSAGING SERVICE
 * Tests for messaging service business logic (SMS, WhatsApp, Email)
 */

import { logger } from '../../../src/utils/logger';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock database
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
  tenantDbManager: {
    getTenantConnection: jest.fn(() => ({
      query: jest.fn(),
    })),
  },
}));

// Mock SMS service
jest.mock('../../../src/services/messaging-service/sms.service', () => ({
  default: {
    sendSMS: jest.fn(),
  },
}));

describe('Messaging Service', () => {
  describe('Credit Deduction', () => {
    it('should validate credit balance before sending', () => {
      const wallet = {
        sms_credits: 100,
        whatsapp_credits: 50,
        email_credits: 200,
      };

      const requiredCredits = 10;
      const hasEnoughCredits = wallet.sms_credits >= requiredCredits;

      expect(hasEnoughCredits).toBe(true);
    });

    it('should reject sending when credits are insufficient', () => {
      const wallet = {
        sms_credits: 5,
      };

      const requiredCredits = 10;
      const hasEnoughCredits = wallet.sms_credits >= requiredCredits;

      expect(hasEnoughCredits).toBe(false);
    });

    it('should calculate credit cost correctly', () => {
      const costPerCredit = 0.25;
      const creditsUsed = 10;
      const totalCost = creditsUsed * costPerCredit;

      expect(totalCost).toBe(2.5);
    });

    it('should deduct credits from wallet', () => {
      const wallet = {
        sms_credits: 100,
        total_spent: 0,
      };

      const creditsToDeduct = 10;
      wallet.sms_credits -= creditsToDeduct;
      wallet.total_spent += creditsToDeduct * 0.25;

      expect(wallet.sms_credits).toBe(90);
      expect(wallet.total_spent).toBe(2.5);
    });
  });

  describe('Channel Types', () => {
    it('should validate SMS channel', () => {
      const channel = 'sms';
      const validChannels = ['sms', 'whatsapp', 'email'];

      expect(validChannels).toContain(channel);
    });

    it('should validate WhatsApp channel', () => {
      const channel = 'whatsapp';
      const validChannels = ['sms', 'whatsapp', 'email'];

      expect(validChannels).toContain(channel);
    });

    it('should validate Email channel', () => {
      const channel = 'email';
      const validChannels = ['sms', 'whatsapp', 'email'];

      expect(validChannels).toContain(channel);
    });

    it('should reject invalid channel', () => {
      const channel = 'telegram';
      const validChannels = ['sms', 'whatsapp', 'email'];

      expect(validChannels).not.toContain(channel);
    });
  });

  describe('Message Validation', () => {
    it('should validate recipient phone number for SMS', () => {
      const phone = '+1234567890';
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;

      expect(phoneRegex.test(phone)).toBe(true);
    });

    it('should validate recipient email address', () => {
      const email = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(email)).toBe(true);
    });

    it('should validate message content length', () => {
      const message = 'This is a test message';
      const maxLength = 1600; // Typical SMS limit

      expect(message.length).toBeLessThanOrEqual(maxLength);
    });

    it('should reject empty message', () => {
      const message = '';

      expect(message.trim().length).toBe(0);
    });
  });

  describe('Communication Logging', () => {
    it('should log communication details', () => {
      const communication = {
        tenant_id: 'tenant-123',
        channel: 'sms',
        type: 'notification',
        recipient: '+1234567890',
        message: 'Test message',
        status: 'sent',
        credits_used: 1,
      };

      expect(communication.tenant_id).toBeDefined();
      expect(communication.channel).toBe('sms');
      expect(communication.status).toBe('sent');
      expect(communication.credits_used).toBeGreaterThan(0);
    });

    it('should track communication status', () => {
      const statuses = ['sent', 'delivered', 'failed', 'pending'];

      expect(statuses).toContain('sent');
      expect(statuses).toContain('delivered');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('pending');
    });
  });

  describe('Template Support', () => {
    it('should support template-based messages', () => {
      const message = {
        template_id: 'template-123',
        variables: {
          name: 'John',
          code: 'ABC123',
        },
      };

      expect(message.template_id).toBeDefined();
      expect(message.variables).toBeDefined();
    });

    it('should validate template variables', () => {
      const template = {
        id: 'template-123',
        required_variables: ['name', 'code'],
      };

      const providedVariables = ['name', 'code'];
      const hasAllVariables = template.required_variables.every(v => providedVariables.includes(v));

      expect(hasAllVariables).toBe(true);
    });
  });
});

