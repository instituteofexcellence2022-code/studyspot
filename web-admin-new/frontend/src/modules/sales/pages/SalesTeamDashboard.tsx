// ============================================
// SALES & TEAMS PERFORMANCE DASHBOARD
// Industry-level comprehensive sales management with AI
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  TextField,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip as MuiTooltip,
  Menu,
  MenuItem,
  Fade,
  Zoom,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import {
  TrendingUp,
  Add,
  Download,
  Refresh,
  Phone,
  Email,
  AutoAwesome,
  Psychology,
  Speed,
  History,
  Assignment,
  Timeline,
  Group,
  Visibility,
  Warning,
  FilterList,
  HelpOutline,
  Settings,
  Notifications,
  Search,
  Close,
  MoreVert,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SalesTeamDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [pipelineStage, setPipelineStage] = useState('all');
  const [searchMember, setSearchMember] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [memberDetailTab, setMemberDetailTab] = useState(0);
  const [groupBy, setGroupBy] = useState('day');
  const [quickActionsMenu, setQuickActionsMenu] = useState<null | HTMLElement>(null);
  const [settingsMenu, setSettingsMenu] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<number | 'all'>('all');
  const [personDashboardOpen, setPersonDashboardOpen] = useState(false);
  const [referralHistoryOpen, setReferralHistoryOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
  const [selectedReferralMember, setSelectedReferralMember] = useState<any>(null);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Auto-adjust groupBy when dateRange changes
  React.useEffect(() => {
    if (['today', 'yesterday'].includes(dateRange) && groupBy !== 'hour') {
      setGroupBy('hour');
    } else if (dateRange === '7d' && !['hour', 'day'].includes(groupBy)) {
      setGroupBy('day');
    } else if (dateRange === '30d' && !['day', 'week'].includes(groupBy)) {
      setGroupBy('day');
    } else if (dateRange === '90d' && !['week', 'month'].includes(groupBy)) {
      setGroupBy('week');
    } else if (['6m', '1y', 'all'].includes(dateRange) && groupBy !== 'month') {
      setGroupBy('month');
    } else if (dateRange === 'custom' && !['day', 'week'].includes(groupBy)) {
      setGroupBy('day');
    }
  }, [dateRange, groupBy]);

  // Mock Data - Sales Overview KPIs
  const platformKPIs = {
    totalRevenue: 15678900,
    monthlyGrowth: 28.5,
    totalDeals: 1456,
    activeLeads: 3421,
    conversionRate: 42.5,
    avgDealSize: 10768,
    teamSize: 48,
    fieldAgents: 12,
    activeOpportunities: 812,
    closedDeals: 1456,
    lostDeals: 234,
    avgResponseTime: 1.4,
    avgDealCycle: 18,
    customerRetention: 87.5,
    leadResponseRate: 94.2,
    quotaAttainment: 102.3,
  };

  // Generate historical data based on date range and grouping
  const generateHistoricalData = () => {
    const baseRevenue = 15678900;
    const baseDealSize = 10768;
    
    // Today - hourly data (24 hours)
    if (dateRange === 'today' && groupBy === 'hour') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: baseRevenue * 0.04 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(60 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(270 * (0.8 + Math.random() * 0.4)),
      }));
    }
    
    // Yesterday - hourly data (24 hours)
    if (dateRange === 'yesterday' && groupBy === 'hour') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: baseRevenue * 0.04 * (0.75 + Math.random() * 0.35),
        deals: Math.floor(58 * (0.75 + Math.random() * 0.35)),
        conversion: 37 + Math.random() * 7,
        avgDeal: baseDealSize * (0.75 + Math.random() * 0.35),
        activities: Math.floor(260 * (0.75 + Math.random() * 0.35)),
      }));
    }
    
    // Custom Range - default to daily view
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      const daysDiff = Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      if (groupBy === 'hour' && daysDiff <= 2) {
        return Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          revenue: baseRevenue * 0.04 * (0.8 + Math.random() * 0.4),
          deals: Math.floor(60 * (0.8 + Math.random() * 0.4)),
          conversion: 38 + Math.random() * 8,
          avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
          activities: Math.floor(270 * (0.8 + Math.random() * 0.4)),
        }));
      } else if (groupBy === 'day' && daysDiff <= 31) {
        return Array.from({ length: Math.min(daysDiff, 31) }, (_, i) => ({
          label: `Day ${i + 1}`,
          revenue: baseRevenue * (0.033 / daysDiff) * 30 * (0.8 + Math.random() * 0.4),
          deals: Math.floor((48 / daysDiff) * 30 * (0.8 + Math.random() * 0.4)),
          conversion: 38 + Math.random() * 8,
          avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
          activities: Math.floor((218 / daysDiff) * 30 * (0.8 + Math.random() * 0.4)),
        }));
      } else if (groupBy === 'week') {
        const weeks = Math.ceil(daysDiff / 7);
        return Array.from({ length: weeks }, (_, i) => ({
          label: `Week ${i + 1}`,
          revenue: baseRevenue * (1 / weeks) * (0.8 + Math.random() * 0.4),
          deals: Math.floor((1456 / weeks) * (0.8 + Math.random() * 0.4)),
          conversion: 38 + Math.random() * 8,
          avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
          activities: Math.floor((6560 / weeks) * (0.8 + Math.random() * 0.4)),
        }));
      } else if (groupBy === 'month') {
        const months = Math.ceil(daysDiff / 30);
        return Array.from({ length: months }, (_, i) => ({
          label: `Month ${i + 1}`,
          revenue: baseRevenue * (1 / months) * (0.8 + Math.random() * 0.4),
          deals: Math.floor((1456 / months) * (0.8 + Math.random() * 0.4)),
          conversion: 38 + Math.random() * 8,
          avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
          activities: Math.floor((6560 / months) * (0.8 + Math.random() * 0.4)),
        }));
      }
    }
    
    if (dateRange === '7d' && groupBy === 'hour') {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: baseRevenue * 0.04 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(60 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(270 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '7d') {
      return Array.from({ length: 7 }, (_, i) => ({
        label: `Day ${i + 1}`,
        revenue: baseRevenue * 0.14 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(208 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(937 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '30d' && groupBy === 'day') {
      return Array.from({ length: 30 }, (_, i) => ({
        label: `Day ${i + 1}`,
        revenue: baseRevenue * 0.033 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(48 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(218 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '30d' && groupBy === 'week') {
      return Array.from({ length: 4 }, (_, i) => ({
        label: `Week ${i + 1}`,
        revenue: baseRevenue * 0.25 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(364 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(1640 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '90d' && groupBy === 'week') {
      return Array.from({ length: 13 }, (_, i) => ({
        label: `Week ${i + 1}`,
        revenue: baseRevenue * 0.076 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(112 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(504 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '90d' && groupBy === 'month') {
      return Array.from({ length: 3 }, (_, i) => ({
        label: `Month ${i + 1}`,
        revenue: baseRevenue * 0.33 * (0.8 + Math.random() * 0.4),
        deals: Math.floor(485 * (0.8 + Math.random() * 0.4)),
        conversion: 38 + Math.random() * 8,
        avgDeal: baseDealSize * (0.8 + Math.random() * 0.4),
        activities: Math.floor(2186 * (0.8 + Math.random() * 0.4)),
      }));
    } else if (dateRange === '6m' || dateRange === '1y') {
      const months = dateRange === '6m' ? 6 : 12;
      return Array.from({ length: months }, (_, i) => ({
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        revenue: 9200000 + (i * 550000) + Math.random() * 200000,
        deals: 1020 + (i * 36) + Math.floor(Math.random() * 20),
        conversion: 38.5 + (i * 0.33),
        avgDeal: 9019 + (i * 145),
        activities: 4560 + (i * 166),
      }));
    } else {
      return [
        { label: 'Jan', revenue: 9200000, deals: 1020, conversion: 38.5, avgDeal: 9019, activities: 4560 },
        { label: 'Feb', revenue: 9800000, deals: 1089, conversion: 39.2, avgDeal: 9000, activities: 4780 },
        { label: 'Mar', revenue: 10500000, deals: 1134, conversion: 40.1, avgDeal: 9259, activities: 4920 },
        { label: 'Apr', revenue: 11200000, deals: 1198, conversion: 40.8, avgDeal: 9349, activities: 5120 },
        { label: 'May', revenue: 11800000, deals: 1245, conversion: 41.2, avgDeal: 9478, activities: 5340 },
        { label: 'Jun', revenue: 12400000, deals: 1298, conversion: 41.8, avgDeal: 9553, activities: 5560 },
        { label: 'Jul', revenue: 13100000, deals: 1345, conversion: 42.0, avgDeal: 9739, activities: 5780 },
        { label: 'Aug', revenue: 13800000, deals: 1398, conversion: 42.3, avgDeal: 9871, activities: 5960 },
        { label: 'Sep', revenue: 14200000, deals: 1423, conversion: 42.1, avgDeal: 9979, activities: 6120 },
        { label: 'Oct', revenue: 14900000, deals: 1445, conversion: 42.4, avgDeal: 10311, activities: 6280 },
        { label: 'Nov', revenue: 15400000, deals: 1456, conversion: 42.5, avgDeal: 10577, activities: 6420 },
        { label: 'Dec', revenue: 15678900, deals: 1456, conversion: 42.5, avgDeal: 10768, activities: 6560 },
      ];
    }
  };

  const historicalData = generateHistoricalData();

  // Sales Pipeline Stages
  const pipelineStages = [
    { id: 'lead', name: 'New Leads', count: 245, value: 12250000, color: '#9E9E9E', conversionRate: 68 },
    { id: 'qualified', name: 'Qualified', count: 167, value: 10020000, color: '#2196F3', conversionRate: 75 },
    { id: 'demo', name: 'Demo Scheduled', count: 125, value: 8750000, color: '#00BCD4', conversionRate: 82 },
    { id: 'proposal', name: 'Proposal Sent', count: 102, value: 7650000, color: '#FF9800', conversionRate: 88 },
    { id: 'negotiation', name: 'Negotiation', count: 90, value: 7200000, color: '#FFC107', conversionRate: 92 },
    { id: 'closed_won', name: 'Closed Won', count: 83, value: 6640000, color: '#4CAF50', conversionRate: 100 },
    { id: 'closed_lost', name: 'Closed Lost', count: 62, value: 0, color: '#F44336', conversionRate: 0 },
  ];

  // Team Members
  const teamMembers = [
    { id: 1, name: 'Rahul Sharma', role: 'Senior Sales Manager', team: 'Enterprise', revenue: 2450000, target: 2500000, deals: 28, conversion: 48.5, performance: 98, efficiency: 96, responseTime: 1.2, location: 'Delhi', status: 'active', calls: 156, meetings: 42, emails: 234, avgDealSize: 87500, winRate: 68, quotaAttainment: 98, activeTasks: 12, completedTasks: 145, referralCode: 'RAH-DEL-2024', referrals: 45, referralRevenue: 1680000, referralConversion: 38.5, referralBonus: 142800 },
    { id: 2, name: 'Priya Singh', role: 'Sales Executive', team: 'SMB', revenue: 1890000, target: 2000000, deals: 34, conversion: 45.2, performance: 94.5, efficiency: 93, responseTime: 1.5, location: 'Mumbai', status: 'active', calls: 189, meetings: 38, emails: 267, avgDealSize: 55588, winRate: 62, quotaAttainment: 94.5, activeTasks: 18, completedTasks: 128, referralCode: 'PRI-MUM-2024', referrals: 62, referralRevenue: 2140000, referralConversion: 42.8, referralBonus: 181900 },
    { id: 3, name: 'Amit Patel', role: 'Account Manager', team: 'Mid-Market', revenue: 2100000, target: 2200000, deals: 22, conversion: 52.1, performance: 95.5, efficiency: 94, responseTime: 1.1, location: 'Bangalore', status: 'active', calls: 134, meetings: 35, emails: 198, avgDealSize: 95454, winRate: 71, quotaAttainment: 95.5, activeTasks: 15, completedTasks: 132, referralCode: 'AMI-BLR-2024', referrals: 38, referralRevenue: 1520000, referralConversion: 35.2, referralBonus: 129200 },
    { id: 4, name: 'Sneha Reddy', role: 'Sales Representative', team: 'Inbound', revenue: 1450000, target: 1800000, deals: 42, conversion: 38.9, performance: 80.6, efficiency: 82, responseTime: 2.1, location: 'Hyderabad', status: 'active', calls: 212, meetings: 31, emails: 289, avgDealSize: 34524, winRate: 55, quotaAttainment: 80.6, activeTasks: 22, completedTasks: 98, referralCode: 'SNE-HYD-2024', referrals: 28, referralRevenue: 980000, referralConversion: 31.2, referralBonus: 83300 },
    { id: 5, name: 'Vikram Kumar', role: 'Sales Director', team: 'Enterprise', revenue: 3200000, target: 3000000, deals: 18, conversion: 61.2, performance: 106.7, efficiency: 98, responseTime: 0.9, location: 'Delhi', status: 'active', calls: 98, meetings: 56, emails: 176, avgDealSize: 177778, winRate: 78, quotaAttainment: 106.7, activeTasks: 8, completedTasks: 167, referralCode: 'VIK-DEL-2024', referrals: 52, referralRevenue: 2890000, referralConversion: 45.6, referralBonus: 245650 },
  ];

  // Field Sales Agents
  const fieldAgents = [
    { id: 'fs1', name: 'Rajesh Kumar', territory: 'North Delhi', referralCode: 'RAJ-ND-2024', visits: 68, conversions: 24, revenue: 1680000, target: 1800000, conversionRate: 35.3 },
    { id: 'fs2', name: 'Anjali Nair', territory: 'South Mumbai', referralCode: 'ANJ-SM-2024', visits: 54, conversions: 22, revenue: 1540000, target: 1600000, conversionRate: 40.7 },
    { id: 'fs3', name: 'Karan Mehta', territory: 'Bangalore Central', referralCode: 'KAR-BC-2024', visits: 42, conversions: 16, revenue: 1120000, target: 1400000, conversionRate: 38.1 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Header with Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                💼 Sales & Teams Performance
              </Typography>
              <MuiTooltip title="AI-Powered sales analytics with ML predictions, forecasting, and real-time insights" arrow>
                <IconButton size="small" color="primary">
                  <HelpOutline />
                </IconButton>
              </MuiTooltip>
              <Chip label="Live" color="success" size="small" icon={<Notifications />} sx={{ animation: 'pulse 2s infinite' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date().toLocaleString()} • {teamMembers.length} active members • {platformKPIs.activeLeads} active leads
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <MuiTooltip title="Quick Actions: Add deal, Schedule meeting, Send email" arrow>
              <Button 
                variant="contained" 
                startIcon={<AutoAwesome />}
                onClick={(e) => setQuickActionsMenu(e.currentTarget)}
              >
                Quick Actions
              </Button>
            </MuiTooltip>
            <MuiTooltip title="Export data to Excel, PDF, or CSV" arrow>
              <Button variant="outlined" startIcon={<Download />}>
                Export
              </Button>
            </MuiTooltip>
            <MuiTooltip title="Refresh all data and charts" arrow>
              <IconButton color="primary" onClick={() => alert('Data refreshed!')}>
                <Refresh />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Dashboard settings and preferences" arrow>
              <IconButton color="primary" onClick={(e) => setSettingsMenu(e.currentTarget)}>
                <Settings />
              </IconButton>
            </MuiTooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Quick Actions Menu */}
      <Menu
        anchorEl={quickActionsMenu}
        open={Boolean(quickActionsMenu)}
        onClose={() => setQuickActionsMenu(null)}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => { setQuickActionsMenu(null); alert('Add New Deal'); }}>
          <Add sx={{ mr: 1 }} /> Add New Deal
        </MenuItem>
        <MenuItem onClick={() => { setQuickActionsMenu(null); alert('Schedule Meeting'); }}>
          <Timeline sx={{ mr: 1 }} /> Schedule Meeting
        </MenuItem>
        <MenuItem onClick={() => { setQuickActionsMenu(null); alert('Send Bulk Email'); }}>
          <Email sx={{ mr: 1 }} /> Send Bulk Email
        </MenuItem>
        <MenuItem onClick={() => { setQuickActionsMenu(null); alert('Add Team Member'); }}>
          <Group sx={{ mr: 1 }} /> Add Team Member
        </MenuItem>
        <MenuItem onClick={() => { setQuickActionsMenu(null); setAiInsightsOpen(true); }}>
          <Psychology sx={{ mr: 1 }} /> View AI Insights
        </MenuItem>
      </Menu>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenu}
        open={Boolean(settingsMenu)}
        onClose={() => setSettingsMenu(null)}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => { setSettingsMenu(null); alert('Customize Dashboard'); }}>
          <Settings sx={{ mr: 1 }} /> Customize Dashboard
        </MenuItem>
        <MenuItem onClick={() => { setSettingsMenu(null); alert('Configure Notifications'); }}>
          <Notifications sx={{ mr: 1 }} /> Configure Notifications
        </MenuItem>
        <MenuItem onClick={() => { setSettingsMenu(null); alert('Manage Columns'); }}>
          <FilterList sx={{ mr: 1 }} /> Manage Columns
        </MenuItem>
        <MenuItem onClick={() => { setSettingsMenu(null); setShowHelp(!showHelp); }}>
          <HelpOutline sx={{ mr: 1 }} /> Toggle Help Tips
        </MenuItem>
      </Menu>

      {/* Help Panel */}
      {showHelp && (
        <Alert 
          severity="info" 
          icon={<HelpOutline />}
          sx={{ mb: 2 }}
          onClose={() => setShowHelp(false)}
        >
          <Typography variant="body2" fontWeight="bold">💡 Quick Tips:</Typography>
          <Typography variant="caption" display="block">
            • Click on KPI cards to see detailed breakdowns
          </Typography>
          <Typography variant="caption" display="block">
            • Use Quick Actions menu for common tasks
          </Typography>
          <Typography variant="caption" display="block">
            • Click pipeline stages to filter deals
          </Typography>
          <Typography variant="caption" display="block">
            • Hover over charts for detailed tooltips
          </Typography>
          <Typography variant="caption" display="block">
            • Use time range & grouping filters for custom views
          </Typography>
          <Typography variant="caption" display="block">
            • <strong>NEW:</strong> Select a salesperson to see ALL their data in one place
          </Typography>
        </Alert>
      )}

      {/* Individual Salesperson Filter */}
      <Card sx={{ mb: 3, border: 2, borderColor: 'secondary.main', bgcolor: 'secondary.50' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 180 }}>
              🎯 View Individual Performance:
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Select Salesperson</InputLabel>
              <Select
                value={selectedPersonFilter}
                onChange={(e) => {
                  setSelectedPersonFilter(e.target.value as number | 'all');
                  if (e.target.value !== 'all') {
                    setPersonDashboardOpen(true);
                    setSelectedMember(teamMembers.find(m => m.id === e.target.value));
                  } else {
                    setPersonDashboardOpen(false);
                  }
                }}
                label="Select Salesperson"
              >
                <MenuItem value="all">
                  <em>All Team Members (Default View)</em>
                </MenuItem>
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {member.name} - {member.role} ({member.team})
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedPersonFilter !== 'all' && (
              <Button 
                variant="outlined" 
                color="secondary"
                startIcon={<Close />}
                onClick={() => {
                  setSelectedPersonFilter('all');
                  setPersonDashboardOpen(false);
                }}
              >
                Clear Filter
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Individual Salesperson Centralized Dashboard */}
      {personDashboardOpen && selectedMember && (
        <Card sx={{ mb: 3, border: 3, borderColor: 'success.main', bgcolor: 'success.50' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'success.main', fontSize: '2rem' }}>
                  {selectedMember.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{selectedMember.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMember.role} • {selectedMember.team} • {selectedMember.location}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={selectedMember.status} size="small" color="success" />
                    <Chip label={`Code: ${selectedMember.referralCode}`} size="small" color="warning" />
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<Phone />}>Call</Button>
                <Button variant="outlined" startIcon={<Email />}>Email</Button>
                <Button variant="contained" startIcon={<Visibility />} onClick={() => setMemberDetailsOpen(true)}>
                  Full Details
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Time Range Filter for Individual Performance */}
            <Card sx={{ mb: 3, bgcolor: 'white' }}>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight="bold">📅 Date Range:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {['today', 'yesterday', '7d', '30d', '90d', '6m', '1y', 'all', 'custom'].map((range) => (
                        <Chip
                          key={range}
                          label={
                            range === 'today' ? 'Today' :
                            range === 'yesterday' ? 'Yesterday' :
                            range === '7d' ? '7 Days' : 
                            range === '30d' ? '30 Days' : 
                            range === '90d' ? '90 Days' : 
                            range === '6m' ? '6 Months' : 
                            range === '1y' ? 'Year' : 
                            range === 'all' ? 'All Time' :
                            customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : 'Custom Range'
                          }
                          onClick={() => {
                            if (range === 'custom') {
                              setCustomRangeOpen(true);
                            } else {
                              setDateRange(range);
                            }
                          }}
                          color={dateRange === range ? 'primary' : 'default'}
                          variant={dateRange === range ? 'filled' : 'outlined'}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight="bold">📊 Group By:</Typography>
                    <Stack direction="row" spacing={1}>
                      {['hour', 'day', 'week', 'month'].map((group) => {
                        const disabled = 
                          (group === 'hour' && dateRange !== '7d') ||
                          (group === 'day' && !['7d', '30d'].includes(dateRange)) ||
                          (group === 'week' && !['30d', '90d'].includes(dateRange)) ||
                          (group === 'month' && !['90d', '6m', '1y', 'all'].includes(dateRange));
                        
                        return (
                          <Chip
                            key={group}
                            label={group.charAt(0).toUpperCase() + group.slice(1)}
                            onClick={() => !disabled && setGroupBy(group)}
                            color={groupBy === group ? 'secondary' : 'default'}
                            variant={groupBy === group ? 'filled' : 'outlined'}
                            size="small"
                            disabled={disabled}
                          />
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* All-in-One Performance Overview */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Complete Performance Overview
            </Typography>

            {/* Primary KPIs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
                <Typography variant="caption" color="text.secondary">Revenue</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  ₹{(selectedMember.revenue / 100000).toFixed(1)}L
                </Typography>
                <Typography variant="caption">Target: ₹{(selectedMember.target / 100000).toFixed(1)}L</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
                <Typography variant="caption" color="text.secondary">Deals Closed</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">{selectedMember.deals}</Typography>
                <Typography variant="caption">Won: {Math.floor(selectedMember.deals * 0.6)}</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', border: 2, borderColor: 'info.main' }}>
                <Typography variant="caption" color="text.secondary">Conversion</Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">{selectedMember.conversion}%</Typography>
                <Typography variant="caption">Win Rate: {selectedMember.winRate}%</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', border: 2, borderColor: 'warning.main' }}>
                <Typography variant="caption" color="text.secondary">Quota</Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">{selectedMember.quotaAttainment}%</Typography>
                <Typography variant="caption">Performance: {selectedMember.performance}%</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', border: 2, borderColor: 'error.main' }}>
                <Typography variant="caption" color="text.secondary">Response Time</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">{selectedMember.responseTime}h</Typography>
                <Typography variant="caption">Efficiency: {selectedMember.efficiency}%</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50', border: 2, borderColor: 'secondary.main' }}>
                <Typography variant="caption" color="text.secondary">Referrals</Typography>
                <Typography variant="h5" fontWeight="bold" color="secondary.main">{selectedMember.referrals}</Typography>
                <Typography variant="caption">Conv: {selectedMember.referralConversion}%</Typography>
              </Paper>
            </Box>

            {/* Activity & Communication */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📞 Activity Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Total Calls</Typography>
                      <Chip label={selectedMember.calls} color="primary" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Total Meetings</Typography>
                      <Chip label={selectedMember.meetings} color="success" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Total Emails</Typography>
                      <Chip label={selectedMember.emails} color="warning" />
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">Total Touchpoints</Typography>
                      <Chip label={selectedMember.calls + selectedMember.meetings + selectedMember.emails} color="info" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    💰 Financial Summary
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Direct Sales Revenue</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ₹{(selectedMember.revenue / 100000).toFixed(1)}L
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Referral Revenue</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ₹{(selectedMember.referralRevenue / 100000).toFixed(1)}L
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Base Commission</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        ₹{(selectedMember.revenue * 0.08 / 100000).toFixed(2)}L
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Referral Bonus</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        ₹{(selectedMember.referralBonus / 1000).toFixed(0)}K
                      </Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">Total Earnings</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{((selectedMember.revenue * 0.085 + selectedMember.referralBonus) / 100000).toFixed(2)}L
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Performance Breakdown */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🎯 Deal Performance
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Deals</Typography>
                      <Typography variant="h4" fontWeight="bold">{selectedMember.deals}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Avg Deal Size</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(selectedMember.avgDealSize / 1000).toFixed(0)}K
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedMember.conversion} 
                        sx={{ height: 10, borderRadius: 5, mb: 0.5 }}
                        color="success"
                      />
                      <Typography variant="caption" fontWeight="bold">{selectedMember.conversion}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedMember.winRate} 
                        sx={{ height: 10, borderRadius: 5, mb: 0.5 }}
                        color="primary"
                      />
                      <Typography variant="caption" fontWeight="bold">{selectedMember.winRate}%</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🎁 Referral Performance
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Referrals</Typography>
                      <Typography variant="h4" fontWeight="bold">{selectedMember.referrals}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Converted Referrals</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {Math.floor(selectedMember.referrals * (selectedMember.referralConversion / 100))}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Referral Conversion</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedMember.referralConversion} 
                        sx={{ height: 10, borderRadius: 5, mb: 0.5 }}
                        color="warning"
                      />
                      <Typography variant="caption" fontWeight="bold">{selectedMember.referralConversion}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Referral Revenue</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(selectedMember.referralRevenue / 100000).toFixed(1)}L
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ⚡ Efficiency Metrics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Active Tasks</Typography>
                      <Typography variant="h4" fontWeight="bold">{selectedMember.activeTasks}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Completed Tasks</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {selectedMember.completedTasks}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Task Completion Rate</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(selectedMember.completedTasks / (selectedMember.completedTasks + selectedMember.activeTasks)) * 100} 
                        sx={{ height: 10, borderRadius: 5, mb: 0.5 }}
                        color="info"
                      />
                      <Typography variant="caption" fontWeight="bold">
                        {((selectedMember.completedTasks / (selectedMember.completedTasks + selectedMember.activeTasks)) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Response Time</Typography>
                      <Typography variant="h6" fontWeight="bold" color={selectedMember.responseTime < 1.5 ? 'success.main' : 'warning.main'}>
                        {selectedMember.responseTime}h
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Comprehensive Charts */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📈 Revenue Trend
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    {dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : dateRange === '6m' ? 'Last 6 Months' : dateRange === '1y' ? 'Last Year' : 'All Time'} • 
                    Grouped by {groupBy}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={historicalData.map((d: any) => ({
                      label: d.label,
                      direct: (selectedMember.revenue / platformKPIs.totalRevenue) * (d.revenue || 0),
                      referral: (selectedMember.referralRevenue / platformKPIs.totalRevenue) * (d.revenue || 0) * 0.6,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={historicalData.length > 15 ? -45 : 0} textAnchor={historicalData.length > 15 ? 'end' : 'middle'} height={historicalData.length > 15 ? 80 : 30} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="direct" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Direct Sales" />
                      <Area type="monotone" dataKey="referral" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} name="Referrals" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📊 Activity Trend Over Time
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Calls, Meetings, Emails, Deals • Grouped by {groupBy}
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={historicalData.map((d: any) => ({
                      label: d.label,
                      calls: Math.floor((selectedMember.calls / teamMembers.reduce((sum, m) => sum + m.calls, 0)) * ((d.activities || 0) * 0.38)),
                      meetings: Math.floor((selectedMember.meetings / teamMembers.reduce((sum, m) => sum + m.meetings, 0)) * ((d.activities || 0) * 0.11)),
                      emails: Math.floor((selectedMember.emails / teamMembers.reduce((sum, m) => sum + m.emails, 0)) * ((d.activities || 0) * 0.48)),
                      deals: Math.floor((selectedMember.deals / platformKPIs.totalDeals) * (d.deals || 0)),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" angle={historicalData.length > 15 ? -45 : 0} textAnchor={historicalData.length > 15 ? 'end' : 'middle'} height={historicalData.length > 15 ? 80 : 30} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="calls" stroke="#2196F3" fill="#2196F3" fillOpacity={0.4} name="Calls" />
                      <Area type="monotone" dataKey="meetings" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.4} name="Meetings" />
                      <Area type="monotone" dataKey="emails" stroke="#FF9800" fill="#FF9800" fillOpacity={0.4} name="Emails" />
                      <Area type="monotone" dataKey="deals" stroke="#9C27B0" fill="#9C27B0" fillOpacity={0.4} name="Deals" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Performance Comparison Card */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Performance vs Team Average (Selected Period)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
                  {[
                    { metric: 'Revenue', value: selectedMember.revenue, teamAvg: platformKPIs.totalRevenue / teamMembers.length, format: 'L' },
                    { metric: 'Deals', value: selectedMember.deals, teamAvg: platformKPIs.totalDeals / teamMembers.length, format: '' },
                    { metric: 'Conversion', value: selectedMember.conversion, teamAvg: platformKPIs.conversionRate, format: '%' },
                    { metric: 'Referrals', value: selectedMember.referrals, teamAvg: teamMembers.reduce((sum, m) => sum + m.referrals, 0) / teamMembers.length, format: '' },
                    { metric: 'Efficiency', value: selectedMember.efficiency, teamAvg: teamMembers.reduce((sum, m) => sum + m.efficiency, 0) / teamMembers.length, format: '%' },
                  ].map((item, idx) => (
                    <Paper key={idx} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" display="block">{item.metric}</Typography>
                      <Typography variant="h6" fontWeight="bold" color={item.value >= item.teamAvg ? 'success.main' : 'warning.main'}>
                        {item.format === 'L' ? `₹${(item.value / 100000).toFixed(1)}L` : `${item.value.toFixed(1)}${item.format}`}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Team Avg: {item.format === 'L' ? `₹${(item.teamAvg / 100000).toFixed(1)}L` : `${item.teamAvg.toFixed(1)}${item.format}`}
                      </Typography>
                      <Typography variant="caption" display="block" color={item.value >= item.teamAvg ? 'success.main' : 'error.main'} fontWeight="bold">
                        {item.value >= item.teamAvg ? '↑' : '↓'} {Math.abs(((item.value - item.teamAvg) / item.teamAvg) * 100).toFixed(1)}%
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Contact & Team Information */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📞 Contact Information
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">+91 98765 43210</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{selectedMember.name.toLowerCase().replace(' ', '.')}@studyspot.com</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Speed fontSize="small" color="action" />
                      <Typography variant="body2">{selectedMember.location}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    👥 Team Information
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Team:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedMember.team}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Role:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedMember.role}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Status:</Typography>
                      <Chip label={selectedMember.status} size="small" color="success" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Commission Breakdown */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💰 Commission & Earnings Breakdown
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Earned (This Month)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ₹{(selectedMember.revenue * 0.085 / 100000).toFixed(2)}L
                    </Typography>
                    <Typography variant="caption">From direct sales</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Commission Rate</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">8.5%</Typography>
                    <Typography variant="caption">Of revenue</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">YTD Earnings</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      ₹{(selectedMember.revenue * 0.085 * 12 / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption">Projected annual</Typography>
                  </Paper>
                </Box>
                
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.50' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Detailed Commission Breakdown</Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Base Commission (8%)</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(selectedMember.revenue * 0.08 / 100000).toFixed(2)}L</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Performance Bonus (0.5%)</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">₹{(selectedMember.revenue * 0.005 / 100000).toFixed(2)}L</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Referral Bonus</Typography>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">₹{(selectedMember.referralBonus / 1000).toFixed(0)}K</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold">Total Commission (This Month)</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">₹{((selectedMember.revenue * 0.085 + selectedMember.referralBonus) / 100000).toFixed(2)}L</Typography>
                    </Stack>
                  </Stack>
                </Paper>
                
                <Alert severity="info" icon={<Psychology />}>
                  <Typography variant="body2">
                    <strong>Earning Potential:</strong> If {selectedMember.name} maintains current performance, projected annual earnings are ₹{((selectedMember.revenue * 0.085 * 12 + selectedMember.referralBonus * 12) / 100000).toFixed(1)}L in commissions.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Active Deals List */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📋 Active & Recent Deals
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main">{selectedMember.deals}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Deals</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">{Math.floor(selectedMember.deals * 0.6)}</Typography>
                    <Typography variant="caption" color="text.secondary">Won</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">{Math.floor(selectedMember.deals * 0.4)}</Typography>
                    <Typography variant="caption" color="text.secondary">In Progress</Typography>
                  </Paper>
                </Box>
                <Stack spacing={2}>
                  {[
                    { client: 'ABC Corporation', value: 250000, stage: 'Closed Won', probability: 100, closeDate: '2 days ago', dealSize: 'Large' },
                    { client: 'XYZ Ltd', value: 180000, stage: 'Negotiation', probability: 85, closeDate: 'Expected in 3 days', dealSize: 'Medium' },
                    { client: 'Tech Solutions', value: 320000, stage: 'Proposal Sent', probability: 72, closeDate: 'Expected in 7 days', dealSize: 'Large' },
                    { client: 'Global Inc', value: 95000, stage: 'Demo Scheduled', probability: 58, closeDate: 'Expected in 14 days', dealSize: 'Small' },
                    { client: 'Innovation Hub', value: 420000, stage: 'Closed Won', probability: 100, closeDate: '5 days ago', dealSize: 'Enterprise' },
                  ].map((deal, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: 2, borderColor: deal.stage === 'Closed Won' ? 'success.main' : 'primary.main' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold">{deal.client}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deal.closeDate} • ₹{(deal.value / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip 
                            label={deal.stage} 
                            size="small" 
                            color={deal.stage === 'Closed Won' ? 'success' : deal.stage === 'Negotiation' ? 'warning' : 'primary'}
                          />
                          <Chip label={`${deal.probability}% win`} size="small" color="info" />
                          <Chip label={deal.dealSize} size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity Timeline */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📅 Recent Activity Timeline (Last 7 Days)
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {[
                    { action: 'Closed Deal', client: 'ABC Corp', value: '₹2.5L', time: '2 hours ago', type: 'success' },
                    { action: 'Scheduled Meeting', client: 'XYZ Ltd', value: 'Demo Call', time: '5 hours ago', type: 'info' },
                    { action: 'Sent Proposal', client: 'Tech Solutions', value: '₹1.8L', time: '1 day ago', type: 'warning' },
                    { action: 'Call Completed', client: 'Global Inc', value: 'Follow-up', time: '2 days ago', type: 'primary' },
                    { action: 'Email Sent', client: 'Innovation Hub', value: 'Pricing Details', time: '3 days ago', type: 'info' },
                    { action: 'Demo Completed', client: 'Smart Systems', value: '₹1.2L', time: '4 days ago', type: 'success' },
                    { action: 'Referral Converted', client: 'Digital Corp', value: '₹2.2L', time: '5 days ago', type: 'warning' },
                    { action: 'Meeting Scheduled', client: 'Cloud Solutions', value: 'Discovery Call', time: '6 days ago', type: 'primary' },
                  ].map((activity, idx) => (
                    <Paper key={idx} sx={{ p: 2, borderLeft: 4, borderColor: `${activity.type}.main` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{activity.action}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.client} • {activity.value}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Advanced Performance Metrics */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Advanced Performance Metrics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Performance Indicators</Typography>
                    <Stack spacing={2}>
                      {[
                        { label: 'Quota Attainment', value: selectedMember.quotaAttainment, target: 100 },
                        { label: 'Win Rate', value: selectedMember.winRate, target: 60 },
                        { label: 'Efficiency', value: selectedMember.efficiency, target: 90 },
                        { label: 'Activity Score', value: ((selectedMember.calls + selectedMember.meetings + selectedMember.emails) / 5), target: 100 },
                      ].map((item, idx) => (
                        <Box key={idx}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption">{item.label}</Typography>
                            <Typography variant="caption" fontWeight="bold">{item.value.toFixed(1)}%</Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((item.value / item.target) * 100, 100)} 
                            sx={{ height: 8, borderRadius: 4 }}
                            color={item.value >= item.target ? 'success' : item.value >= item.target * 0.8 ? 'primary' : 'warning'}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Communication Stats</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { type: 'Calls', count: selectedMember.calls },
                        { type: 'Meetings', count: selectedMember.meetings },
                        { type: 'Emails', count: selectedMember.emails },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#2196F3" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Referral Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎁 Sales Referral Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Complete referral performance and history
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {selectedMember.referrals}
                    </Typography>
                    <Typography variant="caption">Total Referrals</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {Math.floor(selectedMember.referrals * (selectedMember.referralConversion / 100))}
                    </Typography>
                    <Typography variant="caption">Converted</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {selectedMember.referralConversion}%
                    </Typography>
                    <Typography variant="caption">Conversion Rate</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      ₹{(selectedMember.referralRevenue / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption">Referral Revenue</Typography>
                  </Paper>
                </Box>

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Recent Referrals (Last 10)
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { company: 'Tech Solutions Inc', contact: 'Rajesh Gupta', date: '2 days ago', status: 'Converted', value: 120000, source: 'LinkedIn' },
                    { company: 'Global Enterprises', contact: 'Priya Sharma', date: '5 days ago', status: 'In Progress', value: 180000, source: 'Email' },
                    { company: 'Innovation Hub', contact: 'Amit Verma', date: '7 days ago', status: 'Converted', value: 95000, source: 'WhatsApp' },
                    { company: 'Smart Systems', contact: 'Neha Patel', date: '10 days ago', status: 'Demo Scheduled', value: 150000, source: 'Website' },
                    { company: 'Digital Corp', contact: 'Karan Singh', date: '12 days ago', status: 'Converted', value: 220000, source: 'Facebook' },
                  ].slice(0, 5).map((referral, idx) => (
                    <Paper key={idx} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{referral.company}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {referral.contact} • {referral.date} • via {referral.source}
                          </Typography>
                        </Box>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Chip 
                            label={referral.status} 
                            size="small" 
                            color={referral.status === 'Converted' ? 'success' : referral.status === 'Demo Scheduled' ? 'warning' : 'primary'}
                          />
                          {referral.value > 0 && (
                            <Typography variant="caption" fontWeight="bold" color="success.main">
                              ₹{(referral.value / 1000).toFixed(0)}K
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSelectedReferralMember(selectedMember);
                    setReferralHistoryOpen(true);
                  }}
                >
                  View Full Referral History
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Alert severity="info" icon={<Psychology />} sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold">🤖 AI Performance Analysis</Typography>
              <Typography variant="caption" display="block">
                <strong>Strengths:</strong> {selectedMember.name} excels in {selectedMember.conversion > 45 ? 'conversion rate' : 'activity volume'} with {selectedMember.conversion}% conversion and {selectedMember.winRate}% win rate.
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Opportunities:</strong> {selectedMember.responseTime > 1.5 ? 'Improve response time to <1.5h for better lead engagement' : 'Maintain excellent response time'}.
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Recommendation:</strong> Focus on increasing {selectedMember.referrals < 50 ? 'referral activities' : 'deal closures'} to maximize earnings. Potential uplift: ₹{((selectedMember.revenue * 0.1) / 100000).toFixed(1)}L/month.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card sx={{ transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab 
            label="Sales Overview" 
            icon={<Timeline />} 
            iconPosition="start"
            sx={{ 
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
          <Tab 
            label="Sales Pipeline" 
            icon={<TrendingUp />} 
            iconPosition="start"
            sx={{ 
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
          <Tab 
            label="Team Performance" 
            icon={<Group />} 
            iconPosition="start"
            sx={{ 
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
          <Tab 
            label="Sales Referral" 
            icon={<AutoAwesome />} 
            iconPosition="start"
            sx={{ 
              transition: 'all 0.3s',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box>
            {/* AI Insights Banner */}
            <Alert 
              severity="info" 
              icon={<Psychology />}
              sx={{ 
                mb: 3, 
                cursor: 'pointer',
                transition: 'all 0.3s',
                animation: 'pulse 3s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: 2 },
                  '50%': { boxShadow: 6 },
                },
                '&:hover': { 
                  transform: 'scale(1.02)',
                  boxShadow: 8 
                }
              }}
              onClick={() => setAiInsightsOpen(true)}
              action={
                <Button color="inherit" size="small" startIcon={<AutoAwesome />}>
                  View AI Insights
                </Button>
              }
            >
              <Typography variant="body2" fontWeight="bold">
                🤖 AI Recommendation: Sales momentum is strong! Consider increasing field agent allocation in Mumbai territory (+40% conversion rate).
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                Click for detailed insights and recommendations • Updated 2 minutes ago
              </Typography>
            </Alert>

            {/* Time Range Controls */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">📅 Date Range:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {['today', 'yesterday', '7d', '30d', '90d', '6m', '1y', 'all', 'custom'].map((range) => (
                        <Chip
                          key={range}
                          label={
                            range === 'today' ? 'Today' :
                            range === 'yesterday' ? 'Yesterday' :
                            range === '7d' ? '7 Days' : 
                            range === '30d' ? '30 Days' : 
                            range === '90d' ? '90 Days' : 
                            range === '6m' ? '6 Months' : 
                            range === '1y' ? 'Year' : 
                            range === 'all' ? 'All Time' :
                            customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : 'Custom Range'
                          }
                          onClick={() => {
                            if (range === 'custom') {
                              setCustomRangeOpen(true);
                            } else {
                              setDateRange(range);
                            }
                          }}
                          color={dateRange === range ? 'primary' : 'default'}
                          variant={dateRange === range ? 'filled' : 'outlined'}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">📊 Group By:</Typography>
                    <Stack direction="row" spacing={1}>
                      {['hour', 'day', 'week', 'month'].map((group) => {
                        const disabled = 
                          (group === 'hour' && dateRange !== '7d') ||
                          (group === 'day' && !['7d', '30d'].includes(dateRange)) ||
                          (group === 'week' && !['30d', '90d'].includes(dateRange)) ||
                          (group === 'month' && !['90d', '6m', '1y', 'all'].includes(dateRange));
                        
                        return (
                          <Chip
                            key={group}
                            label={group.charAt(0).toUpperCase() + group.slice(1)}
                            onClick={() => !disabled && setGroupBy(group)}
                            color={groupBy === group ? 'secondary' : 'default'}
                            variant={groupBy === group ? 'filled' : 'outlined'}
                            size="small"
                            disabled={disabled}
                          />
                        );
                      })}
                    </Stack>
                  </Stack>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="subtitle1" fontWeight="bold">📊 Compare:</Typography>
                  <Stack direction="row" spacing={1}>
                    {[
                      { value: 'previous', label: 'Previous' },
                      { value: 'lastYear', label: 'Last Year' },
                      { value: 'target', label: 'Target' },
                    ].map((option) => (
                      <Chip
                        key={option.value}
                        label={option.label}
                        onClick={() => setComparisonPeriod(option.value)}
                        color={comparisonPeriod === option.value ? 'success' : 'default'}
                        variant={comparisonPeriod === option.value ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      📊 Sales Performance Overview
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Real-time monitoring & AI-powered insights
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${dateRange === '30d' ? 'Last Month' : 'Period'} | vs ${comparisonPeriod === 'previous' ? 'Previous' : comparisonPeriod === 'lastYear' ? 'Last Year' : 'Target'}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                  <MuiTooltip 
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">Revenue Breakdown</Typography>
                        <Typography variant="caption">Enterprise: ₹5.65Cr (36%)</Typography>
                        <Typography variant="caption" display="block">SMB: ₹4.34Cr (28%)</Typography>
                        <Typography variant="caption" display="block">Mid-Market: ₹3.12Cr (20%)</Typography>
                        <Typography variant="caption" display="block">Growth: +{platformKPIs.monthlyGrowth}% vs previous</Typography>
                      </Box>
                    }
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Box sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Revenue</Typography>
                      <Typography variant="h4" fontWeight="bold">₹{(platformKPIs.totalRevenue / 10000000).toFixed(2)}Cr</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <TrendingUp fontSize="small" />
                        <Typography variant="caption">+{platformKPIs.monthlyGrowth}%</Typography>
                      </Stack>
                    </Box>
                  </MuiTooltip>
                  <MuiTooltip 
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">Deal Status</Typography>
                        <Typography variant="caption">Closed Won: {platformKPIs.closedDeals}</Typography>
                        <Typography variant="caption" display="block">Active: {platformKPIs.activeOpportunities}</Typography>
                        <Typography variant="caption" display="block">Lost: {platformKPIs.lostDeals}</Typography>
                      </Box>
                    }
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Box sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Total Deals</Typography>
                      <Typography variant="h4" fontWeight="bold">{platformKPIs.totalDeals}</Typography>
                      <Typography variant="caption">Active: {platformKPIs.activeLeads}</Typography>
                    </Box>
                  </MuiTooltip>
                  <MuiTooltip 
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">Conversion Analysis</Typography>
                        <Typography variant="caption">Your Rate: {platformKPIs.conversionRate}%</Typography>
                        <Typography variant="caption" display="block">Industry: 35%</Typography>
                        <Typography variant="caption" display="block">Top 10%: 55%</Typography>
                        <Typography variant="caption" display="block" color="success.main">+{(platformKPIs.conversionRate - 35).toFixed(1)}% above industry</Typography>
                      </Box>
                    }
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Box sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Conversion Rate</Typography>
                      <Typography variant="h4" fontWeight="bold">{platformKPIs.conversionRate}%</Typography>
                      <Typography variant="caption">Industry avg: 35%</Typography>
                    </Box>
                  </MuiTooltip>
                  <MuiTooltip 
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" fontWeight="bold" display="block">Deal Size Breakdown</Typography>
                        <Typography variant="caption">Enterprise: ₹177K avg</Typography>
                        <Typography variant="caption" display="block">Mid-Market: ₹95K avg</Typography>
                        <Typography variant="caption" display="block">SMB: ₹55K avg</Typography>
                        <Typography variant="caption" display="block">Small: ₹34K avg</Typography>
                      </Box>
                    }
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Box sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>Avg Deal Size</Typography>
                      <Typography variant="h4" fontWeight="bold">₹{(platformKPIs.avgDealSize / 1000).toFixed(0)}K</Typography>
                      <Typography variant="caption">Team: {platformKPIs.teamSize} members</Typography>
                    </Box>
                  </MuiTooltip>
                </Box>
              </CardContent>
            </Card>

            {/* Advanced Performance Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
              <MuiTooltip title="Track team's overall quota achievement. Target: 100%. Current: Exceeding expectations!" arrow>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Quota Attainment</Typography>
                      <Chip label={`${platformKPIs.quotaAttainment}%`} size="small" color="success" />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(platformKPIs.quotaAttainment, 100)} 
                      sx={{ height: 12, borderRadius: 6, mb: 1 }}
                      color="success"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {platformKPIs.quotaAttainment >= 100 ? '🎉 Exceeded target' : 'On track'}
                    </Typography>
                  </CardContent>
                </Card>
              </MuiTooltip>
              
              <MuiTooltip title="Average time to respond to new leads. Industry avg: 3.2h. Target: <1h" arrow>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
                      <Chip label={`${platformKPIs.avgResponseTime}h`} size="small" color="info" />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={(1 / platformKPIs.avgResponseTime) * 50} 
                      sx={{ height: 12, borderRadius: 6, mb: 1 }}
                      color="info"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {platformKPIs.avgResponseTime < 2 ? '⚡ Excellent speed' : 'Good speed'}
                    </Typography>
                  </CardContent>
                </Card>
              </MuiTooltip>
              
              <MuiTooltip title="Percentage of customers retained year-over-year. Industry benchmark: 75%" arrow>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Customer Retention</Typography>
                      <Chip label={`${platformKPIs.customerRetention}%`} size="small" color="success" />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={platformKPIs.customerRetention} 
                      sx={{ height: 12, borderRadius: 6, mb: 1 }}
                      color="success"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Industry: 75% • You're +{(platformKPIs.customerRetention - 75).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </MuiTooltip>
              
              <MuiTooltip title="Average days from first contact to closed deal. Industry avg: 28 days. Target: 14 days" arrow>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Avg Deal Cycle</Typography>
                      <Chip label={`${platformKPIs.avgDealCycle} days`} size="small" color="warning" />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={(30 - platformKPIs.avgDealCycle) / 30 * 100} 
                      sx={{ height: 12, borderRadius: 6, mb: 1 }}
                      color="warning"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Target: 14d • Better than industry (28d)
                    </Typography>
                  </CardContent>
                </Card>
              </MuiTooltip>
            </Box>

            {/* Win/Loss Analysis */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Win/Loss Analysis & Deal Breakdown
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Closed Won', value: platformKPIs.closedDeals, fill: '#4CAF50' },
                        { name: 'Lost', value: platformKPIs.lostDeals, fill: '#F44336' },
                        { name: 'Active', value: platformKPIs.activeOpportunities, fill: '#2196F3' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8884d8">
                          {[{ fill: '#4CAF50' }, { fill: '#F44336' }, { fill: '#2196F3' }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box>
                    <Stack spacing={2}>
                      <Paper sx={{ p: 2, bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">Won Deals</Typography>
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                              {platformKPIs.closedDeals}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Value</Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              ₹{(platformKPIs.totalRevenue / 10000000).toFixed(2)}Cr
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'error.50', border: 2, borderColor: 'error.main' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">Lost Deals</Typography>
                            <Typography variant="h4" fontWeight="bold" color="error.main">
                              {platformKPIs.lostDeals}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Loss Rate</Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main">
                              {((platformKPIs.lostDeals / (platformKPIs.closedDeals + platformKPIs.lostDeals)) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                      <Paper sx={{ p: 2, bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">Active Pipeline</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {platformKPIs.activeOpportunities}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Win Rate</Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              {((platformKPIs.closedDeals / (platformKPIs.closedDeals + platformKPIs.lostDeals)) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Historical Performance Chart */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      📈 Performance Trend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : dateRange === '6m' ? 'Last 6 Months' : dateRange === '1y' ? 'Last 12 Months' : 'All Time'} • 
                      Grouped by {groupBy}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {['revenue', 'deals', 'conversion', 'avgDeal'].map((metric) => (
                      <Chip
                        key={metric}
                        label={metric === 'revenue' ? 'Revenue' : metric === 'deals' ? 'Deals' : metric === 'conversion' ? 'Conversion %' : 'Avg Deal'}
                        onClick={() => setSelectedMetric(metric)}
                        color={selectedMetric === metric ? 'primary' : 'default'}
                        variant={selectedMetric === metric ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Stack>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={historicalData.length > 15 ? -45 : 0} textAnchor={historicalData.length > 15 ? 'end' : 'middle'} height={historicalData.length > 15 ? 80 : 30} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey={selectedMetric} stroke="#667eea" fill="url(#colorMetric)" />
                  </AreaChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="caption" color="text.secondary">Peak Month</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">Dec 24</Typography>
                    <Typography variant="caption">₹15.68Cr</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                    <Typography variant="caption" color="text.secondary">Growth Rate</Typography>
                    <Typography variant="h6" fontWeight="bold" color="info.main">+70.4%</Typography>
                    <Typography variant="caption">YoY</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="caption" color="text.secondary">Avg Monthly</Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">₹12.8Cr</Typography>
                    <Typography variant="caption">Last 12 months</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="caption" color="text.secondary">Forecast (AI)</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">₹17.2Cr</Typography>
                    <Typography variant="caption">Next month</Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>

            {/* Pipeline Health */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🎯 Pipeline Health Score
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h2" fontWeight="bold" color="success.main">92/100</Typography>
                    <Typography variant="body2" color="text.secondary">Excellent Health</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={92} 
                      sx={{ height: 12, borderRadius: 6, mt: 2 }}
                      color="success"
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Lead Quality</Typography>
                      <Chip label="95/100" size="small" color="success" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Conversion Velocity</Typography>
                      <Chip label="89/100" size="small" color="success" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Deal Size Consistency</Typography>
                      <Chip label="91/100" size="small" color="success" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Win Rate</Typography>
                      <Chip label="88/100" size="small" color="success" />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🤖 AI-Powered Insights
                  </Typography>
                  <Stack spacing={2}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Psychology color="success" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="success.main">High Probability</Typography>
                          <Typography variant="caption" color="text.secondary">
                            12 deals in negotiation stage have 85%+ close probability. Recommended action: Prioritize follow-ups.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                    <Paper sx={{ p: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Warning color="warning" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">At Risk</Typography>
                          <Typography variant="caption" color="text.secondary">
                            8 deals stuck in demo stage for {'>'} 14 days. AI suggests: Schedule follow-up calls within 48 hours.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                    <Paper sx={{ p: 2, bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Speed color="info" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="info.main">Optimize</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Response time improved by 15%. Conversion rate could increase by 8% with same velocity.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Daily Activity Monitoring */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📅 Activity Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Track calls, meetings, emails, and demos - 
                  {dateRange === '7d' ? ' Last 7 Days' : dateRange === '30d' ? ' Last 30 Days' : dateRange === '90d' ? ' Last 90 Days' : ' Selected Period'} • 
                  Grouped by {groupBy}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {Math.floor(historicalData.reduce((sum, d: any) => sum + (d.activities || 0) * 0.38, 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Calls</Typography>
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                      +12% vs previous
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {Math.floor(historicalData.reduce((sum, d: any) => sum + (d.activities || 0) * 0.11, 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Meetings</Typography>
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                      +8% vs previous
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {Math.floor(historicalData.reduce((sum, d: any) => sum + (d.activities || 0) * 0.48, 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Emails Sent</Typography>
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                      +18% vs previous
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {Math.floor(historicalData.reduce((sum, d: any) => sum + (d.deals || 0) * 0.06, 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Demos Scheduled</Typography>
                    <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                      +15% vs previous
                    </Typography>
                  </Paper>
                </Box>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={historicalData.map((d: any) => ({
                    label: d.label,
                    calls: Math.floor((d.activities || 0) * 0.38),
                    meetings: Math.floor((d.activities || 0) * 0.11),
                    emails: Math.floor((d.activities || 0) * 0.48),
                    demos: Math.floor((d.deals || 0) * 0.06),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={historicalData.length > 15 ? -45 : 0} textAnchor={historicalData.length > 15 ? 'end' : 'middle'} height={historicalData.length > 15 ? 80 : 30} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="calls" stackId="1" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} name="Calls" />
                    <Area type="monotone" dataKey="meetings" stackId="1" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Meetings" />
                    <Area type="monotone" dataKey="emails" stackId="1" stroke="#FF9800" fill="#FF9800" fillOpacity={0.6} name="Emails" />
                    <Area type="monotone" dataKey="demos" stackId="1" stroke="#9C27B0" fill="#9C27B0" fillOpacity={0.6} name="Demos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sales Forecasting & Predictions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🔮 AI-Powered Sales Forecasting & Predictions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Machine learning predictions based on historical patterns, seasonality, and current pipeline
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
                    <Typography variant="caption" color="text.secondary">Next Month Forecast</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">₹17.2Cr</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip label="95% confidence" size="small" color="success" />
                      <Typography variant="caption" color="success.main">+9.7%</Typography>
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
                    <Typography variant="caption" color="text.secondary">Quarter Forecast (Q1)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">₹52.4Cr</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip label="88% confidence" size="small" color="success" />
                      <Typography variant="caption" color="success.main">+12.3%</Typography>
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', border: 2, borderColor: 'info.main' }}>
                    <Typography variant="caption" color="text.secondary">Year Forecast (2025)</Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">₹215Cr</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip label="82% confidence" size="small" color="info" />
                      <Typography variant="caption" color="success.main">+18.2%</Typography>
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', border: 2, borderColor: 'warning.main' }}>
                    <Typography variant="caption" color="text.secondary">Pipeline Coverage</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">3.2x</Typography>
                    <Typography variant="caption" color="text.secondary">Healthy (Target: 3x)</Typography>
                  </Paper>
                </Box>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    ...historicalData.slice(-6).map((d: any) => ({ 
                      label: d.label, 
                      actual: d.revenue, 
                      forecast: null,
                      upper: null,
                      lower: null
                    })),
                    { label: 'Next', actual: null, forecast: 16200000, upper: 17200000, lower: 15200000 },
                    { label: 'Next+1', actual: null, forecast: 17100000, upper: 18500000, lower: 15700000 },
                    { label: 'Next+2', actual: null, forecast: 18200000, upper: 20000000, lower: 16400000 },
                  ]}>
                    <defs>
                      <linearGradient id="confidenceInterval" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceInterval)" name="Confidence Range" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" />
                    <Area type="monotone" dataKey="actual" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} name="Actual Revenue" />
                    <Area type="monotone" dataKey="forecast" stroke="#4CAF50" strokeDasharray="5 5" fill="#4CAF50" fillOpacity={0.3} name="Forecast" />
                  </AreaChart>
                </ResponsiveContainer>

                <Alert severity="info" sx={{ mt: 2 }} icon={<Psychology />}>
                  <Typography variant="body2" fontWeight="bold">AI Insights</Typography>
                  <Typography variant="caption">
                    Based on current pipeline velocity and historical trends, you're on track to exceed Q1 targets by 12%. 
                    Key drivers: Enterprise deals closing 18% faster, SMB conversion rate up 6%.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Territory Management & Geographic Analysis */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🗺️ Territory Management & Geographic Performance
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Regional sales performance, market penetration, and territory coverage analysis
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  {[
                    { territory: 'Delhi NCR', revenue: 5650000, deals: 46, agents: 2, growth: 28.5, penetration: 34 },
                    { territory: 'Mumbai', revenue: 4340000, deals: 56, agents: 1, growth: 32.1, penetration: 28 },
                    { territory: 'Bangalore', revenue: 3120000, deals: 28, agents: 1, growth: 18.7, penetration: 22 },
                    { territory: 'Hyderabad', revenue: 1450000, deals: 42, agents: 1, growth: 15.2, penetration: 16 },
                  ].map((territory, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: 2, borderColor: 'primary.main' }}>
                      <Typography variant="body1" fontWeight="bold" gutterBottom>{territory.territory}</Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Revenue</Typography>
                          <Typography variant="caption" fontWeight="bold" color="success.main">
                            ₹{(territory.revenue / 100000).toFixed(1)}L
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Deals</Typography>
                          <Typography variant="caption" fontWeight="bold">{territory.deals}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Agents</Typography>
                          <Typography variant="caption" fontWeight="bold">{territory.agents}</Typography>
                        </Stack>
                        <Divider />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">Growth</Typography>
                          <Chip label={`+${territory.growth}%`} size="small" color="success" />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">Market Penetration</Typography>
                          <Typography variant="caption" fontWeight="bold">{territory.penetration}%</Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={territory.penetration} 
                          sx={{ height: 6, borderRadius: 3 }}
                          color={territory.penetration >= 30 ? 'success' : 'primary'}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Box>
                
                <Alert severity="info" icon={<AutoAwesome />}>
                  <Typography variant="body2" fontWeight="bold">Territory Optimization Suggestion</Typography>
                  <Typography variant="caption">
                    Delhi NCR and Mumbai show highest performance. Consider expanding field agent presence in Bangalore (+18% potential) and Hyderabad (+22% untapped market).
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Top Performers Leaderboard */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🏆 Top Performers This Month
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                  {teamMembers
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((member, index) => (
                      <Paper
                        key={member.id}
                        sx={{
                          p: 2,
                          bgcolor: index === 0 ? 'warning.50' : index === 1 ? 'info.50' : 'success.50',
                          border: 2,
                          borderColor: index === 0 ? 'warning.main' : index === 1 ? 'info.main' : 'success.main',
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor:
                                index === 0 ? 'warning.main' : index === 1 ? 'info.main' : 'success.main',
                              fontSize: '1.5rem',
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 0.5 }}>
                              ₹{(member.revenue / 100000).toFixed(1)}L
                            </Typography>
                            <Typography variant="caption">
                              {member.deals} deals • {member.conversion}% conversion
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🎯 Sales Pipeline Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              7-stage pipeline with AI predictions, automation & deal tracking
            </Typography>

            {/* Pipeline Overview */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{pipelineStages.reduce((sum, s) => s.id !== 'closed_lost' ? sum + s.count : sum, 0)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Opportunities</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">₹{(pipelineStages.reduce((sum, s) => sum + s.value, 0) / 10000000).toFixed(2)}Cr</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Pipeline Value</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{pipelineStages.find(s => s.id === 'closed_won')?.count}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Won This Month</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {((pipelineStages.find(s => s.id === 'closed_won')?.count || 0) / (pipelineStages.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Win Rate</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Pipeline Stages */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      📊 Pipeline Stages (Click to Filter)
                    </Typography>
                    {pipelineStage !== 'all' && (
                      <Chip 
                        label={`Filtered: ${pipelineStages.find(s => s.id === pipelineStage)?.name}`}
                        onDelete={() => setPipelineStage('all')}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  <MuiTooltip title="Click on any stage to filter deals. Drag stages to reorder (coming soon)" arrow>
                    <IconButton size="small">
                      <HelpOutline />
                    </IconButton>
                  </MuiTooltip>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, mt: 2 }}>
                  {pipelineStages.map((stage, index) => (
                    <MuiTooltip
                      key={stage.id}
                      title={
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" fontWeight="bold" display="block">{stage.name}</Typography>
                          <Typography variant="caption" display="block">Deals: {stage.count}</Typography>
                          <Typography variant="caption" display="block">Value: ₹{(stage.value / 1000000).toFixed(1)}M</Typography>
                          {stage.id !== 'closed_lost' && stage.id !== 'closed_won' && (
                            <Typography variant="caption" display="block">Conversion: {stage.conversionRate}%</Typography>
                          )}
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            Click to filter deals in this stage
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Card 
                        sx={{ 
                          border: 2,
                          borderColor: pipelineStage === stage.id ? stage.color : 'transparent',
                          bgcolor: pipelineStage === stage.id ? `${stage.color}25` : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': { 
                            transform: 'translateY(-8px) scale(1.05)', 
                            boxShadow: 8,
                            borderColor: stage.color,
                            bgcolor: `${stage.color}15`
                          }
                        }}
                        onClick={() => setPipelineStage(stage.id)}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              bgcolor: stage.color,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              mb: 1,
                              transition: 'all 0.3s',
                              boxShadow: pipelineStage === stage.id ? 4 : 2,
                            }}
                          >
                            {stage.count}
                          </Box>
                          <Typography variant="caption" fontWeight="bold" display="block">{stage.name}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            ₹{(stage.value / 1000000).toFixed(1)}M
                          </Typography>
                          {stage.id !== 'closed_lost' && stage.id !== 'closed_won' && (
                            <Chip 
                              label={`${stage.conversionRate}% conv`} 
                              size="small" 
                              sx={{ mt: 1, fontSize: '0.65rem' }}
                              color="success"
                            />
                          )}
                        </CardContent>
                      </Card>
                    </MuiTooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Funnel Visualization */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🔽 Conversion Funnel with AI Predictions
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={pipelineStages.filter(s => s.id !== 'closed_lost')} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <RechartsTooltip />
                    <Bar dataKey="count" label={{ position: 'right' }}>
                      {pipelineStages.filter(s => s.id !== 'closed_lost').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Deal Velocity & Conversion Metrics */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚡ Deal Velocity & Stage Conversion Analysis
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="body2" color="text.secondary">Avg Time in Pipeline</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">18 days</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip label="-3 days vs last month" size="small" color="success" />
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="body2" color="text.secondary">Fastest Deal Closed</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">7 days</Typography>
                    <Typography variant="caption" color="text.secondary">Enterprise deal - ₹3.2L</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="body2" color="text.secondary">Avg Deal Value</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">₹{(platformKPIs.avgDealSize / 1000).toFixed(0)}K</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip label="+₹1.2K vs last month" size="small" color="success" />
                    </Stack>
                  </Paper>
                </Box>
                
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                  Stage-by-Stage Conversion Rates
                </Typography>
                <Stack spacing={2}>
                  {pipelineStages.filter(s => s.id !== 'closed_lost' && s.id !== 'closed_won').map((stage, idx, arr) => {
                    const nextStage = arr[idx + 1];
                    const conversionRate = nextStage ? ((nextStage.count / stage.count) * 100).toFixed(1) : stage.conversionRate;
                    return (
                      <Paper key={stage.id} sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{stage.name} → {nextStage?.name || 'Closed Won'}</Typography>
                          <Chip 
                            label={`${conversionRate}%`} 
                            size="small" 
                            color={Number(conversionRate) >= 70 ? 'success' : Number(conversionRate) >= 50 ? 'primary' : 'warning'}
                          />
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={Number(conversionRate)} 
                          sx={{ height: 10, borderRadius: 5 }}
                          color={Number(conversionRate) >= 70 ? 'success' : Number(conversionRate) >= 50 ? 'primary' : 'warning'}
                        />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {stage.count} deals in stage
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Avg time: {3 + idx * 2} days
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Deal Scoring & Win Probability */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 AI Deal Scoring & Win Probability Matrix
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Machine learning-powered deal scoring based on 50+ factors including engagement, budget, authority, timeline, and historical patterns
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Deal Distribution by Score</Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { range: '90-100%', count: 12, label: 'Hot', color: '#4CAF50' },
                        { range: '70-89%', count: 28, label: 'Warm', color: '#FF9800' },
                        { range: '50-69%', count: 45, label: 'Cool', color: '#2196F3' },
                        { range: '<50%', count: 18, label: 'Cold', color: '#F44336' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count">
                          {[{ fill: '#4CAF50' }, { fill: '#FF9800' }, { fill: '#2196F3' }, { fill: '#F44336' }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Top Scoring Factors</Typography>
                    <Stack spacing={1.5}>
                      {[
                        { factor: 'Budget Confirmed', impact: 95, color: 'success' },
                        { factor: 'Decision Maker Engaged', impact: 88, color: 'success' },
                        { factor: 'Timeline Defined', impact: 82, color: 'primary' },
                        { factor: 'Competitor Present', impact: -45, color: 'error' },
                        { factor: 'No Recent Activity', impact: -62, color: 'error' },
                      ].map((item, idx) => (
                        <Paper key={idx} sx={{ p: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{item.factor}</Typography>
                            <Chip 
                              label={`${item.impact > 0 ? '+' : ''}${item.impact}pts`} 
                              size="small" 
                              color={item.color as any}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Win/Loss Analysis & Competitive Intelligence */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Win/Loss Analysis & Competitive Intelligence
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Top Win Reasons</Typography>
                    <Stack spacing={1.5}>
                      {[
                        { reason: 'Better Pricing', count: 124, percentage: 34 },
                        { reason: 'Superior Features', count: 98, percentage: 27 },
                        { reason: 'Better Support', count: 87, percentage: 24 },
                        { reason: 'Implementation Speed', count: 54, percentage: 15 },
                      ].map((item, idx) => (
                        <Paper key={idx} sx={{ p: 1.5, bgcolor: 'success.50' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold">{item.reason}</Typography>
                            <Chip label={`${item.count} deals`} size="small" color="success" />
                          </Stack>
                          <LinearProgress variant="determinate" value={item.percentage * 100 / 34} sx={{ height: 6, borderRadius: 3 }} color="success" />
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Top Loss Reasons</Typography>
                    <Stack spacing={1.5}>
                      {[
                        { reason: 'Pricing Too High', count: 45, percentage: 38 },
                        { reason: 'Chose Competitor A', count: 32, percentage: 27 },
                        { reason: 'Not Right Time', count: 28, percentage: 24 },
                        { reason: 'Feature Gap', count: 13, percentage: 11 },
                      ].map((item, idx) => (
                        <Paper key={idx} sx={{ p: 1.5, bgcolor: 'error.50' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold">{item.reason}</Typography>
                            <Chip label={`${item.count} deals`} size="small" color="error" />
                          </Stack>
                          <LinearProgress variant="determinate" value={item.percentage * 100 / 38} sx={{ height: 6, borderRadius: 3 }} color="error" />
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* At-Risk Deals & Recommendations */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚠️ At-Risk Deals & AI Recommendations
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold">14 deals require immediate attention</Typography>
                  <Typography variant="caption">These deals have been in the same stage for 7+ days</Typography>
                </Alert>
                <Stack spacing={2}>
                  {[
                    { company: 'Tech Solutions Ltd', value: '₹2.5L', stage: 'Demo Scheduled', daysStuck: 12, probability: 65, action: 'Schedule follow-up meeting' },
                    { company: 'Global Enterprises', value: '₹1.8L', stage: 'Proposal Sent', daysStuck: 9, probability: 72, action: 'Send pricing comparison' },
                    { company: 'Innovation Corp', value: '₹3.2L', stage: 'Negotiation', daysStuck: 8, probability: 85, action: 'Offer limited-time discount' },
                    { company: 'Smart Systems', value: '₹1.2L', stage: 'Qualified', daysStuck: 10, probability: 58, action: 'Clarify requirements' },
                  ].map((deal, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: 1, borderColor: 'warning.main', bgcolor: 'warning.50' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold">{deal.company}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deal.stage} • {deal.value} • {deal.daysStuck} days stuck
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Chip label={`${deal.probability}% win probability`} size="small" color="info" />
                            <Typography variant="caption" color="primary.main" fontWeight="bold">
                              AI: {deal.action}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack spacing={1}>
                          <Button variant="outlined" size="small" startIcon={<Phone />}>
                            Call
                          </Button>
                          <Button variant="outlined" size="small" startIcon={<Email />}>
                            Email
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              👥 Team & Individual Performance Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Deep performance analytics, efficiency tracking & individual history
            </Typography>

            {/* Team Overview KPIs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Total Team Size</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {teamMembers.length}
                  </Typography>
                  <Typography variant="caption">Active members</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Avg Quota Attainment</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {(teamMembers.reduce((sum, m) => sum + m.quotaAttainment, 0) / teamMembers.length).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">Team average</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Total Activities</Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {teamMembers.reduce((sum, m) => sum + m.calls + m.meetings + m.emails, 0)}
                  </Typography>
                  <Typography variant="caption">Calls + Meetings + Emails</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Avg Win Rate</Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {(teamMembers.reduce((sum, m) => sum + m.winRate, 0) / teamMembers.length).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">Team average</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">Avg Response Time</Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {(teamMembers.reduce((sum, m) => sum + m.responseTime, 0) / teamMembers.length).toFixed(1)}h
                  </Typography>
                  <Typography variant="caption">Team average</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Communication Analytics & Email/Call Tracking */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📞 Communication Analytics & Engagement Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Track all customer touchpoints: calls, emails, meetings with engagement scores and response rates
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                      {teamMembers.reduce((sum, m) => sum + m.calls, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Calls</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight="bold">Avg Duration: 12.5 min</Typography>
                    <Typography variant="caption" display="block">Connect Rate: 78%</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {teamMembers.reduce((sum, m) => sum + m.meetings, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Meetings</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight="bold">Avg Duration: 45 min</Typography>
                    <Typography variant="caption" display="block">Show Rate: 92%</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                      {teamMembers.reduce((sum, m) => sum + m.emails, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Emails</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight="bold">Open Rate: 68%</Typography>
                    <Typography variant="caption" display="block">Reply Rate: 42%</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {teamMembers.reduce((sum, m) => sum + m.calls + m.meetings + m.emails, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Touchpoints</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight="bold">Engagement Score: 85/100</Typography>
                    <Typography variant="caption" display="block">Excellent</Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Calls by Member</Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {teamMembers.map(m => (
                        <Stack key={m.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">{m.name}</Typography>
                          <Chip label={m.calls} size="small" />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Meetings by Member</Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {teamMembers.map(m => (
                        <Stack key={m.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">{m.name}</Typography>
                          <Chip label={m.meetings} size="small" color="success" />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Emails by Member</Typography>
                    <Stack spacing={1} sx={{ mt: 2 }}>
                      {teamMembers.map(m => (
                        <Stack key={m.id} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">{m.name}</Typography>
                          <Chip label={m.emails} size="small" color="warning" />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Customer Health Score & Churn Prediction */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ❤️ Customer Health Score & Churn Risk Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  AI-powered customer health monitoring with churn prediction and retention strategies
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', border: 2, borderColor: 'success.main' }}>
                    <Typography variant="caption" color="text.secondary">Healthy Accounts</Typography>
                    <Typography variant="h3" fontWeight="bold" color="success.main">1,234</Typography>
                    <Typography variant="caption">Health Score: 85-100</Typography>
                    <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, mt: 1 }} color="success" />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', border: 2, borderColor: 'warning.main' }}>
                    <Typography variant="caption" color="text.secondary">At-Risk Accounts</Typography>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">89</Typography>
                    <Typography variant="caption">Health Score: 50-84</Typography>
                    <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4, mt: 1 }} color="warning" />
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'error.50', border: 2, borderColor: 'error.main' }}>
                    <Typography variant="caption" color="text.secondary">High Churn Risk</Typography>
                    <Typography variant="h3" fontWeight="bold" color="error.main">23</Typography>
                    <Typography variant="caption">Health Score: Below 50</Typography>
                    <LinearProgress variant="determinate" value={35} sx={{ height: 8, borderRadius: 4, mt: 1 }} color="error" />
                  </Paper>
                </Box>
                
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>High-Value At-Risk Accounts</Typography>
                <Stack spacing={2}>
                  {[
                    { company: 'Tech Corp Ltd', value: 850000, health: 62, risk: 'Medium', lastContact: '12 days ago', action: 'Schedule check-in call' },
                    { company: 'Global Solutions', value: 620000, health: 45, risk: 'High', lastContact: '18 days ago', action: 'Urgent: Send renewal offer' },
                    { company: 'Innovation Hub', value: 420000, health: 58, risk: 'Medium', lastContact: '9 days ago', action: 'Share success story' },
                  ].map((account, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: 1, borderColor: account.risk === 'High' ? 'error.main' : 'warning.main', bgcolor: account.risk === 'High' ? 'error.50' : 'warning.50' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold">{account.company}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ARR: ₹{(account.value / 100000).toFixed(1)}L • Last contact: {account.lastContact}
                          </Typography>
                          <Typography variant="caption" display="block" color="primary.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                            🤖 AI: {account.action}
                          </Typography>
                        </Box>
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip label={`Health: ${account.health}/100`} size="small" color={account.risk === 'High' ? 'error' : 'warning'} />
                          <Chip label={`${account.risk} Risk`} size="small" color={account.risk === 'High' ? 'error' : 'warning'} />
                          <Button variant="outlined" size="small" startIcon={<Phone />}>Take Action</Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Smart Search & Bulk Actions */}
            <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main', transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <MuiTooltip title="Search by name, role, team, or location. Use filters for advanced search." arrow>
                    <TextField
                      fullWidth
                      size="small"
                      label="Smart Search"
                      placeholder="Type name, role, team, or location..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: searchMember && (
                          <IconButton size="small" onClick={() => setSearchMember('')}>
                            <Close fontSize="small" />
                          </IconButton>
                        ),
                      }}
                    />
                  </MuiTooltip>
                  {selectedRows.length > 0 && (
                    <Chip 
                      label={`${selectedRows.length} selected`} 
                      onDelete={() => setSelectedRows([])}
                      color="primary"
                    />
                  )}
                  {selectedRows.length > 0 ? (
                    <Button 
                      variant="contained"
                      color="secondary"
                      startIcon={<MoreVert />}
                      sx={{ minWidth: 180 }}
                    >
                      Bulk Actions
                    </Button>
                  ) : (
                    <MuiTooltip title="Add a new team member to your sales organization" arrow>
                      <Button 
                        variant="contained"
                        startIcon={<Add />}
                        sx={{ minWidth: 200 }}
                      >
                        Add Team Member
                      </Button>
                    </MuiTooltip>
                  )}
                </Stack>
                {searchMember && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Found {teamMembers.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase())).length} results for "{searchMember}"
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Team Performance Grid */}
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    📊 Team Performance Overview
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" startIcon={<Download />}>
                      Export to Excel
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<FilterList />}>
                      Advanced Filters
                    </Button>
                  </Stack>
                </Stack>
                <DataGrid
                  rows={teamMembers.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase()))}
                  columns={[
                    {
                      field: 'name',
                      headerName: 'Name',
                      width: 180,
                      renderCell: (params: GridRenderCellParams) => (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {params.value.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{params.row.role}</Typography>
                          </Box>
                        </Stack>
                      ),
                    },
                    { field: 'team', headerName: 'Team', width: 100 },
                    { field: 'location', headerName: 'Location', width: 110 },
                    { 
                      field: 'revenue', 
                      headerName: 'Revenue', 
                      width: 110,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Target: ₹${(params.row.target / 100000).toFixed(1)}L • Variance: ₹${((params.value - params.row.target) / 100000).toFixed(1)}L`} arrow>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(params.value / 100000).toFixed(1)}L
                          </Typography>
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'quotaAttainment', 
                      headerName: 'Quota', 
                      width: 100,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`${params.value >= 100 ? 'Exceeded' : 'Progress towards'} quota target`} arrow>
                          <Chip label={`${params.value}%`} size="small" color={params.value >= 100 ? 'success' : params.value >= 90 ? 'primary' : 'warning'} />
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'deals', 
                      headerName: 'Deals', 
                      width: 70, 
                      align: 'center',
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Won: ${Math.floor(params.value * 0.6)} • Active: ${Math.floor(params.value * 0.4)}`} arrow>
                          <Chip label={params.value} size="small" color="primary" variant="outlined" />
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'winRate', 
                      headerName: 'Win Rate', 
                      width: 100,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Industry avg: 52% • You're ${(params.value - 52) > 0 ? '+' : ''}${(params.value - 52).toFixed(1)}%`} arrow>
                          <Chip label={`${params.value}%`} size="small" color="success" />
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'avgDealSize', 
                      headerName: 'Avg Deal', 
                      width: 100,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Average value per closed deal`} arrow>
                          <Typography variant="caption" fontWeight="bold">₹{(params.value / 1000).toFixed(0)}K</Typography>
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'responseTime', 
                      headerName: 'Response', 
                      width: 100,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Average time to respond to leads. Target: <1.5h`} arrow>
                          <Chip label={`${params.value}h`} size="small" color={params.value < 1.5 ? 'success' : 'warning'} />
                        </MuiTooltip>
                      ),
                    },
                    {
                      field: 'actions',
                      headerName: 'Actions',
                      width: 120,
                      renderCell: (params: GridRenderCellParams) => (
                        <Stack direction="row" spacing={0.5}>
                          <MuiTooltip title="View full details" arrow>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setSelectedMember(params.row);
                                setMemberDetailsOpen(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="View history" arrow>
                            <IconButton size="small" color="primary">
                              <History fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Assign task" arrow>
                            <IconButton size="small" color="success">
                              <Assignment fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                        </Stack>
                      ),
                    },
                  ]}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => {
                    const selected = Array.isArray(newSelection) 
                      ? newSelection.map((id: any) => teamMembers.find(m => m.id === id)).filter(Boolean)
                      : [];
                    setSelectedRows(selected);
                  }}
                  autoHeight
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-row:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Field Sales Agents Tracking */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      🚗 Field Sales Agents Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track field visits, conversions, and territory performance
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small" startIcon={<Add />}>
                    Add Field Agent
                  </Button>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {fieldAgents.map((agent) => (
                    <MuiTooltip 
                      key={agent.id}
                      title={
                        <Box sx={{ p: 1 }}>
                          <Typography variant="caption" fontWeight="bold" display="block">Field Agent Details</Typography>
                          <Typography variant="caption" display="block">Code: {agent.referralCode}</Typography>
                          <Typography variant="caption" display="block">Conv Rate: {agent.conversionRate}%</Typography>
                          <Typography variant="caption" display="block">Click for full profile</Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Card 
                        sx={{ 
                          border: 2, 
                          borderColor: 'primary.main',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: 6,
                            borderColor: 'success.main',
                          }
                        }}
                      >
                        <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                            {agent.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {agent.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {agent.territory}
                            </Typography>
                          </Box>
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                          <Paper sx={{ p: 1.5, bgcolor: 'info.50', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="info.main">
                              {agent.visits}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total Visits
                            </Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: 'success.50', textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {agent.conversions}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Conversions
                            </Typography>
                          </Paper>
                        </Box>
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight="bold">
                              Revenue
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                              ₹{(agent.revenue / 100000).toFixed(1)}L
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(agent.revenue / agent.target) * 100}
                            sx={{ height: 8, borderRadius: 4, mt: 1 }}
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Target: ₹{(agent.target / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Conversion Rate
                            </Typography>
                            <Chip label={`${agent.conversionRate}%`} size="small" color="success" />
                          </Stack>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Referral: <strong>{agent.referralCode}</strong>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    </MuiTooltip>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Performance Comparison Chart */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Team Performance Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Revenue vs Target comparison across all team members
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={teamMembers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
                    <Bar dataKey="target" fill="#FF9800" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Commission & Payout Tracking */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💰 Commission & Payout Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Real-time commission calculations, payout status, and earning projections
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Commissions</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">₹45.2L</Typography>
                    <Typography variant="caption">This month</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Pending Payout</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">₹38.7L</Typography>
                    <Typography variant="caption">Due in 5 days</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Avg Commission</Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">8.5%</Typography>
                    <Typography variant="caption">Of deal value</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">YTD Paid</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">₹4.8Cr</Typography>
                    <Typography variant="caption">To all reps</Typography>
                  </Paper>
                </Box>

                <Stack spacing={2}>
                  {teamMembers.map((member) => {
                    const commission = member.revenue * 0.085;
                    const paid = commission * 0.7;
                    const pending = commission * 0.3;
                    
                    return (
                      <Paper key={member.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>{member.name.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">{member.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">Revenue</Typography>
                              <Typography variant="h6" fontWeight="bold">₹{(member.revenue / 100000).toFixed(1)}L</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">Commission</Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                ₹{(commission / 100000).toFixed(2)}L
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                              <Typography variant="caption" color="text.secondary">Status</Typography>
                              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                <Chip label={`Paid: ₹${(paid / 1000).toFixed(0)}K`} size="small" color="success" />
                                <Chip label={`Pending: ₹${(pending / 1000).toFixed(0)}K`} size="small" color="warning" />
                              </Stack>
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Benchmarking & Industry Comparison */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📈 Performance Benchmarking & Industry Comparison
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Compare your team's performance against industry standards and top performers
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Key Metrics vs Industry</Typography>
                    <Stack spacing={2}>
                      {[
                        { metric: 'Win Rate', your: 68.5, industry: 52, top: 75 },
                        { metric: 'Avg Deal Cycle', your: 18, industry: 28, top: 14, inverse: true },
                        { metric: 'Quota Attainment', your: 95, industry: 78, top: 105 },
                        { metric: 'Response Time', your: 1.4, industry: 3.2, top: 0.8, inverse: true },
                        { metric: 'Lead Conversion', your: 42.5, industry: 35, top: 55 },
                      ].map((item, idx) => (
                        <Paper key={idx} sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>{item.metric}</Typography>
                          <Box sx={{ position: 'relative', height: 60 }}>
                            <Box sx={{ position: 'absolute', width: '100%', height: 20, top: 0 }}>
                              <Typography variant="caption" color="text.secondary">Your Team</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.inverse ? (100 - item.your) : item.your} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color="primary"
                              />
                              <Typography variant="caption" fontWeight="bold">{item.your}{item.inverse ? 'd' : '%'}</Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', width: '100%', height: 20, top: 20 }}>
                              <Typography variant="caption" color="text.secondary">Industry Avg</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.inverse ? (100 - item.industry) : item.industry} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color="info"
                              />
                              <Typography variant="caption">{item.industry}{item.inverse ? 'd' : '%'}</Typography>
                            </Box>
                            <Box sx={{ position: 'absolute', width: '100%', height: 20, top: 40 }}>
                              <Typography variant="caption" color="text.secondary">Top 10%</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={item.inverse ? (100 - item.top) : item.top} 
                                sx={{ height: 8, borderRadius: 4 }}
                                color="success"
                              />
                              <Typography variant="caption">{item.top}{item.inverse ? 'd' : '%'}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Improvement Opportunities</Typography>
                    <Stack spacing={2}>
                      <Alert severity="success">
                        <Typography variant="body2" fontWeight="bold">Strong Performance</Typography>
                        <Typography variant="caption">
                          Your team's win rate (68.5%) exceeds industry average by 31%. This is a competitive advantage.
                        </Typography>
                      </Alert>
                      <Alert severity="info">
                        <Typography variant="body2" fontWeight="bold">Opportunity</Typography>
                        <Typography variant="caption">
                          Response time can be improved from 1.4h to match top performers at 0.8h. Implementing automated lead routing could help.
                        </Typography>
                      </Alert>
                      <Alert severity="warning">
                        <Typography variant="body2" fontWeight="bold">Focus Area</Typography>
                        <Typography variant="caption">
                          Deal cycle is better than industry (18d vs 28d) but can reach 14d with better qualification and proposal automation.
                        </Typography>
                      </Alert>
                      <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>Overall Ranking</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h3" fontWeight="bold" color="primary.main">Top 15%</Typography>
                            <Typography variant="caption">In your industry segment</Typography>
                          </Box>
                          <Chip label="Excellent" color="success" />
                        </Stack>
                      </Paper>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🎁 Sales Referral & Individual Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track every salesperson's referral performance, earnings, conversion rates, and detailed referral history
            </Typography>

            {/* Program Overview */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Sales Referral Overview
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {teamMembers.reduce((sum, m) => sum + m.referrals, 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Referrals</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ₹{(teamMembers.reduce((sum, m) => sum + m.referralRevenue, 0) / 10000000).toFixed(2)}Cr
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Referral Revenue</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {(teamMembers.reduce((sum, m) => sum + m.referralConversion, 0) / teamMembers.length).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Conversion</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ₹{(teamMembers.reduce((sum, m) => sum + m.referralBonus, 0) / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Bonuses</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Top Referrers Leaderboard */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🏆 Top Referrers Leaderboard
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 2 }}>
                  {teamMembers
                    .sort((a, b) => b.referrals - a.referrals)
                    .slice(0, 3)
                    .map((member, index) => (
                      <Paper
                        key={member.id}
                        sx={{
                          p: 2,
                          bgcolor: index === 0 ? 'warning.50' : index === 1 ? 'info.50' : 'success.50',
                          border: 2,
                          borderColor: index === 0 ? 'warning.main' : index === 1 ? 'info.main' : 'success.main',
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'info.main' : 'success.main',
                              fontSize: '1.8rem',
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold">{member.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                              {member.referrals} Referrals
                            </Typography>
                            <Typography variant="caption" display="block">
                              Revenue: ₹{(member.referralRevenue / 100000).toFixed(1)}L • Conversion: {member.referralConversion}%
                            </Typography>
                            <Chip 
                              label={`Bonus: ₹${(member.referralBonus / 1000).toFixed(0)}K`} 
                              size="small" 
                              color="success"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                </Box>
              </CardContent>
            </Card>

            {/* Individual Referral Tracking */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  👤 Individual Referral Performance Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Detailed breakdown of each salesperson's referral activity, conversion, and earnings
                </Typography>
                
                <Stack spacing={2}>
                  {teamMembers
                    .sort((a, b) => b.referrals - a.referrals)
                    .map((member) => (
                      <Paper 
                        key={member.id} 
                        sx={{ 
                          p: 2.5, 
                          border: 2, 
                          borderColor: 'primary.main',
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 6,
                            borderColor: 'success.main',
                            transform: 'translateX(8px)'
                          }
                        }}
                      >
                        {/* Member Header */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                            {member.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold">{member.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role} • {member.team} • {member.location}
                            </Typography>
                          </Box>
                          <Paper sx={{ p: 1.5, bgcolor: 'warning.50', textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">Referral Code</Typography>
                            <Typography variant="body1" fontWeight="bold" color="warning.main">
                              {member.referralCode}
                            </Typography>
                          </Paper>
                        </Stack>

                        {/* Referral Stats */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 2 }}>
                          <Paper sx={{ p: 1.5, bgcolor: 'primary.50', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                              {member.referrals}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Referrals</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: 'success.50', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                              {Math.floor(member.referrals * (member.referralConversion / 100))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Converted</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: 'info.50', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color="info.main">
                              {member.referralConversion}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: 'warning.50', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                              ₹{(member.referralRevenue / 100000).toFixed(1)}L
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Referral Revenue</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: 'success.50', textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                              ₹{(member.referralBonus / 1000).toFixed(0)}K
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Bonus Earned</Typography>
                          </Paper>
                        </Box>

                        {/* Performance Indicators */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                              Referral Activity (Last 30 Days)
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(member.referrals / 62) * 100} 
                              sx={{ height: 10, borderRadius: 5, mb: 1 }}
                              color="primary"
                            />
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">Current: {member.referrals}</Typography>
                              <Typography variant="caption">Top: 62</Typography>
                            </Stack>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                              Conversion Performance
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={member.referralConversion} 
                              sx={{ height: 10, borderRadius: 5, mb: 1 }}
                              color="success"
                            />
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="caption">Your Rate: {member.referralConversion}%</Typography>
                              <Typography variant="caption">Team Avg: 38.7%</Typography>
                            </Stack>
                          </Box>
                        </Box>

                        {/* Quick Actions */}
                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => {
                              setSelectedMember(member);
                              setMemberDetailsOpen(true);
                            }}
                          >
                            View Full Details
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => {
                              setSelectedReferralMember(member);
                              setReferralHistoryOpen(true);
                            }}
                          >
                            View Referral History
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            onClick={() => {
                              setSelectedReferralMember(member);
                              setQrCodeOpen(true);
                            }}
                          >
                            Generate QR Code
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Referral Analytics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📈 Referral Conversion Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={teamMembers.map(m => ({
                      name: m.name.split(' ')[0],
                      referrals: m.referrals,
                      converted: Math.floor(m.referrals * (m.referralConversion / 100))
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="referrals" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} name="Total Referrals" />
                      <Area type="monotone" dataKey="converted" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.6} name="Converted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    💰 Referral Bonus Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamMembers.map(m => ({
                      name: m.name.split(' ')[0],
                      bonus: m.referralBonus / 1000,
                      revenue: m.referralRevenue / 100000
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="bonus" fill="#FF9800" name="Bonus (₹K)" />
                      <Bar dataKey="revenue" fill="#4CAF50" name="Revenue (₹L)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Referral Source Analysis */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📱 Referral Source Breakdown
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Where are referrals coming from?
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { source: 'LinkedIn', count: 68, conversion: 42, color: '#0077B5' },
                      { source: 'Email Campaign', count: 54, conversion: 38, color: '#4CAF50' },
                      { source: 'WhatsApp', count: 42, conversion: 45, color: '#25D366' },
                      { source: 'Website', count: 31, conversion: 35, color: '#2196F3' },
                      { source: 'Facebook', count: 18, conversion: 28, color: '#1877F2' },
                      { source: 'Instagram', count: 12, conversion: 31, color: '#E4405F' },
                    ].map((item, idx) => (
                      <Paper key={idx} sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{item.source}</Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip label={`${item.count} refs`} size="small" />
                            <Chip label={`${item.conversion}% conv`} size="small" color="success" />
                          </Stack>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={(item.count / 68) * 100} 
                          sx={{ height: 8, borderRadius: 4 }}
                          color="primary"
                        />
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ⏱️ Referral Conversion Timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    How long does it take to convert referrals?
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { days: '0-7 days', count: 45, percentage: 40 },
                      { days: '8-14 days', count: 32, percentage: 28 },
                      { days: '15-30 days', count: 24, percentage: 21 },
                      { days: '30+ days', count: 12, percentage: 11 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="days" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#4CAF50" label={{ position: 'top' }}>
                        {[
                          { fill: '#4CAF50' },
                          { fill: '#2196F3' },
                          { fill: '#FF9800' },
                          { fill: '#F44336' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      <strong>Average conversion time: 12 days</strong> • 40% convert within the first week
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Box>

            {/* Referral Performance Over Time */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Referral Performance Over Time
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Track referral trends, seasonality, and growth patterns
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData.map((d: any, idx: number) => ({
                    label: d.label,
                    referrals: Math.floor(25 + idx * 2 + Math.random() * 5),
                    converted: Math.floor(10 + idx * 1.2 + Math.random() * 3),
                    revenue: (1200000 + idx * 150000 + Math.random() * 100000) / 100000,
                  }))}>
                    <defs>
                      <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF9800" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={historicalData.length > 15 ? -45 : 0} textAnchor={historicalData.length > 15 ? 'end' : 'middle'} height={historicalData.length > 15 ? 80 : 30} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="referrals" stroke="#FF9800" fill="url(#colorReferrals)" name="Total Referrals" />
                    <Area yAxisId="left" type="monotone" dataKey="converted" stroke="#4CAF50" fill="url(#colorConverted)" name="Converted" />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} name="Revenue (₹L)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Referral Table */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    📋 Comprehensive Referral Tracking
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" startIcon={<Download />}>
                      Export Referral Data
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<AutoAwesome />}>
                      Generate Report
                    </Button>
                  </Stack>
                </Stack>
                <DataGrid
                  rows={teamMembers}
                  columns={[
                    {
                      field: 'name',
                      headerName: 'Name',
                      width: 180,
                      renderCell: (params: GridRenderCellParams) => (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {params.value.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{params.row.role}</Typography>
                          </Box>
                        </Stack>
                      ),
                    },
                    { 
                      field: 'referralCode', 
                      headerName: 'Referral Code', 
                      width: 150,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title="Click to copy referral code" arrow>
                          <Chip 
                            label={params.value} 
                            size="small" 
                            color="warning"
                            onClick={() => {
                              navigator.clipboard.writeText(params.value);
                              alert('Referral code copied!');
                            }}
                          />
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'referrals', 
                      headerName: 'Total Referrals', 
                      width: 120,
                      align: 'center',
                      renderCell: (params: GridRenderCellParams) => (
                        <Chip label={params.value} size="small" color="primary" />
                      ),
                    },
                    { 
                      field: 'referralConversion', 
                      headerName: 'Conversion %', 
                      width: 120,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title={`Converted: ${Math.floor(params.row.referrals * (params.value / 100))} deals`} arrow>
                          <Chip 
                            label={`${params.value}%`} 
                            size="small" 
                            color={params.value >= 40 ? 'success' : params.value >= 35 ? 'primary' : 'warning'}
                          />
                        </MuiTooltip>
                      ),
                    },
                    { 
                      field: 'referralRevenue', 
                      headerName: 'Referral Revenue', 
                      width: 150,
                      renderCell: (params: GridRenderCellParams) => (
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{(params.value / 100000).toFixed(1)}L
                        </Typography>
                      ),
                    },
                    { 
                      field: 'referralBonus', 
                      headerName: 'Bonus Earned', 
                      width: 130,
                      renderCell: (params: GridRenderCellParams) => (
                        <MuiTooltip title="8.5% commission on referral revenue" arrow>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">
                            ₹{(params.value / 1000).toFixed(0)}K
                          </Typography>
                        </MuiTooltip>
                      ),
                    },
                    {
                      field: 'location',
                      headerName: 'Territory',
                      width: 120,
                    },
                    {
                      field: 'actions',
                      headerName: 'Actions',
                      width: 180,
                      renderCell: (params: GridRenderCellParams) => (
                        <Stack direction="row" spacing={0.5}>
                          <MuiTooltip title="View referral details" arrow>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setSelectedMember(params.row);
                                setMemberDetailsOpen(true);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="View referral history" arrow>
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => {
                                setSelectedReferralMember(params.row);
                                setReferralHistoryOpen(true);
                              }}
                            >
                              <History fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Generate QR code" arrow>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => {
                                setSelectedReferralMember(params.row);
                                setQrCodeOpen(true);
                              }}
                            >
                              <AutoAwesome fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Send referral link" arrow>
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => {
                                setSelectedReferralMember(params.row);
                                setShareLinkOpen(true);
                              }}
                            >
                              <Email fontSize="small" />
                            </IconButton>
                          </MuiTooltip>
                        </Stack>
                      ),
                    },
                  ]}
                  autoHeight
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-row:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                />
              </CardContent>
            </Card>

            {/* Referral Insights */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🤖 AI-Powered Referral Insights
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="success" icon={<Psychology />}>
                    <Typography variant="body2" fontWeight="bold">Top Performer</Typography>
                    <Typography variant="caption">
                      {teamMembers.sort((a, b) => b.referrals - a.referrals)[0].name} leads with {teamMembers.sort((a, b) => b.referrals - a.referrals)[0].referrals} referrals and {teamMembers.sort((a, b) => b.referrals - a.referrals)[0].referralConversion}% conversion rate. 
                      Revenue generated: ₹{(teamMembers.sort((a, b) => b.referrals - a.referrals)[0].referralRevenue / 100000).toFixed(1)}L
                    </Typography>
                  </Alert>
                  <Alert severity="info" icon={<AutoAwesome />}>
                    <Typography variant="body2" fontWeight="bold">Optimization Opportunity</Typography>
                    <Typography variant="caption">
                      {teamMembers.sort((a, b) => a.referralConversion - b.referralConversion)[0].name}'s conversion rate ({teamMembers.sort((a, b) => a.referralConversion - b.referralConversion)[0].referralConversion}%) can be improved. 
                      Suggested: Share best practices from {teamMembers.sort((a, b) => b.referralConversion - a.referralConversion)[0].name} ({teamMembers.sort((a, b) => b.referralConversion - a.referralConversion)[0].referralConversion}% conversion)
                    </Typography>
                  </Alert>
                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="bold">Revenue Impact</Typography>
                    <Typography variant="caption">
                      Referral program contributed ₹{(teamMembers.reduce((sum, m) => sum + m.referralRevenue, 0) / 10000000).toFixed(2)}Cr this month ({((teamMembers.reduce((sum, m) => sum + m.referralRevenue, 0) / platformKPIs.totalRevenue) * 100).toFixed(1)}% of total revenue). 
                      Keep momentum strong!
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* AI Insights Dialog */}
      <Dialog open={aiInsightsOpen} onClose={() => setAiInsightsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Psychology color="primary" />
            <Typography variant="h6" fontWeight="bold">AI-Powered Sales Insights</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="success">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>🎯 Top Opportunities</Typography>
              <Typography variant="body2">
                • 12 deals have 85%+ close probability - Total value: ₹2.8Cr<br />
                • Recommended: Focus on Enterprise segment (highest deal value)<br />
                • Best time to contact: Tuesday-Thursday, 10 AM - 12 PM
              </Typography>
            </Alert>
            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>⚠️ Attention Needed</Typography>
              <Typography variant="body2">
                • 8 deals at risk of stalling (14+ days in demo stage)<br />
                • 3 high-value leads show declining engagement<br />
                • Suggested: Personalized follow-up strategy + special offer
              </Typography>
            </Alert>
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Optimization Tips</Typography>
              <Typography variant="body2">
                • Increase field agent presence in Mumbai (40.7% conversion rate)<br />
                • Replicate Vikram Kumar's approach (61.2% conversion)<br />
                • Automate follow-ups for demo stage (save 12 hours/week)
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiInsightsOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Details Dialog */}
      {selectedMember && (
        <Dialog open={memberDetailsOpen} onClose={() => setMemberDetailsOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                {selectedMember.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">{selectedMember.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedMember.role} • {selectedMember.team}</Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Tabs value={memberDetailTab} onChange={(_, v) => setMemberDetailTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Overview" />
              <Tab label="Performance" />
              <Tab label="Deals" />
              <Tab label="Activity" />
              <Tab label="Commission" />
              <Tab label="Analytics" />
            </Tabs>

            {memberDetailTab === 0 && (
              <Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ₹{(selectedMember.revenue / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption">Target: ₹{(selectedMember.target / 100000).toFixed(1)}L</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="caption" color="text.secondary">Deals</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">{selectedMember.deals}</Typography>
                    <Typography variant="caption">This month</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                    <Typography variant="caption" color="text.secondary">Conversion</Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">{selectedMember.conversion}%</Typography>
                    <Typography variant="caption">Lead to deal</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">{selectedMember.efficiency}%</Typography>
                    <Typography variant="caption">Productivity</Typography>
                  </Paper>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }} icon={<Psychology />}>
                  <Typography variant="body2">
                    <strong>AI Analysis:</strong> {selectedMember.name} shows excellent performance with {selectedMember.conversion}% conversion rate. 
                    Response time of {selectedMember.responseTime}h is {selectedMember.responseTime < 1.5 ? 'faster' : 'slower'} than team average.
                  </Typography>
                </Alert>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Contact Information</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">+91 98765 43210</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">{selectedMember.name.toLowerCase().replace(' ', '.')}@studyspot.com</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Speed fontSize="small" color="action" />
                        <Typography variant="body2">{selectedMember.location}</Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Team Information</Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Team:</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedMember.team}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Role:</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedMember.role}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                        <Chip label={selectedMember.status} size="small" color="success" />
                      </Stack>
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            )}

            {memberDetailTab === 1 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Performance vs Target</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedMember.performance} 
                      sx={{ height: 16, borderRadius: 8, mb: 1 }}
                      color={selectedMember.performance >= 95 ? 'success' : selectedMember.performance >= 85 ? 'primary' : 'warning'}
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">Current: {selectedMember.performance}%</Typography>
                      <Typography variant="caption">Target: 100%</Typography>
                    </Stack>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Revenue Progress</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(selectedMember.revenue / selectedMember.target) * 100} 
                      sx={{ height: 16, borderRadius: 8, mb: 1 }}
                      color="success"
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption">₹{(selectedMember.revenue / 100000).toFixed(1)}L</Typography>
                      <Typography variant="caption">₹{(selectedMember.target / 100000).toFixed(1)}L</Typography>
                    </Stack>
                  </Paper>
                </Box>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { month: 'Jan', revenue: selectedMember.revenue * 0.8, deals: selectedMember.deals - 3 },
                    { month: 'Feb', revenue: selectedMember.revenue * 0.85, deals: selectedMember.deals - 2 },
                    { month: 'Mar', revenue: selectedMember.revenue * 0.9, deals: selectedMember.deals - 1 },
                    { month: 'Current', revenue: selectedMember.revenue, deals: selectedMember.deals },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4CAF50" name="Revenue (₹)" />
                    <Bar dataKey="deals" fill="#2196F3" name="Deals" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {memberDetailTab === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Active & Closed Deals
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main">{selectedMember.deals}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Deals</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">{Math.floor(selectedMember.deals * 0.6)}</Typography>
                    <Typography variant="caption" color="text.secondary">Won</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="warning.main">{Math.floor(selectedMember.deals * 0.4)}</Typography>
                    <Typography variant="caption" color="text.secondary">In Progress</Typography>
                  </Paper>
                </Box>
                <Stack spacing={2}>
                  {[
                    { client: 'ABC Corporation', value: 250000, stage: 'Closed Won', probability: 100, closeDate: '2 days ago', dealSize: 'Large' },
                    { client: 'XYZ Ltd', value: 180000, stage: 'Negotiation', probability: 85, closeDate: 'Expected in 3 days', dealSize: 'Medium' },
                    { client: 'Tech Solutions', value: 320000, stage: 'Proposal Sent', probability: 72, closeDate: 'Expected in 7 days', dealSize: 'Large' },
                    { client: 'Global Inc', value: 95000, stage: 'Demo Scheduled', probability: 58, closeDate: 'Expected in 14 days', dealSize: 'Small' },
                    { client: 'Innovation Hub', value: 420000, stage: 'Closed Won', probability: 100, closeDate: '5 days ago', dealSize: 'Enterprise' },
                  ].map((deal, idx) => (
                    <Paper key={idx} sx={{ p: 2, border: 2, borderColor: deal.stage === 'Closed Won' ? 'success.main' : 'primary.main' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight="bold">{deal.client}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deal.closeDate} • ₹{(deal.value / 100000).toFixed(1)}L
                          </Typography>
                        </Box>
                        <Stack spacing={1} alignItems="flex-end">
                          <Chip 
                            label={deal.stage} 
                            size="small" 
                            color={deal.stage === 'Closed Won' ? 'success' : deal.stage === 'Negotiation' ? 'warning' : 'primary'}
                          />
                          <Chip label={`${deal.probability}% win`} size="small" color="info" />
                          <Chip label={deal.dealSize} size="small" variant="outlined" />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {memberDetailTab === 3 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity Timeline
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {[
                    { action: 'Closed Deal', client: 'ABC Corp', value: '₹2.5L', time: '2 hours ago', type: 'success' },
                    { action: 'Scheduled Meeting', client: 'XYZ Ltd', value: 'Demo Call', time: '5 hours ago', type: 'info' },
                    { action: 'Sent Proposal', client: 'Tech Solutions', value: '₹1.8L', time: '1 day ago', type: 'warning' },
                    { action: 'Call Completed', client: 'Global Inc', value: 'Follow-up', time: '2 days ago', type: 'primary' },
                    { action: 'Email Sent', client: 'Innovation Hub', value: 'Pricing Details', time: '3 days ago', type: 'info' },
                    { action: 'Demo Completed', client: 'Smart Systems', value: '₹1.2L', time: '4 days ago', type: 'success' },
                  ].map((activity, idx) => (
                    <Paper key={idx} sx={{ p: 2, borderLeft: 4, borderColor: `${activity.type}.main` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{activity.action}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.client} • {activity.value}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {memberDetailTab === 4 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Commission & Earnings Breakdown
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Earned</Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ₹{(selectedMember.revenue * 0.085 / 100000).toFixed(2)}L
                    </Typography>
                    <Typography variant="caption">This month</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Commission Rate</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">8.5%</Typography>
                    <Typography variant="caption">Of revenue</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">YTD Earnings</Typography>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      ₹{(selectedMember.revenue * 0.085 * 12 / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption">Projected annual</Typography>
                  </Paper>
                </Box>
                
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.50' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Commission Breakdown</Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Base Commission (8%)</Typography>
                      <Typography variant="body2" fontWeight="bold">₹{(selectedMember.revenue * 0.08 / 100000).toFixed(2)}L</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Performance Bonus (0.5%)</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">₹{(selectedMember.revenue * 0.005 / 100000).toFixed(2)}L</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold">Total Commission</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">₹{(selectedMember.revenue * 0.085 / 100000).toFixed(2)}L</Typography>
                    </Stack>
                  </Stack>
                </Paper>
                
                <Alert severity="info" icon={<Psychology />}>
                  <Typography variant="body2">
                    <strong>Earning Potential:</strong> If {selectedMember.name} maintains current performance, projected annual earnings are ₹{(selectedMember.revenue * 0.085 * 12 / 100000).toFixed(1)}L in commissions.
                  </Typography>
                </Alert>
              </Box>
            )}

            {memberDetailTab === 5 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Advanced Analytics & Insights
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Performance Metrics</Typography>
                      <Stack spacing={2}>
                        {[
                          { label: 'Quota Attainment', value: selectedMember.quotaAttainment, target: 100 },
                          { label: 'Win Rate', value: selectedMember.winRate, target: 60 },
                          { label: 'Efficiency', value: selectedMember.efficiency, target: 90 },
                          { label: 'Activity Score', value: ((selectedMember.calls + selectedMember.meetings + selectedMember.emails) / 5), target: 100 },
                        ].map((item, idx) => (
                          <Box key={idx}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption">{item.label}</Typography>
                              <Typography variant="caption" fontWeight="bold">{item.value.toFixed(1)}{item.label.includes('Time') ? 'h' : '%'}</Typography>
                            </Stack>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min((item.value / item.target) * 100, 100)} 
                              sx={{ height: 8, borderRadius: 4 }}
                              color={item.value >= item.target ? 'success' : item.value >= item.target * 0.8 ? 'primary' : 'warning'}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Activity Breakdown</Typography>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { type: 'Calls', count: selectedMember.calls },
                          { type: 'Meetings', count: selectedMember.meetings },
                          { type: 'Emails', count: selectedMember.emails },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#2196F3" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Box>
                
                <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>AI Performance Analysis</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      ✅ <strong>Strengths:</strong> Excellent conversion rate ({selectedMember.conversion}%), fast response time ({selectedMember.responseTime}h)
                    </Typography>
                    <Typography variant="body2">
                      💡 <strong>Opportunities:</strong> Increase meeting frequency to boost deal velocity. Target: {selectedMember.meetings + 10} meetings/month
                    </Typography>
                    <Typography variant="body2">
                      🎯 <strong>Recommendation:</strong> Focus on {selectedMember.activeTasks} active tasks. Completion rate: {((selectedMember.completedTasks / (selectedMember.completedTasks + selectedMember.activeTasks)) * 100).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMemberDetailsOpen(false)}>Close</Button>
            <Button variant="outlined" startIcon={<Phone />}>Call</Button>
            <Button variant="contained" startIcon={<Email />}>Send Email</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Referral History Dialog */}
      {selectedReferralMember && (
        <Dialog 
          open={referralHistoryOpen} 
          onClose={() => setReferralHistoryOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <History color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">Referral History</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedReferralMember.name} • Code: {selectedReferralMember.referralCode}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {selectedReferralMember.referrals}
                  </Typography>
                  <Typography variant="caption">Total Referrals</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {Math.floor(selectedReferralMember.referrals * (selectedReferralMember.referralConversion / 100))}
                  </Typography>
                  <Typography variant="caption">Converted</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {selectedReferralMember.referralConversion}%
                  </Typography>
                  <Typography variant="caption">Conversion Rate</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    ₹{(selectedReferralMember.referralRevenue / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="caption">Total Revenue</Typography>
                </Paper>
              </Box>

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Referrals (Last 30 Days)
              </Typography>
              <Stack spacing={2}>
                {[
                  { id: 1, company: 'Tech Solutions Inc', contact: 'Rajesh Gupta', date: '2 days ago', status: 'Converted', value: 120000, source: 'LinkedIn' },
                  { id: 2, company: 'Global Enterprises', contact: 'Priya Sharma', date: '5 days ago', status: 'In Progress', value: 180000, source: 'Email' },
                  { id: 3, company: 'Innovation Hub', contact: 'Amit Verma', date: '7 days ago', status: 'Converted', value: 95000, source: 'WhatsApp' },
                  { id: 4, company: 'Smart Systems', contact: 'Neha Patel', date: '10 days ago', status: 'Demo Scheduled', value: 150000, source: 'Website' },
                  { id: 5, company: 'Digital Corp', contact: 'Karan Singh', date: '12 days ago', status: 'Converted', value: 220000, source: 'Facebook' },
                  { id: 6, company: 'Future Tech', contact: 'Sneha Reddy', date: '15 days ago', status: 'Lost', value: 0, source: 'Instagram' },
                  { id: 7, company: 'Cloud Solutions', contact: 'Vikram Kumar', date: '18 days ago', status: 'In Progress', value: 135000, source: 'LinkedIn' },
                  { id: 8, company: 'Data Systems', contact: 'Anjali Nair', date: '20 days ago', status: 'Converted', value: 175000, source: 'Email' },
                ].map((referral) => (
                  <Paper key={referral.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="bold">{referral.company}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Contact: {referral.contact} • {referral.date} • Source: {referral.source}
                        </Typography>
                      </Box>
                      <Stack spacing={1} alignItems="flex-end">
                        <Chip 
                          label={referral.status} 
                          size="small" 
                          color={
                            referral.status === 'Converted' ? 'success' : 
                            referral.status === 'Lost' ? 'error' : 
                            referral.status === 'Demo Scheduled' ? 'warning' : 'primary'
                          }
                        />
                        {referral.value > 0 && (
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            ₹{(referral.value / 1000).toFixed(0)}K
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReferralHistoryOpen(false)}>Close</Button>
            <Button variant="outlined" startIcon={<Download />}>Export History</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* QR Code Generator Dialog */}
      {selectedReferralMember && (
        <Dialog 
          open={qrCodeOpen} 
          onClose={() => setQrCodeOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <AutoAwesome color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">Generate QR Code</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedReferralMember.name}'s Referral QR Code
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              {/* QR Code Placeholder */}
              <Box
                sx={{
                  width: 300,
                  height: 300,
                  margin: '0 auto',
                  bgcolor: 'white',
                  border: 4,
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <AutoAwesome sx={{ fontSize: 80, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    QR CODE
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scan to visit referral link
                  </Typography>
                </Stack>
              </Box>

              <Paper sx={{ p: 2, bgcolor: 'warning.50', mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Referral Code
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {selectedReferralMember.referralCode}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Referral Link
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-all' }}>
                  https://studyspot.com/ref/{selectedReferralMember.referralCode}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => {
                    navigator.clipboard.writeText(`https://studyspot.com/ref/${selectedReferralMember.referralCode}`);
                    alert('Referral link copied to clipboard!');
                  }}
                >
                  Copy Link
                </Button>
              </Paper>

              <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">How to use this QR Code:</Typography>
                <Typography variant="caption" display="block">
                  • Download and share on social media
                </Typography>
                <Typography variant="caption" display="block">
                  • Print on business cards or flyers
                </Typography>
                <Typography variant="caption" display="block">
                  • Display at events or meetings
                </Typography>
                <Typography variant="caption" display="block">
                  • Include in email signatures
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrCodeOpen(false)}>Close</Button>
            <Button variant="outlined" startIcon={<Download />}>Download QR Code</Button>
            <Button variant="contained" startIcon={<Email />} onClick={() => {
              setQrCodeOpen(false);
              setShareLinkOpen(true);
            }}>
              Share via Email
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Share Referral Link Dialog */}
      {selectedReferralMember && (
        <Dialog 
          open={shareLinkOpen} 
          onClose={() => setShareLinkOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <Email color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">Share Referral Link</Typography>
                <Typography variant="caption" color="text.secondary">
                  Send {selectedReferralMember.name}'s referral link
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Referral Link
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight="bold" sx={{ flex: 1, wordBreak: 'break-all' }}>
                    https://studyspot.com/ref/{selectedReferralMember.referralCode}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://studyspot.com/ref/${selectedReferralMember.referralCode}`);
                      alert('Link copied!');
                    }}
                  >
                    <AutoAwesome />
                  </IconButton>
                </Stack>
              </Paper>

              <TextField
                fullWidth
                label="Recipient Email"
                placeholder="Enter email address"
                type="email"
                size="small"
              />

              <TextField
                fullWidth
                label="Subject"
                defaultValue={`${selectedReferralMember.name} recommends StudySpot`}
                size="small"
              />

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                defaultValue={`Hi,

I wanted to share StudySpot with you - an excellent library management platform that can transform your study space operations.

As a special offer, use my referral code: ${selectedReferralMember.referralCode}

Click here to get started: https://studyspot.com/ref/${selectedReferralMember.referralCode}

Best regards,
${selectedReferralMember.name}
${selectedReferralMember.role}`}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                <Button variant="outlined" fullWidth startIcon={<Email />}>
                  WhatsApp
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Email />}>
                  SMS
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Email />}>
                  LinkedIn
                </Button>
              </Box>

              <Alert severity="success">
                <Typography variant="body2" fontWeight="bold">Referral Incentive</Typography>
                <Typography variant="caption">
                  When this referral converts, {selectedReferralMember.name} will earn 8.5% commission on the deal value.
                </Typography>
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareLinkOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Email />}>
              Send Email
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Custom Date Range Dialog */}
      <Dialog open={customRangeOpen} onClose={() => setCustomRangeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterList color="primary" />
              <Typography variant="h6" fontWeight="bold">Select Custom Date Range</Typography>
            </Stack>
            <IconButton size="small" onClick={() => setCustomRangeOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info" icon={<FilterList />}>
              <Typography variant="body2">
                Select a custom date range to filter all performance data and charts
              </Typography>
            </Alert>
            
            <TextField
              label="Start Date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            
            <TextField
              label="End Date"
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: customStartDate }}
              size="small"
            />
            
            {customStartDate && customEndDate && (
              <Paper sx={{ p: 2, bgcolor: 'primary.50', border: 2, borderColor: 'primary.main' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Selected Range
                </Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {new Date(customStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} 
                  {' → '}
                  {new Date(customEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
                <Chip 
                  label={`${Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`}
                  size="small"
                  color="primary"
                />
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCustomRangeOpen(false);
            setCustomStartDate('');
            setCustomEndDate('');
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            disabled={!customStartDate || !customEndDate}
            startIcon={<FilterList />}
            onClick={() => {
              setDateRange('custom');
              setCustomRangeOpen(false);
            }}
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesTeamDashboard;

