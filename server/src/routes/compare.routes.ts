import { Router } from 'express';
import { compareProducts } from '../controllers/compare.controller';

const router = Router();

// POST /api/compare (public)
router.post('/', compareProducts);

export default router;
