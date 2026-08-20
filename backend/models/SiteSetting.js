import mongoose from 'mongoose';

/**
 * Key/value site setting. Used for admin-editable website settings (business
 * contact info, hero text, etc.). Never holds database credentials.
 */
const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, default: '' },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSetting', siteSettingSchema);