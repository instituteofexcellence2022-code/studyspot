/**
 * 📚 COMPACT LIBRARY DETAILS PAGE
 * 
 * Mobile-first responsive design with:
 * - Sticky header with quick actions
 * - Compact info display
 * - Smooth image carousel
 * - Tab navigation
 * - Floating booking button
 * - Better visual hierarchy
 */

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
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Fab,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme,
  Collapse,
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
  EventSeat,
  Share,
  DirectionsCar,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  ThumbUp,
  Lock,
  Security,
  Print,
  MenuBook,
  LocalCafe,
  BatteryChargingFull,
  AccessTime,
  Groups,
  Info,
  CheckCircle,
  Call,
  Navigation,
} from '@mui/icons-material';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import { gradients } from '../theme/colors';
import api from '../services/api';
import EnhancedSeatBooking from './EnhancedSeatBooking';
import { toast } from 'react-toastify';

interface Library {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  images: string[];
  amenities: string[];
  totalSeats: number;
  availableSeats: number;
  operatingHours: string;
  peakHours: string;
  rules: string[];
  isFavorite: boolean;
  isVerified: boolean;
  studyEnvironment: string;
  popularWith: string[];
  specialFeatures: string[];
  distance: number;
  occupancyRate: number;
  avgStudyHours: number;
  openNow: boolean;
  libraryType: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export default function CompactLibraryDetailsPage({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [library, setLibrary] = useState<Library | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchLibraryDetails();
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
    description: 'Premium study space for competitive exam aspirants with 24/7 access',
    fullDescription: 'Central Study Hub is a state-of-the-art library facility designed specifically for students preparing for competitive exams like UPSC, JEE, and NEET. With 100 well-maintained seats, 24/7 access, and a silent study environment, we provide the perfect atmosphere for focused learning. Our facility includes individual cabins, subject-wise zones, and regular mentorship sessions.',
    address: 'MG Road, Connaught Place',
    city: 'New Delhi',
    pincode: '110001',
    phone: '+91 98765 43210',
    email: 'contact@centralstudy.com',
    rating: 4.8,
    reviewCount: 234,
    hourlyRate: 50,
    dailyRate: 300,
    weeklyRate: 1500,
    monthlyRate: 5000,
    images: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Locker', '24/7', 'Security', 'Printer'],
    totalSeats: 100,
    availableSeats: 45,
    operatingHours: '24/7 (All days)',
    peakHours: '9AM-12PM, 6PM-9PM',
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
    distance: 1.2,
    occupancyRate: 55,
    avgStudyHours: 6.5,
    openNow: true,
    libraryType: 'Premium',
  };

  const mockReviews: Review[] = [
    {
      id: '1',
      userName: 'Rahul Singh',
      rating: 5,
      comment: 'Perfect for UPSC preparation. Silent environment and great WiFi speed. Staff is very helpful and the facilities are top-notch.',
      date: '2024-11-01',
      helpful: 45,
      verified: true,
    },
    {
      id: '2',
      userName: 'Priya Kapoor',
      rating: 4,
      comment: 'Good library with all facilities. Only issue is parking gets full during peak hours. Otherwise, highly recommend!',
      date: '2024-10-28',
      helpful: 23,
      verified: true,
    },
    {
      id: '3',
      userName: 'Amit Kumar',
      rating: 5,
      comment: '24/7 access is a game-changer for night owls like me. Clean environment and well-maintained study desks.',
      date: '2024-10-25',
      helpful: 18,
      verified: false,
    },
  ];

  const handleToggleFavorite = async () => {
    if (!library) return;
    try {
      if (library.isFavorite) {
        await api.delete(`/api/favorites/libraries/${id}`);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/api/favorites/libraries/${id}`);
        toast.success('Added to favorites');
      }
      setLibrary({ ...library, isFavorite: !library.isFavorite });
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: library?.name,
          text: library?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, JSX.Element> = {
      'WiFi': <Wifi fontSize="small" />,
      'AC': <AcUnit fontSize="small" />,
      'Parking': <LocalParking fontSize="small" />,
      'Cafeteria': <Restaurant fontSize="small" />,
      'Locker': <Lock fontSize="small" />,
      'Security': <Security fontSize="small" />,
      'Printer': <Print fontSize="small" />,
      '24/7': <AccessTime fontSize="small" />,
      'Library': <MenuBook fontSize="small" />,
    };
    return icons[amenity] || <CheckCircle fontSize="small" />;
  };

  const getOccupancyColor = (rate: number) => {
    if (rate < 50) return 'success';
    if (rate < 75) return 'warning';
    return 'error';
  };

  const nextImage = () => {
    if (library) {
      setCurrentImage((prev) => (prev + 1) % library.images.length);
    }
  };

  const prevImage = () => {
    if (library) {
      setCurrentImage((prev) => (prev - 1 + library.images.length) % library.images.length);
    }
  };

  if (loading || !library) {
    return (
      <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          <Skeleton variant="rectangular" height={250} />
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={20} width="60%" />
            <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
          </Container>
        </Box>
      </StudyFocusedLayout>
    );
  }

  return (
    <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 10 : 3 }}>
        {/* Sticky Header */}
        <Paper 
          elevation={2}
          sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: 0,
            py: 1,
            px: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => navigate('/libraries')} size="small">
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight="600" noWrap>
                {library.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating value={library.rating} readOnly size="small" sx={{ fontSize: '0.9rem' }} />
                <Typography variant="caption" color="text.secondary">
                  {library.rating} ({library.reviewCount})
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleToggleFavorite} size="small">
              {library.isFavorite ? <Favorite color="error" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </IconButton>
            <IconButton onClick={handleShare} size="small">
              <Share fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>

        {/* Image Carousel */}
        <Box sx={{ position: 'relative', bgcolor: 'black' }}>
          <img
            src={library.images[currentImage]}
            alt={library.name}
            style={{
              width: '100%',
              height: isMobile ? 220 : 350,
              objectFit: 'cover',
              display: 'block',
            }}
          />
          
          {/* Status Badges */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {library.openNow ? (
              <Chip label="Open Now" size="small" color="success" sx={{ fontWeight: 600, bgcolor: 'success.main', color: 'white' }} />
            ) : (
              <Chip label="Closed" size="small" color="error" sx={{ fontWeight: 600 }} />
            )}
            {library.isVerified && (
              <Chip icon={<Verified fontSize="small" />} label="Verified" size="small" color="primary" sx={{ fontWeight: 600, bgcolor: 'white' }} />
            )}
          </Box>

          {/* Image Navigation */}
          {library.images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
                size="small"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
                size="small"
              >
                <ChevronRight />
              </IconButton>
              
              {/* Image Dots */}
              <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                  position: 'absolute', 
                  bottom: 12, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                }}
              >
                {library.images.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: currentImage === index ? 'white' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </Stack>
            </>
          )}
        </Box>

        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Quick Info Chips */}
          <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip 
              icon={<DirectionsCar fontSize="small" />}
              label={`${library.distance}km away`}
              size="small"
              sx={{ height: 24 }}
            />
            <Chip 
              icon={<EventSeat fontSize="small" />}
              label={`${library.availableSeats}/${library.totalSeats} seats`}
              size="small"
              color={library.availableSeats > 20 ? 'success' : 'warning'}
              sx={{ height: 24, fontWeight: 600 }}
            />
            <Chip 
              label={library.studyEnvironment}
              size="small"
              color="info"
              sx={{ height: 24 }}
            />
            <Chip 
              label={library.libraryType}
              size="small"
              variant="outlined"
              sx={{ height: 24 }}
            />
          </Stack>

          {/* Library Name & Description */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
              {library.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5, lineHeight: 1.6 }}>
              {library.description}
            </Typography>
            
            {/* Popular With Tags */}
            <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
              {library.popularWith.map(exam => (
                <Chip 
                  key={exam} 
                  label={exam} 
                  size="small" 
                  color="primary"
                  sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>

          {/* Compact Stats Grid */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {library.rating}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rating
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" color={getOccupancyColor(library.occupancyRate)}>
                  {library.occupancyRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Occupancy
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {library.avgStudyHours}h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Study
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ₹{library.hourlyRate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Per Hour
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Pricing Card - Compact */}
          <Card sx={{ mb: 2, borderRadius: 2, border: 1, borderColor: 'primary.main' }}>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Starting from
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    ₹{library.dailyRate}/day
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weekly: ₹{library.weeklyRate} • Monthly: ₹{library.monthlyRate}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => setTab(2)}
                  sx={{ 
                    fontWeight: 'bold',
                    px: 3,
                    background: gradients.primary,
                  }}
                >
                  Book Now
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Contact & Info - Accordion Style */}
          <Accordion sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" color="primary" />
                <Typography variant="body2" fontWeight="600">
                  Contact & Location
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">
                    {library.address}, {library.city} - {library.pincode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">{library.operatingHours}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="body2">Peak Hours: {library.peakHours}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Phone />}
                    href={`tel:${library.phone}`}
                    fullWidth
                  >
                    Call
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Email />}
                    href={`mailto:${library.email}`}
                    fullWidth
                  >
                    Email
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Navigation />}
                    fullWidth
                  >
                    Navigate
                  </Button>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Tabs */}
          <Card sx={{ borderRadius: 2 }}>
            <Tabs 
              value={tab} 
              onChange={(e, v) => setTab(v)} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{ 
                px: 1,
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  py: 1,
                },
              }}
            >
              <Tab label="About" />
              <Tab label="Amenities" />
              <Tab label="Book Seats" icon={<EventSeat fontSize="small" />} iconPosition="start" />
              <Tab label="Rules" />
              <Tab label={`Reviews (${reviews.length})`} />
            </Tabs>

            <Divider />

            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              {/* About Tab */}
              {tab === 0 && (
                <Box>
                  <Typography variant="body2" paragraph sx={{ lineHeight: 1.7 }}>
                    {library.fullDescription}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star fontSize="small" color="warning" />
                    Special Features
                  </Typography>
                  <Stack spacing={0.5}>
                    {library.specialFeatures.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Amenities Tab */}
              {tab === 1 && (
                <Grid container spacing={1.5}>
                  {library.amenities.map((amenity) => (
                    <Grid item xs={6} sm={4} md={3} key={amenity}>
                      <Paper 
                        sx={{ 
                          p: 1.5, 
                          textAlign: 'center', 
                          bgcolor: 'action.hover', 
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ mb: 0.5 }}>
                          {getAmenityIcon(amenity)}
                        </Box>
                        <Typography variant="caption" fontWeight="600">
                          {amenity}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Book Seats Tab */}
              {tab === 2 && (
                <Box sx={{ mt: -2 }}>
                  <EnhancedSeatBooking
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
                <List dense sx={{ py: 0 }}>
                  {library.rules.map((rule, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={
                          <Typography variant="body2" sx={{ display: 'flex', gap: 1 }}>
                            <Typography component="span" variant="body2" fontWeight="600" color="primary.main">
                              {index + 1}.
                            </Typography>
                            {rule}
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
                  {/* Overall Rating */}
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {library.rating}
                    </Typography>
                    <Rating value={library.rating} readOnly precision={0.1} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Based on {library.reviewCount} reviews
                    </Typography>
                  </Paper>

                  {/* Individual Reviews */}
                  <Stack spacing={2}>
                    {reviews.map((review) => (
                      <Paper key={review.id} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                            {review.userName[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight="600" noWrap>
                                {review.userName}
                              </Typography>
                              {review.verified && (
                                <Tooltip title="Verified Booking">
                                  <Verified fontSize="small" color="primary" />
                                </Tooltip>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
                          {review.comment}
                        </Typography>
                        <Button size="small" startIcon={<ThumbUp fontSize="small" />} sx={{ textTransform: 'none' }}>
                          Helpful ({review.helpful})
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>

        {/* Floating Action Button (Mobile) */}
        {isMobile && (
          <Fab
            variant="extended"
            color="primary"
            onClick={() => setTab(2)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              left: 16,
              background: gradients.primary,
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            <EventSeat sx={{ mr: 1 }} />
            Book Seats Now
          </Fab>
        )}
      </Box>
    </StudyFocusedLayout>
  );
}

