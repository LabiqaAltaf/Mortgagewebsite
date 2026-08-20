import { Router } from 'express';
import {
  createContactMessage,
  getContactMessages,
  getContactMessagesPublic,
  getContactMessageById,
  updateContactReadStatus,
  updateContactStatus,
  updateContactApproval,
  replyToContactMessage,
  createAdminMessage,
  deleteContactMessage,
} from '../controllers/contactController.js';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: submit a contact message.
router.post('/', requireDatabase, createContactMessage);

// Public: approved messages only (shown as comments on the Learn More page).
router.get('/public', requireDatabase, getContactMessagesPublic);

// Admin: list / detail / read-state / approve / delete.
router.get('/', requireDatabase, authenticateUser, requireAdmin, getContactMessages);
router.post('/admin-message', requireDatabase, authenticateUser, requireAdmin, createAdminMessage);
router.get('/:id', requireDatabase, authenticateUser, requireAdmin, getContactMessageById);
router.patch('/:id/read', requireDatabase, authenticateUser, requireAdmin, updateContactReadStatus);
router.patch('/:id/status', requireDatabase, authenticateUser, requireAdmin, updateContactStatus);
router.patch('/:id/approve', requireDatabase, authenticateUser, requireAdmin, updateContactApproval);
router.post('/:id/reply', requireDatabase, authenticateUser, requireAdmin, replyToContactMessage);
router.delete('/:id', requireDatabase, authenticateUser, requireAdmin, deleteContactMessage);

export default router;
