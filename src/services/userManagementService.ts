import { apiClient } from './api';
import {
    User,
    UserWithPermissions,
    PaginatedResponse,
    PaginationParams,
    FilterParams,
    UserStatistics,
    ApiResponse
} from '../types';

export const userManagementService = {
    // Get all users with pagination and filtering
    getUsers: async (params: PaginationParams & FilterParams): Promise<PaginatedResponse<User>> => {
        const response = await apiClient.client.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
        return response.data.data!;
    },

    // Get user by ID
    getUserById: async (id: number): Promise<UserWithPermissions> => {
        const response = await apiClient.client.get<ApiResponse<UserWithPermissions>>(`/admin/users/${id}`);
        return response.data.data!;
    },

    // Create new user
    createUser: async (userData: Partial<User>): Promise<User> => {
        const response = await apiClient.client.post<ApiResponse<User>>('/admin/users', userData);
        return response.data.data!;
    },

    // Update user
    updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
        const response = await apiClient.client.put<ApiResponse<User>>(`/admin/users/${id}`, userData);
        return response.data.data!;
    },

    // Delete user
    deleteUser: async (id: number): Promise<void> => {
        await apiClient.client.delete(`/admin/users/${id}`);
    },

    // Change user status
    changeUserStatus: async (id: number, isActive: boolean): Promise<User> => {
        const response = await apiClient.client.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { isActive });
        return response.data.data!;
    },

    // Change user role
    changeUserRole: async (id: number, role: string): Promise<User> => {
        const response = await apiClient.client.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
        return response.data.data!;
    },

    // Reset password
    resetPassword: async (id: number): Promise<{ tempPassword?: string }> => {
        const response = await apiClient.client.post<ApiResponse<{ tempPassword?: string }>>(`/admin/users/${id}/reset-password`);
        return response.data.data!;
    },

    // Get user statistics
    getUserStatistics: async (): Promise<UserStatistics> => {
        const response = await apiClient.client.get<ApiResponse<UserStatistics>>('/admin/users/statistics');
        return response.data.data!;
    },

    enable2FA: async (id: number, secret: string): Promise<User> => {
        const response = await apiClient.client.post<ApiResponse<User>>(`/admin/users/${id}/2fa/enable`, { secret });
        return response.data.data!;
    },

    disable2FA: async (id: number): Promise<User> => {
        const response = await apiClient.client.post<ApiResponse<User>>(`/admin/users/${id}/2fa/disable`);
        return response.data.data!;
    }
};
