/**
 * UNIT TESTS - CACHE UTILITY
 */

import { cache, cached, RedisCache } from '../../../src/utils/cache';
import { CacheService } from '../../../src/config/redis';
import { redisClient } from '../../../src/config/redis';

jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
  },
  CacheService: jest.fn(),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Cache Utility (In-Memory)', () => {
  beforeEach(() => {
    cache.clear();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get cached value', () => {
      const key = 'test-key';
      const value = { data: 'test' };
      cache.set(key, value, 60);

      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired key', () => {
      const key = 'expired-key';
      cache.set(key, 'value', -1); // Already expired
      
      const result = cache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL', () => {
      const key = 'test-key';
      const value = { data: 'test' };
      const ttl = 60;

      cache.set(key, value, ttl);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });

    it('should set value with default TTL', () => {
      const key = 'test-key';
      const value = { data: 'test' };

      cache.set(key, value);
      const result = cache.get(key);

      expect(result).toEqual(value);
    });
  });

  describe('delete', () => {
    it('should delete key', () => {
      const key = 'test-key';
      cache.set(key, 'value');
      cache.delete(key);

      const result = cache.get(key);
      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      cache.set('expired', 'value', -1);
      cache.set('valid', 'value', 60);
      
      cache.cleanup();

      expect(cache.get('expired')).toBeNull();
      expect(cache.get('valid')).toBe('value');
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('cached decorator', () => {
    it('should cache function results', async () => {
      class TestClass {
        callCount = 0;

        @cached(60)
        async testMethod(arg: string) {
          this.callCount++;
          return `result-${arg}`;
        }
      }

      const instance = new TestClass();
      const result1 = await instance.testMethod('test');
      const result2 = await instance.testMethod('test');

      expect(result1).toBe('result-test');
      expect(result2).toBe('result-test');
      expect(instance.callCount).toBe(1); // Should only call once
    });
  });
});

describe('Redis Cache Service', () => {
  let redisCache: CacheService;

  beforeEach(() => {
    redisCache = new CacheService();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get cached value', async () => {
      const key = 'test-key';
      const value = { data: 'test' };
      (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(value));

      const result = await redisCache.get(key);

      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await redisCache.get('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test' };
      const ttl = 60;

      await redisCache.set(key, value, ttl);

      expect(redisClient.setEx).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      const key = 'test-key';

      await redisCache.del(key);

      expect(redisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate keys matching pattern', async () => {
      const pattern = 'prefix:*';
      const keys = ['prefix:1', 'prefix:2'];
      (redisClient.keys as jest.Mock).mockResolvedValueOnce(keys);

      await redisCache.invalidatePattern(pattern);

      expect(redisClient.keys).toHaveBeenCalledWith(pattern);
      expect(redisClient.del).toHaveBeenCalledWith(keys);
    });
  });

  describe('exists', () => {
    it('should check if key exists', async () => {
      (redisClient.exists as jest.Mock).mockResolvedValueOnce(1);

      const exists = await redisCache.exists('test-key');

      expect(exists).toBe(true);
    });
  });
});
