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
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';

// Enhanced mock fee plans
const INITIAL_PLANS = [
  {
    id: 1,
    name: 'Hourly Plan',
    type: 'hourly',
    price: 50,
    duration: '1 hour',
    features: 'WiFi, AC, Power outlet',
    status: 'active',
  },
  {
    id: 2,
    name: 'Daily Plan',
    type: 'daily',
    price: 300,
    duration: '1 day (8 hours)',
    features: 'WiFi, AC, Power outlet, Locker',
    status: 'active',
  },
  {
    id: 3,
    name: 'Weekly Plan',
    type: 'weekly',
    price: 1500,
    duration: '7 days',
    features: 'WiFi, AC, Power outlet, Locker, Parking',
    status: 'active',
  },
  {
    id: 4,
    name: 'Monthly Premium',
    type: 'monthly',
    price: 5000,
    duration: '30 days',
    features: 'WiFi, AC, Power outlet, Locker, Parking, 24/7 Access',
    status: 'active',
  },
  {
    id: 5,
    name: 'Student Monthly',
    type: 'monthly',
    price: 4000,
    duration: '30 days',
    features: 'WiFi, AC, Power outlet, Locker',
    status: 'active',
  },
  {
    id: 6,
    name: 'Weekend Special',
    type: 'weekly',
    price: 1200,
    duration: 'Sat-Sun',
    features: 'WiFi, AC, Power outlet',
    status: 'inactive',
  },
];

interface FeePlan {
  id: number;
  name: string;
  type: string;
  price: number;
  duration: string;
  features: string;
  status: string;
}

