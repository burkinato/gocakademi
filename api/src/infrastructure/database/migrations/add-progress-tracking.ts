import { pool } from '../connection.js';

export const up = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create course_enrollments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
                last_accessed_at TIMESTAMP,
                UNIQUE(user_id, course_id)
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
        `);

        // Create student_topic_progress table
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_topic_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
                watched_duration INTEGER DEFAULT 0, -- seconds for videos
                completed_at TIMESTAMP,
                last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, topic_id)
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_topic_progress_user_id ON student_topic_progress(user_id);
            CREATE INDEX IF NOT EXISTS idx_topic_progress_topic_id ON student_topic_progress(topic_id);
        `);

        // Create assessment_results table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assessment_results (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                total_points INTEGER NOT NULL,
                percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
                passed BOOLEAN NOT NULL,
                attempt_number INTEGER NOT NULL DEFAULT 1,
                answers JSONB NOT NULL,
                started_at TIMESTAMP NOT NULL,
                submitted_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
            CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);
            CREATE INDEX IF NOT EXISTS idx_assessment_results_user_assessment ON assessment_results(user_id, assessment_id);
        `);

        // Create function to update course progress automatically
        await client.query(`
            CREATE OR REPLACE FUNCTION update_course_progress()
            RETURNS TRIGGER AS $$
            DECLARE
                v_course_id INTEGER;
                v_total_required INTEGER;
                v_completed_required INTEGER;
                v_progress_percentage INTEGER;
            BEGIN
                -- Get course_id from topic or assessment
                IF TG_TABLE_NAME = 'student_topic_progress' THEN
                    SELECT u.course_id INTO v_course_id
                    FROM topics t
                    JOIN units u ON t.unit_id = u.id
                    WHERE t.id = NEW.topic_id;
                ELSIF TG_TABLE_NAME = 'assessment_results' THEN
                    SELECT u.course_id INTO v_course_id
                    FROM assessments a
                    JOIN units u ON a.unit_id = u.id
                    WHERE a.id = NEW.assessment_id;
                END IF;

                -- Count total required items
                SELECT 
                    COUNT(DISTINCT t.id) + COUNT(DISTINCT a.id)
                INTO v_total_required
                FROM units u
                LEFT JOIN topics t ON u.id = t.unit_id AND t.is_required = true
                LEFT JOIN assessments a ON u.id = a.unit_id AND a.is_required = true
                WHERE u.course_id = v_course_id AND u.is_required = true;

                -- Count completed required items
                SELECT 
                    COUNT(DISTINCT stp.topic_id) + COUNT(DISTINCT ar.assessment_id)
                INTO v_completed_required
                FROM units u
                LEFT JOIN topics t ON u.id = t.unit_id AND t.is_required = true
                LEFT JOIN student_topic_progress stp ON t.id = stp.topic_id 
                    AND stp.user_id = NEW.user_id AND stp.status = 'completed'
                LEFT JOIN assessments a ON u.id = a.unit_id AND a.is_required = true
                LEFT JOIN LATERAL (
                    SELECT DISTINCT assessment_id
                    FROM assessment_results
                    WHERE user_id = NEW.user_id 
                    AND assessment_id = a.id 
                    AND passed = true
                ) ar ON true
                WHERE u.course_id = v_course_id AND u.is_required = true;

                -- Calculate progress percentage
                IF v_total_required > 0 THEN
                    v_progress_percentage := (v_completed_required * 100) / v_total_required;
                ELSE
                    v_progress_percentage := 0;
                END IF;

                -- Update or insert enrollment record
                INSERT INTO course_enrollments (user_id, course_id, progress_percentage, last_accessed_at)
                VALUES (NEW.user_id, v_course_id, v_progress_percentage, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, course_id)
                DO UPDATE SET 
                    progress_percentage = v_progress_percentage,
                    last_accessed_at = CURRENT_TIMESTAMP,
                    completed_at = CASE 
                        WHEN v_progress_percentage = 100 THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create triggers
        await client.query(`
            DROP TRIGGER IF EXISTS trigger_update_course_progress_topic ON student_topic_progress;
            CREATE TRIGGER trigger_update_course_progress_topic
            AFTER INSERT OR UPDATE ON student_topic_progress
            FOR EACH ROW
            EXECUTE FUNCTION update_course_progress();

            DROP TRIGGER IF EXISTS trigger_update_course_progress_assessment ON assessment_results;
            CREATE TRIGGER trigger_update_course_progress_assessment
            AFTER INSERT ON assessment_results
            FOR EACH ROW
            EXECUTE FUNCTION update_course_progress();
        `);

        await client.query('COMMIT');
        console.log('✅ Progress tracking tables and triggers created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating progress tracking tables:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const down = async (): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Drop triggers
        await client.query('DROP TRIGGER IF EXISTS trigger_update_course_progress_topic ON student_topic_progress;');
        await client.query('DROP TRIGGER IF EXISTS trigger_update_course_progress_assessment ON assessment_results;');

        // Drop function
        await client.query('DROP FUNCTION IF EXISTS update_course_progress();');

        // Drop tables
        await client.query('DROP TABLE IF EXISTS assessment_results CASCADE;');
        await client.query('DROP TABLE IF EXISTS student_topic_progress CASCADE;');
        await client.query('DROP TABLE IF EXISTS course_enrollments CASCADE;');

        await client.query('COMMIT');
        console.log('✅ Progress tracking tables dropped successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error dropping progress tracking tables:', error);
        throw error;
    } finally {
        client.release();
    }
};
