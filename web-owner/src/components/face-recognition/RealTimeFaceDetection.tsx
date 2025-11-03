import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Alert,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  GridLegacy as Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  CameraAlt as CameraIcon,
  Face as FaceIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface DetectionResult {
  id: string;
  studentId?: string;
  studentName?: string;
  confidence: number;
  timestamp: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: Array<{ x: number; y: number }>;
  attributes: {
    age: number;
    gender: string;
    emotion: string;
    glasses: boolean;
    mask: boolean;
  };
  livenessScore: number;
  spoofDetected: boolean;
  status: 'recognized' | 'unknown' | 'spoof' | 'low_confidence';
}

interface DetectionSettings {
  confidenceThreshold: number;
  livenessThreshold: number;
  enableSpoofDetection: boolean;
  enableMaskDetection: boolean;
  enableEmotionDetection: boolean;
  enableAgeGenderDetection: boolean;
  maxDetections: number;
  detectionInterval: number;
  enableSound: boolean;
  enableNotifications: boolean;
}

const RealTimeFaceDetection: React.FC = () => {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [settings, setSettings] = useState<DetectionSettings>({
    confidenceThreshold: 85,
    livenessThreshold: 80,
    enableSpoofDetection: true,
    enableMaskDetection: true,
    enableEmotionDetection: true,
    enableAgeGenderDetection: true,
    maxDetections: 10,
    detectionInterval: 1000,
    enableSound: true,
    enableNotifications: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    successfulRecognitions: 0,
    unknownFaces: 0,
    spoofAttempts: 0,
    averageConfidence: 0,
    detectionRate: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock face detection data
  const mockStudents = [
    { id: 'STU001', name: 'John Doe', email: 'john.doe@email.com' },
    { id: 'STU002', name: 'Jane Smith', email: 'jane.smith@email.com' },
    { id: 'STU003', name: 'Mike Johnson', email: 'mike.johnson@email.com' },
    { id: 'STU004', name: 'Sarah Wilson', email: 'sarah.wilson@email.com' },
  ];

  // Start camera stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsActive(true);
        toast.success('Real-time detection started');
      }
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('Camera error:', error);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
      setDetections([]);
      setCurrentDetection(null);
      toast.info('Real-time detection stopped');
    }
  };

  // Simulate face detection
  const simulateDetection = useCallback(() => {
    if (!isActive || isProcessing) return;

    setIsProcessing(true);
    
    // Simulate detection delay
    setTimeout(() => {
      const isRecognized = Math.random() > 0.3; // 70% recognition rate
      const isSpoof = Math.random() < 0.05; // 5% spoof rate
      const confidence = isRecognized ? 85 + Math.random() * 15 : 30 + Math.random() * 50;
      const livenessScore = 80 + Math.random() * 20;
      
      const student = isRecognized ? mockStudents[Math.floor(Math.random() * mockStudents.length)] : null;
      
      const detection: DetectionResult = {
        id: `det-${Date.now()}`,
        studentId: student?.id,
        studentName: student?.name,
        confidence,
        timestamp: new Date().toISOString(),
        boundingBox: {
          x: Math.random() * 200 + 50,
          y: Math.random() * 150 + 50,
          width: 100 + Math.random() * 50,
          height: 120 + Math.random() * 60
        },
        landmarks: Array.from({ length: 68 }, () => ({
          x: Math.random() * 400,
          y: Math.random() * 300
        })),
        attributes: {
          age: 18 + Math.floor(Math.random() * 10),
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          emotion: ['Happy', 'Neutral', 'Sad', 'Surprised'][Math.floor(Math.random() * 4)],
          glasses: Math.random() > 0.7,
          mask: Math.random() > 0.8
        },
        livenessScore,
        spoofDetected: isSpoof,
        status: isSpoof ? 'spoof' : 
                confidence < settings.confidenceThreshold ? 'low_confidence' :
                isRecognized ? 'recognized' : 'unknown'
      };

      setCurrentDetection(detection);
      setDetections(prev => [detection, ...prev.slice(0, settings.maxDetections - 1)]);
      
      // Update stats
      setDetectionStats(prev => ({
        totalDetections: prev.totalDetections + 1,
        successfulRecognitions: prev.successfulRecognitions + (isRecognized ? 1 : 0),
        unknownFaces: prev.unknownFaces + (!isRecognized ? 1 : 0),
        spoofAttempts: prev.spoofAttempts + (isSpoof ? 1 : 0),
        averageConfidence: (prev.averageConfidence * prev.totalDetections + confidence) / (prev.totalDetections + 1),
        detectionRate: ((prev.successfulRecognitions + (isRecognized ? 1 : 0)) / (prev.totalDetections + 1)) * 100
      }));

      // Handle notifications
      if (settings.enableNotifications) {
        if (isSpoof) {
          toast.error('🚨 Spoof attempt detected!');
        } else if (isRecognized) {
          toast.success(`✅ ${student?.name} recognized`);
        } else {
          toast.warning('❓ Unknown face detected');
        }
      }

      setIsProcessing(false);
    }, 500);
  }, [isActive, isProcessing, settings.confidenceThreshold, settings.maxDetections, settings.enableNotifications]);

  // Detection loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(simulateDetection, settings.detectionInterval);
    return () => clearInterval(interval);
  }, [isActive, simulateDetection, settings.detectionInterval]);

  // Draw detection overlay
  const drawDetectionOverlay = () => {
    if (!detectionCanvasRef.current || !currentDetection) return;

    const canvas = detectionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding box
    const { x, y, width, height } = currentDetection.boundingBox;
    ctx.strokeStyle = getDetectionColor(currentDetection.status);
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Draw confidence text
    ctx.fillStyle = getDetectionColor(currentDetection.status);
    ctx.font = '16px Arial';
    ctx.fillText(
      `${currentDetection.studentName || 'Unknown'} (${currentDetection.confidence.toFixed(1)}%)`,
      x, y - 10
    );

    // Draw landmarks
    ctx.fillStyle = '#00ff00';
    currentDetection.landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark.x, landmark.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const getDetectionColor = (status: string) => {
    switch (status) {
      case 'recognized': return '#4caf50';
      case 'unknown': return '#ff9800';
      case 'spoof': return '#f44336';
      case 'low_confidence': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  // Update overlay when detection changes
  useEffect(() => {
    drawDetectionOverlay();
  }, [currentDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recognized': return <CheckIcon color="success" />;
      case 'unknown': return <WarningIcon color="warning" />;
      case 'spoof': return <ErrorIcon color="error" />;
      case 'low_confidence': return <WarningIcon color="warning" />;
      default: return <FaceIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recognized': return 'success';
      case 'unknown': return 'warning';
      case 'spoof': return 'error';
      case 'low_confidence': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Real-time Face Detection
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettings(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant={isActive ? 'contained' : 'outlined'}
            color={isActive ? 'error' : 'primary'}
            startIcon={isActive ? <StopIcon /> : <PlayIcon />}
            onClick={isActive ? stopCamera : startCamera}
          >
            {isActive ? 'Stop Detection' : 'Start Detection'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Video Feed */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                {isActive ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        maxWidth: isFullscreen ? '100vw' : 800,
                        height: 'auto',
                        borderRadius: 8,
                        border: '2px solid',
                        borderColor: theme.palette.primary.main
                      }}
                    />
                    <canvas
                      ref={detectionCanvasRef}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                      }}
                    />
                    {isProcessing && (
                      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: 400, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CameraIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Camera Inactive
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Start Detection" to begin real-time face recognition
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Detection Stats */}
              {isActive && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip
                    icon={<FaceIcon />}
                    label={`${detectionStats.totalDetections} Detections`}
                    color="primary"
                  />
                  <Chip
                    icon={<CheckIcon />}
                    label={`${detectionStats.successfulRecognitions} Recognized`}
                    color="success"
                  />
                  <Chip
                    icon={<WarningIcon />}
                    label={`${detectionStats.unknownFaces} Unknown`}
                    color="warning"
                  />
                  <Chip
                    icon={<SecurityIcon />}
                    label={`${detectionStats.spoofAttempts} Spoofs`}
                    color="error"
                  />
                  <Chip
                    icon={<TrendingIcon />}
                    label={`${detectionStats.detectionRate.toFixed(1)}% Success Rate`}
                    color="info"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Detection Results */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Detections
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {detections.map((detection) => (
                  <ListItem key={detection.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {getStatusIcon(detection.status)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={detection.studentName || 'Unknown Face'}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(detection.timestamp).toLocaleTimeString()}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Confidence: {detection.confidence.toFixed(1)}%
                          </Typography>
                          {detection.attributes.mask && (
                            <Chip label="Mask" size="small" color="warning" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={detection.status}
                        color={getStatusColor(detection.status) as any}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {detections.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No detections yet"
                      secondary="Start detection to see results here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detection Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Confidence Threshold
                </Typography>
                <Slider
                  value={settings.confidenceThreshold}
                  onChange={(e, value) => setSettings(prev => ({ ...prev, confidenceThreshold: value as number }))}
                  min={50}
                  max={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Liveness Threshold
                </Typography>
                <Slider
                  value={settings.livenessThreshold}
                  onChange={(e, value) => setSettings(prev => ({ ...prev, livenessThreshold: value as number }))}
                  min={50}
                  max={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Detection Interval (ms)
                </Typography>
                <Slider
                  value={settings.detectionInterval}
                  onChange={(e, value) => setSettings(prev => ({ ...prev, detectionInterval: value as number }))}
                  min={500}
                  max={5000}
                  step={500}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}ms`}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableSpoofDetection}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableSpoofDetection: e.target.checked }))}
                    />
                  }
                  label="Enable Spoof Detection"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableMaskDetection}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableMaskDetection: e.target.checked }))}
                    />
                  }
                  label="Enable Mask Detection"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RealTimeFaceDetection;
