import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import {
  getLendersPublic,
  getLenders,
  getLenderById,
  createLender,
  updateLender,
  deleteLender,
} from '../controllers/lenderController.js';

const router = Router();

// Public: active lenders only (Popular Lenders section).
router.get('/public', requireDatabase, getLendersPublic);

// Admin: full CRUD + list (active + inactive).
router.get('/', requireDatabase, authenticateUser, requireAdmin, getLenders);
router.get('/:id', requireDatabase, authenticateUser, requireAdmin, getLenderById);
router.post('/', requireDatabase, authenticateUser, requireAdmin, createLender);
router.patch('/:id', requireDatabase, authenticateUser, requireAdmin, updateLender);
router.delete('/:id', requireDatabase, authenticateUser, requireAdmin, deleteLender);

export default router;
