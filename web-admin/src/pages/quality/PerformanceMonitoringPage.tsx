import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Divider,
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
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  CardContent
} from '@mui/material';

import { AccessTime as AccessTimeIcon,
  AccessTime as AccessTimeIcon2,
  AccessTime as AccessTimeIcon3,
  AccountBalance as AccountBalanceIcon,
  AccountBalance as BillingIcon,
  AccountBalance as BillingIcon2,
  AccountBalance as BillingIcon3,
  AccountBalanceWallet as WalletIcon,
  AccountTree as FlowIcon,
  AccountTree as FlowIcon2,
  AccountTree as FlowIcon3,
  AccountTree as ParallelIcon,
  AccountTree as ParallelIcon2,
  AccountTree as ParallelIcon3,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AdminPanelSettings as AdminIcon2,
  AdminPanelSettings as AdminIcon3,
  AllInclusive as AllInclusiveIcon,
  AllInclusive as AllInclusiveIcon2,
  AllInclusive as AllInclusiveIcon3,
  AllInclusive as AllInclusiveIcon4,
  AllInclusive as AllInclusiveIcon5,
  AllInclusive as AllInclusiveIcon6,
  AllInclusive as AllInclusiveIcon7,
  AllInclusive as AllInclusiveIcon8,
  AllInclusive as AllInclusiveIcon9,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  Api as ApiIcon2,
  Api as ApiIcon3,
  ArrowForward as ArrowIcon,
  ArrowForward as ArrowIcon2,
  ArrowForward as ArrowIcon3,
  Article as ArticleIcon,
  Article as ArticleIcon2,
  Article as ArticleIcon3,
  Assessment as AssessmentIcon,
  Assessment as AssessmentIcon2,
  Assessment as AssessmentIcon3,
  Assignment as AuditIcon,
  Assignment as AuditIcon2,
  Assignment as AuditIcon3,
  AttachMoney as AttachMoneyIcon,
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesome as AutomationIcon,
  AutoAwesome as AutomationIcon2,
  AutoAwesome as AutomationIcon3,
  Backup as BackupIcon,
  Backup as BackupIcon2,
  Backup as BackupIcon3,
  BarChart as BarChartIcon,
  BarChart as BarChartIcon2,
  BarChart as BarChartIcon3,
  BarChart as BarChartIcon4,
  BarChart as BarChartIcon5,
  BarChart as BarChartIcon6,
  BarChart as BarChartIcon7,
  BarChart as BarChartIcon8,
  BarChart as BarChartIcon9,
  BatteryFull as BatteryIcon,
  BatteryFull as BatteryIcon2,
  BatteryFull as BatteryIcon3,
  Biotech as BiotechIcon,
  Biotech as BiotechIcon2,
  Biotech as BiotechIcon3,
  Bluetooth as BluetoothIcon,
  Bluetooth as BluetoothIcon2,
  Bluetooth as BluetoothIcon3,
  BubbleChart as BubbleChartIcon,
  BubbleChart as BubbleChartIcon2,
  BubbleChart as BubbleChartIcon3,
  BubbleChart as BubbleChartIcon4,
  BubbleChart as BubbleChartIcon5,
  BubbleChart as BubbleChartIcon6,
  BubbleChart as BubbleChartIcon7,
  BubbleChart as BubbleChartIcon8,
  BubbleChart as BubbleChartIcon9,
  BugReport as BugReportIcon,
  BugReport as BugReportIcon2,
  BugReport as BugReportIcon3,
  Build as BuildIcon,
  Build as BuildIcon2,
  Build as BuildIcon3,
  Business as BusinessIcon,
  Business as BusinessIcon2,
  Business as BusinessIcon3,
  CalendarToday as CalendarTodayIcon,
  CalendarToday as CalendarTodayIcon2,
  CalendarToday as CalendarTodayIcon3,
  CalendarToday as CalendarTodayIcon4,
  CalendarToday as CalendarTodayIcon5,
  CalendarToday as CalendarTodayIcon6,
  CalendarToday as CalendarTodayIcon7,
  CalendarToday as CalendarTodayIcon8,
  CalendarToday as CalendarTodayIcon9,
  CameraAlt as CameraIcon,
  CameraAlt as CameraIcon2,
  CameraAlt as CameraIcon3,
  Cancel as CancelIcon,
  Cancel as CancelIcon2,
  CardGiftcard as CardGiftcardIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle as CheckCircleIcon2,
  CheckCircle as CheckIcon,
  CheckCircle as CheckIcon2,
  ChevronRight as ChevronRightIcon,
  ChevronRight as ChevronRightIcon2,
  ChevronRight as ChevronRightIcon3,
  Cloud as CloudIcon,
  Cloud as CloudIcon2,
  Cloud as CloudIcon3,
  Cloud as CloudIcon4,
  CloudDownload as CloudDownloadIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudDownload as CloudDownloadIcon3,
  CloudDownload as CloudDownloadIcon4,
  CloudDownload as CloudDownloadIcon5,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  CloudUpload as CloudUploadIcon3,
  CloudUpload as CloudUploadIcon4,
  CloudUpload as CloudUploadIcon5,
  Code as CodeIcon,
  Code as CodeIcon2,
  Code as CodeIcon3,
  Compare as CompareIcon,
  Compare as CompareIcon2,
  Compare as CompareIcon3,
  ConfirmationNumber as ConfirmationNumberIcon,
  ContentCopy as CopyIcon,
  CreditCard as CreditCardIcon,
  CurrencyBitcoin as CurrencyBitcoinIcon,
  CurrencyPound as CurrencyPoundIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  CurrencyYen as CurrencyYenIcon,
  Dashboard as DashboardIcon,
  Dashboard as DashboardIcon2,
  Dashboard as DashboardIcon3,
  DataObject as DataObjectIcon,
  DataObject as DataObjectIcon2,
  DataObject as DataObjectIcon3,
  DataObject as DataObjectIcon4,
  DataUsage as DataIcon,
  DataUsage as DataIcon2,
  DataUsage as DataIcon3,
  Dataset as DatasetIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as DateRangeIcon3,
  DateRange as DateRangeIcon4,
  DateRange as DateRangeIcon5,
  DateRange as DateRangeIcon6,
  DateRange as DateRangeIcon7,
  DateRange as DateRangeIcon8,
  DateRange as DateRangeIcon9,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisMonthIcon3,
  DateRange as ThisMonthIcon4,
  DateRange as ThisMonthIcon5,
  DateRange as ThisMonthIcon6,
  DateRange as ThisMonthIcon7,
  DateRange as ThisMonthIcon8,
  DateRange as ThisMonthIcon9,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisWeekIcon3,
  DateRange as ThisWeekIcon4,
  DateRange as ThisWeekIcon5,
  DateRange as ThisWeekIcon6,
  DateRange as ThisWeekIcon7,
  DateRange as ThisWeekIcon8,
  DateRange as ThisWeekIcon9,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  DateRange as ThisYearIcon3,
  DateRange as ThisYearIcon4,
  DateRange as ThisYearIcon5,
  DateRange as ThisYearIcon6,
  DateRange as ThisYearIcon7,
  DateRange as ThisYearIcon8,
  DateRange as ThisYearIcon9,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DescriptionIcon3,
  Description as DescriptionIcon4,
  Description as DocumentIcon,
  Description as DocumentIcon2,
  Description as DocumentIcon3,
  DeveloperBoard as BoardIcon,
  DeveloperBoard as BoardIcon2,
  DeveloperBoard as BoardIcon3,
  Discount as DiscountIcon,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
  DonutLarge as DonutLargeIcon3,
  DonutLarge as DonutLargeIcon4,
  DonutLarge as DonutLargeIcon5,
  DonutLarge as DonutLargeIcon6,
  DonutLarge as DonutLargeIcon7,
  DonutLarge as DonutLargeIcon8,
  DonutLarge as DonutLargeIcon9,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Email as EmailIcon2,
  Email as EmailIcon3,
  Error as ErrorIcon,
  Error as ErrorIcon2,
  Error as ErrorIcon3,
  Error as ErrorIcon4,
  Euro as EuroIcon,
  Event as EventIcon,
  Event as EventIcon2,
  Event as EventIcon3,
  ExpandMore as ExpandMoreIcon,
  ExpandMore as ExpandMoreIcon2,
  ExpandMore as ExpandMoreIcon3,
  FileDownload as FileDownloadIcon,
  FileDownload as FileDownloadIcon2,
  FileDownload as FileDownloadIcon3,
  FileUpload as FileUploadIcon,
  FileUpload as FileUploadIcon2,
  FileUpload as FileUploadIcon3,
  FilterList as FilterIcon,
  FilterList as FilterIcon2,
  FilterList as FilterIcon3,
  Fingerprint as FingerprintIcon,
  Fingerprint as FingerprintIcon2,
  Fingerprint as FingerprintIcon3,
  Flag as FlagIcon,
  Flag as FlagIcon2,
  Flag as FlagIcon3,
  Functions as FunctionsIcon,
  Functions as FunctionsIcon2,
  Functions as FunctionsIcon3,
  Functions as FunctionsIcon4,
  Gavel as GavelIcon,
  Gavel as GavelIcon2,
  Gavel as GavelIcon3,
  Group as GroupIcon,
  Group as GroupIcon2,
  Group as GroupIcon3,
  Group as PsychologyIcon2,
  Group as PsychologyIcon6,
  Group as PsychologyIcon7,
  Group as PsychologyIcon9,
  GroupAdd as GroupAddIcon,
  GroupAdd as GroupAddIcon2,
  GroupAdd as GroupAddIcon3,
  GroupAdd as GroupAddIcon4,
  GroupAdd as GroupAddIcon5,
  GroupRemove as GroupRemoveIcon,
  GroupRemove as GroupRemoveIcon2,
  GroupRemove as GroupRemoveIcon3,
  GroupRemove as GroupRemoveIcon4,
  GroupRemove as GroupRemoveIcon5,
  GroupWork as GroupWorkIcon,
  GroupWork as GroupWorkIcon10,
  GroupWork as GroupWorkIcon2,
  GroupWork as GroupWorkIcon3,
  GroupWork as GroupWorkIcon4,
  GroupWork as GroupWorkIcon5,
  GroupWork as GroupWorkIcon6,
  GroupWork as GroupWorkIcon7,
  GroupWork as GroupWorkIcon8,
  GroupWork as GroupWorkIcon9,
  Hardware as HardwareIcon,
  Hardware as HardwareIcon2,
  Hardware as HardwareIcon3,
  History as HistoryIcon,
  History as HistoryIcon2,
  History as HistoryIcon3,
  History as HistoryIcon4,
  History as HistoryIcon5,
  Info as InfoIcon2,
  Info as InfoIcon3,
  Info as InfoIcon4,
  Insights as InsightsIcon,
  Insights as InsightsIcon2,
  Insights as InsightsIcon3,
  Key as KeyIcon,
  Key as KeyIcon2,
  Key as KeyIcon3,
  LocalOffer as LocalOfferIcon,
  LocationOn as LocationIcon,
  LocationOn as LocationIcon2,
  LocationOn as LocationIcon3,
  Lock as LockIcon,
  Lock as LockIcon2,
  Lock as LockIcon3,
  Loop as LoopIcon,
  Loop as LoopIcon2,
  Loop as LoopIcon3,
  Memory as CpuIcon,
  Memory as CpuIcon2,
  Memory as CpuIcon3,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  Memory as MemoryIcon3,
  Memory as MemoryIcon4,
  Memory as MemoryIcon5,
  Memory as MemoryIcon6,
  Memory as MemoryIcon7,
  ModelTraining as ModelTrainingIcon,
  MonetizationOn as MonetizationOnIcon,
  MultilineChart as MultilineChartIcon,
  MultilineChart as MultilineChartIcon2,
  MultilineChart as MultilineChartIcon3,
  MultilineChart as MultilineChartIcon4,
  MultilineChart as MultilineChartIcon5,
  MultilineChart as MultilineChartIcon6,
  MultilineChart as MultilineChartIcon7,
  MultilineChart as MultilineChartIcon8,
  MultilineChart as MultilineChartIcon9,
  NetworkCheck as NetworkIcon,
  NetworkCheck as NetworkIcon2,
  NetworkCheck as NetworkIcon3,
  Notifications as NotificationsIcon,
  Notifications as NotificationsIcon2,
  Notifications as NotificationsIcon3,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  PauseCircle as PauseCircleIcon2,
  PauseCircle as PauseCircleIcon3,
  Payment as PaymentIcon,
  Percent as PercentIcon,
  Person as PersonIcon,
  Person as PersonIcon2,
  Person as PersonIcon3,
  PersonAdd as PersonAddIcon,
  PersonAdd as PersonAddIcon2,
  PersonAdd as PersonAddIcon3,
  PersonAdd as PersonAddIcon4,
  PersonAdd as PersonAddIcon5,
  PersonRemove as PersonRemoveIcon,
  PersonRemove as PersonRemoveIcon2,
  PersonRemove as PersonRemoveIcon3,
  PersonRemove as PersonRemoveIcon4,
  PersonRemove as PersonRemoveIcon5,
  PersonSearch as PersonSearchIcon,
  PersonSearch as PersonSearchIcon2,
  PersonSearch as PersonSearchIcon3,
  PersonSearch as PersonSearchIcon4,
  PersonSearch as PersonSearchIcon5,
  PieChart as PieChartIcon,
  PieChart as PieChartIcon2,
  PieChart as PieChartIcon3,
  PieChart as PieChartIcon4,
  PieChart as PieChartIcon5,
  PieChart as PieChartIcon6,
  PieChart as PieChartIcon7,
  PieChart as PieChartIcon8,
  PieChart as PieChartIcon9,
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayArrow as TriggerIcon2,
  PlayArrow as TriggerIcon3,
  PlayCircle as PlayCircleIcon,
  PlayCircle as PlayCircleIcon2,
  PlayCircle as PlayCircleIcon3,
  PlaylistAdd as AddStepIcon,
  PlaylistAdd as AddStepIcon2,
  PlaylistAdd as AddStepIcon3,
  PlaylistPlay as WorkflowIcon,
  PlaylistPlay as WorkflowIcon2,
  PlaylistPlay as WorkflowIcon3,
  Power as PowerIcon,
  Power as PowerIcon2,
  Power as PowerIcon3,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PrivacyTip as PrivacyIcon,
  PrivacyTip as PrivacyIcon2,
  PrivacyTip as PrivacyIcon3,
  Psychology as PsychologyIcon,
  Psychology as PsychologyIcon3,
  Psychology as PsychologyIcon4,
  Psychology as PsychologyIcon5,
  Psychology as PsychologyIcon8,
  QrCode as QrCodeIcon,
  QrCode as QrCodeIcon2,
  QrCode as QrCodeIcon3,
  QrCode2 as QrCode2Icon,
  QrCodeScanner as QrCodeScannerIcon,
  QrCodeScanner2 as QrCodeScanner2Icon,
  QueryBuilder as QueryBuilderIcon,
  QueryBuilder as QueryBuilderIcon2,
  QueryBuilder as QueryBuilderIcon3,
  QueryBuilder as QueryBuilderIcon4,
  Receipt as ReceiptIcon,
  Redeem as RedeemIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  Remove as RemoveIcon2,
  Remove as RemoveIcon3,
  Report as ReportIcon,
  Report as ReportIcon2,
  Report as ReportIcon3,
  RestartAlt as RestartIcon,
  RestartAlt as RestartIcon2,
  RestartAlt as RestartIcon3,
  Router as RouterIcon,
  Router as RouterIcon2,
  Router as RouterIcon3,
  Rule as ConditionIcon,
  Rule as ConditionIcon2,
  Rule as ConditionIcon3,
  Rule as RuleIcon,
  Rule as RuleIcon2,
  Rule as RuleIcon3,
  Scanner as ScannerIcon,
  Scanner as ScannerIcon2,
  Scanner as ScannerIcon3,
  ScatterPlot as ScatterPlotIcon,
  ScatterPlot as ScatterPlotIcon2,
  ScatterPlot as ScatterPlotIcon3,
  ScatterPlot as ScatterPlotIcon4,
  ScatterPlot as ScatterPlotIcon5,
  ScatterPlot as ScatterPlotIcon6,
  ScatterPlot as ScatterPlotIcon7,
  ScatterPlot as ScatterPlotIcon8,
  ScatterPlot as ScatterPlotIcon9,
  Schedule as DelayIcon,
  Schedule as DelayIcon2,
  Schedule as DelayIcon3,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Schedule as ScheduleIcon3,
  Schedule as ScheduleIcon4,
  Schedule as ScheduleIcon5,
  Schedule as ScheduleIcon6,
  Science as ScienceIcon,
  Science as ScienceIcon2,
  Science as ScienceIcon3,
  Science as ScienceIcon4,
  Search as SearchIcon,
  Search as SearchIcon2,
  Search as SearchIcon3,
  Security as SecurityIcon10,
  Security as SecurityIcon11,
  Security as SecurityIcon12,
  Security as SecurityIcon13,
  Security as SecurityIcon14,
  Security as SecurityIcon15,
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
  Settings as SettingsIcon3,
  Shield as ShieldIcon,
  Shield as ShieldIcon2,
  Shield as ShieldIcon3,
  ShowChart as ShowChartIcon,
  ShowChart as ShowChartIcon10,
  ShowChart as ShowChartIcon11,
  ShowChart as ShowChartIcon12,
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
  Smartphone as SmartphoneIcon3,
  Sms as SmsIcon,
  Sms as SmsIcon2,
  Sms as SmsIcon3,
  Sort as SortIcon,
  Sort as SortIcon2,
  Sort as SortIcon3,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Speed as SpeedIcon3,
  Speed as SpeedIcon4,
  Speed as SpeedIcon5,
  Speed as SpeedIcon6,
  Speed as SpeedIcon7,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  StopCircle as StopCircleIcon2,
  StopCircle as StopCircleIcon3,
  Storage as DataStorageIcon,
  Storage as DataStorageIcon2,
  Storage as DataStorageIcon3,
  Storage as DataStorageIcon4,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Storage as StorageIcon3,
  Storage as StorageIcon4,
  Storage as StorageIcon5,
  Storage as StorageIcon6,
  Storage as StorageIcon7,
  Success as SuccessIcon,
  Sync as RealTimeIcon,
  Sync as RealTimeIcon2,
  Sync as RealTimeIcon3,
  Sync as RealTimeIcon4,
  Sync as SyncIcon,
  Sync as SyncIcon2,
  Sync as SyncIcon3,
  Sync as SyncIcon4,
  Sync as SyncIcon5,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  TableChart as TableChartIcon3,
  TableChart as TableChartIcon4,
  TableChart as TableChartIcon5,
  TableChart as TableChartIcon6,
  TableChart as TableChartIcon7,
  TableChart as TableChartIcon8,
  TableChart as TableChartIcon9,
  Thermostat as TemperatureIcon,
  Thermostat as TemperatureIcon2,
  Thermostat as TemperatureIcon3,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon10,
  Timeline as TimelineIcon11,
  Timeline as TimelineIcon12,
  Timeline as TimelineIcon13,
  Timeline as TimelineIcon14,
  Timeline as TimelineIcon15,
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
  Timer as TimerIcon3,
  Today as TodayIcon,
  Today as TodayIcon2,
  Today as TodayIcon3,
  Today as TodayIcon4,
  Today as TodayIcon5,
  Today as TodayIcon6,
  Today as TodayIcon7,
  Today as TodayIcon8,
  Today as TodayIcon9,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingDown as TrendingDownIcon3,
  TrendingDown as TrendingDownIcon4,
  TrendingDown as TrendingDownIcon5,
  TrendingDown as TrendingDownIcon6,
  TrendingDown as TrendingDownIcon7,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingFlat as TrendingFlatIcon3,
  TrendingFlat as TrendingFlatIcon4,
  TrendingFlat as TrendingFlatIcon5,
  TrendingUp as PredictionIcon,
  TrendingUp as PredictionIcon2,
  TrendingUp as PredictionIcon3,
  TrendingUp as PredictionIcon4,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingUp as TrendingUpIcon4,
  TrendingUp as TrendingUpIcon5,
  TrendingUp as TrendingUpIcon6,
  TrendingUp as TrendingUpIcon7,
  TrendingUp as TrendingUpIcon8,
  TrendingUp as TrendingUpIcon9,
  Update as UpdateIcon,
  Update as UpdateIcon2,
  Update as UpdateIcon3,
  Upgrade as UpgradeIcon,
  Upload as UploadIcon,
  Usb as UsbIcon,
  Usb as UsbIcon2,
  Usb as UsbIcon3,
  VerifiedUser as VerifiedUserIcon,
  VerifiedUser as VerifiedUserIcon2,
  VerifiedUser as VerifiedUserIcon3,
  ViewComfy as ViewComfyIcon,
  ViewComfy as ViewComfyIcon2,
  ViewComfy as ViewComfyIcon3,
  ViewList as ViewListIcon,
  ViewList as ViewListIcon2,
  ViewList as ViewListIcon3,
  ViewModule as ViewModuleIcon,
  ViewModule as ViewModuleIcon2,
  ViewModule as ViewModuleIcon3,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  VpnKey as VpnKeyIcon2,
  VpnKey as VpnKeyIcon3,
  Warning as WarningIcon,
  Warning as WarningIcon2,
  Warning as WarningIcon3,
  Warning as WarningIcon4,
  Webhook as WebhookIcon,
  Webhook as WebhookIcon2,
  Webhook as WebhookIcon3,
  Wifi as WifiIcon,
  Wifi as WifiIcon2,
  Wifi as WifiIcon3 } from '@mui/icons-material';
