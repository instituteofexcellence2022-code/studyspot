// ============================================
// USER LIST PAGE
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
import { fetchUsers, deleteUser, setFilters } from '../../../store/slices/userSlice';
import { User } from '../../../types';

const UserListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { users, loading, meta, filters } = useAppSelector((state) => state.user);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = () => {
    dispatch(fetchUsers(filters));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: event.target.value, page: 1 }));
  };

  const handleRoleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ role: event.target.value, page: 1 }));
  };

  const handleStatusFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ status: event.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setFilters({ limit: newPageSize, page: 1 }));
  };

  const handleView = (id: string) => {
    navigate(`/users/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success('User deleted successfully');
        setDeleteConfirmId(null);
        loadUsers();
      } catch (error: any) {
        toast.error(error || 'Failed to delete user');
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleCreate = () => {
    navigate('/users/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'primary';
      case 'support':
        return 'info';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getRoleColor(params.value as string) as any}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
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
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontSize="0.875rem">
          {formatDate(params.value as string)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, User>) => (
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
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          Create User
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search"
            placeholder="Search by name, email, or tenant..."
            value={filters.search}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          />
          <TextField
            select
            label="Role"
            value={filters.role}
            onChange={handleRoleFilter}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="support">Support</MenuItem>
            <MenuItem value="viewer">Viewer</MenuItem>
          </TextField>
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
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={loadUsers}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={users}
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

export default UserListPage;

