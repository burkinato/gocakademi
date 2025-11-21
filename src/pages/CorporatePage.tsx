import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Corporate } from '../components/frontend/Corporate';

export const CorporatePage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (page: string) => {
        if (page === 'home') navigate('/');
        else if (page === 'contact') navigate('/contact');
        else navigate(`/${page}`);
    };

    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <Corporate onNavigate={handleNavigate} />
        </div>
    );
};
