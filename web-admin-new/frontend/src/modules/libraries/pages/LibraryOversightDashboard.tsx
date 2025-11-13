// ============================================
// LIBRARY OVERSIGHT - COMPREHENSIVE DASHBOARD  
// Platform-wide library monitoring and analytics
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Business,
  LocationOn,
  EventSeat,
  TrendingUp,
  TrendingDown,
  Star,
  People,
  AttachMoney,
  Refresh,
  Download,
  Visibility,
  Edit,
  Block,
  CheckCircle,
  Warning,
  Assessment,
  Speed,
  Category,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from 'recharts';

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const LibraryOversightDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================
  // MOCK DATA - Platform-wide Library Metrics
  // ============================================

  const platformKPIs = {
    totalLibraries: 161,
    activeLibraries: 156,
    inactiveLibraries: 3,
    pendingApproval: 2,
    totalCapacity: 16280,
    currentOccupancy: 11456,
    availableSeats: 4824,
    occupancyRate: 70.4,
    totalStudents: 12847,
    totalRevenue: 3456000,
    monthlyRevenue: 845000,
    avgRevenuePerLibrary: 21466,
    avgStudentsPerLibrary: 79.8,
    avgRating: 4.6,
    avgOccupancy: 70.4,
  };

  const libraryGrowthData = [
    { month: 'May', libraries: 137, newAdded: 12, revenue: 2890000 },
    { month: 'Jun', libraries: 152, newAdded: 15, revenue: 3120000 },
    { month: 'Jul', libraries: 160, newAdded: 8, revenue: 3245000 },
    { month: 'Aug', libraries: 166, newAdded: 6, revenue: 3289000 },
    { month: 'Sep', libraries: 176, newAdded: 10, revenue: 3378000 },
    { month: 'Oct', libraries: 161, newAdded: 9, revenue: 3456000 },
  ];

  const occupancyTrendData = [
    { month: 'May', occupancy: 68.2, revenue: 289 },
    { month: 'Jun', occupancy: 70.5, revenue: 312 },
    { month: 'Jul', occupancy: 69.8, revenue: 324 },
    { month: 'Aug', occupancy: 71.2, revenue: 328 },
    { month: 'Sep', occupancy: 70.8, revenue: 337 },
    { month: 'Oct', occupancy: 70.4, revenue: 345 },
  ];

  const libraryTypeData = [
    { type: 'Study Library', count: 98, percentage: 60.9, color: '#E91E63' },
    { type: 'Co-working', count: 42, percentage: 26.1, color: '#9C27B0' },
    { type: 'Reading Room', count: 15, percentage: 9.3, color: '#2196F3' },
    { type: 'Hybrid', count: 6, percentage: 3.7, color: '#4CAF50' },
  ];

  const cityPerformanceData = [
    { city: 'Mumbai', libraries: 45, capacity: 4200, students: 3567, revenue: 678, occupancy: 72.5 },
    { city: 'Delhi', libraries: 38, capacity: 3600, students: 2845, revenue: 534, occupancy: 68.9 },
    { city: 'Bangalore', libraries: 32, capacity: 3100, students: 2234, revenue: 456, occupancy: 70.2 },
    { city: 'Pune', libraries: 24, capacity: 2300, students: 1678, revenue: 312, occupancy: 65.8 },
    { city: 'Hyderabad', libraries: 18, capacity: 1800, students: 1456, revenue: 289, occupancy: 69.3 },
    { city: 'Chennai', libraries: 14, capacity: 1280, students: 1067, revenue: 198, occupancy: 71.2 },
  ];

  const topPerformingLibraries = [
    { 
      id: 'LIB001', 
      name: 'Central Library', 
      city: 'Mumbai', 
      tenant: 'Central Network', 
      occupancy: 72.5, 
      revenue: 45600, 
      students: 245, 
      rating: 4.8, 
      growth: 28,
      capacity: 200,
      plan: 'Enterprise'
    },
    { 
      id: 'LIB002', 
      name: 'Tech Hub', 
      city: 'Bangalore', 
      tenant: 'Tech Study Hub', 
      occupancy: 65.3, 
      revenue: 38900, 
      students: 198, 
      rating: 4.6, 
      growth: 24,
      capacity: 150,
      plan: 'Professional'
    },
    { 
      id: 'LIB003', 
      name: 'Knowledge Point', 
      city: 'Delhi', 
      tenant: 'Knowledge Point', 
      occupancy: 78.0, 
      revenue: 31200, 
      students: 167, 
      rating: 4.5, 
      growth: 19,
      capacity: 100,
      plan: 'Starter'
    },
    { 
      id: 'LIB004', 
      name: 'Study Center', 
      city: 'Pune', 
      tenant: 'Study Network', 
      occupancy: 68.0, 
      revenue: 28900, 
      students: 145, 
      rating: 4.7, 
      growth: 22,
      capacity: 120,
      plan: 'Professional'
    },
    { 
      id: 'LIB005', 
      name: 'Learn Space', 
      city: 'Hyderabad', 
      tenant: 'Learn Space Inc', 
      occupancy: 71.0, 
      revenue: 26700, 
      students: 134, 
      rating: 4.4, 
      growth: 17,
      capacity: 110,
      plan: 'Starter'
    },
  ];

  const allLibrariesData = [
    {
      id: 'LIB001',
      libraryId: 'SS-LIB-001',
      name: 'Central Library',
      city: 'Mumbai',
      tenantName: 'Central Library Network',
      tenantPlan: 'Enterprise',
      type: 'Study Library',
      status: 'active',
      totalSeats: 200,
      occupied: 145,
      available: 55,
      occupancyRate: 72.5,
      students: 245,
      monthlyRevenue: 45600,
      rating: 4.8,
      reviewCount: 145,
      hasQR: true,
      hasFace: true,
      hasIoT: true,
      createdAt: '2024-01-15',
    },
    {
      id: 'LIB002',
      libraryId: 'SS-LIB-002',
      name: 'Tech Hub',
      city: 'Bangalore',
      tenantName: 'Tech Study Hub',
      tenantPlan: 'Professional',
      type: 'Co-working',
      status: 'active',
      totalSeats: 150,
      occupied: 98,
      available: 52,
      occupancyRate: 65.3,
      students: 198,
      monthlyRevenue: 38900,
      rating: 4.6,
      reviewCount: 98,
      hasQR: true,
      hasFace: false,
      hasIoT: true,
      createdAt: '2024-02-20',
    },
    {
      id: 'LIB003',
      libraryId: 'SS-LIB-003',
      name: 'Knowledge Point',
      city: 'Delhi',
      tenantName: 'Knowledge Point',
      tenantPlan: 'Starter',
      type: 'Study Library',
      status: 'active',
      totalSeats: 100,
      occupied: 78,
      available: 22,
      occupancyRate: 78.0,
      students: 167,
      monthlyRevenue: 31200,
      rating: 4.5,
      reviewCount: 82,
      hasQR: true,
      hasFace: false,
      hasIoT: false,
      createdAt: '2024-03-10',
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'default';
    if (status === 'suspended') return 'error';
    if (status === 'pending_approval') return 'warning';
    return 'default';
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'error';
    if (rate >= 60) return 'success';
    if (rate >= 40) return 'warning';
    return 'error';
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'Enterprise') return 'secondary';
    if (plan === 'Professional') return 'primary';
    if (plan === 'Starter') return 'info';
    return 'default';
  };

  // ============================================
  // DATAGRID COLUMNS
  // ============================================

  const libraryColumns: GridColDef[] = [
    {
      field: 'libraryId',
      headerName: 'Library ID',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Library Name',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'city',
      headerName: 'City',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Tenant',
      width: 180,
    },
    {
      field: 'tenantPlan',
      headerName: 'Plan',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getPlanColor(params.value) as any} 
          size="small" 
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: 'totalSeats',
      headerName: 'Capacity',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'occupancyRate',
      headerName: 'Occupancy',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;
        return (
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption">{row.occupied}/{row.totalSeats}</Typography>
              <Typography variant="caption" fontWeight="bold">{params.value.toFixed(1)}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={params.value}
              color={getOccupancyColor(params.value) as any}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        );
      },
    },
    {
      field: 'students',
      headerName: 'Students',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'monthlyRevenue',
      headerName: 'Revenue',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{(params.value / 1000).toFixed(0)}K
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Star sx={{ fontSize: 16, color: '#FFD700' }} />
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({row.reviewCount})
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => navigate(`/libraries/${params.row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // ============================================
  // TAB 1: OVERVIEW
  // ============================================

  const OverviewTab = () => {
    return (
      <Box>
        {/* KPI Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Libraries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {platformKPIs.totalLibraries}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Active: {platformKPIs.activeLibraries}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Business />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Platform Capacity
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {platformKPIs.totalCapacity.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total seats
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <EventSeat />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Occupancy Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {platformKPIs.occupancyRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {platformKPIs.currentOccupancy.toLocaleString()} occupied
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Avg Revenue/Library
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{(platformKPIs.avgRevenuePerLibrary / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Per month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AttachMoney />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Growth & Type Distribution Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Library Growth Trend
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Total libraries and monthly additions
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={libraryGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="libraries" 
                    stroke="#E91E63" 
                    strokeWidth={2}
                    name="Total Libraries" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newAdded" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    name="New Added" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Library Type Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Classification of all libraries
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={libraryTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent }: PieLabelRenderProps) => {
                      const label = payload?.type ?? payload?.name ?? '';
                      const value =
                        percent != null
                          ? (percent * 100).toFixed(1)
                          : payload?.percentage != null
                          ? (Number(payload.percentage) || 0).toFixed(1)
                          : '0.0';
                      return `${label}: ${value}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {libraryTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {libraryTypeData.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%' }} />
                        <Typography variant="body2">{item.type}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="bold">
                        {item.count} ({item.percentage}%)
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Occupancy Trend & Revenue */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Platform Occupancy Trend
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Average occupancy rate across all libraries
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={occupancyTrendData}>
                  <defs>
                    <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[60, 75]} />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#2196F3"
                    fillOpacity={1}
                    fill="url(#colorOccupancy)"
                    name="Occupancy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Revenue Growth
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Total platform revenue (in thousands ₹)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4CAF50" name="Revenue (K)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Top Performing Libraries Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Performing Libraries (Top 5)
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Ranked by overall performance score
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell><strong>City</strong></TableCell>
                    <TableCell><strong>Tenant</strong></TableCell>
                    <TableCell align="right"><strong>Capacity</strong></TableCell>
                    <TableCell align="right"><strong>Occupancy</strong></TableCell>
                    <TableCell align="right"><strong>Students</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Rating</strong></TableCell>
                    <TableCell align="right"><strong>Growth</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformingLibraries.map((library, index) => (
                    <TableRow key={library.id} hover>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color="primary" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {library.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{library.city}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {library.tenant}
                        </Typography>
                        <br />
                        <Chip label={library.plan} size="small" />
                      </TableCell>
                      <TableCell align="right">{library.capacity}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${library.occupancy}%`}
                          size="small"
                          color={getOccupancyColor(library.occupancy) as any}
                        />
                      </TableCell>
                      <TableCell align="right">{library.students}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{(library.revenue / 1000).toFixed(0)}K
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                          <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                          <Typography variant="body2">{library.rating}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`+${library.growth}%`} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // TAB 2: ALL LIBRARIES
  // ============================================

  const AllLibrariesTab = () => {
    return (
      <Box>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl size="small">
                <InputLabel>City</InputLabel>
                <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} label="City">
                  <MenuItem value="all">All Cities</MenuItem>
                  <MenuItem value="mumbai">Mumbai (45)</MenuItem>
                  <MenuItem value="delhi">Delhi (38)</MenuItem>
                  <MenuItem value="bangalore">Bangalore (32)</MenuItem>
                  <MenuItem value="pune">Pune (24)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Status</InputLabel>
                <Select defaultValue="all" label="Status">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending Approval</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select defaultValue="all" label="Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="study_library">Study Library</MenuItem>
                  <MenuItem value="coworking">Co-working</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {allLibrariesData.length} of {platformKPIs.totalLibraries} libraries
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Refresh />}>
              Refresh
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export
            </Button>
          </Stack>
        </Box>

        {/* DataGrid */}
        <Card>
          <CardContent>
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={allLibrariesData}
                columns={libraryColumns}
                pageSizeOptions={[10, 25, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ============================================
  // TAB 3: CITY DISTRIBUTION
  // ============================================

  const CityDistributionTab = () => {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Geographic Strategy:</strong> Identify expansion opportunities and optimize resource allocation by city
        </Alert>

        {/* City Performance Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Libraries & Students by City
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={cityPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="libraries" fill="#E91E63" name="Libraries" />
                <Bar yAxisId="right" dataKey="students" fill="#2196F3" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* City Performance Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              City-wise Performance Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>City</strong></TableCell>
                    <TableCell align="right"><strong>Libraries</strong></TableCell>
                    <TableCell align="right"><strong>Total Capacity</strong></TableCell>
                    <TableCell align="right"><strong>Students</strong></TableCell>
                    <TableCell align="right"><strong>Avg Students/Library</strong></TableCell>
                    <TableCell align="right"><strong>Occupancy</strong></TableCell>
                    <TableCell align="right"><strong>Monthly Revenue</strong></TableCell>
                    <TableCell align="right"><strong>Revenue/Library</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cityPerformanceData.map((city, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold">
                            {city.city}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={city.libraries} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">{city.capacity.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {city.students.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {Math.round(city.students / city.libraries)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${city.occupancy}%`}
                          size="small"
                          color={getOccupancyColor(city.occupancy) as any}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{city.revenue}K
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        ₹{(city.revenue / city.libraries).toFixed(0)}K
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Mumbai
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Largest Market
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              45 libraries • 3,567 students
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              79 students
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg per Library
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Platform average
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              ₹21.4K
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Revenue/Library
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Per month
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏢 Library Oversight
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform-wide library monitoring • {platformKPIs.totalLibraries} libraries across all tenants
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* Pending Approval Alert */}
      {platformKPIs.pendingApproval > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              <strong>{platformKPIs.pendingApproval} libraries</strong> pending approval
            </Typography>
            <Button size="small" variant="outlined">
              Review Now
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
          <Tab label="All Libraries" icon={<Business />} iconPosition="start" />
          <Tab label="City Distribution" icon={<LocationOn />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <OverviewTab />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <AllLibrariesTab />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <CityDistributionTab />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LibraryOversightDashboard;
