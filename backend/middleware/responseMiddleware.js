export function attachResponseHelpers(req, res, next) {
    res.success = function success(payload = {}, statusCode = 200) {
        return res.status(statusCode).json({ success: true, data: payload });
    };
    next();
}