const FeePlansPageEnhanced: React.FC = () => {
  const [plans, setPlans] = useState<FeePlan[]>(INITIAL_PLANS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<FeePlan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<FeePlan>>({
    name: '',
    type: 'hourly',
    price: 0,
    duration: '',
    features: '',
    status: 'active',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Partial<Record<keyof FeePlan, string>>>({});

  const validatePlan = (plan: Partial<FeePlan>): boolean => {
    const newErrors: Partial<Record<keyof FeePlan, string>> = {};
    
    if (!plan.name || plan.name.trim().length < 3) {
      newErrors.name = 'Plan name must be at least 3 characters';
    }
    
    if (!plan.price || plan.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!plan.duration || plan.duration.trim().length < 2) {
      newErrors.duration = 'Duration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = searchTerm === '' || 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.features.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter.length === 0 || typeFilter.includes(plan.type);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(plan.status);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [plans, searchTerm, typeFilter, statusFilter]);

  const paginatedPlans = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredPlans.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredPlans, page, rowsPerPage]);

  const handleOpenDialog = (plan?: FeePlan) => {
    if (plan) {
      setEditMode(true);
      setCurrentPlan(plan);
    } else {
      setEditMode(false);
      setCurrentPlan({
        name: '',
        type: 'hourly',
        price: 0,
        duration: '',
        features: '',
        status: 'active',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSavePlan = () => {
    if (!validatePlan(currentPlan)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      if (editMode && currentPlan.id) {
        setPlans(plans.map(p => p.id === currentPlan.id ? currentPlan as FeePlan : p));
        setSnackbar({ open: true, message: 'Plan updated successfully!', severity: 'success' });
      } else {
        const newPlan: FeePlan = {
          id: Math.max(...plans.map(p => p.id), 0) + 1,
          ...currentPlan as Omit<FeePlan, 'id'>,
        };
        setPlans([...plans, newPlan]);
        setSnackbar({ open: true, message: 'Plan created successfully!', severity: 'success' });
      }
      
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (plan: FeePlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (planToDelete) {
      setLoading(true);
      
      setTimeout(() => {
        setPlans(plans.filter(p => p.id !== planToDelete.id));
        setSnackbar({ open: true, message: 'Plan deleted successfully!', severity: 'success' });
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
        setLoading(false);
      }, 500);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Price', 'Duration', 'Features', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredPlans.map(p => [p.id, p.name, p.type, p.price, p.duration, p.features, p.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee_plans_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Fee plans exported to CSV!', severity: 'success' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hourly': return 'info';
      case 'daily': return 'success';
      case 'weekly': return 'warning';
      case 'monthly': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fee Plans Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} disabled={filteredPlans.length === 0}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Create Plan
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Plans</Typography>
              <Typography variant="h4">{plans.length}</Typography>
              <Typography variant="caption" color="text.secondary">Showing: {filteredPlans.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Plans</Typography>
              <Typography variant="h4" color="success.main">{plans.filter(p => p.status === 'active').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Avg Price</Typography>
              <Typography variant="h4">
                ₹{plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.price, 0) / plans.length) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Monthly Plans</Typography>
              <Typography variant="h4">{plans.filter(p => p.type === 'monthly').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search plans by name or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select multiple value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as string[])} input={<OutlinedInput label="Type" />} renderValue={(selected) => selected.join(', ')}>
                {['hourly', 'daily', 'weekly', 'monthly'].map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={typeFilter.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select multiple value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as string[])} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(', ')}>
                {['active', 'inactive'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button fullWidth variant="outlined" onClick={() => { setSearchTerm(''); setTypeFilter([]); setStatusFilter([]); }}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Plans Grid */}
      <Grid container spacing={3}>
        {paginatedPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: plan.type === 'monthly' ? '2px solid #1976d2' : '1px solid #e0e0e0', position: 'relative', '&:hover': { boxShadow: 4 } }}>
              {plan.type === 'monthly' && <Chip label="Popular" color="primary" size="small" sx={{ position: 'absolute', top: 10, right: 10 }} />}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h5" component="h2">{plan.name}</Typography>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(plan)}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(plan)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Chip label={plan.type} size="small" color={getTypeColor(plan.type) as any} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                  <MoneyIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="h4" component="span" color="success.main">₹{plan.price}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ {plan.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{plan.duration}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>Includes:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {plan.features.split(',').map((feature, idx) => (
                    <Chip key={idx} label={feature.trim()} size="small" variant="outlined" />
                  ))}
                </Box>
                <Chip label={plan.status} size="small" color={plan.status === 'active' ? 'success' : 'default'} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
        {paginatedPlans.length === 0 && (
          <Grid item xs={12}>
            <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">No plans found. Try adjusting your filters.</Typography>
            </CardContent></Card>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <TablePagination component="div" count={filteredPlans.length} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[3, 6, 9, 12]} />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Fee Plan' : 'Create New Fee Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Plan Name" value={currentPlan.name} onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })} placeholder="e.g., Monthly Premium" fullWidth required error={!!errors.name} helperText={errors.name} />
            <FormControl fullWidth>
              <InputLabel>Plan Type</InputLabel>
              <Select value={currentPlan.type} onChange={(e) => setCurrentPlan({ ...currentPlan, type: e.target.value })} label="Plan Type">
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Price (₹)" type="number" value={currentPlan.price} onChange={(e) => setCurrentPlan({ ...currentPlan, price: Number(e.target.value) })} fullWidth required error={!!errors.price} helperText={errors.price} />
            <TextField label="Duration" value={currentPlan.duration} onChange={(e) => setCurrentPlan({ ...currentPlan, duration: e.target.value })} placeholder="e.g., 30 days" fullWidth required error={!!errors.duration} helperText={errors.duration} />
            <TextField label="Features (comma separated)" value={currentPlan.features} onChange={(e) => setCurrentPlan({ ...currentPlan, features: e.target.value })} placeholder="e.g., WiFi, AC, Power outlet" fullWidth multiline rows={2} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={currentPlan.status} onChange={(e) => setCurrentPlan({ ...currentPlan, status: e.target.value })} label="Status">
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSavePlan} variant="contained" disabled={loading || !currentPlan.name || !currentPlan.price || !currentPlan.duration} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {editMode ? 'Update' : 'Create'} Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{planToDelete?.name}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FeePlansPageEnhanced;

