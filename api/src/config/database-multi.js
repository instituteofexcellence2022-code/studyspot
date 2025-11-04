/**
 * Multi-Provider Database Configuration
 * Supports: Neon.tech (primary) + PlanetScale/Supabase (read replicas)
 */

const { Pool } = require('pg');
// MySQL is optional for PlanetScale read replica
let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  mysql = null;
}
const { logger } = require('../utils/logger');

let primaryPool = null;
let readReplicaPool = null;

/**
 * Connect to Primary Database (Neon.tech PostgreSQL)
 */
async function connectPrimaryDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      logger.error('❌ DATABASE_URL not set');
      throw new Error('DATABASE_URL is required');
    }

    primaryPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await primaryPool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('✅ Primary Database (Neon.tech PostgreSQL) connected');
    return primaryPool;
  } catch (error) {
    logger.error('❌ Failed to connect to primary database:', error);
    throw error;
  }
}

/**
 * Connect to Read Replica (PlanetScale MySQL)
 */
async function connectReadReplica() {
  try {
    if (!process.env.PLANETSCALE_URL) {
      logger.warn('⚠️  PLANETSCALE_URL not set, skipping read replica');
      return null;
    }

    if (!mysql) {
      logger.warn('⚠️  mysql2 package not installed, skipping read replica');
      logger.warn('   Install with: npm install mysql2');
      return null;
    }

    // Parse PlanetScale URL
    const url = new URL(process.env.PLANETSCALE_URL);
    readReplicaPool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    await readReplicaPool.query('SELECT 1');

    logger.info('✅ Read Replica (PlanetScale MySQL) connected');
    return readReplicaPool;
  } catch (error) {
    logger.warn('⚠️  Failed to connect to read replica:', error.message);
    return null;
  }
}

/**
 * Get database pool (primary for writes, replica for reads if available)
 */
function getDatabasePool(forRead = false) {
  if (forRead && readReplicaPool) {
    return readReplicaPool;
  }
  return primaryPool;
}

/**
 * Execute query on primary database
 */
async function query(text, params) {
  const pool = getDatabasePool(false);
  if (!pool) {
    throw new Error('Database not connected');
  }
  return await pool.query(text, params);
}

/**
 * Execute read query (prefer replica if available)
 */
async function readQuery(text, params) {
  const pool = getDatabasePool(true);
  if (!pool) {
    throw new Error('Database not connected');
  }
  return await pool.query(text, params);
}

/**
 * Health check
 */
async function databaseHealthCheck() {
  const primary = primaryPool ? 'connected' : 'disconnected';
  const replica = readReplicaPool ? 'connected' : 'disconnected';

  try {
    if (primaryPool) {
      await primaryPool.query('SELECT NOW()');
    }
  } catch (error) {
    logger.error('Primary database health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }

  return {
    primary: {
      status: primary,
      provider: 'Neon.tech PostgreSQL',
    },
    replica: {
      status: replica,
      provider: 'PlanetScale MySQL',
    },
    overall: primary === 'connected' ? 'healthy' : 'unhealthy',
  };
}

module.exports = {
  connectPrimaryDatabase,
  connectReadReplica,
  getDatabasePool,
  query,
  readQuery,
  databaseHealthCheck,
  primaryPool: () => primaryPool,
  readReplicaPool: () => readReplicaPool,
};

