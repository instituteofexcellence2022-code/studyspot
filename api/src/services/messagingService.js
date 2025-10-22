const twilio = require('twilio');
const axios = require('axios');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { query } = require('../config/database');

class MessagingService {
  constructor() {
    // Twilio SMS Setup
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      logger.info('Twilio SMS service initialized');
    } else {
      logger.warn('Twilio credentials not configured');
    }

    // WhatsApp Setup (Twilio WhatsApp)
    this.whatsappEnabled = !!(process.env.TWILIO_WHATSAPP_NUMBER);
    if (this.whatsappEnabled) {
      this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      logger.info('WhatsApp service initialized (via Twilio)');
    } else {
      logger.warn('WhatsApp number not configured');
    }

    // Email Setup (NodeMailer)
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      logger.info('Email service initialized');
    } else {
      logger.warn('SMTP credentials not configured');
    }
  }

  // ============ SMS Methods ============

  async sendSMS(to, message, from = null) {
    if (!this.twilioClient) {
      logger.warn('SMS service not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const smsFrom = from || this.twilioPhoneNumber;

      const result = await this.twilioClient.messages.create({
        body: message,
        from: smsFrom,
        to: to,
      });

      logger.info('SMS sent successfully', {
        to,
        messageSid: result.sid,
        status: result.status,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        cost: result.price,
      };
    } catch (error) {
      logger.error('Failed to send SMS', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkSMS(recipients, message) {
    if (!this.twilioClient) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const results = [];

      for (const recipient of recipients) {
        const result = await this.sendSMS(recipient, message);
        results.push({
          to: recipient,
          success: result.success,
          messageSid: result.messageSid,
          error: result.error,
        });

        // Small delay to avoid rate limiting
        await this.delay(100);
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info('Bulk SMS sent', {
        total: recipients.length,
        success: successCount,
        failed: failureCount,
      });

      return {
        success: true,
        results,
        summary: {
          total: recipients.length,
          success: successCount,
          failed: failureCount,
        },
      };
    } catch (error) {
      logger.error('Failed to send bulk SMS', error);
      return { success: false, error: error.message };
    }
  }

  async sendSMSTemplate(to, templateName, variables = {}) {
    try {
      // Get SMS template from database
      const result = await query(
        'SELECT content FROM message_templates WHERE name = $1 AND type = $2',
        [templateName, 'sms']
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Template not found' };
      }

      let message = result.rows[0].content;

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
      });

      return await this.sendSMS(to, message);
    } catch (error) {
      logger.error('Failed to send SMS template', error);
      return { success: false, error: error.message };
    }
  }

  // ============ WhatsApp Methods ============

  async sendWhatsApp(to, message) {
    if (!this.whatsappEnabled) {
      logger.warn('WhatsApp service not configured');
      return { success: false, error: 'WhatsApp service not configured' };
    }

    try {
      // Format phone number for WhatsApp (must have whatsapp: prefix)
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.whatsappNumber,
        to: whatsappTo,
      });

      logger.info('WhatsApp message sent successfully', {
        to: whatsappTo,
        messageSid: result.sid,
        status: result.status,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
      };
    } catch (error) {
      logger.error('Failed to send WhatsApp message', error);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsAppTemplate(to, templateName, variables = {}) {
    try {
      // Get WhatsApp template from database
      const result = await query(
        'SELECT content FROM message_templates WHERE name = $1 AND type = $2',
        [templateName, 'whatsapp']
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Template not found' };
      }

      let message = result.rows[0].content;

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
      });

      return await this.sendWhatsApp(to, message);
    } catch (error) {
      logger.error('Failed to send WhatsApp template', error);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsAppMedia(to, mediaUrl, caption = '') {
    if (!this.whatsappEnabled) {
      return { success: false, error: 'WhatsApp service not configured' };
    }

    try {
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await this.twilioClient.messages.create({
        from: this.whatsappNumber,
        to: whatsappTo,
        mediaUrl: [mediaUrl],
        body: caption,
      });

      logger.info('WhatsApp media message sent successfully', {
        to: whatsappTo,
        messageSid: result.sid,
      });

      return {
        success: true,
        messageSid: result.sid,
      };
    } catch (error) {
      logger.error('Failed to send WhatsApp media', error);
      return { success: false, error: error.message };
    }
  }

  // ============ Email Methods ============

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.emailTransporter) {
      logger.warn('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error('Failed to send email', error);
      return { success: false, error: error.message };
    }
  }

  async sendEmailTemplate(to, templateName, variables = {}) {
    try {
      // Get email template from database
      const result = await query(
        'SELECT subject, content FROM message_templates WHERE name = $1 AND type = $2',
        [templateName, 'email']
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Template not found' };
      }

      let subject = result.rows[0].subject;
      let content = result.rows[0].content;

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, variables[key]);
        content = content.replace(regex, variables[key]);
      });

      return await this.sendEmail(to, subject, content);
    } catch (error) {
      logger.error('Failed to send email template', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmail(recipients, subject, htmlContent) {
    try {
      const results = [];

      for (const recipient of recipients) {
        const result = await this.sendEmail(recipient, subject, htmlContent);
        results.push({
          to: recipient,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        });

        // Small delay to avoid rate limiting
        await this.delay(100);
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info('Bulk email sent', {
        total: recipients.length,
        success: successCount,
        failed: failureCount,
      });

      return {
        success: true,
        results,
        summary: {
          total: recipients.length,
          success: successCount,
          failed: failureCount,
        },
      };
    } catch (error) {
      logger.error('Failed to send bulk email', error);
      return { success: false, error: error.message };
    }
  }

  // ============ Multi-Channel Methods ============

  async sendMultiChannel(channels, recipient, message, options = {}) {
    const results = {};

    try {
      // Send to each requested channel
      if (channels.includes('sms') && recipient.phone) {
        results.sms = await this.sendSMS(recipient.phone, message.sms || message.text);
      }

      if (channels.includes('whatsapp') && recipient.phone) {
        results.whatsapp = await this.sendWhatsApp(recipient.phone, message.whatsapp || message.text);
      }

      if (channels.includes('email') && recipient.email) {
        results.email = await this.sendEmail(
          recipient.email,
          message.subject || 'Notification',
          message.html || message.text
        );
      }

      const successCount = Object.values(results).filter(r => r.success).length;
      const totalCount = Object.keys(results).length;

      return {
        success: successCount > 0,
        results,
        summary: {
          total: totalCount,
          success: successCount,
          failed: totalCount - successCount,
        },
      };
    } catch (error) {
      logger.error('Failed to send multi-channel message', error);
      return { success: false, error: error.message };
    }
  }

  // ============ Credit Management ============

  async deductCredits(tenantId, type, amount) {
    try {
      const result = await query(`
        UPDATE credit_balances
        SET 
          ${type}_credits = ${type}_credits - $1,
          ${type}_credits_used = ${type}_credits_used + $1,
          updated_at = NOW()
        WHERE tenant_id = $2
        AND ${type}_credits >= $1
        RETURNING *
      `, [amount, tenantId]);

      if (result.rows.length === 0) {
        return { success: false, error: 'Insufficient credits' };
      }

      // Log transaction
      await query(`
        INSERT INTO credit_transactions (
          tenant_id, type, transaction_type, amount,
          balance_after, description
        ) VALUES ($1, $2, 'usage', $3, $4, $5)
      `, [
        tenantId,
        type,
        -amount,
        result.rows[0][`${type}_credits`],
        `Used ${amount} ${type} credits`
      ]);

      return { success: true, newBalance: result.rows[0][`${type}_credits`] };
    } catch (error) {
      logger.error('Failed to deduct credits', error);
      return { success: false, error: error.message };
    }
  }

  async checkCredits(tenantId, type, required) {
    try {
      const result = await query(
        `SELECT ${type}_credits FROM credit_balances WHERE tenant_id = $1`,
        [tenantId]
      );

      if (result.rows.length === 0) {
        return { success: false, hasEnough: false };
      }

      const available = result.rows[0][`${type}_credits`];

      return {
        success: true,
        hasEnough: available >= required,
        available,
        required,
      };
    } catch (error) {
      logger.error('Failed to check credits', error);
      return { success: false, error: error.message };
    }
  }

  // ============ Helper Methods ============

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get SMS delivery status
  async getSMSStatus(messageSid) {
    if (!this.twilioClient) {
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      const message = await this.twilioClient.messages(messageSid).fetch();

      return {
        success: true,
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      logger.error('Failed to get SMS status', error);
      return { success: false, error: error.message };
    }
  }

  // Verify email configuration
  async verifyEmailConfig() {
    if (!this.emailTransporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.emailTransporter.verify();
      return { success: true, message: 'Email configuration verified' };
    } catch (error) {
      logger.error('Email configuration verification failed', error);
      return { success: false, error: error.message };
    }
  }

  // Get service status
  getServiceStatus() {
    return {
      sms: {
        configured: !!this.twilioClient,
        phoneNumber: this.twilioPhoneNumber,
      },
      whatsapp: {
        configured: this.whatsappEnabled,
        phoneNumber: this.whatsappNumber,
      },
      email: {
        configured: !!this.emailTransporter,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
      },
    };
  }
}

module.exports = new MessagingService();

