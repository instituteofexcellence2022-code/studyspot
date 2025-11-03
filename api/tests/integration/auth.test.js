/**
 * INTEGRATION TESTS - AUTHENTICATION
 * Tests for auth endpoints with real database
 */

const request = require('supertest');
const app = require('../../src/index');
const { cleanDatabase, createTestUser } = require('../helpers/testDb');

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should reject registration with duplicate email', async () => {
      const email = 'duplicate@example.com';
      
      // Create first user
      await createTestUser({ email });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'SecurePass123!',
          name: 'Duplicate User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing password and name
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      await createTestUser({
        email: 'logintest@example.com',
        password: 'TestPass123!'
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(401);
    });

    it('should reject login for inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        password: 'TestPass123!',
        status: 'inactive'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'TestPass123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive login attempts', async () => {
      const attempts = [];

      // Make 10 login attempts (limit is 5)
      for (let i = 0; i < 10; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong'
            })
        );
      }

      const responses = await Promise.all(attempts);
      const rateLimited = responses.filter(r => r.status === 429);

      // At least some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});




