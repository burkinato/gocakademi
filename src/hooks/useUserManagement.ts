import { useState, useCallback } from 'react';
import { userManagementService } from '../services/userManagementService';
import { User, UserWithPermissions, PaginationParams, FilterParams, UserStatistics } from '../types';

export const useUserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const fetchUsers = useCallback(async (params: PaginationParams & FilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await userManagementService.getUsers(params);
            setUsers(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserById = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const user = await userManagementService.getUserById(id);
            setSelectedUser(user);
            return user;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch user details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: Partial<User>) => {
        setLoading(true);
        setError(null);
        try {
            const newUser = await userManagementService.createUser(userData);
            setUsers(prev => [newUser, ...prev]);
            return newUser;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id: number, userData: Partial<User>) => {
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await userManagementService.updateUser(id, userData);
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
            if (selectedUser?.id === id) {
                setSelectedUser(prev => prev ? { ...prev, ...updatedUser } : null);
            }
            return updatedUser;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [selectedUser]);

    const deleteUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await userManagementService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const changeStatus = useCallback(async (id: number, isActive: boolean) => {
        setLoading(true);
        try {
            const updatedUser = await userManagementService.changeUserStatus(id, isActive);
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to change user status');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await userManagementService.getUserStatistics();
            setStatistics(stats);
        } catch (err: any) {
            console.error('Failed to fetch statistics', err);
        }
    }, []);

    return {
        users,
        selectedUser,
        loading,
        error,
        pagination,
        statistics,
        fetchUsers,
        fetchUserById,
        createUser,
        updateUser,
        deleteUser,
        changeStatus,
        fetchStatistics,
    };
};
