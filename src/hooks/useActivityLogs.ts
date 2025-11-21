import { useState, useCallback } from 'react';
import { activityLogService } from '../services/activityLogService';
import { ActivityLog, PaginationParams, FilterParams } from '../types';

export const useActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const fetchLogs = useCallback(async (params: PaginationParams & FilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await activityLogService.getActivityLogs(params);
            setLogs(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch activity logs');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecentActivity = useCallback(async (limit: number = 10) => {
        try {
            const logs = await activityLogService.getRecentActivity(limit);
            setRecentLogs(logs);
        } catch (err: any) {
            console.error('Failed to fetch recent activity', err);
        }
    }, []);

    return {
        logs,
        recentLogs,
        loading,
        error,
        pagination,
        fetchLogs,
        fetchRecentActivity,
    };
};
