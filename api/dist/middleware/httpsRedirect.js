/**
 * HTTPS Redirect Middleware
 * Redirects HTTP requests to HTTPS in production
 */

const {
  logger
} = require('../utils/logger');
const httpsRedirect = (req, res, next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
  if (!isHttps) {
    // Log the redirect
    logger.info('Redirecting HTTP to HTTPS', {
      requestId: req.id,
      originalUrl: req.originalUrl,
      host: req.hostname
    });

    // Redirect to HTTPS with 301 (permanent redirect)
    const httpsUrl = `https://${req.hostname}${req.originalUrl}`;
    return res.redirect(301, httpsUrl);
  }
  next();
};
module.exports = {
  httpsRedirect
};