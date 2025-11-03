import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  GridLegacy as Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment,
  Speed,
  EmojiEvents,
  Warning,
  CheckCircle,
  School,
  MenuBook,
  Timer,
  LocalFireDepartment,
  ShowChart,
  FilterList,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface PerformanceMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const PerformanceInsights: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Performance metrics
  const metrics: PerformanceMetric[] = [
    {
      id: '1',
      title: 'Overall Performance',
      value: '78%',
      change: 12,
      trend: 'up',
      icon: <Assessment />,
      color: '#1976d2',
      subtitle: 'Average across all subjects',
    },
    {
      id: '2',
      title: 'Study Efficiency',
      value: '85%',
      change: 8,
      trend: 'up',
      icon: <Speed />,
      color: '#2e7d32',
      subtitle: 'Time vs. results ratio',
    },
    {
      id: '3',
      title: 'Consistency Score',
      value: '92%',
      change: 5,
      trend: 'up',
      icon: <Timeline />,
      color: '#ed6c02',
      subtitle: '7-day study streak',
    },
    {
      id: '4',
      title: 'Retention Rate',
      value: '76%',
      change: -3,
      trend: 'down',
      icon: <MenuBook />,
      color: '#d32f2f',
      subtitle: 'Long-term memory',
    },
  ];

  // Performance trend data
  const performanceData = [
    { week: 'Week 1', overall: 65, efficiency: 70, retention: 80, consistency: 60 },
    { week: 'Week 2', overall: 68, efficiency: 72, retention: 78, consistency: 65 },
    { week: 'Week 3', overall: 70, efficiency: 75, retention: 79, consistency: 70 },
    { week: 'Week 4', overall: 72, efficiency: 78, retention: 77, consistency: 75 },
    { week: 'Week 5', overall: 75, efficiency: 80, retention: 76, consistency: 80 },
    { week: 'Week 6', overall: 78, efficiency: 85, retention: 76, consistency: 92 },
  ];

  // Subject performance
  const subjectPerformance = [
    { subject: 'Math', current: 65, target: 80, progress: 81 },
    { subject: 'Physics', current: 70, target: 80, progress: 88 },
    { subject: 'Chemistry', current: 80, target: 85, progress: 94 },
    { subject: 'Biology', current: 75, target: 80, progress: 94 },
    { subject: 'English', current: 85, target: 90, progress: 94 },
  ];

  // Study session quality
  const sessionQuality = [
    { date: 'Mon', quality: 85, duration: 120, focus: 90 },
    { date: 'Tue', quality: 82, duration: 90, focus: 85 },
    { date: 'Wed', quality: 88, duration: 150, focus: 92 },
    { date: 'Thu', quality: 90, duration: 135, focus: 95 },
    { date: 'Fri', quality: 87, duration: 105, focus: 88 },
    { date: 'Sat', quality: 75, duration: 180, focus: 70 },
    { date: 'Sun', quality: 80, duration: 90, focus: 82 },
  ];

  // Insights
  const insights: Insight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Strong Consistency',
      description: 'You\'ve maintained a 7-day study streak! This consistency is reflected in your 92% consistency score.',
      impact: 'high',
      actionable: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Retention Declining',
      description: 'Your retention rate has decreased by 3% this week. Consider implementing more active recall techniques.',
      impact: 'high',
      actionable: true,
    },
    {
      id: '3',
      type: 'info',
      title: 'Peak Performance Time',
      description: 'Your best study sessions occur between 6-9 AM with 95% focus score. Consider scheduling difficult topics during this window.',
      impact: 'medium',
      actionable: true,
    },
    {
      id: '4',
      type: 'success',
      title: 'Efficiency Improving',
      description: 'Study efficiency improved by 8% this month. Your time management strategies are working well.',
      impact: 'medium',
      actionable: false,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Mathematics Attention Needed',
      description: 'Mathematics performance is 19% below target. Recommend allocating additional study time.',
      impact: 'high',
      actionable: true,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Performance Insights
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Comprehensive analysis of your study performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <MenuItem value="all">All Subjects</MenuItem>
              <MenuItem value="math">Mathematics</MenuItem>
              <MenuItem value="physics">Physics</MenuItem>
              <MenuItem value="chemistry">Chemistry</MenuItem>
              <MenuItem value="biology">Biology</MenuItem>
              <MenuItem value="english">English</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: metric.color }}>
                    {metric.icon}
                  </Avatar>
                  <Chip
                    icon={getTrendIcon(metric.trend) || undefined}
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    size="small"
                    color={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'default'}
                  />
                </Box>
                <Typography variant="h4" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Trends */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track your progress across multiple dimensions
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="overall"
                  fill="#1976d2"
                  stroke="#1976d2"
                  fillOpacity={0.3}
                  name="Overall Performance"
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  name="Study Efficiency"
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#d32f2f"
                  strokeWidth={2}
                  name="Retention Rate"
                />
                <Line
                  type="monotone"
                  dataKey="consistency"
                  stroke="#ed6c02"
                  strokeWidth={2}
                  name="Consistency"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Subject Progress
            </Typography>
            <List>
              {subjectPerformance.map((subject, index) => (
                <React.Fragment key={subject.subject}>
                  <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {subject.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.current}% / {subject.target}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={subject.progress}
                      sx={{ width: '100%', height: 8, borderRadius: 1 }}
                      color={subject.progress >= 90 ? 'success' : subject.progress >= 75 ? 'warning' : 'error'}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {subject.progress}% of target achieved
                    </Typography>
                  </ListItem>
                  {index < subjectPerformance.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Session Quality Analysis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Study Session Quality
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Daily breakdown of session quality, duration, and focus levels
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sessionQuality}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="quality" fill="#1976d2" name="Quality Score" />
            <Bar yAxisId="left" dataKey="focus" fill="#2e7d32" name="Focus Score" />
            <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#ed6c02" strokeWidth={2} name="Duration (min)" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* AI-Generated Insights */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocalFireDepartment color="primary" />
          <Typography variant="h6">AI-Generated Insights</Typography>
        </Box>
        <Grid container spacing={2}>
          {insights.map((insight) => (
            <Grid item xs={12} md={6} key={insight.id}>
              <Alert
                severity={insight.type}
                icon={
                  insight.type === 'success' ? <CheckCircle /> :
                  insight.type === 'warning' ? <Warning /> :
                  insight.type === 'error' ? <TrendingDown /> :
                  <ShowChart />
                }
                action={
                  insight.actionable && (
                    <Chip label={insight.impact} size="small" color={
                      insight.impact === 'high' ? 'error' :
                      insight.impact === 'medium' ? 'warning' :
                      'success'
                    } />
                  )
                }
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {insight.title}
                </Typography>
                <Typography variant="body2">
                  {insight.description}
                </Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PerformanceInsights;
