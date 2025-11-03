import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle,
  Warning as WarningIcon,
  Warning,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

interface StudentAnalyticsDashboardProps {
  students: any[];
  onExport?: (format: string) => void;
  onRefresh?: () => void;
}

const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  students,
  onExport,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Calculate analytics data
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const kycVerified = students.filter(s => s.kycVerified).length;
  const feePending = students.filter(s => s.feeStatus === 'pending' || s.feeStatus === 'overdue').length;
  
  // Enrollment trends
  const currentMonth = new Date().getMonth();
  const thisMonthEnrollments = students.filter(s => new Date(s.enrollmentDate).getMonth() === currentMonth).length;
  const lastMonthEnrollments = students.filter(s => new Date(s.enrollmentDate).getMonth() === currentMonth - 1).length;
  
  // Average attendance
  const avgAttendance = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / students.length)
    : 0;

  // Top performing students
  const topStudents = students
    .filter(s => s.attendancePercentage >= 90)
    .sort((a, b) => (b.attendancePercentage || 0) - (a.attendancePercentage || 0))
    .slice(0, 5);

  // Fee status breakdown
  const feeStatusBreakdown = {
    paid: students.filter(s => s.feeStatus === 'paid').length,
    pending: students.filter(s => s.feeStatus === 'pending').length,
    overdue: students.filter(s => s.feeStatus === 'overdue').length,
    partial: students.filter(s => s.feeStatus === 'partial').length,
  };

  // Status breakdown
  const statusBreakdown = {
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    suspended: students.filter(s => s.status === 'suspended').length,
    graduated: students.filter(s => s.status === 'graduated').length,
  };

  // Plan distribution
  const planDistribution = students.reduce((acc, student) => {
    const plan = student.currentPlan || 'No Plan';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enrollmentTrend = thisMonthEnrollments > lastMonthEnrollments ? 'up' : 'down';
  const enrollmentChange = lastMonthEnrollments > 0 
    ? Math.round(((thisMonthEnrollments - lastMonthEnrollments) / lastMonthEnrollments) * 100)
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" />
          Student Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => onExport?.('pdf')}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {totalStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +{enrollmentChange}% from last month
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {activeStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((activeStudents / totalStudents) * 100)}% of total
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    KYC Verified
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {kycVerified}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((kycVerified / totalStudents) * 100)}% verified
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'info.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Fee Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {feePending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs attention
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs for different analytics views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<AssessmentIcon />} />
          <Tab label="Enrollment Trends" icon={<TimelineIcon />} />
          <Tab label="Performance" icon={<BarChartIcon />} />
          <Tab label="Financial" icon={<CreditCardIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* First Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Enrollment Trends */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon color="primary" />
                    Enrollment Trends
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">This Month</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {thisMonthEnrollments}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((thisMonthEnrollments / 50) * 100, 100)} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Last Month</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {lastMonthEnrollments}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((lastMonthEnrollments / 50) * 100, 100)} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {enrollmentTrend === 'up' ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                    <Typography variant="body2" color={enrollmentTrend === 'up' ? 'success.main' : 'error.main'}>
                      {Math.abs(enrollmentChange)}% {enrollmentTrend === 'up' ? 'increase' : 'decrease'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Student Categories */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon color="primary" />
                    Student Categories
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(statusBreakdown).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: status === 'active' ? 'success.main' : 
                                    status === 'inactive' ? 'warning.main' : 
                                    status === 'suspended' ? 'error.main' : 'info.main'
                          }} 
                        />
                        <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                          {status} Students
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Second Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Top Performing Students */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="primary" />
                    Top Performing Students
                  </Typography>
                  <List dense>
                    {topStudents.map((student, index) => (
                      <ListItem key={student.id}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${student.firstName} ${student.lastName}`}
                          secondary={`${student.attendancePercentage}% attendance`}
                        />
                        <Chip 
                          label={`${student.attendancePercentage}%`} 
                          size="small" 
                          color={student.attendancePercentage >= 95 ? 'success' : 'primary'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Plan Distribution */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="primary" />
                    Plan Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(planDistribution).map(([plan, count]) => (
                    <Box key={plan} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {plan}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count as number}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={((count as number) / totalStudents) * 100} 
                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enrollment Trends Over Time
            </Typography>
            <Alert severity="info">
              Detailed enrollment trend charts and analytics would be displayed here.
              This could include monthly, quarterly, and yearly enrollment patterns.
            </Alert>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Student Performance Analytics
            </Typography>
            <Alert severity="info">
              Performance metrics including attendance rates, academic progress,
              and engagement statistics would be displayed here.
            </Alert>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="primary" />
                  Fee Status Overview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(feeStatusBreakdown).map(([status, count]) => (
                    <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: status === 'paid' ? 'success.main' : 
                                  status === 'pending' ? 'warning.main' : 
                                  status === 'overdue' ? 'error.main' : 'info.main'
                        }} 
                      />
                      <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                        {status} Fees
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Summary
                </Typography>
                <Alert severity="info">
                  Financial analytics including revenue trends, payment patterns,
                  and outstanding balances would be displayed here.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StudentAnalyticsDashboard;
