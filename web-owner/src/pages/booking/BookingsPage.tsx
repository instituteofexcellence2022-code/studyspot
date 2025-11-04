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
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  CheckCircle,
  Cancel,
  AccessTime,
  Person,
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
      const bookingService = new BookingService();
      const response = await bookingService.getBookings();
      setBookings(response.data || []);
      setNewBookingsCount(0); // Reset counter after refresh
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

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
    const statusConfig: Record<string, { color: any; icon: React.ReactNode }> = {
      confirmed: { color: 'success', icon: <CheckCircle /> },
      pending: { color: 'warning', icon: <AccessTime /> },
      cancelled: { color: 'error', icon: <Cancel /> },
      checked_in: { color: 'info', icon: <CheckCircle /> },
      completed: { color: 'default', icon: <CheckCircle /> },
    };

    const config = statusConfig[status] || { color: 'default', icon: null };

    return (
      <Chip
        icon={config.icon}
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
        )}
      </Paper>
    </Box>
  );
};

export default BookingsPage;


