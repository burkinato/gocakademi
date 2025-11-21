import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuth } from '../hooks/useAuth';

export const StudentDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Öğrenci Paneli
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hoş geldiniz, {user?.firstName} {user?.lastName}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Ana Sayfa
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* My Courses Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Kurslarım
                            </h3>
                            <span className="material-symbols-outlined text-primary text-3xl">
                                school
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-primary mb-2">0</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Kayıtlı kurs
                        </p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                        >
                            Kurslara Göz At
                        </button>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                İlerleme
                            </h3>
                            <span className="material-symbols-outlined text-secondary text-3xl">
                                trending_up
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-secondary mb-2">0%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ortalama tamamlanma
                        </p>
                    </div>

                    {/* Certificates Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Sertifikalar
                            </h3>
                            <span className="material-symbols-outlined text-yellow-500 text-3xl">
                                workspace_premium
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-yellow-500 mb-2">0</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Kazanılan sertifika
                        </p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Son Aktiviteler
                    </h3>
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                            history
                        </span>
                        <p className="text-gray-600 dark:text-gray-400">
                            Henüz aktivite bulunmuyor
                        </p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                        >
                            Kurslara Başla
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
