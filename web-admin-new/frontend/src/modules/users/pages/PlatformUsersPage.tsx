// ============================================
// PLATFORM USERS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
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
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { setFilters, removePlatformUser } from '../../../store/slices/userSlice';
import { showSuccess, showError } from '../../../store/slices/uiSlice';
import { PlatformUser } from '../types';

const PlatformUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { platformUsers, filters, loading } = useAppSelector((state) => state.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle search
  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  // Handle filter
  const handleFilterRole = (role: string) => {
    dispatch(setFilters({ role, page: 1 }));
  };

  const handleFilterStatus = (status: string) => {
    dispatch(setFilters({ status, page: 1 }));
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: PlatformUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle actions
  const handleView = () => {
    if (selectedUser) {
      dispatch(showSuccess(`Viewing ${selectedUser.name}`));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedUser) {
      dispatch(showSuccess(`Editing ${selectedUser.name}`));
    }
    handleMenuClose();
  };

  const handleSuspend = () => {
    if (selectedUser) {
      dispatch(showSuccess(`${selectedUser.name} suspended`));
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      dispatch(removePlatformUser(selectedUser.id));
      dispatch(showSuccess(`User "${selectedUser.name}" deleted successfully`));
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  // Get colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'library_owner': return 'primary';
      case 'library_admin': return 'secondary';
      case 'staff': return 'info';
      case 'student': return 'default';
      default: return 'default';
    }
  };

  // DataGrid columns
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
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value?.replace('_', ' ')}
          color={getRoleColor(params.value as string) as any}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 100,
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
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 150,
      valueGetter: (value) => {
        return value ? new Date(value).toLocaleDateString() : 'Never';
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
          onClick={(e) => handleMenuOpen(e, params.row as PlatformUser)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // Filter users
  const filteredUsers = platformUsers.filter((user) => {
    const matchesSearch =
      !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.tenantName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: filteredUsers.length,
    libraryOwners: filteredUsers.filter(u => u.role === 'library_owner').length,
    staff: filteredUsers.filter(u => u.role === 'staff').length,
    students: filteredUsers.filter(u => u.role === 'student').length,
    active: filteredUsers.filter(u => u.status === 'active').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Platform Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all library owners, staff, and students across tenants
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {stats.libraryOwners}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Library Owners
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {stats.staff}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Staff Members
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="text.secondary">
              {stats.students}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search users..."
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
              onClick={() => dispatch(setFilters({ role: '', status: '' }))}
            >
              Clear Filters
            </Button>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              Showing {filteredUsers.length} of {platformUsers.length} users
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip
              label="All Roles"
              onClick={() => handleFilterRole('')}
              color={!filters.role ? 'primary' : 'default'}
              variant={!filters.role ? 'filled' : 'outlined'}
            />
            <Chip
              label="Library Owners"
              onClick={() => handleFilterRole('library_owner')}
              color={filters.role === 'library_owner' ? 'primary' : 'default'}
              variant={filters.role === 'library_owner' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Admins"
              onClick={() => handleFilterRole('library_admin')}
              color={filters.role === 'library_admin' ? 'secondary' : 'default'}
              variant={filters.role === 'library_admin' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Staff"
              onClick={() => handleFilterRole('staff')}
              color={filters.role === 'staff' ? 'info' : 'default'}
              variant={filters.role === 'staff' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Students"
              onClick={() => handleFilterRole('student')}
              color={filters.role === 'student' ? 'default' : 'default'}
              variant={filters.role === 'student' ? 'filled' : 'outlined'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <DataGrid
          rows={filteredUsers}
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
        />
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleSuspend}>
          <Block sx={{ mr: 1 }} fontSize="small" />
          Suspend User
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete User
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformUsersPage;

