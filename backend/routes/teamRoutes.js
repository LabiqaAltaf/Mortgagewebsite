import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import {
  getTeamPublic,
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/teamController.js';

const router = Router();

// Public: active team members only (Team / Mortgage Experts section).
router.get('/public', requireDatabase, getTeamPublic);

// Admin: full CRUD + list (active + inactive).
router.get('/', requireDatabase, authenticateUser, requireAdmin, getTeamMembers);
router.get('/:id', requireDatabase, authenticateUser, requireAdmin, getTeamMemberById);
router.post('/', requireDatabase, authenticateUser, requireAdmin, createTeamMember);
router.patch('/:id', requireDatabase, authenticateUser, requireAdmin, updateTeamMember);
router.delete('/:id', requireDatabase, authenticateUser, requireAdmin, deleteTeamMember);

export default router;
