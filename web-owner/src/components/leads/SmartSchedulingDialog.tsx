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
  Email as EmailIcon,
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
  Radar as RadarChartIcon,
  DashboardCustomize as CustomDashboardIcon,
  ViewModule as ModuleIcon,
  ViewList as ListViewIcon,
  GridView as GridViewIcon,
  ViewComfy as ComfyViewIcon,
  ViewStream as StreamViewIcon,
  ViewSidebar as SidebarViewIcon,
  ViewColumn as ColumnViewIcon,
  ViewCarousel as CarouselViewIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  CalendarMonth as MonthViewIcon,
  ViewAgenda as AgendaViewIcon,
  ViewQuilt as QuiltViewIcon,
  ViewArray as ArrayViewIcon,
  ViewHeadline as HeadlineViewIcon,
  ViewInAr as ArViewIcon,
  ViewKanban as KanbanViewIcon,
  ViewTimeline as TimelineViewIcon,
  ViewComfyAlt as ComfyAltViewIcon,
  ViewCompact as CompactViewIcon,
  ViewSidebarOutlined as SidebarOutlinedIcon,
  ViewSidebarRounded as SidebarRoundedIcon,
  ViewSidebarSharp as SidebarSharpIcon,
  ViewSidebarTwoTone as SidebarTwoToneIcon
} from '@mui/icons-material';

// Interfaces
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  grade: string;
  school: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  source: string;
  status: string;
  score: number;
  priority: string;
  tags: string[];
  notes: string;
  createdAt: Date;
  lastContact: Date;
  nextAction: string;
  assignedTo: string;
  subjects: string[];
  learningGoals: string[];
  preferredSubjects: string[];
  studySchedule: string;
  parentInvolvement: 'high' | 'medium' | 'low';
  budget?: number;
  timeline?: string;
  interests: string[];
  communicationHistory: any[];
  demoHistory: any[];
  conversionProbability: number;
  aiInsights: any[];
}

interface SmartSchedulingDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSchedule: (scheduleData: any) => void;
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: string;
  availability: string;
  aiScore: number;
  reason: string;
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
  const [demoType, setDemoType] = useState<'individual_demo' | 'group_demo' | 'online' | 'in_person'>('individual_demo');
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        timeSlot: {
          id: 'slot1',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          duration: duration,
          type: demoType,
          availability: 'available',
          aiScore: 95,
          reason: 'Optimal time based on lead engagement patterns'
        },
        confidence: 0.92,
        reasoning: 'Student shows high engagement during morning hours based on previous interactions',
        benefits: [
          'High student engagement expected',
          'Parent availability confirmed',
          'No conflicting school activities'
        ],
        risks: [
          'Early morning might be rushed',
          'Limited time for follow-up questions'
        ],
        alternativeSlots: []
      },
      {
        id: '2',
        timeSlot: {
          id: 'slot2',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          startTime: '3:00 PM',
          endTime: '4:00 PM',
          duration: duration,
          type: demoType,
          availability: 'available',
          aiScore: 87,
          reason: 'Good alternative with high availability'
        },
        confidence: 0.78,
        reasoning: 'After-school time aligns with student schedule and parent availability',
        benefits: [
          'After-school timing is ideal',
          'Parent can attend easily',
          'Student is fresh and focused'
        ],
        risks: [
          'May conflict with homework time',
          'Student might be tired'
        ],
        alternativeSlots: []
      }
    ];
    
    setAiSuggestions(mockSuggestions);
    setIsGeneratingSuggestions(false);
  };

  const renderDemoPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon color="primary" />
        Demo Preferences
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
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
                  value="individual_demo" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon />
                      <Box>
                        <Typography>Individual Demo Class</Typography>
                        <Typography variant="caption" color="text.secondary">
                          One-on-one personalized demo session
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="group_demo" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon />
                      <Box>
                        <Typography>Group Demo Class</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Small group demo with other students
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="online" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoCallIcon />
                      <Box>
                        <Typography>Online Demo Class</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Virtual demo session via video call
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
                        <Typography>Library Demo Class</Typography>
                        <Typography variant="caption" color="text.secondary">
                          In-person demo at library location
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
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
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Demo Subjects
              </Typography>
              <Autocomplete
                multiple
                options={['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics']}
                value={scheduleData.subjects || []}
                onChange={(event, newValue) => {
                  setScheduleData((prev: any) => ({ ...prev, subjects: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select subjects for demo"
                    variant="outlined"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Select the subjects you'd like to demonstrate
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '100%' }}>
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
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Include parent in demo session" 
                />
                <FormControlLabel 
                  control={<Switch defaultChecked />} 
                  label="Send parent summary after demo" 
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  const renderAISuggestions = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI-Powered Time Suggestions
      </Typography>
      
      {isGeneratingSuggestions ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing optimal scheduling...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI is considering student schedule, parent availability, and engagement patterns
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
                  <Typography variant="h6">
                    {suggestion.timeSlot.date.toLocaleDateString()} at {suggestion.timeSlot.startTime}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${suggestion.timeSlot.aiScore}%`} 
                      color={getScoreColor(suggestion.timeSlot.aiScore) as any}
                      size="small"
                    />
                    <Typography variant="caption" display="block" color="text.secondary">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {suggestion.reasoning}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
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
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
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
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      {selectedTimeSlot && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Time Slot
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <Typography variant="body2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {selectedTimeSlot.date.toLocaleDateString()} at {selectedTimeSlot.startTime}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1">
                  {selectedTimeSlot.duration} minutes
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {selectedTimeSlot.type.replace('_', ' ')}
                </Typography>
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                <Typography variant="body2" color="text.secondary">
                  AI Score
                </Typography>
                <Chip 
                  label={`${selectedTimeSlot.aiScore}%`} 
                  color={getScoreColor(selectedTimeSlot.aiScore) as any}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schedule Confirmation
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Lead Information
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {lead?.name || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {lead?.email || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Typography variant="body2" color="text.secondary">
                School
              </Typography>
              <Typography variant="body1">
                {lead?.school || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
              <Typography variant="body2" color="text.secondary">
                Parent Phone
              </Typography>
              <Typography variant="body1">
                {lead?.parentPhone || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderStepContent = () => {
    console.log('Rendering step content for step:', currentStep);
    switch (currentStep) {
      case 0:
        return renderDemoPreferences();
      case 1:
        return renderAISuggestions();
      case 2:
        return renderConfirmation();
      default:
        return <Typography>Step {currentStep} not implemented</Typography>;
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      generateAISuggestions();
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSchedule = () => {
    const finalScheduleData = {
      leadId: lead?.id,
      selectedTimeSlot,
      demoType,
      duration,
      subjects: scheduleData.subjects || []
    };
    onSchedule(finalScheduleData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Smart Demo Scheduling
          </Typography>
          <IconButton onClick={onClose} size="small">
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
      
      <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Box sx={{ py: 2 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {currentStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedTimeSlot}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSchedule}
            disabled={!selectedTimeSlot}
          >
            Schedule Demo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartSchedulingDialog;