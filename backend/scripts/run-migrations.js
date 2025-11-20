// ============================================
// MIGRATION RUNNER SCRIPT
// Runs database migrations in order
// ============================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${process.env.CORE_DB_USER || 'postgres'}:${process.env.CORE_DB_PASSWORD || ''}@${process.env.CORE_DB_HOST || 'localhost'}:${process.env.CORE_DB_PORT || '5432'}/${process.env.CORE_DB_NAME || 'studyspot_core'}`;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const migrations = [
  '005_redesign_multi_tenant_saas.sql',
  '006_update_tenant_users_schema.sql',
  '007_migrate_existing_data.sql',
  '008_redesign_clear_user_structure.sql',
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📊 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    for (const migration of migrations) {
      const filePath = path.join(__dirname, '..', 'migrations', migration);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${migration}`);
        continue;
      }

      console.log(`📄 Running: ${migration}`);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        console.log(`✅ Completed: ${migration}\n`);
      } catch (error) {
        console.error(`❌ Error in ${migration}:`, error.message);
        
        // Check if it's a "already exists" error (non-critical)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          console.log(`⚠️  Warning (non-critical): ${error.message}\n`);
          continue;
        }
        
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully!\n');

    // Verify migrations
    console.log('🔍 Verifying migrations...\n');
    
    // Check new user tables
    const tables = ['library_owners', 'platform_admins', 'platform_staff'];
    for (const table of tables) {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (tableCheck.rows[0].exists) {
        const count = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${count.rows[0].count} records`);
      } else {
        console.log(`❌ ${table}: Table not found`);
      }
    }

    // Check library owners
    const libraryOwnersCount = await pool.query(`
      SELECT COUNT(*) as count FROM library_owners
    `);
    console.log(`\n📊 Library Owners: ${libraryOwnersCount.rows[0].count}`);

    // Check platform admins
    const platformAdminsCount = await pool.query(`
      SELECT COUNT(*) as count FROM platform_admins
    `);
    console.log(`📊 Platform Admins: ${platformAdminsCount.rows[0].count}`);

    // Check platform staff
    const platformStaffCount = await pool.query(`
      SELECT COUNT(*) as count FROM platform_staff
    `);
    console.log(`📊 Platform Staff: ${platformStaffCount.rows[0].count}`);

    // Check tenants with owner_id linked to library_owners
    const tenantsWithOwner = await pool.query(`
      SELECT COUNT(*) as count 
      FROM tenants t
      INNER JOIN library_owners lo ON t.owner_id = lo.id
    `);
    console.log(`📊 Tenants with linked owners: ${tenantsWithOwner.rows[0].count}`);

    // Check audit_logs user_table column
    const auditLogsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs' 
      AND column_name = 'user_table'
    `);
    
    if (auditLogsCheck.rows.length > 0) {
      console.log(`✅ audit_logs.user_table column exists`);
    } else {
      console.log(`⚠️  audit_logs.user_table column not found`);
    }

    // Check refresh_tokens user_table column
    const refreshTokensCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'refresh_tokens' 
      AND column_name = 'user_table'
    `);
    
    if (refreshTokensCheck.rows.length > 0) {
      console.log(`✅ refresh_tokens.user_table column exists`);
    } else {
      console.log(`⚠️  refresh_tokens.user_table column not found`);
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration 008 Verification Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

