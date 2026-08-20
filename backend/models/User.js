import mongoose from 'mongoose';

/**
 * User account. Passwords are stored ONLY as a bcrypt hash.
 * The passwordHash field is never returned by default (select:false) and is
 * stripped from every JSON response so it can never reach the frontend.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    firstName: { type: String, trim: true, maxlength: 80, default: '' },
    lastName: { type: String, trim: true, maxlength: 80, default: '' },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.passwordHash; // NEVER expose password hashes
        return ret;
      },
    },
  }
);

export default mongoose.model('User', userSchema);
