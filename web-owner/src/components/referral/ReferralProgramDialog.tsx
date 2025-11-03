import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { referralDiscountService, ReferralProgram } from '../../services/referralDiscountService';

interface ReferralProgramDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  program?: ReferralProgram | null;
}

const ReferralProgramDialog: React.FC<ReferralProgramDialogProps> = ({
  open,
  onClose,
  onSave,
  program,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referral_code: '',
    referrer_bonus_type: 'percentage' as 'percentage' | 'fixed' | 'credits',
    referrer_bonus_value: 10,
    referee_bonus_type: 'percentage' as 'percentage' | 'fixed' | 'credits',
    referee_bonus_value: 15,
    min_referral_amount: 0,
    max_referral_amount: '',
    validity_days: 365,
    max_referrals_per_user: 10,
    start_date: null as Date | null,
    end_date: null as Date | null,
    terms_and_conditions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        description: program.description || '',
        referral_code: program.referral_code,
        referrer_bonus_type: program.referrer_bonus_type,
        referrer_bonus_value: program.referrer_bonus_value,
        referee_bonus_type: program.referee_bonus_type,
        referee_bonus_value: program.referee_bonus_value,
        min_referral_amount: program.min_referral_amount,
        max_referral_amount: program.max_referral_amount?.toString() || '',
        validity_days: program.validity_days,
        max_referrals_per_user: program.max_referrals_per_user,
        start_date: program.start_date ? new Date(program.start_date) : null,
        end_date: program.end_date ? new Date(program.end_date) : null,
        terms_and_conditions: program.terms_and_conditions || '',
      });
    } else {
      // Reset form for new program
      setFormData({
        name: '',
        description: '',
        referral_code: '',
        referrer_bonus_type: 'percentage',
        referrer_bonus_value: 10,
        referee_bonus_type: 'percentage',
        referee_bonus_value: 15,
        min_referral_amount: 0,
        max_referral_amount: '',
        validity_days: 365,
        max_referrals_per_user: 10,
        start_date: null,
        end_date: null,
        terms_and_conditions: '',
      });
    }
    setError(null);
  }, [program, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateReferralCode = () => {
    const prefix = 'REF';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${prefix}${year}${random}`;
    setFormData(prev => ({ ...prev, referral_code: code }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Program name is required');
      }
      if (!formData.referral_code.trim()) {
        throw new Error('Referral code is required');
      }
      if (formData.referrer_bonus_value <= 0) {
        throw new Error('Referrer bonus value must be greater than 0');
      }
      if (formData.referee_bonus_value <= 0) {
        throw new Error('Referee bonus value must be greater than 0');
      }

      const submitData = {
        ...formData,
        max_referral_amount: formData.max_referral_amount ? parseFloat(formData.max_referral_amount) : undefined,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
      };

      if (program) {
        await referralDiscountService.updateReferralProgram(program.id, submitData);
        toast.success('Referral program updated successfully');
      } else {
        await referralDiscountService.createReferralProgram(submitData);
        toast.success('Referral program created successfully');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save referral program');
      toast.error(err.message || 'Failed to save referral program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {program ? 'Edit Referral Program' : 'Create Referral Program'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Program Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    label="Referral Code"
                    value={formData.referral_code}
                    onChange={(e) => handleInputChange('referral_code', e.target.value.toUpperCase())}
                    required
                    helperText="Unique code for referrals"
                  />
                  <Button
                    variant="outlined"
                    onClick={generateReferralCode}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Generate
                  </Button>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Bonus Configuration */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Bonus Configuration
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Referrer Bonus Type</InputLabel>
                    <Select
                      value={formData.referrer_bonus_type}
                      onChange={(e) => handleInputChange('referrer_bonus_type', e.target.value)}
                      label="Referrer Bonus Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                      <MenuItem value="credits">Credits</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Referrer Bonus Value"
                    type="number"
                    value={formData.referrer_bonus_value}
                    onChange={(e) => handleInputChange('referrer_bonus_value', parseFloat(e.target.value) || 0)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Referee Bonus Type</InputLabel>
                    <Select
                      value={formData.referee_bonus_type}
                      onChange={(e) => handleInputChange('referee_bonus_type', e.target.value)}
                      label="Referee Bonus Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                      <MenuItem value="credits">Credits</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Referee Bonus Value"
                    type="number"
                    value={formData.referee_bonus_value}
                    onChange={(e) => handleInputChange('referee_bonus_value', parseFloat(e.target.value) || 0)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Limits and Conditions */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Limits and Conditions
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Minimum Referral Amount"
                    type="number"
                    value={formData.min_referral_amount}
                    onChange={(e) => handleInputChange('min_referral_amount', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Minimum amount for referral to be valid"
                  />
                  
                  <TextField
                    fullWidth
                    label="Maximum Referral Amount"
                    type="number"
                    value={formData.max_referral_amount}
                    onChange={(e) => handleInputChange('max_referral_amount', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Maximum amount for referral (optional)"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Validity Days"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => handleInputChange('validity_days', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 1 }}
                    helperText="How long the referral is valid"
                  />
                  
                  <TextField
                    fullWidth
                    label="Max Referrals Per User"
                    type="number"
                    value={formData.max_referrals_per_user}
                    onChange={(e) => handleInputChange('max_referrals_per_user', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 1 }}
                    helperText="Maximum referrals per user"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Date Range */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Date Range
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={formData.start_date}
                    onChange={(date) => handleInputChange('start_date', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  
                  <DatePicker
                    label="End Date"
                    value={formData.end_date}
                    onChange={(date) => handleInputChange('end_date', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Terms and Conditions */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Terms and Conditions
              </Typography>
              <TextField
                fullWidth
                label="Terms and Conditions"
                value={formData.terms_and_conditions}
                onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
                multiline
                rows={4}
                helperText="Terms and conditions for the referral program"
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : program ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReferralProgramDialog;















