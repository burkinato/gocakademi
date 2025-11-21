import { pool } from '../connection.js';

async function runMigration() {
    console.log('🔄 Running migration: Add extended user fields...');

    try {
        // Add job-related columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100)`);
        console.log('✅ Added job_title column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(200)`);
        console.log('✅ Added company column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS industry VARCHAR(100)`);
        console.log('✅ Added industry column');

        // Add detailed address columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS street VARCHAR(200)`);
        console.log('✅ Added street column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100)`);
        console.log('✅ Added neighborhood column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100)`);
        console.log('✅ Added district column');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
