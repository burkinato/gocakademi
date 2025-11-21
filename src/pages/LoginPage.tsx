import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../components/frontend/Login';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (page: string) => {
        if (page === 'home') navigate('/');
        else if (page === 'register') navigate('/register');
        else navigate(`/${page}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <Login onNavigate={handleNavigate} />
        </div>
    );
};
