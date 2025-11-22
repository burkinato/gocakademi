import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root (../../../../.env relative)
dotenv.config({ path: join(__dirname, '../../../../.env') });
dotenv.config({ path: join(__dirname, '../../../../.env.local') });

const { Pool } = pg;

// Database connection pool
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gocakademi',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let schemaEnsured = false;
let userColumnsEnsured = false;

const ensurePatchMigrations = async () => {
  if (schemaEnsured) return;
  try {
    await pool.query(`ALTER TABLE IF EXISTS lessons ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`);
    schemaEnsured = true;
  } catch (err) {
    console.warn('⚠️  Failed to ensure lessons metadata column:', err);
  }
};

export const ensureUserExtendedColumns = async () => {
  if (userColumnsEnsured) return;
  const statements = [
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS state VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS country VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS bio TEXT`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS company VARCHAR(200)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS industry VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS street VARCHAR(200)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS district VARCHAR(100)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS website VARCHAR(500)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500)`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS notes TEXT`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS additional_phones JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb`,
  ];

  try {
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    userColumnsEnsured = true;
  } catch (err) {
    console.warn('⚠️  Failed to ensure extended user columns:', err);
  }
};

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Database connected');
  ensurePatchMigrations();
  ensureUserExtendedColumns();
});

pool.on('error', (err) => {
  console.error('✗ Database connection error:', err.message);
  console.warn('⚠️  Backend will continue running, but database operations will fail');
  console.warn('⚠️  To fix: ensure PostgreSQL is running and .env is configured correctly');
});

// Convenience helper to keep existing repository imports working
export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
