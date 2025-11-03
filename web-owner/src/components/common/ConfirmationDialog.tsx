import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info' | 'success';
  loading?: boolean;
  destructive?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false,
  destructive = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" sx={{ fontSize: 40 }} />;
      case 'info':
        return <InfoIcon color="info" sx={{ fontSize: 40 }} />;
      case 'success':
        return <SuccessIcon color="success" sx={{ fontSize: 40 }} />;
      case 'warning':
      default:
        return <WarningIcon color="warning" sx={{ fontSize: 40 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    if (destructive) return 'error';
    if (type === 'error') return 'error';
    if (type === 'success') return 'success';
    return 'primary';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getIcon()}
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={getConfirmButtonColor()}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;















