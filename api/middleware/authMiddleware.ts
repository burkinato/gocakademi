import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: 'student' | 'instructor' | 'admin';
            };
        }
    }
}

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: number;
            email: string;
            role: 'student' | 'instructor' | 'admin';
        };

        // Attach user to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
            });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }

        res.status(500).json({
            success: false,
            error: 'Authentication failed',
        });
    }
};

/**
 * Optional auth - doesn't fail if no token provided
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                userId: number;
                email: string;
                role: 'student' | 'instructor' | 'admin';
            };

            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }

        next();
    } catch (error) {
        // Don't fail, just continue without user
        next();
    }
};
