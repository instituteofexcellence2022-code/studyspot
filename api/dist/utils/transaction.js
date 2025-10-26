/**
 * DATABASE TRANSACTION HELPERS
 * Issue #7 from Code Review - HIGH PRIORITY
 * 
 * Provides utilities for running database operations in transactions
 * Ensures ACID compliance for critical operations like payments and subscriptions
 */

const {
  getClient
} = require('../config/database');
const {
  logger
} = require('./logger');

/**
 * Execute a function within a database transaction
 * Automatically handles BEGIN, COMMIT, ROLLBACK, and connection release
 * 
 * @param {Function} callback - Async function that receives db client
 * @param {Object} options - Transaction options
 * @returns {Promise<any>} Result from callback
 * 
 * @example
 * const result = await withTransaction(async (client) => {
 *   await client.query('INSERT INTO users...');
 *   await client.query('INSERT INTO profiles...');
 *   return { success: true };
 * });
 */
const withTransaction = async (callback, options = {}) => {
  const {
    isolationLevel = null,
    // 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'
    readOnly = false,
    deferrable = false
  } = options;
  const client = await getClient();
  try {
    // Build transaction start command
    let beginCommand = 'BEGIN';
    if (isolationLevel) {
      beginCommand += ` ISOLATION LEVEL ${isolationLevel}`;
    }
    if (readOnly) {
      beginCommand += ' READ ONLY';
    }
    if (deferrable) {
      beginCommand += ' DEFERRABLE';
    }

    // Start transaction
    await client.query(beginCommand);
    logger.debug('Transaction started', {
      options
    });

    // Execute callback with client
    const result = await callback(client);

    // Commit transaction
    await client.query('COMMIT');
    logger.debug('Transaction committed');
    return result;
  } catch (error) {
    // Rollback on any error
    try {
      await client.query('ROLLBACK');
      logger.warn('Transaction rolled back', {
        error: error.message
      });
    } catch (rollbackError) {
      logger.error('Rollback failed', rollbackError);
    }
    throw error;
  } finally {
    // Always release client back to pool
    client.release();
  }
};

/**
 * Create a savepoint within a transaction
 * Allows partial rollback within a larger transaction
 * 
 * @param {Object} client - Database client from withTransaction
 * @param {string} savepointName - Name for the savepoint
 */
const savepoint = async (client, savepointName) => {
  await client.query(`SAVEPOINT ${savepointName}`);
  logger.debug('Savepoint created', {
    savepointName
  });
};

/**
 * Rollback to a specific savepoint
 * 
 * @param {Object} client - Database client from withTransaction
 * @param {string} savepointName - Name of the savepoint
 */
const rollbackToSavepoint = async (client, savepointName) => {
  await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
  logger.debug('Rolled back to savepoint', {
    savepointName
  });
};

/**
 * Release a savepoint (no longer needed)
 * 
 * @param {Object} client - Database client from withTransaction
 * @param {string} savepointName - Name of the savepoint
 */
const releaseSavepoint = async (client, savepointName) => {
  await client.query(`RELEASE SAVEPOINT ${savepointName}`);
  logger.debug('Savepoint released', {
    savepointName
  });
};

/**
 * Execute multiple queries in a transaction
 * Simpler alternative to withTransaction for basic use cases
 * 
 * @param {Array<{query: string, params: Array}>} queries - Array of query objects
 * @returns {Promise<Array>} Array of query results
 * 
 * @example
 * const results = await executeTransaction([
 *   { query: 'INSERT INTO users...', params: [email, password] },
 *   { query: 'INSERT INTO profiles...', params: [userId, name] }
 * ]);
 */
const executeTransaction = async queries => {
  return withTransaction(async client => {
    const results = [];
    for (const {
      query,
      params
    } of queries) {
      const result = await client.query(query, params);
      results.push(result);
    }
    return results;
  });
};

/**
 * Retry a transaction if it fails due to serialization error
 * Useful for handling concurrent transaction conflicts
 * 
 * @param {Function} callback - Transaction callback
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries in milliseconds
 * @returns {Promise<any>} Result from successful transaction
 */
const withRetryTransaction = async (callback, maxRetries = 3, delayMs = 100) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback);
    } catch (error) {
      lastError = error;

      // Retry only on serialization failures
      if (error.code === '40001' || error.code === '40P01') {
        logger.warn('Transaction serialization failure, retrying', {
          attempt,
          maxRetries,
          error: error.message
        });
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
          continue;
        }
      }

      // Don't retry other errors
      throw error;
    }
  }
  throw lastError;
};

/**
 * Transaction wrapper for Stripe operations
 * Ensures database state matches Stripe state
 * 
 * @param {Function} stripeOperation - Async function that calls Stripe
 * @param {Function} dbOperation - Async function that updates database
 * @param {Function} rollbackStripeOperation - Async function to undo Stripe changes
 * @returns {Promise<any>} Result from operations
 * 
 * @example
 * const result = await withStripeTransaction(
 *   async () => stripe.customers.create(...),
 *   async (client, stripeResult) => client.query('INSERT INTO customers...'),
 *   async (stripeResult) => stripe.customers.del(stripeResult.id)
 * );
 */
const withStripeTransaction = async (stripeOperation, dbOperation, rollbackStripeOperation = null) => {
  let stripeResult = null;
  try {
    // Step 1: Perform Stripe operation
    stripeResult = await stripeOperation();
    logger.debug('Stripe operation completed', {
      operationType: stripeOperation.name
    });

    // Step 2: Update database in transaction
    const result = await withTransaction(async client => {
      return await dbOperation(client, stripeResult);
    });
    return {
      stripeResult,
      dbResult: result
    };
  } catch (error) {
    logger.error('Stripe transaction failed', error);

    // If database failed but Stripe succeeded, try to rollback Stripe
    if (stripeResult && rollbackStripeOperation) {
      try {
        await rollbackStripeOperation(stripeResult);
        logger.info('Stripe operation rolled back successfully');
      } catch (rollbackError) {
        logger.error('Failed to rollback Stripe operation', {
          originalError: error.message,
          rollbackError: rollbackError.message,
          stripeResult
        });
        // This is critical - log to monitoring system
      }
    }
    throw error;
  }
};
module.exports = {
  withTransaction,
  savepoint,
  rollbackToSavepoint,
  releaseSavepoint,
  executeTransaction,
  withRetryTransaction,
  withStripeTransaction
};