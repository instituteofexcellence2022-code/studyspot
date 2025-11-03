/**
 * IoT Device Management Page
 * 
 * Features:
 * - IoT device registry and management
 * - Device health monitoring
 * - Over-the-air (OTA) firmware updates
 * - Device configuration and settings
 * - Device analytics and reporting
 * - Security and access control
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
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Bluetooth as BluetoothIcon,
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
  DeveloperBoard as BoardIcon,
  Devices as DeviceIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  Hardware as HardwareIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Memory as CpuIcon,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  Policy as PolicyIcon,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
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
  Security as SecurityIcon4,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Stop as StopIcon,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Update as UpdateIcon,
  Upload as UploadIcon,
  Usb as UsbIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon,
  Wifi as WifiIcon } from '@mui/icons-material';
;
interface IoTDevice {
  id: string;
  name: string;
  type: 'kiosk' | 'camera' | 'sensor' | 'gateway' | 'mobile' | 'other';
  model: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'updating';
  health: {
    battery?: number;
    temperature: number;
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
    networkLatency: number;
    signalStrength: number;
  };
  firmware: {
    version: string;
    latestVersion: string;
    updateAvailable: boolean;
    lastUpdated: string;
    updateProgress?: number;
  };
  location: {
    tenantId: string;
    tenantName: string;
    building: string;
    room: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  capabilities: string[];
  configuration: {
    [key: string]: any;
  };
  security: {
    encrypted: boolean;
    certificateValid: boolean;
    lastSecurityCheck: string;
    vulnerabilities: number;
  };
  connectivity: {
    type: 'wifi' | 'ethernet' | 'bluetooth' | 'cellular' | 'usb';
    signalStrength: number;
    lastSeen: string;
    uptime: number; // hours
  };
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

interface FirmwareUpdate {
  id: string;
  deviceId: string;
  deviceName: string;
  fromVersion: string;
  toVersion: string;
  status: 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rollback';
  progress: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  rollbackVersion?: string;
}

const IoTDeviceManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [firmwareUpdates, setFirmwareUpdates] = useState<FirmwareUpdate[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  useEffect(() => {
    setDevices([
      {
        id: '1',
        name: 'Main Library Kiosk',
        type: 'kiosk',
        model: 'StudySpot-Kiosk-Pro',
        manufacturer: 'StudySpot Technologies',
        serialNumber: 'SS-KIOSK-001',
        macAddress: '00:1B:44:11:3A:B7',
        ipAddress: '192.168.1.100',
        status: 'online',
        health: {
          temperature: 45.2,
          cpuUsage: 23.5,
          memoryUsage: 67.8,
          storageUsage: 45.2,
          networkLatency: 12,
          signalStrength: 85
        },
        firmware: {
          version: '2.1.0',
          latestVersion: '2.2.0',
          updateAvailable: true,
          lastUpdated: '2024-01-10T14:30:00Z'
        },
        location: {
          tenantId: 'tenant-1',
          tenantName: 'University of California',
          building: 'Main Library',
          room: 'Entrance Hall',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        capabilities: ['face_recognition', 'qr_scanning', 'touch_display', 'printer', 'camera'],
        configuration: {
          faceRecognitionEnabled: true,
          qrCodeEnabled: true,
          autoLogout: 30,
          displayBrightness: 80,
          soundEnabled: true
        },
        security: {
          encrypted: true,
          certificateValid: true,
          lastSecurityCheck: '2024-01-15T10:00:00Z',
          vulnerabilities: 0
        },
        connectivity: {
          type: 'wifi',
          signalStrength: 85,
          lastSeen: '2024-01-15T10:30:00Z',
          uptime: 168.5
        },
        lastActivity: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Security Camera - Entrance',
        type: 'camera',
        model: 'StudySpot-Cam-HD',
        manufacturer: 'StudySpot Technologies',
        serialNumber: 'SS-CAM-002',
        macAddress: '00:1B:44:11:3A:B8',
        ipAddress: '192.168.1.101',
        status: 'online',
        health: {
          temperature: 38.7,
          cpuUsage: 45.2,
          memoryUsage: 78.9,
          storageUsage: 67.3,
          networkLatency: 8,
          signalStrength: 92
        },
        firmware: {
          version: '1.8.2',
          latestVersion: '1.8.2',
          updateAvailable: false,
          lastUpdated: '2024-01-05T09:15:00Z'
        },
        location: {
          tenantId: 'tenant-1',
          tenantName: 'University of California',
          building: 'Main Library',
          room: 'Entrance',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        capabilities: ['hd_recording', 'night_vision', 'motion_detection', 'audio_recording', 'cloud_storage'],
        configuration: {
          recordingQuality: '1080p',
          nightVisionEnabled: true,
          motionDetectionSensitivity: 75,
          audioRecordingEnabled: true,
          cloudStorageEnabled: true
        },
        security: {
          encrypted: true,
          certificateValid: true,
          lastSecurityCheck: '2024-01-15T10:00:00Z',
          vulnerabilities: 1
        },
        connectivity: {
          type: 'ethernet',
          signalStrength: 100,
          lastSeen: '2024-01-15T10:30:00Z',
          uptime: 168.5
        },
        lastActivity: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '3',
        name: 'Temperature Sensor - Study Room A',
        type: 'sensor',
        model: 'StudySpot-Sensor-Temp',
        manufacturer: 'StudySpot Technologies',
        serialNumber: 'SS-SENSOR-003',
        macAddress: '00:1B:44:11:3A:B9',
        ipAddress: '192.168.1.102',
        status: 'offline',
        health: {
          battery: 15,
          temperature: 22.5,
          cpuUsage: 5.2,
          memoryUsage: 23.4,
          storageUsage: 12.8,
          networkLatency: 0,
          signalStrength: 0
        },
        firmware: {
          version: '1.2.1',
          latestVersion: '1.3.0',
          updateAvailable: true,
          lastUpdated: '2024-01-08T16:45:00Z'
        },
        location: {
          tenantId: 'tenant-1',
          tenantName: 'University of California',
          building: 'Main Library',
          room: 'Study Room A',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        capabilities: ['temperature_monitoring', 'humidity_sensing', 'battery_monitoring', 'low_power_mode'],
        configuration: {
          temperatureThreshold: 25,
          humidityThreshold: 60,
          reportingInterval: 300,
          lowPowerMode: true,
          alertEnabled: true
        },
        security: {
          encrypted: true,
          certificateValid: false,
          lastSecurityCheck: '2024-01-12T08:00:00Z',
          vulnerabilities: 2
        },
        connectivity: {
          type: 'wifi',
          signalStrength: 0,
          lastSeen: '2024-01-14T18:30:00Z',
          uptime: 0
        },
        lastActivity: '2024-01-14T18:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T18:30:00Z'
      }
    ]);

    setFirmwareUpdates([
      {
        id: '1',
        deviceId: '1',
        deviceName: 'Main Library Kiosk',
        fromVersion: '2.1.0',
        toVersion: '2.2.0',
        status: 'pending',
        progress: 0,
        startedAt: '2024-01-15T11:00:00Z'
      },
      {
        id: '2',
        deviceId: '3',
        deviceName: 'Temperature Sensor - Study Room A',
        fromVersion: '1.2.1',
        toVersion: '1.3.0',
        status: 'downloading',
        progress: 45,
        startedAt: '2024-01-15T10:45:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      case 'updating': return 'info';
      case 'pending': return 'info';
      case 'downloading': return 'warning';
      case 'installing': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'rollback': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kiosk': return <DeviceIcon />;
      case 'camera': return <CameraIcon />;
      case 'sensor': return <TemperatureIcon />;
      case 'gateway': return <RouterIcon />;
      case 'mobile': return <SmartphoneIcon />;
      default: return <HardwareIcon />;
    }
  };

  const getConnectivityIcon = (type: string) => {
    switch (type) {
      case 'wifi': return <WifiIcon />;
      case 'ethernet': return <NetworkIcon />;
      case 'bluetooth': return <BluetoothIcon />;
      case 'cellular': return <NetworkIcon />;
      case 'usb': return <UsbIcon />;
      default: return <NetworkIcon />;
    }
  };

  const getHealthColor = (value: number, type: string) => {
    switch (type) {
      case 'battery':
        if (value > 50) return 'success';
        if (value > 20) return 'warning';
        return 'error';
      case 'temperature':
        if (value < 40) return 'success';
        if (value < 60) return 'warning';
        return 'error';
      case 'cpuUsage':
      case 'memoryUsage':
      case 'storageUsage':
        if (value < 50) return 'success';
        if (value < 80) return 'warning';
        return 'error';
      case 'signalStrength':
        if (value > 80) return 'success';
        if (value > 50) return 'warning';
        return 'error';
      default:
        return 'success';
    }
  };

  const filteredDevices = devices.filter((device: any) => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    const matchesType = filterType === 'all' || device.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const deviceMetrics = {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d: any) => d.status === 'online').length,
    offlineDevices: devices.filter((d: any) => d.status === 'offline').length,
    updateAvailable: devices.filter((d: any) => d.firmware.updateAvailable).length,
    averageUptime: devices.reduce((sum, d) => sum + d.connectivity.uptime, 0) / devices.length,
    securityIssues: devices.reduce((sum, d) => sum + d.security.vulnerabilities, 0),
    lowBattery: devices.filter((d: any) => d.health.battery && d.health.battery < 20).length
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
            IoT Device Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor IoT devices, firmware updates, and device health
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
            Add Device
          </Button>
        </Box>
      </Box>

      {/* Device Metrics Cards */}
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
                <DeviceIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Online Devices</Typography>
                <Typography variant="h4">{deviceMetrics.onlineDevices}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {deviceMetrics.totalDevices} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <UpdateIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Updates Available</Typography>
                <Typography variant="h4">{deviceMetrics.updateAvailable}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Firmware updates
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Security Issues</Typography>
                <Typography variant="h4">{deviceMetrics.securityIssues}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {deviceMetrics.lowBattery} low battery
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Uptime</Typography>
                <Typography variant="h4">{deviceMetrics.averageUptime.toFixed(1)}h</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours online
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Devices" />
          <Tab label="Firmware Updates" />
          <Tab label="Health Monitoring" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Devices Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">IoT Devices</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search devices..."
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
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="updating">Updating</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="kiosk">Kiosk</MenuItem>
                  <MenuItem value="camera">Camera</MenuItem>
                  <MenuItem value="sensor">Sensor</MenuItem>
                  <MenuItem value="gateway">Gateway</MenuItem>
                  <MenuItem value="mobile">Mobile</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Firmware</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Connectivity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(device.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{device.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {device.model} • {device.serialNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={device.status}
                        color={getStatusColor(device.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1, minWidth: 40 }}>
                            CPU:
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={device.health.cpuUsage}
                            color={getHealthColor(device.health.cpuUsage, 'cpuUsage') as any}
                            sx={{ width: 60, height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {device.health.cpuUsage.toFixed(0)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1, minWidth: 40 }}>
                            MEM:
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={device.health.memoryUsage}
                            color={getHealthColor(device.health.memoryUsage, 'memoryUsage') as any}
                            sx={{ width: 60, height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {device.health.memoryUsage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {device.firmware.version}
                        </Typography>
                        {device.firmware.updateAvailable && (
                          <Chip
                            label="Update Available"
                            color="warning"
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {device.location.building}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {device.location.room}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                          {getConnectivityIcon(device.connectivity.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {device.connectivity.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {device.connectivity.signalStrength}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedDevice(device)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small">
                          <UpdateIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Firmware Updates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Firmware Updates</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Update</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {firmwareUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{update.deviceName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {update.fromVersion} → {update.toVersion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={update.status}
                        color={getStatusColor(update.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {update.progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={update.progress}
                          color={update.status === 'failed' ? 'error' : 'primary'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(update.startedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
                        </IconButton>
                        <IconButton size="small">
                          <StopIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Health Monitoring Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Device Health Monitoring</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {devices.map((device) => (
              <Card key={device.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{device.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {device.model} • {device.status}
                      </Typography>
                    </Box>
                    <Chip
                      label={device.status}
                      color={getStatusColor(device.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>System Health</Typography>
                      <Box sx={{ display: 'grid', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">CPU Usage</Typography>
                          <Typography variant="body2">{device.health.cpuUsage.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={device.health.cpuUsage}
                          color={getHealthColor(device.health.cpuUsage, 'cpuUsage') as any}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Memory Usage</Typography>
                          <Typography variant="body2">{device.health.memoryUsage.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={device.health.memoryUsage}
                          color={getHealthColor(device.health.memoryUsage, 'memoryUsage') as any}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Storage Usage</Typography>
                          <Typography variant="body2">{device.health.storageUsage.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={device.health.storageUsage}
                          color={getHealthColor(device.health.storageUsage, 'storageUsage') as any}
                        />
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Environment</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Box>
                          <Typography variant="body2">Temperature</Typography>
                          <Typography variant="body2">{device.health.temperature}°C</Typography>
                        </Box>
                        {device.health.battery && (
                          <Box>
                            <Typography variant="body2">Battery</Typography>
                            <Typography variant="body2">{device.health.battery}%</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Network</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Box>
                          <Typography variant="body2">Signal</Typography>
                          <Typography variant="body2">{device.connectivity.signalStrength}%</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2">Latency</Typography>
                          <Typography variant="body2">{device.health.networkLatency}ms</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Device Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Device Status Distribution</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Uptime Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Device Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Device came online"
                    secondary="Main Library Kiosk - IP: 192.168.1.100 - Time: 2024-01-15 10:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Low battery warning"
                    secondary="Temperature Sensor - Study Room A - Battery: 15% - Time: 2024-01-14 18:30:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <UpdateIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Firmware update started"
                    secondary="Temperature Sensor - Study Room A - 1.2.1 → 1.3.0 - Time: 2024-01-15 10:45:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Device Details Dialog */}
      <Dialog open={!!selectedDevice} onClose={() => setSelectedDevice(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Device Details</DialogTitle>
        <DialogContent>
          {selectedDevice && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedDevice.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedDevice.model} • {selectedDevice.serialNumber}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Device Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedDevice.type}</Typography>
                      <Typography variant="body2">Manufacturer: {selectedDevice.manufacturer}</Typography>
                      <Typography variant="body2">Status: {selectedDevice.status}</Typography>
                      <Typography variant="body2">IP Address: {selectedDevice.ipAddress}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">MAC Address: {selectedDevice.macAddress}</Typography>
                      <Typography variant="body2">Firmware: {selectedDevice.firmware.version}</Typography>
                      <Typography variant="body2">Uptime: {selectedDevice.connectivity.uptime.toFixed(1)} hours</Typography>
                      <Typography variant="body2">Last Seen: {new Date(selectedDevice.lastActivity).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Location</Typography>
                  <Typography variant="body2">{selectedDevice.location.building}</Typography>
                  <Typography variant="body2">{selectedDevice.location.room}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDevice.location.tenantName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Capabilities</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedDevice.capabilities.map((capability) => (
                      <Chip
                        key={capability}
                        label={capability.replace('_', ' ')}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Security Status</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Encrypted: {selectedDevice.security.encrypted ? 'Yes' : 'No'}</Typography>
                      <Typography variant="body2">Certificate Valid: {selectedDevice.security.certificateValid ? 'Yes' : 'No'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Vulnerabilities: {selectedDevice.security.vulnerabilities}</Typography>
                      <Typography variant="body2">Last Check: {new Date(selectedDevice.security.lastSecurityCheck).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDevice(null)}>Close</Button>
          <Button variant="contained">Configure Device</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IoTDeviceManagementPage;
