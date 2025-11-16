import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Chip,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  EventSeat,
  CalendarMonth,
  Schedule,
  Payment,
  CheckCircle,
  LocationOn,
} from '@mui/icons-material';
import MobileLayout from '../components/MobileLayout';
import { gradients } from '../theme/colors';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface Library {
  id: string;
  name: string;
  address: string;
  hourlyRate: number;
  dailyRate: number;
  availableSeats: number;
  totalSeats: number;
}

const SHIFTS = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)', hours: 6, priceMultiplier: 1 },
  { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)', hours: 6, priceMultiplier: 1 },
  { value: 'evening', label: 'Evening (6 PM - 11 PM)', hours: 5, priceMultiplier: 0.9 },
  { value: 'full_day', label: 'Full Day (6 AM - 11 PM)', hours: 17, priceMultiplier: 2.5 },
];

export default function CreateBookingPage({ setIsAuthenticated }: any) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [library, setLibrary] = useState<Library | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: '',
    shift: '',
    seatNumber: '',
    notes: '',
  });
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchLibraryDetails();
    }
  }, [id]);

  const fetchLibraryDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/libraries/${id}`);
      const lib = response.data.data || response.data;
      setLibrary({
        id: lib.id || id,
        name: lib.name || 'Library',
        address: lib.address || '',
        hourlyRate: lib.hourlyRate || 50,
        dailyRate: lib.dailyRate || 300,
        availableSeats: lib.availableSeats || 0,
        totalSeats: lib.totalSeats || 100,
      });
      
      // Generate available seat numbers (mock - replace with actual API call)
      const seats: string[] = [];
      for (let i = 1; i <= Math.min(lib.availableSeats || 20, 20); i++) {
        seats.push(`A-${i.toString().padStart(2, '0')}`);
      }
      setAvailableSeats(seats);
    } catch (error: any) {
      console.error('Failed to fetch library:', error);
      toast.error('Failed to load library details');
      // Use mock data as fallback
      setLibrary({
        id: id || '1',
        name: 'Library',
        address: '',
        hourlyRate: 50,
        dailyRate: 300,
        availableSeats: 20,
        totalSeats: 100,
      });
      setAvailableSeats(['A-01', 'A-02', 'A-03', 'A-04', 'A-05']);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeats = async () => {
    if (!bookingData.date || !bookingData.shift) return;
    
    try {
      // TODO: Replace with actual API call to get available seats for date/shift
      // const response = await api.get(`/api/libraries/${id}/seats/available`, {
      //   params: { date: bookingData.date, shift: bookingData.shift }
      // });
      // setAvailableSeats(response.data.data || []);
      
      // Mock: Generate some available seats
      const seats: string[] = [];
      for (let i = 1; i <= 20; i++) {
        seats.push(`A-${i.toString().padStart(2, '0')}`);
      }
      setAvailableSeats(seats);
    } catch (error) {
      console.error('Failed to fetch available seats:', error);
    }
  };

  useEffect(() => {
    if (bookingData.date && bookingData.shift) {
      fetchAvailableSeats();
    }
  }, [bookingData.date, bookingData.shift]);

  const calculatePrice = () => {
    if (!library || !bookingData.shift) return 0;
    
    const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);
    if (!selectedShift) return 0;
    
    if (bookingData.shift === 'full_day') {
      return library.dailyRate;
    }
    
    return library.hourlyRate * selectedShift.hours * selectedShift.priceMultiplier;
  };

  const handleNext = () => {
    if (activeStep === 0 && !bookingData.date) {
      toast.error('Please select a date');
      return;
    }
    if (activeStep === 1 && !bookingData.shift) {
      toast.error('Please select a shift');
      return;
    }
    if (activeStep === 2 && !bookingData.seatNumber) {
      toast.error('Please select a seat');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!library || !user) {
      toast.error('Missing required information');
      return;
    }

    setSubmitting(true);
    try {
      const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);
      const startTime = selectedShift?.value === 'morning' ? '06:00:00' :
                       selectedShift?.value === 'afternoon' ? '12:00:00' :
                       selectedShift?.value === 'evening' ? '18:00:00' : '06:00:00';
      
      const endTime = selectedShift?.value === 'morning' ? '12:00:00' :
                     selectedShift?.value === 'afternoon' ? '18:00:00' :
                     selectedShift?.value === 'evening' ? '23:00:00' : '23:00:00';

      const bookingPayload = {
        libraryId: library.id,
        studentId: user.id,
        seatNumber: bookingData.seatNumber,
        date: bookingData.date,
        startTime,
        endTime,
        shift: bookingData.shift,
        totalAmount: calculatePrice(),
        notes: bookingData.notes,
        status: 'confirmed',
      };

      // Use /api/bookings (API Gateway routes to /api/v1/bookings internally)
      const response = await api.post('/api/bookings', bookingPayload);

      toast.success('Booking created successfully!');
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (error: any) {
      console.error('Booking creation failed:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Select Date', 'Choose Shift', 'Select Seat', 'Review & Confirm'];

  if (loading) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MobileLayout>
    );
  }

  if (!library) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Alert severity="error">Library not found</Alert>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: 0,
            py: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/libraries/${id}`)}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="600" noWrap>
                Book a Seat
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {library.name}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Container maxWidth="sm" sx={{ py: 3 }}>
          {/* Library Info Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {library.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<EventSeat />}
                  label={`${library.availableSeats} seats available`}
                  size="small"
                  color={library.availableSeats > 10 ? 'success' : 'warning'}
                />
                <Typography variant="body2" color="text.secondary">
                  ₹{library.hourlyRate}/hour
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              {/* Step 0: Select Date */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <CalendarMonth sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Select Date
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose the date for your study session
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    label="Booking Date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0],
                    }}
                    required
                  />
                </Box>
              )}

              {/* Step 1: Choose Shift */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <Schedule sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Choose Shift
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select your preferred time slot
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    label="Time Shift"
                    value={bookingData.shift}
                    onChange={(e) => setBookingData({ ...bookingData, shift: e.target.value })}
                    required
                  >
                    {SHIFTS.map((shift) => (
                      <MenuItem key={shift.value} value={shift.value}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{shift.label}</span>
                          <Chip
                            label={`₹${library ? Math.round(library.hourlyRate * shift.hours * shift.priceMultiplier) : 0}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {/* Step 2: Select Seat */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <EventSeat sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Select Seat
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose an available seat
                  </Typography>
                  <Grid container spacing={1.5}>
                    {availableSeats.map((seat) => (
                      <Grid item xs={6} sm={4} key={seat}>
                        <Button
                          fullWidth
                          variant={bookingData.seatNumber === seat ? 'contained' : 'outlined'}
                          onClick={() => setBookingData({ ...bookingData, seatNumber: seat })}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            ...(bookingData.seatNumber === seat && {
                              background: gradients.primary,
                            }),
                          }}
                        >
                          {seat}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                  {availableSeats.length === 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      No seats available for the selected date and shift. Please try a different date or shift.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 3: Review & Confirm */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <CheckCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Review & Confirm
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please review your booking details
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Library
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {library.name}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(bookingData.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Shift
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {SHIFTS.find(s => s.value === bookingData.shift)?.label}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Seat
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {bookingData.seatNumber}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="700">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="primary.main">
                        ₹{calculatePrice()}
                      </Typography>
                    </Box>
                  </Paper>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes (Optional)"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep > 0 && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleBack}
                disabled={submitting}
              >
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleNext}
                sx={{ background: gradients.primary }}
              >
                Next
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <Payment />}
                sx={{ background: gradients.primary }}
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </MobileLayout>
  );
}

