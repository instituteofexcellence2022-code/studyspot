import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
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
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  InputAdornment,
  TablePagination,
  Divider,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon,
  EventSeat as SeatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

// Enhanced mock seats data
const INITIAL_SEATS = [
  { id: 1, number: 'A01', zone: 'AC Zone', type: 'Regular', status: 'available', price: 50 },
  { id: 2, number: 'A02', zone: 'AC Zone', type: 'Regular', status: 'occupied', price: 50 },
  { id: 3, number: 'A03', zone: 'AC Zone', type: 'Premium', status: 'available', price: 75 },
  { id: 4, number: 'A04', zone: 'AC Zone', type: 'Premium', status: 'occupied', price: 75 },
  { id: 5, number: 'B01', zone: 'Non-AC Zone', type: 'Regular', status: 'available', price: 30 },
  { id: 6, number: 'B02', zone: 'Non-AC Zone', type: 'Regular', status: 'occupied', price: 30 },
  { id: 7, number: 'B03', zone: 'Non-AC Zone', type: 'Regular', status: 'maintenance', price: 30 },
  { id: 8, number: 'C01', zone: 'Quiet Zone', type: 'Premium', status: 'available', price: 60 },
  { id: 9, number: 'C02', zone: 'Quiet Zone', type: 'VIP', status: 'available', price: 100 },
  { id: 10, number: 'C03', zone: 'Quiet Zone', type: 'VIP', status: 'occupied', price: 100 },
];

interface Seat {
  id: number;
  number: string;
  zone: string;
  type: string;
  status: string;
  price: number;
}

