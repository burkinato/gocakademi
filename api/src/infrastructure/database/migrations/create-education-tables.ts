import { pool } from '../connection.js';

export const up = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create units table
        await client.query(`
            CREATE TABLE IF NOT EXISTS units (
                id SERIAL PRIMARY KEY,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_required BOOLEAN DEFAULT true,
                access_level VARCHAR(20) DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'restricted')),
                estimated_duration INTEGER, -- minutes
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index for course_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_units_course_id ON units(course_id);
        `);

        // Create topics table
        await client.query(`
            CREATE TABLE IF NOT EXISTS topics (
                id SERIAL PRIMARY KEY,
                unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'pdf', 'document', 'link', 'quiz', 'assignment')),
                content_url TEXT,
                external_link TEXT,
                content TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_required BOOLEAN DEFAULT true,
                access_level VARCHAR(20) DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'restricted')),
                duration INTEGER, -- minutes
                file_size BIGINT, -- bytes
                mime_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index for unit_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON topics(unit_id);
        `);

        // Create assessments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assessments (
                id SERIAL PRIMARY KEY,
                unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_required BOOLEAN DEFAULT true,
                passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
                time_limit INTEGER, -- minutes, NULL means no limit
                max_attempts INTEGER, -- NULL means unlimited
                show_correct_answers BOOLEAN DEFAULT false,
                shuffle_questions BOOLEAN DEFAULT false,
                access_level VARCHAR(20) DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'restricted')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index for unit_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_assessments_unit_id ON assessments(unit_id);
        `);

        // Create questions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
                question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank')),
                question_text TEXT NOT NULL,
                points INTEGER DEFAULT 1 CHECK (points > 0),
                order_index INTEGER NOT NULL DEFAULT 0,
                options JSONB, -- For multiple choice, matching, etc.
                correct_answer JSONB, -- Depends on question type
                explanation TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index for assessment_id
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
        `);

        await client.query('COMMIT');
        console.log('✅ Education tables created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating education tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const down = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Drop tables in reverse order (respecting foreign key constraints)
        await client.query('DROP TABLE IF EXISTS questions CASCADE;');
        await client.query('DROP TABLE IF EXISTS assessments CASCADE;');
        await client.query('DROP TABLE IF EXISTS topics CASCADE;');
        await client.query('DROP TABLE IF EXISTS units CASCADE;');

        await client.query('COMMIT');
        console.log('✅ Education tables dropped successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error dropping education tables:', error);
        throw error;
    } finally {
        client.release();
    }
};
