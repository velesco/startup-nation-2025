const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/ApiError');

/**
 * Rate limiter middleware for sensitive routes
 */
const rateLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX || 5, // 5 requests per window by default
  message: {
    success: false,
    status: 429,
    message: 'Prea multe încercări. Vă rugăm să încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, options.message.message));
  }
});

/**
 * General API rate limiter middleware
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    status: 429,
    message: 'Prea multe cereri. Vă rugăm să încercați din nou mai târziu.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, options.message.message));
  }
});

module.exports = {
  rateLimiter,
  apiLimiter
};
