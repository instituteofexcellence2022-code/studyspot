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
  CircularProgress,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  FilterList,
  Map as MapIcon,
  ViewList,
  Favorite,
  FavoriteBorder,
  Wifi,
  AcUnit,
  LocalParking,
  Restaurant,
  ExpandMore,
} from '@mui/icons-material';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';

interface LibrariesPageEnhancedProps {
  setIsAuthenticated: (value: boolean) => void;
}

interface Library {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount?: number;
  hourlyRate: number;
  imageUrl: string;
  amenities?: string[];
  distance?: number;
  availableSeats?: number;
  totalSeats?: number;
  latitude?: number;
  longitude?: number;
  isFavorite?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 19.0760, // Mumbai
  lng: 72.8777,
};

export default function LibrariesPageEnhanced({ setIsAuthenticated }: LibrariesPageEnhancedProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  
  // Filters
  const [filters, setFilters] = useState({
    city: 'all',
    priceRange: [0, 200],
    distance: 10,
    rating: 0,
    amenities: [] as string[],
    availability: false,
  });

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const cities = ['all', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'];
  const allAmenities = ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Printer', 'Locker'];

  useEffect(() => {
    fetchLibraries();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [libraries, searchTerm, filters]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied, using default');
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchLibraries = async () => {
    try {
      const response = await api.get('/api/libraries');
      const librariesData = response.data.data || [];
      
      // Calculate distances
      const librariesWithDistance = librariesData.map((lib: any) => ({
        ...lib,
        latitude: lib.latitude || (19.0760 + Math.random() * 0.1),
        longitude: lib.longitude || (72.8777 + Math.random() * 0.1),
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          lib.latitude || 19.0760,
          lib.longitude || 72.8777
        ),
      }));

      setLibraries(librariesWithDistance);
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      // Mock data with coordinates
      setLibraries([
        {
          id: 1,
          name: 'Central Library',
          description: 'Modern study space with AC and WiFi',
          address: 'Downtown, City Center',
          city: 'Mumbai',
          rating: 4.5,
          reviewCount: 124,
          hourlyRate: 50,
          imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400',
          amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria'],
          availableSeats: 45,
          totalSeats: 100,
          latitude: 19.0760,
          longitude: 72.8777,
          distance: 2.5,
          isFavorite: false,
        },
        {
          id: 2,
          name: 'Tech Hub Library',
          description: 'IT focused library with latest resources',
          address: 'Tech Park, Phase 1',
          city: 'Bangalore',
          rating: 4.8,
          reviewCount: 89,
          hourlyRate: 75,
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
          amenities: ['WiFi', 'AC', 'Printer', 'Locker'],
          availableSeats: 30,
          totalSeats: 80,
          latitude: 19.0860,
          longitude: 72.8877,
          distance: 3.2,
          isFavorite: true,
        },
        {
          id: 3,
          name: 'Green Study Center',
          description: 'Peaceful environment with garden view',
          address: 'Green Avenue',
          city: 'Pune',
          rating: 4.3,
          reviewCount: 56,
          hourlyRate: 40,
          imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
          amenities: ['WiFi', 'Cafeteria'],
          availableSeats: 20,
          totalSeats: 60,
          latitude: 19.0660,
          longitude: 72.8677,
          distance: 1.8,
          isFavorite: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...libraries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((lib) =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // City filter
    if (filters.city !== 'all') {
      filtered = filtered.filter((lib) => lib.city === filters.city);
    }

    // Price filter
    filtered = filtered.filter(
      (lib) => lib.hourlyRate >= filters.priceRange[0] && lib.hourlyRate <= filters.priceRange[1]
    );

    // Distance filter
    filtered = filtered.filter((lib) => (lib.distance || 0) <= filters.distance);

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter((lib) => lib.rating >= filters.rating);
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((lib) =>
        filters.amenities.every((amenity) => lib.amenities?.includes(amenity))
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter((lib) => (lib.availableSeats || 0) > 0);
    }

    // Sort by distance
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredLibraries(filtered);
  };

  const toggleFavorite = async (libraryId: number) => {
    try {
      await api.post(`/libraries/${libraryId}/favorite`);
      setLibraries(libraries.map(lib => 
        lib.id === libraryId ? { ...lib, isFavorite: !lib.isFavorite } : lib
      ));
    } catch (error) {
      console.error('Failed to toggle favorite');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'WiFi': return <Wifi fontSize="small" />;
      case 'AC': return <AcUnit fontSize="small" />;
      case 'Parking': return <LocalParking fontSize="small" />;
      case 'Cafeteria': return <Restaurant fontSize="small" />;
      default: return null;
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

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Discover Libraries 📚
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewList /> List
            </ToggleButton>
            <ToggleButton value="map">
              <MapIcon /> Map
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search by name, city, or area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, bgcolor: 'white', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Advanced Filters */}
        <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)} sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              <Typography>Advanced Filters</Typography>
              <Badge badgeContent={
                (filters.city !== 'all' ? 1 : 0) +
                (filters.rating > 0 ? 1 : 0) +
                filters.amenities.length +
                (filters.availability ? 1 : 0)
              } color="primary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>City</InputLabel>
                  <Select
                    value={filters.city}
                    label="City"
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city === 'all' ? 'All Cities' : city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography gutterBottom>Price Range: ₹{filters.priceRange[0]}-₹{filters.priceRange[1]}/hr</Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => setFilters({ ...filters, priceRange: newValue as number[] })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={200}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography gutterBottom>Distance: {filters.distance} km</Typography>
                <Slider
                  value={filters.distance}
                  onChange={(e, newValue) => setFilters({ ...filters, distance: newValue as number })}
                  valueLabelDisplay="auto"
                  min={1}
                  max={50}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography gutterBottom>Minimum Rating</Typography>
                <Rating
                  value={filters.rating}
                  onChange={(e, newValue) => setFilters({ ...filters, rating: newValue || 0 })}
                  precision={0.5}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography gutterBottom>Amenities</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allAmenities.map((amenity) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      icon={getAmenityIcon(amenity)}
                      onClick={() => {
                        const newAmenities = filters.amenities.includes(amenity)
                          ? filters.amenities.filter((a) => a !== amenity)
                          : [...filters.amenities, amenity];
                        setFilters({ ...filters, amenities: newAmenities });
                      }}
                      color={filters.amenities.includes(amenity) ? 'primary' : 'default'}
                      variant={filters.amenities.includes(amenity) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Chip
                  label="Show only available"
                  onClick={() => setFilters({ ...filters, availability: !filters.availability })}
                  color={filters.availability ? 'success' : 'default'}
                  variant={filters.availability ? 'filled' : 'outlined'}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Found {filteredLibraries.length} libraries
        </Typography>

        {viewMode === 'list' ? (
          /* List View */
          <Grid container spacing={3}>
            {filteredLibraries.map((library) => (
              <Grid item xs={12} sm={6} md={4} key={library.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                  onClick={() => navigate(`/libraries/${library.id}`)}
                >
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', zIndex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(library.id);
                    }}
                  >
                    {library.isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </IconButton>

                  {library.availableSeats !== undefined && (
                    <Chip
                      label={`${library.availableSeats}/${library.totalSeats} seats`}
                      size="small"
                      color={library.availableSeats > 10 ? 'success' : 'warning'}
                      sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                    />
                  )}

                  <CardMedia
                    component="img"
                    height="180"
                    image={library.imageUrl}
                    alt={library.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {library.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={library.rating} readOnly precision={0.1} size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {library.rating} ({library.reviewCount} reviews)
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {library.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {library.distance?.toFixed(1)} km • {library.city}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {library.amenities?.slice(0, 3).map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          size="small"
                          icon={getAmenityIcon(amenity)}
                        />
                      ))}
                    </Box>

                    <Chip
                      label={`₹${library.hourlyRate}/hour`}
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* Map View */
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo-key'}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={userLocation}
              zoom={12}
            >
              {filteredLibraries.map((library) => (
                <Marker
                  key={library.id}
                  position={{ lat: library.latitude || 0, lng: library.longitude || 0 }}
                  onClick={() => setSelectedLibrary(library)}
                />
              ))}

              {selectedLibrary && (
                <InfoWindow
                  position={{
                    lat: selectedLibrary.latitude || 0,
                    lng: selectedLibrary.longitude || 0,
                  }}
                  onCloseClick={() => setSelectedLibrary(null)}
                >
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedLibrary.name}
                    </Typography>
                    <Rating value={selectedLibrary.rating} readOnly size="small" />
                    <Typography variant="body2" sx={{ my: 1 }}>
                      ₹{selectedLibrary.hourlyRate}/hour
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate(`/libraries/${selectedLibrary.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}

        {filteredLibraries.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No libraries found matching your filters
            </Typography>
            <Button onClick={() => setFilters({
              city: 'all',
              priceRange: [0, 200],
              distance: 10,
              rating: 0,
              amenities: [],
              availability: false,
            })} sx={{ mt: 2 }}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