;
interface PerformanceMetric {
  id: string;
  name: string;
  service: string;
  metric: 'response_time' | 'throughput' | 'error_rate' | 'availability' | 'cpu_usage' | 'memory_usage' | 'disk_usage';
  value: number;
  unit: 'ms' | 'rps' | '%' | 'bytes' | 'count';
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'ok' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  description: string;
}

interface SLO {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number; // percentage
  window: '1m' | '5m' | '15m' | '1h' | '24h' | '7d' | '30d';
  current: number; // current percentage
  status: 'meeting' | 'at_risk' | 'breach';
  errorBudget: {
    remaining: number;
    consumed: number;
    total: number;
  };
  alerts: Array<{
    type: 'warning' | 'critical';
    threshold: number;
    enabled: boolean;
  }>;
  createdAt: string;
  lastBreach?: string;
}

interface SecurityScan {
  id: string;
  name: string;
  type: 'vulnerability' | 'dependency' | 'code_quality' | 'compliance' | 'penetration';
  status: 'pending' | 'running' | 'completed' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: number;
  vulnerabilities: number;
  startedAt: string;
  completedAt?: string;
  duration?: number; // minutes
  reportUrl?: string;
  nextScan?: string;
}

interface TestSuite {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passing' | 'failing' | 'running' | 'pending';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number; // percentage
  duration: number; // seconds
  lastRun: string;
  nextRun?: string;
  branch: string;
  commit: string;
}

