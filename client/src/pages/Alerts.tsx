import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert as MuiAlert,
  Button,
} from '@mui/material';
import { apiService } from '../services/api';
import { Alert } from '../types';
import { format } from 'date-fns';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data.alerts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await apiService.acknowledgeAlert(id);
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiService.resolveAlert(id);
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alerts
      </Typography>

      {error && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
      )}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {alerts.map(alert => (
          <Grid item xs={12} key={alert.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={alert.severity.toUpperCase()}
                        color={getSeverityColor(alert.severity) as any}
                        size="small"
                      />
                      <Chip label={alert.status.toUpperCase()} size="small" />
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {alert.message}
                    </Typography>
                    {alert.youth && (
                      <Typography variant="body2" color="text.secondary">
                        Youth: {alert.youth.firstName} {alert.youth.lastName}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(alert.createdAt), 'PPpp')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    {alert.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {alerts.length === 0 && (
        <MuiAlert severity="info" sx={{ mt: 2 }}>
          No alerts at this time.
        </MuiAlert>
      )}
    </Box>
  );
};

export default Alerts;
