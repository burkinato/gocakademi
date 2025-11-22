import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../core/config/env.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { PermissionRepository } from '../../infrastructure/repositories/PermissionRepository.js';
import { ActivityLogService } from '../../application/services/ActivityLogService.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: 'student' | 'instructor' | 'admin';
                permissions?: string[];
                sessionId?: string;
            };
            csrfToken?: string;
            securityContext?: {
                ipAddress: string;
                userAgent: string;
                requestId: string;
                timestamp: number;
            };
        }
    }
}

export interface SecurityConfig {
    enableCSRF: boolean;
    enableRateLimit: boolean;
    enableBruteForceProtection: boolean;
    enableActivityLogging: boolean;
    enableTokenValidation: boolean;
    enablePermissionCheck: boolean;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    bruteForceWindowMs: number;
    bruteForceMaxAttempts: number;
}

const defaultSecurityConfig: SecurityConfig = {
    enableCSRF: true,
    enableRateLimit: true,
    enableBruteForceProtection: true,
    enableActivityLogging: true,
    enableTokenValidation: true,
    enablePermissionCheck: true,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100,
    bruteForceWindowMs: 15 * 60 * 1000, // 15 minutes
    bruteForceMaxAttempts: 5,
};

// Rate limiting store (in production, use Redis)
interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
        attempts: Array<{
            timestamp: number;
            success: boolean;
        }>;
    };
}

const rateLimitStore: RateLimitStore = {};
const bruteForceStore: RateLimitStore = {};

// CSRF token store
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

export class UnifiedSecurityMiddleware {
    private userRepository: UserRepository;
    private permissionRepository: PermissionRepository;
    private activityLogService: ActivityLogService;
    private config: SecurityConfig;

    constructor(config: Partial<SecurityConfig> = {}) {
        this.config = { ...defaultSecurityConfig, ...config };
        this.userRepository = new UserRepository();
        this.permissionRepository = new PermissionRepository();
        this.activityLogService = new ActivityLogService();

        // Start cleanup intervals
        this.startCleanupIntervals();
    }

