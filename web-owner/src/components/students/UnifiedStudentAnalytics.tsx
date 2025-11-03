import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: string;
  kycVerified?: boolean;
  feeStatus?: string;
  currentPlan?: string;
  attendancePercentage?: number;
}

interface UnifiedAnalyticsProps {
  students: Student[];
  onExport: (format: string) => void;
  onRefresh: () => void;
}

const UnifiedStudentAnalytics: React.FC<UnifiedAnalyticsProps> = ({
  students,
  onExport,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('30d');
  const [filterStatus, setFilterStatus] = useState('all');


  // Calculate comprehensive analytics
  const getAnalytics = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const kycVerified = students.filter(s => s.kycVerified).length;
    const feePending = students.filter(s => s.feeStatus === 'pending').length;
    const averageAttendance = students.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / totalStudents;

    // Enrollment trends (mock data)
    const enrollmentTrend = {
      thisMonth: 15,
      lastMonth: 12,
      growth: 25,
    };

    // Fee analytics (mock data)
    const feeAnalytics = {
      totalRevenue: 125000,
      pendingAmount: 25000,
      collectionRate: 83,
      overdueCount: 8,
    };

    // KYC analytics (mock data)
    const kycAnalytics = {
      verified: kycVerified,
      pending: totalStudents - kycVerified,
      verificationRate: Math.round((kycVerified / totalStudents) * 100),
      avgProcessingTime: 2.5,
    };

    // Document analytics (mock data)
    const documentAnalytics = {
      totalDocuments: 450,
      verifiedDocuments: 380,
      pendingDocuments: 70,
      storageUsed: '2.3 GB',
    };

    // Attendance analytics (mock data)
    const attendanceAnalytics = {
      averageAttendance: Math.round(averageAttendance),
      presentToday: Math.round(totalStudents * 0.85),
      absentToday: Math.round(totalStudents * 0.15),
      lateToday: Math.round(totalStudents * 0.05),
    };

    return {
      overview: {
        totalStudents,
        activeStudents,
        kycVerified,
        feePending,
        averageAttendance: Math.round(averageAttendance),
      },
      enrollment: enrollmentTrend,
      fees: feeAnalytics,
      kyc: kycAnalytics,
      documents: documentAnalytics,
      attendance: attendanceAnalytics,
    };
  };

  const analytics = getAnalytics();

  const renderOverviewTab = () => (
    <Box>
      {/* Key Metrics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {analytics.overview.totalStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Registered students
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
                    {analytics.overview.activeStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((analytics.overview.activeStudents / analytics.overview.totalStudents) * 100)}% of total
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
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
                    {analytics.overview.kycVerified}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {analytics.kyc.verificationRate}% verification rate
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.8 }} />
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
                    {analytics.overview.feePending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs attention
                  </Typography>
                </Box>
                <PaymentIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => onExport('csv')}>
              Export Data
            </Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print Report
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
              Refresh Data
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderEnrollmentTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Enrollment Trends</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>This Month</Typography>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {analytics.enrollment.thisMonth}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New enrollments
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Growth Rate</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="h3" color="success.main" fontWeight="bold">
                +{analytics.enrollment.growth}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Alert severity="info">
        Detailed enrollment trend charts and analytics would be displayed here.
      </Alert>
    </Box>
  );

  const renderFeesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Financial Analytics</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total Revenue</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              ₹{analytics.fees.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collected amount
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pending Amount</Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              ₹{analytics.fees.pendingAmount.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Awaiting collection
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Collection Rate</Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {analytics.fees.collectionRate}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={analytics.fees.collectionRate} 
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Overdue Payments</Typography>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {analytics.fees.overdueCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Need immediate attention
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderKYCTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>KYC Verification Analytics</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Verified</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {analytics.kyc.verified}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students verified
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pending</Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {analytics.kyc.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Awaiting verification
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Verification Rate</Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {analytics.kyc.verificationRate}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={analytics.kyc.verificationRate} 
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Avg Processing Time</Typography>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {analytics.kyc.avgProcessingTime}d
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days to verify
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderDocumentsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Document Management Analytics</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Total Documents</Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {analytics.documents.totalDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All documents
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Verified</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {analytics.documents.verifiedDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Documents verified
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Pending</Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {analytics.documents.pendingDocuments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Awaiting verification
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Storage Used</Typography>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {analytics.documents.storageUsed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total storage
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderAttendanceTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Attendance Analytics</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Average Attendance</Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {analytics.attendance.averageAttendance}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall rate
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Present Today</Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {analytics.attendance.presentToday}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students present
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Absent Today</Typography>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {analytics.attendance.absentToday}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students absent
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Late Today</Typography>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {analytics.attendance.lateToday}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students late
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderOverviewTab();
      case 1: return renderEnrollmentTab();
      case 2: return renderFeesTab();
      case 3: return renderKYCTab();
      case 4: return renderDocumentsTab();
      case 5: return renderAttendanceTab();
      default: return renderOverviewTab();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          Unified Student Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Date Range</InputLabel>
            <Select value={dateRange} label="Date Range" onChange={(e) => setDateRange(e.target.value)}>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="all">All Students</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<AssessmentIcon />} />
          <Tab label="Enrollment" icon={<TrendingUpIcon />} />
          <Tab label="Fees" icon={<PaymentIcon />} />
          <Tab label="KYC" icon={<SecurityIcon />} />
          <Tab label="Documents" icon={<DescriptionIcon />} />
          <Tab label="Attendance" icon={<CalendarTodayIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {renderTabContent()}
    </Box>
  );
};

export default UnifiedStudentAnalytics;
