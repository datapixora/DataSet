import { Router } from 'express';
import uploadsController from '../controllers/uploads.controller';
import { uploadCompleteValidation, uuidParam, paginationValidation } from '../utils/validators';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// User upload endpoints (require authentication)
router.post(
  '/initiate',
  authenticate,
  [
    body('filename').notEmpty().withMessage('Filename is required'),
    body('file_size').isInt({ min: 1 }).withMessage('Valid file size is required'),
    body('mime_type').isIn(['image/jpeg', 'image/jpg', 'image/png']).withMessage('Invalid mime type'),
  ],
  validate,
  uploadsController.initiateUpload
);

router.post(
  '/complete',
  authenticate,
  uploadCompleteValidation,
  validate,
  uploadsController.completeUpload
);

router.get(
  '/my-uploads',
  authenticate,
  paginationValidation,
  validate,
  uploadsController.getMyUploads
);

router.get(
  '/:id',
  authenticate,
  uuidParam,
  validate,
  uploadsController.getUploadById
);

// Admin endpoints (TODO: add admin middleware)
router.get(
  '/admin/all',
  authenticate,
  paginationValidation,
  validate,
  uploadsController.getAllUploads
);

router.get(
  '/admin/pending',
  authenticate,
  paginationValidation,
  validate,
  uploadsController.getPendingUploads
);

router.post(
  '/:id/approve',
  authenticate,
  uuidParam,
  validate,
  uploadsController.approveUpload
);

router.post(
  '/:id/reject',
  authenticate,
  [
    uuidParam,
    body('reason').notEmpty().withMessage('Rejection reason is required'),
  ],
  validate,
  uploadsController.rejectUpload
);

export default router;
