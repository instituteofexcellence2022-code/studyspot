// ============================================
// PERMISSIONS PAGE (RBAC)
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  critical: boolean;
}

interface PermissionGroup {
  name: string;
  description: string;
  icon: React.ReactNode;
  permissions: Permission[];
}

const PermissionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string | false>('tenants');

  // Mock permissions data grouped by resource
  const permissionGroups: PermissionGroup[] = [
    {
      name: 'Tenants',
      description: 'Manage tenant organizations and settings',
      icon: <ShieldIcon />,
      permissions: [
        { id: 'tenant.create', name: 'Create Tenant', description: 'Create new tenant organizations', resource: 'tenant', action: 'create', critical: true },
        { id: 'tenant.read', name: 'View Tenants', description: 'View tenant information', resource: 'tenant', action: 'read', critical: false },
        { id: 'tenant.update', name: 'Update Tenant', description: 'Modify tenant settings', resource: 'tenant', action: 'update', critical: true },
        { id: 'tenant.delete', name: 'Delete Tenant', description: 'Remove tenant organizations', resource: 'tenant', action: 'delete', critical: true },
        { id: 'tenant.suspend', name: 'Suspend Tenant', description: 'Suspend tenant access', resource: 'tenant', action: 'suspend', critical: true },
      ],
    },
    {
      name: 'Users',
      description: 'Manage user accounts and access',
      icon: <KeyIcon />,
      permissions: [
        { id: 'user.create', name: 'Create User', description: 'Create new user accounts', resource: 'user', action: 'create', critical: true },
        { id: 'user.read', name: 'View Users', description: 'View user information', resource: 'user', action: 'read', critical: false },
        { id: 'user.update', name: 'Update User', description: 'Modify user details', resource: 'user', action: 'update', critical: true },
        { id: 'user.delete', name: 'Delete User', description: 'Remove user accounts', resource: 'user', action: 'delete', critical: true },
        { id: 'user.reset_password', name: 'Reset Password', description: 'Reset user passwords', resource: 'user', action: 'reset_password', critical: true },
      ],
    },
    {
      name: 'Roles & Permissions',
      description: 'Manage access control and permissions',
      icon: <LockIcon />,
      permissions: [
        { id: 'role.create', name: 'Create Role', description: 'Create new roles', resource: 'role', action: 'create', critical: true },
        { id: 'role.read', name: 'View Roles', description: 'View role information', resource: 'role', action: 'read', critical: false },
        { id: 'role.update', name: 'Update Role', description: 'Modify role permissions', resource: 'role', action: 'update', critical: true },
        { id: 'role.delete', name: 'Delete Role', description: 'Remove custom roles', resource: 'role', action: 'delete', critical: true },
        { id: 'role.assign', name: 'Assign Roles', description: 'Assign roles to users', resource: 'role', action: 'assign', critical: true },
      ],
    },
    {
      name: 'Analytics',
      description: 'Access analytics and reports',
      icon: <ShieldIcon />,
      permissions: [
        { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics dashboard', resource: 'analytics', action: 'view', critical: false },
        { id: 'analytics.export', name: 'Export Data', description: 'Export analytics data', resource: 'analytics', action: 'export', critical: false },
        { id: 'report.create', name: 'Create Reports', description: 'Generate custom reports', resource: 'report', action: 'create', critical: false },
        { id: 'report.schedule', name: 'Schedule Reports', description: 'Schedule automated reports', resource: 'report', action: 'schedule', critical: false },
      ],
    },
    {
      name: 'Settings',
      description: 'System configuration and settings',
      icon: <ShieldIcon />,
      permissions: [
        { id: 'settings.read', name: 'View Settings', description: 'View system settings', resource: 'settings', action: 'read', critical: false },
        { id: 'settings.update', name: 'Update Settings', description: 'Modify system settings', resource: 'settings', action: 'update', critical: true },
        { id: 'settings.security', name: 'Security Settings', description: 'Manage security configuration', resource: 'settings', action: 'security', critical: true },
        { id: 'settings.api', name: 'API Settings', description: 'Manage API configuration', resource: 'settings', action: 'api', critical: true },
      ],
    },
    {
      name: 'Audit Logs',
      description: 'Access audit trails and logs',
      icon: <ShieldIcon />,
      permissions: [
        { id: 'audit.read', name: 'View Audit Logs', description: 'Access audit trail', resource: 'audit', action: 'read', critical: false },
        { id: 'audit.export', name: 'Export Logs', description: 'Export audit logs', resource: 'audit', action: 'export', critical: false },
        { id: 'audit.delete', name: 'Delete Logs', description: 'Remove old audit logs', resource: 'audit', action: 'delete', critical: true },
      ],
    },
  ];

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleRefresh = () => {
    toast.success('Permissions list refreshed');
  };

  // Filter permissions
  const filteredGroups = permissionGroups.map(group => ({
    ...group,
    permissions: group.permissions.filter(p =>
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.permissions.length > 0);

  const totalPermissions = permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0);
  const criticalPermissions = permissionGroups.reduce((sum, g) => sum + g.permissions.filter(p => p.critical).length, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Permissions Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse all available permissions grouped by resource
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <CheckCircleIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Total Permissions
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {totalPermissions}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <LockIcon color="error" />
              <Typography variant="body2" color="text.secondary">
                Critical Permissions
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {criticalPermissions}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <ShieldIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Resource Groups
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {permissionGroups.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
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
        </Stack>
      </Card>

      {/* Permission Groups */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredGroups.map((group) => (
          <Accordion
            key={group.name}
            expanded={expanded === group.name.toLowerCase()}
            onChange={handleAccordionChange(group.name.toLowerCase())}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box sx={{ color: 'primary.main' }}>
                  {group.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {group.description}
                  </Typography>
                </Box>
                <Chip
                  label={`${group.permissions.length} permissions`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Permission</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Permission ID</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.permissions.map((permission) => (
                      <TableRow key={permission.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {permission.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'action.hover',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {permission.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {permission.critical ? (
                            <Chip
                              label="Critical"
                              size="small"
                              color="error"
                              icon={<LockIcon />}
                            />
                          ) : (
                            <Chip
                              label="Standard"
                              size="small"
                              color="default"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default PermissionsPage;

