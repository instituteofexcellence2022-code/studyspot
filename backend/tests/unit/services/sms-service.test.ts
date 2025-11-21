/**
 * UNIT TESTS - SMS SERVICE
 */

import axios from 'axios';
import smsService from '../../../src/services/messaging-service/sms.service';
import { SMS_CONFIG } from '../../../src/config/sms.config';
import { logger } from '../../../src/utils/logger';

jest.mock('axios');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendSMS', () => {
    it('should send OTP SMS successfully', async () => {
      const request = {
        phone: '+1234567890',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          type: 'success',
          message: 'SMS sent',
        },
      });

      const result = await smsService.sendSMS(request);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/sendhttp.php'),
        expect.objectContaining({
          params: expect.objectContaining({
            mobiles: request.phone,
            DLT_TE_ID: SMS_CONFIG.templates.otp.id,
          }),
        })
      );
      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should send welcome SMS successfully', async () => {
      const request = {
        phone: '+1234567890',
        templateType: 'welcome' as const,
        variables: ['STU123'],
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          type: 'success',
          message: 'SMS sent',
        },
      });

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(true);
    });

    it('should reject SMS with wrong variable count', async () => {
      const request = {
        phone: '+1234567890',
        templateType: 'payment_success' as const,
        variables: ['1000'], // Should be 2 variables
      };

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('requires 2 variable(s)');
    });

    it('should handle SMS send failure', async () => {
      const request = {
        phone: '+1234567890',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      // Return data without 'success' type and without message field to trigger failure
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          type: 'error',
          // No message field to ensure failure path
        },
      });

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMS sending failed');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      const request = {
        phone: '+1234567890',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendOTP', () => {
    it('should send OTP successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendOTP('+1234567890', '123456');

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('sendWelcome', () => {
    it('should send welcome message successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendWelcome('+1234567890', 'STU123');

      expect(result.success).toBe(true);
    });
  });

  describe('sendPaymentSuccess', () => {
    it('should send payment success notification', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendPaymentSuccess('+1234567890', '1000', 'REC123');

      expect(result.success).toBe(true);
    });
  });

  describe('sendPaymentReminder', () => {
    it('should send payment reminder', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendPaymentReminder('+1234567890', '1000', '2024-12-31');

      expect(result.success).toBe(true);
    });
  });

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendBookingConfirmation(
        '+1234567890',
        'A1',
        '2024-01-15',
        'Test Library'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendSubscriptionExpiry', () => {
    it('should send subscription expiry notice', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { type: 'success', message: 'SMS sent' },
      });

      const result = await smsService.sendSubscriptionExpiry('+1234567890', '2024-12-31');

      expect(result.success).toBe(true);
    });
  });
});

