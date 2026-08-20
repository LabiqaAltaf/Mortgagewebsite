import mongoose from 'mongoose';

/**
 * Client testimonial shown on the public "What Our Clients Say" section.
 * Managed from the Admin Dashboard with verification workflow.
 * Only verified + active testimonials appear publicly.
 */
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    info: {
      type: String,
      trim: true,
      maxlength: [200, 'Info cannot exceed 200 characters'],
      default: '',
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    avatar: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      required: [true, 'Testimonial text is required'],
      trim: true,
      maxlength: [2000, 'Testimonial text cannot exceed 2000 characters'],
    },
    verified: {
      type: Boolean,
      default: false,
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

export default mongoose.model('Testimonial', testimonialSchema);