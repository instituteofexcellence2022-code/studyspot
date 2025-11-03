/**
 * UNIT TESTS - AUTH MIDDLEWARE
 * Tests for authentication and authorization middleware
 */

const { verifyToken, authorize } = require('../../../src/middleware/auth');
const { query } = require('../../../src/config/database');
const { generateTestToken, generateExpiredToken, generateInvalidToken } = require('../../helpers/testAuth');
const { createTestUser } = require('../../helpers/testDb');

// Mock request and response objects
const createMockReq = (overrides = {}) => ({
  headers: {},
  user: null,
  ...overrides
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = () => jest.fn();

describe('Auth Middleware', () => {
  describe('verifyToken', () => {
    it('should reject requests without authorization header', async () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      try {
        await verifyToken(req, res, next);
      } catch (error) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Authorization token required');
      }
    });

    it('should reject requests with malformed token', async () => {
      const req = createMockReq({
        headers: { authorization: 'InvalidFormat token123' }
      });
      const res = createMockRes();
      const next = createMockNext();

      try {
        await verifyToken(req, res, next);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    it('should reject expired tokens', async () => {
      const user = await createTestUser();
      const expiredToken = generateExpiredToken({ id: user.id });

      const req = createMockReq({
        headers: { authorization: `Bearer ${expiredToken}` }
      });
      const res = createMockRes();
      const next = createMockNext();

      try {
        await verifyToken(req, res, next);
      } catch (error) {
        expect(error.message).toContain('expired');
      }
    });

    it('should reject invalid tokens', async () => {
      const invalidToken = generateInvalidToken();

      const req = createMockReq({
        headers: { authorization: `Bearer ${invalidToken}` }
      });
      const res = createMockRes();
      const next = createMockNext();

      try {
        await verifyToken(req, res, next);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    it('should accept valid tokens and attach user to request', async () => {
      const user = await createTestUser();
      const validToken = generateTestToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      const req = createMockReq({
        headers: { authorization: `Bearer ${validToken}` }
      });
      const res = createMockRes();
      const next = createMockNext();

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(user.id);
      expect(req.user.email).toBe(user.email);
    });

    it('should reject tokens for inactive users', async () => {
      const user = await createTestUser({ status: 'inactive' });
      const validToken = generateTestToken({ id: user.id });

      const req = createMockReq({
        headers: { authorization: `Bearer ${validToken}` }
      });
      const res = createMockRes();
      const next = createMockNext();

      try {
        await verifyToken(req, res, next);
      } catch (error) {
        expect(error.message).toContain('inactive');
      }
    });
  });

  describe('authorize', () => {
    it('should allow access when user has required role', () => {
      const middleware = authorize('admin', 'super_admin');
      const req = createMockReq({
        user: { id: '123', role: 'admin' }
      });
      const res = createMockRes();
      const next = createMockNext();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access when user lacks required role', () => {
      const middleware = authorize('admin', 'super_admin');
      const req = createMockReq({
        user: { id: '123', role: 'user' }
      });
      const res = createMockRes();
      const next = createMockNext();

      try {
        middleware(req, res, next);
      } catch (error) {
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain('Insufficient permissions');
      }
    });

    it('should deny access when user is not authenticated', () => {
      const middleware = authorize('admin');
      const req = createMockReq();
      const res = createMockRes();
      const next = createMockNext();

      try {
        middleware(req, res, next);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });
  });
});




