import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core/errors/AppError.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../core/config/env.js';

/**
 * Global error handler middleware
 * Catches all errors and returns appropriate HTTP responses
 * Logs errors and hides stack traces in production
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Handle AppError instances (operational errors)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
        });
        return;
    }

    // Handle unexpected errors (programming errors)
    const statusCode = 500;
    const message = env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 * Should be placed after all routes
 */
export const notFoundHandler = (
    req: Request,
    res: Response
): void => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        path: req.path,
    });
};
