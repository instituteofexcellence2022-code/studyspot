import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  useTheme,
  alpha,
  Switch,
  Slider,
} from '@mui/material';
import {
  Face as FaceIcon,
  CameraAlt as CameraIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Videocam as VideoIcon,
  PhotoCamera as PhotoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  SmartToy as SmartIcon,
  Home as HomeIcon,
  PhoneAndroid as PhoneIcon,
  CloudSync as CloudIcon,
  Rule as RuleIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { toast } from 'react-toastify';
import { unifiedFaceRecognitionService, unifiedHelpers } from '../../services/unifiedFaceRecognitionService';
import FaceEnrollmentWizard from '../../components/face-recognition/FaceEnrollmentWizard';
import RealTimeFaceDetection from '../../components/face-recognition/RealTimeFaceDetection';
import AIAnalyticsDashboard from '../../components/face-recognition/AIAnalyticsDashboard';
import AdvancedSecurityDashboard from '../../components/face-recognition/AdvancedSecurityDashboard';
import ExternalCameraDashboard from '../../components/face-recognition/ExternalCameraDashboard';

// Types and Interfaces
interface FaceEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentDate: string;
  qualityScore: number;
  faceCount: number;
  status: 'pending' | 'completed' | 'failed' | 'needs_retake';
  images: string[];
  features: number[];
  lastUpdated: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  timestamp: string;
  confidence: number;
  cameraId: string;
  cameraName: string;
  location: string;
  status: 'verified' | 'pending' | 'failed' | 'spoof_detected';
  imageUrl?: string;
  livenessScore: number;
  maskDetected: boolean;
}

interface Camera {
  id: string;
  name: string;
  type: 'ip_camera' | 'usb_webcam' | 'mobile' | 'biometric_device';
  status: 'online' | 'offline' | 'error';
  location: string;
  resolution: string;
  fps: number;
  lastSeen: string;
  settings: {
    quality: number;
    brightness: number;
    contrast: number;
    detectionThreshold: number;
    livenessThreshold: number;
  };
}

interface SecurityAlert {
  id: string;
  type: 'spoof_attempt' | 'unauthorized_access' | 'system_breach' | 'data_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  studentId?: string;
  cameraId: string;
  confidence: number;
  resolved: boolean;
}

interface RecognitionAnalytics {
  totalRecognitions: number;
  successfulRecognitions: number;
  failedRecognitions: number;
  spoofAttempts: number;
  averageConfidence: number;
  averageLivenessScore: number;
  recognitionRate: number;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    recognitionCount: number;
    averageConfidence: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    recognitions: number;
    successRate: number;
  }>;
}

// Mock Data
const mockEnrollments: FaceEnrollment[] = [
  {
    id: 'enroll-001',
    studentId: 'STU001',
    studentName: 'John Doe',
    studentEmail: 'john.doe@email.com',
    enrollmentDate: '2024-01-15T10:30:00Z',
    qualityScore: 95,
    faceCount: 12,
    status: 'completed',
    images: ['face1.jpg', 'face2.jpg', 'face3.jpg'],
    features: [0.1, 0.2, 0.3, 0.4, 0.5],
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: 'enroll-002',
    studentId: 'STU002',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@email.com',
    enrollmentDate: '2024-01-16T14:20:00Z',
    qualityScore: 87,
    faceCount: 8,
    status: 'completed',
    images: ['face4.jpg', 'face5.jpg'],
    features: [0.2, 0.3, 0.4, 0.5, 0.6],
    lastUpdated: '2024-01-16T14:20:00Z'
  },
  {
    id: 'enroll-003',
    studentId: 'STU003',
    studentName: 'Mike Johnson',
    studentEmail: 'mike.johnson@email.com',
    enrollmentDate: '2024-01-17T09:15:00Z',
    qualityScore: 72,
    faceCount: 5,
    status: 'needs_retake',
    images: ['face6.jpg'],
    features: [0.3, 0.4, 0.5, 0.6, 0.7],
    lastUpdated: '2024-01-17T09:15:00Z'
  }
];

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-001',
    studentId: 'STU001',
    studentName: 'John Doe',
    studentEmail: 'john.doe@email.com',
    timestamp: new Date().toISOString(),
    confidence: 98.5,
    cameraId: 'cam-001',
    cameraName: 'Main Entrance Camera',
    location: 'Library Entrance',
    status: 'verified',
    livenessScore: 95.2,
    maskDetected: false
  },
  {
    id: 'att-002',
    studentId: 'STU002',
    studentName: 'Jane Smith',
    studentEmail: 'jane.smith@email.com',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    confidence: 89.3,
    cameraId: 'cam-001',
    cameraName: 'Main Entrance Camera',
    location: 'Library Entrance',
    status: 'verified',
    livenessScore: 87.8,
    maskDetected: true
  }
];

