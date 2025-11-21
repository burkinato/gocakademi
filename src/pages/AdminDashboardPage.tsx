import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Redirect if not authenticated or not admin
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

    return (
        <AdminDashboard />
    );
};
