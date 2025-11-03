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
  CardContent,
  Paper
} from '@mui/material';
/**
 * Feature Store Management Page
 * 
 * Features:
 * - Feature discovery and catalog
 * - Feature lineage and dependencies
 * - Feature validation and quality checks
 * - Feature versioning and schema evolution
 * - Feature monitoring and statistics
 * - Feature access control and governance
 */

import React, { useState, useEffect } from 'react';
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  AccountTree as FlowIcon,
  AccountTree as ParallelIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AllInclusive as AllInclusiveIcon,
  AllInclusive as AllInclusiveIcon2,
  AllInclusive as AllInclusiveIcon3,
  AllInclusive as AllInclusiveIcon4,
  Api as ApiIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  AutoAwesome as AutomationIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BarChart as BarChartIcon2,
  BarChart as BarChartIcon3,
  BarChart as BarChartIcon4,
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Biotech as BiotechIcon2,
  Biotech as BiotechIcon3,
  Bluetooth as BluetoothIcon,
  BubbleChart as BubbleChartIcon,
  BubbleChart as BubbleChartIcon2,
  BubbleChart as BubbleChartIcon3,
  BubbleChart as BubbleChartIcon4,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  CalendarToday as CalendarTodayIcon2,
  CalendarToday as CalendarTodayIcon3,
  CalendarToday as CalendarTodayIcon4,
  CameraAlt as CameraIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudDownload as CloudDownloadIcon3,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  CloudUpload as CloudUploadIcon3,
  Code as CodeIcon,
  Compare as CompareIcon,
  Dashboard as DashboardIcon,
  DataObject as DataObjectIcon,
  DataObject as DataObjectIcon2,
  DataObject as DataObjectIcon3,
  DataUsage as DataIcon,
  Dataset as DatasetIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as DateRangeIcon3,
  DateRange as DateRangeIcon4,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisMonthIcon3,
  DateRange as ThisMonthIcon4,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisWeekIcon3,
  DateRange as ThisWeekIcon4,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  DateRange as ThisYearIcon3,
  DateRange as ThisYearIcon4,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  DeveloperBoard as BoardIcon,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
  DonutLarge as DonutLargeIcon3,
  DonutLarge as DonutLargeIcon4,
  Download as DownloadIcon,
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
  Functions as FunctionsIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  Group as GroupIcon2,
  Group as GroupIcon3,
  Group as PsychologyIcon2,
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
  History as HistoryIcon,
  Insights as InsightsIcon,
  Key as KeyIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Loop as LoopIcon,
  Memory as CpuIcon,
  Memory as MemoryIcon,
  Memory as MemoryIcon2,
  MultilineChart as MultilineChartIcon,
  MultilineChart as MultilineChartIcon2,
  MultilineChart as MultilineChartIcon3,
  MultilineChart as MultilineChartIcon4,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  Person as PersonIcon2,
  Person as PersonIcon3,
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
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  Psychology as PsychologyIcon3,
  Psychology as PsychologyIcon4,
  Psychology as PsychologyIcon5,
  Psychology as PsychologyIcon6,
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
  ScatterPlot as ScatterPlotIcon4,
  Schedule as DelayIcon,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Schema as SchemaIcon,
  Science as ScienceIcon,
  Science as ScienceIcon2,
  Science as ScienceIcon3,
  Search as SearchIcon,
  Security as SecurityIcon,
  Security as SecurityIcon2,
  Security as SecurityIcon3,
  Security as SecurityIcon4,
  Security as SecurityIcon5,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  ShowChart as ShowChartIcon2,
  ShowChart as ShowChartIcon3,
  ShowChart as ShowChartIcon4,
  ShowChart as ShowChartIcon5,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Sort as SortIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  Storage as DataStorageIcon,
  Storage as DataStorageIcon2,
  Storage as DataStorageIcon3,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Sync as RealTimeIcon,
  Sync as SyncIcon,
  Sync as SyncIcon2,
  Sync as SyncIcon3,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  TableChart as TableChartIcon3,
  TableChart as TableChartIcon4,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon2,
  Timeline as TimelineIcon3,
  Timeline as TimelineIcon4,
  Timeline as TimelineIcon5,
  Timeline as TimelineIcon6,
  Timeline as TimelineIcon7,
  Timeline as TimelineIcon8,
  Timer as TimerIcon,
  Today as TodayIcon,
  Today as TodayIcon2,
  Today as TodayIcon3,
  Today as TodayIcon4,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingDown as TrendingDownIcon3,
  TrendingDown as TrendingDownIcon4,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingFlat as TrendingFlatIcon3,
  TrendingFlat as TrendingFlatIcon4,
  TrendingUp as PredictionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingUp as TrendingUpIcon4,
  Update as UpdateIcon,
  Upload as UploadIcon,
  Usb as UsbIcon,
  VerifiedUser as VerifiedUserIcon,
  ViewComfy as ViewComfyIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon,
  Webhook as WebhookIcon,
  Wifi as WifiIcon } from '@mui/icons-material';
