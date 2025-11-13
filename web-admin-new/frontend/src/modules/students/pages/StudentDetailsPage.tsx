// ============================================
// STUDENT DETAILS PAGE
// Comprehensive student profile with complete history
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
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Person,
  School,
  LocationOn,
  Phone,
  Email,
  Payment,
  Event,
  CheckCircle,
  Timeline,
  Message,
  ReportProblem,
  Edit,
  Block,
  Send,
  Download,
  EmojiEvents,
  TrendingUp,
  TrendingDown,
  Assessment,
  CalendarToday,
  AccessTime,
  Mood,
  LocalLibrary,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const StudentDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock Student Data
  const student = {
    id: 'STU001',
    studentId: 'SS-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    dateOfBirth: '2002-05-15',
    gender: 'male',
    address: {
      street: '123, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    education: {
      level: 'college',
      institution: 'Mumbai University',
      course: 'B.Tech Computer Science',
      year: 3,
    },
    parent: {
      name: 'Mr. Sharma',
      phone: '+91 98765 00000',
      email: 'sharma.parent@email.com',
      relation: 'father',
    },
    primaryLibraryName: 'Central Library',
    tenantName: 'Central Library Network',
    membershipType: 'annual',
    membershipStatus: 'active',
    membershipStartDate: '2024-03-15',
    membershipEndDate: '2025-03-14',
    stats: {
      totalBookings: 156,
      activeBookings: 2,
      completedBookings: 145,
      cancelledBookings: 9,
      totalPayments: 12,
      totalAmountPaid: 45000,
      outstandingAmount: 0,
      attendancePercentage: 92,
      lastBookingDate: '2025-10-31',
      lastPaymentDate: '2025-10-01',
      lastAttendanceDate: '2025-10-31',
    },
    engagement: {
      studyHours: 380,
      averageSessionDuration: 180,
      favoriteLibrary: 'Central Library',
      favoriteTimeSlot: '2:00 PM - 6:00 PM',
      frequencyPerWeek: 5.5,
      lastActiveDate: '2025-10-31',
      activityScore: 88,
    },
    paymentStatus: 'paid',
    gamification: {
      points: 2850,
      level: 12,
      badges: ['Early Bird', '100 Hours', 'Perfect Week', 'Top Performer'],
      rank: 45,
      streak: 23,
    },
    referral: {
      referralCode: 'RAHUL2024',
      referredCount: 5,
      referralEarnings: 2500,
    },
    createdAt: '2024-03-15',
  };

  // Booking History
  const bookings = [
    { id: 1, bookingId: 'BK001', date: '2025-10-31', library: 'Central Library', seat: 'A-15', timeSlot: '2:00 PM - 6:00 PM', duration: 4, status: 'checked_out', amount: 300 },
    { id: 2, bookingId: 'BK002', date: '2025-10-30', library: 'Central Library', seat: 'A-15', timeSlot: '2:00 PM - 6:00 PM', duration: 4, status: 'checked_out', amount: 300 },
    { id: 3, bookingId: 'BK003', date: '2025-10-29', library: 'Central Library', seat: 'B-22', timeSlot: '10:00 AM - 2:00 PM', duration: 4, status: 'checked_out', amount: 300 },
  ];

  // Payment History
  const payments = [
    { id: 1, txnId: 'PAY001', date: '2025-10-01', amount: 5000, purpose: 'membership_fee', method: 'UPI', status: 'success', library: 'Central Library' },
    { id: 2, txnId: 'PAY002', date: '2025-09-01', amount: 5000, purpose: 'membership_fee', method: 'Card', status: 'success', library: 'Central Library' },
    { id: 3, txnId: 'PAY003', date: '2025-08-01', amount: 5000, purpose: 'membership_fee', method: 'UPI', status: 'success', library: 'Central Library' },
  ];

  // Attendance Records
  const attendance = [
    { id: 1, date: '2025-10-31', library: 'Central Library', checkIn: '2:05 PM', checkOut: '6:10 PM', duration: 245, status: 'present', method: 'qr_code' },
    { id: 2, date: '2025-10-30', library: 'Central Library', checkIn: '2:10 PM', checkOut: '6:05 PM', duration: 235, status: 'present', method: 'face_recognition' },
    { id: 3, date: '2025-10-29', library: 'Central Library', checkIn: '10:15 AM', checkOut: '2:00 PM', duration: 225, status: 'late', method: 'qr_code' },
  ];

  // Communications
  const communications = [
    { id: 1, date: '2025-10-30', channel: 'WhatsApp', type: 'reminder', subject: 'Booking Reminder', status: 'delivered' },
    { id: 2, date: '2025-10-25', channel: 'SMS', type: 'promotional', subject: 'New Features Available', status: 'delivered' },
    { id: 3, date: '2025-10-15', channel: 'Email', type: 'transactional', subject: 'Payment Receipt', status: 'read' },
  ];

  // Analytics Data
  const studyHoursTrend = [
    { month: 'Apr', hours: 45, sessions: 12 },
    { month: 'May', hours: 52, sessions: 14 },
    { month: 'Jun', hours: 48, sessions: 13 },
    { month: 'Jul', hours: 62, sessions: 16 },
    { month: 'Aug', hours: 58, sessions: 15 },
    { month: 'Sep', hours: 65, sessions: 17 },
    { month: 'Oct', hours: 50, sessions: 14 },
  ];

  const attendanceTrend = [
    { week: 'Week 1', present: 5, absent: 2, percentage: 71 },
    { week: 'Week 2', present: 6, absent: 1, percentage: 86 },
    { week: 'Week 3', present: 7, absent: 0, percentage: 100 },
    { week: 'Week 4', present: 6, absent: 1, percentage: 86 },
  ];

  const performanceByTimeSlot = [
    { slot: '6-10 AM', hours: 45, bookings: 12 },
    { slot: '10-2 PM', hours: 85, bookings: 22 },
    { slot: '2-6 PM', hours: 142, bookings: 38 },
    { slot: '6-10 PM', hours: 108, bookings: 28 },
  ];

  const libraryUsage = [
    { library: 'Central Library', visits: 89, hours: 320, percentage: 84 },
    { library: 'East Branch', visits: 32, hours: 48, percentage: 13 },
    { library: 'West Branch', visits: 8, hours: 12, percentage: 3 },
  ];

  const paymentBreakdown = [
    { category: 'Membership Fee', amount: 30000, percentage: 67 },
    { category: 'Late Charges', amount: 5000, percentage: 11 },
    { category: 'Extra Hours', amount: 8000, percentage: 18 },
    { category: 'Services', amount: 2000, percentage: 4 },
  ];

  const engagementMetrics = [
    { metric: 'Study Hours', current: 380, target: 400, percentage: 95 },
    { metric: 'Attendance', current: 92, target: 95, percentage: 97 },
    { metric: 'Bookings', current: 156, target: 150, percentage: 104 },
    { metric: 'Payments', current: 100, target: 100, percentage: 100 },
  ];

  const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {student.fullName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {student.fullName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={student.studentId} size="small" variant="outlined" />
              <Chip label={student.membershipType.toUpperCase()} color="primary" size="small" />
              <Chip label={student.membershipStatus.toUpperCase()} color="success" size="small" />
            </Stack>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Edit />}>
            Edit
          </Button>
          <Button variant="outlined" startIcon={<Send />}>
            Send Message
          </Button>
          <Button variant="outlined" color="error" startIcon={<Block />}>
            Suspend
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total Bookings
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {student.stats.totalBookings}
          </Typography>
          <Typography variant="caption" color="success.main">
            Active: {student.stats.activeBookings}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total Paid
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            ₹{student.stats.totalAmountPaid.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Outstanding: ₹{student.stats.outstandingAmount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Attendance
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {student.stats.attendancePercentage}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={student.stats.attendancePercentage}
            sx={{ mt: 1 }}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Study Hours
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {student.engagement.studyHours}h
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Avg: {student.engagement.averageSessionDuration}min/session
          </Typography>
        </Paper>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
          <Tab label="Booking History" icon={<Event />} iconPosition="start" />
          <Tab label="Payment History" icon={<Payment />} iconPosition="start" />
          <Tab label="Attendance" icon={<CheckCircle />} iconPosition="start" />
          <Tab label="Communications" icon={<Message />} iconPosition="start" />
          <Tab label="Gamification" icon={<EmojiEvents />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 1: Profile */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Personal Information
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">{student.fullName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{student.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{student.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">{student.dateOfBirth}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {student.address.street}, {student.address.city}, {student.address.state} - {student.address.zipCode}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Academic Information
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Institution
                    </Typography>
                    <Typography variant="body1">{student.education.institution}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Course
                    </Typography>
                    <Typography variant="body1">{student.education.course}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body1">Year {student.education.year}</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Membership Details
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Primary Library
                    </Typography>
                    <Typography variant="body1">{student.primaryLibraryName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Membership Type
                    </Typography>
                    <Chip label={student.membershipType.toUpperCase()} color="primary" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Validity
                    </Typography>
                    <Typography variant="body1">
                      {student.membershipStartDate} to {student.membershipEndDate}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Parent/Guardian
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{student.parent.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{student.parent.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{student.parent.email}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 2: Booking History */}
          <TabPanel value={activeTab} index={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Showing all bookings across all libraries for this student
            </Alert>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Booking ID</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell><strong>Seat</strong></TableCell>
                    <TableCell><strong>Time Slot</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking: any) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {booking.bookingId}
                        </Typography>
                      </TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.library}</TableCell>
                      <TableCell>
                        <Chip label={booking.seat} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{booking.timeSlot}</TableCell>
                      <TableCell>{booking.duration}h</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{booking.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status.replace('_', ' ').toUpperCase()}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 3: Payment History */}
          <TabPanel value={activeTab} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Transaction ID</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Purpose</strong></TableCell>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {payment.txnId}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.purpose.replace('_', ' ').toUpperCase()}</TableCell>
                      <TableCell>{payment.library}</TableCell>
                      <TableCell>
                        <Chip label={payment.method} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          ₹{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label="SUCCESS" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 4: Attendance */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ mb: 3 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold">
                    {student.stats.attendancePercentage}%
                  </Typography>
                  <Typography variant="body2">
                    Attendance Rate • {student.engagement.studyHours} total hours studied
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Library</strong></TableCell>
                    <TableCell><strong>Check-In</strong></TableCell>
                    <TableCell><strong>Check-Out</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record: any) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.library}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.duration} mins</TableCell>
                      <TableCell>
                        <Chip label={record.method.replace('_', ' ').toUpperCase()} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status.toUpperCase()}
                          color={record.status === 'present' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 5: Communications */}
          <TabPanel value={activeTab} index={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Channel</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communications.map((comm: any) => (
                    <TableRow key={comm.id} hover>
                      <TableCell>{comm.date}</TableCell>
                      <TableCell>
                        <Chip label={comm.channel} size="small" />
                      </TableCell>
                      <TableCell>{comm.type}</TableCell>
                      <TableCell>{comm.subject}</TableCell>
                      <TableCell>
                        <Chip label={comm.status.toUpperCase()} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 6: Gamification */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: 60, color: '#FFD700' }} />
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                  {student.gamification?.points || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Points
                </Typography>
              </Paper>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 60, color: '#E91E63' }} />
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                  Level {student.gamification?.level || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Level
                </Typography>
              </Paper>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 60, color: '#4CAF50' }} />
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                  {student.gamification?.streak || 0} Days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Streak
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Badges Earned
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {student.gamification?.badges.map((badge, index) => (
                  <Chip key={index} label={badge} color="primary" />
                ))}
              </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Referral Stats
              </Typography>
              <Paper sx={{ p: 3, mt: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Referral Code
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {student.referral?.referralCode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Referred Students
                    </Typography>
                    <Typography variant="h6">
                      {student.referral?.referredCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Referral Earnings
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ₹{student.referral?.referralEarnings.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 7: Analytics */}
          <TabPanel value={activeTab} index={6}>
            {/* Analytics Header */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                Comprehensive analytics and performance metrics for {student.fullName}
              </Typography>
            </Alert>

            {/* Engagement KPIs */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment /> Performance Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
              {engagementMetrics.map((metric, index) => (
                <Card key={index} sx={{ bgcolor: metric.percentage >= 100 ? 'success.50' : metric.percentage >= 90 ? 'info.50' : 'warning.50' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {metric.metric}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1 }}>
                      <Typography variant="h4" fontWeight="bold">
                        {metric.current}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        / {metric.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.percentage > 100 ? 100 : metric.percentage}
                      color={metric.percentage >= 100 ? 'success' : metric.percentage >= 90 ? 'info' : 'warning'}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color={metric.percentage >= 100 ? 'success.main' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                      {metric.percentage}% {metric.percentage >= 100 ? '✓ Target Achieved' : 'of target'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Charts Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
              {/* Study Hours Trend */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline /> Study Hours Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={studyHoursTrend}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#E91E63" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="hours" stroke="#E91E63" fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Study Hours
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {studyHoursTrend.reduce((sum, item) => sum + item.hours, 0)}h
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Avg per Month
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {Math.round(studyHoursTrend.reduce((sum, item) => sum + item.hours, 0) / studyHoursTrend.length)}h
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Attendance Trend */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle /> Weekly Attendance Pattern
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="present" fill="#4CAF50" name="Present" />
                      <Bar dataKey="absent" fill="#FF5252" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Average Attendance Rate
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {Math.round(attendanceTrend.reduce((sum, item) => sum + item.percentage, 0) / attendanceTrend.length)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Performance by Time Slot */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime /> Performance by Time Slot
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceByTimeSlot} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="slot" type="category" width={80} />
                      <RechartsTooltip />
                      <Bar dataKey="hours" fill="#2196F3" name="Study Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Preferred Time Slot
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {student.engagement.favoriteTimeSlot}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment /> Payment Breakdown
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent, payload }: PieLabelRenderProps) => {
                          const value =
                            percent != null
                              ? (percent * 100).toFixed(1)
                              : payload?.percentage != null
                              ? (payload.percentage as number).toFixed(1)
                              : '0';
                          return `${value}%`;
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {paymentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount Paid
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      ₹{student.stats.totalAmountPaid.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Library Usage Table */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalLibrary /> Library Usage Distribution
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell><strong>Library</strong></TableCell>
                        <TableCell align="right"><strong>Visits</strong></TableCell>
                        <TableCell align="right"><strong>Study Hours</strong></TableCell>
                        <TableCell align="right"><strong>Usage %</strong></TableCell>
                        <TableCell><strong>Distribution</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {libraryUsage.map((lib, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {lib.library}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={lib.visits} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {lib.hours}h
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {lib.percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={lib.percentage}
                                sx={{ flex: 1, height: 8, borderRadius: 1 }}
                                color={lib.percentage > 50 ? 'success' : 'info'}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Insights & Recommendations */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {/* Key Insights */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp /> Key Insights
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Excellent Attendance:</strong> {student.stats.attendancePercentage}% attendance rate, above platform average
                      </Typography>
                    </Alert>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Peak Performance:</strong> Most productive during {student.engagement.favoriteTimeSlot}
                      </Typography>
                    </Alert>
                    <Alert severity="success">
                      <Typography variant="body2">
                        <strong>Consistent Learner:</strong> {student.gamification.streak} days study streak
                      </Typography>
                    </Alert>
                    <Alert severity="warning">
                      <Typography variant="body2">
                        <strong>Study Goal:</strong> {400 - student.engagement.studyHours}h more to reach monthly target
                      </Typography>
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday /> Activity Summary
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Average Session Duration
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {student.engagement.averageSessionDuration} mins
                        </Typography>
                      </Box>
                      <AccessTime sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Weekly Frequency
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {student.engagement.frequencyPerWeek} days/week
                        </Typography>
                      </Box>
                      <CalendarToday sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Activity Score
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {student.engagement.activityScore}/100
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gamification Rank
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.main">
                          #{student.gamification.rank}
                        </Typography>
                      </Box>
                      <EmojiEvents sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Detailed Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 3 }}>
              {/* Booking Stats */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Booking Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {student.stats.totalBookings}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {student.stats.completedBookings}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Active
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="info.main">
                      {student.stats.activeBookings}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Cancelled
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {student.stats.cancelledBookings}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {Math.round((student.stats.completedBookings / student.stats.totalBookings) * 100)}%
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Payment Stats */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Payment Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Paid
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ₹{student.stats.totalAmountPaid.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Payments
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {student.stats.totalPayments}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color={student.stats.outstandingAmount > 0 ? 'error.main' : 'success.main'}>
                      ₹{student.stats.outstandingAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Avg per Payment
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{Math.round(student.stats.totalAmountPaid / student.stats.totalPayments).toLocaleString()}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status
                    </Typography>
                    <Chip 
                      label={student.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PENDING'} 
                      color={student.paymentStatus === 'paid' ? 'success' : 'warning'} 
                      size="small"
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* Gamification Stats */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Gamification Stats
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Points
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {student.gamification.points.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Level
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      Level {student.gamification.level}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Platform Rank
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      #{student.gamification.rank}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Streak
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {student.gamification.streak} days 🔥
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Badges Earned
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {student.gamification.badges.length}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Comparison with Peers */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp /> Performance Comparison
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Comparing with students in the same library and subscription plan
                </Alert>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'success.main' }}>
                    <Typography variant="caption" color="text.secondary">
                      Study Hours Rank
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      #12
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Top 8%
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'primary.main' }}>
                    <Typography variant="caption" color="text.secondary">
                      Attendance Rank
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      #8
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      Top 5%
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'warning.main' }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Punctuality
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      100%
                    </Typography>
                    <Typography variant="caption" color="warning.main">
                      Always on time
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, textAlign: 'center', borderLeft: 3, borderColor: 'info.main' }}>
                    <Typography variant="caption" color="text.secondary">
                      Engagement Score
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {student.engagement.activityScore}/100
                    </Typography>
                    <Typography variant="caption" color="info.main">
                      High Engagement
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDetailsPage;

