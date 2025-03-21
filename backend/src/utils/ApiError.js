/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'A apărut o eroare pe server';
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }
  
  // Handle Mongoose cast errors (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identificator invalid';
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} există deja`;
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalid sau expirat';
  }
  
  // Handle Express validation errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    const errors = err.array().map(error => error.msg);
    message = errors.join(', ');
  }
  
  // Non-operational errors should not expose details in production
  const errorResponse = {
    success: false,
    status: statusCode,
    message: err.isOperational !== false ? message : 'A apărut o eroare pe server',
  };
  
  // Add stack trace in development environment
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }
  
  // Log error
  console.error('ERROR:', err);
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  ApiError,
  errorHandler
};
