import React from 'react';
import { GridLegacy as Grid, TextField, Button, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Tenant } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const GeneralSettingsTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: tenant?.settings || {},
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField {...register('timezone')} label="Timezone" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...register('language')} label="Language" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField {...register('currency')} label="Currency" fullWidth />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" type="submit">
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default GeneralSettingsTab;

