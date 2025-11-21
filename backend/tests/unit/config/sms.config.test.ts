/**
 * UNIT TESTS - SMS CONFIG
 * Tests for SMS configuration
 */

describe('SMS Config', () => {
  describe('Provider Configuration', () => {
    it('should have MSG91 as provider', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.provider).toBe('msg91');
    });

    it('should have MSG91 configuration', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.msg91).toBeDefined();
      expect(SMS_CONFIG.msg91.apiUrl).toBe('https://api.msg91.com/api');
      expect(SMS_CONFIG.msg91.country).toBe('91');
    });

    it('should have default sender ID', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.msg91.senderId).toBe('STDYSP');
    });

    it('should have default route for transactional', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.msg91.route).toBe('4');
    });
  });

  describe('DLT Configuration', () => {
    it('should have DLT configuration', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.dlt).toBeDefined();
      expect(SMS_CONFIG.dlt.registered).toBe(true);
      expect(SMS_CONFIG.dlt.provider).toBe('BSNL');
    });

    it('should handle missing DLT entity ID', () => {
      const originalEntityId = process.env.DLT_ENTITY_ID;
      delete process.env.DLT_ENTITY_ID;

      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      expect(SMS_CONFIG.dlt.entityId).toBe('');

      if (originalEntityId) process.env.DLT_ENTITY_ID = originalEntityId;
    });
  });

  describe('SMS Templates', () => {
    it('should have OTP template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.otp).toBeDefined();
      expect(SMS_CONFIG.templates.otp.text).toContain('OTP');
      expect(SMS_CONFIG.templates.otp.variables).toBe(1);
    });

    it('should have welcome template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.welcome).toBeDefined();
      expect(SMS_CONFIG.templates.welcome.text).toContain('Welcome');
      expect(SMS_CONFIG.templates.welcome.variables).toBe(1);
    });

    it('should have payment success template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.payment_success).toBeDefined();
      expect(SMS_CONFIG.templates.payment_success.text).toContain('Payment');
      expect(SMS_CONFIG.templates.payment_success.variables).toBe(2);
    });

    it('should have payment reminder template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.payment_reminder).toBeDefined();
      expect(SMS_CONFIG.templates.payment_reminder.text).toContain('reminder');
      expect(SMS_CONFIG.templates.payment_reminder.variables).toBe(2);
    });

    it('should have booking confirmed template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.booking_confirmed).toBeDefined();
      expect(SMS_CONFIG.templates.booking_confirmed.text).toContain('Booking');
      expect(SMS_CONFIG.templates.booking_confirmed.variables).toBe(3);
    });

    it('should have subscription expiry template', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');

      expect(SMS_CONFIG.templates.subscription_expiry).toBeDefined();
      expect(SMS_CONFIG.templates.subscription_expiry.text).toContain('expires');
      expect(SMS_CONFIG.templates.subscription_expiry.variables).toBe(1);
    });
  });

  describe('Template Variable Validation', () => {
    it('should validate OTP template has correct variable count', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      const template = SMS_CONFIG.templates.otp;
      const variableCount = (template.text.match(/\{#var#\}/g) || []).length;

      expect(variableCount).toBe(template.variables);
    });

    it('should validate payment success template has correct variable count', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      const template = SMS_CONFIG.templates.payment_success;
      const variableCount = (template.text.match(/\{#var#\}/g) || []).length;

      expect(variableCount).toBe(template.variables);
    });

    it('should validate booking confirmed template has correct variable count', () => {
      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      const template = SMS_CONFIG.templates.booking_confirmed;
      const variableCount = (template.text.match(/\{#var#\}/g) || []).length;

      expect(variableCount).toBe(template.variables);
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing MSG91 auth key', () => {
      const originalAuthKey = process.env.MSG91_AUTH_KEY;
      delete process.env.MSG91_AUTH_KEY;

      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      expect(SMS_CONFIG.msg91.authKey).toBe('');

      if (originalAuthKey) process.env.MSG91_AUTH_KEY = originalAuthKey;
    });

    it('should use custom sender ID if provided', () => {
      const originalSenderId = process.env.MSG91_SENDER_ID;
      process.env.MSG91_SENDER_ID = 'CUSTOM';

      // Reload config
      delete require.cache[require.resolve('../../../src/config/sms.config')];
      const { SMS_CONFIG } = require('../../../src/config/sms.config');
      expect(SMS_CONFIG.msg91.senderId).toBe('CUSTOM');

      if (originalSenderId) {
        process.env.MSG91_SENDER_ID = originalSenderId;
      } else {
        delete process.env.MSG91_SENDER_ID;
      }
      delete require.cache[require.resolve('../../../src/config/sms.config')];
    });
  });
});

