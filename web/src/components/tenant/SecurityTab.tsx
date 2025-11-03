import React from 'react';
import { FormGroup, FormControlLabel, Switch, TextField, Button, Box, GridLegacy as Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Tenant } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const SecurityTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { control, register, handleSubmit } = useForm({
    defaultValues: tenant?.settings?.security || {},
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormGroup>
            <Controller
              name="mfaEnabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Enable Multi-Factor Authentication"
                />
              )}
            />
            <Controller
              name="mfaRequired"
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
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('sessionTimeout')}
            label="Session Timeout (minutes)"
            type="number"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
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

