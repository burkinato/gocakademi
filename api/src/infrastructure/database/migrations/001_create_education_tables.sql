-- Migration: Create Education Tables
-- Description: Creates tables for units, topics, assessments, and questions
-- Created: 2025-11-21

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'restricted')),
    estimated_duration INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_units_course_id ON units(course_id);
CREATE INDEX IF NOT EXISTS idx_units_order ON units(course_id, order_index);

-- Create topics table
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
    duration INTEGER, -- in minutes
    file_size BIGINT, -- in bytes
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON topics(unit_id);
CREATE INDEX IF NOT EXISTS idx_topics_order ON topics(unit_id, order_index);
CREATE INDEX IF NOT EXISTS idx_topics_content_type ON topics(content_type);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit INTEGER, -- in minutes
    max_attempts INTEGER DEFAULT 3,
    show_correct_answers BOOLEAN DEFAULT false,
    shuffle_questions BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'free' CHECK (access_level IN ('free', 'premium', 'restricted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessments_unit_id ON assessments(unit_id);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank')),
    options JSONB, -- for multiple choice, matching, etc.
    correct_answer JSONB NOT NULL,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(assessment_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_units_updated_at ON units;
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE units IS 'Course units/modules containing topics and assessments';
COMMENT ON TABLE topics IS 'Individual learning topics with various content types';
COMMENT ON TABLE assessments IS 'Quizzes and exams for testing student knowledge';
COMMENT ON TABLE questions IS 'Questions belonging to assessments';

COMMENT ON COLUMN topics.content_type IS 'Type of content: video, pdf, document, link, quiz, assignment';
COMMENT ON COLUMN questions.question_type IS 'Type of question: multiple_choice, true_false, short_answer, essay, matching, fill_blank';
COMMENT ON COLUMN questions.options IS 'JSON array of options for multiple choice, matching, etc.';
COMMENT ON COLUMN questions.correct_answer IS 'JSON representation of correct answer(s)';
