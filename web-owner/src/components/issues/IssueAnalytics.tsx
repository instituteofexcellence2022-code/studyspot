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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  BugReport as BugReportIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { issueService, IssueAnalytics } from '../../services/issueService';

interface IssueAnalyticsProps {
  open: boolean;
  onClose: () => void;
  data: any | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const IssueAnalyticsComponent: React.FC<IssueAnalyticsProps> = ({
  open,
  onClose,
  data,
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<IssueAnalytics | null>(data);

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await issueService.getAnalytics({ period });
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    return `${Math.round(hours / 24)}d`;
  };

  if (!analyticsData) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Issue Analytics</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography>Loading analytics...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Issue Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as '7d' | '30d' | '90d')}
                label="Period"
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={loadAnalytics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

        <DialogContent>
          {/* Overview Cards */}
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
                        {formatNumber(analyticsData.overview.total_issues)}
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
                        {formatNumber(analyticsData.overview.open_issues)}
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
                        {formatNumber(analyticsData.overview.overdue_issues)}
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
                          ? formatHours(analyticsData.overview.avg_resolution_time_hours)
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

          {/* Satisfaction Rating */}
          {analyticsData.overview.satisfaction_count > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Satisfaction
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <StarIcon sx={{ fontSize: 48, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {analyticsData.overview.avg_satisfaction_rating?.toFixed(1) || 'N/A'}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          / 5.0
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Based on {analyticsData.overview.satisfaction_count} ratings
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Satisfaction Rate:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(analyticsData.overview.avg_satisfaction_rating || 0) * 20}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color="warning"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round((analyticsData.overview.avg_satisfaction_rating || 0) * 20)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Issues by Category */}
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issues by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.byCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Issues by Priority */}
            <Box sx={{ flex: '1 1 400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issues by Priority
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.byPriority}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="display_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Trend Chart */}
            <Box sx={{ flex: '1 1 100%' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issue Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#8884d8" 
                        name="Total Issues"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#82ca9d" 
                        name="Resolved Issues"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Category Breakdown */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {analyticsData.byCategory.map((category) => (
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }} key={category.name}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography>{category.icon}</Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {category.display_name}
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {category.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.open_count} open
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(category.count / analyticsData.overview.total_issues) * 100}
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Breakdown
              </Typography>
              <Stack spacing={2}>
                {analyticsData.byPriority.map((priority) => (
                  <Box key={priority.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={priority.display_name}
                          size="small"
                          sx={{ bgcolor: priority.color, color: 'white' }}
                        />
                        <Typography variant="body2">
                          {priority.count} total, {priority.open_count} open
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="error.main">
                        {priority.overdue_count} overdue
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(priority.count / analyticsData.overview.total_issues) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default IssueAnalyticsComponent;
