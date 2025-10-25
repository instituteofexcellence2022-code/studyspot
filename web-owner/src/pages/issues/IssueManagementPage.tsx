import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  Collapse,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Slider,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Skeleton,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Merge as MergeIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  Description as TemplateIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  Computer as ComputerIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  AccessAlarm as AccessAlarmIcon,
  Speed as SpeedIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Support as SupportIcon,
  Feedback as FeedbackIcon,
  RateReview as RateReviewIcon,
  Flag as FlagIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon,
  Launch as LaunchIcon,
  GetApp as GetAppIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Sync as SyncIcon,
  Autorenew as AutorenewIcon,
  Cached as CachedIcon,
  Update as UpdateIcon,
  Build as BuildIcon,
  Construction as ConstructionIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
  Biotech as BiotechIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  CloudQueue as CloudQueueIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  WifiOff as WifiOffIcon,
  SignalWifiOff as SignalWifiOffIcon,
  SignalWifi4Bar as SignalWifi4BarIcon,
  NetworkCheck as NetworkCheckIcon,
  Router as RouterIcon,
  DeviceHub as DeviceHubIcon,
  Devices as DevicesIcon,
  DeviceUnknown as DeviceUnknownIcon,
  Laptop as LaptopIcon,
  DesktopMac as DesktopMacIcon,
  Monitor as MonitorIcon,
  Tv as TvIcon,
  Tablet as TabletIcon,
  PhoneAndroid as PhoneAndroidIcon,
  PhoneIphone as PhoneIphoneIcon,
  Watch as WatchIcon,
  Headset as HeadsetIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  Gamepad as GamepadIcon,
  CameraAlt as CameraAltIcon,
  Videocam as VideocamIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  VolumeDown as VolumeDownIcon,
  Speaker as SpeakerIcon,
  Headphones as HeadphonesIcon,
  Bluetooth as BluetoothIcon,
  BluetoothConnected as BluetoothConnectedIcon,
  BluetoothDisabled as BluetoothDisabledIcon,
  Usb as UsbIcon,
  SdCard as SdCardIcon,
  SimCard as SimCardIcon,
  BatteryFull as BatteryFullIcon,
  BatteryStd as BatteryStdIcon,
  BatteryAlert as BatteryAlertIcon,
  BatteryUnknown as BatteryUnknownIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  BatteryChargingFull as BatteryChargingFullIcon,
  BatteryCharging20 as BatteryCharging20Icon,
  BatteryCharging30 as BatteryCharging30Icon,
  BatteryCharging50 as BatteryCharging50Icon,
  BatteryCharging60 as BatteryCharging60Icon,
  BatteryCharging80 as BatteryCharging80Icon,
  BatteryCharging90 as BatteryCharging90Icon,
  Battery20 as Battery20Icon,
  Battery30 as Battery30Icon,
  Battery50 as Battery50Icon,
  Battery60 as Battery60Icon,
  Battery80 as Battery80Icon,
  Battery90 as Battery90Icon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Import components
import IssueCreateDialog from '../../components/issues/IssueCreateDialog';
import IssueDetailsDialog from '../../components/issues/IssueDetailsDialog';
import IssueAnalytics from '../../components/issues/IssueAnalytics';
import IssueAdvancedAnalytics from '../../components/issues/IssueAdvancedAnalytics';
import IssueNotificationCenter from '../../components/issues/IssueNotificationCenter';
import IssueAIAssistant from '../../components/issues/IssueAIAssistant';
import IssueTemplates from '../../components/issues/IssueTemplates';
import IssueFilters from '../../components/issues/IssueFilters';

// Import services
import { issueService } from '../../services/issueService';

