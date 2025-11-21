import { Request, Response } from 'express';
import { UserManagementService } from '../../application/services/UserManagementService.js';
import { ApiResponse, PaginationParams, FilterParams } from '../../core/domain/entities/index.js';
import { isValidEmail, validatePasswordStrength } from '../../utils/validation.js';

const userManagementService = new UserManagementService();

/**
 * Get list of users with pagination and filters
 */
export const getUsers = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const sortBy = req.query.sortBy as string;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc';

        const pagination: PaginationParams = {
            page,
            limit,
            sortBy,
            sortOrder,
        };

        const filters: FilterParams = {
            search: req.query.search as string,
            role: req.query.role as any,
            isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        };

        const result = Object.keys(filters).some(key => filters[key] !== undefined)
            ? await userManagementService.searchUsers(filters, pagination)
            : await userManagementService.getUserList(pagination);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch users',
        });
    }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const user = await userManagementService.getUser(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user',
        });
    }
};

/**
 * Get user with permissions
 */
export const getUserWithPermissions = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const user = await userManagementService.getUserWithPermissions(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user',
        });
    }
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const { email, password, firstName, lastName, role, phone, address, city, state, country, postalCode, dateOfBirth, bio } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, firstName, lastName, and role are required',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Password is too weak',
                message: passwordValidation.feedback.join(', '),
            });
        }

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be student, instructor, or admin',
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        const user = await userManagementService.createUser(
            req.user!.userId,
            {
                email,
                password,
                firstName,
                lastName,
                role,
                phone,
                address,
                city,
                state,
                country,
                postalCode,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                bio,
            },
            ipAddress
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            data: userWithoutPassword,
            message: 'User created successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create user',
        });
    }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const updates = req.body;

        // Validate email if provided
        if (updates.email && !isValidEmail(updates.email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }

        // Validate password if provided
        if (updates.password) {
            const passwordValidation = validatePasswordStrength(updates.password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is too weak',
                    message: passwordValidation.feedback.join(', '),
                });
            }
        }

        // Validate role if provided
        if (updates.role && !['student', 'instructor', 'admin'].includes(updates.role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role',
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        const user = await userManagementService.updateUser(
            req.user!.userId,
            userId,
            updates,
            ipAddress
        );

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: 'User updated successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update user',
        });
    }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        await userManagementService.deleteUser(req.user!.userId, userId, ipAddress);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete user',
        });
    }
};

/**
 * Change user status (activate/deactivate)
 */
export const changeUserStatus = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);
        const { isActive } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'isActive must be a boolean',
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        const user = await userManagementService.changeUserStatus(
            req.user!.userId,
            userId,
            isActive,
            ipAddress
        );

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to change user status',
        });
    }
};

/**
 * Change user role
 */
export const changeUserRole = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be student, instructor, or admin',
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        const user = await userManagementService.changeUserRole(
            req.user!.userId,
            userId,
            role,
            ipAddress
        );

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword,
            message: 'User role changed successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to change user role',
        });
    }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);
        const { newPassword } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID',
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                error: 'New password is required',
            });
        }

        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Password is too weak',
                message: passwordValidation.feedback.join(', '),
            });
        }

        const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;

        await userManagementService.resetPassword(
            req.user!.userId,
            userId,
            newPassword,
            ipAddress
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reset password',
        });
    }
};

/**
 * Get user statistics
 */
export const getUserStatistics = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const stats = await userManagementService.getUserStatistics();

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch statistics',
        });
    }
};

export const enableUser2FA = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);
        const { secret } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }
        if (!secret) {
            return res.status(400).json({ success: false, error: '2FA secret is required' });
        }

        const updated = await userManagementService.enable2FA(userId, secret);
        const { password, ...userWithoutPassword } = updated;
        res.status(200).json({ success: true, data: userWithoutPassword, message: '2FA enabled' });
    } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to enable 2FA' });
    }
};

export const disableUser2FA = async (req: Request, res: Response<ApiResponse<any>>) => {
    try {
        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        const updated = await userManagementService.disable2FA(userId);
        const { password, ...userWithoutPassword } = updated;
        res.status(200).json({ success: true, data: userWithoutPassword, message: '2FA disabled' });
    } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Failed to disable 2FA' });
    }
};
