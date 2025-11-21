import { pool } from '../connection.js';

async function runMigration() {
    console.log('🔄 Running migration: Add all remaining user fields...');

    try {
        // Add social/contact columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_email VARCHAR(255)`);
        console.log('✅ Added secondary_email column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500)`);
        console.log('✅ Added website column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500)`);
        console.log('✅ Added linkedin column');

        // Add preferences columns
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT false`);
        console.log('✅ Added newsletter_enabled column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT false`);
        console.log('✅ Added sms_notifications_enabled column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false`);
        console.log('✅ Added marketing_opt_in column');

        // Add notes column
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT`);
        console.log('✅ Added notes column');

        // Add phone numbers and emergency contacts as JSONB
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS additional_phones JSONB DEFAULT '[]'::jsonb`);
        console.log('✅ Added additional_phones column');

        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb`);
        console.log('✅ Added emergency_contacts column');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
