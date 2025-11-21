import { Router } from 'express';
import {
    getActivityLogs,
    getUserActivityLogs,
    getActivityLogsByAction,
    getActivityLogsByDateRange,
    getActivityLogsByResource,
    getRecentUserActivity,
    getRecentSystemActivity,
    cleanupOldLogs,
} from '../controllers/ActivityLogController.js';
import { requireAdmin, requirePermission } from '../middleware/permissionMiddleware.js';
import { readRateLimit, standardRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// All routes require admin role
router.use(requireAdmin);

/**
 * @route   GET /api/admin/activity-logs
 * @desc    Get all activity logs with pagination
 * @access  Admin
 */
router.get('/', readRateLimit, requirePermission('activity_logs.read'), getActivityLogs);

/**
 * @route   GET /api/admin/activity-logs/recent
 * @desc    Get recent system activity
 * @access  Admin
 */
router.get('/recent', readRateLimit, requirePermission('activity_logs.read'), getRecentSystemActivity);

/**
 * @route   GET /api/admin/activity-logs/user/:userId
 * @desc    Get user activity logs
 * @access  Admin
 */
router.get('/user/:userId', readRateLimit, requirePermission('activity_logs.read'), getUserActivityLogs);

/**
 * @route   GET /api/admin/activity-logs/user/:userId/recent
 * @desc    Get recent user activity
 * @access  Admin
 */
router.get('/user/:userId/recent', readRateLimit, requirePermission('activity_logs.read'), getRecentUserActivity);

/**
 * @route   GET /api/admin/activity-logs/action/:action
 * @desc    Get activity logs by action
 * @access  Admin
 */
router.get('/action/:action', readRateLimit, requirePermission('activity_logs.read'), getActivityLogsByAction);

/**
 * @route   GET /api/admin/activity-logs/date-range
 * @desc    Get activity logs by date range
 * @access  Admin
 */
router.get('/date-range', readRateLimit, requirePermission('activity_logs.read'), getActivityLogsByDateRange);

/**
 * @route   GET /api/admin/activity-logs/resource/:resourceType/:resourceId
 * @desc    Get activity logs by resource
 * @access  Admin
 */
router.get('/resource/:resourceType/:resourceId', readRateLimit, requirePermission('activity_logs.read'), getActivityLogsByResource);

/**
 * @route   POST /api/admin/activity-logs/cleanup
 * @desc    Cleanup old logs
 * @access  Admin
 */
router.post('/cleanup', standardRateLimit, requirePermission('activity_logs.export'), cleanupOldLogs);

export default router;