interface Issue {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_display_name: string;
  category_icon: string;
  category_color: string;
  priority_name: string;
  priority_display_name: string;
  priority_level: number;
  priority_color: string;
  status_name: string;
  status_display_name: string;
  status_color: string;
  status_is_final: boolean;
  assigned_to_first_name?: string;
  assigned_to_last_name?: string;
  assigned_to_email?: string;
  reported_by_first_name?: string;
  reported_by_last_name?: string;
  reported_by_email?: string;
  library_name?: string;
  student_count: number;
  reported_at: string;
  first_response_at?: string;
  resolved_at?: string;
  sla_deadline?: string;
  is_overdue: boolean;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  tags: string[];
  attachments: any[];
}

interface IssueCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
}

interface IssuePriority {
  id: string;
  name: string;
  display_name: string;
  level: number;
  color: string;
  sla_hours: number;
  is_active: boolean;
}

interface IssueStatus {
  id: string;
  name: string;
  display_name: string;
  description: string;
  color: string;
  is_final: boolean;
  is_active: boolean;
}

const IssueManagementPage: React.FC = () => {
  const theme = useTheme();
  
  // State management
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [priorities, setPriorities] = useState<IssuePriority[]>([]);
  const [statuses, setStatuses] = useState<IssueStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [advancedAnalyticsOpen, setAdvancedAnalyticsOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  
  // Enhanced UI state
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  
  // View and layout state
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'timeline' | 'kanban'>('table');
  const [sortBy, setSortBy] = useState('reported_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState('status');
  const [showArchived, setShowArchived] = useState(false);
  const [showResolved, setShowResolved] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Selection and bulk operations
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkPriority, setBulkPriority] = useState('');
  
  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assigned_to: '',
    library_id: '',
  });
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);
  
  // Load issues when filters change
  useEffect(() => {
    loadIssues();
  }, [page, rowsPerPage, searchQuery, filters]);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, prioritiesRes, statusesRes, analyticsRes] = await Promise.all([
        issueService.getCategories(),
        issueService.getPriorities(),
        issueService.getStatuses(),
        issueService.getAnalytics()
      ]);
      
      setCategories(categoriesRes.data);
      setPriorities(prioritiesRes.data);
      setStatuses(statusesRes.data);
      setAnalyticsData(analyticsRes.data);
      
      await loadIssues();
    } catch (err) {
      setError('Failed to load issue management data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadIssues = async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        ...filters
      };
      
      const response = await issueService.getIssues(params);
      setIssues(response.data);
      setTotalCount(response.meta.pagination.total);
    } catch (err) {
      setError('Failed to load issues');
      console.error('Error loading issues:', err);
    }
  };
  
  const handleCreateIssue = async (issueData: any) => {
    try {
      await issueService.createIssue(issueData);
      setCreateDialogOpen(false);
      await loadIssues();
      await loadInitialData(); // Refresh analytics
    } catch (err) {
      setError('Failed to create issue');
      console.error('Error creating issue:', err);
    }
  };
  
  const handleUpdateIssue = async (issueId: string, updateData: any) => {
    try {
      await issueService.updateIssue(issueId, updateData);
      await loadIssues();
      await loadInitialData(); // Refresh analytics
    } catch (err) {
      setError('Failed to update issue');
      console.error('Error updating issue:', err);
    }
  };
  
  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailsDialogOpen(true);
  };
  
  const handleRefresh = () => {
    loadInitialData();
  };
  
  const getPriorityIcon = (level: number) => {
    switch (level) {
      case 1: return <ErrorIcon sx={{ color: '#F44336' }} />;
      case 2: return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 3: return <InfoIcon sx={{ color: '#2196F3' }} />;
      case 4: return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      default: return <InfoIcon />;
    }
  };
  
  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'open': return <AssignmentIcon sx={{ color: '#FF9800' }} />;
      case 'assigned': return <ScheduleIcon sx={{ color: '#2196F3' }} />;
      case 'in_progress': return <TrendingUpIcon sx={{ color: '#9C27B0' }} />;
      case 'resolved': return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'closed': return <CheckCircleIcon sx={{ color: '#9E9E9E' }} />;
      case 'cancelled': return <CancelIcon sx={{ color: '#607D8B' }} />;
      default: return <AssignmentIcon />;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Issue Management...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Issue Management</Typography>
        </Breadcrumbs>

        {/* Main Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BugReportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              Issue Management
              <Chip 
                label={`${totalCount} Issues`} 
                color="primary" 
                size="small" 
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
              Track, manage, and resolve library issues efficiently with AI-powered insights
            </Typography>
            
            {/* Status Indicators */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: isOnline ? 'success.main' : 'error.main',
                    animation: isOnline ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  {isOnline ? 'Online' : 'Offline'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SyncIcon 
                  sx={{ 
                    fontSize: 14, 
                    color: syncStatus === 'syncing' ? 'primary.main' : 
                           syncStatus === 'error' ? 'error.main' : 'success.main',
                    animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsDialogOpen(true)}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HelpIcon />}
              onClick={() => setHelpDialogOpen(true)}
            >
              Help
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FeedbackIcon />}
              onClick={() => setFeedbackDialogOpen(true)}
            >
              Feedback
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AnalyticsIcon />}
              onClick={() => setAnalyticsDialogOpen(true)}
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SmartToyIcon />}
              onClick={() => setAiAssistantOpen(true)}
            >
              AI Assistant
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Report Issue
            </Button>
          </Stack>
        </Box>

        {/* Enhanced Controls Bar */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {/* Search and Filters */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* View Mode Toggle */}
            <Box sx={{ flex: '0 0 auto' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="table">
                  <Tooltip title="Table View">
                    <AssessmentIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="card">
                  <Tooltip title="Card View">
                    <DashboardIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="timeline">
                  <Tooltip title="Timeline View">
                    <TimelineIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="kanban">
                  <Tooltip title="Kanban View">
                    <ViewModuleIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Sort and Group */}
            <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="reported_at">Reported Date</MenuItem>
                  <MenuItem value="priority_level">Priority</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="assigned_to">Assignee</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
              <IconButton 
                size="small" 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </IconButton>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => loadIssues()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton size="small" onClick={() => setFiltersDialogOpen(true)}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton size="small" onClick={() => setExportDialogOpen(true)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bulk Actions">
                <IconButton 
                  size="small" 
                  onClick={() => setBulkActionsOpen(true)}
                  disabled={selectedIssues.length === 0}
                >
                  <Badge badgeContent={selectedIssues.length} color="primary">
                    <AssignmentIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Enhanced Analytics Cards */}
      {analyticsData && (
        <Box sx={{ mb: 3 }}>
          {/* Overview Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {analyticsData.overview.total_issues}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      +12% from last month
                    </Typography>
                  </Box>
                  <BugReportIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Open Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {analyticsData.overview.open_issues}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((analyticsData.overview.open_issues / analyticsData.overview.total_issues) * 100)}% of total
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Resolved Today
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {analyticsData.overview.resolved_today}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg: {analyticsData.overview.avg_resolution_time}h
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Overdue Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {analyticsData.overview.overdue_issues}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {analyticsData.overview.overdue_issues > 0 ? 'Needs attention' : 'All on track'}
                    </Typography>
                  </Box>
                  <AccessAlarmIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Performance Metrics */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Resolution Performance
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">First Response Time</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analyticsData.performance.avg_first_response_time}h
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((analyticsData.performance.avg_first_response_time / 24) * 100, 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Resolution Time</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analyticsData.performance.avg_resolution_time}h
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((analyticsData.performance.avg_resolution_time / 72) * 100, 100)} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Customer Satisfaction</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analyticsData.performance.avg_satisfaction_rating}/5
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(analyticsData.performance.avg_satisfaction_rating / 5) * 100} 
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Issue Categories
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {analyticsData.categories.slice(0, 5).map((category: any, index: number) => (
                    <Box key={category.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: category.color || 'primary.main' 
                        }} 
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {category.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Team Performance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {analyticsData.team_performance.slice(0, 4).map((member: any, index: number) => (
                    <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {member.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {member.resolved_count}
                        </Typography>
                        <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
      
      {/* Enhanced Tabs System */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="All Issues" 
            icon={<BugReportIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="My Issues" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="High Priority" 
            icon={<PriorityHighIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Overdue" 
            icon={<AccessAlarmIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Recently Resolved" 
            icon={<CheckCircleIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<AnalyticsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Reports" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFiltersDialogOpen(true)}
          >
            Filters
          </Button>
          
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        {/* Issues Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Issue</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Reported</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {issue.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {issue.description}
                      </Typography>
                      {issue.is_overdue && (
                        <Chip 
                          label="Overdue" 
                          size="small" 
                          color="error" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={issue.category_display_name}
                      size="small"
                      icon={<Typography>{issue.category_icon}</Typography>}
                      sx={{ bgcolor: issue.category_color, color: 'white' }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityIcon(issue.priority_level)}
                      <Typography variant="body2" fontWeight="bold">
                        {issue.priority_display_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(issue.status_name)}
                      <Typography variant="body2" fontWeight="bold">
                        {issue.status_display_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    {issue.assigned_to_first_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {issue.assigned_to_first_name[0]}{issue.assigned_to_last_name?.[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {issue.assigned_to_first_name} {issue.assigned_to_last_name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge badgeContent={issue.student_count} color="primary">
                      <Typography variant="body2">
                        {issue.student_count} student{issue.student_count !== 1 ? 's' : ''}
                      </Typography>
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {getTimeAgo(issue.reported_at)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewIssue(issue)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Issue">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
        </Paper>
      )}

      {/* My Issues Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Issues Assigned to Me
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              My Issues View
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This view will show issues assigned to you with personalized filters and quick actions.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* High Priority Tab */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PriorityHighIcon color="error" />
            High Priority Issues
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PriorityHighIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              High Priority Issues
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Critical issues that require immediate attention and have strict SLA requirements.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Overdue Tab */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessAlarmIcon color="warning" />
            Overdue Issues
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AccessAlarmIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Overdue Issues
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issues that have exceeded their SLA deadlines and need immediate escalation.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Recently Resolved Tab */}
      {activeTab === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Recently Resolved Issues
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Recently Resolved
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Issues that have been resolved in the last 7 days with resolution details and feedback.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Analytics Tab */}
      {activeTab === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon color="primary" />
            Advanced Analytics
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AnalyticsIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Advanced Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comprehensive analytics dashboard with charts, trends, and performance metrics.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<TrendingUpIcon />}
              onClick={() => setAdvancedAnalyticsOpen(true)}
            >
              Open Advanced Analytics
            </Button>
          </Box>
        </Paper>
      )}

      {/* Reports Tab */}
      {activeTab === 6 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Reports & Exports
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AssessmentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Reports & Exports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Generate detailed reports, export data, and create custom analytics dashboards.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
              >
                Export Data
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                onClick={() => setReportDialogOpen(true)}
              >
                Generate Report
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}
      
      {/* Dialogs */}
      <IssueCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateIssue}
        categories={categories}
        priorities={priorities}
      />
      
      <IssueDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        issue={selectedIssue}
        onUpdate={handleUpdateIssue}
        categories={categories}
        priorities={priorities}
        statuses={statuses}
      />
      
      <IssueAnalytics
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        data={analyticsData}
      />
      
      <IssueTemplates
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
      />
      
      <IssueFilters
        open={filtersDialogOpen}
        onClose={() => setFiltersDialogOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        priorities={priorities}
        statuses={statuses}
      />
      
      {/* Enhanced Dialogs */}
      <IssueAdvancedAnalytics
        open={advancedAnalyticsOpen}
        onClose={() => setAdvancedAnalyticsOpen(false)}
      />
      
      <Dialog
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Notification Center</DialogTitle>
        <DialogContent>
          <IssueNotificationCenter />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationCenterOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <IssueAIAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        currentIssue={selectedIssue}
      />
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssueManagementPage;
