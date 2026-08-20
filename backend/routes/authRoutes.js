import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { register, login, logout, me, updateProfile, changePassword } from '../controllers/authController.js';

const router = Router();

// Public
router.post('/login', requireDatabase, login);

// Authenticated
router.post('/logout', authenticateUser, requireAdmin, logout);
router.get('/me', authenticateUser, requireAdmin, me);
router.patch('/profile', authenticateUser, requireAdmin, updateProfile);
router.patch('/change-password', authenticateUser, requireAdmin, changePassword);

export default router;
