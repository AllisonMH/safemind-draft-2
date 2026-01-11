import { Router } from 'express';
import { body, param } from 'express-validator';
import * as youthController from '../controllers/youth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('age').isInt({ min: 1, max: 17 }),
  ],
  youthController.createYouth
);

router.get('/', youthController.getYouth);

router.get(
  '/:id',
  [param('id').isUUID()],
  youthController.getYouthById
);

router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('age').optional().isInt({ min: 1, max: 17 }),
    body('monitoringEnabled').optional().isBoolean(),
  ],
  youthController.updateYouth
);

router.delete(
  '/:id',
  [param('id').isUUID()],
  youthController.deleteYouth
);

export default router;
