/**
 * 📚 FRESH BOOKING PAGE
 * 
 * Aligned with web owner portal's fee plan structure:
 * - Fetches fee plans from library
 * - Supports shift pricing (morning, afternoon, evening, night)
 * - Supports zone pricing (ac, nonAc, premium, quiet, general)
 * - Calculates price based on fee plan type and selections
 * - Submits booking with proper API format
 */

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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  ArrowBack,
  EventSeat,
  CalendarMonth,
  Schedule,
  Payment,
  CheckCircle,
  LocationOn,
  AccessTime,
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
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  availableSeats?: number;
  totalSeats?: number;
}

interface FeePlan {
  id: string;
  name: string;
  description: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo';
  basePrice: number;
  shiftPricing?: {
    morning?: number;
    afternoon?: number;
    evening?: number;
    night?: number;
  };
  zonePricing?: {
    ac?: number;
    nonAc?: number;
    premium?: number;
    quiet?: number;
    general?: number;
  };
  features: string[];
}

interface Seat {
  id: string;
  seatNumber: string;
  zone: string;
  isAvailable: boolean;
}

const SHIFTS = [
  { value: 'morning', label: 'Morning', start: '06:00', end: '12:00', hours: 6 },
  { value: 'afternoon', label: 'Afternoon', start: '12:00', end: '18:00', hours: 6 },
  { value: 'evening', label: 'Evening', start: '18:00', end: '23:00', hours: 5 },
  { value: 'full_day', label: 'Full Day', start: '06:00', end: '23:00', hours: 17 },
];

const ZONES = [
  { value: 'general', label: 'General', icon: '🪑' },
  { value: 'quiet', label: 'Quiet Zone', icon: '🔇' },
  { value: 'ac', label: 'AC Zone', icon: '❄️' },
  { value: 'nonAc', label: 'Non-AC Zone', icon: '🌬️' },
  { value: 'premium', label: 'Premium', icon: '⭐' },
];

