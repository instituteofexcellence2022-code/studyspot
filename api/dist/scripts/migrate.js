const {
  Pool
} = require('pg');
const fs = require('fs');
const path = require('path');
const {
  logger
} = require('../utils/logger');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});
async function runMigrations() {
  const client = await pool.connect();
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationDir).filter(file => file.endsWith('.sql')).sort();

    // Check which migrations have been executed
    const executedMigrations = await client.query('SELECT filename FROM migrations ORDER BY id');
    const executedFilenames = executedMigrations.rows.map(row => row.filename);

    // Run pending migrations
    for (const file of files) {
      if (!executedFilenames.includes(file)) {
        logger.info(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(path.join(migrationDir, file), 'utf8');
        await client.query(migrationSQL);
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
        logger.info(`Migration ${file} completed successfully`);
      } else {
        logger.info(`Migration ${file} already executed, skipping`);
      }
    }
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
async function createMigration() {
  const migrationName = process.argv[2];
  if (!migrationName) {
    logger.error('Please provide a migration name');
    process.exit(1);
  }
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  const filename = `${timestamp}_${migrationName}.sql`;
  const filepath = path.join(__dirname, '../../migrations', filename);
  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here
`;
  fs.writeFileSync(filepath, template);
  logger.info(`Migration file created: ${filename}`);
}
async function rollbackMigration() {
  const client = await pool.connect();
  try {
    // Get the last migration
    const lastMigration = await client.query('SELECT filename FROM migrations ORDER BY id DESC LIMIT 1');
    if (lastMigration.rows.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }
    const filename = lastMigration.rows[0].filename;
    logger.info(`Rolling back migration: ${filename}`);

    // Note: This is a simple rollback - in production, you'd want more sophisticated rollback logic
    await client.query('DELETE FROM migrations WHERE filename = $1', [filename]);
    logger.info(`Migration ${filename} rolled back successfully`);
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
async function showMigrations() {
  const client = await pool.connect();
  try {
    const migrations = await client.query('SELECT * FROM migrations ORDER BY id');
    if (migrations.rows.length === 0) {
      logger.info('No migrations found');
      return;
    }
    logger.info('Executed migrations:');
    migrations.rows.forEach(migration => {
      logger.info(`  ${migration.id}: ${migration.filename} (${migration.executed_at})`);
    });
  } catch (error) {
    logger.error('Failed to show migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}
async function main() {
  const command = process.argv[2];
  try {
    switch (command) {
      case 'up':
        await runMigrations();
        break;
      case 'create':
        await createMigration();
        break;
      case 'rollback':
        await rollbackMigration();
        break;
      case 'status':
        await showMigrations();
        break;
      default:
        logger.info('Usage: node migrate.js [up|create|rollback|status] [migration_name]');
        process.exit(1);
    }
  } catch (error) {
    logger.error('Migration command failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
if (require.main === module) {
  main();
}
module.exports = {
  runMigrations,
  createMigration,
  rollbackMigration,
  showMigrations
};