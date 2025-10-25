import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Autocomplete,
  TimePicker,
  DatePicker,
  LocalizationProvider,
  AdapterDateFns
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  MonetizationOn as MonetizationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  Language as LanguageIcon,
  Public as PublicIcon,
  Computer as ComputerIcon,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  DesktopWindows as DesktopIcon,
  Headset as HeadsetIcon,
  Mic as MicIcon,
  Videocam as VideoIcon,
  PhotoCamera as CameraIcon,
  AttachFile as AttachIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  QrCodeScanner as QrScannerIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableChartIcon,
  ScatterPlot as ScatterPlotIcon,
  BubbleChart as BubbleChartIcon,
  DonutLarge as DonutChartIcon,
  MultilineChart as MultiLineChartIcon,
  StackedLineChart as StackedChartIcon,
  CandlestickChart as CandleChartIcon,
  WaterfallChart as WaterfallChartIcon,
  Sankey as SankeyChartIcon,
  TreeMap as TreeMapIcon,
  HeatMap as HeatMapIcon,
  Radar as RadarChartIcon,
  PolarChart as PolarChartIcon,
  Gauge as GaugeChartIcon,
  Speedometer as SpeedometerIcon,
  DashboardCustomize as CustomDashboardIcon,
  ViewModule as ModuleIcon,
  ViewList as ListViewIcon,
  ViewGrid as GridViewIcon,
  ViewComfy as ComfyViewIcon,
  ViewStream as StreamViewIcon,
  ViewSidebar as SidebarViewIcon,
  ViewColumn as ColumnViewIcon,
  ViewCarousel as CarouselViewIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewMonth as MonthViewIcon,
  ViewAgenda as AgendaViewIcon,
  ViewQuilt as QuiltViewIcon,
  ViewArray as ArrayViewIcon,
  ViewHeadline as HeadlineViewIcon,
  ViewInAr as ArViewIcon,
  ViewKanban as KanbanViewIcon,
  ViewTimeline as TimelineViewIcon,
  ViewComfyAlt as ComfyAltViewIcon,
  ViewCompact as CompactViewIcon,
  ViewCompactAlt as CompactAltViewIcon,
  ViewCozy as CozyViewIcon,
  ViewSidebarOutlined as SidebarOutlinedIcon,
  ViewSidebarRounded as SidebarRoundedIcon,
  ViewSidebarSharp as SidebarSharpIcon,
  ViewSidebarTwoTone as SidebarTwoToneIcon,
  ViewSidebarOutlined as SidebarOutlinedIcon2,
  ViewSidebarRounded as SidebarRoundedIcon2,
  ViewSidebarSharp as SidebarSharpIcon2,
  ViewSidebarTwoTone as SidebarTwoToneIcon2
} from '@mui/icons-material';

interface SmartSchedulingDialogProps {
  open: boolean;
  onClose: () => void;
  lead?: any;
  onSchedule: (scheduleData: any) => void;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: Date;
  type: 'online' | 'in_person' | 'phone';
  location?: string;
  meetingLink?: string;
  attendees: string[];
  duration: number; // minutes
  availability: 'available' | 'tentative' | 'unavailable';
  aiScore: number; // 0-100
  reason?: string;
}

interface AISuggestion {
  id: string;
  timeSlot: TimeSlot;
  confidence: number;
  reasoning: string;
  benefits: string[];
  risks: string[];
  alternativeSlots: TimeSlot[];
}

