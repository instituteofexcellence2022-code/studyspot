/**
 * Contact Info Step Component
 * Second step of tenant onboarding wizard
 */

import React from 'react';
import {
  Box,
  TextField,
  GridLegacy as Grid,
  Typography,
} from '@mui/material';

interface ContactInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Contact Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        How can we reach you?
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Alternate Phone"
            name="alternatePhone"
            value={formData.alternatePhone || ''}
            onChange={(e) => onChange('alternatePhone', e.target.value)}
            error={!!errors.alternatePhone}
            helperText={errors.alternatePhone}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Website (Optional)"
            name="website"
            value={formData.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            error={!!errors.website}
            helperText={errors.website}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactInfoStep;
