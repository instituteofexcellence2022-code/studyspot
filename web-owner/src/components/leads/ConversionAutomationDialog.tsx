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
  Slider,
  Rating,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  RecordVoiceOver as VoiceIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Public as PublicIcon,
  Business as BusinessIcon2,
  Home as HomeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocalLibrary as LibraryIcon,
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
  ContentCopy as CopyIcon2,
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
  ViewCompactAlt as CompactAltViewIcon,
  ViewCozy as CozyViewIcon,
  ViewSidebarOutlined as SidebarOutlinedIcon,
  ViewSidebarRounded as SidebarRoundedIcon,
  ViewSidebarSharp as SidebarSharpIcon,
  ViewSidebarTwoTone as SidebarTwoToneIcon,
  ViewSidebarOutlined as SidebarOutlinedIcon2,
  ViewSidebarRounded as SidebarRoundedIcon2,
  ViewSidebarSharp as SidebarSharpIcon2,
  ViewSidebarTwoTone as SidebarTwoToneIcon2,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Chat as ChatIcon2,
  SmartToy as AIIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon2,
  Pause as PauseIcon2,
  Stop as StopIcon2,
  RecordVoiceOver as VoiceIcon2,
  Translate as TranslateIcon2,
  Language as LanguageIcon2,
  Public as PublicIcon2,
  Business as BusinessIcon3,
  Home as HomeIcon2,
  Work as WorkIcon2,
  School as EducationIcon,
  LocalLibrary as LibraryIcon2,
  Computer as ComputerIcon2,
  PhoneAndroid as MobileIcon2,
  Tablet as TabletIcon2,
  Laptop as LaptopIcon2,
  DesktopWindows as DesktopIcon2,
  Headset as HeadsetIcon2,
  Mic as MicIcon2,
  Videocam as VideoIcon2,
  PhotoCamera as CameraIcon2,
  AttachFile as AttachIcon2,
  Link as LinkIcon2,
  ContentCopy as CopyIcon3,
  QrCode as QrCodeIcon2,
  QrCodeScanner as QrScannerIcon2,
  BarChart as BarChartIcon2,
  PieChart as PieChartIcon2,
  ShowChart as LineChartIcon2,
  TableChart as TableChartIcon2,
  ScatterPlot as ScatterPlotIcon2,
  BubbleChart as BubbleChartIcon2,
  DonutLarge as DonutChartIcon2,
  MultilineChart as MultiLineChartIcon2,
  StackedLineChart as StackedChartIcon2,
  CandlestickChart as CandleChartIcon2,
  WaterfallChart as WaterfallChartIcon2,
  Radar as RadarChartIcon2,
  DashboardCustomize as CustomDashboardIcon2,
  ViewModule as ModuleIcon2,
  ViewList as ListViewIcon2,
  GridView as GridViewIcon2,
  ViewComfy as ComfyViewIcon2,
  ViewStream as StreamViewIcon2,
  ViewSidebar as SidebarViewIcon2,
  ViewColumn as ColumnViewIcon2,
  ViewCarousel as CarouselViewIcon2,
  ViewDay as DayViewIcon2,
  ViewWeek as WeekViewIcon2,
  CalendarMonth as MonthViewIcon2,
  ViewAgenda as AgendaViewIcon2,
  ViewQuilt as QuiltViewIcon2,
  ViewArray as ArrayViewIcon2,
  ViewHeadline as HeadlineViewIcon2,
  ViewInAr as ArViewIcon2,
  ViewKanban as KanbanViewIcon2,
  ViewTimeline as TimelineViewIcon2,
  ViewComfyAlt as ComfyAltViewIcon2,
  ViewCompact as CompactViewIcon2,
  ViewCompactAlt as CompactAltViewIcon2,
  ViewCozy as CozyViewIcon2,
  ViewSidebarOutlined as SidebarOutlinedIcon3,
  ViewSidebarRounded as SidebarRoundedIcon3,
  ViewSidebarSharp as SidebarSharpIcon3,
  ViewSidebarTwoTone as SidebarTwoToneIcon3,
  ViewSidebarOutlined as SidebarOutlinedIcon4,
  ViewSidebarRounded as SidebarRoundedIcon4,
  ViewSidebarSharp as SidebarSharpIcon4,
  ViewSidebarTwoTone as SidebarTwoToneIcon4
} from '@mui/icons-material';

