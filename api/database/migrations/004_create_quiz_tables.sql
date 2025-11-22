-- Quiz Tables Migration
-- Run this migration to create the quiz system tables

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit INTEGER, -- minutes
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_options BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 70, -- percentage
  show_correct_answers BOOLEAN DEFAULT true,
  allow_retry BOOLEAN DEFAULT true,
  max_attempts INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('multiple-choice', 'multiple-select', 'true-false', 'open-ended', 'fill-blanks')),
  text TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
  media_url TEXT,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz question options table
CREATE TABLE IF NOT EXISTS quiz_question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER, -- percentage
  passed BOOLEAN,
  time_spent INTEGER, -- seconds
  answers JSONB, -- Store user answers as JSON
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  UNIQUE(quiz_id, user_id, started_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_course ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_lesson ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_order ON quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_option_question ON quiz_question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_option_order ON quiz_question_options(question_id, order_index);
CREATE INDEX IF NOT EXISTS idx_attempt_quiz_user ON quiz_attempts(quiz_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_submitted ON quiz_attempts(submitted_at);

-- Add updated_at trigger for quizzes
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quiz_updated_at_trigger
BEFORE UPDATE ON quizzes
FOR EACH ROW
EXECUTE FUNCTION update_quiz_updated_at();

-- Add updated_at trigger for quiz_questions
CREATE TRIGGER quiz_question_updated_at_trigger
BEFORE UPDATE ON quiz_questions
FOR EACH ROW
EXECUTE FUNCTION update_quiz_updated_at();
