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
  Rating
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Chat as ChatIcon,
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
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon2,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon2,
  Chat as ChatIcon2,
  VideoCall as VideoCallIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  CloudUpload as CloudIcon,
  Sync as SyncIcon,
  Warning as WarningIcon2,
  Info as InfoIcon2,
  Check as CheckIcon,
  Close as CloseIcon2,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  RecordVoiceOver as VoiceIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon2,
  Public as PublicIcon2,
  Business as BusinessIcon2,
  Home as HomeIcon2,
  Work as WorkIcon2,
  School as EducationIcon,
  LocalLibrary as LibraryIcon,
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

interface AICommunicationDialogProps {
  open: boolean;
  onClose: () => void;
  lead?: any;
  onSend: (messageData: any) => void;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'linkedin';
  subject?: string;
  content: string;
  category: 'welcome' | 'follow_up' | 'demo_invite' | 'nurture' | 'closing';
  personalization: string[];
  aiOptimized: boolean;
  performance: {
    openRate: number;
    clickRate: number;
    responseRate: number;
    conversionRate: number;
  };
}

interface AISuggestion {
  id: string;
  type: 'timing' | 'content' | 'channel' | 'personalization';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

const AICommunicationDialog: React.FC<AICommunicationDialogProps> = ({
  open,
  onClose,
  lead,
  onSend
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp' | 'linkedin'>('email');
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [personalizationLevel, setPersonalizationLevel] = useState(3);
  const [sendTime, setSendTime] = useState<'immediate' | 'optimal' | 'custom'>('optimal');

  const steps = [
    'Select Channel & Template',
    'AI Content Optimization',
    'Personalization',
    'Send & Schedule'
  ];

  // Message Templates
  const messageTemplates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Welcome & Introduction',
      type: 'email',
      subject: 'Welcome to StudySpot - Let\'s Transform Your Learning Experience',
      content: `Hi {{name}},

Thank you for your interest in StudySpot! I'm excited to learn more about {{company}} and how we can help you achieve your learning goals.

Our AI-powered platform has helped over 10,000 students and organizations improve their learning outcomes by 40%. I'd love to show you how we can do the same for your team.

Would you be available for a brief 15-minute call this week to discuss your specific needs?

Best regards,
{{sender_name}}`,
      category: 'welcome',
      personalization: ['name', 'company', 'sender_name'],
      aiOptimized: true,
      performance: {
        openRate: 0.35,
        clickRate: 0.12,
        responseRate: 0.08,
        conversionRate: 0.05
      }
    },
    {
      id: '2',
      name: 'Demo Invitation',
      type: 'email',
      subject: 'Exclusive Demo: See StudySpot in Action',
      content: `Hi {{name}},

Based on your interest in {{interest}}, I believe you'll find our upcoming demo session incredibly valuable.

During this 30-minute session, you'll see:
• How our AI adapts to different learning styles
• Real-time analytics and progress tracking
• Integration with your existing systems
• ROI calculations specific to {{company}}

Available slots:
• Tomorrow at 2 PM
• Thursday at 10 AM
• Friday at 3 PM

Which time works best for you?

{{sender_name}}`,
      category: 'demo_invite',
      personalization: ['name', 'interest', 'company', 'sender_name'],
      aiOptimized: true,
      performance: {
        openRate: 0.42,
        clickRate: 0.18,
        responseRate: 0.15,
        conversionRate: 0.12
      }
    },
    {
      id: '3',
      name: 'Follow-up Nurture',
      type: 'email',
      subject: 'Quick question about your learning goals',
      content: `Hi {{name}},

I hope this email finds you well. I wanted to follow up on our conversation about {{topic}}.

I came across this case study that I thought might be relevant to your situation at {{company}}:
[Case Study Link]

The results were quite impressive - 60% improvement in learning retention and 35% reduction in training time.

Would you be interested in a brief call to discuss how similar results could apply to your team?

Best,
{{sender_name}}`,
      category: 'follow_up',
      personalization: ['name', 'topic', 'company', 'sender_name'],
      aiOptimized: true,
      performance: {
        openRate: 0.28,
        clickRate: 0.15,
        responseRate: 0.10,
        conversionRate: 0.07
      }
    }
  ];

