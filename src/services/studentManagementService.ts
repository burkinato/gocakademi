import { apiClient } from './api';
import {
    StudentProfile,
    StudentDocument,
    StudentWithProfile,
    PaginatedResponse,
    PaginationParams,
    FilterParams,
    ApiResponse
} from '../types';

export const studentManagementService = {
    // Get student profiles
    getStudentProfiles: async (params: PaginationParams & FilterParams): Promise<PaginatedResponse<StudentWithProfile>> => {
        const response = await apiClient.client.get<ApiResponse<PaginatedResponse<StudentWithProfile>>>('/admin/students', { params });
        return response.data.data!;
    },

    // Get student profile by ID
    getStudentProfile: async (id: number): Promise<StudentWithProfile> => {
        const response = await apiClient.client.get<ApiResponse<StudentWithProfile>>(`/admin/students/${id}`);
        return response.data.data!;
    },

    // Create student profile
    createStudentProfile: async (data: Partial<StudentProfile>): Promise<StudentProfile> => {
        const response = await apiClient.client.post<ApiResponse<StudentProfile>>('/admin/students', data);
        return response.data.data!;
    },

    // Update student profile
    updateStudentProfile: async (id: number, data: Partial<StudentProfile>): Promise<StudentProfile> => {
        const response = await apiClient.client.put<ApiResponse<StudentProfile>>(`/admin/students/${id}`, data);
        return response.data.data!;
    },

    // Upload student document
    uploadDocument: async (studentId: number, file: File, documentType: string, notes?: string): Promise<StudentDocument> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        if (notes) formData.append('notes', notes);

        const response = await apiClient.client.post<ApiResponse<StudentDocument>>(
            `/admin/students/${studentId}/documents`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data!;
    },

    // Get student documents
    getStudentDocuments: async (studentId: number): Promise<StudentDocument[]> => {
        const response = await apiClient.client.get<ApiResponse<StudentDocument[]>>(`/admin/students/${studentId}/documents`);
        return response.data.data!;
    },

    // Delete document
    deleteDocument: async (studentId: number, documentId: number): Promise<void> => {
        await apiClient.client.delete(`/admin/students/${studentId}/documents/${documentId}`);
    }
};
