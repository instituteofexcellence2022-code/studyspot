import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  alpha,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Wifi,
  FilterList,
  TuneRounded,
  FavoriteBorder,
  Favorite,
  ArrowForward,
  LocalFireDepartment,
  TrendingUp,
  Verified,
  AutoAwesome,
  Speed,
  EventAvailable,
} from '@mui/icons-material';
import MobileLayout from '../components/MobileLayout';
import { advancedGradients, glassEffects, advancedAnimations } from '../theme/premiumTheme';
import api from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useLanguage } from '../contexts/LanguageContext';

interface LibrariesPremiumProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function LibrariesPremium({ setIsAuthenticated }: LibrariesPremiumProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [libraries, setLibraries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3]));

  const { socket, connected } = useSocket('student');

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('library:created', (newLibrary) => {
      setLibraries((prev) => [newLibrary, ...prev]);
    });

    socket.on('library:updated', (updatedLibrary) => {
      setLibraries((prev) =>
        prev.map((lib) => (lib.id === updatedLibrary.id ? updatedLibrary : lib))
      );
    });

    socket.on('library:deleted', (data) => {
      setLibraries((prev) => prev.filter((lib) => lib.id !== data.id));
    });

    return () => {
      socket.off('library:created');
      socket.off('library:updated');
      socket.off('library:deleted');
    };
  }, [socket, connected]);

  const fetchLibraries = async () => {
    try {
      const response = await api.get('/api/libraries');
      setLibraries(response.data.data || mockLibraries);
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
      setLibraries(mockLibraries);
    } finally {
      setTimeout(() => setLoading(false), 800); // Slight delay for smooth loading
    }
  };

  const mockLibraries = [
    {
      id: 1,
      name: 'Central Library',
      description: 'Modern study space with AC and high-speed WiFi',
      address: 'Downtown, City Center',
      city: 'Mumbai',
      rating: 4.8,
      reviewCount: 234,
      hourlyRate: 50,
      totalSeats: 120,
      availableSeats: 45,
      amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria'],
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800',
      featured: true,
      verified: true,
    },
    {
      id: 2,
      name: 'Tech Hub Library',
      description: 'IT focused library with latest tech resources',
      address: 'Tech Park, Phase 1',
      city: 'Bangalore',
      rating: 4.9,
      reviewCount: 456,
      hourlyRate: 75,
      totalSeats: 80,
      availableSeats: 12,
      amenities: ['WiFi', 'AC', 'Cafeteria', 'Private Rooms'],
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      featured: true,
      verified: true,
    },
    {
      id: 3,
      name: 'Green Study Center',
      description: 'Peaceful environment with garden view',
      address: 'Green Avenue',
      city: 'Pune',
      rating: 4.6,
      reviewCount: 189,
      hourlyRate: 40,
      totalSeats: 60,
      availableSeats: 30,
      amenities: ['WiFi', 'Garden', 'Parking'],
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      verified: false,
    },
    {
      id: 4,
      name: 'Elite Study Lounge',
      description: 'Premium workspace with private cabins',
      address: 'Business District',
      city: 'Mumbai',
      rating: 4.95,
      reviewCount: 567,
      hourlyRate: 100,
      totalSeats: 50,
      availableSeats: 5,
      amenities: ['WiFi', 'AC', 'Private Cabin', 'Cafeteria', 'Parking'],
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
      featured: true,
      verified: true,
    },
  ];

  const toggleFavorite = (libraryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(libraryId)) {
        newFavorites.delete(libraryId);
      } else {
        newFavorites.add(libraryId);
      }
      return newFavorites;
    });
  };

  const filteredLibraries = libraries
    .filter(
      (lib) =>
        lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lib.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((lib) => {
      if (selectedFilter === 'favorites') return favorites.has(lib.id);
      if (selectedFilter === 'available') return lib.availableSeats / lib.totalSeats > 0.3;
      if (selectedFilter === 'top-rated') return lib.rating >= 4.7;
      if (selectedFilter === 'featured') return lib.featured;
      return true;
    });

  const getAvailabilityStatus = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return { color: '#10b981', text: 'Great', icon: '✨' };
    if (ratio > 0.2) return { color: '#f59e0b', text: 'Limited', icon: '⚡' };
    return { color: '#ef4444', text: 'Few Left', icon: '🔥' };
  };

  if (loading) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2.5, mb: 2 }} />
            <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2.5 }} />
          </Box>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={300}
              sx={{ borderRadius: 4, mb: 2 }}
              animation="wave"
            />
          ))}
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ position: 'relative' }}>
        {/* Decorative blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 200,
            height: 200,
            background: advancedGradients.lavender,
            borderRadius: '50%',
            opacity: 0.2,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    background: advancedGradients.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {t('nav.libraries')}
                </Typography>
                <AutoAwesome sx={{ fontSize: 28, color: '#f59e0b' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {filteredLibraries.length} {t('libraries.placesToStudy')}
              </Typography>
            </Box>

            {connected && (
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha('#10b981', 0.12)}, ${alpha(
                    '#14b8a6',
                    0.12
                  )})`,
                  border: `1px solid ${alpha('#10b981', 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    ...advancedAnimations.breathe,
                  }}
                />
                <Typography variant="caption" fontWeight={700} sx={{ color: '#10b981' }}>
                  {t('libraries.live')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Premium search */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <TextField
              fullWidth
              placeholder={t('libraries.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.938rem',
                  fontWeight: 500,
                  background: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 20px rgba(99,102,241,0.15)',
                    borderColor: '#6366f1',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6366f1', fontSize: 22 }} />
                  </InputAdornment>
                ),
              }}
            />

            <IconButton
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              sx={{
                background: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)',
                width: 48,
                height: 48,
                borderRadius: 2,
                '&:hover': {
                  background: 'white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Badge variant="dot" color="primary" invisible={selectedFilter === 'all'}>
                <TuneRounded sx={{ color: '#6366f1' }} />
              </Badge>
            </IconButton>
          </Box>

          {/* Filter chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              { label: t('libraries.filterAll'), value: 'all', icon: '🎯' },
              { label: t('libraries.filterFeatured'), value: 'featured', icon: '⭐' },
              { label: t('libraries.filterTopRated'), value: 'top-rated', icon: '🏆' },
              { label: t('libraries.available'), value: 'available', icon: '✅' },
              { label: t('nav.favorites'), value: 'favorites', icon: '❤️' },
            ].map((filter) => (
              <Chip
                key={filter.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </Box>
                }
                onClick={() => setSelectedFilter(filter.value)}
                sx={{
                  height: 32,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderRadius: 1.5,
                  ...(selectedFilter === filter.value
                    ? {
                        background: advancedGradients.primary,
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                      }
                    : {
                        bgcolor: 'white',
                        color: 'text.primary',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        '&:hover': {
                          bgcolor: alpha('#6366f1', 0.08),
                        },
                      }),
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Premium library cards */}
        {filteredLibraries.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredLibraries.map((library, index) => {
              const isFavorite = favorites.has(library.id);
              const availability = getAvailabilityStatus(library.availableSeats, library.totalSeats);
              const availabilityPercent = Math.round(
                (library.availableSeats / library.totalSeats) * 100
              );

              return (
                <Box
                  key={library.id}
                  onClick={() => navigate(`/libraries/${library.id}`)}
                  sx={{
                    background: 'white',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(30px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.01)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  {/* Premium image section */}
                  <Box
                    sx={{
                      height: 180,
                      backgroundImage: `url(${library.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Gradient overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                      }}
                    />

                    {/* Featured badge */}
                    {library.featured && (
                      <Chip
                        icon={<LocalFireDepartment sx={{ fontSize: 16 }} />}
                        label={t('libraries.filterFeatured')}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          height: 28,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          background: advancedGradients.warning,
                          color: 'white',
                          border: '2px solid white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                      />
                    )}

                    {/* Favorite button with premium effect */}
                    <IconButton
                      onClick={(e) => toggleFavorite(library.id, e)}
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 44,
                        height: 44,
                        ...glassEffects.light,
                        border: '2px solid rgba(255,255,255,0.5)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          background: 'rgba(255,255,255,0.95)',
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                      }}
                    >
                      {isFavorite ? (
                        <Favorite sx={{ fontSize: 22, color: '#ef4444' }} />
                      ) : (
                        <FavoriteBorder sx={{ fontSize: 22, color: '#64748b' }} />
                      )}
                    </IconButton>

                    {/* Premium availability indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ...glassEffects.light,
                        borderRadius: 1.5,
                        p: 1.5,
                        border: '1px solid rgba(255,255,255,0.5)',
                      }}
                    >
                      <Speed sx={{ fontSize: 20, color: availability.color }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                          <Typography variant="caption" fontWeight={800} color="white">
                            {availability.icon} {library.availableSeats} / {library.totalSeats} {t('libraries.available')}
                          </Typography>
                          <Chip
                            label={availability.text}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.688rem',
                              fontWeight: 800,
                              bgcolor: alpha(availability.color, 0.2),
                              color: 'white',
                              border: `1px solid ${alpha(availability.color, 0.3)}`,
                            }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={availabilityPercent}
                          sx={{
                            height: 5,
                            borderRadius: 1,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: availability.color,
                              borderRadius: 1,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Content section */}
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ flex: 1, pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                          <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.125rem' }}>
                            {library.name}
                          </Typography>
                          {library.verified && (
                            <Verified sx={{ fontSize: 18, color: '#6366f1' }} />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Star sx={{ fontSize: 16, color: '#f59e0b' }} />
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {library.rating}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({library.reviewCount})
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 14 }} />
                            {library.city}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Premium price display */}
                      <Box
                        sx={{
                        px: 2,
                        py: 1.25,
                        borderRadius: 1.5,
                        background: advancedGradients.primary,
                          color: 'white',
                          textAlign: 'center',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        }}
                      >
                        <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1 }}>
                          ₹{library.hourlyRate}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.625rem' }}>
                          /hour
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontWeight: 500,
                      }}
                    >
                      {library.description}
                    </Typography>

                    {/* Premium amenities */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                      {library.amenities.slice(0, 4).map((amenity: string, i: number) => (
                        <Chip
                          key={i}
                          label={amenity}
                          size="small"
                          sx={{
                            height: 26,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor: alpha('#6366f1', 0.08),
                            color: '#6366f1',
                            border: `1px solid ${alpha('#6366f1', 0.15)}`,
                          }}
                        />
                      ))}
                      {library.amenities.length > 4 && (
                        <Chip
                          label={`+${library.amenities.length - 4} more`}
                          size="small"
                          sx={{
                            height: 26,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor: alpha('#64748b', 0.08),
                            color: '#64748b',
                          }}
                        />
                      )}
                    </Box>

                    {/* Action button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14 }} />
                        <span className="truncate" style={{ maxWidth: 180 }}>
                          {library.address}
                        </span>
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#6366f1',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        <span>{t('libraries.viewDetails')}</span>
                        <ArrowForward sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              ...glassEffects.light,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: advancedGradients.lavender,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                fontSize: '3rem',
              }}
            >
              🔍
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
              {t('libraries.noLibrariesFound')}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {t('libraries.tryAdjusting')}
            </Typography>
          </Box>
        )}
      </Box>
    </MobileLayout>
  );
}

