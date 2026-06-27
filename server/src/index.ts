import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/error';

// Route imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import compareRoutes from './routes/compare.routes';
import recommendRoutes from './routes/recommend.routes';
import reviewRoutes from './routes/review.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CompareWise AI API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 CompareWise AI server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
