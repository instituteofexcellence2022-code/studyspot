// ============================================
// SMS SERVICE
// MSG91 + BSNL DLT Integration
// ============================================

import axios from 'axios';
import { SMS_CONFIG } from '../../config/sms.config';
import { logger } from '../../utils/logger';

interface SendSMSRequest {
  phone: string;
  templateType: 'otp' | 'welcome' | 'payment_success' | 'payment_reminder' | 'booking_confirmed' | 'subscription_expiry';
  variables: string[];
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private config = SMS_CONFIG.msg91;
  private templates = SMS_CONFIG.templates;

  /**
   * Send SMS using MSG91 with BSNL DLT template
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    try {
      // Get approved DLT template
      const template = this.templates[request.templateType];

      if (!template || !template.id) {
        throw new Error(`Template ${request.templateType} not found or DLT ID missing`);
      }

      // Verify variable count
      if (request.variables.length !== template.variables) {
        throw new Error(`Template requires ${template.variables} variable(s), got ${request.variables.length}`);
      }

      // Replace variables in template
      let message = template.text;
      request.variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });

      // Send via MSG91
      const url = `${this.config.apiUrl}/sendhttp.php`;

      const params = {
        authkey: this.config.authKey,
        mobiles: request.phone,
        message: message,
        sender: this.config.senderId,
        route: this.config.route,
        country: this.config.country,
        DLT_TE_ID: template.id, // BSNL DLT Template ID (REQUIRED!)
      };

      const response = await axios.get(url, { params });

      if (response.data.type === 'success' || response.data.message) {
        logger.info('SMS sent successfully', {
          phone: request.phone,
          templateType: request.templateType,
          messageId: response.data.message,
        });

        return {
          success: true,
          messageId: response.data.message || response.data.request_id,
        };
      } else {
        logger.warn('SMS send failed', { response: response.data });
        return {
          success: false,
          error: response.data.message || 'SMS sending failed',
        };
      }
    } catch (error: any) {
      logger.error('SMS send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send OTP
   */
  async sendOTP(phone: string, otp: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'otp',
      variables: [otp],
    });
  }

  /**
   * Send welcome message
   */
  async sendWelcome(phone: string, studentId: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'welcome',
      variables: [studentId],
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccess(phone: string, amount: string, receipt: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'payment_success',
      variables: [amount, receipt],
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(phone: string, amount: string, dueDate: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'payment_reminder',
      variables: [amount, dueDate],
    });
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(phone: string, seat: string, date: string, library: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'booking_confirmed',
      variables: [seat, date, library],
    });
  }

  /**
   * Send subscription expiry notice
   */
  async sendSubscriptionExpiry(phone: string, expiryDate: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateType: 'subscription_expiry',
      variables: [expiryDate],
    });
  }

  /**
   * Check delivery status
   */
  async checkDeliveryStatus(messageId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/status.php`;

      const params = {
        authkey: this.config.authKey,
        message_id: messageId,
      };

      const response = await axios.get(url, { params });
      return response.data;
    } catch (error: any) {
      logger.error('Check delivery status error:', error);
      throw new Error('Failed to check SMS delivery status');
    }
  }
}

export default new SMSService();

