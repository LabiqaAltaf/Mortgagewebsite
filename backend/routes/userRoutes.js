import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { listUsers, getUserById, updateUserStatus, updateUserRole } from '../controllers/userController.js';

const router = Router();

// Every endpoint here requires an authenticated admin.
router.use(requireDatabase, authenticateUser, requireAdmin);

router.get('/', listUsers);
router.get('/:id', getUserById);
router.patch('/:id/status', updateUserStatus);
router.patch('/:id/role', updateUserRole);

export default router;