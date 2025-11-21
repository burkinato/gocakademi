import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { User } from '../types/index.js';
import { AppError } from '../utils/AppError.js';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

import { logger } from '../utils/logger.js';

interface AuthenticatedRequest extends Request {
  user?: User;
  csrfToken?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-key';

export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

export const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyCSRFToken = (token: string, secret: string): boolean => {
  try {
    const expectedToken = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(secret)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch (error) {
    return false;
  }
};

export const enhancedAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('No token provided', 401, 'AUTH_TOKEN_MISSING');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.exp * 1000 < Date.now()) {
      throw new AppError('Token has expired', 401, 'AUTH_TOKEN_EXPIRED');
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 401, 'AUTH_USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401, 'AUTH_ACCOUNT_INACTIVE');
    }

    if (user.lastPasswordChange && decoded.iat * 1000 < user.lastPasswordChange.getTime()) {
      throw new AppError('Token invalidated due to password change', 401, 'AUTH_TOKEN_INVALIDATED');
    }

    req.user = user;
    
    logger.info(`User ${user.email} authenticated successfully`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(`JWT verification failed: ${error.message}`);
      res.status(401).json({
        error: 'Invalid token',
        code: 'AUTH_TOKEN_INVALID'
      });
    } else if (error instanceof AppError) {
      logger.warn(`Authentication failed: ${error.message}`);
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
    } else {
      logger.error('Authentication error:', error);
      res.status(500).json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'User not authenticated',
        code: 'AUTH_NOT_AUTHENTICATED'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.email} attempted to access resource without required role`);
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

export const requirePermission = (permissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'User not authenticated',
        code: 'AUTH_NOT_AUTHENTICATED'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`User ${req.user.email} attempted to access resource without required permission`);
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'AUTH_INSUFFICIENT_PERMISSIONS',
        required: permissions,
        current: userPermissions
      });
      return;
    }

    next();
  };
};

export const csrfProtection = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionSecret = req.session?.csrfSecret;

  if (!csrfToken || !sessionSecret) {
    logger.warn(`CSRF token missing for ${req.method} ${req.path}`);
    res.status(403).json({
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_MISSING'
    });
    return;
  }

  if (!verifyCSRFToken(csrfToken, sessionSecret)) {
    logger.warn(`CSRF token validation failed for ${req.method} ${req.path}`);
    res.status(403).json({
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
    return;
  }

  next();
};

export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const details = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn(`Input validation failed: ${JSON.stringify(details)}`);
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details
      });
      return;
    }

    next();
  };
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  
  next();
};

export const logActivity = (action: string, resource?: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    logger.info(`Activity: ${action} | User: ${req.user?.email || 'Anonymous'} | Resource: ${resource || req.path} | IP: ${ip} | User-Agent: ${userAgent}`);
    
    next();
  };
};