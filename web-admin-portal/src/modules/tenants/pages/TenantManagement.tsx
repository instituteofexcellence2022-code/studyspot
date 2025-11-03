// ============================================
// TENANT MANAGEMENT - INTEGRATED PAGE
// ============================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchTenants, deleteTenant, setFilters } from '../../../store/slices/tenantSlice';
import { Tenant } from '../../../types';
import { tenantOnboardingService } from '../../../services/api/tenantOnboarding';
import {
  OnboardingData,
  TenantSettings,
  BrandingSettings,
} from '../types/onboarding';

// ============================================
// TAB PANEL COMPONENT
// ============================================
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
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { tenants, loading, meta, filters } = useAppSelector((state) => state.tenant);
  
  const [tabValue, setTabValue] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  
  // Settings state
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Branding state
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(false);

  useEffect(() => {
    loadTenants();
  }, [filters]);

  useEffect(() => {
    // Load settings when switching to settings tab
    if (tabValue === 2 && !tenantSettings) {
      loadTenantSettings();
    }
    // Load branding when switching to branding tab
    if (tabValue === 3 && !brandingSettings) {
      loadBrandingSettings();
    }
  }, [tabValue]);

  const loadTenants = () => {
    dispatch(fetchTenants(filters));
  };

  const loadTenantSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await tenantOnboardingService.getTenantSettings('demo-tenant-id');
      if (response.success && response.data) {
        setTenantSettings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadBrandingSettings = async () => {
    setBrandingLoading(true);
    try {
      const response = await tenantOnboardingService.getBrandingSettings('demo-tenant-id');
      if (response.success && response.data) {
        setBrandingSettings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load branding settings');
    } finally {
      setBrandingLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ============================================
  // TAB 1: TENANT LIST HANDLERS
  // ============================================
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: event.target.value, page: 1 }));
  };

  const handleStatusFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ status: event.target.value, page: 1 }));
  };

  const handlePlanFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ subscriptionPlan: event.target.value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setFilters({ page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setFilters({ limit: newPageSize, page: 1 }));
  };

  const handleView = (id: string) => {
    navigate(`/tenants/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/tenants/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      try {
        await dispatch(deleteTenant(id)).unwrap();
        toast.success('Tenant deleted successfully');
        setDeleteConfirmId(null);
        loadTenants();
      } catch (error: any) {
        toast.error(error || 'Failed to delete tenant');
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleCreate = () => {
    // Switch to Onboarding tab and reset wizard
    setTabValue(1);
    setOnboardingStep(0);
    setOnboardingData({});
    toast.info('Complete the onboarding wizard to create a new tenant');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trial':
        return 'info';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // ============================================
  // TAB 2: ONBOARDING HANDLERS
  // ============================================
  const onboardingSteps = [
    'Business Information',
    'Contact Details',
    'Plan Selection',
    'Billing Information',
    'Customization',
  ];

  const handleOnboardingNext = async () => {
    setOnboardingLoading(true);
    try {
      await tenantOnboardingService.saveOnboardingStep('new-tenant', onboardingStep, onboardingData);
      if (onboardingStep === onboardingSteps.length - 1) {
        toast.success('Tenant created successfully!');
        setOnboardingStep(0);
        setOnboardingData({});
        // Switch back to tenant list and refresh
        setTabValue(0);
        loadTenants();
      } else {
        setOnboardingStep((prev) => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to save onboarding data');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleOnboardingBack = () => {
    setOnboardingStep((prev) => prev - 1);
  };

  // ============================================
  // TAB 3: SETTINGS HANDLERS
  // ============================================
  const handleSettingsSave = async () => {
    if (!tenantSettings) return;
    
    setSettingsLoading(true);
    try {
      await tenantOnboardingService.updateTenantSettings('demo-tenant-id', tenantSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsReset = () => {
    loadTenantSettings();
    toast.info('Settings reset to saved values');
  };

  // ============================================
  // TAB 4: BRANDING HANDLERS
  // ============================================
  const handleBrandingSave = async () => {
    if (!brandingSettings) return;
    
    setBrandingLoading(true);
    try {
      await tenantOnboardingService.updateBrandingSettings('demo-tenant-id', brandingSettings);
      toast.success('Branding saved successfully');
    } catch (error) {
      toast.error('Failed to save branding');
    } finally {
      setBrandingLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBrandingLoading(true);
    try {
      const response = await tenantOnboardingService.uploadLogo('demo-tenant-id', file);
      if (response.success && response.data) {
        setBrandingSettings((prev) => prev ? {
          ...prev,
          logo: { url: response.data!.url, uploadedAt: new Date().toISOString() },
        } : null);
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setBrandingLoading(false);
    }
  };

  // ============================================
  // DATA GRID COLUMNS
  // ============================================
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tenant Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'enterprise'
              ? 'primary'
              : params.value === 'professional'
              ? 'secondary'
              : 'default'
          }
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value as string) as any}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getSubscriptionStatusColor(params.value as string) as any}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'metadata',
      headerName: 'Libraries',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.librariesCount || 0}
        </Typography>
      ),
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 100,
      renderCell: (params: GridRenderCellParams<any, Tenant>) => (
        <Typography variant="body2">
          {params.row.metadata?.usersCount || 0}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<any, Tenant>) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleView(params.row.id)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEdit(params.row.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={deleteConfirmId === params.row.id ? 'Click again to confirm' : 'Delete'}>
            <IconButton
              size="small"
              color={deleteConfirmId === params.row.id ? 'error' : 'default'}
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tenant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all tenants, create new tenants, configure settings, and customize branding
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size="large"
        >
          Create New Tenant
        </Button>
      </Box>

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab icon={<BusinessIcon />} iconPosition="start" label="All Tenants" />
          <Tab icon={<AddIcon />} iconPosition="start" label="Create New" />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
          <Tab icon={<PaletteIcon />} iconPosition="start" label="Branding" />
        </Tabs>

        {/* Tab 1: All Tenants */}
        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Card sx={{ p: 2, mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Search"
                placeholder="Search by name, email, or slug..."
                value={filters.search}
                onChange={handleSearch}
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={handleStatusFilter}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField
                select
                label="Plan"
                value={filters.subscriptionPlan}
                onChange={handlePlanFilter}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="starter">Starter</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
              </TextField>
              <Tooltip title="Refresh">
                <IconButton color="primary" onClick={loadTenants}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Card>

          {/* Data Grid */}
          <Card>
            <DataGrid
              rows={tenants}
              columns={columns}
              loading={loading}
              pagination
              paginationMode="server"
              rowCount={meta?.total || 0}
              paginationModel={{
                page: (filters.page || 1) - 1,
                pageSize: filters.limit || 10,
              }}
              onPaginationModelChange={(model) => {
                handlePageChange(model.page);
                if (model.pageSize !== filters.limit) {
                  handlePageSizeChange(model.pageSize);
                }
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              autoHeight
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Card>
        </TabPanel>

        {/* Tab 2: Onboarding */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Create New Tenant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete the 5-step onboarding wizard to create a new tenant
                </Typography>
              </Box>
              {onboardingStep > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    setOnboardingStep(0);
                    setOnboardingData({});
                    toast.info('Onboarding wizard reset');
                  }}
                >
                  Start Over
                </Button>
              )}
            </Box>

            <Stepper activeStep={onboardingStep} sx={{ my: 4 }}>
              {onboardingSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {onboardingLoading && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ minHeight: 300, mb: 3 }}>
              {onboardingStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Business Information
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Business Name"
                      placeholder="Enter business name"
                    />
                    <TextField
                      fullWidth
                      label="Business Type"
                      select
                    >
                      <MenuItem value="library">Library</MenuItem>
                      <MenuItem value="study_center">Study Center</MenuItem>
                      <MenuItem value="coaching">Coaching Institute</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      placeholder="Enter complete address"
                    />
                  </Stack>
                </Box>
              )}

              {onboardingStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Contact Details
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Contact Person Name"
                      placeholder="Enter name"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      placeholder="contact@example.com"
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </Stack>
                </Box>
              )}

              {onboardingStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Plan Selection
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {['Free', 'Starter', 'Professional', 'Enterprise'].map((plan) => (
                      <Card
                        key={plan}
                        sx={{
                          p: 3,
                          border: 2,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {plan}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Select this plan
                        </Typography>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}

              {onboardingStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Billing Information
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      placeholder="Enter GST number"
                    />
                    <TextField
                      fullWidth
                      label="Billing Address"
                      multiline
                      rows={3}
                      placeholder="Enter billing address"
                    />
                  </Stack>
                </Box>
              )}

              {onboardingStep === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Customization
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Almost done! Review and customize your settings.
                  </Alert>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Subdomain"
                      placeholder="your-library"
                      helperText="your-library.studyspot.com"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable email notifications"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable SMS notifications"
                    />
                  </Stack>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={onboardingStep === 0 || onboardingLoading}
                onClick={handleOnboardingBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleOnboardingNext}
                disabled={onboardingLoading}
              >
                {onboardingStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </Box>
          </Card>
        </TabPanel>

        {/* Tab 3: Settings */}
        <TabPanel value={tabValue} index={2}>
          {settingsLoading && <LinearProgress sx={{ mb: 2 }} />}
          
          {tenantSettings && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight={600}>
                  Tenant Settings
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<ResetIcon />}
                    onClick={handleSettingsReset}
                    disabled={settingsLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSettingsSave}
                    disabled={settingsLoading}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </Box>

              {/* General Settings */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">General Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Timezone"
                      value={tenantSettings.general.timezone}
                      onChange={(e) =>
                        setTenantSettings({
                          ...tenantSettings,
                          general: { ...tenantSettings.general, timezone: e.target.value },
                        })
                      }
                      size="small"
                    >
                      <MenuItem value="Asia/Kolkata">Asia/Kolkata</MenuItem>
                      <MenuItem value="Asia/Dubai">Asia/Dubai</MenuItem>
                      <MenuItem value="America/New_York">America/New_York</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Language"
                      value={tenantSettings.general.language}
                      size="small"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="hi">Hindi</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Date Format"
                      value={tenantSettings.general.dateFormat}
                      size="small"
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Currency"
                      value={tenantSettings.general.currency}
                      size="small"
                    >
                      <MenuItem value="INR">INR (₹)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                    </TextField>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Operational Hours */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Operational Hours</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Opening Time"
                        type="time"
                        value={tenantSettings.operational.openingTime}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="Closing Time"
                        type="time"
                        value={tenantSettings.operational.closingTime}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Working Days: {tenantSettings.operational.workingDays.join(', ')}
                    </Typography>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Notifications */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Notifications</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.notifications.emailNotifications} />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.notifications.smsNotifications} />
                      }
                      label="SMS Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.notifications.whatsappNotifications} />
                      }
                      label="WhatsApp Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.notifications.pushNotifications} />
                      }
                      label="Push Notifications"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Features */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Features</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.features.attendance} />
                      }
                      label="Attendance Tracking"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.features.feeManagement} />
                      }
                      label="Fee Management"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.features.messaging} />
                      }
                      label="Messaging"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={tenantSettings.features.analytics} />
                      }
                      label="Reports & Analytics"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </TabPanel>

        {/* Tab 4: Branding */}
        <TabPanel value={tabValue} index={3}>
          {brandingLoading && <LinearProgress sx={{ mb: 2 }} />}
          
          {brandingSettings && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight={600}>
                  Branding & Customization
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleBrandingSave}
                  disabled={brandingLoading}
                >
                  Save Changes
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                {/* Logo Upload */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Logo
                  </Typography>
                  {brandingSettings.logo.url && (
                    <Box
                      component="img"
                      src={brandingSettings.logo.url}
                      alt="Logo"
                      sx={{ maxWidth: 200, mb: 2 }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                </Card>

                {/* Colors */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Brand Colors
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 2,
                    }}
                  >
                    {Object.entries(brandingSettings.colors).map(([key, value]) => (
                      <Box key={key}>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                          {key}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: value,
                              border: 1,
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          />
                          <TextField
                            size="small"
                            value={value}
                            onChange={(e) =>
                              setBrandingSettings({
                                ...brandingSettings,
                                colors: {
                                  ...brandingSettings.colors,
                                  [key]: e.target.value,
                                },
                              })
                            }
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>

                {/* Custom Domain */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Custom Domain
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Domain"
                      value={brandingSettings.customDomain || ''}
                      placeholder="library.example.com"
                      size="small"
                      onChange={(e) =>
                        setBrandingSettings({
                          ...brandingSettings,
                          customDomain: e.target.value,
                        })
                      }
                    />
                    <Chip
                      label={brandingSettings.domainVerified ? 'Verified' : 'Not Verified'}
                      color={brandingSettings.domainVerified ? 'success' : 'warning'}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Stack>
                </Card>

                {/* White Label */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    White Label
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch checked={brandingSettings.whiteLabel.enabled} />
                      }
                      label="Enable White Label"
                    />
                    <TextField
                      fullWidth
                      label="Custom Name"
                      value={brandingSettings.whiteLabel.customName}
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Switch checked={brandingSettings.whiteLabel.hidePoweredBy} />
                      }
                      label="Hide 'Powered by StudySpot'"
                    />
                  </Stack>
                </Card>
              </Box>
            </>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default TenantManagement;














