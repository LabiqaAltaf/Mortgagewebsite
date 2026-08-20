import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify the Authorization Bearer token and attach the authenticated user to
 * req.user. Applies to every protected route.
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: 'Session expired or invalid. Please log in again.' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'This account is disabled.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Require the authenticated user to have the "admin" role.
 * Must be used AFTER authenticateUser.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
};