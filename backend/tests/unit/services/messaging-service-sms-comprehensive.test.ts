/**
 * COMPREHENSIVE UNIT TESTS - SMS SERVICE
 * Additional tests for SMS service helper methods
 */

import { SMS_CONFIG } from '../../../src/config/sms.config';
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

// Mock SMS config to ensure templates exist
jest.mock('../../../src/config/sms.config', () => ({
  SMS_CONFIG: {
    msg91: {
      authKey: 'test-auth-key',
      senderId: 'TESTID',
      route: '4',
      country: '91',
      apiUrl: 'https://api.msg91.com/api',
    },
    templates: {
      otp: { id: 'otp-template-id', text: 'OTP: {#var#}', variables: 1 },
      welcome: { id: 'welcome-template-id', text: 'Welcome {#var#}', variables: 1 },
      payment_success: { id: 'payment-success-id', text: 'Payment {#var#} for {#var#}', variables: 2 },
      payment_reminder: { id: 'payment-reminder-id', text: 'Reminder: {#var#} due {#var#}', variables: 2 },
      booking_confirmed: { id: 'booking-id', text: 'Booking: {#var#} on {#var#} at {#var#}', variables: 3 },
      subscription_expiry: { id: 'expiry-id', text: 'Expires: {#var#}', variables: 1 },
    },
  },
}));

// Import after mocks
import smsService from '../../../src/services/messaging-service/sms.service';

describe('SMS Service - Comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Send Welcome', () => {
    it('should send welcome SMS', async () => {
      const phone = '+919876543210';
      const studentId = 'student-123';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-welcome-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendWelcome(phone, studentId);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;
      expect(params?.DLT_TE_ID).toBe(SMS_CONFIG.templates.welcome.id);
      expect(params?.mobiles).toBe(phone);
    });
  });

  describe('Send Payment Success', () => {
    it('should send payment success SMS', async () => {
      const phone = '+919876543210';
      const amount = '₹1000';
      const receipt = 'receipt-123';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-payment-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendPaymentSuccess(phone, amount, receipt);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;
      expect(params?.DLT_TE_ID).toBe(SMS_CONFIG.templates.payment_success.id);
    });
  });

  describe('Send Payment Reminder', () => {
    it('should send payment reminder SMS', async () => {
      const phone = '+919876543210';
      const amount = '₹500';
      const dueDate = '2024-12-31';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-reminder-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendPaymentReminder(phone, amount, dueDate);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;
      expect(params?.DLT_TE_ID).toBe(SMS_CONFIG.templates.payment_reminder.id);
    });
  });

  describe('Send Booking Confirmation', () => {
    it('should send booking confirmation SMS', async () => {
      const phone = '+919876543210';
      const seat = 'A-12';
      const date = '2024-01-15';
      const library = 'Central Library';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-booking-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendBookingConfirmation(phone, seat, date, library);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;
      expect(params?.DLT_TE_ID).toBe(SMS_CONFIG.templates.booking_confirmed.id);
    });
  });

  describe('Send Subscription Expiry', () => {
    it('should send subscription expiry SMS', async () => {
      const phone = '+919876543210';
      const expiryDate = '2024-12-31';

      const mockResponse = {
        data: {
          type: 'success',
          message: 'msg-expiry-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.sendSubscriptionExpiry(phone, expiryDate);

      expect(result.success).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalled();
      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params;
      expect(params?.DLT_TE_ID).toBe(SMS_CONFIG.templates.subscription_expiry.id);
    });
  });

  describe('Check Delivery Status', () => {
    it('should check SMS delivery status successfully', async () => {
      const messageId = 'msg-123';

      const mockResponse = {
        data: {
          status: 'delivered',
          delivered_at: '2024-01-15T10:00:00Z',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await smsService.checkDeliveryStatus(messageId);

      expect(result.status).toBe('delivered');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/status.php'),
        expect.objectContaining({
          params: expect.objectContaining({
            authkey: SMS_CONFIG.msg91.authKey,
            message_id: messageId,
          }),
        })
      );
    });

    it('should handle delivery status check errors', async () => {
      const messageId = 'msg-123';

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(smsService.checkDeliveryStatus(messageId)).rejects.toThrow(
        'Failed to check SMS delivery status'
      );
    });
  });

  describe('Template Variable Handling', () => {
    it('should handle single variable templates', () => {
      const template = 'Your OTP is {#var#}';
      const variables = ['123456'];
      
      let message = template;
      variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      expect(message).toBe('Your OTP is 123456');
    });

    it('should handle multiple variable templates', () => {
      const template = 'Payment of {#var#} for {#var#} successful';
      const variables = ['₹1000', 'order-123'];
      
      let message = template;
      variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      expect(message).toBe('Payment of ₹1000 for order-123 successful');
    });

    it('should handle three variable templates', () => {
      const template = 'Booking confirmed: Seat {#var#} on {#var#} at {#var#}';
      const variables = ['A-12', '2024-01-15', 'Central Library'];
      
      let message = template;
      variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      expect(message).toBe('Booking confirmed: Seat A-12 on 2024-01-15 at Central Library');
    });
  });
});

