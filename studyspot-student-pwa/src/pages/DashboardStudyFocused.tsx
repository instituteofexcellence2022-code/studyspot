import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  LocalFireDepartment,
  Timer,
  MenuBook,
  TrendingUp,
  EmojiEvents,
  Schedule,
  Psychology,
  Assignment,
  CheckCircle,
  ArrowForward,
  Book,
  Group,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import { gradients } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
}

export default function DashboardStudyFocused({ darkMode, setDarkMode }: DashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const stats = {
    streak: 12,
    todayHours: 6.5,
    weekTarget: 40,
    weekCompleted: 28,
    attendance: 95,
    focusScore: 85,
    rank: 145,
    totalStudents: 1250,
    pendingTasks: 5,
    upcomingTests: 2,
  };

  // Study-focused quick actions
  const studyActions = [
    { 
      title: 'Start Studying', 
      subtitle: 'Begin Pomodoro Session',
      icon: <Timer sx={{ fontSize: 32 }} />, 
      path: '/study-timer',
      gradient: gradients.primary,
    },
    { 
      title: 'Book a Seat', 
      subtitle: 'Reserve Your Spot',
      icon: <MenuBook sx={{ fontSize: 32 }} />, 
      path: '/libraries',
      gradient: gradients.success,
    },
    { 
      title: 'Study Groups', 
      subtitle: 'Join Community',
      icon: <Group sx={{ fontSize: 32 }} />, 
      path: '/community',
      gradient: gradients.info,
    },
    { 
      title: 'E-Resources', 
      subtitle: 'Books & Materials',
      icon: <Book sx={{ fontSize: 32 }} />, 
      path: '/resources',
      gradient: gradients.warning,
    },
  ];

  const weeklyStudyData = [
    { day: 'Mon', hours: 6, target: 6 },
    { day: 'Tue', hours: 7, target: 6 },
    { day: 'Wed', hours: 5, target: 6 },
    { day: 'Thu', hours: 8, target: 6 },
    { day: 'Fri', hours: 6, target: 6 },
    { day: 'Sat', hours: 4, target: 6 },
    { day: 'Sun', hours: 0, target: 6 },
  ];

  const todayTasks = [
    { subject: 'Mathematics', task: 'Complete Chapter 5', priority: 'high', completed: false },
    { subject: 'Physics', task: 'Solve 20 numericals', priority: 'high', completed: false },
    { subject: 'Chemistry', task: 'Revise organic reactions', priority: 'medium', completed: true },
  ];

  const upcomingBookings = [
    { library: 'Central Library', seat: 'A-12', date: 'Tomorrow', time: '9:00 AM', shift: 'Morning' },
    { library: 'Knowledge Hub', seat: 'B-07', date: 'Nov 6', time: '6:00 PM', shift: 'Evening' },
  ];

  return (
    <StudyFocusedLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.firstName}! 📚
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        {/* Streak & Focus Banner */}
        <Paper 
          sx={{ 
            p: 2.5, 
            mb: 3, 
            background: gradients.primary,
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalFireDepartment sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats.streak}</Typography>
                  <Typography variant="body2">Day Study Streak 🔥</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Keep going! You're on fire!
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Weekly Goal</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.weekCompleted}/{stats.weekTarget}h
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.weekCompleted / stats.weekTarget) * 100} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.9 }}>
                  {stats.weekTarget - stats.weekCompleted}h more to reach your goal
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Key Study Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 3, borderLeft: 4, borderColor: '#667eea' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {stats.todayHours}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Today's Study Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 3, borderLeft: 4, borderColor: '#10b981' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {stats.focusScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Focus Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 3, borderLeft: 4, borderColor: '#f59e0b' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  #{stats.rank}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your Rank
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ borderRadius: 3, borderLeft: 4, borderColor: '#ef4444' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {stats.pendingTasks}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Study Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            ⚡ Quick Study Actions
          </Typography>
          <Grid container spacing={2}>
            {studyActions.map((action, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    background: action.gradient,
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    {action.icon}
                    <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {action.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Weekly Study Pattern */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    📊 This Week's Study Pattern
                  </Typography>
                  <Chip label="On Track" color="success" size="small" />
                </Box>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklyStudyData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#667eea" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="#e0e0e0" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Blue: Actual • Gray: Target (6h/day)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Tasks */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    ✅ Today's Tasks
                  </Typography>
                  <Button size="small" onClick={() => navigate('/tasks-goals')}>View All</Button>
                </Box>
                <List dense>
                  {todayTasks.map((task, index) => (
                    <Box key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: task.completed ? 'success.main' : 'grey.300' }}>
                            {task.completed ? <CheckCircle fontSize="small" /> : <Assignment fontSize="small" />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.task}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              <Chip label={task.subject} size="small" sx={{ height: 18, fontSize: 10 }} />
                              <Chip label={task.priority} size="small" color={task.priority === 'high' ? 'error' : 'warning'} sx={{ height: 18, fontSize: 10 }} />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < todayTasks.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/tasks-goals')}
                >
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Study Sessions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    📅 Upcoming Sessions
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/bookings')}>
                    Manage
                  </Button>
                </Box>
                {upcomingBookings.map((booking, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1.5, bgcolor: 'action.hover', borderRadius: 2, borderLeft: 3, borderColor: 'primary.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {booking.library}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Seat {booking.seat} • {booking.date} at {booking.time}
                        </Typography>
                      </Box>
                      <Chip label={booking.shift} size="small" color="primary" />
                    </Box>
                  </Paper>
                ))}
                <Button 
                  fullWidth 
                  variant="contained" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/libraries')}
                >
                  Book New Session
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Summary */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Performance Summary
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Attendance Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats.attendance}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendance} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="success"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Focus Score</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats.focusScore}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.focusScore} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Weekly Goal</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.weekCompleted}/{stats.weekTarget}h
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.weekCompleted / stats.weekTarget) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color="warning"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      #{stats.rank}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Your Rank</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      Top 12%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Percentile</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {stats.pendingTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Tasks Left</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Study Resources Quick Access */}
        <Card sx={{ mt: 3, borderRadius: 3, background: gradients.info, color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  📚 New Study Materials Available
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  50+ UPSC, JEE, NEET resources added this week
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                onClick={() => navigate('/resources')}
              >
                Explore
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </StudyFocusedLayout>
  );
}