const mockCameras: Camera[] = [
  {
    id: 'cam-001',
    name: 'Main Entrance Camera',
    type: 'ip_camera',
    status: 'online',
    location: 'Library Entrance',
    resolution: '1920x1080',
    fps: 30,
    lastSeen: new Date().toISOString(),
    settings: {
      quality: 90,
      brightness: 50,
      contrast: 50,
      detectionThreshold: 85,
      livenessThreshold: 80
    }
  },
  {
    id: 'cam-002',
    name: 'Study Hall Camera',
    type: 'usb_webcam',
    status: 'online',
    location: 'Study Hall A',
    resolution: '1280x720',
    fps: 25,
    lastSeen: new Date().toISOString(),
    settings: {
      quality: 85,
      brightness: 60,
      contrast: 45,
      detectionThreshold: 80,
      livenessThreshold: 75
    }
  }
];

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'alert-001',
    type: 'spoof_attempt',
    severity: 'high',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    description: 'Photo spoofing attempt detected',
    cameraId: 'cam-001',
    confidence: 92.3,
    resolved: false
  },
  {
    id: 'alert-002',
    type: 'unauthorized_access',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    description: 'Unknown face detected multiple times',
    cameraId: 'cam-002',
    confidence: 78.5,
    resolved: true
  }
];

const mockAnalytics: RecognitionAnalytics = {
  totalRecognitions: 1250,
  successfulRecognitions: 1180,
  failedRecognitions: 45,
  spoofAttempts: 25,
  averageConfidence: 91.2,
  averageLivenessScore: 88.7,
  recognitionRate: 94.4,
  topPerformers: [
    { studentId: 'STU001', studentName: 'John Doe', recognitionCount: 45, averageConfidence: 96.8 },
    { studentId: 'STU002', studentName: 'Jane Smith', recognitionCount: 38, averageConfidence: 94.2 },
    { studentId: 'STU003', studentName: 'Mike Johnson', recognitionCount: 32, averageConfidence: 89.5 }
  ],
  hourlyStats: [
    { hour: '08:00', recognitions: 45, successRate: 95.6 },
    { hour: '09:00', recognitions: 78, successRate: 93.2 },
    { hour: '10:00', recognitions: 92, successRate: 94.8 },
    { hour: '11:00', recognitions: 67, successRate: 91.5 },
    { hour: '12:00', recognitions: 34, successRate: 88.2 },
    { hour: '13:00', recognitions: 28, successRate: 89.3 },
    { hour: '14:00', recognitions: 56, successRate: 92.7 },
    { hour: '15:00', recognitions: 73, successRate: 94.1 },
    { hour: '16:00', recognitions: 89, successRate: 95.8 },
    { hour: '17:00', recognitions: 65, successRate: 93.4 },
    { hour: '18:00', recognitions: 42, successRate: 90.7 },
    { hour: '19:00', recognitions: 23, successRate: 87.9 }
  ]
};

const FaceRecognitionDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [enrollments, setEnrollments] = useState<FaceEnrollment[]>(mockEnrollments);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [analytics, setAnalytics] = useState<RecognitionAnalytics>(mockAnalytics);
  const [selectedEnrollment, setSelectedEnrollment] = useState<FaceEnrollment | null>(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState<Partial<FaceEnrollment>>({});
  const [showEnrollmentWizard, setShowEnrollmentWizard] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new attendance records
      if (Math.random() > 0.7) {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: 'STU001',
          studentName: 'John Doe',
          studentEmail: 'john.doe@email.com',
          timestamp: new Date().toISOString(),
          confidence: 85 + Math.random() * 15,
          cameraId: 'cam-001',
          cameraName: 'Main Entrance Camera',
          location: 'Library Entrance',
          status: 'verified',
          livenessScore: 80 + Math.random() * 20,
          maskDetected: Math.random() > 0.8
        };
        setAttendanceRecords(prev => [newRecord, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleEnrollmentSubmit = () => {
    if (newEnrollment.studentId && newEnrollment.studentName) {
      const enrollment: FaceEnrollment = {
        id: `enroll-${Date.now()}`,
        studentId: newEnrollment.studentId,
        studentName: newEnrollment.studentName,
        studentEmail: newEnrollment.studentEmail || '',
        enrollmentDate: new Date().toISOString(),
        qualityScore: 0,
        faceCount: 0,
        status: 'pending',
        images: [],
        features: [],
        lastUpdated: new Date().toISOString()
      };
      setEnrollments(prev => [...prev, enrollment]);
      setNewEnrollment({});
      setEnrollmentDialogOpen(false);
      toast.success('Face enrollment initiated');
    }
  };

  const handleCameraSettingsUpdate = (cameraId: string, settings: Partial<Camera['settings']>) => {
    setCameras(prev => prev.map(camera => 
      camera.id === cameraId 
        ? { ...camera, settings: { ...camera.settings, ...settings } }
        : camera
    ));
    toast.success('Camera settings updated');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
      case 'online':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'offline':
      case 'error':
        return 'error';
      case 'needs_retake':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const unresolvedAlerts = securityAlerts.filter(a => !a.resolved).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            👤 Face Recognition Attendance System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Biometric attendance with advanced face recognition technology
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowEnrollmentWizard(true)}
          >
            New Enrollment
          </Button>
          <Button
            variant="contained"
            startIcon={<CameraIcon />}
            onClick={() => setCameraDialogOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            Add Camera
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
                    Total Enrollments
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalEnrollments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <FaceIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`${completedEnrollments} Completed`} 
                  color="success" 
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
                    Recognition Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {analytics.recognitionRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Today" 
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
                    Active Cameras
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {onlineCameras}/{cameras.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <VideoIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Online" 
                  color="success" 
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
                    Security Alerts
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {unresolvedAlerts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <SecurityIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Unresolved" 
                  color="error" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Live Feed" icon={<VideoIcon />} />
            <Tab label="Enrollments" icon={<FaceIcon />} />
            <Tab label="Attendance" icon={<CheckIcon />} />
            <Tab label="Cameras" icon={<CameraIcon />} />
            <Tab label="Security" icon={<SecurityIcon />} />
            <Tab label="Analytics" icon={<AnalyticsIcon />} />
            <Tab label="Advanced Security" icon={<SecurityIcon />} />
            <Tab label="External Cameras" icon={<CameraIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Live Feed Tab */}
          {activeTab === 0 && (
            <RealTimeFaceDetection />
          )}

          {/* Enrollments Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Face Enrollments
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowEnrollmentWizard(true)}
                >
                  New Enrollment
                </Button>
              </Box>

              <Grid container spacing={3}>
                {enrollments.map((enrollment) => (
                  <Grid item xs={12} md={6} lg={4} key={enrollment.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {enrollment.studentName}
                          </Typography>
                          <Chip 
                            label={enrollment.status}
                            color={getStatusColor(enrollment.status) as any}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Student ID: {enrollment.studentId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Quality Score: {enrollment.qualityScore}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Face Images: {enrollment.faceCount}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Quality Score
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={enrollment.qualityScore} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="info">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Attendance Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Attendance Records
              </Typography>
              
              <List>
                {attendanceRecords.map((record) => (
                  <ListItem key={record.id} sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <FaceIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={record.studentName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(record.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.cameraName} • {record.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip 
                          label={`${record.confidence.toFixed(1)}%`}
                          color="success"
                          size="small"
                        />
                        <Chip 
                          label={record.status}
                          color={getStatusColor(record.status) as any}
                          size="small"
                        />
                        {record.maskDetected && (
                          <Chip 
                            label="Mask Detected"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Cameras Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {cameras.map((camera) => (
                <Grid item xs={12} md={6} key={camera.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {camera.name}
                        </Typography>
                        <Chip 
                          label={camera.status}
                          color={getStatusColor(camera.status) as any}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Type: {camera.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Location: {camera.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Resolution: {camera.resolution} @ {camera.fps}fps
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Detection Threshold: {camera.settings.detectionThreshold}%
                        </Typography>
                        <Slider
                          value={camera.settings.detectionThreshold}
                          onChange={(e, value) => handleCameraSettingsUpdate(camera.id, { detectionThreshold: value as number })}
                          min={50}
                          max={100}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton size="small" color="primary">
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small" color="info">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Security Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Security Alerts
              </Typography>
              
              <List>
                {securityAlerts.map((alert) => (
                  <ListItem key={alert.id} sx={{ px: 0, py: 2 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                        <SecurityIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={alert.description}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Camera: {alert.cameraId} • Confidence: {alert.confidence.toFixed(1)}%
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip 
                          label={alert.severity}
                          color={getSeverityColor(alert.severity) as any}
                          size="small"
                        />
                        <Chip 
                          label={alert.resolved ? 'Resolved' : 'Open'}
                          color={alert.resolved ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 5 && (
            <AIAnalyticsDashboard />
          )}

          {/* Advanced Security Tab */}
          {activeTab === 6 && (
            <AdvancedSecurityDashboard />
          )}

          {/* External Cameras Tab */}
          {activeTab === 7 && (
            <ExternalCameraDashboard />
          )}
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={enrollmentDialogOpen} onClose={() => setEnrollmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Face Enrollment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={newEnrollment.studentId || ''}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, studentId: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={newEnrollment.studentName || ''}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, studentName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Email"
                  type="email"
                  value={newEnrollment.studentEmail || ''}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, studentEmail: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEnrollmentSubmit} variant="contained">
            Start Enrollment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={cameraDialogOpen} onClose={() => setCameraDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Camera</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Camera Name"
                  placeholder="e.g., Main Entrance Camera"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Camera Type</InputLabel>
                  <Select>
                    <MenuItem value="ip_camera">IP Camera</MenuItem>
                    <MenuItem value="usb_webcam">USB Webcam</MenuItem>
                    <MenuItem value="mobile">Mobile Device</MenuItem>
                    <MenuItem value="biometric_device">Biometric Device</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  placeholder="e.g., Library Entrance"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Resolution"
                  placeholder="e.g., 1920x1080"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="FPS"
                  type="number"
                  placeholder="30"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">
            Add Camera
          </Button>
        </DialogActions>
      </Dialog>

      {/* Face Enrollment Wizard */}
      <FaceEnrollmentWizard
        open={showEnrollmentWizard}
        onClose={() => setShowEnrollmentWizard(false)}
        onComplete={(data) => {
          // Handle completed enrollment
          const newEnrollment: FaceEnrollment = {
            id: `enroll-${Date.now()}`,
            studentId: data.studentId,
            studentName: data.studentName,
            studentEmail: data.studentEmail,
            enrollmentDate: new Date().toISOString(),
            qualityScore: data.overallQuality,
            faceCount: data.capturedImages.length,
            status: 'completed',
            images: data.capturedImages.map(img => img.id),
            features: [],
            lastUpdated: new Date().toISOString()
          };
          setEnrollments(prev => [...prev, newEnrollment]);
          toast.success('Face enrollment completed successfully!');
        }}
      />
    </Box>
  );
};

export default FaceRecognitionDashboard;
