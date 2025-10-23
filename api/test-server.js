// Simple test to see what error is happening
console.log('Testing server startup...\n');

try {
  console.log('Loading index-unified.js...');
  require('./src/index-unified.js');
  console.log('✅ Server loaded successfully!');
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('\nFull error:');
  console.error(error);
  process.exit(1);
}