  useEffect(() => {
    if (open && lead) {
      setCurrentStep(0);
      setMessageContent('');
      setMessageSubject('');
      setAiSuggestions([]);
      setSelectedTemplate(null);
    }
  }, [open, lead]);

  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI suggestions
    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'timing',
        title: 'Optimal Send Time',
        description: 'Based on lead engagement patterns, the best time to send is Tuesday at 10:30 AM',
        confidence: 0.87,
        impact: 'high',
        action: 'Schedule for Tuesday 10:30 AM'
      },
      {
        id: '2',
        type: 'content',
        title: 'Personalization Opportunity',
        description: 'Mention their recent LinkedIn post about digital transformation to increase engagement',
        confidence: 0.92,
        impact: 'high',
        action: 'Add personal reference to recent activity'
      },
      {
        id: '3',
        type: 'channel',
        title: 'Multi-Channel Approach',
        description: 'Follow up with LinkedIn message 2 hours after email for 23% higher response rate',
        confidence: 0.78,
        impact: 'medium',
        action: 'Schedule LinkedIn follow-up'
      }
    ];
    
    setAiSuggestions(mockSuggestions);
    setIsGeneratingSuggestions(false);
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setMessageContent(template.content);
    setMessageSubject(template.subject || '');
    setSelectedChannel(template.type);
    
    // Generate AI suggestions when template is selected
    generateAISuggestions();
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedTemplate) {
      generateAISuggestions();
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSend = () => {
    const messageData = {
      leadId: lead?.id,
      channel: selectedChannel,
      subject: messageSubject,
      content: messageContent,
      template: selectedTemplate,
      aiSuggestions,
      personalizationLevel,
      sendTime,
      sentAt: new Date()
    };
    onSend(messageData);
    onClose();
  };

  const renderChannelSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        Select Communication Channel
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: selectedChannel === 'email' ? 2 : 1,
              borderColor: selectedChannel === 'email' ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => setSelectedChannel('email')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Email</Typography>
              <Typography variant="body2" color="text.secondary">
                Professional, detailed communication
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: selectedChannel === 'sms' ? 2 : 1,
              borderColor: selectedChannel === 'sms' ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => setSelectedChannel('sms')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <SmsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">SMS</Typography>
              <Typography variant="body2" color="text.secondary">
                Quick, direct messages
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: selectedChannel === 'whatsapp' ? 2 : 1,
              borderColor: selectedChannel === 'whatsapp' ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => setSelectedChannel('whatsapp')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <ChatIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">WhatsApp</Typography>
              <Typography variant="body2" color="text.secondary">
                Casual, conversational
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: selectedChannel === 'linkedin' ? 2 : 1,
              borderColor: selectedChannel === 'linkedin' ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => setSelectedChannel('linkedin')}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">LinkedIn</Typography>
              <Typography variant="body2" color="text.secondary">
                Professional networking
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom>
        Message Templates
      </Typography>
      
      <Stack spacing={2}>
        {messageTemplates.filter(t => t.type === selectedChannel).map((template) => (
          <Card 
            key={template.id}
            sx={{ 
              cursor: 'pointer',
              border: selectedTemplate?.id === template.id ? 2 : 1,
              borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
              '&:hover': { boxShadow: 4 }
            }}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{template.name}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={template.category} size="small" color="primary" variant="outlined" />
                  {template.aiOptimized && (
                    <Chip label="AI Optimized" size="small" color="success" />
                  )}
                </Box>
              </Box>
              
              {template.subject && (
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Subject: {template.subject}
                </Typography>
              )}
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                {template.content.substring(0, 150)}...
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {Math.round(template.performance.openRate * 100)}%
                  </Typography>
                  <Typography variant="caption">Open Rate</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {Math.round(template.performance.responseRate * 100)}%
                  </Typography>
                  <Typography variant="caption">Response Rate</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {Math.round(template.performance.conversionRate * 100)}%
                  </Typography>
                  <Typography variant="caption">Conversion Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderAIOptimization = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Content Optimization
      </Typography>
      
      {isGeneratingSuggestions ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing content and generating suggestions...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is optimizing your message for maximum engagement
          </Typography>
        </Box>
      ) : (
        <Box>
          <Stack spacing={2} sx={{ mb: 3 }}>
            {aiSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{suggestion.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={suggestion.impact} 
                        color={suggestion.impact === 'high' ? 'error' : suggestion.impact === 'medium' ? 'warning' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label={`${Math.round(suggestion.confidence * 100)}%`} 
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {suggestion.description}
                  </Typography>
                  
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Recommended Action:</strong> {suggestion.action}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </Stack>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Message Preview
              </Typography>
              
              {selectedChannel === 'email' && (
                <TextField
                  fullWidth
                  label="Subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              
              <TextField
                fullWidth
                label="Message Content"
                multiline
                rows={8}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );

  const renderPersonalization = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Personalization Settings
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Personalization Level
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Basic</Typography>
            <Slider
              value={personalizationLevel}
              onChange={(e, value) => setPersonalizationLevel(value as number)}
              min={1}
              max={5}
              step={1}
              marks
              sx={{ flex: 1 }}
            />
            <Typography variant="body2">Advanced</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Level {personalizationLevel}: {personalizationLevel <= 2 ? 'Basic name/company replacement' : 
            personalizationLevel <= 3 ? 'Industry-specific content' : 
            personalizationLevel <= 4 ? 'Behavioral insights' : 'Full AI personalization'}
          </Typography>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Lead Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {lead?.name || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Company
              </Typography>
              <Typography variant="body1">
                {lead?.company || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Industry
              </Typography>
              <Typography variant="body1">
                Technology
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1">
                {lead?.position || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderSendSchedule = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SendIcon color="primary" />
        Send & Schedule
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Send Timing
          </Typography>
          <RadioGroup
            value={sendTime}
            onChange={(e) => setSendTime(e.target.value as any)}
          >
            <FormControlLabel 
              value="immediate" 
              control={<Radio />} 
              label="Send immediately" 
            />
            <FormControlLabel 
              value="optimal" 
              control={<Radio />} 
              label="Send at optimal time (AI recommended)" 
            />
            <FormControlLabel 
              value="custom" 
              control={<Radio />} 
              label="Schedule for specific time" 
            />
          </RadioGroup>
          
          {sendTime === 'optimal' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                AI recommends sending on Tuesday at 10:30 AM for maximum engagement
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Final Review
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Channel: {selectedChannel.toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Template: {selectedTemplate?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personalization: Level {personalizationLevel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send Time: {sendTime === 'immediate' ? 'Immediately' : 
                        sendTime === 'optimal' ? 'AI Optimized' : 'Custom Schedule'}
            </Typography>
          </Box>
          
          <Alert severity="success">
            <Typography variant="body2">
              Ready to send! This message has been optimized by AI for maximum engagement.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            AI Communication Engine
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
        {currentStep === 0 && renderChannelSelection()}
        {currentStep === 1 && renderAIOptimization()}
        {currentStep === 2 && renderPersonalization()}
        {currentStep === 3 && renderSendSchedule()}
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
          <Button variant="contained" onClick={handleNext} disabled={!selectedTemplate}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSend} startIcon={<SendIcon />}>
            Send Message
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AICommunicationDialog;
