import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  LinearProgress,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  LibraryBooks,
  BookOnline,
  TrendingUp,
  Schedule,
  Timer,
  EmojiEvents,
  CalendarMonth,
  Person,
  Notifications,
  ArrowForward,
  CheckCircle,
  AccessTime,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';

interface DashboardPageEnhancedProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function DashboardPageEnhanced({ setIsAuthenticated }: DashboardPageEnhancedProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [stats, setStats] = useState({
    totalBookings: 45,
    upcomingBookings: 3,
    totalHours: 180,
    favoriteLibraries: 5,
    currentStreak: 7,
    totalRewards: 450,
  });

  const [studyTimeData, setStudyTimeData] = useState([
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 8 },
    { day: 'Fri', hours: 7 },
    { day: 'Sat', hours: 9 },
    { day: 'Sun', hours: 6 },
  ]);

  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', bookings: 12, hours: 48 },
    { month: 'Feb', bookings: 15, hours: 60 },
    { month: 'Mar', bookings: 18, hours: 72 },
    { month: 'Apr', bookings: 22, hours: 88 },
  ]);

  const [libraryUsage, setLibraryUsage] = useState([
    { name: 'Central Library', value: 40, color: '#2563eb' },
    { name: 'Tech Hub', value: 30, color: '#10b981' },
    { name: 'Green Study', value: 20, color: '#f59e0b' },
    { name: 'Others', value: 10, color: '#6b7280' },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'Booked seat at Central Library',
      time: '2 hours ago',
      icon: <BookOnline color="primary" />,
    },
    {
      id: 2,
      type: 'achievement',
      title: 'Earned "7-Day Streak" badge',
      time: '1 day ago',
      icon: <EmojiEvents sx={{ color: '#f59e0b' }} />,
    },
    {
      id: 3,
      type: 'checkin',
      title: 'Checked in at Tech Hub Library',
      time: '2 days ago',
      icon: <CheckCircle color="success" /> ,
    },
    {
      id: 4,
      type: 'favorite',
      title: 'Added Green Study to favorites',
      time: '3 days ago',
      icon: <LibraryBooks color="error" />,
    },
  ]);

  const [upcomingBookings, setUpcomingBookings] = useState([
    {
      id: 1,
      library: 'Central Library',
      date: 'Today',
      time: '2:00 PM - 6:00 PM',
      seat: 'A-15',
    },
    {
      id: 2,
      library: 'Tech Hub',
      date: 'Tomorrow',
      time: '10:00 AM - 2:00 PM',
      seat: 'B-23',
    },
    {
      id: 3,
      library: 'Green Study',
      date: 'Nov 6',
      time: '4:00 PM - 8:00 PM',
      seat: 'C-08',
    },
  ]);

  const [goals, setGoals] = useState([
    { title: 'Study 40 hours this month', current: 32, target: 40, color: '#2563eb' },
    { title: 'Visit 5 different libraries', current: 3, target: 5, color: '#10b981' },
    { title: 'Maintain 30-day streak', current: 7, target: 30, color: '#f59e0b' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const response = await api.get('/dashboard/stats');
      // setStats(response.data.stats);
      // setStudyTimeData(response.data.studyTime);
      // ... etc
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Using mock data
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookOnline sx={{ fontSize: 40 }} />,
      color: '#2563eb',
      change: '+12%',
      action: () => navigate('/bookings'),
    },
    {
      title: 'Upcoming',
      value: stats.upcomingBookings,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#10b981',
      change: '+3',
      action: () => navigate('/bookings'),
    },
    {
      title: 'Study Hours',
      value: stats.totalHours,
      icon: <Timer sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      change: '+18h',
      action: () => {},
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      change: '🔥',
      action: () => {},
    },
  ];

  if (loading) {
    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome back, {user.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your study activity overview
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
                onClick={card.action}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                    <Chip label={card.change} size="small" color="success" />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Study Time Chart */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Study Time This Week
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={studyTimeData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stroke="#2563eb" fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Monthly Trends
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" fill="#2563eb" name="Bookings" />
                    <Bar yAxisId="right" dataKey="hours" fill="#10b981" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Library Usage Distribution */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Library Usage Distribution
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={libraryUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {libraryUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                      {libraryUsage.map((lib, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 16, height: 16, bgcolor: lib.color, borderRadius: 1 }} />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {lib.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {lib.value}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Goals Progress */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Goals
                  </Typography>
                  <IconButton size="small">
                    <ArrowForward />
                  </IconButton>
                </Box>
                {goals.map((goal, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{goal.title}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {goal.current}/{goal.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(goal.current / goal.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: goal.color,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Upcoming Bookings
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/bookings')}>
                    View All
                  </Button>
                </Box>
                {upcomingBookings.map((booking, index) => (
                  <Paper key={booking.id} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonth sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {booking.library}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {booking.date} • {booking.time}
                    </Typography>
                    <Chip label={`Seat ${booking.seat}`} size="small" sx={{ mt: 1 }} />
                  </Paper>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Activity
                  </Typography>
                  <Notifications color="action" />
                </Box>
                <List>
                  {recentActivity.map((activity, index) => (
                    <Box key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LibraryBooks />}
              onClick={() => navigate('/libraries')}
              sx={{ py: 1.5 }}
            >
              Browse Libraries
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BookOnline />}
              onClick={() => navigate('/bookings')}
              sx={{ py: 1.5 }}
            >
              My Bookings
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Person />}
              onClick={() => navigate('/profile')}
              sx={{ py: 1.5 }}
            >
              My Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<EmojiEvents />}
              sx={{ py: 1.5 }}
            >
              Rewards
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

