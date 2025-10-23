import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  EventSeat as SeatIcon,
} from '@mui/icons-material';

// Mock seat data for 20% version
const MOCK_SEATS = [
  { id: 1, number: 'A01', zone: 'AC Zone', type: 'Regular', status: 'available', price: 50 },
  { id: 2, number: 'A02', zone: 'AC Zone', type: 'Regular', status: 'occupied', price: 50 },
  { id: 3, number: 'A03', zone: 'AC Zone', type: 'Premium', status: 'available', price: 75 },
  { id: 4, number: 'B01', zone: 'Non-AC Zone', type: 'Regular', status: 'available', price: 30 },
  { id: 5, number: 'B02', zone: 'Non-AC Zone', type: 'Regular', status: 'occupied', price: 30 },
  { id: 6, number: 'C01', zone: 'Quiet Zone', type: 'Premium', status: 'maintenance', price: 60 },
];

interface Seat {
  id: number;
  number: string;
  zone: string;
  type: string;
  status: string;
  price: number;
}

const SeatsPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>(MOCK_SEATS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSeat, setNewSeat] = useState({
    number: '',
    zone: '',
    type: 'Regular',
    status: 'available',
    price: 50,
  });

  const handleAddSeat = () => {
    const seat: Seat = {
      id: seats.length + 1,
      ...newSeat,
    };
    setSeats([...seats, seat]);
    setDialogOpen(false);
    setNewSeat({
      number: '',
      zone: '',
      type: 'Regular',
      status: 'available',
      price: 50,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Seat Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Seat
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Seats
              </Typography>
              <Typography variant="h4">{seats.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
              <Typography variant="h4" color="success.main">
                {seats.filter(s => s.status === 'available').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Occupied
              </Typography>
              <Typography variant="h4" color="error.main">
                {seats.filter(s => s.status === 'occupied').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Occupancy Rate
              </Typography>
              <Typography variant="h4">
                {seats.length > 0
                  ? Math.round((seats.filter(s => s.status === 'occupied').length / seats.length) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seats Grid */}
      <Grid container spacing={2}>
        {seats.map((seat) => (
          <Grid item xs={12} sm={6} md={3} key={seat.id}>
            <Card
              sx={{
                border: seat.status === 'available' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                position: 'relative',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SeatIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{seat.number}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {seat.zone}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={seat.type} size="small" variant="outlined" />
                  <Chip
                    label={seat.status}
                    size="small"
                    color={getStatusColor(seat.status) as any}
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>₹{seat.price}</strong>/hour
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Seat Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Seat</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Seat Number"
              value={newSeat.number}
              onChange={(e) => setNewSeat({ ...newSeat, number: e.target.value })}
              placeholder="e.g., A01"
              fullWidth
              required
            />
            <TextField
              label="Zone"
              value={newSeat.zone}
              onChange={(e) => setNewSeat({ ...newSeat, zone: e.target.value })}
              placeholder="e.g., AC Zone"
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Seat Type</InputLabel>
              <Select
                value={newSeat.type}
                onChange={(e) => setNewSeat({ ...newSeat, type: e.target.value })}
                label="Seat Type"
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newSeat.status}
                onChange={(e) => setNewSeat({ ...newSeat, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Price per Hour (₹)"
              type="number"
              value={newSeat.price}
              onChange={(e) => setNewSeat({ ...newSeat, price: Number(e.target.value) })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddSeat}
            variant="contained"
            disabled={!newSeat.number || !newSeat.zone}
          >
            Add Seat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatsPage;

