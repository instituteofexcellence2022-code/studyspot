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
  breachCount: number;
  compliance: number; // percentage
  trend: 'improving' | 'stable' | 'degrading';
}

interface SLOBreach {
  id: string;
  sloId: string;
  sloName: string;
  service: string;
  breachStart: string;
  breachEnd?: string;
  duration: number; // minutes
  severity: 'warning' | 'critical';
  impact: 'low' | 'medium' | 'high';
  rootCause?: string;
  resolution?: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SLOAnalytics {
  totalSlos: number;
  meetingSlos: number;
  atRiskSlos: number;
  breachedSlos: number;
  averageCompliance: number;
  totalBreaches: number;
  activeBreaches: number;
  resolvedBreaches: number;
  averageBreachDuration: number; // minutes
  topFailingSlos: Array<{
    name: string;
    service: string;
    compliance: number;
    breachCount: number;
  }>;
  complianceTrend: Array<{
    date: string;
    compliance: number;
  }>;
}

const SLOManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [slos, setSlos] = useState<SLO[]>([]);
  const [breaches, setBreaches] = useState<SLOBreach[]>([]);
  const [analytics, setAnalytics] = useState<SLOAnalytics | null>(null);
  const [selectedSLO, setSelectedSLO] = useState<SLO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
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
        createdAt: '2024-01-01T00:00:00Z',
        breachCount: 0,
        compliance: 100,
        trend: 'stable'
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
        createdAt: '2024-01-01T00:00:00Z',
        breachCount: 2,
        compliance: 95,
        trend: 'improving'
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
        lastBreach: '2024-01-14T15:30:00Z',
        breachCount: 5,
        compliance: 85,
        trend: 'degrading'
      },
      {
        id: '4',
        name: 'Database Performance',
        description: 'Database query performance target',
        service: 'database',
        metric: 'query_time',
        target: 99,
        window: '1h',
        current: 97,
        status: 'at_risk',
        errorBudget: {
          remaining: 2,
          consumed: 3,
          total: 5
        },
        alerts: [
          { type: 'warning', threshold: 98, enabled: true },
          { type: 'critical', threshold: 95, enabled: true }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        breachCount: 3,
        compliance: 90,
        trend: 'stable'
      }
    ]);

    setBreaches([
      {
        id: '1',
        sloId: '3',
        sloName: 'Error Rate',
        service: 'api-gateway',
        breachStart: '2024-01-14T15:30:00Z',
        breachEnd: '2024-01-14T16:45:00Z',
        duration: 75,
        severity: 'critical',
        impact: 'high',
        rootCause: 'Database connection pool exhaustion',
        resolution: 'Increased connection pool size and added connection retry logic',
        status: 'resolved'
      },
      {
        id: '2',
        sloId: '4',
        sloName: 'Database Performance',
        service: 'database',
        breachStart: '2024-01-13T10:00:00Z',
        breachEnd: '2024-01-13T11:30:00Z',
        duration: 90,
        severity: 'warning',
        impact: 'medium',
        rootCause: 'Slow query due to missing index',
        resolution: 'Added database index and optimized query',
        status: 'resolved'
      },
      {
        id: '3',
        sloId: '2',
        sloName: 'Response Time',
        service: 'api-gateway',
        breachStart: '2024-01-15T08:00:00Z',
        duration: 0,
        severity: 'warning',
        impact: 'low',
        status: 'active'
      }
    ]);

    setAnalytics({
      totalSlos: 12,
      meetingSlos: 8,
      atRiskSlos: 3,
      breachedSlos: 1,
      averageCompliance: 92.5,
      totalBreaches: 15,
      activeBreaches: 1,
      resolvedBreaches: 14,
      averageBreachDuration: 45,
      topFailingSlos: [
        { name: 'Error Rate', service: 'api-gateway', compliance: 85, breachCount: 5 },
        { name: 'Database Performance', service: 'database', compliance: 90, breachCount: 3 },
        { name: 'Response Time', service: 'api-gateway', compliance: 95, breachCount: 2 }
      ],
      complianceTrend: [
        { date: '2024-01-08', compliance: 95 },
        { date: '2024-01-09', compliance: 94 },
        { date: '2024-01-10', compliance: 93 },
        { date: '2024-01-11', compliance: 92 },
        { date: '2024-01-12', compliance: 91 },
        { date: '2024-01-13', compliance: 90 },
        { date: '2024-01-14', compliance: 89 },
        { date: '2024-01-15', compliance: 92 }
      ]
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'meeting': return 'success';
      case 'at_risk': return 'warning';
      case 'breach': return 'error';
      case 'active': return 'error';
      case 'resolved': return 'success';
      case 'investigating': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUpIcon color="success" />;
      case 'degrading': return <TrendingDownIcon color="error" />;
      case 'stable': return <TrendingFlatIcon color="info" />;
      default: return <TrendingFlatIcon />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredSlos = slos.filter((slo: any) => {
    const matchesSearch = slo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slo.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || slo.service === filterService;
    const matchesStatus = filterStatus === 'all' || slo.status === filterStatus;
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
            SLO Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Service Level Objectives monitoring, compliance, and breach management
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

      {/* SLO Metrics Cards */}
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
                <Typography variant="h6">Meeting SLOs</Typography>
                <Typography variant="h4">{analytics?.meetingSlos || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.totalSlos || 0} total SLOs
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
                <Typography variant="h6">Avg Compliance</Typography>
                <Typography variant="h4">{analytics?.averageCompliance || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall compliance
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
                <Typography variant="h6">Active Breaches</Typography>
                <Typography variant="h4">{analytics?.activeBreaches || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.totalBreaches || 0} total breaches
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
                <Typography variant="h6">Avg Breach Duration</Typography>
                <Typography variant="h4">{analytics?.averageBreachDuration || 0}m</Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolution time
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="SLOs" />
          <Tab label="Breaches" />
          <Tab label="Compliance" />
          <Tab label="Analytics" />
        </Tabs>

        {/* SLOs Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Service Level Objectives</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search SLOs..."
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
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="at_risk">At Risk</MenuItem>
                  <MenuItem value="breach">Breach</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SLO</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell>Compliance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error Budget</TableCell>
                  <TableCell>Breaches</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSlos.map((slo) => (
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {slo.compliance}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={slo.compliance}
                          color={slo.compliance >= 95 ? 'success' : slo.compliance >= 90 ? 'warning' : 'error'}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
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
                      <Typography variant="body2">{slo.breachCount}</Typography>
                    </TableCell>
                    <TableCell>
                      {getTrendIcon(slo.trend)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedSLO(slo)}>
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

        {/* Breaches Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>SLO Breaches</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Breach</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breaches.map((breach) => (
                  <TableRow key={breach.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{breach.sloName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {breach.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{breach.service}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={breach.severity}
                        color={getSeverityColor(breach.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={breach.impact}
                        color={getImpactColor(breach.impact) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {breach.duration > 0 ? formatDuration(breach.duration) : 'Ongoing'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(breach.breachStart).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={breach.status}
                        color={getStatusColor(breach.status) as any}
                        size="small"
                      />
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
          <Typography variant="h6" gutterBottom>SLO Compliance</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Compliance Overview</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {analytics?.meetingSlos || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meeting SLOs
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning">
                        {analytics?.atRiskSlos || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        At Risk
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analytics?.breachedSlos || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Breached
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Failing SLOs</Typography>
                  <List dense>
                    {analytics?.topFailingSlos.map((slo, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Typography variant="h6" color="error">
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={slo.name}
                          secondary={`${slo.service} • ${slo.compliance}% compliance • ${slo.breachCount} breaches`}
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
              <Typography variant="h6" gutterBottom>Compliance Trend</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                {analytics?.complianceTrend.slice(-7).map((point) => (
                  <Box key={point.date} sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {point.compliance}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(point.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>SLO Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Breach Statistics</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {analytics?.totalBreaches || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Breaches
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {analytics?.resolvedBreaches || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resolved
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analytics?.activeBreaches || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {analytics?.averageCompliance || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Compliance
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info">
                        {analytics?.averageBreachDuration || 0}m
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Duration
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* SLO Details Dialog */}
      <Dialog open={!!selectedSLO} onClose={() => setSelectedSLO(null)} maxWidth="lg" fullWidth>
        <DialogTitle>SLO Details</DialogTitle>
        <DialogContent>
          {selectedSLO && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedSLO.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedSLO.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>SLO Configuration</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Service: {selectedSLO.service}</Typography>
                    <Typography variant="body2">Metric: {selectedSLO.metric}</Typography>
                    <Typography variant="body2">Target: {selectedSLO.target}%</Typography>
                    <Typography variant="body2">Window: {selectedSLO.window}</Typography>
                    <Typography variant="body2">Current: {selectedSLO.current}%</Typography>
                    <Typography variant="body2">Compliance: {selectedSLO.compliance}%</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Error Budget</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Remaining: {selectedSLO.errorBudget.remaining}%</Typography>
                    <Typography variant="body2">Consumed: {selectedSLO.errorBudget.consumed}%</Typography>
                    <Typography variant="body2">Total: {selectedSLO.errorBudget.total}%</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Alerts</Typography>
                  <List dense>
                    {selectedSLO.alerts.map((alert, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Chip
                            label={alert.type}
                            color={getSeverityColor(alert.type) as any}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Threshold: ${alert.threshold}%`}
                          secondary={`Enabled: ${alert.enabled ? 'Yes' : 'No'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Performance</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">Breach Count: {selectedSLO.breachCount}</Typography>
                    <Typography variant="body2">Status: {selectedSLO.status}</Typography>
                    <Typography variant="body2">Trend: {selectedSLO.trend}</Typography>
                    {selectedSLO.lastBreach && (
                      <Typography variant="body2">
                        Last Breach: {new Date(selectedSLO.lastBreach).toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      Created: {new Date(selectedSLO.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSLO(null)}>Close</Button>
          <Button variant="contained">Edit SLO</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SLOManagementPage;
