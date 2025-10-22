// Test PostgreSQL Connection
// This will help diagnose connection issues

const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing PostgreSQL Connection...\n');

// Test configuration
const testConnection = async () => {
  console.log('📋 Configuration Check:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ ERROR: DATABASE_URL not found in .env file');
    console.log('\n💡 Fix: Add this to api/.env:');
    console.log('DATABASE_URL=postgresql://your-connection-string-here');
    process.exit(1);
  }

  // Parse connection string (hide password)
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlParts) {
    console.log(`✅ User: ${urlParts[1]}`);
    console.log(`✅ Password: ${'*'.repeat(urlParts[2].length)} (hidden)`);
    console.log(`✅ Host: ${urlParts[3]}`);
    console.log(`✅ Port: ${urlParts[4]}`);
    console.log(`✅ Database: ${urlParts[5]}`);
  } else {
    console.log('⚠️  Connection string format looks unusual');
    console.log(`   Format: ${dbUrl.substring(0, 30)}...`);
  }

  console.log('\n🔌 Attempting Connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false // Accept Supabase SSL certificate
    }
  });

  try {
    // Test query
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    const duration = Date.now() - start;

    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('📊 Connection Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Response Time: ${duration}ms`);
    console.log(`🕐 Server Time: ${result.rows[0].current_time}`);
    console.log(`📦 PostgreSQL Version: ${result.rows[0].postgres_version.split(' ')[0]}`);
    
    // Test write capability
    console.log('\n🧪 Testing Write Capability...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_time TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Can create tables');

    await pool.query('INSERT INTO connection_test DEFAULT VALUES');
    console.log('✅ Can insert data');

    const countResult = await pool.query('SELECT COUNT(*) as count FROM connection_test');
    console.log(`✅ Can read data (${countResult.rows[0].count} test records)`);

    await pool.query('DROP TABLE connection_test');
    console.log('✅ Can delete tables');

    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Your PostgreSQL connection is working perfectly!');
    console.log('✅ Ready to run migrations and use in production!');

  } catch (error) {
    console.log('\n❌ CONNECTION FAILED!\n');
    console.log('📋 Error Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Error Type: ${error.code || 'UNKNOWN'}`);
    console.log(`Message: ${error.message}`);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (error.code === 'ENOTFOUND') {
      console.log('❌ Cannot find database server');
      console.log('💡 Check your DATABASE_URL hostname');
      console.log('💡 Make sure you\'re connected to the internet');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused by server');
      console.log('💡 Check the port number (should be 6543 for Supabase pooler)');
      console.log('💡 Check firewall settings');
    } else if (error.message.includes('password')) {
      console.log('❌ Authentication failed');
      console.log('💡 Check your database password');
      console.log('💡 Make sure special characters are URL-encoded');
      console.log('💡 Get a new connection string from Supabase dashboard');
    } else if (error.message.includes('SSL')) {
      console.log('❌ SSL/TLS error');
      console.log('💡 Supabase requires SSL connections');
      console.log('💡 The test script handles this automatically');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout');
      console.log('💡 Check your internet connection');
      console.log('💡 Try a different network');
      console.log('💡 Check if your ISP/firewall blocks port 6543');
    } else {
      console.log('❌ Unknown error');
      console.log('💡 Full error:', error);
    }

    console.log('\n📞 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Copy the error message above');
    console.log('2. Share it with me');
    console.log('3. I\'ll help you fix it!');

  } finally {
    await pool.end();
    console.log('\n👋 Test complete. Connection closed.\n');
  }
};

// Run the test
testConnection().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

