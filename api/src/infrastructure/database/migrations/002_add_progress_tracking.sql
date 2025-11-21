-- Migration: Add Progress Tracking
-- Description: Creates tables for tracking student progress and enrollment
-- Created: 2025-11-21

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);

-- Create student_topic_progress table
CREATE TABLE IF NOT EXISTS student_topic_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    watched_duration INTEGER DEFAULT 0, -- in seconds
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_progress_user ON student_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic ON student_topic_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_status ON student_topic_progress(status);

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS assessment_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL, -- student's answers
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    time_taken INTEGER, -- in seconds
    attempt_number INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment ON assessment_results(assessment_id);

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(
    p_user_id INTEGER,
    p_course_id INTEGER
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_total_topics INTEGER;
    v_completed_topics INTEGER;
    v_progress DECIMAL(5,2);
BEGIN
    -- Count total required topics
    SELECT COUNT(t.id)
    INTO v_total_topics
    FROM units u
    INNER JOIN topics t ON u.id = t.unit_id AND t.is_required = true
    WHERE u.course_id = p_course_id AND u.is_required = true;
    
    -- If no topics, return 0
    IF v_total_topics = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count completed topics
    SELECT COUNT(DISTINCT stp.topic_id)
    INTO v_completed_topics
    FROM units u
    INNER JOIN topics t ON u.id = t.unit_id AND t.is_required = true
    INNER JOIN student_topic_progress stp ON t.id = stp.topic_id 
        AND stp.user_id = p_user_id 
        AND stp.status = 'completed'
    WHERE u.course_id = p_course_id AND u.is_required = true;
    
    -- Calculate percentage
    v_progress := (v_completed_topics::DECIMAL / v_total_topics::DECIMAL) * 100;
    
    RETURN ROUND(v_progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update course enrollment progress
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_course_id INTEGER;
    v_user_id INTEGER;
    v_progress DECIMAL(5,2);
BEGIN
    -- Determine course_id and user_id based on which table triggered this
    IF TG_TABLE_NAME = 'student_topic_progress' THEN
        SELECT u.course_id INTO v_course_id
        FROM topics t
        JOIN units u ON t.unit_id = u.id
        WHERE t.id = NEW.topic_id;
        v_user_id := NEW.user_id;
    ELSIF TG_TABLE_NAME = 'assessment_results' THEN
        SELECT u.course_id INTO v_course_id
        FROM assessments a
        JOIN units u ON a.unit_id = u.id
        WHERE a.id = NEW.assessment_id;
        v_user_id := NEW.user_id;
    END IF;
    
    -- Calculate and update progress
    v_progress := calculate_course_progress(v_user_id, v_course_id);
    
    UPDATE course_enrollments
    SET 
        completion_percentage = v_progress,
        status = CASE 
            WHEN v_progress >= 100 THEN 'completed'
            ELSE 'active'
        END,
        last_accessed_at = CURRENT_TIMESTAMP
    WHERE user_id = v_user_id AND course_id = v_course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update progress
DROP TRIGGER IF EXISTS update_progress_on_topic_complete ON student_topic_progress;
CREATE TRIGGER update_progress_on_topic_complete
    AFTER INSERT OR UPDATE ON student_topic_progress
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_course_progress();

DROP TRIGGER IF EXISTS update_progress_on_assessment_complete ON assessment_results;
CREATE TRIGGER update_progress_on_assessment_complete
    AFTER INSERT ON assessment_results
    FOR EACH ROW
    EXECUTE FUNCTION update_course_progress();

-- Add comments
COMMENT ON TABLE course_enrollments IS 'Tracks student enrollment and overall progress in courses';
COMMENT ON TABLE student_topic_progress IS 'Tracks student progress on individual topics';
COMMENT ON TABLE assessment_results IS 'Stores results of assessment attempts';

COMMENT ON FUNCTION calculate_course_progress IS 'Calculates completion percentage for a student in a course';
COMMENT ON FUNCTION update_course_progress IS 'Automatically updates course progress when topics/assessments are completed';
