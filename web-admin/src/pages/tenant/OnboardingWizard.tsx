import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress

  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  createTenant,
  saveOnboardingProgress,
  clearOnboardingProgress
} from '../../store/slices/tenantSlice';
import { ROUTES } from '../../constants';

// Step Components
import BusinessInfoStep from '../../components/tenant/BusinessInfoStep';
import ContactInfoStep from '../../components/tenant/ContactInfoStep';
import PlanSelectionStep from '../../components/tenant/PlanSelectionStep';
import PaymentSetupStep from '../../components/tenant/PaymentSetupStep';
import BrandingStep from '../../components/tenant/BrandingStep';
import ReviewSubmitStep from '../../components/tenant/ReviewSubmitStep';

/**
 * Tenant Onboarding Wizard
 * 6-step wizard for new tenant registration
 * Built with React Hook Form for optimal performance
 * 
 * @author Agent 2 - Senior Full-Stack Developer (20+ years)
 */

const steps = [
  'Business Information',
  'Contact Details',
  'Select Plan',
  'Payment Setup',
  'Branding',
  'Confirmation',
];

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { onboardingProgress, onboardingLoading, onboardingError } = useAppSelector(
    (state) => state.tenant
  );

  // Local state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // React Hook Form
  const methods = useForm({
    mode: 'onChange',
    defaultValues: onboardingProgress?.data || {}});

  // Load saved progress on mount
  useEffect(() => {
    if (onboardingProgress) {
      setActiveStep(onboardingProgress.currentStep);
      setFormData(onboardingProgress.data);
      methods.reset(onboardingProgress.data);
    }
  }, []);

  // Handle next step
  const handleNext = async () => {
    const isValid = await methods.trigger();
    
    if (!isValid) {
      return;
    }

    const currentData = methods.getValues();
    const updatedData = { ...formData, ...currentData };
    
    setFormData(updatedData);

    // Save progress
    dispatch(saveOnboardingProgress({
      step: activeStep + 1,
      data: updatedData}));

    if (activeStep === steps.length - 1) {
      // Final step - submit
      await handleSubmit(updatedData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value}));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle submit
  const handleSubmit = async (data: any) => {
    try {
      const result = await dispatch(createTenant({
        businessInfo: {
          legalName: data.legalName,
          businessType: data.businessType,
          registrationNumber: data.registrationNumber,
          taxId: data.taxId,
          industry: data.industry,
          description: data.description},
        contactInfo: {
          email: data.email,
          phone: data.phone,
          address: {
            line1: data.addressLine1,
            line2: data.addressLine2,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country},
          website: data.website,
          socialMedia: data.socialMedia},
        owner: {
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          email: data.ownerEmail,
          phone: data.ownerPhone},
        planId: data.planId,
        billingInterval: data.billingInterval,
        paymentMethodId: data.paymentMethodId,
        branding: {
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          customDomain: data.customDomain},
        acceptedTerms: data.acceptedTerms})).unwrap();

      // Success - clear progress and redirect
      dispatch(clearOnboardingProgress());
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BusinessInfoStep formData={formData} onChange={handleFormChange} errors={errors} />;
      case 1:
        return <ContactInfoStep formData={formData} onChange={handleFormChange} errors={errors} />;
      case 2:
        return <PlanSelectionStep />;
      case 3:
        return <PaymentSetupStep formData={formData} onChange={handleFormChange} errors={errors} />;
      case 4:
        return <BrandingStep />;
      case 5:
        return <ReviewSubmitStep />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome to StudySpot
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let's get your library set up in just a few steps
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {onboardingError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {onboardingError}
          </Alert>
        )}

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleNext)}>
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={activeStep === 0 || onboardingLoading}
                onClick={handleBack}
                variant="outlined"
                size="large"
              >
                Back
              </Button>

              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={onboardingLoading}
                startIcon={onboardingLoading ? <CircularProgress size={20} /> : null}
              >
                {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              </Button>
            </Box>
          </form>
        </FormProvider>

        {/* Progress Indicator */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OnboardingWizard;

