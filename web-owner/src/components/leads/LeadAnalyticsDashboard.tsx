import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
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
  Stack,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MonetizationIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
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
  Search as SearchIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Sms as SmsIcon,
  Chat as ChatIcon2,
  SmartToy as AIIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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
  ContentCopy as CopyIcon2,
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

interface LeadAnalyticsDashboardProps {
  leads: any[];
  campaigns: any[];
  onRefresh: () => void;
}

interface AnalyticsMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  avgLeadScore: number;
  avgTimeToConvert: number;
  totalRevenue: number;
  roi: number;
  topSources: Array<{ source: string; count: number; conversionRate: number }>;
  topPerformers: Array<{ name: string; conversions: number; revenue: number }>;
  funnelMetrics: {
    awareness: number;
    interest: number;
    consideration: number;
    intent: number;
    evaluation: number;
    purchase: number;
  };
  aiInsights: Array<{
    id: string;
    type: 'opportunity' | 'warning' | 'success';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
  }>;
}

const LeadAnalyticsDashboard: React.FC<LeadAnalyticsDashboardProps> = ({
  leads,
  campaigns,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    calculateAnalytics();
  }, [leads, campaigns, timeRange]);

  const calculateAnalytics = () => {
    setIsLoading(true);
    
    // Simulate analytics calculation
    setTimeout(() => {
      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'demo_scheduled' || l.status === 'demo_completed' || l.status === 'converted').length;
      const convertedLeads = leads.filter(l => l.status === 'converted').length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      const avgLeadScore = leads.length > 0 ? leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length : 0;
      const avgTimeToConvert = 5.2; // Mock data
      const totalRevenue = convertedLeads * 50000; // Mock average deal size
      const roi = 2.4; // Mock ROI

      const topSources = [
        { source: 'Website', count: 45, conversionRate: 15.2 },
        { source: 'LinkedIn', count: 32, conversionRate: 12.8 },
        { source: 'Referral', count: 28, conversionRate: 18.5 },
        { source: 'Advertisement', count: 15, conversionRate: 8.3 }
      ];

      const topPerformers = [
        { name: 'John Smith', conversions: 8, revenue: 400000 },
        { name: 'Jane Doe', conversions: 6, revenue: 300000 },
        { name: 'Mike Johnson', conversions: 5, revenue: 250000 }
      ];

      const funnelMetrics = {
        awareness: 1000,
        interest: 450,
        consideration: 200,
        intent: 120,
        evaluation: 80,
        purchase: 25
      };

      const aiInsights = [
        {
          id: '1',
          type: 'opportunity' as const,
          title: 'High-Value Lead Opportunity',
          description: '3 enterprise leads with 85+ scores are ready for executive outreach',
          impact: 'high' as const,
          actionable: true
        },
        {
          id: '2',
          type: 'warning' as const,
          title: 'Low Response Rate',
          description: 'Email response rate dropped 15% this week. Consider A/B testing subject lines',
          impact: 'medium' as const,
          actionable: true
        },
        {
          id: '3',
          type: 'success' as const,
          title: 'Conversion Rate Improvement',
          description: 'Demo-to-conversion rate increased 23% after implementing AI scheduling',
          impact: 'high' as const,
          actionable: false
        }
      ];

      setAnalyticsData({
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate,
        avgLeadScore,
        avgTimeToConvert,
        totalRevenue,
        roi,
        topSources,
        topPerformers,
        funnelMetrics,
        aiInsights
      });
      
      setIsLoading(false);
    }, 1000);
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {analyticsData?.totalLeads || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Leads
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +12% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {analyticsData?.convertedLeads || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conversions
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +8% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {analyticsData?.conversionRate.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conversion Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +2.3% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" gutterBottom>
                ₹{(analyticsData?.totalRevenue || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +15% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* AI Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            AI Insights & Recommendations
          </Typography>
          
          <Stack spacing={2}>
            {analyticsData?.aiInsights.map((insight) => (
              <Alert 
                key={insight.id} 
                severity={insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}
                action={insight.actionable ? <Button size="small">Take Action</Button> : null}
              >
                <Typography variant="subtitle2">
                  {insight.title}
                </Typography>
                <Typography variant="body2">
                  {insight.description}
                </Typography>
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Top Sources and Performers */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Lead Sources
              </Typography>
              
              <List>
                {analyticsData?.topSources.map((source, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={source.source}
                      secondary={`${source.count} leads • ${source.conversionRate}% conversion`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`${source.conversionRate}%`} 
                        color="primary" 
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              
              <List>
                {analyticsData?.topPerformers.map((performer, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={performer.name}
                      secondary={`${performer.conversions} conversions • ₹${performer.revenue.toLocaleString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={`${performer.conversions}`} 
                        color="success" 
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  const renderFunnelTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" />
        Conversion Funnel Analysis
      </Typography>
      
      <Card>
        <CardContent>
          <Stack spacing={3}>
            {Object.entries(analyticsData?.funnelMetrics || {}).map(([stage, count], index) => {
              const awareness = analyticsData?.funnelMetrics?.awareness || 1;
              const percentage = index === 0 ? 100 : (count / awareness) * 100;
              const previousStage = index > 0 ? Object.keys(analyticsData?.funnelMetrics || {})[index - 1] : null;
              const previousCount = previousStage ? (analyticsData?.funnelMetrics as any)?.[previousStage] || 0 : 0;
              const dropOff = index > 0 && previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;
              
              return (
                <Box key={stage}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                      {stage}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6">
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {percentage.toFixed(1)}%
                      </Typography>
                      {index > 0 && (
                        <Chip 
                          label={`-${dropOff.toFixed(1)}%`} 
                          color="error" 
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const renderCampaignsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon color="primary" />
        Campaign Performance
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent</TableCell>
              <TableCell>Opened</TableCell>
              <TableCell>Clicked</TableCell>
              <TableCell>Replied</TableCell>
              <TableCell>Converted</TableCell>
              <TableCell>ROI</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>
                  <Chip label={campaign.type} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={campaign.status} 
                    color={campaign.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{campaign.performance.sent}</TableCell>
                <TableCell>
                  {Math.round((campaign.performance.opened / campaign.performance.sent) * 100)}%
                </TableCell>
                <TableCell>
                  {Math.round((campaign.performance.clicked / campaign.performance.sent) * 100)}%
                </TableCell>
                <TableCell>
                  {Math.round((campaign.performance.replied / campaign.performance.sent) * 100)}%
                </TableCell>
                <TableCell>
                  {Math.round((campaign.performance.converted / campaign.performance.sent) * 100)}%
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${campaign.performance.roi}x`} 
                    color={campaign.performance.roi > 2 ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Calculating analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AnalyticsIcon fontSize="large" />
                Lead Analytics Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                AI-powered insights and performance tracking
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'white' }}>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last 90 days</MenuItem>
                  <MenuItem value="1y">Last year</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label="Overview" 
            icon={<DashboardIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Conversion Funnel" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Campaigns" 
            icon={<EmailIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderFunnelTab()}
      {activeTab === 2 && renderCampaignsTab()}
    </Box>
  );
};

export default LeadAnalyticsDashboard;
