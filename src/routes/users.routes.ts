import { Router } from 'express';
import usersController from '../controllers/users.controller';
import { paginationValidation } from '../utils/validators';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', usersController.getStats);

router.get(
  '/transactions',
  paginationValidation,
  validate,
  usersController.getTransactions
);

router.get('/earnings', usersController.getEarningsSummary);

router.patch(
  '/profile',
  [
    body('fullName').optional().trim().isLength({ min: 2 }),
    body('countryCode').optional().isISO31661Alpha2(),
    body('language').optional().isLength({ min: 2, max: 10 }),
    body('phone').optional().isMobilePhone('any'),
  ],
  validate,
  usersController.updateProfile
);

router.post(
  '/payout-method',
  [
    body('method').isIn(['stripe', 'paypal', 'bank']).withMessage('Invalid payout method'),
    body('details').isObject().withMessage('Payout details required'),
  ],
  validate,
  usersController.setPayoutMethod
);

export default router;
