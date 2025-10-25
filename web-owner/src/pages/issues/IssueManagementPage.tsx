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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            Issue Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track, manage, and resolve library issues efficiently
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setAnalyticsDialogOpen(true)}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<TrendingUpIcon />}
            onClick={() => setAdvancedAnalyticsOpen(true)}
          >
            Advanced Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={() => setNotificationCenterOpen(true)}
          >
            Notifications
          </Button>
          <Button
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={() => setAiAssistantOpen(true)}
          >
            AI Assistant
          </Button>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => setTemplatesDialogOpen(true)}
          >
            Templates
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
      
      {/* Analytics Cards */}
      {analyticsData && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {analyticsData.overview.total_issues}
                    </Typography>
                  </Box>
                  <BugReportIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Open Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {analyticsData.overview.open_issues}
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Overdue Issues
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {analyticsData.overview.overdue_issues}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Avg. Resolution
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {analyticsData.overview.avg_resolution_time_hours 
                        ? `${Math.round(analyticsData.overview.avg_resolution_time_hours)}h`
                        : 'N/A'
                      }
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
      
      {/* Main Content */}
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
