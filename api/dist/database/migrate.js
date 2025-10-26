/**
 * 🎓 STUDYSPOT - Database Migration Script
 * Runs the schema.sql file to set up the database
 */

require('dotenv').config({
  path: require('path').join(__dirname, '../../.env.production')
});
const fs = require('fs');
const path = require('path');
const {
  Pool
} = require('pg');
const {
  logger
} = require('../utils/logger');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'studyspot_db',
  user: process.env.DB_USER || 'studyspot',
  password: process.env.DB_PASSWORD || 'studyspot123',
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('supabase') ? {
    rejectUnauthorized: false
  } : false
});
async function runMigration() {
  const client = await pool.connect();
  try {
    logger.info('========================================');
    logger.info('🚀 Starting Database Migration');
    logger.info('========================================');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    logger.info('📄 Running schema.sql...');

    // Execute schema
    await client.query(schema);
    logger.info('✅ Schema created successfully!');
    logger.info('========================================');
    logger.info('📊 Database Tables Created:');
    logger.info('   ✓ tenants');
    logger.info('   ✓ users');
    logger.info('   ✓ libraries');
    logger.info('   ✓ seats');
    logger.info('   ✓ bookings');
    logger.info('   ✓ reviews');
    logger.info('   ✓ transactions');
    logger.info('   ✓ user_gamification');
    logger.info('   ✓ badges');
    logger.info('   ✓ user_badges');
    logger.info('   ✓ rewards');
    logger.info('   ✓ user_rewards');
    logger.info('   ✓ user_preferences');
    logger.info('   ✓ library_analytics');
    logger.info('   ✓ chatbot_conversations');
    logger.info('   ✓ notifications');
    logger.info('========================================');
    logger.info('🎉 Migration Completed Successfully!');
    logger.info('========================================');
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    logger.error('Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => {
    logger.info('✅ Done!');
    process.exit(0);
  }).catch(error => {
    logger.error('❌ Failed:', error);
    process.exit(1);
  });
}
module.exports = {
  runMigration
};