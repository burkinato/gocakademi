import { Router } from 'express';
import { register, login, adminLogin, logout, refreshToken } from '../controllers/AuthController.js';
import { authSecurity, getCSRFToken, authenticate } from '../middleware/unifiedSecurityMiddleware.js';

const router = Router();

// CSRF token endpoint (no auth required)
router.get('/csrf-token', getCSRFToken);

// Authentication endpoints with security middleware
router.post('/register', authSecurity, register);
router.post('/login', authSecurity, login);
router.post('/admin/login', authSecurity, adminLogin);
router.post('/refresh', authSecurity, refreshToken);

// Protected logout endpoint
router.post('/logout', authenticate, logout);

export default router;
