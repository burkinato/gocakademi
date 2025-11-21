#!/usr/bin/env node

/**
 * Generate Secure Keys for Environment Variables
 * Usage: node generate-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Keys...\n');
console.log('='.repeat(80));

// Generate JWT Secret (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET:');
console.log(jwtSecret);

// Generate Encryption Key (64 bytes = 128 hex characters)
const encryptionKey = crypto.randomBytes(64).toString('hex');
console.log('\n🔒 ENCRYPTION_KEY:');
console.log(encryptionKey);

// Generate Refresh Token Secret (64 bytes)
const refreshSecret = crypto.randomBytes(64).toString('hex');
console.log('\n🔄 REFRESH_TOKEN_SECRET (optional):');
console.log(refreshSecret);

console.log('\n' + '='.repeat(80));
console.log('\n✅ Keys generated successfully!');
console.log('\n📋 Copy these values to your .env.local file');
console.log('⚠️  IMPORTANT: Keep these keys secret and never commit them to git!\n');

// Generate a sample .env.local content
console.log('📄 Sample .env.local content:\n');
console.log('# JWT Configuration');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('JWT_EXPIRES_IN=24h');
console.log('');
console.log('# Encryption Configuration');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('');
console.log('# Refresh Token Configuration (optional)');
console.log(`REFRESH_TOKEN_SECRET=${refreshSecret}`);
console.log('REFRESH_TOKEN_EXPIRES_IN=7d');
console.log('');
