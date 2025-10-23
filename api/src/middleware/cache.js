/**
 * API Response Caching Middleware
 * Caches GET requests using Redis
 */

const { getCache, setCache } = require('../config/redis');
const { logger } = require('../utils/logger');

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @param {boolean} includeQuery - Include query params in cache key (default: true)
 */
const cacheMiddleware = (duration = 300, includeQuery = true) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key from URL and optionally query params
    const baseUrl = req.originalUrl.split('?')[0];
    const queryString = includeQuery ? req.originalUrl.split('?')[1] || '' : '';
    const cacheKey = `cache:${baseUrl}${queryString ? ':' + queryString : ''}`;
    
    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        logger.debug('Cache HIT', { 
          requestId: req.id,
          key: cacheKey 
        });
        
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        res.setHeader('X-Cache-Age', Math.floor(Date.now() / 1000));
        
        return res.json(cachedData);
      }
      
      // Cache MISS - continue to route handler
      logger.debug('Cache MISS', { 
        requestId: req.id,
        key: cacheKey 
      });
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode === 200 && body) {
          setCache(cacheKey, body, duration).catch(err => {
            logger.warn('Failed to cache response', { 
              requestId: req.id,
              key: cacheKey, 
              error: err.message 
            });
          });
        }
        return originalJson(body);
      };
      
      next();
    } catch (error) {
      logger.warn('Cache middleware error', { 
        requestId: req.id,
        error: error.message 
      });
      next(); // Continue without cache on error
    }
  };
};

/**
 * Cache invalidation helper
 * @param {string} pattern - Redis key pattern to delete (e.g., 'cache:/api/libraries*')
 */
const invalidateCache = async (pattern) => {
  try {
    const { deleteCachePattern } = require('../config/redis');
    await deleteCachePattern(pattern);
    logger.info('Cache invalidated', { pattern });
  } catch (error) {
    logger.warn('Cache invalidation failed', { 
      pattern, 
      error: error.message 
    });
  }
};

module.exports = { cacheMiddleware, invalidateCache };

