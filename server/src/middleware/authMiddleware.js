import asyncHandler from 'express-async-handler';
import { verifyToken } from '../utils/jwt.js';

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});

// Middleware to restrict to admin role
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access required');
};
