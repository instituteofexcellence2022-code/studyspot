import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
  Rating,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn,
  Star,
  AccessTime,
  Wifi,
  AcUnit,
  LocalParking,
  Restaurant,
  EventSeat,
  Group,
  CalendarMonth,
  Schedule,
  Check,
  Close,
  Favorite,
  FavoriteBorder,
  Info,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface LibraryDetailsPageEnhancedProps {
  setIsAuthenticated: (value: boolean) => void;
}

interface Seat {
  id: string;
  number: number;
  zone: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'regular' | 'premium' | 'group';
  position: { x: number; y: number };
}

const shifts = [
  { id: 'morning', label: 'Morning', time: '6:00 AM - 12:00 PM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', time: '6:00 PM - 12:00 AM', icon: '🌙' },
  { id: 'fullday', label: 'Full Day', time: '6:00 AM - 12:00 AM', icon: '🌞' },
];

export default function LibraryDetailsPageEnhanced({ setIsAuthenticated }: LibraryDetailsPageEnhancedProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    date: '',
    shift: '',
    selectedSeats: [] as string[],
    duration: 2,
    bookingType: 'individual', // 'individual' or 'group'
  });

  const steps = ['Select Date & Shift', 'Choose Seats', 'Options', 'Confirm Booking'];

  useEffect(() => {
    fetchLibraryDetails();
    fetchSeats();
  }, [id]);

  const fetchLibraryDetails = async () => {
    try {
      const response = await api.get(`/libraries/${id}`);
      setLibrary(response.data.data);
      setIsFavorite(response.data.data.isFavorite || false);
    } catch (error) {
      console.error('Failed to fetch library details:', error);
      // Mock data
      setLibrary({
        id,
        name: 'Central Library',
        description: 'Modern study space with AC and WiFi. Perfect for students and professionals. Our library offers a peaceful environment with state-of-the-art facilities.',
        address: 'Downtown, City Center',
        city: 'Mumbai',
        rating: 4.5,
        reviewCount: 124,
        hourlyRate: 50,
        dailyRate: 300,
        monthlyRate: 6000,
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
        images: [
          'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
          'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Printer', 'Locker'],
        openTime: '06:00',
        closeTime: '00:00',
        totalSeats: 100,
        availableSeats: 45,
        phone: '+91 9876543210',
        email: 'contact@centrallibrary.com',
        rules: [
          'Maintain silence',
          'No food in study area',
          'Keep belongings in lockers',
          'Show ID card at entry',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/libraries/${id}/seats`);
      setSeats(response.data.data);
    } catch (error) {
      // Generate mock seat layout
      const mockSeats: Seat[] = [];
      const zones = ['Zone A', 'Zone B', 'Zone C'];
      let seatNumber = 1;

      zones.forEach((zone, zoneIndex) => {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 6; col++) {
            const statuses: Array<'available' | 'occupied' | 'reserved' | 'maintenance'> = 
              ['available', 'available', 'available', 'occupied', 'reserved'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            mockSeats.push({
              id: `seat-${seatNumber}`,
              number: seatNumber++,
              zone,
              status,
              type: col === 5 ? 'premium' : 'regular',
              position: {
                x: zoneIndex * 300 + col * 45,
                y: row * 45,
              },
            });
          }
        }
      });

      setSeats(mockSeats);
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.post(`/libraries/${id}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite');
    }
  };

  const handleSeatClick = (seatId: string, seatStatus: string) => {
    if (seatStatus !== 'available') return;

    if (bookingData.bookingType === 'individual' && bookingData.selectedSeats.includes(seatId)) {
      setBookingData({
        ...bookingData,
        selectedSeats: [],
      });
    } else if (bookingData.bookingType === 'individual') {
      setBookingData({
        ...bookingData,
        selectedSeats: [seatId],
      });
    } else {
      // Group booking - allow multiple seats
      const newSeats = bookingData.selectedSeats.includes(seatId)
        ? bookingData.selectedSeats.filter(s => s !== seatId)
        : [...bookingData.selectedSeats, seatId];
      
      setBookingData({
        ...bookingData,
        selectedSeats: newSeats,
      });
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (bookingData.selectedSeats.includes(seat.id)) return '#2563eb';
    switch (seat.status) {
      case 'available': return seat.type === 'premium' ? '#f59e0b' : '#10b981';
      case 'occupied': return '#ef4444';
      case 'reserved': return '#f59e0b';
      case 'maintenance': return '#6b7280';
      default: return '#10b981';
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
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleBooking = async () => {
    try {
      const selectedShift = shifts.find(s => s.id === bookingData.shift);
      const selectedSeatObjects = seats.filter(s => bookingData.selectedSeats.includes(s.id));
      
      await api.post('/api/bookings', {
        libraryId: id,
        date: bookingData.date,
        shift: bookingData.shift,
        seats: bookingData.selectedSeats,
        bookingType: bookingData.bookingType,
        totalAmount: library.hourlyRate * bookingData.duration * bookingData.selectedSeats.length,
      });
      
      alert('Booking successful! Redirecting to bookings page...');
      navigate('/bookings');
    } catch (error) {
      alert('Booking failed. Please try again.');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'WiFi': return <Wifi />;
      case 'AC': return <AcUnit />;
      case 'Parking': return <LocalParking />;
      case 'Cafeteria': return <Restaurant />;
      default: return <EventSeat />;
    }
  };

  if (loading) {
    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!library) {
    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        <Container>
          <Typography>Library not found</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg">
        <Button onClick={() => navigate('/libraries')} sx={{ mb: 2 }}>
          ← Back to Libraries
        </Button>

        <Grid container spacing={3}>
          {/* Left Column - Library Info */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={library.imageUrl}
                alt={library.name}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                      {library.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={library.rating} readOnly precision={0.1} />
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        {library.rating} ({library.reviewCount} reviews)
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>

                <Typography variant="body1" paragraph>
                  {library.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {library.address}, {library.city}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {library.openTime} - {library.closeTime}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventSeat sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {library.availableSeats}/{library.totalSeats} Seats Available
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {library.amenities?.map((amenity: string) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      icon={getAmenityIcon(amenity)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>
                  Library Rules
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {library.rules?.map((rule: string, index: number) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 1 }}>
                      {rule}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Booking Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Book Your Seat
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    ₹{library.hourlyRate}/hour
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{library.dailyRate}/day • ₹{library.monthlyRate}/month
                  </Typography>
                </Box>

                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{library.availableSeats}</strong> seats available now
                  </Typography>
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => setBookingDialog(true)}
                  sx={{ py: 1.5, mb: 2 }}
                  startIcon={<EventSeat />}
                >
                  Book Now
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📞 {library.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📧 {library.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog 
          open={bookingDialog} 
          onClose={() => setBookingDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { minHeight: '600px' } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Book {library.name}</Typography>
              <IconButton onClick={() => setBookingDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <Stepper activeStep={activeStep} sx={{ px: 3, py: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <DialogContent>
            {/* Step 1: Date & Shift Selection */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Type
                </Typography>
                <ToggleButtonGroup
                  value={bookingData.bookingType}
                  exclusive
                  onChange={(e, value) => value && setBookingData({ ...bookingData, bookingType: value, selectedSeats: [] })}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <ToggleButton value="individual">
                    <EventSeat sx={{ mr: 1 }} /> Individual
                  </ToggleButton>
                  <ToggleButton value="group">
                    <Group sx={{ mr: 1 }} /> Group
                  </ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  fullWidth
                  type="date"
                  label="Select Date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Select Shift
                </Typography>
                <Grid container spacing={2}>
                  {shifts.map((shift) => (
                    <Grid item xs={12} sm={6} key={shift.id}>
                      <Paper
                        elevation={bookingData.shift === shift.id ? 8 : 1}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: bookingData.shift === shift.id ? 2 : 0,
                          borderColor: 'primary.main',
                          transition: 'all 0.2s',
                          '&:hover': { elevation: 4 },
                        }}
                        onClick={() => setBookingData({ ...bookingData, shift: shift.id })}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h4" sx={{ mr: 1 }}>
                            {shift.icon}
                          </Typography>
                          <Typography variant="h6">{shift.label}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {shift.time}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Step 2: Seat Selection */}
            {activeStep === 1 && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  {bookingData.bookingType === 'individual' 
                    ? 'Click on an available seat to select it'
                    : `Select up to 6 seats for group booking. Selected: ${bookingData.selectedSeats.length}`}
                </Alert>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip icon={<Check />} label="Available" sx={{ bgcolor: '#10b981', color: 'white' }} />
                  <Chip icon={<Check />} label="Premium" sx={{ bgcolor: '#f59e0b', color: 'white' }} />
                  <Chip icon={<Close />} label="Occupied" sx={{ bgcolor: '#ef4444', color: 'white' }} />
                  <Chip icon={<Info />} label="Selected" sx={{ bgcolor: '#2563eb', color: 'white' }} />
                </Box>

                <Paper sx={{ p: 2, overflowX: 'auto', bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    🖥️ Screen/Front
                  </Typography>
                  <Box sx={{ position: 'relative', width: '900px', height: '250px', margin: '0 auto' }}>
                    {seats.map((seat) => (
                      <Tooltip
                        key={seat.id}
                        title={`Seat ${seat.number} - ${seat.zone} - ${seat.type} - ${seat.status}`}
                      >
                        <Box
                          onClick={() => handleSeatClick(seat.id, seat.status)}
                          sx={{
                            position: 'absolute',
                            left: seat.position.x,
                            top: seat.position.y,
                            width: 35,
                            height: 35,
                            bgcolor: getSeatColor(seat),
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: seat.status === 'available' ? 'scale(1.1)' : 'none',
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {seat.number}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Step 3: Confirmation */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Date:</Typography>
                      <Typography variant="body1" fontWeight="bold">{bookingData.date}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Shift:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {shifts.find(s => s.id === bookingData.shift)?.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Selected Seats:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {bookingData.selectedSeats.map(sId => 
                          seats.find(s => s.id === sId)?.number
                        ).join(', ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₹{library.hourlyRate * bookingData.duration * bookingData.selectedSeats.length}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Alert severity="success">
                  You will receive a confirmation email and SMS once booking is complete
                </Alert>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            {activeStep > 0 && (
              <Button onClick={handleBack}>Back</Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" onClick={handleBooking}>
                Confirm Booking
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

