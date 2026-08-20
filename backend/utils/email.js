/**
 * Optional email delivery helper for admin replies.
 *
 * Email is ONLY attempted when SMTP settings are present in backend/.env.
 * nodemailer is loaded lazily (dynamic import) so the server still boots if
 * the package is not installed yet — replies are always stored in MongoDB and
 * the API response clearly reports whether delivery was attempted/configured.
 *
 * NOTE: This does NOT install or configure an email provider. SMTP_* vars must
 * be set manually in backend/.env by an operator, and `nodemailer` must be
 * installed separately (`npm i nodemailer`) before real delivery works.
 */

const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS
  return Boolean(host && user && pass)
}

/** Returns true when SMTP credentials/env vars are present. */
export function isEmailConfigured() {
  return isSmtpConfigured()
}

/**
 * Attempt to send an email. Never throws — every failure is returned as a
 * result object so callers can decide how to report it.
 *
 * @param {{ to: string, subject: string, html?: string, text?: string }} mail
 * @returns {Promise<{ sent: boolean, messageId?: string|null, reason?: string }>}
 */
export async function sendMail(mail) {
  if (!isSmtpConfigured()) {
    return { sent: false, reason: 'not_configured' }
  }
  try {
    // Lazy-load so a missing nodemailer dependency never breaks startup.
    const ns = await import('nodemailer')
    const nodemailer = ns.default || ns
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
      },
    })
    const from = process.env.SMTP_FROM || process.env.SMTP_USER
    const info = await transporter.sendMail({
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
    return { sent: true, messageId: info?.messageId ? String(info.messageId) : null }
  } catch (err) {
    return { sent: false, reason: err?.message || 'send_failed' }
  }
}

/** Escape user-supplied text so it is safe to interpolate into HTML emails. */
export function escapeHtml(value) {
  if (value == null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
