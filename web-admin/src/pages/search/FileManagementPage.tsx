/**
 * File Management Page
 * 
 * Features:
 * - File storage and management system
 * - S3/MinIO storage integration
 * - File upload, download, and sharing
 * - File versioning and history
 * - File scanning and security analysis
 * - Storage analytics and optimization
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';

import Grid from '@mui/material/Grid';
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  AccountTree as FlowIcon,
  AccountTree as ParallelIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AllInclusive as AllInclusiveIcon,
  AllInclusive as AllInclusiveIcon2,
  AllInclusive as AllInclusiveIcon3,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  Archive as ArchiveIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  AudioFile as AudioIcon,
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesome as AutomationIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BarChart as BarChartIcon2,
  BarChart as BarChartIcon3,
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Biotech as BiotechIcon2,
  Bluetooth as BluetoothIcon,
  BubbleChart as BubbleChartIcon,
  BubbleChart as BubbleChartIcon2,
  BubbleChart as BubbleChartIcon3,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  CalendarToday as CalendarTodayIcon2,
  CalendarToday as CalendarTodayIcon3,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Cloud as CloudIcon2,
  CloudDownload as CloudDownloadIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudDownload as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  CloudUpload as UploadIcon,
  Code as CodeIcon,
  Compare as CompareIcon,
  CreateNewFolder as NewFolderIcon,
  Dashboard as DashboardIcon,
  DataObject as DataObjectIcon,
  DataUsage as DataIcon,
  Dataset as DatasetIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as DateRangeIcon3,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisMonthIcon3,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisWeekIcon3,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  DateRange as ThisYearIcon3,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  DeveloperBoard as BoardIcon,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
  DonutLarge as DonutLargeIcon3,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  FilterList as FilterIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Folder as FolderIcon,
  Functions as FunctionsIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  Group as GroupIcon2,
  Group as PsychologyIcon2,
  GroupAdd as GroupAddIcon,
  GroupAdd as GroupAddIcon2,
  GroupRemove as GroupRemoveIcon,
  GroupRemove as GroupRemoveIcon2,
  GroupWork as GroupWorkIcon,
  GroupWork as GroupWorkIcon2,
  GroupWork as GroupWorkIcon3,
  GroupWork as GroupWorkIcon4,
  Hardware as HardwareIcon,
  History as HistoryIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  InsertDriveFile as FileIcon,
  Insights as InsightsIcon,
  Key as KeyIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Loop as LoopIcon,
  Memory as CpuIcon,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  Memory as MemoryIcon3,
  ModelTraining as ModelTrainingIcon,
  MoreVert as MoreIcon,
  MultilineChart as MultilineChartIcon,
  MultilineChart as MultilineChartIcon2,
  MultilineChart as MultilineChartIcon3,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  Person as PersonIcon2,
  PersonAdd as PersonAddIcon,
  PersonAdd as PersonAddIcon2,
  PersonRemove as PersonRemoveIcon,
  PersonRemove as PersonRemoveIcon2,
  PersonSearch as PersonSearchIcon,
  PersonSearch as PersonSearchIcon2,
  PieChart as PieChartIcon,
  PieChart as PieChartIcon2,
  PieChart as PieChartIcon3,
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  Power as PowerIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  Psychology as PsychologyIcon3,
  Psychology as PsychologyIcon4,
  QrCode as QrCodeIcon,
  QueryBuilder as QueryBuilderIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Rule as ConditionIcon,
  Rule as RuleIcon,
  Scanner as ScannerIcon,
  ScatterPlot as ScatterPlotIcon,
  ScatterPlot as ScatterPlotIcon2,
  ScatterPlot as ScatterPlotIcon3,
  Schedule as DelayIcon,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Science as ScienceIcon,
  Science as ScienceIcon2,
  Search as SearchIcon,
  Security as SecurityIcon,
  Security as SecurityIcon2,
  Security as SecurityIcon3,
  Security as SecurityIcon4,
  Security as SecurityIcon5,
  Settings as SettingsIcon,
  Share as ShareIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  ShowChart as ShowChartIcon2,
  ShowChart as ShowChartIcon3,
  ShowChart as ShowChartIcon4,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Sort as SortIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Speed as SpeedIcon3,
  StopCircle as StopCircleIcon,
  Storage as DataStorageIcon,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Storage as StorageIcon3,
  Sync as RealTimeIcon,
  Sync as SyncIcon,
  Sync as SyncIcon2,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  TableChart as TableChartIcon3,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon2,
  Timeline as TimelineIcon3,
  Timeline as TimelineIcon4,
  Timeline as TimelineIcon5,
  Timeline as TimelineIcon6,
  Timer as TimerIcon,
  Today as TodayIcon,
  Today as TodayIcon2,
  Today as TodayIcon3,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingDown as TrendingDownIcon3,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingFlat as TrendingFlatIcon3,
  TrendingUp as PredictionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingUp as TrendingUpIcon3,
  Update as UpdateIcon,
  Usb as UsbIcon,
  VerifiedUser as VerifiedUserIcon,
  VideoFile as VideoIcon,
  ViewComfy as ViewComfyIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon,
  Webhook as WebhookIcon,
  Wifi as WifiIcon } from '@mui/icons-material';
;
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType: string;
  size: number; // bytes
  path: string;
  parentId?: string;
  status: 'active' | 'archived' | 'deleted' | 'scanning' | 'quarantined';
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    lastAccessed: string;
    version: number;
    checksum: string;
    tags: string[];
    description?: string;
  };
  storage: {
    provider: 's3' | 'minio' | 'local';
    bucket: string;
    key: string;
    region: string;
    encryption: boolean;
  };
  security: {
    scanned: boolean;
    scanDate?: string;
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    quarantineReason?: string;
  };
  sharing: {
    isShared: boolean;
    shareUrl?: string;
    sharePassword?: string;
    expiresAt?: string;
    accessCount: number;
  };
}

interface StorageStats {
  totalFiles: number;
  totalSize: number; // bytes
  usedSpace: number; // bytes
  availableSpace: number; // bytes
  fileTypes: { [key: string]: number };
  storageProviders: { [key: string]: number };
  recentUploads: number;
  recentDownloads: number;
}

const FileManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPath, setCurrentPath] = useState('/');

  // Mock data
  useEffect(() => {
    setFiles([
      {
        id: '1',
        name: 'user_manual.pdf',
        type: 'file',
        mimeType: 'application/pdf',
        size: 2048576, // 2MB
        path: '/documents/user_manual.pdf',
        status: 'active',
        permissions: {
          read: ['admin', 'user'],
          write: ['admin'],
          delete: ['admin']
        },
        metadata: {
          createdBy: 'admin@company.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          lastAccessed: '2024-01-15T09:30:00Z',
          version: 3,
          checksum: 'a1b2c3d4e5f6',
          tags: ['documentation', 'user-guide'],
          description: 'User manual for the platform'
        },
        storage: {
          provider: 's3',
          bucket: 'studyspot-files',
          key: 'documents/user_manual.pdf',
          region: 'us-west-2',
          encryption: true
        },
        security: {
          scanned: true,
          scanDate: '2024-01-15T10:00:00Z',
          threats: [],
          riskLevel: 'low'
        },
        sharing: {
          isShared: false,
          accessCount: 0
        }
      },
      {
        id: '2',
        name: 'profile_images',
        type: 'folder',
        mimeType: 'folder',
        size: 0,
        path: '/images/profile_images',
        status: 'active',
        permissions: {
          read: ['admin', 'user'],
          write: ['admin', 'user'],
          delete: ['admin']
        },
        metadata: {
          createdBy: 'admin@company.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          lastAccessed: '2024-01-15T09:30:00Z',
          version: 1,
          checksum: '',
          tags: ['images', 'profiles'],
          description: 'User profile images'
        },
        storage: {
          provider: 's3',
          bucket: 'studyspot-files',
          key: 'images/profile_images/',
          region: 'us-west-2',
          encryption: true
        },
        security: {
          scanned: true,
          scanDate: '2024-01-15T10:00:00Z',
          threats: [],
          riskLevel: 'low'
        },
        sharing: {
          isShared: false,
          accessCount: 0
        }
      },
      {
        id: '3',
        name: 'suspicious_file.exe',
        type: 'file',
        mimeType: 'application/x-executable',
        size: 1024000, // 1MB
        path: '/uploads/suspicious_file.exe',
        status: 'quarantined',
        permissions: {
          read: ['admin'],
          write: ['admin'],
          delete: ['admin']
        },
        metadata: {
          createdBy: 'user@company.com',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z',
          lastAccessed: '2024-01-15T08:00:00Z',
          version: 1,
          checksum: 'x1y2z3a4b5c6',
          tags: ['executable', 'quarantined'],
          description: 'Suspicious executable file'
        },
        storage: {
          provider: 's3',
          bucket: 'studyspot-quarantine',
          key: 'uploads/suspicious_file.exe',
          region: 'us-west-2',
          encryption: true
        },
        security: {
          scanned: true,
          scanDate: '2024-01-15T08:00:00Z',
          threats: ['malware', 'trojan'],
          riskLevel: 'critical',
          quarantineReason: 'Detected malware during scan'
        },
        sharing: {
          isShared: false,
          accessCount: 0
        }
      }
    ]);

    setStats({
      totalFiles: 15420,
      totalSize: 10737418240, // 10GB
      usedSpace: 8589934592, // 8GB
      availableSpace: 2147483648, // 2GB
      fileTypes: {
        'image': 45,
        'document': 25,
        'video': 15,
        'audio': 10,
        'archive': 5
      },
      storageProviders: {
        's3': 70,
        'minio': 25,
        'local': 5
      },
      recentUploads: 150,
      recentDownloads: 320
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'archived': return 'default';
      case 'deleted': return 'error';
      case 'scanning': return 'info';
      case 'quarantined': return 'warning';
      default: return 'default';
    }
  };

  const getFileIcon = (mimeType: string, type: string) => {
    if (type === 'folder') return <FolderIcon />;
    
    if (mimeType.startsWith('image/')) return <ImageIcon />;
    if (mimeType.startsWith('video/')) return <VideoIcon />;
    if (mimeType.startsWith('audio/')) return <AudioIcon />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <DocumentIcon />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <ArchiveIcon />;
    
    return <FileIcon />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((file: any) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
            File Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            File storage, sharing, and security management
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
            variant="outlined"
            startIcon={<NewFolderIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Upload Files
          </Button>
        </Box>
      </Box>

      {/* File Management Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <FileIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Files</Typography>
                <Typography variant="h4">{stats?.totalFiles.toLocaleString() || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats?.recentUploads || 0} uploaded today
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <StorageIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Storage Used</Typography>
                <Typography variant="h4">{formatFileSize(stats?.usedSpace || 0)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  of {formatFileSize(stats?.totalSize || 0)} total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <DownloadIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Downloads</Typography>
                <Typography variant="h4">{stats?.recentDownloads || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Quarantined</Typography>
                <Typography variant="h4">{files.filter((f: any) => f.status === 'quarantined').length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Files requiring review
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="File Browser" />
          <Tab label="Storage Analytics" />
          <Tab label="Security Scan" />
          <Tab label="Sharing" />
        </Tabs>

        {/* File Browser Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Files</Typography>
              <Typography variant="body2" color="text.secondary">
                {currentPath}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="file">Files</MenuItem>
                  <MenuItem value="folder">Folders</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                  <MenuItem value="scanning">Scanning</MenuItem>
                  <MenuItem value="quarantined">Quarantined</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Security</TableCell>
                  <TableCell>Modified</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getFileIcon(file.mimeType, file.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{file.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {file.path}
                          </Typography>
                          {file.metadata.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {file.metadata.tags.slice(0, 2).map((tag) => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {file.type === 'folder' ? 'Folder' : file.mimeType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {file.type === 'folder' ? '-' : formatFileSize(file.size)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={file.status}
                        color={getStatusColor(file.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={file.security.riskLevel}
                          color={getRiskColor(file.security.riskLevel) as any}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {file.security.scanned && (
                          <CheckIcon color="success" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(file.metadata.updatedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedFile(file)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton size="small">
                          <ShareIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Storage Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Storage Analytics</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Storage Usage</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Used Space</Typography>
                    <Typography variant="body2">{formatFileSize(stats?.usedSpace || 0)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={((stats?.usedSpace || 0) / (stats?.totalSize || 1)) * 100}
                    color="primary"
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Available</Typography>
                    <Typography variant="body2">{formatFileSize(stats?.availableSpace || 0)}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>File Types Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(stats?.fileTypes || {}).map(([type, percentage]) => (
                      <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {type}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color="secondary"
                            sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                            {percentage}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Storage Providers</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                {Object.entries(stats?.storageProviders || {}).map(([provider, percentage]) => (
                  <Box key={provider} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {provider.toUpperCase()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Security Scan Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Security Scan Results</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {files.filter((f: any) => f.status === 'quarantined' || f.security.riskLevel !== 'low').map((file) => (
              <Card key={file.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{file.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {file.path}
                      </Typography>
                    </Box>
                    <Chip
                      label={file.security.riskLevel}
                      color={getRiskColor(file.security.riskLevel) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Status:</Typography>
                      <Typography variant="body2">{file.status}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Scanned:</Typography>
                      <Typography variant="body2">
                        {file.security.scanned ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                    {file.security.scanDate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Scan Date:</Typography>
                        <Typography variant="body2">
                          {new Date(file.security.scanDate).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    {file.security.threats.length > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Threats:</Typography>
                        <Typography variant="body2" color="error">
                          {file.security.threats.join(', ')}
                        </Typography>
                      </Box>
                    )}
                    {file.security.quarantineReason && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Reason:</Typography>
                        <Typography variant="body2" color="warning.main">
                          {file.security.quarantineReason}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<SecurityIcon />}>
                      Scan Again
                    </Button>
                    <Button size="small" startIcon={<DeleteIcon />}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Sharing Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>File Sharing</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Shared</TableCell>
                  <TableCell>Access Count</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.filter((f: any) => f.sharing.isShared).map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getFileIcon(file.mimeType, file.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{file.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {file.path}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={file.sharing.isShared ? 'Yes' : 'No'}
                        color={file.sharing.isShared ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {file.sharing.accessCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {file.sharing.expiresAt ? 
                          new Date(file.sharing.expiresAt).toLocaleDateString() : 
                          'Never'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ShareIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onClose={() => setSelectedFile(null)} maxWidth="lg" fullWidth>
        <DialogTitle>File Details</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedFile.path}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>File Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedFile.type}</Typography>
                      <Typography variant="body2">MIME Type: {selectedFile.mimeType}</Typography>
                      <Typography variant="body2">Size: {formatFileSize(selectedFile.size)}</Typography>
                      <Typography variant="body2">Status: {selectedFile.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Version: {selectedFile.metadata.version}</Typography>
                      <Typography variant="body2">Checksum: {selectedFile.metadata.checksum}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedFile.metadata.createdAt).toLocaleString()}</Typography>
                      <Typography variant="body2">Modified: {new Date(selectedFile.metadata.updatedAt).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Storage Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Provider: {selectedFile.storage.provider.toUpperCase()}</Typography>
                    <Typography variant="body2">Bucket: {selectedFile.storage.bucket}</Typography>
                    <Typography variant="body2">Region: {selectedFile.storage.region}</Typography>
                    <Typography variant="body2">Encryption: {selectedFile.storage.encryption ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Security Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Scanned: {selectedFile.security.scanned ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Risk Level: {selectedFile.security.riskLevel}</Typography>
                    {selectedFile.security.scanDate && (
                      <Typography variant="body2">Scan Date: {new Date(selectedFile.security.scanDate).toLocaleString()}</Typography>
                    )}
                    {selectedFile.security.threats.length > 0 && (
                      <Typography variant="body2" color="error">
                        Threats: {selectedFile.security.threats.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedFile.metadata.tags.map((tag) => (
                      <Chip key={tag} label={tag} color="primary" variant="outlined" size="small" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFile(null)}>Close</Button>
          <Button variant="contained">Download</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManagementPage;






