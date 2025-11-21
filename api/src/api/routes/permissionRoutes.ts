import { Router } from 'express';
import {
    getAllPermissions,
    getPermissionsByResource,
    getRolePermissions,
    assignPermissionToRole,
    removePermissionFromRole,
    getUserPermissions,
    assignPermissionToUser,
    revokePermissionFromUser,
    checkUserPermission,
} from '../controllers/PermissionController.js';
import { requireAdmin } from '../middleware/permissionMiddleware.js';
import { standardRateLimit } from '../middleware/rateLimitMiddleware.js';
import { logPermissionChange } from '../middleware/activityLogMiddleware.js';

const router = Router();

// All routes require admin role
router.use(requireAdmin);

// Apply standard rate limiting
router.use(standardRateLimit);

/**
 * @route   GET /api/admin/permissions
 * @desc    Get all permissions
 * @access  Admin
 */
router.get('/', getAllPermissions);

/**
 * @route   GET /api/admin/permissions/resource/:resource
 * @desc    Get permissions by resource
 * @access  Admin
 */
router.get('/resource/:resource', getPermissionsByResource);

/**
 * @route   GET /api/admin/permissions/role/:role
 * @desc    Get role permissions
 * @access  Admin
 */
router.get('/role/:role', getRolePermissions);

/**
 * @route   POST /api/admin/permissions/role/:role
 * @desc    Assign permission to role
 * @access  Admin
 */
router.post('/role/:role', logPermissionChange, assignPermissionToRole);

/**
 * @route   DELETE /api/admin/permissions/role/:role/:permissionId
 * @desc    Remove permission from role
 * @access  Admin
 */
router.delete('/role/:role/:permissionId', logPermissionChange, removePermissionFromRole);

/**
 * @route   GET /api/admin/permissions/user/:userId
 * @desc    Get user permissions
 * @access  Admin
 */
router.get('/user/:userId', getUserPermissions);

/**
 * @route   POST /api/admin/permissions/user/:userId
 * @desc    Assign permission to user
 * @access  Admin
 */
router.post('/user/:userId', logPermissionChange, assignPermissionToUser);

/**
 * @route   DELETE /api/admin/permissions/user/:userId
 * @desc    Revoke permission from user
 * @access  Admin
 */
router.delete('/user/:userId', logPermissionChange, revokePermissionFromUser);

/**
 * @route   GET /api/admin/permissions/check/:userId
 * @desc    Check if user has permission
 * @access  Admin
 */
router.get('/check/:userId', checkUserPermission);

export default router;
