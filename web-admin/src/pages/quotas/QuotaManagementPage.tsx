/**
 * Quota Management Page
 * 
 * Features:
 * - Free tier quota management and monitoring
 * - Grace windows and soft limits
 * - Self-serve upgrade flows
 * - Abuse detection and monitoring
 * - Usage analytics and optimization
 * - Quota enforcement and alerts
 */

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
interface QuotaLimit {
  id: string;
  name: string;
  description: string;
  resource: 'api_calls' | 'storage' | 'users' | 'bookings' | 'webhooks' | 'custom';
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  limit?: number;
  unit: 'requests' | 'gb' | 'users' | 'bookings' | 'webhooks' | 'custom';
  period: 'per_minute' | 'per_hour' | 'per_day' | 'per_month' | 'per_year' | 'total';
  graceWindow: number; // days
  softLimit: number; // percentage of hard limit
  enforcement: 'hard' | 'soft' | 'grace';
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface TenantQuota {
  id: string;
  tenantId: string;
  tenantName: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  quotas: Array<{
    resource: string;
    limit?: number;
    used: number;
    percentage: number;
    status: 'ok' | 'warning' | 'critical' | 'exceeded';
    graceWindow?: {
      enabled: boolean;
      expiresAt?: string;
      daysRemaining?: number;
    };
  }>;
  lastUpdated: string;
  upgradeEligible: boolean;
  abuseScore: number; // 0-100
}

interface QuotaViolation {
  id: string;
  tenantId: string;
  tenantName: string;
  resource: string;
  limit?: number;
  actual: number;
  violationType: 'soft_limit' | 'hard_limit' | 'grace_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
  resolution?: string;
  actionTaken: 'warning' | 'throttle' | 'block' | 'upgrade_prompt';
}

interface QuotaAnalytics {
  totalTenants: number;
  freeTierTenants: number;
  paidTierTenants: number;
  quotaViolations: number;
  upgradeConversions: number;
  abuseIncidents: number;
  averageUsage: { [key: string]: number };
  topViolations: Array<{
    resource: string;
    count: number;
    percentage: number;
  }>;
  tierDistribution: { [key: string]: number };
  conversionRates: {
    freeToBasic: number;
    basicToPro: number;
    proToEnterprise: number;
  };
}

const QuotaManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [quotaLimits, setQuotaLimits] = useState<QuotaLimit[]>([]);
  const [tenantQuotas, setTenantQuotas] = useState<TenantQuota[]>([]);
  const [violations, setViolations] = useState<QuotaViolation[]>([]);
  const [analytics, setAnalytics] = useState<QuotaAnalytics | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantQuota | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setQuotaLimits([
      {
        id: '1',
        name: 'API Calls - Free Tier',
        description: 'Monthly API call limit for free tier tenants',
        resource: 'api_calls',
        tier: 'free',
        limit: 10000,
        unit: 'requests',
        period: 'per_month',
        graceWindow: 7,
        softLimit: 80,
        enforcement: 'soft',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Storage - Free Tier',
        description: 'Storage limit for free tier tenants',
        resource: 'storage',
        tier: 'free',
        limit: 5,
        unit: 'gb',
        period: 'total',
        graceWindow: 3,
        softLimit: 90,
        enforcement: 'hard',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'Users - Free Tier',
        description: 'Maximum number of users for free tier',
        resource: 'users',
        tier: 'free',
        limit: 50,
        unit: 'users',
        period: 'total',
        graceWindow: 14,
        softLimit: 85,
        enforcement: 'grace',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]);

    setTenantQuotas([
      {
        id: '1',
        tenantId: 'tenant_1',
        tenantName: 'TechCorp Library',
        tier: 'free',
        quotas: [
          {
            resource: 'api_calls',
            limit: 10000,
            used: 8500,
            percentage: 85,
            status: 'warning',
            graceWindow: {
              enabled: false
            }
          },
          {
            resource: 'storage',
            limit: 5,
            used: 4.2,
            percentage: 84,
            status: 'warning',
            graceWindow: {
              enabled: false
            }
          },
          {
            resource: 'users',
            limit: 50,
            used: 45,
            percentage: 90,
            status: 'critical',
            graceWindow: {
              enabled: true,
              expiresAt: '2024-01-22T00:00:00Z',
              daysRemaining: 7
            }
          }
        ],
        lastUpdated: '2024-01-15T10:00:00Z',
        upgradeEligible: true,
        abuseScore: 15
      },
      {
        id: '2',
        tenantId: 'tenant_2',
        tenantName: 'StartupIO Space',
        tier: 'free',
        quotas: [
          {
            resource: 'api_calls',
            limit: 10000,
            used: 12000,
            percentage: 120,
            status: 'exceeded',
            graceWindow: {
              enabled: true,
              expiresAt: '2024-01-18T00:00:00Z',
              daysRemaining: 3
            }
          },
          {
            resource: 'storage',
            limit: 5,
            used: 3.8,
            percentage: 76,
            status: 'ok',
            graceWindow: {
              enabled: false
            }
          },
          {
            resource: 'users',
            limit: 50,
            used: 35,
            percentage: 70,
            status: 'ok',
            graceWindow: {
              enabled: false
            }
          }
        ],
        lastUpdated: '2024-01-15T09:30:00Z',
        upgradeEligible: true,
        abuseScore: 25
      },
      {
        id: '3',
        tenantId: 'tenant_3',
        tenantName: 'Enterprise Corp',
        tier: 'pro',
        quotas: [
          {
            resource: 'api_calls',
            limit: 100000,
            used: 45000,
            percentage: 45,
            status: 'ok',
            graceWindow: {
              enabled: false
            }
          },
          {
            resource: 'storage',
            limit: 100,
            used: 25,
            percentage: 25,
            status: 'ok',
            graceWindow: {
              enabled: false
            }
          },
          {
            resource: 'users',
            limit: 500,
            used: 120,
            percentage: 24,
            status: 'ok',
            graceWindow: {
              enabled: false
            }
          }
        ],
        lastUpdated: '2024-01-15T08:45:00Z',
        upgradeEligible: false,
        abuseScore: 5
      }
    ]);

    setViolations([
      {
        id: '1',
        tenantId: 'tenant_2',
        tenantName: 'StartupIO Space',
        resource: 'api_calls',
        limit: 10000,
        actual: 12000,
        violationType: 'hard_limit',
        severity: 'high',
        timestamp: '2024-01-15T08:00:00Z',
        resolved: false,
        actionTaken: 'upgrade_prompt'
      },
      {
        id: '2',
        tenantId: 'tenant_1',
        tenantName: 'TechCorp Library',
        resource: 'users',
        limit: 50,
        actual: 45,
        violationType: 'soft_limit',
        severity: 'medium',
        timestamp: '2024-01-14T15:30:00Z',
        resolved: false,
        actionTaken: 'warning'
      }
    ]);

    setAnalytics({
      totalTenants: 1250,
      freeTierTenants: 980,
      paidTierTenants: 270,
      quotaViolations: 45,
      upgradeConversions: 12,
      abuseIncidents: 8,
      averageUsage: {
        'api_calls': 65,
        'storage': 45,
        'users': 70
      },
      topViolations: [
        { resource: 'api_calls', count: 25, percentage: 55 },
        { resource: 'users', count: 12, percentage: 27 },
        { resource: 'storage', count: 8, percentage: 18 }
      ],
      tierDistribution: {
        'free': 78,
        'basic': 15,
        'pro': 5,
        'enterprise': 2
      },
      conversionRates: {
        freeToBasic: 8.5,
        basicToPro: 12.3,
        proToEnterprise: 5.2
      }
    });
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'exceeded': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'info';
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
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

  const getEnforcementColor = (enforcement: string) => {
    switch (enforcement) {
      case 'hard': return 'error';
      case 'soft': return 'warning';
      case 'grace': return 'info';
      default: return 'default';
    }
  };

  const formatNumber = (num: number, unit: string) => {
    if (unit === 'gb') {
      return `${num.toFixed(1)} GB`;
    }
    return num.toLocaleString();
  };

  const filteredTenants = tenantQuotas.filter((tenant: any) => {
    const matchesSearch = tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.tenantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || tenant.tier === filterTier;
    const matchesStatus = filterStatus === 'all' || 
                         tenant.quotas.some(q => q.status === filterStatus);
    return matchesSearch && matchesTier && matchesStatus;
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
            Quota Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Free tier quotas, grace windows, and upgrade management
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
            New Quota Limit
          </Button>
        </Box>
      </Box>

      {/* Quota Management Metrics Cards */}
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
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Tenants</Typography>
                <Typography variant="h4">{analytics?.totalTenants.toLocaleString() || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics?.freeTierTenants || 0} free tier
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
                <Typography variant="h6">Quota Violations</Typography>
                <Typography variant="h4">{analytics?.quotaViolations || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Active violations
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Upgrades</Typography>
                <Typography variant="h4">{analytics?.upgradeConversions || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <ShieldIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Abuse Incidents</Typography>
                <Typography variant="h4">{analytics?.abuseIncidents || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Requiring attention
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Tenant Quotas" />
          <Tab label="Quota Limits" />
          <Tab label="Violations" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Tenant Quotas Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Tenant Quotas</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                >
                  <MenuItem value="all">All Tiers</MenuItem>
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="pro">Pro</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
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
                  <MenuItem value="exceeded">Exceeded</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>API Calls</TableCell>
                  <TableCell>Storage</TableCell>
                  <TableCell>Users</TableCell>
                  <TableCell>Abuse Score</TableCell>
                  <TableCell>Upgrade Eligible</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{tenant.tenantName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tenant.tenantId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.tier}
                        color={getTierColor(tenant.tier) as any}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {tenant.quotas.find(q => q.resource === 'api_calls')?.used.toLocaleString() || 0}/
                          {tenant.quotas.find(q => q.resource === 'api_calls')?.limit.toLocaleString() || 0}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={tenant.quotas.find(q => q.resource === 'api_calls')?.percentage || 0}
                          color={getStatusColor(tenant.quotas.find(q => q.resource === 'api_calls')?.status || 'ok') as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {tenant.quotas.find(q => q.resource === 'storage')?.used.toFixed(1) || 0}/
                          {tenant.quotas.find(q => q.resource === 'storage')?.limit || 0}GB
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={tenant.quotas.find(q => q.resource === 'storage')?.percentage || 0}
                          color={getStatusColor(tenant.quotas.find(q => q.resource === 'storage')?.status || 'ok') as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {tenant.quotas.find(q => q.resource === 'users')?.used || 0}/
                          {tenant.quotas.find(q => q.resource === 'users')?.limit || 0}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={tenant.quotas.find(q => q.resource === 'users')?.percentage || 0}
                          color={getStatusColor(tenant.quotas.find(q => q.resource === 'users')?.status || 'ok') as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${tenant.abuseScore}/100`}
                        color={tenant.abuseScore > 50 ? 'error' : tenant.abuseScore > 25 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.upgradeEligible ? 'Yes' : 'No'}
                        color={tenant.upgradeEligible ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedTenant(tenant)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <TrendingUpIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EmailIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Quota Limits Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Quota Limits Configuration</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quota Name</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Limit</TableCell>
                  <TableCell>Grace Window</TableCell>
                  <TableCell>Soft Limit</TableCell>
                  <TableCell>Enforcement</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotaLimits.map((quota) => (
                  <TableRow key={quota.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{quota.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {quota.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={quota.tier}
                        color={getTierColor(quota.tier) as any}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quota.resource}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatNumber(quota.limit, quota.unit)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quota.period}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quota.graceWindow} days</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{quota.softLimit}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={quota.enforcement}
                        color={getEnforcementColor(quota.enforcement) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={quota.status}
                        color={getStatusColor(quota.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DeleteIcon />
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

        {/* Violations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Quota Violations</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Violation Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Limit vs Actual</TableCell>
                  <TableCell>Action Taken</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {violations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{violation.tenantName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {violation.tenantId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{violation.resource}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={violation.violationType.replace('_', ' ')}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={violation.severity}
                        color={getStatusColor(violation.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {violation.limit.toLocaleString()} / {violation.actual.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={violation.actionTaken.replace('_', ' ')}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(violation.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={violation.resolved ? 'Resolved' : 'Active'}
                        color={violation.resolved ? 'success' : 'warning'}
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
                          <CheckIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Quota Analytics</Typography>
          
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
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
            </Grid>
            <Grid xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top Violations</Typography>
                  <List dense>
                    {analytics?.topViolations.map((violation, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <Typography variant="h6" color="primary">
                            {index + 1}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={violation.resource}
                          secondary={`${violation.count} violations • ${violation.percentage}%`}
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
              <Typography variant="h6" gutterBottom>Conversion Rates</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionRates.freeToBasic.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Free → Basic
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionRates.basicToPro.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Basic → Pro
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analytics?.conversionRates.proToEnterprise.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pro → Enterprise
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Tenant Details Dialog */}
      <Dialog open={!!selectedTenant} onClose={() => setSelectedTenant(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Tenant Quota Details</DialogTitle>
        <DialogContent>
          {selectedTenant && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTenant.tenantName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTenant.tenantId} • {selectedTenant.tier} tier
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Quota Usage</Typography>
                  {selectedTenant.quotas.map((quota) => (
                    <Box key={quota.resource} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {quota.resource.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2">
                          {quota.used.toLocaleString()} / {quota.limit.toLocaleString()} ({quota.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={quota.percentage}
                        color={getStatusColor(quota.status) as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      {quota.graceWindow?.enabled && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                          Grace window: {quota.graceWindow.daysRemaining} days remaining
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Account Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Tier: {selectedTenant.tier}</Typography>
                    <Typography variant="body2">Abuse Score: {selectedTenant.abuseScore}/100</Typography>
                    <Typography variant="body2">Upgrade Eligible: {selectedTenant.upgradeEligible ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">Last Updated: {new Date(selectedTenant.lastUpdated).toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTenant(null)}>Close</Button>
          <Button variant="contained">Send Upgrade Offer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotaManagementPage;






