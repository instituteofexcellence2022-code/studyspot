import { FormControl } from '@mui/material';
import React from 'react';
import { FormControlLabel, Switch, Button, Box } from '@mui/material';
import { FormGroup } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Tenant
  } from '../../types';

interface Props {
  tenant: Tenant | null;
  onSave: (data: any) => void;
}

const NotificationsTab: React.FC<Props> = ({ tenant, onSave }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      notifications: tenant?.settings?.notifications || {
        email: true,
        sms: false,
        push: true,
        webhookUrl: '',
        webhookEvents: [],
        emailDigestFrequency: 'weekly'
      }
    }});

  return (
    <form onSubmit={handleSubmit(onSave)}>
      <FormGroup>
        <Controller
          name="notifications.email"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Email Notifications"
            />
          )}
        />
        <Controller
          name="notifications.sms"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="SMS Notifications"
            />
          )}
        />
        <Controller
          name="notifications.push"
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


