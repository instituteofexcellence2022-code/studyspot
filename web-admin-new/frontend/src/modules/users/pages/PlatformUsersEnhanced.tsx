// ============================================
// PLATFORM USERS PAGE - COMPREHENSIVE VERSION
// Enhanced with detailed analytics, user profiles, activity tracking
// ============================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  Download,
  PersonAdd,
  Block,
  CheckCircle,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AccessTime,
  Login,
  Logout,
  Security,
  Verified,
  Warning,
  School,
  Business,
  Group,
  Timeline,
  Assessment,
  NotificationsActive,
  Payment,
  AttachMoney,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { setFilters, removePlatformUser } from '../../../store/slices/userSlice';
import { showSuccess } from '../../../store/slices/uiSlice';
import { PlatformUser } from '../types';

const PlatformUsersEnhanced: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { platformUsers, filters, loading } = useAppSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    tenant: '',
    dateRange: 'all',
    engagementLevel: '',
    subscriptionPlan: '',
  });

  // Handle search
  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value, page: 1 }));
  };

  // Handle menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: PlatformUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle actions
  const handleView = () => {
    if (selectedUser) {
      // Navigate to library details page using tenantId
      navigate(`/libraries/${selectedUser.tenantId}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedUser) {
      dispatch(showSuccess(`Editing ${selectedUser.name}`));
      // TODO: Navigate to edit page
    }
    handleMenuClose();
  };

  const handleSuspend = () => {
    if (selectedUser) {
      dispatch(showSuccess(`User "${selectedUser.name}" has been suspended`));
      // TODO: Call API to suspend user
    }
    handleMenuClose();
  };

  const handleActivate = () => {
    if (selectedUser) {
      dispatch(showSuccess(`User "${selectedUser.name}" has been activated`));
      // TODO: Call API to activate user
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      dispatch(removePlatformUser(selectedUser.id));
      dispatch(showSuccess(`User "${selectedUser.name}" deleted successfully`));
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleBulkExport = () => {
    dispatch(showSuccess(`Exporting ${selectedRows.length} users...`));
    // TODO: Implement CSV export
  };

  const handleBulkSuspend = () => {
    dispatch(showSuccess(`Suspending ${selectedRows.length} users...`));
    // TODO: Implement bulk suspend
  };

  const handleAdvancedFilterChange = (field: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    dispatch(setFilters({ search: '', status: '' }));
    setAdvancedFilters({
      tenant: '',
      dateRange: 'all',
      engagementLevel: '',
      subscriptionPlan: '',
    });
  };

  // Get colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'library_owner': return 'primary';
      case 'library_admin': return 'secondary';
      case 'staff': return 'info';
      case 'student': return 'default';
      default: return 'default';
    }
  };

  // Filter users based on active tab and advanced filters
  const filteredUsers = useMemo(() => {
    let filtered = platformUsers;

    // Tab filtering
    if (activeTab === 1) filtered = filtered.filter(u => u.role === 'library_owner');
    if (activeTab === 2) filtered = filtered.filter(u => u.role === 'student');
    if (activeTab === 3) filtered = filtered.filter(u => u.role === 'parent');
    if (activeTab === 4) filtered = filtered.filter(u => u.role === 'staff' || u.role === 'library_admin');

    // Search filtering
    if (filters.search) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.tenantName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (u.phone && u.phone.includes(filters.search))
      );
    }

    // Status filtering
    if (filters.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }

    // Advanced filters
    if (advancedFilters.tenant) {
      filtered = filtered.filter(u => u.tenantName === advancedFilters.tenant);
    }

    if (advancedFilters.subscriptionPlan) {
      filtered = filtered.filter(u => u.subscriptionPlan === advancedFilters.subscriptionPlan);
    }

    if (advancedFilters.engagementLevel) {
      // Calculate engagement based on lastLogin
      filtered = filtered.filter(u => {
        if (!u.lastLogin) return advancedFilters.engagementLevel === 'inactive';
        const daysSinceLogin = Math.floor((Date.now() - new Date(u.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
        if (advancedFilters.engagementLevel === 'high') return daysSinceLogin < 7;
        if (advancedFilters.engagementLevel === 'medium') return daysSinceLogin >= 7 && daysSinceLogin < 30;
        if (advancedFilters.engagementLevel === 'low') return daysSinceLogin >= 30 && daysSinceLogin < 90;
        if (advancedFilters.engagementLevel === 'inactive') return daysSinceLogin >= 90;
        return true;
      });
    }

    if (advancedFilters.dateRange !== 'all') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        'today': 1,
        'week': 7,
        'month': 30,
        'quarter': 90,
        'year': 365,
      };
      const days = ranges[advancedFilters.dateRange];
      if (days) {
        filtered = filtered.filter(u => {
          const createdAt = (u as any).createdAt;
          if (!createdAt) return false;
          const userAge = Math.floor((now - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return userAge <= days;
        });
      }
    }

    return filtered;
  }, [platformUsers, activeTab, filters, advancedFilters]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      total: platformUsers.length,
      libraryOwners: platformUsers.filter(u => u.role === 'library_owner').length,
      students: platformUsers.filter(u => u.role === 'student').length,
      parents: platformUsers.filter(u => u.role === 'parent').length,
      staff: platformUsers.filter(u => u.role === 'staff' || u.role === 'library_admin').length,
      active: platformUsers.filter(u => u.status === 'active').length,
      pending: platformUsers.filter(u => u.status === 'pending').length,
      suspended: platformUsers.filter(u => u.status === 'suspended').length,
      inactive: platformUsers.filter(u => u.status === 'inactive').length,
      verified: platformUsers.filter(u => (u as any).verified).length,
      // Engagement metrics
      loggedInToday: platformUsers.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > oneDayAgo).length,
      loggedInThisWeek: platformUsers.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > oneWeekAgo).length,
      loggedInThisMonth: platformUsers.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > oneMonthAgo).length,
      neverLoggedIn: platformUsers.filter(u => !u.lastLogin).length,
      // New users
      newToday: platformUsers.filter(u => (u as any).createdAt && new Date((u as any).createdAt).getTime() > oneDayAgo).length,
      newThisWeek: platformUsers.filter(u => (u as any).createdAt && new Date((u as any).createdAt).getTime() > oneWeekAgo).length,
      newThisMonth: platformUsers.filter(u => (u as any).createdAt && new Date((u as any).createdAt).getTime() > oneMonthAgo).length,
      // Subscription stats
      starterPlan: platformUsers.filter(u => u.subscriptionPlan === 'starter').length,
      professionalPlan: platformUsers.filter(u => u.subscriptionPlan === 'professional').length,
      enterprisePlan: platformUsers.filter(u => u.subscriptionPlan === 'enterprise').length,
    };
  }, [platformUsers]);

  // Get unique tenants for filter
  const uniqueTenants = useMemo(() => {
    const tenants = new Set(platformUsers.map(u => u.tenantName));
    return Array.from(tenants).sort();
  }, [platformUsers]);

  // Get unique subscription plans
  const uniquePlans = useMemo(() => {
    const plans = new Set(platformUsers.map(u => u.subscriptionPlan).filter(Boolean));
    return Array.from(plans).sort();
  }, [platformUsers]);

  // DataGrid columns - Enhanced with more info
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'User',
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as PlatformUser;
        const daysSinceLogin = user.lastLogin 
          ? Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                user.status === 'active' && daysSinceLogin !== null && daysSinceLogin < 1 ? (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      border: '2px solid white',
                    }}
                  />
                ) : null
              }
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value?.replace('_', ' ')}
          color={getRoleColor(params.value as string) as any}
          size="small"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Tenant/Library',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.subscriptionPlan || 'No plan'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={params.value}
            color={getStatusColor(params.value as string) as any}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {(params.row as any).verified && (
            <Tooltip title="Verified">
              <Verified sx={{ fontSize: 16, color: 'success.main' }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'engagement',
      headerName: 'Engagement',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as PlatformUser;
        if (!user.lastLogin) {
          return (
            <Chip
              label="Never logged in"
              size="small"
              color="default"
              variant="outlined"
            />
          );
        }
        
        const daysSince = Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24));
        let level = 'High';
        let color: 'success' | 'warning' | 'error' | 'default' = 'success';
        
        if (daysSince > 90) {
          level = 'Inactive';
          color = 'default';
        } else if (daysSince > 30) {
          level = 'Low';
          color = 'error';
        } else if (daysSince > 7) {
          level = 'Medium';
          color = 'warning';
        }
        
        return (
          <Tooltip title={`Last login: ${daysSince} days ago`}>
            <Chip
              label={level}
              size="small"
              color={color}
              variant="filled"
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return <Typography variant="caption" color="text.secondary">Never</Typography>;
        }
        const date = new Date(params.value);
        const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <Box>
            <Typography variant="body2">
              {date.toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const createdAt = (params.row as any).createdAt;
        if (!createdAt) return '-';
        const date = new Date(createdAt);
        const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <Tooltip title={date.toLocaleString()}>
            <Typography variant="body2">
              {daysAgo === 0 ? 'Today' : daysAgo < 30 ? `${daysAgo}d ago` : date.toLocaleDateString()}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row as PlatformUser)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  // Chart data for Analytics tab
  const userTrendData = [
    { month: 'Apr', users: 45 },
    { month: 'May', users: 52 },
    { month: 'Jun', users: 61 },
    { month: 'Jul', users: 75 },
    { month: 'Aug', users: 88 },
    { month: 'Sep', users: 102 },
    { month: 'Oct', users: 120 },
  ];

  const userDistributionData = [
    { name: 'Students', value: stats.students, color: '#8884d8' },
    { name: 'Library Owners', value: stats.libraryOwners, color: '#82ca9d' },
    { name: 'Staff', value: stats.staff, color: '#ffc658' },
    { name: 'Parents', value: stats.parents, color: '#ff8042' },
  ];

  const statusDistributionData = [
    { name: 'Active', count: stats.active },
    { name: 'Pending', count: stats.pending },
    { name: 'Suspended', count: stats.suspended },
  ];

  // Render Enhanced Analytics Tab
  const renderAnalyticsTab = () => (
    <Box>
      {/* Comprehensive KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Total Users
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {stats.total}
              </Typography>
              <Chip
                icon={<TrendingUp />}
                label="+12%"
                color="success"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {stats.active}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((stats.active / stats.total) * 100).toFixed(1)}% of total
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              New This Week
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {stats.newThisWeek}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.newToday} today
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Active This Week
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {stats.loggedInThisWeek}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.loggedInToday} today
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Never Logged In
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {stats.neverLoggedIn}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((stats.neverLoggedIn / stats.total) * 100).toFixed(1)}% of total
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Suspended
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {stats.suspended}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.pending} pending
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* User Role Distribution */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business sx={{ color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Library Owners
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {stats.libraryOwners}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.libraryOwners / stats.total) * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
        </Card>

        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School sx={{ color: 'info.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Students
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {stats.students}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.students / stats.total) * 100} 
                color="info"
                sx={{ mt: 1 }}
              />
            </CardContent>
        </Card>

        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Group sx={{ color: 'warning.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Parents
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                {stats.parents}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.parents / stats.total) * 100} 
                color="warning"
                sx={{ mt: 1 }}
              />
            </CardContent>
        </Card>

        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Group sx={{ color: 'secondary.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  Staff
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="secondary.main">
                {stats.staff}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.staff / stats.total) * 100} 
                color="secondary"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}
      >
        {/* User Growth Trend */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              User Growth Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="users" stroke="#7B2CBF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              User Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              User Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#7B2CBF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent User Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                • 5 new registrations today
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • 12 users logged in last hour
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • 3 pending activations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • 2 suspended accounts
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Platform Users Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive user oversight across all tenants and libraries
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              icon={<Group />} 
              label={`${stats.total} Total Users`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<TrendingUp />} 
              label={`${stats.newThisWeek} New This Week`} 
              color="success" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Quick Insights */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1, mt: 2 }}>
          <Paper sx={{ p: 1.5, bgcolor: 'success.50', borderLeft: 3, borderColor: 'success.main' }}>
              <Typography variant="caption" color="text.secondary">
                Logged In Today
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {stats.loggedInToday}
              </Typography>
            </Paper>
          <Paper sx={{ p: 1.5, bgcolor: 'primary.50', borderLeft: 3, borderColor: 'primary.main' }}>
              <Typography variant="caption" color="text.secondary">
                Active This Month
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {stats.loggedInThisMonth}
              </Typography>
            </Paper>
          <Paper sx={{ p: 1.5, bgcolor: 'warning.50', borderLeft: 3, borderColor: 'warning.main' }}>
              <Typography variant="caption" color="text.secondary">
                Never Logged In
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {stats.neverLoggedIn}
              </Typography>
            </Paper>
          <Paper sx={{ p: 1.5, bgcolor: 'info.50', borderLeft: 3, borderColor: 'info.main' }}>
              <Typography variant="caption" color="text.secondary">
                Engagement Rate
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                {stats.total > 0 ? ((stats.loggedInThisMonth / stats.total) * 100).toFixed(1) : 0}%
              </Typography>
            </Paper>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={`All Users (${stats.total})`} />
        <Tab label={`Library Owners (${stats.libraryOwners})`} />
        <Tab label={`Students (${stats.students})`} />
        <Tab label={`Parents (${stats.parents})`} />
        <Tab label={`Staff (${stats.staff})`} />
        <Tab label="Analytics" />
      </Tabs>

      {/* Tab Content */}
      {activeTab < 5 ? (
        <>
          {/* Enhanced Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* Basic Filters Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  placeholder="Search by name, email, or phone..."
                  size="small"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: 320 }}
                />
                
                {selectedRows.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      size="small"
                      onClick={handleBulkExport}
                    >
                      Export ({selectedRows.length})
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Block />}
                      size="small"
                      color="error"
                      onClick={handleBulkSuspend}
                    >
                      Suspend ({selectedRows.length})
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    size="small"
                  >
                    Add User
                  </Button>
                </Box>
              </Box>

              {/* Status Filter Chips */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  Status:
                </Typography>
                <Chip
                  label="All"
                  onClick={() => dispatch(setFilters({ status: '' }))}
                  color={!filters.status ? 'primary' : 'default'}
                  variant={!filters.status ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label={`Active (${stats.active})`}
                  onClick={() => dispatch(setFilters({ status: 'active' }))}
                  color={filters.status === 'active' ? 'success' : 'default'}
                  variant={filters.status === 'active' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label={`Pending (${stats.pending})`}
                  onClick={() => dispatch(setFilters({ status: 'pending' }))}
                  color={filters.status === 'pending' ? 'warning' : 'default'}
                  variant={filters.status === 'pending' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label={`Suspended (${stats.suspended})`}
                  onClick={() => dispatch(setFilters({ status: 'suspended' }))}
                  color={filters.status === 'suspended' ? 'error' : 'default'}
                  variant={filters.status === 'suspended' ? 'filled' : 'outlined'}
                  size="small"
                />
              </Box>

              {/* Advanced Filters Accordion */}
              <Accordion sx={{ mt: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight={600}>
                    <FilterList sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                    Advanced Filters
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tenant/Library</InputLabel>
                        <Select
                          value={advancedFilters.tenant}
                          label="Tenant/Library"
                          onChange={(e) => handleAdvancedFilterChange('tenant', e.target.value)}
                        >
                          <MenuItem value="">All Tenants</MenuItem>
                          {uniqueTenants.map((tenant) => (
                            <MenuItem key={tenant} value={tenant}>
                              {tenant}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Subscription Plan</InputLabel>
                        <Select
                          value={advancedFilters.subscriptionPlan}
                          label="Subscription Plan"
                          onChange={(e) => handleAdvancedFilterChange('subscriptionPlan', e.target.value)}
                        >
                          <MenuItem value="">All Plans</MenuItem>
                          {uniquePlans.map((plan) => (
                            <MenuItem key={plan} value={plan}>
                              {plan}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Engagement Level</InputLabel>
                        <Select
                          value={advancedFilters.engagementLevel}
                          label="Engagement Level"
                          onChange={(e) => handleAdvancedFilterChange('engagementLevel', e.target.value)}
                        >
                          <MenuItem value="">All Levels</MenuItem>
                          <MenuItem value="high">High (Active this week)</MenuItem>
                          <MenuItem value="medium">Medium (Active this month)</MenuItem>
                          <MenuItem value="low">Low (30-90 days)</MenuItem>
                          <MenuItem value="inactive">Inactive (90+ days)</MenuItem>
                        </Select>
                      </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Date Joined</InputLabel>
                        <Select
                          value={advancedFilters.dateRange}
                          label="Date Joined"
                          onChange={(e) => handleAdvancedFilterChange('dateRange', e.target.value)}
                        >
                          <MenuItem value="all">All Time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="week">This Week</MenuItem>
                          <MenuItem value="month">This Month</MenuItem>
                          <MenuItem value="quarter">This Quarter</MenuItem>
                          <MenuItem value="year">This Year</MenuItem>
                        </Select>
                      </FormControl>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Results Summary */}
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing <strong>{filteredUsers.length}</strong> of <strong>{platformUsers.length}</strong> users
                </Typography>
                {(Object.values(advancedFilters).some(v => v && v !== 'all') || filters.search || filters.status) && (
                  <Chip
                    label="Filters Active"
                    color="primary"
                    size="small"
                    onDelete={clearAllFilters}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Data Grid */}
          <Card>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={{
                page: filters.page - 1,
                pageSize: filters.limit,
              }}
              onPaginationModelChange={(model) => {
                dispatch(setFilters({ page: model.page + 1, limit: model.pageSize }));
              }}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(Array.isArray(newSelection) ? newSelection.map((id: any) => String(id)) : []);
              }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Card>
        </>
      ) : (
        renderAnalyticsTab()
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Library Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit User
        </MenuItem>
        <Divider />
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={handleSuspend}>
            <Block sx={{ mr: 1 }} fontSize="small" />
            Suspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={handleActivate}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Activate User
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete User
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comprehensive User Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {selectedUser?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {selectedUser?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
            <Chip 
              label={selectedUser?.status} 
              color={getStatusColor(selectedUser?.status || '') as any}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              {/* Quick Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {selectedUser.lastLogin 
                        ? `${Math.floor((Date.now() - new Date(selectedUser.lastLogin).getTime()) / (1000 * 60 * 60 * 24))}d`
                        : 'Never'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last Login
                    </Typography>
                  </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {(selectedUser as any).createdAt
                        ? `${Math.floor((Date.now() - new Date((selectedUser as any).createdAt).getTime()) / (1000 * 60 * 60 * 24))}d`
                        : 'N/A'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Member Since
                    </Typography>
                  </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {(selectedUser as any).loginCount || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Logins
                    </Typography>
                  </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {(selectedUser as any).notifications || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Notifications
                    </Typography>
                  </Paper>
              </Box>

              {/* User Information */}
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business /> User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Email sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Phone sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedUser.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Group sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                        {selectedUser.role.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Business sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tenant/Library
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedUser.tenantName}
                      </Typography>
                    </Box>
                  </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subscription Plan
                      </Typography>
                      <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                        {selectedUser.subscriptionPlan || 'No plan'}
                      </Typography>
                    </Box>
                  </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <Security sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Verification Status
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {(selectedUser as any).verified ? 'Verified' : 'Not Verified'}
                        </Typography>
                        {(selectedUser as any).verified && (
                          <Verified sx={{ fontSize: 16, color: 'success.main' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>
              </Box>

              {/* Activity Timeline */}
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline /> Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {selectedUser.lastLogin && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
                        <Login sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Last Login"
                      secondary={new Date(selectedUser.lastLogin).toLocaleString()}
                    />
                  </ListItem>
                )}
                
                {(selectedUser as any).createdAt && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <PersonAdd sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Account Created"
                      secondary={new Date((selectedUser as any).createdAt).toLocaleString()}
                    />
                  </ListItem>
                )}

                {(selectedUser as any).lastPasswordChange && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                        <Security sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Password Changed"
                      secondary={new Date((selectedUser as any).lastPasswordChange).toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>

              {/* Alerts */}
              {selectedUser.status === 'suspended' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    This account is currently suspended
                  </Typography>
                </Alert>
              )}
              
              {!selectedUser.lastLogin && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    This user has never logged in
                  </Typography>
                </Alert>
              )}

              {selectedUser.lastLogin && 
                Math.floor((Date.now() - new Date(selectedUser.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) > 90 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    This user has been inactive for over 90 days
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              setDetailsDialogOpen(false);
              handleEdit();
            }}
          >
            Edit User
          </Button>
          {selectedUser?.status === 'active' ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Block />}
              onClick={() => {
                setDetailsDialogOpen(false);
                handleSuspend();
              }}
            >
              Suspend
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => {
                setDetailsDialogOpen(false);
                handleActivate();
              }}
            >
              Activate
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformUsersEnhanced;

