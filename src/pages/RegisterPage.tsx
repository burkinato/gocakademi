import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Register } from '../components/frontend/Register';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (page: string) => {
        if (page === 'home') navigate('/');
        else if (page === 'login') navigate('/login');
        else navigate(`/${page}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <Register onNavigate={handleNavigate} />
        </div>
    );
};
