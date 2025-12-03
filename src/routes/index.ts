import { Router } from 'express';
import authRoutes from './auth.routes';
import campaignsRoutes from './campaigns.routes';
import uploadsRoutes from './uploads.routes';
import usersRoutes from './users.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/users', usersRoutes);

export default router;
