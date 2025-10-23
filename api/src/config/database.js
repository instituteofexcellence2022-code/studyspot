const { Pool } = require('pg');
const { logger } = require('../utils/logger');

let pool;

const createPool = () => {
  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  };

  pool = new Pool(config);

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
};

const connectDatabase = async () => {
  try {
    if (!pool) {
      pool = createPool();
    }

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connected successfully');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

const query = async (text, params) => {
  const start = Date.now();
  const requestId = global.currentRequestId || 'system';
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query performance
    logger.debug('Database Query', { 
      requestId,
      query: text.substring(0, 100), // First 100 chars
      duration: `${duration}ms`,
      rows: result.rowCount 
    });
    
    // ⚠️ Alert on slow queries (> 1000ms)
    if (duration > 1000) {
      logger.warn('SLOW QUERY DETECTED', {
        requestId,
        query: text,
        params: JSON.stringify(params),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    // ⚠️ Alert on large result sets (> 1000 rows)
    if (result.rowCount > 1000) {
      logger.warn('LARGE RESULT SET', {
        requestId,
        query: text.substring(0, 100),
        rows: result.rowCount,
        duration: `${duration}ms`,
        warning: 'Consider adding pagination or filtering'
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error', { 
      requestId,
      query: text, 
      params: JSON.stringify(params),
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

const getClient = async () => {
  return await pool.connect();
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
};

// Health check function
const checkHealth = async () => {
  try {
    const result = await query('SELECT NOW() as timestamp, version() as version');
    return {
      status: 'healthy',
      timestamp: result.rows[0].timestamp,
      version: result.rows[0].version
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

module.exports = {
  connectDatabase,
  getPool,
  query,
  getClient,
  closePool,
  checkHealth
};













