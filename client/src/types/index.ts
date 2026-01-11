export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'guardian' | 'counselor';
}

export interface Youth {
  id: string;
  guardianId: string;
  firstName: string;
  lastName: string;
  age: number;
  monitoringEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  conversationId: string;
  youthId: string;
  textHash: string;
  toxicityScore: number;
  severeToxicityScore: number;
  obsceneScore: number;
  threatScore: number;
  insultScore: number;
  identityAttackScore: number;
  isHarmful: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoriesExceeded: string[];
  createdAt: string;
}

export interface Alert {
  id: string;
  analysisId: string;
  youthId: string;
  guardianId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved' | 'escalated';
  message: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  youth?: Youth;
  analysis?: Analysis;
}

export interface DashboardStats {
  totalYouth: number;
  activeAlerts: number;
  criticalAlerts: number;
  recentAnalyses: number;
  harmfulContentLastWeek: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'guardian' | 'counselor';
}
