const rateLimit = require('express-rate-limit');
const logger = require('./logger');
const logActivity = require('./activityLogger');

/**
 * Create rate limiter middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests in the time window
 * @param {string} message - Message to send when rate limit is exceeded
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes default
    max: max || parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests default
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const path = req.originalUrl || req.url || 'unknown';
      
      logger.warn(`Rate limit exceeded: IP ${ip}, Path: ${path}`);
      
      if (req.user) {
        logActivity(
          'RATE_LIMIT_EXCEEDED', 
          req.user, 
          `Rate limit exceeded for path: ${path}`, 
          req
        );
      }
      
      res.status(options.statusCode).json(options.message);
    }
  });
};

/**
 * Stricter rate limiter for sensitive actions
 */
const sensitiveRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 attempts
  'Too many attempts. Please try again later.'
);

/**
 * Auth rate limiter for login/register
 */
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // 10 attempts
  'Too many authentication attempts. Please try again later.'
);

/**
 * API rate limiter for regular API requests
 */
const apiRateLimiter = createRateLimiter();

/**
 * Password reset rate limiter with higher limits
 */
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  100, // 100 attempts
  'Rate limit exceeded for password reset. Please try again later.'
);

module.exports = {
  createRateLimiter,
  sensitiveRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  passwordResetLimiter
};
