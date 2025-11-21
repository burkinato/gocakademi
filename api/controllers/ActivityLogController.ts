import { Request, Response } from 'express';
import { ActivityLogService } from '../services/ActivityLogService.js';
import { ApiResponse, PaginationParams } from '../types/index.js';

const activityLogService = new ActivityLogService();

/**
 * Get all activity logs with pagination
 */
export const getActivityLogs = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const sortBy = req.query.sortBy as string || 'created_at';
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const pagination: PaginationParams = {
            page,
            limit,
            sortBy,
            sortOrder,
        };

        const result = await activityLogService.getSystemActivity({}, pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
        });
    }
};

/**
 * Get user activity logs
 */
export const getUserActivityLogs = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const sortBy = req.query.sortBy as string || 'created_at';
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const pagination: PaginationParams = {
            page,
            limit,
            sortBy,
            sortOrder,
        };

        const result = await activityLogService.getUserActivity(userId, pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user activity logs',
        });
    }
};

/**
 * Get activity logs by action
 */
export const getActivityLogsByAction = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { action } = req.params;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const pagination: PaginationParams = { page, limit };

        const result = await activityLogService.getActivityByAction(action, pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
        });
    }
};

/**
 * Get activity logs by date range
 */
export const getActivityLogsByDateRange = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required',
            });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format',
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const pagination: PaginationParams = { page, limit };

        const result = await activityLogService.getActivityByDateRange(start, end, pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
        });
    }
};

/**
 * Get activity logs by resource
 */
export const getActivityLogsByResource = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { resourceType, resourceId } = req.params;

        const id = parseInt(resourceId);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid resource ID',
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const pagination: PaginationParams = { page, limit };

        const result = await activityLogService.getActivityByResource(resourceType, id, pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
        });
    }
};

/**
 * Get recent user activity
 */
export const getRecentUserActivity = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);
        const limit = parseInt(req.query.limit as string) || 10;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const logs = await activityLogService.getRecentUserActivity(userId, limit);

        res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
        });
    }
};

/**
 * Get recent system activity
 */
export const getRecentSystemActivity = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;

        const logs = await activityLogService.getRecentSystemActivity(limit);

        res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
        });
    }
};

/**
 * Cleanup old logs
 */
export const cleanupOldLogs = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const daysToKeep = parseInt(req.body.daysToKeep) || 90;

        if (daysToKeep < 1) {
            return res.status(400).json({
                success: false,
                error: 'Days to keep must be at least 1',
            });
        }

        const deletedCount = await activityLogService.cleanupOldLogs(daysToKeep);

        res.status(200).json({
            success: true,
            data: { deletedCount },
            message: `Deleted ${deletedCount} old log entries`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cleanup logs',
        });
    }
};
