import { Router } from 'express';
import {
  updateProfile,
  saveProduct,
  unsaveProduct,
  getSavedProducts,
  getSearchHistory,
  getDashboardStats,
} from '../controllers/user.controller';
import { auth } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(auth);

// GET /api/users/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/users/saved-products
router.get('/saved-products', getSavedProducts);

// GET /api/users/search-history
router.get('/search-history', getSearchHistory);

// PUT /api/users/profile
router.put('/profile', updateProfile);

// POST /api/users/save-product/:productId
router.post('/save-product/:productId', saveProduct);

// DELETE /api/users/unsave-product/:productId
router.delete('/unsave-product/:productId', unsaveProduct);

export default router;
