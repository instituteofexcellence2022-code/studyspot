/**
 * Attendance Management Page
 * 
 * Features:
 * - QR code attendance tracking
 * - Face recognition attendance
 * - Attendance analytics and reporting
 * - Fraud detection and prevention
 * - Attendance policies and rules
 * - Real-time monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { AccessTime as AccessTimeIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Biotech as BiotechIcon,
  BugReport as BugReportIcon,
  Business as BusinessIcon,
  CameraAlt as CameraIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Face as FaceIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  Policy as PolicyIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  QrCode as QRIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Scanner as ScannerIcon,
  Schedule as ScheduleIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Security as SecurityIcon2,
  Security as SecurityIcon3,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface AttendanceRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tenantId: string;
  tenantName: string;
  method: 'qr_code' | 'face_recognition' | 'manual' | 'api';
  status: 'present' | 'absent' | 'late' | 'early_departure' | 'suspicious' | 'fraud_detected';
  checkInTime: string;
  checkOutTime?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  device: {
    id: string;
    type: 'kiosk' | 'mobile' | 'web' | 'api';
    name: string;
    version: string;
  };
  biometricData?: {
    faceId: string;
    confidence: number;
    livenessScore: number;
    quality: 'high' | 'medium' | 'low';
  };
  qrData?: {
    code: string;
    generatedAt: string;
    expiresAt: string;
    scannedAt: string;
  };
  fraudDetection: {
    riskScore: number;
    flags: string[];
    verified: boolean;
    reviewRequired: boolean;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    campaign?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AttendancePolicy {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  tenantName: string;
  rules: {
    checkInTime: string;
    checkOutTime: string;
    gracePeriod: number; // minutes
    maxLateMinutes: number;
    requireLocation: boolean;
    requireBiometric: boolean;
    allowRemote: boolean;
  };
  fraudDetection: {
    enabled: boolean;
    riskThreshold: number;
    requireLiveness: boolean;
    maxDistance: number; // meters
    timeWindow: number; // minutes
  };
  notifications: {
    lateArrival: boolean;
    earlyDeparture: boolean;
    suspiciousActivity: boolean;
    fraudDetected: boolean;
  };
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

const AttendanceManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Mock data
  useEffect(() => {
    setAttendanceRecords([
      {
        id: '1',
        userId: 'user-123',
        userEmail: 'john.doe@example.com',
        userName: 'John Doe',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        method: 'face_recognition',
        status: 'present',
        checkInTime: '2024-01-15T09:00:00Z',
        checkOutTime: '2024-01-15T17:30:00Z',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Library St, San Francisco, CA',
          accuracy: 5.2
        },
        device: {
          id: 'kiosk-001',
          type: 'kiosk',
          name: 'Main Library Kiosk',
          version: '2.1.0'
        },
        biometricData: {
          faceId: 'face_123456',
          confidence: 0.95,
          livenessScore: 0.88,
          quality: 'high'
        },
        fraudDetection: {
          riskScore: 0.15,
          flags: [],
          verified: true,
          reviewRequired: false
        },
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'StudySpot-Kiosk/2.1.0',
          sessionId: 'sess_123456',
          campaign: 'winter-2024'
        },
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T17:30:00Z'
      },
      {
        id: '2',
        userId: 'user-456',
        userEmail: 'jane.smith@example.com',
        userName: 'Jane Smith',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        method: 'qr_code',
        status: 'late',
        checkInTime: '2024-01-15T09:25:00Z',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Library St, San Francisco, CA',
          accuracy: 3.8
        },
        device: {
          id: 'mobile-456',
          type: 'mobile',
          name: 'Jane\'s iPhone',
          version: '1.5.2'
        },
        qrData: {
          code: 'QR_789012345',
          generatedAt: '2024-01-15T08:30:00Z',
          expiresAt: '2024-01-15T18:00:00Z',
          scannedAt: '2024-01-15T09:25:00Z'
        },
        fraudDetection: {
          riskScore: 0.25,
          flags: ['late_arrival'],
          verified: true,
          reviewRequired: false
        },
        metadata: {
          ipAddress: '10.0.0.50',
          userAgent: 'StudySpot-Mobile/1.5.2 (iOS 17.2)',
          sessionId: 'sess_789012',
          campaign: 'winter-2024'
        },
        createdAt: '2024-01-15T09:25:00Z',
        updatedAt: '2024-01-15T09:25:00Z'
      },
      {
        id: '3',
        userId: 'user-789',
        userEmail: 'mike.wilson@example.com',
        userName: 'Mike Wilson',
        tenantId: 'tenant-2',
        tenantName: 'MIT Libraries',
        method: 'face_recognition',
        status: 'suspicious',
        checkInTime: '2024-01-15T10:15:00Z',
        location: {
          latitude: 42.3601,
          longitude: -71.0942,
          address: '77 Massachusetts Ave, Cambridge, MA',
          accuracy: 8.5
        },
        device: {
          id: 'kiosk-002',
          type: 'kiosk',
          name: 'MIT Library Kiosk',
          version: '2.0.5'
        },
        biometricData: {
          faceId: 'face_789012',
          confidence: 0.72,
          livenessScore: 0.45,
          quality: 'low'
        },
        fraudDetection: {
          riskScore: 0.75,
          flags: ['low_confidence', 'poor_liveness', 'unusual_location'],
          verified: false,
          reviewRequired: true
        },
        metadata: {
          ipAddress: '192.168.2.200',
          userAgent: 'StudySpot-Kiosk/2.0.5',
          sessionId: 'sess_345678',
          campaign: 'winter-2024'
        },
        createdAt: '2024-01-15T10:15:00Z',
        updatedAt: '2024-01-15T10:15:00Z'
      }
    ]);

    setPolicies([
      {
        id: '1',
        name: 'Standard Library Attendance',
        description: 'Standard attendance policy for library access',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        rules: {
          checkInTime: '08:00',
          checkOutTime: '18:00',
          gracePeriod: 15,
          maxLateMinutes: 30,
          requireLocation: true,
          requireBiometric: true,
          allowRemote: false
        },
        fraudDetection: {
          enabled: true,
          riskThreshold: 0.6,
          requireLiveness: true,
          maxDistance: 100,
          timeWindow: 5
        },
        notifications: {
          lateArrival: true,
          earlyDeparture: true,
          suspiciousActivity: true,
          fraudDetected: true
        },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Flexible Remote Attendance',
        description: 'Flexible policy allowing remote attendance',
        tenantId: 'tenant-2',
        tenantName: 'MIT Libraries',
        rules: {
          checkInTime: '09:00',
          checkOutTime: '17:00',
          gracePeriod: 30,
          maxLateMinutes: 60,
          requireLocation: false,
          requireBiometric: false,
          allowRemote: true
        },
        fraudDetection: {
          enabled: true,
          riskThreshold: 0.8,
          requireLiveness: false,
          maxDistance: 1000,
          timeWindow: 15
        },
        notifications: {
          lateArrival: true,
          earlyDeparture: false,
          suspiciousActivity: true,
          fraudDetected: true
        },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T14:30:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'early_departure': return 'info';
      case 'suspicious': return 'warning';
      case 'fraud_detected': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code': return <QRIcon />;
      case 'face_recognition': return <FaceIcon />;
      case 'manual': return <PersonIcon />;
      case 'api': return <CodeIcon />;
      default: return <AccessTimeIcon />;
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'error';
    if (riskScore >= 0.6) return 'warning';
    if (riskScore >= 0.4) return 'info';
    return 'success';
  };

  const filteredRecords = attendanceRecords.filter((record: any) => {
    const matchesSearch = record.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || record.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const attendanceMetrics = {
    totalRecords: attendanceRecords.length,
    presentToday: attendanceRecords.filter((r: any) => r.status === 'present').length,
    lateToday: attendanceRecords.filter((r: any) => r.status === 'late').length,
    suspiciousToday: attendanceRecords.filter((r: any) => r.status === 'suspicious').length,
    fraudDetected: attendanceRecords.filter((r: any) => r.status === 'fraud_detected').length,
    averageCheckIn: attendanceRecords.reduce((sum, r) => {
      const checkIn = new Date(r.checkInTime).getHours() * 60 + new Date(r.checkInTime).getMinutes();
      return sum + checkIn;
    }, 0) / attendanceRecords.length,
    biometricAccuracy: attendanceRecords.filter((r: any) => r.biometricData).reduce((sum, r) => 
      sum + (r.biometricData?.confidence || 0), 0) / attendanceRecords.filter((r: any) => r.biometricData).length
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Attendance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage attendance using QR codes and face recognition
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Record
          </Button>
        </Box>
      </Box>

      {/* Attendance Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Present Today</Typography>
                <Typography variant="h4">{attendanceMetrics.presentToday}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {attendanceMetrics.totalRecords} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Late Arrivals</Typography>
                <Typography variant="h4">{attendanceMetrics.lateToday}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendanceMetrics.suspiciousToday} suspicious
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Fraud Detected</Typography>
                <Typography variant="h4">{attendanceMetrics.fraudDetected}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Security alerts
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <BiotechIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Biometric Accuracy</Typography>
                <Typography variant="h4">{(attendanceMetrics.biometricAccuracy * 100).toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Face recognition
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Records" />
          <Tab label="Policies" />
          <Tab label="Analytics" />
          <Tab label="Security" />
        </Tabs>

        {/* Records Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Attendance Records</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="early_departure">Early Departure</MenuItem>
                  <MenuItem value="suspicious">Suspicious</MenuItem>
                  <MenuItem value="fraud_detected">Fraud Detected</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="qr_code">QR Code</MenuItem>
                  <MenuItem value="face_recognition">Face Recognition</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{record.userName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                          {getMethodIcon(record.method)}
                        </Avatar>
                        <Typography variant="body2">
                          {record.method.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status.replace('_', ' ')}
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(record.checkInTime).toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.checkInTime).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime ? (
                        <Typography variant="body2">
                          {new Date(record.checkOutTime).toLocaleTimeString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Still present
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.location.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ±{record.location.accuracy}m accuracy
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {(record.fraudDetection.riskScore * 100).toFixed(0)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={record.fraudDetection.riskScore * 100}
                          color={getRiskColor(record.fraudDetection.riskScore) as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedRecord(record)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SecurityIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Attendance Policies</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{policy.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.tenantName}
                      </Typography>
                    </Box>
                    <Chip
                      label={policy.status}
                      color={getStatusColor(policy.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {policy.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Rules</Typography>
                    <Typography variant="body2">Check-in: {policy.rules.checkInTime}</Typography>
                    <Typography variant="body2">Check-out: {policy.rules.checkOutTime}</Typography>
                    <Typography variant="body2">Grace Period: {policy.rules.gracePeriod} minutes</Typography>
                    <Typography variant="body2">Max Late: {policy.rules.maxLateMinutes} minutes</Typography>
                    <Typography variant="body2">Location Required: {policy.rules.requireLocation ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Biometric Required: {policy.rules.requireBiometric ? 'Yes' : 'No'}</Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<SettingsIcon />}>
                      Configure
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Attendance Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Attendance Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Method Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Attendance Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Attendance recorded"
                    secondary="John Doe - Face Recognition - Present - Time: 2024-01-15 09:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Late arrival detected"
                    secondary="Jane Smith - QR Code - Late - Time: 2024-01-15 09:25:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Suspicious activity"
                    secondary="Mike Wilson - Face Recognition - Suspicious - Time: 2024-01-15 10:15:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Security & Fraud Detection</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Fraud Detection</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Liveness detection enabled</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Location verification active</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Biometric quality checks</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2">3 suspicious activities today</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Security Metrics</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Risk Threshold</Typography>
                  <Typography variant="body2">60%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Avg Risk Score</Typography>
                  <Typography variant="body2">25%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">False Positives</Typography>
                  <Typography variant="body2">2.1%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Detection Rate</Typography>
                  <Typography variant="body2">98.5%</Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Biometric Security</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Face recognition active</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Liveness detection</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Quality assessment</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">Anti-spoofing measures</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Record Details Dialog */}
      <Dialog open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth="md" fullWidth>
        <DialogTitle>Attendance Record Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedRecord.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedRecord.userEmail} • {selectedRecord.tenantName}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Attendance Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Method: {selectedRecord.method.replace('_', ' ')}</Typography>
                      <Typography variant="body2">Status: {selectedRecord.status.replace('_', ' ')}</Typography>
                      <Typography variant="body2">Check-in: {new Date(selectedRecord.checkInTime).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Device: {selectedRecord.device.name}</Typography>
                      <Typography variant="body2">Version: {selectedRecord.device.version}</Typography>
                      {selectedRecord.checkOutTime && (
                        <Typography variant="body2">Check-out: {new Date(selectedRecord.checkOutTime).toLocaleString()}</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Location</Typography>
                  <Typography variant="body2">{selectedRecord.location.address}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lat: {selectedRecord.location.latitude}, Lng: {selectedRecord.location.longitude}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy: ±{selectedRecord.location.accuracy} meters
                  </Typography>
                </Box>
                
                {selectedRecord.biometricData && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Biometric Data</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2">Face ID: {selectedRecord.biometricData.faceId}</Typography>
                        <Typography variant="body2">Confidence: {(selectedRecord.biometricData.confidence * 100).toFixed(1)}%</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">Liveness Score: {(selectedRecord.biometricData.livenessScore * 100).toFixed(1)}%</Typography>
                        <Typography variant="body2">Quality: {selectedRecord.biometricData.quality}</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Fraud Detection</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Risk Score: {(selectedRecord.fraudDetection.riskScore * 100).toFixed(1)}%</Typography>
                      <Typography variant="body2">Verified: {selectedRecord.fraudDetection.verified ? 'Yes' : 'No'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Review Required: {selectedRecord.fraudDetection.reviewRequired ? 'Yes' : 'No'}</Typography>
                      {selectedRecord.fraudDetection.flags.length > 0 && (
                        <Typography variant="body2">Flags: {selectedRecord.fraudDetection.flags.join(', ')}</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRecord(null)}>Close</Button>
          <Button variant="contained">Update Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagementPage;
