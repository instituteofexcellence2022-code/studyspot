const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const {
  query
} = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const {
  v4: uuidv4
} = require('uuid');
class OAuthService {
  constructor() {
    this.setupPassport();
  }
  setupPassport() {
    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
        scope: ['profile', 'email']
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await this.handleGoogleAuth(profile, accessToken);
          return done(null, result);
        } catch (error) {
          logger.error('Google OAuth error', error);
          return done(error, null);
        }
      }));
      logger.info('Google OAuth strategy configured');
    } else {
      logger.warn('Google OAuth credentials not configured');
    }

    // Facebook OAuth Strategy
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
      passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email']
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await this.handleFacebookAuth(profile, accessToken);
          return done(null, result);
        } catch (error) {
          logger.error('Facebook OAuth error', error);
          return done(error, null);
        }
      }));
      logger.info('Facebook OAuth strategy configured');
    } else {
      logger.warn('Facebook OAuth credentials not configured');
    }

    // Serialize user for session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
      try {
        const result = await query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
          done(null, result.rows[0]);
        } else {
          done(new Error('User not found'), null);
        }
      } catch (error) {
        done(error, null);
      }
    });
  }

  // Handle Google authentication
  async handleGoogleAuth(profile, accessToken) {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;

      // Check if user exists with this Google ID
      let userResult = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      if (userResult.rows.length > 0) {
        // User exists, update last login
        const user = userResult.rows[0];
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        logger.info('User logged in via Google', {
          userId: user.id,
          email
        });
        return {
          success: true,
          user,
          isNewUser: false
        };
      }

      // Check if user exists with same email
      userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        // Link Google account to existing user
        const user = userResult.rows[0];
        await query('UPDATE users SET google_id = $1, last_login = NOW() WHERE id = $2', [googleId, user.id]);
        logger.info('Google account linked to existing user', {
          userId: user.id,
          email
        });
        return {
          success: true,
          user,
          isNewUser: false,
          linked: true
        };
      }

      // Create new user
      const newUser = await this.createUserFromGoogle(profile, accessToken);
      logger.info('New user created via Google', {
        userId: newUser.id,
        email
      });
      return {
        success: true,
        user: newUser,
        isNewUser: true
      };
    } catch (error) {
      logger.error('Failed to handle Google auth', error);
      throw error;
    }
  }

  // Handle Facebook authentication
  async handleFacebookAuth(profile, accessToken) {
    try {
      const email = profile.emails && profile.emails[0].value;
      const facebookId = profile.id;
      if (!email) {
        throw new Error('Email permission required for Facebook login');
      }

      // Check if user exists with this Facebook ID
      let userResult = await query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
      if (userResult.rows.length > 0) {
        // User exists, update last login
        const user = userResult.rows[0];
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        logger.info('User logged in via Facebook', {
          userId: user.id,
          email
        });
        return {
          success: true,
          user,
          isNewUser: false
        };
      }

      // Check if user exists with same email
      userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        // Link Facebook account to existing user
        const user = userResult.rows[0];
        await query('UPDATE users SET facebook_id = $1, last_login = NOW() WHERE id = $2', [facebookId, user.id]);
        logger.info('Facebook account linked to existing user', {
          userId: user.id,
          email
        });
        return {
          success: true,
          user,
          isNewUser: false,
          linked: true
        };
      }

      // Create new user
      const newUser = await this.createUserFromFacebook(profile, accessToken);
      logger.info('New user created via Facebook', {
        userId: newUser.id,
        email
      });
      return {
        success: true,
        user: newUser,
        isNewUser: true
      };
    } catch (error) {
      logger.error('Failed to handle Facebook auth', error);
      throw error;
    }
  }

  // Create user from Google profile
  async createUserFromGoogle(profile, accessToken) {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const photo = profile.photos && profile.photos[0].value;

      // Split name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate random password (user won't need it)
      const randomPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const result = await query(`
        INSERT INTO users (
          email, password, first_name, last_name,
          google_id, profile_picture, email_verified,
          role, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [email, hashedPassword, firstName, lastName, profile.id, photo, true,
      // Email is verified by Google
      'student' // Default role
      ]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create user from Google profile', error);
      throw error;
    }
  }

  // Create user from Facebook profile
  async createUserFromFacebook(profile, accessToken) {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const photo = profile.photos && profile.photos[0].value;

      // Split name into first and last
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Generate random password (user won't need it)
      const randomPassword = uuidv4();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const result = await query(`
        INSERT INTO users (
          email, password, first_name, last_name,
          facebook_id, profile_picture, email_verified,
          role, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [email, hashedPassword, firstName, lastName, profile.id, photo, true,
      // Email is verified by Facebook
      'student' // Default role
      ]);
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create user from Facebook profile', error);
      throw error;
    }
  }

  // Link Google account to existing user
  async linkGoogleAccount(userId, googleId) {
    try {
      await query('UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2', [googleId, userId]);
      logger.info('Google account linked', {
        userId,
        googleId
      });
      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to link Google account', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Link Facebook account to existing user
  async linkFacebookAccount(userId, facebookId) {
    try {
      await query('UPDATE users SET facebook_id = $1, updated_at = NOW() WHERE id = $2', [facebookId, userId]);
      logger.info('Facebook account linked', {
        userId,
        facebookId
      });
      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to link Facebook account', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unlink Google account
  async unlinkGoogleAccount(userId) {
    try {
      await query('UPDATE users SET google_id = NULL, updated_at = NOW() WHERE id = $1', [userId]);
      logger.info('Google account unlinked', {
        userId
      });
      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to unlink Google account', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unlink Facebook account
  async unlinkFacebookAccount(userId) {
    try {
      await query('UPDATE users SET facebook_id = NULL, updated_at = NOW() WHERE id = $1', [userId]);
      logger.info('Facebook account unlinked', {
        userId
      });
      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to unlink Facebook account', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user's connected accounts
  async getConnectedAccounts(userId) {
    try {
      const result = await query('SELECT google_id, facebook_id FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      const user = result.rows[0];
      return {
        success: true,
        accounts: {
          google: !!user.google_id,
          facebook: !!user.facebook_id
        }
      };
    } catch (error) {
      logger.error('Failed to get connected accounts', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
module.exports = new OAuthService();