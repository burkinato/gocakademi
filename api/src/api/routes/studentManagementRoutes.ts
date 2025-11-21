import { Router } from 'express';
import {
    getStudentProfiles,
    getStudentProfile,
    getStudentProfileByUserId,
    getStudentWithProfile,
    createStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    uploadDocument,
    getStudentDocuments,
    deleteDocument,
    updateEnrollmentProgress,
    issueCertificate,
    assignInstructor,
    getStudentReport,
} from '../controllers/StudentManagementController.js';
import { requireInstructorOrAdmin, requirePermission } from '../middleware/permissionMiddleware.js';
import { standardRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// All routes require instructor or admin role
router.use(requireInstructorOrAdmin);

// Apply standard rate limiting
router.use(standardRateLimit);

/**
 * @route   GET /api/admin/students
 * @desc    Get all student profiles with pagination
 * @access  Instructor, Admin
 */
router.get('/', requirePermission('students.read'), getStudentProfiles);

/**
 * @route   GET /api/admin/students/profile/:id
 * @desc    Get student profile by ID
 * @access  Instructor, Admin
 */
router.get('/profile/:id', requirePermission('students.read'), getStudentProfile);

/**
 * @route   GET /api/admin/students/user/:userId
 * @desc    Get student profile by user ID
 * @access  Instructor, Admin
 */
router.get('/user/:userId', requirePermission('students.read'), getStudentProfileByUserId);

/**
 * @route   GET /api/admin/students/:userId/full
 * @desc    Get student with full profile and documents
 * @access  Instructor, Admin
 */
router.get('/:userId/full', requirePermission('students.read'), getStudentWithProfile);

/**
 * @route   GET /api/admin/students/:userId/report
 * @desc    Get student report
 * @access  Instructor, Admin
 */
router.get('/:userId/report', requirePermission('students.view_progress'), getStudentReport);

/**
 * @route   POST /api/admin/students/profile
 * @desc    Create student profile
 * @access  Admin
 */
router.post('/profile', requirePermission('students.create'), createStudentProfile);

/**
 * @route   PUT /api/admin/students/profile/:id
 * @desc    Update student profile
 * @access  Instructor, Admin
 */
router.put('/profile/:id', requirePermission('students.update'), updateStudentProfile);

/**
 * @route   DELETE /api/admin/students/profile/:id
 * @desc    Delete student profile
 * @access  Admin
 */
router.delete('/profile/:id', requirePermission('students.delete'), deleteStudentProfile);

/**
 * @route   POST /api/admin/students/:studentId/documents
 * @desc    Upload student document
 * @access  Instructor, Admin
 */
router.post('/:studentId/documents', requirePermission('students.manage_documents'), uploadDocument);

/**
 * @route   GET /api/admin/students/:studentId/documents
 * @desc    Get student documents
 * @access  Instructor, Admin
 */
router.get('/:studentId/documents', requirePermission('students.read'), getStudentDocuments);

/**
 * @route   DELETE /api/admin/students/documents/:documentId
 * @desc    Delete student document
 * @access  Instructor, Admin
 */
router.delete('/documents/:documentId', requirePermission('students.manage_documents'), deleteDocument);

/**
 * @route   PATCH /api/admin/students/enrollment/:enrollmentId/progress
 * @desc    Update enrollment progress
 * @access  Instructor, Admin
 */
router.patch('/enrollment/:enrollmentId/progress', requirePermission('enrollments.update'), updateEnrollmentProgress);

/**
 * @route   POST /api/admin/students/enrollment/:enrollmentId/certificate
 * @desc    Issue certificate
 * @access  Instructor, Admin
 */
router.post('/enrollment/:enrollmentId/certificate', requirePermission('enrollments.update'), issueCertificate);

/**
 * @route   POST /api/admin/students/assign-instructor
 * @desc    Assign instructor to student
 * @access  Admin
 */
router.post('/assign-instructor', requirePermission('students.update'), assignInstructor);

export default router;
