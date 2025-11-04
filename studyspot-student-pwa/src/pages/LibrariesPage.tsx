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
  Alert,
  Snackbar,
} from '@mui/material';
import { Search, LocationOn, Star, Wifi, WifiOff } from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';

interface LibrariesPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LibrariesPage({ setIsAuthenticated }: LibrariesPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'info' | 'warning' }>({ 
    open: false, 
    message: '', 
    type: 'info' 
  });

  // 🔴 NEW: Real-time WebSocket connection
  const { socket, connected } = useSocket('student');

  useEffect(() => {
    fetchLibraries();
  }, []);

  // 🔴 NEW: Real-time event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    console.log('📡 [Libraries] Setting up real-time listeners');

    // New library created
    socket.on('library:created', (newLibrary) => {
      console.log('🔔 [Real-time] New library:', newLibrary);
      
      setLibraries((prev) => [newLibrary, ...prev]);
      
      setNotification({
        open: true,
        message: `New library available: ${newLibrary.name}!`,
        type: 'success',
      });
    });

    // Library updated
    socket.on('library:updated', (updatedLibrary) => {
      console.log('🔔 [Real-time] Library updated:', updatedLibrary);
      
      setLibraries((prev) =>
        prev.map((lib) => (lib.id === updatedLibrary.id ? updatedLibrary : lib))
      );
      
      setNotification({
        open: true,
        message: `${updatedLibrary.name} has been updated!`,
        type: 'info',
      });
    });

    // Library deleted
    socket.on('library:deleted', (data) => {
      console.log('🔔 [Real-time] Library deleted:', data.id);
      
      setLibraries((prev) => prev.filter((lib) => lib.id !== data.id));
      
      setNotification({
        open: true,
        message: 'A library is no longer available',
        type: 'warning',
      });
    });

    // Pricing updated
    socket.on('pricing:updated', (data) => {
      console.log('🔔 [Real-time] Pricing updated:', data);
      
      setLibraries((prev) =>
        prev.map((lib) =>
          lib.id === data.libraryId
            ? { ...lib, pricing: data.pricing, hourlyRate: data.pricing?.hourlyRate || lib.hourlyRate }
            : lib
        )
      );
      
      setNotification({
        open: true,
        message: '💰 Pricing has been updated!',
        type: 'info',
      });
    });

    // Cleanup
    return () => {
      console.log('🔌 [Libraries] Cleaning up real-time listeners');
      socket.off('library:created');
      socket.off('library:updated');
      socket.off('library:deleted');
      socket.off('pricing:updated');
    };
  }, [socket, connected]);

  const fetchLibraries = async () => {
    try {
      const response = await api.get('/api/libraries');
      setLibraries(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      // Use mock data if API fails
      setLibraries([
        {
          id: 1,
          name: 'Central Library',
          description: 'Modern study space with AC and WiFi',
          address: 'Downtown, City Center',
          city: 'Mumbai',
          rating: 4.5,
          hourlyRate: 50,
          imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400',
        },
        {
          id: 2,
          name: 'Tech Hub Library',
          description: 'IT focused library with latest resources',
          address: 'Tech Park, Phase 1',
          city: 'Bangalore',
          rating: 4.8,
          hourlyRate: 75,
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        },
        {
          id: 3,
          name: 'Green Study Center',
          description: 'Peaceful environment with garden view',
          address: 'Green Avenue',
          city: 'Pune',
          rating: 4.3,
          hourlyRate: 40,
          imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLibraries = libraries.filter((lib) =>
    lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Container maxWidth="lg">
        {/* Header with Connection Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Browse Libraries 📚
          </Typography>
          
          {connected && (
            <Chip
              icon={<Wifi />}
              label="Live Updates"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Real-time Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.type}
            sx={{ width: '100%', fontWeight: 600 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        <TextField
          fullWidth
          placeholder="Search by name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4, bgcolor: 'white', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

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
                }}
                onClick={() => navigate(`/libraries/${library.id}`)}
              >
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
                    <Star sx={{ color: '#f59e0b', fontSize: 18, mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {library.rating}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {library.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {library.address}, {library.city}
                    </Typography>
                  </Box>

                  <Chip
                    label={`₹${library.hourlyRate}/hour`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredLibraries.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No libraries found
            </Typography>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

