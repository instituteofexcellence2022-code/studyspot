import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  LocalFireDepartment,
  EmojiEvents,
  Schedule,
  MenuBook,
  QrCodeScanner,
  Timer,
  Group,
  ArrowForward,
  Notifications,
} from '@mui/icons-material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { gradients } from '../theme/colors';

export default function DashboardEnhancedV2({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const navigate = useNavigate();
  
  const stats = {
    streak: 12,
    todayHours: 6.5,
    weeklyGoal: 70,
    weeklyProgress: 45,
    points: 2450,
    rank: 145,
    attendance: 95,
  };

  const quickActions = [
    { label: 'Scan QR', icon: <QrCodeScanner />, path: '/qr-scanner', gradient: gradients.primary },
    { label: 'Start Timer', icon: <Timer />, path: '/study-timer', gradient: gradients.success },
    { label: 'Book Seat', icon: <MenuBook />, path: '/libraries', gradient: gradients.warning },
    { label: 'Community', icon: <Group />, path: '/community', gradient: gradients.info },
  ];

  const weekData = [
    { day: 'Mon', hours: 6 },
    { day: 'Tue', hours: 7 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 8 },
    { day: 'Fri', hours: 6 },
    { day: 'Sat', hours: 9 },
    { day: 'Sun', hours: 4 },
  ];

  const achievements = [
    { title: '7-Day Streak 🔥', desc: 'Keep it up!', color: '#f59e0b' },
    { title: 'Top 12% 🏆', desc: 'You\'re doing great', color: '#10b981' },
    { title: '45h This Week ⏱️', desc: 'Almost at goal', color: '#2563eb' },
  ];

  const upcomingBookings = [
    { library: 'Central Library', seat: 'A-12', time: 'Tomorrow 9:00 AM', shift: 'Morning' },
    { library: 'Knowledge Hub', seat: 'B-07', time: 'Nov 6, 6:00 PM', shift: 'Evening' },
  ];

  return (
    <Layout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Hero Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Hey, {JSON.parse(localStorage.getItem('user') || '{}').firstName}! 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep crushing those goals!
              </Typography>
            </Box>
            <IconButton onClick={() => navigate('/announcements')}>
              <Notifications color="primary" />
            </IconButton>
          </Box>
        </Box>

        {/* Streak Banner */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            background: gradients.primary,
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalFireDepartment sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.streak} Days</Typography>
                <Typography variant="body2">Study Streak 🔥</Typography>
              </Box>
            </Box>
            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
              View Progress
            </Button>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: gradients.success, color: 'white', borderRadius: 3 }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight="bold">{stats.todayHours}h</Typography>
                <Typography variant="caption">Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: gradients.warning, color: 'white', borderRadius: 3 }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight="bold">{stats.points}</Typography>
                <Typography variant="caption">Points</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: gradients.info, color: 'white', borderRadius: 3 }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight="bold">#{stats.rank}</Typography>
                <Typography variant="caption">Rank</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ background: gradients.orange, color: 'white', borderRadius: 3 }}>
              <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight="bold">{stats.attendance}%</Typography>
                <Typography variant="caption">Attendance</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1.5}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Card 
                  sx={{ 
                    background: action.gradient,
                    color: 'white',
                    cursor: 'pointer',
                    borderRadius: 3,
                    '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2, px: 1, '&:last-child': { pb: 2 } }}>
                    {action.icon}
                    <Typography variant="body2" fontWeight="600" sx={{ mt: 1 }}>
                      {action.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Weekly Progress */}
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                This Week
              </Typography>
              <Chip label={`${stats.weeklyProgress}/${stats.weeklyGoal}h`} color="primary" />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
              sx={{ height: 12, borderRadius: 6, mb: 2 }}
            />
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={weekData}>
                <Line type="monotone" dataKey="hours" stroke="#667eea" strokeWidth={3} dot={{ fill: '#667eea', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Recent Wins 🎉
          </Typography>
          <Grid container spacing={1.5}>
            {achievements.map((ach, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Paper sx={{ p: 2, borderLeft: 4, borderColor: ach.color, borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="bold">{ach.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{ach.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Upcoming Bookings */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Upcoming
              </Typography>
              <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/bookings')}>
                View All
              </Button>
            </Box>
            {upcomingBookings.map((booking, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="600">{booking.library}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Seat {booking.seat} • {booking.time}
                    </Typography>
                  </Box>
                  <Chip label={booking.shift} size="small" color="primary" />
                </Box>
              </Paper>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}

