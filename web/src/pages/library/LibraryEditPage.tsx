import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLibraryById } from '../../store/slices/librarySlice';
import LibraryForm from '../../components/library/LibraryForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LibraryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedLibrary, isLoading, error } = useAppSelector((state) => state.library);

  useEffect(() => {
    if (id) {
      dispatch(fetchLibraryById(id));
    }
  }, [dispatch, id]);

  if (!id) {
    return <Navigate to="/libraries" replace />;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading library details..." />;
  }

  if (error || !selectedLibrary) {
    return <Navigate to="/libraries" replace />;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Library: {selectedLibrary.name}
      </Typography>
      <LibraryForm library={selectedLibrary} />
    </Box>
  );
};

export default LibraryEditPage;
