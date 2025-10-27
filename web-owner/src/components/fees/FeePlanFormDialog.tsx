import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment
} from '@mui/material';
import { Save, Add, Edit } from '@mui/icons-material';

interface FeePlan {
  name: string;
  description?: string;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'combo';
  basePrice: number;
  selectedShift?: string;
  selectedZone?: string;
  customShift?: {
    name: string;
    startTime: string;
    endTime: string;
  };
  customZone?: {
    name: string;
  };
  features: string[];
  newFeature: string;
  enableDiscount: boolean;
  discount?: {
    type?: 'percentage' | 'fixed';
    value?: number;
    validFrom?: string;
    validTo?: string;
  };
  isPopular: boolean;
  scholarshipEligible: boolean;
  waiverAllowed: boolean;
  status?: 'active' | 'inactive' | 'draft';
  maxSeats?: number;
  maxHours?: number;
}

interface FeePlanFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (plan: FeePlan) => void | Promise<void>;
  initialData?: Partial<FeePlan>;
  editMode?: boolean;
}

const FeePlanFormDialog: React.FC<FeePlanFormDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialData = {}, 
  editMode = false 
}) => {
  const [formData, setFormData] = useState<FeePlan>({
    name: '',
    description: '',
    type: 'hourly',
    basePrice: 0,
    selectedShift: '',
    selectedZone: '',
    customShift: undefined,
    customZone: undefined,
    features: [],
    newFeature: '',
    enableDiscount: false,
    discount: {
      type: 'percentage',
      value: 0,
      validFrom: '',
      validTo: '',
    },
    isPopular: false,
    scholarshipEligible: false,
    waiverAllowed: false,
    status: 'active',
    maxSeats: undefined,
    maxHours: undefined,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomShiftDialog, setShowCustomShiftDialog] = useState(false);
  const [showCustomZoneDialog, setShowCustomZoneDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Preview
  
  // Custom dialog states
  const [customZoneName, setCustomZoneName] = useState('');
  const [customZoneDescription, setCustomZoneDescription] = useState('');

  // Update formData when initialData changes (for edit mode)
  useEffect(() => {
    if (editMode && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [editMode, initialData]);

  // Simple handlers - NO useCallback, NO complex logic
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Name changed:', e.target.value);
    setFormData(prev => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Price changed:', e.target.value);
    setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }));
    if (errors.basePrice) {
      setErrors(prev => ({ ...prev, basePrice: '' }));
    }
  };

  const handlePopularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Popular changed:', e.target.checked);
    setFormData(prev => ({ ...prev, isPopular: e.target.checked }));
  };

  const handleScholarshipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Scholarship changed:', e.target.checked);
    setFormData(prev => ({ ...prev, scholarshipEligible: e.target.checked }));
  };

  const handleTypeChange = (e: any) => {
    console.log('Type changed:', e.target.value);
    const planType = e.target.value;
    
    // Preset descriptions based on plan type
    const presetDescriptions = {
      hourly: 'Perfect for short study sessions and flexible schedules. Pay only for the time you use.',
      daily: 'Ideal for full-day study sessions. Access all facilities for 24 hours.',
      weekly: 'Great for regular study routines. Full week access with all amenities included.',
      monthly: 'Most popular choice! Complete monthly access with premium features and priority support.',
      quarterly: 'Best value for committed students. 3-month access with exclusive benefits.',
      annual: 'Ultimate package! Full year access with maximum savings and premium perks.',
      combo: 'Flexible combination plan. Mix and match different access types as needed.'
    };
    
    setFormData(prev => ({ 
      ...prev, 
      type: planType,
      description: presetDescriptions[planType as keyof typeof presetDescriptions] || prev.description
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Description changed:', e.target.value);
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };

  const handleShiftChange = (e: any) => {
    console.log('Shift changed:', e.target.value);
    if (e.target.value === 'custom') {
      setShowCustomShiftDialog(true);
    } else if (e.target.value === 'morning' || e.target.value === 'afternoon' || e.target.value === 'evening' || e.target.value === 'night') {
      setFormData(prev => ({ 
        ...prev, 
        selectedShift: e.target.value,
        customShift: undefined // Clear custom shift when selecting predefined
      }));
    } else if (formData.customShift && e.target.value === formData.customShift.name) {
      // Custom shift is already selected, no need to change
      console.log('Custom shift already selected:', formData.customShift.name);
    }
  };

  const handleZoneChange = (e: any) => {
    console.log('Zone changed:', e.target.value);
    if (e.target.value === 'custom') {
      setShowCustomZoneDialog(true);
    } else if (e.target.value === 'ac' || e.target.value === 'non-ac') {
      setFormData(prev => ({ 
        ...prev, 
        selectedZone: e.target.value,
        customZone: undefined // Clear custom zone when selecting predefined
      }));
    } else if (formData.customZone && e.target.value === formData.customZone.name) {
      // Custom zone is already selected, no need to change
      console.log('Custom zone already selected:', formData.customZone.name);
    }
  };

  const handleWaiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Waiver changed:', e.target.checked);
    setFormData(prev => ({ ...prev, waiverAllowed: e.target.checked }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Status changed:', e.target.checked);
    setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }));
  };

  const handleMaxSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Max seats changed:', e.target.value);
    setFormData(prev => ({ ...prev, maxSeats: e.target.value ? parseInt(e.target.value) : undefined }));
  };

  const handleMaxHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Max hours changed:', e.target.value);
    setFormData(prev => ({ ...prev, maxHours: e.target.value ? parseInt(e.target.value) : undefined }));
  };

  const handleNewFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('New feature changed:', e.target.value);
    setFormData(prev => ({ ...prev, newFeature: e.target.value }));
  };

  const handleAddFeature = () => {
    console.log('Add feature clicked!');
    if (!formData.newFeature.trim()) {
      setErrors(prev => ({ ...prev, newFeature: 'Feature name cannot be empty' }));
      return;
    }
    
    const trimmedFeature = formData.newFeature.trim();
    
    if (formData.features.includes(trimmedFeature)) {
      setErrors(prev => ({ ...prev, newFeature: 'This feature already exists' }));
      return;
    }
    
      setFormData(prev => ({
        ...prev,
      features: [...prev.features, trimmedFeature],
      newFeature: ''
    }));
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.newFeature;
      return newErrors;
    });
  };

  const handleRemoveFeature = (index: number) => {
    console.log('Remove feature clicked:', index);
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleDiscountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Discount toggle changed:', e.target.checked);
    setFormData(prev => ({
      ...prev,
      enableDiscount: e.target.checked,
      discount: e.target.checked ? prev.discount : {
        type: 'percentage',
        value: 0,
        validFrom: '',
        validTo: '',
      }
    }));
  };

  const handleDiscountTypeChange = (e: any) => {
    console.log('Discount type changed:', e.target.value);
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount!, type: e.target.value }
    }));
  };

  const handleDiscountValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Discount value changed:', e.target.value);
      setFormData(prev => ({
        ...prev,
      discount: { ...prev.discount!, value: parseFloat(e.target.value) || 0 }
      }));
  };

  const handleDiscountFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Discount from changed:', e.target.value);
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount!, validFrom: e.target.value }
    }));
  };

  const handleDiscountToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Discount to changed:', e.target.value);
    setFormData(prev => ({
      ...prev,
      discount: { ...prev.discount!, validTo: e.target.value }
    }));
  };

  const handleNextStep = () => {
    if (formData.name && formData.basePrice) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleAddCustomZone = () => {
    console.log('Adding custom zone:', customZoneName);
    if (customZoneName.trim()) {
      setFormData(prev => ({
        ...prev,
        selectedZone: customZoneName.trim(),
        customZone: {
          name: customZoneName.trim(),
          description: customZoneDescription.trim()
        }
      }));
      setShowCustomZoneDialog(false);
      setCustomZoneName('');
      setCustomZoneDescription('');
    }
  };

  const handleAddCustomShift = () => {
    console.log('Adding custom shift:', customZoneName); // Using same state for now
    if (customZoneName.trim()) {
    setFormData(prev => ({
      ...prev,
        selectedShift: customZoneName.trim(),
        customShift: {
          name: customZoneName.trim(),
          startTime: '9:00 AM',
          endTime: '5:00 PM'
        }
      }));
      setShowCustomShiftDialog(false);
      setCustomZoneName('');
      setCustomZoneDescription('');
    }
  };

  const handleRemoveCustomZone = () => {
    console.log('Removing custom zone');
    setFormData(prev => ({
      ...prev,
      selectedZone: '',
      customZone: undefined
    }));
  };

  const handleRemoveCustomShift = () => {
    console.log('Removing custom shift');
    setFormData(prev => ({ 
      ...prev, 
      selectedShift: '',
      customShift: undefined
    }));
  };

  const handleAutoFill = () => {
    console.log('Auto fill clicked!');
    
    // 10 different preset combinations
    const presetCombinations = [
      {
        name: 'Basic Hourly Plan',
        basePrice: 50,
        type: 'hourly' as const,
        description: 'Perfect for short study sessions and flexible schedules. Pay only for the time you use.',
        features: ['WiFi', 'Power Outlet'],
        isPopular: false,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Daily Study Pass',
        basePrice: 300,
        type: 'daily' as const,
        description: 'Ideal for full-day study sessions. Access all facilities for 24 hours with premium amenities.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing'],
        isPopular: true,
        scholarshipEligible: true,
        waiverAllowed: false
      },
      {
        name: 'Weekly Premium',
        basePrice: 1200,
        type: 'weekly' as const,
        description: 'Great for regular study routines. Full week access with all amenities and priority support included.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support'],
        isPopular: true,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Monthly Elite',
        basePrice: 4000,
        type: 'monthly' as const,
        description: 'Most popular choice! Complete monthly access with premium features, priority support, and exclusive benefits.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support', 'Priority Booking'],
        isPopular: true,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Quarterly Scholar',
        basePrice: 10000,
        type: 'quarterly' as const,
        description: 'Best value for committed students. 3-month access with exclusive benefits and maximum savings.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support', 'Priority Booking', 'Study Materials'],
        isPopular: false,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Annual VIP',
        basePrice: 35000,
        type: 'annual' as const,
        description: 'Ultimate package! Full year access with maximum savings, premium perks, and VIP treatment.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support', 'Priority Booking', 'Study Materials', 'Personal Assistant'],
        isPopular: true,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Flexible Combo',
        basePrice: 6000,
        type: 'combo' as const,
        description: 'Flexible combination plan. Mix and match different access types as needed for ultimate convenience.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Custom Scheduling'],
        isPopular: false,
        scholarshipEligible: false,
        waiverAllowed: true
      },
      {
        name: 'Professional Package',
        basePrice: 2500,
        type: 'monthly' as const,
        description: 'Premium study experience with all modern amenities. Perfect for serious students and professionals.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Conference Room Access'],
        isPopular: false,
        scholarshipEligible: false,
        waiverAllowed: false
      },
      {
        name: 'Student Special',
        basePrice: 1800,
        type: 'monthly' as const,
        description: 'Comprehensive access package with top-tier facilities. Designed for maximum productivity and comfort.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Group Study Rooms'],
        isPopular: true,
        scholarshipEligible: true,
        waiverAllowed: true
      },
      {
        name: 'Elite Membership',
        basePrice: 8000,
        type: 'monthly' as const,
        description: 'Elite membership with exclusive privileges. Access to premium zones and personalized study assistance.',
        features: ['WiFi', 'Power Outlet', 'Locker', 'Printing', 'Premium Support', 'Priority Booking', 'Study Materials', 'Personal Assistant', 'Exclusive Lounge'],
        isPopular: true,
        scholarshipEligible: false,
        waiverAllowed: true
      }
    ];
    
    // Randomly select a combination
    const randomCombination = presetCombinations[Math.floor(Math.random() * presetCombinations.length)];
    
    setFormData(prev => ({
      ...prev,
      ...randomCombination
    }));
    setErrors({});
  };

  const handleSave = async () => {
    console.log('Save clicked!', formData);
    if (!formData.name.trim()) {
      setErrors({ name: 'Plan name is required' });
      return;
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      setErrors({ basePrice: 'Valid price is required' });
      return;
    }
    
    try {
      // Call onSave which will handle the API call from parent
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving fee plan:', error);
    }
  };

  // Completion percentage
  const completionPercentage = Math.round(
    ([formData.name, formData.basePrice, formData.features.length].filter(Boolean).length / 3) * 100
  );

  // Quick setup handler
  const handleQuickSetup = (planType: string) => {
    console.log('Quick setup clicked:', planType);
    const suggestedPrices = {
      hourly: 50,
      daily: 300,
      weekly: 1200,
      monthly: 4000,
      quarterly: 10000,
      annual: 35000,
      combo: 6000
    };
    
    setFormData(prev => ({
      ...prev,
      type: planType as FeePlan['type'],
      basePrice: suggestedPrices[planType as keyof typeof suggestedPrices],
      isPopular: planType === 'monthly' || planType === 'annual',
      scholarshipEligible: planType === 'monthly' || planType === 'quarterly' || planType === 'annual'
    }));
  };

        return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
            <DialogTitle sx={{ 
              pb: { xs: 0.2, sm: 0.3 }, 
              pt: { xs: 0.3, sm: 0.5 }, 
              px: { xs: 0.8, sm: 1 },
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 'bold'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: formData.name ? 'success.main' : 'grey.400' 
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: formData.basePrice ? 'success.main' : 'grey.400' 
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: formData.features?.length ? 'success.main' : 'grey.400' 
                  }} />
                  {currentStep === 1 ? (editMode ? '✏️ Edit Fee Plan' : '➕ Create Fee Plan') : '👁️ Preview Fee Plan'}
                </Box>
                <Chip 
                  label={`Step ${currentStep}/2`} 
                  size="small" 
                  color={currentStep === 2 ? 'success' : 'default'}
                  sx={{ fontSize: '0.7rem', height: '24px' }}
                />
              </Box>
            </DialogTitle>

      <DialogContent sx={{ p: { xs: 0.4, sm: 0.6 }, height: 'auto' }}>
        {currentStep === 1 ? (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0.3 }}>
          
          {/* Left Column - Basic Information */}
          <Box sx={{ flex: 1, p: { xs: 0.4, sm: 0.6 } }}>
            <Box sx={{ 
              p: { xs: 0.4, sm: 0.6 }, 
              border: '2px solid', 
              borderColor: 'primary.main', 
              borderRadius: 2, 
              bgcolor: 'primary.50', 
              boxShadow: 1 
            }}>
              <Typography variant="caption" color="primary" sx={{ 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                mb: 1.0, 
                display: 'block' 
              }}>
                📋 Basic Information
              </Typography>

              {/* Plan Name */}
              <TextField
                fullWidth
                size="small"
                label="Plan Name *"
                value={formData.name}
                onChange={handleNameChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Premium Monthly"
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    height: { xs: '36px', sm: '40px' }
                  },
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  },
                  mb: 1.2
                }}
              />

              {/* Plan Type */}
              <FormControl fullWidth size="small" sx={{ mb: 1.2 }}>
                <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>Plan Type *</InputLabel>
                <Select
                  value={formData.type}
                  label="Plan Type *"
                  onChange={handleTypeChange}
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    height: { xs: '36px', sm: '40px' }
                  }}
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

              {/* Price with Auto Fill */}
              <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', mb: 1.2 }}>
              <TextField
                  size="small"
                  label="Price *"
                type="number"
                value={formData.basePrice}
                  onChange={handlePriceChange}
                error={!!errors.basePrice}
                helperText={errors.basePrice}
                  placeholder="0"
                  sx={{ 
                    flex: 1,
                    '& .MuiInputBase-root': { 
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      height: { xs: '36px', sm: '40px' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }
                  }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAutoFill}
                  sx={{ 
                    fontSize: '0.65rem', 
                    height: { xs: '36px', sm: '40px' },
                    minWidth: 'auto',
                    px: 1
                  }}
                >
                  🚀 Auto Fill
                </Button>
              </Box>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Description"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Brief description of the plan benefits and features"
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontSize: { xs: '0.8rem', sm: '0.85rem' }
                  },
                  '& .MuiInputLabel-root': { 
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }
                  },
                  mb: 1.0
                }}
              />




              {/* Shift & Zone */}
              <Box sx={{ display: 'flex', gap: 0.3, flexDirection: { xs: 'column', sm: 'row' }, mb: 1.0 }}>
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>Shift</InputLabel>
                  <Select
                    value={formData.selectedShift || ''}
                    label="Shift"
                    onChange={handleShiftChange}
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      height: { xs: '36px', sm: '40px' }
                    }}
                  >
                    <MenuItem value="">No Shift</MenuItem>
                    <MenuItem 
                      value="morning"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>Morning (6AM-12PM)</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedShift: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                      </Box>
                    </MenuItem>
                    <MenuItem 
                      value="afternoon"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>Afternoon (12PM-6PM)</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedShift: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                    </Box>
                    </MenuItem>
                    <MenuItem 
                      value="evening"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>Evening (6PM-12AM)</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedShift: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                      </Box>
                    </MenuItem>
                    <MenuItem 
                      value="night"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>Night (12AM-6AM)</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedShift: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                      </Box>
                    </MenuItem>
                    {formData.customShift && (
                      <MenuItem 
                        value={formData.customShift.name}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pr: 1,
                          '&:hover .remove-icon': {
                            opacity: 1
                          }
                        }}
                      >
                        <span>{formData.customShift.name}</span>
                        <Box
                          component="span"
                          className="remove-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomShift();
                          }}
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white'
                            }
                          }}
                        >
                          −
                        </Box>
                      </MenuItem>
                    )}
                    <MenuItem value="custom">Custom Shift</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>Zone</InputLabel>
                  <Select
                    value={formData.selectedZone || ''}
                    label="Zone"
                    onChange={handleZoneChange}
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      height: { xs: '36px', sm: '40px' }
                    }}
                  >
                    <MenuItem value="">No Zone</MenuItem>
                    <MenuItem 
                      value="ac"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>AC Zone</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedZone: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                    </Box>
                    </MenuItem>
                    <MenuItem 
                      value="non-ac"
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pr: 1,
                        '&:hover .remove-icon': {
                          opacity: 1
                        }
                      }}
                    >
                      <span>Non-AC Zone</span>
                      <Box
                        component="span"
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, selectedZone: '' }));
                        }}
                        sx={{
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      >
                        −
                      </Box>
                    </MenuItem>
                    {formData.customZone && (
                      <MenuItem 
                        value={formData.customZone.name}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pr: 1,
                          '&:hover .remove-icon': {
                            opacity: 1
                          }
                        }}
                      >
                        <span>{formData.customZone.name}</span>
                        <Box
                          component="span"
                          className="remove-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomZone();
                          }}
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white'
                            }
                          }}
                        >
                          −
                        </Box>
                      </MenuItem>
                    )}
                    <MenuItem value="custom">Custom Zone</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Right Column - Features & Settings */}
          <Box sx={{ flex: 1, p: { xs: 0.4, sm: 0.6 } }}>
            
            {/* Features Section */}
            <Box sx={{ 
              p: { xs: 0.4, sm: 0.6 }, 
              border: '1px solid', 
              borderColor: 'grey.300', 
              borderRadius: 1, 
              bgcolor: 'background.paper',
              mb: 1.0
            }}>
              <Typography variant="caption" color="primary" sx={{ 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                mb: 1.0, 
                display: 'block' 
              }}>
                ⭐ Features & Benefits
                      </Typography>
                
              {/* Add Feature */}
              <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'flex-end', mb: 1.0 }}>
                      <TextField
                        fullWidth
                  size="small"
                  label="Add Feature"
                  value={formData.newFeature}
                  onChange={handleNewFeatureChange}
                  placeholder="e.g., WiFi, Power Outlet"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  error={!!errors.newFeature}
                  helperText={errors.newFeature}
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      height: { xs: '32px', sm: '36px' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddFeature}
                  disabled={!formData.newFeature?.trim()}
                  startIcon={<Add />}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 50 }, 
                    height: { xs: '32px', sm: '36px' },
                    mt: { xs: 0.3, sm: 0 },
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                >
                  Add
                </Button>
              </Box>

              {/* Current Features */}
              {formData.features && formData.features.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                  {formData.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      onDelete={() => handleRemoveFeature(index)}
                      color="primary"
                      sx={{ 
                        fontSize: '0.65rem', 
                        height: '24px',
                        bgcolor: 'primary.main',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                    </Box>
              )}
            </Box>

            {/* Discount Settings */}
            <Box sx={{ 
              p: { xs: 0.4, sm: 0.6 }, 
              border: '1px solid', 
              borderColor: 'grey.300', 
              borderRadius: 1, 
              bgcolor: 'background.paper',
              mb: 1.0
            }}>
              <Typography variant="caption" color="primary" sx={{ 
                fontSize: '0.65rem', 
                fontWeight: 'bold', 
                mb: 1.0, 
                display: 'block' 
              }}>
                💰 Discounts & Offers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.enableDiscount}
                      onChange={handleDiscountToggle}
                    />
                  }
                  label="Enable Discount"
                  sx={{ fontSize: '0.7rem', m: 0 }}
                />
                
                {formData.enableDiscount && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.0 }}>
                    <Box sx={{ display: 'flex', gap: 1.0, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Type</InputLabel>
                        <Select
                          value={formData.discount?.type || 'percentage'}
                          label="Type"
                          onChange={handleDiscountTypeChange}
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            height: { xs: '32px', sm: '36px' }
                          }}
                        >
                          <MenuItem value="percentage">%</MenuItem>
                          <MenuItem value="fixed">₹</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        fullWidth
                        size="small"
                        label="Value"
                        type="number"
                        value={formData.discount?.value || 0}
                        onChange={handleDiscountValueChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {formData.discount?.type === 'percentage' ? '%' : '₹'}
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            height: { xs: '32px', sm: '36px' }
                          },
                          '& .MuiInputLabel-root': { 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1.0, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Valid From"
                        type="date"
                        value={formData.discount?.validFrom || ''}
                        onChange={handleDiscountFromChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            height: { xs: '32px', sm: '36px' }
                          },
                          '& .MuiInputLabel-root': { 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }
                        }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Valid To"
                        type="date"
                        value={formData.discount?.validTo || ''}
                        onChange={handleDiscountToChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ 
                          '& .MuiInputBase-root': { 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            height: { xs: '32px', sm: '36px' }
                          },
                          '& .MuiInputLabel-root': { 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Status Settings */}
            <Box sx={{ 
              p: { xs: 0.4, sm: 0.6 }, 
              border: '1px solid', 
              borderColor: 'grey.300', 
              borderRadius: 1, 
              bgcolor: 'background.paper',
              mb: 1.0
            }}>
              
              {/* Toggle Switches */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.isPopular}
                      onChange={handlePopularChange}
                    />
                  }
                  label="⭐ Popular"
                  sx={{ fontSize: '0.7rem', m: 0 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.scholarshipEligible}
                      onChange={handleScholarshipChange}
                    />
                  }
                  label="🎓 Scholar"
                  sx={{ fontSize: '0.7rem', m: 0 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.waiverAllowed}
                      onChange={handleWaiverChange}
                    />
                  }
                  label="💸 Waiver"
                  sx={{ fontSize: '0.7rem', m: 0 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={formData.status === 'active'}
                      onChange={handleStatusChange}
                    />
                  }
                  label="✅ Active"
                  sx={{ fontSize: '0.7rem', m: 0 }}
                />
              </Box>
                    </Box>

              {/* Optional Limits */}
              <Box sx={{ 
                p: { xs: 0.4, sm: 0.6 }, 
                border: '1px solid', 
                borderColor: 'grey.300', 
                borderRadius: 1, 
                bgcolor: 'background.paper'
              }}>
                <Typography variant="caption" color="primary" sx={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 'bold', 
                  mb: 1.0, 
                  display: 'block' 
                }}>
                  📊 Optional Limits
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.3 }}>
                <TextField
                  fullWidth
                    size="small"
                    label="Max Seats"
                        type="number"
                    value={formData.maxSeats || ''}
                    onChange={handleMaxSeatsChange}
                    placeholder="Unlimited if empty"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        height: { xs: '32px', sm: '36px' }
                      },
                      '& .MuiInputLabel-root': { 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }
                    }}
                  />
                      <TextField
                        fullWidth
                    size="small"
                    label="Max Hours"
                    type="number"
                    value={formData.maxHours || ''}
                    onChange={handleMaxHoursChange}
                    placeholder="Unlimited if empty"
                    sx={{ 
                      '& .MuiInputBase-root': { 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        height: { xs: '32px', sm: '36px' }
                      },
                      '& .MuiInputLabel-root': { 
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }
                    }}
                  />
              </Box>
                  </Box>

                  </Box>
        </Box>
        ) : (
          /* Step 2: Preview */
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'primary.main' }}>
              📋 Fee Plan Preview
            </Typography>
            
            {/* Student-facing Fee Plan Card */}
            <Box sx={{
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 3,
              p: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxWidth: 400,
              mx: 'auto'
            }}>
              {/* Plan Header */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  {formData.name}
                </Typography>
                <Chip 
                  label={formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
                {formData.isPopular && (
                  <Chip 
                    label="⭐ Popular" 
                    color="warning" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              {/* Price */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ₹{formData.basePrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per {formData.type}
                </Typography>
              </Box>

              {/* Description */}
              <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                    {formData.description}
                  </Typography>

              {/* Features */}
              {formData.features && formData.features.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    ✨ Features Included:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.features.map((feature, index) => (
                  <Chip
                        key={index}
                        label={feature}
                    size="small"
                        color="primary"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Additional Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'text.secondary' }}>
                {formData.scholarshipEligible && (
                  <Typography variant="caption">🎓 Scholarship Eligible</Typography>
                )}
                {formData.waiverAllowed && (
                  <Typography variant="caption">💸 Waiver Allowed</Typography>
                    )}
                  </Box>

              {/* Discount Info */}
              {formData.enableDiscount && formData.discount && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                    🎉 {formData.discount.type === 'percentage' ? `${formData.discount.value}%` : `₹${formData.discount.value}`} Discount Available!
                  </Typography>
                </Box>
                    )}
                  </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {currentStep === 1 ? (
          <Button
            onClick={handleNextStep}
            variant="contained"
            disabled={!formData.name || !formData.basePrice}
          >
            Next: Preview
          </Button>
        ) : (
          <>
            <Button onClick={handlePrevStep} variant="outlined">
              Back
            </Button>
            <Button 
              onClick={handlePrevStep} 
              variant="outlined"
              startIcon={<Edit />}
              sx={{ mr: 'auto' }}
            >
              Edit
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<Save />}
            >
              {editMode ? 'Update Plan' : 'Create Plan'}
            </Button>
          </>
        )}
      </DialogActions>

      {/* Custom Time Slot Dialog */}
      <Dialog 
        open={showCustomShiftDialog} 
        onClose={() => setShowCustomShiftDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          ⏰ Add Custom Shift
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Time Slot Name"
              placeholder="e.g., Early Morning, Late Night"
              sx={{ 
                mb: 3,
                '& .MuiInputBase-root': {
                  borderRadius: 1
                }
              }}
            />
            
            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'grey.200', 
              borderRadius: 2, 
              bgcolor: 'grey.50',
              mb: 2
            }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                🕐 Start Time
        </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>Hour</InputLabel>
                  <Select label="Hour" sx={{ borderRadius: 1 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                      <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>Min</InputLabel>
                  <Select label="Min" sx={{ borderRadius: 1 }}>
                    {['00', '15', '30', '45'].map(min => (
                      <MenuItem key={min} value={min}>{min}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>AM/PM</InputLabel>
                  <Select label="AM/PM" sx={{ borderRadius: 1 }}>
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'grey.200', 
              borderRadius: 2, 
              bgcolor: 'grey.50',
              mb: 2
            }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                🕐 End Time
                  </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>Hour</InputLabel>
                  <Select label="Hour" sx={{ borderRadius: 1 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                      <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>Min</InputLabel>
                  <Select label="Min" sx={{ borderRadius: 1 }}>
                    {['00', '15', '30', '45'].map(min => (
                      <MenuItem key={min} value={min}>{min}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <InputLabel>AM/PM</InputLabel>
                  <Select label="AM/PM" sx={{ borderRadius: 1 }}>
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
                </Box>
            </Box>
        </Box>
      </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setShowCustomShiftDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
            <Button
              variant="contained"
              onClick={handleAddCustomShift}
              sx={{ borderRadius: 1 }}
              startIcon={<span>⏰</span>}
            >
              Add Shift
            </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Zone Dialog */}
      <Dialog 
        open={showCustomZoneDialog} 
        onClose={() => setShowCustomZoneDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white', 
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          🏢 Add Custom Zone
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Zone Name"
              value={customZoneName}
              onChange={(e) => setCustomZoneName(e.target.value)}
              placeholder="e.g., AC Zone, Non-AC, Quiet, Premium"
              sx={{ 
                mb: 3,
                '& .MuiInputBase-root': {
                  borderRadius: 1
                }
              }}
            />
            
            <Box sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'grey.200', 
              borderRadius: 2, 
              bgcolor: 'grey.50',
              mb: 3
            }}>
              <Typography variant="subtitle2" color="success.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                💡 Suggested Zone Types
              </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['AC Zone', 'Non-AC Zone', 'Quiet Zone', 'Premium Zone', 'Group Study', 'Computer Lab', 'Reading Room', 'Conference Room'].map(zone => (
                        <Chip
                          key={zone}
                          label={zone}
                          size="small"
                          onClick={() => setCustomZoneName(zone)}
                          sx={{ 
                            fontSize: '0.75rem', 
                            height: '32px',
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'success.light',
                              color: 'white'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Zone Description"
              value={customZoneDescription}
              onChange={(e) => setCustomZoneDescription(e.target.value)}
              placeholder="Brief description of the zone features and amenities"
              sx={{ 
                '& .MuiInputBase-root': {
                  borderRadius: 1
                }
              }}
            />
        </Box>
      </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setShowCustomZoneDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAddCustomZone}
              disabled={!customZoneName.trim()}
              sx={{ borderRadius: 1 }}
              startIcon={<span>🏢</span>}
            >
              Add Zone
            </Button>
      </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FeePlanFormDialog;