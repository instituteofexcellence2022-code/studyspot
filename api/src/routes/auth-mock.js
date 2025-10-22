const express = require('express');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const router = express.Router();

// Mock users database
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@studyspot.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+1234567890',
    role: 'super_admin',
    status: 'active',
    tenantId: '00000000-0000-0000-0000-000000000000'
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'student1@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: 'student',
    status: 'active',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'student2@test.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567891',
    role: 'student',
    status: 'active',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'manager@test.com',
    password: 'password123',
    firstName: 'Library',
    lastName: 'Manager',
    phone: '+1234567892',
    role: 'branch_manager',
    status: 'active',
    tenantId: '11111111-1111-1111-1111-111111111111'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'staff@test.com',
    password: 'password123',
    firstName: 'Library',
    lastName: 'Staff',
    phone: '+1234567893',
    role: 'library_staff',
    status: 'active',
    tenantId: '11111111-1111-1111-1111-111111111111'
  }
];

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'demo-secret-key', {
    expiresIn: '24h'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret', {
    expiresIn: '7d'
  });
};

// Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  logger.info('Mock login attempt', { email });

  // Find user
  const user = mockUsers.find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      errors: [{
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }]
    });
  }

  // Generate tokens
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info('Mock login successful', { userId: user.id, email: user.email, role: user.role });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        lastLogin: new Date().toISOString()
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Register new user (mock)
router.post('/register', (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  logger.info('Mock registration attempt', { email });

  // Check if user exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      errors: [{
        code: 'USER_EXISTS',
        message: 'User already exists with this email'
      }]
    });
  }

  // Create new user
  const newUser = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    password,
    firstName,
    lastName,
    phone: phone || '',
    role: role || 'student',
    status: 'active',
    tenantId: '11111111-1111-1111-1111-111111111111'
  };

  mockUsers.push(newUser);

  // Generate tokens
  const tokenPayload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    tenantId: newUser.tenantId
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  logger.info('Mock registration successful', { userId: newUser.id, email: newUser.email });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        createdAt: new Date().toISOString()
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Refresh token (mock)
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret');
    
    const newAccessToken = generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: '24h'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      errors: [{
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token'
      }]
    });
  }
});

// Logout (mock)
router.post('/logout', (req, res) => {
  logger.info('Mock logout');
  
  res.json({
    success: true,
    data: {
      message: 'Logged out successfully'
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Get profile (mock)
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      errors: [{
        code: 'TOKEN_REQUIRED',
        message: 'Authorization token required'
      }]
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    const user = mockUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: [{
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }]
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      errors: [{
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }]
    });
  }
});

module.exports = router;



