import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { DashboardStats, Youth } from '../types';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [youth, setYouth] = useState<Youth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data.stats);
        setYouth(data.youth);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Youth"
            value={stats?.totalYouth || 0}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Alerts"
            value={stats?.activeAlerts || 0}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Alerts"
            value={stats?.criticalAlerts || 0}
            icon={<ErrorIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Analyses"
            value={stats?.recentAnalyses || 0}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#388e3c"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Monitored Youth
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {youth.map(y => (
            <Grid item xs={12} sm={6} md={4} key={y.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {y.firstName} {y.lastName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Age: {y.age}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Chip
                      label={y.riskLevel.toUpperCase()}
                      color={getRiskColor(y.riskLevel) as any}
                      size="small"
                    />
                    <Chip
                      label={y.monitoringEnabled ? 'Monitoring' : 'Paused'}
                      color={y.monitoringEnabled ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {youth.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No youth profiles yet. Add a youth profile to start monitoring.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
