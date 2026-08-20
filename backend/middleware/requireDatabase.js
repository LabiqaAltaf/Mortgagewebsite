import mongoose from 'mongoose';

/**
 * Guard for routes that need the database. Returns a clean 503 (instead of a
 * hung request or a raw crash) when MongoDB is not connected.
 */
const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently unavailable. Check MONGODB_URI in backend/.env',
    });
  }
  next();
};

export default requireDatabase;