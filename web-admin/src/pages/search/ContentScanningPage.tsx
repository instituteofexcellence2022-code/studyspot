/**
 * Content Scanning Page
 * 
 * Features:
 * - Content scanning and analysis
 * - Malware and threat detection
 * - Content classification and tagging
 * - Compliance scanning and reporting
 * - Scan scheduling and automation
 * - Security policy enforcement
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { AccessTime as AccessTimeIcon,
  AccessTime as AccessTimeIcon2,
  AccountBalance as BillingIcon,
  AccountBalance as BillingIcon2,
  AccountTree as FlowIcon,
  AccountTree as FlowIcon2,
  AccountTree as ParallelIcon,
  AccountTree as ParallelIcon2,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AdminPanelSettings as AdminIcon2,
  AllInclusive as AllInclusiveIcon,
  AllInclusive as AllInclusiveIcon2,
  AllInclusive as AllInclusiveIcon3,
  AllInclusive as AllInclusiveIcon4,
  AllInclusive as AllInclusiveIcon5,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  Api as ApiIcon2,
  ArrowForward as ArrowIcon,
  ArrowForward as ArrowIcon2,
  Article as ArticleIcon,
  Article as ArticleIcon2,
  Assessment as AssessmentIcon,
  Assessment as AssessmentIcon2,
  Assignment as AuditIcon,
  Assignment as AuditIcon2,
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesome as AutomationIcon,
  AutoAwesome as AutomationIcon2,
  Backup as BackupIcon,
  Backup as BackupIcon2,
  BarChart as BarChartIcon,
  BarChart as BarChartIcon2,
  BarChart as BarChartIcon3,
  BarChart as BarChartIcon4,
  BarChart as BarChartIcon5,
  BatteryFull as BatteryIcon,
  BatteryFull as BatteryIcon2,
  Biotech as BiotechIcon,
  Biotech as BiotechIcon2,
  Bluetooth as BluetoothIcon,
  Bluetooth as BluetoothIcon2,
  BubbleChart as BubbleChartIcon,
  BubbleChart as BubbleChartIcon2,
  BubbleChart as BubbleChartIcon3,
  BubbleChart as BubbleChartIcon4,
  BubbleChart as BubbleChartIcon5,
  BugReport as BugReportIcon,
  BugReport as BugReportIcon2,
  Build as BuildIcon,
  Build as BuildIcon2,
  Business as BusinessIcon,
  Business as BusinessIcon2,
  CalendarToday as CalendarTodayIcon,
  CalendarToday as CalendarTodayIcon2,
  CalendarToday as CalendarTodayIcon3,
  CalendarToday as CalendarTodayIcon4,
  CalendarToday as CalendarTodayIcon5,
  CameraAlt as CameraIcon,
  CameraAlt as CameraIcon2,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  CheckCircle as CheckIcon2,
  ChevronRight as ChevronRightIcon,
  ChevronRight as ChevronRightIcon2,
  Cloud as CloudIcon,
  Cloud as CloudIcon2,
  Cloud as CloudIcon3,
  CloudDownload as CloudDownloadIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudDownload as CloudDownloadIcon3,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  CloudUpload as CloudUploadIcon3,
  Code as CodeIcon,
  Code as CodeIcon2,
  Compare as CompareIcon,
  Compare as CompareIcon2,
  Dashboard as DashboardIcon,
  Dashboard as DashboardIcon2,
  DataObject as DataObjectIcon,
  DataObject as DataObjectIcon2,
  DataUsage as DataIcon,
  DataUsage as DataIcon2,
  Dataset as DatasetIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as DateRangeIcon3,
  DateRange as DateRangeIcon4,
  DateRange as DateRangeIcon5,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisMonthIcon3,
  DateRange as ThisMonthIcon4,
  DateRange as ThisMonthIcon5,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisWeekIcon3,
  DateRange as ThisWeekIcon4,
  DateRange as ThisWeekIcon5,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  DateRange as ThisYearIcon3,
  DateRange as ThisYearIcon4,
  DateRange as ThisYearIcon5,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DescriptionIcon2,
  Description as DocumentIcon,
  Description as DocumentIcon2,
  DeveloperBoard as BoardIcon,
  DeveloperBoard as BoardIcon2,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
  DonutLarge as DonutLargeIcon3,
  DonutLarge as DonutLargeIcon4,
  DonutLarge as DonutLargeIcon5,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Email as EmailIcon2,
  Error as ErrorIcon,
  Error as ErrorIcon2,
  Event as EventIcon,
  Event as EventIcon2,
  ExpandMore as ExpandMoreIcon,
  ExpandMore as ExpandMoreIcon2,
  FileDownload as FileDownloadIcon,
  FileDownload as FileDownloadIcon2,
  FileUpload as FileUploadIcon,
  FileUpload as FileUploadIcon2,
  FilterList as FilterIcon,
  FilterList as FilterIcon2,
  Fingerprint as FingerprintIcon,
  Fingerprint as FingerprintIcon2,
  Flag as FlagIcon,
  Flag as FlagIcon2,
  Functions as FunctionsIcon,
  Functions as FunctionsIcon2,
  Gavel as GavelIcon,
  Gavel as GavelIcon2,
  Group as GroupIcon,
  Group as GroupIcon2,
  Group as PsychologyIcon2,
  Group as PsychologyIcon6,
  GroupAdd as GroupAddIcon,
  GroupAdd as GroupAddIcon2,
  GroupAdd as GroupAddIcon3,
  GroupRemove as GroupRemoveIcon,
  GroupRemove as GroupRemoveIcon2,
  GroupRemove as GroupRemoveIcon3,
  GroupWork as GroupWorkIcon,
  GroupWork as GroupWorkIcon2,
  GroupWork as GroupWorkIcon3,
  GroupWork as GroupWorkIcon4,
  GroupWork as GroupWorkIcon5,
  GroupWork as GroupWorkIcon6,
  Hardware as HardwareIcon,
  Hardware as HardwareIcon2,
  History as HistoryIcon,
  History as HistoryIcon2,
  History as HistoryIcon3,
  Info as InfoIcon2,
  Insights as InsightsIcon,
  Insights as InsightsIcon2,
  Key as KeyIcon,
  Key as KeyIcon2,
  LocationOn as LocationIcon,
  LocationOn as LocationIcon2,
  Lock as LockIcon,
  Lock as LockIcon2,
  Loop as LoopIcon,
  Loop as LoopIcon2,
  Memory as CpuIcon,
  Memory as CpuIcon2,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  Memory as MemoryIcon3,
  Memory as MemoryIcon4,
  Memory as MemoryIcon5,
  ModelTraining as ModelTrainingIcon,
  MultilineChart as MultilineChartIcon,
  MultilineChart as MultilineChartIcon2,
  MultilineChart as MultilineChartIcon3,
  MultilineChart as MultilineChartIcon4,
  MultilineChart as MultilineChartIcon5,
  NetworkCheck as NetworkIcon,
  NetworkCheck as NetworkIcon2,
  Notifications as NotificationsIcon,
  Notifications as NotificationsIcon2,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  PauseCircle as PauseCircleIcon2,
  Person as PersonIcon,
  Person as PersonIcon2,
  PersonAdd as PersonAddIcon,
  PersonAdd as PersonAddIcon2,
  PersonAdd as PersonAddIcon3,
  PersonRemove as PersonRemoveIcon,
  PersonRemove as PersonRemoveIcon2,
  PersonRemove as PersonRemoveIcon3,
  PersonSearch as PersonSearchIcon,
  PersonSearch as PersonSearchIcon2,
  PersonSearch as PersonSearchIcon3,
  PieChart as PieChartIcon,
  PieChart as PieChartIcon2,
  PieChart as PieChartIcon3,
  PieChart as PieChartIcon4,
  PieChart as PieChartIcon5,
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayArrow as TriggerIcon2,
  PlayCircle as PlayCircleIcon,
  PlayCircle as PlayCircleIcon2,
  PlaylistAdd as AddStepIcon,
  PlaylistAdd as AddStepIcon2,
  PlaylistPlay as WorkflowIcon,
  PlaylistPlay as WorkflowIcon2,
  Power as PowerIcon,
  Power as PowerIcon2,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PrivacyTip as PrivacyIcon,
  PrivacyTip as PrivacyIcon2,
  Psychology as PsychologyIcon,
  Psychology as PsychologyIcon3,
  Psychology as PsychologyIcon4,
  Psychology as PsychologyIcon5,
  QrCode as QrCodeIcon,
  QrCode as QrCodeIcon2,
  QueryBuilder as QueryBuilderIcon,
  QueryBuilder as QueryBuilderIcon2,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  Remove as RemoveIcon2,
  Report as ReportIcon,
  Report as ReportIcon2,
  RestartAlt as RestartIcon,
  RestartAlt as RestartIcon2,
  Router as RouterIcon,
  Router as RouterIcon2,
  Rule as ConditionIcon,
  Rule as ConditionIcon2,
  Rule as RuleIcon,
  Rule as RuleIcon2,
  Scanner as ScannerIcon,
  Scanner as ScannerIcon2,
  Scanner as ScannerIcon3,
  ScatterPlot as ScatterPlotIcon,
  ScatterPlot as ScatterPlotIcon2,
  ScatterPlot as ScatterPlotIcon3,
  ScatterPlot as ScatterPlotIcon4,
  ScatterPlot as ScatterPlotIcon5,
  Schedule as DelayIcon,
  Schedule as DelayIcon2,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Schedule as ScheduleIcon3,
  Schedule as ScheduleIcon4,
  Science as ScienceIcon,
  Science as ScienceIcon2,
  Science as ScienceIcon3,
  Search as SearchIcon,
  Search as SearchIcon2,
  Security as SecurityIcon,
  Security as SecurityIcon10,
  Security as SecurityIcon2,
  Security as SecurityIcon3,
  Security as SecurityIcon4,
  Security as SecurityIcon5,
  Security as SecurityIcon6,
  Security as SecurityIcon7,
  Security as SecurityIcon8,
  Security as SecurityIcon9,
  Settings as SettingsIcon,
  Settings as SettingsIcon2,
  Shield as ShieldIcon,
  Shield as ShieldIcon2,
  ShowChart as ShowChartIcon,
  ShowChart as ShowChartIcon2,
  ShowChart as ShowChartIcon3,
  ShowChart as ShowChartIcon4,
  ShowChart as ShowChartIcon5,
  ShowChart as ShowChartIcon6,
  ShowChart as ShowChartIcon7,
  Smartphone as SmartphoneIcon,
  Smartphone as SmartphoneIcon2,
  Sms as SmsIcon,
  Sms as SmsIcon2,
  Sort as SortIcon,
  Sort as SortIcon2,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Speed as SpeedIcon3,
  Speed as SpeedIcon4,
  Speed as SpeedIcon5,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  StopCircle as StopCircleIcon2,
  Storage as DataStorageIcon,
  Storage as DataStorageIcon2,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Storage as StorageIcon3,
  Storage as StorageIcon4,
  Storage as StorageIcon5,
  Sync as RealTimeIcon,
  Sync as RealTimeIcon2,
  Sync as SyncIcon,
  Sync as SyncIcon2,
  Sync as SyncIcon3,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  TableChart as TableChartIcon3,
  TableChart as TableChartIcon4,
  TableChart as TableChartIcon5,
  Thermostat as TemperatureIcon,
  Thermostat as TemperatureIcon2,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon2,
  Timeline as TimelineIcon3,
  Timeline as TimelineIcon4,
  Timeline as TimelineIcon5,
  Timeline as TimelineIcon6,
  Timeline as TimelineIcon7,
  Timeline as TimelineIcon8,
  Timeline as TimelineIcon9,
  Timer as TimerIcon,
  Timer as TimerIcon2,
  Today as TodayIcon,
  Today as TodayIcon2,
  Today as TodayIcon3,
  Today as TodayIcon4,
  Today as TodayIcon5,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingDown as TrendingDownIcon3,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingFlat as TrendingFlatIcon3,
  TrendingUp as PredictionIcon,
  TrendingUp as PredictionIcon2,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingUp as TrendingUpIcon4,
  TrendingUp as TrendingUpIcon5,
  Update as UpdateIcon,
  Update as UpdateIcon2,
  Upload as UploadIcon,
  Usb as UsbIcon,
  Usb as UsbIcon2,
  VerifiedUser as VerifiedUserIcon,
  VerifiedUser as VerifiedUserIcon2,
  ViewComfy as ViewComfyIcon,
  ViewComfy as ViewComfyIcon2,
  ViewList as ViewListIcon,
  ViewList as ViewListIcon2,
  ViewModule as ViewModuleIcon,
  ViewModule as ViewModuleIcon2,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  VpnKey as VpnKeyIcon2,
  Warning as WarningIcon,
  Warning as WarningIcon2,
  Webhook as WebhookIcon,
  Webhook as WebhookIcon2,
  Wifi as WifiIcon,
  Wifi as WifiIcon2 } from '@mui/icons-material';
;
interface ScanJob {
  id: string;
  name: string;
  description: string;
  type: 'malware' | 'content' | 'compliance' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  target: {
    type: 'file' | 'folder' | 'all';
    path: string;
    filters: string[];
  };
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    days?: string[];
  };
  results: {
    totalScanned: number;
    threatsFound: number;
    violationsFound: number;
    warningsFound: number;
    cleanFiles: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
}

interface ScanResult {
  id: string;
  jobId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  scanType: string;
  status: 'clean' | 'threat' | 'violation' | 'warning' | 'error';
  threats: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    action: 'quarantine' | 'delete' | 'allow' | 'review';
  }>;
  violations: Array<{
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
  }>;
  metadata: {
    mimeType: string;
    checksum: string;
    scanEngine: string;
    scanVersion: string;
  };
  scannedAt: string;
  scannedBy: string;
}

interface ScanPolicy {
  id: string;
  name: string;
  description: string;
  type: 'malware' | 'content' | 'compliance';
  status: 'active' | 'inactive' | 'draft';
  rules: Array<{
    id: string;
    name: string;
    condition: string;
    action: 'allow' | 'block' | 'quarantine' | 'warn';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  targets: {
    fileTypes: string[];
    paths: string[];
    users: string[];
    tenants: string[];
  };
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const ContentScanningPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanPolicies, setScanPolicies] = useState<ScanPolicy[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScanJob | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setScanJobs([
      {
        id: '1',
        name: 'Daily Malware Scan',
        description: 'Comprehensive malware scan of all uploaded files',
        type: 'malware',
        status: 'running',
        progress: 65,
        target: {
          type: 'all',
          path: '/uploads',
          filters: ['*.exe', '*.dll', '*.bat', '*.cmd']
        },
        schedule: {
          frequency: 'daily',
          time: '02:00'
        },
        results: {
          totalScanned: 1250,
          threatsFound: 3,
          violationsFound: 0,
          warningsFound: 12,
          cleanFiles: 1235
        },
        createdAt: '2024-01-01T00:00:00Z',
        startedAt: '2024-01-15T02:00:00Z',
        createdBy: 'admin@company.com'
      },
      {
        id: '2',
        name: 'Content Compliance Check',
        description: 'Scan for sensitive content and compliance violations',
        type: 'compliance',
        status: 'completed',
        progress: 100,
        target: {
          type: 'folder',
          path: '/documents',
          filters: ['*.pdf', '*.doc', '*.docx', '*.txt']
        },
        schedule: {
          frequency: 'weekly',
          time: '03:00'
        },
        results: {
          totalScanned: 500,
          threatsFound: 0,
          violationsFound: 8,
          warningsFound: 25,
          cleanFiles: 467
        },
        createdAt: '2024-01-01T00:00:00Z',
        startedAt: '2024-01-14T03:00:00Z',
        completedAt: '2024-01-14T03:45:00Z',
        createdBy: 'admin@company.com'
      }
    ]);

    setScanResults([
      {
        id: '1',
        jobId: '1',
        fileName: 'suspicious_file.exe',
        filePath: '/uploads/suspicious_file.exe',
        fileSize: 1024000,
        scanType: 'malware',
        status: 'threat',
        threats: [
          {
            type: 'trojan',
            severity: 'critical',
            description: 'Detected trojan horse malware',
            action: 'quarantine'
          }
        ],
        violations: [],
        metadata: {
          mimeType: 'application/x-executable',
          checksum: 'a1b2c3d4e5f6',
          scanEngine: 'ClamAV',
          scanVersion: '0.103.8'
        },
        scannedAt: '2024-01-15T02:15:00Z',
        scannedBy: 'system'
      },
      {
        id: '2',
        jobId: '2',
        fileName: 'confidential_report.pdf',
        filePath: '/documents/confidential_report.pdf',
        fileSize: 2048576,
        scanType: 'compliance',
        status: 'violation',
        threats: [],
        violations: [
          {
            rule: 'PII_DETECTION',
            severity: 'high',
            description: 'Contains personally identifiable information',
            suggestion: 'Remove or encrypt PII data'
          }
        ],
        metadata: {
          mimeType: 'application/pdf',
          checksum: 'b2c3d4e5f6g7',
          scanEngine: 'Custom NLP',
          scanVersion: '1.2.0'
        },
        scannedAt: '2024-01-14T03:20:00Z',
        scannedBy: 'system'
      }
    ]);

    setScanPolicies([
      {
        id: '1',
        name: 'Malware Detection Policy',
        description: 'Policy for detecting and handling malware threats',
        type: 'malware',
        status: 'active',
        rules: [
          {
            id: '1',
            name: 'Executable File Scan',
            condition: 'file_type == "executable"',
            action: 'quarantine',
            severity: 'high'
          },
          {
            id: '2',
            name: 'Suspicious Behavior',
            condition: 'behavior_score > 0.8',
            action: 'block',
            severity: 'critical'
          }
        ],
        targets: {
          fileTypes: ['exe', 'dll', 'bat', 'cmd', 'scr'],
          paths: ['/uploads', '/temp'],
          users: ['all'],
          tenants: ['all']
        },
        schedule: {
          enabled: true,
          frequency: 'daily',
          time: '02:00'
        },
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      case 'clean': return 'success';
      case 'threat': return 'error';
      case 'violation': return 'warning';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'malware': return <SecurityIcon />;
      case 'content': return <DocumentIcon />;
      case 'compliance': return <GavelIcon />;
      case 'custom': return <SettingsIcon />;
      default: return <ScannerIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredJobs = scanJobs.filter((job: any) => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
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
            Content Scanning
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Malware detection, content analysis, and compliance scanning
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
            New Scan Job
          </Button>
        </Box>
      </Box>

      {/* Content Scanning Metrics Cards */}
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
                <ScannerIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Scans</Typography>
                <Typography variant="h4">{scanJobs.filter((j: any) => j.status === 'running').length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {scanJobs.filter((j: any) => j.status === 'pending').length} pending
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
                <Typography variant="h6">Threats Found</Typography>
                <Typography variant="h4">
                  {scanJobs.reduce((acc, j) => acc + j.results.threatsFound, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This week
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <GavelIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Violations</Typography>
                <Typography variant="h4">
                  {scanJobs.reduce((acc, j) => acc + j.results.violationsFound, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compliance issues
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Clean Files</Typography>
                <Typography variant="h4">
                  {scanJobs.reduce((acc, j) => acc + j.results.cleanFiles, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Scanned successfully
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Scan Jobs" />
          <Tab label="Scan Results" />
          <Tab label="Scan Policies" />
          <Tab label="Threat Intelligence" />
        </Tabs>

        {/* Scan Jobs Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Scan Jobs</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search jobs..."
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
                  <MenuItem value="malware">Malware</MenuItem>
                  <MenuItem value="content">Content</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="running">Running</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Results</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(job.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{job.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {job.progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={job.progress}
                          color={job.status === 'running' ? 'primary' : job.status === 'completed' ? 'success' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.target.type}: {job.target.path}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.results.totalScanned.toLocaleString()} scanned
                      </Typography>
                      <Typography variant="body2" color="error">
                        {job.results.threatsFound} threats
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.schedule.frequency}
                      </Typography>
                      {job.schedule.time && (
                        <Typography variant="body2" color="text.secondary">
                          at {job.schedule.time}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedJob(job)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
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

        {/* Scan Results Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Scan Results</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Scan Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Threats</TableCell>
                  <TableCell>Violations</TableCell>
                  <TableCell>Scanned</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scanResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <DocumentIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{result.fileName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {result.filePath}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(result.fileSize)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.scanType}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={result.status}
                        color={getStatusColor(result.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {result.threats.length > 0 ? (
                        <Box>
                          {result.threats.map((threat, index) => (
                            <Chip
                              key={index}
                              label={threat.type}
                              color={getSeverityColor(threat.severity) as any}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.violations.length > 0 ? (
                        <Box>
                          {result.violations.map((violation, index) => (
                            <Chip
                              key={index}
                              label={violation.rule}
                              color={getSeverityColor(violation.severity) as any}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(result.scannedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
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

        {/* Scan Policies Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Scan Policies</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
            {scanPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{policy.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {policy.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={policy.status}
                      color={getStatusColor(policy.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Type:</Typography>
                      <Typography variant="body2">{policy.type}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Rules:</Typography>
                      <Typography variant="body2">{policy.rules.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Schedule:</Typography>
                      <Typography variant="body2">
                        {policy.schedule.enabled ? `${policy.schedule.frequency} at ${policy.schedule.time}` : 'Disabled'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Rules</Typography>
                  <List dense>
                    {policy.rules.slice(0, 3).map((rule) => (
                      <ListItem key={rule.id}>
                        <ListItemText
                          primary={rule.name}
                          secondary={`${rule.action} - ${rule.severity}`}
                        />
                      </ListItem>
                    ))}
                    {policy.rules.length > 3 && (
                      <ListItem>
                        <ListItemText
                          primary={`+${policy.rules.length - 3} more rules`}
                          color="text.secondary"
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<PlayIcon />}>
                      Test
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Threat Intelligence Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Threat Intelligence</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Threat Categories</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Malware</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>15</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={75}
                          color="error"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Phishing</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>8</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={40}
                          color="warning"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Spam</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>3</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={15}
                          color="info"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recent Threats</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trojan.Win32.Generic"
                        secondary="Detected 2 hours ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phishing.Email.Suspicious"
                        secondary="Detected 4 hours ago"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Spam.Content.Generic"
                        secondary="Detected 6 hours ago"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Threat Intelligence Sources</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">98.5%</Typography>
                  <Typography variant="body2" color="text.secondary">Detection Rate</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">2.3s</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Scan Time</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">99.9%</Typography>
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">24/7</Typography>
                  <Typography variant="body2" color="text.secondary">Monitoring</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onClose={() => setSelectedJob(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Scan Job Details</DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedJob.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedJob.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Job Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedJob.type}</Typography>
                      <Typography variant="body2">Status: {selectedJob.status}</Typography>
                      <Typography variant="body2">Progress: {selectedJob.progress}%</Typography>
                      <Typography variant="body2">Created: {new Date(selectedJob.createdAt).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Target: {selectedJob.target.type}</Typography>
                      <Typography variant="body2">Path: {selectedJob.target.path}</Typography>
                      <Typography variant="body2">Schedule: {selectedJob.schedule.frequency}</Typography>
                      <Typography variant="body2">Created By: {selectedJob.createdBy}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Scan Results</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Total Scanned: {selectedJob.results.totalScanned.toLocaleString()}</Typography>
                    <Typography variant="body2">Clean Files: {selectedJob.results.cleanFiles.toLocaleString()}</Typography>
                    <Typography variant="body2" color="error">Threats Found: {selectedJob.results.threatsFound}</Typography>
                    <Typography variant="body2" color="warning">Violations: {selectedJob.results.violationsFound}</Typography>
                    <Typography variant="body2" color="info">Warnings: {selectedJob.results.warningsFound}</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Target Filters</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedJob.target.filters.map((filter) => (
                      <Chip key={filter} label={filter} color="primary" variant="outlined" size="small" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedJob(null)}>Close</Button>
          <Button variant="contained">Run Job</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentScanningPage;






