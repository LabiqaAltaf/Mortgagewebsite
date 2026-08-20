/**
 * 404 handler - unknown routes.
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Central error handler.
 * Never exposes stack traces or internal details to clients, and never logs
 * anything that could contain credentials.
 */
export const errorHandler = (err, req, res, next) => {
  // Mongoose validation error -> 400 with the validation messages.
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Duplicate key (e.g. unique index) -> 409.
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({ success: false, message: 'That record already exists.' });
  }

  // Invalid MongoDB ObjectId -> 400.
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid record identifier.' });
  }

  // JWT errors -> 401.
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }

  // CORS rejection -> 403.
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
  }

  // Body parse error (malformed JSON) -> 400.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON in request body.' });
  }

  // Database is not reachable -> safe, generic message.
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoServerSelectionError') {
    return res.status(503).json({ success: false, message: 'Database is currently unavailable.' });
  }

  if (res.headersSent) {
    return next(err);
  }

  console.error(`Unhandled error: ${err.message}`);
  res.status(err.status || 500).json({ success: false, message: 'Server error.' });
};