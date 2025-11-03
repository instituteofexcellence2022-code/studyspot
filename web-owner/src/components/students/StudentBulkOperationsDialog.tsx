import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Group as GroupIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  CreditCard as CreditCardIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface StudentBulkOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: string[];
  onBulkAction: (action: string, data: any) => void;
  students: any[];
}

const StudentBulkOperationsDialog: React.FC<StudentBulkOperationsDialogProps> = ({
  open,
  onClose,
  selectedStudents,
  onBulkAction,
  students,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState('');
  const [bulkData, setBulkData] = useState({
    status: '',
    feeStatus: '',
    group: '',
    plan: '',
    message: '',
    subject: '',
    notificationType: 'email',
    sendEmail: true,
    sendSms: false,
    sendInApp: true,
    generateIdCards: false,
    exportFormat: 'csv',
  });

  const steps = ['Select Action', 'Configure', 'Review & Execute'];

  const bulkActions = [
    {
      id: 'update_status',
      label: 'Update Status',
      description: 'Change status of selected students',
      icon: <FlagIcon />,
      color: 'primary',
    },
    {
      id: 'update_fee_status',
      label: 'Update Fee Status',
      description: 'Change fee payment status',
      icon: <CreditCardIcon />,
      color: 'secondary',
    },
    {
      id: 'assign_group',
      label: 'Assign Group',
      description: 'Assign students to a group',
      icon: <GroupIcon />,
      color: 'info',
    },
    {
      id: 'change_plan',
      label: 'Change Plan',
      description: 'Update student subscription plan',
      icon: <SchoolIcon />,
      color: 'success',
    },
    {
      id: 'send_message',
      label: 'Send Message',
      description: 'Send notification to selected students',
      icon: <SendIcon />,
      color: 'warning',
    },
    {
      id: 'generate_id_cards',
      label: 'Generate ID Cards',
      description: 'Generate digital ID cards for students',
      icon: <AssignmentIcon />,
      color: 'info',
    },
    {
      id: 'export_data',
      label: 'Export Data',
      description: 'Export student information',
      icon: <DownloadIcon />,
      color: 'primary',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedAction('');
    setBulkData({
      status: '',
      feeStatus: '',
      group: '',
      plan: '',
      message: '',
      subject: '',
      notificationType: 'email',
      sendEmail: true,
      sendSms: false,
      sendInApp: true,
      generateIdCards: false,
      exportFormat: 'csv',
    });
  };

  const handleExecute = () => {
    onBulkAction(selectedAction, bulkData);
    handleReset();
    onClose();
  };

  const getActionConfig = () => {
    switch (selectedAction) {
      case 'update_status':
        return (
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={bulkData.status}
              onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
              label="New Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="graduated">Graduated</MenuItem>
            </Select>
          </FormControl>
        );

      case 'update_fee_status':
        return (
          <FormControl fullWidth>
            <InputLabel>Fee Status</InputLabel>
            <Select
              value={bulkData.feeStatus}
              onChange={(e) => setBulkData({ ...bulkData, feeStatus: e.target.value })}
              label="Fee Status"
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
            </Select>
          </FormControl>
        );

      case 'assign_group':
        return (
          <FormControl fullWidth>
            <InputLabel>Group</InputLabel>
            <Select
              value={bulkData.group}
              onChange={(e) => setBulkData({ ...bulkData, group: e.target.value })}
              label="Group"
            >
              <MenuItem value="Group A">Group A</MenuItem>
              <MenuItem value="Group B">Group B</MenuItem>
              <MenuItem value="Group C">Group C</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
            </Select>
          </FormControl>
        );

      case 'change_plan':
        return (
          <FormControl fullWidth>
            <InputLabel>Subscription Plan</InputLabel>
            <Select
              value={bulkData.plan}
              onChange={(e) => setBulkData({ ...bulkData, plan: e.target.value })}
              label="Subscription Plan"
            >
              <MenuItem value="Basic">Basic Plan</MenuItem>
              <MenuItem value="Premium">Premium Plan</MenuItem>
              <MenuItem value="VIP">VIP Plan</MenuItem>
              <MenuItem value="Monthly Premium">Monthly Premium</MenuItem>
              <MenuItem value="Yearly Premium">Yearly Premium</MenuItem>
            </Select>
          </FormControl>
        );

      case 'send_message':
        return (
          <Box>
            <TextField
              fullWidth
              label="Subject"
              value={bulkData.subject}
              onChange={(e) => setBulkData({ ...bulkData, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={bulkData.message}
              onChange={(e) => setBulkData({ ...bulkData, message: e.target.value })}
              placeholder="Enter your message here..."
            />
            
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Notification Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bulkData.sendEmail}
                        onChange={(e) => setBulkData({ ...bulkData, sendEmail: e.target.checked })}
                      />
                    }
                    label="Send Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bulkData.sendSms}
                        onChange={(e) => setBulkData({ ...bulkData, sendSms: e.target.checked })}
                      />
                    }
                    label="Send SMS"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bulkData.sendInApp}
                        onChange={(e) => setBulkData({ ...bulkData, sendInApp: e.target.checked })}
                      />
                    }
                    label="In-App Notification"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 'generate_id_cards':
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will generate digital ID cards for all selected students. The cards will be available for download.
            </Alert>
            <FormControlLabel
              control={
                <Switch
                  checked={bulkData.generateIdCards}
                  onChange={(e) => setBulkData({ ...bulkData, generateIdCards: e.target.checked })}
                />
              }
              label="Include QR Code"
            />
          </Box>
        );

      case 'export_data':
        return (
          <FormControl fullWidth>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={bulkData.exportFormat}
              onChange={(e) => setBulkData({ ...bulkData, exportFormat: e.target.value })}
              label="Export Format"
            >
              <MenuItem value="csv">CSV (Excel)</MenuItem>
              <MenuItem value="pdf">PDF Report</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return null;
    }
  };

  const getActionSummary = () => {
    const action = bulkActions.find(a => a.id === selectedAction);
    if (!action) return null;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {action.icon}
          {action.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {action.description}
        </Typography>
        
        {selectedAction === 'update_status' && bulkData.status && (
          <Typography variant="body2">
            <strong>New Status:</strong> {bulkData.status}
          </Typography>
        )}
        
        {selectedAction === 'update_fee_status' && bulkData.feeStatus && (
          <Typography variant="body2">
            <strong>Fee Status:</strong> {bulkData.feeStatus}
          </Typography>
        )}
        
        {selectedAction === 'assign_group' && bulkData.group && (
          <Typography variant="body2">
            <strong>Group:</strong> {bulkData.group}
          </Typography>
        )}
        
        {selectedAction === 'change_plan' && bulkData.plan && (
          <Typography variant="body2">
            <strong>Plan:</strong> {bulkData.plan}
          </Typography>
        )}
        
        {selectedAction === 'send_message' && bulkData.message && (
          <Box>
            <Typography variant="body2">
              <strong>Subject:</strong> {bulkData.subject}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Message:</strong> {bulkData.message}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              {bulkData.sendEmail && <Chip label="Email" size="small" color="primary" />}
              {bulkData.sendSms && <Chip label="SMS" size="small" color="secondary" />}
              {bulkData.sendInApp && <Chip label="In-App" size="small" color="success" />}
            </Box>
          </Box>
        )}
        
        {selectedAction === 'export_data' && bulkData.exportFormat && (
          <Typography variant="body2">
            <strong>Format:</strong> {bulkData.exportFormat.toUpperCase()}
          </Typography>
        )}
      </Paper>
    );
  };

  const selectedStudentsData = students.filter(s => selectedStudents.includes(s.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            Bulk Operations
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{selectedStudents.length}</strong> students selected for bulk operation
            </Typography>
          </Alert>
          
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step 1: Select Action */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose an action to perform on {selectedStudents.length} students:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, mt: 2 }}>
              {bulkActions.map((action) => (
                <Paper
                  key={action.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: selectedAction === action.id ? 2 : 1,
                    borderColor: selectedAction === action.id ? `${action.color}.main` : 'divider',
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {action.icon}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {action.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Step 2: Configure */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure the action:
            </Typography>
            <Box sx={{ mt: 2 }}>
              {getActionConfig()}
            </Box>
          </Box>
        )}

        {/* Step 3: Review & Execute */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review and execute:
            </Typography>
            
            {getActionSummary()}
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                This action will be applied to <strong>{selectedStudents.length}</strong> students. 
                This action cannot be undone.
              </Typography>
            </Alert>

            {/* Selected Students Preview */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Selected Students ({selectedStudents.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {selectedStudentsData.slice(0, 10).map((student) => (
                    <ListItem key={student.id}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={`${student.email} • ${student.studentId}`}
                      />
                    </ListItem>
                  ))}
                  {selectedStudentsData.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${selectedStudentsData.length - 10} more students`}
                      />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={!selectedAction || (activeStep === 1 && !getActionConfig())}
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleExecute} 
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
          >
            Execute Action
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentBulkOperationsDialog;













