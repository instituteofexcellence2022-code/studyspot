/**
 * Advanced Analytics Page
 * 
 * Features:
 * - Advanced data visualization and charts
 * - Custom analytics queries
 * - Data export and integration
 * - Real-time analytics streaming
 * - Predictive analytics and forecasting
 * - Cohort analysis and user segmentation
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper
} from '@mui/material';
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  AccountTree as FlowIcon,
  AccountTree as ParallelIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AllInclusive as AllInclusiveIcon,
  AllInclusive as AllInclusiveIcon2,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  AutoAwesome as AutomationIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BarChart as BarChartIcon2,
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Bluetooth as BluetoothIcon,
  BubbleChart as BubbleChartIcon,
  BubbleChart as BubbleChartIcon2,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  CalendarToday as CalendarTodayIcon2,
  CameraAlt as CameraIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Code as CodeIcon,
  Compare as CompareIcon,
  Dashboard as DashboardIcon,
  DataObject as DataObjectIcon,
  DataUsage as DataIcon,
  DateRange as DateRangeIcon,
  DateRange as DateRangeIcon2,
  DateRange as ThisMonthIcon,
  DateRange as ThisMonthIcon2,
  DateRange as ThisWeekIcon,
  DateRange as ThisWeekIcon2,
  DateRange as ThisYearIcon,
  DateRange as ThisYearIcon2,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  DeveloperBoard as BoardIcon,
  DonutLarge as DonutLargeIcon,
  DonutLarge as DonutLargeIcon2,
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
  Group as PsychologyIcon2,
  GroupAdd as GroupAddIcon,
  GroupRemove as GroupRemoveIcon,
  GroupWork as GroupWorkIcon,
  GroupWork as GroupWorkIcon2,
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
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  PersonSearch as PersonSearchIcon,
  PieChart as PieChartIcon,
  PieChart as PieChartIcon2,
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
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
  Schedule as DelayIcon,
  Schedule as ScheduleIcon,
  Schedule as ScheduleIcon2,
  Science as ScienceIcon,
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
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Sort as SortIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  Storage as DataStorageIcon,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  Sync as RealTimeIcon,
  Sync as SyncIcon,
  TableChart as TableChartIcon,
  TableChart as TableChartIcon2,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon2,
  Timeline as TimelineIcon3,
  Timeline as TimelineIcon4,
  Timer as TimerIcon,
  Today as TodayIcon,
  Today as TodayIcon2,
  TrendingDown as TrendingDownIcon,
  TrendingDown as TrendingDownIcon2,
  TrendingFlat as TrendingFlatIcon,
  TrendingFlat as TrendingFlatIcon2,
  TrendingUp as PredictionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingUp as TrendingUpIcon2,
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
interface AnalyticsQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  type: 'sql' | 'json' | 'api' | 'custom';
  category: 'revenue' | 'users' | 'usage' | 'performance' | 'security' | 'operations';
  status: 'active' | 'inactive' | 'draft' | 'error';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
  avgExecutionTime: number;
  resultCount: number;
}

interface DataExport {
  id: string;
  name: string;
  description: string;
  query: string;
  format: 'csv' | 'excel' | 'json' | 'pdf' | 'xml';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string;
    timezone: string;
  };
  destination: 'email' | 's3' | 'ftp' | 'api' | 'download';
  status: 'active' | 'inactive' | 'processing' | 'completed' | 'failed';
  lastExported?: string;
  nextExport?: string;
  fileSize?: number;
  recordCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CohortAnalysis {
  id: string;
  name: string;
  description: string;
  cohortType: 'user' | 'revenue' | 'engagement' | 'retention';
  timeRange: {
    start: string;
    end: string;
  };
  cohortSize: number;
  retentionRates: { [key: string]: number };
  status: 'active' | 'inactive' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: 'forecasting' | 'classification' | 'regression' | 'clustering';
  target: string;
  features: string[];
  accuracy: number;
  status: 'training' | 'active' | 'inactive' | 'error';
  lastTrained?: string;
  nextPrediction?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const AdvancedAnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [queries, setQueries] = useState<AnalyticsQuery[]>([]);
  const [exports, setExports] = useState<DataExport[]>([]);
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<AnalyticsQuery | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setQueries([
      {
        id: '1',
        name: 'Revenue by Tenant',
        description: 'Monthly revenue breakdown by tenant',
        query: 'SELECT tenant_name, SUM(amount) as revenue FROM payments WHERE created_at >= ? GROUP BY tenant_name ORDER BY revenue DESC',
        type: 'sql',
        category: 'revenue',
        status: 'active',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        lastExecuted: '2024-01-15T09:30:00Z',
        executionCount: 45,
        avgExecutionTime: 1.2,
        resultCount: 12
      },
      {
        id: '2',
        name: 'User Engagement Metrics',
        description: 'Daily active users and session duration',
        query: 'SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as dau, AVG(session_duration) as avg_duration FROM user_sessions WHERE created_at >= ? GROUP BY DATE(created_at)',
        type: 'sql',
        category: 'users',
        status: 'active',
        createdBy: 'analyst@company.com',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        lastExecuted: '2024-01-15T08:00:00Z',
        executionCount: 30,
        avgExecutionTime: 2.1,
        resultCount: 30
      },
      {
        id: '3',
        name: 'API Performance',
        description: 'API response times and error rates',
        query: 'SELECT endpoint, AVG(response_time) as avg_time, COUNT(*) as total_requests, SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors FROM api_logs WHERE created_at >= ? GROUP BY endpoint',
        type: 'sql',
        category: 'performance',
        status: 'active',
        createdBy: 'dev@company.com',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-13T14:20:00Z',
        lastExecuted: '2024-01-15T07:45:00Z',
        executionCount: 25,
        avgExecutionTime: 0.8,
        resultCount: 8
      }
    ]);

    setExports([
      {
        id: '1',
        name: 'Monthly Revenue Report',
        description: 'Comprehensive monthly revenue data export',
        query: 'SELECT * FROM revenue_data WHERE month = ?',
        format: 'excel',
        schedule: {
          frequency: 'monthly',
          time: '09:00',
          timezone: 'UTC'
        },
        destination: 'email',
        status: 'active',
        lastExported: '2024-01-01T09:00:00Z',
        nextExport: '2024-02-01T09:00:00Z',
        fileSize: 2048576,
        recordCount: 1250,
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'User Activity Export',
        description: 'Daily user activity data for analysis',
        query: 'SELECT * FROM user_activity WHERE date = ?',
        format: 'csv',
        schedule: {
          frequency: 'daily',
          time: '06:00',
          timezone: 'UTC'
        },
        destination: 's3',
        status: 'active',
        lastExported: '2024-01-15T06:00:00Z',
        nextExport: '2024-01-16T06:00:00Z',
        fileSize: 512000,
        recordCount: 5000,
        createdBy: 'analyst@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T06:00:00Z'
      }
    ]);

    setCohorts([
      {
        id: '1',
        name: 'User Retention Cohort',
        description: 'Monthly user retention analysis',
        cohortType: 'retention',
        timeRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        cohortSize: 1000,
        retentionRates: {
          'Week 1': 85.2,
          'Week 2': 72.1,
          'Week 3': 68.5,
          'Week 4': 64.3
        },
        status: 'completed',
        createdBy: 'analyst@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]);

    setModels([
      {
        id: '1',
        name: 'Revenue Forecasting',
        description: 'Predict monthly recurring revenue',
        type: 'forecasting',
        target: 'monthly_revenue',
        features: ['historical_revenue', 'user_growth', 'seasonality'],
        accuracy: 94.2,
        status: 'active',
        lastTrained: '2024-01-10T14:30:00Z',
        nextPrediction: '2024-01-16T00:00:00Z',
        createdBy: 'ml@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      case 'error': return 'error';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'training': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sql': return <DataObjectIcon />;
      case 'json': return <CodeIcon />;
      case 'api': return <ApiIcon />;
      case 'custom': return <FunctionsIcon />;
      case 'forecasting': return <TrendingUpIcon />;
      case 'classification': return <GroupIcon />;
      case 'regression': return <ShowChartIcon />;
      case 'clustering': return <ScatterPlotIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return <TableChartIcon />;
      case 'excel': return <AssessmentIcon />;
      case 'json': return <CodeIcon />;
      case 'pdf': return <DescriptionIcon />;
      case 'xml': return <CodeIcon />;
      default: return <FileDownloadIcon />;
    }
  };

  const filteredQueries = queries.filter((query: any) => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || query.type === filterType;
    const matchesStatus = filterStatus === 'all' || query.status === filterStatus;
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
            Advanced Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Custom queries, data exports, and predictive analytics
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
            New Query
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Queries" />
          <Tab label="Data Exports" />
          <Tab label="Cohort Analysis" />
          <Tab label="Predictive Models" />
        </Tabs>

        {/* Queries Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Analytics Queries</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search queries..."
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
                  <MenuItem value="sql">SQL</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="api">API</MenuItem>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Query</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Executions</TableCell>
                  <TableCell>Avg Time</TableCell>
                  <TableCell>Last Executed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getTypeIcon(query.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{query.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {query.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={query.type.toUpperCase()}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={query.category}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={query.status}
                        color={getStatusColor(query.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {query.executionCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {query.avgExecutionTime.toFixed(1)}s
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {query.lastExecuted ? (
                        <Typography variant="body2">
                          {new Date(query.lastExecuted).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedQuery(query)}>
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

        {/* Data Exports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Data Exports</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {exports.map((exportItem) => (
              <Card key={exportItem.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{exportItem.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exportItem.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={exportItem.status}
                      color={getStatusColor(exportItem.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Format:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getFormatIcon(exportItem.format)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {exportItem.format.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Destination:</Typography>
                      <Typography variant="body2">{exportItem.destination}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Schedule:</Typography>
                      <Typography variant="body2">
                        {exportItem.schedule ? `${exportItem.schedule.frequency} at ${exportItem.schedule.time}` : 'Manual'}
                      </Typography>
                    </Box>
                    {exportItem.fileSize && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">File Size:</Typography>
                        <Typography variant="body2">
                          {(exportItem.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    )}
                    {exportItem.recordCount && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Records:</Typography>
                        <Typography variant="body2">{exportItem.recordCount.toLocaleString()}</Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Cohort Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Cohort Analysis</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {cohorts.map((cohort) => (
              <Card key={cohort.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{cohort.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cohort.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={cohort.status}
                      color={getStatusColor(cohort.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Type:</Typography>
                      <Typography variant="body2">{cohort.cohortType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Cohort Size:</Typography>
                      <Typography variant="body2">{cohort.cohortSize.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Time Range:</Typography>
                      <Typography variant="body2">
                        {new Date(cohort.timeRange.start).toLocaleDateString()} - {new Date(cohort.timeRange.end).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Retention Rates</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {Object.entries(cohort.retentionRates).map(([period, rate]) => (
                      <Box key={period} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{period}:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {rate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={rate}
                            color={rate >= 70 ? 'success' : rate >= 50 ? 'warning' : 'error'}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
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

        {/* Predictive Models Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Predictive Models</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3 }}>
            {models.map((model) => (
              <Card key={model.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{model.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={model.status}
                      color={getStatusColor(model.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Type:</Typography>
                      <Typography variant="body2">{model.type}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Target:</Typography>
                      <Typography variant="body2">{model.target}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Accuracy:</Typography>
                      <Typography variant="body2">{model.accuracy.toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Features:</Typography>
                      <Typography variant="body2">{model.features.length}</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Features</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {model.features.map((feature) => (
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
                    <Button size="small" startIcon={<PlayIcon />}>
                      Run Prediction
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

      {/* Query Details Dialog */}
      <Dialog open={!!selectedQuery} onClose={() => setSelectedQuery(null)} maxWidth="lg" fullWidth>
        <DialogTitle>Query Details</DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedQuery.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedQuery.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Query Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedQuery.type.toUpperCase()}</Typography>
                      <Typography variant="body2">Category: {selectedQuery.category}</Typography>
                      <Typography variant="body2">Status: {selectedQuery.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Executions: {selectedQuery.executionCount.toLocaleString()}</Typography>
                      <Typography variant="body2">Avg Time: {selectedQuery.avgExecutionTime.toFixed(1)}s</Typography>
                      <Typography variant="body2">Results: {selectedQuery.resultCount.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Query</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {selectedQuery.query}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedQuery(null)}>Close</Button>
          <Button variant="contained">Execute Query</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAnalyticsPage;
