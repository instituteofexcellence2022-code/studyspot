import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchTenants,
  setFilters,
  suspendTenant,
  reactivateTenant,
} from '../../store/slices/tenantSlice';
import { Tenant, TenantStatus } from '../../types';

/**
 * Tenant Management Page (Super Admin)
 * Manage all tenants with search, filter, suspend/reactivate
 * 
 * @author Agent 2 - Senior Developer
 */

const TenantManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    tenants,
    tenantsLoading,
    tenantsError,
    tenantsTotalPages,
    tenantsCurrentPage,
    filters,
  } = useAppSelector((state) => state.tenant);

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    dispatch(fetchTenants(filters));
  }, [dispatch, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: any) => {
    dispatch(setFilters({ status: e.target.value as TenantStatus | 'all' }));
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailsOpen(true);
  };

  const handleSuspend = async () => {
    if (!selectedTenant) return;
    
    try {
      await dispatch(suspendTenant({ id: selectedTenant.id, reason: suspendReason })).unwrap();
      setSuspendDialogOpen(false);
      setSuspendReason('');
    } catch (error) {
      console.error('Failed to suspend tenant:', error);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await dispatch(reactivateTenant(id)).unwrap();
    } catch (error) {
      console.error('Failed to reactivate tenant:', error);
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Tenant Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage all tenants (Super Admin Only)
      </Typography>

      {tenantsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {tenantsError}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search tenants..."
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              value={filters.status}
              onChange={handleStatusFilter}
              label="Status"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="trial">Trial</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Health Score</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.contactInfo.email}</TableCell>
                  <TableCell>{tenant.subscriptionPlan}</TableCell>
                  <TableCell>
                    <Chip label={tenant.status} color={getStatusColor(tenant.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${tenant.healthScore}%`}
                      color={tenant.healthScore >= 80 ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewDetails(tenant)}>
                      <VisibilityIcon />
                    </IconButton>
                    {tenant.status === 'active' ? (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setSuspendDialogOpen(true);
                        }}
                      >
                        <BlockIcon />
                      </IconButton>
                    ) : tenant.status === 'suspended' ? (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleReactivate(tenant.id)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={-1}
          rowsPerPage={10}
          page={tenantsCurrentPage - 1}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[10]}
        />
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tenant Details</DialogTitle>
        <DialogContent>
          {selectedTenant && (
            <Box>
              <Typography variant="body2" paragraph>
                <strong>Name:</strong> {selectedTenant.name}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Email:</strong> {selectedTenant.contactInfo.email}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Phone:</strong> {selectedTenant.contactInfo.phone}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Plan:</strong> {selectedTenant.subscriptionPlan}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Status:</strong> {selectedTenant.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend Tenant</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Suspension"
            multiline
            rows={4}
            fullWidth
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSuspend} color="error" variant="contained">
            Suspend
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TenantManagementPage;


