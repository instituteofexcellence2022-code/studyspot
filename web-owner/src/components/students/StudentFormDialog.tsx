import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Stepper, Step, StepLabel, Typography, Box, Avatar, Chip, FormControl,
  InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Alert, Divider,
  FormControlLabel, Switch, Autocomplete, CircularProgress, alpha,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  PhotoCamera, ArrowBack, ArrowForward, Save, CheckCircle, LocationOn,
} from '@mui/icons-material';

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: any) => void;
  editMode: boolean;
  initialData?: any;
}

const steps = ['Personal Info', 'Contact Details', 'Fee & Plan', 'KYC & Extras'];

const StudentFormDialog: React.FC<StudentFormProps> = ({ open, onClose, onSave, editMode, initialData }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    bloodGroup: initialData?.bloodGroup || '',
    
    // Contact Details
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    addressLine1: initialData?.address?.line1 || '',
    addressLine2: initialData?.address?.line2 || '',
    pincode: initialData?.address?.postalCode || '',
    district: initialData?.district || '',
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || '',
    postalCode: initialData?.address?.postalCode || '',
    country: initialData?.address?.country || 'India',
    guardianName: initialData?.guardianName || '',
    guardianPhone: initialData?.guardianPhone || '',
    emergencyContact: initialData?.emergencyContact || '',
    
    // Fee & Plan
    currentPlan: initialData?.currentPlan || 'Monthly Premium',
    feeStatus: initialData?.feeStatus || 'pending',
    status: initialData?.status || 'active',
    
    // KYC & Extras
    groups: initialData?.groups || [],
    tags: initialData?.tags || [],
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<any>({});
  const [fetchingPincode, setFetchingPincode] = useState(false);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Auto-fill from email domain (smart defaults)
  const autoFillFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return;
    
    const emailName = email.split('@')[0];
    
    // Auto-suggest first name from email if empty
    if (!formData.firstName && emailName) {
      const suggestedName = emailName.split('.')[0] || emailName.split('_')[0];
      if (suggestedName.length >= 2) {
        setFormData(prev => ({ 
          ...prev, 
          firstName: suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1) 
        }));
      }
    }
  };

  // PIN code lookup for address auto-fill
  const handlePincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: numericPincode, postalCode: numericPincode }));

    // Only fetch if PIN code is 6 digits
    if (numericPincode.length === 6) {
      setFetchingPincode(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${numericPincode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            
            setFormData(prev => ({
              ...prev,
              district: postOffice.District || prev.district,
              city: postOffice.District || prev.city,
              state: postOffice.State || prev.state,
              pincode: numericPincode,
              postalCode: numericPincode,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
    
    // Auto-fill from email
    if (field === 'email') {
      autoFillFromEmail(value);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};
    
    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      // Last name is optional - only validate if provided
      if (formData.lastName && formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters if provided';
      }
    } else if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
      // Phone is optional - only validate if provided
      if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onSave(formData);
      onClose();
      setActiveStep(0);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Personal Info
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} sx={{ textAlign: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>
                  {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0) || ''}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                />
                <label htmlFor="photo-upload">
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<PhotoCamera />} 
                    size="small"
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    Upload Photo
                  </Button>
                </label>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName || 'Required'}
                autoFocus
                placeholder="Enter first name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Last Name (Optional)"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName || 'Optional'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={formData.bloodGroup}
                  label="Blood Group"
                  onChange={(e) => handleChange('bloodGroup', e.target.value)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1: // Contact Details
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email || 'Required'}
                placeholder="student@example.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => {
                  let phone = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (phone.length > 10) phone = phone.slice(0, 10);
                  handleChange('phone', phone);
                }}
                error={!!errors.phone}
                helperText={errors.phone || '10 digits'}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Address (Optional)" size="small" sx={{ fontSize: '0.688rem' }} />
              </Divider>
            </Grid>

            {/* PIN Code - Enter First for Auto-fill */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="PIN Code (Auto-fill)"
                value={formData.pincode || formData.postalCode || ''}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="110001"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />,
                  endAdornment: fetchingPincode ? (
                    <CircularProgress size={14} sx={{ mr: 0.5 }} />
                  ) : formData.pincode?.length === 6 ? (
                    <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 0.5 }} />
                  ) : null,
                }}
                helperText={
                  fetchingPincode 
                    ? 'Loading...'
                    : formData.pincode?.length === 6 && !fetchingPincode
                    ? 'Auto-filled'
                    : 'Enter 6 digits'
                }
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="District"
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="District"
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />,
                  endAdornment: formData.district && !fetchingPincode ? (
                    <CheckCircle sx={{ fontSize: 14, color: '#10b981', mr: 0.5 }} />
                  ) : null,
                }}
              />
            </Grid>

            {/* City with Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                size="small"
                options={[
                  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
                  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
                  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
                  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad'
                ]}
                value={formData.city || ''}
                onChange={(event, newValue) => {
                  handleChange('city', newValue || '');
                }}
                onInputChange={(event, newInputValue) => {
                  handleChange('city', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    placeholder="City"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />,
                      endAdornment: formData.city && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 14, color: '#10b981', mr: 0.5 }} />
                      ) : params.InputProps.endAdornment,
                    }}
                  />
                )}
              />
            </Grid>

            {/* State with Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                size="small"
                options={[
                  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
                  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                ]}
                value={formData.state || ''}
                onChange={(event, newValue) => {
                  handleChange('state', newValue || '');
                }}
                onInputChange={(event, newInputValue) => {
                  handleChange('state', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    placeholder="State"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />,
                      endAdornment: formData.state && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 14, color: '#10b981', mr: 0.5 }} />
                      ) : params.InputProps.endAdornment,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Address Line 1 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                placeholder="House/Flat No., Building Name, Street"
              />
            </Grid>

            {/* Address Line 2 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Address Line 2 (Optional)"
                value={formData.addressLine2 || ''}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Area, Landmark"
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                value={formData.country || 'India'}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled
                helperText="Currently only India is supported"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Guardian / Emergency Contact (Optional)" size="small" sx={{ fontSize: '0.688rem' }} />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Guardian Name"
                value={formData.guardianName}
                onChange={(e) => handleChange('guardianName', e.target.value)}
                placeholder="Guardian name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Guardian Phone"
                value={formData.guardianPhone}
                onChange={(e) => {
                  let phone = e.target.value.replace(/\D/g, '');
                  if (phone.length > 10) phone = phone.slice(0, 10);
                  handleChange('guardianPhone', phone);
                }}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => {
                  let phone = e.target.value.replace(/\D/g, '');
                  if (phone.length > 10) phone = phone.slice(0, 10);
                  handleChange('emergencyContact', phone);
                }}
                helperText="Alternate contact for emergencies"
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
          </Grid>
        );

      case 2: // Fee & Plan
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan (Default: Monthly Premium)</InputLabel>
                <Select
                  value={formData.currentPlan || 'Monthly Premium'}
                  label="Plan (Default: Monthly Premium)"
                  onChange={(e) => handleChange('currentPlan', e.target.value)}
                >
                  <MenuItem value="Hourly Plan">Hourly - ₹50/hr</MenuItem>
                  <MenuItem value="Daily Plan">Daily - ₹200/day</MenuItem>
                  <MenuItem value="Weekly Plan">Weekly - ₹1,000/wk</MenuItem>
                  <MenuItem value="Monthly Basic">Monthly Basic - ₹3,000/mo</MenuItem>
                  <MenuItem value="Monthly Premium">Monthly Premium - ₹5,000/mo ⭐</MenuItem>
                  <MenuItem value="Quarterly Plan">Quarterly - ₹12,000/qtr</MenuItem>
                  <MenuItem value="Annual Plan">Annual - ₹40,000/yr</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Fee Status</InputLabel>
                <Select
                  value={formData.feeStatus || 'pending'}
                  label="Fee Status"
                  onChange={(e) => handleChange('feeStatus', e.target.value)}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending (Default)</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Student Status</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  label="Student Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active (Default)</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="graduated">Graduated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 3: // KYC & Extras
        return (
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Groups (Optional)</InputLabel>
                <Select
                  multiple
                  value={formData.groups}
                  onChange={(e) => handleChange('groups', e.target.value)}
                  input={<OutlinedInput label="Groups (Optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" sx={{ fontSize: '0.688rem', height: 20 }} />
                      ))}
                    </Box>
                  )}
                >
                  {['Morning Batch', 'Evening Batch', 'Weekend Batch', 'Competitive Exams', 'Regular Students'].map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={formData.groups.includes(group)} size="small" />
                      <ListItemText primary={group} primaryTypographyProps={{ fontSize: '0.813rem' }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Tags (Optional)</InputLabel>
                <Select
                  multiple
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  input={<OutlinedInput label="Tags (Optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" sx={{ fontSize: '0.688rem', height: 20 }} />
                      ))}
                    </Box>
                  )}
                >
                  {['VIP', 'Scholarship', 'Long-term', 'New', 'Priority'].map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={formData.tags.includes(tag)} size="small" />
                      <ListItemText primary={tag} primaryTypographyProps={{ fontSize: '0.813rem' }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes about the student..."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="KYC Documents (Optional)" size="small" sx={{ fontSize: '0.688rem' }} />
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="kyc-upload"
                type="file"
                multiple
              />
              <label htmlFor="kyc-upload">
                <Button 
                  variant="outlined" 
                  component="span" 
                  fullWidth
                  size="small"
                  sx={{ fontSize: '0.813rem', py: 1 }}
                >
                  Upload KYC Documents (Aadhaar, ID Proof, Photo)
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontSize: '0.688rem' }}>
                JPG, PNG, PDF (Max 5MB each)
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          {editMode ? 'Edit Student' : 'Add New Student'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box>
          <Stepper activeStep={activeStep} sx={{ mb: 3, '& .MuiStepLabel-root': { fontSize: '0.75rem' } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem', fontWeight: 600 } }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ maxHeight: 'calc(90vh - 280px)', overflowY: 'auto', pr: 1 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2, pt: 1.5 }}>
        <Button onClick={onClose} size="small" sx={{ fontSize: '0.813rem' }}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            size="small"
            startIcon={<ArrowBack />}
            sx={{ fontSize: '0.813rem' }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Save />}
              size="small"
              sx={{ fontSize: '0.813rem', fontWeight: 600 }}
            >
              {editMode ? 'Update' : 'Create'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
              size="small"
              sx={{ fontSize: '0.813rem', fontWeight: 600 }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default StudentFormDialog;

