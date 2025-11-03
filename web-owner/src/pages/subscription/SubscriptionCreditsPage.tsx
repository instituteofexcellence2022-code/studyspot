import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tooltip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tab,
  Tabs,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../../constants/subscriptionPlans';
import {
  CreditCard,
  ShoppingCart,
  Warning,
  CheckCircle,
  Sms,
  WhatsApp,
  History,
  Settings,
  Upgrade,
  Compare,
  Check,
  Star,
} from '@mui/icons-material';

// =====================================================
// INTERFACES
// =====================================================

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  maxLibraries: number;
  maxSeats: number;
  maxStaff: number;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

interface CreditPackage {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp';
  credits: number;
  price: number;
  bonusCredits?: number;
  validityDays: number;
  isPopular?: boolean;
}

interface CreditBalance {
  smsCredits: number;
  whatsappCredits: number;
  smsUsedThisMonth: number;
  whatsappUsedThisMonth: number;
  lowBalanceThreshold: number;
}

interface AutoTopupConfig {
  enabled: boolean;
  threshold: number;
  packageId: string;
  type: 'sms' | 'whatsapp';
}

interface UsageHistory {
  id: string;
  date: string;
  type: 'sms' | 'whatsapp';
  credits: number;
  description: string;
  recipient: string;
}

// =====================================================
// MOCK DATA
// =====================================================

// Use shared subscription plans
const MOCK_PLANS: SubscriptionPlan[] = DEFAULT_SUBSCRIPTION_PLANS.map(plan => ({
  id: plan.id,
  name: plan.name,
  description: plan.description,
  price: plan.price_monthly,
  billingCycle: 'monthly' as const,
  features: plan.features,
  maxLibraries: plan.limits.max_libraries === -1 ? 999999 : (plan.limits.max_libraries || 0),
  maxSeats: plan.limits.max_seats === -1 ? 999999 : (plan.limits.max_seats || 0),
  maxStaff: plan.limits.max_staff === -1 ? 999999 : (plan.limits.max_staff || 0),
  isPopular: plan.id === 'professional',
  isCurrentPlan: plan.id === 'professional',
}));

const MOCK_SMS_PACKAGES: CreditPackage[] = [
  { id: 's1', name: 'Starter Pack', type: 'sms', credits: 500, price: 299, validityDays: 30 },
  { id: 's2', name: 'Growth Pack', type: 'sms', credits: 1500, price: 799, bonusCredits: 100, validityDays: 60, isPopular: true },
  { id: 's3', name: 'Business Pack', type: 'sms', credits: 5000, price: 2499, bonusCredits: 500, validityDays: 90 },
  { id: 's4', name: 'Enterprise Pack', type: 'sms', credits: 15000, price: 6999, bonusCredits: 2000, validityDays: 180 },
];

const MOCK_WHATSAPP_PACKAGES: CreditPackage[] = [
  { id: 'w1', name: 'Basic Pack', type: 'whatsapp', credits: 200, price: 399, validityDays: 30 },
  { id: 'w2', name: 'Standard Pack', type: 'whatsapp', credits: 600, price: 999, bonusCredits: 50, validityDays: 60, isPopular: true },
  { id: 'w3', name: 'Premium Pack', type: 'whatsapp', credits: 2000, price: 2999, bonusCredits: 200, validityDays: 90 },
  { id: 'w4', name: 'Ultra Pack', type: 'whatsapp', credits: 6000, price: 7999, bonusCredits: 800, validityDays: 180 },
];

const MOCK_CREDIT_BALANCE: CreditBalance = {
  smsCredits: 1245,
  whatsappCredits: 487,
  smsUsedThisMonth: 823,
  whatsappUsedThisMonth: 213,
  lowBalanceThreshold: 500,
};

const MOCK_USAGE_HISTORY: UsageHistory[] = [
  { id: '1', date: '2025-10-23 10:30', type: 'sms', credits: -10, description: 'Payment reminder', recipient: '+91 98765 11111' },
  { id: '2', date: '2025-10-23 09:15', type: 'whatsapp', credits: -5, description: 'Welcome message', recipient: '+91 98765 22222' },
  { id: '3', date: '2025-10-22 16:45', type: 'sms', credits: -25, description: 'Bulk fee reminder', recipient: 'Multiple students' },
  { id: '4', date: '2025-10-22 14:20', type: 'whatsapp', credits: -8, description: 'Attendance alert', recipient: '+91 98765 33333' },
  { id: '5', date: '2025-10-21 11:00', type: 'sms', credits: 1500, description: 'Credit purchase - Growth Pack', recipient: 'System' },
];

// =====================================================
// MAIN COMPONENT
// =====================================================

const SubscriptionCreditsPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [creditBalance, setCreditBalance] = useState<CreditBalance>(MOCK_CREDIT_BALANCE);
  const [plans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [smsPackages] = useState<CreditPackage[]>(MOCK_SMS_PACKAGES);
  const [whatsappPackages] = useState<CreditPackage[]>(MOCK_WHATSAPP_PACKAGES);
  const [usageHistory] = useState<UsageHistory[]>(MOCK_USAGE_HISTORY);
  
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [autoTopupDialogOpen, setAutoTopupDialogOpen] = useState(false);
  
  const [smsAutoTopup, setSmsAutoTopup] = useState<AutoTopupConfig>({
    enabled: false,
    threshold: 500,
    packageId: 's2',
    type: 'sms',
  });
  
  const [whatsappAutoTopup, setWhatsappAutoTopup] = useState<AutoTopupConfig>({
    enabled: false,
    threshold: 200,
    packageId: 'w2',
    type: 'whatsapp',
  });

  // Low balance alerts
  const smsLowBalance = creditBalance.smsCredits < creditBalance.lowBalanceThreshold;
  const whatsappLowBalance = creditBalance.whatsappCredits < creditBalance.lowBalanceThreshold;

  const handlePurchasePackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (selectedPackage) {
      // Simulate purchase
      if (selectedPackage.type === 'sms') {
        setCreditBalance({
          ...creditBalance,
          smsCredits: creditBalance.smsCredits + selectedPackage.credits + (selectedPackage.bonusCredits || 0)
        });
      } else {
        setCreditBalance({
          ...creditBalance,
          whatsappCredits: creditBalance.whatsappCredits + selectedPackage.credits + (selectedPackage.bonusCredits || 0)
        });
      }
      setPurchaseDialogOpen(false);
      setSelectedPackage(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            💳 Subscription & Credits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your subscription plan and communication credits
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Compare />} onClick={() => setCompareDialogOpen(true)}>
          Compare Plans
        </Button>
      </Box>

      {/* Low Balance Alerts */}
      {(smsLowBalance || whatsappLowBalance) && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
          <strong>Low Credit Balance!</strong>
          {smsLowBalance && ` SMS Credits: ${creditBalance.smsCredits} remaining.`}
          {whatsappLowBalance && ` WhatsApp Credits: ${creditBalance.whatsappCredits} remaining.`}
          {' '}Purchase more credits to avoid service interruption.
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Subscription Plan" icon={<CreditCard />} iconPosition="start" />
          <Tab label="SMS Credits" icon={<Sms />} iconPosition="start" />
          <Tab label="WhatsApp Credits" icon={<WhatsApp />} iconPosition="start" />
          <Tab label="Usage History" icon={<History />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 1: Subscription Plan */}
      {currentTab === 0 && (
        <Box>
          {/* Current Plan */}
          <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Current Plan: Professional
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next billing date: November 23, 2025 • ₹2,499/month
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<Upgrade />}>
                    Upgrade Plan
                  </Button>
                  <Button variant="outlined" startIcon={<Settings />}>
                    Manage Billing
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <Typography variant="h6" gutterBottom>
            Available Plans
          </Typography>
          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: plan.isCurrentPlan ? `2px solid ${theme.palette.primary.main}` : 'none',
                    bgcolor: plan.isCurrentPlan ? alpha(theme.palette.primary.main, 0.02) : 'inherit'
                  }}
                >
                  {plan.isPopular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      icon={<Star />}
                      sx={{ position: 'absolute', top: 16, right: 16 }}
                    />
                  )}
                  {plan.isCurrentPlan && (
                    <Chip
                      label="Current Plan"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                      sx={{ position: 'absolute', top: 16, left: 16 }}
                    />
                  )}
                  <CardContent sx={{ pt: plan.isPopular || plan.isCurrentPlan ? 6 : 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plan.description}
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Typography variant="h3" component="span">
                        ₹{plan.price}
                      </Typography>
                      <Typography variant="body2" component="span" color="text.secondary">
                        /{plan.billingCycle === 'monthly' ? 'month' : plan.billingCycle === 'quarterly' ? 'quarter' : 'year'}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      {plan.features.map((feature, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Check color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant={plan.isCurrentPlan ? 'outlined' : 'contained'}
                      sx={{ mt: 2 }}
                      disabled={plan.isCurrentPlan}
                    >
                      {plan.isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 2: SMS Credits */}
      {currentTab === 1 && (
        <Box>
          {/* SMS Balance Card */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        SMS Credits Balance
                      </Typography>
                      <Typography variant="h3">
                        {creditBalance.smsCredits.toLocaleString()}
                      </Typography>
                    </Box>
                    <Sms sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.3) }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Used this month: {creditBalance.smsUsedThisMonth.toLocaleString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(creditBalance.smsUsedThisMonth / (creditBalance.smsUsedThisMonth + creditBalance.smsCredits)) * 100}
                    sx={{ height: 8, borderRadius: 1, mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Auto-Topup Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={smsAutoTopup.enabled}
                        onChange={(e) => setSmsAutoTopup({ ...smsAutoTopup, enabled: e.target.checked })}
                      />
                    }
                    label="Enable Auto-Topup"
                  />
                  {smsAutoTopup.enabled && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        When balance falls below {smsAutoTopup.threshold} credits,
                        automatically purchase the {smsPackages.find(p => p.id === smsAutoTopup.packageId)?.name}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => setAutoTopupDialogOpen(true)}
                      >
                        Configure
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* SMS Packages */}
          <Typography variant="h6" gutterBottom>
            Purchase SMS Credits
          </Typography>
          <Grid container spacing={3}>
            {smsPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                <Card sx={{ position: 'relative', height: '100%' }}>
                  {pkg.isPopular && (
                    <Chip
                      label="Popular"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12 }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {pkg.name}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {pkg.credits.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      SMS Credits
                    </Typography>
                    {pkg.bonusCredits && (
                      <Chip
                        label={`+${pkg.bonusCredits} Bonus`}
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      ₹{pkg.price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Valid for {pkg.validityDays} days
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ₹{(pkg.price / pkg.credits).toFixed(2)} per SMS
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      sx={{ mt: 2 }}
                      onClick={() => handlePurchasePackage(pkg)}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 3: WhatsApp Credits */}
      {currentTab === 2 && (
        <Box>
          {/* WhatsApp Balance Card */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        WhatsApp Credits Balance
                      </Typography>
                      <Typography variant="h3">
                        {creditBalance.whatsappCredits.toLocaleString()}
                      </Typography>
                    </Box>
                    <WhatsApp sx={{ fontSize: 48, color: alpha(theme.palette.success.main, 0.3) }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Used this month: {creditBalance.whatsappUsedThisMonth.toLocaleString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(creditBalance.whatsappUsedThisMonth / (creditBalance.whatsappUsedThisMonth + creditBalance.whatsappCredits)) * 100}
                    sx={{ height: 8, borderRadius: 1, mt: 1 }}
                    color="success"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Auto-Topup Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={whatsappAutoTopup.enabled}
                        onChange={(e) => setWhatsappAutoTopup({ ...whatsappAutoTopup, enabled: e.target.checked })}
                      />
                    }
                    label="Enable Auto-Topup"
                  />
                  {whatsappAutoTopup.enabled && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        When balance falls below {whatsappAutoTopup.threshold} credits,
                        automatically purchase the {whatsappPackages.find(p => p.id === whatsappAutoTopup.packageId)?.name}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => setAutoTopupDialogOpen(true)}
                      >
                        Configure
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* WhatsApp Packages */}
          <Typography variant="h6" gutterBottom>
            Purchase WhatsApp Credits
          </Typography>
          <Grid container spacing={3}>
            {whatsappPackages.map((pkg) => (
              <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                <Card sx={{ position: 'relative', height: '100%' }}>
                  {pkg.isPopular && (
                    <Chip
                      label="Popular"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12 }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {pkg.name}
                    </Typography>
                    <Typography variant="h4" color="success.main" gutterBottom>
                      {pkg.credits.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      WhatsApp Credits
                    </Typography>
                    {pkg.bonusCredits && (
                      <Chip
                        label={`+${pkg.bonusCredits} Bonus`}
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      ₹{pkg.price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Valid for {pkg.validityDays} days
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ₹{(pkg.price / pkg.credits).toFixed(2)} per message
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<ShoppingCart />}
                      sx={{ mt: 2 }}
                      onClick={() => handlePurchasePackage(pkg)}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 4: Usage History */}
      {currentTab === 3 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Credit Usage History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Credits</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Recipient</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Chip
                            icon={item.type === 'sms' ? <Sms /> : <WhatsApp />}
                            label={item.type.toUpperCase()}
                            size="small"
                            color={item.type === 'sms' ? 'primary' : 'success'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={item.credits > 0 ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                          >
                            {item.credits > 0 ? '+' : ''}{item.credits}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          {selectedPackage && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are about to purchase <strong>{selectedPackage.name}</strong>
              </Alert>
              <Typography variant="body2" gutterBottom>
                <strong>Credits:</strong> {selectedPackage.credits.toLocaleString()}
                {selectedPackage.bonusCredits && ` + ${selectedPackage.bonusCredits} bonus`}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Price:</strong> ₹{selectedPackage.price}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Validity:</strong> {selectedPackage.validityDays} days
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Payment will be processed using your saved payment method.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmPurchase}>
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Plans Dialog */}
      <Dialog open={compareDialogOpen} onClose={() => setCompareDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Compare Subscription Plans</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      <Typography variant="h6">{plan.name}</Typography>
                      <Typography variant="h6" color="primary">₹{plan.price}/mo</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Libraries</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.maxLibraries === -1 ? 'Unlimited' : plan.maxLibraries}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Seats</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.maxSeats === -1 ? 'Unlimited' : plan.maxSeats}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Staff Members</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} align="center">
                      {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Add more feature comparisons */}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionCreditsPage;