interface ConversionAutomationDialogProps {
  open: boolean;
  onClose: () => void;
  lead?: any;
  onActivate: (automationData: any) => void;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: 'demo_completed' | 'no_response' | 'qualified' | 'high_score' | 'custom';
  conditions: string[];
  actions: AutomationAction[];
  timeline: AutomationStep[];
  status: 'active' | 'paused' | 'draft';
  performance: {
    leadsProcessed: number;
    conversions: number;
    conversionRate: number;
    avgTimeToConvert: number;
  };
}

interface AutomationAction {
  id: string;
  type: 'email' | 'sms' | 'call' | 'task' | 'offer' | 'nurture';
  delay: number; // hours
  content: string;
  personalized: boolean;
  aiOptimized: boolean;
}

interface AutomationStep {
  id: string;
  action: string;
  delay: string;
  status: 'pending' | 'completed' | 'skipped' | 'failed';
  timestamp?: Date;
  result?: string;
}

interface PersonalizedOffer {
  id: string;
  type: 'discount' | 'bonus' | 'trial' | 'consultation' | 'custom';
  title: string;
  description: string;
  value: string;
  conditions: string[];
  expiration: Date;
  aiGenerated: boolean;
  conversionProbability: number;
}

const ConversionAutomationDialog: React.FC<ConversionAutomationDialogProps> = ({
  open,
  onClose,
  lead,
  onActivate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [personalizedOffers, setPersonalizedOffers] = useState<PersonalizedOffer[]>([]);
  const [isGeneratingOffers, setIsGeneratingOffers] = useState(false);
  const [automationSettings, setAutomationSettings] = useState({
    maxFollowUps: 5,
    followUpInterval: 24, // hours
    escalationDelay: 72, // hours
    aiOptimization: true,
    personalizationLevel: 3
  });

  const steps = [
    'Select Automation Workflow',
    'AI-Generated Offers',
    'Timeline & Settings',
    'Activate Automation'
  ];

  // Predefined Automation Workflows
  const automationWorkflows: AutomationWorkflow[] = [
    {
      id: '1',
      name: 'Demo Follow-up Sequence',
      trigger: 'demo_completed',
      conditions: ['Demo completed', 'No immediate conversion'],
      actions: [
        {
          id: '1',
          type: 'email',
          delay: 2,
          content: 'Thank you for attending the demo. Here are the key points we discussed...',
          personalized: true,
          aiOptimized: true
        },
        {
          id: '2',
          type: 'task',
          delay: 24,
          content: 'Schedule follow-up call to address questions',
          personalized: false,
          aiOptimized: false
        },
        {
          id: '3',
          type: 'email',
          delay: 72,
          content: 'Exclusive offer based on your demo feedback...',
          personalized: true,
          aiOptimized: true
        }
      ],
      timeline: [],
      status: 'active',
      performance: {
        leadsProcessed: 45,
        conversions: 12,
        conversionRate: 0.27,
        avgTimeToConvert: 5.2
      }
    },
    {
      id: '2',
      name: 'High-Value Lead Nurture',
      trigger: 'high_score',
      conditions: ['Lead score > 80', 'Enterprise company', 'Decision maker identified'],
      actions: [
        {
          id: '1',
          type: 'email',
          delay: 1,
          content: 'Priority access to our enterprise features...',
          personalized: true,
          aiOptimized: true
        },
        {
          id: '2',
          type: 'call',
          delay: 4,
          content: 'Executive-level consultation call',
          personalized: true,
          aiOptimized: false
        },
        {
          id: '3',
          type: 'offer',
          delay: 24,
          content: 'Custom enterprise proposal with ROI analysis',
          personalized: true,
          aiOptimized: true
        }
      ],
      timeline: [],
      status: 'active',
      performance: {
        leadsProcessed: 23,
        conversions: 8,
        conversionRate: 0.35,
        avgTimeToConvert: 3.8
      }
    },
    {
      id: '3',
      name: 'Re-engagement Campaign',
      trigger: 'no_response',
      conditions: ['No response for 7 days', 'Previously engaged'],
      actions: [
        {
          id: '1',
          type: 'email',
          delay: 0,
          content: 'We noticed you haven\'t responded. Here\'s a quick recap...',
          personalized: true,
          aiOptimized: true
        },
        {
          id: '2',
          type: 'sms',
          delay: 48,
          content: 'Quick question about your learning goals',
          personalized: true,
          aiOptimized: true
        },
        {
          id: '3',
          type: 'email',
          delay: 120,
          content: 'Final attempt with special offer...',
          personalized: true,
          aiOptimized: true
        }
      ],
      timeline: [],
      status: 'active',
      performance: {
        leadsProcessed: 67,
        conversions: 9,
        conversionRate: 0.13,
        avgTimeToConvert: 8.5
      }
    }
  ];

  useEffect(() => {
    if (open && lead) {
      setCurrentStep(0);
      setSelectedWorkflow(null);
      setPersonalizedOffers([]);
      generatePersonalizedOffers();
    }
  }, [open, lead]);

  const generatePersonalizedOffers = async () => {
    setIsGeneratingOffers(true);
    
    // Simulate AI offer generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockOffers: PersonalizedOffer[] = [
      {
        id: '1',
        type: 'discount',
        title: 'Early Adopter Discount',
        description: '20% off first year subscription for early adopters',
        value: '20% OFF',
        conditions: ['Sign up within 7 days', 'Annual subscription'],
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        conversionProbability: 0.75
      },
      {
        id: '2',
        type: 'trial',
        title: 'Extended Free Trial',
        description: '60-day free trial with full feature access',
        value: '60 Days Free',
        conditions: ['No credit card required', 'Full feature access'],
        expiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        conversionProbability: 0.68
      },
      {
        id: '3',
        type: 'consultation',
        title: 'Free Implementation Consultation',
        description: '2-hour free consultation with our implementation team',
        value: '₹5,000 Value',
        conditions: ['Scheduled within 2 weeks', 'Implementation planning'],
        expiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        aiGenerated: true,
        conversionProbability: 0.82
      }
    ];
    
    setPersonalizedOffers(mockOffers);
    setIsGeneratingOffers(false);
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedWorkflow) {
      generatePersonalizedOffers();
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleActivate = () => {
    const automationData = {
      leadId: lead?.id,
      workflow: selectedWorkflow,
      offers: personalizedOffers,
      settings: automationSettings,
      activatedAt: new Date()
    };
    onActivate(automationData);
    onClose();
  };

  const getConversionProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'success';
    if (probability >= 0.6) return 'warning';
    return 'error';
  };

  const renderWorkflowSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        Select Automation Workflow
      </Typography>
      
      <Stack spacing={2}>
        {automationWorkflows.map((workflow) => (
          <Card 
            key={workflow.id}
            sx={{ 
              cursor: 'pointer',
              border: selectedWorkflow?.id === workflow.id ? 2 : 1,
              borderColor: selectedWorkflow?.id === workflow.id ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => setSelectedWorkflow(workflow)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{workflow.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={workflow.status} 
                    color={workflow.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip 
                    label={`${Math.round(workflow.performance.conversionRate * 100)}%`} 
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Trigger:</strong> {workflow.trigger.replace('_', ' ')}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Conditions:</strong> {workflow.conditions.join(', ')}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Performance Metrics:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary">
                        {workflow.performance.leadsProcessed}
                      </Typography>
                      <Typography variant="caption">Leads Processed</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="success.main">
                        {workflow.performance.conversions}
                      </Typography>
                      <Typography variant="caption">Conversions</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                <strong>Actions:</strong> {workflow.actions.length} automated steps
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderPersonalizedOffers = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MonetizationIcon color="primary" />
        AI-Generated Personalized Offers
      </Typography>
      
      {isGeneratingOffers ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Generating personalized offers...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is analyzing lead data to create compelling offers
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {personalizedOffers.map((offer) => (
            <Card key={offer.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{offer.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={offer.type} 
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={`${Math.round(offer.conversionProbability * 100)}%`} 
                      color={getConversionProbabilityColor(offer.conversionProbability) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {offer.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h5" color="success.main">
                    {offer.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expires: {offer.expiration.toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Conditions:
                  </Typography>
                  <List dense>
                    {offer.conditions.map((condition, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={condition} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>AI Insight:</strong> This offer has a {Math.round(offer.conversionProbability * 100)}% probability of conversion based on lead behavior analysis.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );

  const renderTimelineSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon color="primary" />
        Automation Timeline & Settings
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Automation Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Maximum Follow-ups: {automationSettings.maxFollowUps}
                </Typography>
                <Slider
                  value={automationSettings.maxFollowUps}
                  onChange={(e, value) => setAutomationSettings(prev => ({ ...prev, maxFollowUps: value as number }))}
                  min={1}
                  max={10}
                  step={1}
                  marks
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Follow-up Interval: {automationSettings.followUpInterval} hours
                </Typography>
                <Slider
                  value={automationSettings.followUpInterval}
                  onChange={(e, value) => setAutomationSettings(prev => ({ ...prev, followUpInterval: value as number }))}
                  min={1}
                  max={168}
                  step={1}
                  marks={[
                    { value: 1, label: '1h' },
                    { value: 24, label: '1d' },
                    { value: 72, label: '3d' },
                    { value: 168, label: '1w' }
                  ]}
                />
              </Box>
              
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={automationSettings.aiOptimization}
                      onChange={(e) => setAutomationSettings(prev => ({ ...prev, aiOptimization: e.target.checked }))}
                    />
                  } 
                  label="AI Optimization" 
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Automation Timeline
              </Typography>
              
              <Stack spacing={2}>
                {selectedWorkflow?.actions.map((action, index) => (
                  <Box key={action.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {action.type.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        After {action.delay} hours
                      </Typography>
                      <Typography variant="body2">
                        {action.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  const renderActivation = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="primary" />
        Activate Conversion Automation
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1">
          Ready to activate automated conversion sequence!
        </Typography>
      </Alert>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Automation Summary
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Workflow" 
                    secondary={selectedWorkflow?.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Actions" 
                    secondary={`${selectedWorkflow?.actions.length} automated steps`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Offers" 
                    secondary={`${personalizedOffers.length} personalized offers`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Max Follow-ups" 
                    secondary={automationSettings.maxFollowUps}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Follow-up Interval" 
                    secondary={`${automationSettings.followUpInterval} hours`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Expected Results
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="primary">
                  {Math.round((selectedWorkflow?.performance.conversionRate || 0) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected Conversion Rate
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="success.main">
                  {selectedWorkflow?.performance.avgTimeToConvert || 0} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Time to Convert
                </Typography>
              </Box>
              
              <Alert severity="info">
                <Typography variant="body2">
                  Based on historical data from similar leads and workflows.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            Conversion Automation
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
        {currentStep === 0 && renderWorkflowSelection()}
        {currentStep === 1 && renderPersonalizedOffers()}
        {currentStep === 2 && renderTimelineSettings()}
        {currentStep === 3 && renderActivation()}
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
          <Button variant="contained" onClick={handleNext} disabled={!selectedWorkflow}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleActivate} startIcon={<PlayIcon />}>
            Activate Automation
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConversionAutomationDialog;
