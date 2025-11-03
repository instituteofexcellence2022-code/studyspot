// ============================================
// GLOBAL SNACKBAR COMPONENT
// ============================================

import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { hideSnackbar } from '../../../store/slices/uiSlice';

const GlobalSnackbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { snackbar } = useAppSelector((state) => state.ui);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;