;
interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'numerical' | 'categorical' | 'text' | 'image' | 'time_series' | 'embedding';
  dataType: 'int' | 'float' | 'string' | 'boolean' | 'datetime' | 'array' | 'object';
  source: 'database' | 'api' | 'file' | 'stream' | 'computed' | 'ml_pipeline';
  status: 'active' | 'inactive' | 'deprecated' | 'error' | 'draft';
  version: string;
  schema: { [key: string]: any };
  statistics: {
    count: number;
    nullCount: number;
    uniqueCount: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    distribution?: { [key: string]: number };
  };
  quality: {
    completeness: number;
    validity: number;
    consistency: number;
    accuracy: number;
    timeliness: number;
  };
  lineage: {
    upstream: string[];
    downstream: string[];
    transformations: string[];
  };
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
  accessLevel: 'public' | 'private' | 'restricted';
  usage: {
    models: string[];
    queries: number;
    lastUsed: string;
  };
}

interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  features: string[];
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FeatureValidation {
  id: string;
  featureId: string;
  featureName: string;
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const FeatureStorePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureGroups, setFeatureGroups] = useState<FeatureGroup[]>([]);
  const [validations, setValidations] = useState<FeatureValidation[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setFeatures([
      {
        id: '1',
        name: 'user_age',
        description: 'User age in years',
        type: 'numerical',
        dataType: 'int',
        source: 'database',
        status: 'active',
        version: '1.0.0',
        schema: { type: 'integer', nullable: false, range: [18, 100] },
        statistics: {
          count: 10000,
          nullCount: 0,
          uniqueCount: 83,
          mean: 28.5,
          std: 8.2,
          min: 18,
          max: 65,
          distribution: { '18-25': 0.35, '26-35': 0.40, '36-50': 0.20, '51+': 0.05 }
        },
        quality: {
          completeness: 1.0,
          validity: 0.98,
          consistency: 0.95,
          accuracy: 0.97,
          timeliness: 0.99
        },
        lineage: {
          upstream: ['user_profiles'],
          downstream: ['churn_model', 'recommendation_model'],
          transformations: ['age_calculation', 'age_binning']
        },
        tags: ['demographic', 'user_profile', 'numerical'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastUpdated: '2024-01-15T09:30:00Z',
        accessLevel: 'public',
        usage: {
          models: ['churn_model', 'recommendation_model'],
          queries: 15420,
          lastUsed: '2024-01-15T09:30:00Z'
        }
      },
      {
        id: '2',
        name: 'session_duration',
        description: 'User session duration in minutes',
        type: 'numerical',
        dataType: 'float',
        source: 'computed',
        status: 'active',
        version: '1.2.0',
        schema: { type: 'float', nullable: true, range: [0, 480] },
        statistics: {
          count: 9500,
          nullCount: 500,
          uniqueCount: 1200,
          mean: 45.2,
          std: 32.1,
          min: 0.5,
          max: 480,
          distribution: { '0-30': 0.40, '31-60': 0.35, '61-120': 0.20, '120+': 0.05 }
        },
        quality: {
          completeness: 0.95,
          validity: 0.92,
          consistency: 0.88,
          accuracy: 0.94,
          timeliness: 0.97
        },
        lineage: {
          upstream: ['session_logs', 'user_activity'],
          downstream: ['engagement_model', 'churn_model'],
          transformations: ['duration_calculation', 'outlier_removal']
        },
        tags: ['behavioral', 'engagement', 'numerical'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastUpdated: '2024-01-15T08:45:00Z',
        accessLevel: 'public',
        usage: {
          models: ['engagement_model', 'churn_model'],
          queries: 12850,
          lastUsed: '2024-01-15T08:45:00Z'
        }
      },
      {
        id: '3',
        name: 'user_segment',
        description: 'User segment classification',
        type: 'categorical',
        dataType: 'string',
        source: 'computed',
        status: 'active',
        version: '2.0.0',
        schema: { type: 'string', nullable: false, values: ['student', 'faculty', 'visitor', 'admin'] },
        statistics: {
          count: 10000,
          nullCount: 0,
          uniqueCount: 4,
          distribution: { 'student': 0.60, 'faculty': 0.25, 'visitor': 0.10, 'admin': 0.05 }
        },
        quality: {
          completeness: 1.0,
          validity: 0.99,
          consistency: 0.98,
          accuracy: 0.96,
          timeliness: 0.98
        },
        lineage: {
          upstream: ['user_profiles', 'behavioral_data'],
          downstream: ['recommendation_model', 'personalization_model'],
          transformations: ['clustering', 'classification']
        },
        tags: ['demographic', 'classification', 'categorical'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z',
        lastUpdated: '2024-01-15T07:30:00Z',
        accessLevel: 'public',
        usage: {
          models: ['recommendation_model', 'personalization_model'],
          queries: 8750,
          lastUsed: '2024-01-15T07:30:00Z'
        }
      }
    ]);

    setFeatureGroups([
      {
        id: '1',
        name: 'User Demographics',
        description: 'Demographic features for user analysis',
        features: ['user_age', 'user_segment', 'user_location'],
        status: 'active',
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Behavioral Features',
        description: 'User behavior and engagement features',
        features: ['session_duration', 'page_views', 'click_rate'],
        status: 'active',
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]);

    setValidations([
      {
        id: '1',
        featureId: '1',
        featureName: 'user_age',
        rule: 'Age must be between 18 and 100',
        status: 'pass',
        message: 'All values are within valid range',
        timestamp: '2024-01-15T10:00:00Z',
        severity: 'low'
      },
      {
        id: '2',
        featureId: '2',
        featureName: 'session_duration',
        rule: 'Session duration should not exceed 8 hours',
        status: 'warning',
        message: '5% of values exceed 8 hours',
        timestamp: '2024-01-15T10:00:00Z',
        severity: 'medium'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deprecated': return 'warning';
      case 'error': return 'error';
      case 'draft': return 'info';
      case 'pass': return 'success';
      case 'fail': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numerical': return <BarChartIcon />;
      case 'categorical': return <PieChartIcon />;
      case 'text': return <DocumentIcon />;
      case 'image': return <CameraIcon />;
      case 'time_series': return <TimelineIcon />;
      case 'embedding': return <DataObjectIcon />;
      default: return <DatasetIcon />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'error';
  };

  const filteredFeatures = features.filter((feature: any) => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || feature.type === filterType;
    const matchesStatus = filterStatus === 'all' || feature.status === filterStatus;
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
            Feature Store
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Feature discovery, validation, and governance
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
            New Feature
          </Button>
        </Box>
      </Box>

      {/* Feature Store Metrics Cards */}
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
                <DatasetIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Features</Typography>
                <Typography variant="h4">{features.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {features.filter((f: any) => f.status === 'active').length} active
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
                <Typography variant="h6">Quality Score</Typography>
                <Typography variant="h4">
                  {Math.round(features.reduce((acc, f) => acc + Object.values(f.quality).reduce((a, b) => a + b, 0) / 5, 0) / features.length * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average across all features
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Feature Groups</Typography>
                <Typography variant="h4">{featureGroups.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {featureGroups.filter((g: any) => g.status === 'active').length} active
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
                <Typography variant="h6">Validation Issues</Typography>
                <Typography variant="h4">{validations.filter((v: any) => v.status === 'fail').length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {validations.filter((v: any) => v.status === 'warning').length} warnings
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Feature Catalog" />
          <Tab label="Feature Groups" />
          <Tab label="Quality Validation" />
          <Tab label="Lineage & Dependencies" />
        </Tabs>

        {/* Feature Catalog Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Feature Catalog</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search features..."
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
                  <MenuItem value="numerical">Numerical</MenuItem>
                  <MenuItem value="categorical">Categorical</MenuItem>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="time_series">Time Series</MenuItem>
                  <MenuItem value="embedding">Embedding</MenuItem>
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
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Quality Score</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeatures.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(feature.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{feature.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {feature.tags.slice(0, 2).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={feature.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={feature.dataType}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={feature.status}
                        color={getStatusColor(feature.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {Math.round(Object.values(feature.quality).reduce((a, b) => a + b, 0) / 5 * 100)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Object.values(feature.quality).reduce((a, b) => a + b, 0) / 5 * 100}
                          color={getQualityColor(Object.values(feature.quality).reduce((a, b) => a + b, 0) / 5) as any}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {feature.usage.queries.toLocaleString()} queries
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.usage.models.length} models
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(feature.lastUpdated).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedFeature(feature)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Feature Groups Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Feature Groups</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {featureGroups.map((group) => (
              <Card key={group.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{group.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={group.status}
                      color={getStatusColor(group.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Features:</Typography>
                      <Typography variant="body2">{group.features.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Created:</Typography>
                      <Typography variant="body2">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Features in Group</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {group.features.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Export
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Quality Validation Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Quality Validation</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Rule</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validations.map((validation) => (
                  <TableRow key={validation.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{validation.featureName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{validation.rule}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={validation.status}
                        color={getStatusColor(validation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{validation.message}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={validation.severity}
                        color={validation.severity === 'critical' ? 'error' : 
                               validation.severity === 'high' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(validation.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
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

        {/* Lineage & Dependencies Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Feature Lineage & Dependencies</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{feature.name}</Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Upstream Dependencies</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {feature.lineage.upstream.map((dep) => (
                        <Chip key={dep} label={dep} color="primary" variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Downstream Usage</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {feature.lineage.downstream.map((usage) => (
                        <Chip key={usage} label={usage} color="secondary" variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Transformations</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {feature.lineage.transformations.map((transformation) => (
                        <Chip key={transformation} label={transformation} color="info" variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Graph
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Export Lineage
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Card>

      {/* Feature Details Dialog */}
      <Dialog open={!!selectedFeature} onClose={() => setSelectedFeature(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Feature Details</DialogTitle>
        <DialogContent>
          {selectedFeature && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFeature.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedFeature.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Feature Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedFeature.type}</Typography>
                      <Typography variant="body2">Data Type: {selectedFeature.dataType}</Typography>
                      <Typography variant="body2">Source: {selectedFeature.source}</Typography>
                      <Typography variant="body2">Status: {selectedFeature.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Version: {selectedFeature.version}</Typography>
                      <Typography variant="body2">Access Level: {selectedFeature.accessLevel}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedFeature.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant="body2">Last Updated: {new Date(selectedFeature.lastUpdated).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Quality Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    {Object.entries(selectedFeature.quality).map(([metric, score]) => (
                      <Box key={metric} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{metric}:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {(score * 100).toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={score * 100}
                            color={getQualityColor(score) as any}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Count: {selectedFeature.statistics.count.toLocaleString()}</Typography>
                      <Typography variant="body2">Unique: {selectedFeature.statistics.uniqueCount.toLocaleString()}</Typography>
                      <Typography variant="body2">Nulls: {selectedFeature.statistics.nullCount.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      {selectedFeature.statistics.mean && (
                        <Typography variant="body2">Mean: {selectedFeature.statistics.mean.toFixed(2)}</Typography>
                      )}
                      {selectedFeature.statistics.std && (
                        <Typography variant="body2">Std: {selectedFeature.statistics.std.toFixed(2)}</Typography>
                      )}
                      {selectedFeature.statistics.min && (
                        <Typography variant="body2">Min: {selectedFeature.statistics.min}</Typography>
                      )}
                      {selectedFeature.statistics.max && (
                        <Typography variant="body2">Max: {selectedFeature.statistics.max}</Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedFeature.tags.map((tag) => (
                      <Chip key={tag} label={tag} color="primary" variant="outlined" size="small" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFeature(null)}>Close</Button>
          <Button variant="contained">Edit Feature</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeatureStorePage;






