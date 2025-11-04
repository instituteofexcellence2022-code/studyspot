/**
 * 🪑 SEAT BOOKING PAGE - STUDENT PORTAL
 * 
 * Enhanced seat booking experience with:
 * - Visual seat map with zones
 * - Detailed seat information
 * - Real-time availability updates
 * - Multiple pricing options
 * - Filter by amenities
 * - Booking flow
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Badge,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  EventSeat,
  VolumeOff,
  Groups,
  MenuBook,
  Window as WindowIcon,
  Power,
  Wifi,
  LocalLibrary,
  Business,
  LockOpen,
  WbSunny,
  AcUnit,
  Close,
  Check,
  Info,
  FilterList,
  ShoppingCart,
  EventAvailable,
  ChairAlt,
  Favorite,
  FavoriteBorder,
  ZoomIn,
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';

interface SeatBookingPageProps {
  darkMode?: boolean;
  setDarkMode?: (value: boolean) => void;
  libraryId?: string;
  libraryName?: string;
  embedded?: boolean; // When used inside library details
}

interface LibrarySeat {
  id: string;
  row: string;
  number: number;
  zone: 'silent' | 'reading' | 'discussion' | 'exam-prep' | 'premium';
  deskType: 'individual' | 'double' | 'group';
  status: 'available' | 'occupied' | 'selected' | 'blocked';
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  features: {
    window: boolean;
    power: boolean;
    wifi: boolean;
    locker: boolean;
    ac: boolean;
    naturalLight: boolean;
    cushionedChair: boolean;
  };
  capacity: number;
  libraryName?: string;
}

const SeatBookingPage: React.FC<SeatBookingPageProps> = ({ darkMode, setDarkMode, libraryId, libraryName, embedded = false }) => {
  const [seats, setSeats] = useState<LibrarySeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingDuration, setBookingDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [favoriteSeats, setFavoriteSeats] = useState<string[]>([]);
  const [layoutCreated, setLayoutCreated] = useState(false);
  
  // Amenity filters
  const [filters, setFilters] = useState({
    window: false,
    power: false,
    locker: false,
    ac: false,
    naturalLight: false,
    cushionedChair: false,
  });

  // 🔴 Real-time connection
  const { socket, connected } = useSocket('student');

  const zoneConfig = {
    'silent': {
      label: 'Silent Study Zone',
      icon: <VolumeOff />,
      color: '#2196F3',
      description: 'Zero noise, individual study',
      hourly: 20,
      daily: 150,
      weekly: 800,
      monthly: 2500,
    },
    'reading': {
      label: 'Reading Zone',
      icon: <MenuBook />,
      color: '#4CAF50',
      description: 'Quiet reading area',
      hourly: 15,
      daily: 120,
      weekly: 650,
      monthly: 2000,
    },
    'discussion': {
      label: 'Discussion Zone',
      icon: <Groups />,
      color: '#FF9800',
      description: 'Group study & discussions',
      hourly: 25,
      daily: 180,
      weekly: 950,
      monthly: 3000,
    },
    'exam-prep': {
      label: 'Exam Preparation',
      icon: <LocalLibrary />,
      color: '#9C27B0',
      description: 'Focused exam preparation',
      hourly: 30,
      daily: 200,
      weekly: 1100,
      monthly: 3500,
    },
    'premium': {
      label: 'Premium Executive',
      icon: <Business />,
      color: '#FFD700',
      description: 'All amenities included',
      hourly: 50,
      daily: 350,
      weekly: 1800,
      monthly: 5000,
    },
  };

  // Create library layout
  const createLibraryLayout = () => {
    const newSeats: LibrarySeat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 12;

    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        // Skip for aisle (6-7)
        if (seatNum === 6 || seatNum === 7) continue;

        let zone: 'silent' | 'reading' | 'discussion' | 'exam-prep' | 'premium' = 'reading';
        let deskType: 'individual' | 'double' | 'group' = 'individual';
        let capacity = 1;

        // Zone distribution
        if (rowIndex < 2) {
          zone = 'premium';
        } else if (rowIndex >= 2 && rowIndex < 4) {
          zone = 'silent';
        } else if (rowIndex >= 4 && rowIndex < 6) {
          zone = 'exam-prep';
        } else if (rowIndex >= 6 && rowIndex < 8) {
          zone = 'discussion';
          if (seatNum % 3 === 0) {
            deskType = 'double';
            capacity = 2;
          }
        } else {
          zone = 'reading';
        }

        const hasWindow = seatNum === 1 || seatNum === seatsPerRow;
        const hasNaturalLight = rowIndex < 3 || hasWindow;
        const hasPower = seatNum % 2 === 0;
        const hasAC = ['premium', 'silent', 'exam-prep'].includes(zone);
        const hasLocker = ['premium', 'exam-prep'].includes(zone);
        const hasCushionedChair = ['premium', 'exam-prep', 'silent'].includes(zone);

        let status: 'available' | 'occupied' | 'selected' | 'blocked' = 'available';
        if (Math.random() > 0.82) {
          status = 'occupied';
        }

        const zonePrice = zoneConfig[zone];
        newSeats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          zone,
          deskType,
          status,
          pricing: {
            hourly: zonePrice.hourly,
            daily: zonePrice.daily,
            weekly: zonePrice.weekly,
            monthly: zonePrice.monthly,
          },
          features: {
            window: hasWindow,
            power: hasPower,
            wifi: true,
            locker: hasLocker,
            ac: hasAC,
            naturalLight: hasNaturalLight,
            cushionedChair: hasCushionedChair,
          },
          capacity,
          libraryName: libraryName || 'Central Study Hub',
        });
      }
    });

    setSeats(newSeats);
    setLayoutCreated(true);
  };

  // Real-time updates
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('seat:availability', (data) => {
      console.log('🔔 Seat availability changed:', data);
      setSeats(prev => prev.map(s => 
        s.id === data.seatId 
          ? { ...s, status: data.isAvailable ? 'available' : 'occupied' }
          : s
      ));
      toast.info(`Seat ${data.seatId} is now ${data.isAvailable ? 'available' : 'occupied'}`);
    });

    return () => {
      socket.off('seat:availability');
    };
  }, [socket, connected]);

  const handleSeatClick = useCallback((seat: LibrarySeat) => {
    if (seat.status === 'occupied' || seat.status === 'blocked') {
      toast.warning(`Seat ${seat.id} is not available`);
      return;
    }

    setSelectedSeat(seat);
  }, []);

  const handleToggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'available' as const } : s
      ));
    } else {
      setSelectedSeats(prev => [...prev, seatId]);
      setSeats(prev => prev.map(s => 
        s.id === seatId ? { ...s, status: 'selected' as const } : s
      ));
    }
  };

  const toggleFavorite = (seatId: string) => {
    setFavoriteSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
    toast.success(favoriteSeats.includes(seatId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const getSeatColor = (seat: LibrarySeat) => {
    if (seat.status === 'occupied') return '#757575';
    if (seat.status === 'selected') return '#1976D2';
    if (seat.status === 'blocked') return '#BDBDBD';
    return zoneConfig[seat.zone].color;
  };

  const getTotalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + (seat?.pricing[bookingDuration] || 0);
    }, 0);
  }, [selectedSeats, seats, bookingDuration]);

  const filteredSeats = useMemo(() => {
    let result = selectedZone === 'all' ? seats : seats.filter(s => s.zone === selectedZone);
    
    // Apply amenity filters
    if (filters.window) result = result.filter(s => s.features.window);
    if (filters.power) result = result.filter(s => s.features.power);
    if (filters.locker) result = result.filter(s => s.features.locker);
    if (filters.ac) result = result.filter(s => s.features.ac);
    if (filters.naturalLight) result = result.filter(s => s.features.naturalLight);
    if (filters.cushionedChair) result = result.filter(s => s.features.cushionedChair);
    
    return result;
  }, [seats, selectedZone, filters]);

  const stats = useMemo(() => ({
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    occupied: seats.filter(s => s.status === 'occupied').length,
    selected: selectedSeats.length,
  }), [seats, selectedSeats]);

  const rows = useMemo(() => 
    Array.from(new Set(filteredSeats.map(s => s.row))).sort(),
    [filteredSeats]
  );

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat');
      return;
    }
    setShowBookingDialog(true);
  };

  const confirmBooking = () => {
    toast.success(`🎉 ${selectedSeats.length} seat(s) booked successfully!`);
    setShowBookingDialog(false);
    setSelectedSeats([]);
    setSeats(prev => prev.map(s => 
      selectedSeats.includes(s.id) ? { ...s, status: 'occupied' as const } : s
    ));
  };

  if (!layoutCreated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: embedded ? '60vh' : '80vh',
        p: { xs: 2, sm: 3 }
      }}>
        <Card sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', maxWidth: 600, width: '100%' }}>
          <LocalLibrary sx={{ fontSize: { xs: 80, sm: 100 }, color: 'primary.main', mb: 2 }} />
          <Typography variant={{ xs: 'h5', sm: 'h4' } as any} gutterBottom>
            🪑 Seat Booking
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Find your perfect study spot! Book seats with amenities like window views, power outlets, AC, and more.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
            {Object.entries(zoneConfig).map(([key, zone]) => (
              <Chip key={key} icon={zone.icon} label={zone.label} size="small" />
            ))}
          </Stack>
          <Button
            variant="contained"
            size="large"
            onClick={createLibraryLayout}
            startIcon={<EventSeat />}
            sx={{ px: { xs: 4, sm: 6 }, py: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            fullWidth
          >
            View Available Seats
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: embedded ? 'transparent' : '#f5f5f5', minHeight: embedded ? 'auto' : '100vh', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e0e0e0', 
        p: { xs: 2, sm: 3 },
        display: embedded ? 'none' : 'block'
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Box>
            <Typography variant={{ xs: 'h5', sm: 'h4' } as any} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              🪑 Seat Booking
              {connected && (
                <Chip icon={<Wifi />} label="Live" color="success" size="small" />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              Select your ideal study spot at {libraryName || seats[0]?.libraryName}
            </Typography>
          </Box>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap" useFlexGap>
            <Chip label={`${stats.available} Available`} color="success" icon={<Check />} size="small" />
            <Chip label={`${stats.occupied} Occupied`} color="error" icon={<Close />} size="small" />
            {stats.selected > 0 && (
              <Chip label={`${stats.selected} Selected`} color="primary" icon={<EventSeat />} size="small" />
            )}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Controls */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
            {/* Duration Selection */}
            <ToggleButtonGroup
              value={bookingDuration}
              exclusive
              onChange={(e, val) => val && setBookingDuration(val)}
              size="small"
              fullWidth={embedded}
              sx={{ 
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiToggleButton-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <ToggleButton value="hourly">⏱️ Hourly</ToggleButton>
              <ToggleButton value="daily">📅 Daily</ToggleButton>
              <ToggleButton value="weekly">🗓️ Weekly</ToggleButton>
              <ToggleButton value="monthly">📆 Monthly</ToggleButton>
            </ToggleButtonGroup>

            {/* Zone Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }} fullWidth={embedded}>
              <InputLabel>Zone</InputLabel>
              <Select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                <MenuItem value="all">🌐 All Zones</MenuItem>
                <MenuItem value="silent">🤫 Silent Study</MenuItem>
                <MenuItem value="reading">📖 Reading</MenuItem>
                <MenuItem value="discussion">💬 Discussion</MenuItem>
                <MenuItem value="exam-prep">📝 Exam Prep</MenuItem>
                <MenuItem value="premium">⭐ Premium</MenuItem>
              </Select>
            </FormControl>

            {/* Amenity Filters */}
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>

            <Box sx={{ flex: 1 }} />

            {/* Book Button */}
            {selectedSeats.length > 0 && (
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleBooking}
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 }
                }}
                fullWidth={embedded}
              >
                Book {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} - ₹{getTotalPrice}
              </Button>
            )}
          </Stack>

          {/* Amenity Filters Panel */}
          {showFilters && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" gutterBottom>
                Filter by Amenities:
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox checked={filters.window} onChange={(e) => setFilters({...filters, window: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WindowIcon fontSize="small" /> Window</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={filters.power} onChange={(e) => setFilters({...filters, power: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Power fontSize="small" /> Power</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={filters.locker} onChange={(e) => setFilters({...filters, locker: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LockOpen fontSize="small" /> Locker</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={filters.ac} onChange={(e) => setFilters({...filters, ac: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AcUnit fontSize="small" /> AC</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={filters.naturalLight} onChange={(e) => setFilters({...filters, naturalLight: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WbSunny fontSize="small" /> Natural Light</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={filters.cushionedChair} onChange={(e) => setFilters({...filters, cushionedChair: e.target.checked})} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ChairAlt fontSize="small" /> Cushioned</Box>}
                />
              </FormGroup>
            </Box>
          )}
        </Paper>

        {/* Seat Map */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
          {/* Entrance */}
          <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                py: { xs: 1, sm: 1.5 }, 
                bgcolor: '#1976D2', 
                color: 'white',
                borderRadius: '0 0 50% 50%',
                maxWidth: { xs: '100%', sm: 600 },
                mx: 'auto',
              }}
            >
              <Typography variant={{ xs: 'subtitle1', sm: 'h6' } as any}>📚 Library Entrance</Typography>
            </Paper>
          </Box>

          {/* Rows */}
          {rows.map((row) => {
            const rowSeats = filteredSeats.filter(s => s.row === row);
            if (rowSeats.length === 0) return null;

            return (
              <Box key={row} sx={{ mb: { xs: 2, sm: 3 } }}>
                <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" justifyContent="center" flexWrap="wrap" useFlexGap>
                  {/* Row Label */}
                  <Chip label={`Row ${row}`} size="small" sx={{ minWidth: { xs: 45, sm: 60 }, fontSize: { xs: '0.7rem', sm: '0.8125rem' } }} />
                  
                  {/* Seats */}
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isFavorite = favoriteSeats.includes(seat.id);
                    
                    return (
                      <Tooltip
                        key={seat.id}
                        title={
                          <Box>
                            <Typography variant="subtitle2">{seat.id} - {zoneConfig[seat.zone].label}</Typography>
                            <Typography variant="caption">₹{seat.pricing[bookingDuration]}/{bookingDuration}</Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {seat.features.window && <Chip icon={<WindowIcon />} label="Window" size="small" sx={{ m: 0.25 }} />}
                              {seat.features.power && <Chip icon={<Power />} label="Power" size="small" sx={{ m: 0.25 }} />}
                              {seat.features.ac && <Chip icon={<AcUnit />} label="AC" size="small" sx={{ m: 0.25 }} />}
                            </Box>
                          </Box>
                        }
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: { xs: 35, sm: 45, md: 50 },
                            height: { xs: 35, sm: 45, md: 50 },
                            borderRadius: 1,
                            bgcolor: getSeatColor(seat),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: seat.status !== 'occupied' && seat.status !== 'blocked' ? 'pointer' : 'not-allowed',
                            opacity: seat.status === 'occupied' || seat.status === 'blocked' ? 0.5 : 1,
                            border: isSelected ? '3px solid #1976D2' : '1px solid #ccc',
                            transition: 'all 0.2s',
                            '&:hover': seat.status !== 'occupied' && seat.status !== 'blocked' ? {
                              transform: { xs: 'scale(1.05)', sm: 'scale(1.1)' },
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            } : {},
                          }}
                          onClick={() => handleSeatClick(seat)}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                            {seat.id}
                          </Typography>
                          {isFavorite && (
                            <Favorite
                              sx={{ position: 'absolute', top: { xs: -6, sm: -8 }, right: { xs: -6, sm: -8 }, color: 'error.main', fontSize: { xs: 12, sm: 16 } }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Paper>
      </Box>

      {/* Seat Details Dialog */}
      <Dialog open={!!selectedSeat} onClose={() => setSelectedSeat(null)} maxWidth="sm" fullWidth>
        {selectedSeat && (
          <>
            <DialogTitle sx={{ bgcolor: getSeatColor(selectedSeat), color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Seat {selectedSeat.id}</Typography>
                  <Typography variant="caption">{zoneConfig[selectedSeat.zone].label}</Typography>
                </Box>
                <IconButton onClick={() => toggleFavorite(selectedSeat.id)} sx={{ color: 'white' }}>
                  {favoriteSeats.includes(selectedSeat.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                {/* Pricing */}
                <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Pricing Options:</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">⏱️ Hourly: <strong>₹{selectedSeat.pricing.hourly}</strong></Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">📅 Daily: <strong>₹{selectedSeat.pricing.daily}</strong></Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">🗓️ Weekly: <strong>₹{selectedSeat.pricing.weekly}</strong></Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">📆 Monthly: <strong>₹{selectedSeat.pricing.monthly}</strong></Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Features */}
                <Typography variant="subtitle2" gutterBottom>Amenities:</Typography>
                <Grid container spacing={1}>
                  {selectedSeat.features.window && (
                    <Grid item xs={6}>
                      <Chip icon={<WindowIcon />} label="Window View" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.power && (
                    <Grid item xs={6}>
                      <Chip icon={<Power />} label="Power Outlet" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.wifi && (
                    <Grid item xs={6}>
                      <Chip icon={<Wifi />} label="WiFi" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.locker && (
                    <Grid item xs={6}>
                      <Chip icon={<LockOpen />} label="Locker" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.ac && (
                    <Grid item xs={6}>
                      <Chip icon={<AcUnit />} label="Air Conditioned" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.naturalLight && (
                    <Grid item xs={6}>
                      <Chip icon={<WbSunny />} label="Natural Light" size="small" color="primary" />
                    </Grid>
                  )}
                  {selectedSeat.features.cushionedChair && (
                    <Grid item xs={6}>
                      <Chip icon={<ChairAlt />} label="Cushioned Chair" size="small" color="primary" />
                    </Grid>
                  )}
                </Grid>

                {/* Seat Info */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Desk Type: <strong>{selectedSeat.deskType === 'individual' ? 'Individual' : selectedSeat.deskType === 'double' ? 'Double' : 'Group'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Capacity: <strong>{selectedSeat.capacity} person(s)</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Zone: <strong>{zoneConfig[selectedSeat.zone].description}</strong>
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSeat(null)}>Close</Button>
              {selectedSeat.status !== 'occupied' && selectedSeat.status !== 'blocked' && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleToggleSeat(selectedSeat.id);
                    setSelectedSeat(null);
                  }}
                >
                  {selectedSeats.includes(selectedSeat.id) ? 'Remove' : 'Select Seat'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to book {selectedSeats.length} seat(s) for {bookingDuration} at ₹{getTotalPrice}.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Selected Seats:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selectedSeats.map(seatId => (
              <Chip key={seatId} label={seatId} size="small" color="primary" />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmBooking}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatBookingPage;

