/**
 * Role Management Page
 * Comprehensive role management interface with CRUD operations
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { AppDispatch, RootState } from '../../store';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissionGroups,
} from '../../store/slices/rbacSlice';
import { Role, RoleCreateRequest, RoleUpdateRequest } from '../../types';

const RoleManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, permissions } = useSelector((state: RootState) => state.rbac);
  const { user } = useSelector((state: RootState) => state.auth);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState<RoleCreateRequest>({
    name: '',
    description: '',
    permissions: [],
    tenantId: user?.tenantId,
  });

  useEffect(() => {
    if (user?.tenantId) {
      dispatch(fetchRoles(user.tenantId));
      dispatch(fetchPermissionGroups());
    }
  }, [dispatch, user?.tenantId]);

  const handleRefresh = () => {
    if (user?.tenantId) {
      dispatch(fetchRoles(user.tenantId));
    }
  };

  const handleCreateOpen = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      tenantId: user?.tenantId,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateSubmit = async () => {
    try {
      await dispatch(createRole(formData)).unwrap();
      setCreateDialogOpen(false);
      if (user?.tenantId) {
        dispatch(fetchRoles(user.tenantId));
      }
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleEditOpen = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      tenantId: role.tenantId,
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedRole(null);
  };

  const handleEditSubmit = async () => {
    if (!selectedRole) return;

    try {
      const updateData: RoleUpdateRequest = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      };
      await dispatch(updateRole({ roleId: selectedRole.id, data: updateData })).unwrap();
      setEditDialogOpen(false);
      setSelectedRole(null);
      if (user?.tenantId) {
        dispatch(fetchRoles(user.tenantId));
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteOpen = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;

    try {
      await dispatch(deleteRole(selectedRole.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      if (user?.tenantId) {
        dispatch(fetchRoles(user.tenantId));
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Role Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<Role>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight="bold">
            {params.row.name}
          </Typography>
          {params.row.isSystem && (
            <Chip label="System" size="small" color="primary" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: GridRenderCellParams<Role>) => (
        <Chip
          label={params.row.type === 'system' ? 'System' : 'Custom'}
          size="small"
          color={params.row.type === 'system' ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'usersCount',
      headerName: 'Users',
      width: 100,
      renderCell: (params: GridRenderCellParams<Role>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon fontSize="small" />
          <Typography variant="body2">{params.row.usersCount || 0}</Typography>
        </Box>
      ),
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      width: 120,
      renderCell: (params: GridRenderCellParams<Role>) => (
        <Chip
          label={params.row.permissions.length}
          size="small"
          color="info"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Role>) => (
        <Box>
          <Tooltip title="Edit Role">
            <IconButton
              size="small"
              onClick={() => handleEditOpen(params.row)}
              disabled={params.row.isSystem}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Role">
            <IconButton
              size="small"
              onClick={() => handleDeleteOpen(params.row)}
              disabled={params.row.isSystem}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (roles.loading && roles.items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Role Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={roles.loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOpen}
            >
              Create Role
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Manage roles and permissions for your organization
        </Typography>
      </Box>

      {/* Error Alert */}
      {roles.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {roles.error}
        </Alert>
      )}

      {/* Roles Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={roles.items}
          columns={columns}
          loading={roles.loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Role Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Alert severity="info">
              You can assign permissions after creating the role.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!formData.name || !formData.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Role Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            {selectedRole && (
              <Alert severity="info">
                Role has {selectedRole.permissions.length} permissions assigned.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!formData.name || !formData.description}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose} maxWidth="xs">
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>?
          </Typography>
          {selectedRole && selectedRole.usersCount && selectedRole.usersCount > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This role is assigned to {selectedRole.usersCount} user(s). Please reassign users before deleting.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={selectedRole?.usersCount ? selectedRole.usersCount > 0 : false}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RoleManagementPage;

