import Lender from '../models/Lender.js';
import { writeAudit, getIp } from '../utils/audit.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/lenders (public)
 * Returns active lenders ordered by displayOrder.
 */
export const getLendersPublic = async (req, res, next) => {
  try {
    const data = await Lender.find({ active: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lenders (admin)
 * Returns all lenders with optional search.
 */
export const getLenders = async (req, res, next) => {
  try {
    const { search } = req.query || {};
    const filter = {};
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.name = re;
    }
    const data = await Lender.find(filter).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lenders/:id (admin)
 */
export const getLenderById = async (req, res, next) => {
  try {
    const lender = await Lender.findById(req.params.id);
    if (!lender) {
      return res.status(404).json({ success: false, message: 'Lender not found.' });
    }
    res.status(200).json({ success: true, data: lender });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lenders (admin)
 */
export const createLender = async (req, res, next) => {
  try {
    const { name, icon, color, displayOrder, active } = req.body || {};
    const lender = await Lender.create({
      name: name.trim(),
      icon: icon ? String(icon).trim() : 'bi-bank',
      color: color ? String(color).trim() : '#1769ff',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      active: active !== undefined ? active : true,
    });
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'lender.created',
      targetType: 'lender',
      targetId: lender._id,
      ip: getIp(req),
    });
    res.status(201).json({ success: true, message: 'Lender added.', data: lender });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/lenders/:id (admin)
 */
export const updateLender = async (req, res, next) => {
  try {
    const { name, icon, color, displayOrder, active } = req.body || {};
    const lender = await Lender.findById(req.params.id);
    if (!lender) {
      return res.status(404).json({ success: false, message: 'Lender not found.' });
    }
    if (name !== undefined) lender.name = String(name).trim();
    if (icon !== undefined) lender.icon = String(icon).trim();
    if (color !== undefined) lender.color = String(color).trim();
    if (displayOrder !== undefined) lender.displayOrder = Number(displayOrder);
    if (active !== undefined) lender.active = Boolean(active);
    await lender.save();
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'lender.updated',
      targetType: 'lender',
      targetId: lender._id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Lender updated.', data: lender });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lenders/:id (admin)
 */
export const deleteLender = async (req, res, next) => {
  try {
    const lender = await Lender.findByIdAndDelete(req.params.id);
    if (!lender) {
      return res.status(404).json({ success: false, message: 'Lender not found.' });
    }
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'lender.deleted',
      targetType: 'lender',
      targetId: req.params.id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Lender deleted.' });
  } catch (error) {
    next(error);
  }
};