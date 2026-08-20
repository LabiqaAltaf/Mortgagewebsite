import Testimonial from '../models/Testimonial.js';
import { writeAudit, getIp } from '../utils/audit.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/testimonials (public)
 * Returns verified + active testimonials ordered by createdAt (newest first).
 */
export const getTestimonialsPublic = async (req, res, next) => {
  try {
    const data = await Testimonial.find({ verified: true, active: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/testimonials (admin)
 * Returns all testimonials with optional filtering.
 */
export const getTestimonials = async (req, res, next) => {
  try {
    const { verified, active, search } = req.query || {};
    const filter = {};
    if (verified === 'true') filter.verified = true;
    if (verified === 'false') filter.verified = false;
    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: re }, { info: re }, { text: re }];
    }
    const data = await Testimonial.find(filter).sort({ createdAt: -1 });
    const verifiedCount = await Testimonial.countDocuments({ verified: true, active: true });
    res.status(200).json({ success: true, count: data.length, verifiedCount, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/testimonials/:id (admin)
 */
export const getTestimonialById = async (req, res, next) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    res.status(200).json({ success: true, data: t });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/testimonials (admin)
 */
export const createTestimonial = async (req, res, next) => {
  try {
    const { name, info, rating, avatar, text, verified, active } = req.body || {};
    const t = await Testimonial.create({
      name: name.trim(),
      info: info ? String(info).trim() : '',
      rating: rating !== undefined ? Number(rating) : 5,
      avatar: avatar ? String(avatar).trim() : '',
      text: text.trim(),
      verified: verified !== undefined ? Boolean(verified) : false,
      active: active !== undefined ? Boolean(active) : true,
    });
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'testimonial.created',
      targetType: 'testimonial',
      targetId: t._id,
      ip: getIp(req),
    });
    res.status(201).json({ success: true, message: 'Testimonial added.', data: t });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/testimonials/:id (admin)
 */
export const updateTestimonial = async (req, res, next) => {
  try {
    const { name, info, rating, avatar, text, verified, active } = req.body || {};
    const t = await Testimonial.findById(req.params.id);
    if (!t) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    if (name !== undefined) t.name = String(name).trim();
    if (info !== undefined) t.info = String(info).trim();
    if (rating !== undefined) t.rating = Number(rating);
    if (avatar !== undefined) t.avatar = String(avatar).trim();
    if (text !== undefined) t.text = String(text).trim();
    if (verified !== undefined) t.verified = Boolean(verified);
    if (active !== undefined) t.active = Boolean(active);
    await t.save();
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'testimonial.updated',
      targetType: 'testimonial',
      targetId: t._id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Testimonial updated.', data: t });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/testimonials/:id (admin)
 */
export const deleteTestimonial = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'testimonial.deleted',
      targetType: 'testimonial',
      targetId: req.params.id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    next(error);
  }
};
