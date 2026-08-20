import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { getAuditLogs } from '../controllers/auditController.js';

const router = Router();

// Admin only.
router.get('/', requireDatabase, authenticateUser, requireAdmin, getAuditLogs);

export default router;