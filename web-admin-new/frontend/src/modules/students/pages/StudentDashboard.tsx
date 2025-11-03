// ============================================
// STUDENT MANAGEMENT - DASHBOARD
// Platform-wide student overview and analytics
// ============================================

import React, { useState, useEffect } from 'react';
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
  Badge,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  People,
  PersonAdd,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney,
  School,
  LocationOn,
  Phone,
  Email,
  Refresh,
  Download,
  Send,
  Visibility,
  Edit,
  Block,
  Group,
  Timeline,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  CalendarToday,
  Assessment,
  FilterList,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
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

// Sortable Header Component
const SortIcon: React.FC<{ field: string; currentField: string; currentOrder: 'asc' | 'desc' }> = ({ field, currentField, currentOrder }) => {
  if (currentField === field) {
    return currentOrder === 'desc' ? 
      <ArrowDownward sx={{ fontSize: 16, color: 'primary.main' }} /> : 
      <ArrowUpward sx={{ fontSize: 16, color: 'primary.main' }} />;
  }
  return <UnfoldMore sx={{ fontSize: 16, color: 'text.disabled' }} />;
};

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  align?: 'left' | 'right' | 'center';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, field, currentSort, currentOrder, onSort, align = 'left' }) => {
  return (
    <TableCell 
      align={align}
      sx={{ 
        cursor: 'pointer', 
        userSelect: 'none',
        '&:hover': { bgcolor: 'grey.200' },
      }}
      onClick={() => onSort(field)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <strong>{label}</strong>
        <SortIcon field={field} currentField={currentSort} currentOrder={currentOrder} />
      </Box>
    </TableCell>
  );
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedLibrary, setSelectedLibrary] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting state for analytics tables
  const [timeSlotSort, setTimeSlotSort] = useState({ field: 'percentage', order: 'desc' as 'asc' | 'desc' });
  const [citySort, setCitySort] = useState({ field: 'students', order: 'desc' as 'asc' | 'desc' });
  
  // Two-layer filters for analytics charts
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all' | 'custom'>('30d'); // How far back
  const [analyticsGrouping, setAnalyticsGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('day'); // How to group
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Mock comprehensive student data
  const students = [
    {
      id: 'STU001',
      studentId: 'SS-001',
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      phone: '+91 98765 43210',
      city: 'Mumbai',
      primaryLibraryName: 'Central Library',
      tenantName: 'Central Library Network',
      membershipType: 'annual',
      membershipStatus: 'active',
      stats: {
        totalBookings: 156,
        totalAmountPaid: 45000,
        outstandingAmount: 0,
        attendancePercentage: 92,
      },
      engagement: {
        studyHours: 380,
        averageSessionDuration: 180,
        activityScore: 88,
        lastActiveDate: '2025-10-31',
      },
      paymentStatus: 'paid',
      createdAt: '2024-03-15',
    },
    {
      id: 'STU002',
      studentId: 'SS-002',
      fullName: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 98765 43211',
      city: 'Delhi',
      primaryLibraryName: 'Tech Library',
      tenantName: 'Tech Study Hub',
      membershipType: 'monthly',
      membershipStatus: 'active',
      stats: {
        totalBookings: 89,
        totalAmountPaid: 22000,
        outstandingAmount: 2500,
        attendancePercentage: 85,
      },
      engagement: {
        studyHours: 220,
        averageSessionDuration: 150,
        activityScore: 75,
        lastActiveDate: '2025-10-30',
      },
      paymentStatus: 'pending',
      createdAt: '2024-06-20',
    },
    {
      id: 'STU003',
      studentId: 'SS-003',
      fullName: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 98765 43212',
      city: 'Bangalore',
      primaryLibraryName: 'Knowledge Hub',
      tenantName: 'Knowledge Point',
      membershipType: 'quarterly',
      membershipStatus: 'active',
      stats: {
        totalBookings: 203,
        totalAmountPaid: 67000,
        outstandingAmount: 5000,
        attendancePercentage: 78,
      },
      engagement: {
        studyHours: 490,
        averageSessionDuration: 195,
        activityScore: 82,
        lastActiveDate: '2025-10-29',
      },
      paymentStatus: 'overdue',
      createdAt: '2024-01-10',
    },
  ];

  // KPIs
  const kpis = {
    totalStudents: 12847,
    activeStudents: 11234,
    newThisMonth: 845,
    churnedThisMonth: 156,
    retentionRate: 87.5,
    lifetimeValue: 18500,
    outstandingPayments: 1245000,
    averageAttendance: 84.2,
  };

  // Analytics Data
  // Dynamic data based on filters - Overview Tab
  const getStudentGrowthData = () => {
    // Base data that adjusts based on date range and grouping
    if (analyticsGrouping === 'hour' && (analyticsDateRange === '7d' || analyticsDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        newStudents: Math.floor(Math.random() * 50) + 10,
        churned: Math.floor(Math.random() * 10) + 2,
        netGrowth: Math.floor(Math.random() * 40) + 5
      }));
    } else if (analyticsGrouping === 'day') {
      const days = analyticsDateRange === '7d' ? 7 : analyticsDateRange === '30d' ? 30 : analyticsDateRange === '90d' ? 90 : 30;
      return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        label: `Day ${i + 1}`,
        newStudents: Math.floor(Math.random() * 100) + 50,
        churned: Math.floor(Math.random() * 20) + 5,
        netGrowth: Math.floor(Math.random() * 80) + 40
      }));
    } else if (analyticsGrouping === 'week') {
      const weeks = analyticsDateRange === '90d' ? 12 : analyticsDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        newStudents: Math.floor(Math.random() * 300) + 200,
        churned: Math.floor(Math.random() * 50) + 20,
        netGrowth: Math.floor(Math.random() * 250) + 150
      }));
    } else {
      // Month grouping
      return [
        { label: 'May', newStudents: 523, churned: 78, netGrowth: 445 },
        { label: 'Jun', newStudents: 612, churned: 92, netGrowth: 520 },
        { label: 'Jul', newStudents: 687, churned: 105, netGrowth: 582 },
        { label: 'Aug', newStudents: 734, churned: 124, netGrowth: 610 },
        { label: 'Sep', newStudents: 798, churned: 143, netGrowth: 655 },
        { label: 'Oct', newStudents: 845, churned: 156, netGrowth: 689 },
      ];
    }
  };

  const getCityDistributionData = () => {
    // City distribution adjusts based on date range
    const multiplier = analyticsDateRange === '7d' ? 0.2 : analyticsDateRange === '30d' ? 0.5 : analyticsDateRange === '90d' ? 0.8 : 1;
    return [
      { city: 'Mumbai', count: Math.floor(3567 * multiplier) },
      { city: 'Delhi', count: Math.floor(2845 * multiplier) },
      { city: 'Bangalore', count: Math.floor(2234 * multiplier) },
      { city: 'Pune', count: Math.floor(1678 * multiplier) },
      { city: 'Hyderabad', count: Math.floor(1456 * multiplier) },
      { city: 'Chennai', count: Math.floor(1067 * multiplier) },
    ];
  };

  const studentGrowth = getStudentGrowthData();

  const membershipDistribution = [
    { type: 'Annual', count: 4856, percentage: 37.8 },
    { type: 'Quarterly', count: 3589, percentage: 27.9 },
    { type: 'Monthly', count: 3214, percentage: 25.0 },
    { type: 'Trial', count: 1188, percentage: 9.3 },
  ];

  const cityDistribution = getCityDistributionData();

  const churnRiskStudents = [
    { id: 'STU045', name: 'Neha Singh', library: 'Central Library', riskScore: 85, lastActive: '15 days ago', reason: 'Low attendance' },
    { id: 'STU089', name: 'Rohit Verma', library: 'Tech Hub', riskScore: 78, lastActive: '10 days ago', reason: 'Payment overdue' },
    { id: 'STU123', name: 'Kavita Desai', library: 'Study Center', riskScore: 72, lastActive: '8 days ago', reason: 'Decreased usage' },
  ];

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual': return 'secondary';
      case 'quarterly': return 'primary';
      case 'monthly': return 'info';
      case 'trial': return 'default';
      default: return 'default';
    }
  };

  // Student List Columns
  const studentColumns: GridColDef[] = [
    {
      field: 'studentId',
      headerName: 'Student ID',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Student Name',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>{params.value.charAt(0)}</Avatar>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    { field: 'city', headerName: 'City', width: 120 },
    {
      field: 'primaryLibraryName',
      headerName: 'Primary Library',
      width: 150,
    },
    {
      field: 'membershipType',
      headerName: 'Membership',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getMembershipColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'stats',
      headerName: 'Bookings',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          {params.value.totalBookings}
        </Typography>
      ),
    },
    {
      field: 'engagement',
      headerName: 'Activity',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${params.value.activityScore}%`}
          size="small"
          color={params.value.activityScore >= 80 ? 'success' : params.value.activityScore >= 60 ? 'warning' : 'error'}
        />
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getPaymentStatusColor(params.value) as any}
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
          <Tooltip title="View Full Details">
            <IconButton 
              size="small"
              onClick={() => navigate(`/students/${params.row.id}`)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              size="small"
              onClick={() => {
                // TODO: Navigate to edit page or open edit dialog
                console.log('Edit student:', params.row.id);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Tab 1: Overview
  const renderOverviewTab = () => (
    <Box>
      {/* Active Filters Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Active Filters:</strong> {analyticsDateRange === 'custom' && customDateRange.from && customDateRange.to 
            ? `Custom Range (${new Date(customDateRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customDateRange.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` 
            : analyticsDateRange === '7d' ? 'Last 7 Days' 
            : analyticsDateRange === '30d' ? 'Last 30 Days' 
            : analyticsDateRange === '90d' ? 'Last 90 Days' 
            : analyticsDateRange === '1y' ? 'Last Year' 
            : 'All Time'} | <strong>Grouped By:</strong> {analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}
        </Typography>
      </Alert>

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
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.totalStudents.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="success.main">
                  +{kpis.newThisMonth} this month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <People />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Active Students
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.activeStudents.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((kpis.activeStudents / kpis.totalStudents) * 100).toFixed(1)}% of total
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Retention Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.retentionRate}%
                </Typography>
                <Typography variant="caption" color="success.main">
                  ↑ 2.3% from last month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
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
                  Avg Lifetime Value
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{(kpis.lifetimeValue / 1000).toFixed(1)}K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Per student
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AttachMoney />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Growth & Churn */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Student Growth Trend - By {analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={studentGrowth}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F44336" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F44336" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newStudents"
                  stroke="#4CAF50"
                  fillOpacity={1}
                  fill="url(#colorNew)"
                  name="New Students"
                />
                <Area
                  type="monotone"
                  dataKey="churned"
                  stroke="#F44336"
                  fillOpacity={1}
                  fill="url(#colorChurn)"
                  name="Churned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Membership Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={membershipDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.type}: ${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* City Distribution & Churn Risk */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Students by City
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#E91E63" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Churn Risk Alert
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Students at risk of leaving the platform
            </Typography>
            <Box sx={{ mt: 2 }}>
              {churnRiskStudents.map((student) => (
                <Paper key={student.id} sx={{ p: 2, mb: 2, bgcolor: '#FFF3E0' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.library} • {student.lastActive}
                      </Typography>
                      <Typography variant="caption" display="block" color="error.main">
                        {student.reason}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={`${student.riskScore}%`}
                        color="error"
                        size="small"
                      />
                      <Button size="small" variant="outlined" startIcon={<Send />}>
                        Contact
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 2: All Students
  const renderAllStudentsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <People sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small">
              <InputLabel>Library</InputLabel>
              <Select value={selectedLibrary} onChange={(e) => setSelectedLibrary(e.target.value)} label="Library">
                <MenuItem value="all">All Libraries</MenuItem>
                <MenuItem value="lib1">Central Library</MenuItem>
                <MenuItem value="lib2">Tech Library</MenuItem>
                <MenuItem value="lib3">Knowledge Hub</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select defaultValue="all" label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Payment Status</InputLabel>
              <Select defaultValue="all" label="Payment Status">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<PersonAdd />}>
            Add Student
          </Button>
          <Button variant="outlined" startIcon={<Send />}>
            Bulk Message
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
        </Stack>
      </Box>

      {/* Student DataGrid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={students}
              columns={studentColumns}
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

  // Sort handlers
  const handleTimeSlotSort = (field: string) => {
    setTimeSlotSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCitySort = (field: string) => {
    setCitySort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Analytics Data - Dynamic based on date range AND grouping
  const getStudyHoursTrendData = () => {
    // Hourly grouping (only for 7d or 30d range)
    if (analyticsGrouping === 'hour') {
      if (analyticsDateRange === '7d' || analyticsDateRange === '30d') {
        return [
          { label: '00-04', hours: 45, students: 12, avgPerStudent: 3.8 },
          { label: '04-08', hours: 78, students: 18, avgPerStudent: 4.3 },
          { label: '08-12', hours: 156, students: 42, avgPerStudent: 3.7 },
          { label: '12-16', hours: 234, students: 68, avgPerStudent: 3.4 },
          { label: '16-20', hours: 312, students: 89, avgPerStudent: 3.5 },
          { label: '20-24', hours: 198, students: 54, avgPerStudent: 3.7 },
        ];
      }
    }
    
    // Daily grouping
    if (analyticsGrouping === 'day') {
      if (analyticsDateRange === '7d') {
        return [
          { label: 'Mon', hours: 1180, students: 520, avgPerStudent: 2.3 },
          { label: 'Tue', hours: 1240, students: 545, avgPerStudent: 2.3 },
          { label: 'Wed', hours: 1285, students: 560, avgPerStudent: 2.3 },
          { label: 'Thu', hours: 1350, students: 580, avgPerStudent: 2.3 },
          { label: 'Fri', hours: 1390, students: 595, avgPerStudent: 2.3 },
          { label: 'Sat', hours: 920, students: 450, avgPerStudent: 2.0 },
          { label: 'Sun', hours: 835, students: 380, avgPerStudent: 2.2 },
        ];
      } else if (analyticsDateRange === '30d') {
        const days = [];
        for (let i = 1; i <= 30; i++) {
          days.push({ 
            label: `Day ${i}`, 
            hours: 1000 + Math.random() * 400, 
            students: 500 + Math.random() * 100, 
            avgPerStudent: 2 + Math.random() * 0.5 
          });
        }
        return days;
      }
    }
    
    // Weekly grouping
    if (analyticsGrouping === 'week') {
      if (analyticsDateRange === '30d' || analyticsDateRange === '90d') {
        const weeks = analyticsDateRange === '30d' ? 4 : 13;
        return Array.from({ length: weeks }, (_, i) => ({
          label: `Week ${i + 1}`,
          hours: 4500 + i * 500,
          students: 450 + i * 35,
          avgPerStudent: 10 + i * 0.2,
        }));
      }
    }
    
    // Monthly grouping
    if (analyticsGrouping === 'month') {
      if (analyticsDateRange === '1y' || analyticsDateRange === 'all') {
        return [
          { label: 'Jan', hours: 3200, students: 380, avgPerStudent: 8.4 },
          { label: 'Feb', hours: 3650, students: 405, avgPerStudent: 9.0 },
          { label: 'Mar', hours: 4100, students: 428, avgPerStudent: 9.6 },
          { label: 'Apr', hours: 4500, students: 450, avgPerStudent: 10 },
          { label: 'May', hours: 5200, students: 485, avgPerStudent: 10.7 },
          { label: 'Jun', hours: 5800, students: 520, avgPerStudent: 11.2 },
          { label: 'Jul', hours: 6500, students: 565, avgPerStudent: 11.5 },
          { label: 'Aug', hours: 7200, students: 610, avgPerStudent: 11.8 },
          { label: 'Sep', hours: 7800, students: 655, avgPerStudent: 11.9 },
          { label: 'Oct', hours: 8200, students: 682, avgPerStudent: 12 },
          { label: 'Nov', hours: 8600, students: 695, avgPerStudent: 12.4 },
          { label: 'Dec', hours: 8950, students: 710, avgPerStudent: 12.6 },
        ];
      } else if (analyticsDateRange === '90d') {
        return [
          { label: 'Month 1', hours: 6500, students: 565, avgPerStudent: 11.5 },
          { label: 'Month 2', hours: 7200, students: 610, avgPerStudent: 11.8 },
          { label: 'Month 3', hours: 8200, students: 682, avgPerStudent: 12 },
        ];
      }
    }
    
    // Default fallback
    return [
      { label: 'Apr', hours: 4500, students: 450, avgPerStudent: 10 },
      { label: 'May', hours: 5200, students: 485, avgPerStudent: 10.7 },
      { label: 'Jun', hours: 5800, students: 520, avgPerStudent: 11.2 },
      { label: 'Jul', hours: 6500, students: 565, avgPerStudent: 11.5 },
      { label: 'Aug', hours: 7200, students: 610, avgPerStudent: 11.8 },
      { label: 'Sep', hours: 7800, students: 655, avgPerStudent: 11.9 },
      { label: 'Oct', hours: 8200, students: 682, avgPerStudent: 12 },
    ];
  };

  const getAttendanceTrendData = () => {
    // Hourly grouping
    if (analyticsGrouping === 'hour') {
      return [
        { label: '00-04', present: 12, absent: 8, percentage: 60 },
        { label: '04-08', present: 85, absent: 15, percentage: 85 },
        { label: '08-12', present: 156, absent: 24, percentage: 87 },
        { label: '12-16', present: 234, absent: 28, percentage: 89 },
        { label: '16-20', present: 198, absent: 32, percentage: 86 },
        { label: '20-24', present: 95, absent: 25, percentage: 79 },
      ];
    }
    
    // Daily grouping
    if (analyticsGrouping === 'day') {
      if (analyticsDateRange === '7d') {
        return [
          { label: 'Mon', present: 520, absent: 162, percentage: 76 },
          { label: 'Tue', present: 545, absent: 137, percentage: 80 },
          { label: 'Wed', present: 560, absent: 122, percentage: 82 },
          { label: 'Thu', present: 580, absent: 102, percentage: 85 },
          { label: 'Fri', present: 595, absent: 87, percentage: 87 },
          { label: 'Sat', present: 450, absent: 232, percentage: 66 },
          { label: 'Sun', present: 380, absent: 302, percentage: 56 },
        ];
      } else if (analyticsDateRange === '30d') {
        const days = [];
        for (let i = 1; i <= 30; i++) {
          const present = 500 + Math.floor(Math.random() * 100);
          const absent = 100 + Math.floor(Math.random() * 100);
          days.push({ 
            label: `D${i}`, 
            present, 
            absent, 
            percentage: Math.round((present / (present + absent)) * 100) 
          });
        }
        return days;
      }
    }
    
    // Weekly grouping
    if (analyticsGrouping === 'week') {
      const weeks = analyticsDateRange === '30d' ? 4 : analyticsDateRange === '90d' ? 13 : 4;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        present: 3500 + i * 100,
        absent: 650 - i * 20,
        percentage: 84 + i,
      }));
    }
    
    // Monthly grouping
    if (analyticsGrouping === 'month') {
      if (analyticsDateRange === '1y' || analyticsDateRange === 'all') {
        return [
          { label: 'Jan', present: 11200, absent: 2800, percentage: 80 },
          { label: 'Feb', present: 11850, absent: 2550, percentage: 82 },
          { label: 'Mar', present: 12400, absent: 2400, percentage: 84 },
          { label: 'Apr', present: 12950, absent: 2250, percentage: 85 },
          { label: 'May', present: 13500, absent: 2100, percentage: 87 },
          { label: 'Jun', present: 14100, absent: 1900, percentage: 88 },
          { label: 'Jul', present: 14700, absent: 1800, percentage: 89 },
          { label: 'Aug', present: 15200, absent: 1700, percentage: 90 },
          { label: 'Sep', present: 15800, absent: 1600, percentage: 91 },
          { label: 'Oct', present: 16400, absent: 1500, percentage: 92 },
        ];
      }
    }
    
    // Default
    return [
      { label: 'Week 1', present: 520, absent: 162, percentage: 76 },
      { label: 'Week 2', present: 545, absent: 137, percentage: 80 },
      { label: 'Week 3', present: 560, absent: 122, percentage: 82 },
      { label: 'Week 4', present: 595, absent: 87, percentage: 87 },
    ];
  };

  const getRetentionData = () => {
    // Daily grouping
    if (analyticsGrouping === 'day' && analyticsDateRange === '7d') {
      return [
        { label: 'Mon', retained: 520, churned: 5, rate: 99 },
        { label: 'Tue', retained: 543, churned: 2, rate: 99.6 },
        { label: 'Wed', retained: 558, churned: 2, rate: 99.6 },
        { label: 'Thu', retained: 578, churned: 2, rate: 99.7 },
        { label: 'Fri', retained: 593, churned: 2, rate: 99.7 },
        { label: 'Sat', retained: 448, churned: 2, rate: 99.6 },
        { label: 'Sun', retained: 378, churned: 2, rate: 99.5 },
      ];
    }
    
    // Weekly grouping
    if (analyticsGrouping === 'week') {
      const weeks = analyticsDateRange === '30d' ? 4 : analyticsDateRange === '90d' ? 13 : 4;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        retained: 3500 + i * 100,
        churned: 30 - i * 2,
        rate: 95 + i * 0.3,
      }));
    }
    
    // Monthly grouping
    if (analyticsGrouping === 'month' && (analyticsDateRange === '1y' || analyticsDateRange === 'all')) {
      return [
        { label: 'Jan', retained: 365, churned: 15, rate: 96 },
        { label: 'Feb', retained: 390, churned: 15, rate: 96 },
        { label: 'Mar', retained: 413, churned: 15, rate: 96 },
        { label: 'Apr', retained: 420, churned: 30, rate: 93 },
        { label: 'May', retained: 465, churned: 20, rate: 96 },
        { label: 'Jun', retained: 500, churned: 20, rate: 96 },
        { label: 'Jul', retained: 545, churned: 20, rate: 96 },
        { label: 'Aug', retained: 590, churned: 20, rate: 97 },
        { label: 'Sep', retained: 635, churned: 20, rate: 97 },
        { label: 'Oct', retained: 662, churned: 20, rate: 97 },
        { label: 'Nov', retained: 675, churned: 20, rate: 97 },
        { label: 'Dec', retained: 690, churned: 20, rate: 97 },
      ];
    }
    
    // Default
    return [
      { label: 'Week 1', retained: 3420, churned: 30, rate: 99.1 },
      { label: 'Week 2', retained: 3465, churned: 20, rate: 99.4 },
      { label: 'Week 3', retained: 3500, churned: 20, rate: 99.4 },
      { label: 'Week 4', retained: 3545, churned: 20, rate: 99.4 },
    ];
  };

  // Analytics Data
  const analyticsData = {
    studyHoursTrend: getStudyHoursTrendData(),
    attendanceTrend: getAttendanceTrendData(),
    retentionData: getRetentionData(),
    libraryDistribution: [
      { library: 'Central Library', students: 285, percentage: 42 },
      { library: 'East Branch', students: 195, percentage: 29 },
      { library: 'West Branch', students: 128, percentage: 19 },
      { library: 'North Hub', students: 74, percentage: 10 },
    ],
    subscriptionDistribution: [
      { plan: 'Monthly', count: 312, revenue: 468000, percentage: 46 },
      { plan: 'Quarterly', count: 245, revenue: 661500, percentage: 36 },
      { plan: 'Annual', count: 125, revenue: 1125000, percentage: 18 },
    ],
    engagementLevels: [
      { level: 'High (20+ h/week)', count: 234, percentage: 34, color: '#4CAF50' },
      { level: 'Medium (10-20h)', count: 312, percentage: 46, color: '#2196F3' },
      { level: 'Low (5-10h)', count: 98, percentage: 14, color: '#FF9800' },
      { level: 'Inactive (Under 5h)', count: 38, percentage: 6, color: '#F44336' },
    ],
    paymentStatus: [
      { status: 'Paid in Full', count: 589, percentage: 86, color: '#4CAF50' },
      { status: 'Partial Payment', count: 67, percentage: 10, color: '#FF9800' },
      { status: 'Overdue', count: 26, percentage: 4, color: '#F44336' },
    ],
    timeSlotPreference: [
      { slot: '6-10 AM', students: 89, hours: 712, percentage: 13 },
      { slot: '10-2 PM', students: 178, hours: 2136, percentage: 26 },
      { slot: '2-6 PM', students: 268, hours: 3216, percentage: 39 },
      { slot: '6-10 PM', students: 147, hours: 1764, percentage: 22 },
    ],
    cityWiseDistribution: [
      { city: 'Mumbai', students: 285, revenue: 2850000 },
      { city: 'Delhi', students: 198, revenue: 1980000 },
      { city: 'Bangalore', students: 134, revenue: 1340000 },
      { city: 'Pune', students: 65, revenue: 650000 },
    ],
    performanceMetrics: [
      { metric: 'Average Study Hours/Student', value: '12h/week', trend: '+8%', color: 'success' },
      { metric: 'Average Attendance Rate', value: '78%', trend: '+5%', color: 'success' },
      { metric: 'Payment Collection Rate', value: '96%', trend: '+2%', color: 'success' },
      { metric: 'Student Retention Rate', value: '97%', trend: '+1%', color: 'success' },
    ],
  };

  // Tab 3: Analytics
  const renderAnalyticsTab = () => (
    <Box>
      {/* Analytics Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📊 Comprehensive Student Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Deep insights into student behavior, engagement, revenue, and platform performance (filters applied from above)
        </Typography>
      </Box>

      {/* REMOVED: Duplicate Filter Section - Now using global filters above tabs */}
      {false && <Card sx={{ bgcolor: 'grey.50' }}>
          <CardContent>
            {/* Layer 1: Date Range - How far back to look */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule /> Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Last 7 Days"
                  onClick={() => setAnalyticsDateRange('7d')}
                  color={analyticsDateRange === '7d' ? 'primary' : 'default'}
                  variant={analyticsDateRange === '7d' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Last 30 Days"
                  onClick={() => setAnalyticsDateRange('30d')}
                  color={analyticsDateRange === '30d' ? 'primary' : 'default'}
                  variant={analyticsDateRange === '30d' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Last 90 Days"
                  onClick={() => setAnalyticsDateRange('90d')}
                  color={analyticsDateRange === '90d' ? 'primary' : 'default'}
                  variant={analyticsDateRange === '90d' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Last Year"
                  onClick={() => setAnalyticsDateRange('1y')}
                  color={analyticsDateRange === '1y' ? 'primary' : 'default'}
                  variant={analyticsDateRange === '1y' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="All Time"
                  onClick={() => setAnalyticsDateRange('all')}
                  color={analyticsDateRange === 'all' ? 'primary' : 'default'}
                  variant={analyticsDateRange === 'all' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Custom Range"
                  onClick={() => {
                    setAnalyticsDateRange('custom');
                    setShowCustomDatePicker(true);
                  }}
                  color={analyticsDateRange === 'custom' ? 'primary' : 'default'}
                  variant={analyticsDateRange === 'custom' ? 'filled' : 'outlined'}
                  size="small"
                  icon={<CalendarToday />}
                />
              </Box>

              {/* Ultra Compact Inline Custom Date Picker */}
              {showCustomDatePicker && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                  {/* Quick Presets */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Quick:</Typography>
                    {[
                      { label: 'W', tooltip: 'This Week', calc: () => {
                        const today = new Date();
                        const monday = new Date(today);
                        monday.setDate(today.getDate() - today.getDay() + 1);
                        return { from: monday.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                      }},
                      { label: 'M', tooltip: 'This Month', calc: () => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                      }},
                      { label: 'Q', tooltip: 'This Quarter', calc: () => {
                        const today = new Date();
                        const quarter = Math.floor(today.getMonth() / 3);
                        const firstDay = new Date(today.getFullYear(), quarter * 3, 1);
                        return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                      }},
                      { label: 'Y', tooltip: 'This Year', calc: () => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), 0, 1);
                        return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                      }}
                    ].map((preset) => (
                      <Tooltip key={preset.label} title={preset.tooltip} arrow>
                        <Chip
                          label={preset.label}
                          size="small"
                          onClick={() => {
                            const range = preset.calc();
                            setCustomDateRange(range);
                          }}
                          sx={{ 
                            height: 26, 
                            width: 30, 
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'primary.50' }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>

                  {/* Date Pickers */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      type="date"
                      size="small"
                      value={customDateRange.from}
                      onChange={(e) => {
                        setCustomDateRange(prev => ({ ...prev, from: e.target.value }));
                        if (customDateRange.to && e.target.value > customDateRange.to) {
                          setCustomDateRange(prev => ({ ...prev, to: e.target.value }));
                        }
                      }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        max: new Date().toISOString().split('T')[0]
                      }}
                      slotProps={{
                        input: {
                          sx: {
                            width: 140,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">→</Typography>
                    <TextField
                      type="date"
                      size="small"
                      value={customDateRange.to}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: customDateRange.from || undefined,
                        max: new Date().toISOString().split('T')[0]
                      }}
                      disabled={!customDateRange.from}
                      slotProps={{
                        input: {
                          sx: {
                            width: 140,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        if (customDateRange.from && customDateRange.to && new Date(customDateRange.from) <= new Date(customDateRange.to)) {
                          setShowCustomDatePicker(false);
                        }
                      }}
                      disabled={!customDateRange.from || !customDateRange.to || new Date(customDateRange.from) > new Date(customDateRange.to)}
                      startIcon={<CheckCircle fontSize="small" />}
                    >
                      Apply
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowCustomDatePicker(false);
                        setCustomDateRange({ from: '', to: '' });
                        setAnalyticsDateRange('30d');
                      }}
                    >
                      <Block fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Selected Range Info - Inline Badge */}
                  {customDateRange.from && customDateRange.to && new Date(customDateRange.from) <= new Date(customDateRange.to) && (
                    <Chip
                      icon={<CheckCircle fontSize="small" />}
                      label={`${Math.ceil((new Date(customDateRange.to).getTime() - new Date(customDateRange.from).getTime()) / (1000 * 60 * 60 * 24))} days`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ height: 28 }}
                    />
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Layer 2: Grouping - How to group the data */}
            <Box>
              <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline /> Group By
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label="Hour"
                  onClick={() => setAnalyticsGrouping('hour')}
                  color={analyticsGrouping === 'hour' ? 'secondary' : 'default'}
                  variant={analyticsGrouping === 'hour' ? 'filled' : 'outlined'}
                  size="small"
                  disabled={!(analyticsDateRange === '7d' || analyticsDateRange === '30d')}
                />
                <Chip
                  label="Day"
                  onClick={() => setAnalyticsGrouping('day')}
                  color={analyticsGrouping === 'day' ? 'secondary' : 'default'}
                  variant={analyticsGrouping === 'day' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Week"
                  onClick={() => setAnalyticsGrouping('week')}
                  color={analyticsGrouping === 'week' ? 'secondary' : 'default'}
                  variant={analyticsGrouping === 'week' ? 'filled' : 'outlined'}
                  size="small"
                  disabled={analyticsDateRange === '7d'}
                />
                <Chip
                  label="Month"
                  onClick={() => setAnalyticsGrouping('month')}
                  color={analyticsGrouping === 'month' ? 'secondary' : 'default'}
                  variant={analyticsGrouping === 'month' ? 'filled' : 'outlined'}
                  size="small"
                  disabled={!(analyticsDateRange === '1y' || analyticsDateRange === 'all')}
                />
              </Box>
            </Box>

            {/* Current Selection Summary */}
            <Alert severity="info" sx={{ mt: 2 }}>
              Showing: <strong>
                {analyticsDateRange === '7d' ? 'Last 7 Days' : 
                 analyticsDateRange === '30d' ? 'Last 30 Days' : 
                 analyticsDateRange === '90d' ? 'Last 90 Days' : 
                 analyticsDateRange === '1y' ? 'Last Year' : 
                 analyticsDateRange === 'custom' && customDateRange.from && customDateRange.to ? 
                   `${new Date(customDateRange.from).toLocaleDateString()} - ${new Date(customDateRange.to).toLocaleDateString()}` : 
                   'All Time'}
              </strong> grouped by <strong>
                {analyticsGrouping === 'hour' ? 'Hour' : 
                 analyticsGrouping === 'day' ? 'Day' : 
                 analyticsGrouping === 'week' ? 'Week' : 'Month'}
              </strong>
            </Alert>
          </CardContent>
        </Card>}

      {/* Performance Metrics KPIs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {analyticsData.performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {metric.metric}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  {metric.value}
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label={metric.trend}
                  color={metric.color as any}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Study Hours Growth Trend */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Study Hours Trend - By {analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.studyHoursTrend}>
                <defs>
                  <linearGradient id="colorStudyHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E91E63" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="hours" stroke="#E91E63" fillOpacity={1} fill="url(#colorStudyHours)" name="Total Hours" />
                <Line type="monotone" dataKey="avgPerStudent" stroke="#9C27B0" strokeWidth={2} name="Avg/Student" />
              </AreaChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Study Hours (Oct)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  8,200h
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Avg per Student
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  12h/week
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Attendance by Day of Week */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Attendance Pattern - By {analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="present" fill="#4CAF50" name="Present" stackId="a" />
                <Bar dataKey="absent" fill="#FF5252" name="Absent" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Peak Attendance Day
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                Friday - 87%
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Student Distribution by Library */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Student Distribution by Library
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.libraryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.library}: ${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {analyticsData.libraryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Largest Library
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Central Library - 285 students
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Subscription Plan Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Subscription Plan Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.subscriptionDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#2196F3" name="Students" />
                <Bar yAxisId="right" dataKey="revenue" fill="#4CAF50" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Most Popular Plan
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Monthly - 312 students
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Engagement Level Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Student Engagement Levels
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.engagementLevels}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.engagementLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                High Engagement Students
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                234 (34%)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Student Retention Rate */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Student Retention - By {analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[90, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#4CAF50" strokeWidth={3} name="Retention Rate %" />
              </LineChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Current Retention Rate
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                97%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Time Slot Preference Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📅 Time Slot Preference Analysis
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <SortableHeader 
                    label="Time Slot" 
                    field="slot" 
                    currentSort={timeSlotSort.field} 
                    currentOrder={timeSlotSort.order} 
                    onSort={handleTimeSlotSort}
                  />
                  <SortableHeader 
                    label="Students" 
                    field="students" 
                    currentSort={timeSlotSort.field} 
                    currentOrder={timeSlotSort.order} 
                    onSort={handleTimeSlotSort}
                    align="right"
                  />
                  <SortableHeader 
                    label="Total Hours" 
                    field="hours" 
                    currentSort={timeSlotSort.field} 
                    currentOrder={timeSlotSort.order} 
                    onSort={handleTimeSlotSort}
                    align="right"
                  />
                  <SortableHeader 
                    label="Avg Hours/Student" 
                    field="avgHours" 
                    currentSort={timeSlotSort.field} 
                    currentOrder={timeSlotSort.order} 
                    onSort={handleTimeSlotSort}
                    align="right"
                  />
                  <SortableHeader 
                    label="Usage %" 
                    field="percentage" 
                    currentSort={timeSlotSort.field} 
                    currentOrder={timeSlotSort.order} 
                    onSort={handleTimeSlotSort}
                    align="right"
                  />
                  <TableCell><strong>Distribution</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...analyticsData.timeSlotPreference]
                  .sort((a, b) => {
                    const aVal = timeSlotSort.field === 'slot' ? a.slot : 
                                 timeSlotSort.field === 'students' ? a.students :
                                 timeSlotSort.field === 'hours' ? a.hours :
                                 timeSlotSort.field === 'avgHours' ? (a.hours / a.students) :
                                 a.percentage;
                    const bVal = timeSlotSort.field === 'slot' ? b.slot : 
                                 timeSlotSort.field === 'students' ? b.students :
                                 timeSlotSort.field === 'hours' ? b.hours :
                                 timeSlotSort.field === 'avgHours' ? (b.hours / b.students) :
                                 b.percentage;
                    
                    if (typeof aVal === 'string') {
                      return timeSlotSort.order === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
                    }
                    return timeSlotSort.order === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
                  })
                  .map((slot, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {slot.slot}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={slot.students} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {slot.hours.toLocaleString()}h
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {(slot.hours / slot.students).toFixed(1)}h
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {slot.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <LinearProgress
                        variant="determinate"
                        value={slot.percentage}
                        sx={{ height: 8, borderRadius: 1 }}
                        color={slot.percentage > 30 ? 'success' : slot.percentage > 20 ? 'info' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* City-wise Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🌍 Geographic Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <SortableHeader 
                    label="City" 
                    field="city" 
                    currentSort={citySort.field} 
                    currentOrder={citySort.order} 
                    onSort={handleCitySort}
                  />
                  <SortableHeader 
                    label="Students" 
                    field="students" 
                    currentSort={citySort.field} 
                    currentOrder={citySort.order} 
                    onSort={handleCitySort}
                    align="right"
                  />
                  <SortableHeader 
                    label="Revenue" 
                    field="revenue" 
                    currentSort={citySort.field} 
                    currentOrder={citySort.order} 
                    onSort={handleCitySort}
                    align="right"
                  />
                  <SortableHeader 
                    label="Avg Revenue/Student" 
                    field="avgRevenue" 
                    currentSort={citySort.field} 
                    currentOrder={citySort.order} 
                    onSort={handleCitySort}
                    align="right"
                  />
                  <TableCell><strong>Distribution</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...analyticsData.cityWiseDistribution]
                  .sort((a, b) => {
                    const aVal = citySort.field === 'city' ? a.city : 
                                 citySort.field === 'students' ? a.students :
                                 citySort.field === 'revenue' ? a.revenue :
                                 (a.revenue / a.students);
                    const bVal = citySort.field === 'city' ? b.city : 
                                 citySort.field === 'students' ? b.students :
                                 citySort.field === 'revenue' ? b.revenue :
                                 (b.revenue / b.students);
                    
                    if (typeof aVal === 'string') {
                      return citySort.order === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
                    }
                    return citySort.order === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
                  })
                  .map((city, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          {city.city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={city.students} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ₹{city.revenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ₹{(city.revenue / city.students).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <LinearProgress
                        variant="determinate"
                        value={(city.students / kpis.totalStudents) * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Engagement and Payment Status */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Engagement Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Engagement Level Breakdown
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {analyticsData.engagementLevels.map((level, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {level.level}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {level.count} ({level.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={level.percentage}
                    sx={{ height: 10, borderRadius: 1, bgcolor: 'grey.200' }}
                    style={{ backgroundColor: level.color + '30' }}
                  />
                  <Box sx={{ height: 10, width: `${level.percentage}%`, bgcolor: level.color, borderRadius: 1, mt: -1.25 }} />
                </Box>
              ))}
            </Stack>
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>80%</strong> of students have medium to high engagement levels
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Status Overview
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {analyticsData.paymentStatus.map((status, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {status.status}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {status.count} ({status.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={status.percentage}
                    sx={{ height: 10, borderRadius: 1, bgcolor: 'grey.200' }}
                    style={{ backgroundColor: status.color + '30' }}
                  />
                  <Box sx={{ height: 10, width: `${status.percentage}%`, bgcolor: status.color, borderRadius: 1, mt: -1.25 }} />
                </Box>
              ))}
            </Stack>
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>96%</strong> payment collection rate across all students
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>

      {/* Key Insights */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💡 Key Insights & Recommendations
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Strong Growth:</strong> 8% increase in avg study hours per student over the last 6 months
              </Typography>
            </Alert>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Peak Performance:</strong> 2-6 PM slot is most popular with 39% of all bookings
              </Typography>
            </Alert>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Excellent Retention:</strong> 97% student retention rate, well above industry average
              </Typography>
            </Alert>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Opportunity:</strong> Weekend attendance (56-66%) could be improved with targeted campaigns
              </Typography>
            </Alert>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>High Engagement:</strong> 34% of students are highly engaged ({'>'}20h/week)
              </Typography>
            </Alert>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Payment Health:</strong> Only 4% overdue payments, excellent collection rate
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', borderTop: 3, borderColor: 'primary.main' }}>
          <Typography variant="caption" color="text.secondary">
            Total Revenue (Oct)
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            ₹22.5L
          </Typography>
          <Chip icon={<TrendingUp />} label="+15%" color="success" size="small" sx={{ mt: 1 }} />
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', borderTop: 3, borderColor: 'success.main' }}>
          <Typography variant="caption" color="text.secondary">
            Avg Revenue/Student
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            ₹3,300
          </Typography>
          <Chip label="Stable" color="info" size="small" sx={{ mt: 1 }} />
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', borderTop: 3, borderColor: 'info.main' }}>
          <Typography variant="caption" color="text.secondary">
            Active Students
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="info.main">
            589
          </Typography>
          <Typography variant="caption" color="text.secondary">
            86% of total
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', borderTop: 3, borderColor: 'warning.main' }}>
          <Typography variant="caption" color="text.secondary">
            Churn Rate
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            3%
          </Typography>
          <Chip icon={<TrendingDown />} label="Improving" color="success" size="small" sx={{ mt: 1 }} />
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📚 Student Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform-wide student oversight • {kpis.totalStudents.toLocaleString()} students across all libraries
        </Typography>
      </Box>

      {/* Global Filters for Charts */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CalendarToday fontSize="small" /> Date Range & Grouping Filters (Applies to all charts)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Date Range Filter */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {['7d', '30d', '90d', '1y', 'all', 'custom'].map((range) => (
                <Chip
                  key={range}
                  label={range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : range === '1y' ? 'Last Year' : range === 'all' ? 'All Time' : 'Custom Range'}
                  onClick={() => {
                    if (range === 'custom') {
                      setShowCustomDatePicker(!showCustomDatePicker);
                    } else {
                      setAnalyticsDateRange(range as any);
                      setShowCustomDatePicker(false);
                    }
                  }}
                  color={analyticsDateRange === range ? 'primary' : 'default'}
                  variant={analyticsDateRange === range ? 'filled' : 'outlined'}
                  size="small"
                  icon={range === 'custom' ? <CalendarToday /> : undefined}
                />
              ))}
            </Box>

            {/* Ultra Compact Inline Custom Date Picker */}
            {showCustomDatePicker && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                {/* Quick Presets */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>Quick:</Typography>
                  {[
                    { label: 'W', tooltip: 'This Week', calc: () => {
                      const today = new Date();
                      const monday = new Date(today);
                      monday.setDate(today.getDate() - today.getDay() + 1);
                      return { from: monday.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                    }},
                    { label: 'M', tooltip: 'This Month', calc: () => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                    }},
                    { label: 'Q', tooltip: 'This Quarter', calc: () => {
                      const today = new Date();
                      const quarter = Math.floor(today.getMonth() / 3);
                      const firstDay = new Date(today.getFullYear(), quarter * 3, 1);
                      return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                    }},
                    { label: 'Y', tooltip: 'This Year', calc: () => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), 0, 1);
                      return { from: firstDay.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
                    }}
                  ].map((preset) => (
                    <Tooltip key={preset.label} title={preset.tooltip} arrow>
                      <Chip
                        label={preset.label}
                        size="small"
                        onClick={() => {
                          const range = preset.calc();
                          setCustomDateRange(range);
                        }}
                        sx={{ 
                          height: 26, 
                          width: 30, 
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'primary.50' }
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>

                {/* Date Pickers */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    type="date"
                    size="small"
                    value={customDateRange.from}
                    onChange={(e) => {
                      setCustomDateRange(prev => ({ ...prev, from: e.target.value }));
                      if (customDateRange.to && e.target.value > customDateRange.to) {
                        setCustomDateRange(prev => ({ ...prev, to: e.target.value }));
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0]
                    }}
                    slotProps={{
                      input: {
                        sx: {
                          width: 140,
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <TextField
                    type="date"
                    size="small"
                    value={customDateRange.to}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: customDateRange.from || undefined,
                      max: new Date().toISOString().split('T')[0]
                    }}
                    disabled={!customDateRange.from}
                    slotProps={{
                      input: {
                        sx: {
                          width: 140,
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }
                      }
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      if (customDateRange.from && customDateRange.to && new Date(customDateRange.from) <= new Date(customDateRange.to)) {
                        setShowCustomDatePicker(false);
                      }
                    }}
                    disabled={!customDateRange.from || !customDateRange.to || new Date(customDateRange.from) > new Date(customDateRange.to)}
                    startIcon={<CheckCircle fontSize="small" />}
                  >
                    Apply
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setShowCustomDatePicker(false);
                      setCustomDateRange({ from: '', to: '' });
                      setAnalyticsDateRange('30d');
                    }}
                  >
                    <Block fontSize="small" />
                  </IconButton>
                </Box>

                {/* Selected Range Info - Inline Badge */}
                {customDateRange.from && customDateRange.to && new Date(customDateRange.from) <= new Date(customDateRange.to) && (
                  <Chip
                    icon={<CheckCircle fontSize="small" />}
                    label={`${Math.ceil((new Date(customDateRange.to).getTime() - new Date(customDateRange.from).getTime()) / (1000 * 60 * 60 * 24))} days`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 28 }}
                  />
                )}
              </Box>
            )}
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Group By Filter */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Group By
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label="Hour"
                onClick={() => setAnalyticsGrouping('hour')}
                color={analyticsGrouping === 'hour' ? 'secondary' : 'default'}
                variant={analyticsGrouping === 'hour' ? 'filled' : 'outlined'}
                size="small"
                disabled={!(analyticsDateRange === '7d' || analyticsDateRange === '30d')}
              />
              <Chip
                label="Day"
                onClick={() => setAnalyticsGrouping('day')}
                color={analyticsGrouping === 'day' ? 'secondary' : 'default'}
                variant={analyticsGrouping === 'day' ? 'filled' : 'outlined'}
                size="small"
              />
              <Chip
                label="Week"
                onClick={() => setAnalyticsGrouping('week')}
                color={analyticsGrouping === 'week' ? 'secondary' : 'default'}
                variant={analyticsGrouping === 'week' ? 'filled' : 'outlined'}
                size="small"
                disabled={analyticsDateRange === '7d'}
              />
              <Chip
                label="Month"
                onClick={() => setAnalyticsGrouping('month')}
                color={analyticsGrouping === 'month' ? 'secondary' : 'default'}
                variant={analyticsGrouping === 'month' ? 'filled' : 'outlined'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<Timeline />} iconPosition="start" />
          <Tab label="All Students" icon={<Group />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Today's Attendance" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Attendance Analytics" icon={<Assessment />} iconPosition="start" />
          <Tab label="Attendance Reports" icon={<Download />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderOverviewTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderAllStudentsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            {renderTodayAttendanceTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            {renderAttendanceAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            {renderAttendanceReportsTab()}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );

  // ============================================
  // ATTENDANCE TABS
  // ============================================

  function renderTodayAttendanceTab() {
    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📅 Today's Student Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Real-time attendance tracking for all students across libraries
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> This shows consolidated attendance data from all libraries. 
            For detailed attendance management, visit individual library pages.
          </Typography>
        </Alert>

        {/* Attendance KPIs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3 }}>
          <Card sx={{ bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Present Today</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">7,234</Typography>
              <Typography variant="caption" color="text.secondary">85.5% attendance</Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ bgcolor: 'error.50', borderLeft: 4, borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Absent Today</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">1,222</Typography>
              <Typography variant="caption" color="text.secondary">14.5% absent</Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Late Check-Ins</Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">156</Typography>
              <Typography variant="caption" color="text.secondary">After 10:00 AM</Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'info.50', borderLeft: 4, borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Peak Hour</Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">10 AM</Typography>
              <Typography variant="caption" color="text.secondary">Max activity</Typography>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Avg Duration</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">6.5h</Typography>
              <Typography variant="caption" color="text.secondary">Per student</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                placeholder="Search students..."
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select defaultValue="all">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Library</InputLabel>
                <Select defaultValue="all">
                  <MenuItem value="all">All Libraries</MenuItem>
                  <MenuItem value="central">Central Library</MenuItem>
                  <MenuItem value="tech">Tech Hub</MenuItem>
                  <MenuItem value="study">Study Center</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Download />}>
                Export
              </Button>
              <Button variant="outlined" startIcon={<Refresh />}>
                Refresh
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Today's Attendance Records
            </Typography>
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={students.slice(0, 20).map((s: any, idx: number) => ({
                  id: idx,
                  studentId: s.id,
                  studentName: s.name,
                  library: s.library,
                  checkIn: idx % 5 === 0 ? '-' : ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'][idx % 4],
                  checkOut: idx % 5 === 0 ? '-' : ['05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'][idx % 4],
                  duration: idx % 5 === 0 ? '-' : ['9h 0m', '9h 30m', '9h 0m', '9h 0m'][idx % 4],
                  status: idx % 5 === 0 ? 'absent' : idx % 7 === 0 ? 'late' : 'present',
                }))}
                columns={[
                  { field: 'studentId', headerName: 'Student ID', width: 120 },
                  { field: 'studentName', headerName: 'Student Name', width: 200 },
                  { field: 'library', headerName: 'Library', width: 180 },
                  { 
                    field: 'checkIn', 
                    headerName: 'Check-In', 
                    width: 130,
                    renderCell: (params) => params.value === '-' ? '-' : <Chip label={params.value} size="small" color="success" variant="outlined" />
                  },
                  { 
                    field: 'checkOut', 
                    headerName: 'Check-Out', 
                    width: 130,
                    renderCell: (params) => params.value === '-' ? '-' : <Chip label={params.value} size="small" color="info" variant="outlined" />
                  },
                  { field: 'duration', headerName: 'Duration', width: 120 },
                  { 
                    field: 'status', 
                    headerName: 'Status', 
                    width: 120,
                    renderCell: (params) => {
                      const colors: any = { present: 'success', absent: 'error', late: 'warning' };
                      return <Chip label={params.value} size="small" color={colors[params.value]} />;
                    }
                  },
                  { 
                    field: 'actions', 
                    headerName: 'Actions', 
                    width: 100,
                    renderCell: () => (
                      <IconButton size="small" color="primary">
                        <Visibility fontSize="small" />
                      </IconButton>
                    )
                  },
                ]}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  function renderAttendanceAnalyticsTab() {
    // Attendance analytics data
    const hourlyAttendancePattern = [
      { hour: '8 AM', checkIns: 1234, checkOuts: 45, present: 1189 },
      { hour: '9 AM', checkIns: 2456, checkOuts: 123, present: 3522 },
      { hour: '10 AM', checkIns: 1678, checkOuts: 234, present: 4966 },
      { hour: '11 AM', checkIns: 945, checkOuts: 456, present: 5455 },
      { hour: '12 PM', checkIns: 678, checkOuts: 789, present: 5344 },
      { hour: '1 PM', checkIns: 456, checkOuts: 1234, present: 4566 },
      { hour: '2 PM', checkIns: 345, checkOuts: 1456, present: 3455 },
      { hour: '3 PM', checkIns: 234, checkOuts: 1678, present: 2011 },
      { hour: '4 PM', checkIns: 123, checkOuts: 1890, present: 244 },
      { hour: '5 PM', checkIns: 89, checkOuts: 2123, present: 210 },
      { hour: '6 PM', checkIns: 45, checkOuts: 1890, present: 365 },
      { hour: '7 PM', checkIns: 23, checkOuts: 345, present: 43 },
    ];

    const weeklyAttendanceTrend = [
      { day: 'Mon', present: 6789, absent: 1234, rate: 84.6, lateArrivals: 234 },
      { day: 'Tue', present: 7012, absent: 1189, rate: 85.5, lateArrivals: 198 },
      { day: 'Wed', present: 7234, absent: 1156, rate: 86.2, lateArrivals: 176 },
      { day: 'Thu', present: 7089, absent: 1201, rate: 85.5, lateArrivals: 201 },
      { day: 'Fri', present: 6945, absent: 1278, rate: 84.5, lateArrivals: 289 },
      { day: 'Sat', present: 5678, absent: 2356, rate: 70.7, lateArrivals: 456 },
      { day: 'Sun', present: 4567, absent: 3489, rate: 56.7, lateArrivals: 567 },
    ];

    const libraryAttendanceData = [
      { library: 'Central Library', present: 2456, absent: 345, capacity: 3000, utilization: 81.9, avgDuration: '7.2h' },
      { library: 'Tech Hub', present: 1987, absent: 234, capacity: 2500, utilization: 79.5, avgDuration: '6.8h' },
      { library: 'Study Center', present: 1654, absent: 289, capacity: 2200, utilization: 75.2, avgDuration: '6.5h' },
      { library: 'North Campus', present: 987, absent: 178, capacity: 1500, utilization: 65.8, avgDuration: '5.9h' },
      { library: 'South Branch', present: 756, absent: 145, capacity: 1200, utilization: 63.0, avgDuration: '5.5h' },
    ];

    const attendanceBySubscription = [
      { plan: 'Premium', students: 3456, attendance: 94.5, avgHours: 7.5 },
      { plan: 'Standard', students: 8934, attendance: 87.2, avgHours: 6.8 },
      { plan: 'Basic', students: 12456, attendance: 82.1, avgHours: 6.2 },
      { plan: 'Trial', students: 3610, attendance: 76.3, avgHours: 5.5 },
    ];

    const peakHoursAnalysis = [
      { timeSlot: '8-10 AM', students: 3890, libraries: 5, avgWait: '12 min', status: 'High' },
      { timeSlot: '10-12 PM', students: 6410, libraries: 5, avgWait: '8 min', status: 'Peak' },
      { timeSlot: '12-2 PM', students: 5122, libraries: 5, avgWait: '15 min', status: 'High' },
      { timeSlot: '2-4 PM', students: 4589, libraries: 5, avgWait: '10 min', status: 'Moderate' },
      { timeSlot: '4-6 PM', students: 2255, libraries: 5, avgWait: '5 min', status: 'Low' },
      { timeSlot: '6-8 PM', students: 408, libraries: 3, avgWait: '2 min', status: 'Low' },
    ];

    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📊 Attendance Analytics & Insights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive attendance patterns, trends, and performance metrics
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>High Attendance Rate:</strong> Platform-wide attendance is at 85.5% - above the target of 80%.
          </Typography>
        </Alert>

        {/* Analytics Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList /> Analytics Filters
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select defaultValue="7d" label="Date Range">
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                    <MenuItem value="30d">Last 30 Days</MenuItem>
                    <MenuItem value="90d">Last 90 Days</MenuItem>
                    <MenuItem value="1y">Last Year</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Group By</InputLabel>
                  <Select defaultValue="day" label="Group By">
                    <MenuItem value="hour">Hourly</MenuItem>
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                  </Select>
                </FormControl>

                <Button variant="outlined" startIcon={<Refresh />}>
                  Reset
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Hourly Check-In/Out Pattern */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              ⏰ Hourly Check-In/Check-Out Pattern
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Real-time student movement tracking throughout the day
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={hourlyAttendancePattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="checkIns" fill="#4CAF50" name="Check-Ins" radius={[8, 8, 0, 0]} />
                <Bar dataKey="checkOuts" fill="#2196F3" name="Check-Outs" radius={[8, 8, 0, 0]} />
                <Bar dataKey="present" fill="#FF9800" name="Currently Present" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend & Library Distribution */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📅 Weekly Attendance Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyAttendanceTrend}>
                  <defs>
                    <linearGradient id="colorPresentAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stroke="#4CAF50" fill="url(#colorPresentAttendance)" name="Present" />
                  <Line type="monotone" dataKey="rate" stroke="#E91E63" strokeWidth={2} name="Attendance Rate %" />
                  <Line type="monotone" dataKey="lateArrivals" stroke="#FF9800" strokeWidth={2} name="Late Arrivals" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Attendance Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: 7234, color: '#4CAF50' },
                      { name: 'Absent', value: 1222, color: '#F44336' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.value / 8456) * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Present', value: 7234, color: '#4CAF50' },
                      { name: 'Absent', value: 1222, color: '#F44336' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Library-wise Attendance Performance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🏢 Library-wise Attendance Performance
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Detailed analysis of attendance across all library locations
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell align="center"><strong>Present</strong></TableCell>
                    <TableCell align="center"><strong>Absent</strong></TableCell>
                    <TableCell align="center"><strong>Capacity</strong></TableCell>
                    <TableCell align="center"><strong>Utilization %</strong></TableCell>
                    <TableCell align="center"><strong>Avg Duration</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {libraryAttendanceData.map((lib, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{lib.library}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={lib.present.toLocaleString()} size="small" color="success" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={lib.absent.toLocaleString()} size="small" color="error" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{lib.capacity.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={lib.utilization} 
                            sx={{ width: 80, height: 6, borderRadius: 3 }}
                            color={lib.utilization >= 80 ? 'success' : lib.utilization >= 60 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption">{lib.utilization}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="info.main">{lib.avgDuration}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={lib.utilization >= 80 ? '🔥 High' : lib.utilization >= 60 ? '📊 Good' : '⚠️ Low'} 
                          size="small"
                          color={lib.utilization >= 80 ? 'success' : lib.utilization >= 60 ? 'primary' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Peak Hours Analysis */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🕒 Peak Hours Analysis
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Busiest time slots across all libraries
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Time Slot</strong></TableCell>
                    <TableCell align="center"><strong>Students</strong></TableCell>
                    <TableCell align="center"><strong>Libraries Active</strong></TableCell>
                    <TableCell align="center"><strong>Avg Wait Time</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {peakHoursAnalysis.map((slot, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{slot.timeSlot}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={slot.students.toLocaleString()} 
                          size="small" 
                          color={slot.status === 'Peak' ? 'error' : slot.status === 'High' ? 'warning' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{slot.libraries}/5</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color={parseInt(slot.avgWait) > 10 ? 'warning.main' : 'success.main'}>
                          {slot.avgWait}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={slot.status} 
                          size="small"
                          color={slot.status === 'Peak' ? 'error' : slot.status === 'High' ? 'warning' : slot.status === 'Moderate' ? 'info' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Subscription-based Attendance */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💎 Attendance by Subscription Plan
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Correlation between plan type and attendance behavior
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceBySubscription}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="students" fill="#2196F3" name="Total Students" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceBySubscription}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#4CAF50" name="Attendance %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avgHours" fill="#FF9800" name="Avg Hours" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  function renderAttendanceReportsTab() {
    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📄 Attendance Reports & Exports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate, download, and schedule attendance reports
        </Typography>

        {/* Report Generation UI */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Generate New Report
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Type</InputLabel>
                <Select defaultValue="daily">
                  <MenuItem value="daily">Daily Summary</MenuItem>
                  <MenuItem value="weekly">Weekly Report</MenuItem>
                  <MenuItem value="monthly">Monthly Report</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Library</InputLabel>
                <Select defaultValue="all">
                  <MenuItem value="all">All Libraries</MenuItem>
                  <MenuItem value="central">Central Library</MenuItem>
                  <MenuItem value="tech">Tech Hub</MenuItem>
                  <MenuItem value="study">Study Center</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Format</InputLabel>
                <Select defaultValue="excel">
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button variant="contained" startIcon={<Download />} fullWidth>
              Generate & Download Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Reports
            </Typography>
            <Stack spacing={2}>
              {[
                { name: 'Daily Attendance - Nov 2, 2025', date: '2 hours ago', size: '2.3 MB', format: 'Excel' },
                { name: 'Weekly Report - Week 44', date: 'Yesterday', size: '5.1 MB', format: 'PDF' },
                { name: 'Monthly Summary - October', date: '2 days ago', size: '8.7 MB', format: 'Excel' },
              ].map((report, idx) => (
                <Paper key={idx} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">{report.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Generated {report.date} • {report.size} • {report.format}
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<Download />} size="small">
                    Download
                  </Button>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }
};

export default StudentDashboard;

