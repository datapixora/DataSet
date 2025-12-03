import { Router } from 'express';
import seedController from '../controllers/seed.controller';

const router = Router();

// Seed endpoint - can be called to populate database with sample data
router.post('/', seedController.seed);

export default router;
