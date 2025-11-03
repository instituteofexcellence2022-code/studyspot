import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { issueService } from '../../services/issueService';
import { toast } from 'react-toastify';

interface IssueAdvancedAnalyticsProps {
  open: boolean;
  onClose: () => void;
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

const IssueAdvancedAnalytics: React.FC<IssueAdvancedAnalyticsProps> = ({
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadAdvancedAnalytics();
    }
  }, [open, timeRange]);

  const loadAdvancedAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for demonstration - replace with actual API calls
      const mockData = {
        performanceMetrics: {
          avgResolutionTime: 2.5,
          firstResponseTime: 0.8,
          customerSatisfaction: 4.2,
          escalationRate: 12.5,
          automationRate: 35.8,
        },
        trendData: [
          { date: '2024-01-01', issues: 45, resolved: 42, escalated: 3 },
          { date: '2024-01-02', issues: 52, resolved: 48, escalated: 4 },
          { date: '2024-01-03', issues: 38, resolved: 35, escalated: 3 },
          { date: '2024-01-04', issues: 61, resolved: 58, escalated: 3 },
          { date: '2024-01-05', issues: 47, resolved: 44, escalated: 3 },
          { date: '2024-01-06', issues: 55, resolved: 52, escalated: 3 },
          { date: '2024-01-07', issues: 43, resolved: 40, escalated: 3 },
        ],
        categoryDistribution: [
          { name: 'Technical', value: 35, color: '#8884d8' },
          { name: 'Facility', value: 25, color: '#82ca9d' },
          { name: 'Booking', value: 20, color: '#ffc658' },
          { name: 'Payment', value: 15, color: '#ff7300' },
          { name: 'Feedback', value: 5, color: '#00ff00' },
        ],
        staffPerformance: [
          { name: 'John Doe', issuesResolved: 45, avgTime: 2.1, satisfaction: 4.5 },
          { name: 'Jane Smith', issuesResolved: 38, avgTime: 2.8, satisfaction: 4.2 },
          { name: 'Mike Johnson', issuesResolved: 42, avgTime: 2.3, satisfaction: 4.4 },
          { name: 'Sarah Wilson', issuesResolved: 35, avgTime: 2.6, satisfaction: 4.1 },
        ],
        slaCompliance: [
          { name: 'First Response', target: 4, actual: 3.2, compliance: 85 },
          { name: 'Resolution', target: 24, actual: 18.5, compliance: 92 },
          { name: 'Escalation', target: 48, actual: 42.1, compliance: 88 },
        ],
        automationStats: {
          totalAutomated: 156,
          workflowRules: 12,
          escalationRules: 8,
          notificationTemplates: 15,
          automationRate: 35.8,
        },
      };
      setAnalyticsData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      toast.error(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Implement report export functionality
    toast.success('Report exported successfully!');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Advanced Issue Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={loadAdvancedAnalytics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={handleExportReport}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab icon={<TrendingUpIcon />} label="Performance" />
            <Tab icon={<TimelineIcon />} label="Trends" />
            <Tab icon={<PeopleIcon />} label="Staff Performance" />
            <Tab icon={<ScheduleIcon />} label="SLA Compliance" />
            <Tab icon={<BarChartIcon />} label="Automation" />
          </Tabs>
        </Box>

        {analyticsData && (
          <>
            {/* Performance Metrics Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Avg Resolution Time
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {analyticsData.performanceMetrics.avgResolutionTime}h
                          </Typography>
                        </Box>
                        <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                            First Response Time
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {analyticsData.performanceMetrics.firstResponseTime}h
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                            Customer Satisfaction
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {analyticsData.performanceMetrics.customerSatisfaction}/5
                          </Typography>
                        </Box>
                        <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                            Escalation Rate
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="error.main">
                            {analyticsData.performanceMetrics.escalationRate}%
                          </Typography>
                        </Box>
                        <PeopleIcon sx={{ fontSize: 40, color: 'error.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Category Distribution */}
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issue Category Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.categoryDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Trends Tab */}
            <TabPanel value={activeTab} index={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issue Trends Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={analyticsData.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="issues"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Total Issues"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Resolved"
                      />
                      <Area
                        type="monotone"
                        dataKey="escalated"
                        stackId="1"
                        stroke="#ff7300"
                        fill="#ff7300"
                        name="Escalated"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* Staff Performance Tab */}
            <TabPanel value={activeTab} index={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Staff Performance Metrics
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.staffPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="issuesResolved" fill="#8884d8" name="Issues Resolved" />
                      <Bar yAxisId="right" dataKey="avgTime" fill="#82ca9d" name="Avg Time (hours)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabPanel>

            {/* SLA Compliance Tab */}
            <TabPanel value={activeTab} index={3}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {analyticsData.slaCompliance.map((sla: any, index: number) => (
                  <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {sla.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {sla.actual}h
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {sla.target}h target
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={sla.compliance}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {sla.compliance}% compliance
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </TabPanel>

            {/* Automation Tab */}
            <TabPanel value={activeTab} index={4}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom>
                            Total Automated
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {analyticsData.automationStats.totalAutomated}
                          </Typography>
                        </Box>
                        <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                            Workflow Rules
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {analyticsData.automationStats.workflowRules}
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                            Escalation Rules
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {analyticsData.automationStats.escalationRules}
                          </Typography>
                        </Box>
                        <PeopleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
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
                            Automation Rate
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            {analyticsData.automationStats.automationRate}%
                          </Typography>
                        </Box>
                        <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueAdvancedAnalytics;
