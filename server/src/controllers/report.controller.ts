import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import Youth from '../models/Youth';
import Alert from '../models/Alert';
import Analysis from '../models/Analysis';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const totalYouth = await Youth.count({
      where: { guardianId: req.userId },
    });

    const activeAlerts = await Alert.count({
      where: {
        guardianId: req.userId,
        status: { [Op.in]: ['pending', 'acknowledged'] },
      },
    });

    const criticalAlerts = await Alert.count({
      where: {
        guardianId: req.userId,
        severity: 'critical',
        status: { [Op.in]: ['pending', 'acknowledged'] },
      },
    });

    const youth = await Youth.findAll({
      where: { guardianId: req.userId },
      attributes: ['id', 'firstName', 'lastName', 'riskLevel', 'monitoringEnabled'],
    });

    const recentAnalyses = await Analysis.count({
      where: {
        youthId: { [Op.in]: youth.map((y) => y.id) },
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const harmfulContent = await Analysis.count({
      where: {
        youthId: { [Op.in]: youth.map((y) => y.id) },
        isHarmful: true,
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      stats: {
        totalYouth,
        activeAlerts,
        criticalAlerts,
        recentAnalyses,
        harmfulContentLastWeek: harmfulContent,
      },
      youth,
    });
  } catch (error) {
    next(error);
  }
};

export const getYouthReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { youthId } = req.params;
    const { startDate, endDate } = req.query;

    const youth = await Youth.findOne({
      where: {
        id: youthId,
        guardianId: req.userId,
      },
    });

    if (!youth) {
      throw new AppError('Youth not found or unauthorized', 404);
    }

    const dateFilter: any = { youthId };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate as string);
    }

    const totalAnalyses = await Analysis.count({ where: dateFilter });
    const harmfulAnalyses = await Analysis.count({ where: { ...dateFilter, isHarmful: true } });

    const riskDistribution = await Analysis.findAll({
      where: dateFilter,
      attributes: [
        'riskLevel',
        [Analysis.sequelize!.fn('COUNT', '*'), 'count'],
      ],
      group: ['riskLevel'],
    });

    const alerts = await Alert.findAll({
      where: {
        youthId,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { [Op.gte]: new Date(startDate as string) } : {}),
            ...(endDate ? { [Op.lte]: new Date(endDate as string) } : {}),
          },
        } : {}),
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      youth: {
        id: youth.id,
        firstName: youth.firstName,
        lastName: youth.lastName,
        age: youth.age,
        riskLevel: youth.riskLevel,
      },
      summary: {
        totalAnalyses,
        harmfulAnalyses,
        harmfulPercentage: totalAnalyses > 0 ? ((harmfulAnalyses / totalAnalyses) * 100).toFixed(2) : 0,
        riskDistribution,
      },
      recentAlerts: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { startDate, endDate } = req.query;

    const youth = await Youth.findAll({
      where: { guardianId: req.userId },
      attributes: ['id'],
    });

    const youthIds = youth.map((y) => y.id);

    const dateFilter: any = { youthId: { [Op.in]: youthIds } };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) dateFilter.createdAt[Op.lte] = new Date(endDate as string);
    }

    const dailyTrends = await Analysis.findAll({
      where: dateFilter,
      attributes: [
        [Analysis.sequelize!.fn('DATE', Analysis.sequelize!.col('createdAt')), 'date'],
        [Analysis.sequelize!.fn('COUNT', '*'), 'total'],
        [Analysis.sequelize!.fn('SUM', Analysis.sequelize!.literal('CASE WHEN "isHarmful" = true THEN 1 ELSE 0 END')), 'harmful'],
      ],
      group: [Analysis.sequelize!.fn('DATE', Analysis.sequelize!.col('createdAt'))],
      order: [[Analysis.sequelize!.fn('DATE', Analysis.sequelize!.col('createdAt')), 'ASC']],
    });

    const categoryTrends = await Analysis.findAll({
      where: { ...dateFilter, isHarmful: true },
      attributes: [
        [Analysis.sequelize!.fn('AVG', Analysis.sequelize!.col('toxicityScore')), 'avgToxicity'],
        [Analysis.sequelize!.fn('AVG', Analysis.sequelize!.col('threatScore')), 'avgThreat'],
        [Analysis.sequelize!.fn('AVG', Analysis.sequelize!.col('insultScore')), 'avgInsult'],
        [Analysis.sequelize!.fn('AVG', Analysis.sequelize!.col('identityAttackScore')), 'avgIdentityAttack'],
      ],
    });

    res.json({
      dailyTrends,
      categoryAverages: categoryTrends[0] || {},
    });
  } catch (error) {
    next(error);
  }
};
