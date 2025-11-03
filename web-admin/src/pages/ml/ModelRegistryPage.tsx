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
 * Model Registry Management Page
 * 
 * Features:
 * - Model versioning and lifecycle management
 * - Model metadata and artifact storage
 * - Model deployment and serving
 * - Model performance tracking
 * - Model governance and compliance
 * - Model collaboration and sharing
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
interface Model {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'nlp' | 'computer_vision' | 'time_series';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'lightgbm' | 'huggingface' | 'custom';
  version: string;
  status: 'training' | 'ready' | 'staging' | 'production' | 'deprecated' | 'error' | 'archived';
  accuracy: number;
  metrics: { [key: string]: number };
  features: string[];
  target: string;
  algorithm: string;
  hyperparameters: { [key: string]: any };
  size: number; // bytes
  artifacts: {
    model: string;
    weights: string;
    config: string;
    preprocessor: string;
    postprocessor: string;
  };
  performance: {
    latency: number; // ms
    throughput: number; // requests per second
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
  };
  governance: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approver: string;
    approvedAt?: string;
    compliance: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTrained?: string;
  lastDeployed?: string;
  deploymentCount: number;
  predictionCount: number;
  tags: string[];
  documentation: string;
  changelog: Array<{
    version: string;
    changes: string[];
    date: string;
    author: string;
  }>;
}

interface ModelVersion {
  id: string;
  modelId: string;
  version: string;
  status: 'training' | 'ready' | 'staging' | 'production' | 'deprecated' | 'error';
  accuracy: number;
  metrics: { [key: string]: number };
  size: number;
  createdAt: string;
  createdBy: string;
  description: string;
  changelog: string[];
}

interface ModelDeployment {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'deploying' | 'active' | 'inactive' | 'error' | 'scaling';
  endpoint: string;
  replicas: number;
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  performance: {
    latency: number;
    throughput: number;
    errorRate: number;
  };
  createdAt: string;
  createdBy: string;
  lastUpdated: string;
}

const ModelRegistryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [models, setModels] = useState<Model[]>([]);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setModels([
      {
        id: '1',
        name: 'user_churn_prediction',
        description: 'Predict user churn probability using behavioral features',
        type: 'classification',
        framework: 'scikit-learn',
        version: '1.3.0',
        status: 'production',
        accuracy: 0.94,
        metrics: {
          precision: 0.92,
          recall: 0.89,
          f1_score: 0.90,
          auc_roc: 0.95,
          log_loss: 0.23
        },
        features: ['user_age', 'session_duration', 'user_segment', 'last_login_days', 'page_views'],
        target: 'churn_probability',
        algorithm: 'RandomForestClassifier',
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 5,
          random_state: 42
        },
        size: 2048576,
        artifacts: {
          model: 'model.pkl',
          weights: 'weights.npy',
          config: 'config.json',
          preprocessor: 'preprocessor.pkl',
          postprocessor: 'postprocessor.pkl'
        },
        performance: {
          latency: 45,
          throughput: 1000,
          memoryUsage: 512,
          cpuUsage: 25
        },
        governance: {
          approvalStatus: 'approved',
          approver: 'ml-lead@company.com',
          approvedAt: '2024-01-12T09:15:00Z',
          compliance: ['GDPR', 'SOC2'],
          riskLevel: 'low'
        },
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastTrained: '2024-01-10T14:30:00Z',
        lastDeployed: '2024-01-12T09:15:00Z',
        deploymentCount: 3,
        predictionCount: 15420,
        tags: ['churn', 'classification', 'production'],
        documentation: 'This model predicts user churn probability based on behavioral features...',
        changelog: [
          {
            version: '1.3.0',
            changes: ['Added new features', 'Improved accuracy', 'Fixed memory leak'],
            date: '2024-01-10T14:30:00Z',
            author: 'ml@company.com'
          },
          {
            version: '1.2.0',
            changes: ['Updated hyperparameters', 'Added feature engineering'],
            date: '2024-01-05T10:15:00Z',
            author: 'ml@company.com'
          }
        ]
      },
      {
        id: '2',
        name: 'revenue_forecasting',
        description: 'Predict monthly recurring revenue using time series analysis',
        type: 'time_series',
        framework: 'tensorflow',
        version: '2.1.0',
        status: 'staging',
        accuracy: 0.87,
        metrics: {
          mse: 0.023,
          mae: 0.145,
          r2_score: 0.87,
          rmse: 0.152,
          mape: 0.08
        },
        features: ['historical_revenue', 'user_growth', 'seasonality', 'marketing_spend', 'churn_rate'],
        target: 'monthly_revenue',
        algorithm: 'LSTM',
        hyperparameters: {
          units: 64,
          dropout: 0.2,
          epochs: 100,
          batch_size: 32,
          learning_rate: 0.001
        },
        size: 5242880,
        artifacts: {
          model: 'model.h5',
          weights: 'weights.h5',
          config: 'config.json',
          preprocessor: 'scaler.pkl',
          postprocessor: 'postprocessor.pkl'
        },
        performance: {
          latency: 120,
          throughput: 500,
          memoryUsage: 1024,
          cpuUsage: 45
        },
        governance: {
          approvalStatus: 'pending',
          approver: 'ml-lead@company.com',
          compliance: ['SOC2'],
          riskLevel: 'medium'
        },
        createdBy: 'ml@company.com',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastTrained: '2024-01-14T16:30:00Z',
        deploymentCount: 1,
        predictionCount: 0,
        tags: ['forecasting', 'time_series', 'staging'],
        documentation: 'This model forecasts monthly recurring revenue using LSTM neural networks...',
        changelog: [
          {
            version: '2.1.0',
            changes: ['Improved LSTM architecture', 'Added attention mechanism', 'Better feature engineering'],
            date: '2024-01-14T16:30:00Z',
            author: 'ml@company.com'
          }
        ]
      }
    ]);

    setVersions([
      {
        id: '1',
        modelId: '1',
        version: '1.3.0',
        status: 'production',
        accuracy: 0.94,
        metrics: { precision: 0.92, recall: 0.89, f1_score: 0.90 },
        size: 2048576,
        createdAt: '2024-01-10T14:30:00Z',
        createdBy: 'ml@company.com',
        description: 'Latest version with improved accuracy',
        changelog: ['Added new features', 'Improved accuracy', 'Fixed memory leak']
      },
      {
        id: '2',
        modelId: '1',
        version: '1.2.0',
        status: 'deprecated',
        accuracy: 0.91,
        metrics: { precision: 0.89, recall: 0.87, f1_score: 0.88 },
        size: 1800000,
        createdAt: '2024-01-05T10:15:00Z',
        createdBy: 'ml@company.com',
        description: 'Previous version with updated hyperparameters',
        changelog: ['Updated hyperparameters', 'Added feature engineering']
      }
    ]);

    setDeployments([
      {
        id: '1',
        modelId: '1',
        modelName: 'user_churn_prediction',
        version: '1.3.0',
        environment: 'production',
        status: 'active',
        endpoint: 'https://api.company.com/v1/models/churn-prediction',
        replicas: 3,
        resources: {
          cpu: 2,
          memory: 4096,
          gpu: 0
        },
        performance: {
          latency: 45,
          throughput: 1000,
          errorRate: 0.01
        },
        createdAt: '2024-01-12T09:15:00Z',
        createdBy: 'ml@company.com',
        lastUpdated: '2024-01-15T10:00:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'production': return 'success';
      case 'staging': return 'info';
      case 'ready': return 'success';
      case 'training': return 'info';
      case 'deprecated': return 'warning';
      case 'error': return 'error';
      case 'archived': return 'default';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'deploying': return 'info';
      case 'scaling': return 'warning';
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <GroupIcon />;
      case 'regression': return <ShowChartIcon />;
      case 'clustering': return <ScatterPlotIcon />;
      case 'recommendation': return <GroupIcon />;
      case 'nlp': return <PsychologyIcon />;
      case 'computer_vision': return <CameraIcon />;
      case 'time_series': return <TimelineIcon />;
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
      case 'huggingface': return <PsychologyIcon />;
      case 'custom': return <BuildIcon />;
      default: return <CodeIcon />;
    }
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
            Model Registry
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Model versioning, deployment, and lifecycle management
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
            Register Model
          </Button>
        </Box>
      </Box>

      {/* Model Registry Metrics Cards */}
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
                <MLIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Models</Typography>
                <Typography variant="h4">{models.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {models.filter((m: any) => m.status === 'production').length} in production
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PlayIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Active Deployments</Typography>
                <Typography variant="h4">{deployments.filter((d: any) => d.status === 'active').length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {deployments.reduce((acc, d) => acc + d.replicas, 0)} total replicas
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Accuracy</Typography>
                <Typography variant="h4">
                  {Math.round(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all models
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
                <Typography variant="h6">Pending Approval</Typography>
                <Typography variant="h4">
                  {models.filter((m: any) => m.governance.approvalStatus === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Models awaiting review
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Model Catalog" />
          <Tab label="Versions" />
          <Tab label="Deployments" />
          <Tab label="Governance" />
        </Tabs>

        {/* Model Catalog Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Model Catalog</Typography>
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
                  <MenuItem value="time_series">Time Series</MenuItem>
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
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="deprecated">Deprecated</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
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
                  <TableCell>Risk Level</TableCell>
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
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {model.tags.slice(0, 2).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Box>
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
                      <Chip
                        label={model.governance.riskLevel}
                        color={getRiskColor(model.governance.riskLevel) as any}
                        size="small"
                      />
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

        {/* Versions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Model Versions</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Accuracy</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {models.find(m => m.id === version.modelId)?.name || 'Unknown Model'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">v{version.version}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={version.status}
                        color={getStatusColor(version.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(version.accuracy * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {(version.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{version.createdBy}</Typography>
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

        {/* Deployments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Model Deployments</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3 }}>
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{deployment.modelName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        v{deployment.version} - {deployment.environment}
                      </Typography>
                    </Box>
                    <Chip
                      label={deployment.status}
                      color={getStatusColor(deployment.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Endpoint:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {deployment.endpoint}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Replicas:</Typography>
                      <Typography variant="body2">{deployment.replicas}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Latency:</Typography>
                      <Typography variant="body2">{deployment.performance.latency}ms</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Throughput:</Typography>
                      <Typography variant="body2">{deployment.performance.throughput} req/s</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Error Rate:</Typography>
                      <Typography variant="body2">{(deployment.performance.errorRate * 100).toFixed(2)}%</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<SettingsIcon />}>
                      Configure
                    </Button>
                    <Button size="small" startIcon={<StopIcon />}>
                      Stop
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Governance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Model Governance</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Approval Status</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Compliance</TableCell>
                  <TableCell>Approver</TableCell>
                  <TableCell>Approved At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{model.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        v{model.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.governance.approvalStatus}
                        color={getStatusColor(model.governance.approvalStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={model.governance.riskLevel}
                        color={getRiskColor(model.governance.riskLevel) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {model.governance.compliance.map((comp) => (
                          <Chip key={comp} label={comp} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{model.governance.approver}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {model.governance.approvedAt ? 
                          new Date(model.governance.approvedAt).toLocaleDateString() : 
                          'Not approved'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <CheckIcon />
                        </IconButton>
                        <IconButton size="small">
                          <CancelIcon />
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
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    {Object.entries(selectedModel.metrics).map(([metric, value]) => (
                      <Box key={metric} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{metric}:</Typography>
                        <Typography variant="body2">{value.toFixed(3)}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Performance</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Latency: {selectedModel.performance.latency}ms</Typography>
                    <Typography variant="body2">Throughput: {selectedModel.performance.throughput} req/s</Typography>
                    <Typography variant="body2">Memory Usage: {selectedModel.performance.memoryUsage} MB</Typography>
                    <Typography variant="body2">CPU Usage: {selectedModel.performance.cpuUsage}%</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Governance</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Typography variant="body2">Approval Status: {selectedModel.governance.approvalStatus}</Typography>
                    <Typography variant="body2">Risk Level: {selectedModel.governance.riskLevel}</Typography>
                    <Typography variant="body2">Approver: {selectedModel.governance.approver}</Typography>
                    <Typography variant="body2">Compliance: {selectedModel.governance.compliance.join(', ')}</Typography>
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

export default ModelRegistryPage;
