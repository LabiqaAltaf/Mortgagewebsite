import { Router } from 'express';
import requireDatabase from '../middleware/requireDatabase.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import {
  getTestimonialsPublic,
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';

const router = Router();

// Public: verified + active testimonials only.
router.get('/public', requireDatabase, getTestimonialsPublic);

// Admin: full CRUD + list (all verification/active states).
router.get('/', requireDatabase, authenticateUser, requireAdmin, getTestimonials);
router.get('/:id', requireDatabase, authenticateUser, requireAdmin, getTestimonialById);
router.post('/', requireDatabase, authenticateUser, requireAdmin, createTestimonial);
router.patch('/:id', requireDatabase, authenticateUser, requireAdmin, updateTestimonial);
router.delete('/:id', requireDatabase, authenticateUser, requireAdmin, deleteTestimonial);

export default router;
