import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import Alert from '../models/Alert';
import Youth from '../models/Youth';
import Analysis from '../models/Analysis';

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { status, severity } = req.query;

    const where: any = { guardianId: req.userId };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Youth, as: 'youth', attributes: ['id', 'firstName', 'lastName'] },
        { model: Analysis, as: 'analysis', attributes: { exclude: ['text'] } },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

export const getAlertById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const alert = await Alert.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
      include: [
        { model: Youth, as: 'youth' },
        { model: Analysis, as: 'analysis' },
      ],
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    res.json({ alert });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const alert = await Alert.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    await alert.update({
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      acknowledgedBy: req.userId,
    });

    res.json({ alert });
  } catch (error) {
    next(error);
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const alert = await Alert.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    await alert.update({
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: req.userId,
    });

    res.json({ alert });
  } catch (error) {
    next(error);
  }
};

export const getAlertsByYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const alerts = await Alert.findAll({
      where: { youthId },
      include: [{ model: Analysis, as: 'analysis', attributes: { exclude: ['text'] } }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};
