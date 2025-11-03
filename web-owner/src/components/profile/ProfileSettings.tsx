import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Stack
} from '@mui/material';
import { Save } from '@mui/icons-material';

const ProfileSettings: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            fullWidth
            defaultValue="Library Owner"
          />
          
          <TextField
            label="Email"
            type="email"
            fullWidth
            defaultValue="owner@libraryname.com"
          />
          
          <TextField
            label="Phone"
            fullWidth
            defaultValue="+1 234 567 8900"
          />
          
          <TextField
            label="Library Name"
            fullWidth
            defaultValue="My Library"
          />
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined">
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save />}>
              Save Changes
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
