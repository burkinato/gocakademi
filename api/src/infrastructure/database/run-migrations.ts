import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration(filename: string) {
    const client = await pool.connect();
    try {
        console.log(`\n📄 Running: ${filename}`);

        const sql = readFileSync(
            join(__dirname, 'migrations', filename),
            'utf-8'
        );

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log(`✓ Completed: ${filename}`);
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(`\n✗ Failed: ${filename}`);
        console.error(`Error: ${error.message}`);
        if (error.detail) console.error(`Detail: ${error.detail}`);
        if (error.hint) console.error(`Hint: ${error.hint}`);
        throw error;
    } finally {
        client.release();
    }
}

async function runAllMigrations() {
    console.log('🚀 Starting database migrations...\n');
    console.log(`Database: ${process.env.DB_NAME || 'gocakademi'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);

    try {
        // Test connection
        console.log('\n🔌 Testing database connection...');
        const testClient = await pool.connect();
        await testClient.query('SELECT NOW()');
        testClient.release();
        console.log('✓ Connection successful');

        // Run migrations
        const migrations = [
            '001_create_education_tables.sql',
            '002_add_progress_tracking.sql'
        ];

        for (const migration of migrations) {
            await runMigration(migration);
        }

        console.log('\n✅ All migrations completed successfully!\n');
        await pool.end();
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Migration failed!');
        console.error(`Error: ${error.message}\n`);
        await pool.end();
        process.exit(1);
    }
}

runAllMigrations();
