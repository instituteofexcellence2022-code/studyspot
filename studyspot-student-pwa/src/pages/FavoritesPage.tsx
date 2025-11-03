import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Chip,
  Button,
  Tabs,
  Tab,
  Rating,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  Phone,
  Schedule,
  Chair,
  Delete,
  NavigateBefore,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

interface FavoriteLibrary {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  totalSeats: number;
  availableSeats: number;
  pricePerDay: number;
  imageUrl: string;
  amenities: string[];
}

interface FavoriteSeat {
  id: string;
  libraryName: string;
  libraryId: string;
  seatNumber: string;
  zone: string;
  type: string;
  addedOn: string;
}

export default function FavoritesPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [favoriteLibraries, setFavoriteLibraries] = useState<FavoriteLibrary[]>([]);
  const [favoriteSeats, setFavoriteSeats] = useState<FavoriteSeat[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const librariesRes = await api.get('/api/favorites/libraries');
      const seatsRes = await api.get('/api/favorites/seats');
      
      setFavoriteLibraries(librariesRes.data.data || mockLibraries);
      setFavoriteSeats(seatsRes.data.data || mockSeats);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavoriteLibraries(mockLibraries);
      setFavoriteSeats(mockSeats);
    }
  };

  const mockLibraries: FavoriteLibrary[] = [
    {
      id: '1',
      name: 'Central Library',
      address: 'MG Road, Bangalore',
      distance: 1.2,
      rating: 4.5,
      totalSeats: 150,
      availableSeats: 45,
      pricePerDay: 150,
      imageUrl: 'https://via.placeholder.com/400x250?text=Central+Library',
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria'],
    },
    {
      id: '2',
      name: 'Knowledge Hub',
      address: 'Koramangala, Bangalore',
      distance: 2.5,
      rating: 4.7,
      totalSeats: 200,
      availableSeats: 78,
      pricePerDay: 180,
      imageUrl: 'https://via.placeholder.com/400x250?text=Knowledge+Hub',
      amenities: ['WiFi', 'AC', '24/7', 'Locker'],
    },
  ];

  const mockSeats: FavoriteSeat[] = [
    {
      id: '1',
      libraryName: 'Central Library',
      libraryId: '1',
      seatNumber: 'A-12',
      zone: 'Silent Zone',
      type: 'Individual',
      addedOn: '2024-10-25',
    },
    {
      id: '2',
      libraryName: 'Knowledge Hub',
      libraryId: '2',
      seatNumber: 'B-07',
      zone: 'AC Zone',
      type: 'Premium',
      addedOn: '2024-10-28',
    },
  ];

  const handleRemoveLibrary = async (libraryId: string) => {
    try {
      await api.delete(`/api/favorites/libraries/${libraryId}`);
      setFavoriteLibraries(favoriteLibraries.filter(l => l.id !== libraryId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      setFavoriteLibraries(favoriteLibraries.filter(l => l.id !== libraryId));
    }
  };

  const handleRemoveSeat = async (seatId: string) => {
    try {
      await api.delete(`/api/favorites/seats/${seatId}`);
      setFavoriteSeats(favoriteSeats.filter(s => s.id !== seatId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      setFavoriteSeats(favoriteSeats.filter(s => s.id !== seatId));
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ❤️ My Favorites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quick access to your favorite libraries and seats
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`Favorite Libraries (${favoriteLibraries.length})`} />
          <Tab label={`Favorite Seats (${favoriteSeats.length})`} />
        </Tabs>

        {/* Favorite Libraries Tab */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {favoriteLibraries.map((library) => (
              <Grid item xs={12} md={6} key={library.id}>
                <Card sx={{ display: 'flex', '&:hover': { boxShadow: 6 } }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 200, objectFit: 'cover' }}
                    image={library.imageUrl}
                    alt={library.name}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight="600">
                          {library.name}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveLibrary(library.id)}
                        >
                          <Favorite />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {library.address} • {library.distance} km
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={library.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          ({library.rating})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {library.amenities.slice(0, 3).map((amenity) => (
                          <Chip key={amenity} label={amenity} size="small" />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="success.main" fontWeight="600">
                          {library.availableSeats}/{library.totalSeats} Available
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          ₹{library.pricePerDay}/day
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/libraries/${library.id}`)}
                        >
                          Book Now
                        </Button>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveLibrary(library.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}

            {favoriteLibraries.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No favorite libraries yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Browse libraries and click the heart icon to add favorites
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/libraries')}>
                    Explore Libraries
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* Favorite Seats Tab */}
        {tab === 1 && (
          <Grid container spacing={2}>
            {favoriteSeats.map((seat) => (
              <Grid item xs={12} sm={6} md={4} key={seat.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chair color="primary" sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant="h6" fontWeight="600">
                            Seat {seat.seatNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {seat.libraryName}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveSeat(seat.id)}
                      >
                        <Favorite />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={seat.zone} size="small" color="primary" />
                      <Chip label={seat.type} size="small" variant="outlined" />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Added: {new Date(seat.addedOn).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/libraries/${seat.libraryId}`)}
                      >
                        Book This Seat
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveSeat(seat.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {favoriteSeats.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Chair sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No favorite seats yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    When booking, click the heart icon to save your preferred seats
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/libraries')}>
                    Browse Libraries
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}

