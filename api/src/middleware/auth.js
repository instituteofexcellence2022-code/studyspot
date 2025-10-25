/**
 * Simple Authentication Middleware
 * No complex JWT or database checks - just basic token validation
 */

const jwt = require('jsonwebtoken');

// Simple user data (in production, this would come from database)
const USERS = {
  'admin@studyspot.com': {
    id: '1',
    email: 'admin@studyspot.com',
    name: 'Admin User',
    role: 'library_owner',
    tenant_id: 'default-tenant'
  },
  'owner@studyspot.com': {
    id: '2',
    email: 'owner@studyspot.com',
    name: 'Library Owner',
    role: 'library_owner',
    tenant_id: 'default-tenant'
  },
  'staff@studyspot.com': {
    id: '3',
    email: 'staff@studyspot.com',
    name: 'Library Staff',
    role: 'library_staff',
    tenant_id: 'default-tenant'
  }
};

// Simple JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'studyspot-secret-key-2024';

/**
 * Verify JWT token
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set user data in request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenant_id: decoded.tenant_id || 'default-tenant'
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Check if user has required role
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Simple login function
 */
const login = (email, password) => {
  const user = USERS[email];
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Simple password check (in production, use bcrypt)
  if (password !== 'password123') {
    throw new Error('Invalid password');
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id
    },
    token: generateToken(user)
  };
};

/**
 * Simple registration function
 */
const register = (email, password, name, role = 'library_owner') => {
  if (USERS[email]) {
    throw new Error('User already exists');
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    role,
    tenant_id: 'default-tenant'
  };
  
  USERS[email] = newUser;
  
  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenant_id: newUser.tenant_id
    },
    token: generateToken(newUser)
  };
};

module.exports = {
  verifyToken,
  authorize,
  generateToken,
  login,
  register,
  USERS
};



