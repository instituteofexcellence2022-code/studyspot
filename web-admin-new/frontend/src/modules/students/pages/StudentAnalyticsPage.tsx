// ============================================
// STUDENT ANALYTICS - PLATFORM INSIGHTS
// Data leverage for business intelligence
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  People,
  LocationOn,
  School,
  Schedule,
  AttachMoney,
  Insights,
  Download,
  Share,
  PieChart as PieChartIcon,
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#00BCD4', '#FFC107'];

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

const StudentAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedLibrary, setSelectedLibrary] = useState('all');

  // Platform-wide metrics (Aggregated from all libraries)
  const platformMetrics = {
    totalStudents: 12847,
    totalLibraries: 161,
    avgStudentsPerLibrary: 79.8,
    totalRevenue: 2345000,
    avgRevenuePerStudent: 18250,
    totalBookings: 487523,
    platformGrowthRate: 23.4,
    studentRetention: 87.5,
  };

  // Demographics Analytics (Across all libraries)
  const ageDistribution = [
    { range: '15-18', count: 2356, percentage: 18.3 },
    { range: '19-22', count: 4892, percentage: 38.1 },
    { range: '23-25', count: 3245, percentage: 25.3 },
    { range: '26-30', count: 1678, percentage: 13.1 },
    { range: '30+', count: 676, percentage: 5.2 },
  ];

  const educationDistribution = [
    { level: 'School', count: 2567, revenue: 345000 },
    { level: 'College', count: 6234, revenue: 1234000 },
    { level: 'University', count: 2890, revenue: 567000 },
    { level: 'Professional', count: 1156, revenue: 199000 },
  ];

  const genderDistribution = [
    { gender: 'Male', count: 7234, percentage: 56.3 },
    { gender: 'Female', count: 5123, percentage: 39.9 },
    { gender: 'Other', count: 490, percentage: 3.8 },
  ];

  // Geographic Distribution (Market penetration)
  const cityPerformance = [
    { city: 'Mumbai', students: 3567, libraries: 45, revenue: 678000, growth: 28.5 },
    { city: 'Delhi', students: 2845, libraries: 38, revenue: 534000, growth: 24.2 },
    { city: 'Bangalore', students: 2234, libraries: 32, revenue: 456000, growth: 31.8 },
    { city: 'Pune', students: 1678, libraries: 24, revenue: 312000, growth: 19.4 },
    { city: 'Hyderabad', students: 1456, libraries: 18, revenue: 289000, growth: 22.1 },
    { city: 'Chennai', students: 1067, libraries: 14, revenue: 198000, growth: 15.7 },
  ];

  // Behavioral Analytics (Usage patterns)
  const studyPatterns = [
    { timeSlot: '6 AM - 9 AM', students: 2345, bookings: 8900 },
    { timeSlot: '9 AM - 12 PM', students: 4567, bookings: 15600 },
    { timeSlot: '12 PM - 3 PM', students: 3890, bookings: 12300 },
    { timeSlot: '3 PM - 6 PM', students: 5234, bookings: 18900 },
    { timeSlot: '6 PM - 9 PM', students: 6789, bookings: 23400 },
    { timeSlot: '9 PM - 12 AM', students: 3456, bookings: 10200 },
  ];

  const dayWisePattern = [
    { day: 'Monday', students: 9234, avgHours: 4.2 },
    { day: 'Tuesday', students: 9567, avgHours: 4.5 },
    { day: 'Wednesday', students: 9890, avgHours: 4.3 },
    { day: 'Thursday', students: 9456, avgHours: 4.4 },
    { day: 'Friday', students: 8234, avgHours: 3.8 },
    { day: 'Saturday', students: 10234, avgHours: 5.2 },
    { day: 'Sunday', students: 7890, avgHours: 4.8 },
  ];

  // Cohort Analysis (Student lifecycle)
  const cohortRetention = [
    { month: 'Month 1', retained: 100, churned: 0 },
    { month: 'Month 2', retained: 92, churned: 8 },
    { month: 'Month 3', retained: 87, churned: 5 },
    { month: 'Month 4', retained: 83, churned: 4 },
    { month: 'Month 5', retained: 80, churned: 3 },
    { month: 'Month 6', retained: 78, churned: 2 },
  ];

  // Revenue Analytics (Platform performance)
  const revenueBySource = [
    { source: 'Monthly Plans', revenue: 678000, students: 3214 },
    { source: 'Quarterly Plans', revenue: 1234000, students: 3589 },
    { source: 'Annual Plans', revenue: 2456000, students: 4856 },
    { source: 'Trial Conversions', revenue: 123000, students: 1188 },
  ];

  // Engagement Score Distribution
  const engagementDistribution = [
    { score: '0-20', count: 456, label: 'At Risk' },
    { score: '21-40', count: 1234, label: 'Low' },
    { score: '41-60', count: 3567, label: 'Medium' },
    { score: '61-80', count: 4890, label: 'High' },
    { score: '81-100', count: 2700, label: 'Super Active' },
  ];

  // Library Performance Comparison
  const libraryComparison = [
    { library: 'Central Library', students: 245, revenue: 456000, retention: 92, satisfaction: 4.8 },
    { library: 'Tech Hub', students: 198, revenue: 389000, retention: 88, satisfaction: 4.6 },
    { library: 'Knowledge Point', students: 167, revenue: 312000, retention: 85, satisfaction: 4.5 },
    { library: 'Study Center', students: 134, revenue: 267000, retention: 81, satisfaction: 4.3 },
    { library: 'Learn Space', students: 123, revenue: 234000, retention: 79, satisfaction: 4.2 },
  ];

  // Market Intelligence (Competitive insights)
  const marketInsights = {
    totalAddressableMarket: 50000, // Total potential students in covered areas
    currentPenetration: 25.7, // % of TAM captured
    competitorStudents: 15000, // Estimated competitors' students
    marketShareGrowth: 3.2, // % growth in last quarter
  };

  // Tab 1: Demographics
  const renderDemographicsTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Data Leverage Insight:</strong> Platform-wide demographics help identify target markets and optimize library locations
      </Alert>

      {/* Age Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Age Distribution Across Platform
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Student age groups across all {platformMetrics.totalLibraries} libraries
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#E91E63" name="Students" />
            </BarChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            {ageDistribution.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{item.range} years</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Education & Gender */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Education Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={educationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.level}: ${((entry.count / platformMetrics.totalStudents) * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {educationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {educationDistribution.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                >
                  <Typography variant="body2">{item.level}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.count.toLocaleString()} • ₹{(item.revenue / 1000).toFixed(0)}K
                  </Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Gender Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.gender}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {genderDistribution.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}
                >
                  <Typography variant="body2">{item.gender}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </Typography>
                </Stack>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 2: Geographic Insights
  const renderGeographicTab = () => (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>Market Opportunity:</strong> Identify high-growth cities and expansion opportunities based on student concentration
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            City-wise Performance
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Student concentration and revenue by city
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cityPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="students" fill="#2196F3" name="Students" />
              <Bar yAxisId="right" dataKey="revenue" fill="#4CAF50" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* City Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {cityPerformance.map((city, index) => (
          <Box key={index}>
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {city.city}
                </Typography>
                <Chip
                  label={`+${city.growth}%`}
                  color="success"
                  size="small"
                  icon={<TrendingUp />}
                />
              </Stack>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Students
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {city.students.toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Libraries
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {city.libraries}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Revenue
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ₹{(city.revenue / 1000).toFixed(0)}K
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Avg per Library
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(city.students / city.libraries)} students
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Tab 3: Behavioral Patterns
  const renderBehavioralTab = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Usage Optimization:</strong> Understanding peak hours helps libraries optimize capacity and staffing
      </Alert>

      {/* Peak Hours Analysis */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Peak Study Hours (Platform-wide)
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            When are students most active across all libraries?
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={studyPatterns}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeSlot" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#E91E63"
                fillOpacity={1}
                fill="url(#colorStudents)"
                name="Active Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Day-wise Pattern */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Day-wise Study Patterns
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            Average study hours and student count by day
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dayWisePattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="students"
                stroke="#2196F3"
                strokeWidth={2}
                name="Active Students"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgHours"
                stroke="#4CAF50"
                strokeWidth={2}
                name="Avg Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            6 PM - 9 PM
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Peak Hours
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            6,789 students • 23,400 bookings
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            Saturday
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busiest Day
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            10,234 students • 5.2 avg hours
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
          <Typography variant="h4" fontWeight="bold" color="warning.main">
            4.3 hours
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Session Duration
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Across all students & libraries
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  // Tab 4: Revenue Intelligence
  const renderRevenueTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Revenue Optimization:</strong> Identify high-value student segments and optimize pricing strategies
      </Alert>

      {/* Revenue by Plan Type */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Revenue by Membership Type
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueBySource}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4CAF50" name="Revenue (₹)" />
              <Bar dataKey="students" fill="#2196F3" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <AttachMoney sx={{ fontSize: 40, color: '#4CAF50' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            ₹{(platformMetrics.totalRevenue / 100000).toFixed(1)}L
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Revenue
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <People sx={{ fontSize: 40, color: '#2196F3' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            ₹{(platformMetrics.avgRevenuePerStudent / 1000).toFixed(1)}K
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Avg per Student
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <TrendingUp sx={{ fontSize: 40, color: '#FF9800' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {platformMetrics.platformGrowthRate}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Growth Rate
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <PieChartIcon sx={{ fontSize: 40, color: '#9C27B0' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {platformMetrics.studentRetention}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Retention Rate
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Student Analytics & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Platform-wide intelligence • Data leverage for business optimization
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="1m">Last Month</MenuItem>
              <MenuItem value="3m">Last 3 Months</MenuItem>
              <MenuItem value="6m">Last 6 Months</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<Share />}>
            Share Insights
          </Button>
        </Stack>
      </Box>

      {/* Platform Summary */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform-Wide Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {platformMetrics.totalStudents.toLocaleString()}
              </Typography>
              <Typography variant="caption">Total Students</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {platformMetrics.totalLibraries}
              </Typography>
              <Typography variant="caption">Libraries</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {platformMetrics.avgStudentsPerLibrary.toFixed(0)}
              </Typography>
              <Typography variant="caption">Avg Students/Library</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {platformMetrics.totalBookings.toLocaleString()}
              </Typography>
              <Typography variant="caption">Total Bookings</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Demographics" icon={<People />} iconPosition="start" />
          <Tab label="Geographic Insights" icon={<LocationOn />} iconPosition="start" />
          <Tab label="Behavioral Patterns" icon={<Schedule />} iconPosition="start" />
          <Tab label="Revenue Intelligence" icon={<AttachMoney />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderDemographicsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderGeographicTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderBehavioralTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            {renderRevenueTab()}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAnalyticsPage;

