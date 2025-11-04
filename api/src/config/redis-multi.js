/**
 * Multi-Provider Redis Configuration
 * Supports Railway Redis (primary) + Upstash Redis (backup)
 */

const redis = require('redis');
const { logger } = require('../utils/logger');

let primaryClient = null;
let backupClient = null;
let isPrimaryConnected = false;
let isBackupConnected = false;

/**
 * Connect to Primary Redis (Railway)
 */
async function connectPrimaryRedis() {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('⚠️  REDIS_URL not set, skipping primary Redis connection');
      return null;
    }

    primaryClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis primary connection failed after 10 retries');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    primaryClient.on('error', (err) => {
      logger.error('❌ Primary Redis error:', err);
      isPrimaryConnected = false;
    });

    primaryClient.on('connect', () => {
      logger.info('✅ Primary Redis (Railway) connected');
      isPrimaryConnected = true;
    });

    primaryClient.on('ready', () => {
      logger.info('✅ Primary Redis ready');
    });

    await primaryClient.connect();
    return primaryClient;
  } catch (error) {
    logger.error('❌ Failed to connect to primary Redis:', error);
    isPrimaryConnected = false;
    return null;
  }
}

/**
 * Connect to Backup Redis (Upstash)
 */
async function connectBackupRedis() {
  try {
    if (!process.env.UPSTASH_REDIS_URL) {
      logger.warn('⚠️  UPSTASH_REDIS_URL not set, skipping backup Redis connection');
      return null;
    }

    backupClient = redis.createClient({
      url: process.env.UPSTASH_REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis backup connection failed after 10 retries');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    backupClient.on('error', (err) => {
      logger.error('❌ Backup Redis error:', err);
      isBackupConnected = false;
    });

    backupClient.on('connect', () => {
      logger.info('✅ Backup Redis (Upstash) connected');
      isBackupConnected = true;
    });

    backupClient.on('ready', () => {
      logger.info('✅ Backup Redis ready');
    });

    await backupClient.connect();
    return backupClient;
  } catch (error) {
    logger.error('❌ Failed to connect to backup Redis:', error);
    isBackupConnected = false;
    return null;
  }
}

/**
 * Initialize all Redis connections
 */
async function connectAllRedis() {
  await Promise.all([
    connectPrimaryRedis(),
    connectBackupRedis(),
  ]);

  if (!isPrimaryConnected && !isBackupConnected) {
    logger.warn('⚠️  No Redis connections available, caching disabled');
  }
}

/**
 * Get Redis client (primary first, fallback to backup)
 */
function getRedisClient() {
  if (isPrimaryConnected && primaryClient) {
    return primaryClient;
  }
  if (isBackupConnected && backupClient) {
    logger.warn('⚠️  Using backup Redis client');
    return backupClient;
  }
  return null;
}

/**
 * Cache with automatic fallback
 */
async function cacheGet(key) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch (error) {
    logger.error('❌ Redis GET error:', error);
    // Try backup if primary failed
    if (client === primaryClient && backupClient && isBackupConnected) {
      try {
        return await backupClient.get(key);
      } catch (backupError) {
        logger.error('❌ Backup Redis GET error:', backupError);
        return null;
      }
    }
    return null;
  }
}

/**
 * Cache set with automatic fallback
 */
async function cacheSet(key, value, expirySeconds = 3600) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.setEx(key, expirySeconds, value);
    return true;
  } catch (error) {
    logger.error('❌ Redis SET error:', error);
    // Try backup if primary failed
    if (client === primaryClient && backupClient && isBackupConnected) {
      try {
        await backupClient.setEx(key, expirySeconds, value);
        return true;
      } catch (backupError) {
        logger.error('❌ Backup Redis SET error:', backupError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Cache delete with automatic fallback
 */
async function cacheDel(key) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('❌ Redis DEL error:', error);
    // Try backup if primary failed
    if (client === primaryClient && backupClient && isBackupConnected) {
      try {
        await backupClient.del(key);
        return true;
      } catch (backupError) {
        logger.error('❌ Backup Redis DEL error:', backupError);
        return false;
      }
    }
    return false;
  }
}

/**
 * Health check
 */
async function redisHealthCheck() {
  const primary = isPrimaryConnected && primaryClient ? 'connected' : 'disconnected';
  const backup = isBackupConnected && backupClient ? 'connected' : 'disconnected';

  return {
    primary: {
      status: primary,
      provider: 'Railway',
    },
    backup: {
      status: backup,
      provider: 'Upstash',
    },
    overall: primary === 'connected' || backup === 'connected' ? 'healthy' : 'unhealthy',
  };
}

module.exports = {
  connectAllRedis,
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDel,
  redisHealthCheck,
  isPrimaryConnected: () => isPrimaryConnected,
  isBackupConnected: () => isBackupConnected,
};

