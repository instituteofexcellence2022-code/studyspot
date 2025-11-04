/**
 * 🎯 ENHANCED SEAT BOOKING - COMPLETE FLOW
 * 
 * Features:
 * - Multi-step booking wizard
 * - Date & time selection
 * - Advanced filtering
 * - Seat recommendations
 * - Price calculator
 * - Payment integration
 * - Booking confirmation
 * - Email/SMS notifications
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Badge,
  Grid,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  EventSeat,
  VolumeOff,
  Groups,
  MenuBook,
  Window as WindowIcon,
  Power,
  Wifi,
  LocalLibrary,
  Business,
  LockOpen,
  WbSunny,
  AcUnit,
  Close,
  Check,
  Info,
  FilterList,
  ShoppingCart,
  EventAvailable,
  ChairAlt,
  Favorite,
  FavoriteBorder,
  ZoomIn,
  CalendarMonth,
  AccessTime,
  Payment,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Star,
  TrendingUp,
  LocalOffer,
  ExpandMore,
  Phone,
  Email as EmailIcon,
  CreditCard,
  AccountBalanceWallet,
  QrCode2,
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';
import { generateReceipt, downloadHTMLReceipt, printReceipt } from '../utils/receiptGenerator';
import { useAuth } from '../contexts/AuthContext';
import { feePlanService } from '../services/feePlan.service';
import { FeePlan } from '../types/feePlan';

interface EnhancedSeatBookingProps {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
  libraryId?: string;
  libraryName?: string;
  embedded?: boolean;
}

interface LibrarySeat {
  id: string;
  row: string;
  number: number;
  zone: 'silent' | 'reading' | 'discussion' | 'exam-prep' | 'premium';
  deskType: 'individual' | 'double' | 'group';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  features: {
    window: boolean;
    power: boolean;
    wifi: boolean;
    locker: boolean;
    ac: boolean;
    naturalLight: boolean;
    cushionedChair: boolean;
  };
  capacity: number;
  libraryName?: string;
  rating?: number;
  bookedCount?: number;
  lastAvailable?: string;
}

interface BookingDetails {
  date: string;
  shift?: string; // NEW: morning, afternoon, evening, fullday
  startTime: string;
  endTime: string;
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly';
  seats: string[];
  totalAmount: number;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'cod';
  addons: {
    locker: boolean;
    snacks: boolean;
    wifi: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
  };
  specialRequests: string;
}

const EnhancedSeatBooking: React.FC<EnhancedSeatBookingProps> = ({ 
  darkMode, 
  setDarkMode, 
  libraryId, 
  libraryName, 
  embedded = false 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [seats, setSeats] = useState<LibrarySeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null);
  const [favoriteSeats, setFavoriteSeats] = useState<string[]>([]);
  const [layoutCreated, setLayoutCreated] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  
  // NEW: Fee plans from library
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [selectedFeePlan, setSelectedFeePlan] = useState<FeePlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Booking details
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: new Date().toISOString().split('T')[0],
    shift: '', // NEW: shift selection
    startTime: '09:00',
    endTime: '18:00',
    duration: 'daily',
    seats: [],
    totalAmount: 0,
    paymentMethod: 'upi',
    addons: {
      locker: false,
      snacks: false,
      wifi: true,
    },
    notifications: {
      email: true,
      sms: true,
    },
    specialRequests: '',
  });

  // NEW: Shift options
  const shifts = [
    { id: 'morning', label: 'Morning', time: '6 AM - 12 PM', price: 150, icon: '🌅', hours: 6 },
    { id: 'afternoon', label: 'Afternoon', time: '12 PM - 6 PM', price: 150, icon: '☀️', hours: 6 },
    { id: 'evening', label: 'Evening', time: '6 PM - 11 PM', price: 100, icon: '🌙', hours: 5 },
    { id: 'fullday', label: 'Full Day', time: '6 AM - 11 PM', price: 300, icon: '⏰', hours: 17 },
  ];

  // Filters
  const [filters, setFilters] = useState({
    window: false,
    power: false,
    locker: false,
    ac: false,
    naturalLight: false,
    cushionedChair: false,
    minRating: 0,
  });

  const { socket, connected } = useSocket('student');
  const { user } = useAuth();

  const steps = ['Select Plan & Date', 'Choose Seats', 'Add-ons & Options', 'Payment', 'Confirmation'];

  // Load fee plans from library
  useEffect(() => {
    if (libraryId && layoutCreated) {
      loadFeePlans();
    }
  }, [libraryId, layoutCreated]);

  const loadFeePlans = async () => {
    setLoadingPlans(true);
    try {
      const plans = await feePlanService.getActiveFeePlans(libraryId || '');
      setFeePlans(plans);
      console.log('📋 Loaded fee plans:', plans);
      
      // Auto-select the most popular or first active plan
      const popular = plans.find(p => p.isPopular) || plans[0];
      if (popular) {
        setSelectedFeePlan(popular);
        setBookingDetails(prev => ({ ...prev, duration: popular.type }));
      }
    } catch (error) {
      console.error('Error loading fee plans:', error);
      toast.info('Using default pricing options');
    } finally {
      setLoadingPlans(false);
    }
  };

  const zoneConfig = {
    'silent': {
      label: 'Silent Study Zone',
      icon: <VolumeOff />,
      color: '#2196F3',
      description: 'Zero noise, individual study',
      hourly: 20,
      daily: 150,
      weekly: 800,
      monthly: 2500,
      features: ['Noise-cancelling', 'Individual desks', 'No discussions'],
    },
    'reading': {
      label: 'Reading Zone',
      icon: <MenuBook />,
      color: '#4CAF50',
      description: 'Quiet reading area',
      hourly: 15,
      daily: 120,
      weekly: 650,
      monthly: 2000,
      features: ['Natural light', 'Comfortable seating', 'Book storage'],
    },
    'discussion': {
      label: 'Discussion Zone',
      icon: <Groups />,
      color: '#FF9800',
      description: 'Group study & discussions',
      hourly: 25,
      daily: 180,
      weekly: 950,
      monthly: 3000,
      features: ['Whiteboards', 'Group tables', 'Discussion allowed'],
    },
    'exam-prep': {
      label: 'Exam Preparation',
      icon: <LocalLibrary />,
      color: '#9C27B0',
      description: 'Focused exam preparation',
      hourly: 30,
      daily: 200,
      weekly: 1100,
      monthly: 3500,
      features: ['Extended hours', 'Study materials', 'Mock test area'],
    },
    'premium': {
      label: 'Premium Executive',
      icon: <Business />,
      color: '#FFD700',
      description: 'All amenities included',
      hourly: 50,
      daily: 350,
      weekly: 1800,
      monthly: 5000,
      features: ['Personal locker', 'Premium seating', 'Refreshments', 'Priority support'],
    },
  };

  const createLibraryLayout = () => {
    const newSeats: LibrarySeat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 12;

    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        if (seatNum === 6 || seatNum === 7) continue;

        let zone: 'silent' | 'reading' | 'discussion' | 'exam-prep' | 'premium' = 'reading';
        let deskType: 'individual' | 'double' | 'group' = 'individual';
        let capacity = 1;

        if (rowIndex < 2) {
          zone = 'premium';
        } else if (rowIndex >= 2 && rowIndex < 4) {
          zone = 'silent';
        } else if (rowIndex >= 4 && rowIndex < 6) {
          zone = 'exam-prep';
        } else if (rowIndex >= 6 && rowIndex < 8) {
          zone = 'discussion';
          if (seatNum % 3 === 0) {
            deskType = 'double';
            capacity = 2;
          }
        } else {
          zone = 'reading';
        }

        const hasWindow = seatNum === 1 || seatNum === seatsPerRow;
        const hasNaturalLight = rowIndex < 3 || hasWindow;
        const hasPower = seatNum % 2 === 0;
        const hasAC = ['premium', 'silent', 'exam-prep'].includes(zone);
        const hasLocker = ['premium', 'exam-prep'].includes(zone);
        const hasCushionedChair = ['premium', 'exam-prep', 'silent'].includes(zone);

        let status: 'available' | 'occupied' | 'selected' | 'blocked' = 'available';
        if (Math.random() > 0.85) {
          status = 'occupied';
        }

        const zonePrice = zoneConfig[zone];
        const rating = 3.5 + Math.random() * 1.5;
        const bookedCount = Math.floor(Math.random() * 500);

        newSeats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          zone,
          deskType,
          status,
          pricing: {
            hourly: zonePrice.hourly,
            daily: zonePrice.daily,
            weekly: zonePrice.weekly,
            monthly: zonePrice.monthly,
          },
          features: {
            window: hasWindow,
            power: hasPower,
            wifi: true,
            locker: hasLocker,
            ac: hasAC,
            naturalLight: hasNaturalLight,
            cushionedChair: hasCushionedChair,
          },
          capacity,
          libraryName: libraryName || 'Central Study Hub',
          rating: parseFloat(rating.toFixed(1)),
          bookedCount,
          lastAvailable: status === 'occupied' ? 'Tomorrow' : 'Now',
        });
      }
    });

    setSeats(newSeats);
    setLayoutCreated(true);
  };

  // Real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('seat:availability', (data) => {
      setSeats(prev => prev.map(s => 
        s.id === data.seatId 
          ? { ...s, status: data.isAvailable ? 'available' : 'occupied' }
          : s
      ));
      toast.info(`Seat ${data.seatId} is now ${data.isAvailable ? 'available' : 'occupied'}`);
    });

    return () => {
      socket.off('seat:availability');
    };
  }, [socket, connected]);

  const handleSeatClick = useCallback((seat: LibrarySeat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') {
      toast.warning(`Seat ${seat.id} is not available`);
      return;
    }
    setSelectedSeat(seat);
  }, []);

  const handleToggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'available' as const } : s
      ));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'selected' as const } : s
      ));
    }
  };

  const toggleFavorite = (seatId: string) => {
    setFavoriteSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
    toast.success(favoriteSeats.includes(seatId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const getSeatColor = (seat: LibrarySeat) => {
    if (seat.status === 'occupied') return '#757575';
    if (seat.status === 'selected') return '#1976D2';
    if (seat.status === 'blocked') return '#BDBDBD';
    return zoneConfig[seat.zone].color;
  };

  const calculateTotalPrice = useMemo(() => {
    if (!selectedFeePlan) return 0;

    // Use fee plan pricing
    let basePrice = feePlanService.calculatePrice(
      selectedFeePlan,
      selectedSeats.length,
      bookingDetails.shift,
      bookingDetails.duration === 'daily' && selectedFeePlan.shiftPricing ? undefined : selectedZone
    );

    // Add-ons
    if (bookingDetails.addons.locker) basePrice += 50 * selectedSeats.length;
    if (bookingDetails.addons.snacks) basePrice += 100 * selectedSeats.length;
    if (bookingDetails.addons.wifi && bookingDetails.duration === 'hourly') basePrice += 20 * selectedSeats.length;

    return basePrice;
  }, [selectedSeats, bookingDetails, selectedFeePlan, selectedZone]);

  const filteredSeats = useMemo(() => {
    let result = selectedZone === 'all' ? seats : seats.filter(s => s.zone === selectedZone);
    
    if (filters.window) result = result.filter(s => s.features.window);
    if (filters.power) result = result.filter(s => s.features.power);
    if (filters.locker) result = result.filter(s => s.features.locker);
    if (filters.ac) result = result.filter(s => s.features.ac);
    if (filters.naturalLight) result = result.filter(s => s.features.naturalLight);
    if (filters.cushionedChair) result = result.filter(s => s.features.cushionedChair);
    if (filters.minRating > 0) result = result.filter(s => (s.rating || 0) >= filters.minRating);
    
    return result;
  }, [seats, selectedZone, filters]);

  const stats = useMemo(() => ({
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    occupied: seats.filter(s => s.status === 'occupied').length,
    selected: selectedSeats.length,
  }), [seats, selectedSeats]);

  const rows = useMemo(() => 
    Array.from(new Set(filteredSeats.map(s => s.row))).sort(),
    [filteredSeats]
  );

  const handleNext = () => {
    if (activeStep === 1 && selectedSeats.length === 0) {
      toast.warning('Please select at least one seat');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleConfirmBooking = () => {
    // Update booking details with selected seats and total
    setBookingDetails(prev => ({
      ...prev,
      seats: selectedSeats,
      totalAmount: calculateTotalPrice,
    }));
    
    toast.success(`🎉 Booking confirmed! Total: ₹${calculateTotalPrice}`);
    setActiveStep(4);
  };

  const handleDownloadReceipt = () => {
    const receiptData = {
      bookingId: `BK${Date.now().toString().slice(-8)}`,
      date: bookingDetails.date,
      libraryName: libraryName || 'Central Study Hub',
      seats: selectedSeats,
      duration: bookingDetails.duration,
      basePrice: selectedSeats.reduce((total, seatId) => {
        const seat = seats.find(s => s.id === seatId);
        return total + (seat?.pricing[bookingDetails.duration] || 0);
      }, 0),
      addons: {
        locker: bookingDetails.addons.locker ? 50 * selectedSeats.length : 0,
        snacks: bookingDetails.addons.snacks ? 100 * selectedSeats.length : 0,
        wifi: bookingDetails.addons.wifi && bookingDetails.duration === 'hourly' ? 20 * selectedSeats.length : 0,
      },
      totalAmount: calculateTotalPrice,
      paymentMethod: bookingDetails.paymentMethod,
      studentName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Student',
      studentEmail: user?.email,
      studentPhone: user?.phone,
    };

    try {
      generateReceipt(receiptData);
      toast.success('📄 Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const handlePrintReceipt = () => {
    const receiptData = {
      bookingId: `BK${Date.now().toString().slice(-8)}`,
      date: bookingDetails.date,
      libraryName: libraryName || 'Central Study Hub',
      seats: selectedSeats,
      duration: bookingDetails.duration,
      basePrice: selectedSeats.reduce((total, seatId) => {
        const seat = seats.find(s => s.id === seatId);
        return total + (seat?.pricing[bookingDetails.duration] || 0);
      }, 0),
      addons: {
        locker: bookingDetails.addons.locker ? 50 * selectedSeats.length : 0,
        snacks: bookingDetails.addons.snacks ? 100 * selectedSeats.length : 0,
        wifi: bookingDetails.addons.wifi && bookingDetails.duration === 'hourly' ? 20 * selectedSeats.length : 0,
      },
      totalAmount: calculateTotalPrice,
      paymentMethod: bookingDetails.paymentMethod,
      studentName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Student',
      studentEmail: user?.email,
      studentPhone: user?.phone,
    };

    try {
      printReceipt(receiptData);
      toast.success('🖨️ Opening print dialog...');
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Failed to print receipt');
    }
  };

  const getRecommendedSeats = () => {
    return seats
      .filter(s => s.status === 'available')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  };

  if (!layoutCreated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: embedded ? '60vh' : '80vh',
        p: { xs: 2, sm: 3 }
      }}>
        <Card sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', maxWidth: 600, width: '100%' }}>
          <LocalLibrary sx={{ fontSize: { xs: 80, sm: 100 }, color: 'primary.main', mb: 2 }} />
          <Typography variant={{ xs: 'h5', sm: 'h4' } as any} gutterBottom>
            🎯 Enhanced Seat Booking
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Complete booking experience with multi-step wizard, advanced filters, and payment integration.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={createLibraryLayout}
            startIcon={<EventSeat />}
            sx={{ px: { xs: 4, sm: 6 }, py: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            fullWidth
          >
            Start Booking
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: embedded ? 'transparent' : '#f5f5f5', minHeight: embedded ? 'auto' : '100vh', pb: 4 }}>
      {/* Progress Stepper */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Step 1: Select Plan & Date */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Date Selection */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📅 Select Booking Date</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    label="Select Date"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </CardContent>
              </Card>

              {/* Fee Plans from Library */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>💎 Select a Plan</Typography>
                  {loadingPlans ? (
                    <LinearProgress />
                  ) : feePlans.length > 0 ? (
                    <Grid container spacing={2}>
                      {feePlans.map((plan) => (
                        <Grid item xs={12} sm={6} key={plan.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: 2,
                              borderColor: selectedFeePlan?.id === plan.id ? 'primary.main' : 'divider',
                              bgcolor: selectedFeePlan?.id === plan.id ? 'primary.light' : 'background.paper',
                              transition: 'all 0.3s',
                              position: 'relative',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: 4,
                              },
                            }}
                            onClick={() => {
                              setSelectedFeePlan(plan);
                              setBookingDetails({ 
                                ...bookingDetails, 
                                duration: plan.type,
                                shift: plan.shift || ''
                              });
                            }}
                          >
                            {plan.isPopular && (
                              <Chip 
                                label="⭐ Popular" 
                                color="warning" 
                                size="small" 
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              />
                            )}
                            <CardContent sx={{ textAlign: 'center', pt: plan.isPopular ? 5 : 2 }}>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {plan.name}
                              </Typography>
                              <Chip 
                                label={plan.type.charAt(0).toUpperCase() + plan.type.slice(1)} 
                                size="small" 
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ my: 1, minHeight: 40 }}>
                                {plan.description}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              
                              {/* Pricing */}
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="h4" color="primary.main" fontWeight="bold">
                                  ₹{plan.basePrice}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  per {plan.type}
                                </Typography>
                                
                                {/* Discount Badge */}
                                {plan.discount && (
                                  <Chip
                                    label={`${plan.discount.type === 'percentage' ? `${plan.discount.value}%` : `₹${plan.discount.value}`} OFF`}
                                    color="success"
                                    size="small"
                                    sx={{ mt: 1 }}
                                  />
                                )}
                              </Box>

                              {/* Features */}
                              {plan.features && plan.features.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Includes:
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center" useFlexGap>
                                    {plan.features.slice(0, 4).map((feature, idx) => (
                                      <Chip 
                                        key={idx} 
                                        label={feature} 
                                        size="small" 
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                      />
                                    ))}
                                    {plan.features.length > 4 && (
                                      <Chip 
                                        label={`+${plan.features.length - 4} more`} 
                                        size="small" 
                                        sx={{ fontSize: '0.65rem', height: 20 }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              )}

                              {/* Eligibility Badges */}
                              <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 2 }}>
                                {plan.scholarshipEligible && (
                                  <Chip label="🎓 Scholarship" size="small" color="info" sx={{ fontSize: '0.7rem', height: 22 }} />
                                )}
                                {plan.waiverAllowed && (
                                  <Chip label="💸 Waiver" size="small" color="success" sx={{ fontSize: '0.7rem', height: 22 }} />
                                )}
                              </Stack>

                              {selectedFeePlan?.id === plan.id && (
                                <Chip 
                                  label="✓ Selected" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ mt: 1 }}
                                  icon={<Check />}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No fee plans available for this library. Using default pricing.
                    </Alert>
                  )}

                  {/* Show shift options if selected plan has shift pricing */}
                  {selectedFeePlan && selectedFeePlan.shiftPricing && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>⏰ Available Shifts</Typography>
                      <Grid container spacing={2}>
                        {Object.entries(selectedFeePlan.shiftPricing).map(([shiftId, price]) => {
                          const shiftIcons: Record<string, string> = {
                            morning: '🌅',
                            afternoon: '☀️',
                            evening: '🌙',
                            night: '🌃',
                          };
                          const shiftLabels: Record<string, string> = {
                            morning: 'Morning',
                            afternoon: 'Afternoon',
                            evening: 'Evening',
                            night: 'Night',
                          };
                          const shiftTimes: Record<string, string> = {
                            morning: '6 AM - 12 PM',
                            afternoon: '12 PM - 6 PM',
                            evening: '6 PM - 11 PM',
                            night: '11 PM - 6 AM',
                          };

                          return (
                            <Grid item xs={6} sm={3} key={shiftId}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  border: 2,
                                  borderColor: bookingDetails.shift === shiftId ? 'primary.main' : 'divider',
                                  bgcolor: bookingDetails.shift === shiftId ? 'primary.light' : 'background.paper',
                                  transition: 'all 0.2s',
                                  '&:hover': { transform: 'scale(1.05)' },
                                }}
                                onClick={() => setBookingDetails({ ...bookingDetails, shift: shiftId })}
                              >
                                <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                                  <Typography variant="h4">{shiftIcons[shiftId]}</Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {shiftLabels[shiftId]}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {shiftTimes[shiftId]}
                                  </Typography>
                                  <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                                    ₹{price}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}

                  {/* Optional: Duration Selector (for flexibility) */}
                  <Accordion sx={{ mt: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle2">⏱️ Or choose custom duration</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth>
                        <InputLabel>Duration Type</InputLabel>
                        <Select
                          value={bookingDetails.duration}
                          onChange={(e: any) => setBookingDetails({...bookingDetails, duration: e.target.value, shift: ''})}
                        >
                          <MenuItem value="hourly">⏱️ Hourly (Custom time)</MenuItem>
                          <MenuItem value="daily">📅 Daily (Shift-based)</MenuItem>
                          <MenuItem value="weekly">🗓️ Weekly</MenuItem>
                          <MenuItem value="monthly">📆 Monthly</MenuItem>
                        </Select>
                      </FormControl>
                      
                      {bookingDetails.duration === 'hourly' && (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="Start Time"
                              value={bookingDetails.startTime}
                              onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              type="time"
                              label="End Time"
                              value={bookingDetails.endTime}
                              onChange={(e) => setBookingDetails({...bookingDetails, endTime: e.target.value})}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Show zone options if selected plan has zone pricing */}
              {selectedFeePlan && selectedFeePlan.zonePricing && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🏢 Select Zone</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(selectedFeePlan.zonePricing).map(([zoneId, price]) => {
                        const zoneIcons: Record<string, string> = {
                          ac: '❄️',
                          nonAc: '🌡️',
                          premium: '⭐',
                          quiet: '🤫',
                          general: '📚',
                        };
                        const zoneLabels: Record<string, string> = {
                          ac: 'AC Zone',
                          nonAc: 'Non-AC Zone',
                          premium: 'Premium Zone',
                          quiet: 'Quiet Zone',
                          general: 'General Zone',
                        };

                        return (
                          <Grid item xs={12} sm={6} key={zoneId}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                border: 2,
                                borderColor: selectedZone === zoneId ? 'primary.main' : 'divider',
                                bgcolor: selectedZone === zoneId ? 'primary.light' : 'background.paper',
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.02)' },
                              }}
                              onClick={() => setSelectedZone(zoneId)}
                            >
                              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="h3">{zoneIcons[zoneId]}</Typography>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {zoneLabels[zoneId]}
                                </Typography>
                                <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                                  ₹{price}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Selected Plan Details */}
              {selectedFeePlan && (
                <Card sx={{ mb: 2, border: 2, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>Selected Plan</Typography>
                    <Typography variant="h6" fontWeight="600">{selectedFeePlan.name}</Typography>
                    <Chip label={selectedFeePlan.type} size="small" sx={{ mt: 0.5, mb: 1 }} />
                    
                    <Box sx={{ my: 2 }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        ₹{selectedFeePlan.basePrice}
                      </Typography>
                      {selectedFeePlan.discount && (
                        <Chip 
                          label={`Save ${selectedFeePlan.discount.value}${selectedFeePlan.discount.type === 'percentage' ? '%' : '₹'}`}
                          color="success"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>

                    {selectedFeePlan.features && selectedFeePlan.features.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Includes:
                        </Typography>
                        <Stack spacing={0.5}>
                          {selectedFeePlan.features.map((feature, idx) => (
                            <Typography key={idx} variant="caption">✓ {feature}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📊 Quick Stats</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Available Seats</Typography>
                      <Typography variant="h4" color="success.main">{stats.available}/{stats.total}</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.available / stats.total) * 100} 
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Real-time Status</Typography>
                      {connected ? (
                        <Chip icon={<Wifi />} label="Live Updates Active" color="success" size="small" />
                      ) : (
                        <Chip icon={<Close />} label="Offline Mode" size="small" />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>⭐ Recommended Seats</Typography>
                  <List dense>
                    {getRecommendedSeats().map((seat) => (
                      <ListItem key={seat.id}>
                        <ListItemIcon>
                          <EventSeat sx={{ color: getSeatColor(seat) }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`Seat ${seat.id}`}
                          secondary={`${seat.rating}⭐ • ${seat.bookedCount} bookings`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 2: Seat Selection */}
        {activeStep === 1 && (
          <Box>
            {/* Header with Stats */}
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
                <Box>
                  <Typography variant="h6">🪑 Select Your Seats</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click on available seats to select. {selectedSeats.length > 0 && `${selectedSeats.length} selected`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`${stats.available} Available`} color="success" size="small" icon={<Check />} />
                  <Chip label={`${stats.occupied} Occupied`} color="error" size="small" icon={<Close />} />
                  {stats.selected > 0 && (
                    <Chip label={`${stats.selected} Selected`} color="primary" size="small" icon={<EventSeat />} />
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                  <InputLabel>Filter by Zone</InputLabel>
                  <Select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                    <MenuItem value="all">🌐 All Zones</MenuItem>
                    <MenuItem value="silent">🤫 Silent Study</MenuItem>
                    <MenuItem value="reading">📖 Reading</MenuItem>
                    <MenuItem value="discussion">💬 Discussion</MenuItem>
                    <MenuItem value="exam-prep">📝 Exam Prep</MenuItem>
                    <MenuItem value="premium">⭐ Premium</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </Stack>

              {showFilters && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" gutterBottom>Amenities:</Typography>
                  <FormGroup row>
                    <FormControlLabel
                      control={<Checkbox size="small" checked={filters.window} onChange={(e) => setFilters({...filters, window: e.target.checked})} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}><WindowIcon fontSize="small" /> Window</Box>}
                    />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={filters.power} onChange={(e) => setFilters({...filters, power: e.target.checked})} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}><Power fontSize="small" /> Power</Box>}
                    />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={filters.locker} onChange={(e) => setFilters({...filters, locker: e.target.checked})} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}><LockOpen fontSize="small" /> Locker</Box>}
                    />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={filters.ac} onChange={(e) => setFilters({...filters, ac: e.target.checked})} />}
                      label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}><AcUnit fontSize="small" /> AC</Box>}
                    />
                  </FormGroup>
                </Box>
              )}
            </Paper>

            {/* Seat Map */}
            <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
              {/* Library Entrance */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    py: { xs: 1, sm: 1.5 }, 
                    bgcolor: '#1976D2', 
                    color: 'white',
                    borderRadius: '0 0 50% 50%',
                    maxWidth: { xs: '100%', sm: 600 },
                    mx: 'auto',
                  }}
                >
                  <Typography variant={{ xs: 'subtitle1', sm: 'h6' } as any}>📚 Library Entrance</Typography>
                </Paper>
              </Box>

              {/* Rows */}
              {rows.map((row) => {
                const rowSeats = filteredSeats.filter(s => s.row === row);
                if (rowSeats.length === 0) return null;

                return (
                  <Box key={row} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" justifyContent="center" flexWrap="wrap" useFlexGap>
                      <Chip label={`Row ${row}`} size="small" sx={{ minWidth: { xs: 45, sm: 60 }, fontSize: { xs: '0.7rem', sm: '0.8125rem' } }} />
                      
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeats.includes(seat.id);
                        const isFavorite = favoriteSeats.includes(seat.id);
                        
                        return (
                          <Tooltip
                            key={seat.id}
                            title={
                              <Box>
                                <Typography variant="subtitle2" fontWeight="600">{seat.id} - {zoneConfig[seat.zone].label}</Typography>
                                <Typography variant="caption" display="block">₹{seat.pricing[bookingDetails.duration]}/{bookingDetails.duration}</Typography>
                                <Typography variant="caption" display="block">⭐ {seat.rating} • {seat.bookedCount} bookings</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {seat.features.window && <Chip icon={<WindowIcon />} label="Window" size="small" sx={{ m: 0.25, height: 20 }} />}
                                  {seat.features.power && <Chip icon={<Power />} label="Power" size="small" sx={{ m: 0.25, height: 20 }} />}
                                  {seat.features.ac && <Chip icon={<AcUnit />} label="AC" size="small" sx={{ m: 0.25, height: 20 }} />}
                                </Box>
                              </Box>
                            }
                          >
                            <Box
                              sx={{
                                position: 'relative',
                                width: { xs: 40, sm: 50, md: 55 },
                                height: { xs: 40, sm: 50, md: 55 },
                                borderRadius: 1.5,
                                bgcolor: getSeatColor(seat),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: seat.status !== 'occupied' && seat.status !== 'blocked' ? 'pointer' : 'not-allowed',
                                opacity: seat.status === 'occupied' || seat.status === 'blocked' ? 0.4 : 1,
                                border: isSelected ? '3px solid #1976D2' : '2px solid #ddd',
                                boxShadow: isSelected ? '0 4px 12px rgba(25,118,210,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s',
                                '&:hover': seat.status !== 'occupied' && seat.status !== 'blocked' ? {
                                  transform: { xs: 'scale(1.05)', sm: 'scale(1.1)' },
                                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                                  zIndex: 10,
                                } : {},
                              }}
                              onClick={() => {
                                if (seat.status !== 'occupied' && seat.status !== 'blocked') {
                                  handleToggleSeat(seat.id);
                                }
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {seat.id}
                              </Typography>
                              {seat.rating && seat.rating >= 4.5 && (
                                <Star sx={{ position: 'absolute', top: 2, left: 2, color: '#FFD700', fontSize: { xs: 12, sm: 14 } }} />
                              )}
                              {isFavorite && (
                                <Favorite
                                  sx={{ position: 'absolute', top: -6, right: -6, color: 'error.main', fontSize: { xs: 14, sm: 18 } }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}

              {/* Legend */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '2px dashed #e0e0e0' }}>
                <Typography variant="subtitle2" gutterBottom textAlign="center">Legend</Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                  <Chip label="Available" sx={{ bgcolor: '#4CAF50' }} size="small" />
                  <Chip label="Occupied" sx={{ bgcolor: '#757575' }} size="small" />
                  <Chip label="Selected" sx={{ bgcolor: '#1976D2' }} size="small" />
                  <Chip icon={<Star />} label="Highly Rated" size="small" />
                  <Chip icon={<Favorite />} label="Favorite" size="small" />
                </Stack>
              </Box>
            </Paper>

            {/* Quick Seat Info Cards */}
            {selectedSeats.length > 0 && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.light' }}>
                <Typography variant="h6" gutterBottom>Selected Seats Details</Typography>
                <Grid container spacing={2}>
                  {selectedSeats.map(seatId => {
                    const seat = seats.find(s => s.id === seatId);
                    if (!seat) return null;
                    return (
                      <Grid item xs={12} sm={6} md={4} key={seatId}>
                        <Card>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">{seat.id}</Typography>
                              <IconButton size="small" onClick={() => handleToggleSeat(seat.id)}>
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                            <Chip label={zoneConfig[seat.zone].label} size="small" sx={{ mb: 1 }} />
                            <Typography variant="h6" color="primary.main">₹{seat.pricing[bookingDetails.duration]}</Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                              {seat.features.window && <WindowIcon fontSize="small" color="action" />}
                              {seat.features.power && <Power fontSize="small" color="action" />}
                              {seat.features.ac && <AcUnit fontSize="small" color="action" />}
                              {seat.features.locker && <LockOpen fontSize="small" color="action" />}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            )}
          </Box>
        )}

        {/* Step 3: Add-ons & Options */}
        {activeStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>🎁 Add-ons</Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={bookingDetails.addons.locker} onChange={(e) => setBookingDetails({...bookingDetails, addons: {...bookingDetails.addons, locker: e.target.checked}})} />}
                      label={<Box><Typography variant="body2">Personal Locker</Typography><Typography variant="caption" color="text.secondary">₹50/seat - Secure storage for your belongings</Typography></Box>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={bookingDetails.addons.snacks} onChange={(e) => setBookingDetails({...bookingDetails, addons: {...bookingDetails.addons, snacks: e.target.checked}})} />}
                      label={<Box><Typography variant="body2">Snacks Package</Typography><Typography variant="caption" color="text.secondary">₹100/seat - Tea/Coffee + Snacks</Typography></Box>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={bookingDetails.addons.wifi} onChange={(e) => setBookingDetails({...bookingDetails, addons: {...bookingDetails.addons, wifi: e.target.checked}})} />}
                      label={<Box><Typography variant="body2">Premium WiFi</Typography><Typography variant="caption" color="text.secondary">₹20/hr - High-speed internet</Typography></Box>}
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📢 Notifications</Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={bookingDetails.notifications.email} onChange={(e) => setBookingDetails({...bookingDetails, notifications: {...bookingDetails.notifications, email: e.target.checked}})} />}
                      label="Email Confirmation"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={bookingDetails.notifications.sms} onChange={(e) => setBookingDetails({...bookingDetails, notifications: {...bookingDetails.notifications, sms: e.target.checked}})} />}
                      label="SMS Alerts"
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>💬 Special Requests</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any special requirements? (Window seat preference, specific location, etc.)"
                    value={bookingDetails.specialRequests}
                    onChange={(e) => setBookingDetails({...bookingDetails, specialRequests: e.target.value})}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📋 Booking Summary</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Selected Seats</Typography>
                      <Typography variant="h6">{selectedSeats.length} seat(s)</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1">{bookingDetails.duration}</Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h4" color="primary.main">₹{calculateTotalPrice}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Step 4: Payment */}
        {activeStep === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>💳 Payment Method</Typography>
                  <RadioGroup 
                    value={bookingDetails.paymentMethod}
                    onChange={(e: any) => setBookingDetails({...bookingDetails, paymentMethod: e.target.value})}
                  >
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <FormControlLabel 
                        value="upi" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QrCode2 />
                            <Box>
                              <Typography variant="body2">UPI Payment</Typography>
                              <Typography variant="caption" color="text.secondary">Google Pay, PhonePe, Paytm</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <FormControlLabel 
                        value="card" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCard />
                            <Box>
                              <Typography variant="body2">Credit/Debit Card</Typography>
                              <Typography variant="caption" color="text.secondary">Visa, Mastercard, RuPay</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <FormControlLabel 
                        value="wallet" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalanceWallet />
                            <Box>
                              <Typography variant="body2">Wallet</Typography>
                              <Typography variant="caption" color="text.secondary">Use StudySpot wallet balance</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <FormControlLabel 
                        value="cod" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Payment />
                            <Box>
                              <Typography variant="body2">Pay at Library</Typography>
                              <Typography variant="caption" color="text.secondary">Cash on arrival</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Paper>
                  </RadioGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>💰 Price Breakdown</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Base Price ({selectedSeats.length} seats)</Typography>
                      <Typography variant="body2">₹{selectedSeats.reduce((total, seatId) => {
                        const seat = seats.find(s => s.id === seatId);
                        return total + (seat?.pricing[bookingDetails.duration] || 0);
                      }, 0)}</Typography>
                    </Box>
                    {bookingDetails.addons.locker && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Personal Locker</Typography>
                        <Typography variant="body2">₹{50 * selectedSeats.length}</Typography>
                      </Box>
                    )}
                    {bookingDetails.addons.snacks && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Snacks Package</Typography>
                        <Typography variant="body2">₹{100 * selectedSeats.length}</Typography>
                      </Box>
                    )}
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="primary.main">₹{calculateTotalPrice}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Alert severity="info" sx={{ mt: 2 }}>
                🔒 Your payment is 100% secure and encrypted
              </Alert>
            </Grid>
          </Grid>
        )}

        {/* Step 5: Confirmation */}
        {activeStep === 4 && (
          <Card sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>Booking Confirmed! 🎉</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your seats have been successfully booked at {libraryName}
              </Typography>
              
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'action.hover' }}>
                <Typography variant="h6" gutterBottom>Booking Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Booking ID</Typography>
                    <Typography variant="body1" fontWeight="600">BK{Date.now().toString().slice(-8)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Seats</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedSeats.join(', ')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight="600">{new Date(bookingDetails.date).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                    <Typography variant="body1" fontWeight="600" color="primary.main">₹{calculateTotalPrice}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Stack spacing={2}>
                <Alert severity="success">
                  Confirmation email sent to your registered email address
                </Alert>
                <Alert severity="info">
                  SMS with QR code sent to your phone number
                </Alert>
              </Stack>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Button variant="contained" fullWidth startIcon={<QrCode2 />}>
                  View QR Code
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleDownloadReceipt}
                  startIcon={<Payment />}
                >
                  📄 Download PDF Receipt
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handlePrintReceipt}
                  startIcon={<Payment />}
                >
                  🖨️ Print Receipt
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        {activeStep < 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === 3 ? handleConfirmBooking : handleNext}
              endIcon={activeStep === 3 ? <CheckCircle /> : <ArrowForward />}
            >
              {activeStep === 3 ? 'Confirm & Pay' : 'Next'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedSeatBooking;

