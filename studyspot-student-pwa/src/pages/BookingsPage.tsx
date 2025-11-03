import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface BookingsPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function BookingsPage({ setIsAuthenticated }: BookingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // Mock data
      setBookings([
        {
          id: 1,
          libraryName: 'Central Library',
          date: '2025-11-05',
          startTime: '10:00',
          duration: 2,
          status: 'confirmed',
          totalAmount: 100,
        },
        {
          id: 2,
          libraryName: 'Tech Hub Library',
          date: '2025-11-06',
          startTime: '14:00',
          duration: 3,
          status: 'pending',
          totalAmount: 225,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      case 'pending':
        return <Pending sx={{ color: '#f59e0b' }} />;
      case 'cancelled':
        return <Cancel sx={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Bookings 📅
        </Typography>

        {bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No bookings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by browsing libraries and making your first booking
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {booking.libraryName}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={booking.status.toUpperCase()}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {booking.date} at {booking.startTime} ({booking.duration} hours)
                      </Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                      ₹{booking.totalAmount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}

