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
 * ML Platform Management Page
 * 
 * Features:
 * - Feature store and data pipeline management
 * - Model registry and version control
 * - Training jobs and experiment management
 * - Model monitoring and performance tracking
 * - MLOps and deployment automation
 * - Model governance and compliance
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
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
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
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Cloud as CloudIcon2,
  CloudDownload as CloudDownloadIcon,
  CloudDownload as CloudDownloadIcon2,
  CloudUpload as CloudUploadIcon,
  CloudUpload as CloudUploadIcon2,
  Code as CodeIcon,
  Compare as CompareIcon,
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
  MultilineChart as MultilineChartIcon,
  MultilineChart as MultilineChartIcon2,
  MultilineChart as MultilineChartIcon3,
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
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
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  Power as PowerIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as MLIcon,
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
  Stop as StopIcon,
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
interface FeatureStore {
  id: string;
  name: string;
  description: string;
  type: 'numerical' | 'categorical' | 'text' | 'image' | 'time_series';
  dataType: 'int' | 'float' | 'string' | 'boolean' | 'datetime' | 'array' | 'object';
  source: 'database' | 'api' | 'file' | 'stream' | 'computed';
  status: 'active' | 'inactive' | 'deprecated' | 'error';
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
  };
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'nlp' | 'computer_vision';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'lightgbm' | 'custom';
  version: string;
  status: 'training' | 'ready' | 'deployed' | 'deprecated' | 'error';
  accuracy: number;
  metrics: { [key: string]: number };
  features: string[];
  target: string;
  algorithm: string;
  hyperparameters: { [key: string]: any };
  size: number; // bytes
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTrained?: string;
  lastDeployed?: string;
  deploymentCount: number;
  predictionCount: number;
}

