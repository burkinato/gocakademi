import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from '../components/shared/NotificationBell';
import { useNotificationStore } from '../stores/notificationStore';
import { Settings, LogOut, Bell, User, BarChart3, Users, GraduationCap, BookOpen, History, Shield, Target } from 'lucide-react';
import { getAssetUrl } from '../utils/media';

export const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { addNotification } = useNotificationStore();

    const handleLogout = () => {
        addNotification({
            title: 'Çıkış Yapıldı',
            message: 'Oturumunuz başarıyla kapatıldı.',
            type: 'info',
            priority: 'low',
        });
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: 'dashboard', label: 'Genel Bakış', icon: BarChart3, path: '/admin/dashboard' },
        { key: 'users', label: 'Kullanıcılar', icon: Users, path: '/admin/users' },
        // Öğrenciler sayfası kaldırıldı; rol tabanlı yapı kullanılacak
        { key: 'courses', label: 'Eğitimler', icon: BookOpen, path: '/admin/courses' },
        { key: 'activity-logs', label: 'Aktivite Logları', icon: History, path: '/admin/activity-logs' },
        { key: 'reports', label: 'Raporlar', icon: Shield, path: '/admin/reports' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const avatarUrl = getAssetUrl(user?.profileImageUrl);

    return (
        <div className="relative flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen w-64 bg-white dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        GökAkademi
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${isActive(item.path)
                                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile & Settings */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {user && (
                        <div className="flex items-center gap-3 p-3 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user.role === 'admin' ? 'Yönetici' : user.role === 'instructor' ? 'Eğitmen' : 'Öğrenci'}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">Ayarlar</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {menuItems.find(item => isActive(item.path))?.label || 'Panel'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={`${user?.firstName || ''} ${user?.lastName || ''}`} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-white" />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
