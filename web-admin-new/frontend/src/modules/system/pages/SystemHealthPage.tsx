// System Health & Monitoring Page - Real-Time WebSocket Monitoring
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Chip, 
  GridLegacy as Grid, 
  IconButton, 
  LinearProgress,
  Badge,
  Stack,
  Divider,
  Paper,
  Alert,
  Button,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  Refresh, 
  HealthAndSafety, 
  Memory, 
  Speed, 
  Storage,
  CloudQueue,
  NetworkCheck,
  Timer,
  TrendingUp,
  TrendingDown,
  Circle,
  PlayArrow,
  Pause,
  Notifications,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [liveMetrics, setLiveMetrics] = useState({
    activeConnections: 1247,
    requestsPerSecond: 156,
    avgResponseTime: 46,
    errorRate: 0.12,
  });
  const [alerts, setAlerts] = useState<any[]>([]);

  // Simulate real-time WebSocket updates
  useEffect(() => {
    if (!isLiveMonitoring) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Update live metrics
      setLiveMetrics({
        activeConnections: 1200 + Math.floor(Math.random() * 100),
        requestsPerSecond: 140 + Math.floor(Math.random() * 40),
        avgResponseTime: 40 + Math.floor(Math.random() * 20),
        errorRate: 0.1 + Math.random() * 0.1,
      });

      // Update realtime data for charts
      setRealtimeData(prev => {
        const newData = {
          time: new Date().toLocaleTimeString(),
          cpu: 20 + Math.floor(Math.random() * 50),
          memory: 40 + Math.floor(Math.random() * 40),
          requests: 100 + Math.floor(Math.random() * 200),
          responseTime: 30 + Math.floor(Math.random() * 80),
        };
        const updated = [...prev, newData].slice(-20); // Keep last 20 data points
        return updated;
      });

      // Randomly generate alerts
      if (Math.random() > 0.95) {
        const alertTypes = [
          { type: 'warning', message: 'High CPU usage detected on Payment Service', service: 'Payment Service' },
          { type: 'error', message: 'Database connection pool exhausted', service: 'Database' },
          { type: 'info', message: 'Cache hit rate improved to 98%', service: 'Redis Cache' },
        ];
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        setAlerts(prev => [{
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          ...randomAlert
        }, ...prev].slice(0, 5)); // Keep last 5 alerts
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLiveMonitoring]);

  // Initialize realtime data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString(),
      cpu: 20 + Math.floor(Math.random() * 50),
      memory: 40 + Math.floor(Math.random() * 40),
      requests: 100 + Math.floor(Math.random() * 200),
      responseTime: 30 + Math.floor(Math.random() * 80),
    }));
    setRealtimeData(initialData);
  }, []);

  const services = [
    { id: 1, name: 'API Gateway', status: 'Healthy', uptime: 99.9, lastRestart: '2025-10-01', responseTime: 45, cpu: 25, memory: 512 },
    { id: 2, name: 'Auth Service', status: 'Healthy', uptime: 99.8, lastRestart: '2025-10-05', responseTime: 32, cpu: 18, memory: 256 },
    { id: 3, name: 'Payment Service', status: 'Warning', uptime: 98.5, lastRestart: '2025-10-29', responseTime: 120, cpu: 65, memory: 1024 },
    { id: 4, name: 'Notification Service', status: 'Healthy', uptime: 99.7, lastRestart: '2025-10-10', responseTime: 55, cpu: 30, memory: 512 },
    { id: 5, name: 'Database Primary', status: 'Healthy', uptime: 99.9, lastRestart: '2025-09-15', responseTime: 15, cpu: 45, memory: 2048 },
    { id: 6, name: 'Redis Cache', status: 'Healthy', uptime: 99.9, lastRestart: '2025-10-01', responseTime: 5, cpu: 20, memory: 512 },
    { id: 7, name: 'Message Queue', status: 'Healthy', uptime: 99.6, lastRestart: '2025-10-20', responseTime: 25, cpu: 35, memory: 1024 },
    { id: 8, name: 'Storage Service', status: 'Healthy', uptime: 99.8, lastRestart: '2025-10-12', responseTime: 75, cpu: 40, memory: 768 },
  ];

  const errors = [
    { id: 1, timestamp: '2025-10-31 14:30:45', service: 'Payment Service', error: 'Connection timeout', severity: 'High', status: 'Open' },
    { id: 2, timestamp: '2025-10-31 12:15:22', service: 'API Gateway', error: 'Rate limit exceeded', severity: 'Medium', status: 'Resolved' },
    { id: 3, timestamp: '2025-10-30 18:45:10', service: 'Database', error: 'Slow query detected', severity: 'Low', status: 'Investigating' },
    { id: 4, timestamp: '2025-10-30 09:20:33', service: 'Auth Service', error: '401 Unauthorized spike', severity: 'High', status: 'Resolved' },
  ];

  const performanceData = [
    { time: '00:00', cpu: 25, memory: 45, requests: 1200 },
    { time: '04:00', cpu: 20, memory: 42, requests: 800 },
    { time: '08:00', cpu: 45, memory: 55, requests: 3500 },
    { time: '12:00', cpu: 65, memory: 68, requests: 5200 },
    { time: '16:00', cpu: 55, memory: 60, requests: 4800 },
    { time: '20:00', cpu: 35, memory: 50, requests: 2500 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'success';
      case 'Warning': return 'warning';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  const serviceColumns: GridColDef[] = [
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={params.value === 'Healthy' ? <CheckCircle /> : <Warning />}
          label={params.value} 
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
    { field: 'name', headerName: 'Service Name', width: 200 },
    { 
      field: 'uptime', 
      headerName: 'Uptime', 
      width: 120,
      renderCell: (params) => <Typography fontWeight="bold" color="success.main">{params.value}%</Typography>
    },
    { field: 'responseTime', headerName: 'Response (ms)', width: 130 },
    { field: 'cpu', headerName: 'CPU %', width: 100, renderCell: (params) => `${params.value}%` },
    { field: 'memory', headerName: 'Memory (MB)', width: 130 },
    { field: 'lastRestart', headerName: 'Last Restart', width: 130 },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: () => (
      <IconButton size="small" color="primary"><Refresh fontSize="small" /></IconButton>
    )},
  ];

  const errorColumns: GridColDef[] = [
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
    { field: 'service', headerName: 'Service', width: 180 },
    { field: 'error', headerName: 'Error Message', width: 250 },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 110,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    { field: 'status', headerName: 'Status', width: 130 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header with Live Monitoring Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" fontWeight="bold">System Health & Monitoring</Typography>
            <Badge 
              color={isLiveMonitoring ? "success" : "default"} 
              variant="dot"
              sx={{ '& .MuiBadge-badge': { animation: isLiveMonitoring ? 'pulse 2s infinite' : 'none' } }}
            >
              <Chip 
                label={isLiveMonitoring ? "LIVE" : "PAUSED"} 
                size="small" 
                color={isLiveMonitoring ? "success" : "default"}
                icon={<Circle sx={{ fontSize: 8 }} />}
              />
            </Badge>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Real-time system status • Last update: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={isLiveMonitoring ? "outlined" : "contained"}
            size="small"
            startIcon={isLiveMonitoring ? <Pause /> : <PlayArrow />}
            onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
          >
            {isLiveMonitoring ? 'Pause' : 'Resume'}
          </Button>
          <IconButton color="primary"><Refresh /></IconButton>
        </Stack>
      </Box>

      {/* Live Metrics Banner */}
      <Paper sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Active Connections</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">{liveMetrics.activeConnections}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Requests/Second</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">{liveMetrics.requestsPerSecond}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Avg Response Time</Typography>
            <Typography variant="h5" fontWeight="bold">{liveMetrics.avgResponseTime}ms</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Error Rate</Typography>
            <Typography variant="h5" fontWeight="bold" color={liveMetrics.errorRate > 0.2 ? "error.main" : "success.main"}>
              {liveMetrics.errorRate.toFixed(2)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Live Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              severity={alert.type as any} 
              sx={{ mb: 1 }}
              onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            >
              <Typography variant="body2">
                <strong>[{alert.timestamp}] {alert.service}:</strong> {alert.message}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HealthAndSafety color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Services Healthy</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="success.main">7/8</Typography>
            <Typography variant="caption">87.5% operational</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">46ms</Typography>
            <Typography variant="caption" color="success.main">↓ 12% vs yesterday</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Memory color="warning" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Avg CPU Usage</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">36%</Typography>
            <LinearProgress variant="determinate" value={36} sx={{ mt: 1 }} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Error color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Open Incidents</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="error.main">2</Typography>
            <Typography variant="caption">1 high, 1 low</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Microservices" />
        <Tab label="Performance" />
        <Tab label="Error Logs" />
        <Tab label="Alerts" />
      </Tabs>

      {activeTab === 0 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Microservices Status</Typography>
          <DataGrid rows={services} columns={serviceColumns} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} />
        </CardContent></Card>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Real-Time Performance Monitoring */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  🔴 Live Performance Metrics
                </Typography>
                <Chip 
                  label={`Updating every 2s • ${realtimeData.length} data points`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={realtimeData}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stroke="#2196f3" fill="url(#colorCpu)" name="CPU %" />
                  <Area type="monotone" dataKey="memory" stroke="#ff9800" fill="url(#colorMemory)" name="Memory %" />
                  <Area type="monotone" dataKey="responseTime" stroke="#4caf50" fill="url(#colorResponse)" name="Response Time (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  CPU & Memory Usage (Last 40 seconds)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#2196f3" name="CPU %" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="memory" stroke="#ff9800" name="Memory %" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Request Volume (Live)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#4caf50" name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Error Logs</Typography>
          <DataGrid rows={errors} columns={errorColumns} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} />
        </CardContent></Card>
      )}

      {activeTab === 3 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Alert Configuration</Typography>
          <Typography variant="body2" color="text.secondary">Configure alert rules and thresholds</Typography>
        </CardContent></Card>
      )}
    </Box>
  );
};

export default SystemHealthPage;

