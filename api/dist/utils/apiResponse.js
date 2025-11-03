/**
 * Standardized API Response Utility
 * Ensures all API responses follow the same format
 */

class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} error - Error details
   */
  static error(res, message = 'Error occurred', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      error: error ? {
        code: error.code || 'SERVER_ERROR',
        message: error.message || message,
        field: error.field || null,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined
      } : {
        code: 'SERVER_ERROR',
        message
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   * @param {Object} res - Express response object
   * @param {Array|Object} errors - Validation errors
   * @param {string} message - Error message
   */
  static validationError(res, errors, message = 'Validation failed') {
    return res.status(400).json({
      success: false,
      message,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        errors: Array.isArray(errors) ? errors : [errors]
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401, {
      code: 'UNAUTHORIZED',
      message
    });
  }

  /**
   * Forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403, {
      code: 'FORBIDDEN',
      message
    });
  }

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404, {
      code: 'NOT_FOUND',
      message
    });
  }

  /**
   * Conflict response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static conflict(res, message = 'Resource already exists') {
    return this.error(res, message, 409, {
      code: 'CONFLICT',
      message
    });
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total count
   * @param {string} message - Success message
   */
  static paginated(res, data, page, limit, total, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }
}
module.exports = ApiResponse;