import User from '../models/User.js';
import Application from '../models/Application.js';
import { writeAudit, getIp } from '../utils/audit.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/users  (admin)
 * search + status/role/verified filters + pagination.
 */
export const listUsers = async (req, res, next) => {
  try {
    const { search, status, role, verified, sort } = req.query || {};
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 200);

    const filter = {};

    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: re }, { email: re }, { phone: re }];
    }
    if (status === 'active' || status === 'disabled') filter.status = status;
    if (role === 'user' || role === 'admin') filter.role = role;
    if (verified === 'true') filter.isVerified = true;
    if (verified === 'false') filter.isVerified = false;

    const sortDir = sort === 'oldest' ? 1 : -1;

    const [total, admins, data] = await Promise.all([
      User.countDocuments(filter),
      User.countDocuments({ role: 'admin' }),
      User.find(filter).sort({ createdAt: sortDir }).skip((page - 1) * limit).limit(limit),
    ]);

    res.status(200).json({ success: true, count: data.length, total, admins, page, limit, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id  (admin)
 * Returns the user plus any applications submitted with the same email.
 * NEVER includes passwordHash.
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const applications = await Application.find({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { user, applications } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/status  (admin)
 * active | disabled
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "active" or "disabled".' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user._id.toString() === req.user._id.toString() && status === 'disabled') {
      return res.status(400).json({ success: false, message: 'You cannot disable your own account.' });
    }

    user.status = status;
    await user.save();

    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: status === 'disabled' ? 'user.disabled' : 'user.enabled',
      targetType: 'user',
      targetId: user._id,
      details: { userId: user.email },
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: `User ${status === 'disabled' ? 'disabled' : 'enabled'}.`, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role  (admin)
 * Only an admin can change roles. Protects against demoting yourself and
 * against removing the final admin.
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin".' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin role.' });
    }

    if (user.role === 'admin' && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the last admin.' });
      }
    }

    user.role = role;
    await user.save();

    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'user.role_changed',
      targetType: 'user',
      targetId: user._id,
      details: { newRole: role },
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: `Role updated to ${role}.`, data: user });
  } catch (error) {
    next(error);
  }
};