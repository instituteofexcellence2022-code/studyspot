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
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2, bgcolor: 'primary.main' }}>
                {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0) || ''}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
              />
              <label htmlFor="photo-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small">
                  Upload Photo (Optional)
                </Button>
              </label>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName || 'Required - minimum 2 characters'}
                autoFocus
                placeholder="Enter first name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name (Optional)"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName || 'Optional - leave blank if not applicable'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info">Contact information for communication and emergencies</Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email || 'We\'ll use this for communication and login'}
                placeholder="student@example.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => {
                  let phone = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (phone.length > 10) phone = phone.slice(0, 10);
                  handleChange('phone', phone);
                }}
                error={!!errors.phone}
                helperText={errors.phone || '10-digit mobile number (optional)'}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Address (Optional)" size="small" />
              </Divider>
            </Grid>

            {/* PIN Code - Enter First for Auto-fill */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PIN Code (Enter first to auto-fill)"
                value={formData.pincode || formData.postalCode || ''}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="110001"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                  endAdornment: fetchingPincode ? (
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                  ) : formData.pincode?.length === 6 ? (
                    <CheckCircle sx={{ fontSize: 18, color: '#10b981', mr: 1 }} />
                  ) : null,
                }}
                helperText={
                  fetchingPincode 
                    ? 'Loading address...'
                    : formData.pincode?.length === 6 && !fetchingPincode
                    ? 'City, State & District auto-filled'
                    : 'Enter 6-digit PIN code to auto-fill address'
                }
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="District"
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="District"
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                  endAdornment: formData.district && !fetchingPincode ? (
                    <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                  ) : null,
                }}
              />
            </Grid>

            {/* City with Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
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
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                      endAdornment: formData.city && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
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
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                      endAdornment: formData.state && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
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
                label="Address Line 2 (Optional)"
                value={formData.addressLine2 || ''}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Area, Landmark (Optional)"
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country || 'India'}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled
                helperText="Currently only India is supported"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Guardian / Emergency Contact" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guardian Name"
                value={formData.guardianName}
                onChange={(e) => handleChange('guardianName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Guardian Phone"
                value={formData.guardianPhone}
                onChange={(e) => handleChange('guardianPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                helperText="Alternate contact number for emergencies"
              />
            </Grid>
          </Grid>
        );

      case 2: // Fee & Plan
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info">Configure student's plan and fee status</Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Current Plan (Default: Monthly Premium)</InputLabel>
                <Select
                  value={formData.currentPlan || 'Monthly Premium'}
                  label="Current Plan (Default: Monthly Premium)"
                  onChange={(e) => handleChange('currentPlan', e.target.value)}
                >
                  <MenuItem value="Hourly Plan">Hourly Plan - ₹50/hour</MenuItem>
                  <MenuItem value="Daily Plan">Daily Plan - ₹200/day</MenuItem>
                  <MenuItem value="Weekly Plan">Weekly Plan - ₹1,000/week</MenuItem>
                  <MenuItem value="Monthly Basic">Monthly Basic - ₹3,000/month</MenuItem>
                  <MenuItem value="Monthly Premium">Monthly Premium - ₹5,000/month (Recommended)</MenuItem>
                  <MenuItem value="Quarterly Plan">Quarterly Plan - ₹12,000/quarter</MenuItem>
                  <MenuItem value="Annual Plan">Annual Plan - ₹40,000/year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fee Status</InputLabel>
                <Select
                  value={formData.feeStatus}
                  label="Fee Status"
                  onChange={(e) => handleChange('feeStatus', e.target.value)}
                >
                  <MenuItem value="paid">
                    <Chip label="Paid" color="success" size="small" sx={{ mr: 1 }} />
                    Paid
                  </MenuItem>
                  <MenuItem value="pending">
                    <Chip label="Pending" color="warning" size="small" sx={{ mr: 1 }} />
                    Pending
                  </MenuItem>
                  <MenuItem value="overdue">
                    <Chip label="Overdue" color="error" size="small" sx={{ mr: 1 }} />
                    Overdue
                  </MenuItem>
                  <MenuItem value="partial">
                    <Chip label="Partial" color="info" size="small" sx={{ mr: 1 }} />
                    Partial
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Student Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Student Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info">Additional information and grouping</Alert>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Groups</InputLabel>
                <Select
                  multiple
                  value={formData.groups}
                  onChange={(e) => handleChange('groups', e.target.value)}
                  input={<OutlinedInput label="Groups" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {['Morning Batch', 'Evening Batch', 'Weekend Batch', 'Competitive Exams', 'Regular Students'].map((group) => (
                    <MenuItem key={group} value={group}>
                      <Checkbox checked={formData.groups.includes(group)} />
                      <ListItemText primary={group} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  multiple
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  input={<OutlinedInput label="Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" color="primary" />
                      ))}
                    </Box>
                  )}
                >
                  {['VIP', 'Scholarship', 'Long-term', 'New', 'Priority'].map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={formData.tags.includes(tag)} />
                      <ListItemText primary={tag} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any additional notes about the student..."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="KYC Documents" size="small" />
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
                <Button variant="outlined" component="span" fullWidth>
                  Upload KYC Documents (Aadhaar, ID Proof, Photo)
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Accepted formats: JPG, PNG, PDF (Max 5MB each)
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {editMode ? 'Edit Student' : 'Add New Student'}
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              {editMode ? 'Update student information' : 'Quick registration - only first name and email required'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!editMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Quick Add:</strong> Fill in first name and email to create student. Other fields can be added later.
            </Typography>
          </Alert>
        )}
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
              {editMode ? 'Update Student' : 'Create Student'}
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

export default StudentFormDialog;

