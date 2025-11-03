import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Divider,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Palette as PaletteIcon,
  Map as MapIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';

interface LibraryData {
  libraryId: string;
  libraryName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  checkInBarcode: string;
  checkOutBarcode: string;
  contactInfo: {
    phone: string;
    email: string;
  };
}

interface QRCodeStats {
  totalScans: number;
  checkInScans: number;
  checkOutScans: number;
  lastScanTime: string | null;
  uniqueUsers: number;
  todayScans: number;
  weeklyScans: number;
  monthlyScans: number;
}

interface QRCodeSettings {
  showLibraryLogo: boolean;
  showInstructions: boolean;
  showTimestamp: boolean;
  qrCodeSize: 'small' | 'medium' | 'large';
  borderStyle: 'square' | 'rounded' | 'circle';
  showAddress: boolean;
  showContact: boolean;
}

const BarcodeQRPage: React.FC = () => {
  // State for QR code generation
  const [checkInQRUrl, setCheckInQRUrl] = useState<string>('');
  const [checkOutQRUrl, setCheckOutQRUrl] = useState<string>('');
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  
  // Toggle states for QR code display
  const [showCheckInQR, setShowCheckInQR] = useState(true);
  const [showCheckOutQR, setShowCheckOutQR] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(true);
  
  // Enhanced QR code details and analytics
  const [qrCodeStats, setQrCodeStats] = useState<QRCodeStats>({
    totalScans: 1247,
    checkInScans: 623,
    checkOutScans: 624,
    lastScanTime: new Date().toISOString(),
    uniqueUsers: 89,
    todayScans: 45,
    weeklyScans: 312,
    monthlyScans: 1247
  });
  
  const [qrCodeSettings, setQrCodeSettings] = useState<QRCodeSettings>({
    showLibraryLogo: true,
    showInstructions: true,
    showTimestamp: true,
    qrCodeSize: 'medium',
    borderStyle: 'rounded',
    showAddress: true,
    showContact: true
  });

  const [libraryData, setLibraryData] = useState<LibraryData>({
    libraryId: '',
    libraryName: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    checkInBarcode: '',
    checkOutBarcode: '',
    contactInfo: {
      phone: '',
      email: ''
    }
  });

  // Dialog states
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  // Load library data from localStorage or generate new
  useEffect(() => {
    const savedData = localStorage.getItem('libraryBarcodeData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setLibraryData(parsed);
      } catch (error) {
        console.error('Error parsing saved library data:', error);
        generateNewBarcodes();
      }
    } else {
      generateNewBarcodes();
    }
  }, []);

  const generateNewBarcodes = () => {
    const libraryId = `LIB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const checkInId = `${libraryId}-IN`;
    const checkOutId = `${libraryId}-OUT`;
    
    const newData: LibraryData = {
      libraryId,
      libraryName: libraryData.libraryName || 'StudySpot Library',
      address: libraryData.address || '123 Main Street',
      city: libraryData.city || 'Mumbai',
      state: libraryData.state || 'Maharashtra',
      phone: libraryData.phone || '+91 98765 43210',
      email: libraryData.email || 'info@studyspot.com',
      checkInBarcode: checkInId,
      checkOutBarcode: checkOutId,
      contactInfo: {
        phone: libraryData.phone || '+91 98765 43210',
        email: libraryData.email || 'info@studyspot.com'
      }
    };
    
    setLibraryData(newData);
    localStorage.setItem('libraryBarcodeData', JSON.stringify(newData));
  };

  // Create enhanced QR code with detailed information overlay
  const createEnhancedQRCode = async (qrCodeUrl: string, libraryName: string, action: string, color: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Dynamic canvas size based on settings
      const sizeMultiplier = qrCodeSettings.qrCodeSize === 'small' ? 0.8 : qrCodeSettings.qrCodeSize === 'large' ? 1.2 : 1;
      const canvasWidth = 350 * sizeMultiplier;
      const canvasHeight = 450 * sizeMultiplier;
      
      img.onload = () => {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        if (ctx) {
          // Fill background with gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          gradient.addColorStop(0, '#FFFFFF');
          gradient.addColorStop(1, '#F8F9FA');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          
          // Draw QR code with dynamic size
          const qrSize = 280 * sizeMultiplier;
          const qrX = (canvasWidth - qrSize) / 2;
          const qrY = 60 * sizeMultiplier;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          
          // Add border around QR code with dynamic style
          ctx.strokeStyle = color;
          ctx.lineWidth = 4 * sizeMultiplier;
          
          if (qrCodeSettings.borderStyle === 'circle') {
            ctx.beginPath();
            ctx.arc(qrX + qrSize/2, qrY + qrSize/2, qrSize/2 + 2, 0, 2 * Math.PI);
            ctx.stroke();
          } else {
            const radius = qrCodeSettings.borderStyle === 'rounded' ? 12 * sizeMultiplier : 0;
            ctx.beginPath();
            ctx.roundRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, radius);
            ctx.stroke();
          }
          
          // Add library name at top with enhanced styling
          ctx.fillStyle = color;
          ctx.font = `bold ${18 * sizeMultiplier}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(libraryName.toUpperCase(), canvasWidth / 2, 25 * sizeMultiplier);
          
          // Add library address if enabled
          if (qrCodeSettings.showAddress) {
            ctx.font = `${12 * sizeMultiplier}px Arial`;
            ctx.fillStyle = '#666666';
            const address = `${libraryData.address}, ${libraryData.city}, ${libraryData.state}`;
            ctx.fillText(address, canvasWidth / 2, 45 * sizeMultiplier);
          }
          
          // Add action text with icon
          ctx.fillStyle = color;
          ctx.font = `bold ${16 * sizeMultiplier}px Arial`;
          const actionY = qrY + qrSize + 25 * sizeMultiplier;
          ctx.fillText(`📱 ${action}`, canvasWidth / 2, actionY);
          
          // Add detailed instructions
          if (qrCodeSettings.showInstructions) {
            ctx.font = `${11 * sizeMultiplier}px Arial`;
            ctx.fillStyle = '#666666';
            ctx.fillText('Scan with your mobile device', canvasWidth / 2, actionY + 20 * sizeMultiplier);
            ctx.fillText('to mark your attendance', canvasWidth / 2, actionY + 35 * sizeMultiplier);
          }
          
          // Add timestamp if enabled
          if (qrCodeSettings.showTimestamp) {
            ctx.font = `${10 * sizeMultiplier}px Arial`;
            ctx.fillStyle = '#999999';
            const timestamp = new Date().toLocaleString();
            ctx.fillText(`Generated: ${timestamp}`, canvasWidth / 2, canvasHeight - 15 * sizeMultiplier);
          }
          
          // Add decorative elements
          ctx.strokeStyle = color;
          ctx.lineWidth = 1 * sizeMultiplier;
          ctx.setLineDash([5 * sizeMultiplier, 5 * sizeMultiplier]);
          ctx.beginPath();
          ctx.moveTo(20 * sizeMultiplier, actionY + 50 * sizeMultiplier);
          ctx.lineTo(canvasWidth - 20 * sizeMultiplier, actionY + 50 * sizeMultiplier);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        resolve(canvas.toDataURL());
      };
      
      img.src = qrCodeUrl;
    });
  };

  const generateQRCodes = async () => {
    setQrCodeLoading(true);
    try {
      // Generate Check-In QR Code (Green)
      const checkInData = {
        libraryId: libraryData.libraryId,
        checkInBarcode: libraryData.checkInBarcode,
        libraryName: libraryData.libraryName,
        address: libraryData.address,
        city: libraryData.city,
        state: libraryData.state,
        type: 'check_in',
        action: 'check_in',
        timestamp: new Date().toISOString(),
        instructions: 'Scan to check-in to the library',
        contactInfo: libraryData.contactInfo,
      };
      
      const checkInUrl = await QRCode.toDataURL(JSON.stringify(checkInData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#2e7d32', // Green for check-in
          light: '#FFFFFF'
        }
      });
      
      // Create enhanced QR code with library name overlay
      const checkInEnhancedUrl = await createEnhancedQRCode(checkInUrl, libraryData.libraryName, 'CHECK-IN', '#2e7d32');
      setCheckInQRUrl(checkInEnhancedUrl);
      
      // Generate Check-Out QR Code (Red)
      const checkOutData = {
        libraryId: libraryData.libraryId,
        checkOutBarcode: libraryData.checkOutBarcode,
        libraryName: libraryData.libraryName,
        address: libraryData.address,
        city: libraryData.city,
        state: libraryData.state,
        type: 'check_out',
        action: 'check_out',
        timestamp: new Date().toISOString(),
        instructions: 'Scan to check-out from the library',
        contactInfo: libraryData.contactInfo,
      };
      
      const checkOutUrl = await QRCode.toDataURL(JSON.stringify(checkOutData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#d32f2f', // Red for check-out
          light: '#FFFFFF'
        }
      });
      
      // Create enhanced QR code with library name overlay
      const checkOutEnhancedUrl = await createEnhancedQRCode(checkOutUrl, libraryData.libraryName, 'CHECK-OUT', '#d32f2f');
      setCheckOutQRUrl(checkOutEnhancedUrl);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const downloadQRCodes = () => {
    if (checkInQRUrl) {
      const checkInLink = document.createElement('a');
      checkInLink.download = `${libraryData.libraryName}-CheckIn-QR.png`;
      checkInLink.href = checkInQRUrl;
      checkInLink.click();
    }
    
    if (checkOutQRUrl) {
      const checkOutLink = document.createElement('a');
      checkOutLink.download = `${libraryData.libraryName}-CheckOut-QR.png`;
      checkOutLink.href = checkOutQRUrl;
      checkOutLink.click();
    }
  };

  const printQRCodes = () => {
    if (checkInQRUrl && checkOutQRUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Library QR Codes - ${libraryData.libraryName}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px;
                }
                .qr-container { 
                  margin: 20px auto; 
                  max-width: 800px;
                  display: flex;
                  flex-direction: column;
                  gap: 30px;
                }
                .qr-section {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  padding: 20px;
                  border: 2px solid #ddd;
                  border-radius: 12px;
                }
                .check-in {
                  border-color: #2e7d32;
                  background-color: #f1f8e9;
                }
                .check-out {
                  border-color: #d32f2f;
                  background-color: #ffebee;
                }
                .qr-code { 
                  width: 250px; 
                  height: 250px; 
                  border: 3px solid #000;
                  border-radius: 8px;
                }
                .library-info {
                  margin-top: 15px;
                  padding: 15px;
                  border: 1px solid #ccc;
                  border-radius: 8px;
                  background-color: white;
                  text-align: center;
                }
                .title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .check-in .title {
                  color: #2e7d32;
                }
                .check-out .title {
                  color: #d32f2f;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h1 style="text-align: center; margin-bottom: 30px;">${libraryData.libraryName}</h1>
                
                <div class="qr-section check-in">
                  <div class="title">📱 CHECK-IN QR CODE</div>
                  <img src="${checkInQRUrl}" alt="Check-In QR Code" class="qr-code" />
                  <div class="library-info">
                    <p><strong>Barcode ID:</strong> ${libraryData.checkInBarcode}</p>
                    <p><strong>Instructions:</strong> Students scan this GREEN QR code to check-in</p>
                  </div>
                </div>
                
                <div class="qr-section check-out">
                  <div class="title">📱 CHECK-OUT QR CODE</div>
                  <img src="${checkOutQRUrl}" alt="Check-Out QR Code" class="qr-code" />
                  <div class="library-info">
                    <p><strong>Barcode ID:</strong> ${libraryData.checkOutBarcode}</p>
                    <p><strong>Instructions:</strong> Students scan this RED QR code to check-out</p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                  <p><strong>Library ID:</strong> ${libraryData.libraryId}</p>
                  <p><strong>Address:</strong> ${libraryData.address}, ${libraryData.city}, ${libraryData.state}</p>
                  ${libraryData.contactInfo?.phone ? `<p><strong>Phone:</strong> ${libraryData.contactInfo.phone}</p>` : ''}
                  ${libraryData.contactInfo?.email ? `<p><strong>Email:</strong> ${libraryData.contactInfo.email}</p>` : ''}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const copyBarcodeId = (barcodeId: string) => {
    navigator.clipboard.writeText(barcodeId);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Card sx={{ mb: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  📱 Library QR Code Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Generate, customize, and manage your library's check-in/check-out QR codes
                </Typography>
              </Box>
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1.5rem'
              }}>
                🎓
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced Controls and Analytics */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
          {/* QR Code Controls */}
          <Card sx={{ flex: 1, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon color="primary" />
                QR Code Controls
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoGenerate}
                      onChange={(e) => setAutoGenerate(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Auto-generate QR codes when library info changes"
                />
                
                <Divider />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Show QR Codes:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="Check-In"
                      color={showCheckInQR ? "success" : "default"}
                      variant={showCheckInQR ? "filled" : "outlined"}
                      onClick={() => setShowCheckInQR(!showCheckInQR)}
                      clickable
                      icon={<QrCodeIcon />}
                    />
                    <Chip
                      label="Check-Out"
                      color={showCheckOutQR ? "error" : "default"}
                      variant={showCheckOutQR ? "filled" : "outlined"}
                      onClick={() => setShowCheckOutQR(!showCheckOutQR)}
                      clickable
                      icon={<QrCodeScannerIcon />}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* QR Code Analytics */}
          <Card sx={{ flex: 1, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon color="primary" />
                QR Code Analytics
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%', textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {qrCodeStats.totalScans}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Scans
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%', textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {qrCodeStats.checkInScans}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check-Ins
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%', textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {qrCodeStats.checkOutScans}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Check-Outs
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%', textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {qrCodeStats.uniqueUsers}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unique Users
                  </Typography>
                </Box>
              </Box>
              
              {qrCodeStats.lastScanTime && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Last scan: {new Date(qrCodeStats.lastScanTime).toLocaleString()}
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* QR Code Customization Settings */}
        <Card sx={{ mb: 3, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon color="primary" />
              QR Code Customization
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>QR Code Size</InputLabel>
                  <Select
                    value={qrCodeSettings.qrCodeSize}
                    onChange={(e) => setQrCodeSettings(prev => ({ ...prev, qrCodeSize: e.target.value as any }))}
                    label="QR Code Size"
                  >
                    <MenuItem value="small">Small (280px)</MenuItem>
                    <MenuItem value="medium">Medium (350px)</MenuItem>
                    <MenuItem value="large">Large (420px)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel>Border Style</InputLabel>
                  <Select
                    value={qrCodeSettings.borderStyle}
                    onChange={(e) => setQrCodeSettings(prev => ({ ...prev, borderStyle: e.target.value as any }))}
                    label="Border Style"
                  >
                    <MenuItem value="square">Square</MenuItem>
                    <MenuItem value="rounded">Rounded</MenuItem>
                    <MenuItem value="circle">Circle</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={qrCodeSettings.showInstructions}
                        onChange={(e) => setQrCodeSettings(prev => ({ ...prev, showInstructions: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="Show Instructions"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={qrCodeSettings.showTimestamp}
                        onChange={(e) => setQrCodeSettings(prev => ({ ...prev, showTimestamp: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="Show Timestamp"
                  />
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Library Information and QR Generator */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Enhanced Library Information */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                  <BusinessIcon color="primary" />
                  Library Information Dashboard
                </Typography>
                
                <Stack spacing={2}>
                  {/* Library Name with Status */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Library Name"
                      value={libraryData.libraryName}
                      onChange={(e) => setLibraryData(prev => ({ ...prev, libraryName: e.target.value }))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Chip label="ACTIVE" size="small" color="success" />
                          </InputAdornment>
                        )
                      }}
                      helperText="Enter your library name"
                    />
                  </Box>

                  {/* Address with Map Icon */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Library Address"
                      value={`${libraryData.address}, ${libraryData.city}, ${libraryData.state}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parts = value.split(', ');
                        setLibraryData(prev => ({
                          ...prev,
                          address: parts[0] || '',
                          city: parts[1] || '',
                          state: parts[2] || ''
                        }));
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small">
                              <MapIcon color="primary" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      helperText="Enter complete address"
                    />
                  </Box>

                  {/* Contact Information */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Contact Information"
                      value={`${libraryData.phone} • ${libraryData.email}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parts = value.split(' • ');
                        setLibraryData(prev => ({
                          ...prev,
                          phone: parts[0] || '',
                          email: parts[1] || ''
                        }));
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        )
                      }}
                      helperText="Enter phone and email"
                    />
                  </Box>

                  {/* Library ID with QR Preview */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Library ID"
                      value={libraryData.libraryId}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <QrCodeIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => copyBarcodeId(libraryData.libraryId)}>
                              <CopyIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      helperText="Unique identifier • Generated automatically"
                    />
                  </Box>

                  {/* Check-In Barcode with Enhanced UI */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Check-In Barcode"
                      value={libraryData.checkInBarcode}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Chip 
                              label="CHECK-IN" 
                              size="small" 
                              color="success" 
                              icon={<QrCodeIcon />}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => copyBarcodeId(libraryData.checkInBarcode)}>
                              <CopyIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      helperText={`Green QR code for student check-in • Scans: ${qrCodeStats.checkInScans}`}
                    />
                  </Box>

                  {/* Check-Out Barcode with Enhanced UI */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Check-Out Barcode"
                      value={libraryData.checkOutBarcode}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Chip 
                              label="CHECK-OUT" 
                              size="small" 
                              color="error" 
                              icon={<QrCodeScannerIcon />}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => copyBarcodeId(libraryData.checkOutBarcode)}>
                              <CopyIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      helperText={`Red QR code for student check-out • Scans: ${qrCodeStats.checkOutScans}`}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={generateNewBarcodes}
                      startIcon={<RefreshIcon />}
                      sx={{ flex: 1 }}
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="contained"
                      onClick={generateQRCodes}
                      startIcon={<QrCodeIcon />}
                      sx={{ flex: 1 }}
                    >
                      Generate QR
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Enhanced QR Code Generator */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ p: 2, height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                  <QrCodeScannerIcon sx={{ color: 'white' }} />
                  QR Code Generator
                </Typography>

                <Stack spacing={2}>
                  {/* Generation Status */}
                  <Alert 
                    severity={qrCodeLoading ? "info" : (checkInQRUrl && checkOutQRUrl) ? "success" : "warning"}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    <Typography variant="body2">
                      {qrCodeLoading ? "Generating QR codes..." : 
                       (checkInQRUrl && checkOutQRUrl) ? "QR codes ready for use!" : 
                       "Click generate to create QR codes"}
                    </Typography>
                  </Alert>

                  {/* Generate Button */}
                  <Button
                    variant="contained"
                    onClick={generateQRCodes}
                    disabled={qrCodeLoading}
                    startIcon={qrCodeLoading ? <CircularProgress size={16} color="inherit" /> : <QrCodeIcon />}
                    fullWidth
                    size="large"
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    {qrCodeLoading ? 'Generating...' : 'Generate QR Codes'}
                  </Button>

                  {/* QR Code Details */}
                  {(checkInQRUrl || checkOutQRUrl) && (
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                        QR Code Details:
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Size:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {qrCodeSettings.qrCodeSize.toUpperCase()} ({qrCodeSettings.qrCodeSize === 'small' ? '280px' : qrCodeSettings.qrCodeSize === 'large' ? '420px' : '350px'})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Border:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {qrCodeSettings.borderStyle.toUpperCase()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Instructions:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {qrCodeSettings.showInstructions ? 'ON' : 'OFF'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Timestamp:
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {qrCodeSettings.showTimestamp ? 'ON' : 'OFF'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  {(checkInQRUrl || checkOutQRUrl) && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={downloadQRCodes}
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          flex: 1, 
                          borderColor: 'white', 
                          color: 'white',
                          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={printQRCodes}
                        startIcon={<PrintIcon />}
                        sx={{ 
                          flex: 1, 
                          borderColor: 'white', 
                          color: 'white',
                          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        Print
                      </Button>
                    </Stack>
                  )}

                  {/* Quick Actions */}
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'white' }}>
                      Quick Actions:
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ShareIcon />}
                        sx={{ color: 'white', flex: 1 }}
                      >
                        Share
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewDialogOpen(true)}
                        sx={{ color: 'white', flex: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<SettingsIcon />}
                        sx={{ color: 'white', flex: 1 }}
                      >
                        Settings
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* QR Code Display */}
        {(checkInQRUrl || checkOutQRUrl) && (showCheckInQR || showCheckOutQR) && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            {/* Check-In QR Code */}
            {showCheckInQR && (
              <Box sx={{ flex: 1 }}>
                <Card sx={{ p: 2, border: '3px solid #2e7d32', bgcolor: '#f1f8e9', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', textAlign: 'center', fontWeight: 'bold' }}>
                      📱 CHECK-IN QR CODE
                    </Typography>
                    
                    {checkInQRUrl ? (
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img 
                          src={checkInQRUrl} 
                          alt="Check-In QR Code with Library Name" 
                          style={{ 
                            width: '280px', 
                            height: '320px', 
                            border: '4px solid #2e7d32',
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)'
                          }} 
                        />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        height: '320px', 
                        border: '3px dashed #2e7d32', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        bgcolor: 'rgba(46, 125, 50, 0.05)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Check-In QR Code will appear here
                        </Typography>
                      </Box>
                    )}

                    <Alert severity="success" sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        <strong>Library Name:</strong> {libraryData.libraryName}<br/>
                        <strong>Action:</strong> Students scan this GREEN QR code to check-in
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Check-Out QR Code */}
            {showCheckOutQR && (
              <Box sx={{ flex: 1 }}>
                <Card sx={{ p: 2, border: '3px solid #d32f2f', bgcolor: '#ffebee', boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f', textAlign: 'center', fontWeight: 'bold' }}>
                      📱 CHECK-OUT QR CODE
                    </Typography>
                    
                    {checkOutQRUrl ? (
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img 
                          src={checkOutQRUrl} 
                          alt="Check-Out QR Code with Library Name" 
                          style={{ 
                            width: '280px', 
                            height: '320px', 
                            border: '4px solid #d32f2f',
                            borderRadius: '12px',
                            boxShadow: '0 4px 8px rgba(211, 47, 47, 0.3)'
                          }} 
                        />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        height: '320px', 
                        border: '3px dashed #d32f2f', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        bgcolor: 'rgba(211, 47, 47, 0.05)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Check-Out QR Code will appear here
                        </Typography>
                      </Box>
                    )}

                    <Alert severity="error" sx={{ textAlign: 'center' }}>
                      <Typography variant="body2">
                        <strong>Library Name:</strong> {libraryData.libraryName}<br/>
                        <strong>Action:</strong> Students scan this RED QR code to check-out
                      </Typography>
                    </Alert>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {/* How It Works Section */}
        <Card sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="primary" />
              How the Dual QR Code System Works
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
              <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: '#2e7d32', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <QrCodeIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                  1. Check-In (GREEN)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students scan the GREEN QR code when they arrive at the library to mark their entry
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: '#d32f2f', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <QrCodeScannerIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#d32f2f' }}>
                  2. Check-Out (RED)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students scan the RED QR code when they leave the library to mark their exit
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: '#1976d2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <CheckCircleIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                  3. Auto Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The system automatically tracks entry/exit times and calculates total study hours
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Benefits:</strong> Separate check-in/check-out tracking, accurate study time calculation, 
                better attendance analytics, and clear visual distinction with color-coded QR codes.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>QR Code Preview</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {(checkInQRUrl || checkOutQRUrl) && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {libraryData.libraryName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Library ID: {libraryData.libraryId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {libraryData.address}, {libraryData.city}, {libraryData.state}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center' }}>
                    {checkInQRUrl && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#2e7d32', mb: 1 }}>
                          Check-In QR Code
                        </Typography>
                        <img 
                          src={checkInQRUrl} 
                          alt="Check-In QR Code Preview" 
                          style={{ 
                            width: '200px', 
                            height: '200px', 
                            border: '3px solid #2e7d32',
                            borderRadius: '8px'
                          }} 
                        />
                      </Box>
                    )}
                    
                    {checkOutQRUrl && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: '#d32f2f', mb: 1 }}>
                          Check-Out QR Code
                        </Typography>
                        <img 
                          src={checkOutQRUrl} 
                          alt="Check-Out QR Code Preview" 
                          style={{ 
                            width: '200px', 
                            height: '200px', 
                            border: '3px solid #d32f2f',
                            borderRadius: '8px'
                          }} 
                        />
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            <Button onClick={downloadQRCodes} startIcon={<DownloadIcon />} variant="contained">
              Download Both
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BarcodeQRPage;