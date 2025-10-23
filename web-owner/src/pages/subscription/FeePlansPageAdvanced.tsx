import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, TablePagination, InputAdornment, FormControl,
  InputLabel, Select, Alert, Snackbar, Tooltip, Tabs, Tab, Divider, List, ListItem,
  ListItemText, Switch, FormControlLabel, Slider, alpha, Stepper, Step, StepLabel,
  Accordion, AccordionSummary, AccordionDetails, Badge, Menu,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  FileDownload as ExportIcon, AttachMoney as MoneyIcon, TrendingUp as TrendingUpIcon,
  LocalOffer as OfferIcon, Percent as PercentIcon, Schedule as ScheduleIcon,
  WbSunny as MorningIcon, Brightness3 as EveningIcon, AcUnit as AcIcon,
  CheckCircle, Warning, Close, MoreVert, ExpandMore, Upgrade,
  CardGiftcard, School, Calculate, SwapHoriz, ContentCopy, Visibility,
  Info as InfoIcon,
} from '@mui/icons-material';
import FeePlanFormDialog from '../../components/fees/FeePlanFormDialog';

interface FeePlan {
  id: string;
  name: string;
  description?: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo';
  basePrice: number;
  
  // Shift-based pricing
  shiftPricing?: {
    morning?: number;
    afternoon?: number;
    evening?: number;
    night?: number;
  };
  
  // Zone-based pricing
  zonePricing?: {
    ac?: number;
    nonAc?: number;
    premium?: number;
    quiet?: number;
    general?: number;
  };
  
