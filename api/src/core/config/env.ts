import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root (../../../../.env relative to this file)
config({ path: join(__dirname, '../../../../.env') });
config({ path: join(__dirname, '../../../../.env.local') });

const isProduction = process.env.NODE_ENV === 'production';

// Helper function to get env variable with production validation
function getEnvVar(key: string, defaultValue: string, isSecret: boolean = false): string {
  const value = process.env[key];

  if (!value && isProduction && isSecret) {
    console.error(`❌ CRITICAL: ${key} is not set in production environment!`);
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (!value && isSecret) {
    console.warn(`⚠️  WARNING: ${key} is using default value. This is NOT safe for production!`);
  }

  return value || defaultValue;
}

export const env = {
  // Database
  DB_HOST: getEnvVar('DB_HOST', 'localhost', false),
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: getEnvVar('DB_NAME', 'academy_db', false),
  DB_USER: getEnvVar('DB_USER', 'postgres', false),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', 'CBIsil123$$', true), // SECRET

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your_jwt_secret_key_here', true), // SECRET
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your_jwt_refresh_secret_key_here', true), // SECRET
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Server
  PORT: parseInt(process.env.PORT || '3001'),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Admin
  ADMIN_EMAIL: getEnvVar('ADMIN_EMAIL', 'admin@platform.com', true), // SECRET
  ADMIN_PASSWORD: getEnvVar('ADMIN_PASSWORD', 'admin123', true), // SECRET

  // Client
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Log environment status on startup
if (!isProduction) {
  console.log('🔧 Running in development mode');
  console.log('📝 Make sure to set proper environment variables before deploying to production!');
}

export default env;
