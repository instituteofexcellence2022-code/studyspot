import React, { useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Business,
  People,
  LibraryBooks,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Edit,
  Settings,
  BarChart,
  Timeline,
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
  ResponsiveContainer,
} from 'recharts';

interface TenantDetailsProps {
  tenantId: string;
}

const TenantDetails: React.FC<TenantDetailsProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data - replace with actual API call
  const tenant = {
    id: tenantId,
    name: 'University Library',
    domain: 'university.studyspot.com',
    subscriptionPlan: 'enterprise',
    status: 'active',
    users: 1250,
    libraries: 5,
    monthlyRevenue: 2500,
    createdAt: '2024-01-15',
    lastActive: '2024-01-20',
    contactEmail: 'admin@university.edu',
    contactPhone: '+1-555-0123',
    billingAddress: '123 University Ave, Campus City, ST 12345',
  };

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

  const getPlanColor = (plan: string) => {
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

  const getStatusColor = (status: string) => {
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
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{tenant.users}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LibraryBooks sx={{ color: 'success.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">{tenant.libraries}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Libraries
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ color: 'warning.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6">${tenant.monthlyRevenue}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
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
      <Grid item xs={12} md={8}>
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
      <Grid item xs={12} md={4}>
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
                    {user.name.split(' ').map(n => n[0]).join('')}
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
      <Grid item xs={12} md={6}>
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
                <Typography variant="body1">{tenant.contactEmail}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Contact Phone
                </Typography>
                <Typography variant="body1">{tenant.contactPhone}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Billing Address
                </Typography>
                <Typography variant="body1">{tenant.billingAddress}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
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
                  label={tenant.subscriptionPlan}
                  color={getPlanColor(tenant.subscriptionPlan) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={tenant.status}
                  color={getStatusColor(tenant.status) as any}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(tenant.createdAt).toLocaleDateString()}
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

