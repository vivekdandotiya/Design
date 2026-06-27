import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, forgotPassword, googleLogin } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// GET /api/auth/me (protected)
router.get('/me', auth, getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/google-login
router.post('/google-login', googleLogin);

export default router;
