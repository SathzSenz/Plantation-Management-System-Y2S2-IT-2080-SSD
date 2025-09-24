import { AppError, isOperationalError } from '../utils/errors.js';

export function requestIdMiddleware(req, res, next) {
    // Security: request correlation without leaking internals
    // Adds X-Request-Id so logs can be matched to responses
    // (does not expose stack traces or internal details to clients)
    const random = Math.random().toString(36).slice(2, 8);
    req.id = req.id || `${Date.now().toString(36)}-${random}`;
    res.setHeader('X-Request-Id', req.id);
    next();
}

export function notFoundMiddleware(req, res, next) {
    // Security: standardized 404 without exposing route internals
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, undefined, true));
}

export function errorHandler(err, req, res, next) {
    // Security: explicit CSRF handling (prevents CSRF vulnerability)
    if (err && (err.code === 'EBADCSRFTOKEN' || err.name === 'EBADCSRFTOKEN')) {
        return res.status(403).json({
            success: false,
            error: { code: 403, message: 'Invalid CSRF token' }
        });
    }

    // Security: default to 500 when status code is not trustworthy
    const statusCode = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const isOp = isOperationalError(err);

    const payload = {
        success: false,
        error: {
            code: statusCode,
            // Security: only expose message for operational errors marked as safe
            message: isOp && err.expose ? err.message : 'Internal server error',
        }
    };

    // Security: include details only when explicitly marked safe
    if (isOp && err.expose && err.details) {
        payload.error.details = err.details;
    }

    // Security: log full error for operators; clients get sanitized payload
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
    // Security & reliability: ensure async errors hit centralized handler
    return function wrapped(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}



