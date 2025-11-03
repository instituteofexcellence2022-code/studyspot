import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Avatar,
} from '@mui/material';
import { CheckCircle, Cancel, Close, Person, Receipt } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  paymentMethod: string;
  description: string;
  date: string;
  chequeNumber?: string;
  bankName?: string;
  referenceNumber?: string;
  notes?: string;
}

interface PaymentVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onApprove: (data: { notes: string; generateReceipt: boolean; sendEmail: boolean }) => void;
  onReject: (reason: string) => void;
}

const PaymentVerificationDialog: React.FC<PaymentVerificationDialogProps> = ({
  open,
  onClose,
  payment,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);

  if (!payment) return null;

  const handleApprove = () => {
    onApprove({ notes, generateReceipt, sendEmail });
    handleReset();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(rejectionReason);
    handleReset();
  };

  const handleReset = () => {
    setAction(null);
    setNotes('');
    setRejectionReason('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            <Typography variant="h6">Payment Verification</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            p: 2,
            mb: 2,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6">{payment.studentName}</Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {payment.studentId}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                ₹{payment.amount.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Method
              </Typography>
              <Chip label={payment.paymentMethod.toUpperCase()} size="small" color="primary" />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body2">{new Date(payment.date).toLocaleDateString()}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2">{payment.description}</Typography>
            </Box>
          </Box>
        </Box>

        {payment.chequeNumber && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Cheque:</strong> {payment.chequeNumber} | <strong>Bank:</strong> {payment.bankName}
          </Alert>
        )}

        {payment.referenceNumber && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Reference:</strong> {payment.referenceNumber}
          </Alert>
        )}

        {!action && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Verify this payment?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setAction('approve')}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setAction('reject')}
              >
                Reject
              </Button>
            </Box>
          </Box>
        )}

        {action === 'approve' && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Approving payment - it will be marked as completed
            </Alert>
            <TextField
              fullWidth
              label="Verification Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={generateReceipt} onChange={(e) => setGenerateReceipt(e.target.checked)} />}
              label="Generate receipt automatically"
            />
            <FormControlLabel
              control={<Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />}
              label="Send confirmation email"
            />
          </Box>
        )}

        {action === 'reject' && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              Rejecting payment - please provide a reason
            </Alert>
            <TextField
              fullWidth
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              required
              placeholder="e.g., Insufficient proof, Invalid amount..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!action && <Button onClick={onClose}>Close</Button>}
        {action && (
          <>
            <Button onClick={() => setAction(null)} variant="outlined">
              Back
            </Button>
            {action === 'approve' && (
              <Button onClick={handleApprove} variant="contained" color="success">
                Confirm Approval
              </Button>
            )}
            {action === 'reject' && (
              <Button onClick={handleReject} variant="contained" color="error">
                Confirm Rejection
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentVerificationDialog;

