import React, { useState, useMemo, useCallback } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  EventSeat,
  Weekend,
  VolumeOff,
  Groups,
  MenuBook,
  Window as WindowIcon,
  Power,
  Wifi,
  LocalLibrary,
  ChairAlt,
  Business,
  LockOpen,
  WbSunny,
  AcUnit,
  Close,
  Check,
} from '@mui/icons-material';

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
}

const LibrarySeatBooking: React.FC = () => {
  const [seats, setSeats] = useState<LibrarySeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingDuration, setBookingDuration] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [layoutCreated, setLayoutCreated] = useState(false);

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
          // Discussion zone has double and group desks
          if (seatNum % 3 === 0) {
            deskType = 'double';
            capacity = 2;
          }
        } else {
          zone = 'reading';
        }

        // Window seats (first and last columns)
        const hasWindow = seatNum === 1 || seatNum === seatsPerRow;
        
        // Natural light for front and window seats
        const hasNaturalLight = rowIndex < 3 || hasWindow;

        // Power outlets (every other seat)
        const hasPower = seatNum % 2 === 0;

        // AC zones
        const hasAC = ['premium', 'silent', 'exam-prep'].includes(zone);

        // Lockers for premium and exam-prep
        const hasLocker = ['premium', 'exam-prep'].includes(zone);

        // Cushioned chairs for premium and exam-prep
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
            wifi: true, // All seats have WiFi
            locker: hasLocker,
            ac: hasAC,
            naturalLight: hasNaturalLight,
            cushionedChair: hasCushionedChair,
          },
          capacity,
        });
      }
    });

    setSeats(newSeats);
    setLayoutCreated(true);
  };

  const handleSeatClick = useCallback((seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied' || seat.status === 'blocked') return;

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
  }, [seats, selectedSeats]);

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

  const rows = useMemo(() => 
    Array.from(new Set(seats.map(s => s.row))).sort(),
    [seats]
  );

  const filteredSeats = useMemo(() => 
    selectedZone === 'all' ? seats : seats.filter(s => s.zone === selectedZone),
    [seats, selectedZone]
  );

  const stats = useMemo(() => ({
    total: seats.length,
    available: seats.filter(s => s.status === 'available').length,
    occupied: seats.filter(s => s.status === 'occupied').length,
    selected: selectedSeats.length,
    byZone: {
      silent: seats.filter(s => s.zone === 'silent').length,
      reading: seats.filter(s => s.zone === 'reading').length,
      discussion: seats.filter(s => s.zone === 'discussion').length,
      'exam-prep': seats.filter(s => s.zone === 'exam-prep').length,
      premium: seats.filter(s => s.zone === 'premium').length,
    },
    features: {
      window: seats.filter(s => s.features.window && s.status === 'available').length,
      power: seats.filter(s => s.features.power && s.status === 'available').length,
      locker: seats.filter(s => s.features.locker && s.status === 'available').length,
      ac: seats.filter(s => s.features.ac && s.status === 'available').length,
    }
  }), [seats, selectedSeats]);

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {!layoutCreated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Card sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
            <LocalLibrary sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              📚 Library Seat Booking System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Professional seat booking with study zones, time-based pricing, and library-specific features like window seats, power outlets, lockers, and more.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={createLibraryLayout}
              sx={{ px: 6, py: 2 }}
            >
              📚 Create Library Layout
            </Button>
          </Card>
        </Box>
      ) : (
        <Box>
          {/* Header with Filters */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4">📚 Library Seat Booking</Typography>
              <Stack direction="row" spacing={2}>
                <Chip label={`${stats.available} Available`} color="success" />
                <Chip label={`${stats.occupied} Occupied`} color="error" />
                <Chip label={`${stats.selected} Selected`} color="primary" />
              </Stack>
            </Box>

            {/* Booking Duration & Zone Filter */}
            <Stack direction="row" spacing={2} alignItems="center">
              <ToggleButtonGroup
                value={bookingDuration}
                exclusive
                onChange={(e, val) => val && setBookingDuration(val)}
                size="small"
              >
                <ToggleButton value="hourly">⏱️ Hourly</ToggleButton>
                <ToggleButton value="daily">📅 Daily</ToggleButton>
                <ToggleButton value="weekly">🗓️ Weekly</ToggleButton>
                <ToggleButton value="monthly">📆 Monthly</ToggleButton>
              </ToggleButtonGroup>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Zone</InputLabel>
                <Select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                  <MenuItem value="all">🌐 All Zones</MenuItem>
                  <MenuItem value="silent">🤫 Silent Study</MenuItem>
                  <MenuItem value="reading">📖 Reading</MenuItem>
                  <MenuItem value="discussion">💬 Discussion</MenuItem>
                  <MenuItem value="exam-prep">📝 Exam Prep</MenuItem>
                  <MenuItem value="premium">⭐ Premium</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Stack direction="row" spacing={3}>
            {/* Main Seat Map */}
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ p: 3, bgcolor: 'white' }}>
                {/* Library Entrance */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      py: 1.5, 
                      bgcolor: '#1976D2', 
                      color: 'white',
                      borderRadius: '0 0 50% 50%',
                      maxWidth: 600,
                      mx: 'auto'
                    }}
                  >
                    <Typography variant="h6">🚪 LIBRARY ENTRANCE 🚪</Typography>
                    <Typography variant="caption">← Librarian Desk | Issue Counter →</Typography>
                  </Paper>
                </Box>

                {/* Seat Grid */}
                <Box sx={{ overflowX: 'auto' }}>
                  {rows.map((row) => {
                    const rowSeats = filteredSeats.filter(s => s.row === row).sort((a, b) => a.number - b.number);
                    if (rowSeats.length === 0) return null;

                    const rowZone = rowSeats[0]?.zone;
                    
                    return (
                      <Box key={row} sx={{ mb: 2 }}>
                        {/* Zone Header */}
                        {row === rows[0] || seats.find(s => s.row === rows[rows.indexOf(row) - 1])?.zone !== rowZone ? (
                          <Box sx={{ mb: 1, p: 1, bgcolor: zoneConfig[rowZone].color + '20', borderRadius: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {zoneConfig[rowZone].icon}
                              <Typography variant="subtitle2" fontWeight="bold">
                                {zoneConfig[rowZone].label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {zoneConfig[rowZone].description}
                              </Typography>
                            </Stack>
                          </Box>
                        ) : null}

                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          {/* Row Label */}
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 55, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              color: zoneConfig[rowZone].color,
                              bgcolor: zoneConfig[rowZone].color + '10',
                              borderRadius: 1,
                            }}
                          >
                            {row}
                          </Box>

                          {/* Seats */}
                          {rowSeats.map((seat, index) => {
                            const prevSeat = rowSeats[index - 1];
                            const showAisle = prevSeat && seat.number - prevSeat.number > 1;
                            const isDouble = seat.deskType === 'double';

                            return (
                              <React.Fragment key={seat.id}>
                                {/* Aisle gap */}
                                {showAisle && (
                                  <Box sx={{ width: 50, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.65rem' }}>
                                      AISLE
                                    </Typography>
                                  </Box>
                                )}

                                {/* Seat */}
                                <Tooltip
                                  title={
                                    <Box>
                                      <Typography variant="caption" fontWeight="bold">{seat.id} - {zoneConfig[seat.zone].label}</Typography>
                                      <Divider sx={{ my: 0.5, bgcolor: 'white', opacity: 0.3 }} />
                                      <Typography variant="caption">💺 {seat.deskType} desk (capacity: {seat.capacity})</Typography><br />
                                      <Typography variant="caption">💰 ₹{seat.pricing[bookingDuration]}/{bookingDuration}</Typography><br />
                                      <Divider sx={{ my: 0.5, bgcolor: 'white', opacity: 0.3 }} />
                                      <Typography variant="caption" fontWeight="bold">Features:</Typography><br />
                                      {seat.features.window && <Typography variant="caption">🪟 Window seat</Typography>}<br />
                                      {seat.features.power && <Typography variant="caption">⚡ Power outlet</Typography>}<br />
                                      {seat.features.wifi && <Typography variant="caption">📶 WiFi</Typography>}<br />
                                      {seat.features.locker && <Typography variant="caption">🔐 Locker</Typography>}<br />
                                      {seat.features.ac && <Typography variant="caption">❄️ AC</Typography>}<br />
                                      {seat.features.naturalLight && <Typography variant="caption">☀️ Natural light</Typography>}<br />
                                      {seat.features.cushionedChair && <Typography variant="caption">🪑 Cushioned chair</Typography>}
                                    </Box>
                                  }
                                >
                                  <Box
                                    onClick={() => handleSeatClick(seat.id)}
                                    sx={{
                                      width: isDouble ? 90 : 55,
                                      height: 55,
                                      bgcolor: getSeatColor(seat),
                                      border: '2px solid',
                                      borderColor: seat.status === 'selected' ? '#1976D2' : '#ddd',
                                      borderRadius: 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: seat.status === 'occupied' ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s',
                                      position: 'relative',
                                      '&:hover': seat.status !== 'occupied' ? {
                                        transform: 'scale(1.05)',
                                        boxShadow: 3,
                                        zIndex: 10,
                                      } : {},
                                    }}
                                  >
                                    {seat.status === 'occupied' ? (
                                      <Close sx={{ fontSize: 20, color: 'white' }} />
                                    ) : (
                                      <>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontWeight: 'bold', 
                                            fontSize: '0.75rem',
                                            color: seat.status === 'selected' ? 'white' : '#333'
                                          }}
                                        >
                                          {seat.id}
                                        </Typography>
                                        <Stack direction="row" spacing={0.3} sx={{ mt: 0.3 }}>
                                          {seat.features.window && <WindowIcon sx={{ fontSize: 10, color: seat.status === 'selected' ? 'white' : '#666' }} />}
                                          {seat.features.power && <Power sx={{ fontSize: 10, color: seat.status === 'selected' ? 'white' : '#666' }} />}
                                          {seat.features.locker && <LockOpen sx={{ fontSize: 10, color: seat.status === 'selected' ? 'white' : '#666' }} />}
                                        </Stack>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            fontSize: '0.6rem',
                                            color: seat.status === 'selected' ? 'white' : '#666'
                                          }}
                                        >
                                          ₹{seat.pricing[bookingDuration].toLocaleString()}
                                        </Typography>
                                      </>
                                    )}
                                  </Box>
                                </Tooltip>
                              </React.Fragment>
                            );
                          })}

                          {/* Row Label (right) */}
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 55, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              color: zoneConfig[rowZone].color,
                              bgcolor: zoneConfig[rowZone].color + '10',
                              borderRadius: 1,
                            }}
                          >
                            {row}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>

                {/* Library Back/Exit */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      py: 1, 
                      bgcolor: '#f5f5f5',
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      🚪 EXIT | Book Shelves | Reading Area 🚪
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            </Box>

            {/* Right Sidebar */}
            <Box sx={{ width: 340 }}>
              <Stack spacing={2}>
                {/* Zone Legend */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📍 Study Zones
                    </Typography>
                    <Stack spacing={1.5}>
                      {Object.entries(zoneConfig).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 35, 
                              height: 35, 
                              bgcolor: value.color, 
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #ddd'
                            }}
                          >
                            {React.cloneElement(value.icon, { sx: { fontSize: 20, color: 'white' } })}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {value.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{value[bookingDuration]}/{bookingDuration}
                            </Typography>
                          </Box>
                          <Chip label={stats.byZone[key as keyof typeof stats.byZone]} size="small" />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Available Features */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      ✨ Available Features
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <WindowIcon fontSize="small" />
                          <Typography variant="body2">Window Seats</Typography>
                        </Stack>
                        <Chip label={stats.features.window} size="small" color="info" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Power fontSize="small" />
                          <Typography variant="body2">Power Outlets</Typography>
                        </Stack>
                        <Chip label={stats.features.power} size="small" color="success" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LockOpen fontSize="small" />
                          <Typography variant="body2">Personal Lockers</Typography>
                        </Stack>
                        <Chip label={stats.features.locker} size="small" color="warning" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AcUnit fontSize="small" />
                          <Typography variant="body2">AC Seats</Typography>
                        </Stack>
                        <Chip label={stats.features.ac} size="small" color="primary" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Selection Summary */}
                {selectedSeats.length > 0 && (
                  <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📋 Your Selection
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {selectedSeats.map(seatId => (
                          <Chip 
                            key={seatId} 
                            label={seatId} 
                            size="small"
                            onDelete={() => handleSeatClick(seatId)}
                            sx={{ bgcolor: 'white', color: 'primary.main' }}
                          />
                        ))}
                      </Box>
                      <Divider sx={{ bgcolor: 'white', opacity: 0.3, my: 2 }} />
                      <Typography variant="caption">Booking Duration: {bookingDuration.toUpperCase()}</Typography>
                      <Typography variant="h4" gutterBottom sx={{ mt: 1 }}>
                        ₹{getTotalPrice.toLocaleString()}
                      </Typography>
                      <Typography variant="caption">
                        {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × {bookingDuration}
                      </Typography>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
                        startIcon={<Check />}
                      >
                        Proceed to Payment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Statistics */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Occupancy Stats
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Total Seats:</Typography>
                        <Typography variant="body2" fontWeight="bold">{stats.total}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="success.main">Available:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {stats.available} ({((stats.available / stats.total) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="error.main">Occupied:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {stats.occupied} ({((stats.occupied / stats.total) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default LibrarySeatBooking;

