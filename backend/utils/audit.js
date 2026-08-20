import AuditLog from '../models/AuditLog.js';

/**
 * Write an audit log entry. Never includes passwords or secrets.
 */
export const writeAudit = async ({ actor, actorId, action, targetType, targetId, details = {}, ip = '' }) => {
  try {
    await AuditLog.create({
      actor: actor || '',
      actorId: actorId || null,
      action,
      targetType: targetType || '',
      targetId: targetId || null,
      details,
      ip: ip || '',
    });
  } catch {
    // Audit logging must never break the main request.
  }
};

/** Extract a request IP safely (handles proxy headers but always short). */
export const getIp = (req) => {
  const xf = req.headers['x-forwarded-for'];
  const ip = Array.isArray(xf) ? xf[0] : typeof xf === 'string' ? xf.split(',')[0].trim() : req.socket?.remoteAddress || '';
  return String(ip).slice(0, 120);
};