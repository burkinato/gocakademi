import { Router } from 'express';
import {
    getUsers,
    getUserById,
    getUserWithPermissions,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    changeUserRole,
    resetUserPassword,
    getUserStatistics,
    enableUser2FA,
    disableUser2FA,
} from '../controllers/UserManagementController.js';
import { requireAdmin } from '../middleware/unifiedSecurityMiddleware.js';

const router = Router();

// Routes require admin role (authentication handled at app level)
router.use(requireAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Get list of users with pagination and filters
 * @access  Admin
 */
router.get('/', getUsers);

/**
 * @route   GET /api/admin/users/statistics
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/statistics', getUserStatistics);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user by ID
 * @access  Admin
 */
router.get('/:id', getUserById);

/**
 * @route   GET /api/admin/users/:id/permissions
 * @desc    Get user with permissions
 * @access  Admin
 */
router.get('/:id/permissions', getUserWithPermissions);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Admin
 */
router.post('/', createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
router.put('/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Change user status (activate/deactivate)
 * @access  Admin
 */
router.patch('/:id/status', changeUserStatus);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Admin
 */
router.patch('/:id/role', changeUserRole);

/**
 * @route   POST /api/admin/users/:id/reset-password
 * @desc    Reset user password
 * @access  Admin
 */
router.post('/:id/reset-password', resetUserPassword);

/**
 * @route   POST /api/admin/users/:id/2fa/enable
 */
router.post('/:id/2fa/enable', enableUser2FA);

/**
 * @route   POST /api/admin/users/:id/2fa/disable
 */
router.post('/:id/2fa/disable', disableUser2FA);

export default router;
