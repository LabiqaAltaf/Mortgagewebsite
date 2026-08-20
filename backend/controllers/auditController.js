import AuditLog from '../models/AuditLog.js';

/**
 * GET /api/admin/audit-logs (admin)
 * List audit log entries with optional filtering by action/targetType.
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, targetType, page, limit } = req.query || {};
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (targetType) filter.targetType = targetType;

    const [total, data] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lim)
        .limit(lim),
    ]);

    res.status(200).json({ success: true, count: data.length, total, page: pg, limit: lim, data });
  } catch (error) {
    next(error);
  }
};