const SeatsPageEnhanced: React.FC = () => {
  // State management
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [seatToDelete, setSeatToDelete] = useState<Seat | null>(null);
  const [currentSeat, setCurrentSeat] = useState<Partial<Seat>>({
    number: '',
    zone: '',
    type: 'Regular',
    status: 'available',
    price: 50,
  });
  
  // Enhanced features state
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof Seat, string>>>({});

  // Validation function
  const validateSeat = (seat: Partial<Seat>): boolean => {
    const newErrors: Partial<Record<keyof Seat, string>> = {};
    
    if (!seat.number || seat.number.trim().length < 2) {
      newErrors.number = 'Seat number must be at least 2 characters';
    }
    
    if (!seat.zone || seat.zone.trim().length < 2) {
      newErrors.zone = 'Zone must be at least 2 characters';
    }
    
    if (!seat.price || seat.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Filtered seats
  const filteredSeats = useMemo(() => {
    return seats.filter(seat => {
      const matchesSearch = searchTerm === '' || 
        seat.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seat.zone.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = zoneFilter.length === 0 || zoneFilter.includes(seat.zone);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(seat.type);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(seat.status);
      
      return matchesSearch && matchesZone && matchesType && matchesStatus;
    });
  }, [seats, searchTerm, zoneFilter, typeFilter, statusFilter]);

  // Paginated seats
  const paginatedSeats = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredSeats.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSeats, page, rowsPerPage]);

  // Handlers
  const handleOpenDialog = (seat?: Seat) => {
    if (seat) {
      setEditMode(true);
      setCurrentSeat(seat);
    } else {
      setEditMode(false);
      setCurrentSeat({
        number: '',
        zone: '',
        type: 'Regular',
        status: 'available',
        price: 50,
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveSeat = () => {
    if (!validateSeat(currentSeat)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      if (editMode && currentSeat.id) {
        setSeats(seats.map(s => s.id === currentSeat.id ? currentSeat as Seat : s));
        setSnackbar({ open: true, message: 'Seat updated successfully!', severity: 'success' });
      } else {
        const newSeat: Seat = {
          id: Math.max(...seats.map(s => s.id), 0) + 1,
          ...currentSeat as Omit<Seat, 'id'>,
        };
        setSeats([...seats, newSeat]);
        setSnackbar({ open: true, message: 'Seat added successfully!', severity: 'success' });
      }
      
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (seat: Seat) => {
    setSeatToDelete(seat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (seatToDelete) {
      setLoading(true);
      
      setTimeout(() => {
        setSeats(seats.filter(s => s.id !== seatToDelete.id));
        setSnackbar({ open: true, message: 'Seat deleted successfully!', severity: 'success' });
        setDeleteDialogOpen(false);
        setSeatToDelete(null);
        setLoading(false);
      }, 500);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Number', 'Zone', 'Type', 'Status', 'Price'];
    const csvContent = [
      headers.join(','),
      ...filteredSeats.map(s => [s.id, s.number, s.zone, s.type, s.status, s.price].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seats_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Seats exported to CSV!', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Regular': return 'default';
      case 'Premium': return 'primary';
      case 'VIP': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Seat Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            disabled={filteredSeats.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Seat
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Seats</Typography>
              <Typography variant="h4">{seats.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Showing: {filteredSeats.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Available</Typography>
              <Typography variant="h4" color="success.main">
                {seats.filter(s => s.status === 'available').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Occupied</Typography>
              <Typography variant="h4" color="error.main">
                {seats.filter(s => s.status === 'occupied').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
              <Typography variant="h4">
                {seats.length > 0
                  ? Math.round((seats.filter(s => s.status === 'occupied').length / seats.length) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by seat number or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Zone</InputLabel>
              <Select
                multiple
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value as string[])}
                input={<OutlinedInput label="Zone" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['AC Zone', 'Non-AC Zone', 'Quiet Zone'].map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    <Checkbox checked={zoneFilter.indexOf(zone) > -1} />
                    <ListItemText primary={zone} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                multiple
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as string[])}
                input={<OutlinedInput label="Type" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['Regular', 'Premium', 'VIP'].map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={typeFilter.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string[])}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['available', 'occupied', 'maintenance'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setZoneFilter([]);
                setTypeFilter([]);
                setStatusFilter([]);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Seats Grid */}
      <Grid container spacing={2}>
        {paginatedSeats.map((seat) => (
          <Grid item xs={12} sm={6} md={3} key={seat.id}>
            <Card
              sx={{
                border: seat.status === 'available' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                position: 'relative',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SeatIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{seat.number}</Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(seat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(seat)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {seat.zone}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={seat.type} size="small" color={getTypeColor(seat.type) as any} />
                  <Chip label={seat.status} size="small" color={getStatusColor(seat.status) as any} />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>₹{seat.price}</strong>/hour
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {paginatedSeats.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No seats found. Try adjusting your filters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <TablePagination
          component="div"
          count={filteredSeats.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[6, 12, 24, 48]}
        />
      </Box>

      {/* Add/Edit Seat Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Seat' : 'Add New Seat'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Seat Number"
              value={currentSeat.number}
              onChange={(e) => setCurrentSeat({ ...currentSeat, number: e.target.value })}
              placeholder="e.g., A01"
              fullWidth
              required
              error={!!errors.number}
              helperText={errors.number}
            />
            <TextField
              label="Zone"
              value={currentSeat.zone}
              onChange={(e) => setCurrentSeat({ ...currentSeat, zone: e.target.value })}
              placeholder="e.g., AC Zone"
              fullWidth
              required
              error={!!errors.zone}
              helperText={errors.zone}
            />
            <FormControl fullWidth>
              <InputLabel>Seat Type</InputLabel>
              <Select
                value={currentSeat.type}
                onChange={(e) => setCurrentSeat({ ...currentSeat, type: e.target.value })}
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
                value={currentSeat.status}
                onChange={(e) => setCurrentSeat({ ...currentSeat, status: e.target.value })}
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
              value={currentSeat.price}
              onChange={(e) => setCurrentSeat({ ...currentSeat, price: Number(e.target.value) })}
              fullWidth
              required
              error={!!errors.price}
              helperText={errors.price}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSaveSeat}
            variant="contained"
            disabled={loading || !currentSeat.number || !currentSeat.zone}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editMode ? 'Update' : 'Add'} Seat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete seat <strong>{seatToDelete?.number}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SeatsPageEnhanced;
