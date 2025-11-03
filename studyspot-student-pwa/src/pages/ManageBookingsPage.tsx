import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
} from '@mui/material';
import {
  BookOnline,
  Edit,
  Cancel,
  CheckCircle,
  Schedule,
  LocationOn,
  Chair,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

interface Booking {
  id: string;
  libraryName: string;
  libraryId: string;
  seatNumber: string;
  date: string;
  shift: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  canCancel: boolean;
  canModify: boolean;
}

export default function ManageBookingsPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [modifyDialog, setModifyDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [modifyData, setModifyData] = useState({
    date: '',
    shift: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data.data || mockBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings(mockBookings);
    }
  };

  const mockBookings: Booking[] = [
    {
      id: '1',
      libraryName: 'Central Library',
      libraryId: '1',
      seatNumber: 'A-12',
      date: '2024-11-05',
      shift: 'Morning (6 AM - 12 PM)',
      status: 'confirmed',
      price: 150,
      canCancel: true,
      canModify: true,
    },
    {
      id: '2',
      libraryName: 'Knowledge Hub',
      libraryId: '2',
      seatNumber: 'B-07',
      date: '2024-11-06',
      shift: 'Full Day (6 AM - 11 PM)',
      status: 'confirmed',
      price: 300,
      canCancel: true,
      canModify: true,
    },
    {
      id: '3',
      libraryName: 'Central Library',
      libraryId: '1',
      seatNumber: 'C-20',
      date: '2024-11-02',
      shift: 'Evening (6 PM - 11 PM)',
      status: 'cancelled',
      price: 100,
      canCancel: false,
      canModify: false,
    },
  ];

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await api.post(`/api/bookings/${selectedBooking.id}/cancel`, {
        reason: cancelReason,
      });

      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const, canCancel: false, canModify: false } : b
      ));

      setCancelDialog(false);
      setSelectedBooking(null);
      setCancelReason('');
      alert('Booking cancelled successfully! Refund will be processed in 5-7 business days.');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleModifyBooking = async () => {
    if (!selectedBooking) return;

    try {
      await api.patch(`/api/bookings/${selectedBooking.id}`, {
        date: modifyData.date,
        shift: modifyData.shift,
      });

      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, date: modifyData.date, shift: modifyData.shift } 
          : b
      ));

      setModifyDialog(false);
      setSelectedBooking(null);
      setActiveStep(0);
      alert('Booking modified successfully!');
    } catch (error) {
      console.error('Failed to modify booking:', error);
      alert('Failed to modify booking. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📅 Manage Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, modify, or cancel your bookings
          </Typography>
        </Box>

        {/* Bookings List */}
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {booking.libraryName}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chair fontSize="small" color="action" />
                          <Typography variant="body2">
                            Seat: <strong>{booking.seatNumber}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(booking.date).toLocaleDateString()} • {booking.shift}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip 
                          label={booking.status} 
                          color={getStatusColor(booking.status) as any}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          ₹{booking.price}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {booking.canModify && (
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Edit />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setModifyData({ date: booking.date, shift: booking.shift });
                              setModifyDialog(true);
                            }}
                          >
                            Modify
                          </Button>
                        )}
                        {booking.canCancel && (
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            startIcon={<Cancel />}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialog(true);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'confirmed' && !booking.canModify && !booking.canCancel && (
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            Cannot modify within 24 hours
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {bookings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookOnline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bookings found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start exploring libraries and book your seat
            </Typography>
            <Button variant="contained" onClick={() => navigate('/libraries')}>
              Explore Libraries
            </Button>
          </Box>
        )}

        {/* Cancel Booking Dialog */}
        <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Cancellation is free up to 24 hours before the scheduled time. Refund will be processed in 5-7 business days.
            </Alert>

            {selectedBooking && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Booking Details</Typography>
                  <Typography variant="body1"><strong>{selectedBooking.libraryName}</strong></Typography>
                  <Typography variant="body2">Seat: {selectedBooking.seatNumber}</Typography>
                  <Typography variant="body2">
                    {new Date(selectedBooking.date).toLocaleDateString()} • {selectedBooking.shift}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="600">
                    Refund: ₹{selectedBooking.price}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              label="Reason for Cancellation (Optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              multiline
              rows={3}
              placeholder="Help us improve by sharing your reason..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog(false)}>Keep Booking</Button>
            <Button color="error" variant="contained" onClick={handleCancelBooking}>
              Confirm Cancellation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modify Booking Dialog */}
        <Dialog open={modifyDialog} onClose={() => setModifyDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Modify Booking</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 2 }}>
              <Step><StepLabel>Select Date</StepLabel></Step>
              <Step><StepLabel>Select Shift</StepLabel></Step>
              <Step><StepLabel>Confirm</StepLabel></Step>
            </Stepper>

            {activeStep === 0 && (
              <TextField
                fullWidth
                type="date"
                label="New Date"
                value={modifyData.date}
                onChange={(e) => setModifyData({ ...modifyData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            )}

            {activeStep === 1 && (
              <TextField
                fullWidth
                select
                label="New Shift"
                value={modifyData.shift}
                onChange={(e) => setModifyData({ ...modifyData, shift: e.target.value })}
              >
                <MenuItem value="Morning (6 AM - 12 PM)">Morning (6 AM - 12 PM)</MenuItem>
                <MenuItem value="Afternoon (12 PM - 6 PM)">Afternoon (12 PM - 6 PM)</MenuItem>
                <MenuItem value="Evening (6 PM - 11 PM)">Evening (6 PM - 11 PM)</MenuItem>
                <MenuItem value="Full Day (6 AM - 11 PM)">Full Day (6 AM - 11 PM)</MenuItem>
              </TextField>
            )}

            {activeStep === 2 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please review your changes before confirming
                </Alert>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Original Booking</Typography>
                    <Typography variant="body2">
                      {new Date(selectedBooking?.date || '').toLocaleDateString()} • {selectedBooking?.shift}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                      New Booking
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="600">
                      {new Date(modifyData.date).toLocaleDateString()} • {modifyData.shift}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
            )}
            <Button onClick={() => { setModifyDialog(false); setActiveStep(0); }}>Cancel</Button>
            {activeStep < 2 ? (
              <Button variant="contained" onClick={() => setActiveStep(prev => prev + 1)}>
                Next
              </Button>
            ) : (
              <Button variant="contained" onClick={handleModifyBooking}>
                Confirm Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

