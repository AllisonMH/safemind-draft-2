import { Router } from 'express';
import { param, body } from 'express-validator';
import * as alertController from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', alertController.getAlerts);

router.get(
  '/:id',
  [param('id').isUUID()],
  alertController.getAlertById
);

router.put(
  '/:id/acknowledge',
  [param('id').isUUID()],
  alertController.acknowledgeAlert
);

router.put(
  '/:id/resolve',
  [
    param('id').isUUID(),
    body('notes').optional().trim(),
  ],
  alertController.resolveAlert
);

router.get('/youth/:youthId', alertController.getAlertsByYouth);

export default router;
