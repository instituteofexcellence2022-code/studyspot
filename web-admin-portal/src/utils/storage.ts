/**
 * Local storage utility functions
 */

const STORAGE_PREFIX = 'studyspot_admin_';

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
};

/**
 * Session storage utility object
 */
export const sessionStorage = {
  /**
   * Get item from session storage
   */
  get: <T = any>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(STORAGE_PREFIX + key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item from session storage: ${key}`, error);
      return null;
    }
  },

  /**
   * Set item in session storage
   */
  set: <T = any>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in session storage: ${key}`, error);
    }
  },

  /**
   * Remove item from session storage
   */
  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing item from session storage: ${key}`, error);
    }
  },

  /**
   * Clear all items from session storage
   */
  clear: (): void => {
    try {
      const keys = Object.keys(window.sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          window.sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing session storage', error);
    }
  },
};


