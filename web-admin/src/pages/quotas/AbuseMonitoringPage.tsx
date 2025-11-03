import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { AccessTime as AccessTimeIcon,
  AccessTime as AccessTimeIcon2,
  AccountBalance as BillingIcon,
  AccountBalance as BillingIcon2,
  AccountBalanceWallet as WalletIcon,
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
  AllInclusive as AllInclusiveIcon6,
  AllInclusive as AllInclusiveIcon7,
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
  BarChart as BarChartIcon6,
  BarChart as BarChartIcon7,
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
  BubbleChart as BubbleChartIcon6,
  BubbleChart as BubbleChartIcon7,
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
  CalendarToday as CalendarTodayIcon6,
  CalendarToday as CalendarTodayIcon7,
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
  CloudDownload as CloudDownloadIcon4,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  CloudUpload as CloudUploadIcon3,
  CloudUpload as CloudUploadIcon4,
  Code as CodeIcon,
  Code as CodeIcon2,
  Compare as CompareIcon,
  Compare as CompareIcon2,
  ContentCopy as CopyIcon,
  Dashboard as DashboardIcon,
  Dashboard as DashboardIcon2,
  DataObject as DataObjectIcon,
  DataObject as DataObjectIcon2,
  DataObject as DataObjectIcon3,
  DataUsage as DataIcon,
  DataUsage as DataIcon2,
  Dataset as DatasetIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as DateRangeIcon3,
  DateRange as DateRangeIcon4,
  DateRange as DateRangeIcon5,
  DateRange as DateRangeIcon6,
  DateRange as DateRangeIcon7,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisMonthIcon3,
  DateRange as ThisMonthIcon4,
  DateRange as ThisMonthIcon5,
  DateRange as ThisMonthIcon6,
  DateRange as ThisMonthIcon7,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisWeekIcon3,
  DateRange as ThisWeekIcon4,
  DateRange as ThisWeekIcon5,
  DateRange as ThisWeekIcon6,
  DateRange as ThisWeekIcon7,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  DateRange as ThisYearIcon3,
  DateRange as ThisYearIcon4,
  DateRange as ThisYearIcon5,
  DateRange as ThisYearIcon6,
  DateRange as ThisYearIcon7,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DescriptionIcon3,
  Description as DocumentIcon,
  Description as DocumentIcon2,
  DeveloperBoard as BoardIcon,
  DeveloperBoard as BoardIcon2,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
  DonutLarge as DonutLargeIcon3,
  DonutLarge as DonutLargeIcon4,
  DonutLarge as DonutLargeIcon5,
  DonutLarge as DonutLargeIcon6,
  DonutLarge as DonutLargeIcon7,
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
  Functions as FunctionsIcon3,
  Gavel as GavelIcon,
  Gavel as GavelIcon2,
  Group as GroupIcon,
  Group as GroupIcon2,
  Group as PsychologyIcon2,
  Group as PsychologyIcon6,
  Group as PsychologyIcon7,
  GroupAdd as GroupAddIcon,
  GroupAdd as GroupAddIcon2,
  GroupAdd as GroupAddIcon3,
  GroupAdd as GroupAddIcon4,
  GroupRemove as GroupRemoveIcon,
  GroupRemove as GroupRemoveIcon2,
  GroupRemove as GroupRemoveIcon3,
  GroupRemove as GroupRemoveIcon4,
  GroupWork as GroupWorkIcon,
  GroupWork as GroupWorkIcon2,
  GroupWork as GroupWorkIcon3,
  GroupWork as GroupWorkIcon4,
  GroupWork as GroupWorkIcon5,
  GroupWork as GroupWorkIcon6,
  GroupWork as GroupWorkIcon7,
  GroupWork as GroupWorkIcon8,
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
  MultilineChart as MultilineChartIcon6,
  MultilineChart as MultilineChartIcon7,
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
  PersonAdd as PersonAddIcon4,
  PersonRemove as PersonRemoveIcon,
  PersonRemove as PersonRemoveIcon2,
  PersonRemove as PersonRemoveIcon3,
  PersonRemove as PersonRemoveIcon4,
  PersonSearch as PersonSearchIcon,
  PersonSearch as PersonSearchIcon2,
  PersonSearch as PersonSearchIcon3,
  PersonSearch as PersonSearchIcon4,
  PieChart as PieChartIcon,
  PieChart as PieChartIcon2,
  PieChart as PieChartIcon3,
  PieChart as PieChartIcon4,
  PieChart as PieChartIcon5,
  PieChart as PieChartIcon6,
  PieChart as PieChartIcon7,
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
  QueryBuilder as QueryBuilderIcon3,
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
  ScatterPlot as ScatterPlotIcon,
  ScatterPlot as ScatterPlotIcon2,
  ScatterPlot as ScatterPlotIcon3,
  ScatterPlot as ScatterPlotIcon4,
  ScatterPlot as ScatterPlotIcon5,
  ScatterPlot as ScatterPlotIcon6,
  ScatterPlot as ScatterPlotIcon7,
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
  ShowChart as ShowChartIcon8,
  ShowChart as ShowChartIcon9,
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
  Storage as DataStorageIcon3,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Storage as StorageIcon3,
  Storage as StorageIcon4,
  Storage as StorageIcon5,
  Sync as RealTimeIcon,
  Sync as RealTimeIcon2,
  Sync as RealTimeIcon3,
  Sync as SyncIcon,
  Sync as SyncIcon2,
  Sync as SyncIcon3,
  Sync as SyncIcon4,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  TableChart as TableChartIcon3,
  TableChart as TableChartIcon4,
  TableChart as TableChartIcon5,
  TableChart as TableChartIcon6,
  TableChart as TableChartIcon7,
  Thermostat as TemperatureIcon,
  Thermostat as TemperatureIcon2,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon10,
  Timeline as TimelineIcon11,
  Timeline as TimelineIcon12,
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
  Today as TodayIcon6,
  Today as TodayIcon7,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingDown as TrendingDownIcon3,
  TrendingDown as TrendingDownIcon4,
  TrendingDown as TrendingDownIcon5,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingFlat as TrendingFlatIcon3,
  TrendingFlat as TrendingFlatIcon4,
  TrendingFlat as TrendingFlatIcon5,
  TrendingUp as PredictionIcon,
  TrendingUp as PredictionIcon2,
  TrendingUp as PredictionIcon3,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingUp as TrendingUpIcon4,
  TrendingUp as TrendingUpIcon5,
  TrendingUp as TrendingUpIcon6,
  TrendingUp as TrendingUpIcon7,
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
interface AbuseIncident {
  id: string;
  tenantId: string;
  tenantName: string;
  type: 'rate_limit_abuse' | 'quota_circumvention' | 'suspicious_patterns' | 'bot_activity' | 'fraudulent_usage' | 'data_scraping';
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  description: string;
  detectedAt: string;
  status: 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  evidence: Array<{
    type: 'log_entry' | 'metric_anomaly' | 'pattern_match' | 'user_behavior';
    description: string;
    timestamp: string;
    confidence: number;
  }>;
  actions: Array<{
    action: 'warning' | 'throttle' | 'suspend' | 'block' | 'investigate';
    timestamp: string;
    performedBy: string;
    result: string;
  }>;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

interface AbuseRule {
  id: string;
  name: string;
  description: string;
  type: 'rate_limit' | 'pattern_detection' | 'behavioral' | 'geographic' | 'device_fingerprint';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: string;
  }>;
  threshold: number;
  action: 'alert' | 'throttle' | 'suspend' | 'block';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AbuseAnalytics {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  falsePositives: number;
  averageRiskScore: number;
  topAbuseTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  severityDistribution: { [key: string]: number };
  resolutionTime: {
    average: number; // hours
    median: number;
    p95: number;
  };
  preventionRate: number; // percentage of prevented incidents
}

const AbuseMonitoringPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [incidents, setIncidents] = useState<AbuseIncident[]>([]);
  const [rules, setRules] = useState<AbuseRule[]>([]);
  const [analytics, setAnalytics] = useState<AbuseAnalytics | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<AbuseIncident | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setIncidents([
      {
        id: '1',
        tenantId: 'tenant_1',
        tenantName: 'TechCorp Library',
        type: 'rate_limit_abuse',
        severity: 'high',
        riskScore: 85,
        description: 'Excessive API calls detected - 10x normal rate for 2 hours',
        detectedAt: '2024-01-15T08:00:00Z',
        status: 'investigating',
        evidence: [
          {
            type: 'metric_anomaly',
            description: 'API call rate increased from 100/min to 1000/min',
            timestamp: '2024-01-15T08:00:00Z',
            confidence: 95
          },
          {
            type: 'pattern_match',
            description: 'Repetitive request patterns detected',
            timestamp: '2024-01-15T08:05:00Z',
            confidence: 88
          }
        ],
        actions: [
          {
            action: 'throttle',
            timestamp: '2024-01-15T08:10:00Z',
            performedBy: 'system',
            result: 'Rate limited to 50 requests/min'
          },
          {
            action: 'investigate',
            timestamp: '2024-01-15T08:15:00Z',
            performedBy: 'security_team',
            result: 'Incident assigned for investigation'
          }
        ],
        assignedTo: 'security_team'
      },
      {
        id: '2',
        tenantId: 'tenant_2',
        tenantName: 'StartupIO Space',
        type: 'bot_activity',
        severity: 'medium',
        riskScore: 65,
        description: 'Automated bot behavior detected - non-human usage patterns',
        detectedAt: '2024-01-14T15:30:00Z',
        status: 'confirmed',
        evidence: [
          {
            type: 'user_behavior',
            description: 'Consistent timing patterns across requests',
            timestamp: '2024-01-14T15:30:00Z',
            confidence: 92
          },
          {
            type: 'device_fingerprint',
            description: 'Missing browser headers and JavaScript execution',
            timestamp: '2024-01-14T15:32:00Z',
            confidence: 78
          }
        ],
        actions: [
          {
            action: 'warning',
            timestamp: '2024-01-14T15:35:00Z',
            performedBy: 'system',
            result: 'Warning sent to tenant'
          }
        ],
        resolution: 'Confirmed bot activity - CAPTCHA required for future requests',
        resolvedAt: '2024-01-14T16:00:00Z'
      },
      {
        id: '3',
        tenantId: 'tenant_3',
        tenantName: 'Enterprise Corp',
        type: 'data_scraping',
        severity: 'critical',
        riskScore: 95,
        description: 'Large-scale data extraction detected - potential data breach',
        detectedAt: '2024-01-13T10:00:00Z',
        status: 'resolved',
        evidence: [
          {
            type: 'log_entry',
            description: 'Bulk data requests for all user records',
            timestamp: '2024-01-13T10:00:00Z',
            confidence: 98
          },
          {
            type: 'pattern_match',
            description: 'Systematic pagination through all data sets',
            timestamp: '2024-01-13T10:05:00Z',
            confidence: 96
          }
        ],
        actions: [
          {
            action: 'block',
            timestamp: '2024-01-13T10:10:00Z',
            performedBy: 'system',
            result: 'API access blocked immediately'
          },
          {
            action: 'suspend',
            timestamp: '2024-01-13T10:15:00Z',
            performedBy: 'admin',
            result: 'Tenant account suspended pending investigation'
          }
        ],
        resolution: 'Account suspended - data scraping confirmed, legal action initiated',
        resolvedAt: '2024-01-13T14:00:00Z'
      }
    ]);

    setRules([
      {
        id: '1',
        name: 'Rate Limit Abuse Detection',
        description: 'Detects when API rate limits are consistently exceeded',
        type: 'rate_limit',
        conditions: [
          { field: 'requests_per_minute', operator: 'greater_than', value: '100' },
          { field: 'duration_minutes', operator: 'greater_than', value: '10' }
        ],
        threshold: 80,
        action: 'throttle',
        severity: 'high',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-15T08:00:00Z',
        triggerCount: 15
      },
      {
        id: '2',
        name: 'Bot Activity Detection',
        description: 'Identifies automated bot behavior patterns',
        type: 'behavioral',
        conditions: [
          { field: 'request_timing_variance', operator: 'less_than', value: '0.1' },
          { field: 'user_agent_pattern', operator: 'regex', value: 'bot|spider|crawler' }
        ],
        threshold: 70,
        action: 'alert',
        severity: 'medium',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-14T15:30:00Z',
        triggerCount: 8
      },
      {
        id: '3',
        name: 'Data Scraping Prevention',
        description: 'Detects large-scale data extraction attempts',
        type: 'pattern_detection',
        conditions: [
          { field: 'data_volume_mb', operator: 'greater_than', value: '100' },
          { field: 'request_pattern', operator: 'contains', value: 'bulk_export' }
        ],
        threshold: 90,
        action: 'block',
        severity: 'critical',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-13T10:00:00Z',
        triggerCount: 3
      }
    ]);

    setAnalytics({
      totalIncidents: 45,
      activeIncidents: 8,
      resolvedIncidents: 35,
      falsePositives: 2,
      averageRiskScore: 72,
      topAbuseTypes: [
        { type: 'rate_limit_abuse', count: 18, percentage: 40 },
        { type: 'bot_activity', count: 12, percentage: 27 },
        { type: 'data_scraping', count: 8, percentage: 18 },
        { type: 'quota_circumvention', count: 5, percentage: 11 },
        { type: 'suspicious_patterns', count: 2, percentage: 4 }
      ],
      severityDistribution: {
        'low': 15,
        'medium': 20,
        'high': 8,
        'critical': 2
      },
      resolutionTime: {
        average: 4.5,
        median: 3.2,
        p95: 12.8
      },
      preventionRate: 87.5
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'investigating': return 'warning';
      case 'confirmed': return 'error';
      case 'false_positive': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit_abuse': return <SpeedIcon />;
      case 'bot_activity': return <CodeIcon />;
      case 'data_scraping': return <DownloadIcon />;
      case 'quota_circumvention': return <ShieldIcon />;
      case 'suspicious_patterns': return <WarningIcon />;
      case 'fraudulent_usage': return <SecurityIcon />;
      default: return <BugReportIcon />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'warning': return 'info';
      case 'throttle': return 'warning';
      case 'suspend': return 'error';
      case 'block': return 'error';
      case 'investigate': return 'primary';
      default: return 'default';
    }
  };

  const filteredIncidents = incidents.filter((incident: any) => {
    const matchesSearch = incident.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
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
            Abuse Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Abuse detection, risk assessment, and automated response systems
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
            New Rule
          </Button>
        </Box>
      </Box>

      {/* Abuse Monitoring Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Incidents</Typography>
                <Typography variant="h4">{analytics?.activeIncidents || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.totalIncidents || 0} total incidents
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Risk Score</Typography>
                <Typography variant="h4">{analytics?.averageRiskScore || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Out of 100
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
                <Typography variant="h6">Prevention Rate</Typography>
                <Typography variant="h4">{analytics?.preventionRate || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Incidents prevented
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TimerIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Resolution Time</Typography>
                <Typography variant="h4">{analytics?.resolutionTime.average.toFixed(1)}h</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average resolution
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Incidents" />
          <Tab label="Detection Rules" />
          <Tab label="Risk Assessment" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Incidents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Abuse Incidents</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="false_positive">False Positive</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Incident</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Detected</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(incident.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {incident.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {incident.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{incident.tenantName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {incident.tenantId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {incident.type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.severity}
                        color={getSeverityColor(incident.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {incident.riskScore}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={incident.riskScore}
                          color={getSeverityColor(incident.severity) as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={incident.status}
                        color={getStatusColor(incident.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(incident.detectedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedIncident(incident)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <CheckIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Detection Rules Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Detection Rules</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rule Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Triggers</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{rule.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rule.type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.severity}
                        color={getSeverityColor(rule.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.action}
                        color={getActionColor(rule.action) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rule.threshold}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.enabled ? 'Enabled' : 'Disabled'}
                        color={rule.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rule.triggerCount}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Risk Assessment Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Risk Score Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(analytics?.severityDistribution || {}).map(([severity, count]) => (
                      <Box key={severity} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {severity}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={(count / (analytics?.totalIncidents || 1)) * 100}
                            color={getSeverityColor(severity) as any}
                            sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                            {count}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Abuse Types</Typography>
                  <List dense>
                    {analytics?.topAbuseTypes.map((type, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Typography variant="h6" color="primary">
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={type.type.replace('_', ' ')}
                          secondary={`${type.count} incidents • ${type.percentage}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resolution Metrics</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.resolutionTime.average.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Resolution
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.resolutionTime.median.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Median Resolution
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.resolutionTime.p95.toFixed(1)}h
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    95th Percentile
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Abuse Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Incident Trends</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analytics?.activeIncidents || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Incidents
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {analytics?.resolvedIncidents || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resolved
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info">
                        {analytics?.falsePositives || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        False Positives
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Prevention Effectiveness</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <LinearProgress
                        variant="determinate"
                        value={analytics?.preventionRate || 0}
                        color="success"
                        sx={{ width: 200, height: 20, borderRadius: 10 }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'}}
                      >
                        <Typography variant="h6" component="div" color="white">
                          {analytics?.preventionRate || 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                    Prevention Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={!!selectedIncident} onClose={() => setSelectedIncident(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Incident Details</DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedIncident.type.replace('_', ' ').toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedIncident.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Incident Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Tenant: {selectedIncident.tenantName}</Typography>
                    <Typography variant="body2">Severity: {selectedIncident.severity}</Typography>
                    <Typography variant="body2">Risk Score: {selectedIncident.riskScore}/100</Typography>
                    <Typography variant="body2">Status: {selectedIncident.status}</Typography>
                    <Typography variant="body2">Detected: {new Date(selectedIncident.detectedAt).toLocaleString()}</Typography>
                    <Typography variant="body2">Assigned To: {selectedIncident.assignedTo || 'Unassigned'}</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Evidence</Typography>
                  <List dense>
                    {selectedIncident.evidence.map((evidence, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip
                            label={evidence.type.replace('_', ' ')}
                            color="primary"
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={evidence.description}
                          secondary={`Confidence: ${evidence.confidence}% • ${new Date(evidence.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Actions Taken</Typography>
                  <List dense>
                    {selectedIncident.actions.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip
                            label={action.action}
                            color={getActionColor(action.action) as any}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={action.result}
                          secondary={`By: ${action.performedBy} • ${new Date(action.timestamp).toLocaleString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                {selectedIncident.resolution && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Resolution</Typography>
                    <Typography variant="body2">{selectedIncident.resolution}</Typography>
                    {selectedIncident.resolvedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Resolved: {new Date(selectedIncident.resolvedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedIncident(null)}>Close</Button>
          <Button variant="contained">Update Status</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AbuseMonitoringPage;
