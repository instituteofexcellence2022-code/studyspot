import React from 'react';
import { FormGroup, FormControlLabel, Switch, Button, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Tenant } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const NotificationsTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: tenant?.settings?.notifications || {},
  });

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <FormGroup>
        <Controller
          name="emailNotifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Email Notifications"
            />
          )}
        />
        <Controller
          name="smsNotifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="SMS Notifications"
            />
          )}
        />
        <Controller
          name="pushNotifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Push Notifications"
            />
          )}
        />
      </FormGroup>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" type="submit">
          Save Preferences
        </Button>
      </Box>
    </form>
  );
};

export default NotificationsTab;


