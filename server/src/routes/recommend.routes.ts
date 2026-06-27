import { Router } from 'express';
import { getRecommendation } from '../controllers/recommend.controller';

const router = Router();

// POST /api/recommend (public)
router.post('/', getRecommendation);

export default router;
