import Application from '../models/Application.js';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * GET /api/admin/dashboard  (admin)
 * Aggregates REAL MongoDB counts + recent records. No fake numbers.
 */
export const dashboard = async (req, res, next) => {
  try {
    const [
      totalApplications,
      newApplications,
      pendingApplications,
      reviewingApplications,
      approvedApplications,
      rejectedApplications,
      totalContacts,
      unreadContacts,
      totalUsers,
      verifiedUsers,
      activeUsers,
      admins,
      unreadNotifications,
      recentApplications,
      recentMessages,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'new' }),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'reviewing' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'admin' }),
      Notification.countDocuments({ read: false }),
      Application.find().sort({ createdAt: -1 }).limit(5),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          new: newApplications,
          pending: pendingApplications,
          reviewing: reviewingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        contacts: {
          total: totalContacts,
          unread: unreadContacts,
        },
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          active: activeUsers,
          admins,
        },
        notifications: {
          unread: unreadNotifications,
        },
        recentApplications,
        recentMessages,
      },
    });
  } catch (error) {
    next(error);
  }
};