// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User Models/UserModel.js';
import createError from 'http-errors';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'elema_jwt';

export const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '1h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    // try Authorization header Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies[COOKIE_NAME]) {
      // fallback to cookie (HttpOnly cookie set after login)
      token = req.cookies[COOKIE_NAME];
    }

    if (!token) {
      throw createError(401, 'Not authenticated');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) throw createError(401, 'User not found');

    req.user = user; // attach user to request
    next();
  } catch (err) {
    next(err);
  }
};

// role based authorization: pass array or string
export const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if (!req.user) return next(createError(401, 'Not authenticated'));
    const hasRole = req.user.roles.some(r => roles.includes(r));
    if (!hasRole) return next(createError(403, 'Forbidden: insufficient role'));
    next();
  };
};
