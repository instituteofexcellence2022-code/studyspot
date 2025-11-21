/**
 * UNIT TESTS - CACHE UTILITY EDGE CASES
 * Additional edge case tests for cache utility
 */

import { setCache, getCache, deleteCache, clearCache } from '../../../src/utils/cache';

// Mock Redis client
jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    flushdb: jest.fn(),
  },
  redisAvailable: true,
}));

jest.mock('../../../src/utils/logger');

describe('Cache Utility Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Expiration', () => {
    it('should handle expired cache entries', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.get.mockResolvedValue(null); // Expired entry returns null

      const result = await getCache('expired-key');

      expect(result).toBeNull();
    });

    it('should handle very short TTL', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      await setCache('short-ttl-key', 'value', 1); // 1 second TTL

      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should handle very long TTL', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      await setCache('long-ttl-key', 'value', 86400); // 24 hours TTL

      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe('Cache Key Edge Cases', () => {
    it('should handle special characters in cache keys', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      await setCache('key:with:colons', 'value');
      await setCache('key-with-dashes', 'value');
      await setCache('key_with_underscores', 'value');

      expect(redisClient.set).toHaveBeenCalledTimes(3);
    });

    it('should handle very long cache keys', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      const longKey = 'a'.repeat(1000);
      await setCache(longKey, 'value');

      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should handle empty cache keys', async () => {
      const { redisClient } = require('../../../src/config/redis');
      
      const result = await getCache('');

      // Should handle gracefully
      expect(redisClient.get).toHaveBeenCalled();
    });
  });

  describe('Cache Value Edge Cases', () => {
    it('should handle null values', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      await setCache('null-key', null);

      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should handle undefined values', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      await setCache('undefined-key', undefined);

      expect(redisClient.set).toHaveBeenCalled();
    });

    it('should handle large objects', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.set.mockResolvedValue('OK');

      const largeObject = {
        data: Array(1000).fill({ key: 'value' }),
      };

      await setCache('large-key', largeObject);

      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe('Redis Unavailability', () => {
    it('should handle Redis connection errors gracefully', async () => {
      const { redisClient, redisAvailable } = require('../../../src/config/redis');
      redisAvailable = false;
      redisClient.get.mockRejectedValue(new Error('Connection refused'));

      const result = await getCache('test-key');

      expect(result).toBeNull();
    });

    it('should handle Redis set errors gracefully', async () => {
      const { redisClient, redisAvailable } = require('../../../src/config/redis');
      redisAvailable = false;
      redisClient.set.mockRejectedValue(new Error('Connection refused'));

      const result = await setCache('test-key', 'value');

      expect(result).toBeNull();
    });
  });

  describe('Bulk Operations', () => {
    it('should handle clearing all cache', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.flushdb.mockResolvedValue('OK');

      await clearCache();

      expect(redisClient.flushdb).toHaveBeenCalled();
    });

    it('should handle deleting multiple keys', async () => {
      const { redisClient } = require('../../../src/config/redis');
      redisClient.del.mockResolvedValue(1);

      await deleteCache('key1');
      await deleteCache('key2');
      await deleteCache('key3');

      expect(redisClient.del).toHaveBeenCalledTimes(3);
    });
  });
});

