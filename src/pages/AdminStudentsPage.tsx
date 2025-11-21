import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudents } from '../components/admin/AdminStudents';
import { useAuth } from '../hooks/useAuth';

export const AdminStudentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user && user.role !== 'admin' && user.role !== 'instructor') {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || !user) {
        return null;
    }

    return <AdminStudents />;
};
