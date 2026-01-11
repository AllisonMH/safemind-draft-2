import axios from 'axios';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';
import crypto from 'crypto';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

interface MLAnalysisResponse {
  text: string;
  scores: {
    toxicity: number;
    severe_toxicity: number;
    obscene: number;
    threat: number;
    insult: number;
    identity_attack: number;
  };
  is_harmful: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  categories_exceeded: string[];
  timestamp: string;
}

class MLService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ML_SERVICE_URL;
  }

  async analyzeText(text: string, userId?: string, conversationId?: string): Promise<MLAnalysisResponse> {
    try {
      const cacheKey = `ml:analysis:${crypto.createHash('sha256').update(text).digest('hex')}`;

      const cachedResult = await redisClient.get(cacheKey);
      if (cachedResult) {
        logger.info('ML analysis cache hit');
        return JSON.parse(cachedResult);
      }

      logger.info('Calling ML service for text analysis');

      const response = await axios.post<MLAnalysisResponse>(
        `${this.baseUrl}/api/v1/analyze`,
        {
          text,
          user_id: userId,
          conversation_id: conversationId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      await redisClient.setex(cacheKey, 3600, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      logger.error('ML service error:', error);
      throw new Error('Failed to analyze text with ML service');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('ML service health check failed:', error);
      return false;
    }
  }
}

export const mlService = new MLService();