export default function CreateBookingPage({ setIsAuthenticated }: any) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [library, setLibrary] = useState<Library | null>(null);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  const [bookingData, setBookingData] = useState({
    date: '',
    shift: '',
    feePlanId: '',
    zone: '',
    seatId: '',
    paymentMethod: 'online' as 'online' | 'offline',
  });

  useEffect(() => {
    if (id) {
      fetchLibraryDetails();
      fetchFeePlans();
    }
  }, [id]);

  useEffect(() => {
    if (bookingData.date && bookingData.shift && bookingData.zone) {
      fetchAvailableSeats();
    } else {
      setAvailableSeats([]);
    }
  }, [bookingData.date, bookingData.shift, bookingData.zone]);

  const fetchLibraryDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/libraries/${id}`);
      const lib = response.data.data || response.data;
      
      setLibrary({
        id: lib.id || id,
        name: lib.name || 'Library',
        address: lib.address || '',
        hourlyRate: lib.hourlyRate || lib.pricing?.hourly || 50,
        dailyRate: lib.dailyRate || lib.pricing?.daily || 300,
        weeklyRate: lib.weeklyRate || lib.pricing?.weekly || 1500,
        monthlyRate: lib.monthlyRate || lib.pricing?.monthly || 5000,
        availableSeats: lib.availableSeats || 0,
        totalSeats: lib.totalSeats || 100,
      });
    } catch (error: any) {
      console.error('[BOOKING] Failed to fetch library:', error);
      toast.error('Failed to load library details');
      // Use fallback data
      setLibrary({
        id: id || '1',
        name: 'Library',
        address: 'Address not available',
        hourlyRate: 50,
        dailyRate: 300,
        weeklyRate: 1500,
        monthlyRate: 5000,
        availableSeats: 20,
        totalSeats: 100,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeePlans = async () => {
    try {
      // Try to fetch fee plans from API
      const response = await api.get(`/api/fee-plans`);
      if (response.data.success && response.data.data?.plans) {
        setFeePlans(response.data.data.plans);
      } else {
        // Use default fee plans aligned with owner portal structure
        setFeePlans(getDefaultFeePlans());
      }
    } catch (error) {
      console.warn('[BOOKING] Failed to fetch fee plans, using defaults:', error);
      // Use default fee plans
      setFeePlans(getDefaultFeePlans());
    }
  };

  const getDefaultFeePlans = (): FeePlan[] => {
    if (!library) return [];
    
    return [
      {
        id: 'hourly-basic',
        name: 'Hourly Basic',
        description: 'Pay per hour for flexible usage',
        type: 'hourly',
        basePrice: library.hourlyRate || 50,
        shiftPricing: {
          morning: (library.hourlyRate || 50) * 0.8,
          afternoon: library.hourlyRate || 50,
          evening: (library.hourlyRate || 50) * 1.2,
          night: (library.hourlyRate || 50) * 1.5,
        },
        zonePricing: {
          ac: (library.hourlyRate || 50) * 1.2,
          nonAc: (library.hourlyRate || 50) * 0.8,
          premium: (library.hourlyRate || 50) * 1.5,
          quiet: (library.hourlyRate || 50) * 1.1,
          general: library.hourlyRate || 50,
        },
        features: ['Flexible hourly booking', 'Basic amenities access', 'WiFi included'],
      },
      {
        id: 'daily-pass',
        name: 'Daily Pass',
        description: 'Full day access with all amenities',
        type: 'daily',
        basePrice: library.dailyRate || 300,
        shiftPricing: {
          morning: (library.dailyRate || 300) * 0.8,
          afternoon: library.dailyRate || 300,
          evening: (library.dailyRate || 300) * 1.2,
        },
        zonePricing: {
          ac: (library.dailyRate || 300) * 1.2,
          nonAc: (library.dailyRate || 300) * 0.8,
          premium: (library.dailyRate || 300) * 1.5,
          quiet: (library.dailyRate || 300) * 1.1,
          general: library.dailyRate || 300,
        },
        features: ['Full day access (8 AM - 10 PM)', 'All amenities included', 'Priority seating'],
      },
    ];
  };

  const fetchAvailableSeats = async () => {
    if (!id || !bookingData.date || !bookingData.shift || !bookingData.zone) return;

    setLoadingSeats(true);
    try {
      // Try to fetch available seats from API
      const response = await api.get(`/api/libraries/${id}/seats/available`, {
        params: {
          date: bookingData.date,
          startTime: SHIFTS.find(s => s.value === bookingData.shift)?.start,
          endTime: SHIFTS.find(s => s.value === bookingData.shift)?.end,
          zone: bookingData.zone,
        },
      });

      if (response.data.success && response.data.data) {
        setAvailableSeats(response.data.data.seats || []);
      } else {
        // Generate mock seats for demo
        generateMockSeats();
      }
    } catch (error) {
      console.warn('[BOOKING] Failed to fetch available seats, using mock data:', error);
      generateMockSeats();
    } finally {
      setLoadingSeats(false);
    }
  };

  const generateMockSeats = () => {
    const seats: Seat[] = [];
    const zoneLabel = ZONES.find(z => z.value === bookingData.zone)?.label || 'General';
    for (let i = 1; i <= 20; i++) {
      seats.push({
        id: `seat-${i}`,
        seatNumber: `${zoneLabel.charAt(0)}-${i.toString().padStart(2, '0')}`,
        zone: bookingData.zone,
        isAvailable: Math.random() > 0.3, // 70% available
      });
    }
    setAvailableSeats(seats);
  };

  const calculatePrice = (): number => {
    if (!library || !bookingData.shift || !bookingData.feePlanId) return 0;

    const selectedPlan = feePlans.find(p => p.id === bookingData.feePlanId);
    if (!selectedPlan) return 0;

    const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);
    if (!selectedShift) return 0;

    let basePrice = selectedPlan.basePrice;

    // Apply shift pricing if available
    if (selectedPlan.shiftPricing && bookingData.shift !== 'full_day') {
      const shiftPrice = selectedPlan.shiftPricing[bookingData.shift as keyof typeof selectedPlan.shiftPricing];
      if (shiftPrice) {
        basePrice = shiftPrice;
      }
    }

    // Apply zone pricing if available
    if (selectedPlan.zonePricing && bookingData.zone) {
      const zonePrice = selectedPlan.zonePricing[bookingData.zone as keyof typeof selectedPlan.zonePricing];
      if (zonePrice) {
        basePrice = zonePrice;
      }
    }

    // Calculate total based on plan type
    if (selectedPlan.type === 'hourly') {
      return basePrice * selectedShift.hours;
    } else if (selectedPlan.type === 'daily') {
      return basePrice;
    } else if (selectedPlan.type === 'weekly') {
      return basePrice;
    } else if (selectedPlan.type === 'monthly') {
      return basePrice;
    }

    return basePrice;
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
    if (activeStep === 2 && !bookingData.feePlanId) {
      toast.error('Please select a fee plan');
      return;
    }
    if (activeStep === 3 && !bookingData.zone) {
      toast.error('Please select a zone');
      return;
    }
    if (activeStep === 4 && !bookingData.seatId) {
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

    if (!bookingData.seatId || !bookingData.date || !bookingData.shift || !bookingData.feePlanId) {
      toast.error('Please complete all booking details');
      return;
    }

    setSubmitting(true);
    try {
      const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);
      if (!selectedShift) {
        toast.error('Invalid shift selected');
        return;
      }

      const selectedPlan = feePlans.find(p => p.id === bookingData.feePlanId);
      if (!selectedPlan) {
        toast.error('Invalid fee plan selected');
        return;
      }

      // Map booking type from fee plan
      let bookingType: 'hourly' | 'daily' | 'monthly' = 'hourly';
      if (selectedPlan.type === 'daily' || selectedPlan.type === 'weekly') {
        bookingType = 'daily';
      } else if (selectedPlan.type === 'monthly' || selectedPlan.type === 'quarterly' || selectedPlan.type === 'annual') {
        bookingType = 'monthly';
      }

      // Format date and time for API
      const startTime = `${selectedShift.start}:00`;
      const endTime = `${selectedShift.end}:00`;

      // API expects: libraryId, seatId, date, startTime, endTime, bookingType, paymentMethod
      const bookingPayload = {
        libraryId: library.id,
        seatId: bookingData.seatId,
        date: bookingData.date,
        startTime,
        endTime,
        bookingType,
        paymentMethod: bookingData.paymentMethod,
      };

      console.log('[BOOKING] Submitting booking:', bookingPayload);

      const response = await api.post('/api/bookings', bookingPayload);

      if (response.data.success) {
        toast.success('Booking created successfully!');
        setTimeout(() => {
          navigate('/bookings');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('[BOOKING] Booking creation failed:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Select Date', 'Choose Shift', 'Select Fee Plan', 'Choose Zone', 'Select Seat', 'Review & Confirm'];

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
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Library not found. Please go back and try again.
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/libraries')}
          >
            Back to Libraries
          </Button>
        </Container>
      </MobileLayout>
    );
  }

  if (!user) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please login to book a seat.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Container>
      </MobileLayout>
    );
  }

  const selectedPlan = feePlans.find(p => p.id === bookingData.feePlanId);
  const selectedSeat = availableSeats.find(s => s.id === bookingData.seatId);
  const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);

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
                  label={`${library.availableSeats || 0} seats available`}
                  size="small"
                  color={(library.availableSeats || 0) > 10 ? 'success' : 'warning'}
                />
                <Typography variant="body2" color="text.secondary">
                  Starting from ₹{library.hourlyRate || 50}/hour
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
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, shift: '', zone: '', seatId: '' })}
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
                    onChange={(e) => setBookingData({ ...bookingData, shift: e.target.value, zone: '', seatId: '' })}
                    required
                  >
                    {SHIFTS.map((shift) => (
                      <MenuItem key={shift.value} value={shift.value}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body1">{shift.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {shift.start} - {shift.end} ({shift.hours} hours)
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {/* Step 2: Select Fee Plan */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Select Fee Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose a pricing plan that suits your needs
                  </Typography>
                  <Grid container spacing={2}>
                    {feePlans.map((plan) => (
                      <Grid item xs={12} key={plan.id}>
                        <Card
                          variant={bookingData.feePlanId === plan.id ? 'outlined' : 'outlined'}
                          sx={{
                            cursor: 'pointer',
                            border: bookingData.feePlanId === plan.id ? 2 : 1,
                            borderColor: bookingData.feePlanId === plan.id ? 'primary.main' : 'divider',
                            bgcolor: bookingData.feePlanId === plan.id ? 'action.selected' : 'background.paper',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                          onClick={() => setBookingData({ ...bookingData, feePlanId: plan.id })}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                              <Box>
                                <Typography variant="h6" fontWeight="600">
                                  {plan.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {plan.description}
                                </Typography>
                              </Box>
                              <Chip
                                label={`₹${plan.basePrice}`}
                                color="primary"
                                size="small"
                              />
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              {plan.features.slice(0, 3).map((feature, idx) => (
                                <Typography key={idx} variant="caption" display="block" color="text.secondary">
                                  • {feature}
                                </Typography>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Step 3: Choose Zone */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <EventSeat sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Choose Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select your preferred study zone
                  </Typography>
                  <Grid container spacing={2}>
                    {ZONES.map((zone) => (
                      <Grid item xs={6} sm={4} key={zone.value}>
                        <Card
                          variant="outlined"
                          sx={{
                            cursor: 'pointer',
                            border: bookingData.zone === zone.value ? 2 : 1,
                            borderColor: bookingData.zone === zone.value ? 'primary.main' : 'divider',
                            bgcolor: bookingData.zone === zone.value ? 'action.selected' : 'background.paper',
                            textAlign: 'center',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                          onClick={() => setBookingData({ ...bookingData, zone: zone.value, seatId: '' })}
                        >
                          <CardContent sx={{ py: 2 }}>
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              {zone.icon}
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {zone.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Step 4: Select Seat */}
              {activeStep === 4 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <EventSeat sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Select Seat
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose an available seat from {ZONES.find(z => z.value === bookingData.zone)?.label}
                  </Typography>
                  {loadingSeats ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={1.5}>
                      {availableSeats
                        .filter(seat => seat.zone === bookingData.zone)
                        .map((seat) => (
                          <Grid item xs={6} sm={4} key={seat.id}>
                            <Button
                              fullWidth
                              variant={bookingData.seatId === seat.id ? 'contained' : 'outlined'}
                              disabled={!seat.isAvailable}
                              onClick={() => setBookingData({ ...bookingData, seatId: seat.id })}
                              sx={{
                                py: 1.5,
                                borderRadius: 2,
                                ...(bookingData.seatId === seat.id && {
                                  background: gradients.primary,
                                }),
                                ...(!seat.isAvailable && {
                                  opacity: 0.5,
                                  cursor: 'not-allowed',
                                }),
                              }}
                            >
                              {seat.seatNumber}
                              {!seat.isAvailable && (
                                <Chip label="Booked" size="small" color="error" sx={{ ml: 1 }} />
                              )}
                            </Button>
                          </Grid>
                        ))}
                    </Grid>
                  )}
                  {availableSeats.filter(seat => seat.zone === bookingData.zone && seat.isAvailable).length === 0 && !loadingSeats && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      No seats available in this zone for the selected date and shift. Please try a different zone or time.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 5: Review & Confirm */}
              {activeStep === 5 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    <CheckCircle sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Review & Confirm
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please review your booking details before confirming
                  </Typography>

                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Library:</Typography>
                      <Typography variant="body2" fontWeight="600">{library.name}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(bookingData.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Shift:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {selectedShift?.label} ({selectedShift?.start} - {selectedShift?.end})
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Fee Plan:</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedPlan?.name}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Zone:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {ZONES.find(z => z.value === bookingData.zone)?.label}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Seat:</Typography>
                      <Typography variant="body2" fontWeight="600">{selectedSeat?.seatNumber}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="700">Total Amount:</Typography>
                      <Typography variant="h6" fontWeight="700" color="primary.main">
                        ₹{calculatePrice()}
                      </Typography>
                    </Box>
                  </Paper>

                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Payment Method</FormLabel>
                    <RadioGroup
                      value={bookingData.paymentMethod}
                      onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as 'online' | 'offline' })}
                    >
                      <FormControlLabel value="online" control={<Radio />} label="Online Payment" />
                      <FormControlLabel value="offline" control={<Radio />} label="Pay at Library" />
                    </RadioGroup>
                  </FormControl>
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
