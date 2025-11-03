import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AttachMoney,
  BarChart,
  Business,
  Edit,
  LibraryBooks,
  People,
  Settings,
  Timeline,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { tenantService } from '../../services/tenantService';
import { useAppDispatch } from '../../hooks/redux';
import { showSnackbar } from '../../store/slices/uiSlice';

interface TenantDetailsProps {
  tenantId: string;
}

const TenantDetails: React.FC<TenantDetailsProps> = ({ tenantId }) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [tenant, setTenant] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await tenantService.getTenantById(tenantId);
        setTenant(data);
      } catch (err: any) {
        dispatch(showSnackbar({ message: err?.message || 'Failed to load tenant', severity: 'error' } as any));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, tenantId]);

  const libraries = [
    { id: '1', name: 'Main Library', capacity: 200, bookings: 450, revenue: 900 },
    { id: '2', name: 'Science Library', capacity: 150, bookings: 320, revenue: 640 },
    { id: '3', name: 'Engineering Library', capacity: 100, bookings: 280, revenue: 560 },
    { id: '4', name: 'Medical Library', capacity: 80, bookings: 250, revenue: 500 },
    { id: '5', name: 'Law Library', capacity: 60, bookings: 200, revenue: 400 },
  ];

  const users = [
    { id: '1', name: 'John Doe', email: 'john@university.edu', role: 'admin', lastActive: '2024-01-20' },
    { id: '2', name: 'Jane Smith', email: 'jane@university.edu', role: 'staff', lastActive: '2024-01-19' },
    { id: '3', name: 'Bob Johnson', email: 'bob@university.edu', role: 'student', lastActive: '2024-01-18' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 2000 },
    { month: 'Feb', revenue: 2200 },
    { month: 'Mar', revenue: 2100 },
    { month: 'Apr', revenue: 2400 },
    { month: 'May', revenue: 2300 },
    { month: 'Jun', revenue: 2500 },
  ];

  const usageData = [
    { day: 'Mon', bookings: 45, users: 120 },
    { day: 'Tue', bookings: 52, users: 135 },
    { day: 'Wed', bookings: 48, users: 128 },
    { day: 'Thu', bookings: 61, users: 142 },
    { day: 'Fri', bookings: 55, users: 138 },
    { day: 'Sat', bookings: 38, users: 95 },
    { day: 'Sun', bookings: 42, users: 108 },
  ];

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'basic':
        return 'default';
      case 'premium':
        return 'primary';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'trial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{tenant?.usage?.users ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LibraryBooks sx={{ color: 'success.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{tenant?.usage?.libraries ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Libraries
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ color: 'warning.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">${tenant?.usage?.revenue ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp sx={{ color: 'info.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">98.5%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Uptime
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Revenue Chart */}
      <Grid xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Usage Chart */}
      <Grid xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Usage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderLibraries = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Library Name</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Bookings</TableCell>
            <TableCell>Revenue</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {libraries.map((library) => (
            <TableRow key={library.id}>
              <TableCell>{library.name}</TableCell>
              <TableCell>{library.capacity}</TableCell>
              <TableCell>{library.bookings}</TableCell>
              <TableCell>${library.revenue}</TableCell>
              <TableCell>
                <Tooltip title="View Library">
                  <IconButton size="small">
                    <LibraryBooks />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderUsers = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.name.split(' ').map((n: any) => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={user.role} size="small" />
              </TableCell>
              <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
              <TableCell>
                <Tooltip title="View User">
                  <IconButton size="small">
                    <People />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Contact Email
                </Typography>
                <Typography variant="body1">{tenant.owner_email || tenant.contactEmail || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Contact Phone
                </Typography>
                <Typography variant="body1">{tenant.phone || tenant.contactPhone || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Billing Address
                </Typography>
                <Typography variant="body1">{tenant.address || '—'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Subscription Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Plan
                </Typography>
                <Chip
                  label={tenant.plan_name || tenant.subscriptionPlan || '—'}
                  color={getPlanColor(tenant.subscriptionPlan) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={tenant.subscription_status || tenant.status || 'active'}
                  color={getStatusColor(tenant.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(tenant.created_at || tenant.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {tenant.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={tenant.subscriptionPlan}
              color={getPlanColor(tenant.subscriptionPlan) as any}
              size="small"
            />
            <Chip
              label={tenant.status}
              color={getStatusColor(tenant.status) as any}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {tenant.domain}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Edit />}>
            Edit Tenant
          </Button>
          <Button variant="contained" startIcon={<Settings />}>
            Settings
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<BarChart />} label="Overview" />
          <Tab icon={<LibraryBooks />} label="Libraries" />
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOverview()}
      {activeTab === 1 && renderLibraries()}
      {activeTab === 2 && renderUsers()}
      {activeTab === 3 && renderSettings()}
    </Box>
  );
};

export default TenantDetails;

