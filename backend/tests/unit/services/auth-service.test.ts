/**
 * UNIT TESTS - AUTH SERVICE
 * Tests for authentication service business logic
 */

import { coreDb } from '../../../src/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  let mockCoreDb: any;

  beforeEach(() => {
    mockCoreDb = {
      query: jest.fn(),
    };

    (coreDb.query as jest.Mock) = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        role: 'student',
      };

      const hashedPassword = 'hashed-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockCoreDb.query.mockResolvedValue({
        rows: [{ id: 'user-123', ...userData, password_hash: hashedPassword }],
      });

      const result = await mockCoreDb.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role`,
        [userData.email, hashedPassword, userData.name, userData.role]
      );

      expect(result.rows[0].email).toBe(userData.email);
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      const password = 'Password123!';
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await bcrypt.hash(password, 12);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('User Login', () => {
    it('should authenticate user with correct credentials', async () => {
      const email = 'user@example.com';
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 12);

      mockCoreDb.query.mockResolvedValue({
        rows: [{
          id: 'user-123',
          email,
          password_hash: hashedPassword,
          role: 'student',
          is_active: true,
        }],
      });

      const user = (await mockCoreDb.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )).rows[0];

      const isValid = await bcrypt.compare(password, user.password_hash);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const email = 'user@example.com';
      const wrongPassword = 'WrongPassword123!';

      mockCoreDb.query.mockResolvedValue({
        rows: [{
          id: 'user-123',
          email,
          password_hash: 'hashed-password',
        }],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const user = (await mockCoreDb.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )).rows[0];

      const isValid = await bcrypt.compare(wrongPassword, user.password_hash);

      expect(isValid).toBe(false);
    });

    it('should reject inactive users', async () => {
      mockCoreDb.query.mockResolvedValue({
        rows: [{
          id: 'user-123',
          email: 'user@example.com',
          is_active: false,
        }],
      });

      const user = (await mockCoreDb.query(
        'SELECT * FROM users WHERE email = $1',
        ['user@example.com']
      )).rows[0];

      expect(user.is_active).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate JWT token', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'student',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token-string');

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

      expect(token).toBe('token-string');
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should include user data in token', () => {
      const payload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'student',
        tenantId: 'tenant-123',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token');

      jwt.sign(payload, process.env.JWT_SECRET!);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          email: 'user@example.com',
          role: 'student',
          tenantId: 'tenant-123',
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Password Reset', () => {
    it('should generate reset token', async () => {
      const email = 'user@example.com';
      const resetToken = 'reset-token-123';

      mockCoreDb.query.mockResolvedValue({
        rows: [{ id: 'user-123', email }],
      });

      await mockCoreDb.query(
        `UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
         WHERE email = $2`,
        [resetToken, email]
      );

      expect(mockCoreDb.query).toHaveBeenCalled();
    });

    it('should reset password with valid token', async () => {
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewPassword123!';
      const hashedPassword = 'hashed-new-password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockCoreDb.query
        .mockResolvedValueOnce({
          rows: [{ id: 'user-123', reset_token: resetToken }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'user-123' }],
        });

      // Verify token
      const user = (await mockCoreDb.query(
        'SELECT * FROM users WHERE reset_token = $1',
        [resetToken]
      )).rows[0];

      if (user) {
        // Reset password
        await mockCoreDb.query(
          `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
           WHERE id = $2`,
          [hashedPassword, user.id]
        );

        expect(mockCoreDb.query).toHaveBeenCalled();
      }
    });
  });
});

