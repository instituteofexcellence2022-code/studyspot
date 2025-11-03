// ============================================
// COMPREHENSIVE TENANT & LIBRARY MANAGEMENT
// Clean, optimized version with proper event handling
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Paper,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip as MuiTooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Business,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Refresh,
  Download,
  Send,
  Visibility,
  Edit,
  ExpandMore,
  LocationOn,
  EventSeat,
  People,
  Star,
  Phone,
  Email,
  CheckCircle,
  Warning,
  FilterList,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  Map as MapIcon,
  MyLocation,
  Layers,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800', '#F44336'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Sort Icon Component - Shows current sort state
const SortIcon: React.FC<{ field: string; currentField: string; currentOrder: 'asc' | 'desc' }> = ({ field, currentField, currentOrder }) => {
  if (currentField === field) {
    return currentOrder === 'desc' ? 
      <ArrowDownward sx={{ fontSize: 16, color: 'primary.main' }} /> : 
      <ArrowUpward sx={{ fontSize: 16, color: 'primary.main' }} />;
  }
  return <UnfoldMore sx={{ fontSize: 16, color: 'text.disabled' }} />;
};

// Sortable Table Header Component
interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  align?: 'left' | 'right' | 'center';
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, field, currentSort, currentOrder, onSort, align = 'left' }) => {
  return (
    <TableCell 
      align={align}
      sx={{ 
        cursor: 'pointer', 
        userSelect: 'none',
        '&:hover': { bgcolor: '#EEEEEE' },
      }}
      onClick={() => onSort(field)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <strong>{label}</strong>
        <SortIcon field={field} currentField={currentSort} currentOrder={currentOrder} />
      </Box>
    </TableCell>
  );
};

const ComprehensiveTenantLibraryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [expandedTenant, setExpandedTenant] = useState<string | false>(false);
  
  // Filters for Tenants & Libraries tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Filters for Analytics tab
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState('');
  const [analyticsPlanFilter, setAnalyticsPlanFilter] = useState('all');
  const [analyticsCityFilter, setAnalyticsCityFilter] = useState('all');
  const [analyticsSortBy, setAnalyticsSortBy] = useState<'revenue' | 'occupancy' | 'name' | 'libraries' | 'capacity' | 'students'>('revenue');
  const [analyticsSortOrder, setAnalyticsSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sorting state for different tables
  const [planTableSort, setPlanTableSort] = useState<{field: string, order: 'asc' | 'desc'}>({field: 'revenue', order: 'desc'});
  const [cityTableSort, setCityTableSort] = useState<{field: string, order: 'asc' | 'desc'}>({field: 'revenue', order: 'desc'});
  const [libraryRankSort, setLibraryRankSort] = useState<{field: string, order: 'asc' | 'desc'}>({field: 'revenue', order: 'desc'});

  // Chart filters - Date Range & Grouping
  const [chartDateRange, setChartDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all' | 'custom'>('30d');
  const [chartGrouping, setChartGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('month');
  const [customChartDateRange, setCustomChartDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [showChartCustomDatePicker, setShowChartCustomDatePicker] = useState(false);

  // Map View filters
  const [mapStatusFilter, setMapStatusFilter] = useState('all');
  const [mapCityFilter, setMapCityFilter] = useState('all');
  const [mapPlanFilter, setMapPlanFilter] = useState('all');
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);

  // Mock Data - Comprehensive tenant data with libraries
  const tenantsWithLibraries = [
    {
      id: 'T001',
      name: 'Central Library Network',
      email: 'admin@centrallibrary.com',
      phone: '+91 98765 43210',
      status: 'active',
      plan: 'Enterprise',
      city: 'Mumbai',
      librariesCount: 3,
      totalCapacity: 450,
      totalStudents: 360,
      avgOccupancy: 80,
      totalRevenue: 450000,
      avgRating: 4.8,
      libraries: [
        {
          id: 'LIB001',
          libraryId: 'LIB001',
          name: 'Central Library - Mumbai Main',
          address: '123 Main St, Andheri West, Mumbai 400058',
          status: 'active',
          capacity: 150,
          occupiedSeats: 120,
          occupancyRate: 80,
          activeStudents: 120,
          totalRevenue: 150000,
          features: ['WiFi', 'AC', 'Parking', 'Cafe', 'Lockers'],
        },
        {
          id: 'LIB002',
          libraryId: 'LIB002',
          name: 'Central Library - Delhi Branch',
          address: '456 Park Avenue, Connaught Place, Delhi 110001',
          status: 'active',
          capacity: 200,
          occupiedSeats: 160,
          occupancyRate: 80,
          activeStudents: 160,
          totalRevenue: 200000,
          features: ['WiFi', 'AC', 'Parking', 'Conference Room'],
        },
        {
          id: 'LIB003',
          libraryId: 'LIB003',
          name: 'Central Library - Pune Hub',
          address: '789 MG Road, Koregaon Park, Pune 411001',
          status: 'active',
          capacity: 100,
          occupiedSeats: 80,
          occupancyRate: 80,
          activeStudents: 80,
          totalRevenue: 100000,
          features: ['WiFi', 'AC', 'Study Rooms'],
        },
      ],
    },
    {
      id: 'T002',
      name: 'StudyHub Education',
      email: 'contact@studyhub.edu',
      phone: '+91 87654 32109',
      status: 'active',
      plan: 'Professional',
      city: 'Bangalore',
      librariesCount: 2,
      totalCapacity: 250,
      totalStudents: 225,
      avgOccupancy: 90,
      totalRevenue: 300000,
      avgRating: 4.9,
      libraries: [
        {
          id: 'LIB004',
          libraryId: 'LIB004',
          name: 'StudyHub - Koramangala',
          address: '12 Hosur Road, Koramangala, Bangalore 560095',
          status: 'active',
          capacity: 150,
          occupiedSeats: 135,
          occupancyRate: 90,
          activeStudents: 135,
          totalRevenue: 180000,
          features: ['WiFi', 'AC', 'Parking', 'Cafe'],
        },
        {
          id: 'LIB005',
          libraryId: 'LIB005',
          name: 'StudyHub - Indiranagar',
          address: '45 100 Feet Road, Indiranagar, Bangalore 560038',
          status: 'active',
          capacity: 100,
          occupiedSeats: 90,
          occupancyRate: 90,
          activeStudents: 90,
          totalRevenue: 120000,
          features: ['WiFi', 'AC', 'Lockers'],
        },
      ],
    },
    {
      id: 'T003',
      name: 'BookWorm Spaces',
      email: 'hello@bookworm.in',
      phone: '+91 76543 21098',
      status: 'active',
      plan: 'Basic',
      city: 'Hyderabad',
      librariesCount: 1,
      totalCapacity: 80,
      totalStudents: 52,
      avgOccupancy: 65,
      totalRevenue: 80000,
      avgRating: 4.5,
      libraries: [
        {
          id: 'LIB006',
          libraryId: 'LIB006',
          name: 'BookWorm - Hitech City',
          address: '78 Cyber Towers, Hitech City, Hyderabad 500081',
          status: 'active',
          capacity: 80,
          occupiedSeats: 52,
          occupancyRate: 65,
          activeStudents: 52,
          totalRevenue: 80000,
          features: ['WiFi', 'AC'],
        },
      ],
    },
  ];

  // Dashboard metrics
  const dashboardMetrics = {
    totalTenants: 3,
    totalMRR: 830000,
    totalLibraries: 6,
    avgOccupancy: 78,
    activeTenants: 3,
    revenue: 830000,
    growth: 15.5,
    totalCapacity: 780,
    totalStudents: 637,
    activeStudents: 637,
    totalBookings: 1247,
    pendingPayments: 45000,
    churnRate: 2.3,
  };

  // Additional mock data for enhanced overview
  // Dynamic chart data based on filters
  const getMonthlyTrendData = () => {
    if (chartGrouping === 'hour' && (chartDateRange === '7d' || chartDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: Math.floor(Math.random() * 50000) + 20000,
        tenants: Math.floor(Math.random() * 2) + 1,
        libraries: Math.floor(Math.random() * 3) + 1
      }));
    } else if (chartGrouping === 'day') {
      const days = chartDateRange === '7d' ? 7 : chartDateRange === '30d' ? 30 : 30;
      return Array.from({ length: days }, (_, i) => ({
        label: `Day ${i + 1}`,
        revenue: Math.floor(Math.random() * 100000) + 50000,
        tenants: Math.floor(Math.random() * 3) + 1,
        libraries: Math.floor(Math.random() * 4) + 2
      }));
    } else if (chartGrouping === 'week') {
      const weeks = chartDateRange === '90d' ? 12 : chartDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        revenue: Math.floor(Math.random() * 200000) + 600000,
        tenants: Math.floor(Math.random() * 2) + 2,
        libraries: Math.floor(Math.random() * 3) + 4
      }));
    } else {
      // Month grouping
      return [
        { label: 'Jan', revenue: 650000, tenants: 2, libraries: 4 },
        { label: 'Feb', revenue: 720000, tenants: 2, libraries: 5 },
        { label: 'Mar', revenue: 750000, tenants: 3, libraries: 5 },
        { label: 'Apr', revenue: 780000, tenants: 3, libraries: 6 },
        { label: 'May', revenue: 810000, tenants: 3, libraries: 6 },
        { label: 'Jun', revenue: 830000, tenants: 3, libraries: 6 },
      ];
    }
  };

  const getOccupancyTrendData = () => {
    if (chartGrouping === 'hour' && (chartDateRange === '7d' || chartDateRange === '30d')) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        occupancy: Math.floor(Math.random() * 20) + 60
      }));
    } else if (chartGrouping === 'day') {
      const days = chartDateRange === '7d' ? 7 : chartDateRange === '30d' ? 30 : 30;
      return Array.from({ length: days }, (_, i) => ({
        label: `Day ${i + 1}`,
        occupancy: Math.floor(Math.random() * 25) + 60
      }));
    } else if (chartGrouping === 'week') {
      const weeks = chartDateRange === '90d' ? 12 : chartDateRange === '1y' ? 52 : 6;
      return Array.from({ length: weeks }, (_, i) => ({
        label: `Week ${i + 1}`,
        occupancy: Math.floor(Math.random() * 15) + 65
      }));
    } else {
      // Month grouping
      return [
        { label: 'Jan', occupancy: 65 },
        { label: 'Feb', occupancy: 68 },
        { label: 'Mar', occupancy: 72 },
        { label: 'Apr', occupancy: 74 },
        { label: 'May', occupancy: 76 },
        { label: 'Jun', occupancy: 78 },
      ];
    }
  };

  const monthlyTrend = getMonthlyTrendData();
  const occupancyTrend = getOccupancyTrendData();

  // Calculate top performers dynamically from actual tenant data
  const topPerformersBase = tenantsWithLibraries
    .flatMap(tenant => 
      tenant.libraries.map(lib => ({
        name: lib.name,
        revenue: lib.totalRevenue,
        occupancy: lib.occupancyRate,
        growth: Math.floor(Math.random() * 30) + 5, // Mock growth for now
        tenantName: tenant.name,
        students: lib.activeStudents,
      }))
    );

  // Sorted top performers for display
  const topPerformers = [...topPerformersBase].sort((a, b) => {
    if (libraryRankSort.field === 'revenue') {
      return libraryRankSort.order === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue;
    } else if (libraryRankSort.field === 'occupancy') {
      return libraryRankSort.order === 'desc' ? b.occupancy - a.occupancy : a.occupancy - b.occupancy;
    } else if (libraryRankSort.field === 'students') {
      return libraryRankSort.order === 'desc' ? b.students - a.students : a.students - b.students;
    } else if (libraryRankSort.field === 'name') {
      return libraryRankSort.order === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    }
    return 0;
  }).slice(0, 10); // Show top 10 instead of 3

  // Calculate at-risk tenants dynamically (occupancy < 70% or low revenue)
  const atRiskTenants = tenantsWithLibraries
    .filter(tenant => tenant.avgOccupancy < 70)
    .map(tenant => ({
      name: tenant.name,
      occupancy: tenant.avgOccupancy,
      trend: 'declining',
      reason: tenant.avgOccupancy < 50 ? 'Very low occupancy' : 'Low occupancy',
      id: tenant.id,
    }));

  // Navigation handlers
  const handleViewLibrary = (libraryId: string) => {
    console.log('🔥 Navigating to library:', libraryId);
    navigate(`/libraries/${libraryId}`);
  };

  const handleViewTenant = (tenantId: string) => {
    console.log('🔥 Navigating to tenant:', tenantId);
    navigate(`/tenants/${tenantId}`);
  };

  const handleContactTenant = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Regarding ${name}`;
  };

  // Sort handler for analytics tables
  const handleSort = (field: string) => {
    if (analyticsSortBy === field) {
      // Toggle order if same field
      setAnalyticsSortOrder(analyticsSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // New field, default to desc
      setAnalyticsSortBy(field as any);
      setAnalyticsSortOrder('desc');
    }
  };

  // Sort handlers for individual tables
  const handlePlanTableSort = (field: string) => {
    setPlanTableSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleCityTableSort = (field: string) => {
    setCityTableSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleLibraryRankSort = (field: string) => {
    setLibraryRankSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Filtered tenants for Tenants & Libraries tab
  const filteredTenants = tenantsWithLibraries.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    const matchesCity = cityFilter === 'all' || tenant.city === cityFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesCity;
  });

  // Filtered tenants for Analytics tab
  const filteredTenantsForAnalytics = tenantsWithLibraries.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(analyticsSearchQuery.toLowerCase());
    const matchesPlan = analyticsPlanFilter === 'all' || tenant.plan === analyticsPlanFilter;
    const matchesCity = analyticsCityFilter === 'all' || tenant.city === analyticsCityFilter;
    return matchesSearch && matchesPlan && matchesCity;
  });

  // Sorted tenants for Analytics
  const sortedTenantsForAnalytics = [...filteredTenantsForAnalytics].sort((a, b) => {
    if (analyticsSortBy === 'revenue') {
      return analyticsSortOrder === 'desc' 
        ? b.totalRevenue - a.totalRevenue 
        : a.totalRevenue - b.totalRevenue;
    } else if (analyticsSortBy === 'occupancy') {
      return analyticsSortOrder === 'desc' 
        ? b.avgOccupancy - a.avgOccupancy 
        : a.avgOccupancy - b.avgOccupancy;
    } else if (analyticsSortBy === 'libraries') {
      return analyticsSortOrder === 'desc' 
        ? b.librariesCount - a.librariesCount 
        : a.librariesCount - b.librariesCount;
    } else if (analyticsSortBy === 'capacity') {
      return analyticsSortOrder === 'desc' 
        ? b.totalCapacity - a.totalCapacity 
        : a.totalCapacity - b.totalCapacity;
    } else if (analyticsSortBy === 'students') {
      return analyticsSortOrder === 'desc' 
        ? b.totalStudents - a.totalStudents 
        : a.totalStudents - b.totalStudents;
    } else {
      return analyticsSortOrder === 'desc' 
        ? b.name.localeCompare(a.name) 
        : a.name.localeCompare(b.name);
    }
  });

  // Filtered libraries for Analytics
  const filteredLibrariesForAnalytics = filteredTenantsForAnalytics
    .flatMap(tenant => tenant.libraries)
    .filter(library => {
      const matchesSearch = library.name.toLowerCase().includes(analyticsSearchQuery.toLowerCase());
      return matchesSearch;
    });

  // Recalculate analytics data based on filtered tenants
  const filteredDashboardMetrics = {
    totalTenants: filteredTenantsForAnalytics.length,
    totalLibraries: filteredLibrariesForAnalytics.length,
    totalMRR: filteredTenantsForAnalytics.reduce((sum, t) => sum + t.totalRevenue, 0),
    totalCapacity: filteredTenantsForAnalytics.reduce((sum, t) => sum + t.totalCapacity, 0),
    totalStudents: filteredTenantsForAnalytics.reduce((sum, t) => sum + t.totalStudents, 0),
    avgOccupancy: filteredTenantsForAnalytics.length > 0 
      ? Math.round(filteredTenantsForAnalytics.reduce((sum, t) => sum + t.avgOccupancy, 0) / filteredTenantsForAnalytics.length)
      : 0,
  };

  // Chart data
  const revenueByPlanBase = [
    { plan: 'Enterprise', revenue: 450000, tenants: 1 },
    { plan: 'Professional', revenue: 300000, tenants: 1 },
    { plan: 'Basic', revenue: 80000, tenants: 1 },
  ];

  const revenueByCityBase = [
    { city: 'Mumbai', revenue: 450000, libraries: 3 },
    { city: 'Bangalore', revenue: 300000, libraries: 2 },
    { city: 'Hyderabad', revenue: 80000, libraries: 1 },
  ];

  // Sorted data for tables
  const revenueByPlan = [...revenueByPlanBase].sort((a, b) => {
    if (planTableSort.field === 'plan') {
      return planTableSort.order === 'desc' ? b.plan.localeCompare(a.plan) : a.plan.localeCompare(b.plan);
    } else if (planTableSort.field === 'tenants') {
      return planTableSort.order === 'desc' ? b.tenants - a.tenants : a.tenants - b.tenants;
    } else if (planTableSort.field === 'revenue') {
      return planTableSort.order === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue;
    } else if (planTableSort.field === 'avgTenant') {
      return planTableSort.order === 'desc' ? (b.revenue/b.tenants) - (a.revenue/a.tenants) : (a.revenue/a.tenants) - (b.revenue/b.tenants);
    }
    return 0;
  });

  const revenueByCity = [...revenueByCityBase].sort((a, b) => {
    if (cityTableSort.field === 'city') {
      return cityTableSort.order === 'desc' ? b.city.localeCompare(a.city) : a.city.localeCompare(b.city);
    } else if (cityTableSort.field === 'libraries') {
      return cityTableSort.order === 'desc' ? b.libraries - a.libraries : a.libraries - b.libraries;
    } else if (cityTableSort.field === 'revenue') {
      return cityTableSort.order === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue;
    } else if (cityTableSort.field === 'avgLibrary') {
      return cityTableSort.order === 'desc' ? (b.revenue/b.libraries) - (a.revenue/a.libraries) : (a.revenue/a.libraries) - (b.revenue/b.libraries);
    }
    return 0;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tenant & Library Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive oversight of all tenants and their libraries
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<Refresh />} variant="outlined">
            Refresh
          </Button>
          <Button startIcon={<Download />} variant="outlined">
            Export
          </Button>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => navigate('/tenants/onboarding')}
          >
            Add Tenant
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Tenants & Libraries" />
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Map View" icon={<MapIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tenants & Libraries Tab - NOW FIRST */}
      <TabPanel value={currentTab} index={0}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
                  <MenuItem value="all">All Plans</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                  <MenuItem value="all">All Cities</MenuItem>
                  <MenuItem value="Mumbai">Mumbai</MenuItem>
                  <MenuItem value="Bangalore">Bangalore</MenuItem>
                  <MenuItem value="Delhi">Delhi</MenuItem>
                  <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                  <MenuItem value="Pune">Pune</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
        </Typography>

        {/* Tenant Accordions - MOVED HERE FROM index=1 */}
        <Stack spacing={2}>
          {filteredTenants.map((tenant) => (
            <Accordion
              key={tenant.id}
              expanded={expandedTenant === tenant.id}
              onChange={(_, isExpanded) => setExpandedTenant(isExpanded ? tenant.id : false)}
              sx={{
                border: '2px solid #E0E0E0',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: expandedTenant === tenant.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: '#FAFAFA',
                  borderRadius: '8px 8px 0 0',
                  '&:hover': { bgcolor: '#F5F5F5' },
                  minHeight: 80,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                  {/* Left: Tenant Info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                      {tenant.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{tenant.name}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip label={tenant.plan} size="small" color="primary" />
                        <Chip label={tenant.status.toUpperCase()} size="small" color="success" />
                        <Chip label={tenant.city} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Right: Quick Stats */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mr: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Libraries</Typography>
                      <Typography variant="h6" fontWeight="bold">{tenant.librariesCount}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Students</Typography>
                      <Typography variant="h6" fontWeight="bold">{tenant.totalStudents}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Occupancy</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">{tenant.avgOccupancy}%</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Revenue</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(tenant.totalRevenue / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ bgcolor: 'white', p: 3 }}>
                {/* Tenant Contact Bar */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#F3E5F5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">{tenant.email}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">{tenant.phone}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Star fontSize="small" sx={{ color: '#FFD700' }} />
                        <Typography variant="body2">Avg Rating: {tenant.avgRating}</Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Send />}
                        onClick={() => handleContactTenant(tenant.email, tenant.name)}
                      >
                        Contact
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => alert(`Edit tenant: ${tenant.name}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewTenant(tenant.id)}
                      >
                        Full Details
                      </Button>
                    </Stack>
                  </Box>
                </Paper>

                {/* Libraries Section */}
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  📚 Libraries ({tenant.librariesCount})
                </Typography>

                {/* Library Cards */}
                <Stack spacing={2}>
                  {tenant.libraries.map((library) => (
                    <Card
                      key={library.id}
                      sx={{
                        border: '1px solid #E0E0E0',
                        '&:hover': { boxShadow: 3 },
                        transition: 'all 0.2s',
                      }}
                    >
                      <CardContent>
                        {/* Library Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                              {library.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                                }}
                                onClick={() => handleViewLibrary(library.id)}
                              >
                                {library.name}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                <Chip label={library.libraryId} size="small" variant="outlined" />
                                <Chip label={library.status.toUpperCase()} color="success" size="small" />
                              </Stack>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                <LocationOn sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {library.address}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Action Buttons */}
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Visibility />}
                              onClick={() => handleViewLibrary(library.id)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit />}
                              onClick={() => alert(`Edit library: ${library.name}`)}
                            >
                              Edit
                            </Button>
                          </Stack>
                        </Box>

                        {/* Library Stats */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mb: 2 }}>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                            <Typography variant="caption" color="text.secondary">Capacity</Typography>
                            <Typography variant="h6" fontWeight="bold">{library.capacity}</Typography>
                          </Paper>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#F3E5F5' }}>
                            <Typography variant="caption" color="text.secondary">Occupied</Typography>
                            <Typography variant="h6" fontWeight="bold">{library.occupiedSeats}</Typography>
                          </Paper>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#E8F5E9' }}>
                            <Typography variant="caption" color="text.secondary">Occupancy</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              {library.occupancyRate}%
                            </Typography>
                          </Paper>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                            <Typography variant="caption" color="text.secondary">Students</Typography>
                            <Typography variant="h6" fontWeight="bold">{library.activeStudents}</Typography>
                          </Paper>
                          <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#E1F5FE' }}>
                            <Typography variant="caption" color="text.secondary">Revenue</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              ₹{(library.totalRevenue / 1000).toFixed(0)}K
                            </Typography>
                          </Paper>
                        </Box>

                        {/* Occupancy Progress */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Capacity Utilization
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {library.occupiedSeats} / {library.capacity} seats
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={library.occupancyRate}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#E0E0E0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: library.occupancyRate >= 90 ? '#4CAF50' : library.occupancyRate >= 70 ? '#FF9800' : '#F44336',
                              },
                            }}
                          />
                        </Box>

                        {/* Features */}
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Features & Amenities:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {library.features.map((feature, idx) => (
                              <Chip key={idx} label={feature} size="small" sx={{ mb: 1 }} />
                            ))}
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                {/* Portfolio Summary */}
                <Paper sx={{ p: 2, mt: 3, bgcolor: '#E8F5E9' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Portfolio Summary for {tenant.name}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Capacity</Typography>
                      <Typography variant="h6" fontWeight="bold">{tenant.totalCapacity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Students</Typography>
                      <Typography variant="h6" fontWeight="bold">{tenant.totalStudents}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg Occupancy</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {tenant.avgOccupancy}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(tenant.totalRevenue / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        {filteredTenants.length === 0 && (
          <Alert severity="info">
            No tenants found matching your filters. Try adjusting your search criteria.
          </Alert>
        )}
      </TabPanel>

      {/* Overview Tab - NOW SECOND */}
      <TabPanel value={currentTab} index={1}>
        {/* Chart Filters - Date Range & Grouping */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <FilterList fontSize="small" /> Chart Filters (Date Range & Grouping)
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Date Range Filter */}
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Date Range
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                  <Chip
                    key={range}
                    label={range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : range === '1y' ? 'Last Year' : 'All Time'}
                    onClick={() => {
                      setChartDateRange(range as any);
                      setShowChartCustomDatePicker(false);
                    }}
                    color={chartDateRange === range ? 'primary' : 'default'}
                    variant={chartDateRange === range ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Group By Filter */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Group By
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label="Hour"
                  onClick={() => setChartGrouping('hour')}
                  color={chartGrouping === 'hour' ? 'secondary' : 'default'}
                  variant={chartGrouping === 'hour' ? 'filled' : 'outlined'}
                  size="small"
                  disabled={!(chartDateRange === '7d' || chartDateRange === '30d')}
                />
                <Chip
                  label="Day"
                  onClick={() => setChartGrouping('day')}
                  color={chartGrouping === 'day' ? 'secondary' : 'default'}
                  variant={chartGrouping === 'day' ? 'filled' : 'outlined'}
                  size="small"
                />
                <Chip
                  label="Week"
                  onClick={() => setChartGrouping('week')}
                  color={chartGrouping === 'week' ? 'secondary' : 'default'}
                  variant={chartGrouping === 'week' ? 'filled' : 'outlined'}
                  size="small"
                  disabled={chartDateRange === '7d'}
                />
                <Chip
                  label="Month"
                  onClick={() => setChartGrouping('month')}
                  color={chartGrouping === 'month' ? 'secondary' : 'default'}
                  variant={chartGrouping === 'month' ? 'filled' : 'outlined'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          {/* Active Filter Summary */}
          <Alert severity="info" sx={{ mt: 2, py: 0.5 }}>
            <Typography variant="caption">
              <strong>Active:</strong> {chartDateRange === '7d' ? 'Last 7 Days' : chartDateRange === '30d' ? 'Last 30 Days' : chartDateRange === '90d' ? 'Last 90 Days' : chartDateRange === '1y' ? 'Last Year' : 'All Time'} | <strong>Grouped By:</strong> {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
            </Typography>
          </Alert>
        </Card>

        {/* Primary KPI Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 3 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {dashboardMetrics.totalTenants}
                  </Typography>
                  <Typography variant="body2" color="white">Total Tenants</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
                    <Typography variant="caption" color="white">+{dashboardMetrics.growth}%</Typography>
                  </Stack>
                </Box>
                <Business sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    ₹{(dashboardMetrics.totalMRR / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="white">Monthly Revenue</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
                    <Typography variant="caption" color="white">+12.5%</Typography>
                  </Stack>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {dashboardMetrics.totalLibraries}
                  </Typography>
                  <Typography variant="body2" color="white">Total Libraries</Typography>
                  <Typography variant="caption" color="white" sx={{ mt: 0.5, display: 'block' }}>
                    Across {dashboardMetrics.totalTenants} tenants
                  </Typography>
                </Box>
                <LocationOn sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {dashboardMetrics.avgOccupancy}%
                  </Typography>
                  <Typography variant="body2" color="white">Avg Occupancy</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'white' }} />
                    <Typography variant="caption" color="white">+5.2%</Typography>
                  </Stack>
                </Box>
                <EventSeat sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Secondary KPI Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">{dashboardMetrics.totalCapacity}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Capacity</Typography>
                </Box>
                <EventSeat sx={{ fontSize: 32, color: 'primary.main' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">{dashboardMetrics.totalStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">Active Students</Typography>
                </Box>
                <People sx={{ fontSize: 32, color: 'success.main' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">{dashboardMetrics.totalBookings}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 32, color: 'info.main' }} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    ₹{(dashboardMetrics.pendingPayments / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pending Payments</Typography>
                </Box>
                <Warning sx={{ fontSize: 32, color: 'warning.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📈 Revenue Growth Trend - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Occupancy Trend - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="occupancy" stroke="#FF9800" strokeWidth={2} name="Occupancy %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💰 Revenue by Subscription Plan
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#E91E63" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🌍 Revenue Distribution by City
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueByCity}
                    dataKey="revenue"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {revenueByCity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 3 - Growth Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🏢 Tenants & Libraries Growth - By {chartGrouping.charAt(0).toUpperCase() + chartGrouping.slice(1)}
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tenants" stroke="#E91E63" strokeWidth={2} name="Tenants" />
                  <Line type="monotone" dataKey="libraries" stroke="#2196F3" strokeWidth={2} name="Libraries" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🌆 Libraries by City
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByCity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="libraries" fill="#9C27B0" name="Libraries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Top Performers & At-Risk */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
          {/* Top Performers */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                🏆 Top Performing Libraries
              </Typography>
              <Stack spacing={2}>
                {topPerformers.length > 0 ? (
                  topPerformers.map((library, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: '#F3E5F5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            #{index + 1} {library.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {library.tenantName}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`Revenue: ₹${(library.revenue / 1000).toFixed(0)}K`} size="small" color="success" />
                            <Chip label={`Occupancy: ${library.occupancy}%`} size="small" color="primary" />
                            <Chip label={`Growth: +${library.growth}%`} size="small" icon={<TrendingUp />} />
                          </Stack>
                        </Box>
                        <Star sx={{ fontSize: 32, color: '#FFD700' }} />
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Alert severity="info">
                    No library data available yet. Add tenants and libraries to see top performers.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* At-Risk Tenants */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                ⚠️ At-Risk Tenants
              </Typography>
              <Stack spacing={2}>
                {atRiskTenants.length > 0 ? (
                  atRiskTenants.map((tenant, index) => (
                    <Alert key={index} severity="warning" sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {tenant.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {tenant.reason} - {tenant.occupancy}% occupancy
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<Send />}
                            onClick={() => {
                              const tenantData = tenantsWithLibraries.find(t => t.id === tenant.id);
                              if (tenantData) handleContactTenant(tenantData.email, tenantData.name);
                            }}
                          >
                            Contact Now
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<Visibility />}
                            onClick={() => handleViewTenant(tenant.id)}
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Box>
                    </Alert>
                  ))
                ) : (
                  <Alert severity="success">
                    <Typography variant="subtitle1" fontWeight="bold">
                      All tenants are performing well! 🎉
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      No tenants with occupancy below 70%. Great job!
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Analytics Tab - NOW THIRD */}
      <TabPanel value={currentTab} index={2}>
        {/* Filters Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList /> Analytics Filters
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tenants/libraries..."
                value={analyticsSearchQuery}
                onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Plan</InputLabel>
                <Select value={analyticsPlanFilter} onChange={(e) => setAnalyticsPlanFilter(e.target.value)}>
                  <MenuItem value="all">All Plans</MenuItem>
                  <MenuItem value="Enterprise">Enterprise</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>City</InputLabel>
                <Select value={analyticsCityFilter} onChange={(e) => setAnalyticsCityFilter(e.target.value)}>
                  <MenuItem value="all">All Cities</MenuItem>
                  <MenuItem value="Mumbai">Mumbai</MenuItem>
                  <MenuItem value="Bangalore">Bangalore</MenuItem>
                  <MenuItem value="Delhi">Delhi</MenuItem>
                  <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                  <MenuItem value="Pune">Pune</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select value={analyticsSortBy} onChange={(e) => setAnalyticsSortBy(e.target.value as any)}>
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="occupancy">Occupancy</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select value={analyticsSortOrder} onChange={(e) => setAnalyticsSortOrder(e.target.value as any)}>
                  <MenuItem value="desc">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingDown fontSize="small" />
                      <span>High to Low</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="asc">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUp fontSize="small" />
                      <span>Low to High</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredTenantsForAnalytics.length} of {tenantsWithLibraries.length} tenants | {filteredLibrariesForAnalytics.length} of {dashboardMetrics.totalLibraries} libraries
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={() => {
                  setAnalyticsSearchQuery('');
                  setAnalyticsPlanFilter('all');
                  setAnalyticsCityFilter('all');
                  setAnalyticsSortBy('revenue');
                  setAnalyticsSortOrder('desc');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Analytics Header with Summary */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Typography variant="h5" color="white" fontWeight="bold" gutterBottom>
              📊 Comprehensive Analytics Dashboard
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="caption" color="white">Total Platform Revenue</Typography>
                <Typography variant="h5" color="white" fontWeight="bold">
                  ₹{(filteredDashboardMetrics.totalMRR / 100000).toFixed(2)}L
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="white">Avg Revenue/Library</Typography>
                <Typography variant="h5" color="white" fontWeight="bold">
                  ₹{filteredDashboardMetrics.totalLibraries > 0 ? (filteredDashboardMetrics.totalMRR / filteredDashboardMetrics.totalLibraries / 1000).toFixed(0) : '0'}K
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="white">Avg Revenue/Student</Typography>
                <Typography variant="h5" color="white" fontWeight="bold">
                  ₹{filteredDashboardMetrics.totalStudents > 0 ? (filteredDashboardMetrics.totalMRR / filteredDashboardMetrics.totalStudents).toFixed(0) : '0'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="white">Platform Growth</Typography>
                <Typography variant="h5" color="white" fontWeight="bold">
                  +{dashboardMetrics.growth}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Row 1: Revenue Analysis */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
          {/* Revenue by Subscription Plan */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💰 Revenue Analysis by Subscription Plan
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                      <SortableHeader 
                        label="Plan" 
                        field="plan" 
                        currentSort={planTableSort.field} 
                        currentOrder={planTableSort.order}
                        onSort={handlePlanTableSort}
                      />
                      <SortableHeader 
                        label="Tenants" 
                        field="tenants" 
                        currentSort={planTableSort.field} 
                        currentOrder={planTableSort.order}
                        onSort={handlePlanTableSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Revenue" 
                        field="revenue" 
                        currentSort={planTableSort.field} 
                        currentOrder={planTableSort.order}
                        onSort={handlePlanTableSort}
                        align="right"
                      />
                      <TableCell align="right"><strong>% Share</strong></TableCell>
                      <SortableHeader 
                        label="Avg/Tenant" 
                        field="avgTenant" 
                        currentSort={planTableSort.field} 
                        currentOrder={planTableSort.order}
                        onSort={handlePlanTableSort}
                        align="right"
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueByPlan.map((row) => (
                      <TableRow key={row.plan} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                        <TableCell>
                          <Chip 
                            label={row.plan} 
                            size="small" 
                            color={row.plan === 'Enterprise' ? 'primary' : row.plan === 'Professional' ? 'secondary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">{row.tenants}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            ₹{(row.revenue / 1000).toFixed(0)}K
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${((row.revenue / dashboardMetrics.totalMRR) * 100).toFixed(1)}%`}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ₹{(row.revenue / row.tenants / 1000).toFixed(0)}K
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#E3F2FD' }}>
                      <TableCell><strong>TOTAL</strong></TableCell>
                      <TableCell align="right"><strong>{dashboardMetrics.totalTenants}</strong></TableCell>
                      <TableCell align="right">
                        <strong>₹{(dashboardMetrics.totalMRR / 1000).toFixed(0)}K</strong>
                      </TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                      <TableCell align="right">
                        <strong>₹{(dashboardMetrics.totalMRR / dashboardMetrics.totalTenants / 1000).toFixed(0)}K</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Geographic Performance */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🌍 Geographic Performance Analysis
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                      <SortableHeader 
                        label="City" 
                        field="city" 
                        currentSort={cityTableSort.field} 
                        currentOrder={cityTableSort.order}
                        onSort={handleCityTableSort}
                      />
                      <SortableHeader 
                        label="Libraries" 
                        field="libraries" 
                        currentSort={cityTableSort.field} 
                        currentOrder={cityTableSort.order}
                        onSort={handleCityTableSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Revenue" 
                        field="revenue" 
                        currentSort={cityTableSort.field} 
                        currentOrder={cityTableSort.order}
                        onSort={handleCityTableSort}
                        align="right"
                      />
                      <TableCell align="right"><strong>% Share</strong></TableCell>
                      <SortableHeader 
                        label="Avg/Library" 
                        field="avgLibrary" 
                        currentSort={cityTableSort.field} 
                        currentOrder={cityTableSort.order}
                        onSort={handleCityTableSort}
                        align="right"
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueByCity.map((row) => (
                      <TableRow key={row.city} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" fontWeight="medium">{row.city}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{row.libraries}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            ₹{(row.revenue / 1000).toFixed(0)}K
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${((row.revenue / dashboardMetrics.totalMRR) * 100).toFixed(1)}%`}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ₹{(row.revenue / row.libraries / 1000).toFixed(0)}K
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                      <TableCell><strong>TOTAL</strong></TableCell>
                      <TableCell align="right"><strong>{dashboardMetrics.totalLibraries}</strong></TableCell>
                      <TableCell align="right">
                        <strong>₹{(dashboardMetrics.totalMRR / 1000).toFixed(0)}K</strong>
                      </TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                      <TableCell align="right">
                        <strong>₹{(dashboardMetrics.totalMRR / dashboardMetrics.totalLibraries / 1000).toFixed(0)}K</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Row 2: Capacity & Occupancy Analysis */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
          {/* Tenant Performance Detailed */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🏢 Tenant Performance Matrix
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                      <SortableHeader 
                        label="Tenant" 
                        field="name" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                      />
                      <SortableHeader 
                        label="Libraries" 
                        field="libraries" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Capacity" 
                        field="capacity" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Students" 
                        field="students" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Occupancy" 
                        field="occupancy" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Revenue" 
                        field="revenue" 
                        currentSort={analyticsSortBy} 
                        currentOrder={analyticsSortOrder}
                        onSort={handleSort}
                        align="right"
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTenantsForAnalytics.length > 0 ? (
                      sortedTenantsForAnalytics.map((tenant) => (
                        <TableRow key={tenant.id} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>
                                {tenant.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">{tenant.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{tenant.librariesCount}</TableCell>
                          <TableCell align="right">{tenant.totalCapacity}</TableCell>
                          <TableCell align="right">{tenant.totalStudents}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${tenant.avgOccupancy}%`}
                              size="small"
                              color={tenant.avgOccupancy >= 80 ? 'success' : tenant.avgOccupancy >= 60 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ₹{(tenant.totalRevenue / 1000).toFixed(0)}K
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No tenants match your filters. Try adjusting the criteria.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {sortedTenantsForAnalytics.length > 0 && (
                      <TableRow sx={{ bgcolor: '#FFF3E0' }}>
                        <TableCell><strong>TOTALS</strong></TableCell>
                        <TableCell align="right"><strong>{filteredDashboardMetrics.totalLibraries}</strong></TableCell>
                        <TableCell align="right"><strong>{filteredDashboardMetrics.totalCapacity}</strong></TableCell>
                        <TableCell align="right"><strong>{filteredDashboardMetrics.totalStudents}</strong></TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${filteredDashboardMetrics.avgOccupancy}%`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <strong>₹{(filteredDashboardMetrics.totalMRR / 1000).toFixed(0)}K</strong>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Library Performance Ranking */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📚 Library Performance Ranking
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                      <TableCell><strong>Rank</strong></TableCell>
                      <SortableHeader 
                        label="Library" 
                        field="name" 
                        currentSort={libraryRankSort.field} 
                        currentOrder={libraryRankSort.order}
                        onSort={handleLibraryRankSort}
                      />
                      <SortableHeader 
                        label="Revenue" 
                        field="revenue" 
                        currentSort={libraryRankSort.field} 
                        currentOrder={libraryRankSort.order}
                        onSort={handleLibraryRankSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Occupancy" 
                        field="occupancy" 
                        currentSort={libraryRankSort.field} 
                        currentOrder={libraryRankSort.order}
                        onSort={handleLibraryRankSort}
                        align="right"
                      />
                      <SortableHeader 
                        label="Students" 
                        field="students" 
                        currentSort={libraryRankSort.field} 
                        currentOrder={libraryRankSort.order}
                        onSort={handleLibraryRankSort}
                        align="right"
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformers.map((library, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: '#FAFAFA' } }}>
                        <TableCell>
                          <Chip 
                            label={`#${index + 1}`}
                            size="small"
                            color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                            icon={index === 0 ? <Star /> : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">{library.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{library.tenantName}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(library.revenue / 1000).toFixed(0)}K
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${library.occupancy}%`}
                            size="small"
                            color={library.occupancy >= 85 ? 'success' : 'primary'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {library.students}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Row 3: Key Insights & Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {/* Revenue Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'success.main' }}>
                💵 Revenue Insights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Highest Revenue Plan</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {revenueByPlan.sort((a, b) => b.revenue - a.revenue)[0].plan}
                  </Typography>
                  <Typography variant="caption">
                    ₹{(revenueByPlan.sort((a, b) => b.revenue - a.revenue)[0].revenue / 1000).toFixed(0)}K/month
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Highest Revenue City</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {revenueByCity.sort((a, b) => b.revenue - a.revenue)[0].city}
                  </Typography>
                  <Typography variant="caption">
                    ₹{(revenueByCity.sort((a, b) => b.revenue - a.revenue)[0].revenue / 1000).toFixed(0)}K/month
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Average Revenue per Seat</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{(dashboardMetrics.totalMRR / dashboardMetrics.totalCapacity).toFixed(0)}
                  </Typography>
                  <Typography variant="caption">per seat/month</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Capacity Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                📊 Capacity Insights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Platform Capacity</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {dashboardMetrics.totalCapacity} seats
                  </Typography>
                  <Typography variant="caption">
                    {dashboardMetrics.totalStudents} active ({dashboardMetrics.avgOccupancy}%)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Average Library Size</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {Math.floor(dashboardMetrics.totalCapacity / dashboardMetrics.totalLibraries)} seats
                  </Typography>
                  <Typography variant="caption">per library</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Utilization Rate</Typography>
                  <Typography variant="h6" fontWeight="bold" color={dashboardMetrics.avgOccupancy >= 75 ? 'success.main' : 'warning.main'}>
                    {dashboardMetrics.avgOccupancy}%
                  </Typography>
                  <Typography variant="caption">
                    {dashboardMetrics.avgOccupancy >= 75 ? 'Excellent' : 'Room for growth'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Growth Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'secondary.main' }}>
                📈 Growth Insights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Platform Growth Rate</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    +{dashboardMetrics.growth}%
                  </Typography>
                  <Typography variant="caption">month over month</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Libraries per Tenant</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {(dashboardMetrics.totalLibraries / dashboardMetrics.totalTenants).toFixed(1)}
                  </Typography>
                  <Typography variant="caption">average ratio</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Churn Risk</Typography>
                  <Typography variant="h6" fontWeight="bold" color={atRiskTenants.length === 0 ? 'success.main' : 'warning.main'}>
                    {atRiskTenants.length} tenant{atRiskTenants.length !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption">
                    {atRiskTenants.length === 0 ? 'All healthy' : 'Needs attention'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* Map View Tab */}
      <TabPanel value={currentTab} index={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📍 Library Map View
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and explore all libraries on an interactive map
          </Typography>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>City</InputLabel>
                  <Select
                    value={mapCityFilter}
                    label="City"
                    onChange={(e) => setMapCityFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Cities</MenuItem>
                    <MenuItem value="Mumbai">Mumbai</MenuItem>
                    <MenuItem value="Delhi">Delhi</MenuItem>
                    <MenuItem value="Bangalore">Bangalore</MenuItem>
                    <MenuItem value="Pune">Pune</MenuItem>
                    <MenuItem value="Chennai">Chennai</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={mapStatusFilter}
                    label="Status"
                    onChange={(e) => setMapStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={mapPlanFilter}
                    label="Plan"
                    onChange={(e) => setMapPlanFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Plans</MenuItem>
                    <MenuItem value="Free">Free</MenuItem>
                    <MenuItem value="Starter">Starter</MenuItem>
                    <MenuItem value="Professional">Professional</MenuItem>
                    <MenuItem value="Enterprise">Enterprise</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setMapCityFilter('all');
                    setMapStatusFilter('all');
                    setMapPlanFilter('all');
                    setSelectedLibrary(null);
                  }}
                >
                  Reset Filters
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<MyLocation />}
                  onClick={() => {
                    // Center map to user location
                    alert('Centering map to your location...');
                  }}
                >
                  My Location
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Map Statistics */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <LocationOn />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Libraries
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {tenantsWithLibraries.reduce((sum, t) => sum + t.librariesCount, 0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Active Libraries
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {tenantsWithLibraries.flatMap(t => t.libraries).filter(l => l.status === 'active').length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Layers />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cities Covered
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {Array.from(new Set(tenantsWithLibraries.map(t => t.city))).length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <EventSeat />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Capacity
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {tenantsWithLibraries.reduce((sum, t) => sum + t.totalCapacity, 0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Map Container */}
          <Card>
            <CardContent>
              {/* Google Maps Placeholder */}
              <Box
                sx={{
                  height: 600,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              >
                {/* Map Legend */}
                <Paper
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    p: 2,
                    minWidth: 200,
                    zIndex: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Legend
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ color: 'success.main' }} fontSize="small" />
                      <Typography variant="caption">Active Library</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ color: 'error.main' }} fontSize="small" />
                      <Typography variant="caption">Inactive Library</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn sx={{ color: 'warning.main' }} fontSize="small" />
                      <Typography variant="caption">Low Occupancy</Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {/* Central Info */}
                <Stack alignItems="center" spacing={2}>
                  <MapIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary">
                    Interactive Map View
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                    Google Maps Integration Coming Soon
                  </Typography>
                  <Alert severity="info" sx={{ maxWidth: 500 }}>
                    <Typography variant="body2">
                      To enable the map, add your Google Maps API key in the environment configuration.
                      All {tenantsWithLibraries.reduce((sum, t) => sum + t.librariesCount, 0)} libraries will be displayed with interactive markers.
                    </Typography>
                  </Alert>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Library List View */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📋 Library Directory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All libraries with location details
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Library Name</TableCell>
                      <TableCell>Tenant</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Occupancy</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenantsWithLibraries
                      .filter(tenant => 
                        (mapCityFilter === 'all' || tenant.city === mapCityFilter) &&
                        (mapStatusFilter === 'all' || tenant.status === mapStatusFilter) &&
                        (mapPlanFilter === 'all' || tenant.plan === mapPlanFilter)
                      )
                      .flatMap(tenant =>
                        tenant.libraries.map(library => ({
                          ...library,
                          tenantName: tenant.name,
                          city: tenant.city,
                          plan: tenant.plan,
                        }))
                      )
                      .map((library, index) => (
                        <TableRow
                          key={index}
                          hover
                          selected={selectedLibrary === library.libraryId}
                          onClick={() => setSelectedLibrary(library.libraryId)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOn
                                fontSize="small"
                                sx={{
                                  color:
                                    library.status === 'active'
                                      ? library.occupancyRate > 70
                                        ? 'success.main'
                                        : 'warning.main'
                                      : 'error.main',
                                }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {library.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {library.libraryId}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{library.tenantName}</Typography>
                            <Chip label={library.plan} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{library.city}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {library.address}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={library.status}
                              size="small"
                              color={library.status === 'active' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{library.capacity} seats</Typography>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {library.occupiedSeats}/{library.capacity}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={library.occupancyRate}
                                sx={{ height: 6, borderRadius: 3 }}
                                color={
                                  library.occupancyRate > 80
                                    ? 'success'
                                    : library.occupancyRate > 50
                                    ? 'primary'
                                    : 'warning'
                                }
                              />
                              <Typography variant="caption" color="text.secondary">
                                {library.occupancyRate}% occupied
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <MuiTooltip title="View on Map">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<MapIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLibrary(library.libraryId);
                                    alert(`Centering map on: ${library.name}`);
                                  }}
                                >
                                  Map
                                </Button>
                              </MuiTooltip>
                              <MuiTooltip title="View Details">
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<Visibility />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/libraries/${library.libraryId}`);
                                  }}
                                >
                                  Details
                                </Button>
                              </MuiTooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {tenantsWithLibraries
                .filter(tenant => 
                  (mapCityFilter === 'all' || tenant.city === mapCityFilter) &&
                  (mapStatusFilter === 'all' || tenant.status === mapStatusFilter) &&
                  (mapPlanFilter === 'all' || tenant.plan === mapPlanFilter)
                )
                .flatMap(tenant => tenant.libraries).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No libraries match the selected filters
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default ComprehensiveTenantLibraryManagement;
