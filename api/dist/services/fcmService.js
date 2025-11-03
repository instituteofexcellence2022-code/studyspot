const admin = require('firebase-admin');
const logger = require('../utils/logger');
const {
  query
} = require('../config/database');
class FCMService {
  constructor() {
    this.initialized = false;
    this.init();
  }
  init() {
    try {
      // Initialize Firebase Admin SDK
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        this.initialized = true;
        logger.info('Firebase Cloud Messaging initialized');
      } else {
        logger.warn('Firebase service account not configured');
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase', error);
    }
  }

  // Send notification to single device
  async sendToDevice(token, notification, data = {}) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image || undefined
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      const response = await admin.messaging().send(message);
      logger.info('FCM notification sent to device', {
        token: token.substring(0, 20) + '...',
        messageId: response
      });
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Failed to send FCM notification', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send notification to multiple devices
  async sendToDevices(tokens, notification, data = {}) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image || undefined
        },
        data,
        tokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      const response = await admin.messaging().sendMulticast(message);
      logger.info('FCM notification sent to multiple devices', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalDevices: tokens.length
      });
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      logger.error('Failed to send FCM notifications to devices', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send notification to topic
  async sendToTopic(topic, notification, data = {}) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.image || undefined
        },
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };
      const response = await admin.messaging().send(message);
      logger.info('FCM notification sent to topic', {
        topic,
        messageId: response
      });
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Failed to send FCM notification to topic', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subscribe device to topic
  async subscribeToTopic(tokens, topic) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin.messaging().subscribeToTopic(tokenArray, topic);
      logger.info('Devices subscribed to topic', {
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error('Failed to subscribe to topic', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unsubscribe device from topic
  async unsubscribeFromTopic(tokens, topic) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
      logger.info('Devices unsubscribed from topic', {
        topic,
        successCount: response.successCount,
        failureCount: response.failureCount
      });
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      logger.error('Failed to unsubscribe from topic', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send notification to user (fetches all user's devices)
  async sendToUser(userId, notification, data = {}) {
    try {
      // Get user's FCM tokens from database
      const result = await query('SELECT fcm_tokens FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0 || !result.rows[0].fcm_tokens) {
        logger.warn('No FCM tokens found for user', {
          userId
        });
        return {
          success: false,
          error: 'No devices registered'
        };
      }
      const tokens = result.rows[0].fcm_tokens;
      if (!Array.isArray(tokens) || tokens.length === 0) {
        logger.warn('Invalid FCM tokens for user', {
          userId
        });
        return {
          success: false,
          error: 'Invalid device tokens'
        };
      }
      return await this.sendToDevices(tokens, notification, data);
    } catch (error) {
      logger.error('Failed to send notification to user', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Register device token for user
  async registerDevice(userId, token, deviceInfo = {}) {
    try {
      // Get current tokens
      const result = await query('SELECT fcm_tokens FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      let tokens = result.rows[0].fcm_tokens || [];

      // Add new token if not already present
      if (!tokens.includes(token)) {
        tokens.push(token);
        await query('UPDATE users SET fcm_tokens = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(tokens), userId]);
        logger.info('FCM token registered for user', {
          userId,
          tokenCount: tokens.length
        });

        // Subscribe to user-specific topic
        await this.subscribeToTopic(token, `user_${userId}`);
      }
      return {
        success: true,
        tokensCount: tokens.length
      };
    } catch (error) {
      logger.error('Failed to register device token', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unregister device token
  async unregisterDevice(userId, token) {
    try {
      // Get current tokens
      const result = await query('SELECT fcm_tokens FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      let tokens = result.rows[0].fcm_tokens || [];

      // Remove token
      tokens = tokens.filter(t => t !== token);
      await query('UPDATE users SET fcm_tokens = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(tokens), userId]);
      logger.info('FCM token unregistered for user', {
        userId,
        tokenCount: tokens.length
      });

      // Unsubscribe from user-specific topic
      await this.unsubscribeFromTopic(token, `user_${userId}`);
      return {
        success: true,
        tokensCount: tokens.length
      };
    } catch (error) {
      logger.error('Failed to unregister device token', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send data-only message (silent push)
  async sendDataMessage(token, data) {
    if (!this.initialized) {
      logger.warn('FCM not initialized');
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      const message = {
        token,
        data,
        android: {
          priority: 'high'
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              contentAvailable: true
            }
          }
        }
      };
      const response = await admin.messaging().send(message);
      logger.info('FCM data message sent', {
        token: token.substring(0, 20) + '...',
        messageId: response
      });
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Failed to send FCM data message', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate FCM token
  async validateToken(token) {
    if (!this.initialized) {
      return {
        success: false,
        error: 'FCM not initialized'
      };
    }
    try {
      // Try to send a test message to validate token
      const message = {
        token,
        data: {
          test: 'true'
        },
        dryRun: true // Don't actually send
      };
      await admin.messaging().send(message);
      return {
        success: true,
        valid: true
      };
    } catch (error) {
      if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
        return {
          success: true,
          valid: false
        };
      }
      logger.error('Failed to validate FCM token', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up invalid tokens for user
  async cleanupInvalidTokens(userId) {
    try {
      const result = await query('SELECT fcm_tokens FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0 || !result.rows[0].fcm_tokens) {
        return {
          success: true,
          removedCount: 0
        };
      }
      const tokens = result.rows[0].fcm_tokens;
      const validTokens = [];

      // Validate each token
      for (const token of tokens) {
        const validation = await this.validateToken(token);
        if (validation.success && validation.valid) {
          validTokens.push(token);
        }
      }

      // Update user with valid tokens only
      await query('UPDATE users SET fcm_tokens = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(validTokens), userId]);
      const removedCount = tokens.length - validTokens.length;
      logger.info('Invalid FCM tokens cleaned up', {
        userId,
        removedCount,
        remainingCount: validTokens.length
      });
      return {
        success: true,
        removedCount,
        remainingCount: validTokens.length
      };
    } catch (error) {
      logger.error('Failed to cleanup invalid tokens', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
module.exports = new FCMService();