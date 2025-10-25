import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AIIcon,
  Face as FaceIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Insights as InsightsIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CameraAlt as CameraIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { toast } from 'react-toastify';

interface AnalyticsData {
  recognitionRate: number;
  averageConfidence: number;
  totalRecognitions: number;
  spoofAttempts: number;
  unknownFaces: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    recognitionCount: number;
    averageConfidence: number;
    lastSeen: string;
  }>;
  hourlyStats: Array<{
    hour: string;
    recognitions: number;
    successRate: number;
    confidence: number;
  }>;
  dailyStats: Array<{
    date: string;
    recognitions: number;
    successRate: number;
    spoofAttempts: number;
  }>;
  cameraPerformance: Array<{
    cameraId: string;
    cameraName: string;
    location: string;
    recognitionRate: number;
    averageConfidence: number;
    totalDetections: number;
  }>;
  aiInsights: Array<{
    id: string;
    type: 'optimization' | 'security' | 'performance' | 'trend';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendation: string;
  }>;
}

interface PredictionData {
  predictedAttendance: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

const AIAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);

  // Mock data generation
  const generateMockData = (): AnalyticsData => {
    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      recognitions: Math.floor(Math.random() * 50) + 10,
      successRate: 85 + Math.random() * 15,
      confidence: 80 + Math.random() * 20
    }));

    const dailyStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        recognitions: Math.floor(Math.random() * 200) + 50,
        successRate: 85 + Math.random() * 15,
        spoofAttempts: Math.floor(Math.random() * 10)
      };
    }).reverse();

    const topPerformers = [
      { studentId: 'STU001', studentName: 'John Doe', recognitionCount: 45, averageConfidence: 96.8, lastSeen: new Date().toISOString() },
      { studentId: 'STU002', studentName: 'Jane Smith', recognitionCount: 38, averageConfidence: 94.2, lastSeen: new Date().toISOString() },
      { studentId: 'STU003', studentName: 'Mike Johnson', recognitionCount: 32, averageConfidence: 89.5, lastSeen: new Date().toISOString() },
      { studentId: 'STU004', studentName: 'Sarah Wilson', recognitionCount: 28, averageConfidence: 92.1, lastSeen: new Date().toISOString() },
    ];

    const cameraPerformance = [
      { cameraId: 'CAM001', cameraName: 'Main Entrance', location: 'Library Entrance', recognitionRate: 94.5, averageConfidence: 91.2, totalDetections: 1250 },
      { cameraId: 'CAM002', cameraName: 'Study Hall A', location: 'Study Hall A', recognitionRate: 89.3, averageConfidence: 88.7, totalDetections: 890 },
      { cameraId: 'CAM003', cameraName: 'Quiet Zone', location: 'Quiet Zone', recognitionRate: 92.1, averageConfidence: 90.5, totalDetections: 650 },
    ];

    const aiInsights = [
      {
        id: 'insight-1',
        type: 'optimization' as const,
        title: 'Peak Recognition Time Identified',
        description: 'Recognition accuracy is 15% higher between 9-11 AM',
        impact: 'high' as const,
        actionable: true,
        recommendation: 'Consider scheduling important events during peak hours'
      },
      {
        id: 'insight-2',
        type: 'security' as const,
        title: 'Spoof Attempt Pattern Detected',
        description: 'Spoof attempts increase by 40% on weekends',
        impact: 'medium' as const,
        actionable: true,
        recommendation: 'Increase security monitoring during weekends'
      },
      {
        id: 'insight-3',
        type: 'performance' as const,
        title: 'Camera 2 Performance Degradation',
        description: 'Camera 2 shows 8% lower recognition rate this week',
        impact: 'medium' as const,
        actionable: true,
        recommendation: 'Check camera positioning and lighting conditions'
      },
      {
        id: 'insight-4',
        type: 'trend' as const,
        title: 'Student Engagement Trend',
        description: 'Overall attendance has increased by 12% this month',
        impact: 'high' as const,
        actionable: false,
        recommendation: 'Continue current engagement strategies'
      }
    ];

    return {
      recognitionRate: 92.4,
      averageConfidence: 89.7,
      totalRecognitions: 2850,
      spoofAttempts: 45,
      unknownFaces: 120,
      topPerformers,
      hourlyStats,
      dailyStats,
      cameraPerformance,
      aiInsights
    };
  };

  const generatePredictionData = (): PredictionData => ({
    predictedAttendance: 85,
    confidence: 87.5,
    factors: [
      { factor: 'Historical Patterns', impact: 0.4, description: 'Based on past attendance data' },
      { factor: 'Weather Conditions', impact: 0.2, description: 'Current weather forecast' },
      { factor: 'Academic Calendar', impact: 0.25, description: 'Upcoming exams and events' },
      { factor: 'Student Behavior', impact: 0.15, description: 'Recent engagement trends' }
    ]
  });

  // Load analytics data
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(generateMockData());
      setPredictionData(generatePredictionData());
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingIcon color="success" />;
      case 'security': return <SecurityIcon color="error" />;
      case 'performance': return <SpeedIcon color="warning" />;
      case 'trend': return <InsightsIcon color="info" />;
      default: return <AIIcon />;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const exportData = () => {
    toast.success('Analytics data exported successfully');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!analyticsData) {
    return (
      <Alert severity="error">
        Failed to load analytics data. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            <AIIcon sx={{ mr: 1, fontSize: 'inherit' }} /> AI-Powered Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced insights and predictions powered by artificial intelligence
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1d">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAnalyticsData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* AI Insights Banner */}
      {showAIInsights && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <IconButton onClick={() => setShowAIInsights(false)}>
              <VisibilityOffIcon />
            </IconButton>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            🤖 AI Insights Available
          </Typography>
          <Typography variant="body2">
            Our AI has identified {analyticsData.aiInsights.length} actionable insights to optimize your face recognition system.
          </Typography>
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Recognition Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData.recognitionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingIcon />}
                  label="+2.3% vs last week" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Confidence
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData.averageConfidence.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <AnalyticsIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingIcon />}
                  label="+1.8% vs last week" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Recognitions
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData.totalRecognitions.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <FaceIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingIcon />}
                  label="+15.2% vs last week" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Spoof Attempts
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {analyticsData.spoofAttempts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  icon={<TrendingDownIcon />}
                  label="-8.5% vs last week" 
                  color="success" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Performance Analytics" icon={<BarChartIcon />} />
            <Tab label="AI Insights" icon={<PsychologyIcon />} />
            <Tab label="Predictions" icon={<TimelineIcon />} />
            <Tab label="Camera Analysis" icon={<CameraIcon />} />
            <Tab label="Student Analytics" icon={<GroupIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Performance Analytics Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Recognition Performance Over Time
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.hourlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="recognitions" 
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          name="Recognitions"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="successRate" 
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          name="Success Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Daily Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.dailyStats.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area 
                          type="monotone" 
                          dataKey="recognitions" 
                          stroke={theme.palette.primary.main}
                          fill={alpha(theme.palette.primary.main, 0.3)}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* AI Insights Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI-Powered Insights
              </Typography>
              <Grid container spacing={3}>
                {analyticsData.aiInsights.map((insight) => (
                  <Grid item xs={12} md={6} key={insight.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getInsightIcon(insight.type)}
                          <Typography variant="h6" sx={{ ml: 1 }}>
                            {insight.title}
                          </Typography>
                          <Chip 
                            label={insight.impact}
                            color={getInsightColor(insight.impact) as any}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {insight.description}
                        </Typography>
                        {insight.actionable && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              💡 Recommendation
                            </Typography>
                            <Typography variant="body2">
                              {insight.recommendation}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Predictions Tab */}
          {activeTab === 2 && predictionData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Attendance Prediction
                    </Typography>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h2" fontWeight={700} color="primary">
                        {predictionData.predictedAttendance}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Predicted attendance for tomorrow
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={`${predictionData.confidence.toFixed(1)}% Confidence`}
                          color="success"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Prediction Factors
                    </Typography>
                    <List>
                      {predictionData.factors.map((factor, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={factor.factor}
                            secondary={factor.description}
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {Math.round(factor.impact * 100)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={factor.impact * 100}
                                sx={{ width: 60 }}
                              />
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Camera Analysis Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Camera Performance Analysis
              </Typography>
              <Grid container spacing={3}>
                {analyticsData.cameraPerformance.map((camera) => (
                  <Grid item xs={12} md={4} key={camera.cameraId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {camera.cameraName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {camera.location}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Recognition Rate: {camera.recognitionRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={camera.recognitionRate} 
                            sx={{ mb: 2 }}
                          />
                          
                          <Typography variant="body2" gutterBottom>
                            Avg Confidence: {camera.averageConfidence.toFixed(1)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={camera.averageConfidence} 
                            sx={{ mb: 2 }}
                          />
                          
                          <Typography variant="body2" color="text.secondary">
                            Total Detections: {camera.totalDetections.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Student Analytics Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Performing Students
              </Typography>
              <List>
                {analyticsData.topPerformers.map((student, index) => (
                  <ListItem key={student.studentId} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={student.studentName}
                      secondary={`Student ID: ${student.studentId}`}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Recognitions
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {student.recognitionCount}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Avg Confidence
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {student.averageConfidence.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIAnalyticsDashboard;
