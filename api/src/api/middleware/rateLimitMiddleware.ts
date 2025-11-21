import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/connection.js';

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory store for rate limiting (in production, use Redis)
const store: RateLimitStore = {};

/**
 * Clean up expired entries from the store
 */
const cleanupStore = () => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
};

// Run cleanup every minute
setInterval(cleanupStore, 60000);

/**
 * Get client identifier (IP address or user ID)
 */
const getClientId = (req: Request): string => {
    // Prefer user ID if authenticated
    if (req.user?.userId) {
        return `user:${req.user.userId}`;
    }

    // Fall back to IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress;

    return `ip:${ip}`;
};

/**
 * Create a rate limit middleware
 */
export const createRateLimit = (config: RateLimitConfig) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientId = getClientId(req);
        const key = `${req.path}:${clientId}`;
        const now = Date.now();

        // Initialize or get current limit data
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 0,
                resetTime: now + config.windowMs,
            };
        }

        // Increment request count
        store[key].count++;

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - store[key].count));
        res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

        // Check if limit exceeded
        if (store[key].count > config.maxRequests) {
            const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);

            return res.status(429).json({
                success: false,
                error: config.message || 'Too many requests, please try again later',
                retryAfter,
            });
        }

        next();
    };
};

/**
 * Standard rate limit for general API endpoints (100 requests per 15 minutes)
 */
export const standardRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later',
});

/**
 * Strict rate limit for authentication endpoints (5 requests per 15 minutes)
 */
export const authRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
});

/**
 * Lenient rate limit for read-only endpoints (200 requests per 15 minutes)
 */
export const readRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    message: 'Too many requests, please try again later',
});

/**
 * Very strict rate limit for sensitive operations (3 requests per hour)
 */
export const sensitiveRateLimit = createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many sensitive operations, please try again later',
});

/**
 * Track login attempts in database for brute-force protection
 */
export const trackLoginAttempt = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';

    // Store original send function
    const originalSend = res.send;

    // Override send to capture response
    res.send = function (data: any): Response {
        // Restore original send
        res.send = originalSend;

        // Parse response to determine success/failure
        let success = false;
        let failureReason: string | undefined;

        try {
            const response = typeof data === 'string' ? JSON.parse(data) : data;
            success = response.success === true;
            if (!success) {
                failureReason = response.error || 'unknown';
            }
        } catch (e) {
            // If we can't parse, assume failure
            success = false;
            failureReason = 'parse_error';
        }

        // Log attempt to database (async, don't wait)
        pool.query(
            `INSERT INTO login_attempts (email, ip_address, success, failure_reason)
       VALUES ($1, $2, $3, $4)`,
            [email, ipAddress, success, failureReason]
        ).catch(err => {
            console.error('Failed to log login attempt:', err);
        });

        // Send response
        return originalSend.call(this, data);
    };

    next();
};

/**
 * Check for brute-force attempts
 */
export const checkBruteForce = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';

    try {
        // Check failed attempts in last 15 minutes
        const result = await pool.query(
            `SELECT COUNT(*) as failed_count
       FROM login_attempts
       WHERE (email = $1 OR ip_address = $2)
         AND success = false
         AND attempted_at > NOW() - INTERVAL '15 minutes'`,
            [email, ipAddress]
        );

        const failedCount = parseInt(result.rows[0]?.failed_count || '0');

        // Block if more than 5 failed attempts
        if (failedCount >= 5) {
            return res.status(429).json({
                success: false,
                error: 'Too many failed login attempts. Please try again in 15 minutes.',
            });
        }

        next();
    } catch (error) {
        console.error('Brute-force check error:', error);
        // Don't block on error, just log and continue
        next();
    }
};
