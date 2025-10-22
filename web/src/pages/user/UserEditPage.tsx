import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UserEditPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit User
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User edit form will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserEditPage;


