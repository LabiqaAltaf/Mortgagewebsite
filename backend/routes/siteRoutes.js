import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { getSiteContent, updateSiteContent } from '../controllers/siteController.js';

const router = Router();

// Every endpoint here requires an authenticated admin.
router.use(requireDatabase, authenticateUser, requireAdmin);

router.get('/content', getSiteContent);
router.patch('/content', updateSiteContent);

export default router;