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
} from '@mui/material';
import {
  LocationOn,
  Star,
  AccessTime,
  Wifi,
  AcUnit,
  LocalParking,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface LibraryDetailsPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LibraryDetailsPage({ setIsAuthenticated }: LibraryDetailsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<any>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    duration: '2',
  });

  useEffect(() => {
    fetchLibraryDetails();
  }, [id]);

  const fetchLibraryDetails = async () => {
    try {
      const response = await api.get(`/libraries/${id}`);
      setLibrary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch library details:', error);
      // Mock data
      setLibrary({
        id,
        name: 'Central Library',
        description: 'Modern study space with AC and WiFi. Perfect for students and professionals.',
        address: 'Downtown, City Center',
        city: 'Mumbai',
        rating: 4.5,
        hourlyRate: 50,
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
        amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria'],
        openTime: '08:00',
        closeTime: '22:00',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    try {
      await api.post('/api/bookings', {
        libraryId: id,
        ...bookingData,
      });
      alert('Booking successful!');
      navigate('/bookings');
    } catch (error) {
      alert('Booking failed. Please try again.');
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
                  <Star sx={{ color: '#f59e0b', mr: 0.5 }} />
                  <Typography variant="h6">{library.rating}</Typography>
                </Box>
              </Box>
              <Chip
                label={`₹${library.hourlyRate}/hour`}
                color="primary"
                sx={{ fontSize: 18, py: 2 }}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {library.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {library.address}, {library.city}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {library.openTime} - {library.closeTime}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {library.amenities?.map((amenity: string) => (
                <Chip key={amenity} label={amenity} icon={
                  amenity === 'WiFi' ? <Wifi /> :
                  amenity === 'AC' ? <AcUnit /> :
                  amenity === 'Parking' ? <LocalParking /> : undefined
                } />
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setBookingDialog(true)}
              sx={{ py: 1.5 }}
            >
              Book Now
            </Button>
          </CardContent>
        </Card>

        {/* Booking Dialog */}
        <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book {library.name}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              value={bookingData.startTime}
              onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Duration (hours)"
              value={bookingData.duration}
              onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
            </TextField>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: ₹{library.hourlyRate * parseInt(bookingData.duration)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBooking}>
              Confirm Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

