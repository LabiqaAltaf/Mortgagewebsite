import TeamMember from '../models/TeamMember.js';
import { writeAudit, getIp } from '../utils/audit.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/team (public)
 * Returns active team members ordered by displayOrder.
 */
export const getTeamPublic = async (req, res, next) => {
  try {
    const data = await TeamMember.find({ active: true })
      .select('name role image description displayOrder active createdAt updatedAt')
      .sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/team (admin)
 * Returns all team members (active + inactive) with optional search.
 */
export const getTeamMembers = async (req, res, next) => {
  try {
    const { search } = req.query || {};
    const filter = {};
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: re }, { role: re }];
    }
    const data = await TeamMember.find(filter).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/team/:id (admin)
 */
export const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/team (admin)
 */
export const createTeamMember = async (req, res, next) => {
  try {
    const { name, role, email, image, description, displayOrder, active } = req.body || {};
    const member = await TeamMember.create({
      name: name.trim(),
      role: role.trim(),
      email: email ? String(email).trim().toLowerCase() : '',
      image: image ? String(image).trim() : '',
      description: description ? String(description).trim() : '',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      active: active !== undefined ? active : true,
    });
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'team.created',
      targetType: 'team',
      targetId: member._id,
      ip: getIp(req),
    });
    res.status(201).json({ success: true, message: 'Team member added.', data: member });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/team/:id (admin)
 */
export const updateTeamMember = async (req, res, next) => {
  try {
    const { name, role, email, image, description, displayOrder, active } = req.body || {};
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    if (name !== undefined) member.name = String(name).trim();
    if (role !== undefined) member.role = String(role).trim();
    if (email !== undefined) member.email = String(email).trim().toLowerCase();
    if (image !== undefined) member.image = String(image).trim();
    if (description !== undefined) member.description = String(description).trim();
    if (displayOrder !== undefined) member.displayOrder = Number(displayOrder);
    if (active !== undefined) member.active = Boolean(active);
    await member.save();
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'team.updated',
      targetType: 'team',
      targetId: member._id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Team member updated.', data: member });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/team/:id (admin)
 */
export const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'team.deleted',
      targetType: 'team',
      targetId: req.params.id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Team member deleted.' });
  } catch (error) {
    next(error);
  }
};
