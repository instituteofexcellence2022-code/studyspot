/**
 * Business Intelligence Dashboard Page
 * 
 * Features:
 * - Executive dashboards and KPIs
 * - Revenue analytics and forecasting
 * - User behavior analytics
 * - System performance metrics
 * - Custom dashboard builder
 * - Data visualization and charts
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
  Divider,
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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { AccessTime as AccessTimeIcon,
  AccountBalance as BillingIcon,
  AccountTree as FlowIcon,
  AccountTree as ParallelIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  AllInclusive as AllInclusiveIcon,
  Analytics as AnalyticsIcon,
  Api as ApiIcon,
  ArrowForward as ArrowIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  AutoAwesome as AutomationIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  BatteryFull as BatteryIcon,
  Biotech as BiotechIcon,
  Bluetooth as BluetoothIcon,
  BubbleChart as BubbleChartIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  CameraAlt as CameraIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  Compare as CompareIcon,
  Dashboard as DashboardIcon,
  DataUsage as DataIcon,
  DateRange as DateRangeIcon,
  DateRange as ThisMonthIcon,
  DateRange as ThisWeekIcon,
  DateRange as ThisYearIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Description as DocumentIcon,
  DeveloperBoard as BoardIcon,
  DonutLarge as DonutLargeIcon,
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
  Gavel as GavelIcon,
  Group as GroupIcon,
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
  NetworkCheck as NetworkIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PlayArrow as TriggerIcon,
  PlayCircle as PlayCircleIcon,
  PlaylistAdd as AddStepIcon,
  PlaylistPlay as WorkflowIcon,
  Power as PowerIcon,
  PrivacyTip as PrivacyIcon,
  Psychology as PsychologyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Router as RouterIcon,
  Rule as ConditionIcon,
  Rule as RuleIcon,
  Scanner as ScannerIcon,
  ScatterPlot as ScatterPlotIcon,
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
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Sort as SortIcon,
  Speed as SpeedIcon,
  Speed as SpeedIcon2,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  Storage as StorageIcon,
  Storage as StorageIcon2,
  TableChart as TableChartIcon,
  Thermostat as TemperatureIcon,
  Timeline as TimelineIcon,
  Timeline as TimelineIcon2,
  Timer as TimerIcon,
  Today as TodayIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
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
interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  category: 'revenue' | 'users' | 'usage' | 'performance' | 'security' | 'operations';
  trend: 'up' | 'down' | 'stable';
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'list' | 'gauge' | 'map' | 'heatmap';
  data: any;
  position: { x: number; y: number; w: number; h: number };
  config: { [key: string]: any };
  refreshInterval?: number;
  lastUpdated: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'financial' | 'technical' | 'custom';
  category: 'revenue' | 'users' | 'usage' | 'performance' | 'security' | 'operations';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string;
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'active' | 'inactive' | 'draft';
  lastGenerated?: string;
  nextGeneration?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  detectedAt: string;
  resolvedAt?: string;
  description: string;
  category: 'revenue' | 'users' | 'usage' | 'performance' | 'security' | 'operations';
  tenantId?: string;
  tenantName?: string;
}

const BusinessIntelligencePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data
  useEffect(() => {
    setKpiMetrics([
      {
        id: '1',
        name: 'Monthly Recurring Revenue',
        value: 125000,
        previousValue: 110000,
        change: 13.6,
        changeType: 'increase',
        unit: 'USD',
        format: 'currency',
        category: 'revenue',
        trend: 'up',
        target: 150000,
        status: 'good'
      },
      {
        id: '2',
        name: 'Active Users',
        value: 2840,
        previousValue: 2650,
        change: 7.2,
        changeType: 'increase',
        unit: 'users',
        format: 'number',
        category: 'users',
        trend: 'up',
        target: 3000,
        status: 'good'
      },
      {
        id: '3',
        name: 'System Uptime',
        value: 99.8,
        previousValue: 99.5,
        change: 0.3,
        changeType: 'increase',
        unit: '%',
        format: 'percentage',
        category: 'performance',
        trend: 'up',
        target: 99.9,
        status: 'good'
      },
      {
        id: '4',
        name: 'Average Response Time',
        value: 285,
        previousValue: 320,
        change: -10.9,
        changeType: 'decrease',
        unit: 'ms',
        format: 'duration',
        category: 'performance',
        trend: 'up',
        target: 200,
        status: 'warning'
      },
      {
        id: '5',
        name: 'Security Incidents',
        value: 3,
        previousValue: 8,
        change: -62.5,
        changeType: 'decrease',
        unit: 'incidents',
        format: 'number',
        category: 'security',
        trend: 'up',
        target: 0,
        status: 'good'
      },
      {
        id: '6',
        name: 'Customer Satisfaction',
        value: 4.7,
        previousValue: 4.5,
        change: 4.4,
        changeType: 'increase',
        unit: '/5',
        format: 'number',
        category: 'users',
        trend: 'up',
        target: 4.8,
        status: 'good'
      }
    ]);

    setDashboardWidgets([
      {
        id: '1',
        title: 'Revenue Trend',
        type: 'chart',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [85000, 92000, 98000, 105000, 115000, 125000],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          }]
        },
        position: { x: 0, y: 0, w: 6, h: 4 },
        config: { type: 'line' },
        refreshInterval: 300000,
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'User Distribution',
        type: 'chart',
        data: {
          labels: ['Students', 'Staff', 'Visitors', 'Admins'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        position: { x: 6, y: 0, w: 6, h: 4 },
        config: { type: 'doughnut' },
        refreshInterval: 600000,
        lastUpdated: '2024-01-15T10:25:00Z'
      },
      {
        id: '3',
        title: 'Top Libraries',
        type: 'table',
        data: [
          { name: 'University of California', users: 1250, revenue: 45000 },
          { name: 'MIT Libraries', users: 890, revenue: 32000 },
          { name: 'Stanford Library', users: 650, revenue: 28000 },
          { name: 'Harvard Library', users: 420, revenue: 20000 }
        ],
        position: { x: 0, y: 4, w: 12, h: 3 },
        config: { sortable: true, pagination: true },
        refreshInterval: 900000,
        lastUpdated: '2024-01-15T10:20:00Z'
      }
    ]);

    setReports([
      {
        id: '1',
        name: 'Executive Summary',
        description: 'Monthly executive summary with key metrics and insights',
        type: 'executive',
        category: 'revenue',
        schedule: {
          frequency: 'monthly',
          time: '09:00',
          timezone: 'UTC'
        },
        recipients: ['ceo@company.com', 'cfo@company.com'],
        format: 'pdf',
        status: 'active',
        lastGenerated: '2024-01-01T09:00:00Z',
        nextGeneration: '2024-02-01T09:00:00Z',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Daily Operations Report',
        description: 'Daily operational metrics and system health',
        type: 'operational',
        category: 'performance',
        schedule: {
          frequency: 'daily',
          time: '08:00',
          timezone: 'UTC'
        },
        recipients: ['ops@company.com', 'dev@company.com'],
        format: 'excel',
        status: 'active',
        lastGenerated: '2024-01-15T08:00:00Z',
        nextGeneration: '2024-01-16T08:00:00Z',
        createdBy: 'ops@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T08:00:00Z'
      }
    ]);

    setAnomalies([
      {
        id: '1',
        metric: 'API Response Time',
        value: 1200,
        expectedValue: 300,
        deviation: 300,
        severity: 'high',
        status: 'investigating',
        detectedAt: '2024-01-15T09:30:00Z',
        description: 'API response time spiked to 1200ms, significantly above normal 300ms',
        category: 'performance',
        tenantId: 'tenant-1',
        tenantName: 'University of California'
      },
      {
        id: '2',
        metric: 'Failed Login Attempts',
        value: 45,
        expectedValue: 5,
        deviation: 800,
        severity: 'critical',
        status: 'new',
        detectedAt: '2024-01-15T10:15:00Z',
        description: 'Unusual spike in failed login attempts detected',
        category: 'security'
      }
    ]);
  }, []);

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'success';
      case 'decrease': return 'error';
      case 'neutral': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      case 'new': return 'error';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      case 'false_positive': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value}ms`;
      default:
        return `${value.toLocaleString()} ${unit}`;
    }
  };

  const filteredMetrics = kpiMetrics.filter((metric: any) => 
    selectedCategory === 'all' || metric.category === selectedCategory
  );

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
            Business Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics, reporting, and business insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last 24h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
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
            Create Report
          </Button>
        </Box>
      </Box>

      {/* KPI Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        {filteredMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {metric.name}
                </Typography>
                <Chip
                  label={metric.status}
                  color={getStatusColor(metric.status) as any}
                  size="small"
                />
              </Box>
              <Typography variant="h4" gutterBottom>
                {formatValue(metric.value, metric.format, metric.unit)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {metric.changeType === 'increase' ? (
                    <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                  ) : metric.changeType === 'decrease' ? (
                    <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                  ) : (
                    <CompareIcon color="inherit" sx={{ mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={getChangeColor(metric.changeType) as any}
                  >
                    {Math.abs(metric.change).toFixed(1)}%
                  </Typography>
                </Box>
                {metric.target && (
                  <Typography variant="body2" color="text.secondary">
                    Target: {formatValue(metric.target, metric.format, metric.unit)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Reports" />
          <Tab label="Anomalies" />
          <Tab label="Metrics" />
        </Tabs>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Executive Dashboard</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="users">Users</MenuItem>
                  <MenuItem value="usage">Usage</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="operations">Operations</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<SettingsIcon />}>
                Customize
              </Button>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {dashboardWidgets.map((widget) => (
              <Card key={widget.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{widget.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small">
                        <SettingsIcon />
                      </IconButton>
                      <IconButton size="small">
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {widget.type === 'chart' && (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Chart placeholder</Typography>
                    </Box>
                  )}
                  
                  {widget.type === 'table' && (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Users</TableCell>
                            <TableCell>Revenue</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {widget.data.map((row: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.users.toLocaleString()}</TableCell>
                              <TableCell>${row.revenue.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(widget.lastUpdated).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Reports</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search reports..."
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export All
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Generated</TableCell>
                  <TableCell>Next Generation</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{report.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {report.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.category}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {report.schedule ? (
                        <Typography variant="body2">
                          {report.schedule.frequency} at {report.schedule.time}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Manual
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {report.lastGenerated ? (
                        <Typography variant="body2">
                          {new Date(report.lastGenerated).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Never
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.nextGeneration ? (
                        <Typography variant="body2">
                          {new Date(report.nextGeneration).toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedReport(report)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
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

        {/* Anomalies Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Anomaly Detection</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<SettingsIcon />}>
                Configure
              </Button>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add Rule
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{anomaly.metric}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {anomaly.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={anomaly.severity}
                        color={getSeverityColor(anomaly.severity) as any}
                        size="small"
                      />
                      <Chip
                        label={anomaly.status}
                        color={getStatusColor(anomaly.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Current Value</Typography>
                      <Typography variant="h6">{anomaly.value.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Expected Value</Typography>
                      <Typography variant="h6">{anomaly.expectedValue.toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Deviation</Typography>
                      <Typography variant="h6" color="error">
                        {anomaly.deviation.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Detected At</Typography>
                      <Typography variant="body2">
                        {new Date(anomaly.detectedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      Investigate
                    </Button>
                    <Button size="small" startIcon={<CheckIcon />}>
                      Resolve
                    </Button>
                    <Button size="small" startIcon={<CancelIcon />}>
                      False Positive
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Metrics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Metrics Catalog</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Metrics</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Monthly Recurring Revenue" secondary="Total recurring revenue per month" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Annual Recurring Revenue" secondary="Total recurring revenue per year" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Average Revenue Per User" secondary="ARPU calculation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Customer Lifetime Value" secondary="CLV calculation" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>User Metrics</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Active Users" secondary="Users active in the last 30 days" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="New User Registrations" secondary="New user sign-ups" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="User Retention Rate" secondary="Percentage of users retained" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Customer Satisfaction" secondary="CSAT score" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="System Uptime" secondary="Percentage of time system is available" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Response Time" secondary="Average API response time" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Throughput" secondary="Requests per second" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Error Rate" secondary="Percentage of failed requests" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedReport.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedReport.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Report Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Type: {selectedReport.type}</Typography>
                      <Typography variant="body2">Category: {selectedReport.category}</Typography>
                      <Typography variant="body2">Format: {selectedReport.format.toUpperCase()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Status: {selectedReport.status}</Typography>
                      <Typography variant="body2">Created By: {selectedReport.createdBy}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedReport.createdAt).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                {selectedReport.schedule && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Schedule</Typography>
                    <Typography variant="body2">Frequency: {selectedReport.schedule.frequency}</Typography>
                    <Typography variant="body2">Time: {selectedReport.schedule.time} ({selectedReport.schedule.timezone})</Typography>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Recipients</Typography>
                  <List dense>
                    {selectedReport.recipients.map((recipient, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={recipient} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReport(null)}>Close</Button>
          <Button variant="contained">Generate Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessIntelligencePage;
