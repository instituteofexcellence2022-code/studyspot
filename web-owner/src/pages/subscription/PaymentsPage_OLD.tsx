import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  Money as CashIcon,
} from '@mui/icons-material';
import { GridLegacy as Grid } from '@mui/material';

// Mock payments data
const MOCK_PAYMENTS = [
  {
    id: 1,
    studentName: 'Rajesh Kumar',
    amount: 5000,
    method: 'cash',
    plan: 'Monthly Premium',
    status: 'completed',
    date: '2025-10-23',
    receipt: 'RCP001',
  },
  {
    id: 2,
    studentName: 'Priya Sharma',
    amount: 1500,
    method: 'online',
    plan: 'Weekly Plan',
    status: 'completed',
    date: '2025-10-23',
    receipt: 'RCP002',
  },
  {
    id: 3,
    studentName: 'Amit Patel',
    amount: 300,
    method: 'cash',
    plan: 'Daily Plan',
    status: 'pending',
    date: '2025-10-22',
    receipt: '-',
  },
];

interface Payment {
  id: number;
  studentName: string;
  amount: number;
  method: string;
  plan: string;
  status: string;
  date: string;
  receipt: string;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    studentName: '',
    amount: 0,
    method: 'cash',
    plan: '',
  });

  const handleRecordPayment = () => {
    const payment: Payment = {
      id: payments.length + 1,
      studentName: newPayment.studentName,
      amount: newPayment.amount,
      method: newPayment.method,
      plan: newPayment.plan,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      receipt: `RCP${String(payments.length + 1).padStart(3, '0')}`,
    };
    setPayments([...payments, payment]);
    setDialogOpen(false);
    setNewPayment({
      studentName: '',
      amount: 0,
      method: 'cash',
      plan: '',
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'success';
      case 'online':
        return 'info';
      case 'bank':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'success' : 'warning';
  };

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = payments
    .filter(p => p.date === new Date().toISOString().split('T')[0])
    .reduce((sum, p) => sum + p.amount, 0);
  const cashPayments = payments.filter(p => p.method === 'cash').length;
  const onlinePayments = payments.filter(p => p.method === 'online').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Payments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Record Payment
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PaymentIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                ₹{totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CashIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Today's Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ₹{todayRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CashIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Cash Payments
                </Typography>
              </Box>
              <Typography variant="h4">{cashPayments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BankIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Online Payments
                </Typography>
              </Box>
              <Typography variant="h4">{onlinePayments}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Chip label={payment.receipt} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{payment.studentName}</TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ₹{payment.amount.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.method}
                    size="small"
                    color={getMethodColor(payment.method) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    size="small"
                    color={getStatusColor(payment.status) as any}
                  />
                </TableCell>
                <TableCell>{payment.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Cash Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Student Name"
              value={newPayment.studentName}
              onChange={(e) => setNewPayment({ ...newPayment, studentName: e.target.value })}
              placeholder="e.g., Rajesh Kumar"
              fullWidth
              required
            />
            <TextField
              select
              label="Plan"
              value={newPayment.plan}
              onChange={(e) => setNewPayment({ ...newPayment, plan: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="Hourly Plan">Hourly Plan - ₹50</MenuItem>
              <MenuItem value="Daily Plan">Daily Plan - ₹300</MenuItem>
              <MenuItem value="Weekly Plan">Weekly Plan - ₹1500</MenuItem>
              <MenuItem value="Monthly Premium">Monthly Premium - ₹5000</MenuItem>
            </TextField>
            <TextField
              label="Amount (₹)"
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              select
              label="Payment Method"
              value={newPayment.method}
              onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
              fullWidth
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
            </TextField>
            <Divider />
            <Typography variant="caption" color="text.secondary">
              Receipt number will be auto-generated
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
            disabled={!newPayment.studentName || !newPayment.plan || !newPayment.amount}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsPage;

