/**
 * 📚 ENHANCED SINGLE-VIEW BOOKING PAGE
 * 
 * Fully synced with web owner portal's fee plan structure:
 * - Complete fee plan data (status, isPopular, discount, maxSeats, maxHours, etc.)
 * - Shift and zone pricing visualization
 * - Discount calculation and display
 * - Price breakdown with detailed calculation
 * - Enhanced UI with better visual hierarchy
 * - Real-time price updates
 */

import { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Badge,
  Tooltip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
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
  ExpandMore,
  ExpandLess,
  Star,
  LocalOffer,
  Info,
  TrendingUp,
  School,
  Calculate,
  CreditCard,
  QrCode2,
  AccountBalance,
} from '@mui/icons-material';
import MobileLayout from '../components/MobileLayout';
import { gradients } from '../theme/colors';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

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
  status: 'active' | 'inactive';
  isPopular?: boolean;
  features: string[];
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
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validFrom?: string;
    validTo?: string;
  };
  maxSeats?: number;
  maxHours?: number;
  scholarshipEligible?: boolean;
  waiverAllowed?: boolean;
}

interface Seat {
  id: string;
  seatNumber: string;
  zone: string;
  isAvailable: boolean;
}

const SHIFTS = [
  { value: 'morning', label: 'Morning', start: '06:00', end: '12:00', hours: 6, icon: '🌅', color: '#FFA726' },
  { value: 'afternoon', label: 'Afternoon', start: '12:00', end: '18:00', hours: 6, icon: '☀️', color: '#FFB74D' },
  { value: 'evening', label: 'Evening', start: '18:00', end: '23:00', hours: 5, icon: '🌆', color: '#7986CB' },
  { value: 'night', label: 'Night Shift', start: '23:00', end: '06:00', hours: 7, icon: '🌙', color: '#5C6BC0' },
  { value: 'half_day', label: 'Half Day', start: '06:00', end: '14:00', hours: 8, icon: '⏰', color: '#66BB6A' },
  { value: 'full_day', label: 'Full Day', start: '06:00', end: '23:00', hours: 17, icon: '📅', color: '#4CAF50' },
];

const ZONES = [
  { value: 'general', label: 'General', icon: '🪑', description: 'Standard seating area', color: '#9E9E9E' },
  { value: 'quiet', label: 'Quiet Zone', icon: '🔇', description: 'Silent study area', color: '#5C6BC0' },
  { value: 'ac', label: 'AC Zone', icon: '❄️', description: 'Air-conditioned area', color: '#26A69A' },
  { value: 'nonAc', label: 'Non-AC Zone', icon: '🌬️', description: 'Natural ventilation', color: '#66BB6A' },
  { value: 'premium', label: 'Premium', icon: '⭐', description: 'Premium seating with extra amenities', color: '#FFA726' },
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
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    date: '',
    planType: '' as '' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo',
    shift: '',
    feePlanId: '',
    zone: '',
    seatId: '',
    paymentMethod: 'online' as 'online' | 'offline' | 'upi',
  });

  useEffect(() => {
    if (id) {
      fetchLibraryDetails();
    }
  }, [id]);

  // Fetch fee plans after library is loaded (or use defaults)
  useEffect(() => {
    if (id) {
      // Wait a bit for library to load, then fetch fee plans
      const timer = setTimeout(() => {
        fetchFeePlans();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [id, library]);

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
      console.log('[BOOKING] Fee plans API response:', response.data);
      
      // API returns: { success: true, data: { feePlans: [...] } }
      if (response.data.success && response.data.data?.feePlans) {
        // Transform API response to match FeePlan interface (aligned with web owner)
        const transformedPlans: FeePlan[] = response.data.data.feePlans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || '',
          type: plan.type,
          basePrice: plan.basePrice || plan.base_price || 0,
          status: plan.status || 'active',
          isPopular: plan.isPopular || plan.is_popular || false,
          features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []),
          shiftPricing: plan.shiftPricing || plan.shift_pricing || (plan.custom_shift ? JSON.parse(plan.custom_shift) : undefined),
          zonePricing: plan.zonePricing || plan.zone_pricing || (plan.custom_zone ? JSON.parse(plan.custom_zone) : undefined),
          discount: plan.discount ? (typeof plan.discount === 'string' ? JSON.parse(plan.discount) : plan.discount) : undefined,
          maxSeats: plan.maxSeats || plan.max_seats,
          maxHours: plan.maxHours || plan.max_hours,
          scholarshipEligible: plan.scholarshipEligible || plan.scholarship_eligible || false,
          waiverAllowed: plan.waiverAllowed || plan.waiver_allowed || false,
        }));
        const activePlans = transformedPlans.filter(p => p.status === 'active');
        console.log('[BOOKING] Transformed fee plans:', activePlans);
        if (activePlans.length > 0) {
          setFeePlans(activePlans);
          return;
        }
      }
      
      // If no plans from API or empty, use defaults
      console.log('[BOOKING] Using default fee plans');
      setFeePlans(getDefaultFeePlans());
    } catch (error: any) {
      console.warn('[BOOKING] Failed to fetch fee plans, using defaults:', error);
      console.warn('[BOOKING] Error details:', error.response?.data || error.message);
      // Always fallback to defaults
      setFeePlans(getDefaultFeePlans());
    }
  };

  const getDefaultFeePlans = (): FeePlan[] => {
    // Use library data if available, otherwise use fallback values
    const hourlyRate = library?.hourlyRate || 50;
    const dailyRate = library?.dailyRate || 300;
    
    return [
      {
        id: 'hourly-basic',
        name: 'Hourly Basic',
        description: 'Pay per hour for flexible usage',
        type: 'hourly',
        basePrice: hourlyRate,
        status: 'active',
        isPopular: false,
        features: [
          'Flexible hourly booking',
          'Basic amenities access',
          'WiFi included',
          'Power outlets available'
        ],
        shiftPricing: {
          morning: hourlyRate * 0.8,
          afternoon: hourlyRate,
          evening: hourlyRate * 1.2,
          night: hourlyRate * 1.5,
        },
        zonePricing: {
          ac: hourlyRate * 1.2,
          nonAc: hourlyRate * 0.8,
          premium: hourlyRate * 1.5,
          quiet: hourlyRate * 1.1,
          general: hourlyRate,
        },
        maxSeats: 1,
        maxHours: 8,
        scholarshipEligible: true,
        waiverAllowed: true,
      },
      {
        id: 'daily-pass',
        name: 'Daily Pass',
        description: 'Full day access with all amenities',
        type: 'daily',
        basePrice: dailyRate,
        status: 'active',
        isPopular: true,
        features: [
          'Full day access (8 AM - 10 PM)',
          'All amenities included',
          'Lunch break allowed',
          'Priority seating',
          'Study materials access'
        ],
        shiftPricing: {
          morning: dailyRate * 0.8,
          afternoon: dailyRate,
          evening: dailyRate * 1.2,
          night: dailyRate * 1.3,
        },
        zonePricing: {
          ac: dailyRate * 1.2,
          nonAc: dailyRate * 0.8,
          premium: dailyRate * 1.5,
          quiet: dailyRate * 1.1,
          general: dailyRate,
        },
        maxSeats: 1,
        maxHours: 14,
        scholarshipEligible: true,
        waiverAllowed: true,
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

  // Enhanced price calculation with breakdown
  const priceBreakdown = useMemo(() => {
    if (!library || !bookingData.shift || !bookingData.feePlanId) {
      return { basePrice: 0, shiftAdjustment: 0, zoneAdjustment: 0, discount: 0, total: 0 };
    }

    const selectedPlan = feePlans.find(p => p.id === bookingData.feePlanId);
    if (!selectedPlan) return { basePrice: 0, shiftAdjustment: 0, zoneAdjustment: 0, discount: 0, total: 0 };

    const selectedShift = SHIFTS.find(s => s.value === bookingData.shift);
    if (!selectedShift) return { basePrice: 0, shiftAdjustment: 0, zoneAdjustment: 0, discount: 0, total: 0 };

    let basePrice = selectedPlan.basePrice;
    let shiftPrice = basePrice;
    let zonePrice = basePrice;

    // Apply shift pricing
    if (selectedPlan.shiftPricing && bookingData.shift !== 'full_day' && bookingData.shift !== 'half_day') {
      const shiftPricing = selectedPlan.shiftPricing[bookingData.shift as keyof typeof selectedPlan.shiftPricing];
      if (shiftPricing) {
        shiftPrice = shiftPricing;
      }
    }
    
    // Handle half day pricing (use morning + afternoon average or custom pricing)
    if (bookingData.shift === 'half_day' && selectedPlan.shiftPricing) {
      const morningPrice = selectedPlan.shiftPricing.morning || basePrice;
      const afternoonPrice = selectedPlan.shiftPricing.afternoon || basePrice;
      shiftPrice = (morningPrice + afternoonPrice) / 2;
    }

    // Apply zone pricing
    if (selectedPlan.zonePricing && bookingData.zone) {
      const zonePricing = selectedPlan.zonePricing[bookingData.zone as keyof typeof selectedPlan.zonePricing];
      if (zonePricing) {
        zonePrice = zonePricing;
      }
    }

    // Calculate based on plan type
    let finalPrice = zonePrice;
    if (selectedPlan.type === 'hourly') {
      finalPrice = zonePrice * selectedShift.hours;
    } else if (selectedPlan.type === 'daily') {
      finalPrice = zonePrice;
    } else if (selectedPlan.type === 'weekly') {
      finalPrice = zonePrice;
    } else if (selectedPlan.type === 'monthly') {
      finalPrice = zonePrice;
    }

    // Calculate discount
    let discountAmount = 0;
    if (selectedPlan.discount) {
      const now = new Date();
      const validFrom = selectedPlan.discount.validFrom ? new Date(selectedPlan.discount.validFrom) : null;
      const validTo = selectedPlan.discount.validTo ? new Date(selectedPlan.discount.validTo) : null;
      
      if ((!validFrom || now >= validFrom) && (!validTo || now <= validTo)) {
        if (selectedPlan.discount.type === 'percentage') {
          discountAmount = (finalPrice * selectedPlan.discount.value) / 100;
        } else {
          discountAmount = selectedPlan.discount.value;
        }
      }
    }

    const total = Math.max(0, finalPrice - discountAmount);

    return {
      basePrice: selectedPlan.basePrice,
      shiftAdjustment: shiftPrice - basePrice,
      zoneAdjustment: zonePrice - basePrice,
      discount: discountAmount,
      total,
    };
  }, [library, bookingData, feePlans]);

  const calculatePrice = (): number => {
    return priceBreakdown.total;
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

      // Format date and time for API (HH:MM format, not HH:MM:SS)
      // Handle night shift (spans midnight - end time is next day)
      let startTime = selectedShift.start; // Already in HH:MM format
      let endTime = selectedShift.end; // Already in HH:MM format
      let bookingDate = bookingData.date;
      
      // Night shift: 23:00 to 06:00 (next day)
      // API validation expects HH:MM format, so use 06:00 (not 06:00:00)
      if (bookingData.shift === 'night') {
        endTime = '06:00';
      }

      // Get calculated price from price breakdown
      const calculatedPrice = priceBreakdown.total;

      const bookingPayload = {
        libraryId: library.id,
        seatId: bookingData.seatId,
        date: bookingData.date,
        startTime,
        endTime,
        bookingType,
        paymentMethod: bookingData.paymentMethod,
        feePlanId: bookingData.feePlanId,
        totalAmount: calculatedPrice,
        // Additional metadata for better tracking
        metadata: {
          shift: bookingData.shift,
          zone: bookingData.zone,
          feePlanName: selectedPlan.name,
          feePlanType: selectedPlan.type,
        },
      };

      console.log('[BOOKING] Submitting booking:', bookingPayload);
      console.log('[BOOKING] API Base URL:', import.meta.env.VITE_API_URL || 'https://studyspot-api.onrender.com');
      console.log('[BOOKING] Full URL will be:', `${import.meta.env.VITE_API_URL || 'https://studyspot-api.onrender.com'}/api/bookings`);

      // Handle UPI payment separately
      if (bookingData.paymentMethod === 'upi') {
        await handleUPIPayment(bookingPayload, calculatedPrice);
        return;
      }

      // For offline payment, create booking directly
      if (bookingData.paymentMethod === 'offline') {
        const response = await api.post('/api/bookings', bookingPayload);
        if (response.data.success) {
          toast.success('Booking created! Please pay at the library.');
          setTimeout(() => {
            navigate('/bookings');
          }, 1500);
        } else {
          throw new Error(response.data.message || 'Booking failed');
        }
        return;
      }

      // For online payment (card/net banking), create booking first, then handle payment
      const response = await api.post('/api/bookings', bookingPayload);

      if (response.data.success) {
        // If booking created, now handle online payment
        if (bookingData.paymentMethod === 'online') {
          await handleOnlinePayment(response.data.data, calculatedPrice);
        } else {
          toast.success('Booking created successfully!');
          setTimeout(() => {
            navigate('/bookings');
          }, 1500);
        }
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('[BOOKING] Booking creation failed:', error);
      console.error('[BOOKING] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      
      // Check if it's a network error
      if (!error.response) {
        console.error('[BOOKING] Network error - no response from server');
        toast.error('Network error: Unable to reach server. Please check your connection and try again.');
        return;
      }
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Failed to create booking. Please try again.';
      
      // Show validation errors in detail
      if (error.response?.data?.error?.details) {
        const details = error.response.data.error.details;
        if (Array.isArray(details)) {
          const validationErrors = details.map((d: any) => d.msg || d.message).join(', ');
          toast.error(`Validation error: ${validationErrors}`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle UPI Payment
  const handleUPIPayment = async (bookingPayload: any, amount: number) => {
    try {
      setSubmitting(true);
      
      // First create the booking
      const bookingResponse = await api.post('/api/bookings', {
        ...bookingPayload,
        paymentMethod: 'upi', // Override to upi
      });

      if (!bookingResponse.data.success) {
        throw new Error(bookingResponse.data.message || 'Booking creation failed');
      }

      const booking = bookingResponse.data.data;

      // Create Razorpay order for UPI
      const orderResponse = await api.post('/api/payments/create-order', {
        amount: amount,
        bookingId: booking.id,
        paymentMethod: 'upi',
      });

      const order = orderResponse.data.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const currentUser = authService.getUser() ?? {};
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: order.amount,
          currency: 'INR',
          name: 'StudySpot',
          description: `Booking Payment - ${library?.name || 'Library'}`,
          order_id: order.id,
          method: {
            upi: true, // Enable UPI
          },
          handler: async (response: any) => {
            try {
              // Verify payment on backend
              await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              });

              toast.success('Payment successful! Booking confirmed.');
              setTimeout(() => {
                navigate('/bookings');
              }, 1500);
            } catch (err: any) {
              console.error('[BOOKING] Payment verification failed:', err);
              toast.error('Payment verification failed. Please contact support.');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: currentUser.firstName || currentUser.name || '',
            email: currentUser.email || '',
            contact: currentUser.phone || '',
          },
          theme: {
            color: '#2563eb',
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              toast.info('Payment cancelled');
            },
          },
        };

        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        setSubmitting(false);
        toast.error('Failed to load payment gateway. Please try again.');
      };
    } catch (error: any) {
      console.error('[BOOKING] UPI payment failed:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to process UPI payment. Please try again.';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  // Handle Online Payment (Card/Net Banking)
  const handleOnlinePayment = async (booking: any, amount: number) => {
    try {
      // Create Razorpay order
      const orderResponse = await api.post('/api/payments/create-order', {
        amount: amount,
        bookingId: booking.id,
        paymentMethod: 'online',
      });

      const order = orderResponse.data.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const currentUser = authService.getUser() ?? {};
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: order.amount,
          currency: 'INR',
          name: 'StudySpot',
          description: `Booking Payment - ${library?.name || 'Library'}`,
          order_id: order.id,
          handler: async (response: any) => {
            try {
              // Verify payment on backend
              await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              });

              toast.success('Payment successful! Booking confirmed.');
              setTimeout(() => {
                navigate('/bookings');
              }, 1500);
            } catch (err: any) {
              console.error('[BOOKING] Payment verification failed:', err);
              toast.error('Payment verification failed. Please contact support.');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: currentUser.firstName || currentUser.name || '',
            email: currentUser.email || '',
            contact: currentUser.phone || '',
          },
          theme: {
            color: '#2563eb',
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              toast.info('Payment cancelled');
            },
          },
        };

        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        setSubmitting(false);
        toast.error('Failed to load payment gateway. Please try again.');
      };
    } catch (error: any) {
      console.error('[BOOKING] Online payment failed:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to process payment. Please try again.';
      toast.error(errorMessage);
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
  const availableSeatsCount = availableSeats.filter(seat => seat.zone === bookingData.zone && seat.isAvailable).length;

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

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Library Info Card */}
          <Card sx={{ mb: 3, borderRadius: 2, border: 1, borderColor: 'divider' }}>
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
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                {/* 1. Date & Plan Type Selection */}
                <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CalendarMonth color="primary" />
                      <Typography variant="h6" fontWeight="600">
                        Select Date & Plan Type
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Booking Date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ 
                            ...bookingData, 
                            date: e.target.value, 
                            planType: '',
                            shift: '', 
                            zone: '', 
                            feePlanId: '',
                            seatId: '' 
                          })}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            min: new Date().toISOString().split('T')[0],
                          }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Plan Type"
                          value={bookingData.planType}
                          onChange={(e) => setBookingData({ 
                            ...bookingData, 
                            planType: e.target.value as any,
                            feePlanId: '',
                            zone: '',
                            seatId: '' 
                          })}
                          helperText="Filter plans by type"
                        >
                          <MenuItem value="">All Plans</MenuItem>
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                          <MenuItem value="annual">Annual</MenuItem>
                          <MenuItem value="combo">Combo</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* 2. Shift Selection */}
                {bookingData.date && (
                  <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Schedule color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Choose Shift
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {SHIFTS.map((shift) => (
                          <Grid item xs={6} sm={4} md={3} key={shift.value}>
                            <Card
                              variant="outlined"
                              sx={{
                                cursor: 'pointer',
                                border: bookingData.shift === shift.value ? 2 : 1,
                                borderColor: bookingData.shift === shift.value ? 'primary.main' : 'divider',
                                bgcolor: bookingData.shift === shift.value ? 'action.selected' : 'background.paper',
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                              }}
                              onClick={() => setBookingData({ ...bookingData, shift: shift.value, zone: '', seatId: '' })}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Typography variant="h4" sx={{ mb: 0.5 }}>
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
                      {bookingData.planType && feePlans.filter(plan => plan.type === bookingData.planType).length === 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          No {bookingData.planType} plans available. Please select a different plan type or choose "All Plans".
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 3. Zone Selection */}
                {bookingData.shift && (
                  <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EventSeat color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Choose Zone
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {ZONES.map((zone) => {
                          const isSelected = bookingData.zone === zone.value;
                          
                          return (
                            <Grid item xs={6} sm={4} key={zone.value}>
                              <Card
                                variant="outlined"
                                sx={{
                                  cursor: 'pointer',
                                  border: isSelected ? 2 : 1,
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                  textAlign: 'center',
                                  transition: 'all 0.2s',
                                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                                }}
                                onClick={() => setBookingData({ ...bookingData, zone: zone.value, feePlanId: '', seatId: '' })}
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
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 4. Fee Plan Selection */}
                {bookingData.zone && (
                  <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AttachMoney color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Select Fee Plan
                        </Typography>
                      </Box>
                      {selectedZone && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Selected Zone: <strong>{selectedZone.label}</strong> - Zone-specific pricing will be applied
                        </Alert>
                      )}
                      <Grid container spacing={2}>
                        {feePlans
                          .filter(plan => !bookingData.planType || plan.type === bookingData.planType)
                          .map((plan) => {
                          const isSelected = bookingData.feePlanId === plan.id;
                          const hasDiscount = plan.discount && 
                            (!plan.discount.validFrom || new Date() >= new Date(plan.discount.validFrom)) &&
                            (!plan.discount.validTo || new Date() <= new Date(plan.discount.validTo));
                          
                          // Calculate zone-specific price if zone is selected
                          let displayPrice = plan.basePrice;
                          if (bookingData.zone && plan.zonePricing) {
                            const zonePrice = plan.zonePricing[bookingData.zone as keyof typeof plan.zonePricing];
                            if (zonePrice) {
                              displayPrice = zonePrice;
                            }
                          }
                          
                          return (
                            <Grid item xs={12} sm={6} key={plan.id}>
                              <Badge
                                badgeContent={plan.isPopular ? <Star sx={{ fontSize: 12 }} /> : null}
                                color="warning"
                                sx={{ width: '100%' }}
                              >
                                <Card
                                  variant="outlined"
                                  sx={{
                                    cursor: 'pointer',
                                    border: isSelected ? 2 : 1,
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                                    position: 'relative',
                                  }}
                                  onClick={() => setBookingData({ ...bookingData, feePlanId: plan.id })}
                                >
                                  {plan.isPopular && (
                                    <Chip
                                      label="Popular"
                                      size="small"
                                      color="warning"
                                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                    />
                                  )}
                                  <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight="600">
                                          {plan.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {plan.description}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h6" fontWeight="700" color="primary.main">
                                          ₹{displayPrice}
                                        </Typography>
                                        {bookingData.zone && displayPrice !== plan.basePrice && (
                                          <Typography variant="caption" color="text.secondary" display="block">
                                            Base: ₹{plan.basePrice}
                                          </Typography>
                                        )}
                                        {hasDiscount && plan.discount && (
                                          <Chip
                                            icon={<LocalOffer />}
                                            label={plan.discount.type === 'percentage' 
                                              ? `${plan.discount.value}% OFF` 
                                              : `₹${plan.discount.value} OFF`}
                                            size="small"
                                            color="success"
                                            sx={{ mt: 0.5 }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    <List dense sx={{ py: 0 }}>
                                      {plan.features.slice(0, 3).map((feature, idx) => (
                                        <ListItem key={idx} sx={{ px: 0, py: 0.25 }}>
                                          <ListItemIcon sx={{ minWidth: 24 }}>
                                            <CheckCircle fontSize="small" color="success" />
                                          </ListItemIcon>
                                          <ListItemText 
                                            primary={feature}
                                            primaryTypographyProps={{ variant: 'caption' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                    {plan.scholarshipEligible && (
                                      <Chip
                                        icon={<School />}
                                        label="Scholarship Eligible"
                                        size="small"
                                        variant="outlined"
                                        sx={{ mt: 1 }}
                                      />
                                    )}
                                  </CardContent>
                                </Card>
                              </Badge>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* 5. Seat Selection */}
                {bookingData.feePlanId && (
                  <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          {selectedPlan && (
                            <Chip
                              label={selectedPlan.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        {availableSeatsCount > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {availableSeatsCount} available
                          </Typography>
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
                                        textDecoration: 'line-through',
                                      }),
                                    }}
                                  >
                                    {seat.seatNumber}
                                  </Button>
                                </Grid>
                              ))}
                          </Grid>
                          {availableSeatsCount === 0 && !loadingSeats && (
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
                  <Card sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
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
                          onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as 'online' | 'offline' | 'upi' })}
                          row
                        >
                          <FormControlLabel 
                            value="online" 
                            control={<Radio />} 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CreditCard fontSize="small" />
                                <span>Card/Net Banking</span>
                              </Box>
                            }
                            sx={{ mr: 3 }}
                          />
                          <FormControlLabel 
                            value="upi" 
                            control={<Radio />} 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <QrCode2 fontSize="small" />
                                <span>UPI</span>
                              </Box>
                            }
                            sx={{ mr: 3 }}
                          />
                          <FormControlLabel 
                            value="offline" 
                            control={<Radio />} 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountBalance fontSize="small" />
                                <span>Pay at Library</span>
                              </Box>
                            }
                          />
                        </RadioGroup>
                      </FormControl>
                      {bookingData.paymentMethod === 'upi' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Pay using UPI apps like Google Pay, PhonePe, Paytm, BHIM, etc.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>

            {/* Right Column - Enhanced Booking Summary (Sticky) */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: 80 } }}>
                <Card sx={{ borderRadius: 2, border: 2, borderColor: 'primary.main', boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CheckCircle color="primary" />
                      <Typography variant="h6" fontWeight="700">
                        Booking Summary
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Library</Typography>
                        <Typography variant="body2" fontWeight="600">{library.name}</Typography>
                      </Box>

                      {bookingData.date && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Date</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </Typography>
                        </Box>
                      )}

                      {selectedShift && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Shift</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedShift.icon} {selectedShift.label} ({selectedShift.start} - {selectedShift.end})
                          </Typography>
                        </Box>
                      )}

                      {selectedPlan && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Fee Plan</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="600">{selectedPlan.name}</Typography>
                            {selectedPlan.isPopular && <Star fontSize="small" color="warning" />}
                          </Box>
                        </Box>
                      )}

                      {selectedZone && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Zone</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedZone.icon} {selectedZone.label}
                          </Typography>
                        </Box>
                      )}

                      {selectedSeat && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Seat</Typography>
                          <Typography variant="body2" fontWeight="600">{selectedSeat.seatNumber}</Typography>
                        </Box>
                      )}

                      {bookingData.paymentMethod && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Payment</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {bookingData.paymentMethod === 'online' 
                              ? 'Card/Net Banking' 
                              : bookingData.paymentMethod === 'upi' 
                              ? 'UPI Payment' 
                              : 'Pay at Library'}
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 1 }} />

                      {/* Price Breakdown */}
                      {isFormValid && (
                        <Box>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              py: 1,
                            }}
                            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                          >
                            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                              Price Breakdown
                            </Typography>
                            <IconButton size="small">
                              {showPriceBreakdown ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                          <Collapse in={showPriceBreakdown}>
                            <Box sx={{ pl: 2, pt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Base Price:</Typography>
                                <Typography variant="caption" fontWeight="600">₹{priceBreakdown.basePrice}</Typography>
                              </Box>
                              {priceBreakdown.shiftAdjustment !== 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Shift Adjustment:</Typography>
                                  <Typography variant="caption" fontWeight="600" color={priceBreakdown.shiftAdjustment > 0 ? 'error.main' : 'success.main'}>
                                    {priceBreakdown.shiftAdjustment > 0 ? '+' : ''}₹{priceBreakdown.shiftAdjustment.toFixed(0)}
                                  </Typography>
                                </Box>
                              )}
                              {priceBreakdown.zoneAdjustment !== 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Zone Adjustment:</Typography>
                                  <Typography variant="caption" fontWeight="600" color={priceBreakdown.zoneAdjustment > 0 ? 'error.main' : 'success.main'}>
                                    {priceBreakdown.zoneAdjustment > 0 ? '+' : ''}₹{priceBreakdown.zoneAdjustment.toFixed(0)}
                                  </Typography>
                                </Box>
                              )}
                              {priceBreakdown.discount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="success.main">Discount:</Typography>
                                  <Typography variant="caption" fontWeight="600" color="success.main">
                                    -₹{priceBreakdown.discount.toFixed(0)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
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

                      {selectedPlan?.scholarshipEligible && (
                        <Alert severity="info" icon={<School />} sx={{ mt: 1 }}>
                          This plan is eligible for scholarship discounts
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
