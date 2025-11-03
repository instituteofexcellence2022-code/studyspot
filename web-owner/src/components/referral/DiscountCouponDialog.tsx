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
  Chip,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { referralDiscountService, DiscountCoupon } from '../../services/referralDiscountService';

interface DiscountCouponDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  coupon?: DiscountCoupon | null;
}

const DiscountCouponDialog: React.FC<DiscountCouponDialogProps> = ({
  open,
  onClose,
  onSave,
  coupon,
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'free_hours',
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: '',
    usage_limit: '',
    usage_limit_per_user: 1,
    applicable_to: 'all' as 'all' | 'new_users' | 'existing_users' | 'specific_libraries',
    applicable_libraries: [] as string[],
    applicable_services: ['booking'] as string[],
    start_date: null as Date | null,
    end_date: null as Date | null,
    terms_and_conditions: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceOptions = [
    { value: 'booking', label: 'Booking' },
    { value: 'monthly_pass', label: 'Monthly Pass' },
    { value: 'annual_pass', label: 'Annual Pass' },
    { value: 'premium_features', label: 'Premium Features' },
  ];

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        max_discount_amount: coupon.max_discount_amount?.toString() || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        usage_limit_per_user: coupon.usage_limit_per_user,
        applicable_to: coupon.applicable_to,
        applicable_libraries: coupon.applicable_libraries || [],
        applicable_services: coupon.applicable_services,
        start_date: coupon.start_date ? new Date(coupon.start_date) : null,
        end_date: coupon.end_date ? new Date(coupon.end_date) : null,
        terms_and_conditions: coupon.terms_and_conditions || '',
      });
    } else {
      // Reset form for new coupon
      setFormData({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 0,
        max_discount_amount: '',
        usage_limit: '',
        usage_limit_per_user: 1,
        applicable_to: 'all',
        applicable_libraries: [],
        applicable_services: ['booking'],
        start_date: null,
        end_date: null,
        terms_and_conditions: '',
      });
    }
    setError(null);
  }, [coupon, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateCouponCode = () => {
    const prefix = 'DISC';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${prefix}${year}${random}`;
    setFormData(prev => ({ ...prev, code: code }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.code.trim()) {
        throw new Error('Coupon code is required');
      }
      if (!formData.name.trim()) {
        throw new Error('Coupon name is required');
      }
      if (formData.discount_value <= 0) {
        throw new Error('Discount value must be greater than 0');
      }
      if (formData.min_order_amount < 0) {
        throw new Error('Minimum order amount cannot be negative');
      }

      const submitData = {
        ...formData,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
      };

      if (coupon) {
        // Note: Update endpoint might need to be implemented
        toast.info('Coupon update functionality not implemented yet');
      } else {
        await referralDiscountService.createDiscountCoupon(submitData);
        toast.success('Discount coupon created successfully');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save discount coupon');
      toast.error(err.message || 'Failed to save discount coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {coupon ? 'Edit Discount Coupon' : 'Create Discount Coupon'}
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    label="Coupon Code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    required
                    helperText="Unique code for the coupon"
                  />
                  <Button
                    variant="outlined"
                    onClick={generateCouponCode}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Generate
                  </Button>
                </Box>
                
                <TextField
                  fullWidth
                  label="Coupon Name"
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
              </Stack>
            </Box>

            <Divider />

            {/* Discount Configuration */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Discount Configuration
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={formData.discount_type}
                      onChange={(e) => handleInputChange('discount_type', e.target.value)}
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                      <MenuItem value="free_hours">Free Hours</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="Discount Value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => handleInputChange('discount_value', parseFloat(e.target.value) || 0)}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText={
                      formData.discount_type === 'percentage' ? 'Percentage discount' :
                      formData.discount_type === 'fixed' ? 'Fixed amount in ₹' :
                      'Number of free hours'
                    }
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Minimum Order Amount"
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => handleInputChange('min_order_amount', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Minimum order amount to use this coupon"
                  />
                  
                  <TextField
                    fullWidth
                    label="Maximum Discount Amount"
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => handleInputChange('max_discount_amount', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Maximum discount amount (for percentage discounts)"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Usage Limits */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Usage Limits
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Total Usage Limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                    inputProps={{ min: 1 }}
                    helperText="Total number of times this coupon can be used (leave empty for unlimited)"
                  />
                  
                  <TextField
                    fullWidth
                    label="Usage Limit Per User"
                    type="number"
                    value={formData.usage_limit_per_user}
                    onChange={(e) => handleInputChange('usage_limit_per_user', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    helperText="Maximum times a single user can use this coupon"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Applicability */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Applicability
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Applicable To</InputLabel>
                  <Select
                    value={formData.applicable_to}
                    onChange={(e) => handleInputChange('applicable_to', e.target.value)}
                    label="Applicable To"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="new_users">New Users Only</MenuItem>
                    <MenuItem value="existing_users">Existing Users Only</MenuItem>
                    <MenuItem value="specific_libraries">Specific Libraries</MenuItem>
                  </Select>
                </FormControl>

                <Autocomplete
                  multiple
                  options={serviceOptions}
                  getOptionLabel={(option) => option.label}
                  value={serviceOptions.filter(option => formData.applicable_services.includes(option.value))}
                  onChange={(event, newValue) => {
                    handleInputChange('applicable_services', newValue.map(option => option.value));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Applicable Services"
                      placeholder="Select services"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option.label}
                        {...getTagProps({ index })}
                        key={option.value}
                      />
                    ))
                  }
                />
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
                helperText="Terms and conditions for using this coupon"
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
            {loading ? 'Saving...' : coupon ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default DiscountCouponDialog;















