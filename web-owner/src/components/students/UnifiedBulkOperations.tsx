import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Print as PrintIcon,
  CalendarToday as CalendarTodayIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: string;
  groups?: string[];
}

interface UnifiedBulkOperationsProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: string[];
  students: Student[];
  onBulkAction: (action: string, data: any) => void;
}

const UnifiedBulkOperations: React.FC<UnifiedBulkOperationsProps> = ({
  open,
  onClose,
  selectedStudents,
  students,
  onBulkAction,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  // Communication state
  const [messageType, setMessageType] = useState('notification');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
  });

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  // Group assignment state
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');

  // Fee management state
  const [feeAction, setFeeAction] = useState('remind');
  const [feeAmount, setFeeAmount] = useState('');
  const [feePlan, setFeePlan] = useState('');

  // Document state
  const [documentAction, setDocumentAction] = useState('request');
  const [documentType, setDocumentType] = useState('');
  const [documentMessage, setDocumentMessage] = useState('');

  // Attendance state
  const [attendanceAction, setAttendanceAction] = useState('mark');
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const getSelectedStudentDetails = () => {
    return students.filter(s => selectedStudents.includes(s.id));
  };

  const allGroups = Array.from(new Set(students.flatMap(s => s.groups || [])));

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate based on active tab
      if (activeTab === 0 && (!subject || !message)) {
        setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
        return;
      }
      if (activeTab === 1 && !newStatus) {
        setSnackbar({ open: true, message: 'Please select a status.', severity: 'error' });
        return;
      }
      if (activeTab === 2 && selectedGroups.length === 0) {
        setSnackbar({ open: true, message: 'Please select at least one group.', severity: 'error' });
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setActiveTab(0);
    setSubject('');
    setMessage('');
    setNewStatus('');
    setStatusReason('');
    setSelectedGroups([]);
    setNewGroupName('');
    setProcessing(false);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setProcessing(true);

    let data = {};
    let action = '';

    switch (activeTab) {
      case 0: // Communication
        action = 'communication';
        data = {
          type: messageType,
          subject,
          message,
          channels,
          studentIds: selectedStudents,
        };
        break;
      case 1: // Status Update
        action = 'status_update';
        data = {
          status: newStatus,
          reason: statusReason,
          studentIds: selectedStudents,
        };
        break;
      case 2: // Group Assignment
        action = 'group_assignment';
        data = {
          groups: selectedGroups,
          newGroupName: newGroupName || undefined,
          studentIds: selectedStudents,
        };
        break;
      case 3: // Fee Management
        action = 'fee_management';
        data = {
          action: feeAction,
          amount: feeAmount,
          plan: feePlan,
          studentIds: selectedStudents,
        };
        break;
      case 4: // Document Management
        action = 'document_management';
        data = {
          action: documentAction,
          type: documentType,
          message: documentMessage,
          studentIds: selectedStudents,
        };
        break;
      case 5: // Attendance
        action = 'attendance';
        data = {
          action: attendanceAction,
          status: attendanceStatus,
          date: attendanceDate,
          studentIds: selectedStudents,
        };
        break;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onBulkAction(action, data);
    setProcessing(false);
    setSuccess(true);
  };

  const renderStepContent = (step: number) => {
    if (step === 0) {
      return (
        <Box sx={{ minHeight: 400 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Select Operation Type
          </Typography>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab icon={<EmailIcon />} label="Communication" />
            <Tab icon={<PersonIcon />} label="Status Update" />
            <Tab icon={<GroupIcon />} label="Group Assignment" />
            <Tab icon={<PaymentIcon />} label="Fee Management" />
            <Tab icon={<DescriptionIcon />} label="Documents" />
            <Tab icon={<CalendarTodayIcon />} label="Attendance" />
          </Tabs>

          {/* Communication Tab */}
          {activeTab === 0 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={messageType}
                  label="Message Type"
                  onChange={(e) => setMessageType(e.target.value)}
                >
                  <MenuItem value="notification">General Notification</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="reminder">Reminder</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
                required
                placeholder="Enter your message here..."
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Delivery Channels
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={channels.email} onChange={(e) => setChannels({ ...channels, email: e.target.checked })} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon fontSize="small" />Email</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={channels.sms} onChange={(e) => setChannels({ ...channels, sms: e.target.checked })} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SmsIcon fontSize="small" />SMS</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={channels.push} onChange={(e) => setChannels({ ...channels, push: e.target.checked })} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><NotificationsIcon fontSize="small" />Push Notification</Box>}
                />
                <FormControlLabel
                  control={<Checkbox checked={channels.whatsapp} onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })} />}
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SmsIcon fontSize="small" />WhatsApp</Box>}
                />
              </FormGroup>
            </Box>
          )}

          {/* Status Update Tab */}
          {activeTab === 1 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="graduated">Graduated</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason (Optional)"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                margin="normal"
                placeholder="Enter reason for status change..."
              />
            </Box>
          )}

          {/* Group Assignment Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Assign to Groups
              </Typography>
              <FormGroup>
                {allGroups.map(group => (
                  <FormControlLabel
                    key={group}
                    control={
                      <Checkbox
                        checked={selectedGroups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroups([...selectedGroups, group]);
                          } else {
                            setSelectedGroups(selectedGroups.filter(g => g !== group));
                          }
                        }}
                      />
                    }
                    label={group}
                  />
                ))}
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Create New Group (Optional)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                margin="normal"
                placeholder="Enter new group name..."
              />
            </Box>
          )}

          {/* Fee Management Tab */}
          {activeTab === 3 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fee Action</InputLabel>
                <Select
                  value={feeAction}
                  label="Fee Action"
                  onChange={(e) => setFeeAction(e.target.value)}
                >
                  <MenuItem value="remind">Send Reminder</MenuItem>
                  <MenuItem value="waive">Waive Fee</MenuItem>
                  <MenuItem value="adjust">Adjust Amount</MenuItem>
                  <MenuItem value="extend">Extend Due Date</MenuItem>
                </Select>
              </FormControl>

              {feeAction === 'adjust' && (
                <TextField
                  fullWidth
                  label="New Amount"
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  margin="normal"
                />
              )}

              <TextField
                fullWidth
                label="Fee Plan"
                value={feePlan}
                onChange={(e) => setFeePlan(e.target.value)}
                margin="normal"
                placeholder="Select or enter fee plan..."
              />
            </Box>
          )}

          {/* Document Management Tab */}
          {activeTab === 4 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Document Action</InputLabel>
                <Select
                  value={documentAction}
                  label="Document Action"
                  onChange={(e) => setDocumentAction(e.target.value)}
                >
                  <MenuItem value="request">Request Documents</MenuItem>
                  <MenuItem value="verify">Verify Documents</MenuItem>
                  <MenuItem value="reject">Reject Documents</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentType}
                  label="Document Type"
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <MenuItem value="id_proof">ID Proof</MenuItem>
                  <MenuItem value="address_proof">Address Proof</MenuItem>
                  <MenuItem value="academic_proof">Academic Proof</MenuItem>
                  <MenuItem value="financial_proof">Financial Proof</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={documentMessage}
                onChange={(e) => setDocumentMessage(e.target.value)}
                margin="normal"
                placeholder="Enter message for students..."
              />
            </Box>
          )}

          {/* Attendance Tab */}
          {activeTab === 5 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Attendance Action</InputLabel>
                <Select
                  value={attendanceAction}
                  label="Attendance Action"
                  onChange={(e) => setAttendanceAction(e.target.value)}
                >
                  <MenuItem value="mark">Mark Attendance</MenuItem>
                  <MenuItem value="bulk_import">Bulk Import</MenuItem>
                  <MenuItem value="export">Export Records</MenuItem>
                </Select>
              </FormControl>

              {attendanceAction === 'mark' && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={attendanceStatus}
                      label="Status"
                      onChange={(e) => setAttendanceStatus(e.target.value)}
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                      <MenuItem value="excused">Excused</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </Box>
          )}
        </Box>
      );
    }

    if (step === 1) {
      return (
        <Box sx={{ minHeight: 400 }}>
          <Typography variant="h6" gutterBottom>Review & Confirm</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to perform a{' '}
            {activeTab === 0 ? 'communication' : 
             activeTab === 1 ? 'status update' :
             activeTab === 2 ? 'group assignment' :
             activeTab === 3 ? 'fee management' :
             activeTab === 4 ? 'document management' :
             'attendance'} operation on{' '}
            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}.
          </Typography>

          <List dense>
            <ListItem>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="Operation Type" secondary={
                activeTab === 0 ? 'Communication' : 
                activeTab === 1 ? 'Status Update' :
                activeTab === 2 ? 'Group Assignment' :
                activeTab === 3 ? 'Fee Management' :
                activeTab === 4 ? 'Document Management' :
                'Attendance'
              } />
            </ListItem>
            {activeTab === 0 && (
              <>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Subject" secondary={subject} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText primary="Channels" secondary={Object.entries(channels).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')} />
                </ListItem>
              </>
            )}
            {activeTab === 1 && (
              <>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="New Status" secondary={newStatus.toUpperCase()} />
                </ListItem>
                {statusReason && (
                  <ListItem>
                    <ListItemIcon><InfoIcon /></ListItemIcon>
                    <ListItemText primary="Reason" secondary={statusReason} />
                  </ListItem>
                )}
              </>
            )}
            {activeTab === 2 && (
              <>
                <ListItem>
                  <ListItemIcon><GroupIcon /></ListItemIcon>
                  <ListItemText primary="Groups" secondary={selectedGroups.join(', ') || 'None selected'} />
                </ListItem>
                {newGroupName && (
                  <ListItem>
                    <ListItemIcon><AddIcon /></ListItemIcon>
                    <ListItemText primary="New Group" secondary={newGroupName} />
                  </ListItem>
                )}
              </>
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Selected Students:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, maxHeight: 150, overflowY: 'auto' }}>
            {getSelectedStudentDetails().map(student => (
              <Chip key={student.id} label={`${student.firstName} ${student.lastName} (${student.studentId})`} />
            ))}
          </Box>
        </Box>
      );
    }

    if (step === 2) {
      return (
        <Box sx={{ minHeight: 400, textAlign: 'center', py: 4 }}>
          {processing ? (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6">Processing...</Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while the operation is being performed.
              </Typography>
            </>
          ) : success ? (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h6">Operation Completed!</Typography>
              <Typography variant="body1" color="text.secondary">
                The bulk operation was successfully performed on {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}.
              </Typography>
            </>
          ) : (
            <>
              <WarningIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h6">Operation Failed</Typography>
              <Typography variant="body1" color="text.secondary">
                An error occurred while performing the operation. Please try again.
              </Typography>
            </>
          )}
        </Box>
      );
    }

    return 'Unknown step';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Unified Bulk Operations
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          <Step><StepLabel>Configure</StepLabel></Step>
          <Step><StepLabel>Review</StepLabel></Step>
          <Step><StepLabel>Complete</StepLabel></Step>
        </Stepper>
        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        {activeStep !== 0 && !processing && !success && (
          <Button onClick={handleBack} variant="outlined">
            Back
          </Button>
        )}
        {!processing && !success && (
          <Button
            variant="contained"
            onClick={activeStep === 1 ? handleSubmit : handleNext}
            disabled={
              (activeStep === 0 && activeTab === 0 && (!subject || !message)) ||
              (activeStep === 0 && activeTab === 1 && !newStatus) ||
              (activeStep === 0 && activeTab === 2 && selectedGroups.length === 0)
            }
          >
            {activeStep === 1 ? 'Execute' : 'Next'}
          </Button>
        )}
        {success && (
          <Button onClick={() => { handleReset(); onClose(); }} variant="contained" startIcon={<CheckCircleIcon />}>
            Done
          </Button>
        )}
      </DialogActions>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default UnifiedBulkOperations;











