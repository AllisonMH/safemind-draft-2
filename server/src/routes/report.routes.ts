import { Router } from 'express';
import { query } from 'express-validator';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get(
  '/dashboard',
  reportController.getDashboardStats
);

router.get(
  '/youth/:youthId',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  reportController.getYouthReport
);

router.get(
  '/trends',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  reportController.getTrends
);

export default router;
