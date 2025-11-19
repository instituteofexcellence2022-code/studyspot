// ============================================
// CACHING UTILITY
// Performance optimization with caching
// ============================================

import { logger } from './logger';

// In-memory cache (for development)
// In production, use Redis
class CacheManager {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private defaultTTL = 300; // 5 minutes

  /**
   * Get cached value
   */
  get<T = any>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cached value
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new CacheManager();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

/**
 * Cache decorator for functions
 */
export function cached(ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);
      
      if (cached !== null) {
        logger.debug('Cache hit', { key: cacheKey });
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, ttl);
      logger.debug('Cache miss - stored', { key: cacheKey });
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Redis cache (for production)
 */
export class RedisCache {
  // This would be implemented with Redis client
  // For now, placeholder
  async get<T = any>(key: string): Promise<T | null> {
    // Redis implementation
    return null;
  }

  async set(key: string, data: any, ttl: number = 300): Promise<void> {
    // Redis implementation
  }

  async delete(key: string): Promise<void> {
    // Redis implementation
  }
}

