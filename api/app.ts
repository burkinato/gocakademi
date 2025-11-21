import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import docsRoutes from './routes/docs.js';
import courseRoutes from './routes/courses.js';
import { categoriesPublicRouter, categoriesAdminRouter } from './routes/categories.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import studentManagementRoutes from './routes/studentManagementRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import educationRoutes from './routes/education.routes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { logActivity } from './middleware/activityLogMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth required)
app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/categories', categoriesPublicRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes (auth required)
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/education', educationRoutes); // Education routes (has its own auth)

// Admin routes (auth + admin permissions required)
// Activity logging middleware for all admin routes
app.use('/api/admin', authMiddleware, logActivity);
app.use('/api/admin/categories', categoriesAdminRouter);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/students', studentManagementRoutes);
app.use('/api/admin/permissions', permissionRoutes);
app.use('/api/admin/activity-logs', activityLogRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

export default app;

