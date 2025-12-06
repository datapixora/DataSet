import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import uploadsRoutes from './uploads.routes';
import campaignsRoutes from './campaigns.routes';
import adminRoutes from './admin.routes'; // Import admin routes
import seedRoutes from './seed.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/campaigns', campaignsRoutes);
router.use('/admin', adminRoutes); // Use admin routes

if (process.env.NODE_ENV === 'development') {
  router.use('/seed', seedRoutes);
}

export default router;
