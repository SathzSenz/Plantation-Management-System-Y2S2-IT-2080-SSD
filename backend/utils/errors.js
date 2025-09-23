export class AppError extends Error {
    constructor(message, statusCode = 500, details = undefined, expose = false) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.details = details;
        this.expose = expose; // whether to expose message/details to clients
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export function isOperationalError(error) {
    return error instanceof AppError;
}

export function createNotFoundError(resource = 'resource') {
    return new AppError(`${resource} not found`, 404, undefined, true);
}

export function createValidationError(message = 'Validation failed', details) {
    return new AppError(message, 400, details, true);
}

export function createAuthError(message = 'Unauthorized') {
    return new AppError(message, 401, undefined, true);
}

export function createForbiddenError(message = 'Forbidden') {
    return new AppError(message, 403, undefined, true);
}

export function createConflictError(message = 'Conflict') {
    return new AppError(message, 409, undefined, true);
}



