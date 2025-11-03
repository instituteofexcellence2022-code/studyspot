// ============================================
// REDIS CONFIGURATION
// Cache and session management
// ============================================

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || '0'),
});

// Connect to Redis
redisClient.connect().then(() => {
  console.log('✅ Connected to Redis');
}).catch((err) => {
  console.error('❌ Redis connection error:', err);
});

// Error handling
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Cache service wrapper
export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }

  /**
   * Invalidate pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set with expiry
   */
  async setWithExpiry(key: string, value: any, seconds: number): Promise<void> {
    await this.set(key, value, seconds);
  }

  /**
   * Increment counter
   */
  async increment(key: string): Promise<number> {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }
}

export const cache = new CacheService();
export default redisClient;

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection...');
  await redisClient.quit();
  process.exit(0);
});

