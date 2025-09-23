import { AppError, isOperationalError } from '../utils/errors.js';

export function requestIdMiddleware(req, res, next) {
    // simple request id using timestamp and random
    const random = Math.random().toString(36).slice(2, 8);
    req.id = req.id || `${Date.now().toString(36)}-${random}`;
    res.setHeader('X-Request-Id', req.id);
    next();
}

export function notFoundMiddleware(req, res, next) {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, undefined, true));
}

export function errorHandler(err, req, res, next) {
    // Handle CSRF errors explicitly
    if (err && (err.code === 'EBADCSRFTOKEN' || err.name === 'EBADCSRFTOKEN')) {
        return res.status(403).json({
            success: false,
            error: { code: 403, message: 'Invalid CSRF token' }
        });
    }

    const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const isOp = isOperationalError(err);

    const payload = {
        success: false,
        error: {
            code: statusCode,
            message: isOp && err.expose ? err.message : 'Internal server error',
        }
    };

    if (isOp && err.expose && err.details) {
        payload.error.details = err.details;
    }

    // Log full error with request id for correlation
    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        statusCode,
    };
    // eslint-disable-next-line no-console
    console.error('Error:', logContext, err);

    res.status(statusCode).json(payload);
}

export function asyncHandler(fn) {
    return function wrapped(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}



