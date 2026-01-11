import { Router } from 'express';
import { body } from 'express-validator';
import * as analysisController from '../controllers/analysis.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('text').trim().notEmpty().isLength({ max: 10000 }),
    body('youthId').isUUID(),
    body('conversationId').optional().isUUID(),
    body('platform').optional().trim(),
  ],
  analysisController.analyzeText
);

router.get('/youth/:youthId', analysisController.getAnalysesByYouth);

router.get('/conversation/:conversationId', analysisController.getAnalysesByConversation);

export default router;
