// ============================================
// TENANT LIST PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchTenants, deleteTenant, setFilters } from '../../../store/slices/tenantSlice';
import { Tenant } from '../../../types';

const TenantListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { tenants, loading, meta, filters } = useAppSelector((state) => state.tenant);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, [filters]);

  const loadTenants = () => {
    dispatch(fetchTenants(filters));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: event.target.value, page: 1 }));
  };

  const handleStatusFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ status: event.target.value, page: 1 }));
  };

  const handlePlanFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ subscriptionPlan: event.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setFilters({ limit: newPageSize, page: 1 }));
  };

  const handleView = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/tenants/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await dispatch(deleteTenant(id)).unwrap();
        toast.success('Tenant deleted successfully');
        setDeleteConfirmId(null);
        loadTenants();
      } catch (error: any) {
        toast.error(error || 'Failed to delete tenant');
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleCreate = () => {
    navigate('/tenants/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

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
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'enterprise'
              ? 'primary'
              : params.value === 'professional'
              ? 'secondary'
              : 'default'
          }
          sx={{ textTransform: 'capitalize' }}
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
          size="small"
          color={getStatusColor(params.value as string) as any}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getSubscriptionStatusColor(params.value as string) as any}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'metadata',
      headerName: 'Libraries',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.librariesCount || 0}
        </Typography>
      ),
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 100,
      renderCell: (params: GridRenderCellParams<any, Tenant>) => (
        <Typography variant="body2">
          {params.row.metadata?.usersCount || 0}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, Tenant>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.id)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEdit(params.row.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteConfirmId === params.row.id ? 'Click again to confirm' : 'Delete'}>
            <IconButton
              size="small"
              color={deleteConfirmId === params.row.id ? 'error' : 'default'}
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Tenant Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          Create Tenant
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search"
            placeholder="Search by name, email, or slug..."
            value={filters.search}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={handleStatusFilter}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          <TextField
            select
            label="Plan"
            value={filters.subscriptionPlan}
            onChange={handlePlanFilter}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="starter">Starter</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="enterprise">Enterprise</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={loadTenants}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={tenants}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={meta?.total || 0}
          paginationModel={{
            page: (filters.page || 1) - 1,
            pageSize: filters.limit || 10,
          }}
          onPaginationModelChange={(model) => {
            handlePageChange(model.page);
            if (model.pageSize !== filters.limit) {
              handlePageSizeChange(model.pageSize);
            }
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default TenantListPage;

