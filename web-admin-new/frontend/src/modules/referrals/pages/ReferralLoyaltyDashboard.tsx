// ============================================
// REFERRAL & LOYALTY DASHBOARD
// Manage referral programs and loyalty rewards
// ============================================

import React, { useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  CardGiftcard,
  Share,
  EmojiEvents,
  TrendingUp,
  People,
  AttachMoney,
  Star,
  Edit,
  Visibility,
  Add,
  Download,
  CheckCircle,
  Schedule,
  PersonAdd,
  Close,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  type PieLabelRenderProps,
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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ReferralLoyaltyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  // KPIs
  const kpis = {
    totalReferrals: 4567,
    successfulReferrals: 3234,
    totalRewardsIssued: 15678,
    totalRewardValue: 2345000,
    conversionRate: 70.8,
    avgRewardValue: 149,
    activePrograms: 5,
    topReferrer: 'Rahul Sharma',
  };

  // Mock referral data
  const referrals = [
    { id: 1, referrer: 'Rahul Sharma', referrerEmail: 'rahul@email.com', referee: 'Priya Patel', refereeEmail: 'priya@email.com', status: 'converted', reward: 500, date: '2025-10-25', library: 'Central Library' },
    { id: 2, referrer: 'Amit Kumar', referrerEmail: 'amit@email.com', referee: 'Sneha Reddy', refereeEmail: 'sneha@email.com', status: 'pending', reward: 0, date: '2025-10-28', library: 'Tech Hub' },
    { id: 3, referrer: 'Vikram Singh', referrerEmail: 'vikram@email.com', referee: 'Anjali Mehta', refereeEmail: 'anjali@email.com', status: 'converted', reward: 500, date: '2025-10-20', library: 'Study Center' },
    { id: 4, referrer: 'Karthik Iyer', referrerEmail: 'karthik@email.com', referee: 'Divya Nair', refereeEmail: 'divya@email.com', status: 'expired', reward: 0, date: '2025-09-15', library: 'Central Library' },
    { id: 5, referrer: 'Rahul Sharma', referrerEmail: 'rahul@email.com', referee: 'Rohan Desai', refereeEmail: 'rohan@email.com', status: 'converted', reward: 500, date: '2025-10-22', library: 'Tech Hub' },
  ];

  // Loyalty points data
  const loyaltyMembers = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', points: 2500, tier: 'Gold', referrals: 5, rewardsEarned: 2500, lastActivity: '2025-11-01' },
    { id: 2, name: 'Priya Patel', email: 'priya@email.com', points: 1800, tier: 'Silver', referrals: 3, rewardsEarned: 1800, lastActivity: '2025-10-30' },
    { id: 3, name: 'Amit Kumar', email: 'amit@email.com', points: 3400, tier: 'Platinum', referrals: 7, rewardsEarned: 3400, lastActivity: '2025-11-02' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', points: 950, tier: 'Bronze', referrals: 1, rewardsEarned: 950, lastActivity: '2025-10-28' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@email.com', points: 2100, tier: 'Silver', referrals: 4, rewardsEarned: 2100, lastActivity: '2025-10-29' },
  ];

  // Analytics data
  const referralTrendData = [
    { month: 'May', referrals: 234, conversions: 156, rewards: 78000 },
    { month: 'Jun', referrals: 289, conversions: 198, rewards: 99000 },
    { month: 'Jul', referrals: 345, conversions: 234, rewards: 117000 },
    { month: 'Aug', referrals: 412, conversions: 289, rewards: 144500 },
    { month: 'Sep', referrals: 478, conversions: 334, rewards: 167000 },
    { month: 'Oct', referrals: 523, conversions: 389, rewards: 194500 },
  ];

  const tierDistribution = [
    { tier: 'Bronze', members: 4567, percentage: 35.5 },
    { tier: 'Silver', members: 3456, percentage: 26.9 },
    { tier: 'Gold', members: 2345, percentage: 18.2 },
    { tier: 'Platinum', members: 1234, percentage: 9.6 },
    { tier: 'Diamond', members: 1257, percentage: 9.8 },
  ];

  const rewardTypeDistribution = [
    { name: 'Referral Bonus', value: 1250000, count: 3234 },
    { name: 'Loyalty Points', value: 678000, count: 5678 },
    { name: 'Birthday Rewards', value: 234000, count: 2345 },
    { name: 'Milestone Bonus', value: 183000, count: 456 },
  ];

  const topReferrers = [
    { name: 'Rahul Sharma', referrals: 12, conversions: 9, rewards: 4500, tier: 'Platinum' },
    { name: 'Amit Kumar', referrals: 10, conversions: 7, rewards: 3500, tier: 'Gold' },
    { name: 'Priya Patel', referrals: 8, conversions: 6, rewards: 3000, tier: 'Gold' },
    { name: 'Vikram Singh', referrals: 7, conversions: 5, rewards: 2500, tier: 'Silver' },
    { name: 'Sneha Reddy', referrals: 6, conversions: 4, rewards: 2000, tier: 'Silver' },
  ];

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(ref => {
      const matchesSearch = ref.referrer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ref.referee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // DataGrid columns for referrals
  const referralColumns: GridColDef[] = [
    {
      field: 'referrer',
      headerName: 'Referrer',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{params.row.referrer}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.referrerEmail}</Typography>
        </Box>
      ),
    },
    {
      field: 'referee',
      headerName: 'Referee',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{params.row.referee}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.refereeEmail}</Typography>
        </Box>
      ),
    },
    {
      field: 'library',
      headerName: 'Library',
      width: 150,
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig = {
          converted: { label: 'Converted', color: 'success' as const, icon: <CheckCircle /> },
          pending: { label: 'Pending', color: 'warning' as const, icon: <Schedule /> },
          expired: { label: 'Expired', color: 'error' as const, icon: <Close /> },
        };
        const config = statusConfig[params.value as keyof typeof statusConfig];
        return <Chip label={config.label} size="small" color={config.color} icon={config.icon} />;
      },
    },
    {
      field: 'reward',
      headerName: 'Reward',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color={params.value > 0 ? 'success.main' : 'text.secondary'}>
          {params.value > 0 ? `₹${params.value}` : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: () => (
        <IconButton size="small" color="primary">
          <Visibility fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Loyalty member columns
  const loyaltyColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Member',
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {params.row.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'points',
      headerName: 'Points',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value.toLocaleString()} size="small" color="primary" icon={<Star />} />
      ),
    },
    {
      field: 'tier',
      headerName: 'Tier',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const tierColors: any = {
          Bronze: 'default',
          Silver: 'info',
          Gold: 'warning',
          Platinum: 'secondary',
          Diamond: 'primary',
        };
        return <Chip label={params.value} size="small" color={tierColors[params.value]} />;
      },
    },
    {
      field: 'referrals',
      headerName: 'Referrals',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      ),
    },
    {
      field: 'rewardsEarned',
      headerName: 'Rewards Earned',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'lastActivity',
      headerName: 'Last Activity',
      width: 130,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: () => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info">
            <Visibility fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Tab 1: Referrals
  const renderReferralsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Download />} fullWidth>
              Export Referrals
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {filteredReferrals.length} of {referrals.length} referrals
          </Typography>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Conversion Breakdown
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Successful</Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {kpis.successfulReferrals.toLocaleString()} ({kpis.conversionRate}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={kpis.conversionRate} 
              sx={{ mb: 1, height: 8, borderRadius: 1 }}
              color="success"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">
                {(kpis.totalReferrals - kpis.successfulReferrals).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Total Rewards Issued
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ₹{(kpis.totalRewardValue / 1000).toFixed(0)}K
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {kpis.totalRewardsIssued.toLocaleString()} rewards • Avg ₹{kpis.avgRewardValue}/reward
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Referrer
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                {kpis.topReferrer.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">{kpis.topReferrer}</Typography>
                <Typography variant="caption" color="text.secondary">12 successful referrals</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Referrals DataGrid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            All Referrals
          </Typography>
          <DataGrid
            rows={filteredReferrals}
            columns={referralColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Loyalty Program
  const renderLoyaltyTab = () => (
    <Box>
      {/* Tier Distribution */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏆 Member Tier Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }: PieLabelRenderProps) =>
                    `${payload?.tier ?? payload?.name ?? ''}: ${
                      percent != null ? (percent * 100).toFixed(1) : '0'
                    }%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="members"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Loyalty Members
            </Typography>
            <Stack spacing={2}>
              {loyaltyMembers.slice(0, 5).sort((a, b) => b.points - a.points).map((member) => (
                <Paper key={member.id} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{member.name}</Typography>
                        <Chip label={member.tier} size="small" sx={{ mt: 0.5 }} />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={`${member.points} pts`} size="small" color="primary" icon={<Star />} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        {member.referrals} referrals
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Loyalty Members Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            All Loyalty Members
          </Typography>
          <DataGrid
            rows={loyaltyMembers}
            columns={loyaltyColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Analytics
  const renderAnalyticsTab = () => (
    <Box>
      {/* Referral Trend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📈 Referral & Conversion Trend (6 Months)
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={referralTrendData}>
              <defs>
                <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="referrals" stroke="#2196F3" fill="url(#colorReferrals)" name="Total Referrals" />
              <Area type="monotone" dataKey="conversions" stroke="#4CAF50" fill="url(#colorConversions)" name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rewards & Top Referrers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💰 Reward Distribution by Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rewardTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="value" fill="#E91E63" name="Value (₹)" />
                <Bar dataKey="count" fill="#9C27B0" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🏆 Top Referrers Leaderboard
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Rank</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell align="right"><strong>Referrals</strong></TableCell>
                    <TableCell align="right"><strong>Conversions</strong></TableCell>
                    <TableCell align="right"><strong>Rewards</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topReferrers.map((referrer, index) => (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color={index === 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{referrer.name}</Typography>
                          <Chip label={referrer.tier} size="small" sx={{ mt: 0.5 }} />
                        </Box>
                      </TableCell>
                      <TableCell align="right">{referrer.referrals}</TableCell>
                      <TableCell align="right">
                        <Chip label={referrer.conversions} size="small" color="success" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          ₹{referrer.rewards.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 4: Programs
  const renderProgramsTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Configure and manage referral programs, loyalty tiers, and reward rules
        </Typography>
      </Alert>

      {/* Active Programs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Referral Program
              </Typography>
              <Chip label="Active" size="small" color="success" icon={<CheckCircle />} />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Referrer Reward</Typography>
                <Typography variant="body1" fontWeight={600}>₹500 credit</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Referee Reward</Typography>
                <Typography variant="body1" fontWeight={600}>₹250 credit</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Validity Period</Typography>
                <Typography variant="body1" fontWeight={600}>30 days</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Referrals</Typography>
                <Typography variant="body1" fontWeight={600}>{kpis.totalReferrals.toLocaleString()}</Typography>
              </Box>
            </Stack>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<Edit />}>
              Edit Program
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Loyalty Tiers
              </Typography>
              <Chip label="5 Tiers" size="small" color="info" />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {[
                { tier: 'Bronze', points: '0 - 999', color: '#CD7F32', benefits: 'Basic rewards' },
                { tier: 'Silver', points: '1,000 - 2,499', color: '#C0C0C0', benefits: '5% bonus' },
                { tier: 'Gold', points: '2,500 - 4,999', color: '#FFD700', benefits: '10% bonus + priority' },
                { tier: 'Platinum', points: '5,000 - 9,999', color: '#E5E4E2', benefits: '15% bonus + perks' },
                { tier: 'Diamond', points: '10,000+', color: '#B9F2FF', benefits: '20% bonus + VIP' },
              ].map((tier, index) => (
                <Paper key={index} sx={{ p: 1.5, borderLeft: 4, borderColor: tier.color }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{tier.tier}</Typography>
                      <Typography variant="caption" color="text.secondary">{tier.points} points</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{tier.benefits}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎁 Referral & Loyalty Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage referral programs and loyalty rewards • {kpis.totalReferrals.toLocaleString()} total referrals
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: 'white' }}>Total Referrals</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                  {kpis.totalReferrals.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {kpis.conversionRate}% converted
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                <Share />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Successful Referrals</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {kpis.successfulReferrals.toLocaleString()}
                </Typography>
                <Chip label="+15.3%" size="small" color="success" icon={<TrendingUp />} sx={{ mt: 0.5 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Rewards</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.totalRewardsIssued.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ₹{(kpis.totalRewardValue / 1000).toFixed(0)}K value
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <CardGiftcard />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Active Programs</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.activePrograms}
                </Typography>
                <Chip label="All Running" size="small" color="info" sx={{ mt: 0.5 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <EmojiEvents />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Referrals" icon={<Share />} iconPosition="start" />
          <Tab label="Loyalty Members" icon={<EmojiEvents />} iconPosition="start" />
          <Tab label="Analytics" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Programs" icon={<CardGiftcard />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderReferralsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderLoyaltyTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            {renderProgramsTab()}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReferralLoyaltyDashboard;
