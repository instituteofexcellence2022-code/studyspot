/**
 * Local storage utility functions with auth token helpers
 */

const STORAGE_PREFIX = 'studyspot_admin_';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Storage utility object
 */
export const storage = {
  /**
   * Get item from local storage
   */
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in local storage
   */
  set: <T = any>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  },

  /**
   * Remove item from local storage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  },

  /**
   * Clear all items from local storage
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  },

  /**
   * Check if key exists in local storage
   */
  has: (key: string): boolean => {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    } catch (error) {
      console.error(`Error checking if key exists in storage: ${key}`, error);
      return false;
    }
  },

  /**
   * Get auth token
   */
  getAuthToken: (): string | null => {
    return storage.get<string>(AUTH_TOKEN_KEY);
  },

  /**
   * Set auth token
   */
  setAuthToken: (token: string): void => {
    storage.set(AUTH_TOKEN_KEY, token);
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    return storage.get<string>(REFRESH_TOKEN_KEY);
  },

  /**
   * Set refresh token
   */
  setRefreshToken: (token: string): void => {
    storage.set(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Clear auth data (tokens and user)
   */
  clearAuthData: (): void => {
    storage.remove(AUTH_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove('admin_user');
  },
};

