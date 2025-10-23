import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Close, Receipt, CheckCircle, Person } from '@mui/icons-material';

interface OfflinePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const OfflinePaymentDialog: React.FC<OfflinePaymentDialogProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    amount: '',
    paymentMethod: 'cash',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    referenceNumber: '',
    notes: '',
    receivedBy: '', // Staff member receiving payment
    staffConfirmation: false, // Staff confirmation checkbox
  });

  const [errors, setErrors] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.studentName) newErrors.studentName = 'Required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Invalid amount';
    if (!formData.description) newErrors.description = 'Required';
    if (!formData.receivedBy) newErrors.receivedBy = 'Staff name required';
    if (formData.paymentMethod === 'cheque' && !formData.chequeNumber) {
      newErrors.chequeNumber = 'Required for cheque';
    }
    if (formData.paymentMethod === 'bank_transfer' && !formData.referenceNumber) {
      newErrors.referenceNumber = 'Required for bank transfer';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = () => {
    if (!formData.staffConfirmation) {
      alert('Please confirm that all payment details are correct');
      return;
    }
    onSubmit(formData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      studentName: '',
      studentId: '',
      amount: '',
      paymentMethod: 'cash',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
      chequeNumber: '',
      chequeDate: '',
      bankName: '',
      referenceNumber: '',
      notes: '',
      receivedBy: '',
      staffConfirmation: false,
    });
    setErrors({});
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            <Typography variant="h6">Record Offline Payment</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {!showConfirmation ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            <Alert severity="info" icon={<Person />}>
              <strong>Staff Information Required</strong> - Please enter your name as the receiving staff member
            </Alert>

            <TextField
              fullWidth
              label="Received By (Staff Name)"
              value={formData.receivedBy}
              onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
              error={!!errors.receivedBy}
              helperText={errors.receivedBy || 'Enter your full name'}
              required
              placeholder="e.g., John Doe"
            />

            <Divider sx={{ my: 1 }}>Student & Payment Details</Divider>

            <TextField
              fullWidth
              label="Student Name"
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              error={!!errors.studentName}
              helperText={errors.studentName}
              required
            />

          <TextField
            fullWidth
            label="Student ID"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          />

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            error={!!errors.amount}
            helperText={errors.amount}
            required
            InputProps={{ startAdornment: '₹' }}
          />

          <FormControl fullWidth required>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Transaction Date"
            type="date"
            value={formData.transactionDate}
            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description}
            required
            placeholder="e.g., Monthly Fee - November 2025"
          />

          {formData.paymentMethod === 'cheque' && (
            <>
              <TextField
                fullWidth
                label="Cheque Number"
                value={formData.chequeNumber}
                onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                error={!!errors.chequeNumber}
                helperText={errors.chequeNumber}
                required
              />
              <TextField
                fullWidth
                label="Cheque Date"
                type="date"
                value={formData.chequeDate}
                onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </>
          )}

          {formData.paymentMethod === 'bank_transfer' && (
            <TextField
              fullWidth
              label="Reference/Transaction Number"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              error={!!errors.referenceNumber}
              helperText={errors.referenceNumber}
              required
            />
          )}

          <TextField
            fullWidth
            label="Additional Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={3}
            placeholder="Any additional information..."
          />

            <Alert severity="info">
              Payment will be marked as "Pending Verification" and can be approved from the verification queue.
            </Alert>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <Alert severity="warning" icon={<CheckCircle />}>
              <strong>Staff Confirmation Required</strong>
            </Alert>

            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>

            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2"><strong>Student:</strong> {formData.studentName}</Typography>
              <Typography variant="body2"><strong>Amount:</strong> ₹{parseFloat(formData.amount || '0').toLocaleString()}</Typography>
              <Typography variant="body2"><strong>Method:</strong> {formData.paymentMethod.toUpperCase()}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {new Date(formData.transactionDate).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>Description:</strong> {formData.description}</Typography>
              {formData.chequeNumber && (
                <Typography variant="body2"><strong>Cheque:</strong> {formData.chequeNumber}</Typography>
              )}
              {formData.referenceNumber && (
                <Typography variant="body2"><strong>Reference:</strong> {formData.referenceNumber}</Typography>
              )}
            </Box>

            <Divider />

            <Box sx={{ bgcolor: 'primary.lighter', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <Person sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                Staff Confirmation
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Received By:</strong> {formData.receivedBy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                By confirming, you certify that you have received this payment and all details are accurate.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.staffConfirmation}
                  onChange={(e) => setFormData({ ...formData, staffConfirmation: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  <strong>I confirm that I have received this payment and all details are correct</strong>
                </Typography>
              }
            />

            <Alert severity="success">
              Once confirmed, this payment will be recorded and sent for admin verification.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {!showConfirmation ? (
          <>
            <Button onClick={handleReset} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Review & Confirm
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setShowConfirmation(false)} color="inherit">
              Back to Edit
            </Button>
            <Button 
              onClick={handleConfirmSubmit} 
              variant="contained" 
              color="success"
              startIcon={<CheckCircle />}
              disabled={!formData.staffConfirmation}
            >
              Confirm & Submit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OfflinePaymentDialog;

