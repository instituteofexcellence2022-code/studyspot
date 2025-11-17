/**
 * 📊 COMPREHENSIVE ATTENDANCE RECORDS PAGE
 * 
 * Features:
 * - Complete attendance history with filtering
 * - Statistics (daily, weekly, monthly)
 * - Search and date range filtering
 * - Export functionality
 * - Detailed session information
 * - Visual charts and analytics
 */

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Schedule,
  CalendarMonth,
  Timer,
  TrendingUp,
  Download,
  FilterList,
  Search,
  LocationOn,
  EventSeat,
  Refresh,
  BarChart,
  PieChart,
  DateRange,
  LibraryBooks,
  Today,
  ViewWeek,
  ViewMonth,
  FileDownload,
  Close,
  Info,
  CheckCircleOutline,
  ExitToApp,
} from '@mui/icons-material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import MobileLayout from '../components/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { gradients } from '../theme/colors';

interface AttendanceRecord {
  id: string;
  libraryId: string;
  libraryName: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  status: 'checked-in' | 'checked-out';
  seatNumber?: string;
  zone?: string;
  location?: string;
  qrData?: string;
}

interface AttendanceStats {
  totalSessions: number;
  totalHours: number;
  totalMinutes: number;
  averageSessionDuration: number; // in minutes
  currentStreak: number; // days
  longestStreak: number; // days
  thisMonth: number; // hours
  thisWeek: number; // hours
  today: number; // hours
  librariesVisited: number;
  mostVisitedLibrary: string;
}

interface AttendancePageProps {
  setIsAuthenticated?: (value: boolean) => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function AttendancePage({ setIsAuthenticated }: AttendancePageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    totalHours: 0,
    totalMinutes: 0,
    averageSessionDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0,
    librariesVisited: 0,
    mostVisitedLibrary: 'N/A',
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'checked-out'>('all');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // View states
  const [viewTab, setViewTab] = useState(0); // 0: List, 1: Calendar, 2: Charts
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Chart data
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [libraryDistribution, setLibraryDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendanceData();
  }, [user?.id]);

  const fetchAttendanceData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch attendance history
      const historyResponse = await api.get(`/api/attendance/history/${user?.id || 'student-001'}?limit=1000`);
      const records = historyResponse.data?.data || historyResponse.data?.records || [];
      
      // Transform records to match our interface
      const transformedRecords: AttendanceRecord[] = records.map((record: any) => ({
        id: record.id || record.attendance_id,
        libraryId: record.library_id || record.libraryId,
        libraryName: record.library_name || record.libraryName || 'Unknown Library',
        checkInTime: record.check_in_time || record.checkInTime || record.created_at,
        checkOutTime: record.check_out_time || record.checkOutTime,
        duration: record.duration || calculateDuration(record.check_in_time || record.checkInTime, record.check_out_time || record.checkOutTime),
        status: record.check_out_time || record.checkOutTime ? 'checked-out' : 'checked-in',
        seatNumber: record.seat_number || record.seatNumber,
        zone: record.zone,
        location: record.location,
        qrData: record.qr_data || record.qrData,
      }));

      setAttendanceRecords(transformedRecords);
      
      // Calculate statistics
      const calculatedStats = calculateStats(transformedRecords);
      setStats(calculatedStats);

