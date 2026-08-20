import { Router } from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  replyToApplication,
  deleteApplication,
} from '../controllers/applicationController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: submit a lead.
router.post('/', requireDatabase, createApplication);

// Admin: list / detail / update / delete.
router.get('/', requireDatabase, authenticateUser, requireAdmin, getApplications);
router.get('/:id', requireDatabase, authenticateUser, requireAdmin, getApplicationById);
router.patch('/:id/status', requireDatabase, authenticateUser, requireAdmin, updateApplicationStatus);
router.post('/:id/reply', requireDatabase, authenticateUser, requireAdmin, replyToApplication);
router.delete('/:id', requireDatabase, authenticateUser, requireAdmin, deleteApplication);

export default router;
