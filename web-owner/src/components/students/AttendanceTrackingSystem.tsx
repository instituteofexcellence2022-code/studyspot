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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: string;
  groups?: string[];
  attendancePercentage?: number;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  location: string;
  notes?: string;
  markedBy: string;
  markedAt: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageAttendance: number;
  attendanceTrend: 'up' | 'down' | 'stable';
  topPerformers: Student[];
  attendanceHistory: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
}

interface AttendanceTrackingSystemProps {
  students: Student[];
  onAttendanceUpdate: (record: AttendanceRecord) => void;
}

const AttendanceTrackingSystem: React.FC<AttendanceTrackingSystemProps> = ({
  students,
  onAttendanceUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMarkDialogOpen, setBulkMarkDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<AttendanceRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Mock data for demonstration
  useEffect(() => {
    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        studentId: 'STU001',
        studentName: 'John Doe',
        date: selectedDate,
        checkInTime: '09:00',
        checkOutTime: '17:00',
        status: 'present',
        location: 'Main Library',
        notes: 'Regular attendance',
        markedBy: 'Admin',
        markedAt: new Date().toISOString(),
      },
      {
        id: '2',
        studentId: 'STU002',
        studentName: 'Jane Smith',
        date: selectedDate,
        checkInTime: '09:15',
        status: 'late',
        location: 'Main Library',
        notes: 'Arrived 15 minutes late',
        markedBy: 'Admin',
        markedAt: new Date().toISOString(),
      },
    ];

    const mockStats: AttendanceStats = {
      totalStudents: students.length,
      presentToday: 8,
      absentToday: 2,
      lateToday: 1,
      averageAttendance: 85,
      attendanceTrend: 'up',
      topPerformers: students.slice(0, 3),
      attendanceHistory: [
        { date: '2024-01-15', present: 8, absent: 2, late: 1 },
        { date: '2024-01-14', present: 7, absent: 3, late: 1 },
        { date: '2024-01-13', present: 9, absent: 1, late: 0 },
      ],
    };

    setAttendanceRecords(mockRecords);
    setAttendanceStats(mockStats);
  }, [selectedDate, students]);

  const handleBulkMark = async (status: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRecords = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        id: Date.now().toString() + studentId,
        studentId: student?.studentId || '',
        studentName: student ? `${student.firstName} ${student.lastName}` : '',
        date: selectedDate,
        checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        status: status as any,
        location: 'Main Library',
        markedBy: 'Admin',
        markedAt: new Date().toISOString(),
      };
    });

    setAttendanceRecords([...attendanceRecords, ...newRecords]);
    setSelectedStudents([]);
    setBulkMarkDialogOpen(false);
    setSnackbar({ open: true, message: `✅ Marked ${selectedStudents.length} students as ${status}`, severity: 'success' });
    setLoading(false);
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setCurrentRecord(record);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!currentRecord) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAttendanceRecords(records => 
      records.map(r => r.id === currentRecord.id ? { ...r, ...currentRecord } : r)
    );
    
    setAttendanceDialogOpen(false);
    setCurrentRecord(null);
    setSnackbar({ open: true, message: '✅ Attendance record updated successfully!', severity: 'success' });
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <CancelIcon />;
      case 'late': return <ScheduleIcon />;
      case 'excused': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Attendance Tracking System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => alert('Exporting attendance data...')}>
            Export
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print Report
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {attendanceStats && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Present Today
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {attendanceStats.presentToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((attendanceStats.presentToday / attendanceStats.totalStudents) * 100)}% of total
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Absent Today
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {attendanceStats.absentToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Needs attention
                    </Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Late Today
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {attendanceStats.lateToday}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Monitor patterns
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Average Attendance
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {attendanceStats.averageAttendance}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {attendanceStats.attendanceTrend === 'up' ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {attendanceStats.attendanceTrend} from last week
                      </Typography>
                    </Box>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Today's Attendance" icon={<CalendarTodayIcon />} />
          <Tab label="Attendance History" icon={<HistoryIcon />} />
          <Tab label="Reports & Analytics" icon={<AssessmentIcon />} />
          <Tab label="Bulk Operations" icon={<GroupIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Date Selector and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                type="date"
                label="Select Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setBulkMarkDialogOpen(true)}
                disabled={selectedStudents.length === 0}
              >
                Mark Selected ({selectedStudents.length})
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Filter
              </Button>
              <Button variant="outlined" startIcon={<SearchIcon />}>
                Search
              </Button>
            </Box>
          </Box>

          {/* Attendance Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                        checked={students.length > 0 && selectedStudents.length === students.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(students.map(s => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Check-out Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const record = attendanceRecords.find(r => r.studentId === student.studentId && r.date === selectedDate);
                    return (
                      <TableRow key={student.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.studentId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {record?.checkInTime || '-'}
                        </TableCell>
                        <TableCell>
                          {record?.checkOutTime || '-'}
                        </TableCell>
                        <TableCell>
                          {record ? (
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status.toUpperCase()}
                              color={getStatusColor(record.status) as any}
                              size="small"
                            />
                          ) : (
                            <Chip label="NOT MARKED" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {record?.location || '-'}
                        </TableCell>
                        <TableCell>
                          {record?.notes || '-'}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Attendance">
                              <IconButton size="small" onClick={() => record && handleEditAttendance(record)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Attendance History</Typography>
          <Alert severity="info">
            Historical attendance data and trends would be displayed here with charts and detailed reports.
          </Alert>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Reports & Analytics</Typography>
          <Alert severity="info">
            Comprehensive attendance analytics, reports, and insights would be displayed here.
          </Alert>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Bulk Operations</Typography>
          <Alert severity="info">
            Bulk attendance marking, import/export, and batch operations would be available here.
          </Alert>
        </Box>
      )}

      {/* Bulk Mark Dialog */}
      <Dialog open={bulkMarkDialogOpen} onClose={() => setBulkMarkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Bulk Mark Attendance</Typography>
            <IconButton onClick={() => setBulkMarkDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Mark {selectedStudents.length} selected students for {selectedDate}:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleBulkMark('present')}
              disabled={loading}
            >
              Mark Present
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleBulkMark('absent')}
              disabled={loading}
            >
              Mark Absent
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ScheduleIcon />}
              onClick={() => handleBulkMark('late')}
              disabled={loading}
            >
              Mark Late
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<InfoIcon />}
              onClick={() => handleBulkMark('excused')}
              disabled={loading}
            >
              Mark Excused
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Attendance Record</Typography>
            <IconButton onClick={() => setAttendanceDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentRecord && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Check-in Time"
                    type="time"
                    value={currentRecord.checkInTime || ''}
                    onChange={(e) => setCurrentRecord({ ...currentRecord, checkInTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Check-out Time"
                    type="time"
                    value={currentRecord.checkOutTime || ''}
                    onChange={(e) => setCurrentRecord({ ...currentRecord, checkOutTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={currentRecord.status || ''}
                      label="Status"
                      onChange={(e) => setCurrentRecord({ ...currentRecord, status: e.target.value as any })}
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                      <MenuItem value="excused">Excused</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={currentRecord.location || ''}
                    onChange={(e) => setCurrentRecord({ ...currentRecord, location: e.target.value })}
                  />
                </Box>
              </Box>
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={currentRecord.notes || ''}
                  onChange={(e) => setCurrentRecord({ ...currentRecord, notes: e.target.value })}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAttendance} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceTrackingSystem;
