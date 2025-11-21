import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUsers } from '../components/admin/AdminUsers';
import { useAuth } from '../hooks/useAuth';

export const AdminUsersPage: React.FC = () => {
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

    return <AdminUsers />;
};
