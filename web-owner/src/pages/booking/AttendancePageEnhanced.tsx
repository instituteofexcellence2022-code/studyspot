import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Avatar, FormControl, InputLabel, Select,
  Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert, Snackbar,
  Tooltip, IconButton, InputAdornment, TablePagination, TableSortLabel,
  Tabs, Tab, Switch, FormControlLabel, Badge, LinearProgress, Divider,
  List, ListItem, ListItemIcon, ListItemText as MuiListItemText, ListItemSecondaryAction,
  Stepper, Step, StepLabel, StepContent, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  CheckCircle as CheckInIcon, ExitToApp as CheckOutIcon, Add as AddIcon,
  AccessTime as TimeIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon, Videocam as CameraIcon,
  Face as FaceIcon, AutoAwesome as AIIcon, PlayArrow as PlayIcon,
  Pause as PauseIcon, Stop as StopIcon, Refresh as RefreshIcon,
  Settings as SettingsIcon, Notifications as NotificationsIcon,
  TrendingUp as TrendingIcon, Assessment as AnalyticsIcon,
  PersonAdd as PersonAddIcon, QrCode as QRCodeIcon,
  SmartToy as SmartIcon, Security as SecurityIcon,
  Warning as WarningIcon, CheckCircle as CheckIcon,
  Error as ErrorIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon,
  CameraAlt as CameraAltIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon, Speed as SpeedIcon,
  HighQuality as QualityIcon, NetworkCheck as NetworkIcon,
} from '@mui/icons-material';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Legend, ScatterChart, Scatter,
} from 'recharts';
import { toast } from 'react-toastify';
import { unifiedFaceRecognitionService, unifiedHelpers } from '../../services/unifiedFaceRecognitionService';

// Types and Interfaces
interface AttendanceRecord {
  id: number;
  studentName: string;
  studentId: string;
  seatNumber: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: 'checked-in' | 'checked-out' | 'absent';
  date: string;
  method: 'face-recognition' | 'manual' | 'qr-code';
  confidence?: number;
  faceImage?: string;
  location?: string;
}

interface FaceRecognitionResult {
  studentId: string;
  studentName: string;
  confidence: number;
  faceImage: string;
  timestamp: string;
  location: string;
}

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  averageDuration: string;
  faceRecognitionAccuracy: number;
  autoMarkedToday: number;
  manualMarkedToday: number;
}

interface CameraStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: string;
  faceDetections: number;
  accuracy: number;
}

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 1,
    studentName: 'Rajesh Kumar',
    studentId: 'STU001',
    seatNumber: 'A01',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    duration: '8h 0m',
    status: 'checked-out',
    date: '2025-10-23',
    method: 'face-recognition',
    confidence: 0.95,
    faceImage: '/images/faces/rajesh.jpg',
    location: 'Main Entrance'
  },
  {
    id: 2,
    studentName: 'Priya Sharma',
    studentId: 'STU002',
    seatNumber: 'B05',
    checkIn: '10:30 AM',
    checkOut: '-',
    duration: '2h 30m',
    status: 'checked-in',
    date: '2025-10-23',
    method: 'face-recognition',
    confidence: 0.92,
    faceImage: '/images/faces/priya.jpg',
    location: 'Library Hall'
  },
  {
    id: 3,
    studentName: 'Amit Patel',
    studentId: 'STU003',
    seatNumber: 'C12',
    checkIn: '08:00 AM',
    checkOut: '-',
    duration: '5h 0m',
    status: 'checked-in',
    date: '2025-10-23',
    method: 'manual',
    confidence: 1.0,
    location: 'Study Area'
  }
];

const AttendancePageEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [faceRecognitionActive, setFaceRecognitionActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus[]>([
    {
      id: 'cam-001',
      name: 'Main Entrance Camera',
      status: 'online',
      lastSeen: new Date().toISOString(),
      faceDetections: 45,
      accuracy: 94.5
    },
    {
      id: 'cam-002',
      name: 'Library Hall Camera',
      status: 'online',
      lastSeen: new Date().toISOString(),
      faceDetections: 32,
      accuracy: 91.2
    }
  ]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalStudents: 150,
    presentToday: 45,
    absentToday: 105,
    averageDuration: '6h 30m',
    faceRecognitionAccuracy: 94.5,
    autoMarkedToday: 38,
    manualMarkedToday: 7
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Partial<AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof AttendanceRecord>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Partial<Record<keyof AttendanceRecord, string>>>({});
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [recentDetections, setRecentDetections] = useState<FaceRecognitionResult[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock face recognition data
  const generateMockDetections = (): FaceRecognitionResult[] => [
    {
      studentId: 'STU001',
      studentName: 'Rajesh Kumar',
      confidence: 0.95,
      faceImage: '/images/faces/rajesh.jpg',
      timestamp: new Date().toISOString(),
      location: 'Main Entrance'
    },
    {
      studentId: 'STU002',
      studentName: 'Priya Sharma',
      confidence: 0.92,
      faceImage: '/images/faces/priya.jpg',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      location: 'Library Hall'
    },
    {
      studentId: 'STU004',
      studentName: 'Sneha Reddy',
      confidence: 0.88,
      faceImage: '/images/faces/sneha.jpg',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      location: 'Study Area'
    }
  ];

  useEffect(() => {
    if (faceRecognitionActive) {
      setRecentDetections(generateMockDetections());
    }
  }, [faceRecognitionActive]);

  const filteredRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesSearch = searchTerm === '' || 
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(record.status);
      const matchesDate = !dateFilter || record.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [records, searchTerm, statusFilter, dateFilter, sortField, sortOrder]);

  const paginatedRecords = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage]);

  const handleFaceRecognitionToggle = () => {
    setFaceRecognitionActive(!faceRecognitionActive);
    if (!faceRecognitionActive) {
      toast.success('Face recognition activated - Auto attendance marking enabled');
    } else {
      toast.info('Face recognition deactivated');
    }
  };

  const handleAutoMarkAttendance = (detection: FaceRecognitionResult) => {
    const newRecord: AttendanceRecord = {
      id: Date.now(),
      studentName: detection.studentName,
      studentId: detection.studentId,
      seatNumber: 'AUTO',
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      checkOut: '-',
      duration: '0h 0m',
      status: 'checked-in',
      date: new Date().toISOString().split('T')[0],
      method: 'face-recognition',
      confidence: detection.confidence,
      faceImage: detection.faceImage,
      location: detection.location
    };

    setRecords(prev => [newRecord, ...prev]);
    setAttendanceStats(prev => ({
      ...prev,
      presentToday: prev.presentToday + 1,
      autoMarkedToday: prev.autoMarkedToday + 1
    }));
    
    toast.success(`Auto attendance marked for ${detection.studentName} (${Math.round(detection.confidence * 100)}% confidence)`);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'face-recognition': return <FaceIcon color="primary" />;
      case 'manual': return <PersonAddIcon color="secondary" />;
      case 'qr-code': return <QRCodeIcon color="info" />;
      default: return <CheckInIcon />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'face-recognition': return 'primary';
      case 'manual': return 'secondary';
      case 'qr-code': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'success';
      case 'checked-out': return 'info';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            <CheckInIcon sx={{ mr: 1, fontSize: 'inherit' }} /> Smart Attendance Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered face recognition with automatic attendance marking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={faceRecognitionActive}
                onChange={handleFaceRecognitionToggle}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaceIcon color={faceRecognitionActive ? 'primary' : 'disabled'} />
                <Typography variant="body2">
                  {faceRecognitionActive ? 'Auto Attendance ON' : 'Auto Attendance OFF'}
                </Typography>
              </Box>
            }
          />
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Manual Entry
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Present Today
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {attendanceStats.presentToday}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${attendanceStats.autoMarkedToday} Auto`}
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`${attendanceStats.manualMarkedToday} Manual`}
                  color="info" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Face Recognition Accuracy
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {attendanceStats.faceRecognitionAccuracy}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AIIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={attendanceStats.faceRecognitionAccuracy} 
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Cameras
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {cameraStatus.filter(c => c.status === 'online').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <CameraIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${cameraStatus.length} Total`}
                  color="info" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Average Duration
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {attendanceStats.averageDuration}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TimeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Live Attendance" icon={<CheckInIcon />} />
            <Tab label="Face Recognition" icon={<FaceIcon />} />
            <Tab label="Attendance Records" icon={<AnalyticsIcon />} />
            <Tab label="Camera Status" icon={<CameraIcon />} />
            <Tab label="Analytics" icon={<TrendingIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Live Attendance Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Real-time Attendance Monitoring
              </Typography>
              
              {faceRecognitionActive && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🤖 Face Recognition Active - Auto attendance marking enabled
                  </Typography>
                  <Typography variant="body2">
                    System is automatically detecting and marking attendance for enrolled students
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Face Detections
                      </Typography>
                      <List>
                        {recentDetections.map((detection, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar src={detection.faceImage} sx={{ width: 40, height: 40 }}>
                                <FaceIcon />
                              </Avatar>
                            </ListItemIcon>
                            <MuiListItemText
                              primary={detection.studentName}
                              secondary={`${detection.studentId} • ${detection.location} • ${Math.round(detection.confidence * 100)}% confidence`}
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={`${Math.round(detection.confidence * 100)}%`}
                                  color={detection.confidence > 0.9 ? 'success' : 'warning'}
                                  size="small"
                                />
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleAutoMarkAttendance(detection)}
                                >
                                  Mark Attendance
                                </Button>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Camera Status
                      </Typography>
                      <List>
                        {cameraStatus.map((camera) => (
                          <ListItem key={camera.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <CameraIcon color={getCameraStatusColor(camera.status) as any} />
                            </ListItemIcon>
                            <MuiListItemText
                              primary={camera.name}
                              secondary={`${camera.faceDetections} detections • ${camera.accuracy}% accuracy`}
                            />
                            <ListItemSecondaryAction>
                              <Chip
                                label={camera.status}
                                color={getCameraStatusColor(camera.status) as any}
                                size="small"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Face Recognition Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Face Recognition System
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Live Camera Feed
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 400,
                          backgroundColor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1,
                          mb: 2,
                          position: 'relative'
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <CameraIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            Live Camera Feed
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Face detection and recognition in progress
                          </Typography>
                        </Box>
                        
                        {faceRecognitionActive && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              bgcolor: 'success.main',
                              color: 'white',
                              px: 2,
                              py: 1,
                              borderRadius: 1
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                animation: 'pulse 2s infinite'
                              }}
                            />
                            <Typography variant="body2">
                              REC
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={faceRecognitionActive ? <PauseIcon /> : <PlayIcon />}
                          onClick={handleFaceRecognitionToggle}
                          color={faceRecognitionActive ? 'warning' : 'success'}
                        >
                          {faceRecognitionActive ? 'Stop Recognition' : 'Start Recognition'}
                        </Button>
                        <Button variant="outlined" startIcon={<SettingsIcon />}>
                          Camera Settings
                        </Button>
                        <Button variant="outlined" startIcon={<RefreshIcon />}>
                          Refresh Feed
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recognition Settings
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Auto Mark Attendance"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Sound Notifications"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Save Face Images"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="High Accuracy Mode"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Confidence Threshold
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={90} 
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        90% minimum confidence required
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Attendance Records Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Attendance Records
              </Typography>
              
              {/* Filters */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as string[])}
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="checked-in">
                      <Checkbox checked={statusFilter.includes('checked-in')} />
                      <ListItemText primary="Checked In" />
                    </MenuItem>
                    <MenuItem value="checked-out">
                      <Checkbox checked={statusFilter.includes('checked-out')} />
                      <ListItemText primary="Checked Out" />
                    </MenuItem>
                    <MenuItem value="absent">
                      <Checkbox checked={statusFilter.includes('absent')} />
                      <ListItemText primary="Absent" />
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Date"
                />
              </Box>

              {/* Records Table */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'studentName'}
                          direction={sortField === 'studentName' ? sortOrder : 'asc'}
                          onClick={() => {
                            setSortField('studentName');
                            setSortOrder(sortField === 'studentName' && sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          Student
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Seat</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {record.faceImage && (
                              <Avatar src={record.faceImage} sx={{ width: 32, height: 32 }}>
                                <FaceIcon />
                              </Avatar>
                            )}
                            <Typography variant="body2" fontWeight={600}>
                              {record.studentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{record.studentId}</TableCell>
                        <TableCell>{record.seatNumber}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>{record.duration}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getMethodIcon(record.method)}
                            label={record.method.replace('-', ' ').toUpperCase()}
                            color={getMethodColor(record.method) as any}
                            size="small"
                          />
                          {record.confidence && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {Math.round(record.confidence * 100)}% confidence
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status.replace('-', ' ').toUpperCase()}
                            color={getStatusColor(record.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </TableContainer>
            </Box>
          )}

          {/* Camera Status Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Camera System Status
              </Typography>
              <Grid container spacing={3}>
                {cameraStatus.map((camera) => (
                  <Grid item xs={12} md={6} key={camera.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">
                            {camera.name}
                          </Typography>
                          <Chip
                            label={camera.status}
                            color={getCameraStatusColor(camera.status) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Face Detections Today: {camera.faceDetections}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Accuracy: {camera.accuracy}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last Seen: {new Date(camera.lastSeen).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<PlayIcon />}>
                            View Feed
                          </Button>
                          <Button size="small" startIcon={<SettingsIcon />}>
                            Settings
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Attendance Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Attendance Trends (7 Days)
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { day: 'Mon', present: 45, absent: 105 },
                          { day: 'Tue', present: 52, absent: 98 },
                          { day: 'Wed', present: 48, absent: 102 },
                          { day: 'Thu', present: 55, absent: 95 },
                          { day: 'Fri', present: 42, absent: 108 },
                          { day: 'Sat', present: 38, absent: 112 },
                          { day: 'Sun', present: 25, absent: 125 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="present" stroke="#4caf50" strokeWidth={2} name="Present" />
                          <Line type="monotone" dataKey="absent" stroke="#f44336" strokeWidth={2} name="Absent" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Attendance Methods
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Face Recognition', value: 75, color: '#2196f3' },
                              { name: 'Manual Entry', value: 20, color: '#ff9800' },
                              { name: 'QR Code', value: 5, color: '#9c27b0' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {[
                              { name: 'Face Recognition', value: 75, color: '#2196f3' },
                              { name: 'Manual Entry', value: 20, color: '#ff9800' },
                              { name: 'QR Code', value: 5, color: '#9c27b0' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendancePageEnhanced;
