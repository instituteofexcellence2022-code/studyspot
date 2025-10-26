/**
 * Enhanced Security Headers Middleware
 * Adds additional security headers beyond Helmet.js
 */

const {
  logger
} = require('../utils/logger');
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (disable unused browser features)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');

  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Add a custom security header for identification
  res.setHeader('X-Powered-By', 'StudySpot-Platform');
  next();
};
module.exports = {
  securityHeaders
};