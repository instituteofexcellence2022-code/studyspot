import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import {
  CardContent,
  Box,
  Typography,
  Card,
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
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
  Security as SecurityIcon,
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
  target: string;
  scanner: string;
  compliance: number; // percentage
}

interface Vulnerability {
  id: string;
  scanId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cve?: string;
  cvss?: number;
  component: string;
  version: string;
  fixedVersion?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  assignedTo?: string;
  dueDate?: string;
  remediation?: string;
  references: string[];
  discoveredAt: string;
  lastUpdated: string;
}

interface SecurityAnalytics {
  totalScans: number;
  completedScans: number;
  runningScans: number;
  failedScans: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  averageCompliance: number;
  topVulnerableComponents: Array<{
    component: string;
    vulnerabilityCount: number;
    severity: string;
  }>;
  scanTrends: Array<{
    date: string;
    scans: number;
    vulnerabilities: number;
  }>;
}

const SecurityScanningPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [scans, setScans] = useState<SecurityScan[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [analytics, setAnalytics] = useState<SecurityAnalytics | null>(null);
  const [selectedScan, setSelectedScan] = useState<SecurityScan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setScans([
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
        nextScan: '2024-01-22T08:00:00Z',
        target: 'api-gateway',
        scanner: 'OWASP ZAP',
        compliance: 85
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
        nextScan: '2024-01-16T09:00:00Z',
        target: 'web-admin',
        scanner: 'Snyk',
        compliance: 95
      },
      {
        id: '3',
        name: 'Code Quality Scan',
        type: 'code_quality',
        status: 'running',
        severity: 'low',
        findings: 0,
        vulnerabilities: 0,
        startedAt: '2024-01-15T10:00:00Z',
        target: 'mobile-app',
        scanner: 'SonarQube',
        compliance: 0
      },
      {
        id: '4',
        name: 'Compliance Scan',
        type: 'compliance',
        status: 'completed',
        severity: 'high',
        findings: 8,
        vulnerabilities: 2,
        startedAt: '2024-01-14T14:00:00Z',
        completedAt: '2024-01-14T15:30:00Z',
        duration: 90,
        reportUrl: 'https://reports.studyspot.com/security/compliance-001',
        nextScan: '2024-01-21T14:00:00Z',
        target: 'platform',
        scanner: 'Nessus',
        compliance: 78
      },
      {
        id: '5',
        name: 'Penetration Test',
        type: 'penetration',
        status: 'completed',
        severity: 'critical',
        findings: 15,
        vulnerabilities: 5,
        startedAt: '2024-01-13T10:00:00Z',
        completedAt: '2024-01-13T16:00:00Z',
        duration: 360,
        reportUrl: 'https://reports.studyspot.com/security/pen-test-001',
        nextScan: '2024-02-13T10:00:00Z',
        target: 'platform',
        scanner: 'Burp Suite',
        compliance: 70
      }
    ]);

    setVulnerabilities([
      {
        id: '1',
        scanId: '1',
        title: 'SQL Injection in User Authentication',
        description: 'The application is vulnerable to SQL injection attacks in the user authentication endpoint.',
        severity: 'critical',
        cve: 'CVE-2024-1234',
        cvss: 9.8,
        component: 'api-gateway',
        version: '1.2.3',
        fixedVersion: '1.2.4',
        status: 'open',
        assignedTo: 'security-team',
        dueDate: '2024-01-22T00:00:00Z',
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-1234'],
        discoveredAt: '2024-01-15T08:30:00Z',
        lastUpdated: '2024-01-15T08:30:00Z'
      },
      {
        id: '2',
        scanId: '1',
        title: 'Cross-Site Scripting (XSS)',
        description: 'Reflected XSS vulnerability in the search functionality.',
        severity: 'high',
        cve: 'CVE-2024-1235',
        cvss: 7.2,
        component: 'web-admin',
        version: '2.1.0',
        fixedVersion: '2.1.1',
        status: 'in_progress',
        assignedTo: 'dev-team',
        dueDate: '2024-01-25T00:00:00Z',
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-1235'],
        discoveredAt: '2024-01-15T08:35:00Z',
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        scanId: '2',
        title: 'Outdated Dependency: lodash',
        description: 'The lodash library version 4.17.15 has known security vulnerabilities.',
        severity: 'medium',
        component: 'web-admin',
        version: '4.17.15',
        fixedVersion: '4.17.21',
        status: 'resolved',
        assignedTo: 'dev-team',
        remediation: 'Updated lodash to version 4.17.21',
        references: ['https://snyk.io/vuln/npm:lodash'],
        discoveredAt: '2024-01-15T09:10:00Z',
        lastUpdated: '2024-01-15T11:00:00Z'
      },
      {
        id: '4',
        scanId: '4',
        title: 'Missing Security Headers',
        description: 'The application is missing important security headers like X-Frame-Options and X-Content-Type-Options.',
        severity: 'medium',
        component: 'api-gateway',
        version: '1.2.3',
        status: 'open',
        assignedTo: 'security-team',
        dueDate: '2024-01-28T00:00:00Z',
        references: ['https://owasp.org/www-project-secure-headers/'],
        discoveredAt: '2024-01-14T14:30:00Z',
        lastUpdated: '2024-01-14T14:30:00Z'
      },
      {
        id: '5',
        scanId: '5',
        title: 'Weak Password Policy',
        description: 'The application allows weak passwords that do not meet security requirements.',
        severity: 'high',
        component: 'auth-service',
        version: '2.0.1',
        status: 'in_progress',
        assignedTo: 'security-team',
        dueDate: '2024-01-30T00:00:00Z',
        references: ['https://owasp.org/www-project-authentication-cheat-sheet/'],
        discoveredAt: '2024-01-13T12:00:00Z',
        lastUpdated: '2024-01-15T09:00:00Z'
      }
    ]);

    setAnalytics({
      totalScans: 25,
      completedScans: 20,
      runningScans: 2,
      failedScans: 3,
      totalVulnerabilities: 45,
      criticalVulnerabilities: 3,
      highVulnerabilities: 8,
      mediumVulnerabilities: 20,
      lowVulnerabilities: 14,
      averageCompliance: 82,
      topVulnerableComponents: [
        { component: 'api-gateway', vulnerabilityCount: 12, severity: 'high' },
        { component: 'web-admin', vulnerabilityCount: 8, severity: 'medium' },
        { component: 'auth-service', vulnerabilityCount: 6, severity: 'high' },
        { component: 'database', vulnerabilityCount: 4, severity: 'medium' }
      ],
      scanTrends: [
        { date: '2024-01-08', scans: 3, vulnerabilities: 8 },
        { date: '2024-01-09', scans: 2, vulnerabilities: 5 },
        { date: '2024-01-10', scans: 4, vulnerabilities: 12 },
        { date: '2024-01-11', scans: 3, vulnerabilities: 7 },
        { date: '2024-01-12', scans: 2, vulnerabilities: 4 },
        { date: '2024-01-13', scans: 5, vulnerabilities: 15 },
        { date: '2024-01-14', scans: 3, vulnerabilities: 9 },
        { date: '2024-01-15', scans: 4, vulnerabilities: 11 }
      ]
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'false_positive': return 'info';
      default: return 'default';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vulnerability': return <BugReportIcon />;
      case 'dependency': return <CodeIcon />;
      case 'code_quality': return <AssessmentIcon />;
      case 'compliance': return <VerifiedUserIcon />;
      case 'penetration': return <SecurityIcon />;
      default: return <ScannerIcon />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredScans = scans.filter((scan: any) => {
    const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || scan.type === filterType;
    const matchesStatus = filterStatus === 'all' || scan.status === filterStatus;
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
            Security Scanning
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vulnerability scanning, dependency checks, and security compliance
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
            New Scan
          </Button>
        </Box>
      </Box>

      {/* Security Metrics Cards */}
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
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Completed Scans</Typography>
                <Typography variant="h4">{analytics?.completedScans || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.totalScans || 0} total scans
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
                <Typography variant="h6">Vulnerabilities</Typography>
                <Typography variant="h4">{analytics?.totalVulnerabilities || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.criticalVulnerabilities || 0} critical
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Compliance</Typography>
                <Typography variant="h4">{analytics?.averageCompliance || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average compliance
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <PlayIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Running Scans</Typography>
                <Typography variant="h4">{analytics?.runningScans || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active scans
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Security Scans" />
          <Tab label="Vulnerabilities" />
          <Tab label="Compliance" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Security Scans Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Security Scans</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search scans..."
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
                  <MenuItem value="vulnerability">Vulnerability</MenuItem>
                  <MenuItem value="dependency">Dependency</MenuItem>
                  <MenuItem value="code_quality">Code Quality</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                  <MenuItem value="penetration">Penetration</MenuItem>
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
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scan</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Findings</TableCell>
                  <TableCell>Compliance</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(scan.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{scan.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {scan.scanner}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {scan.type.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{scan.target}</Typography>
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {scan.compliance}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={scan.compliance}
                          color={scan.compliance >= 90 ? 'success' : scan.compliance >= 70 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {scan.duration ? formatDuration(scan.duration) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(scan.startedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedScan(scan)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
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

        {/* Vulnerabilities Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Vulnerabilities</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vulnerability</TableCell>
                  <TableCell>Component</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>CVSS</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vulnerabilities.map((vuln) => (
                  <TableRow key={vuln.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{vuln.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vuln.description}
                        </Typography>
                        {vuln.cve && (
                          <Typography variant="body2" color="primary">
                            {vuln.cve}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vuln.component}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        v{vuln.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vuln.severity}
                        color={getSeverityColor(vuln.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vuln.status}
                        color={getStatusColor(vuln.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vuln.cvss ? vuln.cvss.toFixed(1) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vuln.assignedTo || 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vuln.dueDate ? new Date(vuln.dueDate).toLocaleDateString() : 'N/A'}
                      </Typography>
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

        {/* Compliance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Security Compliance</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vulnerability Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Critical</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={(analytics?.criticalVulnerabilities || 0) / (analytics?.totalVulnerabilities || 1) * 100}
                          color="error"
                          sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {analytics?.criticalVulnerabilities || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">High</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={(analytics?.highVulnerabilities || 0) / (analytics?.totalVulnerabilities || 1) * 100}
                          color="error"
                          sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {analytics?.highVulnerabilities || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Medium</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={(analytics?.mediumVulnerabilities || 0) / (analytics?.totalVulnerabilities || 1) * 100}
                          color="warning"
                          sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {analytics?.mediumVulnerabilities || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">Low</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={(analytics?.lowVulnerabilities || 0) / (analytics?.totalVulnerabilities || 1) * 100}
                          color="info"
                          sx={{ width: '100%', height: 8, borderRadius: 4, mr: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {analytics?.lowVulnerabilities || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Vulnerable Components</Typography>
                  <List dense>
                    {analytics?.topVulnerableComponents.map((component, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Typography variant="h6" color="error">
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={component.component}
                          secondary={`${component.vulnerabilityCount} vulnerabilities • ${component.severity} severity`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Security Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Scan Statistics</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {analytics?.completedScans || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info">
                        {analytics?.runningScans || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Running
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analytics?.failedScans || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vulnerability Trends</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    {analytics?.scanTrends.slice(-7).map((trend) => (
                      <Box key={trend.date} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {trend.vulnerabilities}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(trend.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Scan Details Dialog */}
      <Dialog open={!!selectedScan} onClose={() => setSelectedScan(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Scan Details</DialogTitle>
        <DialogContent>
          {selectedScan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedScan.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedScan.scanner} • {selectedScan.target}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Scan Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Type: {selectedScan.type.replace('_', ' ')}</Typography>
                    <Typography variant="body2">Status: {selectedScan.status}</Typography>
                    <Typography variant="body2">Severity: {selectedScan.severity}</Typography>
                    <Typography variant="body2">Target: {selectedScan.target}</Typography>
                    <Typography variant="body2">Scanner: {selectedScan.scanner}</Typography>
                    <Typography variant="body2">Compliance: {selectedScan.compliance}%</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Results</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Findings: {selectedScan.findings}</Typography>
                    <Typography variant="body2">Vulnerabilities: {selectedScan.vulnerabilities}</Typography>
                    <Typography variant="body2">Duration: {selectedScan.duration ? formatDuration(selectedScan.duration) : 'N/A'}</Typography>
                    <Typography variant="body2">Started: {new Date(selectedScan.startedAt).toLocaleString()}</Typography>
                  </Box>
                </Box>
                
                {selectedScan.completedAt && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Completion</Typography>
                    <Typography variant="body2">
                      Completed: {new Date(selectedScan.completedAt).toLocaleString()}
                    </Typography>
                    {selectedScan.nextScan && (
                      <Typography variant="body2">
                        Next Scan: {new Date(selectedScan.nextScan).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {selectedScan.reportUrl && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Report</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={selectedScan.reportUrl}
                      target="_blank"
                    >
                      Download Report
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedScan(null)}>Close</Button>
          <Button variant="contained">View Vulnerabilities</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityScanningPage;
