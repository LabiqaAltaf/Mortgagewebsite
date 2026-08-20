import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { listNotifications, markRead, markAllRead, deleteNotification } from '../controllers/notificationController.js';

const router = Router();

// Every endpoint here requires an authenticated admin.
router.use(requireDatabase, authenticateUser, requireAdmin);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

export default router;