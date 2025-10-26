/**
 * Cache Manager Utility
 * 
 * Provides in-memory caching for frequently accessed query results
 * Reduces database load by caching expensive queries
 */

const NodeCache = require('node-cache');

// Create cache instance with 5-minute default TTL
const cache = new NodeCache({ 
  stdTTL: 300,           // 5 minutes default TTL
  checkperiod: 120,      // Check for expired keys every 2 minutes
  useClones: false,      // Don't clone cached values (better performance)
  deleteOnExpire: true   // Automatically delete expired keys
});

/**
 * Generate cache key from query and parameters
 * @param {string} query - Query string or operation name
 * @param {Object} params - Query parameters
 * @returns {string} - Cache key
 */
const generateCacheKey = (query, params = {}) => {
  const paramsStr = JSON.stringify(params);
  return `${query}:${Buffer.from(paramsStr).toString('base64')}`;
};

/**
 * Get cached value
 * @param {string} key - Cache key
 * @returns {any} - Cached value or undefined if not found
 */
const getCached = (key) => {
  try {
    return cache.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return undefined;
  }
};

/**
 * Set cached value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {boolean} - True if successful
 */
const setCached = (key, value, ttl = null) => {
  try {
    if (ttl) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Delete cached value
 * @param {string} key - Cache key
 * @returns {number} - Number of keys deleted
 */
const deleteCached = (key) => {
  try {
    return cache.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
};

/**
 * Clear all cached values
 * @returns {void}
 */
const clearCache = () => {
  try {
    cache.flushAll();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
const getCacheStats = () => {
  try {
    return cache.getStats();
  } catch (error) {
    console.error('Cache stats error:', error);
    return {};
  }
};

/**
 * Cache wrapper for async functions
 * @param {Function} fn - Async function to cache
 * @param {string} cacheKey - Cache key
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<any>} - Function result
 */
const withCache = async (fn, cacheKey, ttl = null) => {
  // Try to get from cache first
  const cached = getCached(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  setCached(cacheKey, result, ttl);
  return result;
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {number} - Number of keys deleted
 */
const invalidatePattern = (pattern) => {
  try {
    const keys = cache.keys();
    let deletedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith(pattern)) {
        cache.del(key);
        deletedCount++;
      }
    });
    
    return deletedCount;
  } catch (error) {
    console.error('Cache pattern invalidation error:', error);
    return 0;
  }
};

module.exports = {
  generateCacheKey,
  getCached,
  setCached,
  deleteCached,
  clearCache,
  getCacheStats,
  withCache,
  invalidatePattern
};
