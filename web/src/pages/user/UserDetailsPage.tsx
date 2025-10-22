import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UserDetailsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User details page will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserDetailsPage;


