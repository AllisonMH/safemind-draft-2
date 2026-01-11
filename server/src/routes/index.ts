import { Router } from 'express';
import authRoutes from './auth.routes';
import youthRoutes from './youth.routes';
import analysisRoutes from './analysis.routes';
import alertRoutes from './alert.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/youth', youthRoutes);
router.use('/analyze', analysisRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);

export default router;
