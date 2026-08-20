import mongoose from 'mongoose';

/**
 * Public website content managed via the Admin Dashboard.
 *
 * Stored as key/value pairs so the admin can edit individual pieces of
 * public-facing copy (hero text, trust stats, approach words, bad-credit
 * tags, reasons, final CTA, footer, navigation links, etc.) without
 * requiring code changes.
 *
 * The public frontend fetches all approved content via GET /api/content/public
 * and falls back to built-in defaults if the database is unavailable.
 */
const publicContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model('PublicContent', publicContentSchema);