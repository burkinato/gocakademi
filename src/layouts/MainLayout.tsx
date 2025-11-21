import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/frontend/Header';
import { Footer } from '../components/frontend/Footer';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  // Adapter for the existing Header component which expects an onNavigate prop
  // In a full refactor, we would update Header to use Link/useNavigate directly
  const handleNavigate = (page: string) => {
    if (page === 'home') navigate('/');
    else if (page === 'login') navigate('/login');
    else if (page === 'register') navigate('/register');
    else if (page === 'courses') navigate('/courses');
    else if (page === 'corporate') navigate('/corporate');
    else if (page === 'blog') navigate('/blog');
    else if (page === 'contact') navigate('/contact');
    else if (page === 'admin-dashboard') navigate('/admin/dashboard');
    else navigate(`/${page}`);
  };

  return (
    <div className="layout-container flex h-full grow flex-col min-h-screen">
      <Header onNavigate={handleNavigate} />
      <main className="flex flex-1 flex-col w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
