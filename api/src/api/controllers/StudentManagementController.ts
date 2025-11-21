import { Request, Response } from 'express';
import { StudentService } from '../../application/services/StudentService.js';
import { ApiResponse, PaginationParams } from '../../core/domain/entities/index.js';
import { isValidEmail, isValidPhone, isValidGPA, isValidPercentage } from '../../utils/validation.js';

const studentService = new StudentService();

/**
 * Get all student profiles with pagination
 */
export const getStudentProfiles = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const pagination: PaginationParams = { page, limit };
        const result = await studentService.getAllStudentProfiles(pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch student profiles',
        });
    }
};

/**
 * Get student profile by ID
 */
export const getStudentProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const profileId = parseInt(req.params.id);

        if (isNaN(profileId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid profile ID',
            });
        }

        const profile = await studentService.getStudentProfile(profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Student profile not found',
            });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch student profile',
        });
    }
};

/**
 * Get student profile by user ID
 */
export const getStudentProfileByUserId = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const profile = await studentService.getStudentProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Student profile not found',
            });
        }

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch student profile',
        });
    }
};

/**
 * Get student with full profile and documents
 */
export const getStudentWithProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const student = await studentService.getStudentWithProfile(userId);

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found',
            });
        }

        // Remove password from response
        const { password, ...studentWithoutPassword } = student;

        res.status(200).json({
            success: true,
            data: studentWithoutPassword,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch student',
        });
    }
};

/**
 * Create student profile
 */
export const createStudentProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { userId, ...profileData } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required',
            });
        }

        // Validate email if provided
        if (profileData.secondaryEmail && !isValidEmail(profileData.secondaryEmail)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid secondary email format',
            });
        }

        // Validate phone if provided
        if (profileData.phone && !isValidPhone(profileData.phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format',
            });
        }

        // Validate GPA if provided
        if (profileData.gpa !== undefined && !isValidGPA(profileData.gpa)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GPA (must be between 0 and 4.0)',
            });
        }

        const profile = await studentService.createStudentProfile(userId, profileData);

        res.status(201).json({
            success: true,
            data: profile,
            message: 'Student profile created successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create student profile',
        });
    }
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const profileId = parseInt(req.params.id);
        const updates = req.body;

        if (isNaN(profileId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid profile ID',
            });
        }

        // Validate email if provided
        if (updates.secondaryEmail && !isValidEmail(updates.secondaryEmail)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid secondary email format',
            });
        }

        // Validate phone if provided
        if (updates.phone && !isValidPhone(updates.phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format',
            });
        }

        // Validate GPA if provided
        if (updates.gpa !== undefined && !isValidGPA(updates.gpa)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GPA (must be between 0 and 4.0)',
            });
        }

        const profile = await studentService.updateStudentProfile(profileId, updates);

        res.status(200).json({
            success: true,
            data: profile,
            message: 'Student profile updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update student profile',
        });
    }
};

/**
 * Delete student profile
 */
export const deleteStudentProfile = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const profileId = parseInt(req.params.id);

        if (isNaN(profileId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid profile ID',
            });
        }

        await studentService.deleteStudentProfile(profileId);

        res.status(200).json({
            success: true,
            message: 'Student profile deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete student profile',
        });
    }
};

/**
 * Upload student document
 */
export const uploadDocument = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const studentId = parseInt(req.params.studentId);
        const { documentType, documentName, fileUrl, fileSize, mimeType, notes } = req.body;

        if (isNaN(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid student ID',
            });
        }

        if (!documentType || !documentName || !fileUrl) {
            return res.status(400).json({
                success: false,
                error: 'Document type, name, and file URL are required',
            });
        }

        const document = await studentService.uploadDocument(studentId, {
            documentType,
            documentName,
            fileUrl,
            fileSize,
            mimeType,
            uploadedBy: req.user?.userId,
            notes,
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload document',
        });
    }
};

/**
 * Get student documents
 */
export const getStudentDocuments = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const studentId = parseInt(req.params.studentId);

        if (isNaN(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid student ID',
            });
        }

        const documents = await studentService.getStudentDocuments(studentId);

        res.status(200).json({
            success: true,
            data: documents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch documents',
        });
    }
};

/**
 * Delete student document
 */
export const deleteDocument = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const documentId = parseInt(req.params.documentId);

        if (isNaN(documentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid document ID',
            });
        }

        await studentService.deleteDocument(documentId);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete document',
        });
    }
};

/**
 * Update enrollment progress
 */
export const updateEnrollmentProgress = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const { grade, attendancePercentage, assignmentsCompleted, assignmentsTotal, quizScores, notes } = req.body;

        if (isNaN(enrollmentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid enrollment ID',
            });
        }

        // Validate percentage if provided
        if (attendancePercentage !== undefined && !isValidPercentage(attendancePercentage)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid attendance percentage (must be between 0 and 100)',
            });
        }

        const detail = await studentService.updateProgress(enrollmentId, {
            grade,
            attendancePercentage,
            assignmentsCompleted,
            assignmentsTotal,
            quizScores,
            notes,
        });

        res.status(200).json({
            success: true,
            data: detail,
            message: 'Enrollment progress updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update progress',
        });
    }
};

/**
 * Issue certificate
 */
export const issueCertificate = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const enrollmentId = parseInt(req.params.enrollmentId);
        const { certificateUrl } = req.body;

        if (isNaN(enrollmentId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid enrollment ID',
            });
        }

        if (!certificateUrl) {
            return res.status(400).json({
                success: false,
                error: 'Certificate URL is required',
            });
        }

        const detail = await studentService.issueCertificate(enrollmentId, certificateUrl);

        res.status(200).json({
            success: true,
            data: detail,
            message: 'Certificate issued successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to issue certificate',
        });
    }
};

/**
 * Assign instructor to student
 */
export const assignInstructor = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { instructorId, studentId, courseId } = req.body;

        if (!instructorId || !studentId || !courseId) {
            return res.status(400).json({
                success: false,
                error: 'Instructor ID, student ID, and course ID are required',
            });
        }

        await studentService.assignInstructor(instructorId, studentId, courseId);

        res.status(200).json({
            success: true,
            message: 'Instructor assigned successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign instructor',
        });
    }
};

/**
 * Get student report
 */
export const getStudentReport = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const report = await studentService.generateStudentReport(userId);

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate report',
        });
    }
};
