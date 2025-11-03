import React, { useState, useEffect } from 'react';
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
  Alert,
  Tooltip,
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Videocam as CameraIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Group as GroupIcon,
  ControlCamera as PTZIcon,
  Nightlight as NightVisionIcon,
  Mic as AudioIcon,
  MotionPhotosOff as MotionIcon,
  Face as FaceIcon,
  ZoomIn as ZoomIcon,
  PanTool as PanIcon,
  VerticalAlignTop as TiltIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
  ViewStream as StreamIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon2,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'react-toastify';
import { 
  unifiedFaceRecognitionService, 
  unifiedHelpers,
  Camera as ExternalCamera,
  CameraEvent,
  CameraGroup,
  cameraBrands,
  cameraBrandDetails,
  cameraHelpers 
} from '../../services/unifiedFaceRecognitionService';

const ExternalCameraDashboard: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [cameras, setCameras] = useState<ExternalCamera[]>([]);
  const [cameraGroups, setCameraGroups] = useState<CameraGroup[]>([]);
  const [cameraEvents, setCameraEvents] = useState<CameraEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addCameraDialogOpen, setAddCameraDialogOpen] = useState(false);
  const [editCameraDialogOpen, setEditCameraDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<ExternalCamera | null>(null);
  const [testConnectionDialogOpen, setTestConnectionDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newCamera, setNewCamera] = useState<Partial<ExternalCamera>>({
    name: '',
    brand: 'GENERIC',
    model: '',
    ipAddress: '',
    port: 80,
    username: '',
    password: '',
    protocol: 'RTSP',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    capabilities: [],
    settings: {
      brightness: 50,
      contrast: 50,
      saturation: 50,
      sharpness: 50,
      exposure: 50,
      whiteBalance: 'auto',
      nightMode: false
    },
    location: {
      zone: '',
      position: '',
      angle: 0,
      height: 0
    }
  });

  // Mock data generation
  const generateMockCameras = (): ExternalCamera[] => [
    {
      id: 'cam-001',
      name: 'Main Entrance Camera',
      brand: 'CP_PLUS',
      model: 'CP-E31A',
      ipAddress: '192.168.1.100',
      port: 80,
      username: 'admin',
      password: 'encrypted_password',
      protocol: 'RTSP',
      streamUrl: 'rtsp://192.168.1.100:554/stream1',
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      status: 'online',
      lastSeen: new Date().toISOString(),
      capabilities: ['pan', 'tilt', 'zoom', 'nightVision', 'audio', 'motionDetection', 'faceDetection'],
      settings: {
        brightness: 60,
        contrast: 55,
        saturation: 50,
        sharpness: 60,
        exposure: 50,
        whiteBalance: 'auto',
        nightMode: false
      },
      location: {
        zone: 'Entrance',
        position: 'Main Door',
        angle: 45,
        height: 3.5
      },
      faceRecognitionEnabled: true,
      autoAttendanceEnabled: true,
      confidenceThreshold: 0.85,
      totalDetections: 1250,
      accuracy: 0.92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cam-002',
      name: 'Library Hall Camera',
      brand: 'HIKVISION',
      model: 'DS-2CD2143G0-I',
      ipAddress: '192.168.1.101',
      port: 80,
      username: 'admin',
      password: 'encrypted_password',
      protocol: 'RTSP',
      streamUrl: 'rtsp://192.168.1.101:554/stream1',
      resolution: { width: 1920, height: 1080 },
      fps: 25,
      status: 'online',
      lastSeen: new Date().toISOString(),
      capabilities: ['nightVision', 'motionDetection', 'faceDetection'],
      settings: {
        brightness: 55,
        contrast: 60,
        saturation: 45,
        sharpness: 55,
        exposure: 45,
        whiteBalance: 'auto',
        nightMode: true
      },
      location: {
        zone: 'Library Hall',
        position: 'Center',
        angle: 0,
        height: 4.0
      },
      faceRecognitionEnabled: true,
      autoAttendanceEnabled: false,
      confidenceThreshold: 0.80,
      totalDetections: 890,
      accuracy: 0.88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const generateMockEvents = (): CameraEvent[] => [
    {
      id: 'event-001',
      cameraId: 'cam-001',
      type: 'face_detection',
      timestamp: new Date().toISOString(),
      confidence: 0.95,
      coordinates: { x: 100, y: 150, width: 80, height: 100 },
      imageUrl: '/images/events/face-detection-001.jpg',
      acknowledged: false
    },
    {
      id: 'event-002',
      cameraId: 'cam-002',
      type: 'motion',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      confidence: 0.87,
      coordinates: { x: 200, y: 100, width: 120, height: 80 },
      acknowledged: true
    }
  ];

  // Load camera data
  const loadCameraData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCameras(generateMockCameras());
      setCameraEvents(generateMockEvents());
    } catch (error) {
      toast.error('Failed to load camera data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCameraData();
  }, []);

  const handleAddCamera = async () => {
    try {
      const validation = cameraHelpers.validateCameraConfig(newCamera);
      if (!validation.valid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const addedCamera: ExternalCamera = {
        ...newCamera as ExternalCamera,
        id: `cam-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        status: 'connecting'
      };
      
      setCameras([...cameras, addedCamera]);
      setAddCameraDialogOpen(false);
      setNewCamera({
        name: '',
        brand: 'GENERIC',
        model: '',
        ipAddress: '',
        port: 80,
        username: '',
        password: '',
        protocol: 'RTSP',
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        capabilities: [],
        settings: {
          brightness: 50,
          contrast: 50,
          saturation: 50,
          sharpness: 50,
          exposure: 50,
          whiteBalance: 'auto',
          nightMode: false
        },
        location: {
          zone: '',
          position: '',
          angle: 0,
          height: 0
        }
      });
      toast.success('Camera added successfully');
    } catch (error) {
      toast.error('Failed to add camera');
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        message: 'Connection successful',
        capabilities: cameraBrandDetails[newCamera.brand as keyof typeof cameraBrandDetails]?.capabilities || [],
        streamUrl: `rtsp://${newCamera.ipAddress}:${newCamera.port}/stream1`
      };
      
      if (result.success) {
        toast.success('Connection test successful');
        setNewCamera(prev => ({
          ...prev,
          capabilities: result.capabilities,
          streamUrl: result.streamUrl
        }));
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ExternalCamera['status']) => {
    return cameraHelpers.getStatusColor(status);
  };

  const getStatusText = (status: ExternalCamera['status']) => {
    return cameraHelpers.getStatusText(status);
  };

  if (isLoading && cameras.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            <CameraIcon sx={{ mr: 1, fontSize: 'inherit' }} /> External Camera Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage CP Plus, Hikvision, and other IP cameras
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCameraData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddCameraDialogOpen(true)}
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

      {/* Camera Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Cameras
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {cameras.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <CameraIcon />
                </Avatar>
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
                    Online Cameras
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {cameras.filter(c => c.status === 'online').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CheckIcon />
                </Avatar>
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
                    Offline Cameras
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {cameras.filter(c => c.status === 'offline').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <ErrorIcon />
                </Avatar>
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
                    Recent Events
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {cameraEvents.filter(e => !e.acknowledged).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <EventIcon />
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
            <Tab label="Camera List" icon={<CameraIcon />} />
            <Tab label="Live View" icon={<StreamIcon />} />
            <Tab label="Events" icon={<EventIcon />} />
            <Tab label="Analytics" icon={<TrendingIcon />} />
            <Tab label="Settings" icon={<SettingsIcon />} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Camera List Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Connected Cameras
              </Typography>
              <Grid container spacing={3}>
                {cameras.map((camera) => (
                  <Grid item xs={12} md={6} lg={4} key={camera.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {camera.name}
                          </Typography>
                          <Chip
                            label={getStatusText(camera.status)}
                            color={camera.status === 'online' ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {cameraBrandDetails[camera.brand as keyof typeof cameraBrandDetails]?.name} {camera.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {camera.ipAddress}:{camera.port}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cameraHelpers.formatResolution(camera.resolution)} @ {camera.fps}fps
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Capabilities:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {cameraHelpers.getCapabilitiesSummary(camera.capabilities).map((cap: string) => (
                              <Chip key={cap} label={cap} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={<PlayIcon />}
                            variant="outlined"
                            disabled={camera.status !== 'online'}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<SettingsIcon />}
                            variant="outlined"
                            onClick={() => {
                              setSelectedCamera(camera);
                              setEditCameraDialogOpen(true);
                            }}
                          >
                            Settings
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setCameras(cameras.filter(c => c.id !== camera.id));
                              toast.success('Camera removed');
                            }}
                          >
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

          {/* Live View Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Live Camera Feeds
              </Typography>
              <Grid container spacing={3}>
                {cameras.filter(c => c.status === 'online').map((camera) => (
                  <Grid item xs={12} md={6} key={camera.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {camera.name}
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            backgroundColor: theme.palette.grey[200],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            mb: 2
                          }}
                        >
                          <Typography color="text.secondary">
                            Live Stream Placeholder
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" startIcon={<PlayIcon />}>
                            Play
                          </Button>
                          <Button size="small" startIcon={<PTZIcon />}>
                            PTZ Control
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

          {/* Events Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Camera Events
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Camera</TableCell>
                      <TableCell>Event Type</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cameraEvents.map((event) => {
                      const camera = cameras.find(c => c.id === event.cameraId);
                      return (
                        <TableRow key={event.id}>
                          <TableCell>{camera?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip
                              label={event.type.replace('_', ' ').toUpperCase()}
                              color={event.type === 'face_detection' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {Math.round((event.confidence || 0) * 100)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={(event.confidence || 0) * 100}
                                sx={{ ml: 1, width: 50, height: 4 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={event.acknowledged ? 'Acknowledged' : 'Pending'}
                              color={event.acknowledged ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              disabled={event.acknowledged}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Camera Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Events Over Time
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { time: '00:00', events: 5 },
                          { time: '04:00', events: 2 },
                          { time: '08:00', events: 15 },
                          { time: '12:00', events: 25 },
                          { time: '16:00', events: 20 },
                          { time: '20:00', events: 12 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="events" stroke={theme.palette.primary.main} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Event Types
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Face Detection', value: 45, color: theme.palette.primary.main },
                              { name: 'Motion', value: 30, color: theme.palette.secondary.main },
                              { name: 'Line Crossing', value: 15, color: theme.palette.warning.main },
                              { name: 'Audio', value: 10, color: theme.palette.error.main }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {[
                              { name: 'Face Detection', value: 45, color: theme.palette.primary.main },
                              { name: 'Motion', value: 30, color: theme.palette.secondary.main },
                              { name: 'Line Crossing', value: 15, color: theme.palette.warning.main },
                              { name: 'Audio', value: 10, color: theme.palette.error.main }
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

          {/* Settings Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Camera Settings
              </Typography>
              <Grid container spacing={3}>
                {cameras.map((camera) => (
                  <Grid item xs={12} md={6} key={camera.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {camera.name}
                        </Typography>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Image Settings</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Box>
                                <Typography gutterBottom>Brightness</Typography>
                                <Slider
                                  value={camera.settings?.brightness || 50}
                                  onChange={(e, value) => {
                                    setCameras(cameras.map(c => 
                                      c.id === camera.id 
                                        ? { ...c, settings: { ...c.settings, brightness: value as number, contrast: c.settings?.contrast || 50, saturation: c.settings?.saturation || 50, sharpness: c.settings?.sharpness || 50, exposure: c.settings?.exposure || 50, whiteBalance: c.settings?.whiteBalance || 'auto', nightMode: c.settings?.nightMode || false } }
                                        : c
                                    ));
                                  }}
                                  min={0}
                                  max={100}
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                              <Box>
                                <Typography gutterBottom>Contrast</Typography>
                                <Slider
                                  value={camera.settings?.contrast || 50}
                                  onChange={(e, value) => {
                                    setCameras(cameras.map(c => 
                                      c.id === camera.id 
                                        ? { ...c, settings: { ...c.settings, brightness: c.settings?.brightness || 50, contrast: value as number, saturation: c.settings?.saturation || 50, sharpness: c.settings?.sharpness || 50, exposure: c.settings?.exposure || 50, whiteBalance: c.settings?.whiteBalance || 'auto', nightMode: c.settings?.nightMode || false } }
                                        : c
                                    ));
                                  }}
                                  min={0}
                                  max={100}
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={camera.settings?.nightMode || false}
                                    onChange={(e) => {
                                      setCameras(cameras.map(c => 
                                        c.id === camera.id 
                                          ? { ...c, settings: { ...c.settings, brightness: c.settings?.brightness || 50, contrast: c.settings?.contrast || 50, saturation: c.settings?.saturation || 50, sharpness: c.settings?.sharpness || 50, exposure: c.settings?.exposure || 50, whiteBalance: c.settings?.whiteBalance || 'auto', nightMode: e.target.checked } }
                                          : c
                                      ));
                                    }}
                                  />
                                }
                                label="Night Mode"
                              />
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Camera Dialog */}
      <Dialog open={addCameraDialogOpen} onClose={() => setAddCameraDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add External Camera</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>Basic Information</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    label="Camera Name"
                    value={newCamera.name}
                    onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      value={newCamera.brand}
                      onChange={(e) => setNewCamera({ ...newCamera, brand: e.target.value as any })}
                    >
                      {Object.entries(cameraBrands).map(([key, brand]) => (
                        <MenuItem key={key} value={key}>
                          {(brand as any).name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Model"
                    value={newCamera.model}
                    onChange={(e) => setNewCamera({ ...newCamera, model: e.target.value })}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(1)}
                  >
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Network Configuration</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    label="IP Address"
                    value={newCamera.ipAddress}
                    onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Port"
                    type="number"
                    value={newCamera.port}
                    onChange={(e) => setNewCamera({ ...newCamera, port: parseInt(e.target.value) })}
                    fullWidth
                  />
                  <TextField
                    label="Username"
                    value={newCamera.username}
                    onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={newCamera.password}
                    onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Protocol</InputLabel>
                    <Select
                      value={newCamera.protocol}
                      onChange={(e) => setNewCamera({ ...newCamera, protocol: e.target.value as any })}
                    >
                      <MenuItem value="RTSP">RTSP</MenuItem>
                      <MenuItem value="HTTP">HTTP</MenuItem>
                      <MenuItem value="ONVIF">ONVIF</MenuItem>
                      <MenuItem value="RTMP">RTMP</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<NetworkIcon />}
                    onClick={handleTestConnection}
                    disabled={isLoading}
                  >
                    Test Connection
                  </Button>
                </Box>
              </StepContent>
            </Step>

            <Step>
              <StepLabel>Camera Settings</StepLabel>
              <StepContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Resolution</InputLabel>
                    <Select
                      value={`${newCamera.resolution?.width}x${newCamera.resolution?.height}`}
                      onChange={(e) => {
                        const [width, height] = e.target.value.split('x').map(Number);
                        setNewCamera({ ...newCamera, resolution: { width, height } });
                      }}
                    >
                      <MenuItem value="1920x1080">1920x1080 (1080p)</MenuItem>
                      <MenuItem value="1280x720">1280x720 (720p)</MenuItem>
                      <MenuItem value="640x480">640x480 (480p)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="FPS"
                    type="number"
                    value={newCamera.fps}
                    onChange={(e) => setNewCamera({ ...newCamera, fps: parseInt(e.target.value) })}
                    fullWidth
                  />
                  <TextField
                    label="Zone"
                    value={newCamera.location?.zone}
                    onChange={(e) => setNewCamera({ 
                      ...newCamera, 
                      location: { ...newCamera.location!, zone: e.target.value }
                    })}
                    fullWidth
                  />
                  <TextField
                    label="Position"
                    value={newCamera.location?.position}
                    onChange={(e) => setNewCamera({ 
                      ...newCamera, 
                      location: { ...newCamera.location!, position: e.target.value }
                    })}
                    fullWidth
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddCamera}
                    disabled={isLoading}
                  >
                    Add Camera
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCameraDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExternalCameraDashboard;
