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

// Resource-level authorization middleware
export const authorizeResource = (Model, options = {}) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRoles = req.user.roles;

      // Admins can access all resources
      if (userRoles.includes('admin')) {
        return next();
      }

      // For routes that don't have an ID parameter (like GET /), allow access
      if (!id) {
        return next();
      }

      // Find the resource
      const resource = await Model.findById(id);
      if (!resource) {
        return next(createError(404, 'Resource not found'));
      }

      // Check if resource has user ownership field
      if (resource.userId || resource.createdBy) {
        const ownerId = resource.userId || resource.createdBy;
        if (ownerId.toString() !== userId.toString()) {
          return next(createError(403, 'Forbidden: You can only access your own resources'));
        }
      } else if (resource.email && req.user.email) {
        // For resources identified by email (like feedback)
        if (resource.email !== req.user.email) {
          return next(createError(403, 'Forbidden: You can only access your own resources'));
        }
      } else if (options.allowManagers && userRoles.includes('manager')) {
        // Managers can access resources in their scope
        return next();
      } else {
        // For resources without clear ownership, only allow managers and admins
        if (!userRoles.includes('manager') && !userRoles.includes('admin')) {
          return next(createError(403, 'Forbidden: Insufficient permissions to access this resource'));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to ensure user can only access their own data in list endpoints
export const filterUserResources = (Model, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const userRoles = req.user.roles;

      // Admins can see all resources
      if (userRoles.includes('admin')) {
        return next();
      }

      // Store original query for later use
      const originalQuery = req.query;
      
      // Add user filter to the query
      if (options.userField) {
        req.query[options.userField] = userId.toString();
      } else if (options.emailField && req.user.email) {
        req.query[options.emailField] = req.user.email;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
