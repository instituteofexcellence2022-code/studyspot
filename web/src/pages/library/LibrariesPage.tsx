import React from 'react';
import { Box, Typography } from '@mui/material';

import LibraryList from '../../components/library/LibraryList';

const LibrariesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Libraries
      </Typography>
      <LibraryList />
    </Box>
  );
};

export default LibrariesPage;
