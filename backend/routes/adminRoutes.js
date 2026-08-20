import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { dashboard } from '../controllers/adminController.js';

const router = Router();

// Every endpoint here requires an authenticated admin.
router.get('/dashboard', requireDatabase, authenticateUser, requireAdmin, dashboard);

export default router;