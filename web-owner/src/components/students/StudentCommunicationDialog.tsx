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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  Slider,
  InputAdornment,
  Tooltip,
  Paper,
  Stack,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Message as MessageIcon,
  Campaign as CampaignIcon,
  NotificationsActive as NotificationsActiveIcon,
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

interface StudentCommunicationDialogProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: string[];
  students: Student[];
  onSend: (type: string, data: any) => void;
}

const StudentCommunicationDialog: React.FC<StudentCommunicationDialogProps> = ({
  open,
  onClose,
  selectedStudents,
  students,
  onSend,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  
  // Message state
  const [messageType, setMessageType] = useState('notification');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
  });
  
  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState('normal');
  const [targetGroups, setTargetGroups] = useState<string[]>([]);
  
  // Notification state
  const [notificationType, setNotificationType] = useState('info');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const getSelectedStudentDetails = () => {
    return students.filter(s => selectedStudents.includes(s.id));
  };

  const allGroups = Array.from(new Set(students.flatMap(s => s.groups || [])));

  const handleNext = () => {
    if (activeStep === 0) {
      if (activeTab === 0 && (!subject || !message)) {
        alert('Please fill in all required fields.');
        return;
      }
      if (activeTab === 1 && (!announcementTitle || !announcementContent)) {
        alert('Please fill in all required fields.');
        return;
      }
      if (activeTab === 2 && (!notificationTitle || !notificationMessage)) {
        alert('Please fill in all required fields.');
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
    setAnnouncementTitle('');
    setAnnouncementContent('');
    setNotificationTitle('');
    setNotificationMessage('');
    setProcessing(false);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    
    let data = {};
    if (activeTab === 0) {
      data = {
        type: messageType,
        subject,
        message,
        channels,
        studentIds: selectedStudents,
      };
    } else if (activeTab === 1) {
      data = {
        type: 'announcement',
        title: announcementTitle,
        content: announcementContent,
        priority: announcementPriority,
        targetGroups,
        studentIds: selectedStudents,
      };
    } else if (activeTab === 2) {
      data = {
        type: 'notification',
        notificationType,
        title: notificationTitle,
        message: notificationMessage,
        scheduled: scheduledTime,
        scheduleDate: scheduledTime ? scheduleDate : null,
        studentIds: selectedStudents,
      };
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSend(activeTab === 0 ? 'message' : activeTab === 1 ? 'announcement' : 'notification', data);
    setProcessing(false);
    setSuccess(true);
  };

  const renderStepContent = (step: number) => {
    if (step === 0) {
      return (
        <Box sx={{ minHeight: 400 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Communication Type
          </Typography>
          
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab icon={<MessageIcon />} label="Send Message" />
            <Tab icon={<CampaignIcon />} label="Announcement" />
            <Tab icon={<NotificationsActiveIcon />} label="Notification" />
          </Tabs>

          {/* Message Tab */}
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
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MessageIcon fontSize="small" />WhatsApp</Box>}
                />
              </FormGroup>
            </Box>
          )}

          {/* Announcement Tab */}
          {activeTab === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Announcement Title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Announcement Content"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                margin="normal"
                required
                placeholder="Enter announcement details..."
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={announcementPriority}
                  label="Priority"
                  onChange={(e) => setAnnouncementPriority(e.target.value)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Target Groups (Optional)
              </Typography>
              <FormGroup>
                {allGroups.map(group => (
                  <FormControlLabel
                    key={group}
                    control={
                      <Checkbox
                        checked={targetGroups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetGroups([...targetGroups, group]);
                          } else {
                            setTargetGroups(targetGroups.filter(g => g !== group));
                          }
                        }}
                      />
                    }
                    label={group}
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          {/* Notification Tab */}
          {activeTab === 2 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Notification Type</InputLabel>
                <Select
                  value={notificationType}
                  label="Notification Type"
                  onChange={(e) => setNotificationType(e.target.value)}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Notification Title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Notification Message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                margin="normal"
                required
              />
              
              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={<Checkbox checked={scheduledTime} onChange={(e) => setScheduledTime(e.target.checked)} />}
                label="Schedule for later"
              />
              
              {scheduledTime && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Schedule Date & Time"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
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
            You are about to send a{' '}
            {activeTab === 0 ? 'message' : activeTab === 1 ? 'announcement' : 'notification'} to{' '}
            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}.
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="Type" secondary={activeTab === 0 ? 'Message' : activeTab === 1 ? 'Announcement' : 'Notification'} />
            </ListItem>
            {activeTab === 0 && (
              <>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Subject" secondary={subject} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MessageIcon /></ListItemIcon>
                  <ListItemText primary="Channels" secondary={Object.entries(channels).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')} />
                </ListItem>
              </>
            )}
            {activeTab === 1 && (
              <>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Title" secondary={announcementTitle} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon /></ListItemIcon>
                  <ListItemText primary="Priority" secondary={announcementPriority.toUpperCase()} />
                </ListItem>
              </>
            )}
            {activeTab === 2 && (
              <>
                <ListItem>
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Title" secondary={notificationTitle} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon /></ListItemIcon>
                  <ListItemText primary="Type" secondary={notificationType.toUpperCase()} />
                </ListItem>
                {scheduledTime && (
                  <ListItem>
                    <ListItemIcon><ScheduleIcon /></ListItemIcon>
                    <ListItemText primary="Scheduled" secondary={scheduleDate} />
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
              <Typography variant="h6">Sending...</Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while the communication is being sent.
              </Typography>
            </>
          ) : success ? (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h6">Communication Sent!</Typography>
              <Typography variant="body1" color="text.secondary">
                The {activeTab === 0 ? 'message' : activeTab === 1 ? 'announcement' : 'notification'} was successfully sent to {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''}.
              </Typography>
            </>
          ) : (
            <>
              <WarningIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h6">Failed to Send</Typography>
              <Typography variant="body1" color="text.secondary">
                An error occurred while sending the communication. Please try again.
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
            Student Communication
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          <Step><StepLabel>Compose</StepLabel></Step>
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
              (activeStep === 0 && activeTab === 1 && (!announcementTitle || !announcementContent)) ||
              (activeStep === 0 && activeTab === 2 && (!notificationTitle || !notificationMessage))
            }
          >
            {activeStep === 1 ? 'Send' : 'Next'}
          </Button>
        )}
        {success && (
          <Button onClick={() => { handleReset(); onClose(); }} variant="contained" startIcon={<CheckCircleIcon />}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentCommunicationDialog;












