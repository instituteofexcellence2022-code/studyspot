/**
 * Self-Serve Upgrade Page
 * 
 * Features:
 * - Self-serve upgrade flows and management
 * - Upgrade eligibility and recommendations
 * - Pricing and plan comparison
 * - Upgrade analytics and conversion tracking
 * - Automated upgrade processes
 * - Customer success management
 */

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { AccessTime as AccessTimeIcon,
  AccessTime as AccessTimeIcon2,
  AccountBalance as AccountBalanceIcon,
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
  AttachMoney as AttachMoneyIcon,
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
  Cancel as CancelIcon2,
  CardGiftcard as CardGiftcardIcon,
  CheckCircle as CheckCircleIcon,
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
  ConfirmationNumber as ConfirmationNumberIcon,
  ContentCopy as CopyIcon,
  CreditCard as CreditCardIcon,
  CurrencyBitcoin as CurrencyBitcoinIcon,
  CurrencyPound as CurrencyPoundIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  CurrencyYen as CurrencyYenIcon,
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
  Discount as DiscountIcon,
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
  Error as ErrorIcon3,
  Euro as EuroIcon,
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
  Info as InfoIcon3,
  Insights as InsightsIcon,
  Insights as InsightsIcon2,
  Key as KeyIcon,
  Key as KeyIcon2,
  LocalOffer as LocalOfferIcon,
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
  MonetizationOn as MonetizationOnIcon,
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
  Payment as PaymentIcon,
  Percent as PercentIcon,
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
  QrCode2 as QrCode2Icon,
  QrCodeScanner as QrCodeScannerIcon,
  QrCodeScanner as QrCodeScanner2Icon,
  QueryBuilder as QueryBuilderIcon,
  QueryBuilder as QueryBuilderIcon2,
  QueryBuilder as QueryBuilderIcon3,
  Receipt as ReceiptIcon,
  Redeem as RedeemIcon,
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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
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
  CheckCircle as SuccessIcon,
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
  Upgrade as UpgradeIcon,
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
  Warning as WarningIcon3,
  Webhook as WebhookIcon,
  Webhook as WebhookIcon2,
  Wifi as WifiIcon,
  Wifi as WifiIcon2 } from '@mui/icons-material';
;
interface UpgradeOffer {
  id: string;
  tenantId: string;
  tenantName: string;
  currentTier: 'free' | 'basic' | 'pro' | 'enterprise';
  recommendedTier: 'basic' | 'pro' | 'enterprise';
  reason: 'quota_exceeded' | 'feature_limitation' | 'growth_opportunity' | 'usage_pattern';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  discount: number; // percentage
  validUntil: string;
  status: 'pending' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  expectedRevenue: number;
  conversionProbability: number; // 0-100
}

interface UpgradeFlow {
  id: string;
  name: string;
  description: string;
  trigger: 'quota_exceeded' | 'feature_request' | 'manual' | 'scheduled';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
    value: string;
  }>;
  targetTier: 'basic' | 'pro' | 'enterprise';
  discount: number;
  message: string;
  enabled: boolean;
  successRate: number;
  totalTriggers: number;
  conversions: number;
  createdAt: string;
  lastTriggered?: string;
}

interface UpgradeAnalytics {
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  declinedOffers: number;
  expiredOffers: number;
  conversionRate: number;
  averageDiscount: number;
  totalRevenue: number;
  monthlyRevenue: number;
  topConversionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  tierDistribution: { [key: string]: number };
  conversionFunnel: {
    offersSent: number;
    offersViewed: number;
    offersAccepted: number;
    upgradesCompleted: number;
  };
}

const SelfServeUpgradePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [offers, setOffers] = useState<UpgradeOffer[]>([]);
  const [flows, setFlows] = useState<UpgradeFlow[]>([]);
  const [analytics, setAnalytics] = useState<UpgradeAnalytics | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<UpgradeOffer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock data
  useEffect(() => {
    setOffers([
      {
        id: '1',
        tenantId: 'tenant_1',
        tenantName: 'TechCorp Library',
        currentTier: 'free',
        recommendedTier: 'basic',
        reason: 'quota_exceeded',
        priority: 'high',
        discount: 20,
        validUntil: '2024-01-22T00:00:00Z',
        status: 'sent',
        createdAt: '2024-01-15T00:00:00Z',
        sentAt: '2024-01-15T10:00:00Z',
        viewedAt: '2024-01-15T14:30:00Z',
        expectedRevenue: 1200,
        conversionProbability: 75
      },
      {
        id: '2',
        tenantId: 'tenant_2',
        tenantName: 'StartupIO Space',
        currentTier: 'free',
        recommendedTier: 'pro',
        reason: 'feature_limitation',
        priority: 'medium',
        discount: 15,
        validUntil: '2024-01-25T00:00:00Z',
        status: 'viewed',
        createdAt: '2024-01-14T00:00:00Z',
        sentAt: '2024-01-14T09:00:00Z',
        viewedAt: '2024-01-14T16:45:00Z',
        expectedRevenue: 2400,
        conversionProbability: 60
      },
      {
        id: '3',
        tenantId: 'tenant_3',
        tenantName: 'Enterprise Corp',
        currentTier: 'pro',
        recommendedTier: 'enterprise',
        reason: 'growth_opportunity',
        priority: 'urgent',
        discount: 10,
        validUntil: '2024-01-20T00:00:00Z',
        status: 'accepted',
        createdAt: '2024-01-13T00:00:00Z',
        sentAt: '2024-01-13T11:00:00Z',
        viewedAt: '2024-01-13T11:15:00Z',
        acceptedAt: '2024-01-13T15:30:00Z',
        expectedRevenue: 5000,
        conversionProbability: 90
      },
      {
        id: '4',
        tenantId: 'tenant_4',
        tenantName: 'Small Business Hub',
        currentTier: 'basic',
        recommendedTier: 'pro',
        reason: 'usage_pattern',
        priority: 'low',
        discount: 25,
        validUntil: '2024-01-18T00:00:00Z',
        status: 'declined',
        createdAt: '2024-01-12T00:00:00Z',
        sentAt: '2024-01-12T08:00:00Z',
        viewedAt: '2024-01-12T10:20:00Z',
        declinedAt: '2024-01-12T14:00:00Z',
        expectedRevenue: 1800,
        conversionProbability: 40
      }
    ]);

    setFlows([
      {
        id: '1',
        name: 'Quota Exceeded Upgrade',
        description: 'Automated upgrade offer when tenants exceed their quotas',
        trigger: 'quota_exceeded',
        conditions: [
          { field: 'quota_usage_percentage', operator: 'greater_than', value: '90' },
          { field: 'tier', operator: 'equals', value: 'free' }
        ],
        targetTier: 'basic',
        discount: 20,
        message: 'You\'re approaching your quota limits. Upgrade to Basic for unlimited access!',
        enabled: true,
        successRate: 65,
        totalTriggers: 45,
        conversions: 29,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        name: 'Feature Request Upgrade',
        description: 'Upgrade offer when tenants request premium features',
        trigger: 'feature_request',
        conditions: [
          { field: 'feature_requested', operator: 'contains', value: 'advanced' },
          { field: 'tier', operator: 'equals', value: 'basic' }
        ],
        targetTier: 'pro',
        discount: 15,
        message: 'Unlock advanced features with our Pro plan!',
        enabled: true,
        successRate: 45,
        totalTriggers: 20,
        conversions: 9,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-14T15:30:00Z'
      },
      {
        id: '3',
        name: 'Growth Opportunity',
        description: 'Targeted upgrade for high-growth tenants',
        trigger: 'manual',
        conditions: [
          { field: 'monthly_growth_rate', operator: 'greater_than', value: '20' },
          { field: 'user_count', operator: 'greater_than', value: '100' }
        ],
        targetTier: 'enterprise',
        discount: 10,
        message: 'Scale with confidence - Enterprise plan for growing teams',
        enabled: true,
        successRate: 80,
        totalTriggers: 8,
        conversions: 6,
        createdAt: '2024-01-01T00:00:00Z',
        lastTriggered: '2024-01-13T10:00:00Z'
      }
    ]);

    setAnalytics({
      totalOffers: 125,
      pendingOffers: 15,
      acceptedOffers: 45,
      declinedOffers: 35,
      expiredOffers: 30,
      conversionRate: 36,
      averageDiscount: 18.5,
      totalRevenue: 125000,
      monthlyRevenue: 15000,
      topConversionReasons: [
        { reason: 'quota_exceeded', count: 28, percentage: 62 },
        { reason: 'feature_limitation', count: 12, percentage: 27 },
        { reason: 'growth_opportunity', count: 5, percentage: 11 }
      ],
      tierDistribution: {
        'free': 60,
        'basic': 25,
        'pro': 12,
        'enterprise': 3
      },
      conversionFunnel: {
        offersSent: 125,
        offersViewed: 98,
        offersAccepted: 45,
        upgradesCompleted: 42
      }
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'info';
      case 'sent': return 'warning';
      case 'viewed': return 'primary';
      case 'accepted': return 'success';
      case 'declined': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'free': return 'default';
      case 'basic': return 'info';
      case 'pro': return 'primary';
      case 'enterprise': return 'secondary';
      default: return 'default';
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'quota_exceeded': return <WarningIcon />;
      case 'feature_limitation': return <LockIcon />;
      case 'growth_opportunity': return <TrendingUpIcon />;
      case 'usage_pattern': return <AssessmentIcon />;
      default: return <InfoIcon3 />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredOffers = offers.filter((offer: any) => {
    const matchesSearch = offer.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.tenantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || offer.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
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
            Self-Serve Upgrades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upgrade offers, conversion tracking, and revenue optimization
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
            Create Offer
          </Button>
        </Box>
      </Box>

      {/* Upgrade Metrics Cards */}
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
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Offers</Typography>
                <Typography variant="h4">{analytics?.totalOffers || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.pendingOffers || 0} pending
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
                <Typography variant="h6">Conversion Rate</Typography>
                <Typography variant="h4">{analytics?.conversionRate || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.acceptedOffers || 0} accepted
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <AttachMoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Monthly Revenue</Typography>
                <Typography variant="h4">{formatCurrency(analytics?.monthlyRevenue || 0)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  From upgrades
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <LocalOfferIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Discount</Typography>
                <Typography variant="h4">{analytics?.averageDiscount || 0}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average offer discount
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Upgrade Offers" />
          <Tab label="Upgrade Flows" />
          <Tab label="Conversion Funnel" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Upgrade Offers Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Upgrade Offers</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="viewed">Viewed</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Offer</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Upgrade Path</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Expected Revenue</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getReasonIcon(offer.reason)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {offer.reason.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {offer.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{offer.tenantName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {offer.tenantId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={offer.currentTier}
                          color={getTierColor(offer.currentTier) as any}
                          size="small"
                        />
                        <ArrowIcon />
                        <Chip
                          label={offer.recommendedTier}
                          color={getTierColor(offer.recommendedTier) as any}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {offer.reason.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={offer.priority}
                        color={getPriorityColor(offer.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {offer.discount}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatCurrency(offer.expectedRevenue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {offer.conversionProbability}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={offer.conversionProbability}
                          color="primary"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={offer.status}
                        color={getStatusColor(offer.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedOffer(offer)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EmailIcon />
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

        {/* Upgrade Flows Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Upgrade Flows</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flow Name</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Target Tier</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Triggers</TableCell>
                  <TableCell>Conversions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Triggered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{flow.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flow.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flow.trigger.replace('_', ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flow.targetTier}
                        color={getTierColor(flow.targetTier) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {flow.discount}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {flow.successRate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={flow.successRate}
                          color="success"
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{flow.totalTriggers}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{flow.conversions}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flow.enabled ? 'Enabled' : 'Disabled'}
                        color={flow.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {flow.lastTriggered ? new Date(flow.lastTriggered).toLocaleDateString() : 'Never'}
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

        {/* Conversion Funnel Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Conversion Funnel</Typography>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionFunnel.offersSent || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Offers Sent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    100%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionFunnel.offersViewed || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Offers Viewed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(((analytics?.conversionFunnel.offersViewed || 0) / (analytics?.conversionFunnel.offersSent || 1)) * 100)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionFunnel.offersAccepted || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Offers Accepted
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(((analytics?.conversionFunnel.offersAccepted || 0) / (analytics?.conversionFunnel.offersViewed || 1)) * 100)}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionFunnel.upgradesCompleted || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upgrades Completed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(((analytics?.conversionFunnel.upgradesCompleted || 0) / (analytics?.conversionFunnel.offersAccepted || 1)) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Conversion Reasons</Typography>
                  <List dense>
                    {analytics?.topConversionReasons.map((reason, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Typography variant="h6" color="primary">
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={reason.reason.replace('_', ' ')}
                          secondary={`${reason.count} conversions • ${reason.percentage}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Tier Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(analytics?.tierDistribution || {}).map(([tier, percentage]) => (
                      <Box key={tier} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {tier}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            color="primary"
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
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Upgrade Analytics</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Revenue Metrics</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {formatCurrency(analytics?.totalRevenue || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(analytics?.monthlyRevenue || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Revenue
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Offer Performance</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success">
                        {analytics?.acceptedOffers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accepted
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="error">
                        {analytics?.declinedOffers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Declined
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning">
                        {analytics?.expiredOffers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expired
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Offer Details Dialog */}
      <Dialog open={!!selectedOffer} onClose={() => setSelectedOffer(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Upgrade Offer Details</DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedOffer.reason.replace('_', ' ').toUpperCase()} Upgrade Offer
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedOffer.tenantName} • {selectedOffer.tenantId}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Offer Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Current Tier: {selectedOffer.currentTier}</Typography>
                    <Typography variant="body2">Recommended Tier: {selectedOffer.recommendedTier}</Typography>
                    <Typography variant="body2">Reason: {selectedOffer.reason.replace('_', ' ')}</Typography>
                    <Typography variant="body2">Priority: {selectedOffer.priority}</Typography>
                    <Typography variant="body2">Discount: {selectedOffer.discount}%</Typography>
                    <Typography variant="body2">Status: {selectedOffer.status}</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Financial Projections</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Expected Revenue: {formatCurrency(selectedOffer.expectedRevenue)}</Typography>
                    <Typography variant="body2">Conversion Probability: {selectedOffer.conversionProbability}%</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Timeline</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">Created: {new Date(selectedOffer.createdAt).toLocaleString()}</Typography>
                    {selectedOffer.sentAt && (
                      <Typography variant="body2">Sent: {new Date(selectedOffer.sentAt).toLocaleString()}</Typography>
                    )}
                    {selectedOffer.viewedAt && (
                      <Typography variant="body2">Viewed: {new Date(selectedOffer.viewedAt).toLocaleString()}</Typography>
                    )}
                    {selectedOffer.acceptedAt && (
                      <Typography variant="body2">Accepted: {new Date(selectedOffer.acceptedAt).toLocaleString()}</Typography>
                    )}
                    {selectedOffer.declinedAt && (
                      <Typography variant="body2">Declined: {new Date(selectedOffer.declinedAt).toLocaleString()}</Typography>
                    )}
                    <Typography variant="body2">Valid Until: {new Date(selectedOffer.validUntil).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOffer(null)}>Close</Button>
          <Button variant="contained">Send Reminder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SelfServeUpgradePage;






