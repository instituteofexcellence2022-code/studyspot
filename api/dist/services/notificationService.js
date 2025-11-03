const nodemailer = require('nodemailer');
const twilio = require('twilio');
const {
  logger
} = require('../utils/logger');
const {
  query
} = require('../config/database');
class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
    this.twilioClient = this.createTwilioClient();
  }

  // Email Configuration
  createEmailTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Email configuration incomplete. Email notifications will be disabled.');
      return null;
    }
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Twilio Configuration
  createTwilioClient() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      logger.warn('Twilio configuration incomplete. SMS notifications will be disabled.');
      return null;
    }
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  // Send Email Notification
  async sendEmail(to, subject, htmlContent, textContent = null, attachments = []) {
    if (!this.emailTransporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@studyspot.com',
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.htmlToText(htmlContent),
        attachments: attachments
      };
      const result = await this.emailTransporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        to: to,
        subject: subject,
        messageId: result.messageId
      });
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      logger.error('Failed to send email', {
        to: to,
        subject: subject,
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send SMS Notification
  async sendSMS(to, message) {
    if (!this.twilioClient) {
      logger.warn('SMS service not configured. Skipping SMS notification.');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      logger.info('SMS sent successfully', {
        to: to,
        messageSid: result.sid
      });
      return {
        success: true,
        messageSid: result.sid
      };
    } catch (error) {
      logger.error('Failed to send SMS', {
        to: to,
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create In-App Notification
  async createInAppNotification(userId, title, message, type = 'general', data = null) {
    try {
      const result = await query(`
        INSERT INTO notifications (user_id, title, message, type, data)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, created_at
      `, [userId, title, message, type, JSON.stringify(data)]);
      logger.info('In-app notification created', {
        userId: userId,
        title: title,
        type: type,
        notificationId: result.rows[0].id
      });
      return {
        success: true,
        notificationId: result.rows[0].id
      };
    } catch (error) {
      logger.error('Failed to create in-app notification', {
        userId: userId,
        title: title,
        error: error.message
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send Multi-Channel Notification
  async sendMultiChannelNotification(userId, notificationData) {
    const {
      title,
      message,
      type = 'general',
      data = null,
      channels = ['in_app']
    } = notificationData;
    const results = {
      in_app: null,
      email: null,
      sms: null
    };

    // Get user details
    const userResult = await query(`
      SELECT email, phone, first_name, last_name, notification_preferences
      FROM users WHERE id = $1
    `, [userId]);
    if (userResult.rows.length === 0) {
      logger.error('User not found for notification', {
        userId
      });
      return {
        success: false,
        error: 'User not found'
      };
    }
    const user = userResult.rows[0];
    const preferences = user.notification_preferences || {};

    // Send in-app notification
    if (channels.includes('in_app') && preferences.in_app !== false) {
      results.in_app = await this.createInAppNotification(userId, title, message, type, data);
    }

    // Send email notification
    if (channels.includes('email') && preferences.email !== false && user.email) {
      const emailHtml = this.generateEmailTemplate(title, message, user, type, data);
      results.email = await this.sendEmail(user.email, title, emailHtml);
    }

    // Send SMS notification
    if (channels.includes('sms') && preferences.sms !== false && user.phone) {
      results.sms = await this.sendSMS(user.phone, message);
    }
    return {
      success: true,
      results
    };
  }

  // Generate Email Template
  generateEmailTemplate(title, message, user, type, data) {
    const userName = user.first_name ? `Hi ${user.first_name},` : 'Hello,';
    let emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>StudySpot</h1>
          </div>
          <div class="content">
            <p>${userName}</p>
            <p>${message}</p>
    `;

    // Add type-specific content
    switch (type) {
      case 'booking':
        emailContent += `
          <p>Your booking details:</p>
          <ul>
            <li>Library: ${data?.libraryName || 'N/A'}</li>
            <li>Date: ${data?.date || 'N/A'}</li>
            <li>Time: ${data?.timeSlot || 'N/A'}</li>
          </ul>
        `;
        break;
      case 'payment':
        emailContent += `
          <p>Payment details:</p>
          <ul>
            <li>Amount: ₹${data?.amount || 'N/A'}</li>
            <li>Status: ${data?.status || 'N/A'}</li>
            <li>Transaction ID: ${data?.transactionId || 'N/A'}</li>
          </ul>
        `;
        break;
    }
    emailContent += `
          </div>
          <div class="footer">
            <p>Thank you for using StudySpot!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return emailContent;
  }

  // Convert HTML to Text
  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
  }

  // Notification Templates
  getNotificationTemplates() {
    return {
      booking_confirmed: {
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed successfully.',
        type: 'booking'
      },
      booking_cancelled: {
        title: 'Booking Cancelled',
        message: 'Your booking has been cancelled.',
        type: 'booking'
      },
      payment_successful: {
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully.',
        type: 'payment'
      },
      payment_failed: {
        title: 'Payment Failed',
        message: 'Your payment could not be processed.',
        type: 'payment'
      },
      reminder_booking: {
        title: 'Booking Reminder',
        message: 'You have a booking coming up in 30 minutes.',
        type: 'reminder'
      },
      welcome: {
        title: 'Welcome to StudySpot',
        message: 'Welcome to StudySpot! Start exploring libraries near you.',
        type: 'welcome'
      }
    };
  }

  // Send Template-based Notification
  async sendTemplateNotification(userId, templateKey, data = {}, channels = ['in_app']) {
    const templates = this.getNotificationTemplates();
    const template = templates[templateKey];
    if (!template) {
      logger.error('Notification template not found', {
        templateKey
      });
      return {
        success: false,
        error: 'Template not found'
      };
    }

    // Customize message with data
    let message = template.message;
    if (data.libraryName) {
      message = message.replace('booking', `booking for ${data.libraryName}`);
    }
    return await this.sendMultiChannelNotification(userId, {
      title: template.title,
      message: message,
      type: template.type,
      data: data,
      channels: channels
    });
  }
}
module.exports = new NotificationService();