/**
 * Performance Dashboard Component
 * Real-time performance monitoring and metrics display
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { monitoringService, PerformanceMetrics, ErrorInfo, SystemHealth } from '../../utils/monitoring';

interface PerformanceDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isOpen = true, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    performance: true,
    errors: false,
    system: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    const updateData = () => {
      setMetrics(monitoringService.getMetrics());
      setErrors(monitoringService.getErrors());
    };

    // Update data immediately
    updateData();

    // Set up interval for real-time updates
    const interval = setInterval(updateData, 5000);

    // Check system health
    const checkHealth = async () => {
      try {
        const health = await monitoringService.getSystemHealth();
        setSystemHealth(health);
      } catch (error) {
        console.error('Failed to check system health:', error);
      }
    };

    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getPerformanceStatus = (metric: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
    if (metric <= thresholds.good) return 'good';
    if (metric <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor') => {
    switch (status) {
      case 'good': return 'success';
      case 'needs-improvement': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: 'good' | 'needs-improvement' | 'poor') => {
    switch (status) {
      case 'good': return <CheckCircleIcon color="success" />;
      case 'needs-improvement': return <WarningIcon color="warning" />;
      case 'poor': return <ErrorIcon color="error" />;
      default: return null;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 20,
        width: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 9999,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="div">
              <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Performance Dashboard
            </Typography>
            <IconButton size="small" onClick={onClose}>
              ×
            </IconButton>
          </Box>

          {/* Performance Metrics Section */}
          <Box mb={2}>
            <Box
              display="flex"
              alignItems="center"
              onClick={() => toggleSection('performance')}
              sx={{ cursor: 'pointer', mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Performance Metrics
              </Typography>
              {expandedSections.performance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedSections.performance}>
              <Grid container spacing={2}>
                {metrics.length > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Page Load Time
                          </Typography>
                          <Typography variant="h6">
                            {formatTime(metrics[metrics.length - 1]?.pageLoadTime || 0)}
                          </Typography>
                          <Chip
                            size="small"
                            label={getPerformanceStatus(metrics[metrics.length - 1]?.pageLoadTime || 0, { good: 2000, poor: 4000 })}
                            color={getStatusColor(getPerformanceStatus(metrics[metrics.length - 1]?.pageLoadTime || 0, { good: 2000, poor: 4000 }))}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Memory Usage
                          </Typography>
                          <Typography variant="h6">
                            {formatBytes(metrics[metrics.length - 1]?.memoryUsage || 0)}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((metrics[metrics.length - 1]?.memoryUsage || 0) / (50 * 1024 * 1024) * 100, 100)}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>
            </Collapse>
          </Box>

          {/* Errors Section */}
          <Box mb={2}>
            <Box
              display="flex"
              alignItems="center"
              onClick={() => toggleSection('errors')}
              sx={{ cursor: 'pointer', mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Errors ({errors.length})
              </Typography>
              {expandedSections.errors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedSections.errors}>
              {errors.length === 0 ? (
                <Alert severity="success">
                  <AlertTitle>No Errors</AlertTitle>
                  No errors detected in the current session.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Severity</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {errors.slice(-5).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              size="small"
                              label={error.severity}
                              color={error.severity === 'critical' ? 'error' : error.severity === 'high' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {error.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Collapse>
          </Box>

          {/* System Health Section */}
          <Box mb={2}>
            <Box
              display="flex"
              alignItems="center"
              onClick={() => toggleSection('system')}
              sx={{ cursor: 'pointer', mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                System Health
              </Typography>
              {expandedSections.system ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expandedSections.system}>
              {systemHealth ? (
                <Box>
                  <Alert 
                    severity={systemHealth.status === 'healthy' ? 'success' : systemHealth.status === 'degraded' ? 'warning' : 'error'}
                    sx={{ mb: 2 }}
                  >
                    <AlertTitle>System Status: {systemHealth.status.toUpperCase()}</AlertTitle>
                    Overall system health is {systemHealth.status}.
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Database
                          </Typography>
                          <Typography variant="h6">
                            {systemHealth.database.status}
                          </Typography>
                          <Typography variant="caption">
                            {formatTime(systemHealth.database.responseTime)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Memory Usage
                          </Typography>
                          <Typography variant="h6">
                            {systemHealth.memory.percentage.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={systemHealth.memory.percentage}
                            sx={{ mt: 1 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Alert severity="info">
                  <AlertTitle>Loading...</AlertTitle>
                  Checking system health...
                </Alert>
              )}
            </Collapse>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceDashboard;