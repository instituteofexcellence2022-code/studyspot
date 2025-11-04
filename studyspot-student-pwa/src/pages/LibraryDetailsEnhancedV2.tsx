import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Rating,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Skeleton,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Phone,
  Email,
  Schedule,
  Wifi,
  AcUnit,
  LocalParking,
  Restaurant,
  Verified,
  Star,
  TrendingUp,
  Groups,
  EventSeat,
} from '@mui/icons-material';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import { gradients } from '../theme/colors';
import api from '../services/api';
import SeatBookingPage from './SeatBookingPage';

interface Library {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  images: string[];
  amenities: string[];
  totalSeats: number;
  availableSeats: number;
  operatingHours: string;
  rules: string[];
  isFavorite: boolean;
  isVerified: boolean;
  studyEnvironment: string;
  popularWith: string[];
  specialFeatures: string[];
}

interface Seat {
  id: string;
  number: number;
  zone: string;
  status: 'available' | 'occupied' | 'reserved';
  type: 'regular' | 'premium';
  isFavorite?: boolean;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export default function LibraryDetailsEnhancedV2({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<Library | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState(0);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: '',
    shift: '',
    selectedSeats: [] as string[],
    bookingType: 'individual',
    autoExtend: false,
    joinWaitlist: false,
  });

  const shifts = [
    { id: 'morning', label: 'Morning', time: '6 AM - 12 PM', price: 150, icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon', time: '12 PM - 6 PM', price: 150, icon: '☀️' },
    { id: 'evening', label: 'Evening', time: '6 PM - 11 PM', price: 100, icon: '🌙' },
    { id: 'fullday', label: 'Full Day', time: '6 AM - 11 PM', price: 300, icon: '⏰' },
  ];

  const steps = ['Date & Shift', 'Select Seats', 'Options', 'Confirm'];

  useEffect(() => {
    fetchLibraryDetails();
    fetchSeats();
    fetchReviews();
  }, [id]);

  const fetchLibraryDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/libraries/${id}`);
      setLibrary(response.data.data || mockLibrary);
    } catch (error) {
      setLibrary(mockLibrary);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/api/libraries/${id}/seats`);
      setSeats(response.data.data || mockSeats);
    } catch (error) {
      setSeats(mockSeats);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/api/libraries/${id}/reviews`);
      setReviews(response.data.data || mockReviews);
    } catch (error) {
      setReviews(mockReviews);
    }
  };

  const mockLibrary: Library = {
    id: '1',
    name: 'Central Study Hub',
    description: 'Premium study space for competitive exam aspirants',
    fullDescription: 'Central Study Hub is a state-of-the-art library facility designed specifically for students preparing for competitive exams like UPSC, JEE, and NEET. With 100 well-maintained seats, 24/7 access, and a silent study environment, we provide the perfect atmosphere for focused learning.',
    address: 'MG Road, Connaught Place, New Delhi - 110001',
    city: 'Delhi',
    phone: '+91 98765 43210',
    email: 'contact@centralstudy.com',
    rating: 4.8,
    reviewCount: 234,
    hourlyRate: 50,
    dailyRate: 300,
    monthlyRate: 5000,
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Locker', '24/7', 'Library', 'Security'],
    totalSeats: 100,
    availableSeats: 45,
    operatingHours: '24/7 (All days)',
    rules: [
      'Maintain complete silence in study zones',
      'No food or drinks in the study area',
      'Keep belongings in designated lockers',
      'Show valid ID card at entry',
      'No group discussions in silent zones',
    ],
    isFavorite: false,
    isVerified: true,
    studyEnvironment: 'Silent',
    popularWith: ['UPSC', 'SSC', 'Banking'],
    specialFeatures: ['Individual cabins', 'Subject-wise zones', 'Mentorship sessions', 'Mock test area'],
  };

  const mockSeats: Seat[] = Array.from({ length: 50 }, (_, i) => ({
    id: `seat-${i + 1}`,
    number: i + 1,
    zone: `Zone ${String.fromCharCode(65 + Math.floor(i / 10))}`,
    status: ['available', 'available', 'available', 'occupied', 'reserved'][Math.floor(Math.random() * 5)] as any,
    type: (i + 1) % 10 === 0 ? 'premium' : 'regular',
    isFavorite: false,
  }));

  const mockReviews: Review[] = [
    {
      id: '1',
      userName: 'Rahul S.',
      rating: 5,
      comment: 'Perfect for UPSC preparation. Silent environment and great WiFi speed. Staff is very helpful.',
      date: '2024-11-01',
      helpful: 45,
    },
    {
      id: '2',
      userName: 'Priya K.',
      rating: 4,
      comment: 'Good library with all facilities. Only issue is parking gets full during peak hours.',
      date: '2024-10-28',
      helpful: 23,
    },
  ];

  const handleSeatSelect = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status !== 'available') return;

    if (bookingData.bookingType === 'individual') {
      setBookingData({ ...bookingData, selectedSeats: [seatId] });
    } else {
      const newSeats = bookingData.selectedSeats.includes(seatId)
        ? bookingData.selectedSeats.filter(s => s !== seatId)
        : [...bookingData.selectedSeats, seatId];
      setBookingData({ ...bookingData, selectedSeats: newSeats });
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && (!bookingData.date || !bookingData.shift)) {
      alert('Please select date and shift');
      return;
    }
    if (activeStep === 1 && bookingData.selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBooking = async () => {
    try {
      const selectedShift = shifts.find(s => s.id === bookingData.shift);
      await api.post('/api/bookings', {
        libraryId: id,
        date: bookingData.date,
        shift: bookingData.shift,
        seats: bookingData.selectedSeats,
        bookingType: bookingData.bookingType,
        autoExtend: bookingData.autoExtend,
        totalAmount: (selectedShift?.price || 0) * bookingData.selectedSeats.length,
      });

      alert('🎉 Booking successful! See you at the library!');
      navigate('/bookings');
    } catch (error) {
      alert('Booking failed. Please try again.');
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (bookingData.selectedSeats.includes(seat.id)) return '#2563eb';
    switch (seat.status) {
      case 'available': return seat.type === 'premium' ? '#f59e0b' : '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (loading || !library) {
    return (
      <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={20} width="60%" />
        </Container>
      </StudyFocusedLayout>
    );
  }

  return (
    <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/libraries')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
            {library.name}
          </Typography>
          <IconButton onClick={() => setLibrary({ ...library, isFavorite: !library.isFavorite })}>
            {library.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        {/* Image Gallery */}
        <ImageList cols={3} gap={8} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
          {library.images.map((img, index) => (
            <ImageListItem key={index}>
              <img src={img} alt={`Library ${index + 1}`} style={{ height: index === 0 ? 300 : 145, objectFit: 'cover' }} />
            </ImageListItem>
          ))}
        </ImageList>

        <Grid container spacing={3}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={8}>
            {/* Quick Info */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={library.rating} readOnly precision={0.1} />
                      <Typography variant="body1" fontWeight="600">
                        {library.rating} ({library.reviewCount} reviews)
                      </Typography>
                      {library.isVerified && (
                        <Chip icon={<Verified />} label="Verified" size="small" color="primary" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {library.fullDescription}
                    </Typography>
                  </Box>
                </Box>

                {/* Popular For */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🎯 Popular for:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {library.popularWith.map(exam => (
                      <Chip key={exam} label={exam} size="small" color="primary" />
                    ))}
                  </Box>
                </Box>

                {/* Special Features */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ⭐ Special Features:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {library.specialFeatures.map(feature => (
                      <Chip key={feature} label={feature} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                {/* Contact Info */}
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn color="action" />
                      <Typography variant="body2">{library.address}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule color="action" />
                      <Typography variant="body2">{library.operatingHours}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone color="action" />
                      <Typography variant="body2">{library.phone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="action" />
                      <Typography variant="body2">{library.email}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tabs: About, Amenities, Book Seats, Rules, Reviews */}
            <Card sx={{ borderRadius: 3 }}>
              <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2 }} variant="scrollable" scrollButtons="auto">
                <Tab label="About" />
                <Tab label="Amenities" />
                <Tab label="🪑 Book Seats" icon={<EventSeat />} iconPosition="start" />
                <Tab label="Rules" />
                <Tab label={`Reviews (${reviews.length})`} />
              </Tabs>

              <CardContent>
                {/* About Tab */}
                {tab === 0 && (
                  <Box>
                    <Typography variant="body2" paragraph>
                      {library.fullDescription}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Study Environment: <Chip label={library.studyEnvironment} size="small" color="success" sx={{ ml: 1 }} />
                    </Typography>
                  </Box>
                )}

                {/* Amenities Tab */}
                {tab === 1 && (
                  <Grid container spacing={2}>
                    {library.amenities.map((amenity) => (
                      <Grid item xs={6} sm={4} key={amenity}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                          <Typography variant="body2" fontWeight="600">
                            ✓ {amenity}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Book Seats Tab */}
                {tab === 2 && (
                  <Box sx={{ mt: -3 }}>
                    <SeatBookingPage 
                      darkMode={darkMode} 
                      setDarkMode={setDarkMode}
                      libraryId={library.id}
                      libraryName={library.name}
                      embedded={true}
                    />
                  </Box>
                )}

                {/* Rules Tab */}
                {tab === 3 && (
                  <List>
                    {library.rules.map((rule, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={
                            <Typography variant="body2">
                              {index + 1}. {rule}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Reviews Tab */}
                {tab === 4 && (
                  <Box>
                    {reviews.map((review) => (
                      <Paper key={review.id} sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                          <Avatar>{review.userName[0]}</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="600">
                              {review.userName}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {review.comment}
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }}>
                          👍 Helpful ({review.helpful})
                        </Button>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Booking */}
          <Grid item xs={12} md={4}>
            {/* Pricing Card */}
            <Card sx={{ mb: 2, borderRadius: 3, border: 2, borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Starting from
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                  ₹{library.hourlyRate}/hr
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">Daily:</Typography>
                    <Typography variant="caption" fontWeight="600">₹{library.dailyRate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Monthly:</Typography>
                    <Typography variant="caption" fontWeight="600">₹{library.monthlyRate}</Typography>
                  </Box>
                </Box>

                {/* Availability */}
                <Paper sx={{ p: 1.5, mb: 2, bgcolor: library.availableSeats > 20 ? 'success.light' : 'warning.light', borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight="600" textAlign="center">
                    {library.availableSeats}/{library.totalSeats} Seats Available
                  </Typography>
                </Paper>

                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  onClick={() => setBookingDialog(true)}
                  sx={{ 
                    background: gradients.primary,
                    py: 1.5,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Rating:</Typography>
                    <Typography variant="caption" fontWeight="600">{library.rating}/5.0</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Total Reviews:</Typography>
                    <Typography variant="caption" fontWeight="600">{library.reviewCount}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Environment:</Typography>
                    <Chip label={library.studyEnvironment} size="small" sx={{ height: 20 }} color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption">Verified:</Typography>
                    <Chip label="Yes" size="small" sx={{ height: 20 }} color="primary" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Book Your Study Session
            <Typography variant="caption" color="text.secondary" display="block">
              {library.name}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Date & Shift */}
            {activeStep === 0 && (
              <Box>
                <TextField
                  fullWidth
                  type="date"
                  label="Select Date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  sx={{ mb: 3 }}
                />

                <Typography variant="subtitle2" gutterBottom>
                  Select Shift:
                </Typography>
                <Grid container spacing={2}>
                  {shifts.map((shift) => (
                    <Grid item xs={6} key={shift.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: 2,
                          borderColor: bookingData.shift === shift.id ? 'primary.main' : 'divider',
                          bgcolor: bookingData.shift === shift.id ? 'primary.light' : 'background.paper',
                        }}
                        onClick={() => setBookingData({ ...bookingData, shift: shift.id })}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h4">{shift.icon}</Typography>
                          <Typography variant="body1" fontWeight="600">
                            {shift.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {shift.time}
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                            ₹{shift.price}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Step 2: Select Seats */}
            {activeStep === 1 && (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bookingData.bookingType === 'group'}
                      onChange={(e) => setBookingData({ 
                        ...bookingData, 
                        bookingType: e.target.checked ? 'group' : 'individual',
                        selectedSeats: []
                      })}
                    />
                  }
                  label="Group booking (select multiple seats)"
                />

                {/* Seat Legend */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip icon={<Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '50%' }} />} label="Available" size="small" />
                  <Chip icon={<Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: '50%' }} />} label="Premium" size="small" />
                  <Chip icon={<Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%' }} />} label="Occupied" size="small" />
                  <Chip icon={<Box sx={{ width: 12, height: 12, bgcolor: '#2563eb', borderRadius: '50%' }} />} label="Selected" size="small" />
                </Box>

                {/* Seat Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 1, maxHeight: 400, overflow: 'auto', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  {seats.map((seat) => (
                    <Box
                      key={seat.id}
                      onClick={() => handleSeatSelect(seat.id)}
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: getSeatColor(seat),
                        color: 'white',
                        borderRadius: 1,
                        cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
                        fontSize: 12,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: seat.status === 'available' ? 'scale(1.1)' : 'none',
                        },
                      }}
                    >
                      {seat.number}
                    </Box>
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Selected: {bookingData.selectedSeats.length} seat(s)
                </Typography>
              </Box>
            )}

            {/* Step 3: Options */}
            {activeStep === 2 && (
              <Box>
                <Card variant="outlined" sx={{ mb: 2, p: 2, bgcolor: 'info.light' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={bookingData.autoExtend}
                        onChange={(e) => setBookingData({ ...bookingData, autoExtend: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          🔄 Auto-extend booking
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically extend if seat is available (₹{library.hourlyRate}/hr)
                        </Typography>
                      </Box>
                    }
                  />
                </Card>

                {library.availableSeats < 10 && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'warning.light' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={bookingData.joinWaitlist}
                          onChange={(e) => setBookingData({ ...bookingData, joinWaitlist: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            📋 Join waitlist (if booked out)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Get notified when seats become available
                          </Typography>
                        </Box>
                      }
                    />
                  </Card>
                )}
              </Box>
            )}

            {/* Step 4: Confirm */}
            {activeStep === 3 && (
              <Box>
                <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📋 Booking Summary
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Date:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(bookingData.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Shift:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {shifts.find(s => s.id === bookingData.shift)?.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Seats:</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {bookingData.selectedSeats.map(sId => seats.find(s => s.id === sId)?.number).join(', ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Total:</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₹{(shifts.find(s => s.id === bookingData.shift)?.price || 0) * bookingData.selectedSeats.length}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {bookingData.autoExtend && (
                  <Chip label="✓ Auto-extend enabled" color="info" sx={{ mb: 1 }} />
                )}
                {bookingData.joinWaitlist && (
                  <Chip label="✓ Waitlist enabled" color="warning" sx={{ mb: 1 }} />
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="contained" onClick={handleBooking}>
                Confirm Booking
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </StudyFocusedLayout>
  );
}

