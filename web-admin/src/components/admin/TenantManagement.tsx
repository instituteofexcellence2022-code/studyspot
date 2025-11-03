import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { showSnackbar } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { ROUTES } from '../../constants';
// import {
//   DataGrid,
//   GridColDef,
//   GridActionsCellItem,
//   GridToolbar
// } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  users: number;
  libraries: number;
  monthlyRevenue: number;
  createdAt: string;
  lastActive: string;
}

const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await tenantService.getTenants({ page: 1, limit: 25 } as any);
        // API returns paginated response; support both shapes
        const list = (res as any).data ?? (res as any).items ?? [];
        setTenants(list as Tenant[]);
      } catch (err: any) {
        dispatch(showSnackbar({ message: err?.message || 'Failed to load tenants', severity: 'error' } as any));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch]);

  const filteredTenants = tenants.filter((tenant: any) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'basic':
        return 'default';
      case 'premium':
        return 'primary';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'trial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleCreateTenant = () => {
    setCreateDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    const confirmed = window.confirm(`Delete tenant "${tenant.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    (async () => {
      try {
        await tenantService.deleteTenant(tenant.id);
        setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
        dispatch(
          showSnackbar({ message: 'Tenant deleted successfully', severity: 'success' } as any)
        );
      } catch (err: any) {
        dispatch(
          showSnackbar({ message: err?.message || 'Failed to delete tenant', severity: 'error' } as any)
        );
      }
    })();
  };

  const handleViewTenant = (tenant: Tenant) => {
    navigate(`/admin/tenants/${tenant.id}`);
  };

  // Simple table instead of DataGrid to avoid chunk loading issues

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />}}
            sx={{ width: 300 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTenant}
        >
          Add Tenant
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">{tenants.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tenants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    {tenants.reduce((sum, tenant) => sum + tenant.users, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    ${tenants.reduce((sum, tenant) => sum + tenant.monthlyRevenue, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: 'info.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    {tenants.reduce((sum, tenant) => sum + tenant.libraries, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Libraries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tenants Table */}
      <Paper sx={{ width: '100%' }}>
        {loading && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">Loading tenants…</Typography>
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant Name</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Libraries</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No tenants found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {tenant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tenant.domain}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.subscriptionPlan}
                        color={getPlanColor(tenant.subscriptionPlan) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.status}
                        color={getStatusColor(tenant.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {tenant.users}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {tenant.libraries}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        ${tenant.monthlyRevenue.toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTenant(tenant)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTenant(tenant)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTenant(tenant)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tenant</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tenant creation form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tenant: {selectedTenant?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tenant edit form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;

