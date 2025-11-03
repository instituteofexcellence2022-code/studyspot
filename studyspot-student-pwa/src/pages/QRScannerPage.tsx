import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  QrCodeScanner,
  CheckCircle,
  AccessTime,
  LocationOn,
  Close,
  Refresh,
  CameraAlt,
} from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Layout from '../components/Layout';
import api from '../services/api';

interface QRScannerPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function QRScannerPage({ setIsAuthenticated }: QRScannerPageProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    checkActiveSession();
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const checkActiveSession = async () => {
    try {
      const response = await api.get('/attendance/active-session');
      if (response.data.session) {
        setCurrentSession(response.data.session);
      }
    } catch (error) {
      console.log('No active session');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setError('');

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    
    setScanning(false);
    
    // Process QR code
    try {
      // Expected format: STUDYSPOT-LIBRARY-{libraryId}-{checkInCode}
      if (decodedText.startsWith('STUDYSPOT-LIBRARY-')) {
        const parts = decodedText.split('-');
        const libraryId = parts[2];
        
        if (currentSession) {
          // Check-out
          await handleCheckOut(libraryId);
        } else {
          // Check-in
          await handleCheckIn(libraryId);
        }
      } else {
        setError('Invalid QR code. Please scan a valid library QR code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process QR code');
    }
  };

  const onScanError = (error: any) => {
    // Ignore continuous scan errors
  };

  const handleCheckIn = async (libraryId: string) => {
    try {
      const response = await api.post('/attendance/check-in', {
        libraryId,
        checkInMethod: 'qr_code',
      });

      setCurrentSession(response.data.session);
      setScanResult({
        type: 'check-in',
        library: response.data.session.libraryName,
        time: new Date().toLocaleTimeString(),
      });
      setSuccessDialog(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (libraryId: string) => {
    try {
      const response = await api.post('/attendance/check-out', {
        sessionId: currentSession.id,
        checkOutMethod: 'qr_code',
      });

      const duration = response.data.duration;
      setScanResult({
        type: 'check-out',
        library: currentSession.libraryName,
        time: new Date().toLocaleTimeString(),
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      });
      setCurrentSession(null);
      setSuccessDialog(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Check-out failed');
    }
  };

  const manualCheckOut = async () => {
    if (!currentSession) return;
    
    try {
      const response = await api.post('/attendance/check-out', {
        sessionId: currentSession.id,
        checkOutMethod: 'manual',
      });

      const duration = response.data.duration;
      setScanResult({
        type: 'check-out',
        library: currentSession.libraryName,
        time: new Date().toLocaleTimeString(),
        duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      });
      setCurrentSession(null);
      setSuccessDialog(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
          QR Code Scanner 📱
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Current Session Card */}
        {currentSession && (
          <Card sx={{ mb: 3, bgcolor: '#e3f2fd', borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Chip label="Active Session" color="success" size="small" sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {currentSession.libraryName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Checked in at: {new Date(currentSession.checkInTime).toLocaleTimeString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Seat: {currentSession.seatNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  onClick={manualCheckOut}
                  size="small"
                >
                  Check Out
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            {currentSession ? 'Scan to Check Out' : 'Scan to Check In'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentSession 
              ? 'Scan the library QR code to check out and end your session'
              : 'Scan the library QR code at the entrance to check in'}
          </Typography>
        </Paper>

        {/* QR Scanner */}
        {!scanning ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCodeScanner sx={{ fontSize: 100, color: 'primary.main', mb: 3 }} />
            <Button
              variant="contained"
              size="large"
              startIcon={<CameraAlt />}
              onClick={startScanning}
              sx={{ py: 2, px: 4 }}
            >
              {currentSession ? 'Scan to Check Out' : 'Start Scanning'}
            </Button>
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Scanning...</Typography>
                <IconButton onClick={() => {
                  if (scannerRef.current) {
                    scannerRef.current.clear();
                  }
                  setScanning(false);
                }}>
                  <Close />
                </IconButton>
              </Box>
              <Box id="qr-reader" sx={{ width: '100%' }}></Box>
            </CardContent>
          </Card>
        )}

        {/* Success Dialog */}
        <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h6">
                {scanResult?.type === 'check-in' ? 'Checked In!' : 'Checked Out!'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {scanResult && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Library:</strong> {scanResult.library}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Time:</strong> {scanResult.time}
                </Typography>
                {scanResult.duration && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Session Duration:</strong> {scanResult.duration}
                  </Typography>
                )}
                {scanResult.type === 'check-in' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Remember to check out when you leave!
                  </Alert>
                )}
                {scanResult.type === 'check-out' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Thank you for using StudySpot! See you again soon! 📚
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuccessDialog(false)} variant="contained">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

