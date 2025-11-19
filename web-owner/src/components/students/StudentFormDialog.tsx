import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
  Stepper, Step, StepLabel, Typography, Box, Avatar, Chip, FormControl,
  InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Alert, Divider,
  FormControlLabel, Switch,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  PhotoCamera, ArrowBack, ArrowForward, Save,
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
    city: initialData?.address?.city || '',
    state: initialData?.address?.state || '',
    postalCode: initialData?.address?.postalCode || '',
    guardianName: initialData?.guardianName || '',
    guardianPhone: initialData?.guardianPhone || '',
    emergencyContact: initialData?.emergencyContact || '',
    
    // Fee & Plan
    currentPlan: initialData?.currentPlan || '',
    feeStatus: initialData?.feeStatus || 'pending',
    status: initialData?.status || 'active',
    
    // KYC & Extras
    groups: initialData?.groups || [],
    tags: initialData?.tags || [],
    notes: initialData?.notes || '',
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
      if (!formData.phone) newErrors.phone = 'Phone is required';
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
              <Avatar sx={{ width: 100, height: 100, margin: '0 auto', mb: 2 }}>
                {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
              />
              <label htmlFor="photo-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small">
                  Upload Photo
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
                helperText={errors.firstName}
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
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone *"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Address" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
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
                <InputLabel>Current Plan</InputLabel>
                <Select
                  value={formData.currentPlan}
                  label="Current Plan"
                  onChange={(e) => handleChange('currentPlan', e.target.value)}
                >
                  <MenuItem value="Hourly Plan">Hourly Plan - ₹50/hour</MenuItem>
                  <MenuItem value="Daily Plan">Daily Plan - ₹200/day</MenuItem>
                  <MenuItem value="Weekly Plan">Weekly Plan - ₹1,000/week</MenuItem>
                  <MenuItem value="Monthly Basic">Monthly Basic - ₹3,000/month</MenuItem>
                  <MenuItem value="Monthly Premium">Monthly Premium - ₹5,000/month</MenuItem>
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
        {editMode ? 'Edit Student' : 'Add New Student'}
        <Typography variant="caption" display="block" color="text.secondary">
          Complete all steps to create student profile
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

