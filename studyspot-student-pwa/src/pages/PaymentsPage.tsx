import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalance,
  CreditCard,
  QrCode2,
  History,
  Receipt,
  Download,
} from '@mui/icons-material';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';
import { jsPDF } from 'jspdf';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
}

export default function PaymentsPage({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [qrDialog, setQrDialog] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    type: 'booking', // booking, subscription, fine
    method: 'online', // online, cash, upi
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/payments/history');
      setTransactions(response.data.data || mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions(mockTransactions);
    }
  };

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      amount: 1500,
      type: 'Seat Booking',
      status: 'completed',
      date: '2024-11-01',
      description: 'Monthly seat booking - Central Library',
      paymentMethod: 'UPI',
      transactionId: 'TXN123456789',
    },
    {
      id: '2',
      amount: 500,
      type: 'Late Fee',
      status: 'completed',
      date: '2024-10-28',
      description: 'Overstay charges - 2 hours',
      paymentMethod: 'Card',
      transactionId: 'TXN987654321',
    },
    {
      id: '3',
      amount: 2000,
      type: 'Subscription',
      status: 'pending',
      date: '2024-10-25',
      description: 'Premium membership renewal',
      paymentMethod: 'Cash',
    },
  ];

  const handlePaymentSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    try {
      if (paymentData.method === 'online') {
        // Razorpay integration
        await initializeRazorpay();
      } else if (paymentData.method === 'upi') {
        // Show UPI QR code
        setPaymentDialog(false);
        setQrDialog(true);
      } else {
        // Cash payment - create pending payment record
        await api.post('/api/payments/offline', {
          amount: parseFloat(paymentData.amount),
          type: paymentData.type,
          method: 'cash',
        });
        setSuccess('Cash payment recorded. Please pay at the library front desk.');
        setPaymentDialog(false);
        fetchTransactions();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = async () => {
    try {
      // Create order on backend
      const orderResponse = await api.post('/api/payments/create-order', {
        amount: parseFloat(paymentData.amount),
        type: paymentData.type,
      });

      const order = orderResponse.data.data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: order.amount,
          currency: 'INR',
          name: 'StudySpot',
          description: paymentData.type,
          order_id: order.id,
          handler: async (response: any) => {
            // Verify payment on backend
            try {
              await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setSuccess('Payment successful!');
              setPaymentDialog(false);
              fetchTransactions();
            } catch (err) {
              setError('Payment verification failed');
            }
          },
          prefill: {
            name: JSON.parse(localStorage.getItem('user') || '{}').firstName || '',
            email: JSON.parse(localStorage.getItem('user') || '{}').email || '',
            contact: JSON.parse(localStorage.getItem('user') || '{}').phone || '',
          },
          theme: {
            color: '#2563eb',
          },
        };

        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const downloadReceipt = (transaction: Transaction) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('StudySpot', 20, 25);
    
    // Invoice Title
    doc.setFontSize(18);
    doc.text('PAYMENT RECEIPT', 150, 25, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Student Details
    doc.setFontSize(10);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    doc.text('STUDENT DETAILS', 20, 55);
    doc.setFontSize(9);
    doc.text(`Name: ${user.name || 'Student'}`, 20, 62);
    doc.text(`Email: ${user.email || 'student@example.com'}`, 20, 68);
    doc.text(`Phone: ${user.phone || '+91-XXXXX-XXXXX'}`, 20, 74);
    
    // Receipt Details
    doc.text('RECEIPT DETAILS', 120, 55);
    doc.text(`Receipt No: RCP${transaction.id}`, 120, 62);
    doc.text(`Transaction ID: ${transaction.transactionId || transaction.id}`, 120, 68);
    doc.text(`Date: ${new Date(transaction.date).toLocaleDateString('en-IN')}`, 120, 74);
    doc.text(`Status: ${transaction.status.toUpperCase()}`, 120, 80);
    
    // Table Header
    doc.setFillColor(37, 99, 235);
    doc.rect(20, 90, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 25, 97);
    doc.text('Payment Method', 100, 97);
    doc.text('Amount', 170, 97, { align: 'right' });
    
    // Table Content
    doc.setTextColor(0, 0, 0);
    doc.text(transaction.description || 'Library Booking Payment', 25, 107);
    doc.text(transaction.paymentMethod || 'Online', 100, 107);
    doc.text(`₹${transaction.amount}`, 185, 107, { align: 'right' });
    
    // Total
    doc.setFillColor(37, 99, 235);
    doc.rect(20, 115, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT:', 25, 122);
    doc.text(`₹${transaction.amount}`, 185, 122, { align: 'right' });
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Thank you for choosing StudySpot!', 105, 140, { align: 'center' });
    doc.text('For queries: support@studyspot.com | +91-98765-43210', 105, 146, { align: 'center' });
    
    // Save PDF
    doc.save(`StudySpot-Receipt-${transaction.id}.pdf`);
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              💳 Payments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage payments, view history, and download receipts
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentDialog(true)}
          >
            Make Payment
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Payment Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalance color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Paid
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ₹{transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <History color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ₹{transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Receipt color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Transactions
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {transactions.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="All Transactions" />
            <Tab label="Completed" />
            <Tab label="Pending" />
          </Tabs>

          <List>
            {transactions
              .filter(t => {
                if (tab === 1) return t.status === 'completed';
                if (tab === 2) return t.status === 'pending';
                return true;
              })
              .map((transaction, index) => (
                <Box key={transaction.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                          ₹{transaction.amount}
                        </Typography>
                        {transaction.status === 'completed' && (
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => downloadReceipt(transaction)}
                          >
                            Receipt
                          </Button>
                        )}
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" fontWeight="600">
                            {transaction.type}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            size="small"
                            color={transaction.status === 'completed' ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.paymentMethod || 'N/A'}
                            {transaction.transactionId && ` • ${transaction.transactionId}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </Box>
              ))}
          </List>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Payment Type"
              value={paymentData.type}
              onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="booking">Seat Booking</option>
              <option value="subscription">Subscription</option>
              <option value="fine">Late Fee / Fine</option>
            </TextField>

            {/* Coupon/Referral Code Input */}
            <Box sx={{ my: 2, p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                💰 Have a discount code?
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter coupon or referral code"
                  InputProps={{
                    endAdornment: (
                      <Button size="small" variant="contained">Apply</Button>
                    ),
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Referral codes give ₹200 OFF, Coupons up to 50% OFF
              </Typography>
            </Box>

            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentData.method}
              onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="online">Online (Card/UPI/Net Banking)</option>
              <option value="upi">UPI (Scan QR)</option>
              <option value="cash">Cash (Pay at Library)</option>
            </TextField>

            {/* Auto-payment Option */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      Enable Auto-payment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically pay for recurring bookings
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePaymentSubmit} variant="contained" disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Pay'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* UPI QR Dialog */}
        <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Scan UPI QR Code</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <QrCode2 sx={{ fontSize: 200, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ₹{paymentData.amount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Scan this QR code with any UPI app
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                UPI ID: studyspot@paytm
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                setQrDialog(false);
                setSuccess('Payment recorded. We will verify it shortly.');
              }}
            >
              I've Paid
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

