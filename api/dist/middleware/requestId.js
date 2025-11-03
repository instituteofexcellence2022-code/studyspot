/**
 * Request ID Middleware
 * Assigns a unique ID to each request for tracing and debugging
 */

const {
  v4: uuidv4
} = require('uuid');
const {
  logger
} = require('../utils/logger');
const requestId = (req, res, next) => {
  // Generate or use existing request ID from client
  req.id = req.headers['x-request-id'] || uuidv4();

  // Add to response headers for client-side tracking
  res.setHeader('X-Request-ID', req.id);

  // Also add to request object for easy access in routes
  req.requestId = req.id;

  // Set global context for this request (for logging)
  global.currentRequestId = req.id;

  // Log request start
  logger.debug('Request started', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
};
module.exports = {
  requestId
};