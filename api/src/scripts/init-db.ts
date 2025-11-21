import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from '../config/env.js';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createDatabaseIfNotExists = async () => {
    const pool = new Pool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: 'postgres', // Connect to default postgres db
    });

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = '${env.DB_NAME}'`
        );

        if (result.rowCount === 0) {
            console.log(`Database ${env.DB_NAME} does not exist. Creating...`);
            await client.query(`CREATE DATABASE "${env.DB_NAME}"`);
            console.log(`Database ${env.DB_NAME} created successfully.`);
        } else {
            console.log(`Database ${env.DB_NAME} already exists.`);
        }
        client.release();
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

const runSchema = async () => {
    const pool = new Pool({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const extPath = path.join(__dirname, '../database/schema_extensions.sql');
        const extensions = fs.readFileSync(extPath, 'utf8');

        console.log('Running schema.sql...');
        try {
          await pool.query(schema);
        } catch (e) {
          console.warn('Schema.sql execution encountered issues, continuing:', (e as any)?.message);
        }
        try {
          await pool.query(extensions);
        } catch (e) {
          console.warn('Schema_extensions.sql execution encountered issues, continuing:', (e as any)?.message);
        }
        console.log('Database initialization step completed. Proceeding to seed...');

        // Ensure roles tables exist
        await pool.query(`
          CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            permissions JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_roles (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, role_id)
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_sessions (
            session_id VARCHAR(100) PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            revoked_at TIMESTAMP
          );
        `);

        // Seed roles
        console.log('Seeding roles and admin user...');
        await pool.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`);
        await pool.query(`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
        const adminRoleRes = await pool.query(
          `INSERT INTO roles (name, permissions)
           VALUES ($1, $2)
           ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions
           RETURNING id`,
          ['admin', JSON.stringify(['*'])]
        );
        const adminRoleId = adminRoleRes.rows[0].id;

        // Create admin_test user if not exists
        const adminEmail = 'admin@test.com';
        const adminUsername = 'admin_test';
        const adminPasswordHash = await bcrypt.hash('Test123!', 10);

        const userRes = await pool.query(
          `INSERT INTO users (email, password, first_name, last_name, role, is_active)
           VALUES ($1, $2, $3, $4, 'admin', true)
           ON CONFLICT (email) DO NOTHING
           RETURNING id`,
          [adminEmail, adminPasswordHash, 'Admin', 'Test']
        );
        // best-effort optional updates
        try { await pool.query('UPDATE users SET username = $1 WHERE email = $2', [adminUsername, adminEmail]); } catch {}
        try { await pool.query('UPDATE users SET password_hash = password WHERE email = $1', [adminEmail]); } catch {}
        try { await pool.query('UPDATE users SET email_verified = true WHERE email = $1', [adminEmail]); } catch {}
        const adminUserId = userRes.rows[0]?.id;

        if (adminUserId) {
          await pool.query(
            `INSERT INTO user_roles (user_id, role_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [adminUserId, adminRoleId]
          );
        } else {
          // Ensure relation exists if user already present
          const existingUserRes = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
          const existingUserId = existingUserRes.rows[0]?.id;
          if (existingUserId) {
            await pool.query(
              `INSERT INTO user_roles (user_id, role_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [existingUserId, adminRoleId]
            );
          }
        }
    } catch (error) {
        console.error('Error running schema:', error);
    } finally {
        await pool.end();
    }
};

const init = async () => {
    await createDatabaseIfNotExists();
    await runSchema();
};

init();
