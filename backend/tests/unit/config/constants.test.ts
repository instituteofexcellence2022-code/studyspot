/**
 * UNIT TESTS - CONSTANTS
 */

import {
  HTTP_STATUS,
  ERROR_CODES,
  PERMISSIONS,
  ROLES,
  RATE_LIMITS,
  CACHE_TTL,
  PAGINATION_DEFAULTS,
  BCRYPT_SALT_ROUNDS,
} from '../../../src/config/constants';

describe('Constants', () => {
  describe('HTTP_STATUS', () => {
    it('should have all HTTP status codes defined', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('ERROR_CODES', () => {
    it('should have all error codes defined', () => {
      expect(ERROR_CODES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_CODES.AUTHENTICATION_ERROR).toBeDefined();
      expect(ERROR_CODES.AUTHORIZATION_ERROR).toBeDefined();
      expect(ERROR_CODES.NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.CONFLICT).toBeDefined();
      expect(ERROR_CODES.SERVER_ERROR).toBeDefined();
    });
  });

  describe('PERMISSIONS', () => {
    it('should have permission constants defined', () => {
      expect(PERMISSIONS).toBeDefined();
      expect(typeof PERMISSIONS).toBe('object');
    });
  });

  describe('ROLES', () => {
    it('should have role constants defined', () => {
      expect(ROLES).toBeDefined();
      expect(ROLES.SUPER_ADMIN).toBeDefined();
      expect(ROLES.ADMIN).toBeDefined();
      expect(ROLES.STUDENT).toBeDefined();
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have rate limit constants defined', () => {
      expect(RATE_LIMITS).toBeDefined();
      expect(RATE_LIMITS.DEFAULT).toBeDefined();
      expect(RATE_LIMITS.DEFAULT.max).toBeGreaterThan(0);
      expect(RATE_LIMITS.DEFAULT.timeWindow).toBeDefined();
    });
  });

  describe('CACHE_TTL', () => {
    it('should have cache TTL constants defined', () => {
      expect(CACHE_TTL).toBeDefined();
      expect(CACHE_TTL.SHORT).toBeGreaterThan(0);
      expect(CACHE_TTL.MEDIUM).toBeGreaterThan(CACHE_TTL.SHORT);
      expect(CACHE_TTL.LONG).toBeGreaterThan(CACHE_TTL.MEDIUM);
    });
  });

  describe('PAGINATION_DEFAULTS', () => {
    it('should have pagination defaults defined', () => {
      expect(PAGINATION_DEFAULTS).toBeDefined();
      expect(PAGINATION_DEFAULTS.PAGE).toBeGreaterThan(0);
      expect(PAGINATION_DEFAULTS.LIMIT).toBeGreaterThan(0);
      expect(PAGINATION_DEFAULTS.MAX_LIMIT).toBeGreaterThan(PAGINATION_DEFAULTS.LIMIT);
    });
  });

  describe('BCRYPT_SALT_ROUNDS', () => {
    it('should have bcrypt salt rounds defined', () => {
      expect(BCRYPT_SALT_ROUNDS).toBeDefined();
      expect(BCRYPT_SALT_ROUNDS).toBeGreaterThanOrEqual(10);
      expect(BCRYPT_SALT_ROUNDS).toBeLessThanOrEqual(15);
    });
  });
});
