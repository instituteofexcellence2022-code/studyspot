import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  GridLegacy as Grid,
  Autocomplete,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Snackbar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Send as SendIcon,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  AutoAwesome as AutoIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Palette as PaletteIcon,
  ViewModule as TemplateIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { offlinePaymentService, Student, Staff, OfflinePayment } from '../../services/offlinePaymentService';

interface BillingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'library' | 'tuition' | 'membership' | 'custom' | 'professional';
  layout: 'modern' | 'classic' | 'minimal' | 'elegant' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  logo: {
    enabled: boolean;
    position: 'top-left' | 'top-center' | 'top-right';
    size: 'small' | 'medium' | 'large';
  };
  header: {
    showBusinessInfo: boolean;
    showContactInfo: boolean;
    showInvoiceNumber: boolean;
    showDate: boolean;
  };
  items: {
    showDescription: boolean;
    showQuantity: boolean;
    showUnitPrice: boolean;
    showTotal: boolean;
  };
  footer: {
    showTerms: boolean;
    showPaymentInfo: boolean;
    showSignature: boolean;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const OfflinePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [autoStaff, setAutoStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash' as const,
    paymentReference: '',
    notes: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [recentPayments, setRecentPayments] = useState<OfflinePayment[]>([]);
  
  // Billing Template states
  const [templates, setTemplates] = useState<BillingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BillingTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BillingTemplate | null>(null);

  // Auto-load staff and recent payments
  useEffect(() => {
    loadAutoStaff();
    loadRecentPayments();
  }, []);

  const loadAutoStaff = async () => {
    try {
      const staff = await offlinePaymentService.getAutoSelectedStaff();
      setAutoStaff(staff);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadRecentPayments = async () => {
    try {
      const payments = await offlinePaymentService.getPaymentHistory({ 
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
      });
      setRecentPayments(payments.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent payments:', error);
    }
  };

  const handleStudentSearch = async (query: string) => {
    if (query.length < 2) return;
    
    setLoading(true);
    try {
      const results = await offlinePaymentService.searchStudents(query);
      setStudents(results);
    } catch (error) {
      toast.error('Error searching students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveStep(1);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudent || !autoStaff) return;

    setLoading(true);
    try {
      const payment: Partial<OfflinePayment> = {
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentEmail: selectedStudent.email,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference,
        receivedBy: autoStaff.id,
        receivedByName: `${autoStaff.firstName} ${autoStaff.lastName}`,
        libraryId: selectedStudent.libraryId,
        status: 'pending',
        receiptNumber: offlinePaymentService.generateReceiptNumber(),
        notes: paymentData.notes,
        description: paymentData.description || `Payment received by ${autoStaff.firstName} ${autoStaff.lastName}`,
        transactionDate: paymentData.transactionDate,
      };

      const createdPayment = await offlinePaymentService.createOfflinePayment(payment);
      
      // Generate receipt
      const receiptData = await offlinePaymentService.generateReceipt(createdPayment.id);
      setReceipt(receiptData);
      setShowReceipt(true);
      setActiveStep(2);

      toast.success('Payment recorded successfully!');
    } catch (error) {
      toast.error('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAndReturn = () => {
    toast.success('Payment completed! Returning to payments...');
    setTimeout(() => {
      navigate('/payments');
    }, 1500);
  };

  const handleSendNotification = async (type: 'sms' | 'email' | 'whatsapp') => {
    if (!receipt) return;

    try {
      await offlinePaymentService.sendPaymentNotification(receipt.id, type);
      toast.success(`${type.toUpperCase()} notification sent!`);
    } catch (error) {
      toast.error(`Error sending ${type} notification`);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedStudent(null);
    setSearchQuery('');
    setPaymentData({
      amount: '',
      paymentMethod: 'cash',
      paymentReference: '',
      notes: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setReceipt(null);
    setShowReceipt(false);
  };

  const steps = [
    'Find Student',
    'Payment Details',
    'Confirmation & Receipt',
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentIcon color="primary" />
        Collect Fees & Billing Templates
        <Chip 
          label="AUTOMATED" 
          color="success" 
          size="small" 
          icon={<AutoIcon />}
          sx={{ ml: 2 }}
        />
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Collect Fees" 
            icon={<PaymentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Billing Templates" 
            icon={<TemplateIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>

      <Grid container spacing={3}>
        {/* Main Payment Flow */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Student Search */}
                <Step>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon />
                      Find Student
                      {selectedStudent && <CheckIcon color="success" />}
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Search by Name, ID, Email, or Phone"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleStudentSearch(e.target.value);
                        }}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        placeholder="Type student name, ID, email, or phone number..."
                      />
                    </Box>

                    {loading && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}

                    {students.length > 0 && (
                      <List>
                        {students.map((student) => (
                          <ListItem
                            key={student.id}
                            disablePadding
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleStudentSelect(student)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {student.firstName[0]}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={`${student.firstName} ${student.lastName}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {student.studentId} | Email: {student.email}
                                  </Typography>
                                  {student.outstandingBalance && (
                                    <Chip
                                      label={`Outstanding: ₹${student.outstandingBalance}`}
                                      color="warning"
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </StepContent>
                </Step>

                {/* Step 2: Payment Details */}
                <Step>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon />
                      Payment Details
                    </Box>
                  </StepLabel>
                  <StepContent>
                    {selectedStudent && (
                      <Box sx={{ mb: 3 }}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom>
                            Student Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Name: {selectedStudent.firstName} {selectedStudent.lastName}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Email: {selectedStudent.email}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Student ID: {selectedStudent.studentId}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Phone: {selectedStudent.phone}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Amount (₹)"
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Payment Method"
                          value={paymentData.paymentMethod}
                          onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                          SelectProps={{ native: true }}
                        >
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="check">Check</option>
                          <option value="upi">UPI</option>
                          <option value="other">Other</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Payment Reference"
                          value={paymentData.paymentReference}
                          onChange={(e) => setPaymentData({ ...paymentData, paymentReference: e.target.value })}
                          placeholder="Transaction ID, Check Number, etc."
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Transaction Date"
                          type="date"
                          value={paymentData.transactionDate}
                          onChange={(e) => setPaymentData({ ...paymentData, transactionDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Received By"
                          value={autoStaff ? `${autoStaff.firstName} ${autoStaff.lastName}` : ''}
                          disabled
                          helperText="Auto-selected staff member"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={paymentData.description}
                          onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                          placeholder="e.g., Monthly Fee - November 2025"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Additional Notes"
                          value={paymentData.notes}
                          onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                          placeholder="Any additional information..."
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handlePaymentSubmit}
                        disabled={!paymentData.amount || !paymentData.description || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                      >
                        Record Payment
                      </Button>
                      <Button onClick={() => setActiveStep(0)}>
                        Back to Search
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Confirmation & Receipt */}
                <Step>
                  <StepLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon />
                      Confirmation & Receipt
                    </Box>
                  </StepLabel>
                  <StepContent>
                    {receipt && (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Payment recorded successfully! Receipt generated.
                        </Alert>

                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Payment Receipt
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Receipt No: {receipt.receiptNumber}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(receipt.date).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Student: {receipt.studentName}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">
                                Amount: {offlinePaymentService.formatAmount(receipt.amount)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendNotification('sms')}
                          >
                            Send SMS
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendNotification('email')}
                          >
                            Send Email
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendNotification('whatsapp')}
                          >
                            Send WhatsApp
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={handleCompleteAndReturn}
                            startIcon={<CheckIcon />}
                            sx={{ 
                              background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                              }
                            }}
                          >
                            Complete & Return to Payments
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleReset}
                            startIcon={<PaymentIcon />}
                          >
                            New Payment
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() => setShowReceipt(true)}
                          >
                            View Full Receipt
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar - Staff Info & Recent Payments */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Auto-Selected Staff */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoIcon color="primary" />
                  Auto-Selected Staff
                </Typography>
                {autoStaff ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {autoStaff.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {autoStaff.firstName} {autoStaff.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {autoStaff.role}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">Loading staff...</Typography>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon />
                  Recent Payments
                </Typography>
                {recentPayments.length > 0 ? (
                  <List dense>
                    {recentPayments.map((payment) => (
                      <ListItem key={payment.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                            <PaymentIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={payment.studentName}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {offlinePaymentService.formatAmount(payment.amount)} • {payment.paymentMethod}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={payment.status}
                          size="small"
                          color={payment.status === 'completed' ? 'success' : 'warning'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No recent payments</Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {receipt && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {receipt.libraryName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {receipt.libraryAddress}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Receipt #{receipt.receiptNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(receipt.date).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Typography variant="body1">
                  <strong>Student:</strong> {receipt.studentName}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {receipt.studentEmail}
                </Typography>
                <Typography variant="body1">
                  <strong>Amount:</strong> {offlinePaymentService.formatAmount(receipt.amount)}
                </Typography>
                <Typography variant="body1">
                  <strong>Method:</strong> {receipt.paymentMethod.toUpperCase()}
                </Typography>
                <Typography variant="body1">
                  <strong>Received by:</strong> {receipt.receivedBy}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  QR Code for verification
                </Typography>
                {/* QR Code would be rendered here */}
                <Box sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'white', 
                  border: '1px solid #ccc',
                  mx: 'auto',
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  QR Code
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.print()}>
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TemplateIcon color="primary" />
                  Billing Templates
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setTemplateDialogOpen(true)}
                >
                  Create Template
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedTemplate?.id === template.id ? 2 : 1,
                        borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                        '&:hover': { boxShadow: 3 }
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" noWrap>
                            {template.name}
                          </Typography>
                          {template.isDefault && (
                            <Chip label="Default" color="primary" size="small" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={template.category} size="small" variant="outlined" />
                          <Chip label={template.layout} size="small" variant="outlined" />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              setEditingTemplate(template);
                              setTemplateDialogOpen(true);
                            }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              // Handle duplicate
                            }}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <IconButton size="small">
                            <PreviewIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {templates.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TemplateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No billing templates created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first professional invoice template
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTemplateDialogOpen(true)}
                  >
                    Create First Template
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default OfflinePaymentPage;
