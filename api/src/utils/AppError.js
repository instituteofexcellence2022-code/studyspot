/**
 * Custom Application Error Class
 * Extends the built-in Error class to add status codes and operational flags
 * 
 * @example
 * throw new AppError('User not found', 404, 'USER_NOT_FOUND', { userId: 123 });
 */

class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    // Capture stack trace (exclude this constructor from stack)
    Error.captureStackTrace(this, this.constructor);
    
    // Set the name of this error to the class name
    this.name = this.constructor.name;
  }
  
  /**
   * Convert error to JSON format
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      status: this.status,
      ...(this.details && { details: this.details })
    };
  }
}

module.exports = AppError;















