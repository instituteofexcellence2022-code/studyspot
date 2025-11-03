import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Rating,
  Paper,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Favorite,
  FavoriteBorder,
  Wifi,
  AcUnit,
  LocalParking,
  Restaurant,
  ViewList,
  Map as MapIcon,
  ExpandMore,
  TrendingUp,
  Verified,
  Star,
  DirectionsCar,
  Schedule,
} from '@mui/icons-material';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import { gradients } from '../theme/colors';
import api from '../services/api';

interface Library {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  imageUrl: string;
  amenities: string[];
  availableSeats: number;
  totalSeats: number;
  distance: number;
  isFavorite: boolean;
  isVerified: boolean;
  openNow: boolean;
  studyEnvironment: string; // 'Silent', 'Moderate', 'Flexible'
  popularWith: string[]; // ['UPSC', 'JEE', 'NEET']
  peakHours: string;
}

export default function LibrariesEnhancedV2({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, price
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    maxDistance: 10,
    minRating: 0,
    maxPrice: 500,
    amenities: [] as string[],
    studyType: 'all', // all, silent, moderate
    examPrep: 'all', // all, UPSC, JEE, NEET
  });

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/libraries');
      setLibraries(response.data.data || mockLibraries);
    } catch (error) {
      setLibraries(mockLibraries);
    } finally {
      setLoading(false);
    }
  };

  const mockLibraries: Library[] = [
    {
      id: 1,
      name: 'Central Study Hub',
      description: 'Premium study space for competitive exam aspirants with 24/7 access',
      address: 'MG Road, Connaught Place',
      city: 'Delhi',
      rating: 4.8,
      reviewCount: 234,
      hourlyRate: 50,
      dailyRate: 300,
      monthlyRate: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500',
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Locker', '24/7'],
      availableSeats: 45,
      totalSeats: 100,
      distance: 1.2,
      isFavorite: true,
      isVerified: true,
      openNow: true,
      studyEnvironment: 'Silent',
      popularWith: ['UPSC', 'SSC'],
      peakHours: '9AM-12PM, 6PM-9PM',
    },
    {
      id: 2,
      name: 'Knowledge Point Library',
      description: 'Spacious library with subject-wise zones and expert mentors',
      address: 'Rajouri Garden, West Delhi',
      city: 'Delhi',
      rating: 4.6,
      reviewCount: 189,
      hourlyRate: 40,
      dailyRate: 250,
      monthlyRate: 4000,
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      amenities: ['WiFi', 'AC', 'Library', 'Cafeteria'],
      availableSeats: 78,
      totalSeats: 150,
      distance: 2.5,
      isFavorite: false,
      isVerified: true,
      openNow: true,
      studyEnvironment: 'Moderate',
      popularWith: ['JEE', 'NEET'],
      peakHours: '2PM-6PM',
    },
    {
      id: 3,
      name: 'Focus Zone Study Center',
      description: 'Individual cabins with personal desks for distraction-free study',
      address: 'Lajpat Nagar, South Delhi',
      city: 'Delhi',
      rating: 4.9,
      reviewCount: 312,
      hourlyRate: 60,
      dailyRate: 350,
      monthlyRate: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500',
      amenities: ['WiFi', 'AC', 'Parking', 'Private Cabin', 'Locker'],
      availableSeats: 25,
      totalSeats: 50,
      distance: 3.8,
      isFavorite: false,
      isVerified: true,
      openNow: false,
      studyEnvironment: 'Silent',
      popularWith: ['UPSC', 'Banking'],
      peakHours: '6AM-10AM',
    },
  ];

  const handleToggleFavorite = async (libraryId: number) => {
    try {
      const lib = libraries.find(l => l.id === libraryId);
      if (lib?.isFavorite) {
        await api.delete(`/api/favorites/libraries/${libraryId}`);
      } else {
        await api.post(`/api/favorites/libraries/${libraryId}`);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
    setLibraries(libraries.map(l => 
      l.id === libraryId ? { ...l, isFavorite: !l.isFavorite } : l
    ));
  };

  const filteredLibraries = libraries
    .filter(lib => {
      const matchesSearch = lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lib.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistance = lib.distance <= filters.maxDistance;
      const matchesRating = lib.rating >= filters.minRating;
      const matchesPrice = lib.dailyRate <= filters.maxPrice;
      const matchesAmenities = filters.amenities.length === 0 || 
                              filters.amenities.every(a => lib.amenities.includes(a));
      const matchesStudyType = filters.studyType === 'all' || lib.studyEnvironment.toLowerCase() === filters.studyType;
      const matchesExam = filters.examPrep === 'all' || lib.popularWith.includes(filters.examPrep);

      return matchesSearch && matchesDistance && matchesRating && matchesPrice && matchesAmenities && matchesStudyType && matchesExam;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance': return a.distance - b.distance;
        case 'rating': return b.rating - a.rating;
        case 'price': return a.dailyRate - b.dailyRate;
        default: return 0;
      }
    });

  const allAmenities = ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Locker', '24/7', 'Library', 'Private Cabin'];

  return (
    <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📚 Find Your Study Space
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredLibraries.length} libraries • Sorted by {sortBy}
          </Typography>
        </Box>

        {/* Search & Quick Filters */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search libraries, areas, or cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip 
              label="Nearest" 
              onClick={() => setSortBy('distance')}
              color={sortBy === 'distance' ? 'primary' : 'default'}
              variant={sortBy === 'distance' ? 'filled' : 'outlined'}
            />
            <Chip 
              label="Top Rated" 
              onClick={() => setSortBy('rating')}
              color={sortBy === 'rating' ? 'primary' : 'default'}
              variant={sortBy === 'rating' ? 'filled' : 'outlined'}
            />
            <Chip 
              label="Cheapest" 
              onClick={() => setSortBy('price')}
              color={sortBy === 'price' ? 'primary' : 'default'}
              variant={sortBy === 'price' ? 'filled' : 'outlined'}
            />
            <Button
              size="small"
              startIcon={<FilterList />}
              variant="outlined"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Advanced Filters
            </Button>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => newView && setView(newView)}
              size="small"
              sx={{ ml: 'auto' }}
            >
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="map">
                <MapIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Advanced Filters */}
          {filterOpen && (
            <Accordion expanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="600">Advanced Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" gutterBottom>
                      Distance: {filters.maxDistance} km
                    </Typography>
                    <Slider
                      value={filters.maxDistance}
                      onChange={(e, val) => setFilters({ ...filters, maxDistance: val as number })}
                      min={1}
                      max={20}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" gutterBottom>
                      Max Daily Price: ₹{filters.maxPrice}
                    </Typography>
                    <Slider
                      value={filters.maxPrice}
                      onChange={(e, val) => setFilters({ ...filters, maxPrice: val as number })}
                      min={100}
                      max={1000}
                      step={50}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" gutterBottom>
                      Minimum Rating
                    </Typography>
                    <Rating
                      value={filters.minRating}
                      onChange={(e, val) => setFilters({ ...filters, minRating: val || 0 })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" gutterBottom>
                      Study Environment
                    </Typography>
                    <ToggleButtonGroup
                      value={filters.studyType}
                      exclusive
                      onChange={(e, val) => val && setFilters({ ...filters, studyType: val })}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="all">All</ToggleButton>
                      <ToggleButton value="silent">Silent</ToggleButton>
                      <ToggleButton value="moderate">Moderate</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" gutterBottom>
                      Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {allAmenities.map(amenity => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          size="small"
                          onClick={() => {
                            setFilters({
                              ...filters,
                              amenities: filters.amenities.includes(amenity)
                                ? filters.amenities.filter(a => a !== amenity)
                                : [...filters.amenities, amenity]
                            });
                          }}
                          color={filters.amenities.includes(amenity) ? 'primary' : 'default'}
                          variant={filters.amenities.includes(amenity) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" gutterBottom>
                      Popular for Exam Prep
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {['all', 'UPSC', 'JEE', 'NEET', 'SSC', 'Banking'].map(exam => (
                        <Chip
                          key={exam}
                          label={exam}
                          size="small"
                          onClick={() => setFilters({ ...filters, examPrep: exam })}
                          color={filters.examPrep === exam ? 'primary' : 'default'}
                          variant={filters.examPrep === exam ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        {/* Libraries Grid */}
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {filteredLibraries.map((library) => (
              <Grid item xs={12} sm={6} md={4} key={library.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => navigate(`/libraries/${library.id}`)}
                >
                  {/* Library Image */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={library.imageUrl}
                      alt={library.name}
                    />
                    
                    {/* Favorite Button */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'white' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(library.id);
                      }}
                    >
                      {library.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                    </IconButton>

                    {/* Availability Badge */}
                    <Chip
                      label={library.openNow ? 'Open Now' : 'Closed'}
                      size="small"
                      color={library.openNow ? 'success' : 'error'}
                      sx={{ position: 'absolute', top: 8, left: 8 }}
                    />

                    {/* Verified Badge */}
                    {library.isVerified && (
                      <Chip
                        icon={<Verified fontSize="small" />}
                        label="Verified"
                        size="small"
                        sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'white', fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Library Name & Rating */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: 16 }}>
                      {library.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Rating value={library.rating} readOnly precision={0.1} size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {library.rating} ({library.reviewCount})
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: 13, lineHeight: 1.4 }}>
                      {library.description.substring(0, 80)}...
                    </Typography>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {library.distance}km • {library.city}
                      </Typography>
                    </Box>

                    {/* Exam Tags */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                      {library.popularWith.map(exam => (
                        <Chip 
                          key={exam} 
                          label={exam} 
                          size="small" 
                          sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark' }}
                        />
                      ))}
                      <Chip 
                        label={library.studyEnvironment} 
                        size="small" 
                        sx={{ height: 20, fontSize: 10 }}
                        color={library.studyEnvironment === 'Silent' ? 'success' : 'default'}
                      />
                    </Box>

                    {/* Amenities */}
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                      {library.amenities.slice(0, 4).map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          size="small"
                          sx={{ height: 20, fontSize: 10 }}
                          variant="outlined"
                        />
                      ))}
                      {library.amenities.length > 4 && (
                        <Chip label={`+${library.amenities.length - 4}`} size="small" sx={{ height: 20, fontSize: 10 }} />
                      )}
                    </Box>

                    {/* Seats & Price */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box>
                        <Typography variant="caption" color={library.availableSeats > 20 ? 'success.main' : 'warning.main'} fontWeight="600">
                          {library.availableSeats}/{library.totalSeats} Available
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          ₹{library.dailyRate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per day
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredLibraries.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <LibraryBooks sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No libraries found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your filters or search terms
            </Typography>
            <Button variant="contained" onClick={() => {
              setFilters({
                maxDistance: 10,
                minRating: 0,
                maxPrice: 500,
                amenities: [],
                studyType: 'all',
                examPrep: 'all',
              });
              setSearchTerm('');
            }}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </StudyFocusedLayout>
  );
}

function LibraryBooks(props: any) {
  return <Search {...props} />;
}

