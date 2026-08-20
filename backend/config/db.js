import mongoose from 'mongoose';

// Never let Mongoose buffer commands against an unavailable database:
// requests fail fast instead of hanging until a timeout fires.
mongoose.set('bufferCommands', false);

/**
 * Strip credentials out of a database error message so a MongoDB username /
 * password can NEVER leak into logs. Redacts anything that looks like
 * `user:pass@` inside a connection string.
 */
function sanitizeDbError(message) {
  if (typeof message !== 'string') return String(message);
  return message.replace(/(\/\/)([^/@\s]+):([^/@\s]+)@/g, '$1[REDACTED]:[REDACTED]@');
}

/**
 * Establish a connection to MongoDB using the MONGODB_URI environment var.
 *
 * The connection string must live ONLY in backend/.env (never in source code
 * and never anywhere in the frontend). This function is called from server.js;
 * server.js catches failures and keeps the HTTP server available.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env and restart the server.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // fail fast with a clear message if MongoDB is unreachable
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${sanitizeDbError(error.message)}`);
    // Rethrow with a sanitized message so callers (server.js) never log a
    // value that could contain credentials.
    throw new Error(sanitizeDbError(error.message));
  }
};

export default connectDB;
