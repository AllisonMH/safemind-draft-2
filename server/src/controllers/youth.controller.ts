import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import Youth from '../models/Youth';

export const createYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { firstName, lastName, age } = req.body;

    const youth = await Youth.create({
      guardianId: req.userId,
      firstName,
      lastName,
      age,
    });

    res.status(201).json({ youth });
  } catch (error) {
    next(error);
  }
};

export const getYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const youth = await Youth.findAll({
      where: { guardianId: req.userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ youth });
  } catch (error) {
    next(error);
  }
};

export const getYouthById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const youth = await Youth.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found', 404);
    }

    res.json({ youth });
  } catch (error) {
    next(error);
  }
};

export const updateYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const youth = await Youth.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found', 404);
    }

    const { firstName, lastName, age, monitoringEnabled } = req.body;

    await youth.update({
      firstName: firstName || youth.firstName,
      lastName: lastName || youth.lastName,
      age: age || youth.age,
      monitoringEnabled: monitoringEnabled !== undefined ? monitoringEnabled : youth.monitoringEnabled,
    });

    res.json({ youth });
  } catch (error) {
    next(error);
  }
};

export const deleteYouth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const youth = await Youth.findOne({
      where: {
        id: req.params.id,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found', 404);
    }

    await youth.destroy();

    res.json({ message: 'Youth deleted successfully' });
  } catch (error) {
    next(error);
  }
};
