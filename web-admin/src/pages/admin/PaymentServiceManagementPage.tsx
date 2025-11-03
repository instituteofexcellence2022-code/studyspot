/**
 * Payment Service Management Page
 * Comprehensive payment service monitoring and configuration
 * 
 * Features:
 * - Payment Processing
 * - Transaction Management
 * - Refund Processing
 * - Payment Gateway Integration
 * - Subscription Management
 * - Invoice Generation
 * - Financial Analytics
 * - Fraud Detection
 */

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  Memory as MemoryIcon,
  Pause as PauseIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Receipt as ReceiptIcon,
  ReceiptLong as ReceiptLongIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
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
  ResponsiveContainer
} from 'recharts';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash';
  gateway: 'stripe' | 'razorpay' | 'paypal' | 'payu' | 'cash';
  transactionId?: string;
  gatewayTransactionId?: string;
  description: string;
  metadata: any;
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  fees: number;
  netAmount: number;
}

interface Transaction {
  id: string;
  paymentId: string;
  type: 'payment' | 'refund' | 'chargeback' | 'dispute';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  gateway: string;
  gatewayTransactionId: string;
  description: string;
  createdAt: string;
  processedAt?: string;
  fees: number;
  netAmount: number;
}

interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: string;
  processedAt?: string;
  gatewayRefundId?: string;
  notes?: string;
}

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'past_due';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  lastPaymentDate?: string;
  paymentMethod: string;
  autoRenew: boolean;
  createdAt: string;
}

interface Invoice {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
  notes?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'razorpay' | 'paypal' | 'payu' | 'cash';
  status: 'active' | 'inactive' | 'maintenance';
  isDefault: boolean;
  configuration: any;
  fees: GatewayFees;
  supportedMethods: string[];
  createdAt: string;
  lastUsed?: string;
}

interface GatewayFees {
  percentage: number;
  fixed: number;
  minimum: number;
  maximum: number;
}

const PaymentServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'p1',
      userId: 'u1',
      userName: 'John Smith',
      amount: 25.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      gateway: 'stripe',
      transactionId: 'txn_123456789',
      gatewayTransactionId: 'pi_1234567890',
      description: 'Library seat booking - 2 hours',
      metadata: { bookingId: 'b123', seatNumber: 'A5', duration: 2 },
      createdAt: '2025-10-27 14:20:00',
      processedAt: '2025-10-27 14:20:05',
      fees: 0.75,
      netAmount: 24.25},
    {
      id: 'p2',
      userId: 'u2',
      userName: 'Sarah Johnson',
      amount: 50.00,
      currency: 'USD',
      status: 'processing',
      paymentMethod: 'upi',
      gateway: 'razorpay',
      transactionId: 'txn_987654321',
      description: 'Monthly subscription - Premium Plan',
      metadata: { subscriptionId: 'sub_456', planType: 'premium' },
      createdAt: '2025-10-27 14:15:00',
      fees: 1.50,
      netAmount: 48.50},
    {
      id: 'p3',
      userId: 'u3',
      userName: 'Mike Wilson',
      amount: 15.00,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'card',
      gateway: 'stripe',
      transactionId: 'txn_456789123',
      description: 'Library seat booking - 1 hour',
      metadata: { bookingId: 'b789', seatNumber: 'B3', duration: 1 },
      createdAt: '2025-10-27 14:10:00',
      fees: 0.45,
      netAmount: 14.55},
    {
      id: 'p4',
      userId: 'u4',
      userName: 'Emily Davis',
      amount: 30.00,
      currency: 'USD',
      status: 'refunded',
      paymentMethod: 'card',
      gateway: 'stripe',
      transactionId: 'txn_789123456',
      gatewayTransactionId: 'pi_7891234560',
      description: 'Library seat booking - 3 hours',
      metadata: { bookingId: 'b456', seatNumber: 'C7', duration: 3 },
      createdAt: '2025-10-27 13:30:00',
      processedAt: '2025-10-27 13:30:05',
      refundedAt: '2025-10-27 15:00:00',
      refundAmount: 30.00,
      fees: 0.90,
      netAmount: 29.10},
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 't1',
      paymentId: 'p1',
      type: 'payment',
      amount: 25.00,
      currency: 'USD',
      status: 'completed',
      gateway: 'stripe',
      gatewayTransactionId: 'pi_1234567890',
      description: 'Payment processed successfully',
      createdAt: '2025-10-27 14:20:00',
      processedAt: '2025-10-27 14:20:05',
      fees: 0.75,
      netAmount: 24.25},
    {
      id: 't2',
      paymentId: 'p4',
      type: 'refund',
      amount: 30.00,
      currency: 'USD',
      status: 'completed',
      gateway: 'stripe',
      gatewayTransactionId: 're_1234567890',
      description: 'Refund processed successfully',
      createdAt: '2025-10-27 15:00:00',
      processedAt: '2025-10-27 15:00:10',
      fees: 0.00,
      netAmount: 30.00},
  ]);

  const [refunds, setRefunds] = useState<Refund[]>([
    {
      id: 'r1',
      paymentId: 'p4',
      amount: 30.00,
      currency: 'USD',
      reason: 'Customer requested cancellation',
      status: 'completed',
      requestedBy: 'u4',
      requestedAt: '2025-10-27 14:45:00',
      processedAt: '2025-10-27 15:00:00',
      gatewayRefundId: 're_1234567890',
      notes: 'Customer cancelled booking due to emergency'},
    {
      id: 'r2',
      paymentId: 'p2',
      amount: 50.00,
      currency: 'USD',
      reason: 'Service not provided',
      status: 'pending',
      requestedBy: 'u2',
      requestedAt: '2025-10-27 16:00:00',
      notes: 'Payment failed but amount was charged'},
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 's1',
      userId: 'u1',
      userName: 'John Smith',
      planId: 'plan_premium',
      planName: 'Premium Plan',
      status: 'active',
      amount: 50.00,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2025-10-01',
      endDate: '2025-11-01',
      nextBillingDate: '2025-11-01',
      lastPaymentDate: '2025-10-01',
      paymentMethod: 'card_1234',
      autoRenew: true,
      createdAt: '2025-10-01'},
    {
      id: 's2',
      userId: 'u2',
      userName: 'Sarah Johnson',
      planId: 'plan_basic',
      planName: 'Basic Plan',
      status: 'past_due',
      amount: 25.00,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2025-09-01',
      endDate: '2025-10-01',
      nextBillingDate: '2025-10-01',
      lastPaymentDate: '2025-09-01',
      paymentMethod: 'upi_5678',
      autoRenew: true,
      createdAt: '2025-09-01'},
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv1',
      userId: 'u1',
      userName: 'John Smith',
      amount: 50.00,
      currency: 'USD',
      status: 'paid',
      dueDate: '2025-11-01',
      issuedDate: '2025-10-01',
      paidDate: '2025-10-01',
      items: [
        { description: 'Premium Plan - Monthly', quantity: 1, unitPrice: 50.00, total: 50.00 },
      ],
      subtotal: 50.00,
      tax: 0.00,
      total: 50.00,
      paymentTerms: 'Net 30'},
    {
      id: 'inv2',
      userId: 'u2',
      userName: 'Sarah Johnson',
      amount: 25.00,
      currency: 'USD',
      status: 'overdue',
      dueDate: '2025-10-01',
      issuedDate: '2025-09-01',
      items: [
        { description: 'Basic Plan - Monthly', quantity: 1, unitPrice: 25.00, total: 25.00 },
      ],
      subtotal: 25.00,
      tax: 0.00,
      total: 25.00,
      paymentTerms: 'Net 30'},
  ]);

  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'gw1',
      name: 'Stripe',
      type: 'stripe',
      status: 'active',
      isDefault: true,
      configuration: { apiKey: 'sk_test_...', webhookSecret: 'whsec_...' },
      fees: { percentage: 2.9, fixed: 0.30, minimum: 0.50, maximum: 100.00 },
      supportedMethods: ['card', 'bank_transfer'],
      createdAt: '2025-10-01',
      lastUsed: '2025-10-27 14:20:00'},
    {
      id: 'gw2',
      name: 'Razorpay',
      type: 'razorpay',
      status: 'active',
      isDefault: false,
      configuration: { keyId: 'rzp_test_...', keySecret: 'secret_...' },
      fees: { percentage: 2.0, fixed: 0.00, minimum: 1.00, maximum: 50.00 },
      supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
      createdAt: '2025-10-01',
      lastUsed: '2025-10-27 14:15:00'},
  ]);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [refundDetailsOpen, setRefundDetailsOpen] = useState(false);
  const [subscriptionDetailsOpen, setSubscriptionDetailsOpen] = useState(false);
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
  const [gatewayDetailsOpen, setGatewayDetailsOpen] = useState(false);
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);

  // Mock data for charts
  const paymentVolumeData = [
    { time: '00:00', amount: 1200, count: 15 },
    { time: '04:00', amount: 800, count: 10 },
    { time: '08:00', amount: 2500, count: 25 },
    { time: '12:00', amount: 3200, count: 32 },
    { time: '16:00', amount: 2800, count: 28 },
    { time: '20:00', amount: 1800, count: 18 },
  ];

  const paymentMethodData = [
    { method: 'Card', amount: 4500, count: 45, color: '#6366f1' },
    { method: 'UPI', amount: 3200, count: 32, color: '#16a34a' },
    { method: 'Net Banking', amount: 1800, count: 18, color: '#d97706' },
    { method: 'Wallet', amount: 1200, count: 12, color: '#dc2626' },
    { method: 'Cash', amount: 800, count: 8, color: '#6b7280' },
  ];

  const gatewayPerformanceData = [
    { gateway: 'Stripe', successRate: 98.5, avgTime: 2.3, volume: 4500 },
    { gateway: 'Razorpay', successRate: 96.8, avgTime: 3.1, volume: 3200 },
    { gateway: 'PayPal', successRate: 94.2, avgTime: 4.5, volume: 1800 },
  ];

  const revenueTrendData = [
    { day: 'Mon', revenue: 1200, transactions: 15 },
    { day: 'Tue', revenue: 1500, transactions: 18 },
    { day: 'Wed', revenue: 1800, transactions: 22 },
    { day: 'Thu', revenue: 2100, transactions: 25 },
    { day: 'Fri', revenue: 2400, transactions: 28 },
    { day: 'Sat', revenue: 1600, transactions: 20 },
    { day: 'Sun', revenue: 1300, transactions: 16 },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'paid': return '#16a34a';
      case 'active': return '#16a34a';
      case 'processing': return '#d97706';
      case 'pending': return '#d97706';
      case 'sent': return '#6366f1';
      case 'failed': return '#dc2626';
      case 'cancelled': return '#6b7280';
      case 'refunded': return '#8b5cf6';
      case 'overdue': return '#dc2626';
      case 'past_due': return '#dc2626';
      case 'inactive': return '#6b7280';
      case 'expired': return '#6b7280';
      case 'draft': return '#6b7280';
      case 'maintenance': return '#d97706';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'paid': return <CheckIcon />;
      case 'active': return <CheckIcon />;
      case 'processing': return <PlayIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'sent': return <SendIcon />;
      case 'failed': return <ErrorIcon />;
      case 'cancelled': return <StopIcon />;
      case 'refunded': return <ReceiptIcon />;
      case 'overdue': return <WarningIcon />;
      case 'past_due': return <WarningIcon />;
      case 'inactive': return <ErrorIcon />;
      case 'expired': return <ErrorIcon />;
      case 'draft': return <EditIcon />;
      case 'maintenance': return <WarningIcon />;
      default: return <ErrorIcon />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCardIcon />;
      case 'upi': return <PaymentIcon />;
      case 'netbanking': return <AccountBalanceIcon />;
      case 'wallet': return <WalletIcon />;
      case 'cash': return <MoneyIcon />;
      default: return <PaymentIcon />;
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentDetailsOpen(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsOpen(true);
  };

  const handleRefundClick = (refund: Refund) => {
    setSelectedRefund(refund);
    setRefundDetailsOpen(true);
  };

  const handleSubscriptionClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setSubscriptionDetailsOpen(true);
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDetailsOpen(true);
  };

  const handleGatewayClick = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setGatewayDetailsOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = () => {
    console.log('Refreshing payment service data...');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Payment Service Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor payments, transactions, refunds, and financial analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreatePaymentOpen(true)}
          >
            Process Payment
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Revenue</Typography>
                  <Typography variant="h4" color="primary">
                    ${payments.filter((p: any) => p.status === 'completed').reduce((acc, p) => acc + p.netAmount, 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#16a34a', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {Math.round(payments.filter((p: any) => p.status === 'completed').length / payments.length * 100)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.round(payments.filter((p: any) => p.status === 'completed').length / payments.length * 100)}
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', mr: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Pending Refunds</Typography>
                  <Typography variant="h4" color="warning.main">
                    {refunds.filter((r: any) => r.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {refunds.length} refunds
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#dc2626', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Gateways</Typography>
                  <Typography variant="h4" color="error.main">
                    {gateways.filter((g: any) => g.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {gateways.length} gateways
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Payments" />
          <Tab label="Transactions" />
          <Tab label="Refunds" />
          <Tab label="Subscriptions" />
          <Tab label="Invoices" />
          <Tab label="Gateways" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Payments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Gateway</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {payment.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {payment.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {payment.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Net: ${payment.netAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: getStatusColor(payment.paymentMethod) }}>
                            {getMethodIcon(payment.paymentMethod)}
                          </Avatar>
                          <Typography variant="body2">
                            {payment.paymentMethod.toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{payment.gateway}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(payment.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{payment.createdAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handlePaymentClick(payment)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          {payment.status === 'completed' && (
                            <IconButton size="small" color="warning">
                              <ReceiptIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Gateway</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${transaction.amount.toFixed(2)} {transaction.currency}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Net: ${transaction.netAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.gateway}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(transaction.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{transaction.createdAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleTransactionClick(transaction)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Refund Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>{refund.paymentId}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${refund.amount.toFixed(2)} {refund.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>{refund.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={refund.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(refund.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{refund.requestedAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleRefundClick(refund)}>
                            <ViewIcon />
                          </IconButton>
                          {refund.status === 'pending' && (
                            <IconButton size="small" color="primary">
                              <CheckIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Subscriptions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Next Billing</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {subscription.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {subscription.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {subscription.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {subscription.planName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {subscription.billingCycle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${subscription.amount.toFixed(2)} {subscription.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(subscription.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{subscription.nextBillingDate || 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleSubscriptionClick(subscription)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          {subscription.status === 'active' && (
                            <IconButton size="small" color="error">
                              <PauseIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Invoice Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {invoice.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {invoice.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {invoice.userId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${invoice.total.toFixed(2)} {invoice.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(invoice.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleInvoiceClick(invoice)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 5 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {gateways.map((gateway) => (
            <Box sx={{ flex: '1 1 350px', minWidth: 350 }} key={gateway.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4}}}
                onClick={() => handleGatewayClick(gateway)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(gateway.status), mr: 2 }}>
                      <PaymentIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{gateway.name}</Typography>
                      <Chip
                        label={gateway.type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Status: {gateway.status} {gateway.isDefault && '• Default'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fees: {gateway.fees.percentage}% + ${gateway.fees.fixed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Methods: {gateway.supportedMethods.length}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Used: {gateway.lastUsed || 'Never'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {gateway.createdAt}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <SettingsIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 6 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Volume (24h)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={paymentVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stackId="2"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Methods
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gateway Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gatewayPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gateway" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="successRate" fill="#16a34a" name="Success Rate (%)" />
                    <Bar dataKey="avgTime" fill="#d97706" name="Avg Time (s)" />
                    <Bar dataKey="volume" fill="#6366f1" name="Volume ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trend (7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Payment Details Dialog */}
      <Dialog
        open={paymentDetailsOpen}
        onClose={() => setPaymentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payment Details - {selectedPayment?.id}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedPayment.status}
                    sx={{
                      bgcolor: getStatusColor(selectedPayment.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6">
                    ${selectedPayment.amount.toFixed(2)} {selectedPayment.currency}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="h6">
                    {selectedPayment.paymentMethod.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gateway
                  </Typography>
                  <Typography variant="h6">
                    {selectedPayment.gateway}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.userName} ({selectedPayment.userId})
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.transactionId || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gateway Transaction ID
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.gatewayTransactionId || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.createdAt}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Financial Details
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gross Amount
                  </Typography>
                  <Typography variant="h6">
                    ${selectedPayment.amount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fees
                  </Typography>
                  <Typography variant="h6">
                    ${selectedPayment.fees.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Net Amount
                  </Typography>
                  <Typography variant="h6">
                    ${selectedPayment.netAmount.toFixed(2)}
                  </Typography>
                </Box>
                {selectedPayment.refundAmount && (
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Refunded Amount
                    </Typography>
                    <Typography variant="h6">
                      ${selectedPayment.refundAmount.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedPayment.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="body2" fontFamily="monospace">
                  {JSON.stringify(selectedPayment.metadata, null, 2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDetailsOpen(false)}>
            Close
          </Button>
          {selectedPayment && selectedPayment.status === 'completed' && (
            <Button variant="contained" color="warning">
              Process Refund
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Payment Dialog */}
      <Dialog
        open={createPaymentOpen}
        onClose={() => setCreatePaymentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Process New Payment
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="User ID"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Amount"
              fullWidth
              variant="outlined"
              type="number"
            />
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select label="Currency">
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="INR">INR</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select label="Payment Method">
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="netbanking">Net Banking</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Gateway</InputLabel>
              <Select label="Gateway">
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="payu">PayU</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePaymentOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentServiceManagement;
