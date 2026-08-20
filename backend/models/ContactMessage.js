import mongoose from 'mongoose';

/**
 * Contact form message ("Get In Touch").
 */
const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please provide a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [40, 'Phone number cannot exceed 40 characters'],
      default: undefined,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [4000, 'Message cannot exceed 4000 characters'],
    },
        approved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // Read / reply workflow (persisted) — New / Read / Replied in the admin UI.
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Which public page the message came from, e.g. 'contact' or 'bad-credit/ccjs'.
    sourcePage: {
      type: String,
      trim: true,
      maxlength: [80, 'Source page cannot exceed 80 characters'],
      default: '',
    },
    replied: {
      type: Boolean,
      default: false,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    // Workflow status for the admin inbox. Older records without this field
    // remain valid and are interpreted from their existing read/replied flags.
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    // Identifies messages created by a public form versus an admin-initiated
    // message. Existing contact records safely default to inbound.
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      default: 'inbound',
    },
    recipientType: {
      type: String,
      enum: ['client', 'user', 'team'],
      default: 'client',
    },
    recipientId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Admin reply conversation (stored in MongoDB only — no email/SMS send yet).
    replies: [
      {
        subject: {
          type: String,
          trim: true,
          maxlength: [200, 'Reply subject cannot exceed 200 characters'],
          default: '',
        },
        body: {
          type: String,
          required: [true, 'Reply body is required'],
          trim: true,
          maxlength: [4000, 'Reply cannot exceed 4000 characters'],
        },
        adminName: {
          type: String,
          trim: true,
          default: 'Admin',
        },
        senderType: {
          type: String,
          enum: ['admin', 'client', 'user', 'team'],
          default: 'admin',
        },
        recipientType: {
          type: String,
          enum: ['client', 'user', 'team'],
          default: 'client',
        },
        deliveryStatus: {
          type: String,
          enum: ['not_configured', 'not_available', 'sent', 'failed'],
          default: 'not_configured',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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

export default mongoose.model('ContactMessage', contactMessageSchema);
