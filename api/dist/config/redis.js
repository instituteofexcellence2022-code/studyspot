const redis = require('redis');
const {
  logger
} = require('../utils/logger');
let client;
let redisAvailable = false;
const createClient = () => {
  // Check if Redis URL is provided
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL not configured. Caching will be disabled.');
    return null;
  }
  const config = {
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: false // Don't retry if connection fails
    }
  };
  try {
    const newClient = redis.createClient(config);
    newClient.on('connect', () => {
      logger.info('Redis client connected');
      redisAvailable = true;
    });
    newClient.on('ready', () => {
      logger.info('Redis client ready');
      redisAvailable = true;
    });
    newClient.on('error', err => {
      logger.warn('Redis client error (continuing without cache):', err.message);
      redisAvailable = false;
    });
    newClient.on('end', () => {
      logger.info('Redis client disconnected');
      redisAvailable = false;
    });
    return newClient;
  } catch (error) {
    logger.warn('Failed to create Redis client - running without cache:', error.message);
    return null;
  }
};
const connectRedis = async () => {
  try {
    // Try to create client if it doesn't exist
    if (!client) {
      client = createClient();
    }

    // If still no client (REDIS_URL not configured), skip entirely
    if (!client) {
      logger.warn('Redis not configured - running without cache');
      redisAvailable = false;
      return null;
    }

    // Try to connect
    await client.connect();
    logger.info('Redis connected successfully');
    redisAvailable = true;
    return client;
  } catch (error) {
    logger.warn('Redis connection failed - running without cache:', error.message);
    redisAvailable = false;
    // Don't throw error, just continue without Redis
    return null;
  }
};
const getClient = () => {
  // Don't auto-create client, return existing or null
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
const getCache = async key => {
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
const deleteCache = async key => {
  if (!client || !redisAvailable) {
    logger.debug('Redis not available - skipping cache delete');
    return null;
  }
  try {
    await client.del(key);
    logger.debug(`Cache deleted: ${key}`);
  } catch (error) {
    logger.warn('Cache delete error (continuing without cache):', error.message);
    return null;
  }
};
const deleteCachePattern = async pattern => {
  if (!client || !redisAvailable) {
    logger.debug('Redis not available - skipping cache pattern delete');
    return null;
  }
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.warn('Cache pattern delete error (continuing without cache):', error.message);
    return null;
  }
};

// Session management
const setSession = async (sessionId, sessionData, expireInSeconds = 86400) => {
  const key = `session:${sessionId}`;
  await setCache(key, sessionData, expireInSeconds);
};
const getSession = async sessionId => {
  const key = `session:${sessionId}`;
  return await getCache(key);
};
const deleteSession = async sessionId => {
  const key = `session:${sessionId}`;
  await deleteCache(key);
};

// Rate limiting
const checkRateLimit = async (key, limit, windowInSeconds) => {
  if (!client || !redisAvailable) {
    return true; // Allow all requests if Redis is not available
  }
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
  if (!client || !redisAvailable) {
    return {
      status: 'disabled',
      message: 'Redis not configured'
    };
  }
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