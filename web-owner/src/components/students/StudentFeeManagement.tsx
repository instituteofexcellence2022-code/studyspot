import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Rating,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Money as MoneyIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingFlat as TrendingFlatIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  AutoAwesome as AutoAwesomeIcon,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: string;
  currentPlan?: string;
  feeStatus?: string;
}

interface FeePlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  duration: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  features: string[];
  isActive: boolean;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  feePlanId: string;
  feePlanName: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reminders: {
    id: string;
    sentAt: string;
    type: 'email' | 'sms' | 'whatsapp';
    status: 'sent' | 'delivered' | 'failed';
  }[];
}

interface FeeReminder {
  id: string;
  studentId: string;
  paymentId: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push';
  message: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'delivered' | 'failed';
  createdBy: string;
}

interface StudentFeeManagementProps {
  students: Student[];
  onPaymentUpdate: (payment: Payment) => void;
}

const StudentFeeManagement: React.FC<StudentFeeManagementProps> = ({
  students,
  onPaymentUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [reminders, setReminders] = useState<FeeReminder[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  // Mock data for demonstration
  useEffect(() => {
    const mockFeePlans: FeePlan[] = [
      {
        id: '1',
        name: 'Monthly Plan',
        description: 'Monthly subscription for library access',
        amount: 500,
        duration: '1 month',
        type: 'monthly',
        features: ['Library Access', 'WiFi', 'Study Materials'],
        isActive: true,
      },
      {
        id: '2',
        name: 'Quarterly Plan',
        description: '3-month subscription with discount',
        amount: 1350,
        duration: '3 months',
        type: 'quarterly',
        features: ['Library Access', 'WiFi', 'Study Materials', '10% Discount'],
        isActive: true,
      },
      {
        id: '3',
        name: 'Yearly Plan',
        description: 'Annual subscription with maximum savings',
        amount: 5000,
        duration: '12 months',
        type: 'yearly',
        features: ['Library Access', 'WiFi', 'Study Materials', '20% Discount', 'Priority Support'],
        isActive: true,
      },
    ];

    const mockPayments: Payment[] = [
      {
        id: '1',
        studentId: 'STU001',
        studentName: 'John Doe',
        feePlanId: '1',
        feePlanName: 'Monthly Plan',
        amount: 500,
        paidAmount: 500,
        dueDate: '2024-02-15',
        paidDate: '2024-01-15',
        status: 'paid',
        paymentMethod: 'Online',
        transactionId: 'TXN123456',
        notes: 'Payment received on time',
        createdBy: 'Admin',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        reminders: [],
      },
      {
        id: '2',
        studentId: 'STU002',
        studentName: 'Jane Smith',
        feePlanId: '1',
        feePlanName: 'Monthly Plan',
        amount: 500,
        paidAmount: 0,
        dueDate: '2024-02-10',
        status: 'overdue',
        createdBy: 'Admin',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        reminders: [
          {
            id: '1',
            sentAt: '2024-02-05T10:00:00Z',
            type: 'email',
            status: 'sent',
          },
          {
            id: '2',
            sentAt: '2024-02-08T10:00:00Z',
            type: 'sms',
            status: 'delivered',
          },
        ],
      },
    ];

    const mockReminders: FeeReminder[] = [
      {
        id: '1',
        studentId: 'STU002',
        paymentId: '2',
        type: 'email',
        message: 'Your monthly fee payment is due on 2024-02-10. Please make payment to avoid service interruption.',
        scheduledAt: '2024-02-12T10:00:00Z',
        sentAt: '2024-02-12T10:00:00Z',
        status: 'sent',
        createdBy: 'System',
      },
    ];

    setFeePlans(mockFeePlans);
    setPayments(mockPayments);
    setReminders(mockReminders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'partial': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'overdue': return <ErrorIcon />;
      case 'partial': return <WarningIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <InfoIcon />;
    }
  };

  const handlePaymentUpdate = async (paymentId: string, updates: Partial<Payment>) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { ...payment, ...updates, updatedAt: new Date().toISOString() }
        : payment
    ));
    
    setSnackbar({ open: true, message: '✅ Payment updated successfully!', severity: 'success' });
    setLoading(false);
  };

  const handleSendReminder = async (paymentId: string, type: string) => {
    setLoading(true);
    // Simulate sending reminder
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const newReminder = {
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
        type: type as any,
        status: 'sent' as any,
      };
      
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, reminders: [...p.reminders, newReminder] }
          : p
      ));
    }
    
    setSnackbar({ open: true, message: `✅ Reminder sent via ${type}!`, severity: 'success' });
    setLoading(false);
  };

  const filteredPayments = payments.filter(payment => {
    if (selectedStudent && payment.studentId !== selectedStudent) return false;
    if (selectedStatus && payment.status !== selectedStatus) return false;
    return true;
  });

  const getFeeStats = () => {
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === 'paid').length;
    const overduePayments = payments.filter(p => p.status === 'overdue').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paidAmount, 0);
    const pendingRevenue = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalPayments,
      paidPayments,
      overduePayments,
      pendingPayments,
      totalRevenue,
      pendingRevenue,
      collectionRate: totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0,
    };
  };

  const stats = getFeeStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon color="primary" />
          Student Fee Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPaymentDialogOpen(true)}>
            Add Payment
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collected amount
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
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
                    Pending Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    ₹{stats.pendingRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Awaiting collection
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
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
                    Overdue Payments
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.overduePayments}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Need immediate attention
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
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
                    Collection Rate
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats.collectionRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Success rate
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Payment Management" icon={<PaymentIcon />} />
          <Tab label="Fee Plans" icon={<ReceiptIcon />} />
          <Tab label="Reminders & Notifications" icon={<NotificationsIcon />} />
          <Tab label="Analytics & Reports" icon={<AssessmentIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Student</InputLabel>
                <Select
                  value={selectedStudent}
                  label="Student"
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" startIcon={<SearchIcon />}>
                Search
              </Button>
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Advanced Filters
              </Button>
            </Box>
          </Paper>

          {/* Payments Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Fee Plan</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reminders</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {payment.studentName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.studentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {payment.studentId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.feePlanName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{payment.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color={payment.paidAmount > 0 ? 'success.main' : 'text.secondary'}>
                          ₹{payment.paidAmount.toLocaleString()}
                        </Typography>
                        {payment.paidAmount < payment.amount && payment.paidAmount > 0 && (
                          <Typography variant="caption" color="warning.main">
                            Partial
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </Typography>
                        {new Date(payment.dueDate) < new Date() && payment.status !== 'paid' && (
                          <Typography variant="caption" color="error.main">
                            Overdue
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(payment.status)}
                          label={payment.status.toUpperCase()}
                          color={getStatusColor(payment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {payment.reminders.map((reminder, index) => (
                            <Tooltip key={index} title={`${reminder.type.toUpperCase()} - ${reminder.status}`}>
                              <Chip
                                label={reminder.type.toUpperCase()}
                                size="small"
                                color={reminder.status === 'sent' ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => { setCurrentPayment(payment); setPaymentDialogOpen(true); }}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Reminder">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleSendReminder(payment.id, 'email')}
                              disabled={payment.status === 'paid'}
                            >
                              <SendIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Paid">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handlePaymentUpdate(payment.id, { 
                                status: 'paid', 
                                paidAmount: payment.amount,
                                paidDate: new Date().toISOString(),
                                paymentMethod: 'Manual',
                                transactionId: 'MAN' + Date.now()
                              })}
                              disabled={payment.status === 'paid'}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Fee Plans</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {feePlans.map((plan) => (
              <Card key={plan.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{plan.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {plan.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {plan.features.map((feature, index) => (
                          <Chip key={index} label={feature} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        ₹{plan.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.duration}
                      </Typography>
                      <Chip 
                        label={plan.type.toUpperCase()} 
                        size="small" 
                        color={plan.isActive ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Reminders & Notifications</Typography>
          <Alert severity="info">
            Automated reminder system and notification management would be displayed here with scheduling and delivery tracking.
          </Alert>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Analytics & Reports</Typography>
          <Alert severity="info">
            Comprehensive fee analytics, payment trends, and financial reports would be displayed here.
          </Alert>
        </Box>
      )}

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Payment Details</Typography>
            <IconButton onClick={() => setPaymentDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentPayment && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Payment details and management interface would be displayed here.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Student: {currentPayment.studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: ₹{currentPayment.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {currentPayment.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PaymentIcon />}>
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentFeeManagement;











