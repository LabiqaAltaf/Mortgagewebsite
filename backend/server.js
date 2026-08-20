import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import applicationRoutes from './routes/applicationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import lenderRoutes from './routes/lenderRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
  });
});

app.use('/api/applications', applicationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/lenders', lenderRoutes);

app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/content', contentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let dbReady = false;
export const ensureDbConnection = async () => {
  if (dbReady) return;
  try {
    await connectDB();
    console.log('MongoDB connection established successfully.');
    dbReady = true;
  } catch (error) {
    console.error('MongoDB connection FAILED.');
    console.error(`  Reason: ${error.message}`);
    console.error('  Database endpoints will fail until MONGODB_URI is valid.');
  }
};

if (!process.env.VERCEL) {
  ensureDbConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
