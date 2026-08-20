import mongoose from 'mongoose';

/**
 * Lender/partner shown on the public "Popular Lenders" section.
 * Managed from the Admin Dashboard. Only active lenders appear publicly.
 */
const lenderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    icon: {
      type: String,
      default: 'bi-bank',
    },
    color: {
      type: String,
      default: '#1769ff',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
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

export default mongoose.model('Lender', lenderSchema);