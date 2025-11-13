// ============================================
// DATABASE CONFIGURATION
// PostgreSQL connection pooling
// ============================================

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Core database configuration (Platform-level data)
const coreDbConfig: PoolConfig = {
  host: process.env.CORE_DB_HOST || 'localhost',
  port: parseInt(process.env.CORE_DB_PORT || '5432'),
  database: process.env.CORE_DB_NAME || 'studyspot_core',
  user: process.env.CORE_DB_USER || 'postgres',
  password: process.env.CORE_DB_PASSWORD || '',
  ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.CORE_DB_POOL_MIN || '1'), // Reduced for free tier
  max: parseInt(process.env.CORE_DB_POOL_MAX || '5'), // Reduced for free tier
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased from 2000ms to 20000ms (20s)
  query_timeout: 15000, // 15 second query timeout
  statement_timeout: 15000, // 15 second statement timeout
};

// Core database pool
export const coreDb = new Pool(coreDbConfig);

// Test connection
coreDb.on('connect', () => {
  console.log('✅ Connected to core database');
});

coreDb.on('error', (err) => {
  console.error('❌ Core database error:', err);
});

// Tenant database manager
class TenantDatabaseManager {
  private connections: Map<string, Pool> = new Map();

  /**
   * Get or create tenant database connection
   */
  async getTenantConnection(tenantId: string): Promise<Pool> {
    // Check cache
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId)!;
    }

    // Fetch tenant info from core database
    const result = await coreDb.query(
      'SELECT * FROM tenants WHERE id = $1 AND status = $2',
      [tenantId, 'active']
    );

    if (!result.rows.length) {
      throw new Error('Tenant not found or inactive');
    }

    const tenant = result.rows[0];

    // Create connection pool for tenant database
    const pool = new Pool({
      host: tenant.database_host || process.env.CORE_DB_HOST,
      port: parseInt(process.env.CORE_DB_PORT || '5432'),
      database: tenant.database_name,
      user: process.env.CORE_DB_USER,
      password: process.env.CORE_DB_PASSWORD,
      ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      min: 1, // Reduced for free tier
      max: 5, // Reduced for free tier
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // Increased from 2000ms to 20000ms
      query_timeout: 15000,
      statement_timeout: 15000,
    });

    // Cache connection
    this.connections.set(tenantId, pool);

    console.log(`✅ Connected to tenant database: ${tenant.database_name}`);

    return pool;
  }

  /**
   * Close tenant connection
   */
  async closeTenantConnection(tenantId: string): Promise<void> {
    const pool = this.connections.get(tenantId);
    if (pool) {
      await pool.end();
      this.connections.delete(tenantId);
      console.log(`✅ Closed tenant database connection: ${tenantId}`);
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    for (const [tenantId, pool] of this.connections) {
      await pool.end();
      console.log(`✅ Closed connection: ${tenantId}`);
    }
    this.connections.clear();
  }
}

export const tenantDbManager = new TenantDatabaseManager();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await coreDb.end();
  await tenantDbManager.closeAll();
  process.exit(0);
});

