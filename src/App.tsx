import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminActivityLogsPage } from './pages/AdminActivityLogsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
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
const AdminCourseContentPage = React.lazy(() => import('./pages/AdminCourseContentPage').then(module => ({ default: module.AdminCourseContentPage })));
const AdminCreateCoursePage = React.lazy(() => import('./pages/AdminCreateCoursePage').then(module => ({ default: module.AdminCreateCoursePage })));
const ProjectManagementPage = React.lazy(() => import('./pages/ProjectManagementPage').then(module => ({ default: module.ProjectManagementPage })));

import { useAuthStore } from './stores/authStore';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/corporate" element={<CorporatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
          </Route>

          {/* Student Dashboard (Protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes wrapped in AdminLayout (Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="courses/:id" element={<AdminCourseContentPage />} />
            <Route path="create-course" element={<AdminCreateCoursePage />} />
            <Route path="projects" element={<ProjectManagementPage />} />
            <Route path="activity-logs" element={<AdminActivityLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
