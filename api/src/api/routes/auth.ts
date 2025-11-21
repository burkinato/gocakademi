import { Router } from 'express';
import { register, login, adminLogin, refreshToken, logout, me } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public authentication endpoints (no auth required)
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/refresh', refreshToken);

// Protected endpoints (auth required)
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;