const SmartSchedulingDialog: React.FC<SmartSchedulingDialogProps> = ({
  open,
  onClose,
  lead,
  onSchedule
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [demoType, setDemoType] = useState<'online' | 'in_person' | 'phone'>('online');
  const [duration, setDuration] = useState(60);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>({});

  const steps = [
    'Demo Preferences',
    'AI Time Suggestions',
    'Schedule Confirmation',
    'Send Invitations'
  ];

  useEffect(() => {
    if (open && lead) {
      setScheduleData({
        leadId: lead.id,
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        company: lead.company
      });
      setCurrentStep(0);
      setAiSuggestions([]);
    }
  }, [open, lead]);

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI suggestions based on lead data and preferences
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        timeSlot: {
          id: 'slot1',
          startTime: '10:00',
          endTime: '11:00',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          type: demoType,
          duration: duration,
          attendees: [lead?.name || 'Lead'],
          availability: 'available',
          aiScore: 95,
          reason: 'Optimal time based on lead engagement patterns'
        },
        confidence: 0.95,
        reasoning: 'Based on lead engagement data, this time slot has the highest conversion probability. Lead typically responds to emails between 9-11 AM.',
        benefits: [
          'High engagement probability',
          'Lead is typically available',
          'Optimal for decision-making',
          'Allows for follow-up same day'
        ],
        risks: [
          'May conflict with other meetings',
          'Requires preparation time'
        ],
        alternativeSlots: []
      },
      {
        id: '2',
        timeSlot: {
          id: 'slot2',
          startTime: '14:00',
          endTime: '15:00',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          type: demoType,
          duration: duration,
          attendees: [lead?.name || 'Lead'],
          availability: 'available',
          aiScore: 87,
          reason: 'Good alternative with high availability'
        },
        confidence: 0.87,
        reasoning: 'Second-best option with good availability and moderate engagement probability.',
        benefits: [
          'Good availability',
          'Allows for preparation',
          'Less rushed timing'
        ],
        risks: [
          'Lower engagement probability',
          'May require more follow-up'
        ],
        alternativeSlots: []
      }
    ];
    
    setAiSuggestions(mockSuggestions);
    setIsGeneratingSuggestions(false);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Generate AI suggestions after preferences are set
      generateAISuggestions();
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSchedule = () => {
    const finalScheduleData = {
      ...scheduleData,
      selectedTimeSlot,
      demoType,
      duration,
      aiSuggestions,
      scheduledAt: new Date()
    };
    onSchedule(finalScheduleData);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const renderDemoPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon color="primary" />
        Demo Preferences
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Demo Type
              </Typography>
              <RadioGroup
                value={demoType}
                onChange={(e) => setDemoType(e.target.value as any)}
              >
                <FormControlLabel 
                  value="online" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoCallIcon />
                      <Box>
                        <Typography>Online Demo</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Video call with screen sharing
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="in_person" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon />
                      <Box>
                        <Typography>In-Person Demo</Typography>
                        <Typography variant="caption" color="text.secondary">
                          On-site demonstration
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="phone" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon />
                      <Box>
                        <Typography>Phone Call</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Audio-only discussion
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Duration
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as number)}
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Recommended: 60 minutes for comprehensive demo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Additional Preferences
              </Typography>
              <FormGroup>
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Send calendar invitation" 
                />
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Send reminder 24 hours before" 
                />
                <FormControlLabel 
                  control={<Switch />} 
                  label="Record demo session (for online demos)" 
                />
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Send follow-up materials after demo" 
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAISuggestions = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Time Suggestions
      </Typography>
      
      {isGeneratingSuggestions ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing optimal times...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is considering lead behavior, availability, and engagement patterns
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {aiSuggestions.map((suggestion, index) => (
            <Card 
              key={suggestion.id} 
              sx={{ 
                border: selectedTimeSlot?.id === suggestion.timeSlot.id ? 2 : 1,
                borderColor: selectedTimeSlot?.id === suggestion.timeSlot.id ? 'primary.main' : 'divider',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 }
              }}
              onClick={() => setSelectedTimeSlot(suggestion.timeSlot)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {suggestion.timeSlot.date.toLocaleDateString()} at {suggestion.timeSlot.startTime}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.timeSlot.duration} minutes • {suggestion.timeSlot.type}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip 
                      label={`${suggestion.timeSlot.aiScore}%`} 
                      color={getScoreColor(suggestion.timeSlot.aiScore) as any}
                      size="small"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      AI Score
                    </Typography>
                  </Box>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>AI Reasoning:</strong> {suggestion.reasoning}
                  </Typography>
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                      Benefits:
                    </Typography>
                    <List dense>
                      {suggestion.benefits.map((benefit, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      Considerations:
                    </Typography>
                    <List dense>
                      {suggestion.risks.map((risk, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={risk} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );

  const renderScheduleConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="primary" />
        Schedule Confirmation
      </Typography>
      
      {selectedTimeSlot && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Demo Session Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {selectedTimeSlot.date.toLocaleDateString()} at {selectedTimeSlot.startTime}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {selectedTimeSlot.duration} minutes
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {selectedTimeSlot.type.replace('_', ' ')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  AI Score
                </Typography>
                <Chip 
                  label={`${selectedTimeSlot.aiScore}%`} 
                  color={getScoreColor(selectedTimeSlot.aiScore) as any}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lead Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {lead?.name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {lead?.email || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Company
              </Typography>
              <Typography variant="body1">
                {lead?.company || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {lead?.phone || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSendInvitations = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SendIcon color="primary" />
        Send Invitations
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Ready to send calendar invitations and confirmations!
        </Typography>
      </Alert>
      
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            What will be sent:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CalendarIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Calendar Invitation"
                secondary="ICS file with meeting details"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email Confirmation"
                secondary="Detailed meeting information and preparation materials"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Reminder Notifications"
                secondary="24 hours and 1 hour before the meeting"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            Smart Demo Scheduling
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Stepper activeStep={currentStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      
      <DialogContent>
        {currentStep === 0 && renderDemoPreferences()}
        {currentStep === 1 && renderAISuggestions()}
        {currentStep === 2 && renderScheduleConfirmation()}
        {currentStep === 3 && renderSendInvitations()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {currentStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSchedule} startIcon={<SendIcon />}>
            Schedule & Send Invitations
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartSchedulingDialog;
