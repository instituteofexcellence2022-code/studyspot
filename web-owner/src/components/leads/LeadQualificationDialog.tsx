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
  Slider,
  FormControlLabel,
  Switch,
  Autocomplete,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Rating,
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
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
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
  ViewSidebarTwoTone as SidebarTwoToneIcon2
} from '@mui/icons-material';

interface LeadQualificationDialogProps {
  open: boolean;
  onClose: () => void;
  lead?: any;
  onSave: (leadData: any) => void;
}

interface QualificationQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'rating' | 'slider' | 'boolean' | 'multiselect';
  options?: string[];
  weight: number;
  category: 'academic' | 'behavioral' | 'budget' | 'timeline';
  required: boolean;
}

interface AIScore {
  overall: number;
  academic: number;
  behavioral: number;
  budget: number;
  timeline: number;
  confidence: number;
  recommendations: string[];
  nextSteps: string[];
}

const LeadQualificationDialog: React.FC<LeadQualificationDialogProps> = ({
  open,
  onClose,
  lead,
  onSave
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [qualificationData, setQualificationData] = useState<any>({});
  const [aiScore, setAiScore] = useState<AIScore | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Qualification Questions
  const qualificationQuestions: QualificationQuestion[] = [
    {
      id: 'academic_level',
      question: 'What is the student\'s current academic performance level?',
      type: 'select',
      options: ['Excellent (A+ grades)', 'Good (A-B grades)', 'Average (B-C grades)', 'Below Average (C-D grades)', 'Struggling (D-F grades)'],
      weight: 25,
      category: 'academic',
      required: true
    },
    {
      id: 'parent_involvement',
      question: 'How involved are the parents in the student\'s education?',
      type: 'select',
      options: ['Very involved (daily monitoring)', 'Moderately involved (weekly check-ins)', 'Somewhat involved (monthly reviews)', 'Minimally involved (occasional interest)', 'Not involved'],
      weight: 20,
      category: 'behavioral',
      required: true
    },
    {
      id: 'learning_goals',
      question: 'What are the primary learning goals?',
      type: 'multiselect',
      options: ['Improve grades', 'Prepare for competitive exams', 'Develop problem-solving skills', 'Build confidence', 'Catch up with peers', 'Advanced learning', 'College preparation'],
      weight: 15,
      category: 'academic',
      required: true
    },
    {
      id: 'subject_interest',
      question: 'Which subjects is the student most interested in?',
      type: 'multiselect',
      options: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'All subjects'],
      weight: 15,
      category: 'academic',
      required: true
    },
    {
      id: 'study_schedule',
      question: 'What is the student\'s preferred study schedule?',
      type: 'select',
      options: ['Early morning (6-8 AM)', 'Morning (8-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)', 'Night (8-10 PM)', 'Weekends only', 'Flexible'],
      weight: 10,
      category: 'behavioral',
      required: true
    },
    {
      id: 'budget_range',
      question: 'What is the family\'s budget range for tutoring?',
      type: 'select',
      options: ['Under $500/month', '$500-1000/month', '$1000-2000/month', '$2000-3000/month', 'Over $3000/month'],
      weight: 10,
      category: 'budget',
      required: true
    },
    {
      id: 'urgency_level',
      question: 'How urgent is the need for academic support?',
      type: 'rating',
      weight: 5,
      category: 'timeline',
      required: true
    }
  ];

  const steps = [
    'Basic Information',
    'Qualification Questions',
    'AI Analysis',
    'Recommendations'
  ];

  useEffect(() => {
    if (open && lead) {
      setQualificationData(lead);
      setCurrentStep(0);
      setAnswers({});
      setAiScore(null);
    }
  }, [open, lead]);

  const calculateAIScore = async (answers: Record<string, any>) => {
    setIsCalculating(true);
    
    // Simulate AI calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI scoring algorithm
    const scores = {
      academic: calculateCategoryScore(answers, 'academic'),
      behavioral: calculateCategoryScore(answers, 'behavioral'),
      budget: calculateCategoryScore(answers, 'budget'),
      timeline: calculateCategoryScore(answers, 'timeline')
    };
    
    const overall = Math.round(
      (scores.academic * 0.40 + scores.behavioral * 0.30 + scores.budget * 0.20 + 
       scores.timeline * 0.10)
    );
    
    const mockScore: AIScore = {
      overall,
      ...scores,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      recommendations: generateRecommendations(overall, answers),
      nextSteps: generateNextSteps(overall, answers)
    };
    
    setAiScore(mockScore);
    setIsCalculating(false);
  };

  const calculateCategoryScore = (answers: Record<string, any>, category: string): number => {
    const categoryQuestions = qualificationQuestions.filter(q => q.category === category);
    let totalScore = 0;
    let totalWeight = 0;
    
    categoryQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        let score = 0;
        
        switch (question.type) {
          case 'select':
            const optionIndex = question.options?.indexOf(answer) || 0;
            score = (optionIndex / Math.max((question.options?.length || 1) - 1, 1)) * 100;
            break;
          case 'rating':
            score = (answer / 5) * 100;
            break;
          case 'slider':
            score = answer;
            break;
          case 'boolean':
            score = answer ? 100 : 0;
            break;
          default:
            score = 50;
        }
        
        totalScore += score * question.weight;
        totalWeight += question.weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  const generateRecommendations = (overall: number, answers: Record<string, any>): string[] => {
    const recommendations = [];
    
    if (overall >= 80) {
      recommendations.push('High-priority lead - Schedule demo immediately');
      recommendations.push('Prepare enterprise-level proposal');
      recommendations.push('Assign senior sales representative');
    } else if (overall >= 60) {
      recommendations.push('Qualified lead - Follow up within 24 hours');
      recommendations.push('Send relevant case studies and testimonials');
      recommendations.push('Schedule discovery call');
    } else if (overall >= 40) {
      recommendations.push('Nurture lead with educational content');
      recommendations.push('Send product information and pricing');
      recommendations.push('Follow up in 1 week');
    } else {
      recommendations.push('Low priority - Add to nurture campaign');
      recommendations.push('Send general information about our solutions');
      recommendations.push('Re-evaluate in 30 days');
    }
    
    return recommendations;
  };

  const generateNextSteps = (overall: number, answers: Record<string, any>): string[] => {
    const nextSteps = [];
    
    if (overall >= 80) {
      nextSteps.push('Schedule personalized demo within 48 hours');
      nextSteps.push('Prepare custom proposal with ROI analysis');
      nextSteps.push('Arrange executive meeting');
    } else if (overall >= 60) {
      nextSteps.push('Send detailed product information');
      nextSteps.push('Schedule discovery call');
      nextSteps.push('Provide relevant case studies');
    } else {
      nextSteps.push('Add to email nurture sequence');
      nextSteps.push('Send educational content');
      nextSteps.push('Schedule follow-up in 2 weeks');
    }
    
    return nextSteps;
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Calculate AI score after qualification questions
      calculateAIScore(answers);
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSave = () => {
    const leadData = {
      ...qualificationData,
      qualificationAnswers: answers,
      aiScore: aiScore,
      qualificationDate: new Date(),
      status: aiScore && aiScore.overall >= 60 ? 'qualified' : 'new'
    };
    onSave(leadData);
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const renderBasicInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Lead Information
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <TextField
            fullWidth
            label="Name"
            value={qualificationData.name || ''}
            onChange={(e) => setQualificationData((prev: any) => ({ ...prev, name: e.target.value }))}
            variant="outlined"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={qualificationData.email || ''}
            onChange={(e) => setQualificationData((prev: any) => ({ ...prev, email: e.target.value }))}
            variant="outlined"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <TextField
            fullWidth
            label="Phone"
            value={qualificationData.phone || ''}
            onChange={(e) => setQualificationData((prev: any) => ({ ...prev, phone: e.target.value }))}
            variant="outlined"
          />
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <TextField
            fullWidth
            label="Company"
            value={qualificationData.company || ''}
            onChange={(e) => setQualificationData((prev: any) => ({ ...prev, company: e.target.value }))}
            variant="outlined"
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Position"
            value={qualificationData.position || ''}
            onChange={(e) => setQualificationData((prev: any) => ({ ...prev, position: e.target.value }))}
            variant="outlined"
          />
        </Box>
        </Box>
    </Box>
  );

  const renderQualificationQuestions = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PsychologyIcon color="primary" />
        Qualification Questions
      </Typography>
      
      <Stack spacing={3}>
        {qualificationQuestions.map((question, index) => (
          <Card key={question.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {index + 1}. {question.question}
                </Typography>
                <Chip 
                  label={question.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              {question.type === 'select' && (
                <FormControl fullWidth>
                  <Select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select an option
                    </MenuItem>
                    {question.options?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              {question.type === 'rating' && (
                <Box>
                  <Rating
                    value={answers[question.id] || 0}
                    onChange={(e, value) => handleAnswerChange(question.id, value || 0)}
                    size="large"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {answers[question.id] || 0} out of 5
                  </Typography>
                </Box>
              )}
              
              {question.type === 'boolean' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={answers[question.id] || false}
                      onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
                    />
                  }
                  label={answers[question.id] ? 'Yes' : 'No'}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  const renderAIAnalysis = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Analysis
      </Typography>
      
      {isCalculating ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing lead qualification...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is evaluating responses and calculating scores
          </Typography>
        </Box>
      ) : aiScore ? (
        <Box>
          {/* Overall Score */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h2" fontWeight="bold">
                {aiScore.overall}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Overall Qualification Score
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Confidence: {Math.round(aiScore.confidence * 100)}%
              </Typography>
            </CardContent>
          </Card>
          
          {/* Category Scores */}
          <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(aiScore).filter(([key]) => 
              ['academic', 'behavioral', 'budget', 'timeline'].includes(key)
            ).map(([category, score]) => (
              <Box key={category} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={`${getScoreColor(score as number)}.main`}>
                      {score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {category} Score
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={score as number} 
                      color={getScoreColor(score as number) as any}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );

  const renderRecommendations = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" />
        AI Recommendations
      </Typography>
      
      {aiScore && (
        <Box>
          {/* Recommendations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="warning" />
                Recommended Actions
              </Typography>
              <List>
                {aiScore.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* Next Steps */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="info" />
                Next Steps
              </Typography>
              <List>
                {aiScore.nextSteps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Typography variant="h6" color="primary">
                        {index + 1}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            AI Lead Qualification
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
        {currentStep === 0 && renderBasicInfo()}
        {currentStep === 1 && renderQualificationQuestions()}
        {currentStep === 2 && renderAIAnalysis()}
        {currentStep === 3 && renderRecommendations()}
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
          <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
            Save & Qualify Lead
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LeadQualificationDialog;
