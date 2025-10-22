import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  GridLegacy as Grid,
} from '@mui/material';
import {
  WbSunny,
  Brightness3,
  WbTwilight,
  Psychology,
  Timer,
  TrendingUp,
  Schedule,
  FitnessCenter,
  Coffee,
  MenuBook,
  Speed,
  CalendarToday,
} from '@mui/icons-material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Pattern {
  id: string;
  name: string;
  frequency: number;
  effectiveness: number;
  description: string;
  recommendation: string;
  icon: React.ReactNode;
}

const StudyPatternAnalysis: React.FC = () => {
  // Time-of-day patterns
  const timePatterns = [
    { time: 'Early Morning\n(5-8 AM)', sessions: 45, productivity: 95, retention: 90, focus: 92 },
    { time: 'Morning\n(8-12 PM)', sessions: 60, productivity: 85, retention: 82, focus: 88 },
    { time: 'Afternoon\n(12-5 PM)', sessions: 40, productivity: 65, retention: 68, focus: 70 },
    { time: 'Evening\n(5-9 PM)', sessions: 55, productivity: 75, retention: 75, focus: 78 },
    { time: 'Night\n(9-12 AM)', sessions: 20, productivity: 55, retention: 60, focus: 65 },
  ];

  // Study duration patterns
  const durationData = [
    { duration: '< 30 min', count: 15, avgScore: 60 },
    { duration: '30-45 min', count: 45, avgScore: 85 },
    { duration: '45-60 min', count: 50, avgScore: 90 },
    { duration: '60-90 min', count: 30, avgScore: 82 },
    { duration: '> 90 min', count: 20, avgScore: 70 },
  ];

  // Weekly patterns
  const weeklyPattern = [
    { day: 'Mon', morning: 80, afternoon: 60, evening: 75 },
    { day: 'Tue', morning: 85, afternoon: 65, evening: 78 },
    { day: 'Wed', morning: 88, afternoon: 70, evening: 80 },
    { day: 'Thu', morning: 90, afternoon: 68, evening: 82 },
    { day: 'Fri', morning: 82, afternoon: 55, evening: 70 },
    { day: 'Sat', morning: 75, afternoon: 50, evening: 65 },
    { day: 'Sun', morning: 78, afternoon: 52, evening: 68 },
  ];

  // Study method effectiveness
  const methodEffectiveness = [
    { method: 'Active Recall', score: 95 },
    { method: 'Spaced Repetition', score: 92 },
    { method: 'Practice Problems', score: 88 },
    { method: 'Note-taking', score: 75 },
    { method: 'Reading', score: 70 },
    { method: 'Highlighting', score: 60 },
  ];

  // Break patterns
  const breakPatterns = [
    { name: 'No Break', value: 15, color: '#d32f2f' },
    { name: '5-10 min', value: 40, color: '#ed6c02' },
    { name: '10-15 min', value: 30, color: '#2e7d32' },
    { name: '15+ min', value: 15, color: '#1976d2' },
  ];

  // Identified patterns
  const patterns: Pattern[] = [
    {
      id: '1',
      name: 'Early Bird Learner',
      frequency: 85,
      effectiveness: 95,
      description: 'You consistently achieve highest productivity (95%) during early morning hours (5-8 AM).',
      recommendation: 'Schedule complex topics and new concepts during this peak window.',
      icon: <WbSunny />,
    },
    {
      id: '2',
      name: 'Optimal Session Length',
      frequency: 80,
      effectiveness: 90,
      description: 'Your best performance occurs in 45-60 minute study blocks with 90% average score.',
      recommendation: 'Structure study sessions around this duration for maximum efficiency.',
      icon: <Timer />,
    },
    {
      id: '3',
      name: 'Active Learning Preference',
      frequency: 75,
      effectiveness: 95,
      description: 'Active recall and practice problems yield significantly better results than passive methods.',
      recommendation: 'Prioritize active learning techniques over passive reading.',
      icon: <Psychology />,
    },
    {
      id: '4',
      name: 'Weekly Momentum',
      frequency: 70,
      effectiveness: 85,
      description: 'Performance peaks mid-week (Wednesday-Thursday) with 88-90% productivity.',
      recommendation: 'Schedule important tests and challenging topics during mid-week.',
      icon: <CalendarToday />,
    },
    {
      id: '5',
      name: 'Break Optimization',
      frequency: 65,
      effectiveness: 82,
      description: 'Sessions with 10-15 minute breaks show 30% better retention than no breaks.',
      recommendation: 'Implement regular 10-15 minute breaks between study sessions.',
      icon: <Coffee />,
    },
  ];

  // Productivity heatmap data
  const heatmapData = [
    { day: 'Mon', '6AM': 95, '12PM': 70, '6PM': 80 },
    { day: 'Tue', '6AM': 92, '12PM': 68, '6PM': 78 },
    { day: 'Wed', '6AM': 98, '12PM': 72, '6PM': 82 },
    { day: 'Thu', '6AM': 96, '12PM': 70, '6PM': 85 },
    { day: 'Fri', '6AM': 88, '12PM': 65, '6PM': 75 },
    { day: 'Sat', '6AM': 82, '12PM': 60, '6PM': 70 },
    { day: 'Sun', '6AM': 85, '12PM': 62, '6PM': 72 },
  ];

  const COLORS = ['#d32f2f', '#ed6c02', '#2e7d32', '#1976d2'];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Study Pattern Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Discover your unique study patterns and optimize your learning approach
      </Typography>

      {/* Identified Patterns */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Study Patterns
          </Typography>
          <Grid container spacing={2}>
            {patterns.map((pattern) => (
              <Grid item xs={12} md={6} key={pattern.id}>
                <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {pattern.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {pattern.name}
                        </Typography>
                        <Chip
                          label={`${pattern.effectiveness}% effective`}
                          size="small"
                          color="success"
                          sx={{ height: 20 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {pattern.description}
                      </Typography>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          💡 {pattern.recommendation}
                        </Typography>
                      </Alert>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Frequency</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {pattern.frequency}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pattern.frequency}
                          sx={{ height: 4, borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Time-of-Day Analysis */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Time-of-Day Performance Pattern
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your cognitive performance varies throughout the day
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={timePatterns}>
                <PolarGrid />
                <PolarAngleAxis dataKey="time" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Productivity"
                  dataKey="productivity"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Retention"
                  dataKey="retention"
                  stroke="#2e7d32"
                  fill="#2e7d32"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Focus"
                  dataKey="focus"
                  stroke="#ed6c02"
                  fill="#ed6c02"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Break Pattern Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Break Pattern Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              How you structure your breaks
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={breakPatterns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {breakPatterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="caption">
                ✅ 10-15 min breaks show best retention
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly Pattern */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Productivity Pattern
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your performance varies across the week
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyPattern}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="morning" stackId="a" fill="#ffc658" name="Morning" />
            <Bar dataKey="afternoon" stackId="a" fill="#8884d8" name="Afternoon" />
            <Bar dataKey="evening" stackId="a" fill="#82ca9d" name="Evening" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Session Duration Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Optimal Session Duration
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="duration" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#1976d2" name="Sessions" />
                <Bar yAxisId="right" dataKey="avgScore" fill="#2e7d32" name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Study Method Effectiveness */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Study Method Effectiveness
            </Typography>
            <List>
              {methodEffectiveness.map((method, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={method.method}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={method.score}
                          sx={{ height: 8, borderRadius: 1 }}
                          color={
                            method.score >= 90 ? 'success' :
                            method.score >= 75 ? 'warning' :
                            'error'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {method.score}% effectiveness
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudyPatternAnalysis;
