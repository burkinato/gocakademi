import { ActivityLogRepository } from '../repositories/ActivityLogRepository.js';
import { ActivityLog, PaginationParams, PaginatedResponse, FilterParams } from '../types/index.js';

export class ActivityLogService {
    private activityLogRepo: ActivityLogRepository;

    constructor() {
        this.activityLogRepo = new ActivityLogRepository();
    }

    // ============================================================================
    // LOG CREATION
    // ============================================================================

    async logActivity(
        userId: number | undefined,
        action: string,
        details?: {
            resourceType?: string;
            resourceId?: number;
            ipAddress?: string;
            userAgent?: string;
            additionalData?: Record<string, any>;
        }
    ): Promise<ActivityLog> {
        return await this.activityLogRepo.create({
            userId,
            action,
            resourceType: details?.resourceType,
            resourceId: details?.resourceId,
            ipAddress: details?.ipAddress,
            userAgent: details?.userAgent,
            details: details?.additionalData,
        });
    }

    async logUserAction(
        userId: number,
        action: string,
        resourceType: string,
        resourceId: number,
        ipAddress?: string,
        userAgent?: string,
        additionalData?: Record<string, any>
    ): Promise<ActivityLog> {
        return await this.logActivity(userId, action, {
            resourceType,
            resourceId,
            ipAddress,
            userAgent,
            additionalData,
        });
    }

    async logSystemAction(
        action: string,
        details?: Record<string, any>,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logActivity(undefined, action, {
            ipAddress,
            additionalData: details,
        });
    }

    // ============================================================================
    // LOG RETRIEVAL
    // ============================================================================

    async getActivityById(id: number): Promise<ActivityLog | null> {
        return await this.activityLogRepo.findById(id);
    }

    async getUserActivity(
        userId: number,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        return await this.activityLogRepo.findByUser(userId, pagination);
    }

    async getActivityByAction(
        action: string,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        return await this.activityLogRepo.findByAction(action, pagination);
    }

    async getActivityByDateRange(
        startDate: Date,
        endDate: Date,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        return await this.activityLogRepo.findByDateRange(startDate, endDate, pagination);
    }

    async getActivityByResource(
        resourceType: string,
        resourceId: number,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        return await this.activityLogRepo.findByResource(resourceType, resourceId, pagination);
    }

    async getSystemActivity(
        filters?: FilterParams,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<ActivityLog>> {
        if (filters?.startDate && filters?.endDate) {
            return await this.getActivityByDateRange(
                filters.startDate,
                filters.endDate,
                pagination
            );
        }

        return await this.activityLogRepo.findAll(pagination);
    }

    // ============================================================================
    // ANALYTICS & REPORTING
    // ============================================================================

    async getUserActionCount(userId: number, action?: string): Promise<number> {
        const pagination: PaginationParams = { page: 1, limit: 1 };

        if (action) {
            const result = await this.activityLogRepo.findByUser(userId, pagination);
            // This is a simplified version - in production, you'd want a dedicated count query
            return result.pagination.total;
        }

        const result = await this.activityLogRepo.findByUser(userId, pagination);
        return result.pagination.total;
    }

    async getRecentUserActivity(
        userId: number,
        limit: number = 10
    ): Promise<ActivityLog[]> {
        const result = await this.activityLogRepo.findByUser(userId, {
            page: 1,
            limit,
            sortBy: 'created_at',
            sortOrder: 'desc',
        });
        return result.data;
    }

    async getRecentSystemActivity(limit: number = 50): Promise<ActivityLog[]> {
        const result = await this.activityLogRepo.findAll({
            page: 1,
            limit,
            sortBy: 'created_at',
            sortOrder: 'desc',
        });
        return result.data;
    }

    // ============================================================================
    // MAINTENANCE
    // ============================================================================

    async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
        if (daysToKeep < 1) {
            throw new Error('daysToKeep must be at least 1');
        }

        return await this.activityLogRepo.deleteOldLogs(daysToKeep);
    }

    // ============================================================================
    // COMMON LOGGING HELPERS
    // ============================================================================

    async logLogin(
        userId: number,
        success: boolean,
        ipAddress?: string,
        userAgent?: string
    ): Promise<ActivityLog> {
        return await this.logActivity(userId, success ? 'login.success' : 'login.failure', {
            ipAddress,
            userAgent,
            additionalData: { success },
        });
    }

    async logLogout(
        userId: number,
        ipAddress?: string,
        userAgent?: string
    ): Promise<ActivityLog> {
        return await this.logActivity(userId, 'logout', {
            ipAddress,
            userAgent,
        });
    }

    async logUserCreated(
        adminId: number,
        newUserId: number,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            adminId,
            'user.create',
            'user',
            newUserId,
            ipAddress
        );
    }

    async logUserUpdated(
        adminId: number,
        updatedUserId: number,
        changes: Record<string, any>,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            adminId,
            'user.update',
            'user',
            updatedUserId,
            ipAddress,
            undefined,
            { changes }
        );
    }

    async logUserDeleted(
        adminId: number,
        deletedUserId: number,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            adminId,
            'user.delete',
            'user',
            deletedUserId,
            ipAddress
        );
    }

    async logCourseCreated(
        instructorId: number,
        courseId: number,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            instructorId,
            'course.create',
            'course',
            courseId,
            ipAddress
        );
    }

    async logCourseUpdated(
        instructorId: number,
        courseId: number,
        changes: Record<string, any>,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            instructorId,
            'course.update',
            'course',
            courseId,
            ipAddress,
            undefined,
            { changes }
        );
    }

    async logCourseDeleted(
        instructorId: number,
        courseId: number,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            instructorId,
            'course.delete',
            'course',
            courseId,
            ipAddress
        );
    }

    async logEnrollment(
        userId: number,
        courseId: number,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            userId,
            'enrollment.create',
            'enrollment',
            courseId,
            ipAddress
        );
    }

    async logPermissionChange(
        adminId: number,
        targetUserId: number,
        permission: string,
        granted: boolean,
        ipAddress?: string
    ): Promise<ActivityLog> {
        return await this.logUserAction(
            adminId,
            granted ? 'permission.grant' : 'permission.revoke',
            'user',
            targetUserId,
            ipAddress,
            undefined,
            { permission, granted }
        );
    }
}
