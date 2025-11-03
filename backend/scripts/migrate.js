// ============================================
// DATABASE MIGRATION SCRIPT
// Run database migrations
// ============================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.CORE_DB_HOST || 'localhost',
  port: parseInt(process.env.CORE_DB_PORT || '5432'),
  database: process.env.CORE_DB_NAME || 'studyspot_core',
  user: process.env.CORE_DB_USER || 'postgres',
  password: process.env.CORE_DB_PASSWORD || '',
});

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');
  
  try {
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await pool.query(sql);
      console.log(`✅ ${file} completed\n`);
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

