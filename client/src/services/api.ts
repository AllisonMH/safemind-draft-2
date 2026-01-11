import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginCredentials, RegisterData, User, Youth, Alert, DashboardStats } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Youth endpoints
  async getYouth(): Promise<{ youth: Youth[] }> {
    const response = await this.api.get('/youth');
    return response.data;
  }

  async getYouthById(id: string): Promise<{ youth: Youth }> {
    const response = await this.api.get(`/youth/${id}`);
    return response.data;
  }

  async createYouth(data: Partial<Youth>): Promise<{ youth: Youth }> {
    const response = await this.api.post('/youth', data);
    return response.data;
  }

  async updateYouth(id: string, data: Partial<Youth>): Promise<{ youth: Youth }> {
    const response = await this.api.put(`/youth/${id}`, data);
    return response.data;
  }

  async deleteYouth(id: string) {
    const response = await this.api.delete(`/youth/${id}`);
    return response.data;
  }

  // Analysis endpoints
  async analyzeText(data: { text: string; youthId: string; conversationId?: string; platform?: string }) {
    const response = await this.api.post('/analyze', data);
    return response.data;
  }

  async getAnalysesByYouth(youthId: string) {
    const response = await this.api.get(`/analyze/youth/${youthId}`);
    return response.data;
  }

  // Alert endpoints
  async getAlerts(params?: { status?: string; severity?: string }): Promise<{ alerts: Alert[] }> {
    const response = await this.api.get('/alerts', { params });
    return response.data;
  }

  async getAlertById(id: string): Promise<{ alert: Alert }> {
    const response = await this.api.get(`/alerts/${id}`);
    return response.data;
  }

  async acknowledgeAlert(id: string) {
    const response = await this.api.put(`/alerts/${id}/acknowledge`);
    return response.data;
  }

  async resolveAlert(id: string, notes?: string) {
    const response = await this.api.put(`/alerts/${id}/resolve`, { notes });
    return response.data;
  }

  async getAlertsByYouth(youthId: string): Promise<{ alerts: Alert[] }> {
    const response = await this.api.get(`/alerts/youth/${youthId}`);
    return response.data;
  }

  // Report endpoints
  async getDashboardStats(): Promise<{ stats: DashboardStats; youth: Youth[] }> {
    const response = await this.api.get('/reports/dashboard');
    return response.data;
  }

  async getYouthReport(youthId: string, startDate?: string, endDate?: string) {
    const response = await this.api.get(`/reports/youth/${youthId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async getTrends(startDate?: string, endDate?: string) {
    const response = await this.api.get('/reports/trends', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
