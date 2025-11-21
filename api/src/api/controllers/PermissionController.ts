import { Request, Response } from 'express';
import { PermissionService } from '../../application/services/PermissionService.js';
import { ApiResponse } from '../../core/domain/entities/index.js';

const permissionService = new PermissionService();

/**
 * Get all permissions
 */
export const getAllPermissions = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const permissions = await permissionService.getAllPermissions();

        res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch permissions',
        });
    }
};

/**
 * Get permissions by resource
 */
export const getPermissionsByResource = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { resource } = req.params;

        const permissions = await permissionService.getPermissionsByResource(resource);

        res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch permissions',
        });
    }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { role } = req.params;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be student, instructor, or admin',
            });
        }

        const permissions = await permissionService.getRolePermissions(role as any);

        res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch role permissions',
        });
    }
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { role } = req.params;
        const { permissionId } = req.body;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role',
            });
        }

        if (!permissionId) {
            return res.status(400).json({
                success: false,
                error: 'Permission ID is required',
            });
        }

        const result = await permissionService.assignPermissionToRole(role as any, permissionId);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Permission assigned to role successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign permission',
        });
    }
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { role, permissionId } = req.params;

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role',
            });
        }

        await permissionService.removePermissionFromRole(role as any, parseInt(permissionId));

        res.status(200).json({
            success: true,
            message: 'Permission removed from role successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to remove permission',
        });
    }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const permissions = await permissionService.getUserPermissions(userId);

        res.status(200).json({
            success: true,
            data: permissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user permissions',
        });
    }
};

/**
 * Assign permission to user
 */
export const assignPermissionToUser = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);
        const { permissionId, granted } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (!permissionId) {
            return res.status(400).json({
                success: false,
                error: 'Permission ID is required',
            });
        }

        const result = await permissionService.assignPermissionToUser(
            userId,
            permissionId,
            granted !== undefined ? granted : true
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Permission assigned to user successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to assign permission',
        });
    }
};

/**
 * Revoke permission from user
 */
export const revokePermissionFromUser = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);
        const { permissionId } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (!permissionId) {
            return res.status(400).json({
                success: false,
                error: 'Permission ID is required',
            });
        }

        await permissionService.revokePermissionFromUser(userId, permissionId);

        res.status(200).json({
            success: true,
            message: 'Permission revoked from user successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to revoke permission',
        });
    }
};

/**
 * Check if user has permission
 */
export const checkUserPermission = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.userId);
        const { permissionName } = req.query;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (!permissionName) {
            return res.status(400).json({
                success: false,
                error: 'Permission name is required',
            });
        }

        const hasPermission = await permissionService.checkPermission(userId, permissionName as string);

        res.status(200).json({
            success: true,
            data: { hasPermission },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to check permission',
        });
    }
};
