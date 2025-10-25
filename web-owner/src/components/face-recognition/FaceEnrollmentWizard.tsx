import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  Typography,
  Card,
  CardContent,
  GridLegacy as Grid,
  TextField,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Face as FaceIcon,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface EnrollmentStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  completed: boolean;
  inProgress: boolean;
}

interface CapturedImage {
  id: string;
  data: string;
  quality: number;
  angle: string;
  timestamp: string;
  approved: boolean;
}

interface EnrollmentData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  capturedImages: CapturedImage[];
  overallQuality: number;
  enrollmentStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const FaceEnrollmentWizard: React.FC<{
  open: boolean;
  onClose: () => void;
  onComplete: (data: EnrollmentData) => void;
}> = ({ open, onClose, onComplete }) => {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    studentId: '',
    studentName: '',
    studentEmail: '',
    capturedImages: [],
    overallQuality: 0,
    enrollmentStatus: 'pending'
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(0);
  const [captureCount, setCaptureCount] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const steps: EnrollmentStep[] = [
    {
      id: 'student-info',
      title: 'Student Information',
      description: 'Enter student details for enrollment',
      icon: <FaceIcon />,
      completed: false,
      inProgress: false
    },
    {
      id: 'camera-setup',
      title: 'Camera Setup',
      description: 'Configure camera and lighting',
      icon: <CameraIcon />,
      completed: false,
      inProgress: false
    },
    {
      id: 'face-capture',
      title: 'Face Capture',
      description: 'Capture multiple angles of face',
      icon: <PhotoIcon />,
      completed: false,
      inProgress: false
    },
    {
      id: 'quality-check',
      title: 'Quality Verification',
      description: 'Review and approve captured images',
      icon: <QualityIcon />,
      completed: false,
      inProgress: false
    },
    {
      id: 'feature-extraction',
      title: 'Feature Extraction',
      description: 'Process and store biometric data',
      icon: <AutoIcon />,
      completed: false,
      inProgress: false
    },
    {
      id: 'completion',
      title: 'Enrollment Complete',
      description: 'Finalize enrollment process',
      icon: <CheckIcon />,
      completed: false,
      inProgress: false
    }
  ];

  // Camera setup and management
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
        setIsCameraActive(true);
        toast.success('Camera activated successfully');
      }
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Face capture functionality
  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Simulate quality analysis
      const quality = Math.random() * 40 + 60; // 60-100%
      const angle = getCurrentAngle();
      
      const newImage: CapturedImage = {
        id: `img-${Date.now()}`,
        data: imageData,
        quality,
        angle,
        timestamp: new Date().toISOString(),
        approved: quality > 80
      };

      setEnrollmentData(prev => ({
        ...prev,
        capturedImages: [...prev.capturedImages, newImage]
      }));

      setCaptureCount(prev => prev + 1);
      setCurrentQuality(quality);
      
      toast.success(`Face captured! Quality: ${quality.toFixed(1)}%`);
      
    } catch (error) {
      toast.error('Failed to capture image');
    } finally {
      setIsCapturing(false);
    }
  };

  const getCurrentAngle = (): string => {
    const angles = ['Front', 'Left', 'Right', 'Up', 'Down'];
    return angles[Math.floor(Math.random() * angles.length)];
  };

  const removeImage = (imageId: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      capturedImages: prev.capturedImages.filter(img => img.id !== imageId)
    }));
    setCaptureCount(prev => prev - 1);
  };

  const approveImage = (imageId: string, approved: boolean) => {
    setEnrollmentData(prev => ({
      ...prev,
      capturedImages: prev.capturedImages.map(img => 
        img.id === imageId ? { ...img, approved } : img
      )
    }));
  };

  // Step handlers
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Simulate feature extraction
      setEnrollmentData(prev => ({ ...prev, enrollmentStatus: 'in_progress' }));
      
      // Calculate overall quality
      const approvedImages = enrollmentData.capturedImages.filter(img => img.approved);
      const overallQuality = approvedImages.length > 0 
        ? approvedImages.reduce((sum, img) => sum + img.quality, 0) / approvedImages.length
        : 0;

      const finalData = {
        ...enrollmentData,
        overallQuality,
        enrollmentStatus: 'completed' as const
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onComplete(finalData);
      toast.success('Face enrollment completed successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to complete enrollment');
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return enrollmentData.studentId && enrollmentData.studentName;
      case 1:
        return isCameraActive;
      case 2:
        return enrollmentData.capturedImages.length >= 3;
      case 3:
        return enrollmentData.capturedImages.filter(img => img.approved).length >= 3;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Student Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student ID"
                  value={enrollmentData.studentId}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, studentId: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={enrollmentData.studentName}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Email"
                  type="email"
                  value={enrollmentData.studentEmail}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, studentEmail: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Camera Setup
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Camera Setup Instructions:</strong>
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><LightbulbIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Ensure good lighting on your face" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LightbulbIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Position yourself 2-3 feet from the camera" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LightbulbIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Remove glasses and masks for better accuracy" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LightbulbIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Look directly at the camera" />
                </ListItem>
              </List>
            </Alert>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {!isCameraActive ? (
                <Button
                  variant="contained"
                  startIcon={<CameraIcon />}
                  onClick={startCamera}
                  size="large"
                >
                  Activate Camera
                </Button>
              ) : (
                <Box>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      height: 'auto',
                      borderRadius: 8,
                      border: '2px solid',
                      borderColor: theme.palette.success.main
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<CheckIcon />}
                      label="Camera Active"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Face Capture
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Capture at least 3 high-quality images from different angles for best results.
            </Alert>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {isCameraActive && (
                <Box>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      height: 'auto',
                      borderRadius: 8
                    }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={isCapturing ? <CircularProgress size={20} /> : <PhotoIcon />}
                      onClick={captureFace}
                      disabled={isCapturing}
                      color="primary"
                    >
                      {isCapturing ? 'Capturing...' : 'Capture Face'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={startCamera}
                    >
                      Refresh Camera
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Captured Images ({enrollmentData.capturedImages.length}/5)
              </Typography>
              <Grid container spacing={2}>
                {enrollmentData.capturedImages.map((image) => (
                  <Grid item xs={12} sm={6} md={4} key={image.id}>
                    <Card>
                      <CardContent sx={{ p: 1 }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.data}
                            alt="Captured face"
                            style={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 4
                            }}
                          />
                          <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                            <Chip
                              label={`${image.quality.toFixed(0)}%`}
                              color={image.quality > 80 ? 'success' : image.quality > 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {image.angle}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeImage(image.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quality Verification
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review each captured image and approve those with good quality (80%+).
            </Alert>

            <Grid container spacing={2}>
              {enrollmentData.capturedImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <img
                          src={image.data}
                          alt="Captured face"
                          style={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <Chip
                            label={`${image.quality.toFixed(0)}%`}
                            color={image.quality > 80 ? 'success' : image.quality > 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {image.angle} • {new Date(image.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title={image.approved ? 'Approved' : 'Approve'}>
                            <IconButton
                              size="small"
                              color={image.approved ? 'success' : 'default'}
                              onClick={() => approveImage(image.id, !image.approved)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeImage(image.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quality Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CheckIcon />}
                  label={`${enrollmentData.capturedImages.filter(img => img.approved).length} Approved`}
                  color="success"
                />
                <Chip
                  label={`${enrollmentData.capturedImages.length} Total`}
                  color="info"
                />
                <Chip
                  label={`${enrollmentData.capturedImages.length >= 3 ? 'Ready' : 'Need More'}`}
                  color={enrollmentData.capturedImages.length >= 3 ? 'success' : 'warning'}
                />
              </Box>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Feature Extraction
            </Typography>
            <Box sx={{ mb: 3 }}>
              <CircularProgress size={60} />
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Processing facial features and creating biometric template...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments. Please wait.
            </Typography>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Processing Steps
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Analyzing face geometry" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CircularProgress size={16} /></ListItemIcon>
                  <ListItemText primary="Extracting facial features" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CircularProgress size={16} /></ListItemIcon>
                  <ListItemText primary="Creating biometric template" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CircularProgress size={16} /></ListItemIcon>
                  <ListItemText primary="Encrypting and storing data" />
                </ListItem>
              </List>
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Enrollment Complete!
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'success.main', mx: 'auto' }}>
                <CheckIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            
            <Typography variant="h5" color="success.main" gutterBottom>
              {enrollmentData.studentName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Student ID: {enrollmentData.studentId}
            </Typography>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Enrollment Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={<QualityIcon />}
                  label={`${enrollmentData.overallQuality.toFixed(1)}% Quality`}
                  color="success"
                />
                <Chip
                  icon={<PhotoIcon />}
                  label={`${enrollmentData.capturedImages.length} Images`}
                  color="info"
                />
                <Chip
                  icon={<SecurityIcon />}
                  label="Encrypted & Secure"
                  color="success"
                />
              </Box>
            </Box>
            
            <Alert severity="success" sx={{ mt: 3 }}>
              Face enrollment completed successfully! The student can now use face recognition for attendance.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Face Enrollment Wizard
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                icon={
                  <Badge
                    badgeContent={index + 1}
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
                  >
                    {step.icon}
                  </Badge>
                }
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {renderStepContent(index)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={!canProceed()}
            startIcon={<CheckIcon />}
          >
            Complete Enrollment
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FaceEnrollmentWizard;
