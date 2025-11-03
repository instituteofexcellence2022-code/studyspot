import { FormControl, FormGroup, FormControlLabel, Switch, TextField, Button, Box } from '@mui/material';
import React from 'react';
import Grid from '@mui/material/Grid';
import { useForm, Controller } from 'react-hook-form';
import { Tenant } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const SecurityTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { control, register, handleSubmit } = useForm({
    defaultValues: tenant?.settings?.security || {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      sessionPolicy: {
        sessionTimeout: 30,
        ipWhitelist: []
      },
      mfaPolicy: {
        mfaEnabled: false,
        mfaRequired: false
      }
    }});

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <FormGroup>
            <Controller
              name="mfaPolicy.mfaEnabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Enable Multi-Factor Authentication"
                />
              )}
            />
            <Controller
              name="mfaPolicy.mfaRequired"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Require MFA for All Users"
                />
              )}
            />
          </FormGroup>
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField
            {...register('sessionTimeout')}
            label="Session Timeout (minutes)"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" type="submit">
              Save Security Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default SecurityTab;

