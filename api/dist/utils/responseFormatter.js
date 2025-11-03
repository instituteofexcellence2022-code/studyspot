/**
 * Response Formatter Utilities
 * 
 * Provides reusable functions for formatting consistent API responses
 */

/**
 * Generate pagination URL
 * @param {Object} req - Express request object
 * @param {number} page - Page number
 * @returns {string} - Formatted URL
 */
const generatePageUrl = (req, page) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  url.searchParams.set('page', page.toString());
  return url.toString();
};

/**
 * Format paginated response
 * @param {Array} data - Response data
 * @param {Object} meta - Metadata object
 * @param {Object} req - Express request object
 * @returns {Object} - Formatted response
 */
const formatPaginatedResponse = (data, meta, req) => {
  const currentPage = meta.pagination.page;
  const totalPages = meta.pagination.totalPages;
  return {
    success: true,
    data,
    meta: {
      pagination: {
        page: currentPage,
        limit: meta.pagination.limit,
        total: meta.pagination.total,
        totalPages,
        links: {
          self: req.originalUrl,
          first: generatePageUrl(req, 1),
          prev: currentPage > 1 ? generatePageUrl(req, currentPage - 1) : null,
          next: currentPage < totalPages ? generatePageUrl(req, currentPage + 1) : null,
          last: totalPages > 0 ? generatePageUrl(req, totalPages) : null
        }
      },
      filters: meta.filters || {},
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format single resource response
 * @param {Object} data - Response data
 * @param {Object} meta - Optional metadata
 * @returns {Object} - Formatted response
 */
const formatSingleResponse = (data, meta = {}) => {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Error details
 * @returns {Object} - Formatted error response
 */
const formatErrorResponse = (message, code, details = {}) => {
  return {
    success: false,
    data: null,
    errors: [{
      code,
      message,
      ...(Object.keys(details).length > 0 && {
        details
      })
    }],
    meta: {
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Format success response with message
 * @param {string} message - Success message
 * @param {Object} data - Optional data
 * @returns {Object} - Formatted success response
 */
const formatSuccessResponse = (message, data = null) => {
  return {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString()
    }
  };
};
module.exports = {
  formatPaginatedResponse,
  formatSingleResponse,
  formatErrorResponse,
  formatSuccessResponse
};