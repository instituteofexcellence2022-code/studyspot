/**
 * Tenant Management Page
 * Comprehensive tenant lifecycle management with advanced features
 * 
 * Features:
 * - Tenant onboarding workflow
 * - Bulk tenant operations
 * - Tenant health monitoring
 * - Subscription management
 * - Billing analytics
 * - Tenant cloning and migration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Archive as ArchiveIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  CloudUpload as ImportIcon,
  ContentCopy as CloneIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  FileDownload as ExportIcon,
  Notifications as NotificationIcon,
  People as PeopleIcon,
  RestoreFromTrash as RestoreIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: 'active' | 'trial' | 'suspended' | 'archived';
  subscription: {
    plan?: string;
    status?: string;
    billingCycle: string;
    price: number;
    currency: string;
    nextBilling: string;
  };
  metrics: {
    users: number;
    bookings: number;
    revenue: number;
    healthScore: number;
    lastActivity: string;
  };
  settings: {
    timezone: string;
    language: string;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TenantManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock data - replace with API calls
  useEffect(() => {
    const mockTenants: Tenant[] = [
      {
        id: '1',
        name: 'University Library System',
        slug: 'university-lib',
        email: 'admin@university.edu',
        status: 'active',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          billingCycle: 'yearly',
          price: 999,
          currency: 'USD',
          nextBilling: '2024-12-01'
        },
        metrics: {
          users: 1250,
          bookings: 15680,
          revenue: 25000,
          healthScore: 95,
          lastActivity: '2 hours ago'
        },
        settings: {
          timezone: 'America/New_York',
          language: 'en',
          features: ['analytics', 'face-recognition', 'iot-control', 'ai-assistant']
        },
        createdAt: '2023-01-15',
        updatedAt: '2024-10-28'
      },
      {
        id: '2',
        name: 'City Public Library',
        slug: 'city-public',
        email: 'admin@citylib.org',
        status: 'trial',
        subscription: {
          plan: 'professional',
          status: 'trial',
          billingCycle: 'monthly',
          price: 299,
          currency: 'USD',
          nextBilling: '2024-11-15'
        },
        metrics: {
          users: 450,
          bookings: 3200,
          revenue: 0,
          healthScore: 78,
          lastActivity: '1 day ago'
        },
        settings: {
          timezone: 'America/Chicago',
          language: 'en',
          features: ['analytics', 'basic-booking']
        },
        createdAt: '2024-10-15',
        updatedAt: '2024-10-27'
      },
      {
        id: '3',
        name: 'Corporate Learning Center',
        slug: 'corp-learning',
        email: 'admin@corp.com',
        status: 'suspended',
        subscription: {
          plan: 'basic',
          status: 'past_due',
          billingCycle: 'monthly',
          price: 99,
          currency: 'USD',
          nextBilling: '2024-10-01'
        },
        metrics: {
          users: 120,
          bookings: 890,
          revenue: 0,
          healthScore: 45,
          lastActivity: '1 week ago'
        },
        settings: {
          timezone: 'America/Los_Angeles',
          language: 'en',
          features: ['basic-booking']
        },
        createdAt: '2024-08-20',
        updatedAt: '2024-10-20'
      }
    ];

    setTimeout(() => {
      setTenants(mockTenants);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'suspended': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const filteredTenants = tenants.filter((tenant: any) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    if (window.confirm(`Are you sure you want to delete ${tenant.name}?`)) {
      setTenants(tenants.filter((t: any) => t.id !== tenant.id));
    }
  };

  const handleCloneTenant = (tenant: Tenant) => {
    const clonedTenant = {
      ...tenant,
      id: Date.now().toString(),
      name: `${tenant.name} (Copy)`,
      slug: `${tenant.slug}-copy`,
      email: `copy-${tenant.email}`,
      status: 'trial' as const,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTenants([...tenants, clonedTenant]);
  };

  const handleArchiveTenant = (tenant: Tenant) => {
    setTenants(tenants.map((t: any) => 
      t.id === tenant.id ? { ...t, status: 'archived' as const } : t
    ));
  };

  const handleRestoreTenant = (tenant: Tenant) => {
    setTenants(tenants.map((t: any) => 
      t.id === tenant.id ? { ...t, status: 'active' as const } : t
    ));
  };

  const totalRevenue = tenants.reduce((sum, tenant) => sum + tenant.metrics.revenue, 0);
  const totalUsers = tenants.reduce((sum, tenant) => sum + tenant.metrics.users, 0);
  const totalBookings = tenants.reduce((sum, tenant) => sum + tenant.metrics.bookings, 0);
  const averageHealthScore = tenants.length > 0 
    ? Math.round(tenants.reduce((sum, tenant) => sum + tenant.metrics.healthScore, 0) / tenants.length)
    : 0;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Tenant Management</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading tenants...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage platform tenants, subscriptions, and billing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => console.log('Import tenants')}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => console.log('Export tenants')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTenant}
          >
            Add Tenant
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
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
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Tenants</Typography>
                <Typography variant="h4">{tenants.length}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{totalUsers.toLocaleString()}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Monthly Revenue</Typography>
                <Typography variant="h4">${totalRevenue.toLocaleString()}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Health Score</Typography>
                <Typography variant="h4">{averageHealthScore}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search tenants"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e: any) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e: any) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="created">Created Date</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="health">Health Score</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Health Score</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{tenant.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tenant.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tenant.status}
                      color={getStatusColor(tenant.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{tenant.subscription.plan}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${tenant.subscription.price}/{tenant.subscription.billingCycle}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{tenant.metrics.users.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">${tenant.metrics.revenue.toLocaleString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        color={`${getHealthScoreColor(tenant.metrics.healthScore)}.main`}
                        sx={{ mr: 1 }}
                      >
                        {tenant.metrics.healthScore}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={tenant.metrics.healthScore}
                        color={getHealthScoreColor(tenant.metrics.healthScore) as any}
                        sx={{ width: 50, height: 4 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{tenant.metrics.lastActivity}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleEditTenant(tenant)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Tenant">
                        <IconButton size="small" onClick={() => handleEditTenant(tenant)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Clone Tenant">
                        <IconButton size="small" onClick={() => handleCloneTenant(tenant)}>
                          <CloneIcon />
                        </IconButton>
                      </Tooltip>
                      {tenant.status === 'archived' ? (
                        <Tooltip title="Restore Tenant">
                          <IconButton size="small" onClick={() => handleRestoreTenant(tenant)}>
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Archive Tenant">
                          <IconButton size="small" onClick={() => handleArchiveTenant(tenant)}>
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Tenant">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteTenant(tenant)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Tenant Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTenant ? 'Edit Tenant' : 'Create New Tenant'}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e: React.SyntheticEvent, newValue: any) => setTabValue(newValue)}>
            <Tab label="Basic Info" />
            <Tab label="Subscription" />
            <Tab label="Settings" />
            <Tab label="Analytics" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tenant Name"
                fullWidth
                defaultValue={selectedTenant?.name || ''}
              />
              <TextField
                label="Slug"
                fullWidth
                defaultValue={selectedTenant?.slug || ''}
              />
              <TextField
                label="Email"
                fullWidth
                defaultValue={selectedTenant?.email || ''}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedTenant?.status || 'trial'}
                  label="Status"
                >
                  <MenuItem value="trial">Trial</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select
                  defaultValue={selectedTenant?.subscription.plan || 'basic'}
                  label="Plan"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  defaultValue={selectedTenant?.subscription.billingCycle || 'monthly'}
                  label="Billing Cycle"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Price"
                type="number"
                fullWidth
                defaultValue={selectedTenant?.subscription.price || 0}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  defaultValue={selectedTenant?.settings.timezone || 'UTC'}
                  label="Timezone"
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">America/New_York</MenuItem>
                  <MenuItem value="America/Chicago">America/Chicago</MenuItem>
                  <MenuItem value="America/Los_Angeles">America/Los_Angeles</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  defaultValue={selectedTenant?.settings.language || 'en'}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="subtitle2">Features</Typography>
              <List>
                {['analytics', 'face-recognition', 'iot-control', 'ai-assistant', 'basic-booking'].map((feature) => (
                  <ListItem key={feature}>
                    <FormControlLabel
                      control={<Switch defaultChecked={selectedTenant?.settings.features.includes(feature) || false} />}
                      label={feature.replace('-', ' ').toUpperCase()}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {selectedTenant && (
              <Box>
                <Typography variant="h6" gutterBottom>Tenant Analytics</Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2 
                }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Total Users</Typography>
                      <Typography variant="h4">{selectedTenant.metrics.users.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Total Bookings</Typography>
                      <Typography variant="h4">{selectedTenant.metrics.bookings.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Revenue</Typography>
                      <Typography variant="h4">${selectedTenant.metrics.revenue.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2">Health Score</Typography>
                      <Typography variant="h4">{selectedTenant.metrics.healthScore}%</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">
            {selectedTenant ? 'Update Tenant' : 'Create Tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagementPage;
