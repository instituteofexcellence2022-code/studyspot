import { FormControl } from '@mui/material';
import React from 'react';
import { Box, Typography, FormControlLabel, Divider, Alert, Checkbox } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

interface ConfirmationStepProps {
  formData: any;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ formData }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Information
      </Typography>

      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">Business Information</Typography>
        <Typography variant="body2">Name: {formData.legalName}</Typography>
        <Typography variant="body2">Type: {formData.businessType}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ my: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold">Contact Information</Typography>
        <Typography variant="body2">Email: {formData.email}</Typography>
        <Typography variant="body2">Phone: {formData.phone}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Alert severity="warning" sx={{ my: 3 }}>
        By completing this setup, you agree to our Terms of Service and Privacy Policy.
      </Alert>

      <Controller
        name="acceptedTerms"
        control={control}
        rules={{ required: 'You must accept the terms and conditions' }}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value || false} />}
            label="I accept the Terms of Service and Privacy Policy"
          />
        )}
      />
      {errors.acceptedTerms && (
        <Typography color="error" variant="caption" display="block">
          {errors.acceptedTerms.message as string}
        </Typography>
      )}
    </Box>
  );
};

export default ConfirmationStep;


