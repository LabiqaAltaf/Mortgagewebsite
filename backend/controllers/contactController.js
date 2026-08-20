import ContactMessage from '../models/ContactMessage.js';
import Notification from '../models/Notification.js';
import TeamMember from '../models/TeamMember.js';
import User from '../models/User.js';
import { writeAudit, getIp } from '../utils/audit.js';
import { escapeHtml, isEmailConfigured, sendMail } from '../utils/email.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * POST /api/contact
 * Create a contact form message ("Get In Touch").
 */
export const createContactMessage = async (req, res, next) => {
  try {
        const { name, email, phone, subject, message, sourcePage } = req.body || {};

    // ---- Validate request data ----
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters.',
      });
    }
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be at least 10 characters.',
      });
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject ? String(subject).trim() : '', 
            message: message.trim(),
      sourcePage: sourcePage ? String(sourcePage).trim() : undefined,
      status: 'new',
    });

    try {
      await Notification.create({
        type: 'contact',
        title: 'New Contact Message',
        message: `${name.trim()} submitted a new contact message.`,
        relatedId: contact._id,
      });
    } catch {
      // notification failure must never break the submission
    }

    res.status(201).json({
      success: true,
      message: 'Message received. We will get back to you as soon as possible.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contact
 * List contact messages, newest first.
 */
/**
 * GET /api/contact  (admin)
 * filter = all | read | unread, optional search by name/email.
 */
export const getContactMessages = async (req, res, next) => {
  try {
    const { filter, search } = req.query || {};
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);

    const query = {};
    if (filter === 'read') query.read = true;
    else if (filter === 'unread') query.read = { $ne: true };
    else if (['new', 'replied', 'closed'].includes(filter)) query.status = filter;
    else if (filter === 'team') query.recipientType = 'team';
    else if (filter === 'users') query.recipientType = { $in: ['client', 'user'] };
    if (filter === 'replied') query.replied = true;
    else if (filter === 'unreplied') query.replied = { $ne: true };
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ name: re }, { email: re }, { subject: re }, { message: re }, { sourcePage: re }];
    }

    const [total, unread, data] = await Promise.all([
      ContactMessage.countDocuments(query),
      ContactMessage.countDocuments({ read: { $ne: true } }),
      ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ]);

    res.status(200).json({ success: true, count: data.length, total, unread, page, limit, data });
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/contact/:id  (admin)
 * Automatically marks the message as read when opened.
 */
