-- Schema Extensions for Admin Panel and User Management System
-- This file contains additional tables for RBAC, activity logging, and student management

-- ============================================================================
-- PERMISSIONS & RBAC SYSTEM
-- ============================================================================

-- Permissions table - defines all available permissions in the system
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- e.g., 'users', 'courses', 'students'
    action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions - maps permissions to roles
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- User permissions - allows custom permissions for specific users
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true, -- true = granted, false = revoked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, permission_id)
);

-- ============================================================================
-- ACTIVITY LOGGING SYSTEM
-- ============================================================================

-- Activity logs - tracks all user actions in the system
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'user.create', 'course.update', 'login.success'
    resource_type VARCHAR(50), -- e.g., 'user', 'course', 'student'
    resource_id INTEGER, -- ID of the affected resource
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    details JSONB, -- Additional details about the action
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login attempts - tracks login attempts for brute-force protection
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(100), -- e.g., 'invalid_password', 'user_not_found'
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUTHENTICATION & SECURITY
-- ============================================================================

-- Refresh tokens - manages JWT refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- ============================================================================
-- STUDENT MANAGEMENT SYSTEM
-- ============================================================================

-- Student profiles - extended information for students
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    
    -- Contact information
    phone VARCHAR(20),
    secondary_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Emergency contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Academic information
    enrollment_date DATE,
    expected_graduation_date DATE,
    current_level VARCHAR(50), -- e.g., 'beginner', 'intermediate', 'advanced'
    gpa DECIMAL(3,2),
    
    -- Additional information
    bio TEXT,
    profile_image_url VARCHAR(500),
    notes TEXT, -- Admin notes
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student documents - stores references to student documents
CREATE TABLE IF NOT EXISTS student_documents (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- e.g., 'id_card', 'transcript', 'certificate'
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Extended enrollment information
CREATE TABLE IF NOT EXISTS enrollment_details (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    grade DECIMAL(5,2), -- Final grade
    attendance_percentage DECIMAL(5,2),
    assignments_completed INTEGER DEFAULT 0,
    assignments_total INTEGER DEFAULT 0,
    quiz_scores JSONB, -- Array of quiz scores
    notes TEXT, -- Instructor notes
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructor-Student relationships
CREATE TABLE IF NOT EXISTS instructor_students (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instructor_id, student_id, course_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- Login attempts indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted ON login_attempts(attempted_at);

-- Refresh tokens indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Student profiles indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_number ON student_profiles(student_number);
CREATE INDEX IF NOT EXISTS idx_student_profiles_enrollment_date ON student_profiles(enrollment_date);

-- Student documents indexes
CREATE INDEX IF NOT EXISTS idx_student_documents_student ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents(document_type);

-- Enrollment details indexes
CREATE INDEX IF NOT EXISTS idx_enrollment_details_enrollment ON enrollment_details(enrollment_id);

-- Instructor-Student indexes
CREATE INDEX IF NOT EXISTS idx_instructor_students_instructor ON instructor_students(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_students_student ON instructor_students(student_id);
CREATE INDEX IF NOT EXISTS idx_instructor_students_course ON instructor_students(course_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for student_profiles updated_at
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for enrollment_details updated_at
CREATE TRIGGER update_enrollment_details_updated_at BEFORE UPDATE ON enrollment_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - DEFAULT PERMISSIONS
-- ============================================================================

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
    -- User management permissions
    ('users.create', 'Create new users', 'users', 'create'),
    ('users.read', 'View user information', 'users', 'read'),
    ('users.update', 'Update user information', 'users', 'update'),
    ('users.delete', 'Delete users', 'users', 'delete'),
    ('users.manage_roles', 'Change user roles', 'users', 'manage_roles'),
    ('users.manage_permissions', 'Manage user permissions', 'users', 'manage_permissions'),
    
    -- Course management permissions
    ('courses.create', 'Create new courses', 'courses', 'create'),
    ('courses.read', 'View course information', 'courses', 'read'),
    ('courses.update', 'Update course information', 'courses', 'update'),
    ('courses.delete', 'Delete courses', 'courses', 'delete'),
    ('courses.publish', 'Publish/unpublish courses', 'courses', 'publish'),
    
    -- Student management permissions
    ('students.create', 'Create student profiles', 'students', 'create'),
    ('students.read', 'View student information', 'students', 'read'),
    ('students.update', 'Update student information', 'students', 'update'),
    ('students.delete', 'Delete student profiles', 'students', 'delete'),
    ('students.manage_documents', 'Manage student documents', 'students', 'manage_documents'),
    ('students.view_progress', 'View student progress', 'students', 'view_progress'),
    
    -- Enrollment permissions
    ('enrollments.create', 'Enroll students in courses', 'enrollments', 'create'),
    ('enrollments.read', 'View enrollment information', 'enrollments', 'read'),
    ('enrollments.update', 'Update enrollment information', 'enrollments', 'update'),
    ('enrollments.delete', 'Remove student enrollments', 'enrollments', 'delete'),
    
    -- Activity log permissions
    ('activity_logs.read', 'View activity logs', 'activity_logs', 'read'),
    ('activity_logs.export', 'Export activity logs', 'activity_logs', 'export')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign limited permissions to instructor role
INSERT INTO role_permissions (role, permission_id)
SELECT 'instructor', id FROM permissions 
WHERE name IN (
    'courses.read', 'courses.update',
    'students.read', 'students.update', 'students.view_progress',
    'enrollments.read', 'enrollments.update'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Assign minimal permissions to student role
INSERT INTO role_permissions (role, permission_id)
SELECT 'student', id FROM permissions 
WHERE name IN ('courses.read', 'enrollments.read')
ON CONFLICT (role, permission_id) DO NOTHING;
