import { UserRepository } from '../repositories/UserRepository.js';
import { ActivityLogService } from './ActivityLogService.js';
import { hashPassword } from '../utils/auth.js';
import {
    User,
    UserWithPermissions,
    PaginationParams,
    PaginatedResponse,
    FilterParams,
} from '../types/index.js';

export class UserManagementService {
    private userRepo: UserRepository;
    private activityLogService: ActivityLogService;

    constructor() {
        this.userRepo = new UserRepository();
        this.activityLogService = new ActivityLogService();
    }

    // ============================================================================
    // USER CRUD
    // ============================================================================

    async createUser(
        adminId: number,
        userData: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            role: 'student' | 'instructor' | 'admin';
            phone?: string;
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
            dateOfBirth?: Date;
            bio?: string;
        },
        ipAddress?: string
    ): Promise<User> {
        // Check if user already exists
        const existing = await this.userRepo.findByEmail(userData.email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);

        // Create user (persist only supported columns in current schema)
        const user = await this.userRepo.createBasic({
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            isActive: true,
        });

        // Log activity
        await this.activityLogService.logUserCreated(adminId, user.id, ipAddress);

        return user;
    }

    async updateUser(
        adminId: number,
        userId: number,
        updates: Partial<User>,
        ipAddress?: string
    ): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // If email is being updated, check for conflicts
        if (updates.email && updates.email !== user.email) {
            const existing = await this.userRepo.findByEmail(updates.email);
            if (existing) {
                throw new Error('Email already in use');
            }
        }

        // If password is being updated, hash it
        if (updates.password) {
            updates.password = await hashPassword(updates.password);
        }

        const updated = await this.userRepo.update(userId, updates);
        if (!updated) {
            throw new Error('Failed to update user');
        }

        // Log activity
        await this.activityLogService.logUserUpdated(adminId, userId, updates, ipAddress);

        return updated;
    }

    async deleteUser(adminId: number, userId: number, ipAddress?: string): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Prevent deleting yourself
        if (adminId === userId) {
            throw new Error('Cannot delete your own account');
        }

        const deleted = await this.userRepo.delete(userId);
        if (!deleted) {
            throw new Error('Failed to delete user');
        }

        // Log activity
        await this.activityLogService.logUserDeleted(adminId, userId, ipAddress);
    }

    async getUser(userId: number): Promise<User | null> {
        return await this.userRepo.findById(userId);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findByEmail(email);
    }

    async getUserWithPermissions(userId: number): Promise<UserWithPermissions | null> {
        return await this.userRepo.findWithPermissions(userId);
    }

    // ============================================================================
    // USER LISTING & SEARCH
    // ============================================================================

    async getUserList(pagination?: PaginationParams): Promise<PaginatedResponse<User>> {
        return await this.userRepo.findAll(pagination);
    }

    async getUsersByRole(
        role: 'student' | 'instructor' | 'admin',
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<User>> {
        return await this.userRepo.findByRole(role, pagination);
    }

    async searchUsers(
        filters: FilterParams,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<User>> {
        return await this.userRepo.searchUsers(filters, pagination);
    }

    // ============================================================================
    // USER STATUS MANAGEMENT
    // ============================================================================

    async activateUser(adminId: number, userId: number, ipAddress?: string): Promise<User> {
        const user = await this.userRepo.updateStatus(userId, true);
        if (!user) {
            throw new Error('User not found');
        }

        await this.activityLogService.logUserAction(
            adminId,
            'user.activate',
            'user',
            userId,
            ipAddress
        );

        return user;
    }

    async deactivateUser(adminId: number, userId: number, ipAddress?: string): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Prevent deactivating yourself
        if (adminId === userId) {
            throw new Error('Cannot deactivate your own account');
        }

        const updated = await this.userRepo.updateStatus(userId, false);
        if (!updated) {
            throw new Error('Failed to deactivate user');
        }

        await this.activityLogService.logUserAction(
            adminId,
            'user.deactivate',
            'user',
            userId,
            ipAddress
        );

        return updated;
    }

    async changeUserStatus(
        adminId: number,
        userId: number,
        isActive: boolean,
        ipAddress?: string
    ): Promise<User> {
        if (isActive) {
            return await this.activateUser(adminId, userId, ipAddress);
        } else {
            return await this.deactivateUser(adminId, userId, ipAddress);
        }
    }

    // ============================================================================
    // ROLE MANAGEMENT
    // ============================================================================

    async changeUserRole(
        adminId: number,
        userId: number,
        newRole: 'student' | 'instructor' | 'admin',
        ipAddress?: string
    ): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Prevent changing your own role
        if (adminId === userId) {
            throw new Error('Cannot change your own role');
        }

        const updated = await this.userRepo.update(userId, { role: newRole });
        if (!updated) {
            throw new Error('Failed to change user role');
        }

        await this.activityLogService.logUserAction(
            adminId,
            'user.role_change',
            'user',
            userId,
            ipAddress,
            undefined,
            { oldRole: user.role, newRole }
        );

        return updated;
    }

    // ============================================================================
    // PASSWORD MANAGEMENT
    // ============================================================================

    async resetPassword(
        adminId: number,
        userId: number,
        newPassword: string,
        ipAddress?: string
    ): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await hashPassword(newPassword);
        await this.userRepo.update(userId, { password: hashedPassword });

        await this.activityLogService.logUserAction(
            adminId,
            'user.password_reset',
            'user',
            userId,
            ipAddress
        );
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // In a real implementation, you'd verify the current password here
        // For now, we'll just hash and update the new password

        const hashedPassword = await hashPassword(newPassword);
        await this.userRepo.update(userId, { password: hashedPassword });

        await this.activityLogService.logActivity(userId, 'user.password_change');
    }

    // ============================================================================
    // VERIFICATION
    // ============================================================================

    async verifyEmail(userId: number): Promise<User> {
        const user = await this.userRepo.verifyEmail(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.activityLogService.logActivity(userId, 'user.email_verified');

        return user;
    }

    async verifyPhone(userId: number): Promise<User> {
        const user = await this.userRepo.verifyPhone(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.activityLogService.logActivity(userId, 'user.phone_verified');

        return user;
    }

    // ============================================================================
    // 2FA MANAGEMENT
    // ============================================================================

    async enable2FA(userId: number, secret: string): Promise<User> {
        const user = await this.userRepo.enable2FA(userId, secret);
        if (!user) {
            throw new Error('User not found');
        }

        await this.activityLogService.logActivity(userId, 'user.2fa_enabled');

        return user;
    }

    async disable2FA(userId: number): Promise<User> {
        const user = await this.userRepo.disable2FA(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.activityLogService.logActivity(userId, 'user.2fa_disabled');

        return user;
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    async getUserStatistics(): Promise<{
        total: number;
        students: number;
        instructors: number;
        admins: number;
        active: number;
        inactive: number;
    }> {
        const allUsers = await this.userRepo.findAll({ page: 1, limit: 1 });
        const students = await this.userRepo.findByRole('student', { page: 1, limit: 1 });
        const instructors = await this.userRepo.findByRole('instructor', { page: 1, limit: 1 });
        const admins = await this.userRepo.findByRole('admin', { page: 1, limit: 1 });
        const active = await this.userRepo.searchUsers({ isActive: true }, { page: 1, limit: 1 });
        const inactive = await this.userRepo.searchUsers({ isActive: false }, { page: 1, limit: 1 });

        return {
            total: allUsers.pagination.total,
            students: students.pagination.total,
            instructors: instructors.pagination.total,
            admins: admins.pagination.total,
            active: active.pagination.total,
            inactive: inactive.pagination.total,
        };
    }
}
