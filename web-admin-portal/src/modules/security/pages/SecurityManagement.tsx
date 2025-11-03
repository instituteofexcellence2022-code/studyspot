import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SecurityManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Security management features coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default SecurityManagement;

