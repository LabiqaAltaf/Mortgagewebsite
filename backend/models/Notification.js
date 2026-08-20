import mongoose from 'mongoose';

/**
 * Admin notification for important events (new application, contact message,
 * new user registration, etc.).
 */
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['application', 'contact', 'user', 'system'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 600 },
    relatedId: { type: mongoose.Schema.Types.Mixed, default: null },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);