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
} from '@mui/material';
import {
  LibraryBooks,
  BookOnline,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

interface DashboardPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function DashboardPage({ setIsAuthenticated }: DashboardPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    favoriteLibraries: 0,
    hoursBooked: 0,
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user bookings for stats
      const response = await api.get('/api/bookings/my-bookings');
      const bookings = response.data.data || [];

      const upcoming = bookings.filter((b: any) => 
        new Date(b.startTime) > new Date() && b.status === 'confirmed'
      );

      setStats({
        totalBookings: bookings.length,
        upcomingBookings: upcoming.length,
        favoriteLibraries: 3, // Mock data
        hoursBooked: bookings.length * 2, // Mock calculation
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
      action: () => navigate('/bookings'),
    },
    {
      title: 'Upcoming',
      value: stats.upcomingBookings,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#10b981',
      action: () => navigate('/bookings'),
    },
    {
      title: 'Libraries',
      value: stats.favoriteLibraries,
      icon: <LibraryBooks sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      action: () => navigate('/libraries'),
    },
    {
      title: 'Hours Booked',
      value: stats.hoursBooked,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
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
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome back, {user.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your study activity overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: card.color, mr: 2 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<LibraryBooks />}
                      onClick={() => navigate('/libraries')}
                    >
                      Browse Libraries
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<BookOnline />}
                      onClick={() => navigate('/bookings')}
                    >
                      View My Bookings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No recent activity to display
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}

