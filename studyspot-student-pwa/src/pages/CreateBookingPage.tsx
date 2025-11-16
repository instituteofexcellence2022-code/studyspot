/**
 * 📚 SINGLE-VIEW BOOKING PAGE
 * 
 * All booking information in one view for quick selection:
 * - Date, Shift, Fee Plan, Zone, Seat selection
 * - Real-time price calculation
 * - Booking summary
 * - Aligned with web owner portal's fee plan structure
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
  Stack,
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
  AttachMoney,
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
  { value: 'morning', label: 'Morning', start: '06:00', end: '12:00', hours: 6, icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', start: '12:00', end: '18:00', hours: 6, icon: '☀️' },
  { value: 'evening', label: 'Evening', start: '18:00', end: '23:00', hours: 5, icon: '🌆' },
  { value: 'full_day', label: 'Full Day', start: '06:00', end: '23:00', hours: 17, icon: '📅' },
];

const ZONES = [
  { value: 'general', label: 'General', icon: '🪑', description: 'Standard seating area' },
  { value: 'quiet', label: 'Quiet Zone', icon: '🔇', description: 'Silent study area' },
  { value: 'ac', label: 'AC Zone', icon: '❄️', description: 'Air-conditioned area' },
  { value: 'nonAc', label: 'Non-AC Zone', icon: '🌬️', description: 'Natural ventilation' },
  { value: 'premium', label: 'Premium', icon: '⭐', description: 'Premium seating with extra amenities' },
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
      setBookingData(prev => ({ ...prev, seatId: '' }));
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
      const response = await api.get(`/api/fee-plans`);
      if (response.data.success && response.data.data?.plans) {
        setFeePlans(response.data.data.plans);
      } else {
        setFeePlans(getDefaultFeePlans());
      }
    } catch (error) {
      console.warn('[BOOKING] Failed to fetch fee plans, using defaults:', error);
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
        isAvailable: Math.random() > 0.3,
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

  const handleSubmit = async () => {
    if (!library || !user) {
      toast.error('Missing required information');
      return;
    }

    // Validate all required fields
    if (!bookingData.date) {
      toast.error('Please select a date');
      return;
    }
    if (!bookingData.shift) {
      toast.error('Please select a shift');
      return;
    }
    if (!bookingData.feePlanId) {
      toast.error('Please select a fee plan');
      return;
    }
    if (!bookingData.zone) {
      toast.error('Please select a zone');
      return;
    }
    if (!bookingData.seatId) {
      toast.error('Please select a seat');
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
  const selectedZone = ZONES.find(z => z.value === bookingData.zone);
  const totalPrice = calculatePrice();
  const isFormValid = bookingData.date && bookingData.shift && bookingData.feePlanId && bookingData.zone && bookingData.seatId;

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

        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* Library Info Card */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {library.address}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

          <Grid container spacing={3}>
            {/* Left Column - Booking Options */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* 1. Date Selection */}
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarMonth color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Select Date
                      </Typography>
                    </Box>
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
                  </CardContent>
                </Card>

                {/* 2. Shift Selection */}
                {bookingData.date && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Schedule color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Choose Shift
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {SHIFTS.map((shift) => (
                          <Grid item xs={6} sm={3} key={shift.value}>
                            <Card
                              variant="outlined"
                              sx={{
                                cursor: 'pointer',
                                border: bookingData.shift === shift.value ? 2 : 1,
                                borderColor: bookingData.shift === shift.value ? 'primary.main' : 'divider',
                                bgcolor: bookingData.shift === shift.value ? 'action.selected' : 'background.paper',
                                textAlign: 'center',
                                '&:hover': { borderColor: 'primary.main' },
                              }}
                              onClick={() => setBookingData({ ...bookingData, shift: shift.value, zone: '', seatId: '' })}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Typography variant="h5" sx={{ mb: 0.5 }}>
                                  {shift.icon}
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {shift.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {shift.start} - {shift.end}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {shift.hours} hours
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Fee Plan Selection */}
                {bookingData.shift && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Select Fee Plan
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {feePlans.map((plan) => (
                          <Grid item xs={12} sm={6} key={plan.id}>
                            <Card
                              variant="outlined"
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
                                  {plan.features.slice(0, 2).map((feature, idx) => (
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
                    </CardContent>
                  </Card>
                )}

                {/* 4. Zone Selection */}
                {bookingData.feePlanId && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventSeat color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Choose Zone
                        </Typography>
                      </Box>
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
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {zone.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 5. Seat Selection */}
                {bookingData.zone && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventSeat color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Select Seat
                        </Typography>
                        {selectedZone && (
                          <Chip
                            label={selectedZone.label}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      {loadingSeats ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <>
                          <Grid container spacing={1.5}>
                            {availableSeats
                              .filter(seat => seat.zone === bookingData.zone)
                              .map((seat) => (
                                <Grid item xs={6} sm={4} md={3} key={seat.id}>
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
                                  </Button>
                                </Grid>
                              ))}
                          </Grid>
                          {availableSeats.filter(seat => seat.zone === bookingData.zone && seat.isAvailable).length === 0 && !loadingSeats && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                              No seats available in this zone for the selected date and shift. Please try a different zone or time.
                            </Alert>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 6. Payment Method */}
                {bookingData.seatId && (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Payment color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Payment Method
                        </Typography>
                      </Box>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={bookingData.paymentMethod}
                          onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as 'online' | 'offline' })}
                          row
                        >
                          <FormControlLabel value="online" control={<Radio />} label="Online Payment" />
                          <FormControlLabel value="offline" control={<Radio />} label="Pay at Library" />
                        </RadioGroup>
                      </FormControl>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>

            {/* Right Column - Booking Summary (Sticky) */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
                <Card sx={{ borderRadius: 2, border: 2, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="primary" />
                      Booking Summary
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Library</Typography>
                        <Typography variant="body2" fontWeight="600">{library.name}</Typography>
                      </Box>

                      {bookingData.date && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </Typography>
                        </Box>
                      )}

                      {selectedShift && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Shift</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedShift.icon} {selectedShift.label} ({selectedShift.start} - {selectedShift.end})
                          </Typography>
                        </Box>
                      )}

                      {selectedPlan && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Fee Plan</Typography>
                          <Typography variant="body2" fontWeight="600">{selectedPlan.name}</Typography>
                        </Box>
                      )}

                      {selectedZone && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Zone</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedZone.icon} {selectedZone.label}
                          </Typography>
                        </Box>
                      )}

                      {selectedSeat && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Seat</Typography>
                          <Typography variant="body2" fontWeight="600">{selectedSeat.seatNumber}</Typography>
                        </Box>
                      )}

                      {bookingData.paymentMethod && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Payment</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {bookingData.paymentMethod === 'online' ? 'Online Payment' : 'Pay at Library'}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="700">Total Amount</Typography>
                        <Typography variant="h5" fontWeight="700" color="primary.main">
                          ₹{totalPrice || 0}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!isFormValid || submitting}
                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Payment />}
                        sx={{
                          mt: 2,
                          background: gradients.primary,
                          py: 1.5,
                          fontWeight: 'bold',
                        }}
                      >
                        {submitting ? 'Processing...' : 'Confirm Booking'}
                      </Button>

                      {!isFormValid && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Please complete all booking details to proceed
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MobileLayout>
  );
}
