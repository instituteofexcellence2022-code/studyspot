import React, { useState, useEffect } from 'react';
import LeadQualificationDialog from '../../components/leads/LeadQualificationDialog';
import SmartSchedulingDialog from '../../components/leads/SmartSchedulingDialog';
import AICommunicationDialog from '../../components/leads/AICommunicationDialog';
import ConversionAutomationDialog from '../../components/leads/ConversionAutomationDialog';
import LeadAnalyticsDashboard from '../../components/leads/LeadAnalyticsDashboard';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Badge,
  Tooltip,
  Fab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Slider,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  SmartToy as AIIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Campaign as CampaignIcon,
  Group as GroupIcon,
  MonetizationOn as MonetizationIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
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
  Business as BusinessIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  School as EducationIcon,
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
  ViewSidebarTwoTone as SidebarTwoToneIcon2
} from '@mui/icons-material';

// Types and Interfaces
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
  status: 'new' | 'qualified' | 'contacted' | 'demo_scheduled' | 'demo_completed' | 'converted' | 'lost';
  score: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  communicationHistory: CommunicationRecord[];
  demoHistory: DemoRecord[];
  conversionProbability: number;
  aiInsights: AIInsight[];
}

interface CommunicationRecord {
  id: string;
  type: 'email' | 'call' | 'sms' | 'whatsapp' | 'meeting' | 'parent_call' | 'student_call';
  content: string;
  timestamp: Date;
  outcome: 'positive' | 'neutral' | 'negative';
  aiGenerated: boolean;
  sentiment: number; // -1 to 1
  recipient: 'student' | 'parent' | 'both';
}

interface DemoRecord {
  id: string;
  scheduledDate: Date;
  completedDate?: Date;
  type: 'online' | 'in_person' | 'group_demo' | 'individual_demo';
  attendees: string[];
  subjects: string[];
  duration: number; // minutes
  engagement: number; // 0-100
  feedback: string;
  conversion: boolean;
  nextSteps: string;
  parentAttended: boolean;
  studentEngagement: number;
  subjectInterest: { [subject: string]: number };
}

interface AIInsight {
  id: string;
  type: 'scoring' | 'timing' | 'content' | 'conversion' | 'academic' | 'behavioral' | 'engagement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  timestamp: Date;
  category: 'academic' | 'behavioral' | 'engagement' | 'conversion';
}

interface LeadSource {
  id: string;
  name: string;
  type: 'school_visit' | 'parent_referral' | 'social_media' | 'website' | 'advertisement' | 'event' | 'teacher_referral' | 'other';
  cost: number;
  conversionRate: number;
  quality: number;
  schoolAffiliation?: string;
}

interface AICampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'parent_call' | 'student_call' | 'social';
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetAudience: string[];
  message: string;
  schedule: Date;
  performance: CampaignPerformance;
  targetGrade?: string;
  targetSubjects?: string[];
}

interface CampaignPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  converted: number;
  cost: number;
  roi: number;
}

