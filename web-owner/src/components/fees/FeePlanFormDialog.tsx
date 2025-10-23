import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Stepper, Step, StepLabel, Typography, Box, Chip, FormControl,
  InputLabel, Select, Alert, Divider, FormControlLabel, Switch, Slider,
  InputAdornment, List, ListItem, ListItemText, IconButton, Paper,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  ArrowBack, ArrowForward, Save, Add, Delete, Info,
  WbSunny, Brightness3, AcUnit, LocalOffer,
} from '@mui/icons-material';

interface FeePlanFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
  editMode: boolean;
  initialData?: any;
}

const steps = ['Basic Info', 'Pricing Structure', 'Discounts & Offers', 'Review'];

const FeePlanFormDialog: React.FC<FeePlanFormProps> = ({ open, onClose, onSave, editMode, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'monthly',
    basePrice: initialData?.basePrice || 0,
    status: initialData?.status || 'active',
    
    // Shift Pricing
    enableShiftPricing: initialData?.shiftPricing ? Object.keys(initialData.shiftPricing).length > 0 : false,
    shiftPricing: initialData?.shiftPricing || {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
    
    // Zone Pricing
    enableZonePricing: initialData?.zonePricing ? Object.keys(initialData.zonePricing).length > 0 : false,
    zonePricing: initialData?.zonePricing || {
      ac: 0,
      nonAc: 0,
      premium: 0,
      quiet: 0,
      general: 0,
    },
    
    // Discounts
    enableDiscount: initialData?.discount ? true : false,
    discount: initialData?.discount || {
      type: 'percentage',
      value: 0,
      validFrom: '',
      validTo: '',
    },
    
    // Features
    features: initialData?.features || [],
    newFeature: '',
    
    // Limits
    maxSeats: initialData?.maxSeats || undefined,
    maxHours: initialData?.maxHours || undefined,
    
    // Scholarship & Waiver
    scholarshipEligible: initialData?.scholarshipEligible || false,
    waiverAllowed: initialData?.waiverAllowed || false,
    
    // Popular
    isPopular: initialData?.isPopular || false,
  });

  const [errors, setErrors] = useState<any>({});

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};
    
    if (step === 0) {
      if (!formData.name) newErrors.name = 'Plan name is required';
      if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = 'Base price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, prev.newFeature.trim()],
        newFeature: '',
      }));
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_: string, idx: number) => idx !== index),
    }));
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      // Prepare final data
      const planData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        basePrice: formData.basePrice,
        status: formData.status,
        features: formData.features,
        maxSeats: formData.maxSeats,
        maxHours: formData.maxHours,
        scholarshipEligible: formData.scholarshipEligible,
        waiverAllowed: formData.waiverAllowed,
        isPopular: formData.isPopular,
        shiftPricing: formData.enableShiftPricing ? formData.shiftPricing : undefined,
        zonePricing: formData.enableZonePricing ? formData.zonePricing : undefined,
        discount: formData.enableDiscount ? formData.discount : undefined,
      };
      
      onSave(planData);
      onClose();
      setActiveStep(0);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info">
                Define the basic information for your fee plan
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Plan Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Premium Monthly, Basic Hourly"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the plan benefits"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Plan Type *</InputLabel>
                <Select
                  value={formData.type}
                  label="Plan Type *"
                  onChange={(e) => handleChange('type', e.target.value)}
                >
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price *"
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value))}
                error={!!errors.basePrice}
                helperText={errors.basePrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Optional Settings" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Seats"
                type="number"
                value={formData.maxSeats || ''}
                onChange={(e) => handleChange('maxSeats', e.target.value ? parseInt(e.target.value) : undefined)}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Hours (per period)"
                type="number"
                value={formData.maxHours || ''}
                onChange={(e) => handleChange('maxHours', e.target.value ? parseInt(e.target.value) : undefined)}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPopular}
                    onChange={(e) => handleChange('isPopular', e.target.checked)}
                  />
                }
                label="Mark as Popular"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.scholarshipEligible}
                    onChange={(e) => handleChange('scholarshipEligible', e.target.checked)}
                  />
                }
                label="Scholarship Eligible"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.waiverAllowed}
                    onChange={(e) => handleChange('waiverAllowed', e.target.checked)}
                  />
                }
                label="Allow Waivers"
              />
            </Grid>
          </Grid>
        );

      case 1: // Pricing Structure
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Configure advanced pricing based on shifts and zones
              </Alert>
            </Grid>
            
            {/* Shift-based Pricing */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableShiftPricing}
                      onChange={(e) => handleChange('enableShiftPricing', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">Shift-based Pricing</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Different prices for different time slots
                      </Typography>
                    </Box>
                  }
                />
                
                {formData.enableShiftPricing && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Morning (6 AM - 12 PM)"
                        type="number"
                        value={formData.shiftPricing.morning}
                        onChange={(e) => handleNestedChange('shiftPricing', 'morning', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          endAdornment: <WbSunny sx={{ color: 'orange' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Afternoon (12 PM - 6 PM)"
                        type="number"
                        value={formData.shiftPricing.afternoon}
                        onChange={(e) => handleNestedChange('shiftPricing', 'afternoon', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Evening (6 PM - 10 PM)"
                        type="number"
                        value={formData.shiftPricing.evening}
                        onChange={(e) => handleNestedChange('shiftPricing', 'evening', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          endAdornment: <Brightness3 sx={{ color: 'primary.main' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Night (10 PM - 6 AM)"
                        type="number"
                        value={formData.shiftPricing.night}
                        onChange={(e) => handleNestedChange('shiftPricing', 'night', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Zone-based Pricing */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableZonePricing}
                      onChange={(e) => handleChange('enableZonePricing', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">Zone-based Pricing</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Different prices for AC/Non-AC and premium zones
                      </Typography>
                    </Box>
                  }
                />
                
                {formData.enableZonePricing && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="AC Zone"
                        type="number"
                        value={formData.zonePricing.ac}
                        onChange={(e) => handleNestedChange('zonePricing', 'ac', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          endAdornment: <AcUnit sx={{ color: 'info.main' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Non-AC Zone"
                        type="number"
                        value={formData.zonePricing.nonAc}
                        onChange={(e) => handleNestedChange('zonePricing', 'nonAc', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Premium Zone"
                        type="number"
                        value={formData.zonePricing.premium}
                        onChange={(e) => handleNestedChange('zonePricing', 'premium', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Quiet Zone"
                        type="number"
                        value={formData.zonePricing.quiet}
                        onChange={(e) => handleNestedChange('zonePricing', 'quiet', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="General Zone"
                        type="number"
                        value={formData.zonePricing.general}
                        onChange={(e) => handleNestedChange('zonePricing', 'general', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        );

      case 2: // Discounts & Offers
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info">
                Configure discounts, offers, and special features
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enableDiscount}
                      onChange={(e) => handleChange('enableDiscount', e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">Enable Discount/Offer</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Add promotional discounts to this plan
                      </Typography>
                    </Box>
                  }
                />
                
                {formData.enableDiscount && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                          value={formData.discount.type}
                          label="Discount Type"
                          onChange={(e) => handleNestedChange('discount', 'type', e.target.value)}
                        >
                          <MenuItem value="percentage">Percentage (%)</MenuItem>
                          <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Discount Value"
                        type="number"
                        value={formData.discount.value}
                        onChange={(e) => handleNestedChange('discount', 'value', parseFloat(e.target.value))}
                        InputProps={{
                          startAdornment: formData.discount.type === 'fixed' ? 
                            <InputAdornment position="start">₹</InputAdornment> : undefined,
                          endAdornment: formData.discount.type === 'percentage' ? 
                            <InputAdornment position="end">%</InputAdornment> : undefined,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Valid From"
                        type="date"
                        value={formData.discount.validFrom}
                        onChange={(e) => handleNestedChange('discount', 'validFrom', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Valid To"
                        type="date"
                        value={formData.discount.validTo}
                        onChange={(e) => handleNestedChange('discount', 'validTo', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Plan Features" size="small" />
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Add Feature"
                  value={formData.newFeature}
                  onChange={(e) => handleChange('newFeature', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  placeholder="e.g., WiFi, Locker, Coffee"
                />
                <Button
                  variant="contained"
                  onClick={handleAddFeature}
                  startIcon={<Add />}
                  disabled={!formData.newFeature.trim()}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              {formData.features.length > 0 ? (
                <List>
                  {formData.features.map((feature: string, idx: number) => (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveFeature(idx)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No features added yet. Add features to highlight plan benefits.</Alert>
              )}
            </Grid>
          </Grid>
        );

      case 3: // Review
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="success">
                Review your fee plan details before saving
              </Alert>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{formData.name}</Typography>
                {formData.description && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formData.description}
                  </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                  <Chip label={formData.type} size="small" sx={{ mr: 1 }} />
                  {formData.isPopular && <Chip label="Popular" color="primary" size="small" sx={{ mr: 1 }} />}
                  {formData.scholarshipEligible && <Chip label="Scholarship" color="info" size="small" sx={{ mr: 1 }} />}
                  {formData.waiverAllowed && <Chip label="Waiver" color="secondary" size="small" />}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Base Price</Typography>
                <Typography variant="h5" color="primary">₹{formData.basePrice}</Typography>
                {formData.enableDiscount && (
                  <Chip
                    label={`${formData.discount.value}${formData.discount.type === 'percentage' ? '%' : '₹'} OFF`}
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Features</Typography>
                <Typography variant="body2">{formData.features.length} features included</Typography>
              </Paper>
            </Grid>

            {formData.enableShiftPricing && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Shift Pricing</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.shiftPricing.morning > 0 && (
                      <Chip label={`Morning: ₹${formData.shiftPricing.morning}`} size="small" variant="outlined" />
                    )}
                    {formData.shiftPricing.afternoon > 0 && (
                      <Chip label={`Afternoon: ₹${formData.shiftPricing.afternoon}`} size="small" variant="outlined" />
                    )}
                    {formData.shiftPricing.evening > 0 && (
                      <Chip label={`Evening: ₹${formData.shiftPricing.evening}`} size="small" variant="outlined" />
                    )}
                    {formData.shiftPricing.night > 0 && (
                      <Chip label={`Night: ₹${formData.shiftPricing.night}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}

            {formData.enableZonePricing && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Zone Pricing</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.zonePricing.ac > 0 && (
                      <Chip label={`AC: ₹${formData.zonePricing.ac}`} size="small" variant="outlined" />
                    )}
                    {formData.zonePricing.nonAc > 0 && (
                      <Chip label={`Non-AC: ₹${formData.zonePricing.nonAc}`} size="small" variant="outlined" />
                    )}
                    {formData.zonePricing.premium > 0 && (
                      <Chip label={`Premium: ₹${formData.zonePricing.premium}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Fee Plan' : 'Create New Fee Plan'}
        <Typography variant="caption" display="block" color="text.secondary">
          Step {activeStep + 1} of {steps.length}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Save />}
            >
              {editMode ? 'Update Plan' : 'Create Plan'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FeePlanFormDialog;

