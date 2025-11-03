import React from 'react';
import { Box, Typography, Container
 } from '@mui/material';
import ProfileSettings from '../../components/profile/ProfileSettings';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your account information and preferences
        </Typography>
        <ProfileSettings />
      </Box>
    </Container>
  );
};

export default ProfilePage;

