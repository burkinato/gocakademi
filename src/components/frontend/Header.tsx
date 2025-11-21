import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../../constants';
import { Page } from '../../types';
import { Button } from '../shared/Button';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onNavigate: (page: Page) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 flex w-full justify-center border-b border-solid border-gray-200/50 dark:border-gray-700/50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
      <div className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3 w-full max-w-7xl">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-3 text-text-light dark:text-text-dark cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">GocAkademi</h2>
          </div>
          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                className="text-sm font-medium leading-normal text-text-light dark:text-text-dark hover:text-primary dark:hover:text-secondary transition-colors"
                onClick={() => onNavigate(link.key)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6">
          <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64 group">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full ring-1 ring-transparent focus-within:ring-primary/50 transition-all">
              <div className="text-subtext-light dark:text-subtext-dark flex border-none bg-gray-200 dark:bg-gray-800 items-center justify-center pl-3 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-none border-none bg-gray-200 dark:bg-gray-800 h-full placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                placeholder="Arama yap..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </label>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleDashboardClick}
                className="flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span className="hidden sm:inline">
                  {user.role === 'admin' ? 'Admin Paneli' : user.role === 'instructor' ? 'Eğitmen Paneli' : 'Öğrenci Paneli'}
                </span>
              </Button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <span className="material-symbols-outlined text-[20px]">
                    {showUserMenu ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-subtext-light dark:text-subtext-dark">{user.email}</p>
                    </div>
                    <button
                      onClick={handleDashboardClick}
                      className="w-full px-4 py-2 text-left text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Panelim
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profilim
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="neutral"
                onClick={() => onNavigate('login')}
                className="hidden sm:flex"
              >
                Giriş Yap
              </Button>
              <Button
                variant="primary"
                onClick={() => onNavigate('register')}
              >
                Kayıt Ol
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
