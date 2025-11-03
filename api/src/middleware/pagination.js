/**
 * PAGINATION MIDDLEWARE
 * Issue #15 from Code Review - MEDIUM PRIORITY
 * 
 * Provides consistent pagination across all list endpoints
 * - Prevents returning thousands of records
 * - Improves API performance and user experience
 * - Standardizes pagination format
 */

const { AppError } = require('./errorHandler');
const { logger } = require('../utils/logger');

/**
 * Default pagination configuration
 */
const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

/**
 * Pagination middleware
 * Extracts and validates pagination parameters from query string
 * Adds pagination object to request for use in route handlers
 */
const paginate = (options = {}) => {
  const config = {
    ...PAGINATION_DEFAULTS,
    ...options
  };

  return (req, res, next) => {
    try {
      // Extract pagination parameters from query string
      let page = parseInt(req.query.page) || config.DEFAULT_PAGE;
      let limit = parseInt(req.query.limit) || config.DEFAULT_LIMIT;

      // Validate page number
      if (page < 1) {
        throw new AppError('Page number must be greater than 0', 400, 'INVALID_PAGE');
      }

      // Validate and cap limit
      if (limit < config.MIN_LIMIT) {
        limit = config.MIN_LIMIT;
      }
      if (limit > config.MAX_LIMIT) {
        logger.warn('Limit exceeded maximum, capping', {
          requested: limit,
          max: config.MAX_LIMIT
        });
        limit = config.MAX_LIMIT;
      }

      // Calculate offset for SQL queries
      const offset = (page - 1) * limit;

      // Add pagination info to request object
      req.pagination = {
        page,
        limit,
        offset,
        maxLimit: config.MAX_LIMIT
      };

      // Helper function to format paginated response
      req.paginatedResponse = (data, total) => {
        const totalPages = Math.ceil(total / limit);
        
        return {
          success: true,
          data: data,
          meta: {
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
              nextPage: page < totalPages ? page + 1 : null,
              prevPage: page > 1 ? page - 1 : null
            },
            timestamp: new Date().toISOString()
          }
        };
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper function to build SQL pagination query
 * @param {string} baseQuery - Base SQL query without LIMIT/OFFSET
 * @param {Array} params - Query parameters
 * @param {object} pagination - Pagination object from request
 * @returns {object} Query with pagination and count query
 */
const buildPaginatedQuery = (baseQuery, params, pagination) => {
  const { limit, offset } = pagination;

  // Add ORDER BY if not present (required for consistent pagination)
  let query = baseQuery;
  if (!query.toUpperCase().includes('ORDER BY')) {
    query += ' ORDER BY created_at DESC';
  }

  // Add pagination
  const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset}`;

  // Build count query (remove ORDER BY for performance)
  const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as count_query`;

  return {
    query: paginatedQuery,
    params,
    countQuery
  };
};

/**
 * Helper to execute paginated database query
 * @param {function} queryFn - Database query function
 * @param {string} baseQuery - Base SQL query
 * @param {Array} params - Query parameters
 * @param {object} pagination - Pagination object from request
 * @returns {Promise<object>} Results with total count
 */
const executePaginatedQuery = async (queryFn, baseQuery, params, pagination) => {
  const { query, countQuery } = buildPaginatedQuery(baseQuery, params, pagination);

  // Execute both queries in parallel for better performance
  const [dataResult, countResult] = await Promise.all([
    queryFn(query, params),
    queryFn(countQuery, params)
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].total)
  };
};

/**
 * Cursor-based pagination for real-time data
 * Better for infinite scroll and real-time feeds
 */
const cursorPaginate = (options = {}) => {
  const config = {
    defaultLimit: 20,
    maxLimit: 100,
    cursorField: 'id',
    ...options
  };

  return (req, res, next) => {
    try {
      const after = req.query.after || null;
      const before = req.query.before || null;
      let limit = parseInt(req.query.limit) || config.defaultLimit;

      if (limit > config.maxLimit) {
        limit = config.maxLimit;
      }

      req.cursorPagination = {
        after,
        before,
        limit,
        cursorField: config.cursorField
      };

      // Helper for cursor response
      req.cursorResponse = (data, hasMore) => {
        const lastCursor = data.length > 0 
          ? data[data.length - 1][config.cursorField]
          : null;

        return {
          success: true,
          data: data,
          meta: {
            pagination: {
              limit,
              hasMore,
              nextCursor: hasMore ? lastCursor : null
            },
            timestamp: new Date().toISOString()
          }
        };
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  paginate,
  buildPaginatedQuery,
  executePaginatedQuery,
  cursorPaginate,
  PAGINATION_DEFAULTS
};




