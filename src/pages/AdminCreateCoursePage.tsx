import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCreateCourse } from '../components/admin/AdminCreateCourse';
import { useAuth } from '../hooks/useAuth';

export const AdminCreateCoursePage: React.FC = () => {
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

    return <AdminCreateCourse />;
};
