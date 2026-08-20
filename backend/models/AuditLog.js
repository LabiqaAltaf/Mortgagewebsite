import mongoose from 'mongoose';

/**
 * Audit trail for important admin actions (login, logout, status changes,
 * deletions, role changes, password changes). Passwords/secrets are never
 * stored here.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, default: '' },
    actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
    action: { type: String, required: true },
    targetType: { type: String, default: '' },
    targetId: { type: mongoose.Schema.Types.Mixed, default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);