import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { hideSnackbar } from '../../store/slices/uiSlice';

const GlobalSnackbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((state) => state.ui.snackbar);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;

