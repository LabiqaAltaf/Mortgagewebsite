import SiteSetting from '../models/SiteSetting.js';
import { writeAudit, getIp } from '../utils/audit.js';

/**
 * Default (non-sensitive) reference of public website content, mirroring the
 * live static content. The public site keeps using its static copy - this is
 * only an admin-facing reference plus a small set of editable values.
 */
const DEFAULT_CONTENT = {
  business: {
    businessName: 'mainly mortgages',
    contactEmail: 'hello@mortgagewebsite.co.uk',
    contactPhone: '+44 20 7946 0958',
    contactAddress: '123 Lending Street, London, UK',
  },
  hero: {
    heading1: 'EXPERTS IN GETTING',
    heading2: 'YOU APPROVED',
    primaryCta: 'Get Start Online',
    secondaryCta: 'Learn More',
  },
  footer: {
    description:
      'A whole-of-market UK mortgage brokerage helping thousands of people get approved. Simple, transparent and personal from start to finish.',
  },
};

const EDITABLE_KEYS = [
  'business.businessName',
  'business.contactEmail',
  'business.contactPhone',
  'business.contactAddress',
  'hero.heading1',
  'hero.heading2',
];

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * GET /api/site/content  (admin)
 * Return the current site content reference (defaults merged with DB edits).
 */
export const getSiteContent = async (_req, res, next) => {
  try {
    const settings = await SiteSetting.find();
    const content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    for (const s of settings) {
      if (EDITABLE_KEYS.includes(s.key)) setByPath(content, s.key, s.value);
    }
    res.status(200).json({ success: true, content, editableKeys: EDITABLE_KEYS });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/site/content  (admin)
 * Update ONLY the whitelisted editable keys.
 */
export const updateSiteContent = async (req, res, next) => {
  try {
    const body = req.body && req.body.content ? req.body.content : req.body || {};
    const allowed = Object.keys(body).filter((key) => EDITABLE_KEYS.includes(key));

    if (allowed.length === 0) {
      return res.status(400).json({ success: false, message: 'No editable content fields provided.' });
    }

    const now = new Date();
    const ops = allowed.map((key) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value: String(body[key]).trim(), updatedAt: now } },
        upsert: true,
      },
    }));
    await SiteSetting.bulkWrite(ops);

    await writeAudit({
      actor: req.user?.email || '',
      actorId: req.user?._id || null,
      action: 'site.content.updated',
      targetType: 'site',
      details: { fields: allowed },
      ip: getIp(req),
    });

    res.status(200).json({ success: true, message: 'Website content updated.' });
  } catch (error) {
    next(error);
  }
};