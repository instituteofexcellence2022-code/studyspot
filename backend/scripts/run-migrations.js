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
    
    // Check user_type column
    const userTypeCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admin_users' 
      AND column_name = 'user_type'
    `);
    
    if (userTypeCheck.rows.length > 0) {
      console.log('✅ user_type column exists in admin_users');
    } else {
      console.log('❌ user_type column NOT found in admin_users');
    }

    // Check user_type distribution
    const userTypeDist = await pool.query(`
      SELECT user_type, COUNT(*) as count 
      FROM admin_users 
      GROUP BY user_type
    `);
    
    console.log('\n📊 User Type Distribution:');
    userTypeDist.rows.forEach(row => {
      console.log(`   ${row.user_type || 'NULL'}: ${row.count}`);
    });

    // Check tenants with owner_id
    const tenantsWithOwner = await pool.query(`
      SELECT COUNT(*) as count 
      FROM tenants 
      WHERE owner_id IS NOT NULL
    `);
    
    console.log(`\n📊 Tenants with owner_id: ${tenantsWithOwner.rows[0].count}`);

    // Check for issues
    const issues = await pool.query(`
      SELECT COUNT(*) as count 
      FROM admin_users 
      WHERE user_type IS NULL
    `);
    
    if (issues.rows[0].count > 0) {
      console.log(`\n⚠️  Warning: ${issues.rows[0].count} users without user_type`);
    } else {
      console.log('\n✅ All users have user_type set');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