interface PerformanceAnalytics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  sloCompliance: number;
  activeAlerts: number;
  criticalIssues: number;
  performanceTrend: 'improving' | 'stable' | 'degrading';
  topSlowEndpoints: Array<{
    endpoint: string;
    avgTime: number;
    calls: number;
  }>;
  resourceUtilization: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}

const PerformanceMonitoringPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [slos, setSlos] = useState<SLO[]>([]);
  const [securityScans, setSecurityScans] = useState<SecurityScan[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setMetrics([
      {
        id: '1',
        name: 'API Response Time',
        service: 'api-gateway',
        metric: 'response_time',
        value: 285,
        unit: 'ms',
        threshold: { warning: 500, critical: 1000 },
        status: 'ok',
        trend: 'stable',
        lastUpdated: '2024-01-15T10:00:00Z',
        description: 'Average response time for API requests'
      },
      {
        id: '2',
        name: 'Database Query Time',
        service: 'database',
        metric: 'response_time',
        value: 120,
        unit: 'ms',
        threshold: { warning: 200, critical: 500 },
        status: 'ok',
        trend: 'down',
        lastUpdated: '2024-01-15T10:00:00Z',
        description: 'Average database query execution time'
      },
      {
        id: '3',
        name: 'Error Rate',
        service: 'api-gateway',
        metric: 'error_rate',
        value: 0.8,
        unit: '%',
        threshold: { warning: 2, critical: 5 },
        status: 'ok',
        trend: 'stable',
        lastUpdated: '2024-01-15T10:00:00Z',
        description: 'Percentage of failed requests'
      },
      {
        id: '4',
        name: 'CPU Usage',
        service: 'api-gateway',
        metric: 'cpu_usage',
        value: 75,
        unit: '%',
        threshold: { warning: 80, critical: 95 },
        status: 'warning',
        trend: 'up',
        lastUpdated: '2024-01-15T10:00:00Z',
        description: 'CPU utilization percentage'
      },
      {
        id: '5',
        name: 'Memory Usage',
        service: 'api-gateway',
        metric: 'memory_usage',
        value: 60,
        unit: '%',
        threshold: { warning: 85, critical: 95 },
        status: 'ok',
        trend: 'stable',
        lastUpdated: '2024-01-15T10:00:00Z',
        description: 'Memory utilization percentage'
      }
    ]);

    setSlos([
      {
        id: '1',
        name: 'API Availability',
        description: 'API service availability target',
        service: 'api-gateway',
        metric: 'availability',
        target: 99.9,
        window: '24h',
        current: 99.95,
        status: 'meeting',
        errorBudget: {
          remaining: 0.05,
          consumed: 0.0,
          total: 0.1
        },
        alerts: [
          { type: 'warning', threshold: 99.5, enabled: true },
          { type: 'critical', threshold: 99.0, enabled: true }
        ],
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Response Time',
        description: 'API response time target',
        service: 'api-gateway',
        metric: 'response_time',
        target: 95,
        window: '1h',
        current: 98,
        status: 'meeting',
        errorBudget: {
          remaining: 3,
          consumed: 2,
          total: 5
        },
        alerts: [
          { type: 'warning', threshold: 90, enabled: true },
          { type: 'critical', threshold: 85, enabled: true }
        ],
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Error Rate',
        description: 'Error rate target',
        service: 'api-gateway',
        metric: 'error_rate',
        target: 99,
        window: '1h',
        current: 95,
        status: 'at_risk',
        errorBudget: {
          remaining: 1,
          consumed: 4,
          total: 5
        },
        alerts: [
          { type: 'warning', threshold: 98, enabled: true },
          { type: 'critical', threshold: 95, enabled: true }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        lastBreach: '2024-01-14T15:30:00Z'
      }
    ]);

    setSecurityScans([
      {
        id: '1',
        name: 'Vulnerability Scan',
        type: 'vulnerability',
        status: 'completed',
        severity: 'medium',
        findings: 12,
        vulnerabilities: 3,
        startedAt: '2024-01-15T08:00:00Z',
        completedAt: '2024-01-15T08:45:00Z',
        duration: 45,
        reportUrl: 'https://reports.studyspot.com/security/scan-001',
        nextScan: '2024-01-22T08:00:00Z'
      },
      {
        id: '2',
        name: 'Dependency Check',
        type: 'dependency',
        status: 'completed',
        severity: 'low',
        findings: 5,
        vulnerabilities: 1,
        startedAt: '2024-01-15T09:00:00Z',
        completedAt: '2024-01-15T09:15:00Z',
        duration: 15,
        reportUrl: 'https://reports.studyspot.com/security/deps-001',
        nextScan: '2024-01-16T09:00:00Z'
      },
      {
        id: '3',
        name: 'Code Quality Scan',
        type: 'code_quality',
        status: 'running',
        severity: 'low',
        findings: 0,
        vulnerabilities: 0,
        startedAt: '2024-01-15T10:00:00Z'
      }
    ]);

    setTestSuites([
      {
        id: '1',
        name: 'Unit Tests',
        type: 'unit',
        status: 'passing',
        totalTests: 1250,
        passedTests: 1245,
        failedTests: 5,
        skippedTests: 0,
        coverage: 85,
        duration: 120,
        lastRun: '2024-01-15T09:30:00Z',
        nextRun: '2024-01-15T10:30:00Z',
        branch: 'main',
        commit: 'abc123'
      },
      {
        id: '2',
        name: 'Integration Tests',
        type: 'integration',
        status: 'passing',
        totalTests: 450,
        passedTests: 448,
        failedTests: 2,
        skippedTests: 0,
        coverage: 72,
        duration: 300,
        lastRun: '2024-01-15T09:00:00Z',
        nextRun: '2024-01-15T11:00:00Z',
        branch: 'main',
        commit: 'abc123'
      },
      {
        id: '3',
        name: 'E2E Tests',
        type: 'e2e',
        status: 'failing',
        totalTests: 150,
        passedTests: 140,
        failedTests: 10,
        skippedTests: 0,
        coverage: 60,
        duration: 600,
        lastRun: '2024-01-15T08:00:00Z',
        nextRun: '2024-01-15T12:00:00Z',
        branch: 'main',
        commit: 'abc123'
      }
    ]);

    setAnalytics({
      averageResponseTime: 285,
      p95ResponseTime: 450,
      p99ResponseTime: 800,
      throughput: 1250,
      errorRate: 0.8,
      availability: 99.95,
      sloCompliance: 95,
      activeAlerts: 3,
      criticalIssues: 1,
      performanceTrend: 'stable',
      topSlowEndpoints: [
        { endpoint: '/api/v2/libraries/search', avgTime: 1200, calls: 150 },
        { endpoint: '/api/v2/bookings/bulk', avgTime: 800, calls: 75 },
        { endpoint: '/api/v2/users/export', avgTime: 600, calls: 25 }
      ],
      resourceUtilization: {
        cpu: 75,
        memory: 60,
        disk: 45,
        network: 30
      }
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'meeting': return 'success';
      case 'at_risk': return 'warning';
      case 'breach': return 'error';
      case 'passing': return 'success';
      case 'failing': return 'error';
      case 'running': return 'info';
      case 'pending': return 'default';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="error" />;
      case 'down': return <TrendingDownIcon color="success" />;
      case 'stable': return <TrendingFlatIcon color="info" />;
      default: return <TrendingFlatIcon />;
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

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') return `${value}ms`;
    if (unit === 'rps') return `${value} rps`;
    if (unit === '%') return `${value}%`;
    if (unit === 'bytes') return `${(value / 1024 / 1024).toFixed(2)} MB`;
    if (unit === 'count') return value.toLocaleString();
    return value.toString();
  };

  const filteredMetrics = metrics.filter((metric: any) => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || metric.service === filterService;
    const matchesStatus = filterStatus === 'all' || metric.status === filterStatus;
    return matchesSearch && matchesService && matchesStatus;
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
            Performance Monitoring
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Performance metrics, SLOs, security scans, and quality assurance
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
            New SLO
          </Button>
        </Box>
      </Box>

      {/* Performance Metrics Cards */}
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
                <SpeedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Response Time</Typography>
                <Typography variant="h4">{analytics?.averageResponseTime || 0}ms</Typography>
                <Typography variant="body2" color="text.secondary">
                  P95: {analytics?.p95ResponseTime || 0}ms
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
                <Typography variant="h6">Availability</Typography>
                <Typography variant="h4">{analytics?.availability || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  SLO Compliance: {analytics?.sloCompliance || 0}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Throughput</Typography>
                <Typography variant="h4">{(analytics?.throughput || 0).toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Requests per second
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Error Rate</Typography>
                <Typography variant="h4">{analytics?.errorRate || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.activeAlerts || 0} active alerts
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Performance Metrics" />
          <Tab label="Service Level Objectives" />
          <Tab label="Security Scans" />
          <Tab label="Test Suites" />
        </Tabs>

        {/* Performance Metrics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Service</InputLabel>
                <Select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                >
                  <MenuItem value="all">All Services</MenuItem>
                  <MenuItem value="api-gateway">API Gateway</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="auth-service">Auth Service</MenuItem>
                  <MenuItem value="booking-service">Booking Service</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="ok">OK</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMetrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{metric.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metric.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{metric.service}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatValue(metric.value, metric.unit)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        W: {formatValue(metric.threshold.warning, metric.unit)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        C: {formatValue(metric.threshold.critical, metric.unit)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={metric.status}
                        color={getStatusColor(metric.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {getTrendIcon(metric.trend)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(metric.lastUpdated).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedMetric(metric)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
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

        {/* Service Level Objectives Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Service Level Objectives</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SLO</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error Budget</TableCell>
                  <TableCell>Window</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {slos.map((slo) => (
                  <TableRow key={slo.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{slo.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {slo.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{slo.service}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{slo.target}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{slo.current}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={slo.status}
                        color={getStatusColor(slo.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {slo.errorBudget.remaining}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(slo.errorBudget.consumed / slo.errorBudget.total) * 100}
                          color={slo.status === 'breach' ? 'error' : 'primary'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{slo.window}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
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

        {/* Security Scans Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Security Scans</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scan</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Findings</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {securityScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{scan.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {scan.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {scan.type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={scan.status}
                        color={getStatusColor(scan.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={scan.severity}
                        color={getSeverityColor(scan.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {scan.findings} findings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {scan.vulnerabilities} vulnerabilities
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {scan.duration ? `${scan.duration} min` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(scan.startedAt).toLocaleString()}
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
                          <PlayIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Test Suites Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Test Suites</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Test Suite</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tests</TableCell>
                  <TableCell>Coverage</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testSuites.map((suite) => (
                  <TableRow key={suite.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{suite.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {suite.branch} • {suite.commit}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {suite.type.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={suite.status}
                        color={getStatusColor(suite.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {suite.passedTests}/{suite.totalTests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suite.failedTests} failed
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {suite.coverage}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={suite.coverage}
                          color="primary"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {suite.duration}s
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(suite.lastRun).toLocaleString()}
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
      </Card>

      {/* Metric Details Dialog */}
      <Dialog open={!!selectedMetric} onClose={() => setSelectedMetric(null)} maxWidth="md" fullWidth>
        <DialogTitle>Metric Details</DialogTitle>
        <DialogContent>
          {selectedMetric && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedMetric.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedMetric.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Current Value</Typography>
                  <Typography variant="h4" color="primary">
                    {formatValue(selectedMetric.value, selectedMetric.unit)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Thresholds</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Warning: {formatValue(selectedMetric.threshold.warning, selectedMetric.unit)}</Typography>
                      <Typography variant="body2">Critical: {formatValue(selectedMetric.threshold.critical, selectedMetric.unit)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Service: {selectedMetric.service}</Typography>
                      <Typography variant="body2">Metric: {selectedMetric.metric}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Status & Trend</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                      label={selectedMetric.status}
                      color={getStatusColor(selectedMetric.status) as any}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">Trend:</Typography>
                      {getTrendIcon(selectedMetric.trend)}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Last Updated</Typography>
                  <Typography variant="body2">
                    {new Date(selectedMetric.lastUpdated).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMetric(null)}>Close</Button>
          <Button variant="contained">View History</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformanceMonitoringPage;
