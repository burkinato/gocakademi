import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminActivityLogs } from '../components/admin/AdminActivityLogs';
import { useAuth } from '../hooks/useAuth';

export const AdminActivityLogsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    return <AdminActivityLogs />;
};
