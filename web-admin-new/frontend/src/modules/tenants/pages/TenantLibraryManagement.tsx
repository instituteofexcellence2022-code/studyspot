// ============================================
// TENANT & LIBRARY MANAGEMENT - UNIFIED
// Complete view of tenants with their libraries
// YOUR PRIMARY CUSTOMERS: Library Owners (B2B)
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
  IconButton,
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
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Business,
  TrendingUp,
  AttachMoney,
  Assessment,
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

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TenantLibraryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [expandedTenant, setExpandedTenant] = useState<string | false>(false);

  // ============================================
  // UNIFIED DATA: Tenants with Their Libraries
  // ============================================

  const platformKPIs = {
    totalTenants: 161,
    totalLibraries: 185, // Some tenants have multiple libraries
    avgLibrariesPerTenant: 1.15,
    totalStudents: 12847,
    mrr: 845000,
    platformOccupancy: 70.4,
  };

  const tenantsWithLibraries = [
    {
      id: 'TEN001',
      name: 'Central Library Network',
      email: 'admin@centrallibrary.com',
      phone: '+91 98765 43210',
      plan: 'Enterprise',
      status: 'active',
      joinedDate: '2024-01-15',
      totalRevenue: 125000,
      totalStudents: 1234,
      librariesCount: 5,
      libraries: [
        {
          id: 'LIB001',
          name: 'Central Library - Mumbai',
          city: 'Mumbai',
          capacity: 200,
          occupied: 145,
          occupancy: 72.5,
          students: 245,
          revenue: 45600,
          rating: 4.8,
          status: 'active',
        },
        {
          id: 'LIB002',
          name: 'Central Library - Thane',
          city: 'Mumbai',
          capacity: 150,
          occupied: 98,
          occupancy: 65.3,
          students: 198,
          revenue: 32400,
          rating: 4.6,
          status: 'active',
        },
        {
          id: 'LIB003',
          name: 'Central Library - Andheri',
          city: 'Mumbai',
          capacity: 180,
          occupied: 126,
          occupancy: 70.0,
          students: 234,
          revenue: 38200,
          rating: 4.7,
          status: 'active',
        },
      ],
    },
    {
      id: 'TEN002',
      name: 'Tech Study Hub',
      email: 'contact@techstudyhub.com',
      phone: '+91 98765 43211',
      plan: 'Professional',
      status: 'active',
      joinedDate: '2024-02-20',
      totalRevenue: 98000,
      totalStudents: 987,
      librariesCount: 4,
      libraries: [
        {
          id: 'LIB004',
          name: 'Tech Hub - Bangalore',
          city: 'Bangalore',
          capacity: 150,
          occupied: 98,
          occupancy: 65.3,
          students: 198,
          revenue: 38900,
          rating: 4.6,
          status: 'active',
        },
        {
          id: 'LIB005',
          name: 'Tech Hub - Whitefield',
          city: 'Bangalore',
          capacity: 120,
          occupied: 84,
          occupancy: 70.0,
          students: 167,
          revenue: 28400,
          rating: 4.5,
          status: 'active',
        },
      ],
    },
    {
      id: 'TEN003',
      name: 'Knowledge Point',
      email: 'info@knowledgepoint.com',
      phone: '+91 98765 43212',
      plan: 'Starter',
      status: 'active',
      joinedDate: '2024-03-10',
      totalRevenue: 31200,
      totalStudents: 167,
      librariesCount: 1,
      libraries: [
        {
          id: 'LIB006',
          name: 'Knowledge Point - Delhi',
          city: 'Delhi',
          capacity: 100,
          occupied: 78,
          occupancy: 78.0,
          students: 167,
          revenue: 31200,
          rating: 4.5,
          status: 'active',
        },
      ],
    },
  ];

  const getPlanColor = (plan: string) => {
    if (plan === 'Enterprise') return 'secondary';
    if (plan === 'Professional') return 'primary';
    if (plan === 'Starter') return 'info';
    return 'default';
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'trial') return 'info';
    if (status === 'suspended') return 'error';
    return 'default';
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'error';
    if (rate >= 60) return 'success';
    return 'warning';
  };

  const handleAccordionChange = (tenantId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTenant(isExpanded ? tenantId : false);
  };

  // ============================================
  // TAB 1: TENANT & LIBRARIES VIEW
  // ============================================

  const TenantLibrariesTab = () => (
    <Box>
      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">Total Tenants</Typography>
          <Typography variant="h5" fontWeight="bold">{platformKPIs.totalTenants}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">Total Libraries</Typography>
          <Typography variant="h5" fontWeight="bold">{platformKPIs.totalLibraries}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">Avg Libraries/Tenant</Typography>
          <Typography variant="h5" fontWeight="bold">{platformKPIs.avgLibrariesPerTenant.toFixed(2)}</Typography>
        </Paper>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="trial">Trial</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Plan</InputLabel>
              <Select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} label="Plan">
                <MenuItem value="all">All Plans</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="starter">Starter</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tenant Accordions with Nested Libraries */}
      <Stack spacing={2}>
        {tenantsWithLibraries.map((tenant) => (
          <Accordion
            key={tenant.id}
            expanded={expandedTenant === tenant.id}
            onChange={handleAccordionChange(tenant.id)}
            sx={{
              border: '1px solid #E0E0E0',
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                bgcolor: '#FAFAFA',
                '&:hover': { bgcolor: '#F5F5F5' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                  {/* Tenant Avatar & Name */}
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'primary.main',
                      background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
                    }}
                  >
                    {tenant.name.charAt(0)}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {tenant.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip label={tenant.plan} color={getPlanColor(tenant.plan) as any} size="small" />
                      <Chip label={tenant.status.toUpperCase()} color={getStatusColor(tenant.status) as any} size="small" />
                      <Chip label={`${tenant.librariesCount} Libraries`} size="small" variant="outlined" />
                    </Stack>
                  </Box>
                </Stack>

                {/* Tenant Quick Stats */}
                <Stack direction="row" spacing={3} sx={{ mr: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Students</Typography>
                    <Typography variant="h6" fontWeight="bold">{tenant.totalStudents}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹{(tenant.totalRevenue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Libraries</Typography>
                    <Typography variant="h6" fontWeight="bold">{tenant.librariesCount}</Typography>
                  </Box>
                </Stack>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ bgcolor: 'white' }}>
              {/* Tenant Contact Info */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#F3E5F5' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{tenant.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{tenant.phone}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Joined: {tenant.joinedDate}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" startIcon={<Send />}>
                      Contact
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Edit />}>
                      Edit Tenant
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => navigate(`/tenants/${tenant.id}`)}>
                      View Full Details
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              {/* Libraries Table */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📚 Libraries ({tenant.librariesCount})
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><strong>Library Name</strong></TableCell>
                      <TableCell><strong>City</strong></TableCell>
                      <TableCell align="right"><strong>Capacity</strong></TableCell>
                      <TableCell align="right"><strong>Occupancy</strong></TableCell>
                      <TableCell align="right"><strong>Students</strong></TableCell>
                      <TableCell align="right"><strong>Revenue</strong></TableCell>
                      <TableCell align="right"><strong>Rating</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tenant.libraries.map((library) => (
                      <TableRow key={library.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
                              {library.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="bold">
                              {library.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">{library.city}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{library.capacity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ minWidth: 100 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption">{library.occupied}/{library.capacity}</Typography>
                              <Typography variant="caption" fontWeight="bold">{library.occupancy}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={library.occupancy}
                              color={getOccupancyColor(library.occupancy) as any}
                              sx={{ height: 4, borderRadius: 1 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">{library.students}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(library.revenue / 1000).toFixed(0)}K
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                            <Star sx={{ fontSize: 14, color: '#FFD700' }} />
                            <Typography variant="body2">{library.rating}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={library.status.toUpperCase()} color="success" size="small" />
                        </TableCell>
                        <TableCell>
                          <MuiTooltip title="View Library Details">
                            <IconButton size="small" onClick={() => navigate(`/libraries/${library.id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Library Summary */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2 }}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                  <Typography variant="caption" color="text.secondary">Total Seats</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {tenant.libraries.reduce((sum, lib) => sum + lib.capacity, 0)}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#E8F5E9' }}>
                  <Typography variant="caption" color="text.secondary">Avg Occupancy</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {(tenant.libraries.reduce((sum, lib) => sum + lib.occupancy, 0) / tenant.libraries.length).toFixed(1)}%
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                  <Typography variant="caption" color="text.secondary">Total Students</Typography>
                  <Typography variant="h6" fontWeight="bold">{tenant.totalStudents}</Typography>
                </Paper>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#F3E5F5' }}>
                  <Typography variant="caption" color="text.secondary">Monthly Revenue</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ₹{(tenant.totalRevenue / 1000).toFixed(0)}K
                  </Typography>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🏢 Tenants & Libraries
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unified view of your customers with their libraries • {platformKPIs.totalTenants} tenants • {platformKPIs.totalLibraries} libraries
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/tenants/onboarding')}>
            Add Tenant
          </Button>
        </Stack>
      </Box>

      {/* Platform Summary */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Platform Summary</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">{platformKPIs.totalTenants}</Typography>
              <Typography variant="caption">Tenants</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{platformKPIs.totalLibraries}</Typography>
              <Typography variant="caption">Libraries</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">{platformKPIs.totalStudents.toLocaleString()}</Typography>
              <Typography variant="caption">Total Students</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">₹{(platformKPIs.mrr / 100000).toFixed(1)}L</Typography>
              <Typography variant="caption">Monthly Revenue (MRR)</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          <TenantLibrariesTab />
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantLibraryManagement;

