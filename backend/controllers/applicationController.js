import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { writeAudit, getIp } from '../utils/audit.js';
import { isEmailConfigured, sendMail, escapeHtml } from '../utils/email.js';

// Supported mortgage types the site collects in the lead form.
const MORTGAGE_TYPES = ['buying', 'remortgaging', 'buy-to-let', 'not-sure'];
const STATUSES = ['new', 'pending', 'reviewing', 'approved', 'rejected'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * POST /api/applications  (PUBLIC)
 */
export const createApplication = async (req, res, next) => {
  try {
    const { fullName, email, phone, mortgageType, postcode, details, propertyValue, mortgageAmount, deposit, employmentStatus, employerName, annualIncome } = req.body || {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Full name is required (min 2 characters).' });
    }
    if (!email || !emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'A phone number is required.' });
    }
    if (mortgageType && !MORTGAGE_TYPES.includes(mortgageType)) {
      return res.status(400).json({ success: false, message: `mortgageType must be one of: ${MORTGAGE_TYPES.join(', ')}.` });
    }

    const application = await Application.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      mortgageType: mortgageType || 'buying',
      postcode: postcode ? String(postcode).trim() : undefined,
      details: details ? String(details).trim() : undefined,
      propertyValue: Number(propertyValue) > 0 ? Number(propertyValue) : undefined,
      mortgageAmount: Number(mortgageAmount) > 0 ? Number(mortgageAmount) : undefined,
      deposit: Number(deposit) > 0 ? Number(deposit) : undefined,
      employmentStatus: employmentStatus ? String(employmentStatus).trim() : undefined,
      employerName: employerName ? String(employerName).trim() : undefined,
      annualIncome: Number(annualIncome) > 0 ? Number(annualIncome) : undefined,
      status: 'new',
    });

    try {
      await Notification.create({
        type: 'application',
        title: 'New Application',
        message: `${fullName.trim()} submitted a new mortgage application.`,
        relatedId: application._id,
      });
    } catch {
      // notification failure must never break the submission
    }

    res.status(201).json({
      success: true,
      message: 'Application received. A mortgage expert will be in touch shortly.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/applications  (admin)
 * search by name/email/phone/postcode, status filter, sort, pagination.
 */
export const getApplications = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query || {};
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 200);

    const filter = {};
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ fullName: re }, { email: re }, { phone: re }, { postcode: re }];
    }
    if (status && STATUSES.includes(status)) filter.status = status;

    const sortDir = sort === 'oldest' ? 1 : -1;

    const [total, data] = await Promise.all([
      Application.countDocuments(filter),
      Application.find(filter).sort({ createdAt: sortDir }).skip((page - 1) * limit).limit(limit),
    ]);

    res.status(200).json({ success: true, count: data.length, total, page, limit, data });
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/applications/:id  (admin)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/applications/:id/status  (admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${STATUSES.join(', ')}.` });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    const previous = application.status;
    application.status = status;
    await application.save();

    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'application.status_changed',
      targetType: 'application',
      targetId: application._id,
      details: { from: previous, to: status },
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: 'Application status updated.', data: application });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/applications/:id  (admin)
 */
export const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    await writeAudit({
      actor: req.user.email,
      actorId: req.user._id,
      action: 'application.deleted',
      targetType: 'application',
      targetId: req.params.id,
      details: { applicant: application.fullName },
      ip: getIp(req),
    });
    res.status(200).json({ success: true, message: 'Application deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/applications/:id/reply  (admin)
 * Store an admin reply against an application and optionally email the applicant.
 *
 * Email delivery is ONLY attempted when SMTP_* env vars are configured (see
 * utils/email.js). When it is not configured the reply is still stored in
 * MongoDB and the response reports that delivery is not configured — we never
 * fake a successful send.
 */
export const replyToApplication = async (req, res, next) => {
  try {
    const { body } = req.body || {};
    if (!body || typeof body !== 'string' || body.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Reply body is required.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const adminName = req.user?.email || req.user?.name || 'Admin';
    const trimmedBody = body.trim();

    let emailResult = null;
    const emailConfigured = isEmailConfigured();
    if (emailConfigured) {
      emailResult = await sendMail({
        to: application.email,
        subject: 'Regarding your mortgage application',
        text: `Hello ${application.fullName},\n\n${trimmedBody}\n\nBest regards,\n${adminName}`,
        html: `<p>Hello ${escapeHtml(application.fullName)},</p><p>${escapeHtml(trimmedBody).replace(/\n/g, '<br>')}</p><p>Best regards,<br>${escapeHtml(adminName)}</p>`,
      });
    }

    application.replies.push({
      body: trimmedBody,
      adminName,
      emailSent: !!emailResult?.sent,
      sentAt: emailResult?.sent ? new Date() : null,
      createdAt: new Date(),
    });
    application.replied = true;
    application.repliedAt = new Date();
    await application.save();

    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: 'application.replied',
      targetType: 'application',
      targetId: application._id,
      details: { fullName: application.fullName, emailSent: !!emailResult?.sent },
      ip: getIp(req),
    });

    res.status(200).json({
      success: true,
      message: 'Reply saved.',
      emailConfigured,
      emailSent: !!emailResult?.sent,
      emailNotice: emailConfigured
        ? emailResult?.sent
          ? 'Reply stored and emailed to the applicant.'
          : 'Reply stored, but email delivery failed. The message was not sent.'
        : 'Reply stored. Email delivery is not configured — configure SMTP_* in backend/.env and install nodemailer to send.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
