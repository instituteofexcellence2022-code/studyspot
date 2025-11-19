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
import { useTheme } from '@mui/material/styles';
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
import feePlanService from '../../services/api/feePlan.service';
import { toast } from 'react-toastify';

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
  const theme = useTheme();
  
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

  // Load fee plans from API using service
  const loadFeePlans = async () => {
    setLoading(true);
    try {
      const fetchedPlans = await feePlanService.getFeePlans();
      // Transform to match local FeePlan interface (add createdAt/updatedAt if missing)
      const transformedPlans: FeePlan[] = fetchedPlans.map((plan: any) => ({
        ...plan,
        createdAt: plan.createdAt || new Date().toISOString(),
        updatedAt: plan.updatedAt || new Date().toISOString(),
        status: (plan.status === 'draft' ? 'active' : plan.status) as 'active' | 'inactive',
      }));
      setPlans(transformedPlans);
      
      if (transformedPlans.length === 0) {
        toast.info('No fee plans found. Create your first fee plan to get started.');
      }
    } catch (error: any) {
      console.error('❌ [FeePlansPage] Failed to fetch fee plans:', error);
      toast.error('Failed to load fee plans. Please try again.');
      setPlans([]);
      // Don't load demo data - show empty state instead
    } finally {
      setLoading(false);
    }
  };

  // Load pricing rules (if needed - can be fetched from backend later)
  const loadPricingRules = async () => {
    try {
      // TODO: Implement pricing rules API endpoint
      // For now, set empty array
      setPricingRules([]);
    } catch (error: any) {
      console.error('❌ [FeePlansPage] Failed to fetch pricing rules:', error);
      setPricingRules([]);
    }
  };


  // Load data on mount
  useEffect(() => {
    loadFeePlans();
    loadPricingRules();
  }, []);

  // Form steps
  const formSteps = ['Basic Info', 'Pricing Structure', 'Discounts & Offers', 'Review'];

  // Handle plan creation/edit with API using service
  const handleSavePlan = async (planData: any) => {
    setLoading(true);
    try {
      const planPayload = {
        name: planData.name,
        description: planData.description,
        type: planData.type,
        basePrice: planData.basePrice,
        shiftPricing: planData.shiftPricing || null,
        zonePricing: planData.zonePricing || null,
        features: planData.features || [],
        discount: planData.enableDiscount ? planData.discount : null,
        isPopular: planData.isPopular || false,
        scholarshipEligible: planData.scholarshipEligible || false,
        waiverAllowed: planData.waiverAllowed || false,
        status: planData.status || 'active',
        maxSeats: planData.maxSeats || null,
        maxHours: planData.maxHours || null,
      };

      if (currentPlan.id) {
        // Update existing plan
        await feePlanService.updateFeePlan(currentPlan.id, planPayload);
        toast.success('Fee plan updated successfully');
        setSnackbar({ 
          open: true, 
          message: '✅ Plan updated successfully!', 
          severity: 'success' 
        });
      } else {
        // Create new plan
        await feePlanService.createFeePlan(planPayload);
        toast.success('Fee plan created successfully');
        setSnackbar({ 
          open: true, 
          message: '✅ Plan created successfully!', 
          severity: 'success' 
        });
      }

      // Reload plans
      await loadFeePlans();
      
      // Close dialogs
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setCurrentPlan({});
      setActiveStep(0);
    } catch (error: any) {
      console.error('❌ [FeePlansPage] Failed to save fee plan:', error);
      toast.error(error.message || 'Failed to save fee plan');
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save fee plan. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await feePlanService.deleteFeePlan(selectedPlan.id);
      
      // Reload plans from API
      await loadFeePlans();
      
      toast.success('Fee plan deleted successfully');
      setSnackbar({ open: true, message: '✅ Plan deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('❌ [FeePlansPage] Error deleting fee plan:', error);
      toast.error(error.message || 'Failed to delete fee plan');
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete fee plan. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicatePlan = async (plan: FeePlan) => {
    try {
      setLoading(true);
      // Create a new plan based on the duplicated one
      const duplicatedPlan: Omit<FeePlan, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `${plan.name} (Copy)`,
        description: plan.description,
        type: plan.type,
        basePrice: plan.basePrice,
        shiftPricing: plan.shiftPricing,
        zonePricing: plan.zonePricing,
        discount: plan.discount,
        features: plan.features,
        maxSeats: plan.maxSeats,
        maxHours: plan.maxHours,
        scholarshipEligible: plan.scholarshipEligible,
        waiverAllowed: plan.waiverAllowed,
        status: plan.status === 'draft' ? 'active' : plan.status,
        isPopular: plan.isPopular,
      };
      
      await feePlanService.createFeePlan(duplicatedPlan);
      await loadFeePlans();
      
      toast.success('Fee plan duplicated successfully');
      setSnackbar({ open: true, message: '✅ Plan duplicated successfully!', severity: 'success' });
    } catch (error: any) {
      console.error('❌ [FeePlansPage] Error duplicating fee plan:', error);
      toast.error(error.message || 'Failed to duplicate fee plan');
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to duplicate fee plan. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
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

      {/* Stats Cards - Responsive & Theme-aware */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Total Plans
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {plans.length}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ 
                  fontSize: { xs: 36, sm: 42, md: 48 }, 
                  color: 'primary.main', 
                  opacity: theme.palette.mode === 'dark' ? 0.5 : 0.3 
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Active Plans
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {plans.filter(p => p.status === 'active').length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ 
                  fontSize: { xs: 36, sm: 42, md: 48 }, 
                  color: 'success.main', 
                  opacity: theme.palette.mode === 'dark' ? 0.5 : 0.3 
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    With Discounts
                  </Typography>
                  <Typography variant="h4" color="warning.main" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {plans.filter(p => p.discount).length}
                  </Typography>
                </Box>
                <PercentIcon sx={{ 
                  fontSize: { xs: 36, sm: 42, md: 48 }, 
                  color: 'warning.main', 
                  opacity: theme.palette.mode === 'dark' ? 0.5 : 0.3 
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
            }
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Pricing Rules
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {pricingRules.filter(r => r.active).length}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ 
                  fontSize: { xs: 36, sm: 42, md: 48 }, 
                  color: 'info.main', 
                  opacity: theme.palette.mode === 'dark' ? 0.5 : 0.3 
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons - Responsive */}
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setCurrentPlan({ name: '', type: 'monthly', basePrice: 0, features: [], status: 'active', shiftPricing: {}, zonePricing: {} }); setCreateDialogOpen(true); }}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
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
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
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
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Scholarships
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ExportIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Export Plans
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Filters - Responsive & Theme-aware */}
      <Paper sx={{ p: { xs: 2, sm: 2, md: 2 }, mb: 2, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.default, 0.5)
                    : 'background.paper',
                }
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

      {/* Plans Grid - Compact Cards */}
      <Grid container spacing={2}>
        {filteredPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: plan.isPopular ? '2px solid' : '1px solid',
                borderColor: plan.isPopular ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
                  borderColor: 'primary.main',
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : 'background.paper',
                },
              }}
            >
              {plan.isPopular && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  bgcolor: 'primary.main', 
                  color: theme.palette.primary.contrastText,
                  px: 1.5,
                  py: 0.5,
                  borderBottomLeftRadius: 8,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  boxShadow: 2,
                }}>
                  ⭐ POPULAR
                </Box>
              )}
              
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, pr: 1 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={plan.type} 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          fontWeight: 600,
                        }} 
                      />
                      <Chip 
                        label={plan.status} 
                        size="small" 
                        sx={{ 
                          height: 20, 
                          fontSize: '0.65rem',
                          bgcolor: plan.status === 'active' 
                            ? alpha(theme.palette.success.main, 0.1) 
                            : alpha(theme.palette.grey[500], 0.1),
                          color: plan.status === 'active' ? 'success.main' : 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, plan)} sx={{ mt: -0.5 }}>
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* Price */}
                <Box sx={{ 
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05), 
                  p: 1.5, 
                  borderRadius: 1.5, 
                  mb: 1.5,
                  textAlign: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}>
                  <Typography variant="h5" color="primary.main" fontWeight={700}>
                    ₹{plan.basePrice}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    per {plan.type}
                  </Typography>
                  {plan.discount && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<PercentIcon sx={{ fontSize: 12 }} />}
                        label={`${plan.discount.value}${plan.discount.type === 'percentage' ? '%' : '₹'} OFF`}
                        color="warning"
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </Box>

                {/* Description - Compact */}
                {plan.description && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1.5,
                      lineHeight: 1.4,
                    }}
                  >
                    {plan.description}
                  </Typography>
                )}

                {/* Pricing Details - Compact */}
                {((plan.shiftPricing && Object.keys(plan.shiftPricing).length > 0) || 
                  (plan.zonePricing && Object.keys(plan.zonePricing).length > 0)) && (
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {plan.shiftPricing?.morning && (
                        <Chip 
                          icon={<MorningIcon sx={{ fontSize: 12 }} />} 
                          label={`₹${plan.shiftPricing.morning}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                      {plan.shiftPricing?.evening && (
                        <Chip 
                          icon={<EveningIcon sx={{ fontSize: 12 }} />} 
                          label={`₹${plan.shiftPricing.evening}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                      {plan.zonePricing?.ac && (
                        <Chip 
                          icon={<AcIcon sx={{ fontSize: 12 }} />} 
                          label={`₹${plan.zonePricing.ac}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Features - Very Compact */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                    {plan.features.length} Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {plan.features.slice(0, 2).map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ fontSize: 12, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                    {plan.features.length > 2 && (
                      <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        +{plan.features.length - 2}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Badges - Compact */}
                {(plan.scholarshipEligible || plan.waiverAllowed) && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                    {plan.scholarshipEligible && (
                      <Chip 
                        icon={<School sx={{ fontSize: 12 }} />} 
                        label="Scholarship" 
                        size="small" 
                        color="info" 
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                    {plan.waiverAllowed && (
                      <Chip 
                        icon={<CardGiftcard sx={{ fontSize: 12 }} />} 
                        label="Waiver" 
                        size="small" 
                        color="secondary" 
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                )}

                {/* Action Buttons - Compact */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => { setSelectedPlan(plan); setViewDialogOpen(true); }}
                    sx={{ py: 0.5, fontSize: '0.7rem', minWidth: 0 }}
                  >
                    View
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setCurrentPlan(plan);
                      setEditDialogOpen(true);
                    }}
                    sx={{ py: 0.5, fontSize: '0.7rem', minWidth: 0 }}
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
         onClose={() => { 
           setCreateDialogOpen(false); 
           setEditDialogOpen(false); 
           setSelectedPlan(null);
           setCurrentPlan({ name: '', type: 'monthly', basePrice: 0, features: [], status: 'active', shiftPricing: {}, zonePricing: {} });
         }}
         onSave={handleSavePlan}
         editMode={editDialogOpen}
         initialData={editDialogOpen && selectedPlan ? selectedPlan : undefined}
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

