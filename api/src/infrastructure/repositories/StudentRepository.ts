import { pool } from '../database/connection.js';
import {
    StudentProfile,
    StudentDocument,
    EnrollmentDetail,
    InstructorStudent,
    PaginationParams,
    PaginatedResponse,
} from '../types/index.js';

export class StudentRepository {
    // ============================================================================
    // STUDENT PROFILE
    // ============================================================================

    async createProfile(profile: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentProfile> {
        const result = await pool.query(
            `INSERT INTO student_profiles (
        user_id, student_number, date_of_birth, gender, nationality,
        phone, secondary_email, address, city, state, country, postal_code,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        enrollment_date, expected_graduation_date, current_level, gpa,
        bio, profile_image_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
            [
                profile.userId,
                profile.studentNumber,
                profile.dateOfBirth,
                profile.gender,
                profile.nationality,
                profile.phone,
                profile.secondaryEmail,
                profile.address,
                profile.city,
                profile.state,
                profile.country,
                profile.postalCode,
                profile.emergencyContactName,
                profile.emergencyContactPhone,
                profile.emergencyContactRelationship,
                profile.enrollmentDate,
                profile.expectedGraduationDate,
                profile.currentLevel,
                profile.gpa,
                profile.bio,
                profile.profileImageUrl,
                profile.notes,
            ]
        );
        return this.mapToStudentProfile(result.rows[0]);
    }

    async updateProfile(id: number, profile: Partial<StudentProfile>): Promise<StudentProfile | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        const fieldMappings: Record<string, string> = {
            studentNumber: 'student_number',
            dateOfBirth: 'date_of_birth',
            gender: 'gender',
            nationality: 'nationality',
            phone: 'phone',
            secondaryEmail: 'secondary_email',
            address: 'address',
            city: 'city',
            state: 'state',
            country: 'country',
            postalCode: 'postal_code',
            emergencyContactName: 'emergency_contact_name',
            emergencyContactPhone: 'emergency_contact_phone',
            emergencyContactRelationship: 'emergency_contact_relationship',
            enrollmentDate: 'enrollment_date',
            expectedGraduationDate: 'expected_graduation_date',
            currentLevel: 'current_level',
            gpa: 'gpa',
            bio: 'bio',
            profileImageUrl: 'profile_image_url',
            notes: 'notes',
        };

        Object.entries(profile).forEach(([key, value]) => {
            if (fieldMappings[key] && value !== undefined) {
                fields.push(`${fieldMappings[key]} = $${paramCount++}`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return this.getProfile(id);
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE student_profiles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows.length > 0 ? this.mapToStudentProfile(result.rows[0]) : null;
    }

    async getProfile(id: number): Promise<StudentProfile | null> {
        const result = await pool.query(
            'SELECT * FROM student_profiles WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToStudentProfile(result.rows[0]) : null;
    }

    async getProfileByUserId(userId: number): Promise<StudentProfile | null> {
        const result = await pool.query(
            'SELECT * FROM student_profiles WHERE user_id = $1',
            [userId]
        );
        return result.rows.length > 0 ? this.mapToStudentProfile(result.rows[0]) : null;
    }

    async getAllProfiles(pagination?: PaginationParams): Promise<PaginatedResponse<StudentProfile>> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 50;
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM student_profiles');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            'SELECT * FROM student_profiles ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        return {
            data: result.rows.map(this.mapToStudentProfile),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteProfile(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM student_profiles WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    // ============================================================================
    // STUDENT DOCUMENTS
    // ============================================================================

    async uploadDocument(document: Omit<StudentDocument, 'id' | 'uploadedAt'>): Promise<StudentDocument> {
        const result = await pool.query(
            `INSERT INTO student_documents (
        student_id, document_type, document_name, file_url, 
        file_size, mime_type, uploaded_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
            [
                document.studentId,
                document.documentType,
                document.documentName,
                document.fileUrl,
                document.fileSize,
                document.mimeType,
                document.uploadedBy,
                document.notes,
            ]
        );
        return this.mapToStudentDocument(result.rows[0]);
    }

    async getDocuments(studentId: number): Promise<StudentDocument[]> {
        const result = await pool.query(
            'SELECT * FROM student_documents WHERE student_id = $1 ORDER BY uploaded_at DESC',
            [studentId]
        );
        return result.rows.map(this.mapToStudentDocument);
    }

    async getDocument(id: number): Promise<StudentDocument | null> {
        const result = await pool.query(
            'SELECT * FROM student_documents WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToStudentDocument(result.rows[0]) : null;
    }

    async deleteDocument(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM student_documents WHERE id = $1',
            [id]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    // ============================================================================
    // ENROLLMENT DETAILS
    // ============================================================================

    async createEnrollmentDetail(detail: Omit<EnrollmentDetail, 'id' | 'updatedAt'>): Promise<EnrollmentDetail> {
        const result = await pool.query(
            `INSERT INTO enrollment_details (
        enrollment_id, grade, attendance_percentage, 
        assignments_completed, assignments_total, quiz_scores,
        notes, certificate_issued, certificate_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
            [
                detail.enrollmentId,
                detail.grade,
                detail.attendancePercentage,
                detail.assignmentsCompleted,
                detail.assignmentsTotal,
                detail.quizScores ? JSON.stringify(detail.quizScores) : null,
                detail.notes,
                detail.certificateIssued,
                detail.certificateUrl,
            ]
        );
        return this.mapToEnrollmentDetail(result.rows[0]);
    }

    async updateEnrollmentDetail(enrollmentId: number, detail: Partial<EnrollmentDetail>): Promise<EnrollmentDetail | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (detail.grade !== undefined) {
            fields.push(`grade = $${paramCount++}`);
            values.push(detail.grade);
        }
        if (detail.attendancePercentage !== undefined) {
            fields.push(`attendance_percentage = $${paramCount++}`);
            values.push(detail.attendancePercentage);
        }
        if (detail.assignmentsCompleted !== undefined) {
            fields.push(`assignments_completed = $${paramCount++}`);
            values.push(detail.assignmentsCompleted);
        }
        if (detail.assignmentsTotal !== undefined) {
            fields.push(`assignments_total = $${paramCount++}`);
            values.push(detail.assignmentsTotal);
        }
        if (detail.quizScores !== undefined) {
            fields.push(`quiz_scores = $${paramCount++}`);
            values.push(JSON.stringify(detail.quizScores));
        }
        if (detail.notes !== undefined) {
            fields.push(`notes = $${paramCount++}`);
            values.push(detail.notes);
        }
        if (detail.certificateIssued !== undefined) {
            fields.push(`certificate_issued = $${paramCount++}`);
            values.push(detail.certificateIssued);
        }
        if (detail.certificateUrl !== undefined) {
            fields.push(`certificate_url = $${paramCount++}`);
            values.push(detail.certificateUrl);
        }

        if (fields.length === 0) {
            return this.getEnrollmentDetail(enrollmentId);
        }

        values.push(enrollmentId);
        const result = await pool.query(
            `UPDATE enrollment_details SET ${fields.join(', ')} WHERE enrollment_id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows.length > 0 ? this.mapToEnrollmentDetail(result.rows[0]) : null;
    }

    async getEnrollmentDetail(enrollmentId: number): Promise<EnrollmentDetail | null> {
        const result = await pool.query(
            'SELECT * FROM enrollment_details WHERE enrollment_id = $1',
            [enrollmentId]
        );
        return result.rows.length > 0 ? this.mapToEnrollmentDetail(result.rows[0]) : null;
    }

    // ============================================================================
    // INSTRUCTOR-STUDENT RELATIONSHIPS
    // ============================================================================

    async assignInstructor(instructorId: number, studentId: number, courseId: number): Promise<InstructorStudent> {
        const result = await pool.query(
            `INSERT INTO instructor_students (instructor_id, student_id, course_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (instructor_id, student_id, course_id) DO UPDATE 
       SET assigned_at = CURRENT_TIMESTAMP
       RETURNING *`,
            [instructorId, studentId, courseId]
        );
        return this.mapToInstructorStudent(result.rows[0]);
    }

    async getInstructorStudents(instructorId: number, courseId?: number): Promise<number[]> {
        let query = 'SELECT DISTINCT student_id FROM instructor_students WHERE instructor_id = $1';
        const params: any[] = [instructorId];

        if (courseId) {
            query += ' AND course_id = $2';
            params.push(courseId);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => row.student_id);
    }

    async getStudentInstructors(studentId: number, courseId?: number): Promise<number[]> {
        let query = 'SELECT DISTINCT instructor_id FROM instructor_students WHERE student_id = $1';
        const params: any[] = [studentId];

        if (courseId) {
            query += ' AND course_id = $2';
            params.push(courseId);
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => row.instructor_id);
    }

    async removeInstructorStudent(instructorId: number, studentId: number, courseId: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM instructor_students WHERE instructor_id = $1 AND student_id = $2 AND course_id = $3',
            [instructorId, studentId, courseId]
        );
        return result.rowCount !== null && result.rowCount > 0;
    }

    // ============================================================================
    // MAPPERS
    // ============================================================================

    private mapToStudentProfile(row: any): StudentProfile {
        return {
            id: row.id,
            userId: row.user_id,
            studentNumber: row.student_number,
            dateOfBirth: row.date_of_birth,
            gender: row.gender,
            nationality: row.nationality,
            phone: row.phone,
            secondaryEmail: row.secondary_email,
            address: row.address,
            city: row.city,
            state: row.state,
            country: row.country,
            postalCode: row.postal_code,
            emergencyContactName: row.emergency_contact_name,
            emergencyContactPhone: row.emergency_contact_phone,
            emergencyContactRelationship: row.emergency_contact_relationship,
            enrollmentDate: row.enrollment_date,
            expectedGraduationDate: row.expected_graduation_date,
            currentLevel: row.current_level,
            gpa: row.gpa,
            bio: row.bio,
            profileImageUrl: row.profile_image_url,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapToStudentDocument(row: any): StudentDocument {
        return {
            id: row.id,
            studentId: row.student_id,
            documentType: row.document_type,
            documentName: row.document_name,
            fileUrl: row.file_url,
            fileSize: row.file_size,
            mimeType: row.mime_type,
            uploadedBy: row.uploaded_by,
            uploadedAt: row.uploaded_at,
            notes: row.notes,
        };
    }

    private mapToEnrollmentDetail(row: any): EnrollmentDetail {
        return {
            id: row.id,
            enrollmentId: row.enrollment_id,
            grade: row.grade,
            attendancePercentage: row.attendance_percentage,
            assignmentsCompleted: row.assignments_completed,
            assignmentsTotal: row.assignments_total,
            quizScores: row.quiz_scores,
            notes: row.notes,
            certificateIssued: row.certificate_issued,
            certificateUrl: row.certificate_url,
            updatedAt: row.updated_at,
        };
    }

    private mapToInstructorStudent(row: any): InstructorStudent {
        return {
            id: row.id,
            instructorId: row.instructor_id,
            studentId: row.student_id,
            courseId: row.course_id,
            assignedAt: row.assigned_at,
        };
    }
}