  // Discount & offers
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validFrom?: string;
    validTo?: string;
  };
  
  // Features & limits
  features: string[];
  maxSeats?: number;
  maxHours?: number;
  
  // Scholarship/waiver
  scholarshipEligible?: boolean;
  waiverAllowed?: boolean;
  
  // Status
  status: 'active' | 'inactive' | 'draft';
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'seasonal' | 'bulk' | 'referral' | 'early-bird' | 'student-type';
  condition: string;
  adjustment: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  priority: number;
  active: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FeePlansPageAdvanced: React.FC = () => {
  // State management
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FeePlan | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [pricingRulesDialogOpen, setPricingRulesDialogOpen] = useState(false);
  const [proRataDialogOpen, setProRataDialogOpen] = useState(false);
  const [scholarshipDialogOpen, setScholarshipDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form states
  const [activeStep, setActiveStep] = useState(0);
  const [formTab, setFormTab] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<Partial<FeePlan>>({
    name: '',
    type: 'monthly',
    basePrice: 0,
    features: [],
    status: 'active',
    shiftPricing: {},
    zonePricing: {},
  });
  
  // Filter & search
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPlan, setMenuPlan] = useState<FeePlan | null>(null);

  // Load demo data
  useEffect(() => {
    loadDemoPlans();
    loadDemoPricingRules();
  }, []);

  const loadDemoPlans = () => {
    const demoPlans: FeePlan[] = [
      {
        id: '1',
        name: 'Basic Hourly',
        description: 'Pay as you go - perfect for occasional visitors',
        type: 'hourly',
        basePrice: 50,
        shiftPricing: { morning: 40, afternoon: 50, evening: 60, night: 45 },
        zonePricing: { ac: 60, nonAc: 40, premium: 75 },
        features: ['WiFi', 'Power Outlet', 'Water'],
        status: 'active',
        createdAt: '2025-01-15',
        updatedAt: '2025-01-15',
      },
      {
        id: '2',
        name: 'Premium Monthly',
        description: 'Best value for regular students',
        type: 'monthly',
        basePrice: 5000,
        shiftPricing: { morning: 4500, afternoon: 5000, evening: 5500 },
        zonePricing: { ac: 6000, nonAc: 4000, premium: 7500 },
        discount: { type: 'percentage', value: 10, validFrom: '2025-01-01', validTo: '2025-12-31' },
        features: ['24/7 Access', 'WiFi', 'Power Outlet', 'Locker', 'Free Coffee', 'Meeting Room Access'],
        scholarshipEligible: true,
        waiverAllowed: true,
        isPopular: true,
        status: 'active',
        createdAt: '2025-01-10',
        updatedAt: '2025-01-20',
      },
      {
        id: '3',
        name: 'Weekend Special',
        description: 'Weekend-only access at discounted rates',
        type: 'weekly',
        basePrice: 1500,
        features: ['Weekend Access', 'WiFi', 'Power Outlet'],
        discount: { type: 'fixed', value: 200 },
        status: 'active',
        createdAt: '2025-01-12',
        updatedAt: '2025-01-12',
      },
      {
        id: '4',
        name: 'Student Scholarship Plan',
        description: 'Special plan for scholarship recipients',
        type: 'monthly',
        basePrice: 2000,
        features: ['Full Access', 'WiFi', 'Study Materials', 'Mentorship'],
        scholarshipEligible: true,
        waiverAllowed: true,
        discount: { type: 'percentage', value: 50 },
        status: 'active',
        createdAt: '2025-01-08',
        updatedAt: '2025-01-08',
      },
      {
        id: '5',
        name: 'Combo - Morning + Evening',
        description: 'Access to both morning and evening slots',
        type: 'combo',
        basePrice: 4000,
        shiftPricing: { morning: 2000, evening: 2500 },
        features: ['Dual Shift Access', 'WiFi', 'Locker', 'Coffee'],
        isPopular: true,
        status: 'active',
        createdAt: '2025-01-05',
        updatedAt: '2025-01-05',
      },
    ];
    setPlans(demoPlans);
  };

  const loadDemoPricingRules = () => {
    const demoRules: PricingRule[] = [
      {
        id: '1',
        name: 'Summer Discount',
        type: 'seasonal',
        condition: 'June-August',
        adjustment: { type: 'percentage', value: 15 },
        priority: 1,
        active: true,
      },
      {
        id: '2',
        name: 'Bulk Enrollment (5+)',
        type: 'bulk',
        condition: '5 or more students',
        adjustment: { type: 'percentage', value: 20 },
        priority: 2,
        active: true,
      },
      {
        id: '3',
        name: 'Referral Bonus',
        type: 'referral',
        condition: 'Referred by existing student',
        adjustment: { type: 'fixed', value: 500 },
        priority: 3,
        active: true,
      },
      {
        id: '4',
        name: 'Early Bird (First 50)',
        type: 'early-bird',
        condition: 'First 50 enrollments',
        adjustment: { type: 'percentage', value: 25 },
        priority: 1,
        active: false,
      },
    ];
    setPricingRules(demoRules);
  };

  // Form steps
  const formSteps = ['Basic Info', 'Pricing Structure', 'Discounts & Offers', 'Review'];

  // Handle plan creation/edit
  const handleSavePlan = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editDialogOpen && selectedPlan) {
      setPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...currentPlan, id: selectedPlan.id } as FeePlan : p));
      setSnackbar({ open: true, message: '✅ Plan updated successfully!', severity: 'success' });
    } else {
      const newPlan: FeePlan = {
        ...currentPlan,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as FeePlan;
      setPlans(prev => [...prev, newPlan]);
      setSnackbar({ open: true, message: '✅ Plan created successfully!', severity: 'success' });
    }
    
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setActiveStep(0);
    setLoading(false);
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
    setSnackbar({ open: true, message: '✅ Plan deleted successfully!', severity: 'success' });
    setDeleteDialogOpen(false);
    setLoading(false);
  };

  const handleDuplicatePlan = (plan: FeePlan) => {
    const duplicated: FeePlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans(prev => [...prev, duplicated]);
    setSnackbar({ open: true, message: '✅ Plan duplicated successfully!', severity: 'success' });
  };

  // Calculate final price with all adjustments
  const calculateFinalPrice = (plan: FeePlan, shift?: string, zone?: string): number => {
    let price = plan.basePrice;
    
    // Apply shift pricing
    if (shift && plan.shiftPricing) {
      price = (plan.shiftPricing as any)[shift] || price;
    }
    
    // Apply zone pricing
    if (zone && plan.zonePricing) {
      price = (plan.zonePricing as any)[zone] || price;
    }
    
    // Apply discount
    if (plan.discount) {
      if (plan.discount.type === 'percentage') {
        price = price - (price * plan.discount.value / 100);
      } else {
        price = price - plan.discount.value;
      }
    }
    
    return Math.max(0, price);
  };

  // Pro-rata calculation
  const calculateProRata = (oldPrice: number, newPrice: number, daysRemaining: number, totalDays: number) => {
    const unusedAmount = (oldPrice / totalDays) * daysRemaining;
    const newProRata = (newPrice / totalDays) * daysRemaining;
    const adjustment = newProRata - unusedAmount;
    return { unusedAmount, newProRata, adjustment };
  };

  // Menu handling
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plan: FeePlan) => {
    setAnchorEl(event.currentTarget);
    setMenuPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuPlan(null);
  };

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || plan.type === typeFilter;
    const matchesStatus = !statusFilter || plan.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fee Plan Management
          <Chip label="Advanced Pricing ✨" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create flexible fee plans with shift, zone, and duration-based pricing
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Plans</Typography>
                  <Typography variant="h4">{plans.length}</Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Active Plans</Typography>
                  <Typography variant="h4" color="success.main">
                    {plans.filter(p => p.status === 'active').length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">With Discounts</Typography>
                  <Typography variant="h4" color="warning.main">
                    {plans.filter(p => p.discount).length}
                  </Typography>
                </Box>
                <PercentIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pricing Rules</Typography>
                  <Typography variant="h4">{pricingRules.filter(r => r.active).length}</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setCurrentPlan({ name: '', type: 'monthly', basePrice: 0, features: [], status: 'active', shiftPricing: {}, zonePricing: {} }); setCreateDialogOpen(true); }}
              >
                Create New Plan
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={() => setPricingRulesDialogOpen(true)}
              >
                Pricing Rules ({pricingRules.filter(r => r.active).length})
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CardGiftcard />}
                onClick={() => setScholarshipDialogOpen(true)}
              >
                Scholarships & Waivers
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ExportIcon />}
              >
                Export Plans
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search fee plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="combo">Combo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Plans Grid */}
      <Grid container spacing={3}>
        {filteredPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: plan.isPopular ? '2px solid' : 'none',
                borderColor: 'primary.main',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              {plan.isPopular && (
                <Chip
                  label="Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: 12, right: 12 }}
                />
              )}
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Chip label={plan.type} size="small" sx={{ mr: 1 }} />
                    <Chip 
                      label={plan.status} 
                      size="small" 
                      color={plan.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, plan)}>
                    <MoreVert />
                  </IconButton>
                </Box>

                {plan.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {plan.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" color="primary.main">
                    ₹{plan.basePrice}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /{plan.type}
                    </Typography>
                  </Typography>
                  {plan.discount && (
                    <Chip
                      icon={<PercentIcon />}
                      label={`${plan.discount.value}${plan.discount.type === 'percentage' ? '%' : '₹'} OFF`}
                      color="warning"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                {/* Shift Pricing */}
                {plan.shiftPricing && Object.keys(plan.shiftPricing).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Shift Pricing:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {plan.shiftPricing.morning && (
                        <Chip icon={<MorningIcon />} label={`Morning: ₹${plan.shiftPricing.morning}`} size="small" variant="outlined" />
                      )}
                      {plan.shiftPricing.evening && (
                        <Chip icon={<EveningIcon />} label={`Evening: ₹${plan.shiftPricing.evening}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Zone Pricing */}
                {plan.zonePricing && Object.keys(plan.zonePricing).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Zone Pricing:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {plan.zonePricing.ac && (
                        <Chip icon={<AcIcon />} label={`AC: ₹${plan.zonePricing.ac}`} size="small" variant="outlined" />
                      )}
                      {plan.zonePricing.nonAc && (
                        <Chip label={`Non-AC: ₹${plan.zonePricing.nonAc}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Features */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Features:
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <CheckCircle sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                        <ListItemText 
                          primary={feature}
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                    {plan.features.length > 3 && (
                      <Typography variant="caption" color="primary">
                        +{plan.features.length - 3} more
                      </Typography>
                    )}
                  </List>
                </Box>

                {/* Badges */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {plan.scholarshipEligible && (
                    <Chip icon={<School />} label="Scholarship" size="small" color="info" />
                  )}
                  {plan.waiverAllowed && (
                    <Chip icon={<CardGiftcard />} label="Waiver" size="small" color="secondary" />
                  )}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => { setSelectedPlan(plan); setViewDialogOpen(true); }}
                  >
                    View
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setCurrentPlan(plan);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredPlans.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No fee plans found
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Plan
          </Button>
        </Paper>
      )}

      {/* Fee Plan Form Dialog */}
      <FeePlanFormDialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => { setCreateDialogOpen(false); setEditDialogOpen(false); }}
        onSave={handleSavePlan}
        editMode={editDialogOpen}
        initialData={editDialogOpen ? currentPlan : undefined}
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { setSelectedPlan(menuPlan); setViewDialogOpen(true); handleMenuClose(); }}>
          <Visibility sx={{ mr: 1 }} fontSize="small" /> View Details
        </MenuItem>
        <MenuItem onClick={() => { setSelectedPlan(menuPlan); setCurrentPlan(menuPlan!); setEditDialogOpen(true); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit Plan
        </MenuItem>
        <MenuItem onClick={() => { handleDuplicatePlan(menuPlan!); handleMenuClose(); }}>
          <ContentCopy sx={{ mr: 1 }} fontSize="small" /> Duplicate
        </MenuItem>
        <MenuItem onClick={() => { setSelectedPlan(menuPlan); setUpgradeDialogOpen(true); handleMenuClose(); }}>
          <SwapHoriz sx={{ mr: 1 }} fontSize="small" /> Upgrade/Downgrade
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setSelectedPlan(menuPlan); setDeleteDialogOpen(true); handleMenuClose(); }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" color="error" /> Delete
        </MenuItem>
      </Menu>

      {/* Pro-Rata Calculator Dialog */}
      <Dialog open={proRataDialogOpen} onClose={() => setProRataDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Calculate sx={{ mr: 1 }} />
            Pro-Rata Calculator
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Calculate adjusted fees for mid-cycle plan changes
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Plan Price"
                type="number"
                defaultValue={5000}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Plan Price"
                type="number"
                defaultValue={7500}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Days Remaining"
                type="number"
                defaultValue={15}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Total Days"
                type="number"
                defaultValue={30}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: alpha('#4caf50', 0.1) }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Calculation Result:
                </Typography>
                <Typography variant="h6" color="success.main">
                  Adjustment: ₹1,250
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Unused credit: ₹2,500 | New pro-rata: ₹3,750)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProRataDialogOpen(false)}>Close</Button>
          <Button variant="contained">Apply Adjustment</Button>
        </DialogActions>
      </Dialog>

      {/* Pricing Rules Dialog */}
      <Dialog open={pricingRulesDialogOpen} onClose={() => setPricingRulesDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              Dynamic Pricing Rules
            </Box>
            <Button startIcon={<AddIcon />} variant="contained" size="small">
              Add Rule
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Pricing rules are applied automatically based on conditions. Higher priority rules are applied first.
          </Alert>
          
          {pricingRules.map((rule, idx) => (
            <Accordion key={rule.id} defaultExpanded={idx === 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography>{rule.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={rule.type} size="small" />
                    <Chip 
                      label={rule.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={rule.active ? 'success' : 'default'}
                    />
                    <Chip label={`Priority ${rule.priority}`} size="small" variant="outlined" />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Condition:</strong> {rule.condition}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Adjustment:</strong> {rule.adjustment.type === 'percentage' ? `${rule.adjustment.value}% discount` : `₹${rule.adjustment.value} off`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />}>Edit</Button>
                      <Button size="small" variant="outlined" startIcon={<DeleteIcon />} color="error">Delete</Button>
                      <FormControlLabel
                        control={<Switch checked={rule.active} size="small" />}
                        label="Active"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPricingRulesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Scholarship & Waiver Dialog */}
      <Dialog open={scholarshipDialogOpen} onClose={() => setScholarshipDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} />
            Scholarship & Fee Waiver Management
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label="Scholarships" />
            <Tab label="Fee Waivers" />
          </Tabs>

          <Alert severity="info" sx={{ mb: 2 }}>
            Manage scholarship programs and fee waivers for eligible students
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Eligible Plans:</Typography>
              {plans.filter(p => p.scholarshipEligible).map(plan => (
                <Chip key={plan.id} label={plan.name} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scholarship Percentage"
                type="number"
                defaultValue={50}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Academic Score"
                type="number"
                defaultValue={85}
                helperText="Percentage required for eligibility"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Family Income Limit"
                type="number"
                defaultValue={500000}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Annual income threshold"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScholarshipDialogOpen(false)}>Close</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeletePlan} variant="contained" color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
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

export default FeePlansPageAdvanced;

