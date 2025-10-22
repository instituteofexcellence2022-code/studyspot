/**
 * Business Info Step Component
 * First step of tenant onboarding wizard
 */

import React from 'react';
import {
  Box,
  TextField,
  GridLegacy as Grid,
  Typography,
} from '@mui/material';

interface BusinessInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Business Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Tell us about your library or study space
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Name"
            name="businessName"
            value={formData.businessName || ''}
            onChange={(e) => onChange('businessName', e.target.value)}
            error={!!errors.businessName}
            helperText={errors.businessName}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Business Type"
            name="businessType"
            value={formData.businessType || ''}
            onChange={(e) => onChange('businessType', e.target.value)}
            error={!!errors.businessType}
            helperText={errors.businessType}
            select
            SelectProps={{ native: true }}
          >
            <option value="">Select Type</option>
            <option value="library">Library</option>
            <option value="study_space">Study Space</option>
            <option value="coworking">Coworking Space</option>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber || ''}
            onChange={(e) => onChange('registrationNumber', e.target.value)}
            error={!!errors.registrationNumber}
            helperText={errors.registrationNumber}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Address"
            name="address"
            value={formData.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            multiline
            rows={3}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
            error={!!errors.city}
            helperText={errors.city}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State"
            name="state"
            value={formData.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
            error={!!errors.state}
            helperText={errors.state}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            error={!!errors.country}
            helperText={errors.country}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessInfoStep;
