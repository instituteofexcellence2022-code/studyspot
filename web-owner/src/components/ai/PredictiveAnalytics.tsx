import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  GridLegacy as Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  School,
  EmojiEvents,
  Warning,
  CheckCircle,
  Psychology,
  Timer,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PolarAngleAxis from '../common/PolarAngleAxisCompat';

interface Prediction {
  id: string;
  title: string;
  prediction: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

const PredictiveAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Performance prediction data
  const performanceTrend = [
    { week: 'Week 1', actual: 65, predicted: 65, target: 80 },
    { week: 'Week 2', actual: 68, predicted: 67, target: 80 },
    { week: 'Week 3', actual: 70, predicted: 70, target: 80 },
    { week: 'Week 4', actual: 72, predicted: 71, target: 80 },
    { week: 'Week 5', actual: null, predicted: 74, target: 80 },
    { week: 'Week 6', actual: null, predicted: 77, target: 80 },
    { week: 'Week 7', actual: null, predicted: 79, target: 80 },
    { week: 'Week 8', actual: null, predicted: 82, target: 80 },
  ];

  // Subject-wise prediction
  const subjectPredictions = [
    { subject: 'Mathematics', current: 65, predicted: 75, max: 100 },
    { subject: 'Physics', current: 70, predicted: 78, max: 100 },
    { subject: 'Chemistry', current: 80, predicted: 85, max: 100 },
    { subject: 'Biology', current: 75, predicted: 80, max: 100 },
    { subject: 'English', current: 85, predicted: 88, max: 100 },
  ];

  // Skill radar
  const skillAnalysis = [
    { skill: 'Problem Solving', current: 70, predicted: 80 },
    { skill: 'Critical Thinking', current: 75, predicted: 82 },
    { skill: 'Time Management', current: 60, predicted: 75 },
    { skill: 'Retention', current: 80, predicted: 85 },
    { skill: 'Application', current: 65, predicted: 78 },
    { skill: 'Speed', current: 70, predicted: 77 },
  ];

  // Success probability
  const successProbability = [
    { exam: 'Midterm', probability: 75, recommended: 85 },
    { exam: 'Finals', probability: 68, recommended: 85 },
    { exam: 'Practical', probability: 82, recommended: 85 },
  ];

  const predictions: Prediction[] = [
    {
      id: '1',
      title: 'Exam Performance',
      prediction: 'Based on current trends, you have an 82% probability of scoring above 75% in your upcoming exams.',
      confidence: 82,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 30 days',
    },
    {
      id: '2',
      title: 'Study Efficiency',
      prediction: 'Your study efficiency is predicted to improve by 15% if you maintain current study patterns.',
      confidence: 78,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 14 days',
    },
    {
      id: '3',
      title: 'Weak Area Recovery',
      prediction: 'Mathematics performance likely to improve from 65% to 75% with recommended focus.',
      confidence: 85,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 21 days',
    },
    {
      id: '4',
      title: 'Study Streak',
      prediction: 'High probability (90%) of maintaining 30-day study streak if you continue current schedule.',
      confidence: 90,
      trend: 'stable',
      impact: 'medium',
      timeframe: 'Next 30 days',
    },
    {
      id: '5',
      title: 'Retention Rate',
      prediction: 'Memory retention predicted to increase by 20% with active recall techniques.',
      confidence: 75,
      trend: 'up',
      impact: 'high',
      timeframe: 'Next 45 days',
    },
    {
      id: '6',
      title: 'Burnout Risk',
      prediction: 'Low burnout risk (15%) detected. Current study-rest balance is optimal.',
      confidence: 88,
      trend: 'stable',
      impact: 'low',
      timeframe: 'Ongoing',
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      case 'stable':
        return <TrendingFlat color="info" />;
      default:
        return <TrendingFlat />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Predictive Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered predictions for your academic success
          </Typography>
        </Box>
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
          </Select>
        </FormControl>
      </Box>

      {/* Key Predictions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {predictions.slice(0, 3).map((pred) => (
          <Grid item xs={12} md={4} key={pred.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    {pred.title}
                  </Typography>
                  {getTrendIcon(pred.trend)}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pred.prediction}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {pred.confidence}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pred.confidence}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
                  <Chip label={pred.timeframe} size="small" variant="outlined" />
                  <Chip
                    label={pred.impact}
                    size="small"
                    color={getImpactColor(pred.impact) as any}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Performance Trend Prediction */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trend & Prediction
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Actual vs Predicted performance with target goal
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Actual Performance"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  strokeDasharray="5 5"
                  name="Predicted Performance"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ff7300"
                  strokeDasharray="3 3"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Success Probability
            </Typography>
            <List>
              {successProbability.map((exam, index) => (
                <ListItem key={index} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {exam.exam}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exam.probability}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={exam.probability}
                      color={exam.probability >= exam.recommended ? 'success' : 'warning'}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
            <Alert severity="info" sx={{ mt: 2 }}>
              Recommended success probability: 85%
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Subject-wise Predictions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subject-wise Performance Prediction
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#8884d8" name="Current Score" />
                <Bar dataKey="predicted" fill="#82ca9d" name="Predicted Score" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Skill Development Radar
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillAnalysis}>
                <PolarGrid />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Current Level"
                  dataKey="current"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Predicted Level"
                  dataKey="predicted"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* All Predictions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Predictions & Insights
        </Typography>
        <List>
          {predictions.map((pred) => (
            <ListItem
              key={pred.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon(pred.trend)}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {pred.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip label={pred.timeframe} size="small" />
                  <Chip
                    label={`${pred.confidence}% confidence`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {pred.prediction}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={pred.confidence}
                sx={{ width: '100%', height: 4, borderRadius: 1 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default PredictiveAnalytics;
