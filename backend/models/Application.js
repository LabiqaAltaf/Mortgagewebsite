import mongoose from 'mongoose';

/**
 * Mortgage application / "Get Start Online" lead.
 *
 * Captures the information a mortgage broker needs to follow up on a lead
 * submitted from the website's contact/get-started section. Financial /
 * employment fields are optional (present only if the submission provides
 * them) and never contain secrets.
 */
const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [40, 'Phone number cannot exceed 40 characters'],
    },
    mortgageType: {
      type: String,
      enum: {
        values: ['buying', 'remortgaging', 'buy-to-let', 'not-sure'],
        message: '{VALUE} is not a supported mortgage type',
      },
      default: 'buying',
    },
    postcode: {
      type: String,
      trim: true,
      maxlength: [12, 'Postcode cannot exceed 12 characters'],
      default: undefined,
    },
    details: {
      type: String,
      trim: true,
      maxlength: [2000, 'Details cannot exceed 2000 characters'],
      default: undefined,
    },
    // Optional financial / circumstance fields (only populated if provided).
    propertyValue: { type: Number, min: 0, default: undefined },
    mortgageAmount: { type: Number, min: 0, default: undefined },
    deposit: { type: Number, min: 0, default: undefined },
        employmentStatus: { type: String, trim: true, maxlength: 60, default: undefined },
    employerName: { type: String, trim: true, maxlength: 120, default: undefined },
    annualIncome: { type: Number, min: 0, default: undefined },
    status: {
      type: String,
      enum: {
        values: ['new', 'pending', 'reviewing', 'approved', 'rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'new',
    },
    // Internal admin notes (optional, never shown to applicants).
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
    // Reply / conversation workflow (mirrors ContactMessage).
    replied: { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
    replies: [
      {
        body: {
          type: String,
          required: [true, 'Reply body is required'],
          trim: true,
          maxlength: [4000, 'Reply cannot exceed 4000 characters'],
        },
        adminName: { type: String, trim: true, default: 'Admin' },
        emailSent: { type: Boolean, default: false },
        sentAt: { type: Date, default: null },
        createdAt: { type: Date, default: Date.now },
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

export default mongoose.model('Application', applicationSchema);