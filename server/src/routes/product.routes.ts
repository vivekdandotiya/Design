import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../controllers/product.controller';
import { adminOnly } from '../middleware/auth';

const router = Router();

// GET /api/products (public)
router.get('/', getProducts);

// GET /api/products/search (public)
router.get('/search', searchProducts);

// GET /api/products/:id (public)
router.get('/:id', getProduct);

// POST /api/products (admin only)
router.post('/', adminOnly, createProduct);

// PUT /api/products/:id (admin only)
router.put('/:id', adminOnly, updateProduct);

// DELETE /api/products/:id (admin only)
router.delete('/:id', adminOnly, deleteProduct);

export default router;
