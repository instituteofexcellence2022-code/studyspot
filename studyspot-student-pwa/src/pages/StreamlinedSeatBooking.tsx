/**
 * 🎯 STREAMLINED SEAT BOOKING
 * 
 * Clean, organized booking flow:
 * 1. Select Plan & Date
 * 2. Choose Seats
 * 3. Payment
 * 4. Confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  IconButton,
  Grid,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import {
  EventSeat,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Payment as PaymentIcon,
  Download,
  Print,
  CreditCard,
  AccountBalanceWallet,
  QrCode2,
  Store,
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';
import { generateReceipt, printReceipt } from '../utils/receiptGenerator';
import { useAuth } from '../contexts/AuthContext';
import { feePlanService } from '../services/feePlan.service';
import { FeePlan } from '../types/feePlan';

interface Props {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
  libraryId?: string;
  libraryName?: string;
  embedded?: boolean;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  zone: string;
  price: number;
  status: 'available' | 'occupied' | 'selected';
  features: string[];
}

interface BookingData {
  date: string;
  planId: string;
  planName: string;
  duration: string;
  shift?: string;
  zone?: string;
  seats: string[];
  totalAmount: number;
  paymentMethod: string;
}

export default function StreamlinedSeatBooking({ 
  libraryId, 
  libraryName, 
  embedded = false 
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FeePlan | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: new Date().toISOString().split('T')[0],
    planId: '',
    planName: '',
    duration: 'daily',
    seats: [],
    totalAmount: 0,
    paymentMethod: 'upi',
  });
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);

  const { socket, connected } = useSocket('student');
  const { user } = useAuth();

  const steps = ['Plan & Date', 'Select Seats', 'Payment', 'Confirmation'];

  // Initialize seats and plans
  useEffect(() => {
    generateSeats();
    loadFeePlans();
  }, []);

  const loadFeePlans = async () => {
    try {
      const plans = await feePlanService.getActiveFeePlans(libraryId || '');
      setFeePlans(plans);
      if (plans.length > 0) {
        const defaultPlan = plans.find(p => p.isPopular) || plans[0];
        setSelectedPlan(defaultPlan);
        setBookingData(prev => ({ 
          ...prev, 
          planId: defaultPlan.id,
          planName: defaultPlan.name,
          duration: defaultPlan.type 
        }));
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      // Use mock plans
      const mockPlan: FeePlan = {
        id: 'daily-1',
        name: 'Daily Pass',
        type: 'daily',
        basePrice: 300,
        features: ['WiFi', 'Power Socket', 'Locker'],
        status: 'active',
      };
      setFeePlans([mockPlan]);
      setSelectedPlan(mockPlan);
      setBookingData(prev => ({ ...prev, planId: mockPlan.id, planName: mockPlan.name }));
    }
  };

  const generateSeats = () => {
    const newSeats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    
    rows.forEach((row, rowIndex) => {
      for (let num = 1; num <= 10; num++) {
        if (num === 5 || num === 6) continue; // Aisle
        
        const zone = rowIndex < 2 ? 'Premium' : rowIndex < 4 ? 'Standard' : 'Basic';
        const price = zone === 'Premium' ? 400 : zone === 'Standard' ? 300 : 200;
        const status = Math.random() > 0.8 ? 'occupied' : 'available';
        
        newSeats.push({
          id: `${row}${num}`,
          row,
          number: num,
          zone,
          price,
          status,
          features: zone === 'Premium' ? ['Window', 'Power', 'AC'] : zone === 'Standard' ? ['Power'] : [],
        });
      }
    });
    
    setSeats(newSeats);
  };

  const handleSeatToggle = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'available' } : s));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'selected' } : s));
    }
  };

  const calculateTotal = () => {
    const selectedSeatObjects = seats.filter(s => selectedSeats.includes(s.id));
    const seatTotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);
    const planPrice = selectedPlan?.basePrice || 0;
    return planPrice + seatTotal;
  };

  const handleNext = () => {
    if (activeStep === 0 && (!selectedPlan || !bookingData.date)) {
      toast.error('Please select a plan and date');
      return;
    }
    if (activeStep === 1 && selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    if (activeStep === 2 && !bookingData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    if (activeStep === 2) {
      handleBooking();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const id = `BK${Date.now()}`;
      setBookingId(id);
      
      setBookingData(prev => ({
        ...prev,
        seats: selectedSeats,
        totalAmount: calculateTotal(),
      }));
      
      toast.success('Booking confirmed successfully!');
      setActiveStep(3);
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptData = {
      bookingId,
      libraryName: libraryName || 'StudySpot Library',
      date: bookingData.date,
      plan: bookingData.planName,
      seats: bookingData.seats,
      amount: bookingData.totalAmount,
      studentName: user?.firstName || 'Student',
      studentEmail: user?.email || 'student@studyspot.com',
    };
    generateReceipt(receiptData);
  };

  const handlePrintReceipt = () => {
    const receiptData = {
      bookingId,
      libraryName: libraryName || 'StudySpot Library',
      date: bookingData.date,
      plan: bookingData.planName,
      seats: bookingData.seats,
      amount: bookingData.totalAmount,
      studentName: user?.firstName || 'Student',
      studentEmail: user?.email || 'student@studyspot.com',
    };
    printReceipt(receiptData);
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'occupied') return '#ef4444';
    if (seat.status === 'selected') return '#2563eb';
    return seat.zone === 'Premium' ? '#10b981' : seat.zone === 'Standard' ? '#f59e0b' : '#6b7280';
  };

  return (
    <Box>
      {/* Stepper */}
      <Paper sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {/* Mobile progress */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, textAlign: 'center' }}>
          <Typography variant="body2" fontWeight="600">
            Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </Typography>
          <LinearProgress variant="determinate" value={((activeStep + 1) / steps.length) * 100} sx={{ mt: 1 }} />
        </Box>
      </Paper>

      {/* Step 1: Plan & Date */}
      {activeStep === 0 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>📅 Select Date</Typography>
              <TextField
                fullWidth
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>💎 Choose Your Plan</Typography>
              <Grid container spacing={2}>
                {feePlans.map((plan) => (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: 2,
                        borderColor: selectedPlan?.id === plan.id ? 'primary.main' : 'divider',
                        bgcolor: selectedPlan?.id === plan.id ? 'primary.light' : 'background.paper',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setBookingData({ ...bookingData, planId: plan.id, planName: plan.name, duration: plan.type });
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        {plan.isPopular && (
                          <Chip label="⭐ Popular" color="warning" size="small" sx={{ mb: 1 }} />
                        )}
                        <Typography variant="h6" fontWeight="600">{plan.name}</Typography>
                        <Chip label={plan.type} size="small" sx={{ my: 1 }} />
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          ₹{plan.basePrice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          per {plan.type}
                        </Typography>
                        {plan.features && plan.features.length > 0 && (
                          <Box>
                            <Divider sx={{ my: 1 }} />
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <Typography key={idx} variant="caption" display="block">
                                ✓ {feature}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Step 2: Seat Selection */}
      {activeStep === 1 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🪑 Select Your Seats</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSeats.length} selected
                </Typography>
              </Box>

              {/* Legend */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                <Chip label="Available" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
                <Chip label="Selected" size="small" sx={{ bgcolor: '#2563eb', color: 'white' }} />
                <Chip label="Occupied" size="small" sx={{ bgcolor: '#ef4444', color: 'white' }} />
              </Stack>

              {/* Seat Map */}
              <Box>
                {['A', 'B', 'C', 'D', 'E'].map(row => (
                  <Stack key={row} direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 1 }}>
                    <Chip label={row} size="small" sx={{ width: 40 }} />
                    {seats
                      .filter(s => s.row === row)
                      .map(seat => (
                        <Tooltip key={seat.id} title={`${seat.id} - ₹${seat.price} - ${seat.zone}`}>
                          <Box
                            onClick={() => handleSeatToggle(seat.id)}
                            sx={{
                              width: { xs: 36, sm: 44 },
                              height: { xs: 36, sm: 44 },
                              bgcolor: getSeatColor(seat),
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: seat.status === 'occupied' ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': seat.status !== 'occupied' ? { transform: 'scale(1.1)' } : {},
                            }}
                          >
                            <EventSeat sx={{ fontSize: { xs: 18, sm: 22 }, color: 'white' }} />
                          </Box>
                        </Tooltip>
                      ))}
                  </Stack>
                ))}
              </Box>

              {/* Selected Seats Summary */}
              {selectedSeats.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Selected Seats:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedSeats.map(seatId => (
                      <Chip 
                        key={seatId} 
                        label={seatId} 
                        size="small"
                        onDelete={() => handleSeatToggle(seatId)}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Step 3: Payment */}
      {activeStep === 2 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>💰 Payment Summary</Typography>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Plan: {selectedPlan?.name}</Typography>
                  <Typography fontWeight="600">₹{selectedPlan?.basePrice}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Seats ({selectedSeats.length})</Typography>
                  <Typography fontWeight="600">
                    ₹{seats.filter(s => selectedSeats.includes(s.id)).reduce((sum, s) => sum + s.price, 0)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="700">Total</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="700">
                    ₹{calculateTotal()}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Select Payment Method
              </Typography>
              <RadioGroup
                value={bookingData.paymentMethod}
                onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
              >
                <Card sx={{ mb: 1, cursor: 'pointer' }} onClick={() => setBookingData({ ...bookingData, paymentMethod: 'upi' })}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <QrCode2 color="primary" />
                      <Box>
                        <Typography fontWeight="600">UPI</Typography>
                        <Typography variant="caption" color="text.secondary">GPay, PhonePe, Paytm</Typography>
                      </Box>
                    </Box>
                    <Radio value="upi" />
                  </CardContent>
                </Card>

                <Card sx={{ mb: 1, cursor: 'pointer' }} onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CreditCard color="primary" />
                      <Box>
                        <Typography fontWeight="600">Credit/Debit Card</Typography>
                        <Typography variant="caption" color="text.secondary">Visa, Mastercard, RuPay</Typography>
                      </Box>
                    </Box>
                    <Radio value="card" />
                  </CardContent>
                </Card>

                <Card sx={{ mb: 1, cursor: 'pointer' }} onClick={() => setBookingData({ ...bookingData, paymentMethod: 'wallet' })}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <AccountBalanceWallet color="primary" />
                      <Box>
                        <Typography fontWeight="600">Wallet</Typography>
                        <Typography variant="caption" color="text.secondary">Paytm, Amazon Pay</Typography>
                      </Box>
                    </Box>
                    <Radio value="wallet" />
                  </CardContent>
                </Card>

                <Card sx={{ cursor: 'pointer' }} onClick={() => setBookingData({ ...bookingData, paymentMethod: 'cash' })}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Store color="primary" />
                      <Box>
                        <Typography fontWeight="600">Pay at Library</Typography>
                        <Typography variant="caption" color="text.secondary">Cash/Card at counter</Typography>
                      </Box>
                    </Box>
                    <Radio value="cash" />
                  </CardContent>
                </Card>
              </RadioGroup>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Step 4: Confirmation */}
      {activeStep === 3 && (
        <Box sx={{ textAlign: 'center' }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Booking Confirmed!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your booking has been confirmed successfully
              </Typography>

              <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight="700" color="primary.main" gutterBottom>
                  {bookingId}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography fontWeight="600">{bookingData.date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Plan</Typography>
                    <Typography fontWeight="600">{bookingData.planName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Seats</Typography>
                    <Typography fontWeight="600">{selectedSeats.join(', ')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Amount</Typography>
                    <Typography fontWeight="600" color="primary.main">₹{calculateTotal()}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownloadReceipt}
                >
                  Download Receipt
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Navigation */}
      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={activeStep === 2 ? <CheckCircle /> : <ArrowForward />}
            disabled={loading}
          >
            {loading ? 'Processing...' : activeStep === 2 ? 'Confirm Booking' : 'Next'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

