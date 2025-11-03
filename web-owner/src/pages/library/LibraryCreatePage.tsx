import React from 'react';
import { Box, Typography } from '@mui/material';

import LibraryForm from '../../components/library/LibraryForm';

const LibraryCreatePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Library
      </Typography>
      <LibraryForm />
    </Box>
  );
};

export default LibraryCreatePage;