export const getContactMessageById = async (req, res, next) => {
  try {
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    if (!contact.read) {
      contact.read = true;
      contact.readAt = new Date();
      if (!contact.replied) contact.status = 'read';
      await contact.save();
    }
    await writeAudit({
      actor: req.user?.email || '', actorId: req.user?._id || null,
      action: 'contact.viewed', targetType: 'contact', targetId: contact._id,
      ip: getIp(req),
    });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/contact/:id/read  (admin)
 */
export const updateContactReadStatus = async (req, res, next) => {
  try {
    const { read } = req.body || {};
    if (typeof read !== 'boolean') {
      return res.status(400).json({ success: false, message: 'read must be a boolean.' });
    }
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    contact.read = read;
    contact.readAt = read ? new Date() : null;
    contact.status = read ? (contact.replied ? 'replied' : 'read') : 'new';
    await contact.save();
    await writeAudit({
      actor: req.user?.email || '', actorId: req.user?._id || null,
      action: read ? 'contact.read' : 'contact.unread', targetType: 'contact', targetId: contact._id,
      ip: getIp(req),
    });
    res.status(200).json({
      success: true,
      message: read ? 'Message marked as read.' : 'Message marked as unread.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/contact/:id  (admin)
 */
export const deleteContactMessage = async (req, res, next) => {
  try {
    const contact = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'contact.deleted',
      targetType: 'contact',
      targetId: req.params.id,
      details: { sender: contact.name },
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Contact message deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/contact/:id/reply  (admin)
 * Stores an admin reply against a message (a conversation entry) and marks
 * the message as replied. Actual email delivery is NOT sent yet — the reply
 * is persisted to MongoDB only (email delivery will be added later).
 */
export const replyToContactMessage = async (req, res, next) => {
  try {
    const { body, subject } = req.body || {};
    if (!body || typeof body !== 'string' || body.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Reply body is required.' });
    }
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    if (!contact.email) return res.status(400).json({ success: false, message: 'This recipient has no email address.' });
    if (!isEmailConfigured()) return res.status(503).json({ success: false, message: 'Email service is not configured.' });
    const delivery = await sendMail({
      to: contact.email,
      subject: subject ? String(subject).trim() : `Re: ${contact.subject || 'Your message'}`,
      text: body.trim(),
      html: `<p>${escapeHtml(body.trim()).replace(/\n/g, '<br>')}</p>`,
    });
    if (!delivery.sent) return res.status(502).json({ success: false, message: `Email delivery failed: ${delivery.reason || 'unknown error'}` });
    contact.replies.push({
      subject: subject ? String(subject).trim() : `Re: ${contact.subject || 'Your message'}`,
      body: body.trim(),
      adminName: req.user?.email || req.user?.name || 'Admin',
      senderType: 'admin',
      recipientType: contact.recipientType || 'client',
      deliveryStatus: 'sent',
      createdAt: new Date(),
    });
    contact.replied = true;
    contact.repliedAt = new Date();
    contact.status = 'replied';
    if (!contact.read) {
      contact.read = true;
      contact.readAt = new Date();
    }
    await contact.save();

    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: 'contact.replied',
      targetType: 'contact',
      targetId: contact._id,
      details: { name: contact.name },
      ip: getIp(req),
    });

    res.status(200).json({
      success: true,
      message: 'Reply saved and email sent.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contact/public  (PUBLIC)
 * Only admin-approved messages appear — they are shown as comments on the
 * public Learn More page so visitors see real, positive responses.
 */
export const getContactMessagesPublic = async (_req, res, next) => {
  try {
    const data = await ContactMessage.find({ approved: true })
      .sort({ approvedAt: -1, createdAt: -1 })
      .limit(60)
      .select('name message createdAt approvedAt');
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/contact/:id/approve  (admin)
 * Approving makes the message visible publicly on the Learn More page.
 */
export const updateContactApproval = async (req, res, next) => {
  try {
    const { approved } = req.body || {};
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ success: false, message: 'approved must be a boolean.' });
    }
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact message not found.' });
    }
    contact.approved = approved;
    contact.approvedAt = approved ? new Date() : null;
    await contact.save();

    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: approved ? 'contact.approved' : 'contact.unapproved',
      targetType: 'contact',
      targetId: contact._id,
      details: { name: contact.name, email: contact.email, approved },
      ip: getIp(req),
    });

    res.status(200).json({
      success: true,
      message: approved
        ? 'Message approved and now visible on the public Learn More page.'
        : 'Message unapproved and removed from the public page.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/contact/:id/status (admin)
 * Changes the inbox workflow state without losing message history.
 */
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid message status.' });
    }
    const contact = await ContactMessage.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Contact message not found.' });
    contact.status = status;
    if (status !== 'new') {
      contact.read = true;
      contact.readAt = contact.readAt || new Date();
    }
    await contact.save();
    await writeAudit({
      actor: req.user?.email || '', actorId: req.user?._id || null,
      action: 'contact.status_changed', targetType: 'contact', targetId: contact._id,
      details: { status }, ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Message status updated.', data: contact });
  } catch (error) { next(error); }
};

/**
 * POST /api/contact/admin-message (admin)
 * Starts a stored conversation with an existing user or team member.
 */
export const createAdminMessage = async (req, res, next) => {
  try {
    const { recipientType, recipientId, subject, message } = req.body || {};
    if (!['user', 'team'].includes(recipientType) || !recipientId) {
      return res.status(400).json({ success: false, message: 'Select an existing user or team member.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
    }
    const recipient = recipientType === 'team'
      ? await TeamMember.findById(recipientId)
      : await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found.' });

    const email = recipient.email || '';
    if (!email) return res.status(400).json({ success: false, message: 'The selected recipient has no email address.' });
    if (!isEmailConfigured()) return res.status(503).json({ success: false, message: 'Email service is not configured.' });
    const delivery = await sendMail({
      to: email,
      subject: subject ? String(subject).trim() : 'Message from Mainly Mortgages',
      text: message.trim(),
      html: `<p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>`,
    });
    if (!delivery.sent) return res.status(502).json({ success: false, message: `Email delivery failed: ${delivery.reason || 'unknown error'}` });
    const contact = await ContactMessage.create({
      name: recipient.name,
      email,
      subject: subject ? String(subject).trim() : '',
      message: message.trim(),
      sourcePage: 'admin-messages',
      read: true,
      readAt: new Date(),
      replied: true,
      repliedAt: new Date(),
      status: 'replied',
      direction: 'outbound',
      recipientType,
      recipientId: recipient._id,
      replies: [{
        body: message.trim(), adminName: req.user?.email || req.user?.name || 'Admin',
        senderType: 'admin', recipientType, deliveryStatus: 'sent', createdAt: new Date(),
      }],
    });
    await writeAudit({
      actor: req.user?.email || '', actorId: req.user?._id || null,
      action: recipientType === 'team' ? 'contact.team_message_sent' : 'contact.user_message_sent',
      targetType: 'contact', targetId: contact._id, details: { recipient: recipient.name }, ip: getIp(req),
    });
    res.status(201).json({
      success: true,
      message: 'Message saved and email sent.',
      data: contact,
      emailConfigured: isEmailConfigured(),
    });
  } catch (error) { next(error); }
};
