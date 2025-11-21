import { useState, useCallback } from 'react';
import { studentManagementService } from '../services/studentManagementService';
import { StudentWithProfile, StudentDocument, PaginationParams, FilterParams } from '../types';

export const useStudentManagement = () => {
    const [students, setStudents] = useState<StudentWithProfile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithProfile | null>(null);
    const [documents, setDocuments] = useState<StudentDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchStudents = useCallback(async (params: PaginationParams & FilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentManagementService.getStudentProfiles(params);
            setStudents(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudentById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const student = await studentManagementService.getStudentProfile(id);
            setSelectedStudent(student);
            return student;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch student details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (id: number, data: any) => {
        setLoading(true);
        setError(null);
        try {
            const updatedProfile = await studentManagementService.updateStudentProfile(id, data);
            if (selectedStudent && selectedStudent.profile?.id === id) {
                setSelectedStudent(prev => prev ? { ...prev, profile: updatedProfile } : null);
            }
            return updatedProfile;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedStudent]);

    const fetchDocuments = useCallback(async (studentId: number) => {
        setLoading(true);
        try {
            const docs = await studentManagementService.getStudentDocuments(studentId);
            setDocuments(docs);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadDocument = useCallback(async (studentId: number, file: File, type: string, notes?: string) => {
        setLoading(true);
        try {
            const newDoc = await studentManagementService.uploadDocument(studentId, file, type, notes);
            setDocuments(prev => [newDoc, ...prev]);
            return newDoc;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to upload document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteDocument = useCallback(async (studentId: number, documentId: number) => {
        setLoading(true);
        try {
            await studentManagementService.deleteDocument(studentId, documentId);
            setDocuments(prev => prev.filter(d => d.id !== documentId));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete document');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        students,
        selectedStudent,
        documents,
        loading,
        error,
        pagination,
        fetchStudents,
        fetchStudentById,
        updateProfile,
        fetchDocuments,
        uploadDocument,
        deleteDocument,
    };
};
