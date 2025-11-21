import express from 'express';
import cors from 'cors';
import { env } from './core/config/env.js';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.js';

// Routes - ONLY AUTH
import authRoutes from './api/routes/auth.js';
import courseRoutes from './api/routes/courses.js';
import { categoriesPublicRouter, categoriesAdminRouter } from './api/routes/categories.js';

const app = express();

// ============================================
// 1. Security Middleware
// ============================================
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

// Course routes (public and protected)
app.use('/api/courses', courseRoutes);

// Category routes
app.use('/api/categories', categoriesPublicRouter);
app.use('/api/admin/categories', categoriesAdminRouter);

// ============================================
// 5. 404 Handler
// ============================================
app.use(notFoundHandler);

// ============================================
// 6. Global Error Handler
// ============================================
app.use(errorHandler);

export default app;
