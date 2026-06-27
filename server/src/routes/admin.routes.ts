import { Router } from 'express';
import { getAnalytics } from '../controllers/admin.controller';
import { adminOnly } from '../middleware/auth';

const router = Router();

// All routes require admin privileges
router.use(adminOnly);

// GET /api/admin/analytics
router.get('/analytics', getAnalytics);

export default router;
