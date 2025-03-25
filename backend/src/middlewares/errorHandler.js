const logger = require('../utils/logger');

/**
 * Error response structure
 */
const errorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Global error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error for debugging
  logger.error(`Error: ${err.stack}`);

  // Log request details for better debugging
  logger.error(`Request URL: ${req.originalUrl}`);
  logger.error(`Request Method: ${req.method}`);
  logger.error(`Request IP: ${req.ip}`);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = errorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate field value entered: ${field}. Please use another value.`;
    error = errorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = 'Invalid input data';
    error = errorResponse(message, 400, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = errorResponse(message, 401);
  }

  // JWT expiration error
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = errorResponse(message, 401);
  }

  // Handle multer file size limit exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = `File size should be less than ${process.env.MAX_FILE_SIZE}MB`;
    error = errorResponse(message, 400);
  }

  // Send the error response
  return res.status(error.statusCode || 500).json(
    errorResponse(error.message || 'Server Error', error.statusCode || 500, error.errors)
  );
};
