/**
 * UNIT TESTS - SMS SERVICE (sms.service.ts)
 * Tests for SMS service with MSG91 and DLT integration
 */

import smsService from '../../../src/services/messaging-service/sms.service';
import { SMS_CONFIG } from '../../../src/config/sms.config';
import { logger } from '../../../src/utils/logger';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SMS Service (sms.service.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Send SMS', () => {
    it('should send SMS successfully with OTP template', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/sendhttp.php'),
        expect.objectContaining({
          params: expect.objectContaining({
            mobiles: request.phone,
            DLT_TE_ID: SMS_CONFIG.templates.otp.id,
          }),
        })
      );
    });

    it('should send SMS with payment success template', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'payment_success' as const,
        variables: ['₹1000', 'order-123'],
      };

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-456',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            DLT_TE_ID: SMS_CONFIG.templates.payment_success.id,
          }),
        })
      );
    });

    it('should reject if template not found', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      // Mock missing template
      const originalTemplates = SMS_CONFIG.templates;
      (SMS_CONFIG.templates as any).otp = null;

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');

      // Restore
      SMS_CONFIG.templates = originalTemplates;
    });

    it('should reject if variable count mismatch', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'payment_success' as const,
        variables: ['₹1000'], // Should be 2 variables
      };

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template requires');
    });

    it('should handle SMS send failure', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      const mockResponse = {
        data: {
          type: 'error',
          message: 'Invalid phone number',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should handle axios errors', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await smsService.sendSMS(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Send OTP', () => {
    it('should send OTP successfully', async () => {
      const phone = '+919876543210';
      const otp = '123456';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-789',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendOTP(phone, otp);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            mobiles: phone,
            DLT_TE_ID: SMS_CONFIG.templates.otp.id,
          }),
        })
      );
    });
  });

  describe('Template Variable Replacement', () => {
    it('should replace variables in template text', () => {
      const templateText = 'Your OTP is {#var#}. Valid for 5 minutes.';
      const variables = ['123456'];
      
      let message = templateText;
      variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      expect(message).toBe('Your OTP is 123456. Valid for 5 minutes.');
    });

    it('should replace multiple variables', () => {
      const templateText = 'Payment of {#var#} for order {#var#} is successful.';
      const variables = ['₹1000', 'order-123'];
      
      let message = templateText;
      variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      expect(message).toBe('Payment of ₹1000 for order order-123 is successful.');
    });
  });

  describe('MSG91 API Parameters', () => {
    it('should include all required MSG91 parameters', async () => {
      const request = {
        phone: '+919876543210',
        templateType: 'otp' as const,
        variables: ['123456'],
      };

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await smsService.sendSMS(request);

      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;

      expect(params).toHaveProperty('authkey');
      expect(params).toHaveProperty('mobiles');
      expect(params).toHaveProperty('message');
      expect(params).toHaveProperty('sender');
      expect(params).toHaveProperty('route');
      expect(params).toHaveProperty('country');
      expect(params).toHaveProperty('DLT_TE_ID');
    });
  });
});

