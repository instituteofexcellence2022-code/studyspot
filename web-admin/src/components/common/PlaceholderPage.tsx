import React from 'react';
import { Box, Typography } from '@mui/material';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PlaceholderPage;


