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
import { referralDiscountService, PromotionalCampaign } from '../../services/referralDiscountService';

interface PromotionalCampaignDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  campaign?: PromotionalCampaign | null;
}

const PromotionalCampaignDialog: React.FC<PromotionalCampaignDialogProps> = ({
  open,
  onClose,
  onSave,
  campaign,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'discount' as 'referral' | 'discount' | 'loyalty' | 'seasonal' | 'event',
    target_audience: 'all' as 'all' | 'new_users' | 'existing_users' | 'premium_users' | 'specific_segment',
    target_segment: {} as Record<string, any>,
    budget: '',
    expected_reach: '',
    expected_conversions: '',
    start_date: null as Date | null,
    end_date: null as Date | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campaignTypeOptions = [
    { value: 'referral', label: 'Referral Program' },
    { value: 'discount', label: 'Discount Campaign' },
    { value: 'loyalty', label: 'Loyalty Program' },
    { value: 'seasonal', label: 'Seasonal Campaign' },
    { value: 'event', label: 'Event Promotion' },
  ];

  const targetAudienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'new_users', label: 'New Users' },
    { value: 'existing_users', label: 'Existing Users' },
    { value: 'premium_users', label: 'Premium Users' },
    { value: 'specific_segment', label: 'Specific Segment' },
  ];

  const segmentOptions = [
    { value: 'students', label: 'Students' },
    { value: 'professionals', label: 'Professionals' },
    { value: 'frequent_users', label: 'Frequent Users' },
    { value: 'weekend_users', label: 'Weekend Users' },
    { value: 'early_birds', label: 'Early Birds' },
    { value: 'night_owls', label: 'Night Owls' },
  ];

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        campaign_type: campaign.campaign_type,
        target_audience: campaign.target_audience,
        target_segment: campaign.target_segment || {},
        budget: campaign.budget?.toString() || '',
        expected_reach: campaign.expected_reach?.toString() || '',
        expected_conversions: campaign.expected_conversions?.toString() || '',
        start_date: campaign.start_date ? new Date(campaign.start_date) : null,
        end_date: campaign.end_date ? new Date(campaign.end_date) : null,
      });
    } else {
      // Reset form for new campaign
      setFormData({
        name: '',
        description: '',
        campaign_type: 'discount',
        target_audience: 'all',
        target_segment: {},
        budget: '',
        expected_reach: '',
        expected_conversions: '',
        start_date: null,
        end_date: null,
      });
    }
    setError(null);
  }, [campaign, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSegmentChange = (segments: string[]) => {
    const segmentData: Record<string, any> = {};
    segments.forEach(segment => {
      segmentData[segment] = true;
    });
    setFormData(prev => ({
      ...prev,
      target_segment: segmentData,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Campaign name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Campaign description is required');
      }
      if (!formData.start_date) {
        throw new Error('Start date is required');
      }
      if (!formData.end_date) {
        throw new Error('End date is required');
      }
      if (formData.start_date >= formData.end_date) {
        throw new Error('End date must be after start date');
      }

      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        expected_reach: formData.expected_reach ? parseInt(formData.expected_reach) : undefined,
        expected_conversions: formData.expected_conversions ? parseInt(formData.expected_conversions) : undefined,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      };

      if (campaign) {
        // Note: Update endpoint might need to be implemented
        toast.info('Campaign update functionality not implemented yet');
      } else {
        await referralDiscountService.createPromotionalCampaign(submitData);
        toast.success('Promotional campaign created successfully');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save promotional campaign');
      toast.error(err.message || 'Failed to save promotional campaign');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSegments = () => {
    return Object.keys(formData.target_segment).filter(key => formData.target_segment[key]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {campaign ? 'Edit Promotional Campaign' : 'Create Promotional Campaign'}
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
                  label="Campaign Name"
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
                  required
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Campaign Type</InputLabel>
                    <Select
                      value={formData.campaign_type}
                      onChange={(e) => handleInputChange('campaign_type', e.target.value)}
                      label="Campaign Type"
                    >
                      {campaignTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Target Audience */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Target Audience
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={formData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    label="Target Audience"
                  >
                    {targetAudienceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.target_audience === 'specific_segment' && (
                  <Autocomplete
                    multiple
                    options={segmentOptions}
                    getOptionLabel={(option) => option.label}
                    value={segmentOptions.filter(option => getSelectedSegments().includes(option.value))}
                    onChange={(event, newValue) => {
                      handleSegmentChange(newValue.map(option => option.value));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Target Segments"
                        placeholder="Select target segments"
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
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Budget and Goals */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Budget and Goals
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Budget (₹)"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Total budget for the campaign"
                  />
                  
                  <TextField
                    fullWidth
                    label="Expected Reach"
                    type="number"
                    value={formData.expected_reach}
                    onChange={(e) => handleInputChange('expected_reach', e.target.value)}
                    inputProps={{ min: 0 }}
                    helperText="Expected number of people to reach"
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Expected Conversions"
                  type="number"
                  value={formData.expected_conversions}
                  onChange={(e) => handleInputChange('expected_conversions', e.target.value)}
                  inputProps={{ min: 0 }}
                  helperText="Expected number of conversions"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Date Range */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Campaign Duration
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

            {/* Campaign Preview */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Campaign Preview
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {formData.name || 'Campaign Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.description || 'Campaign description will appear here'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Chip
                    label={campaignTypeOptions.find(opt => opt.value === formData.campaign_type)?.label || 'Campaign Type'}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={targetAudienceOptions.find(opt => opt.value === formData.target_audience)?.label || 'Target Audience'}
                    size="small"
                    color="secondary"
                  />
                  {formData.budget && (
                    <Chip
                      label={`Budget: ₹${formData.budget}`}
                      size="small"
                      color="info"
                    />
                  )}
                </Box>
              </Box>
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
            {loading ? 'Saving...' : campaign ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PromotionalCampaignDialog;















