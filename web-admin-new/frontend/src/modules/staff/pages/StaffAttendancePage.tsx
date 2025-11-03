// ============================================
// STAFF ATTENDANCE MODULE
// QR code check-in/out, attendance tracking & management
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  QrCodeScanner,
  QrCode2,
  Login,
  Logout,
  CameraAlt,
  Print,
  ContentCopy,
  Timer,
  CheckBox,
  History,
  Email,
  Phone,
  Badge as BadgeIcon,
  Summarize,
  Close,
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

const StaffAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [dateRangeStart, setDateRangeStart] = useState('2025-10-01');
  const [dateRangeEnd, setDateRangeEnd] = useState('2025-11-02');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrGeneratorOpen, setQrGeneratorOpen] = useState(false);
  const [checkInQrOpen, setCheckInQrOpen] = useState(false);
  const [checkOutQrOpen, setCheckOutQrOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'check-in' | 'check-out'>('check-in');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [staffDetailsOpen, setStaffDetailsOpen] = useState(false);
  const [attendanceHistoryOpen, setAttendanceHistoryOpen] = useState(false);
  
  // Analytics Filters
  const [analyticsDateRange, setAnalyticsDateRange] = useState('7d');
  const [analyticsGrouping, setAnalyticsGrouping] = useState('day');

  // Platform Staff Attendance KPIs
  const kpis = {
    totalStaff: 45,
    checkedInToday: 42,
    checkedOutToday: 28,
    currentlyPresent: 14,
    attendanceRate: 93.3,
    avgCheckInTime: '9:45 AM',
    lateArrivals: 3,
    earlyDepartures: 2,
    onLeave: 3,
  };

  // Mock platform staff attendance records (SaaS Platform Staff)
  const attendanceRecords = [
    { id: 1, staffId: 'PLT001', staffName: 'Rajesh Kumar', role: 'Platform Admin', department: 'Administration', location: 'HQ - Bangalore', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 2, staffId: 'PLT002', staffName: 'Anjali Sharma', role: 'Support Manager', department: 'Customer Support', location: 'HQ - Bangalore', checkIn: '08:45 AM', checkOut: '05:30 PM', duration: '8h 45m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 3, staffId: 'PLT003', staffName: 'Priya Desai', role: 'Operations Manager', department: 'Operations', location: 'HQ - Bangalore', checkIn: '08:30 AM', checkOut: '05:45 PM', duration: '9h 15m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 4, staffId: 'PLT004', staffName: 'Vikram Patel', role: 'Senior Developer', department: 'Engineering', location: 'HQ - Bangalore', checkIn: '10:00 AM', checkOut: null, duration: 'In Progress', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 5, staffId: 'PLT005', staffName: 'Sneha Reddy', role: 'Product Manager', department: 'Product', location: 'Remote', checkIn: '09:15 AM', checkOut: '06:00 PM', duration: '8h 45m', date: '2025-11-02', status: 'present', method: 'Manual' },
    { id: 6, staffId: 'PLT006', staffName: 'Amit Verma', role: 'DevOps Engineer', department: 'Engineering', location: 'HQ - Bangalore', checkIn: null, checkOut: null, duration: '-', date: '2025-11-02', status: 'on_leave', method: '-' },
    { id: 7, staffId: 'PLT007', staffName: 'Neha Singh', role: 'Customer Success', department: 'Customer Support', location: 'HQ - Mumbai', checkIn: '09:30 AM', checkOut: '06:15 PM', duration: '8h 45m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 8, staffId: 'PLT008', staffName: 'Divya Nair', role: 'QA Lead', department: 'Engineering', location: 'HQ - Bangalore', checkIn: '11:15 AM', checkOut: '06:45 PM', duration: '7h 30m', date: '2025-11-02', status: 'late', method: 'QR Code' },
    { id: 9, staffId: 'PLT009', staffName: 'Arjun Mehta', role: 'Backend Developer', department: 'Engineering', location: 'Remote', checkIn: '10:20 AM', checkOut: '07:40 PM', duration: '9h 20m', date: '2025-11-02', status: 'present', method: 'Manual' },
    { id: 10, staffId: 'PLT010', staffName: 'Kavita Joshi', role: 'Finance Manager', department: 'Finance', location: 'HQ - Bangalore', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 11, staffId: 'PLT011', staffName: 'Rahul Gupta', role: 'Sales Manager', department: 'Sales & Marketing', location: 'HQ - Mumbai', checkIn: '09:30 AM', checkOut: '06:30 PM', duration: '9h 0m', date: '2025-11-02', status: 'present', method: 'QR Code' },
    { id: 12, staffId: 'PLT012', staffName: 'Sanjay Iyer', role: 'HR Manager', department: 'Human Resources', location: 'HQ - Bangalore', checkIn: '09:00 AM', checkOut: '05:45 PM', duration: '8h 45m', date: '2025-11-02', status: 'present', method: 'QR Code' },
  ];

  // Analytics data - Staff Specific
  const hourlyAttendanceData = [
    { hour: '8 AM', checkIns: 45, checkOuts: 2 },
    { hour: '9 AM', checkIns: 87, checkOuts: 5 },
    { hour: '10 AM', checkIns: 12, checkOuts: 8 },
    { hour: '11 AM', checkIns: 5, checkOuts: 15 },
    { hour: '12 PM', checkIns: 3, checkOuts: 20 },
    { hour: '1 PM', checkIns: 2, checkOuts: 18 },
    { hour: '2 PM', checkIns: 1, checkOuts: 25 },
    { hour: '3 PM', checkIns: 0, checkOuts: 30 },
    { hour: '4 PM', checkIns: 0, checkOuts: 22 },
    { hour: '5 PM', checkIns: 0, checkOuts: 35 },
    { hour: '6 PM', checkIns: 0, checkOuts: 28 },
    { hour: '7 PM', checkIns: 0, checkOuts: 12 },
  ];

  const weeklyTrendData = [
    { day: 'Mon', present: 142, absent: 14, rate: 91.0 },
    { day: 'Tue', present: 145, absent: 11, rate: 92.9 },
    { day: 'Wed', present: 144, absent: 12, rate: 92.3 },
    { day: 'Thu', present: 141, absent: 15, rate: 90.4 },
    { day: 'Fri', present: 138, absent: 18, rate: 88.5 },
    { day: 'Sat', present: 95, absent: 61, rate: 60.9 },
    { day: 'Sun', present: 67, absent: 89, rate: 42.9 },
  ];

  const locationAttendanceData = [
    { location: 'HQ - Bangalore', present: 28, absent: 2, rate: 93.3 },
    { location: 'HQ - Mumbai', present: 8, absent: 1, rate: 88.9 },
    { location: 'Remote', present: 6, absent: 0, rate: 100.0 },
  ];

  const attendanceStatusDistribution = [
    { name: 'Present', value: 142, percentage: 91.0, color: '#4CAF50' },
    { name: 'On Leave', value: 14, percentage: 9.0, color: '#FF9800' },
  ];

  // Mock attendance history for selected staff
  const getAttendanceHistory = (staffId: string) => {
    return [
      { date: '2025-11-01', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
      { date: '2025-10-31', checkIn: '08:45 AM', checkOut: '05:30 PM', duration: '8h 45m', status: 'present', overtime: '0h' },
      { date: '2025-10-30', checkIn: '09:15 AM', checkOut: '07:00 PM', duration: '9h 45m', status: 'present', overtime: '1h 45m' },
      { date: '2025-10-29', checkIn: '10:30 AM', checkOut: '06:15 PM', duration: '7h 45m', status: 'late', overtime: '0h' },
      { date: '2025-10-28', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
      { date: '2025-10-27', checkIn: '-', checkOut: '-', duration: '-', status: 'on_leave', overtime: '-' },
      { date: '2025-10-26', checkIn: '-', checkOut: '-', duration: '-', status: 'on_leave', overtime: '-' },
      { date: '2025-10-25', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
      { date: '2025-10-24', checkIn: '08:30 AM', checkOut: '05:45 PM', duration: '9h 15m', status: 'present', overtime: '0h' },
      { date: '2025-10-23', checkIn: '09:00 AM', checkOut: '08:00 PM', duration: '11h 0m', status: 'present', overtime: '3h' },
      { date: '2025-10-22', checkIn: '09:30 AM', checkOut: '06:30 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
      { date: '2025-10-21', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
      { date: '2025-10-20', checkIn: '-', checkOut: '-', duration: '-', status: 'weekend', overtime: '-' },
      { date: '2025-10-19', checkIn: '-', checkOut: '-', duration: '-', status: 'weekend', overtime: '-' },
      { date: '2025-10-18', checkIn: '09:00 AM', checkOut: '06:00 PM', duration: '9h 0m', status: 'present', overtime: '0h' },
    ];
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(record => {
      const matchesSearch = (record.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.staffId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.department?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || record.location === locationFilter;
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [searchQuery, statusFilter, locationFilter]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'staffName',
      headerName: 'Staff Member',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {params.row.staffName?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.staffName || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.staffId || '-'}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Chip label={params.value} size="small" color="primary" variant="outlined" />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Typography variant="body2">{params.value}</Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
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
          <Chip label={params.value} size="small" color="success" variant="outlined" icon={<Login fontSize="small" />} />
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
          <Chip label={params.value} size="small" color="info" variant="outlined" icon={<Logout fontSize="small" />} />
        ) : (
          params.row.status === 'present' ? (
            <Chip label="In Progress" size="small" color="warning" variant="outlined" icon={<Timer fontSize="small" />} />
          ) : (
            <Typography variant="caption" color="text.secondary">-</Typography>
          )
        )
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || '-'}</Typography>
      ),
    },
    {
      field: 'method',
      headerName: 'Method',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        params.value && params.value !== '-' ? (
          <Chip 
            label={params.value} 
            size="small" 
            variant="outlined"
            color={params.value === 'QR Code' ? 'success' : 'default'}
            icon={params.value === 'QR Code' ? <QrCodeScanner fontSize="small" /> : undefined}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
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
          on_leave: { label: 'On Leave', color: 'warning' as const, icon: <EventBusy /> },
        };
        const config = statusConfig[params.value as keyof typeof statusConfig] || statusConfig.absent;
        return <Chip label={config.label} size="small" color={config.color} icon={config.icon} />;
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => {
              setSelectedStaff(params.row);
              setStaffDetailsOpen(true);
            }}
            title="View Details"
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="info"
            onClick={() => {
              setSelectedStaff(params.row);
              setAttendanceHistoryOpen(true);
            }}
            title="View History"
          >
            <History fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Tab 1: Today's Attendance
  const renderTodayTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList /> Filters & Date Range
          </Typography>
          
          {/* First Row: Search, Status, Location, Date Range Type */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search staff by name, ID, role..."
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
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <MenuItem value="all">All Locations</MenuItem>
                <MenuItem value="HQ - Bangalore">HQ - Bangalore</MenuItem>
                <MenuItem value="HQ - Mumbai">HQ - Mumbai</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Second Row: Custom Date Range (only if custom is selected) */}
          {dateFilter === 'custom' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button 
                variant="outlined" 
                startIcon={<CalendarToday />}
                onClick={() => {
                  console.log('Apply date range:', dateRangeStart, 'to', dateRangeEnd);
                }}
              >
                Apply Range
              </Button>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={() => {
                console.log('Exporting attendance data...');
                alert('Attendance data exported successfully!');
              }}
            >
              Export Excel
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Summarize />}
              onClick={() => {
                console.log('Generating report...');
                alert('Generating detailed attendance report...');
              }}
            >
              Generate Report
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setLocationFilter('all');
                setDateFilter('today');
              }}
            >
              Reset Filters
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Showing {filteredRecords.length} of {attendanceRecords.length} records
              {dateFilter === 'custom' && ` (${dateRangeStart} to ${dateRangeEnd})`}
            </Typography>
            <Chip 
              label={`📅 ${dateFilter === 'today' ? 'Today' : dateFilter === 'custom' ? 'Custom Range' : dateFilter}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Stack>
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
  const renderAnalyticsTab = () => {
    // Additional analytics data
    const departmentPerformance = [
      { department: 'Engineering', avgAttendance: 95.2, avgHours: 9.2, overtime: '12h', onTime: 94, lateArrivals: 6 },
      { department: 'Customer Support', avgAttendance: 97.1, avgHours: 8.8, overtime: '8h', onTime: 98, lateArrivals: 2 },
      { department: 'Product', avgAttendance: 92.3, avgHours: 9.5, overtime: '15h', onTime: 89, lateArrivals: 11 },
      { department: 'Operations', avgAttendance: 96.5, avgHours: 9.0, overtime: '10h', onTime: 95, lateArrivals: 5 },
      { department: 'Finance', avgAttendance: 98.5, avgHours: 8.5, overtime: '5h', onTime: 99, lateArrivals: 1 },
      { department: 'Sales & Marketing', avgAttendance: 93.8, avgHours: 9.3, overtime: '18h', onTime: 91, lateArrivals: 9 },
      { department: 'HR', avgAttendance: 99.2, avgHours: 8.7, overtime: '3h', onTime: 100, lateArrivals: 0 },
    ];

    const monthlyTrend = [
      { month: 'Apr', present: 890, absent: 45, rate: 95.2, avgHours: 8.8 },
      { month: 'May', present: 920, absent: 38, rate: 96.0, avgHours: 9.0 },
      { month: 'Jun', present: 905, absent: 42, rate: 95.6, avgHours: 8.9 },
      { month: 'Jul', present: 935, absent: 35, rate: 96.4, avgHours: 9.1 },
      { month: 'Aug', present: 910, absent: 40, rate: 95.8, avgHours: 8.9 },
      { month: 'Sep', present: 945, absent: 30, rate: 96.9, avgHours: 9.2 },
      { month: 'Oct', present: 950, absent: 28, rate: 97.1, avgHours: 9.3 },
    ];

    const punctualityData = [
      { time: '< 8:30 AM', count: 12, percentage: 26.7, color: '#4CAF50' },
      { time: '8:30-9:00 AM', count: 25, percentage: 55.6, color: '#8BC34A' },
      { time: '9:00-9:30 AM', count: 6, percentage: 13.3, color: '#FFC107' },
      { time: '> 9:30 AM', count: 2, percentage: 4.4, color: '#FF5722' },
    ];

    const productivityMetrics = [
      { metric: 'Avg Work Hours', value: '9.1 hrs', change: '+0.3', trend: 'up', color: 'success' },
      { metric: 'Overtime Hours', value: '71 hrs', change: '-5', trend: 'down', color: 'success' },
      { metric: 'Late Arrivals', value: '8.9%', change: '-2.1%', trend: 'down', color: 'success' },
      { metric: 'Early Departures', value: '5.3%', change: '+1.2%', trend: 'up', color: 'warning' },
      { metric: 'Avg Break Time', value: '52 mins', change: '+7', trend: 'up', color: 'info' },
      { metric: 'Weekend Work', value: '12 days', change: '+4', trend: 'up', color: 'info' },
    ];

    return (
      <Box>
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
                  <Select 
                    value={analyticsDateRange} 
                    onChange={(e) => setAnalyticsDateRange(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="7d">Last 7 Days</MenuItem>
                    <MenuItem value="30d">Last 30 Days</MenuItem>
                    <MenuItem value="90d">Last 90 Days</MenuItem>
                    <MenuItem value="6m">Last 6 Months</MenuItem>
                    <MenuItem value="1y">Last Year</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Group By</InputLabel>
                  <Select 
                    value={analyticsGrouping} 
                    onChange={(e) => setAnalyticsGrouping(e.target.value)}
                    label="Group By"
                    disabled={analyticsDateRange === '7d' && analyticsGrouping === 'month'}
                  >
                    <MenuItem value="hour" disabled={analyticsDateRange !== '7d' && analyticsDateRange !== '30d'}>
                      Hourly
                    </MenuItem>
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="week" disabled={analyticsDateRange === '7d'}>
                      Weekly
                    </MenuItem>
                    <MenuItem value="month" disabled={analyticsDateRange === '7d' || analyticsDateRange === '30d'}>
                      Monthly
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />}
                  onClick={() => {
                    setAnalyticsDateRange('7d');
                    setAnalyticsGrouping('day');
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1}>
              <Chip 
                label={`📅 ${analyticsDateRange === '7d' ? 'Last 7 Days' : analyticsDateRange === '30d' ? 'Last 30 Days' : analyticsDateRange === '90d' ? 'Last 90 Days' : analyticsDateRange === '6m' ? 'Last 6 Months' : analyticsDateRange === '1y' ? 'Last Year' : 'All Time'}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`📊 Grouped by ${analyticsGrouping.charAt(0).toUpperCase() + analyticsGrouping.slice(1)}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Analytics Header with KPIs */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Platform Staff Analytics Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              Comprehensive attendance insights, productivity metrics & performance tracking
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
              {productivityMetrics.map((metric, idx) => (
                <Paper key={idx} sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {metric.metric}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', my: 0.5 }}>
                    {metric.value}
                  </Typography>
                  <Chip 
                    label={metric.change} 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: metric.trend === 'up' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                      color: 'white'
                    }}
                    icon={metric.trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                  />
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Hourly Pattern & Punctuality */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    ⏰ Hourly Check-In/Check-Out Pattern
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Real-time movement tracking • {analyticsDateRange === '7d' ? 'Last 7 Days' : analyticsDateRange === '30d' ? 'Last 30 Days' : 'Selected Period'}
                  </Typography>
                </Box>
                <Chip 
                  label={analyticsGrouping === 'hour' ? '📊 Hourly View' : '📅 Daily Aggregated'} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Stack>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={hourlyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="checkIns" fill="#4CAF50" name="Check-Ins" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="checkOuts" fill="#2196F3" name="Check-Outs" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 Punctuality Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Staff check-in time breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={punctualityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.time}\n${entry.percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {punctualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2 }}>
                {punctualityData.map((item, idx) => (
                  <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: 1 }} />
                      <Typography variant="caption">{item.time}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="bold">{item.count} staff ({item.percentage}%)</Typography>
                  </Stack>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Monthly Trend */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📈 Attendance & Hours Trend
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {analyticsDateRange === '7d' ? 'Last 7 Days' : analyticsDateRange === '30d' ? 'Last 30 Days' : analyticsDateRange === '90d' ? 'Last 90 Days' : analyticsDateRange === '6m' ? 'Last 6 Months' : analyticsDateRange === '1y' ? 'Last Year' : 'All Time'} • Grouped by {analyticsGrouping}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label="Present Days" size="small" sx={{ bgcolor: '#4CAF50', color: 'white' }} />
                <Chip label="Work Hours" size="small" sx={{ bgcolor: '#2196F3', color: 'white' }} />
                <Chip label="Rate %" size="small" sx={{ bgcolor: '#E91E63', color: 'white' }} />
              </Stack>
            </Stack>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="present" stroke="#4CAF50" fill="url(#colorPresent)" name="Present Days" />
                <Area yAxisId="right" type="monotone" dataKey="avgHours" stroke="#2196F3" fill="url(#colorHours)" name="Avg Work Hours" />
                <Line yAxisId="left" type="monotone" dataKey="rate" stroke="#E91E63" strokeWidth={2} name="Attendance Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend & Location */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  📅 Weekly Attendance Trend
                </Typography>
                <Chip 
                  label={`📊 ${analyticsGrouping === 'day' ? 'Daily' : analyticsGrouping === 'week' ? 'Weekly' : 'Monthly'}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Stack>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient id="colorPresent2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stroke="#4CAF50" fill="url(#colorPresent2)" name="Present" />
                  <Line type="monotone" dataKey="rate" stroke="#E91E63" strokeWidth={2} name="Attendance Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  🏢 Location-wise Attendance
                </Typography>
                <Chip 
                  label={analyticsDateRange === '7d' ? '📅 Last 7 Days' : analyticsDateRange === '30d' ? '📅 Last 30 Days' : '📅 Selected Period'} 
                  size="small" 
                  color="info" 
                  variant="outlined"
                />
              </Stack>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationAttendanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={150} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#4CAF50" name="Present" stackId="a" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="absent" fill="#F44336" name="Absent" stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Department Performance Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🏆 Department-wise Performance Metrics
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Comprehensive performance analysis across all departments
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Department</strong></TableCell>
                      <TableCell align="center"><strong>Avg Attendance %</strong></TableCell>
                      <TableCell align="center"><strong>Avg Work Hours</strong></TableCell>
                      <TableCell align="center"><strong>Total Overtime</strong></TableCell>
                      <TableCell align="center"><strong>On-Time %</strong></TableCell>
                      <TableCell align="center"><strong>Late Arrivals %</strong></TableCell>
                      <TableCell align="center"><strong>Performance</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentPerformance.map((dept, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{dept.department}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${dept.avgAttendance}%`} 
                            size="small" 
                            color={dept.avgAttendance >= 95 ? 'success' : dept.avgAttendance >= 90 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{dept.avgHours} hrs</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="info.main">{dept.overtime}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={dept.onTime} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                              color={dept.onTime >= 95 ? 'success' : 'warning'}
                            />
                            <Typography variant="caption">{dept.onTime}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color={dept.lateArrivals <= 5 ? 'success.main' : 'warning.main'}>
                            {dept.lateArrivals}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={dept.avgAttendance >= 97 ? '⭐ Excellent' : dept.avgAttendance >= 95 ? '👍 Good' : dept.avgAttendance >= 90 ? '📊 Average' : '⚠️ Needs Improvement'} 
                            size="small"
                            color={dept.avgAttendance >= 97 ? 'success' : dept.avgAttendance >= 95 ? 'primary' : dept.avgAttendance >= 90 ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Overall Attendance Distribution
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3 }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={attendanceStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}\n${entry.percentage}%`}
                    outerRadius={90}
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
              
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                {attendanceStatusDistribution.map((item, idx) => (
                  <Paper key={idx} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 24, height: 24, bgcolor: item.color, borderRadius: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.value} staff members</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight="bold" color={item.color}>{item.percentage}%</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.percentage} 
                        sx={{ width: 100, height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                        style={{ backgroundColor: `${item.color}33` }}
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              👥 Platform Staff Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SaaS platform team attendance with QR check-in/out • {kpis.totalStaff} platform employees
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<QrCodeScanner />}
              onClick={() => setScannerOpen(true)}
              size="large"
              color="primary"
            >
              Scan QR Code
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCode2 />}
              onClick={() => setQrGeneratorOpen(true)}
            >
              Generate QR Codes
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card sx={{ bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Checked In</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {kpis.checkedInToday}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpis.attendanceRate}% attendance
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Login />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'info.50', borderLeft: 4, borderColor: 'info.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Currently Present</Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {kpis.currentlyPresent}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpis.checkedOutToday} checked out
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'warning.50', borderLeft: 4, borderColor: 'warning.main' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Late Arrivals</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {kpis.lateArrivals}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  After {kpis.avgCheckInTime}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Schedule />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'grey.100', borderLeft: 4, borderColor: 'grey.500' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">On Leave</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.onLeave}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved absences
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'grey.500' }}>
                <EventBusy />
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
          <Tab label="Staff List" icon={<People />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
          <Tab label="Reports" icon={<Download />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderTodayTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderStaffListTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <Alert severity="info">
              <Typography variant="body2">Reports module coming soon...</Typography>
            </Alert>
          </TabPanel>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      {renderQRScannerDialog()}

      {/* QR Generator Dialog */}
      {renderQRGeneratorDialog()}

      {/* Staff Details Dialog */}
      {renderStaffDetailsDialog()}

      {/* Attendance History Dialog */}
      {renderAttendanceHistoryDialog()}
    </Box>
  );

  // QR Scanner Dialog
  function renderQRScannerDialog() {
    return (
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QrCodeScanner />
              <Typography variant="h6" fontWeight="bold">
                Staff Attendance Scanner
              </Typography>
            </Box>
            <Chip 
              label={scanMode === 'check-in' ? 'CHECK IN' : 'CHECK OUT'}
              color={scanMode === 'check-in' ? 'success' : 'error'}
              icon={scanMode === 'check-in' ? <Login /> : <Logout />}
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Mode Selector */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant={scanMode === 'check-in' ? 'contained' : 'outlined'}
                color="success"
                fullWidth
                startIcon={<Login />}
                onClick={() => setScanMode('check-in')}
              >
                Check In
              </Button>
              <Button
                variant={scanMode === 'check-out' ? 'contained' : 'outlined'}
                color="error"
                fullWidth
                startIcon={<Logout />}
                onClick={() => setScanMode('check-out')}
              >
                Check Out
              </Button>
            </Stack>

            {/* Scanner View (Placeholder - would use react-qr-scanner or similar) */}
            <Box
              sx={{
                width: '100%',
                height: 350,
                bgcolor: 'grey.900',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Scanner placeholder */}
              <Box
                sx={{
                  width: 250,
                  height: 250,
                  border: 3,
                  borderColor: scanMode === 'check-in' ? 'success.main' : 'error.main',
                  borderRadius: 2,
                  position: 'relative',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    border: '3px solid',
                    borderColor: scanMode === 'check-in' ? 'success.main' : 'error.main',
                  },
                  '&::before': {
                    top: -3,
                    left: -3,
                    borderRight: 'none',
                    borderBottom: 'none',
                  },
                  '&::after': {
                    bottom: -3,
                    right: -3,
                    borderLeft: 'none',
                    borderTop: 'none',
                  }
                }}
              >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <CameraAlt sx={{ fontSize: 80, color: 'grey.600' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="grey.400" sx={{ mt: 2 }}>
                Position QR code within the frame
              </Typography>
              <Typography variant="caption" color="grey.500">
                Camera will auto-detect and scan
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>How to use:</strong> Point your camera at the staff's QR code. 
                The system will automatically detect and process the {scanMode === 'check-in' ? 'check-in' : 'check-out'}.
              </Typography>
            </Alert>

            {/* Recent Scans */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Recent Scans (Last 5)
              </Typography>
              <Stack spacing={1}>
                {[
                  { name: 'Rajesh Kumar', action: 'Check-In', time: '2 min ago', status: 'success' },
                  { name: 'Anjali Sharma', action: 'Check-Out', time: '5 min ago', status: 'error' },
                  { name: 'Priya Desai', action: 'Check-In', time: '8 min ago', status: 'success' },
                ].map((scan, idx) => (
                  <Paper key={idx} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: scan.status === 'success' ? 'success.main' : 'error.main' }}>
                        {scan.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{scan.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{scan.time}</Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={scan.action} 
                      size="small"
                      color={scan.status as any}
                      icon={scan.action === 'Check-In' ? <Login fontSize="small" /> : <Logout fontSize="small" />}
                    />
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScannerOpen(false)}>Close Scanner</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // QR Generator Dialog
  function renderQRGeneratorDialog() {
    return (
      <Dialog open={qrGeneratorOpen} onClose={() => setQrGeneratorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QrCode2 />
            QR Code Generator (Admin Only)
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Generate QR Codes:</strong> Create separate QR codes for check-in and check-out. 
                Staff can scan these codes to mark their attendance.
              </Typography>
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
              {/* Check-In QR Code */}
              <Card sx={{ border: 2, borderColor: 'success.main' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Login />
                    Check-In QR Code
                  </Typography>
                  
                  {/* QR Code Placeholder */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 250,
                      bgcolor: 'white',
                      border: 2,
                      borderColor: 'success.main',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    <QrCode2 sx={{ fontSize: 200, color: 'success.main' }} />
                    <Chip
                      label="CHECK IN"
                      color="success"
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    <strong>QR Data:</strong> CHECKIN_2025_LIBRARY_001
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Valid for: All libraries • Expiry: Never
                  </Typography>

                  <Stack spacing={1}>
                    <Button variant="contained" color="success" fullWidth startIcon={<Download />}>
                      Download PNG
                    </Button>
                    <Button variant="outlined" color="success" fullWidth startIcon={<Print />}>
                      Print QR Code
                    </Button>
                    <Button variant="outlined" color="success" fullWidth startIcon={<ContentCopy />}>
                      Copy Link
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Check-Out QR Code */}
              <Card sx={{ border: 2, borderColor: 'error.main' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="error.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Logout />
                    Check-Out QR Code
                  </Typography>
                  
                  {/* QR Code Placeholder */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 250,
                      bgcolor: 'white',
                      border: 2,
                      borderColor: 'error.main',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    <QrCode2 sx={{ fontSize: 200, color: 'error.main' }} />
                    <Chip
                      label="CHECK OUT"
                      color="error"
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    <strong>QR Data:</strong> CHECKOUT_2025_LIBRARY_001
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Valid for: All libraries • Expiry: Never
                  </Typography>

                  <Stack spacing={1}>
                    <Button variant="contained" color="error" fullWidth startIcon={<Download />}>
                      Download PNG
                    </Button>
                    <Button variant="outlined" color="error" fullWidth startIcon={<Print />}>
                      Print QR Code
                    </Button>
                    <Button variant="outlined" color="error" fullWidth startIcon={<ContentCopy />}>
                      Copy Link
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Custom QR Code Settings
            </Typography>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Library/Location</InputLabel>
                <Select defaultValue="all">
                  <MenuItem value="all">All Libraries</MenuItem>
                  <MenuItem value="central">Central Library</MenuItem>
                  <MenuItem value="tech">Tech Hub</MenuItem>
                  <MenuItem value="study">Study Center</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Valid For</InputLabel>
                <Select defaultValue="permanent">
                  <MenuItem value="permanent">Permanent (No Expiry)</MenuItem>
                  <MenuItem value="1day">1 Day</MenuItem>
                  <MenuItem value="1week">1 Week</MenuItem>
                  <MenuItem value="1month">1 Month</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<QrCode2 />}>
                Generate Custom QR Codes
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrGeneratorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Staff Details Dialog
  function renderStaffDetailsDialog() {
    if (!selectedStaff) return null;

    return (
      <Dialog open={staffDetailsOpen} onClose={() => setStaffDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                {selectedStaff.staffName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedStaff.staffName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStaff.staffId} • {selectedStaff.role}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setStaffDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
            {/* Basic Info */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <BadgeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Staff ID
              </Typography>
              <Typography variant="body1" fontWeight="bold">{selectedStaff.staffId}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Business fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Department
              </Typography>
              <Typography variant="body1" fontWeight="bold">{selectedStaff.department}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                Location
              </Typography>
              <Typography variant="body1" fontWeight="bold">{selectedStaff.location}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip 
                label={selectedStaff.status} 
                color={selectedStaff.status === 'present' ? 'success' : selectedStaff.status === 'late' ? 'warning' : 'default'} 
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Today's Attendance */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Today's Attendance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Check-In</Typography>
                <Typography variant="h6" color="success.main">{selectedStaff.checkIn || '-'}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Check-Out</Typography>
                <Typography variant="h6" color="info.main">{selectedStaff.checkOut || 'In Progress'}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="h6">{selectedStaff.duration}</Typography>
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick Actions */}
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<History />}
              onClick={() => {
                setStaffDetailsOpen(false);
                setAttendanceHistoryOpen(true);
              }}
            >
              View Full History
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Email />}
              onClick={() => alert('Send email to ' + selectedStaff.staffName)}
            >
              Send Email
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Attendance History Dialog
  function renderAttendanceHistoryDialog() {
    if (!selectedStaff) return null;

    const history = getAttendanceHistory(selectedStaff.staffId);

    return (
      <Dialog open={attendanceHistoryOpen} onClose={() => setAttendanceHistoryOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Attendance History - {selectedStaff.staffName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStaff.staffId} • {selectedStaff.role}
              </Typography>
            </Box>
            <IconButton onClick={() => setAttendanceHistoryOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Days</Typography>
                <Typography variant="h5" fontWeight="bold">15</Typography>
                <Typography variant="caption" color="success.main">Last 15 days</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Present</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">11</Typography>
                <Typography variant="caption">73.3% attendance</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">On Leave</Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">2</Typography>
                <Typography variant="caption">13.3%</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="caption" color="text.secondary">Overtime</Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">4h 45m</Typography>
                <Typography variant="caption">Total extra hours</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* History Table */}
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={history.map((h, idx) => ({ id: idx, ...h }))}
              columns={[
                { 
                  field: 'date', 
                  headerName: 'Date', 
                  width: 150,
                  renderCell: (params) => (
                    <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
                  )
                },
                { 
                  field: 'checkIn', 
                  headerName: 'Check-In', 
                  width: 130,
                  renderCell: (params) => (
                    params.value && params.value !== '-' ? (
                      <Chip label={params.value} size="small" color="success" variant="outlined" icon={<Login fontSize="small" />} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )
                  )
                },
                { 
                  field: 'checkOut', 
                  headerName: 'Check-Out', 
                  width: 130,
                  renderCell: (params) => (
                    params.value && params.value !== '-' ? (
                      <Chip label={params.value} size="small" color="info" variant="outlined" icon={<Logout fontSize="small" />} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )
                  )
                },
                { 
                  field: 'duration', 
                  headerName: 'Duration', 
                  width: 130,
                  renderCell: (params) => (
                    <Typography variant="body2" fontWeight={params.value === 'In Progress' ? 'bold' : 'normal'}>
                      {params.value}
                    </Typography>
                  )
                },
                { 
                  field: 'overtime', 
                  headerName: 'Overtime', 
                  width: 120,
                  renderCell: (params) => (
                    params.value && params.value !== '0h' && params.value !== '-' ? (
                      <Chip label={params.value} size="small" color="info" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )
                  )
                },
                { 
                  field: 'status', 
                  headerName: 'Status', 
                  width: 140,
                  renderCell: (params) => {
                    const statusConfig: any = {
                      present: { label: 'Present', color: 'success', icon: <CheckCircle fontSize="small" /> },
                      late: { label: 'Late', color: 'warning', icon: <Schedule fontSize="small" /> },
                      on_leave: { label: 'On Leave', color: 'warning', icon: <EventBusy fontSize="small" /> },
                      weekend: { label: 'Weekend', color: 'default', icon: <CalendarToday fontSize="small" /> },
                    };
                    const config = statusConfig[params.value] || statusConfig.present;
                    return <Chip label={config.label} size="small" color={config.color} icon={config.icon} />;
                  }
                },
              ]}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />} onClick={() => alert('Exporting history...')}>
            Export History
          </Button>
          <Button onClick={() => setAttendanceHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Staff List Tab
  function renderStaffListTab() {
    return (
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          All Staff Members
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete list of staff with attendance records and QR code access
        </Typography>

        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Staff QR Attendance:</strong> Each staff member can use the QR scanner to mark their attendance. 
            Admins can generate and manage QR codes from the header.
          </Typography>
        </Alert>

        <Card>
          <CardContent>
            <Box sx={{ height: 500 }}>
              <DataGrid
                rows={attendanceRecords}
                columns={[
                  {
                    field: 'staffName',
                    headerName: 'Staff Member',
                    flex: 1,
                    minWidth: 200,
                    renderCell: (params) => (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {params.row.staffName?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {params.row.staffName || '-'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {params.row.staffId || '-'}
                          </Typography>
                        </Box>
                      </Stack>
                    ),
                  },
                  {
                    field: 'role',
                    headerName: 'Role',
                    width: 150,
                    renderCell: (params) => (
                      params.row.role ? (
                        <Chip label={params.row.role} size="small" color="primary" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )
                    ),
                  },
                  {
                    field: 'location',
                    headerName: 'Location',
                    width: 150,
                  },
                  {
                    field: 'status',
                    headerName: 'Status',
                    width: 120,
                    renderCell: (params) => {
                      const statusConfig: any = {
                        present: { label: 'Present', color: 'success', icon: <CheckCircle fontSize="small" /> },
                        absent: { label: 'Absent', color: 'error', icon: <Cancel fontSize="small" /> },
                        on_leave: { label: 'On Leave', color: 'warning', icon: <EventBusy fontSize="small" /> },
                        late: { label: 'Late', color: 'warning', icon: <Schedule fontSize="small" /> },
                      };
                      const config = statusConfig[params.value] || { label: params.value, color: 'default' };
                      return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
                    },
                  },
                  {
                    field: 'checkIn',
                    headerName: 'Check-In',
                    width: 120,
                    renderCell: (params) => (
                      params.value ? (
                        <Typography variant="body2">{params.value}</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )
                    ),
                  },
                  {
                    field: 'checkOut',
                    headerName: 'Check-Out',
                    width: 120,
                    renderCell: (params) => (
                      params.value ? (
                        <Typography variant="body2">{params.value}</Typography>
                      ) : (
                        params.row.status === 'present' ? (
                          <Chip label="In Progress" size="small" color="info" icon={<Timer fontSize="small" />} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )
                      )
                    ),
                  },
                  {
                    field: 'duration',
                    headerName: 'Duration',
                    width: 120,
                  },
                  {
                    field: 'method',
                    headerName: 'Method',
                    width: 120,
                    renderCell: (params) => (
                      params.row.method ? (
                        <Chip 
                          label={params.row.method} 
                          size="small" 
                          variant="outlined"
                          color={params.row.method === 'QR Code' ? 'success' : 'default'}
                          icon={params.row.method === 'QR Code' ? <QrCodeScanner fontSize="small" /> : undefined}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )
                    ),
                  },
                ]}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }
};

export default StaffAttendancePage;

