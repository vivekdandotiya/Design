import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/review.controller';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/reviews/product/:productId (public)
router.get('/product/:productId', getProductReviews);

// POST /api/reviews (protected)
router.post('/', auth, createReview);

// PUT /api/reviews/:id (protected)
router.put('/:id', auth, updateReview);

// DELETE /api/reviews/:id (protected)
router.delete('/:id', auth, deleteReview);

export default router;
