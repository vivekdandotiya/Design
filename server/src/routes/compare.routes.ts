import { Router } from 'express';
import { compareProducts } from '../controllers/compare.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// POST /api/compare (public)
router.post('/', optionalAuth as any, compareProducts);

export default router;
