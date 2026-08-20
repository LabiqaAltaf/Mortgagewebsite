import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { writeAudit, getIp } from '../utils/audit.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const issueToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

/**
 * POST /api/auth/register  (PUBLIC)
 * Create a normal user account. The role is ALWAYS forced to "user" - any
 * attempt to assign admin privileges via public signup is ignored.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, firstName, lastName } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name is required (min 2 characters).' });
    }
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      firstName: firstName ? String(firstName).trim() : '',
      lastName: lastName ? String(lastName).trim() : '',
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      passwordHash,
      role: 'user', // SECURITY: public signup can never create an admin
      isVerified: false,
      status: 'active',
    });

    try {
      await Notification.create({
        type: 'user',
        title: 'New User Registered',
        message: `${user.name} created an account.`,
        relatedId: user._id,
      });
    } catch {
      // notifications must never break signup
    }

    await writeAudit({
      actor: user.email,
      actorId: user._id,
      action: 'user.register',
      targetType: 'user',
      targetId: user._id,
      ip: getIp(req),
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: issueToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login  (PUBLIC)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'This account is disabled.' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator access is required.' });
    }

    user.lastLogin = new Date();
    await user.save();

    await writeAudit({
      actor: user.email,
      actorId: user._id,
      action: user.role === 'admin' ? 'admin.login' : 'user.login',
      targetType: 'user',
      targetId: user._id,
      details: {
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
      },
      ip: getIp(req),
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: issueToken(user),
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout  (authenticated)
 * JWT is stateless; this clears the expected server state and logs the event.
 */
export const logout = async (req, res, next) => {
  try {
    req.user.lastLogout = new Date();
    await req.user.save();
    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: req.user?.role === 'admin' ? 'admin.logout' : 'user.logout',
      targetType: 'user',
      targetId: req.user?._id || null,
      details: {
        name: req.user?.name || '',
        email: req.user?.email || '',
        role: req.user?.role || '',
      },
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me  (authenticated)
 */
export const me = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
/**
 * PATCH /api/auth/profile  (authenticated)
 * Update own name / email / profile fields.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, firstName, lastName } = req.body || {};
    const user = req.user;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
      }
      user.name = name.trim();
    }
    if (email !== undefined) {
      if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'A valid email is required.' });
      }
      const normalized = email.trim().toLowerCase();
      const other = await User.findOne({ email: normalized });
      if (other && other._id.toString() !== user._id.toString()) {
        return res.status(409).json({ success: false, message: 'That email is already in use.' });
      }
      user.email = normalized;
    }
    if (phone !== undefined) user.phone = String(phone).trim();
    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();

    await user.save();

    await writeAudit({
      actor: user.email,
      actorId: user._id,
      action: 'profile.updated',
      targetType: 'user',
      targetId: user._id,
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/change-password  (authenticated)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const full = await User.findById(user._id).select('+passwordHash');
    if (!full || !(await bcrypt.compare(currentPassword, full.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    full.passwordHash = await bcrypt.hash(newPassword, 10);
    await full.save();

    await writeAudit({
      actor: user.email,
      actorId: user._id,
      action: 'password.changed',
      targetType: 'user',
      targetId: user._id,
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
