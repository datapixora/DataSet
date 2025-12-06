import { Router } from 'express';
import { getEarningsStats } from '../controllers/admin.controllers';

const router = Router();

// A protected route (we'll need to add admin middleware later)
router.get('/stats/earnings', getEarningsStats);

export default router;
