import { StudentRepository } from '../../infrastructure/repositories/StudentRepository.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import {
    StudentProfile,
    StudentDocument,
    EnrollmentDetail,
    StudentWithProfile,
    PaginationParams,
    PaginatedResponse,
} from '../../core/domain/entities/index.js';

export class StudentService {
    private studentRepo: StudentRepository;
    private userRepo: UserRepository;

    constructor() {
        this.studentRepo = new StudentRepository();
        this.userRepo = new UserRepository();
    }

    // ============================================================================
    // STUDENT PROFILE MANAGEMENT
    // ============================================================================

    async createStudentProfile(
        userId: number,
        profileData: Omit<StudentProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<StudentProfile> {
        // Verify user exists and is a student
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== 'student') {
            throw new Error('User is not a student');
        }

        // Check if profile already exists
        const existing = await this.studentRepo.getProfileByUserId(userId);
        if (existing) {
            throw new Error('Student profile already exists');
        }

        return await this.studentRepo.createProfile({
            userId,
            ...profileData,
        });
    }

    async updateStudentProfile(
        profileId: number,
        updates: Partial<StudentProfile>
    ): Promise<StudentProfile> {
        const profile = await this.studentRepo.getProfile(profileId);
        if (!profile) {
            throw new Error('Student profile not found');
        }

        const updated = await this.studentRepo.updateProfile(profileId, updates);
        if (!updated) {
            throw new Error('Failed to update student profile');
        }

        return updated;
    }

    async getStudentProfile(profileId: number): Promise<StudentProfile | null> {
        return await this.studentRepo.getProfile(profileId);
    }

    async getStudentProfileByUserId(userId: number): Promise<StudentProfile | null> {
        return await this.studentRepo.getProfileByUserId(userId);
    }

    async getStudentWithProfile(userId: number): Promise<StudentWithProfile | null> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            return null;
        }

        const profile = await this.studentRepo.getProfileByUserId(userId);
        const documents = profile ? await this.studentRepo.getDocuments(profile.id) : [];

        return {
            ...user,
            profile: profile || undefined,
            documents: documents.length > 0 ? documents : undefined,
        };
    }

    async getAllStudentProfiles(
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<StudentProfile>> {
        return await this.studentRepo.getAllProfiles(pagination);
    }

    async deleteStudentProfile(profileId: number): Promise<void> {
        const profile = await this.studentRepo.getProfile(profileId);
        if (!profile) {
            throw new Error('Student profile not found');
        }

        const deleted = await this.studentRepo.deleteProfile(profileId);
        if (!deleted) {
            throw new Error('Failed to delete student profile');
        }
    }

    // ============================================================================
    // DOCUMENT MANAGEMENT
    // ============================================================================

    async uploadDocument(
        studentId: number,
        documentData: Omit<StudentDocument, 'id' | 'studentId' | 'uploadedAt'>
    ): Promise<StudentDocument> {
        // Verify student profile exists
        const profile = await this.studentRepo.getProfile(studentId);
        if (!profile) {
            throw new Error('Student profile not found');
        }

        return await this.studentRepo.uploadDocument({
            studentId,
            ...documentData,
        });
    }

    async getStudentDocuments(studentId: number): Promise<StudentDocument[]> {
        return await this.studentRepo.getDocuments(studentId);
    }

    async getDocument(documentId: number): Promise<StudentDocument | null> {
        return await this.studentRepo.getDocument(documentId);
    }

    async deleteDocument(documentId: number): Promise<void> {
        const document = await this.studentRepo.getDocument(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        const deleted = await this.studentRepo.deleteDocument(documentId);
        if (!deleted) {
            throw new Error('Failed to delete document');
        }
    }

    // ============================================================================
    // ENROLLMENT & PROGRESS TRACKING
    // ============================================================================

    async createEnrollmentDetail(
        enrollmentId: number,
        detailData: Omit<EnrollmentDetail, 'id' | 'enrollmentId' | 'updatedAt'>
    ): Promise<EnrollmentDetail> {
        return await this.studentRepo.createEnrollmentDetail({
            enrollmentId,
            ...detailData,
        });
    }

    async updateEnrollmentDetail(
        enrollmentId: number,
        updates: Partial<EnrollmentDetail>
    ): Promise<EnrollmentDetail> {
        const detail = await this.studentRepo.getEnrollmentDetail(enrollmentId);
        if (!detail) {
            throw new Error('Enrollment detail not found');
        }

        const updated = await this.studentRepo.updateEnrollmentDetail(enrollmentId, updates);
        if (!updated) {
            throw new Error('Failed to update enrollment detail');
        }

        return updated;
    }

    async getEnrollmentDetail(enrollmentId: number): Promise<EnrollmentDetail | null> {
        return await this.studentRepo.getEnrollmentDetail(enrollmentId);
    }

    async updateProgress(
        enrollmentId: number,
        progress: {
            grade?: number;
            attendancePercentage?: number;
            assignmentsCompleted?: number;
            assignmentsTotal?: number;
            quizScores?: number[];
            notes?: string;
        }
    ): Promise<EnrollmentDetail> {
        return await this.updateEnrollmentDetail(enrollmentId, progress);
    }

    async issueCertificate(
        enrollmentId: number,
        certificateUrl: string
    ): Promise<EnrollmentDetail> {
        return await this.updateEnrollmentDetail(enrollmentId, {
            certificateIssued: true,
            certificateUrl,
        });
    }

    // ============================================================================
    // INSTRUCTOR-STUDENT RELATIONSHIPS
    // ============================================================================

    async assignInstructor(
        instructorId: number,
        studentId: number,
        courseId: number
    ): Promise<void> {
        // Verify instructor exists and has instructor role
        const instructor = await this.userRepo.findById(instructorId);
        if (!instructor) {
            throw new Error('Instructor not found');
        }
        if (instructor.role !== 'instructor' && instructor.role !== 'admin') {
            throw new Error('User is not an instructor');
        }

        // Verify student exists
        const student = await this.userRepo.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }
        if (student.role !== 'student') {
            throw new Error('User is not a student');
        }

        await this.studentRepo.assignInstructor(instructorId, studentId, courseId);
    }

    async getInstructorStudents(
        instructorId: number,
        courseId?: number
    ): Promise<number[]> {
        return await this.studentRepo.getInstructorStudents(instructorId, courseId);
    }

    async getStudentInstructors(
        studentId: number,
        courseId?: number
    ): Promise<number[]> {
        return await this.studentRepo.getStudentInstructors(studentId, courseId);
    }

    async removeInstructorStudent(
        instructorId: number,
        studentId: number,
        courseId: number
    ): Promise<void> {
        const removed = await this.studentRepo.removeInstructorStudent(
            instructorId,
            studentId,
            courseId
        );
        if (!removed) {
            throw new Error('Instructor-student relationship not found');
        }
    }

    // ============================================================================
    // REPORTING & ANALYTICS
    // ============================================================================

    async generateStudentReport(userId: number): Promise<{
        profile: StudentProfile | null;
        documents: StudentDocument[];
        enrollmentCount: number;
        averageGrade?: number;
        averageAttendance?: number;
    }> {
        const profile = await this.studentRepo.getProfileByUserId(userId);
        const documents = profile ? await this.studentRepo.getDocuments(profile.id) : [];

        // In a real implementation, you'd fetch enrollment data and calculate averages
        // This is a simplified version
        return {
            profile,
            documents,
            enrollmentCount: 0, // Would be calculated from enrollments
            averageGrade: profile?.gpa,
            averageAttendance: undefined,
        };
    }
}
