/**
 * 📱 QR ATTENDANCE SCANNER
 * 
 * Student-side QR code scanner for check-in/check-out:
 * - Scan library QR codes
 * - Automatic attendance marking
 * - Real-time status updates
 * - Attendance history
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  QrCodeScanner as ScanIcon,
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  History as HistoryIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CameraAlt as CameraIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import MobileLayout from '../components/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

interface AttendanceRecord {
  id: string;
  library_name: string;
  check_in_time: string;
  check_out_time?: string;
  duration?: string;
  status: 'checked-in' | 'checked-out';
}

interface ActiveSession {
  library_name: string;
  check_in_time: string;
  duration?: string;
}

interface QRAttendanceScannerProps {
  setIsAuthenticated?: (value: boolean) => void;
}

export default function QRAttendanceScanner({ setIsAuthenticated }: QRAttendanceScannerProps) {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDuration, setCurrentDuration] = useState('0h 0m');
  const [manualQRDialog, setManualQRDialog] = useState(false);
  const [manualQRText, setManualQRText] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    fetchAttendanceStatus();
    fetchAttendanceHistory();

    // Update current duration every minute
    const interval = setInterval(() => {
      if (activeSession) {
        updateCurrentDuration();
      }
    }, 60000); // Every minute

    // Cleanup: Stop scanner when component unmounts
    return () => {
      clearInterval(interval);
      // Scanner cleanup will be handled by stopScanning function
    };
  }, [user?.id]);

  // Separate effect for scanner cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        try {
          scanner.clear().catch(() => {});
        } catch (error) {
          console.warn('Error cleaning up scanner on unmount:', error);
        }
      }
    };
  }, [scanner]);

  useEffect(() => {
    if (activeSession) {
      updateCurrentDuration();
    }
  }, [activeSession]);

  const updateCurrentDuration = () => {
    if (!activeSession) return;

    const checkInTime = new Date(activeSession.check_in_time);
    const now = new Date();
    const durationMs = now.getTime() - checkInTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    setCurrentDuration(`${hours}h ${minutes}m`);
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await api.get(`/api/attendance/status/${user?.id || 'student-001'}`);
      if (response.data?.isCheckedIn) {
        setActiveSession(response.data.data);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await api.get(`/api/attendance/history/${user?.id || 'student-001'}?limit=10`);
      setAttendanceHistory(response.data?.data || getMockHistory());
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory(getMockHistory());
    }
  };

  const getMockHistory = (): AttendanceRecord[] => [
    {
      id: '1',
      library_name: 'Central Study Hub',
      check_in_time: new Date(Date.now() - 3600000 * 8).toISOString(),
      check_out_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      duration: '6h 0m',
      status: 'checked-out',
    },
  ];

  const startScanning = async () => {
    setScanning(true);
    setCameraError(false);

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Request camera permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" } // Prefer rear camera
          } 
        });
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop());
      } catch (permError: any) {
        if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
          setCameraError(true);
          toast.error('📷 Camera permission denied. Please allow camera access in your browser settings.');
          setScanning(false);
          return;
        } else if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
          setCameraError(true);
          toast.error('📷 No camera found. Please use manual entry or upload option.');
          setScanning(false);
          return;
        }
        throw permError;
      }

      // Mobile-optimized configuration
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const qrBoxSize = isMobile ? Math.min(window.innerWidth * 0.8, 350) : 300;
      
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10, // Smooth scanning rate
          qrbox: { width: qrBoxSize, height: qrBoxSize }, // Square scanning area
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          // Mobile-specific settings
          videoConstraints: isMobile ? {
            facingMode: { ideal: "environment" }, // Prefer rear camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } : {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          // Better mobile support
          supportedScanTypes: [0], // QR_CODE only for faster scanning
          showTorchButtonIfSupported: true, // Show flashlight on mobile
          showZoomSliderIfSupported: true, // Show zoom on mobile
          // Improved scanning performance
          disableFlip: false, // Allow flipping for better detection
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // Use native barcode detector if available
          },
        },
        false // verbose mode off for better performance
      );

      qrScanner.render(
        onScanSuccess, 
        (errorMessage) => {
          // Only show errors for actual failures, not scan attempts
          if (errorMessage.includes('NotAllowedError') || 
              errorMessage.includes('PermissionDeniedError') ||
              errorMessage.includes('NotFoundError') ||
              errorMessage.includes('DevicesNotFoundError')) {
            setCameraError(true);
            toast.error('📷 Camera access issue. Please use manual entry or upload option.');
            stopScanning();
          }
          // Other errors are just scan attempts failing, ignore them
        }
      );
      
      setScanner(qrScanner);
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setCameraError(true);
      
      let errorMsg = 'Failed to start camera. ';
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'No camera found. Please use manual entry option.';
      } else if (error.message?.includes('not supported')) {
        errorMsg = 'Camera not supported in this browser.';
      }
      
      toast.error(errorMsg);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      try {
        scanner.clear().catch((error) => {
          console.warn('Error clearing scanner:', error);
        });
        setScanner(null);
      } catch (error) {
        console.error('Error stopping scanner:', error);
        // Force cleanup
        const qrReaderElement = document.getElementById('qr-reader');
        if (qrReaderElement) {
          qrReaderElement.innerHTML = '';
        }
        setScanner(null);
      }
    }
    setScanning(false);
    setCameraError(false);
  };

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log('📱 QR Code scanned:', decodedText);

    // Stop scanner immediately to prevent multiple scans
    stopScanning();

    // Show processing feedback
    toast.info('Processing QR code...', { autoClose: 1000 });

    // Process QR code
    try {
      // Try to parse as JSON first
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (parseError) {
        // If not JSON, try to extract data from URL or plain text
        if (decodedText.includes('action') || decodedText.includes('libraryId')) {
          // Try to extract from URL parameters or query string
          const urlParams = new URLSearchParams(decodedText);
          qrData = {
            action: urlParams.get('action') || decodedText.match(/action[=:](check_in|check_out)/)?.[1],
            libraryId: urlParams.get('libraryId') || decodedText.match(/libraryId[=:]([^&\s]+)/)?.[1],
            libraryName: urlParams.get('libraryName') || decodedText.match(/libraryName[=:]([^&\s]+)/)?.[1],
          };
        } else {
          throw new Error('Invalid QR code format');
        }
      }
      
      if (qrData.action === 'check_in' || decodedText.toLowerCase().includes('check_in')) {
        await handleCheckIn(qrData);
      } else if (qrData.action === 'check_out' || decodedText.toLowerCase().includes('check_out')) {
        await handleCheckOut(qrData);
      } else {
        toast.error('Invalid QR code: Missing action (check_in or check_out)');
      }
    } catch (error: any) {
      console.error('Error parsing QR code:', error);
      toast.error(error.message || 'Invalid QR code format. Please scan a valid library QR code.');
    }
  };

  const onScanError = (error: any) => {
    // Silently handle scan errors (happens continuously during scanning)
    console.debug('QR scan error:', error);
  };

  const handleCheckIn = async (qrData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/api/attendance/check-in', {
        userId: user?.id || 'student-001',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
        libraryId: qrData.libraryId,
        libraryName: qrData.libraryName,
        qrData: JSON.stringify(qrData),
        location: 'Mobile QR Scanner',
      });

      toast.success(`✅ ${response.data?.message || 'Checked in successfully!'}`, {
        autoClose: 3000,
      });

      // Refresh status
      fetchAttendanceStatus();
    } catch (error: any) {
      console.error('Error during check-in:', error);
      
      if (error.response?.status === 400 && error.response?.data?.error === 'Already checked in') {
        toast.warning('⚠️ You are already checked in! Please check-out first.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (qrData: any) => {
    setLoading(true);
    try {
      const response = await api.post('/api/attendance/check-out', {
        userId: user?.id || 'student-001',
        libraryId: qrData.libraryId,
        qrData: JSON.stringify(qrData),
        location: 'Mobile QR Scanner',
      });

      toast.success(`✅ ${response.data?.message || 'Checked out successfully!'}`, {
        autoClose: 3000,
      });

      // Refresh status and history
      fetchAttendanceStatus();
      fetchAttendanceHistory();
    } catch (error: any) {
      console.error('Error during check-out:', error);
      
      if (error.response?.status === 400 && error.response?.data?.error === 'No active session') {
        toast.warning('⚠️ You need to check-in first!');
      } else {
        toast.error(error.response?.data?.message || 'Failed to check-out');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualQRSubmit = () => {
    if (!manualQRText.trim()) {
      toast.error('Please enter QR code text');
      return;
    }

    onScanSuccess(manualQRText);
    setManualQRDialog(false);
    setManualQRText('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('temp-qr-reader');
      
      const decodedText = await html5QrCode.scanFile(file, false);
      console.log('📸 QR Code decoded from image:', decodedText);
      
      onScanSuccess(decodedText);
      setUploadDialogOpen(false);
      toast.success('QR code detected from image!');
    } catch (error) {
      console.error('Error reading QR from file:', error);
      toast.error('Could not detect QR code in image. Please try again or use manual entry.');
    }
  };

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <ScanIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📱 QR Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scan library QR codes for instant check-in/check-out
          </Typography>
        </Box>

        {/* Active Session Card */}
        {activeSession && (
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  ✅ Currently Checked In
                </Typography>
                <Chip
                  label="ACTIVE"
                  size="small"
                  sx={{ bgcolor: 'white', color: 'success.main', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 1 }}>
                📚 {activeSession.library_name}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Check-in Time
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(activeSession.check_in_time).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Study Duration
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    ⏱️ {currentDuration}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                <Typography variant="body2">
                  Scan the <strong>RED</strong> QR code to check-out
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Scan Options */}
        {!scanning ? (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ py: 4 }}>
              {/* Camera Scan Button */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraIcon />}
                  onClick={startScanning}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {activeSession ? 'Scan to Check-Out' : 'Scan to Check-In'}
                </Button>

                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                  {activeSession
                    ? '📍 Scan the RED QR code at library exit'
                    : '📍 Scan the GREEN QR code at library entrance'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }}>
                <Chip label="OR" size="small" />
              </Divider>

              {/* Alternative Methods */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="600">
                  📱 Having Camera Issues?
                </Typography>
                <Typography variant="caption">
                  If camera doesn't work or you're on a laptop, use the options below:
                </Typography>
              </Alert>

              <Stack spacing={2}>
                {/* Upload QR Image */}
                <Button
                  variant="outlined"
                  fullWidth
                  component="label"
                  startIcon={<CameraIcon />}
                >
                  📸 Upload QR Code Screenshot
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>

                {/* Manual Entry */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setManualQRDialog(true)}
                  startIcon={<ScanIcon />}
                >
                  ⌨️ Enter QR Code Manually
                </Button>
              </Stack>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                💡 Tip: Take a photo of the QR code and upload it, or ask library staff for the code text
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  📷 Scanning...
                </Typography>
                <IconButton onClick={stopScanning} color="error">
                  <CloseIcon />
                </IconButton>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Point your camera at the {activeSession ? <strong>RED</strong> : <strong>GREEN</strong>} QR code
                </Typography>
              </Alert>

              {/* Mobile Camera Tips */}
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight="600" display="block">
                  📱 Mobile Tips:
                </Typography>
                <Typography variant="caption" display="block">
                  • Allow camera permission when prompted
                </Typography>
                <Typography variant="caption" display="block">
                  • Use the rear camera for better scanning
                </Typography>
                <Typography variant="caption" display="block">
                  • Hold phone steady 6-12 inches from QR code
                </Typography>
                <Typography variant="caption" display="block">
                  • Ensure good lighting on the QR code
                </Typography>
              </Alert>

              {/* QR Scanner Container */}
              <Box
                id="qr-reader"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  minHeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'black',
                  '& video': {
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto',
                  },
                  '& #qr-shaded-region': {
                    borderColor: 'primary.main !important',
                    borderWidth: '3px !important',
                  },
                }}
              />

              {loading && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Processing attendance...
                  </Typography>
                </Box>
              )}

              {cameraError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="600">
                    📷 Camera Not Available
                  </Typography>
                  <Typography variant="caption">
                    Your camera couldn't be accessed. Please use the "Upload Screenshot" or "Manual Entry" options below.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={stopScanning} variant="outlined">
                      Close Scanner
                    </Button>
                    <Button size="small" onClick={() => setManualQRDialog(true)} variant="contained">
                      Manual Entry
                    </Button>
                  </Stack>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hidden element for file scanning */}
        <div id="temp-qr-reader" style={{ display: 'none' }}></div>

        {/* Attendance History */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                Recent Attendance
              </Typography>
              <IconButton onClick={fetchAttendanceHistory} size="small">
                <RefreshIcon />
              </IconButton>
            </Box>

            {attendanceHistory.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  No attendance records yet. Scan a QR code to get started!
                </Typography>
              </Alert>
            ) : (
              <List>
                {attendanceHistory.map((record, index) => (
                  <ListItem
                    key={record.id || index}
                    sx={{
                      bgcolor: 'action.hover',
                      mb: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: record.status === 'checked-in' ? 'success.main' : 'divider',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: record.status === 'checked-in' ? 'success.main' : 'grey.400',
                        }}
                      >
                        {record.status === 'checked-in' ? <CheckInIcon /> : <CheckOutIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={record.library_name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Check-in: {new Date(record.check_in_time).toLocaleString()}
                          </Typography>
                          {record.check_out_time && (
                            <Typography variant="caption" display="block">
                              Check-out: {new Date(record.check_out_time).toLocaleString()}
                            </Typography>
                          )}
                          {record.duration && (
                            <Chip
                              label={`⏱️ ${record.duration}`}
                              size="small"
                              sx={{ mt: 0.5, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={record.status === 'checked-in' ? 'Active' : 'Completed'}
                      size="small"
                      color={record.status === 'checked-in' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card sx={{ mt: 3, bgcolor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📖 How to Use
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="1" size="small" color="primary" />
                <Typography variant="body2">
                  Click "Scan" button when you arrive at the library
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="2" size="small" color="success" />
                <Typography variant="body2">
                  Point your camera at the <strong>GREEN</strong> QR code
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="3" size="small" color="info" />
                <Typography variant="body2">
                  Your attendance is automatically marked!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="4" size="small" color="error" />
                <Typography variant="body2">
                  When leaving, scan the <strong>RED</strong> QR code to check-out
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Manual QR Entry Dialog */}
        <Dialog open={manualQRDialog} onClose={() => setManualQRDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Enter QR Code Manually</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              If your camera isn't working, you can paste the QR code text here
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Paste QR code JSON data here..."
              value={manualQRText}
              onChange={(e) => setManualQRText(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManualQRDialog(false)}>Cancel</Button>
            <Button onClick={handleManualQRSubmit} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MobileLayout>
  );
}

