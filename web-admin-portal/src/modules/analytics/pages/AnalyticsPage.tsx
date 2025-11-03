// ============================================
// ANALYTICS DASHBOARD PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 120, active: 95 },
    { month: 'Feb', users: 145, active: 118 },
    { month: 'Mar', users: 178, active: 142 },
    { month: 'Apr', users: 210, active: 175 },
    { month: 'May', users: 245, active: 205 },
    { month: 'Jun', users: 280, active: 240 },
  ];

  const tenantStatsData = [
    { name: 'Central Library', value: 45 },
    { name: 'University Hub', value: 35 },
    { name: 'Downtown Center', value: 25 },
    { name: 'City Network', value: 20 },
    { name: 'Tech Institute', value: 15 },
  ];

  const activityData = [
    { day: 'Mon', logins: 85, actions: 320 },
    { day: 'Tue', logins: 92, actions: 380 },
    { day: 'Wed', logins: 78, actions: 290 },
    { day: 'Thu', logins: 95, actions: 410 },
    { day: 'Fri', logins: 102, actions: 450 },
    { day: 'Sat', logins: 65, actions: 220 },
    { day: 'Sun', logins: 58, actions: 190 },
  ];

  const roleDistributionData = [
    { name: 'Viewers', value: 120, color: '#9E9E9E' },
    { name: 'Support', value: 85, color: '#00BCD4' },
    { name: 'Admins', value: 65, color: '#2196F3' },
    { name: 'Super Admins', value: 10, color: '#F44336' },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: '280',
      change: '+12%',
      icon: <PeopleIcon />,
      color: '#2196F3',
    },
    {
      title: 'Active Tenants',
      value: '42',
      change: '+5',
      icon: <BusinessIcon />,
      color: '#4CAF50',
    },
    {
      title: 'Avg Session Time',
      value: '24m',
      change: '+8%',
      icon: <TrendingUpIcon />,
      color: '#FF9800',
    },
    {
      title: 'Total Sessions',
      value: '1,845',
      change: '+15%',
      icon: <AssessmentIcon />,
      color: '#9C27B0',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <TextField
          select
          size="small"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="7d">Last 7 Days</MenuItem>
          <MenuItem value="30d">Last 30 Days</MenuItem>
          <MenuItem value="90d">Last 90 Days</MenuItem>
          <MenuItem value="1y">Last Year</MenuItem>
        </TextField>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box
                  sx={{
                    bgcolor: stat.color + '20',
                    color: stat.color,
                    p: 1,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  color={stat.change.startsWith('+') ? 'success' : 'error'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Row 1 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* User Growth Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              User Growth
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total and active users over time
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#2196F3"
                    strokeWidth={2}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Weekly Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Logins and user actions per day
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="logins" fill="#9C27B0" name="Logins" />
                  <Bar dataKey="actions" fill="#FF9800" name="Actions" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row 2 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        {/* Role Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              User Role Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Breakdown by user roles
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Tenant Stats */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top Tenants by Users
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              User count per tenant
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenantStatsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00BCD4" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;

