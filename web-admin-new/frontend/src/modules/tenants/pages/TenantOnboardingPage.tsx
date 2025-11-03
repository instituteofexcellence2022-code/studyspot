// ============================================
// TENANT ONBOARDING PAGE - COMPREHENSIVE 10-STEP FLOW
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  Avatar,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Payment,
  CreditCard,
  AccountBalance,
  Palette,
  Settings,
  PersonAdd,
  VerifiedUser,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  Upload,
  Phone,
  Email,
  Security,
} from '@mui/icons-material';

const steps = [
  { label: 'Business Info', icon: <Business /> },
  { label: 'Address', icon: <LocationOn /> },
  { label: 'Plan Selection', icon: <Payment /> },
  { label: 'Billing Info', icon: <CreditCard /> },
  { label: 'Bank Details', icon: <AccountBalance /> },
  { label: 'Customization', icon: <Palette /> },
  { label: 'Features', icon: <Settings /> },
  { label: 'Admin Setup', icon: <PersonAdd /> },
  { label: 'Verification', icon: <VerifiedUser /> },
  { label: 'Review', icon: <CheckCircle /> },
];

const TenantOnboardingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  // Step 1: Business Information
  const renderBusinessInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        📋 Business Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Tell us about your library or study center
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <TextField fullWidth label="Library Name" placeholder="e.g., Central Study Library" required />
        <TextField fullWidth label="Owner Name" placeholder="e.g., Rajesh Kumar" required />
        <TextField fullWidth label="Contact Number" placeholder="+91 98765 43210" required />
        <TextField fullWidth label="Business Email" type="email" placeholder="info@library.com" required />
        <TextField fullWidth label="GST Number (Optional)" placeholder="22AAAAA0000A1Z5" />
        <TextField fullWidth label="PAN Number (Optional)" placeholder="ABCDE1234F" />
        <FormControl fullWidth required>
          <InputLabel>Business Type</InputLabel>
          <Select label="Business Type" defaultValue="">
            <MenuItem value="proprietorship">Proprietorship</MenuItem>
            <MenuItem value="partnership">Partnership</MenuItem>
            <MenuItem value="pvt_ltd">Private Limited</MenuItem>
            <MenuItem value="public_ltd">Public Limited</MenuItem>
            <MenuItem value="llp">LLP</MenuItem>
            <MenuItem value="trust">Trust</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="Established Year" type="number" placeholder="2020" />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            placeholder="Brief description of your library services"
          />
        </Box>
      </Box>
    </Box>
  );

  // Step 2: Address Information
  const renderAddressInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        📍 Address Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Where is your library located?
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField fullWidth label="Complete Address" multiline rows={2} placeholder="Street, Building, Area" required />
        </Box>
        <TextField fullWidth label="Landmark" placeholder="Near XYZ Mall" />
        <TextField fullWidth label="City" placeholder="Mumbai" required />
        <FormControl fullWidth required>
          <InputLabel>State</InputLabel>
          <Select label="State" defaultValue="">
            <MenuItem value="maharashtra">Maharashtra</MenuItem>
            <MenuItem value="delhi">Delhi</MenuItem>
            <MenuItem value="karnataka">Karnataka</MenuItem>
            <MenuItem value="tamil_nadu">Tamil Nadu</MenuItem>
            <MenuItem value="gujarat">Gujarat</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="ZIP Code" placeholder="400001" required />
        <FormControl fullWidth required>
          <InputLabel>Country</InputLabel>
          <Select label="Country" defaultValue="india">
            <MenuItem value="india">India</MenuItem>
            <MenuItem value="usa">USA</MenuItem>
            <MenuItem value="uk">UK</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControlLabel control={<Checkbox />} label="Service address is same as business address" />
        </Box>
      </Box>
    </Box>
  );

  // Step 3: Plan Selection
  const renderPlanSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        💎 Choose Your Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select the plan that fits your needs
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Starter Plan */}
        <Card sx={{ border: 2, borderColor: 'grey.300', height: '100%' }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Starter
            </Typography>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              ₹2,999<Typography variant="caption" color="text.secondary">/month</Typography>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Up to 100 students" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Basic attendance" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Fee management" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="SMS notifications" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="5GB storage" />
              </ListItem>
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Select Plan
            </Button>
          </CardContent>
        </Card>

        {/* Professional Plan */}
        <Card sx={{ border: 3, borderColor: 'primary.main', height: '100%', position: 'relative' }}>
          <Chip label="POPULAR" color="primary" size="small" sx={{ position: 'absolute', top: 16, right: 16 }} />
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Professional
            </Typography>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              ₹5,999<Typography variant="caption" color="text.secondary">/month</Typography>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Up to 500 students" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="QR Code attendance" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Online payments" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="WhatsApp + SMS" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Mobile app" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="50GB storage" />
              </ListItem>
            </List>
            <Button variant="contained" fullWidth sx={{ mt: 2 }}>
              Select Plan
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Plan */}
        <Card sx={{ border: 2, borderColor: 'grey.300', height: '100%' }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Enterprise
            </Typography>
            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              ₹14,999<Typography variant="caption" color="text.secondary">/month</Typography>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Unlimited students" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Face recognition" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Custom domain" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="White label" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="API access" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="Unlimited storage" />
              </ListItem>
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
              Select Plan
            </Button>
          </CardContent>
        </Card>
      </Box>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel>Billing Cycle</InputLabel>
        <Select label="Billing Cycle" defaultValue="monthly">
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="quarterly">Quarterly (5% off)</MenuItem>
          <MenuItem value="annual">Annual (20% off)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  // Step 4: Billing Information
  const renderBillingInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        💳 Billing Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your billing details
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <TextField fullWidth label="Billing Name" required />
        <TextField fullWidth label="Billing Email" type="email" required />
        <TextField fullWidth label="Billing Phone" required />
        <FormControl fullWidth required>
          <InputLabel>Payment Method</InputLabel>
          <Select label="Payment Method" defaultValue="">
            <MenuItem value="card">Credit/Debit Card</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
            <MenuItem value="netbanking">Net Banking</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField fullWidth label="Billing Address" multiline rows={2} required />
        </Box>
        <TextField fullWidth label="City" required />
        <TextField fullWidth label="State" required />
        <TextField fullWidth label="ZIP Code" required />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControlLabel control={<Switch defaultChecked />} label="Enable auto-pay for renewals" />
        </Box>
      </Box>
    </Box>
  );

  // Step 5: Bank Details
  const renderBankDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        🏦 Bank Account Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        For receiving student fee payments
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <TextField fullWidth label="Account Holder Name" required />
        <TextField fullWidth label="Bank Name" required />
        <TextField fullWidth label="Account Number" required />
        <TextField fullWidth label="Confirm Account Number" required />
        <TextField fullWidth label="IFSC Code" placeholder="SBIN0001234" required />
        <FormControl fullWidth required>
          <InputLabel>Account Type</InputLabel>
          <Select label="Account Type" defaultValue="">
            <MenuItem value="savings">Savings</MenuItem>
            <MenuItem value="current">Current</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="UPI ID (Optional)" placeholder="library@upi" />
        <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
          Upload Cancelled Cheque
          <input type="file" hidden accept="image/*,application/pdf" />
        </Button>
      </Box>
    </Box>
  );

  // Step 6: Customization
  const renderCustomization = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        🎨 Brand Customization
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Customize your portal appearance
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Logo
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
            Choose Logo
            <input type="file" hidden accept="image/*" />
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Recommended: 200x200px, PNG with transparent background
          </Typography>
        </Box>
        <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Color Theme
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <TextField fullWidth label="Primary" type="color" defaultValue="#E91E63" size="small" />
            <TextField fullWidth label="Secondary" type="color" defaultValue="#9C27B0" size="small" />
            <TextField fullWidth label="Accent" type="color" defaultValue="#2196F3" size="small" />
          </Box>
        </Box>
        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select label="Theme" defaultValue="light">
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="auto">Auto (System)</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="Custom Domain (Optional)" placeholder="library.yourdomain.com" />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControlLabel control={<Switch />} label="Enable white label (Remove StudySpot branding)" />
        </Box>
      </Box>
    </Box>
  );

  // Step 7: Features Configuration
  const renderFeaturesConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        ⚙️ Features Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the features you want to enable
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Phone sx={{ verticalAlign: 'middle', mr: 1 }} />
            Attendance Management
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Manual Attendance" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="QR Code Entry" />
            <FormControlLabel control={<Checkbox />} label="Biometric" />
            <FormControlLabel control={<Checkbox />} label="Face Recognition" />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
            Fee Management
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Online Payments" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Installment Support" />
            <FormControlLabel control={<Checkbox />} label="Late Fee Calculation" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Payment Reminders" />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
            Communication
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="SMS" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="WhatsApp" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Email" />
            <FormControlLabel control={<Checkbox />} label="Push Notifications" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Bulk Messaging" />
            <FormControlLabel control={<Checkbox />} label="Scheduled Messages" />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Settings sx={{ verticalAlign: 'middle', mr: 1 }} />
            Other Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Analytics Dashboard" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Mobile App" />
            <FormControlLabel control={<Checkbox />} label="Parent App" />
            <FormControlLabel control={<Checkbox />} label="Custom Reports" />
            <FormControlLabel control={<Checkbox />} label="API Access" />
            <FormControlLabel control={<Checkbox />} label="Webhooks" />
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  // Step 8: Admin Setup
  const renderAdminSetup = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        👤 Admin User Setup
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Create the primary admin account
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <TextField fullWidth label="First Name" required />
        <TextField fullWidth label="Last Name" required />
        <TextField fullWidth label="Email" type="email" required />
        <TextField fullWidth label="Phone Number" required />
        <TextField fullWidth label="Password" type="password" required />
        <TextField fullWidth label="Confirm Password" type="password" required />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
            Security Settings
          </Typography>
        </Box>
        <FormControlLabel control={<Switch defaultChecked />} label="Enable Two-Factor Authentication" />
        <FormControl fullWidth>
          <InputLabel>Password Policy</InputLabel>
          <Select label="Password Policy" defaultValue="standard">
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="strict">Strict</MenuItem>
          </Select>
        </FormControl>
        <TextField fullWidth label="Session Timeout (minutes)" type="number" defaultValue="30" />
      </Box>
    </Box>
  );

  // Step 9: Verification
  const renderVerification = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        ✅ Document Verification
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload required documents for verification
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Paper sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
          <Typography variant="subtitle2" gutterBottom>
            PAN Card
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
            Upload PAN Card
            <input type="file" hidden accept="image/*,application/pdf" />
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Required for tax purposes
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
          <Typography variant="subtitle2" gutterBottom>
            GST Certificate (Optional)
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
            Upload GST Certificate
            <input type="file" hidden accept="image/*,application/pdf" />
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            If your business is GST registered
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
          <Typography variant="subtitle2" gutterBottom>
            Business License
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
            Upload License
            <input type="file" hidden accept="image/*,application/pdf" />
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Business registration or license document
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, border: 1, borderColor: 'grey.300' }}>
          <Typography variant="subtitle2" gutterBottom>
            Address Proof
          </Typography>
          <Button variant="outlined" component="label" fullWidth startIcon={<Upload />}>
            Upload Address Proof
            <input type="file" hidden accept="image/*,application/pdf" />
          </Button>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Utility bill, lease agreement, etc.
          </Typography>
        </Paper>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Verification Process:</strong> Your documents will be reviewed within 24-48 hours.
              You'll receive an email once verification is complete.
            </Typography>
          </Alert>
        </Box>
      </Box>
    </Box>
  );

  // Step 10: Review & Submit
  const renderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        📋 Review & Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review your information before submitting
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Business Information
          </Typography>
          <Typography variant="body2">Library Name: Central Study Library</Typography>
          <Typography variant="body2">Owner: Rajesh Kumar</Typography>
          <Typography variant="body2">Email: info@library.com</Typography>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Selected Plan
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip label="Professional" color="primary" />
            <Typography variant="body2">₹5,999/month</Typography>
            <Typography variant="body2">Billing: Monthly</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Features Enabled
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip label="QR Code Attendance" size="small" />
            <Chip label="Online Payments" size="small" />
            <Chip label="WhatsApp Messaging" size="small" />
            <Chip label="Mobile App" size="small" />
            <Chip label="Analytics" size="small" />
          </Box>
        </Paper>

        <FormControlLabel
          control={<Checkbox required />}
          label={
            <Typography variant="body2">
              I accept the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
            </Typography>
          }
        />

        <FormControlLabel
          control={<Checkbox />}
          label="I agree to receive marketing communications"
        />

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Ready to launch!</strong> Click Submit to complete your onboarding.
            You'll receive login credentials via email.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBusinessInfo();
      case 1:
        return renderAddressInfo();
      case 2:
        return renderPlanSelection();
      case 3:
        return renderBillingInfo();
      case 4:
        return renderBankDetails();
      case 5:
        return renderCustomization();
      case 6:
        return renderFeaturesConfig();
      case 7:
        return renderAdminSetup();
      case 8:
        return renderVerification();
      case 9:
        return renderReview();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to StudySpot! 🎉
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Let's get your library set up in 10 easy steps
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="body1" fontWeight="bold">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.toFixed(0)}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Avatar
                      sx={{
                        bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  )}
                >
                  <Typography variant="caption">{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {activeStep === steps.length ? (
            <Box textAlign="center" py={5}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'success.main', mx: 'auto', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                All steps completed! 🎊
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your onboarding is complete. We're setting up your account...
              </Typography>
              <Button onClick={handleReset} variant="outlined" sx={{ mt: 2 }}>
                Start Over
              </Button>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<NavigateBefore />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <NavigateNext />}
                >
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantOnboardingPage;