    /**
     * Main security middleware that applies all security measures
     */
    public securityMiddleware = (configOverrides?: Partial<SecurityConfig>) => {
        const config = { ...this.config, ...configOverrides };

        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Set up security context
                this.setupSecurityContext(req);

                // 1. Rate limiting
                if (config.enableRateLimit) {
                    const rateLimitResult = await this.checkRateLimit(req, config);
                    if (!rateLimitResult.allowed) {
                        return this.sendSecurityError(res, 429, 'Rate limit exceeded', {
                            retryAfter: rateLimitResult.retryAfter,
                        });
                    }
                }

                // 2. CSRF protection for state-changing operations
                if (config.enableCSRF && this.isStateChangingOperation(req)) {
                    const csrfResult = await this.validateCSRFToken(req);
                    if (!csrfResult.valid) {
                        return this.sendSecurityError(res, 403, 'CSRF token validation failed');
                    }
                }

                // 3. Token validation for protected routes
                if (config.enableTokenValidation) {
                    const tokenResult = await this.validateToken(req);
                    if (!tokenResult.valid) {
                        return this.sendSecurityError(res, 401, tokenResult.error || 'Authentication required');
                    }

                    // Attach user to request
                    if (tokenResult.user) {
                        req.user = tokenResult.user;
                    }
                }

                // 4. Brute force protection for auth endpoints
                if (config.enableBruteForceProtection && this.isAuthEndpoint(req)) {
                    const bruteForceResult = await this.checkBruteForce(req);
                    if (!bruteForceResult.allowed) {
                        return this.sendSecurityError(res, 429, 'Too many failed attempts', {
                            retryAfter: bruteForceResult.retryAfter,
                        });
                    }
                }

                // Set security headers
                this.setSecurityHeaders(res, config);

                // Log activity if enabled
                if (config.enableActivityLogging) {
                    this.logActivity(req, res);
                }

                next();
            } catch (error) {
                console.error('Security middleware error:', error);
                return this.sendSecurityError(res, 500, 'Security check failed');
            }
        };
    };

    /**
     * Role-based access control middleware
     */
    public requireRole = (roles: Array<'student' | 'instructor' | 'admin'>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!req.user) {
                return this.sendSecurityError(res, 401, 'Authentication required');
            }

            if (!roles.includes(req.user.role)) {
                return this.sendSecurityError(res, 403, 'Insufficient permissions', {
                    required: roles,
                    current: req.user.role,
                });
            }

            next();
        };
    };

    /**
     * Permission-based access control middleware
     */
    public requirePermission = (resource: string, action: string) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (!req.user) {
                return this.sendSecurityError(res, 401, 'Authentication required');
            }

            try {
                const hasPermission = await this.checkPermission(req.user, resource, action);
                if (!hasPermission) {
                    return this.sendSecurityError(res, 403, 'Insufficient permissions', {
                        required: `${resource}:${action}`,
                    });
                }

                next();
            } catch (error) {
                console.error('Permission check error:', error);
                return this.sendSecurityError(res, 500, 'Permission check failed');
            }
        };
    };

    /**
     * Generate CSRF token for frontend
     */
    public generateCSRFToken = (sessionId: string): string => {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        csrfTokenStore.set(sessionId, { token, expires });
        return token;
    };

    /**
     * Get CSRF token endpoint
     */
    public getCSRFTokenEndpoint = (req: Request, res: Response) => {
        const sessionId = req.headers['x-session-id'] as string || crypto.randomUUID();
        const token = this.generateCSRFToken(sessionId);

        res.json({
            success: true,
            data: {
                token,
                sessionId,
            },
        });
    };

    // Private helper methods

    private setupSecurityContext(req: Request) {
        const forwarded = req.headers['x-forwarded-for'];
        const ipAddress = forwarded
            ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
            : req.socket.remoteAddress || 'unknown';

        req.securityContext = {
            ipAddress,
            userAgent: req.headers['user-agent'] || 'unknown',
            requestId: crypto.randomUUID(),
            timestamp: Date.now(),
        };
    }

    private async checkRateLimit(req: Request, config: SecurityConfig): Promise<{
        allowed: boolean;
        retryAfter?: number;
    }> {
        const clientId = this.getClientId(req);
        const key = `${req.path}:${clientId}`;
        const now = Date.now();

        if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
            rateLimitStore[key] = {
                count: 0,
                resetTime: now + config.rateLimitWindowMs,
                attempts: [],
            };
        }

        rateLimitStore[key].count++;

        const remaining = Math.max(0, config.rateLimitMaxRequests - rateLimitStore[key].count);
        const resetTime = rateLimitStore[key].resetTime;

        // Set rate limit headers
        req.res?.setHeader('X-RateLimit-Limit', config.rateLimitMaxRequests);
        req.res?.setHeader('X-RateLimit-Remaining', remaining);
        req.res?.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

        if (rateLimitStore[key].count > config.rateLimitMaxRequests) {
            const retryAfter = Math.ceil((resetTime - now) / 1000);
            req.res?.setHeader('Retry-After', retryAfter);
            return { allowed: false, retryAfter };
        }

        return { allowed: true };
    }

    private async validateCSRFToken(req: Request): Promise<{ valid: boolean }> {
        const token = req.headers['x-csrf-token'] as string;
        const sessionId = req.headers['x-session-id'] as string;

        if (!token || !sessionId) {
            return { valid: false };
        }

        const stored = csrfTokenStore.get(sessionId);
        if (!stored || stored.expires < Date.now()) {
            return { valid: false };
        }

        const isValid = crypto.timingSafeEqual(
            Buffer.from(token, 'hex'),
            Buffer.from(stored.token, 'hex')
        );

        return { valid: isValid };
    }

    private async validateToken(req: Request): Promise<{
        valid: boolean;
        user?: any;
        error?: string;
    }> {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return { valid: false, error: 'Access token required' };
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as any;

            // Get user from database to ensure still exists and is active
            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                return { valid: false, error: 'User not found' };
            }

            if (!user.isActive) {
                return { valid: false, error: 'Account is deactivated' };
            }

            // Get user permissions
            const permissions = await this.permissionRepository.getUserPermissions(user.id);

            return {
                valid: true,
                user: {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    permissions: permissions.map(p => `${p.resource}:${p.action}`),
                    sessionId: decoded.sessionId,
                },
            };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return { valid: false, error: 'Token has expired' };
            }

            if (error instanceof jwt.JsonWebTokenError) {
                return { valid: false, error: 'Invalid token' };
            }

            return { valid: false, error: 'Token validation failed' };
        }
    }

    private async checkBruteForce(req: Request): Promise<{
        allowed: boolean;
        retryAfter?: number;
    }> {
        const { email } = req.body;
        const clientId = this.getClientId(req);
        const key = `auth:${clientId}`;
        const now = Date.now();

        if (!bruteForceStore[key] || bruteForceStore[key].resetTime < now) {
            bruteForceStore[key] = {
                count: 0,
                resetTime: now + this.config.bruteForceWindowMs,
                attempts: [],
            };
        }

        // Check failed attempts in database
        try {
            const result = await pool.query(
                `SELECT COUNT(*) as failed_count
         FROM login_attempts
         WHERE (email = $1 OR ip_address = $2)
           AND success = false
           AND attempted_at > NOW() - INTERVAL '15 minutes'`,
                [email, req.securityContext?.ipAddress]
            );

            const failedCount = parseInt(result.rows[0]?.failed_count || '0');

            if (failedCount >= this.config.bruteForceMaxAttempts) {
                const retryAfter = Math.ceil(this.config.bruteForceWindowMs / 1000);
                return { allowed: false, retryAfter };
            }
        } catch (error) {
            console.error('Brute force check error:', error);
            // Don't block on database error
        }

        return { allowed: true };
    }

    private async checkPermission(user: any, resource: string, action: string): Promise<boolean> {
        const requiredPermission = `${resource}:${action}`;
        return user.permissions.includes(requiredPermission) || user.role === 'admin';
    }

    private getClientId(req: Request): string {
        if (req.user?.userId) {
            return `user:${req.user.userId}`;
        }

        return `ip:${req.securityContext?.ipAddress}`;
    }

    private isStateChangingOperation(req: Request): boolean {
        return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    }

    private isAuthEndpoint(req: Request): boolean {
        return req.path.includes('/auth/') || req.path.includes('/login') || req.path.includes('/register');
    }

    private setSecurityHeaders(res: Response, config: SecurityConfig) {
        // Security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        if (config.enableCSRF) {
            res.setHeader('X-CSRF-Token-Required', 'true');
        }
    }

    private sendSecurityError(res: Response, status: number, message: string, data?: any) {
        res.status(status).json({
            success: false,
            error: message,
            ...data,
        });
    }

    private logActivity(req: Request, res: Response) {
        const startTime = Date.now();
        const action = `${req.method.toLowerCase()}.${req.path.replace(/\//g, '.')}`;
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            if (req.user) {
                this.activityLogService.logActivity(
                    req.user.userId,
                    action,
                    {
                        ipAddress: req.securityContext?.ipAddress,
                        userAgent: req.securityContext?.userAgent,
                        additionalData: {
                            method: req.method,
                            path: req.path,
                            statusCode: res.statusCode,
                            duration,
                            query: req.query,
                            params: req.params,
                            requestId: req.securityContext?.requestId,
                        },
                    }
                ).catch(err => {
                    console.error('Failed to log activity:', err);
                });
            }
        });
    }

    private startCleanupIntervals() {
        // Clean up expired entries every minute
        setInterval(() => {
            const now = Date.now();

            // Clean up rate limit store
            Object.keys(rateLimitStore).forEach(key => {
                if (rateLimitStore[key].resetTime < now) {
                    delete rateLimitStore[key];
                }
            });

            // Clean up brute force store
            Object.keys(bruteForceStore).forEach(key => {
                if (bruteForceStore[key].resetTime < now) {
                    delete bruteForceStore[key];
                }
            });

            // Clean up CSRF tokens
            for (const [sessionId, data] of csrfTokenStore.entries()) {
                if (data.expires < now) {
                    csrfTokenStore.delete(sessionId);
                }
            }
        }, 60000);
    }
}

