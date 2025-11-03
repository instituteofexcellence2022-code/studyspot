import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { referralDiscountService, ReferralAnalytics, DiscountAnalytics } from '../../services/referralDiscountService';

interface ReferralAnalyticsProps {
  open: boolean;
  onClose: () => void;
  referralAnalytics?: ReferralAnalytics | null;
  discountAnalytics?: DiscountAnalytics | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReferralAnalyticsComponent: React.FC<ReferralAnalyticsProps> = ({
  open,
  onClose,
  referralAnalytics,
  discountAnalytics,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts (in real implementation, this would come from API)
  const referralTrendData = [
    { date: '2024-01-01', referrals: 12, successful: 8, value: 2400 },
    { date: '2024-01-02', referrals: 19, successful: 12, value: 3800 },
    { date: '2024-01-03', referrals: 15, successful: 10, value: 3000 },
    { date: '2024-01-04', referrals: 22, successful: 16, value: 4400 },
    { date: '2024-01-05', referrals: 18, successful: 13, value: 3600 },
    { date: '2024-01-06', referrals: 25, successful: 18, value: 5000 },
    { date: '2024-01-07', referrals: 20, successful: 15, value: 4000 },
  ];

  const discountTrendData = [
    { date: '2024-01-01', redemptions: 8, discount: 1200, revenue: 4800 },
    { date: '2024-01-02', redemptions: 12, discount: 1800, revenue: 7200 },
    { date: '2024-01-03', redemptions: 10, discount: 1500, revenue: 6000 },
    { date: '2024-01-04', redemptions: 15, discount: 2250, revenue: 9000 },
    { date: '2024-01-05', redemptions: 11, discount: 1650, revenue: 6600 },
    { date: '2024-01-06', redemptions: 18, discount: 2700, revenue: 10800 },
    { date: '2024-01-07', redemptions: 14, discount: 2100, revenue: 8400 },
  ];

  const referralSourceData = [
    { name: 'Social Media', value: 35, color: '#8884d8' },
    { name: 'Email', value: 25, color: '#82ca9d' },
    { name: 'Direct', value: 20, color: '#ffc658' },
    { name: 'Search', value: 15, color: '#ff7300' },
    { name: 'Other', value: 5, color: '#00ff00' },
  ];

  const discountTypeData = [
    { name: 'Percentage', value: 60, color: '#8884d8' },
    { name: 'Fixed Amount', value: 30, color: '#82ca9d' },
    { name: 'Free Hours', value: 10, color: '#ffc658' },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (newTimeRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newTimeRange);
    // In real implementation, fetch data for new time range
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            Referral & Discount Analytics
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Referrals
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {formatNumber(referralAnalytics?.total_referrals || 0)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {referralAnalytics?.total_referrals 
                      ? ((referralAnalytics.successful_referrals / referralAnalytics.total_referrals) * 100).toFixed(1)
                      : 0}%
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Discounts
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {formatCurrency(discountAnalytics?.total_discount_given || 0)}
                  </Typography>
                </Box>
                <CouponIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Avg. Referral Value
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {formatCurrency(referralAnalytics?.avg_referral_value || 0)}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Referral Analytics" />
            <Tab label="Discount Analytics" />
            <Tab label="Performance Trends" />
            <Tab label="Source Analysis" />
          </Tabs>
        </Box>

        {/* Referral Analytics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Typography variant="h6">Referral Performance</Typography>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="referrals" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="successful" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Referral Sources
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={referralSourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {referralSourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Referral Statistics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Referrals
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatNumber(referralAnalytics?.total_referrals || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Successful Referrals
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {formatNumber(referralAnalytics?.successful_referrals || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Referral Value
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {formatCurrency(referralAnalytics?.total_referral_value || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Unique Referrers
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {formatNumber(referralAnalytics?.unique_referrers || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </TabPanel>

        {/* Discount Analytics Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Typography variant="h6">Discount Performance</Typography>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discountTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="redemptions" fill="#8884d8" />
                  <Bar dataKey="discount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Discount Types
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={discountTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {discountTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Discount Statistics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Redemptions
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatNumber(discountAnalytics?.total_redemptions || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Discount Given
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {formatCurrency(discountAnalytics?.total_discount_given || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Unique Users
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {formatNumber(discountAnalytics?.unique_users || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Discount per Redemption
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {formatCurrency(discountAnalytics?.avg_discount_per_redemption || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </TabPanel>

        {/* Performance Trends Tab */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <Typography variant="h6">Performance Trends</Typography>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={referralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Referral Value" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={discountTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="discount" stroke="#ffc658" strokeWidth={2} name="Discount Given" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </TabPanel>

        {/* Source Analysis Tab */}
        <TabPanel value={activeTab} index={3}>
          <Stack spacing={3}>
            <Typography variant="h6">Source Analysis</Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Referral Sources
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={referralSourceData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Source Performance
                  </Typography>
                  <Stack spacing={2}>
                    {referralSourceData.map((source, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{source.name}</Typography>
                          <Typography variant="body2" fontWeight="bold">{source.value}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={source.value}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReferralAnalyticsComponent;
