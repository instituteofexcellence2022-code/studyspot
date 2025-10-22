const redis = require('redis');
const { logger } = require('../utils/logger');

let client;

const createClient = () => {
  const config = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        logger.error('Redis server connection refused');
        return new Error('Redis server connection refused');
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        logger.error('Redis retry time exhausted');
        return new Error('Retry time exhausted');
      }
      if (options.attempt > 10) {
        logger.error('Redis max retry attempts reached');
        return undefined;
      }
      // Reconnect after
      return Math.min(options.attempt * 100, 3000);
    }
  };

  client = redis.createClient(config);

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('error', (err) => {
    logger.error('Redis client error:', err);
  });

  client.on('end', () => {
    logger.info('Redis client disconnected');
  });

  return client;
};

const connectRedis = async () => {
  try {
    if (!client) {
      client = createClient();
    }

    await client.connect();
    logger.info('Redis connected successfully');
    return client;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
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
  try {
    const serializedValue = JSON.stringify(value);
    await client.setEx(key, expireInSeconds, serializedValue);
    logger.debug(`Cache set: ${key}`);
  } catch (error) {
    logger.error('Cache set error:', error);
    throw error;
  }
};

const getCache = async (key) => {
  try {
    const value = await client.get(key);
    if (value) {
      logger.debug(`Cache hit: ${key}`);
      return JSON.parse(value);
    }
    logger.debug(`Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.error('Cache get error:', error);
    throw error;
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




