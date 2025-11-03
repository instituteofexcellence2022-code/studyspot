/**
 * Secure Storage Utility
 * Provides secure token storage with encryption and automatic cleanup
 */

import Logger from './logger';

interface SecureTokenData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  userId: string;
}

class SecureStorage {
  private static readonly TOKEN_KEY = 'studyspot_auth_token';
  private static readonly USER_KEY = 'studyspot_user_data';
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  /**
   * Store authentication token securely
   */
  static setAuthToken(tokenData: SecureTokenData): void {
    try {
      // Encrypt sensitive data before storing
      const encryptedData = this.encrypt(JSON.stringify(tokenData));
      localStorage.setItem(this.TOKEN_KEY, encryptedData);
      
      Logger.debug('Auth token stored securely', { userId: tokenData.userId });
    } catch (error) {
      Logger.error('Failed to store auth token', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve authentication token
   */
  static getAuthToken(): SecureTokenData | null {
    try {
      const encryptedData = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      const tokenData: SecureTokenData = JSON.parse(decryptedData);

      // Check if token is expired
      if (Date.now() >= tokenData.expiresAt - this.TOKEN_EXPIRY_BUFFER) {
        Logger.warn('Auth token expired, removing from storage');
        this.removeAuthToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      Logger.error('Failed to retrieve auth token', error);
      this.removeAuthToken(); // Clean up corrupted data
      return null;
    }
  }

  /**
   * Remove authentication token
   */
  static removeAuthToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      Logger.debug('Auth token removed from storage');
    } catch (error) {
      Logger.error('Failed to remove auth token', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const tokenData = this.getAuthToken();
    return tokenData !== null;
  }

  /**
   * Get current user ID
   */
  static getCurrentUserId(): string | null {
    const tokenData = this.getAuthToken();
    return tokenData?.userId || null;
  }

  /**
   * Store user data securely
   */
  static setUserData(userData: Record<string, unknown>): void {
    try {
      // Remove sensitive fields before storing
      const sanitizedData = this.sanitizeUserData(userData);
      localStorage.setItem(this.USER_KEY, JSON.stringify(sanitizedData));
      
      Logger.debug('User data stored securely', { userId: sanitizedData.id });
    } catch (error) {
      Logger.error('Failed to store user data', error);
    }
  }

  /**
   * Retrieve user data
   */
  static getUserData(): Record<string, unknown> | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      Logger.error('Failed to retrieve user data', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      Logger.info('All secure storage cleared');
    } catch (error) {
      Logger.error('Failed to clear secure storage', error);
    }
  }

  /**
   * Simple encryption for sensitive data
   * Note: In production, use proper encryption libraries
   */
  private static encrypt(data: string): string {
    // Simple base64 encoding for now
    // TODO: Implement proper encryption using crypto-js or similar
    return btoa(data);
  }

  /**
   * Simple decryption for sensitive data
   */
  private static decrypt(encryptedData: string): string {
    try {
      return atob(encryptedData);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Remove sensitive fields from user data
   */
  private static sanitizeUserData(userData: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...userData };

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  /**
   * Get token for API requests
   */
  static getTokenForAPI(): string | null {
    const tokenData = this.getAuthToken();
    return tokenData?.token || null;
  }

  /**
   * Check if token needs refresh
   */
  static needsRefresh(): boolean {
    const tokenData = this.getAuthToken();
    if (!tokenData) return false;

    const timeUntilExpiry = tokenData.expiresAt - Date.now();
    return timeUntilExpiry < this.TOKEN_EXPIRY_BUFFER;
  }
}

export default SecureStorage;













