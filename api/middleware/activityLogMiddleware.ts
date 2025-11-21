import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../services/ActivityLogService.js';

const activityLogService = new ActivityLogService();

/**
 * Get IP address from request
 */
const getIpAddress = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    return forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
        : req.socket.remoteAddress || 'unknown';
};

/**
 * Get user agent from request
 */
const getUserAgent = (req: Request): string => {
    return req.headers['user-agent'] || 'unknown';
};

/**
 * Middleware to automatically log all requests
 */
export const logActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = Date.now();
    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Store original send function
    const originalSend = res.send;

    // Override send to log after response
    res.send = function (data: any): Response {
        // Restore original send
        res.send = originalSend;

        // Log activity asynchronously (don't wait)
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Determine action based on method and path
        const action = `${req.method.toLowerCase()}.${req.path.replace(/\//g, '.')}`;

        // Parse response to get additional details
        let responseData: any;
        try {
            responseData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
            responseData = {};
        }

        // Log the activity
        activityLogService.logActivity(
            req.user?.userId,
            action,
            {
                ipAddress,
                userAgent,
                additionalData: {
                    method: req.method,
                    path: req.path,
                    statusCode,
                    duration,
                    success: responseData.success,
                    query: req.query,
                    params: req.params,
                },
            }
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        // Send response
        return originalSend.call(this, data);
    };

    next();
};

/**
 * Middleware to log specific user actions
 */
export const logUserAction = (
    action: string,
    getResourceInfo?: (req: Request) => { resourceType: string; resourceId: number }
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ipAddress = getIpAddress(req);
        const userAgent = getUserAgent(req);

        // Store original send function
        const originalSend = res.send;

        // Override send to log after successful response
        res.send = function (data: any): Response {
            // Restore original send
            res.send = originalSend;

            // Only log if user is authenticated and response is successful
            if (req.user && res.statusCode < 400) {
                let resourceType: string | undefined;
                let resourceId: number | undefined;

                if (getResourceInfo) {
                    try {
                        const info = getResourceInfo(req);
                        resourceType = info.resourceType;
                        resourceId = info.resourceId;
                    } catch (e) {
                        console.error('Failed to get resource info:', e);
                    }
                }

                // Log the activity
                activityLogService.logUserAction(
                    req.user.userId,
                    action,
                    resourceType || 'unknown',
                    resourceId || 0,
                    ipAddress,
                    userAgent,
                    {
                        body: req.body,
                        params: req.params,
                        query: req.query,
                    }
                ).catch(err => {
                    console.error('Failed to log user action:', err);
                });
            }

            // Send response
            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Middleware to log authentication events
 */
export const logAuthEvent = (eventType: 'login' | 'logout' | 'register') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ipAddress = getIpAddress(req);
        const userAgent = getUserAgent(req);

        // Store original send function
        const originalSend = res.send;

        // Override send to log after response
        res.send = function (data: any): Response {
            // Restore original send
            res.send = originalSend;

            // Parse response
            let responseData: any;
            try {
                responseData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                responseData = {};
            }

            const success = responseData.success === true;

            // Log the event
            if (eventType === 'login') {
                const userId = responseData.data?.user?.id;
                if (userId) {
                    activityLogService.logLogin(userId, success, ipAddress, userAgent)
                        .catch(err => console.error('Failed to log login:', err));
                }
            } else if (eventType === 'logout') {
                if (req.user) {
                    activityLogService.logLogout(req.user.userId, ipAddress, userAgent)
                        .catch(err => console.error('Failed to log logout:', err));
                }
            } else if (eventType === 'register') {
                const userId = responseData.data?.user?.id;
                if (userId && success) {
                    activityLogService.logActivity(
                        userId,
                        'user.register',
                        { ipAddress, userAgent }
                    ).catch(err => console.error('Failed to log registration:', err));
                }
            }

            // Send response
            return originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Middleware to log permission changes
 */
export const logPermissionChange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const ipAddress = getIpAddress(req);

    // Store original send function
    const originalSend = res.send;

    // Override send to log after successful response
    res.send = function (data: any): Response {
        // Restore original send
        res.send = originalSend;

        // Only log if user is authenticated and response is successful
        if (req.user && res.statusCode < 400) {
            const { userId, permissionId, granted } = req.body;
            const permission = req.body.permission || 'unknown';

            activityLogService.logPermissionChange(
                req.user.userId,
                userId,
                permission,
                granted,
                ipAddress
            ).catch(err => {
                console.error('Failed to log permission change:', err);
            });
        }

        // Send response
        return originalSend.call(this, data);
    };

    next();
};
