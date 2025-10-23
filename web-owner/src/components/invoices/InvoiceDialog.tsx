import React, { useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Chip, Alert, Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Close, Print, Download, Share, Email, WhatsApp, ContentCopy, CheckCircle,
  Receipt, Description, QrCode2,
} from '@mui/icons-material';
import { InvoiceData, InvoiceItem } from '../../utils/invoiceGenerator';

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

const InvoiceDialog: React.FC<InvoiceDialogProps> = ({ open, onClose, invoice }) => {
  const theme = useTheme();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [shareAnchorEl, setShareAnchorEl] = React.useState<null | HTMLElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Print functionality using browser's native print
  const handlePrint = () => {
    // Add print-specific styles
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-content, #invoice-content * {
          visibility: visible;
        }
        #invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    window.print();
    
    // Clean up
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, 1000);
  };

  // Download as PDF
  const handleDownload = () => {
    if (window.print) {
      window.print();
    }
  };

  // Share menu
  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  // Share via Email
  const handleShareEmail = () => {
    if (!invoice) return;
    const subject = `Invoice ${invoice.invoiceNumber} - STUDYSPOT`;
    const body = `Dear ${invoice.studentName},\n\nPlease find your invoice details below:\n\nInvoice Number: ${invoice.invoiceNumber}\nAmount: ₹${invoice.total}\nStatus: ${invoice.paymentStatus}\n\nThank you!`;
    window.location.href = `mailto:${invoice.studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    handleShareClose();
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    if (!invoice) return;
    const message = `*Invoice ${invoice.invoiceNumber}*\n\nStudent: ${invoice.studentName}\nAmount: ₹${invoice.total}\nStatus: ${invoice.paymentStatus.toUpperCase()}\n\nThank you for choosing STUDYSPOT! 📚`;
    window.open(`https://wa.me/${invoice.studentPhone}?text=${encodeURIComponent(message)}`, '_blank');
    handleShareClose();
  };

  // Copy invoice link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/invoices/${invoice?.invoiceNumber}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    handleShareClose();
  };

  if (!invoice) return null;

  const statusColor = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    partial: 'info',
    failed: 'error',
    refunded: 'info',
  }[invoice.paymentStatus] as 'success' | 'warning' | 'error' | 'info';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt color="primary" />
          <Typography variant="h6">Invoice / Receipt</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} size="small">
              <Print />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton onClick={handleDownload} size="small">
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleShareClick} size="small">
              <Share />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Printable Invoice Content */}
        <Box id="invoice-content" ref={invoiceRef} sx={{ p: 4, bgcolor: 'background.paper' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item xs={6}>
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                  STUDYSPOT
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Library Management System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  contact@studyspot.com
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +91 1234567890
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Chip 
                  label={invoice.paymentStatus.toUpperCase()} 
                  color={statusColor}
                  sx={{ mb: 2, fontWeight: 600 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  {invoice.paymentStatus === 'paid' ? 'RECEIPT' : 'INVOICE'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{invoice.invoiceNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Bill To & Invoice Details */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                BILL TO:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {invoice.studentName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {invoice.studentId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.studentEmail}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.studentPhone}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'inline-block', textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}
                </Typography>
                {invoice.dueDate && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
                  </Typography>
                )}
                {invoice.paymentMethod && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Payment Method:</strong> {invoice.paymentMethod}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Items Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="center"><strong>Qty</strong></TableCell>
                  <TableCell align="right"><strong>Rate</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">₹{item.rate.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <strong>Subtotal:</strong>
                  </TableCell>
                  <TableCell align="right">₹{invoice.subtotal.toFixed(2)}</TableCell>
                </TableRow>
                {invoice.discount && invoice.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ color: 'success.main' }}>
                      <strong>Discount:</strong>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      -₹{invoice.discount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                {invoice.tax && invoice.tax > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Tax (18%):</strong>
                    </TableCell>
                    <TableCell align="right">₹{invoice.tax.toFixed(2)}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <Typography variant="h6" fontWeight={700}>
                      TOTAL:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      ₹{invoice.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
                {invoice.paidAmount && invoice.paidAmount > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ color: 'success.main' }}>
                        <strong>Paid Amount:</strong>
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        ₹{invoice.paidAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ color: 'error.main' }}>
                        <strong>Balance Due:</strong>
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        ₹{(invoice.total - invoice.paidAmount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Notes */}
          {invoice.notes && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes:
              </Typography>
              <Typography variant="body2">
                {invoice.notes}
              </Typography>
            </Box>
          )}

          {/* Footer */}
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Thank you for choosing STUDYSPOT! 🎓
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <QrCode2 sx={{ fontSize: 40 }} />
                <Typography variant="caption" color="text.secondary">
                  Scan to pay
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {invoice.paymentStatus === 'paid' && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              border: `2px solid ${theme.palette.success.main}`,
              textAlign: 'center',
            }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main" fontWeight={600}>
                PAYMENT RECEIVED
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This is a computer-generated receipt and does not require a signature.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: 1, 
        borderColor: 'divider', 
        p: 2,
        justifyContent: 'space-between',
      }}>
        <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
          Invoice saved to your records automatically
        </Alert>
        <Box>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogActions>

      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={handleShareEmail}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareWhatsApp}>
          <ListItemIcon>
            <WhatsApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share via WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            {copied ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{copied ? 'Link Copied!' : 'Copy Link'}</ListItemText>
        </MenuItem>
      </Menu>
    </Dialog>
  );
};

export default InvoiceDialog;

