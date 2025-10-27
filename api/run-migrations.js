// Run Database Migrations
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migrations = [
  '001_initial_schema.sql',
  '002_phase5_advanced_features.sql',
  '003_subscription_system.sql',
  '004_tenant_management.sql',
  '005_rbac_system.sql',
  '006_credit_management.sql',
  '010_fee_plans_system.sql'
];

async function runMigrations() {
  console.log('🚀 Running Database Migrations...\n');
  
  for (const migration of migrations) {
    try {
      console.log(`📄 Running: ${migration}...`);
      const sqlPath = path.join(__dirname, 'migrations', migration);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      await pool.query(sql);
      console.log(`✅ ${migration} - SUCCESS\n`);
    } catch (error) {
      console.log(`❌ ${migration} - FAILED`);
      console.log(`Error: ${error.message}\n`);
      // Continue with other migrations even if one fails
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Migration process complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Check tables created
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Database Tables Created: ${result.rows.length}\n`);
    console.log('Tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
  } catch (error) {
    console.log('Could not list tables:', error.message);
  }
  
  await pool.end();
}

runMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

