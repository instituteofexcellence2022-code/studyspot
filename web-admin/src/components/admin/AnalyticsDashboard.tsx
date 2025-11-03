import { Tooltip as MuiTooltip } from '@mui/material';
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer

  } from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('30d');

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000, users: 2400, bookings: 1200 },
    { month: 'Feb', revenue: 3000, users: 1398, bookings: 980 },
    { month: 'Mar', revenue: 2000, users: 9800, bookings: 1200 },
    { month: 'Apr', revenue: 2780, users: 3908, bookings: 1400 },
    { month: 'May', revenue: 1890, users: 4800, bookings: 1100 },
    { month: 'Jun', revenue: 2390, users: 3800, bookings: 1300 },
  ];

  const userGrowthData = [
    { date: '2024-01-01', users: 1000, newUsers: 50 },
    { date: '2024-01-02', users: 1050, newUsers: 45 },
    { date: '2024-01-03', users: 1095, newUsers: 60 },
    { date: '2024-01-04', users: 1155, newUsers: 40 },
    { date: '2024-01-05', users: 1195, newUsers: 55 },
    { date: '2024-01-06', users: 1250, newUsers: 70 },
    { date: '2024-01-07', users: 1320, newUsers: 65 },
  ];

  const bookingData = [
    { day: 'Mon', bookings: 120, revenue: 2400 },
    { day: 'Tue', bookings: 150, revenue: 3000 },
    { day: 'Wed', bookings: 180, revenue: 3600 },
    { day: 'Thu', bookings: 200, revenue: 4000 },
    { day: 'Fri', bookings: 220, revenue: 4400 },
    { day: 'Sat', bookings: 190, revenue: 3800 },
    { day: 'Sun', bookings: 160, revenue: 3200 },
  ];

  const subscriptionData = [
    { name: 'Basic', value: 45, color: '#8884d8' },
    { name: 'Premium', value: 35, color: '#82ca9d' },
    { name: 'Enterprise', value: 20, color: '#ffc658' },
  ];

  const topLibrariesData = [
    { name: 'University Library', bookings: 450, revenue: 9000 },
    { name: 'City Public Library', bookings: 320, revenue: 6400 },
    { name: 'Tech Institute', bookings: 280, revenue: 5600 },
    { name: 'Community Center', bookings: 250, revenue: 5000 },
    { name: 'Research Library', bookings: 200, revenue: 4000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" gutterBottom>
                $45,678
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="caption" color="success.main">
                +15% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" gutterBottom>
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
              <Typography variant="caption" color="success.main">
                +8% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" gutterBottom>
                5,678
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bookings
              </Typography>
              <Typography variant="caption" color="success.main">
                +12% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main" gutterBottom>
                24
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tenants
              </Typography>
              <Typography variant="caption" color="success.main">
                +3 new this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue & User Growth Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Subscription Distribution */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subscription Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Bookings */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Booking Patterns
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Growth */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Libraries */}
        <Grid xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Libraries
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topLibrariesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <RechartsTooltip />
                <Bar dataKey="bookings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;

