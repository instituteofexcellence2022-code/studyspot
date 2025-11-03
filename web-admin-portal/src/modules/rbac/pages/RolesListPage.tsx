// ============================================
// ROLES LIST PAGE (RBAC)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  MoreVert as MoreVertIcon,
  Shield as ShieldIcon,
  People as PeopleIcon,
  Lock as LockIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: number;
  users: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

const RolesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Mock roles data
  const mockRoles: Role[] = [
    {
      id: '1',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      type: 'system',
      permissions: 48,
      users: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    },
    {
      id: '2',
      name: 'Administrator',
      description: 'Manage tenants, users, and system settings',
      type: 'system',
      permissions: 35,
      users: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-10-15T00:00:00Z',
      status: 'active',
    },
    {
      id: '3',
      name: 'Support Agent',
      description: 'Handle tickets, view reports, limited settings',
      type: 'system',
      permissions: 18,
      users: 25,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-09-20T00:00:00Z',
      status: 'active',
    },
    {
      id: '4',
      name: 'Viewer',
      description: 'Read-only access to most resources',
      type: 'system',
      permissions: 8,
      users: 45,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      status: 'active',
    },
    {
      id: '5',
      name: 'Finance Manager',
      description: 'Manage billing, invoices, and financial reports',
      type: 'custom',
      permissions: 12,
      users: 5,
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-08-10T00:00:00Z',
      status: 'active',
    },
    {
      id: '6',
      name: 'Content Manager',
      description: 'Manage content, templates, and communications',
      type: 'custom',
      permissions: 15,
      users: 8,
      createdAt: '2024-04-20T00:00:00Z',
      updatedAt: '2024-10-01T00:00:00Z',
      status: 'active',
    },
    {
      id: '7',
      name: 'Analytics Viewer',
      description: 'View analytics and generate reports',
      type: 'custom',
      permissions: 6,
      users: 15,
      createdAt: '2024-05-10T00:00:00Z',
      updatedAt: '2024-09-15T00:00:00Z',
      status: 'active',
    },
    {
      id: '8',
      name: 'Deprecated Role',
      description: 'Old role no longer in use',
      type: 'custom',
      permissions: 5,
      users: 0,
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
      status: 'inactive',
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setAnchorEl(event.currentTarget);
    setSelectedRole(role);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRole(null);
  };

  const handleView = (id: string) => {
    navigate(`/rbac/roles/${id}`);
    handleMenuClose();
  };

  const handleEdit = (id: string) => {
    navigate(`/rbac/roles/${id}/edit`);
    handleMenuClose();
  };

  const handleDuplicate = (role: Role) => {
    toast.success(`Duplicating role: ${role.name}`);
    handleMenuClose();
  };

  const handleDelete = (role: Role) => {
    if (role.type === 'system') {
      toast.error('Cannot delete system roles');
      handleMenuClose();
      return;
    }
    toast.success(`Role "${role.name}" deleted successfully`);
    handleMenuClose();
  };

  const handleCreateRole = () => {
    navigate('/rbac/roles/create');
  };

  const handleRefresh = () => {
    toast.success('Roles list refreshed');
  };

  const getRoleIcon = (type: string) => {
    return type === 'system' ? <ShieldIcon fontSize="small" /> : <KeyIcon fontSize="small" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  // Filter roles
  const filteredRoles = mockRoles.filter((role) =>
    searchQuery === '' ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Roles & Permissions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage roles and their associated permissions
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <ShieldIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Total Roles
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockRoles.length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <KeyIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Custom Roles
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockRoles.filter((r) => r.type === 'custom').length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <PeopleIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockRoles.reduce((sum, r) => sum + r.users, 0)}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LockIcon color="warning" />
              <Typography variant="body2" color="text.secondary">
                Permissions
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              48
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Actions Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
          >
            Create Role
          </Button>
        </Stack>
      </Card>

      {/* Roles Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Role Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="center"><strong>Permissions</strong></TableCell>
                <TableCell align="center"><strong>Users</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getRoleIcon(role.type)}
                        <Typography variant="body2" fontWeight="medium">
                          {role.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.type}
                        size="small"
                        color={role.type === 'system' ? 'primary' : 'default'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={role.description}>
                        {role.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={role.permissions}
                        size="small"
                        color="info"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={role.users}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.status}
                        size="small"
                        color={getStatusColor(role.status) as any}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, role)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRoles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedRole && handleView(selectedRole.id)}>
          <ListItemIcon>
            <ShieldIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedRole && handleEdit(selectedRole.id)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Role
        </MenuItem>
        <MenuItem onClick={() => selectedRole && handleDuplicate(selectedRole)}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        {selectedRole?.type === 'custom' && (
          <MenuItem onClick={() => selectedRole && handleDelete(selectedRole)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Delete</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default RolesListPage;

