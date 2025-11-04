/**
 * Multi-Provider Email Service
 * Supports: Resend, SendGrid, Mailgun, Brevo, Postmark, SES, Mailtrap
 * Automatically falls back to next provider if one fails
 */

const axios = require('axios');
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

const providers = [
  {
    name: 'resend',
    priority: 1,
    send: async (options) => {
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: options.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.RESEND_API_KEY,
  },
  {
    name: 'sendgrid',
    priority: 2,
    send: async (options) => {
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: options.from },
          subject: options.subject,
          content: [
            { type: 'text/plain', value: options.text },
            { type: 'text/html', value: options.html },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.SENDGRID_API_KEY,
  },
  {
    name: 'mailgun',
    priority: 3,
    send: async (options) => {
      const formData = new URLSearchParams();
      formData.append('from', options.from);
      formData.append('to', options.to);
      formData.append('subject', options.subject);
      formData.append('text', options.text);
      formData.append('html', options.html);

      const response = await axios.post(
        `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
        formData,
        {
          auth: {
            username: 'api',
            password: process.env.MAILGUN_API_KEY,
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.MAILGUN_API_KEY && !!process.env.MAILGUN_DOMAIN,
  },
  {
    name: 'brevo',
    priority: 4,
    send: async (options) => {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: options.from },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.BREVO_API_KEY,
  },
  {
    name: 'postmark',
    priority: 5,
    send: async (options) => {
      const response = await axios.post(
        'https://api.postmarkapp.com/email',
        {
          From: options.from,
          To: options.to,
          Subject: options.subject,
          HtmlBody: options.html,
          TextBody: options.text,
        },
        {
          headers: {
            'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.POSTMARK_API_KEY,
  },
  {
    name: 'ses',
    priority: 6,
    send: async (options) => {
      const AWS = require('aws-sdk');
      const ses = new AWS.SES({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      });

      const params = {
        Source: options.from,
        Destination: { ToAddresses: [options.to] },
        Message: {
          Subject: { Data: options.subject },
          Body: {
            Text: { Data: options.text },
            Html: { Data: options.html },
          },
        },
      };

      return await ses.sendEmail(params).promise();
    },
    check: () => !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY,
  },
  {
    name: 'mailtrap',
    priority: 7,
    send: async (options) => {
      const response = await axios.post(
        'https://send.api.mailtrap.io/api/send',
        {
          from: { email: options.from },
          to: [{ email: options.to }],
          subject: options.subject,
          html: options.html,
          text: options.text,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    check: () => !!process.env.MAILTRAP_API_TOKEN,
  },
];

/**
 * Get available providers sorted by priority
 */
function getAvailableProviders() {
  return providers
    .filter(p => p.check())
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Send email with automatic fallback
 */
async function sendEmail(options) {
  const availableProviders = getAvailableProviders();

  if (availableProviders.length === 0) {
    logger.error('❌ No email providers configured');
    throw new Error('No email providers available');
  }

  const preferredProvider = process.env.EMAIL_PROVIDER || 'resend';
  let providerToUse = availableProviders.find(p => p.name === preferredProvider);

  // If preferred provider not available, use first available
  if (!providerToUse) {
    providerToUse = availableProviders[0];
    logger.warn(`⚠️  Preferred provider "${preferredProvider}" not available, using "${providerToUse.name}"`);
  }

  // Try preferred provider first
  for (const provider of availableProviders) {
    if (provider === providerToUse || provider.priority >= providerToUse.priority) {
      try {
        logger.info(`📧 Sending email via ${provider.name}...`);
        const result = await provider.send({
          from: options.from || process.env.FROM_EMAIL || 'noreply@studyspot.com',
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
        });
        logger.info(`✅ Email sent successfully via ${provider.name}`);
        return { success: true, provider: provider.name, result };
      } catch (error) {
        logger.error(`❌ Failed to send email via ${provider.name}:`, error.message);
        // Continue to next provider
      }
    }
  }

  // All providers failed
  logger.error('❌ All email providers failed');
  throw new Error('Failed to send email: all providers failed');
}

/**
 * Send bulk emails (for notifications)
 */
async function sendBulkEmails(emails) {
  const results = [];
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ email: email.to, success: true, result });
    } catch (error) {
      results.push({ email: email.to, success: false, error: error.message });
    }
  }
  return results;
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  getAvailableProviders,
};

