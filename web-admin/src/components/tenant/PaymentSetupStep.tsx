import { FormControl } from '@mui/material';
/**
 * Payment Setup Step Component
 * Fourth step of tenant onboarding wizard
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import {
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Box
} from '@mui/material';

interface PaymentSetupStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({
  formData,
  onChange,
  errors}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Information
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add your payment details to complete setup
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TextField
            fullWidth
            label="Card Number"
            name="cardNumber"
            value={formData.cardNumber || ''}
            onChange={(e) => onChange('cardNumber', e.target.value)}
            error={!!errors.cardNumber}
            helperText={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
            required
          />
        </Grid>

        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="Expiry Date"
            name="expiryDate"
            value={formData.expiryDate || ''}
            onChange={(e) => onChange('expiryDate', e.target.value)}
            error={!!errors.expiryDate}
            helperText={errors.expiryDate}
            placeholder="MM/YY"
            required
          />
        </Grid>

        <Grid xs={12} sm={6}>
          <TextField
            fullWidth
            label="CVV"
            name="cvv"
            value={formData.cvv || ''}
            onChange={(e) => onChange('cvv', e.target.value)}
            error={!!errors.cvv}
            helperText={errors.cvv}
            placeholder="123"
            required
          />
        </Grid>

        <Grid xs={12}>
          <TextField
            fullWidth
            label="Cardholder Name"
            name="cardholderName"
            value={formData.cardholderName || ''}
            onChange={(e) => onChange('cardholderName', e.target.value)}
            error={!!errors.cardholderName}
            helperText={errors.cardholderName}
            required
          />
        </Grid>

        <Grid xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.saveCard || false}
                onChange={(e) => onChange('saveCard', e.target.checked)}
              />
            }
            label="Save this card for future payments"
          />
        </Grid>

        <Grid xs={12}>
          <Typography variant="caption" color="text.secondary">
            Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentSetupStep;
