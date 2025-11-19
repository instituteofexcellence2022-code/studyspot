const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.CORE_DB_HOST,
  port: parseInt(process.env.CORE_DB_PORT || '5432'),
  database: process.env.CORE_DB_NAME,
  user: process.env.CORE_DB_USER,
  password: process.env.CORE_DB_PASSWORD,
  ssl: process.env.CORE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 20000,
});

console.log('╔════════════════════════════════════════════════╗');
console.log('║  SUPABASE DATABASE CONNECTION TEST             ║');
console.log('╚════════════════════════════════════════════════╝');
console.log('');

async function testConnection() {
  try {
    console.log('📋 Configuration:');
    console.log('   Host:', process.env.CORE_DB_HOST || '❌ NOT SET');
    console.log('   Port:', process.env.CORE_DB_PORT || '5432');
    console.log('   Database:', process.env.CORE_DB_NAME || '❌ NOT SET');
    console.log('   User:', process.env.CORE_DB_USER || '❌ NOT SET');
    console.log('   Password:', process.env.CORE_DB_PASSWORD ? '****' + process.env.CORE_DB_PASSWORD.slice(-4) : '❌ NOT SET');
    console.log('   SSL:', process.env.CORE_DB_SSL || 'false');
    console.log('');
    
    if (!process.env.CORE_DB_HOST || !process.env.CORE_DB_USER || !process.env.CORE_DB_PASSWORD) {
      console.error('❌ ERROR: Missing required environment variables!');
      console.error('');
      console.error('Please set these in backend/.env:');
      console.error('   CORE_DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com');
      console.error('   CORE_DB_USER=postgres.xxxxxxxxxxxxxxxxxx');
      console.error('   CORE_DB_PASSWORD=your-password');
      console.error('   CORE_DB_NAME=postgres');
      console.error('   CORE_DB_SSL=true');
      console.error('');
      process.exit(1);
    }
    
    console.log('⏳ Connecting to database...');
    const startTime = Date.now();
    
    const client = await pool.connect();
    const connectTime = Date.now() - startTime;
    
    console.log(`✅ Connected successfully in ${connectTime}ms!`);
    console.log('');
    
    console.log('⏳ Testing query...');
    const queryStart = Date.now();
    const result = await client.query('SELECT NOW(), version()');
    const queryTime = Date.now() - queryStart;
    
    console.log(`✅ Query executed in ${queryTime}ms`);
    console.log('');
    console.log('📊 Database Info:');
    console.log('   Current Time:', result.rows[0].now);
    console.log('   Version:', result.rows[0].version.split(' ').slice(0, 2).join(' '));
    console.log('');
    
    // Test admin_users table
    console.log('⏳ Checking admin_users table...');
    try {
      const tableCheck = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'admin_users'
      `);
      
      if (tableCheck.rows[0].count > 0) {
        const userCount = await client.query('SELECT COUNT(*) as count FROM admin_users');
        console.log(`✅ admin_users table exists (${userCount.rows[0].count} users)`);
      } else {
        console.log('⚠️  admin_users table does not exist - run migrations!');
      }
    } catch (tableError) {
      console.log('⚠️  Could not check admin_users table:', tableError.message);
    }
    
    console.log('');
    client.release();
    await pool.end();
    
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  ✅ CONNECTION TEST PASSED!                    ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('Your database credentials are correct.');
    console.log('You can now use these same values in Render.');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  ❌ CONNECTION TEST FAILED!                    ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('password authentication failed')) {
      console.error('🔑 SOLUTION: Wrong password!');
      console.error('');
      console.error('1. Go to Supabase Dashboard');
      console.error('2. Project Settings → Database');
      console.error('3. Reset your database password');
      console.error('4. Update CORE_DB_PASSWORD in .env');
      console.error('');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('⏰ SOLUTION: Connection timeout!');
      console.error('');
      console.error('1. Check if Supabase project is active');
      console.error('2. Check your internet connection');
      console.error('3. Use pooler URL (not direct)');
      console.error('   ✅ aws-0-ap-southeast-1.pooler.supabase.com');
      console.error('   ❌ db.xxxxxxxxxxxxxxxxxx.supabase.co');
      console.error('');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 SOLUTION: Host not found!');
      console.error('');
      console.error('1. Check CORE_DB_HOST in .env');
      console.error('2. Get correct host from Supabase:');
      console.error('   Project Settings → Database → Connection string');
      console.error('3. Use the POOLER URL (with "pooler" in the name)');
      console.error('');
    } else {
      console.error('🔍 Error details:');
      console.error(error);
      console.error('');
    }
    
    process.exit(1);
  }
}

testConnection();


