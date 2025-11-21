import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../../application/services/PermissionService.js';

const permissionService = new PermissionService();

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: 'student' | 'instructor' | 'admin';
            };
        }
    }
}

/**
 * Middleware to check if user has a specific permission
 */
export const requirePermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                });
            }

            // Check if user has the required permission
            const hasPermission = await permissionService.checkPermission(
                req.user.userId,
                permissionName
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: permissionName,
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed',
            });
        }
    };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 */
export const requireAnyPermission = (permissionNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const hasPermission = await permissionService.checkAnyPermission(
                req.user.userId,
                permissionNames
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: `One of: ${permissionNames.join(', ')}`,
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed',
            });
        }
    };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 */
export const requireAllPermissions = (permissionNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const hasPermission = await permissionService.checkAllPermissions(
                req.user.userId,
                permissionNames
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions',
                    required: `All of: ${permissionNames.join(', ')}`,
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                error: 'Permission check failed',
            });
        }
    };
};

/**
 * Middleware to check if user has a specific role
 */
export const requireRole = (role: 'student' | 'instructor' | 'admin' | ('student' | 'instructor' | 'admin')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        const allowedRoles = Array.isArray(role) ? role : [role];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient role',
                required: allowedRoles.join(' or '),
                current: req.user.role,
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is instructor or admin
 */
export const requireInstructorOrAdmin = requireRole(['instructor', 'admin']);