interface TrainingJob {
  id: string;
  name: string;
  description: string;
  modelId: string;
  modelName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  dataset: string;
  features: string[];
  target: string;
  algorithm: string;
  hyperparameters: { [key: string]: any };
  metrics: { [key: string]: number };
  startedAt?: string;
  completedAt?: string;
  duration?: number; // seconds
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  logs: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ModelMonitoring {
  id: string;
  modelId: string;
  modelName: string;
  metric: string;
  value: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  description: string;
}

const MLPlatformPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [features, setFeatures] = useState<FeatureStore[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [monitoring, setMonitoring] = useState<ModelMonitoring[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
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
          max: 65
        },
        tags: ['demographic', 'user_profile'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastUpdated: '2024-01-15T09:30:00Z'
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
          max: 480
        },
        tags: ['behavioral', 'engagement'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastUpdated: '2024-01-15T08:45:00Z'
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
          uniqueCount: 4
        },
        tags: ['demographic', 'classification'],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z',
        lastUpdated: '2024-01-15T07:30:00Z'
      }
    ]);

    setModels([
      {
        id: '1',
        name: 'user_churn_prediction',
        description: 'Predict user churn probability',
        type: 'classification',
        framework: 'scikit-learn',
        version: '1.3.0',
        status: 'deployed',
        accuracy: 0.94,
        metrics: {
          precision: 0.92,
          recall: 0.89,
          f1_score: 0.90,
          auc_roc: 0.95
        },
        features: ['user_age', 'session_duration', 'user_segment', 'last_login_days'],
        target: 'churn_probability',
        algorithm: 'RandomForestClassifier',
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
          random_state: 42
        },
        size: 2048576,
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastTrained: '2024-01-10T14:30:00Z',
        lastDeployed: '2024-01-12T09:15:00Z',
        deploymentCount: 3,
        predictionCount: 15420
      },
      {
        id: '2',
        name: 'revenue_forecasting',
        description: 'Predict monthly recurring revenue',
        type: 'regression',
        framework: 'tensorflow',
        version: '2.1.0',
        status: 'ready',
        accuracy: 0.87,
        metrics: {
          mse: 0.023,
          mae: 0.145,
          r2_score: 0.87,
          rmse: 0.152
        },
        features: ['historical_revenue', 'user_growth', 'seasonality', 'marketing_spend'],
        target: 'monthly_revenue',
        algorithm: 'LSTM',
        hyperparameters: {
          units: 64,
          dropout: 0.2,
          epochs: 100,
          batch_size: 32
        },
        size: 5242880,
        createdBy: 'ml@company.com',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastTrained: '2024-01-14T16:30:00Z',
        deploymentCount: 0,
        predictionCount: 0
      }
    ]);

    setTrainingJobs([
      {
        id: '1',
        name: 'churn_model_v2',
        description: 'Retrain churn prediction model with new data',
        modelId: '1',
        modelName: 'user_churn_prediction',
        status: 'running',
        progress: 65,
        dataset: 'user_behavior_2024_01',
        features: ['user_age', 'session_duration', 'user_segment', 'last_login_days'],
        target: 'churn_probability',
        algorithm: 'RandomForestClassifier',
        hyperparameters: {
          n_estimators: 150,
          max_depth: 12,
          min_samples_split: 3
        },
        metrics: {
          accuracy: 0.0,
          precision: 0.0,
          recall: 0.0,
          f1_score: 0.0
        },
        startedAt: '2024-01-15T09:00:00Z',
        resources: {
          cpu: 4,
          memory: 8192,
          gpu: 1
        },
        logs: [
          'Starting training job...',
          'Loading dataset: user_behavior_2024_01',
          'Preprocessing features...',
          'Training RandomForestClassifier...',
          'Current epoch: 65/100'
        ],
        createdBy: 'ml@company.com',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    ]);

    setMonitoring([
      {
        id: '1',
        modelId: '1',
        modelName: 'user_churn_prediction',
        metric: 'accuracy',
        value: 0.92,
        threshold: 0.90,
        status: 'healthy',
        trend: 'up',
        timestamp: '2024-01-15T10:00:00Z',
        description: 'Model accuracy is above threshold'
      },
      {
        id: '2',
        modelId: '1',
        modelName: 'user_churn_prediction',
        metric: 'prediction_latency',
        value: 150,
        threshold: 200,
        status: 'healthy',
        trend: 'stable',
        timestamp: '2024-01-15T10:00:00Z',
        description: 'Prediction latency is within acceptable range'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deprecated': return 'warning';
      case 'error': return 'error';
      case 'ready': return 'success';
      case 'training': return 'info';
      case 'deployed': return 'success';
      case 'queued': return 'info';
      case 'running': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
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
      case 'classification': return <GroupIcon />;
      case 'regression': return <ShowChartIcon />;
      case 'clustering': return <ScatterPlotIcon />;
      case 'recommendation': return <GroupIcon />;
      case 'nlp': return <PsychologyIcon />;
      case 'computer_vision': return <CameraIcon />;
      default: return <MLIcon />;
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'tensorflow': return <CodeIcon />;
      case 'pytorch': return <CodeIcon />;
      case 'scikit-learn': return <ScienceIcon />;
      case 'xgboost': return <TrendingUpIcon />;
      case 'lightgbm': return <SpeedIcon />;
      case 'custom': return <BuildIcon />;
      default: return <CodeIcon />;
    }
  };

  const filteredModels = models.filter((model: any) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || model.type === filterType;
    const matchesStatus = filterStatus === 'all' || model.status === filterStatus;
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
            ML Platform
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Feature store, model registry, training jobs, and monitoring
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
            New Model
          </Button>
        </Box>
      </Box>

      {/* ML Platform Metrics Cards */}
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
                <Typography variant="h6">Features</Typography>
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
                <ModelTrainingIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Models</Typography>
                <Typography variant="h4">{models.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {models.filter((m: any) => m.status === 'deployed').length} deployed
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
                <Typography variant="h6">Training Jobs</Typography>
                <Typography variant="h4">{trainingJobs.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {trainingJobs.filter((j: any) => j.status === 'running').length} running
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
                <Typography variant="h6">Alerts</Typography>
                <Typography variant="h4">{monitoring.filter((m: any) => m.status === 'critical').length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {monitoring.filter((m: any) => m.status === 'warning').length} warnings
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Feature Store" />
          <Tab label="Model Registry" />
          <Tab label="Training Jobs" />
          <Tab label="Monitoring" />
        </Tabs>

        {/* Feature Store Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Feature Store</Typography>
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
                  <TableCell>Statistics</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map((feature) => (
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
                      <Typography variant="body2">
                        Count: {feature.statistics.count.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unique: {feature.statistics.uniqueCount.toLocaleString()}
                      </Typography>
                      {feature.statistics.mean && (
                        <Typography variant="body2" color="text.secondary">
                          Mean: {feature.statistics.mean.toFixed(2)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(feature.lastUpdated).toLocaleString()}
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

        {/* Model Registry Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Model Registry</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search models..."
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
                  <MenuItem value="classification">Classification</MenuItem>
                  <MenuItem value="regression">Regression</MenuItem>
                  <MenuItem value="clustering">Clustering</MenuItem>
                  <MenuItem value="recommendation">Recommendation</MenuItem>
                  <MenuItem value="nlp">NLP</MenuItem>
                  <MenuItem value="computer_vision">Computer Vision</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="ready">Ready</MenuItem>
                  <MenuItem value="deployed">Deployed</MenuItem>
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Framework</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Accuracy</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Predictions</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(model.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{model.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
                          {getFrameworkIcon(model.framework)}
                        </Avatar>
                        <Typography variant="body2">
                          {model.framework}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.status}
                        color={getStatusColor(model.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(model.accuracy * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        v{model.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {model.predictionCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedModel(model)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PlayIcon />
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

        {/* Training Jobs Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Training Jobs</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {trainingJobs.map((job) => (
              <Card key={job.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{job.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Model:</Typography>
                      <Typography variant="body2">{job.modelName}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Algorithm:</Typography>
                      <Typography variant="body2">{job.algorithm}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Dataset:</Typography>
                      <Typography variant="body2">{job.dataset}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Progress:</Typography>
                      <Typography variant="body2">{job.progress}%</Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={job.progress}
                    color={job.status === 'running' ? 'primary' : job.status === 'completed' ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Logs
                    </Button>
                    <Button size="small" startIcon={<StopIcon />}>
                      Cancel
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Monitoring Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Model Monitoring</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {monitoring.map((alert) => (
              <Card key={alert.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{alert.modelName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.metric}: {alert.value}
                      </Typography>
                    </Box>
                    <Chip
                      label={alert.status}
                      color={getStatusColor(alert.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Threshold:</Typography>
                      <Typography variant="body2">{alert.threshold}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Trend:</Typography>
                      <Typography variant="body2">{alert.trend}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Timestamp:</Typography>
                      <Typography variant="body2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {alert.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<SettingsIcon />}>
                      Configure
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Card>

      {/* Model Details Dialog */}
      <Dialog open={!!selectedModel} onClose={() => setSelectedModel(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Model Details</DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedModel.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedModel.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Model Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedModel.type}</Typography>
                      <Typography variant="body2">Framework: {selectedModel.framework}</Typography>
                      <Typography variant="body2">Algorithm: {selectedModel.algorithm}</Typography>
                      <Typography variant="body2">Status: {selectedModel.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Version: v{selectedModel.version}</Typography>
                      <Typography variant="body2">Accuracy: {(selectedModel.accuracy * 100).toFixed(1)}%</Typography>
                      <Typography variant="body2">Size: {(selectedModel.size / 1024 / 1024).toFixed(2)} MB</Typography>
                      <Typography variant="body2">Predictions: {selectedModel.predictionCount.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Features</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedModel.features.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    {Object.entries(selectedModel.metrics).map(([metric, value]) => (
                      <Box key={metric} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{metric}:</Typography>
                        <Typography variant="body2">{value.toFixed(3)}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedModel(null)}>Close</Button>
          <Button variant="contained">Deploy Model</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MLPlatformPage;
