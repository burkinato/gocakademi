import { Router } from 'express';
import { register, login, adminLogin, logout, refreshToken, forgotPassword, resetPassword, changePassword, getProfile, updateProfile } from '../controllers/AuthController.js';
import { 
  enhancedAuth, 
  authLimiter, 
  generalLimiter, 
  csrfProtection, 
  validateInput, 
  securityHeaders,
  logActivity,
  generateCSRFToken
} from '../middleware/enhancedAuth.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../validators/authValidators.js';

const router = Router();

// Apply security headers to all routes
router.use(securityHeaders);

// CSRF token endpoint (no auth required)
router.get('/csrf-token', (req, res) => {
  const csrfToken = generateCSRFToken();
  if (!req.session) {
    req.session = {} as any;
  }
  req.session.csrfSecret = csrfToken;
  
  res.json({ 
    csrfToken: generateCSRFToken(),
    sessionSecret: csrfToken
  });
});

// Authentication endpoints with rate limiting and validation
router.post('/register', 
  authLimiter, 
  csrfProtection,
  validateInput(registerSchema),
  logActivity('USER_REGISTER'),
  register
);

router.post('/login', 
  authLimiter, 
  csrfProtection,
  validateInput(loginSchema),
  logActivity('USER_LOGIN'),
  login
);

router.post('/admin/login', 
  authLimiter, 
  csrfProtection,
  validateInput(loginSchema),
  logActivity('ADMIN_LOGIN'),
  adminLogin
);

router.post('/refresh', 
  generalLimiter,
  csrfProtection,
  refreshToken
);

// Password management routes
router.post('/forgot-password', 
  authLimiter,
  csrfProtection,
  validateInput(forgotPasswordSchema),
  logActivity('PASSWORD_FORGOT'),
  forgotPassword
);

router.post('/reset-password', 
  authLimiter,
  csrfProtection,
  validateInput(resetPasswordSchema),
  logActivity('PASSWORD_RESET'),
  resetPassword
);

// Protected routes
router.post('/logout', 
  generalLimiter,
  csrfProtection,
  enhancedAuth,
  logActivity('USER_LOGOUT'),
  logout
);

router.post('/change-password', 
  generalLimiter,
  csrfProtection,
  enhancedAuth,
  validateInput(changePasswordSchema),
  logActivity('PASSWORD_CHANGE'),
  changePassword
);

router.get('/profile', 
  generalLimiter,
  enhancedAuth,
  logActivity('PROFILE_VIEW'),
  getProfile
);

router.put('/profile', 
  generalLimiter,
  csrfProtection,
  enhancedAuth,
  validateInput(updateProfileSchema),
  logActivity('PROFILE_UPDATE'),
  updateProfile
);

export default router;