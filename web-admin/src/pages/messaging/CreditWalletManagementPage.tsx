import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  Tabs,
  Tab,
  Avatar,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  CardContent,
  Paper
} from '@mui/material';
/**
 * Credit Wallet Management Page
 * 
 * Features:
 * - Credit wallet management for messaging costs
 * - Usage tracking and billing
 * - Credit allocation and distribution
 * - Payment processing and top-ups
 * - Usage analytics and reporting
 * - Credit alerts and notifications
 */

import React, { useState, useEffect } from 'react';
import { AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  CreditCard as CreditCardIcon,
  DataUsage as DataIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Group as GroupIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface CreditWallet {
  id: string;
  tenantId: string;
  tenantName: string;
  currentBalance: number;
  creditLimit: number;
  currency: string;
  status: 'active' | 'suspended' | 'overdue' | 'inactive';
  lastTopUp: string;
  lastTopUpAmount: number;
  totalSpent: number;
  totalCredits: number;
  usageThisMonth: number;
  averageMonthlyUsage: number;
  createdAt: string;
  updatedAt: string;
  billingContact: string;
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'paypal';
    last4: string;
    expiry?: string;
  };
}

interface CreditTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  category: 'email' | 'sms' | 'push' | 'top_up' | 'refund' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  processedAt?: string;
  reference?: string;
  metadata?: {
    campaignId?: string;
    messageCount?: number;
    unitPrice?: number;
  };
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  bonus: number;
  description: string;
  popular: boolean;
  features: string[];
}

const CreditWalletManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [wallets, setWallets] = useState<CreditWallet[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CreditWallet | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  useEffect(() => {
    setWallets([
      {
        id: '1',
        tenantId: 'tenant-1',
        tenantName: 'University of California',
        currentBalance: 1250.50,
        creditLimit: 5000,
        currency: 'USD',
        status: 'active',
        lastTopUp: '2024-01-10T00:00:00Z',
        lastTopUpAmount: 1000,
        totalSpent: 3750.50,
        totalCredits: 5000,
        usageThisMonth: 450.25,
        averageMonthlyUsage: 380.75,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        billingContact: 'billing@uc.edu',
        paymentMethod: {
          type: 'card',
          last4: '4242',
          expiry: '12/25'
        }
      },
      {
        id: '2',
        tenantId: 'tenant-2',
        tenantName: 'MIT Libraries',
        currentBalance: 0,
        creditLimit: 2000,
        currency: 'USD',
        status: 'overdue',
        lastTopUp: '2023-12-15T00:00:00Z',
        lastTopUpAmount: 500,
        totalSpent: 2000,
        totalCredits: 2000,
        usageThisMonth: 200,
        averageMonthlyUsage: 150,
        createdAt: '2023-12-01T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        billingContact: 'finance@mit.edu',
        paymentMethod: {
          type: 'bank_transfer',
          last4: '****'
        }
      },
      {
        id: '3',
        tenantId: 'tenant-3',
        tenantName: 'Stanford University',
        currentBalance: 5000,
        creditLimit: 10000,
        currency: 'USD',
        status: 'active',
        lastTopUp: '2024-01-12T00:00:00Z',
        lastTopUpAmount: 2000,
        totalSpent: 5000,
        totalCredits: 10000,
        usageThisMonth: 0,
        averageMonthlyUsage: 250,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
        billingContact: 'admin@stanford.edu',
        paymentMethod: {
          type: 'card',
          last4: '5555',
          expiry: '08/26'
        }
      }
    ]);

    setTransactions([
      {
        id: '1',
        walletId: '1',
        type: 'debit',
        amount: -25.50,
        description: 'Email campaign - Welcome Series',
        category: 'email',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T10:30:00Z',
        reference: 'TXN-001',
        metadata: {
          campaignId: 'campaign-1',
          messageCount: 450,
          unitPrice: 0.01
        }
      },
      {
        id: '2',
        walletId: '1',
        type: 'credit',
        amount: 1000,
        description: 'Credit top-up via credit card',
        category: 'top_up',
        status: 'completed',
        createdAt: '2024-01-10T00:00:00Z',
        processedAt: '2024-01-10T00:00:00Z',
        reference: 'TXN-002'
      },
      {
        id: '3',
        walletId: '2',
        type: 'debit',
        amount: -200,
        description: 'SMS campaign - Payment reminders',
        category: 'sms',
        status: 'completed',
        createdAt: '2024-01-14T16:20:00Z',
        processedAt: '2024-01-14T16:20:00Z',
        reference: 'TXN-003',
        metadata: {
          campaignId: 'campaign-3',
          messageCount: 150,
          unitPrice: 0.05
        }
      }
    ]);

    setPackages([
      {
        id: '1',
        name: 'Starter Pack',
        credits: 1000,
        price: 100,
        currency: 'USD',
        bonus: 0,
        description: 'Perfect for small libraries getting started',
        popular: false,
        features: ['Email campaigns', 'Basic analytics', 'Email support']
      },
      {
        id: '2',
        name: 'Professional Pack',
        credits: 5000,
        price: 450,
        currency: 'USD',
        bonus: 500,
        description: 'Most popular choice for growing libraries',
        popular: true,
        features: ['All channels', 'Advanced analytics', 'Priority support', 'A/B testing']
      },
      {
        id: '3',
        name: 'Enterprise Pack',
        credits: 10000,
        price: 800,
        currency: 'USD',
        bonus: 2000,
        description: 'For large institutions with high volume needs',
        popular: false,
        features: ['Unlimited channels', 'Custom analytics', 'Dedicated support', 'White-label options']
      }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'overdue': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'credit': return 'success';
      case 'debit': return 'error';
      case 'refund': return 'info';
      case 'adjustment': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'push': return <NotificationsIcon />;
      case 'top_up': return <CreditCardIcon />;
      case 'refund': return <ReceiptIcon />;
      case 'adjustment': return <SettingsIcon />;
      default: return <WalletIcon />;
    }
  };

  const filteredWallets = wallets.filter((wallet: any) => {
    const matchesSearch = wallet.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wallet.tenantId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wallet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const walletMetrics = {
    totalWallets: wallets.length,
    activeWallets: wallets.filter((w: any) => w.status === 'active').length,
    overdueWallets: wallets.filter((w: any) => w.status === 'overdue').length,
    totalBalance: wallets.reduce((sum, w) => sum + w.currentBalance, 0),
    totalSpent: wallets.reduce((sum, w) => sum + w.totalSpent, 0),
    averageBalance: wallets.reduce((sum, w) => sum + w.currentBalance, 0) / wallets.length,
    monthlyUsage: wallets.reduce((sum, w) => sum + w.usageThisMonth, 0)
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Credit Wallet Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage credit wallets, usage tracking, and billing for messaging services
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Credits
          </Button>
        </Box>
      </Box>

      {/* Wallet Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <WalletIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Wallets</Typography>
                <Typography variant="h4">{walletMetrics.totalWallets}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {walletMetrics.activeWallets} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Balance</Typography>
                <Typography variant="h4">${walletMetrics.totalBalance.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all wallets
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingDownIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Spent</Typography>
                <Typography variant="h4">${walletMetrics.totalSpent.toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  This month: ${walletMetrics.monthlyUsage.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <WarningIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Overdue</Typography>
                <Typography variant="h4">{walletMetrics.overdueWallets}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Wallets need attention
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Wallets" />
          <Tab label="Transactions" />
          <Tab label="Packages" />
          <Tab label="Analytics" />
        </Tabs>

        {/* Wallets Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Credit Wallets</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage This Month</TableCell>
                  <TableCell>Last Top-up</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{wallet.tenantName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {wallet.tenantId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        ${wallet.currentBalance.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of ${wallet.creditLimit.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={wallet.status}
                        color={getStatusColor(wallet.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${wallet.usageThisMonth.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg: ${wallet.averageMonthlyUsage.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(wallet.lastTopUp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${wallet.lastTopUpAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {wallet.paymentMethod?.type.replace('_', ' ')} •••• {wallet.paymentMethod?.last4}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedWallet(wallet)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <AddIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Credit Transactions</Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, width: 24, height: 24, bgcolor: 'grey.300' }}>
                          {getCategoryIcon(transaction.category)}
                        </Avatar>
                        <Typography variant="body2">
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{transaction.description}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction.reference}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Packages Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Credit Packages</Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {packages.map((pkg) => (
              <Card key={pkg.id} sx={{ position: 'relative' }}>
                {pkg.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                  />
                )}
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{pkg.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {pkg.description}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4">${pkg.price}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pkg.credits.toLocaleString()} credits
                      </Typography>
                    </Box>
                    
                    {pkg.bonus > 0 && (
                      <Alert severity="success" sx={{ py: 0 }}>
                        +{pkg.bonus.toLocaleString()} bonus credits!
                      </Alert>
                    )}
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Features</Typography>
                      <List dense>
                        {pkg.features.map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <CheckIcon color="success" sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<AddIcon />}>
                      Purchase
                    </Button>
                    <Button size="small" startIcon={<ViewIcon />}>
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Credit Usage Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Usage Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Spending by Category</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Wallet Activity</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit top-up completed"
                    secondary="University of California - $1,000 added - Balance: $1,250.50 - Time: 2024-01-10 00:00:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingDownIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Credit usage alert"
                    secondary="MIT Libraries - Balance low: $0 - Credit limit: $2,000 - Time: 2024-01-14 16:20:00"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment method expired"
                    secondary="Stanford University - Credit card expires 08/26 - Time: 2024-01-12 00:00:00"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Wallet Details Dialog */}
      <Dialog open={!!selectedWallet} onClose={() => setSelectedWallet(null)} maxWidth="md" fullWidth>
        <DialogTitle>Wallet Details</DialogTitle>
        <DialogContent>
          {selectedWallet && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedWallet.tenantName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedWallet.tenantId}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Wallet Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Current Balance: ${selectedWallet.currentBalance.toLocaleString()}</Typography>
                      <Typography variant="body2">Credit Limit: ${selectedWallet.creditLimit.toLocaleString()}</Typography>
                      <Typography variant="body2">Status: {selectedWallet.status}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Total Spent: ${selectedWallet.totalSpent.toLocaleString()}</Typography>
                      <Typography variant="body2">Usage This Month: ${selectedWallet.usageThisMonth.toLocaleString()}</Typography>
                      <Typography variant="body2">Currency: {selectedWallet.currency}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Payment Information</Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Typography variant="body2">Billing Contact: {selectedWallet.billingContact}</Typography>
                    <Typography variant="body2">
                      Payment Method: {selectedWallet.paymentMethod?.type.replace('_', ' ')} •••• {selectedWallet.paymentMethod?.last4}
                    </Typography>
                    {selectedWallet.paymentMethod?.expiry && (
                      <Typography variant="body2">Expires: {selectedWallet.paymentMethod.expiry}</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedWallet(null)}>Close</Button>
          <Button variant="contained">Add Credits</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditWalletManagementPage;






