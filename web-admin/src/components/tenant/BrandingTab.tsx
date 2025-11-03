import React from 'react';
import Grid from '@mui/material/Grid';
import {
  TextField, Button, Box, Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Tenant } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const BrandingTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: tenant?.branding || {
      logo: '',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      accentColor: '#9c27b0',
      customDomain: '',
      customCss: '',
      emailTemplate: ''
    }});

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Typography variant="h6" gutterBottom>
            Brand Colors
          </Typography>
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField {...register('primaryColor')} label="Primary Color" type="color" fullWidth />
        </Grid>
        <Grid xs={12} sm={6}>
          <TextField {...register('secondaryColor')} label="Secondary Color" type="color" fullWidth />
        </Grid>
        <Grid xs={12}>
          <TextField {...register('customDomain')} label="Custom Domain" fullWidth />
        </Grid>
        <Grid xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" type="submit">
              Save Branding
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default BrandingTab;

