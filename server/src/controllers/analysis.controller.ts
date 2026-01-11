import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import Youth from '../models/Youth';
import Conversation from '../models/Conversation';
import Analysis from '../models/Analysis';
import { mlService } from '../services/ml.service';
import { alertService } from '../services/alert.service';

export const analyzeText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { text, youthId, conversationId, platform } = req.body;

    const youth = await Youth.findOne({
      where: {
        id: youthId,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found or unauthorized', 404);
    }

    if (!youth.monitoringEnabled) {
      throw new AppError('Monitoring is disabled for this youth', 400);
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    } else if (platform) {
      const conversationHash = crypto.createHash('sha256')
        .update(`${youthId}-${platform}-${Date.now()}`)
        .digest('hex');

      conversation = await Conversation.create({
        youthId,
        platform,
        conversationHash,
      });
    }

    const mlResponse = await mlService.analyzeText(text, youthId, conversation?.id);

    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    const analysis = await Analysis.create({
      conversationId: conversation?.id || '',
      youthId,
      text,
      textHash,
      toxicityScore: mlResponse.scores.toxicity,
      severeToxicityScore: mlResponse.scores.severe_toxicity,
      obsceneScore: mlResponse.scores.obscene,
      threatScore: mlResponse.scores.threat,
      insultScore: mlResponse.scores.insult,
      identityAttackScore: mlResponse.scores.identity_attack,
      isHarmful: mlResponse.is_harmful,
      riskLevel: mlResponse.risk_level,
      categoriesExceeded: mlResponse.categories_exceeded,
    });

    if (mlResponse.is_harmful && ['high', 'critical'].includes(mlResponse.risk_level)) {
      await alertService.createAlert(analysis, youth, req.userId);
    }

    if (mlResponse.risk_level !== youth.riskLevel) {
      await youth.update({ riskLevel: mlResponse.risk_level });
    }

    res.json({
      analysis: {
        id: analysis.id,
        scores: {
          toxicity: analysis.toxicityScore,
          severeToxicity: analysis.severeToxicityScore,
          obscene: analysis.obsceneScore,
          threat: analysis.threatScore,
          insult: analysis.insultScore,
          identityAttack: analysis.identityAttackScore,
        },
        isHarmful: analysis.isHarmful,
        riskLevel: analysis.riskLevel,
        categoriesExceeded: analysis.categoriesExceeded,
        timestamp: analysis.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysesByYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { youthId } = req.params;

    const youth = await Youth.findOne({
      where: {
        id: youthId,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found or unauthorized', 404);
    }

    const analyses = await Analysis.findAll({
      where: { youthId },
      order: [['createdAt', 'DESC']],
      limit: 100,
      attributes: { exclude: ['text'] },
    });

    res.json({ analyses });
  } catch (error) {
    next(error);
  }
};

export const getAnalysesByConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { conversationId } = req.params;

    const conversation = await Conversation.findByPk(conversationId, {
      include: [{ model: Youth, as: 'youth' }],
    });

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const analyses = await Analysis.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      attributes: { exclude: ['text'] },
    });

    res.json({ analyses });
  } catch (error) {
    next(error);
  }
};
