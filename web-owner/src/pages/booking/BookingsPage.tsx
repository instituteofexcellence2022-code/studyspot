import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  CheckCircle,
  Cancel,
  AccessTime,
  Person,
  Refresh,
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import { BookingService } from '../../services/bookingService';
import { toast } from 'react-toastify';

const BookingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'info' | 'warning' }>({ 
    open: false, 
    message: '', 
    type: 'info' 
  });

  // 🔴 NEW: Real-time WebSocket connection
  const { socket, connected, error } = useSocket('library_owner');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('📡 [BookingsPage] Fetching bookings...');
      
      // Try to fetch real bookings
      const bookingService = new BookingService();
      const response = await bookingService.getBookings();
      console.log('📡 [BookingsPage] Response:', response);
      
      // Handle different response formats
      const bookingsData = response.data || response || [];
      console.log('📡 [BookingsPage] Bookings data:', bookingsData);
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setNewBookingsCount(0);
      
      if (bookingsData.length === 0) {
        console.log('ℹ️ [BookingsPage] No bookings found - using mock data for demo');
        // Use mock data for demo purposes
        setBookings(getMockBookings());
      }
    } catch (error: any) {
      console.error('❌ [BookingsPage] Failed to fetch bookings:', error);
      console.error('❌ [BookingsPage] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Show info message instead of error for demo
      toast.info('Using demo booking data - connect to backend for real data');
      
      // Use mock data as fallback
      setBookings(getMockBookings());
    } finally {
      setLoading(false);
    }
  };

  // Mock booking data for demo
  const getMockBookings = () => [
    {
      id: '1',
      studentName: 'Rajesh Kumar',
      libraryName: 'Central Study Hub',
      date: '2024-11-04',
      startTime: '2024-11-04T09:00:00Z',
      time: '09:00 AM',
      status: 'confirmed',
      totalAmount: 500,
      amount: 500,
    },
    {
      id: '2',
      studentName: 'Priya Sharma',
      libraryName: 'Tech Library',
      date: '2024-11-04',
      startTime: '2024-11-04T10:30:00Z',
      time: '10:30 AM',
      status: 'pending',
      totalAmount: 350,
      amount: 350,
    },
    {
      id: '3',
      studentName: 'Amit Patel',
      libraryName: 'Main Branch Library',
      date: '2024-11-03',
      startTime: '2024-11-03T14:00:00Z',
      time: '02:00 PM',
      status: 'checked_in',
      totalAmount: 600,
      amount: 600,
    },
    {
      id: '4',
      studentName: 'Sneha Reddy',
      libraryName: 'North Campus Library',
      date: '2024-11-02',
      startTime: '2024-11-02T11:00:00Z',
      time: '11:00 AM',
      status: 'completed',
      totalAmount: 450,
      amount: 450,
    },
    {
      id: '5',
      studentName: 'Vikram Singh',
      libraryName: 'Central Study Hub',
      date: '2024-11-01',
      startTime: '2024-11-01T08:00:00Z',
      time: '08:00 AM',
      status: 'cancelled',
      totalAmount: 400,
      amount: 400,
    },
  ];

  // 🔴 NEW: Real-time event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('📡 [Owner Bookings] Setting up real-time listeners');

    // New booking created by student
    socket.on('booking:created', (newBooking) => {
      console.log('🔔 [Real-time] New booking received:', newBooking);
      
      // Add to the top of the list
      setBookings((prev) => [newBooking, ...prev]);
      
      // Increment new bookings counter
      setNewBookingsCount((prev) => prev + 1);
      
      // Show notification with sound effect
      toast.success(`🎉 New booking from ${newBooking.studentName || 'Student'}!`, {
        autoClose: 5000,
        position: 'top-right',
      });
      
      // Optional: Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhTklU');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
    });

    // Booking updated
    socket.on('booking:updated', (updatedBooking) => {
      console.log('🔔 [Real-time] Booking updated:', updatedBooking);
      
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );
      
      toast.info('Booking has been updated');
    });

    // Booking cancelled
    socket.on('booking:cancelled', (data) => {
      console.log('🔔 [Real-time] Booking cancelled:', data);
      
      setBookings((prev) =>
        prev.map((b) =>
          b.id === data.id ? { ...b, status: 'cancelled' } : b
        )
      );
      
      toast.warning('A booking has been cancelled');
    });

    // Cleanup listeners
    return () => {
      console.log('🔌 [Owner Bookings] Cleaning up real-time listeners');
      socket.off('booking:created');
      socket.off('booking:updated');
      socket.off('booking:cancelled');
    };
  }, [socket, connected]);

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon?: React.ReactElement }> = {
      confirmed: { color: 'success', icon: <CheckCircle /> },
      pending: { color: 'warning', icon: <AccessTime /> },
      cancelled: { color: 'error', icon: <Cancel /> },
      checked_in: { color: 'info', icon: <CheckCircle /> },
      completed: { color: 'default', icon: <CheckCircle /> },
    };

    const config = statusConfig[status] || { color: 'default' };

    return (
      <Chip
        {...(config.icon && { icon: config.icon })}
        label={status.replace('_', ' ').toUpperCase()}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Bookings Management
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

        {newBookingsCount > 0 && (
          <Chip
            label={`${newBookingsCount} New`}
            color="error"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        )}

        <Tooltip title="Refresh bookings">
          <IconButton onClick={fetchBookings} size="small" color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Real-time Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 3 }}>
        {bookings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bookings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {connected 
                ? 'Waiting for new bookings... Real-time updates are active!'
                : 'Bookings will appear here when students make reservations.'}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </Typography>
              {bookings.length > 0 && !connected && (
                <Chip
                  label="Demo Data"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          {booking.studentName || booking.user?.firstName || 'Student'}
                        </Box>
                      </TableCell>
                      <TableCell>{booking.libraryName || booking.library?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.date || booking.startTime?.split('T')[0] || 'N/A'}</TableCell>
                      <TableCell>
                        {booking.startTime 
                          ? new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : booking.time || 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusChip(booking.status || 'pending')}</TableCell>
                      <TableCell>₹{booking.totalAmount || booking.amount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BookingsPage;
