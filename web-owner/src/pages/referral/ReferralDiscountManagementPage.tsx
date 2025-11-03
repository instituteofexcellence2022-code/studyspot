import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  LocalOffer as CouponIcon,
  Campaign as CampaignIcon,
  TrendingUp as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { toast } from 'react-toastify';
import {
  referralDiscountService,
  ReferralProgram,
  DiscountCoupon,
  PromotionalCampaign,
  ReferralAnalytics,
  DiscountAnalytics,
} from '../../services/referralDiscountService';
import ReferralProgramDialog from '../../components/referral/ReferralProgramDialog';
import DiscountCouponDialog from '../../components/referral/DiscountCouponDialog';
import PromotionalCampaignDialog from '../../components/referral/PromotionalCampaignDialog';
import ReferralAnalyticsComponent from '../../components/referral/ReferralAnalytics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`referral-tabpanel-${index}`}
      aria-labelledby={`referral-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReferralDiscountManagementPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [referralPrograms, setReferralPrograms] = useState<ReferralProgram[]>([]);
  const [discountCoupons, setDiscountCoupons] = useState<DiscountCoupon[]>([]);
  const [promotionalCampaigns, setPromotionalCampaigns] = useState<PromotionalCampaign[]>([]);
  const [referralAnalytics, setReferralAnalytics] = useState<ReferralAnalytics | null>(null);
  const [discountAnalytics, setDiscountAnalytics] = useState<DiscountAnalytics | null>(null);

  // Dialog state
  const [referralProgramDialogOpen, setReferralProgramDialogOpen] = useState(false);
  const [discountCouponDialogOpen, setDiscountCouponDialogOpen] = useState(false);
  const [promotionalCampaignDialogOpen, setPromotionalCampaignDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  // Edit state
  const [editingReferralProgram, setEditingReferralProgram] = useState<ReferralProgram | null>(null);
  const [editingDiscountCoupon, setEditingDiscountCoupon] = useState<DiscountCoupon | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<PromotionalCampaign | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [programsResponse, couponsResponse, campaignsResponse, referralAnalyticsResponse, discountAnalyticsResponse] = await Promise.all([
        referralDiscountService.getReferralPrograms(),
        referralDiscountService.getDiscountCoupons(),
        referralDiscountService.getPromotionalCampaigns(),
        referralDiscountService.getReferralAnalytics(),
        referralDiscountService.getDiscountAnalytics(),
      ]);

      setReferralPrograms(programsResponse.data);
      setDiscountCoupons(couponsResponse.data);
      setPromotionalCampaigns(campaignsResponse.data);
      setReferralAnalytics(referralAnalyticsResponse.data);
      setDiscountAnalytics(discountAnalyticsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateReferralProgram = () => {
    setEditingReferralProgram(null);
    setReferralProgramDialogOpen(true);
  };

  const handleEditReferralProgram = (program: ReferralProgram) => {
    setEditingReferralProgram(program);
    setReferralProgramDialogOpen(true);
  };

  const handleDeleteReferralProgram = (program: ReferralProgram) => {
    setItemToDelete({ type: 'referral_program', id: program.id, name: program.name });
    setDeleteConfirmOpen(true);
  };

  const handleCreateDiscountCoupon = () => {
    setEditingDiscountCoupon(null);
    setDiscountCouponDialogOpen(true);
  };

  const handleEditDiscountCoupon = (coupon: DiscountCoupon) => {
    setEditingDiscountCoupon(coupon);
    setDiscountCouponDialogOpen(true);
  };

  const handleDeleteDiscountCoupon = (coupon: DiscountCoupon) => {
    setItemToDelete({ type: 'discount_coupon', id: coupon.id, name: coupon.name });
    setDeleteConfirmOpen(true);
  };

  const handleCreatePromotionalCampaign = () => {
    setEditingCampaign(null);
    setPromotionalCampaignDialogOpen(true);
  };

  const handleEditPromotionalCampaign = (campaign: PromotionalCampaign) => {
    setEditingCampaign(campaign);
    setPromotionalCampaignDialogOpen(true);
  };

  const handleDeletePromotionalCampaign = (campaign: PromotionalCampaign) => {
    setItemToDelete({ type: 'promotional_campaign', id: campaign.id, name: campaign.name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      switch (itemToDelete.type) {
        case 'referral_program':
          await referralDiscountService.deleteReferralProgram(itemToDelete.id);
          setReferralPrograms(prev => prev.filter(p => p.id !== itemToDelete.id));
          break;
        case 'discount_coupon':
          // Note: You might want to add a delete endpoint for coupons
          toast.info('Coupon deletion not implemented yet');
          break;
        case 'promotional_campaign':
          // Note: You might want to add a delete endpoint for campaigns
          toast.info('Campaign deletion not implemented yet');
          break;
      }
      toast.success('Item deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item');
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'success';
      case 'pending':
      case 'draft':
        return 'warning';
      case 'inactive':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Referral & Discount Management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            Referral & Discount Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage referral programs, discount coupons, and promotional campaigns
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setAnalyticsDialogOpen(true)}
          >
            Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Referrals
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {referralAnalytics?.total_referrals || 0}
                </Typography>
              </Box>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Successful Referrals
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {referralAnalytics?.successful_referrals || 0}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Discounts
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  ₹{discountAnalytics?.total_discount_given || 0}
                </Typography>
              </Box>
              <CouponIcon sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Active Campaigns
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {promotionalCampaigns.filter(c => c.status === 'active').length}
                </Typography>
              </Box>
              <CampaignIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="referral management tabs">
          <Tab label="Referral Programs" />
          <Tab label="Discount Coupons" />
          <Tab label="Promotional Campaigns" />
        </Tabs>

        {/* Referral Programs Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Referral Programs</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateReferralProgram}
            >
              Create Program
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {referralPrograms.map((program) => (
              <Card key={program.id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {program.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {program.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={program.is_active ? 'Active' : 'Inactive'}
                      color={program.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Referral Code
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                        {program.referral_code}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(program.referral_code)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Referrer Bonus
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {program.referrer_bonus_value}% {program.referrer_bonus_type}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Referee Bonus
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {program.referee_bonus_value}% {program.referee_bonus_type}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Referrals
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {program.total_referrals || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Successful
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {program.successful_referrals || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Value
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{program.total_referral_value || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEditReferralProgram(program)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteReferralProgram(program)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                    <IconButton size="small">
                      <QrCodeIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Discount Coupons Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Discount Coupons</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDiscountCoupon}
            >
              Create Coupon
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {discountCoupons.map((coupon) => (
              <Card key={coupon.id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {coupon.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {coupon.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={coupon.is_active ? 'Active' : 'Inactive'}
                      color={coupon.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Coupon Code
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                        {coupon.code}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Discount
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {coupon.discount_value}
                        {coupon.discount_type === 'percentage' ? '%' : coupon.discount_type === 'fixed' ? '₹' : ' hours'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Min Order
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{coupon.min_order_amount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Usage
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {coupon.usage_count}/{coupon.usage_limit || '∞'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEditDiscountCoupon(coupon)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteDiscountCoupon(coupon)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Promotional Campaigns Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Promotional Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePromotionalCampaign}
            >
              Create Campaign
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {promotionalCampaigns.map((campaign) => (
              <Card key={campaign.id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={campaign.status}
                      color={getStatusColor(campaign.status) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.campaign_type}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Target
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.target_audience}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{campaign.budget || 0}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reach
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.actual_reach}/{campaign.expected_reach || '∞'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Conversions
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.actual_conversions}/{campaign.expected_conversions || '∞'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ROI
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.roi.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEditPromotionalCampaign(campaign)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePromotionalCampaign(campaign)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AnalyticsIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <ReferralProgramDialog
        open={referralProgramDialogOpen}
        onClose={() => setReferralProgramDialogOpen(false)}
        onSave={loadData}
        program={editingReferralProgram}
      />

      <DiscountCouponDialog
        open={discountCouponDialogOpen}
        onClose={() => setDiscountCouponDialogOpen(false)}
        onSave={loadData}
        coupon={editingDiscountCoupon}
      />

      <PromotionalCampaignDialog
        open={promotionalCampaignDialogOpen}
        onClose={() => setPromotionalCampaignDialogOpen(false)}
        onSave={loadData}
        campaign={editingCampaign}
      />

      <ReferralAnalyticsComponent
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        referralAnalytics={referralAnalytics}
        discountAnalytics={discountAnalytics}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </Box>
  );
};

export default ReferralDiscountManagementPage;
