import { Router } from 'express';
import campaignsController from '../controllers/campaigns.controller';
import { createCampaignValidation, uuidParam, paginationValidation } from '../utils/validators';
import { validate } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, paginationValidation, validate, campaignsController.getCampaigns);
router.get('/:id', uuidParam, validate, optionalAuth, campaignsController.getCampaignById);

// Protected routes (require authentication)
router.get('/recommended/for-you', authenticate, campaignsController.getRecommendedCampaigns);

// Admin routes (TODO: add admin middleware)
router.post('/', authenticate, createCampaignValidation, validate, campaignsController.createCampaign);
router.patch('/:id', authenticate, uuidParam, validate, campaignsController.updateCampaign);
router.patch('/:id/status', authenticate, uuidParam, validate, campaignsController.updateCampaignStatus);
router.delete('/:id', authenticate, uuidParam, validate, campaignsController.deleteCampaign);

export default router;
