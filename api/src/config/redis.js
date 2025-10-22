const redis = require('redis');
const { logger } = require('../utils/logger');

let client;
let redisAvailable = false;

const createClient = () => {
  // Check if Upstash Redis credentials are provided
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    logger.warn('Redis credentials not configured. Caching will be disabled.');
    return null;
  }

  const config = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.warn('Redis server connection refused - running without cache');
        return undefined; // Don't retry
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        logger.warn('Redis retry time exhausted - running without cache');
        return undefined; // Don't retry
      }
      if (options.attempt > 3) {
        logger.warn('Redis max retry attempts reached - running without cache');
        return undefined; // Stop after 3 attempts
      }
      // Reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  };

  try {
    client = redis.createClient(config);

    client.on('connect', () => {
      logger.info('Redis client connected');
      redisAvailable = true;
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
      redisAvailable = true;
    });

    client.on('error', (err) => {
      logger.warn('Redis client error (continuing without cache):', err.message);
      redisAvailable = false;
    });

    client.on('end', () => {
      logger.info('Redis client disconnected');
      redisAvailable = false;
    });

    return client;
  } catch (error) {
    logger.warn('Failed to create Redis client - running without cache:', error.message);
    return null;
  }
};

const connectRedis = async () => {
  try {
    if (!client) {
      client = createClient();
    }

    if (!client) {
      logger.warn('Redis not configured - running without cache');
      return null;
    }

    await client.connect();
    logger.info('Redis connected successfully');
    redisAvailable = true;
    return client;
  } catch (error) {
    logger.warn('Redis connection failed - running without cache:', error.message);
    redisAvailable = false;
    return null; // Don't throw, just return null
  }
};

const getClient = () => {
  if (!client) {
    client = createClient();
  }
  return client;
};

// Cache helper functions
const setCache = async (key, value, expireInSeconds = 3600) => {
  if (!client || !redisAvailable) {
    logger.debug('Redis not available - skipping cache set');
    return null;
  }
  
  try {
    const serializedValue = JSON.stringify(value);
    await client.setEx(key, expireInSeconds, serializedValue);
    logger.debug(`Cache set: ${key}`);
  } catch (error) {
    logger.warn('Cache set error (continuing without cache):', error.message);
    return null; // Don't throw
  }
};

const getCache = async (key) => {
  if (!client || !redisAvailable) {
    logger.debug('Redis not available - cache miss');
    return null;
  }
  
  try {
    const value = await client.get(key);
    if (value) {
      logger.debug(`Cache hit: ${key}`);
      return JSON.parse(value);
    }
    logger.debug(`Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.warn('Cache get error (continuing without cache):', error.message);
    return null; // Don't throw
  }
};

const deleteCache = async (key) => {
  try {
    await client.del(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.error('Cache delete error:', error);
    throw error;
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.error('Cache pattern delete error:', error);
    throw error;
  }
};

// Session management
const setSession = async (sessionId, sessionData, expireInSeconds = 86400) => {
  const key = `session:${sessionId}`;
  await setCache(key, sessionData, expireInSeconds);
};

const getSession = async (sessionId) => {
  const key = `session:${sessionId}`;
  return await getCache(key);
};

const deleteSession = async (sessionId) => {
  const key = `session:${sessionId}`;
  await deleteCache(key);
};

// Rate limiting
const checkRateLimit = async (key, limit, windowInSeconds) => {
  try {
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, windowInSeconds);
    }
    return current <= limit;
  } catch (error) {
    logger.error('Rate limit check error:', error);
    return true; // Allow request if Redis is down
  }
};

// Health check function
const checkHealth = async () => {
  try {
    const result = await client.ping();
    return {
      status: 'healthy',
      response: result
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

const closeRedis = async () => {
  if (client) {
    await client.quit();
    logger.info('Redis connection closed');
  }
};

module.exports = {
  connectRedis,
  getClient,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  setSession,
  getSession,
  deleteSession,
  checkRateLimit,
  checkHealth,
  closeRedis
};




