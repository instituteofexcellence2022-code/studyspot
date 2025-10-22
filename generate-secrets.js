// Generate Production Secrets
const crypto = require('crypto');

console.log('🔐 Generating Production Secrets...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Generate strong random secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated Secure Secrets:\n');

console.log('JWT_SECRET (for access tokens):');
console.log(jwtSecret);
console.log('');

console.log('JWT_REFRESH_SECRET (for refresh tokens):');
console.log(jwtRefreshSecret);
console.log('');

console.log('ENCRYPTION_KEY (for data encryption):');
console.log(encryptionKey);
console.log('');

console.log('SESSION_SECRET (for sessions):');
console.log(sessionSecret);
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ All secrets generated successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 Copy these values to your .env file');
console.log('🔒 Keep them secure and never commit to Git!\n');

// Also save to a file for easy copying
const fs = require('fs');
const secretsForEnv = `
# Production Secrets - Generated on ${new Date().toISOString()}
# ⚠️ KEEP THESE SECURE! Never commit to Git!

JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
ENCRYPTION_KEY=${encryptionKey}
SESSION_SECRET=${sessionSecret}
`;

fs.writeFileSync('PRODUCTION_SECRETS.txt', secretsForEnv);
console.log('💾 Secrets also saved to: PRODUCTION_SECRETS.txt');
console.log('   (This file is in .gitignore for your safety)\n');

