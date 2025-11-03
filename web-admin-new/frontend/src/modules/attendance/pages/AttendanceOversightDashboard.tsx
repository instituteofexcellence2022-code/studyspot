// ============================================
// ATTENDANCE OVERSIGHT DASHBOARD
// Platform-wide attendance tracking and analytics
// ============================================

import React, { useState, useMemo } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Badge,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  CheckCircle,
  Cancel,
  Schedule,
  TrendingUp,
  TrendingDown,
  People,
  Business,
  CalendarToday,
  LocationOn,
  Refresh,
  Download,
  FilterList,
  Visibility,
  Warning,
  EventAvailable,
  EventBusy,
  AccessTime,
  Assessment,
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
} from 'recharts';

const COLORS = ['#4CAF50', '#F44336', '#FF9800', '#2196F3', '#9C27B0', '#E91E63'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const AttendanceOversightDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  // KPIs
  const kpis = {
    totalAttendance: 8456,
    presentToday: 7234,
    absentToday: 1222,
    attendanceRate: 85.5,
    avgDailyAttendance: 7800,
    peakHour: '10:00 AM',
    lateCheckIns: 342,
    earlyCheckOuts: 125,
  };

  // Mock attendance records
  const attendanceRecords = [
    { id: 1, studentId: 'STU001', studentName: 'Rahul Sharma', library: 'Central Library', checkIn: '09:15 AM', checkOut: '06:30 PM', duration: '9h 15m', date: '2025-11-02', status: 'present' },
    { id: 2, studentId: 'STU002', studentName: 'Priya Patel', library: 'Tech Hub', checkIn: '08:45 AM', checkOut: '05:15 PM', duration: '8h 30m', date: '2025-11-02', status: 'present' },
    { id: 3, studentId: 'STU003', studentName: 'Amit Kumar', library: 'Study Center', checkIn: null, checkOut: null, duration: '-', date: '2025-11-02', status: 'absent' },
    { id: 4, studentId: 'STU004', studentName: 'Sneha Reddy', library: 'Central Library', checkIn: '10:30 AM', checkOut: null, duration: 'In Progress', date: '2025-11-02', status: 'present' },
    { id: 5, studentId: 'STU005', studentName: 'Vikram Singh', library: 'Tech Hub', checkIn: '09:00 AM', checkOut: '04:00 PM', duration: '7h', date: '2025-11-02', status: 'present' },
    { id: 6, studentId: 'STU006', studentName: 'Anjali Mehta', library: 'Study Center', checkIn: null, checkOut: null, duration: '-', date: '2025-11-02', status: 'absent' },
    { id: 7, studentId: 'STU007', studentName: 'Karthik Iyer', library: 'Central Library', checkIn: '08:30 AM', checkOut: '07:00 PM', duration: '10h 30m', date: '2025-11-02', status: 'present' },
    { id: 8, studentId: 'STU008', studentName: 'Divya Nair', library: 'Tech Hub', checkIn: '11:15 AM', checkOut: '06:45 PM', duration: '7h 30m', date: '2025-11-02', status: 'late' },
  ];

  // Analytics data
  const hourlyAttendanceData = [
    { hour: '8 AM', checkIns: 234, checkOuts: 12 },
    { hour: '9 AM', checkIns: 456, checkOuts: 45 },
    { hour: '10 AM', checkIns: 678, checkOuts: 89 },
    { hour: '11 AM', checkIns: 345, checkOuts: 123 },
    { hour: '12 PM', checkIns: 234, checkOuts: 234 },
    { hour: '1 PM', checkIns: 123, checkOuts: 345 },
    { hour: '2 PM', checkIns: 89, checkOuts: 456 },
    { hour: '3 PM', checkIns: 56, checkOuts: 567 },
    { hour: '4 PM', checkIns: 34, checkOuts: 678 },
    { hour: '5 PM', checkIns: 23, checkOuts: 789 },
    { hour: '6 PM', checkIns: 12, checkOuts: 890 },
    { hour: '7 PM', checkIns: 8, checkOuts: 456 },
  ];

  const weeklyTrendData = [
    { day: 'Mon', present: 6789, absent: 1234, rate: 84.6 },
    { day: 'Tue', present: 7012, absent: 1189, rate: 85.5 },
    { day: 'Wed', present: 7234, absent: 1156, rate: 86.2 },
    { day: 'Thu', present: 7089, absent: 1201, rate: 85.5 },
    { day: 'Fri', present: 6945, absent: 1278, rate: 84.5 },
    { day: 'Sat', present: 5678, absent: 2356, rate: 70.7 },
    { day: 'Sun', present: 4567, absent: 3489, rate: 56.7 },
  ];

  const libraryAttendanceData = [
    { library: 'Central Library', present: 2456, absent: 345, rate: 87.7 },
    { library: 'Tech Hub', present: 1987, absent: 234, rate: 89.5 },
    { library: 'Study Center', present: 1654, absent: 289, rate: 85.1 },
    { library: 'North Campus', present: 987, absent: 178, rate: 84.7 },
    { library: 'South Branch', present: 756, absent: 145, rate: 83.9 },
  ];

  const attendanceStatusDistribution = [
    { name: 'Present', value: 7234, percentage: 85.5, color: '#4CAF50' },
    { name: 'Absent', value: 1222, percentage: 14.5, color: '#F44336' },
  ];

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesLibrary = libraryFilter === 'all' || record.library === libraryFilter;
      return matchesSearch && matchesStatus && matchesLibrary;
    });
  }, [searchQuery, statusFilter, libraryFilter]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'studentName',
      headerName: 'Student',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {params.row.studentName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.studentName}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.studentId}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'library',
      headerName: 'Library',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" icon={<LocationOn fontSize="small" />} />
      ),
    },
    {
      field: 'checkIn',
      headerName: 'Check-In',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Chip label={params.value} size="small" color="success" variant="outlined" />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'checkOut',
      headerName: 'Check-Out',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Chip label={params.value} size="small" color="info" variant="outlined" />
        ) : (
          <Typography variant="caption" color="warning.main">In Progress</Typography>
        )
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 130,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig = {
          present: { label: 'Present', color: 'success' as const, icon: <CheckCircle /> },
          absent: { label: 'Absent', color: 'error' as const, icon: <Cancel /> },
          late: { label: 'Late', color: 'warning' as const, icon: <Schedule /> },
        };
        const config = statusConfig[params.value as keyof typeof statusConfig] || statusConfig.absent;
        return <Chip label={config.label} size="small" color={config.color} icon={config.icon} />;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: () => (
        <IconButton size="small" color="primary">
          <Visibility fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Tab 1: Today's Attendance
  const renderTodayTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Library</InputLabel>
              <Select value={libraryFilter} onChange={(e) => setLibraryFilter(e.target.value)}>
                <MenuItem value="all">All Libraries</MenuItem>
                <MenuItem value="Central Library">Central Library</MenuItem>
                <MenuItem value="Tech Hub">Tech Hub</MenuItem>
                <MenuItem value="Study Center">Study Center</MenuItem>
                <MenuItem value="North Campus">North Campus</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Download />} fullWidth>
              Export
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {filteredRecords.length} of {attendanceRecords.length} records
          </Typography>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Today's Attendance Records
          </Typography>
          <DataGrid
            rows={filteredRecords}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Analytics
  const renderAnalyticsTab = () => (
    <Box>
      {/* Hourly Pattern */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Hourly Check-In/Check-Out Pattern
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={hourlyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="checkIns" fill="#4CAF50" name="Check-Ins" />
              <Bar dataKey="checkOuts" fill="#2196F3" name="Check-Outs" />
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
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="present" stroke="#4CAF50" fill="url(#colorPresent)" name="Present" />
                <Line type="monotone" dataKey="rate" stroke="#E91E63" strokeWidth={2} name="Attendance Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏢 Library-wise Attendance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={libraryAttendanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="library" type="category" width={150} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="present" fill="#4CAF50" name="Present" stackId="a" />
                <Bar dataKey="absent" fill="#F44336" name="Absent" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Status Distribution */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Distribution Overview
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📋 Attendance Oversight Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Platform-wide attendance tracking and analytics • {kpis.totalAttendance.toLocaleString()} total students
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Present Today</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {kpis.presentToday.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpis.attendanceRate}% attendance rate
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'error.50', borderLeft: 4, borderColor: 'error.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Absent Today</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {kpis.absentToday.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((kpis.absentToday / kpis.totalAttendance) * 100).toFixed(1)}% absent
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main' }}>
                <Cancel />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Late Check-Ins</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {kpis.lateCheckIns}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  After 10:00 AM
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Schedule />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'info.50', borderLeft: 4, borderColor: 'info.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Peak Hour</Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {kpis.peakHour}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max activity
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <AccessTime />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Today's Attendance" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
          <Tab label="Reports" icon={<Download />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderTodayTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Alert severity="info">
              <Typography variant="body2">Reports module coming soon...</Typography>
            </Alert>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceOversightDashboard;