// Export singleton instance with default configuration
export const unifiedSecurity = new UnifiedSecurityMiddleware();

// Export specific middleware functions for convenience
export const authenticate = unifiedSecurity.securityMiddleware();
export const requireAdmin = unifiedSecurity.requireRole(['admin']);
export const requireInstructor = unifiedSecurity.requireRole(['instructor', 'admin']);
export const requireStudent = unifiedSecurity.requireRole(['student', 'instructor', 'admin']);
export const requirePermission = unifiedSecurity.requirePermission;
export const getCSRFToken = unifiedSecurity.getCSRFTokenEndpoint;

// Export pre-configured middleware for different scenarios
export const strictSecurity = unifiedSecurity.securityMiddleware({
    rateLimitMaxRequests: 50,
    bruteForceMaxAttempts: 3,
});

export const authSecurity = unifiedSecurity.securityMiddleware({
    enableCSRF: false, // CSRF not needed for auth endpoints
    enableTokenValidation: false, // allow unauthenticated access to auth endpoints
    rateLimitMaxRequests: 5,
    bruteForceMaxAttempts: 3,
});

export const publicSecurity = unifiedSecurity.securityMiddleware({
    enableTokenValidation: false,
    enablePermissionCheck: false,
    enableCSRF: false,
    enableBruteForceProtection: false,
});

export default unifiedSecurity;
