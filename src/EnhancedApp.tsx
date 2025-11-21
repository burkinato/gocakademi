import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { useAuthStore } from './stores/authStore';
import { UserRole } from './types/auth';
import { PageLoader } from './components/shared/PageLoader';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage').then(module => ({ default: module.CoursesPage })));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage').then(module => ({ default: module.CourseDetailPage })));
const CorporatePage = React.lazy(() => import('./pages/CorporatePage').then(module => ({ default: module.CorporatePage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage').then(module => ({ default: module.BlogDetailPage })));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const AdminCoursesPage = React.lazy(() => import('./pages/AdminCoursesPage').then(module => ({ default: module.AdminCoursesPage })));
const AdminCreateCoursePage = React.lazy(() => import('./pages/AdminCreateCoursePage').then(module => ({ default: module.AdminCreateCoursePage })));
const ProjectManagementPage = React.lazy(() => import('./pages/ProjectManagementPage').then(module => ({ default: module.ProjectManagementPage })));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })));
const AdminStudentsPage = React.lazy(() => import('./pages/AdminStudentsPage').then(module => ({ default: module.AdminStudentsPage })));
const AdminActivityLogsPage = React.lazy(() => import('./pages/AdminActivityLogsPage').then(module => ({ default: module.AdminActivityLogsPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const UnauthorizedPage = React.lazy(() => import('./pages/UnauthorizedPage').then(module => ({ default: module.UnauthorizedPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user?.role) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check if trying to access auth pages while already authenticated
  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const isHydrated = useAuthStore(state => state.isHydrated);

  if (!isHydrated) {
    return <PageLoader />;
  }

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/corporate" element={<CorporatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Auth Routes - redirect if already authenticated */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected User Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Admin Routes wrapped in AdminLayout - require admin role */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="create-course" element={<AdminCreateCoursePage />} />
            <Route path="projects" element={<ProjectManagementPage />} />
            <Route path="activity-logs" element={<AdminActivityLogsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;