// ============================================
// TENANT ONBOARDING PAGE
// Multi-step wizard for onboarding new library tenants
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Business,
  Person,
  CreditCard,
  Settings as SettingsIcon,
  CheckCircle,
  Upload,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward,
  Save,
} from '@mui/icons-material';

const steps = [
  'Company Information',
  'Plan Selection',
  'Payment Setup',
  'Configuration',
  'Review & Complete',
];

const TenantOnboarding: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst: '',
    pan: '',
    
    // Step 2: Plan
    selectedPlan: 'starter',
    billingCycle: 'monthly',
    
    // Step 3: Payment
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: '',
    
    // Step 4: Configuration
    libraryCount: '1',
    estimatedSeats: '50',
    features: {
      sms: true,
      whatsapp: false,
      email: true,
      qrCode: true,
      faceRecognition: false,
    },
    
    // Admin user
    adminPassword: '',
    adminConfirmPassword: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: checked },
    }));
  };

  const handleSubmit = () => {
    // Implementation: Submit onboarding data
    console.log('Onboarding data:', formData);
    alert('Tenant onboarded successfully!');
  };

  // Plans data
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['1 library', '50 seats', '2 staff', 'Basic analytics', 'Email support'],
      color: '#9E9E9E',
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 2999,
      annualPrice: 28790,
      features: ['2 libraries', '200 seats', '5 staff', 'Multi-branch', 'WhatsApp alerts', 'Priority support'],
      color: '#2196F3',
      popular: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 9999,
      annualPrice: 95990,
      features: ['Unlimited libraries', '1000 seats', 'Unlimited staff', 'AI analytics', 'API access', 'Custom integrations'],
      color: '#9C27B0',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 24999,
      annualPrice: 239990,
      features: ['Everything in Pro', 'White-label', '24/7 support', 'SLA guarantee', 'Custom development', 'Dedicated manager'],
      color: '#E91E63',
    },
  ];

  // Step 1: Company Information
  const renderCompanyInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Company Information
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Enter the library owner's company details
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Company/Library Name"
          required
          fullWidth
          value={formData.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          placeholder="e.g., City Central Library"
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Owner Name"
            required
            fullWidth
            value={formData.ownerName}
            onChange={(e) => handleChange('ownerName', e.target.value)}
            placeholder="e.g., Rajesh Kumar"
          />
          <TextField
            label="Email"
            required
            fullWidth
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="rajesh@library.com"
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Phone Number"
            required
            fullWidth
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
          <TextField
            label="GST Number"
            fullWidth
            value={formData.gst}
            onChange={(e) => handleChange('gst', e.target.value)}
            placeholder="22AAAAA0000A1Z5"
          />
        </Stack>

        <TextField
          label="Address"
          required
          fullWidth
          multiline
          rows={2}
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Street address"
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="City"
            required
            fullWidth
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <TextField
            label="State"
            required
            fullWidth
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
          <TextField
            label="Pincode"
            required
            fullWidth
            value={formData.pincode}
            onChange={(e) => handleChange('pincode', e.target.value)}
          />
        </Stack>

        <TextField
          label="PAN Number"
          fullWidth
          value={formData.pan}
          onChange={(e) => handleChange('pan', e.target.value)}
          placeholder="ABCDE1234F"
        />
      </Stack>
    </Box>
  );

  // Step 2: Plan Selection
  const renderPlanSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Choose a Subscription Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Select the best plan for the library's needs
      </Typography>

      {/* Billing Cycle */}
      <Box sx={{ mb: 3 }}>
        <RadioGroup
          row
          value={formData.billingCycle}
          onChange={(e) => handleChange('billingCycle', e.target.value)}
        >
          <FormControlLabel value="monthly" control={<Radio />} label="Monthly" />
          <FormControlLabel
            value="annual"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Annual <Chip label="Save 20%" size="small" color="success" />
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      {/* Plans Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {plans.map((plan) => (
          <Card
            key={plan.id}
            sx={{
              border: formData.selectedPlan === plan.id ? 3 : 1,
              borderColor: formData.selectedPlan === plan.id ? plan.color : 'divider',
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                boxShadow: 3,
              },
            }}
            onClick={() => handleChange('selectedPlan', plan.id)}
          >
            {plan.popular && (
              <Chip
                label="Popular"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: plan.color,
                  color: 'white',
                }}
              />
            )}
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {plan.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                {plan.id === 'free' ? (
                  <Typography variant="h4" fontWeight="bold">
                    Free
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight="bold">
                      ₹{formData.billingCycle === 'monthly' ? plan.monthlyPrice?.toLocaleString() : plan.annualPrice?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per {formData.billingCycle === 'monthly' ? 'month' : 'year'}
                    </Typography>
                  </>
                )}
              </Box>
              <Stack spacing={1}>
                {plan.features.map((feature, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <CheckCircle sx={{ fontSize: 16, color: plan.color }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Step 3: Payment Setup
  const renderPaymentSetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Payment Information
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Set up payment method for subscriptions
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <RadioGroup
          row
          value={formData.paymentMethod}
          onChange={(e) => handleChange('paymentMethod', e.target.value)}
        >
          <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
          <FormControlLabel value="upi" control={<Radio />} label="UPI" />
          <FormControlLabel value="bank" control={<Radio />} label="Bank Transfer" />
        </RadioGroup>
      </FormControl>

      {formData.paymentMethod === 'card' && (
        <Stack spacing={3}>
          <TextField
            label="Card Number"
            required
            fullWidth
            value={formData.cardNumber}
            onChange={(e) => handleChange('cardNumber', e.target.value)}
            placeholder="1234 5678 9012 3456"
            InputProps={{
              endAdornment: <CreditCard />,
            }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Expiry Date"
              required
              fullWidth
              value={formData.cardExpiry}
              onChange={(e) => handleChange('cardExpiry', e.target.value)}
              placeholder="MM/YY"
            />
            <TextField
              label="CVV"
              required
              fullWidth
              value={formData.cardCVV}
              onChange={(e) => handleChange('cardCVV', e.target.value)}
              placeholder="123"
              type="password"
            />
          </Stack>
        </Stack>
      )}

      {formData.paymentMethod === 'upi' && (
        <TextField
          label="UPI ID"
          required
          fullWidth
          value={formData.upiId}
          onChange={(e) => handleChange('upiId', e.target.value)}
          placeholder="username@upi"
        />
      )}

      {formData.paymentMethod === 'bank' && (
        <Alert severity="info">
          Bank transfer details will be sent via email after onboarding completion.
        </Alert>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        You will be charged ₹
        {formData.selectedPlan === 'free'
          ? '0'
          : plans.find((p) => p.id === formData.selectedPlan)?.[
              formData.billingCycle === 'monthly' ? 'monthlyPrice' : 'annualPrice'
            ]?.toLocaleString()}{' '}
        today. Your subscription will auto-renew every{' '}
        {formData.billingCycle === 'monthly' ? 'month' : 'year'}.
      </Alert>
    </Box>
  );

  // Step 4: Configuration
  const renderConfiguration = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Initial Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Set up initial library configuration
      </Typography>

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Number of Libraries"
            required
            fullWidth
            type="number"
            value={formData.libraryCount}
            onChange={(e) => handleChange('libraryCount', e.target.value)}
          />
          <TextField
            label="Estimated Total Seats"
            required
            fullWidth
            type="number"
            value={formData.estimatedSeats}
            onChange={(e) => handleChange('estimatedSeats', e.target.value)}
          />
        </Stack>

        <Divider />

        <Typography variant="subtitle1" fontWeight="bold">
          Enable Features
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.features.sms}
                onChange={(e) => handleFeatureChange('sms', e.target.checked)}
              />
            }
            label="SMS Notifications"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.features.whatsapp}
                onChange={(e) => handleFeatureChange('whatsapp', e.target.checked)}
              />
            }
            label="WhatsApp Notifications"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.features.email}
                onChange={(e) => handleFeatureChange('email', e.target.checked)}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.features.qrCode}
                onChange={(e) => handleFeatureChange('qrCode', e.target.checked)}
              />
            }
            label="QR Code Attendance"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.features.faceRecognition}
                onChange={(e) => handleFeatureChange('faceRecognition', e.target.checked)}
              />
            }
            label="Face Recognition (Beta)"
          />
        </FormGroup>

        <Divider />

        <Typography variant="subtitle1" fontWeight="bold">
          Admin User Credentials
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          These credentials will be used by the library owner to access their dashboard
        </Alert>

        <TextField
          label="Admin Email"
          fullWidth
          value={formData.email}
          disabled
          helperText="Admin email (same as company email)"
        />

        <TextField
          label="Admin Password"
          required
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={formData.adminPassword}
          onChange={(e) => handleChange('adminPassword', e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm Password"
          required
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={formData.adminConfirmPassword}
          onChange={(e) => handleChange('adminConfirmPassword', e.target.value)}
          error={
            formData.adminConfirmPassword !== '' &&
            formData.adminPassword !== formData.adminConfirmPassword
          }
          helperText={
            formData.adminConfirmPassword !== '' &&
            formData.adminPassword !== formData.adminConfirmPassword
              ? 'Passwords do not match'
              : ''
          }
        />
      </Stack>
    </Box>
  );

  // Step 5: Review & Complete
  const renderReview = () => {
    const selectedPlan = plans.find((p) => p.id === formData.selectedPlan);
    const planPrice =
      selectedPlan?.[formData.billingCycle === 'monthly' ? 'monthlyPrice' : 'annualPrice'] || 0;

    return (
      <Box>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Review & Complete
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Review all information before completing onboarding
        </Typography>

        <Stack spacing={3}>
          {/* Company Info */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Company Information
                </Typography>
                <Button size="small" onClick={() => setActiveStep(0)}>
                  Edit
                </Button>
              </Stack>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Company Name
                    </Typography>
                    <Typography variant="body2">{formData.companyName}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Owner Name
                    </Typography>
                    <Typography variant="body2">{formData.ownerName}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">{formData.email}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2">{formData.phone}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Plan */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Subscription Plan
                </Typography>
                <Button size="small" onClick={() => setActiveStep(1)}>
                  Edit
                </Button>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label={selectedPlan?.name} color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  ₹{planPrice.toLocaleString()}/{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Configuration
                </Typography>
                <Button size="small" onClick={() => setActiveStep(3)}>
                  Edit
                </Button>
              </Stack>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Libraries
                    </Typography>
                    <Typography variant="body2">{formData.libraryCount}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Estimated Seats
                    </Typography>
                    <Typography variant="body2">{formData.estimatedSeats}</Typography>
                  </Box>
                </Stack>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Enabled Features
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(formData.features)
                      .filter(([_, enabled]) => enabled)
                      .map(([feature]) => (
                        <Chip
                          key={feature}
                          label={feature.replace(/([A-Z])/g, ' $1').trim()}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="subtitle2" fontWeight="bold">
              Ready to Onboard!
            </Typography>
            <Typography variant="body2">
              Click "Complete Onboarding" to create the tenant account and send welcome email to{' '}
              <strong>{formData.email}</strong>
            </Typography>
          </Alert>
        </Stack>
      </Box>
    );
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderCompanyInfo();
      case 1:
        return renderPlanSelection();
      case 2:
        return renderPaymentSetup();
      case 3:
        return renderConfiguration();
      case 4:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tenant Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete onboarding wizard for new library tenant
        </Typography>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={((activeStep + 1) / steps.length) * 100}
        sx={{ mb: 3, height: 8, borderRadius: 1 }}
      />

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    icon:
                      index === 0 ? (
                        <Business />
                      ) : index === 1 ? (
                        <Person />
                      ) : index === 2 ? (
                        <CreditCard />
                      ) : index === 3 ? (
                        <SettingsIcon />
                      ) : (
                        <CheckCircle />
                      ),
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>{getStepContent(activeStep)}</CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Back
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<CheckCircle />}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
                },
              }}
            >
              Complete Onboarding
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TenantOnboarding;

