/**
 * RBAC/ABAC Management Page
 * 
 * Features:
 * - Role-based access control (RBAC)
 * - Attribute-based access control (ABAC)
 * - Permission management and inheritance
 * - Policy enforcement and evaluation
 * - User-role assignments and mappings
 * - Access control analytics and auditing
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
  LinearProgress,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { 
  CheckBox as CheckboxIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Shield as ShieldIcon,
  VpnKey as VpnKeyIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom' | 'inherited';
  permissions: string[];
  users: number;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  parentRole?: string;
  attributes: Record<string, any>;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: string[];
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  attributes: Record<string, any>;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  tenant: string;
}

interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'rbac' | 'abac' | 'hybrid';
  rules: PolicyRule[];
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  effect: 'allow' | 'deny';
  priority: number;
  description: string;
}

const RBACManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setRoles([
      {
        id: '1',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        type: 'system',
        permissions: ['*'],
        users: 3,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        attributes: { level: 'highest', scope: 'global' }
      },
      {
        id: '2',
        name: 'Tenant Admin',
        description: 'Administrative access within tenant scope',
        type: 'system',
        permissions: ['tenant.*', 'users.*', 'settings.*'],
        users: 15,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        parentRole: 'Super Admin',
        attributes: { level: 'high', scope: 'tenant' }
      },
      {
        id: '3',
        name: 'Library Manager',
        description: 'Manage library operations and bookings',
        type: 'custom',
        permissions: ['library.*', 'bookings.*', 'seats.*'],
        users: 45,
        status: 'active',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z',
        parentRole: 'Tenant Admin',
        attributes: { level: 'medium', scope: 'library' }
      },
      {
        id: '4',
        name: 'Staff Member',
        description: 'Basic staff access for daily operations',
        type: 'custom',
        permissions: ['bookings.read', 'seats.read', 'users.read'],
        users: 120,
        status: 'active',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-15T07:30:00Z',
        parentRole: 'Library Manager',
        attributes: { level: 'low', scope: 'library' }
      }
    ]);

    setPermissions([
      {
        id: '1',
        name: 'Full System Access',
        resource: '*',
        action: '*',
        description: 'Complete system access',
        category: 'System',
        riskLevel: 'critical'
      },
      {
        id: '2',
        name: 'User Management',
        resource: 'users',
        action: '*',
        description: 'Manage all user operations',
        category: 'User Management',
        riskLevel: 'high'
      },
      {
        id: '3',
        name: 'Library Management',
        resource: 'library',
        action: '*',
        description: 'Manage library operations',
        category: 'Library',
        riskLevel: 'medium'
      },
      {
        id: '4',
        name: 'Booking Management',
        resource: 'bookings',
        action: '*',
        description: 'Manage booking operations',
        category: 'Bookings',
        riskLevel: 'medium'
      },
      {
        id: '5',
        name: 'Read Bookings',
        resource: 'bookings',
        action: 'read',
        description: 'View booking information',
        category: 'Bookings',
        riskLevel: 'low'
      },
      {
        id: '6',
        name: 'Seat Management',
        resource: 'seats',
        action: '*',
        description: 'Manage seat operations',
        category: 'Seats',
        riskLevel: 'medium'
      }
    ]);

    setUsers([
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        roles: ['Super Admin'],
        attributes: { department: 'IT', location: 'NYC', clearance: 'high' },
        lastLogin: '2024-01-15T10:30:00Z',
        status: 'active',
        tenant: 'Platform'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@company.com',
        roles: ['Tenant Admin'],
        attributes: { department: 'Operations', location: 'SF', clearance: 'medium' },
        lastLogin: '2024-01-15T09:15:00Z',
        status: 'active',
        tenant: 'Acme Corp'
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.w@company.com',
        roles: ['Library Manager'],
        attributes: { department: 'Library', location: 'Chicago', clearance: 'low' },
        lastLogin: '2024-01-14T16:20:00Z',
        status: 'active',
        tenant: 'Tech Solutions'
      },
      {
        id: '4',
        name: 'Lisa Brown',
        email: 'lisa.b@company.com',
        roles: ['Staff Member'],
        attributes: { department: 'Library', location: 'Boston', clearance: 'low' },
        lastLogin: '2024-01-14T14:10:00Z',
        status: 'active',
        tenant: 'StartupXYZ'
      }
    ]);

    setPolicies([
      {
        id: '1',
        name: 'Default RBAC Policy',
        description: 'Standard role-based access control',
        type: 'rbac',
        rules: [
          {
            id: '1',
            name: 'Admin Access',
            condition: 'user.roles contains "Super Admin"',
            effect: 'allow',
            priority: 1,
            description: 'Allow all access for super admins'
          },
          {
            id: '2',
            name: 'Tenant Admin Access',
            condition: 'user.roles contains "Tenant Admin" AND user.tenant == resource.tenant',
            effect: 'allow',
            priority: 2,
            description: 'Allow tenant admin access within tenant scope'
          }
        ],
        status: 'active',
        priority: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Time-based Access Policy',
        description: 'Access control based on time and location',
        type: 'abac',
        rules: [
          {
            id: '3',
            name: 'Business Hours Access',
            condition: 'time.hour >= 9 AND time.hour <= 17 AND user.location == "office"',
            effect: 'allow',
            priority: 1,
            description: 'Allow access during business hours from office'
          },
          {
            id: '4',
            name: 'Remote Access',
            condition: 'user.attributes.clearance == "high" AND user.attributes.department == "IT"',
            effect: 'allow',
            priority: 2,
            description: 'Allow remote access for high-clearance IT users'
          }
        ],
        status: 'active',
        priority: 2,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-15T09:15:00Z'
      }
    ]);
  }, []);

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'system': return <ShieldIcon />;
      case 'custom': return <GroupIcon />;
      case 'inherited': return <VpnKeyIcon />;
      default: return <PersonIcon />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deprecated': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rbac': return 'primary';
      case 'abac': return 'secondary';
      case 'hybrid': return 'info';
      default: return 'default';
    }
  };

  const filteredRoles = roles.filter((role: any) => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
    const matchesType = filterType === 'all' || role.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const rbacMetrics = {
    totalRoles: roles.length,
    activeRoles: roles.filter((r: any) => r.status === 'active').length,
    totalUsers: users.length,
    totalPermissions: permissions.length,
    activePolicies: policies.filter((p: any) => p.status === 'active').length,
    averageUsersPerRole: users.reduce((sum, u) => sum + u.roles.length, 0) / roles.length
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            RBAC/ABAC Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage roles, permissions, and access control policies
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Create Role
          </Button>
        </Box>
      </Box>

      {/* RBAC Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Roles</Typography>
                <Typography variant="h4">{rbacMetrics.totalRoles}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {rbacMetrics.activeRoles} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Users</Typography>
                <Typography variant="h4">{rbacMetrics.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {rbacMetrics.averageUsersPerRole.toFixed(1)} avg per role
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <VpnKeyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Permissions</Typography>
                <Typography variant="h4">{rbacMetrics.totalPermissions}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Available permissions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ShieldIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Policies</Typography>
                <Typography variant="h4">{rbacMetrics.activePolicies}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active policies
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Roles" />
          <Tab label="Permissions" />
          <Tab label="Users" />
          <Tab label="Policies" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Roles Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Role Management</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                  <MenuItem value="inherited">Inherited</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getRoleIcon(role.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{role.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {role.users}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {role.permissions.length === 1 && role.permissions[0] === '*' ? 'All' : role.permissions.length}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.status}
                        color={getStatusColor(role.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedRole(role)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Permission Management</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Permission
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Permission</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{permission.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {permission.resource}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {permission.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={permission.riskLevel}
                        color={getRiskColor(permission.riskLevel) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">User Role Assignments</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Attributes</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {Object.entries(user.attributes).slice(0, 2).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        ))}
                        {Object.keys(user.attributes).length > 2 && (
                          <Chip
                            label={`+${Object.keys(user.attributes).length - 2}`}
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Access Control Policies</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Policy
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{policy.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {policy.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={policy.type.toUpperCase()}
                          color={getTypeColor(policy.type) as any}
                          size="small"
                        />
                        <Chip
                          label={`Priority: ${policy.priority}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${policy.rules.length} rules`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={policy.status}
                        color={getStatusColor(policy.status) as any}
                        size="small"
                      />
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Policy Rules</Typography>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      {policy.rules.map((rule) => (
                        <Box key={rule.id} sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider', 
                          borderRadius: 1,
                          bgcolor: rule.effect === 'allow' ? 'success.light' : 'error.light',
                          opacity: 0.1
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {rule.name}
                            </Typography>
                            <Chip
                              label={rule.effect}
                              color={rule.effect === 'allow' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {rule.description}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                            Condition: {rule.condition}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Access Control Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Role Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Permission Usage</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Access Control Events</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Access granted"
                    secondary="User: john.smith@company.com - Role: Super Admin - Resource: users - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Access denied"
                    secondary="User: lisa.b@company.com - Role: Staff Member - Resource: admin - Time: 2024-01-15 09:15:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Policy evaluation failed"
                    secondary="User: mike.w@company.com - Policy: Time-based Access - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Role Details Dialog */}
      <Dialog open={!!selectedRole} onClose={() => setSelectedRole(null)} maxWidth="md" fullWidth>
        <DialogTitle>Role Details</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRole.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRole.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Permissions</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedRole.permissions.map((permission) => (
                      <Chip
                        key={permission}
                        label={permission}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Attributes</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {Object.entries(selectedRole.attributes).map(([key, value]) => (
                      <Box key={key}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {key}:
                        </Typography>
                        <Typography variant="body2">
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Users: {selectedRole.users}</Typography>
                      <Typography variant="body2">Type: {selectedRole.type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Status: {selectedRole.status}</Typography>
                      <Typography variant="body2">Updated: {new Date(selectedRole.updatedAt).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRole(null)}>Close</Button>
          <Button variant="contained">Edit Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RBACManagementPage;
