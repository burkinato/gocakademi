import { apiClient } from './api';
import {
    ActivityLog,
    PaginatedResponse,
    PaginationParams,
    FilterParams,
    ApiResponse
} from '../types';

export const activityLogService = {
    // Get activity logs
    getActivityLogs: async (params: PaginationParams & FilterParams): Promise<PaginatedResponse<ActivityLog>> => {
        const response = await apiClient.client.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/admin/activity-logs', { params });
        return response.data.data!;
    },

    // Get user activity logs
    getUserActivityLogs: async (userId: number, params: PaginationParams): Promise<PaginatedResponse<ActivityLog>> => {
        const response = await apiClient.client.get<ApiResponse<PaginatedResponse<ActivityLog>>>(`/admin/activity-logs/user/${userId}`, { params });
        return response.data.data!;
    },

    // Get recent activity
    getRecentActivity: async (limit: number = 10): Promise<ActivityLog[]> => {
        const response = await apiClient.client.get<ApiResponse<ActivityLog[]>>('/admin/activity-logs/recent', {
            params: { limit }
        });
        return response.data.data!;
    },

    // Delete old logs (maintenance)
    deleteOldLogs: async (daysToKeep: number): Promise<{ count: number }> => {
        const response = await apiClient.client.delete<ApiResponse<{ count: number }>>('/admin/activity-logs/cleanup', {
            data: { daysToKeep }
        });
        return response.data.data!;
    }
};
