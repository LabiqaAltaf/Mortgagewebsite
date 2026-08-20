import Notification from '../models/Notification.js';
import { writeAudit, getIp } from '../utils/audit.js';

/**
 * GET /api/notifications  (admin)
 * filter = all | unread | read
 */
export const listNotifications = async (req, res, next) => {
  try {
    const filter = req.query.filter || 'all';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

    const query = {};
    if (filter === 'unread') query.read = false;
    if (filter === 'read') query.read = true;

    const [total, unreadCount, data] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ read: false }),
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ]);

    res.status(200).json({ success: true, count: data.length, total, unreadCount, page, limit, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read  (admin)
 */
export const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all  (admin)
 */
export const markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany({ read: false }, { $set: { read: true, readAt: new Date() } });
    res.status(200).json({ success: true, message: 'All notifications marked as read.', modified: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id  (admin)
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: 'notification.deleted',
      targetType: 'notification',
      targetId: req.params.id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};