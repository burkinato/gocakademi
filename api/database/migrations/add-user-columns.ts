import { pool } from '../connection.js';

async function runMigration() {
    console.log('🔄 Running migration: Add missing user columns...');

    try {
        // Add contact information columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
        console.log('✅ Added phone column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`);
        console.log('✅ Added address column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
        console.log('✅ Added city column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)`);
        console.log('✅ Added state column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)`);
        console.log('✅ Added country column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)`);
        console.log('✅ Added postal_code column');

        // Add profile information columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
        console.log('✅ Added date_of_birth column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500)`);
        console.log('✅ Added profile_image_url column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
        console.log('✅ Added bio column');

        // Add verification columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false`);
        console.log('✅ Added phone_verified column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP`);
        console.log('✅ Added phone_verified_at column');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
