import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { signupValidation, loginValidation } from '../utils/validators';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