      // Generate chart data
      generateChartData(transformedRecords);
    } catch (error: any) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance records. Using sample data.');
      
      // Use sample data for development
      const sampleRecords = generateSampleRecords();
      setAttendanceRecords(sampleRecords);
      const calculatedStats = calculateStats(sampleRecords);
      setStats(calculatedStats);
      generateChartData(sampleRecords);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDuration = (checkIn: string, checkOut?: string): number => {
    if (!checkOut) return 0;
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
    return Math.floor((checkOutTime - checkInTime) / (1000 * 60)); // minutes
  };

  const calculateStats = (records: AttendanceRecord[]): AttendanceStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedSessions = records.filter(r => r.status === 'checked-out' && r.duration);
    const totalMinutes = completedSessions.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const averageDuration = completedSessions.length > 0 ? totalMinutes / completedSessions.length : 0;

    // Calculate streaks
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedRecords.forEach(record => {
      const recordDate = new Date(record.checkInTime);
      recordDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        if (recordDate.getTime() === todayDate.getTime() || 
            recordDate.getTime() === todayDate.getTime() - 24 * 60 * 60 * 1000) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const diffDays = (lastDate.getTime() - recordDate.getTime()) / (24 * 60 * 60 * 1000);
        if (diffDays === 1) {
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          if (diffDays > 1) currentStreak = 0;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      lastDate = recordDate;
    });

    // Calculate time periods
    const todayRecords = records.filter(r => {
      const recordDate = new Date(r.checkInTime);
      return recordDate >= today;
    });
    const todayMinutes = todayRecords
      .filter(r => r.duration)
      .reduce((sum, r) => sum + (r.duration || 0), 0);

    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.checkInTime);
      return recordDate >= weekAgo;
    });
    const weekMinutes = weekRecords
      .filter(r => r.duration)
      .reduce((sum, r) => sum + (r.duration || 0), 0);

    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.checkInTime);
      return recordDate >= monthAgo;
    });
    const monthMinutes = monthRecords
      .filter(r => r.duration)
      .reduce((sum, r) => sum + (r.duration || 0), 0);

    // Most visited library
    const libraryCounts: Record<string, number> = {};
    records.forEach(r => {
      libraryCounts[r.libraryName] = (libraryCounts[r.libraryName] || 0) + 1;
    });
    const mostVisited = Object.entries(libraryCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSessions: records.length,
      totalHours,
      totalMinutes,
      averageSessionDuration: averageDuration,
      currentStreak,
      longestStreak,
      thisMonth: Math.floor(monthMinutes / 60),
      thisWeek: Math.floor(weekMinutes / 60),
      today: Math.floor(todayMinutes / 60),
      librariesVisited: Object.keys(libraryCounts).length,
      mostVisitedLibrary: mostVisited ? mostVisited[0] : 'N/A',
    };
  };

  const generateChartData = (records: AttendanceRecord[]) => {
    // Weekly data (last 7 days)
    const weekly: any[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayRecords = records.filter(r => {
        const recordDate = new Date(r.checkInTime);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      });
      
      const minutes = dayRecords
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0);
      
      weekly.push({
        day: days[date.getDay()],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.floor(minutes / 60),
        sessions: dayRecords.length,
      });
    }
    setWeeklyData(weekly);

    // Monthly data (last 12 months)
    const monthly: any[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      
      const monthRecords = records.filter(r => {
        const recordDate = new Date(r.checkInTime);
        return recordDate.getMonth() === date.getMonth() && 
               recordDate.getFullYear() === date.getFullYear();
      });
      
      const minutes = monthRecords
        .filter(r => r.duration)
        .reduce((sum, r) => sum + (r.duration || 0), 0);
      
      monthly.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        hours: Math.floor(minutes / 60),
        sessions: monthRecords.length,
      });
    }
    setMonthlyData(monthly);

    // Library distribution
    const libraryCounts: Record<string, number> = {};
    records.forEach(r => {
      libraryCounts[r.libraryName] = (libraryCounts[r.libraryName] || 0) + 1;
    });
    
    const distribution = Object.entries(libraryCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    
    setLibraryDistribution(distribution);
  };

  const generateSampleRecords = (): AttendanceRecord[] => {
    const libraries = ['Central Study Hub', 'Tech Hub Library', 'Green Study Center', 'Quiet Zone Library', 'Premium Study Space'];
    const records: AttendanceRecord[] = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const checkInHour = 8 + Math.floor(Math.random() * 4); // 8 AM to 12 PM
      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, Math.floor(Math.random() * 60), 0);
      
      const duration = 120 + Math.floor(Math.random() * 360); // 2 to 8 hours
      const checkOutTime = new Date(checkInTime.getTime() + duration * 60 * 1000);

      records.push({
        id: `record-${i}`,
        libraryId: `lib-${Math.floor(Math.random() * libraries.length)}`,
        libraryName: libraries[Math.floor(Math.random() * libraries.length)],
        checkInTime: checkInTime.toISOString(),
        checkOutTime: checkOutTime.toISOString(),
        duration,
        status: 'checked-out',
        seatNumber: `A-${Math.floor(Math.random() * 50) + 1}`,
        zone: ['general', 'quiet', 'ac', 'premium'][Math.floor(Math.random() * 4)],
      });
    }

    return records;
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    let filtered = [...attendanceRecords];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.libraryName.toLowerCase().includes(query) ||
        r.seatNumber?.toLowerCase().includes(query) ||
        r.zone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Library filter
    if (libraryFilter !== 'all') {
      filtered = filtered.filter(r => r.libraryName === libraryFilter);
    }

    // Date range filter
    if (dateRangeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.checkInTime);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
    } else if (dateRangeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(r => new Date(r.checkInTime) >= weekAgo);
    } else if (dateRangeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(r => new Date(r.checkInTime) >= monthAgo);
    } else if (dateRangeFilter === 'custom' && startDate && endDate) {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.checkInTime);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );
  }, [attendanceRecords, searchQuery, statusFilter, libraryFilter, dateRangeFilter, startDate, endDate]);

  // Get unique libraries for filter
  const uniqueLibraries = useMemo(() => {
    const libraries = Array.from(new Set(attendanceRecords.map(r => r.libraryName)));
    return libraries.sort();
  }, [attendanceRecords]);

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Library', 'Check-In', 'Check-Out', 'Duration', 'Seat', 'Zone', 'Status'].join(','),
      ...filteredRecords.map(r => [
        new Date(r.checkInTime).toLocaleDateString(),
        r.libraryName,
        new Date(r.checkInTime).toLocaleTimeString(),
        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : 'N/A',
        formatDuration(r.duration),
        r.seatNumber || 'N/A',
        r.zone || 'N/A',
        r.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance records exported successfully!');
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                📊 Attendance Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete history of your library visits and study sessions
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchAttendanceData} disabled={refreshing}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                onClick={handleExport}
                sx={{ background: gradients.primary }}
              >
                Export
              </Button>
            </Stack>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ background: gradients.primary, color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalSessions}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Total Sessions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalHours}h
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Total Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.currentStreak}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Day Streak
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.thisWeek}h
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    This Week
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.thisMonth}h
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    This Month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search library, seat, zone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="checked-in">Checked In</MenuItem>
                      <MenuItem value="checked-out">Checked Out</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Library</InputLabel>
                    <Select
                      value={libraryFilter}
                      label="Library"
                      onChange={(e) => setLibraryFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Libraries</MenuItem>
                      {uniqueLibraries.map(lib => (
                        <MenuItem key={lib} value={lib}>{lib}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={dateRangeFilter}
                      label="Date Range"
                      onChange={(e) => setDateRangeFilter(e.target.value as any)}
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {dateRangeFilter === 'custom' && (
                  <>
                    <Grid item xs={6} sm={3} md={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Start"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="End"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6} md={dateRangeFilter === 'custom' ? 0 : 1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setLibraryFilter('all');
                      setDateRangeFilter('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* View Tabs */}
          <Card sx={{ mb: 3 }}>
            <Tabs value={viewTab} onChange={(e, v) => setViewTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab icon={<Schedule />} label="List View" />
              <Tab icon={<BarChart />} label="Charts" />
              <Tab icon={<CalendarMonth />} label="Calendar" />
            </Tabs>
            <Divider />

            {/* List View */}
            {viewTab === 0 && (
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Library</strong></TableCell>
                        <TableCell><strong>Check-In</strong></TableCell>
                        <TableCell><strong>Check-Out</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Seat</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRecords
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((record) => (
                          <TableRow key={record.id} hover>
                            <TableCell>
                              {new Date(record.checkInTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LibraryBooks fontSize="small" color="primary" />
                                {record.libraryName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell>
                              {record.checkOutTime
                                ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '—'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={formatDuration(record.duration)}
                                size="small"
                                icon={<Timer />}
                                color={record.duration && record.duration >= 240 ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {record.seatNumber ? (
                                <Chip label={record.seatNumber} size="small" variant="outlined" />
                              ) : (
                                '—'
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={record.status === 'checked-in' ? 'Active' : 'Completed'}
                                size="small"
                                color={record.status === 'checked-in' ? 'warning' : 'success'}
                                icon={record.status === 'checked-in' ? <CheckCircleOutline /> : <CheckCircle />}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleViewDetails(record)}>
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredRecords.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </CardContent>
            )}

            {/* Charts View */}
            {viewTab === 1 && (
              <CardContent>
                <Grid container spacing={3}>
                  {/* Weekly Chart */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Study Time This Week
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip formatter={(value: any) => [`${value} hours`, 'Study Time']} />
                        <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                          {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.hours >= 6 ? '#10b981' : '#2563eb'} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Monthly Chart */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Monthly Overview (Last 12 Months)
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} name="Hours" />
                        <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} name="Sessions" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Library Distribution */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Library Visits Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={libraryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {libraryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Additional Stats */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Additional Statistics
                    </Typography>
                    <Stack spacing={2}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Average Session Duration
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {formatDuration(stats.averageSessionDuration)}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Longest Streak
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.longestStreak} days
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Most Visited Library
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.mostVisitedLibrary}
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Libraries Visited
                          </Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {stats.librariesVisited}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            )}

            {/* Calendar View */}
            {viewTab === 2 && (
              <CardContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Calendar view coming soon! Use the list view to see all your attendance records.
                </Alert>
                <Grid container spacing={2}>
                  {filteredRecords.slice(0, 20).map((record) => (
                    <Grid item xs={12} sm={6} md={4} key={record.id}>
                      <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => handleViewDetails(record)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6" fontWeight="600">
                              {new Date(record.checkInTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Typography>
                            <Chip
                              label={record.status === 'checked-in' ? 'Active' : 'Done'}
                              size="small"
                              color={record.status === 'checked-in' ? 'warning' : 'success'}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {record.libraryName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Check-In
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Typography>
                            </Box>
                            {record.checkOutTime && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Check-Out
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </Box>
                            )}
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Duration
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {formatDuration(record.duration)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            )}
          </Card>

          {/* Summary */}
          {filteredRecords.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No attendance records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || statusFilter !== 'all' || libraryFilter !== 'all' || dateRangeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check in at a library to start tracking your attendance'}
              </Typography>
            </Paper>
          )}
        </Container>

        {/* Record Details Dialog */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Attendance Details</Typography>
              <IconButton size="small" onClick={() => setDetailDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedRecord && (
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LibraryBooks color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Library"
                    secondary={selectedRecord.libraryName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date"
                    secondary={new Date(selectedRecord.checkInTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutline color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Check-In Time"
                    secondary={new Date(selectedRecord.checkInTime).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  />
                </ListItem>
                {selectedRecord.checkOutTime && (
                  <ListItem>
                    <ListItemIcon>
                      <ExitToApp color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Check-Out Time"
                      secondary={new Date(selectedRecord.checkOutTime).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Timer color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Duration"
                    secondary={formatDuration(selectedRecord.duration)}
                  />
                </ListItem>
                {selectedRecord.seatNumber && (
                  <ListItem>
                    <ListItemIcon>
                      <EventSeat color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Seat Number"
                      secondary={selectedRecord.seatNumber}
                    />
                  </ListItem>
                )}
                {selectedRecord.zone && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Zone"
                      secondary={selectedRecord.zone}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={selectedRecord.status === 'checked-in' ? 'Currently Active' : 'Completed'}
                        size="small"
                        color={selectedRecord.status === 'checked-in' ? 'warning' : 'success'}
                      />
                    }
                  />
                </ListItem>
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileLayout>
  );
}
