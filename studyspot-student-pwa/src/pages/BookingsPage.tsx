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
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  Pending,
  Wifi,
  WifiOff,
} from '@mui/icons-material';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';

interface BookingsPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function BookingsPage({ setIsAuthenticated }: BookingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'info' | 'warning' }>({ 
    open: false, 
    message: '', 
    type: 'info' 
  });

  // 🔴 NEW: Real-time WebSocket connection
  const { socket, connected, error } = useSocket('student');

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔴 NEW: Real-time event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('📡 [Bookings] Setting up real-time listeners');

    // Listen for booking updates
    socket.on('booking:updated', (updatedBooking) => {
      console.log('🔔 [Real-time] Booking updated:', updatedBooking);
      
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );
      
      setNotification({
        open: true,
        message: 'Your booking has been updated!',
        type: 'info',
      });
    });

    // Listen for check-in events
    socket.on('booking:checkin', (data) => {
      console.log('🔔 [Real-time] Checked in:', data);
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === data.bookingId ? { ...b, status: 'checked_in' } : b
        )
      );
      
      setNotification({
        open: true,
        message: '✅ You have been checked in!',
        type: 'success',
      });
    });

    // Listen for check-out events
    socket.on('booking:checkout', (data) => {
      console.log('🔔 [Real-time] Checked out:', data);
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === data.bookingId ? { ...b, status: 'completed' } : b
        )
      );
      
      setNotification({
        open: true,
        message: 'You have been checked out. Thank you!',
        type: 'info',
      });
    });

    // Listen for booking cancellations
    socket.on('booking:cancelled', (data) => {
      console.log('🔔 [Real-time] Booking cancelled:', data);
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === data.id ? { ...b, status: 'cancelled' } : b
        )
      );
      
      setNotification({
        open: true,
        message: 'A booking has been cancelled',
        type: 'warning',
      });
    });

    // Cleanup listeners
    return () => {
      console.log('🔌 [Bookings] Cleaning up real-time listeners');
      socket.off('booking:updated');
      socket.off('booking:checkin');
      socket.off('booking:checkout');
      socket.off('booking:cancelled');
    };
  }, [socket, connected]);

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
        {/* Real-time Connection Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            My Bookings 📅
          </Typography>
          
          {connected ? (
            <Chip
              icon={<Wifi />}
              label="Live Updates"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ) : (
            <Chip
              icon={<WifiOff />}
              label="Offline"
              color="default"
              size="small"
            />
          )}
        </Box>

        {/* Real-time Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.type}
            sx={{ width: '100%', fontWeight: 600 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

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

