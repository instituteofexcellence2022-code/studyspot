// ============================================
// TENANT MANAGEMENT PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { setFilters, setCurrentTenant, removeTenant } from '../../../store/slices/tenantSlice';
import { showSuccess, showError } from '../../../store/slices/uiSlice';
import { Tenant } from '../../../types';

const TenantManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tenants, filters, loading, meta } = useAppSelector((state) => state.tenant);

  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle search
  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  // Handle filter
  const handleFilterStatus = (status: string) => {
    dispatch(setFilters({ status, page: 1 }));
  };

  const handleFilterPlan = (plan: string) => {
    dispatch(setFilters({ subscriptionPlan: plan, page: 1 }));
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tenant: Tenant) => {
    setAnchorEl(event.currentTarget);
    setSelectedTenant(tenant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle actions
  const handleView = () => {
    if (selectedTenant) {
      dispatch(setCurrentTenant(selectedTenant));
      // Navigate to details page (implement later)
      dispatch(showSuccess(`Viewing ${selectedTenant.name}`));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedTenant) {
      dispatch(setCurrentTenant(selectedTenant));
      // Navigate to edit page (implement later)
      dispatch(showSuccess(`Editing ${selectedTenant.name}`));
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedTenant) {
      dispatch(removeTenant(selectedTenant.id));
      dispatch(showSuccess(`Tenant "${selectedTenant.name}" deleted successfully`));
    }
    setDeleteDialogOpen(false);
    setSelectedTenant(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTenant(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'suspended':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get plan color
  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 'default';
      case 'starter':
        return 'info';
      case 'pro':
        return 'primary';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tenant Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getPlanColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value as string) as any}
          size="small"
        />
      ),
    },
    {
      field: 'metadata',
      headerName: 'Users',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.usersCount || 0}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueGetter: (value) => {
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row as Tenant)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // Filter tenants based on search and filters
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      !filters.search ||
      tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || tenant.status === filters.status;

    const matchesPlan =
      !filters.subscriptionPlan ||
      tenant.subscriptionPlan === filters.subscriptionPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all library tenants on the platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => dispatch(showSuccess('Create Tenant feature coming soon'))}
        >
          Create Tenant
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}>
        <Tab label={`All Tenants (${tenants.length})`} />
        <Tab label="Active" />
        <Tab label="Trial" />
        <Tab label="Suspended" />
      </Tabs>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search tenants..."
              size="small"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => handleFilterStatus('')}
            >
              All Status
            </Button>
            <Button
              variant={filters.status === 'active' ? 'contained' : 'outlined'}
              onClick={() => handleFilterStatus('active')}
              size="small"
            >
              Active
            </Button>
            <Button
              variant={filters.status === 'trial' ? 'contained' : 'outlined'}
              onClick={() => handleFilterStatus('trial')}
              size="small"
            >
              Trial
            </Button>
            <Button
              variant={filters.status === 'suspended' ? 'contained' : 'outlined'}
              onClick={() => handleFilterStatus('suspended')}
              size="small"
            >
              Suspended
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={filteredTenants}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{
            page: filters.page - 1,
            pageSize: filters.limit,
          }}
          onPaginationModelChange={(model) => {
            dispatch(setFilters({ page: model.page + 1, limit: model.pageSize }));
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedTenant?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;
