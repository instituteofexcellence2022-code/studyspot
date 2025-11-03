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
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface BulkOperationsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedIssues: string[];
  onBulkAction: (action: string, data: any) => void;
  categories: any[];
  priorities: any[];
  statuses: any[];
  assignees: any[];
}

const BulkOperationsDialog: React.FC<BulkOperationsDialogProps> = ({
  open,
  onClose,
  selectedIssues,
  onBulkAction,
  categories,
  priorities,
  statuses,
  assignees,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState('');
  const [bulkData, setBulkData] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
    comment: '',
    notifyUsers: true,
    sendEmail: false,
  });

  const steps = ['Select Action', 'Configure', 'Review & Execute'];

  const bulkActions = [
    {
      id: 'assign',
      label: 'Assign Issues',
      description: 'Assign selected issues to a team member',
      icon: <PersonIcon />,
      color: 'primary',
    },
    {
      id: 'change_status',
      label: 'Change Status',
      description: 'Update status of selected issues',
      icon: <FlagIcon />,
      color: 'secondary',
    },
    {
      id: 'change_priority',
      label: 'Change Priority',
      description: 'Update priority level of selected issues',
      icon: <FlagIcon />,
      color: 'warning',
    },
    {
      id: 'change_category',
      label: 'Change Category',
      description: 'Update category of selected issues',
      icon: <CategoryIcon />,
      color: 'info',
    },
    {
      id: 'add_comment',
      label: 'Add Comment',
      description: 'Add a comment to all selected issues',
      icon: <CommentIcon />,
      color: 'success',
    },
    {
      id: 'close',
      label: 'Close Issues',
      description: 'Close selected issues with a comment',
      icon: <CheckCircleIcon />,
      color: 'success',
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
      priority: '',
      category: '',
      assignee: '',
      comment: '',
      notifyUsers: true,
      sendEmail: false,
    });
  };

  const handleExecute = () => {
    onBulkAction(selectedAction, bulkData);
    handleReset();
    onClose();
  };

  const getActionConfig = () => {
    switch (selectedAction) {
      case 'assign':
        return (
          <FormControl fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={bulkData.assignee}
              onChange={(e) => setBulkData({ ...bulkData, assignee: e.target.value })}
              label="Assign To"
            >
              {assignees.map((assignee) => (
                <MenuItem key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'change_status':
        return (
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={bulkData.status}
              onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
              label="New Status"
            >
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: status.color,
                      }}
                    />
                    {status.display_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'change_priority':
        return (
          <FormControl fullWidth>
            <InputLabel>New Priority</InputLabel>
            <Select
              value={bulkData.priority}
              onChange={(e) => setBulkData({ ...bulkData, priority: e.target.value })}
              label="New Priority"
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: priority.color,
                      }}
                    />
                    {priority.display_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'change_category':
        return (
          <FormControl fullWidth>
            <InputLabel>New Category</InputLabel>
            <Select
              value={bulkData.category}
              onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
              label="New Category"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: category.color,
                      }}
                    />
                    {category.display_name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'add_comment':
      case 'close':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            value={bulkData.comment}
            onChange={(e) => setBulkData({ ...bulkData, comment: e.target.value })}
            placeholder="Enter your comment here..."
          />
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
        
        {selectedAction === 'assign' && bulkData.assignee && (
          <Typography variant="body2">
            <strong>Assign to:</strong> {assignees.find(a => a.id === bulkData.assignee)?.name}
          </Typography>
        )}
        
        {selectedAction === 'change_status' && bulkData.status && (
          <Typography variant="body2">
            <strong>New Status:</strong> {statuses.find(s => s.id === bulkData.status)?.display_name}
          </Typography>
        )}
        
        {selectedAction === 'change_priority' && bulkData.priority && (
          <Typography variant="body2">
            <strong>New Priority:</strong> {priorities.find(p => p.id === bulkData.priority)?.display_name}
          </Typography>
        )}
        
        {selectedAction === 'change_category' && bulkData.category && (
          <Typography variant="body2">
            <strong>New Category:</strong> {categories.find(c => c.id === bulkData.category)?.display_name}
          </Typography>
        )}
        
        {(selectedAction === 'add_comment' || selectedAction === 'close') && bulkData.comment && (
          <Typography variant="body2">
            <strong>Comment:</strong> {bulkData.comment}
          </Typography>
        )}
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
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
              <strong>{selectedIssues.length}</strong> issues selected for bulk operation
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
              Choose an action to perform on {selectedIssues.length} issues:
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
            
            {(selectedAction === 'add_comment' || selectedAction === 'close') && (
              <Box sx={{ mt: 2 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Notification Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bulkData.notifyUsers}
                            onChange={(e) => setBulkData({ ...bulkData, notifyUsers: e.target.checked })}
                          />
                        }
                        label="Notify users via in-app notification"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={bulkData.sendEmail}
                            onChange={(e) => setBulkData({ ...bulkData, sendEmail: e.target.checked })}
                          />
                        }
                        label="Send email notification"
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
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
                This action will be applied to <strong>{selectedIssues.length}</strong> issues. 
                This action cannot be undone.
              </Typography>
            </Alert>
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

export default BulkOperationsDialog;













