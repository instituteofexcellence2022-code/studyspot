// ============================================
// DATABASE CONFIGURATION
// PostgreSQL connection pooling with performance optimization
// ============================================

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Core database configuration (Platform-level data)
// Support both DATABASE_URL (connection string) and individual parameters
let coreDbConfig: PoolConfig;

if (process.env.DATABASE_URL) {
  // Use connection string if provided (Supabase prefers this)
  coreDbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    min: parseInt(process.env.CORE_DB_POOL_MIN || '2'), // Increased for better performance
    max: parseInt(process.env.CORE_DB_POOL_MAX || '20'), // Increased for scalability
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    query_timeout: 15000,
    statement_timeout: 15000,
    // Performance optimizations
    allowExitOnIdle: false, // Keep connections alive
    application_name: 'studyspot-core',
  };
} else {
  // Fall back to individual parameters
  coreDbConfig = {
    host: process.env.CORE_DB_HOST || 'localhost',
    port: parseInt(process.env.CORE_DB_PORT || '5432'),
    database: process.env.CORE_DB_NAME || 'studyspot_core',
    user: process.env.CORE_DB_USER || 'postgres',
    password: process.env.CORE_DB_PASSWORD || '',
    ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    min: parseInt(process.env.CORE_DB_POOL_MIN || '2'),
    max: parseInt(process.env.CORE_DB_POOL_MAX || '20'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
    query_timeout: 15000,
    statement_timeout: 15000,
    allowExitOnIdle: false,
    application_name: 'studyspot-core',
  };
}

// Core database pool
export const coreDb = new Pool(coreDbConfig);

// Test connection
coreDb.on('connect', (client) => {
  console.log('✅ Connected to core database');
  // Set application name for monitoring
  client.query('SET application_name = $1', ['studyspot-core']).catch(() => {});
});

coreDb.on('error', (err) => {
  console.error('❌ Core database error:', err);
});

// Connection pool monitoring
let connectionStats = {
  total: 0,
  idle: 0,
  waiting: 0,
};

setInterval(() => {
  const pool = coreDb as any;
  connectionStats = {
    total: pool.totalCount || 0,
    idle: pool.idleCount || 0,
    waiting: pool.waitingCount || 0,
  };
  
  if (connectionStats.waiting > 5) {
    console.warn('⚠️ Database connection pool warning:', connectionStats);
  }
}, 30000); // Check every 30 seconds

// Tenant database manager with connection pooling and caching
class TenantDatabaseManager {
  private connections: Map<string, Pool> = new Map();
  private tenantCache: Map<string, { tenant: any; cachedAt: number }> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get or create tenant database connection
   */
  async getTenantConnection(tenantId: string): Promise<Pool> {
    // Check cache
    if (this.connections.has(tenantId)) {
      const pool = this.connections.get(tenantId)!;
      
      // Verify connection is still valid
      try {
        await pool.query('SELECT 1');
        return pool;
      } catch (error) {
        // Connection is dead, remove and recreate
        console.warn(`Tenant connection ${tenantId} is dead, recreating...`);
        this.connections.delete(tenantId);
        this.tenantCache.delete(tenantId);
      }
    }

    // Check tenant cache
    let tenant = this.tenantCache.get(tenantId);
    if (tenant && Date.now() - tenant.cachedAt < this.cacheTTL) {
      // Use cached tenant info
      tenant = tenant;
    } else {
      // Fetch tenant info from core database
      const result = await coreDb.query(
        'SELECT * FROM tenants WHERE id = $1 AND status = $2',
        [tenantId, 'active']
      );

      if (!result.rows.length) {
        throw new Error('Tenant not found or inactive');
      }

      tenant = {
        tenant: result.rows[0],
        cachedAt: Date.now(),
      };
      this.tenantCache.set(tenantId, tenant);
    }

    const tenantData = tenant.tenant;

    // For scalability: Use same database with tenant_id filtering if no separate database
    // This allows horizontal scaling without database sharding initially
    const useSharedDatabase = !tenantData.database_name || 
                              tenantData.database_name === process.env.CORE_DB_NAME ||
                              process.env.USE_SHARED_DATABASE === 'true';

    if (useSharedDatabase) {
      // Use core database with tenant_id filtering
      console.log(`📊 Using shared database for tenant: ${tenantId}`);
      this.connections.set(tenantId, coreDb);
      return coreDb;
    }

    // Create connection pool for tenant database
    const pool = new Pool({
      host: tenantData.database_host || process.env.CORE_DB_HOST,
      port: parseInt(process.env.CORE_DB_PORT || '5432'),
      database: tenantData.database_name,
      user: process.env.CORE_DB_USER,
      password: process.env.CORE_DB_PASSWORD,
      ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      min: parseInt(process.env.TENANT_DB_POOL_MIN || '1'),
      max: parseInt(process.env.TENANT_DB_POOL_MAX || '10'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      query_timeout: 15000,
      statement_timeout: 15000,
      allowExitOnIdle: false,
      application_name: `studyspot-tenant-${tenantId.substring(0, 8)}`,
    });

    // Cache connection
    this.connections.set(tenantId, pool);

    console.log(`✅ Connected to tenant database: ${tenantData.database_name}`);

    return pool;
  }

  /**
   * Close tenant connection
   */
  async closeTenantConnection(tenantId: string): Promise<void> {
    const pool = this.connections.get(tenantId);
    if (pool && pool !== coreDb) {
      await pool.end();
      this.connections.delete(tenantId);
      this.tenantCache.delete(tenantId);
      console.log(`✅ Closed tenant database connection: ${tenantId}`);
    }
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    for (const [tenantId, pool] of this.connections) {
      if (pool !== coreDb) {
        await pool.end();
        console.log(`✅ Closed connection: ${tenantId}`);
      }
    }
    this.connections.clear();
    this.tenantCache.clear();
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      activeConnections: this.connections.size,
      cachedTenants: this.tenantCache.size,
    };
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

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...');
  await coreDb.end();
  await tenantDbManager.closeAll();
  process.exit(0);
});
