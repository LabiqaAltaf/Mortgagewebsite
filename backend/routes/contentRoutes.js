import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { getPublicContent, getContent, updateContent } from '../controllers/contentController.js';

const router = Router();

// Public: full content bundle (hero, sections text, team, testimonials, lenders).
router.get('/public', requireDatabase, getPublicContent);

// Admin: read/update editable content keys.
router.get('/', requireDatabase, authenticateUser, requireAdmin, getContent);
router.patch('/', requireDatabase, authenticateUser, requireAdmin, updateContent);

export default router;