const LeadCapturePage: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);
  const [schedulingDialogOpen, setSchedulingDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [campaigns, setCampaigns] = useState<AICampaign[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Mock Data Initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock Leads
    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@student.com',
        phone: '+1-555-0123',
        age: 14,
        grade: '9th Grade',
        school: 'Lincoln High School',
        parentName: 'Maria Rodriguez',
        parentEmail: 'maria.rodriguez@email.com',
        parentPhone: '+1-555-0124',
        source: 'School Visit',
        status: 'qualified',
        score: 88,
        priority: 'high',
        tags: ['Math', 'Science', 'High Achiever'],
        notes: 'Excellent student interested in advanced math and science programs. Parent very supportive.',
        createdAt: new Date('2024-01-15'),
        lastContact: new Date('2024-01-20'),
        nextAction: 'Schedule demo class',
        assignedTo: 'John Smith',
        subjects: ['Mathematics', 'Physics', 'Chemistry'],
        learningGoals: ['Improve problem-solving skills', 'Prepare for competitive exams'],
        preferredSubjects: ['Mathematics', 'Physics'],
        studySchedule: 'Evenings and weekends',
        parentInvolvement: 'high',
        budget: 2000,
        timeline: 'Immediate',
        interests: ['STEM', 'Competitive Exams', 'Problem Solving'],
        communicationHistory: [],
        demoHistory: [],
        conversionProbability: 0.85,
        aiInsights: []
      },
      {
        id: '2',
        name: 'Alex Thompson',
        email: 'alex.thompson@student.com',
        phone: '+1-555-0456',
        age: 16,
        grade: '11th Grade',
        school: 'Roosevelt High School',
        parentName: 'David Thompson',
        parentEmail: 'david.thompson@email.com',
        parentPhone: '+1-555-0457',
        source: 'Parent Referral',
        status: 'demo_scheduled',
        score: 75,
        priority: 'medium',
        tags: ['English', 'History', 'College Prep'],
        notes: 'Strong in humanities, needs help with standardized test preparation.',
        createdAt: new Date('2024-01-18'),
        lastContact: new Date('2024-01-22'),
        nextAction: 'Prepare demo materials',
        assignedTo: 'Jane Doe',
        subjects: ['English Literature', 'History', 'SAT Prep'],
        learningGoals: ['Improve SAT scores', 'Enhance writing skills'],
        preferredSubjects: ['English Literature', 'History'],
        studySchedule: 'Weekends',
        parentInvolvement: 'medium',
        budget: 1500,
        timeline: 'Q2 2024',
        interests: ['College Prep', 'Writing', 'Literature'],
        communicationHistory: [],
        demoHistory: [],
        conversionProbability: 0.70,
        aiInsights: []
      }
    ];

    // Mock AI Insights
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'academic',
        title: 'High Academic Potential',
        description: 'Student shows strong academic performance and high motivation for advanced learning.',
        confidence: 0.88,
        actionable: true,
        timestamp: new Date(),
        category: 'academic'
      },
      {
        id: '2',
        type: 'engagement',
        title: 'Optimal Contact Time',
        description: 'Best time to contact parents is weekday evenings 6-8 PM. Student prefers weekend mornings.',
        confidence: 0.75,
        actionable: true,
        timestamp: new Date(),
        category: 'engagement'
      },
      {
        id: '3',
        type: 'behavioral',
        title: 'Parent Involvement Level',
        description: 'High parent involvement detected. Include parent in all communication and decision-making.',
        confidence: 0.82,
        actionable: true,
        timestamp: new Date(),
        category: 'behavioral'
      }
    ];

    // Mock Campaigns
    const mockCampaigns: AICampaign[] = [
      {
        id: '1',
        name: 'High School Math Demo Campaign',
        type: 'email',
        status: 'active',
        targetAudience: ['9th-12th Grade Students', 'Parents'],
        message: 'Join our advanced mathematics demo class and discover your potential...',
        schedule: new Date('2024-01-25'),
        targetGrade: '9th-12th Grade',
        targetSubjects: ['Mathematics', 'Physics', 'Chemistry'],
        performance: {
          sent: 150,
          delivered: 145,
          opened: 98,
          clicked: 45,
          replied: 12,
          converted: 3,
          cost: 500,
          roi: 2.4
        }
      },
      {
        id: '2',
        name: 'Parent Information Session',
        type: 'parent_call',
        status: 'active',
        targetAudience: ['Parents of High School Students'],
        message: 'Learn about our comprehensive learning programs for your child...',
        schedule: new Date('2024-01-28'),
        targetGrade: '9th-12th Grade',
        targetSubjects: ['All Subjects'],
        performance: {
          sent: 80,
          delivered: 78,
          opened: 65,
          clicked: 32,
          replied: 18,
          converted: 8,
          cost: 200,
          roi: 3.2
        }
      }
    ];

    // Mock Lead Sources
    const mockSources: LeadSource[] = [
      {
        id: '1',
        name: 'School Visit - Lincoln High',
        type: 'school_visit',
        cost: 500,
        conversionRate: 0.25,
        quality: 0.9,
        schoolAffiliation: 'Lincoln High School'
      },
      {
        id: '2',
        name: 'Parent Referral Program',
        type: 'parent_referral',
        cost: 0,
        conversionRate: 0.35,
        quality: 0.95
      },
      {
        id: '3',
        name: 'Teacher Referral Network',
        type: 'teacher_referral',
        cost: 200,
        conversionRate: 0.30,
        quality: 0.85
      },
      {
        id: '4',
        name: 'Social Media Campaign',
        type: 'social_media',
        cost: 800,
        conversionRate: 0.12,
        quality: 0.6
      },
      {
        id: '5',
        name: 'Website Contact Form',
        type: 'website',
        cost: 0,
        conversionRate: 0.15,
        quality: 0.8
      }
    ];

    setLeads(mockLeads);
    setAiInsights(mockInsights);
    setCampaigns(mockCampaigns);
    setLeadSources(mockSources);
  };

  // Filter and Search Functions
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.school?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  // Lead Management Functions
  const handleAddLead = () => {
    setSelectedLead(null);
    setLeadDialogOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadDialogOpen(true);
  };

  const handleSaveLead = (leadData: Partial<Lead>) => {
    if (selectedLead) {
      // Update existing lead
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id ? { ...lead, ...leadData } : lead
      ));
    } else {
      // Add new lead
      const newLead: Lead = {
        id: Date.now().toString(),
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        age: leadData.age || 0,
        grade: leadData.grade || '',
        school: leadData.school || '',
        parentName: leadData.parentName || '',
        parentEmail: leadData.parentEmail || '',
        parentPhone: leadData.parentPhone || '',
        source: leadData.source || 'Website',
        status: 'new',
        score: 0,
        priority: 'medium',
        tags: [],
        notes: '',
        createdAt: new Date(),
        lastContact: new Date(),
        nextAction: 'Initial contact',
        assignedTo: 'Unassigned',
        subjects: [],
        learningGoals: [],
        preferredSubjects: [],
        studySchedule: '',
        parentInvolvement: leadData.parentInvolvement || 'medium',
        interests: [],
        communicationHistory: [],
        demoHistory: [],
        conversionProbability: 0,
        aiInsights: [],
        ...leadData
      };
      setLeads(prev => [...prev, newLead]);
    }
    setLeadDialogOpen(false);
  };

  const handleQualifyLead = (lead: Lead) => {
    setSelectedLead(lead);
    setQualificationDialogOpen(true);
  };

  const handleScheduleDemo = (lead: Lead) => {
    setSelectedLead(lead);
    setSchedulingDialogOpen(true);
  };

  const handleSendMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setCommunicationDialogOpen(true);
  };

  const handleConversionAutomation = (lead: Lead) => {
    setSelectedLead(lead);
    setConversionDialogOpen(true);
  };

  const handleSaveQualification = (leadData: any) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadData.id ? { ...lead, ...leadData } : lead
    ));
    setQualificationDialogOpen(false);
  };

  const handleSaveSchedule = (scheduleData: any) => {
    // Update lead with scheduled demo
    setLeads(prev => prev.map(lead => 
      lead.id === scheduleData.leadId ? { 
        ...lead, 
        status: 'demo_scheduled',
        nextAction: 'Demo scheduled',
        demoHistory: [...lead.demoHistory, {
          id: Date.now().toString(),
          scheduledDate: scheduleData.selectedTimeSlot.date,
          type: scheduleData.selectedTimeSlot.type,
          attendees: [lead.name],
          duration: scheduleData.selectedTimeSlot.duration,
          engagement: 0,
          feedback: '',
          conversion: false,
          nextSteps: 'Prepare demo materials',
          subjects: scheduleData.subjects || [],
          parentAttended: false,
          studentEngagement: 0,
          subjectInterest: {}
        }]
      } : lead
    ));
    setSchedulingDialogOpen(false);
  };

  const handleSaveMessage = (messageData: any) => {
    // Update lead with communication record
    setLeads(prev => prev.map(lead => 
      lead.id === messageData.leadId ? { 
        ...lead, 
        lastContact: new Date(),
        communicationHistory: [...lead.communicationHistory, {
          id: Date.now().toString(),
          type: messageData.channel,
          content: messageData.content,
          timestamp: new Date(),
          outcome: 'positive' as const,
          aiGenerated: true,
          sentiment: 0.5,
          recipient: 'student' as const
        }]
      } : lead
    ));
    setCommunicationDialogOpen(false);
  };

  const handleSaveConversionAutomation = (automationData: any) => {
    // Update lead with automation data
    setLeads(prev => prev.map(lead => 
      lead.id === automationData.leadId ? { 
        ...lead, 
        status: 'contacted' as const,
        nextAction: 'Automation active',
        aiInsights: [...lead.aiInsights, {
          id: Date.now().toString(),
          type: 'conversion',
          title: 'Automation Activated',
          description: `Conversion automation workflow activated with ${automationData.workflow.name}`,
          confidence: 0.85,
          actionable: false,
          timestamp: new Date(),
          category: 'conversion' as const
        }]
      } : lead
    ));
    setConversionDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'qualified': return 'primary';
      case 'contacted': return 'info';
      case 'demo_scheduled': return 'warning';
      case 'demo_completed': return 'secondary';
      case 'converted': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'primary';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Tab Content Components
  const renderLeadCaptureTab = () => (
    <Box>
      {/* Lead Capture Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon fontSize="large" />
                Lead Capture & Qualification
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                AI-powered lead scoring and automated qualification system
              </Typography>
            </Box>
            <Fab color="secondary" onClick={handleAddLead} sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              <AddIcon />
            </Fab>
          </Box>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="demo_scheduled">Demo Scheduled</MenuItem>
                <MenuItem value="demo_completed">Demo Completed</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} label="Priority">
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Source</InputLabel>
              <Select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} label="Source">
                <MenuItem value="all">All Sources</MenuItem>
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Advertisement">Advertisement</MenuItem>
              </Select>
            </FormControl>
            <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredLeads.map((lead) => (
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }} key={lead.id}>
            <Card sx={{ height: '100%', position: 'relative', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{lead.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lead.grade} • {lead.school}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Parent: {lead.parentName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Qualify Lead">
                      <IconButton size="small" onClick={() => handleQualifyLead(lead)} color="primary">
                        <PsychologyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Schedule Demo">
                      <IconButton size="small" onClick={() => handleScheduleDemo(lead)} color="success">
                        <ScheduleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Message">
                      <IconButton size="small" onClick={() => handleSendMessage(lead)} color="info">
                        <AIIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Conversion Automation">
                      <IconButton size="small" onClick={() => handleConversionAutomation(lead)} color="warning">
                        <AutoAwesomeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Lead">
                      <IconButton size="small" onClick={() => handleEditLead(lead)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Lead">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={lead.status.replace('_', ' ')} 
                      color={getStatusColor(lead.status) as any}
                      size="small"
                    />
                    <Chip 
                      label={lead.priority} 
                      color={getPriorityColor(lead.priority) as any}
                      size="small"
                    />
                    <Chip 
                      label={`Score: ${lead.score}`} 
                      color={getScoreColor(lead.score) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Source: {lead.source} • Age: {lead.age}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                    {lead.subjects.slice(0, 3).map((subject, index) => (
                      <Chip key={index} label={subject} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {lead.notes}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Next: {lead.nextAction}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(lead.conversionProbability * 100)}% chance
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={lead.conversionProbability * 100} 
                      sx={{ width: 40, height: 4 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PersonAddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No leads found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterSource !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Start by adding your first lead to the system'
              }
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddLead}>
              Add First Lead
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderAICampaignsTab = () => (
    <Box>
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon fontSize="large" />
            AI Communication Engine
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Automated messaging, optimal timing, and multi-channel follow-up
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {campaigns.map((campaign) => (
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }} key={campaign.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{campaign.name}</Typography>
                  <Chip 
                    label={campaign.status} 
                    color={campaign.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {campaign.message.substring(0, 100)}...
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="primary">{campaign.performance.sent}</Typography>
                      <Typography variant="caption">Sent</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h6" color="success.main">{campaign.performance.converted}</Typography>
                      <Typography variant="caption">Converted</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ROI: {campaign.performance.roi}x
                  </Typography>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderDemoManagementTab = () => {
    const scheduledDemos = leads.filter(lead => lead.status === 'demo_scheduled');
    const completedDemos = leads.filter(lead => lead.demoHistory.some(demo => demo.conversion !== undefined));
    
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" />
          Demo Class Management
        </Typography>
        
        {/* Demo Statistics */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {scheduledDemos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled Demos
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {completedDemos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Demos
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {Math.round((completedDemos.length / Math.max(leads.length, 1)) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conversion Rate
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Scheduled Demos */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              Upcoming Demo Classes
            </Typography>
            {scheduledDemos.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {scheduledDemos.map((lead) => {
                  const latestDemo = lead.demoHistory[lead.demoHistory.length - 1];
                  return (
                    <Card key={lead.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">{lead.name}</Typography>
                          <Chip 
                            label={lead.grade} 
                            color="primary" 
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          School: {lead.school}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Parent: {lead.parentName}
                        </Typography>
                        {latestDemo && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Demo Date: {new Date(latestDemo.scheduledDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {latestDemo.type.replace('_', ' ')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {latestDemo.duration} minutes
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" variant="contained" startIcon={<CheckCircleIcon />}>
                            Mark Complete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No scheduled demos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Schedule demo classes to see them here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Demo History */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              Demo History & Feedback
            </Typography>
            {completedDemos.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {completedDemos.map((lead) => (
                  <Card key={lead.id} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{lead.name}</Typography>
                        <Chip 
                          label={lead.grade} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        School: {lead.school}
                      </Typography>
                      {lead.demoHistory.map((demo, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(demo.scheduledDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Type: {demo.type.replace('_', ' ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Engagement: {demo.studentEngagement}/10
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Conversion: {demo.conversion ? 'Yes' : 'No'}
                          </Typography>
                          {demo.feedback && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Feedback: {demo.feedback}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No completed demos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete demo classes to see feedback and history here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderAnalyticsTab = () => (
    <LeadAnalyticsDashboard 
      leads={leads}
      campaigns={campaigns}
      onRefresh={() => window.location.reload()}
    />
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Lead Capture" 
            icon={<PersonAddIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="AI Campaigns" 
            icon={<AIIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Smart Scheduling" 
            icon={<ScheduleIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Demo Management" 
            icon={<SchoolIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<AnalyticsIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && renderLeadCaptureTab()}
      {activeTab === 1 && renderAICampaignsTab()}
      {activeTab === 2 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Smart Scheduling - Coming Soon
          </Typography>
        </Box>
      )}
      {activeTab === 3 && renderDemoManagementTab()}
      {activeTab === 4 && renderAnalyticsTab()}

      {/* Lead Dialog */}
      <Dialog open={leadDialogOpen} onClose={() => setLeadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLead ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Name"
                  defaultValue={selectedLead?.name || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  defaultValue={selectedLead?.email || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue={selectedLead?.phone || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  defaultValue={selectedLead?.age || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Grade"
                  defaultValue={selectedLead?.grade || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="School"
                  defaultValue={selectedLead?.school || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Parent Name"
                  defaultValue={selectedLead?.parentName || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Parent Email"
                  type="email"
                  defaultValue={selectedLead?.parentEmail || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Parent Phone"
                  defaultValue={selectedLead?.parentPhone || ''}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <FormControl fullWidth>
                  <InputLabel>Parent Involvement</InputLabel>
                  <Select
                    defaultValue={selectedLead?.parentInvolvement || 'medium'}
                    label="Parent Involvement"
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  defaultValue={selectedLead?.notes || ''}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleSaveLead({})}>
            {selectedLead ? 'Update' : 'Add'} Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lead Qualification Dialog */}
      <LeadQualificationDialog
        open={qualificationDialogOpen}
        onClose={() => setQualificationDialogOpen(false)}
        lead={selectedLead}
        onSave={handleSaveQualification}
      />

      {/* Smart Scheduling Dialog */}
      <SmartSchedulingDialog
        open={schedulingDialogOpen}
        onClose={() => setSchedulingDialogOpen(false)}
        lead={selectedLead}
        onSchedule={handleSaveSchedule}
      />

      {/* AI Communication Dialog */}
      <AICommunicationDialog
        open={communicationDialogOpen}
        onClose={() => setCommunicationDialogOpen(false)}
        lead={selectedLead}
        onSend={handleSaveMessage}
      />

      {/* Conversion Automation Dialog */}
      <ConversionAutomationDialog
        open={conversionDialogOpen}
        onClose={() => setConversionDialogOpen(false)}
        lead={selectedLead}
        onActivate={handleSaveConversionAutomation}
      />
    </Box>
  );
};

export default LeadCapturePage;
