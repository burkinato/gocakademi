import express from 'express';
import cors from 'cors';
import { env } from './core/config/env.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';
import { authMiddleware } from './api/middleware/authMiddleware.js';
import { UPLOADS_ROOT } from './utils/filePaths.js';

// Routes - ONLY AUTH
import authRoutes from './api/routes/auth.js';
import courseRoutes from './api/routes/courses.js';
import { categoriesPublicRouter, categoriesAdminRouter } from './api/routes/categories.js';
import educationRoutes from './api/routes/education.routes.js';
import docsRoutes from './api/routes/docs.js';
import userManagementRoutes from './api/routes/userManagementRoutes.js';
import studentManagementRoutes from './api/routes/studentManagementRoutes.js';
import permissionRoutes from './api/routes/permissionRoutes.js';
import activityLogRoutes from './api/routes/activityLogRoutes.js';
import uploadRoutes from './api/routes/upload.js';
import quizRoutes from './api/routes/quiz.routes.js';

const app = express();
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ============================================
// 2. Body Parsers
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_ROOT));

// ============================================
// 3. Request Logging (Development)
// ============================================
if (env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// 4. Routes
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Upload routes (protected)
app.use('/api/upload', uploadRoutes);

// Course routes (public and protected)
app.use('/api/courses', courseRoutes);

// Category routes
app.use('/api/categories', categoriesPublicRouter);
app.use('/api/admin/categories', categoriesAdminRouter);

// Education routes (protected)
app.use('/api/education', educationRoutes);

// Admin routes
app.use('/api/admin/users', authMiddleware, userManagementRoutes);
app.use('/api/admin/students', authMiddleware, studentManagementRoutes);
app.use('/api/admin/permissions', authMiddleware, permissionRoutes);
app.use('/api/admin/activity-logs', authMiddleware, activityLogRoutes);

// Quiz routes (protected)
app.use('/api/quiz', quizRoutes);

// Docs
app.use('/api/docs', docsRoutes);

// ============================================
// 5. 404 Handler
// ============================================
app.use(notFoundHandler);

// ============================================
// 6. Global Error Handler
// ============================================
app.use(errorHandler);

export default app;
