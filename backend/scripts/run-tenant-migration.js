// ============================================
// TENANT MIGRATION RUNNER SCRIPT
// Runs migrations on tenant databases
// ============================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.CORE_DB_USER || 'postgres'}:${process.env.CORE_DB_PASSWORD || ''}@${process.env.CORE_DB_HOST || 'localhost'}:${process.env.CORE_DB_PORT || '5432'}/${process.env.CORE_DB_NAME || 'studyspot_core'}`;

const corePool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const MIGRATION_FILE = '009_create_library_staff_table.sql';

async function runTenantMigration() {
  console.log('🚀 Starting tenant database migration...\n');
  console.log(`📊 Core Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    // Test core database connection
    await corePool.query('SELECT 1');
    console.log('✅ Core database connection successful\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', MIGRATION_FILE);
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📄 Migration file loaded: ${MIGRATION_FILE}\n`);

    // Get all active tenants
    const tenantsResult = await corePool.query(`
      SELECT id, name, slug, database_name, database_host, status
      FROM tenants
      WHERE status = 'active'
      ORDER BY created_at
    `);

    const tenants = tenantsResult.rows;
    console.log(`📊 Found ${tenants.length} active tenant(s)\n`);

    if (tenants.length === 0) {
      console.log('⚠️  No active tenants found. Migration will run on shared database if applicable.\n');
      
      // Run on shared database (core database)
      console.log('📄 Running migration on shared/core database...');
      try {
        await corePool.query(migrationSQL);
        console.log('✅ Migration completed on shared database\n');
      } catch (error) {
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          console.log(`⚠️  Warning (non-critical): ${error.message}\n`);
        } else {
          throw error;
        }
      }
    } else {
      // Run migration on each tenant database
      for (const tenant of tenants) {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📦 Tenant: ${tenant.name} (${tenant.id.substring(0, 8)}...)`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        const useSharedDatabase = !tenant.database_name || 
                                  tenant.database_name === process.env.CORE_DB_NAME ||
                                  process.env.USE_SHARED_DATABASE === 'true';

        if (useSharedDatabase) {
          // Use shared database (core database)
          console.log('📄 Using shared database (core database)');
          try {
            await corePool.query(migrationSQL);
            console.log('✅ Migration completed on shared database\n');
          } catch (error) {
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate') ||
                error.code === '42P07' || // duplicate_table
                error.code === '42710') { // duplicate_object
              console.log(`⚠️  Warning (non-critical): ${error.message}\n`);
            } else {
              console.error(`❌ Error: ${error.message}\n`);
              throw error;
            }
          }
        } else {
          // Connect to tenant's separate database
          console.log(`📄 Connecting to tenant database: ${tenant.database_name}`);
          
          const tenantPool = new Pool({
            host: tenant.database_host || process.env.CORE_DB_HOST || 'localhost',
            port: parseInt(process.env.CORE_DB_PORT || '5432'),
            database: tenant.database_name,
            user: process.env.CORE_DB_USER || 'postgres',
            password: process.env.CORE_DB_PASSWORD || '',
            ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          });

          try {
            // Test connection
            await tenantPool.query('SELECT 1');
            console.log('✅ Connected to tenant database');

            // Run migration
            await tenantPool.query(migrationSQL);
            console.log('✅ Migration completed\n');

            await tenantPool.end();
          } catch (error) {
            await tenantPool.end();
            
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate') ||
                error.code === '42P07' || // duplicate_table
                error.code === '42710') { // duplicate_object
              console.log(`⚠️  Warning (non-critical): ${error.message}\n`);
            } else {
              console.error(`❌ Error: ${error.message}\n`);
              throw error;
            }
          }
        }
      }
    }

    // Verify migration
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Verifying migration...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if library_staff table exists (on shared database or first tenant)
    const checkTable = await corePool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'library_staff'
      )
    `);

    if (checkTable.rows[0].exists) {
      const count = await corePool.query(`SELECT COUNT(*) as count FROM library_staff`);
      console.log(`✅ library_staff table exists: ${count.rows[0].count} records`);
    } else {
      console.log(`⚠️  library_staff table not found in core database (may be in tenant databases)`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Tenant migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await corePool.end();
  }
}

runTenantMigration();

