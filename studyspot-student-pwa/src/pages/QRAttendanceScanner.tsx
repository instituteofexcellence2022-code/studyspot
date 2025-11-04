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
import StudyFocusedLayout from '../components/StudyFocusedLayout';
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

export default function QRAttendanceScanner({ darkMode, setDarkMode }: any) {
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

    return () => clearInterval(interval);
  }, [user?.id]);

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

  const startScanning = () => {
    setScanning(true);
    setCameraError(false);

    try {
      const qrScanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
        },
        false
      );

      qrScanner.render(onScanSuccess, (errorMessage) => {
        // Camera permission or access errors
        if (errorMessage.includes('NotAllowedError') || errorMessage.includes('NotFoundError')) {
          setCameraError(true);
          toast.error('📷 Camera access denied or not available. Please use manual entry or upload option.');
        }
      });
      
      setScanner(qrScanner);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setCameraError(true);
      toast.error('Failed to start camera. Please use manual entry option.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log('📱 QR Code scanned:', decodedText);

    // Stop scanner
    stopScanning();

    // Process QR code
    try {
      const qrData = JSON.parse(decodedText);
      
      if (qrData.action === 'check_in') {
        await handleCheckIn(qrData);
      } else if (qrData.action === 'check_out') {
        await handleCheckOut(qrData);
      } else {
        toast.error('Invalid QR code action');
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast.error('Invalid QR code format');
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
    <StudyFocusedLayout darkMode={darkMode} setDarkMode={setDarkMode}>
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

              {/* Alternative Methods for Laptop Users */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="600">
                  💻 Using a Laptop?
                </Typography>
                <Typography variant="caption">
                  Camera might not work well. Use the options below instead:
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

              {/* QR Scanner Container */}
              <Box
                id="qr-reader"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  '& video': {
                    borderRadius: 2,
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
    </StudyFocusedLayout>
  );
}

