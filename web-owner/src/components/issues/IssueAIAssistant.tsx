import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  IconButton,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  SmartToy as SmartToyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  BugReport as BugReportIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface IssueAIAssistantProps {
  open: boolean;
  onClose: () => void;
  currentIssue?: any;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'analysis' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  metadata?: Record<string, any>;
}

interface AIConversation {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
}

const IssueAIAssistant: React.FC<IssueAIAssistantProps> = ({
  open,
  onClose,
  currentIssue,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<AIConversation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [aiMode, setAiMode] = useState<'chat' | 'analysis' | 'recommendations'>('chat');

  // Mock AI insights for demonstration
  const mockInsights: AIInsight[] = [
    {
      id: '1',
      type: 'prediction',
      title: 'High Resolution Time Risk',
      description: 'Based on similar issues, this issue has a 78% chance of exceeding SLA deadline',
      confidence: 78,
      priority: 'high',
      category: 'SLA Prediction',
      actionable: true,
      metadata: { similarIssues: 12, avgResolutionTime: 18.5 },
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Auto-Assign to Expert',
      description: 'Mike Johnson has 95% success rate with similar technical issues',
      confidence: 95,
      priority: 'medium',
      category: 'Assignment',
      actionable: true,
      metadata: { expertId: 'mike-123', successRate: 95, similarResolved: 8 },
    },
    {
      id: '3',
      type: 'analysis',
      title: 'Duplicate Issue Detected',
      description: 'Found 3 similar issues reported in the last 30 days',
      confidence: 85,
      priority: 'medium',
      category: 'Duplicate Detection',
      actionable: true,
      metadata: { duplicateCount: 3, similarIssues: ['issue-456', 'issue-789', 'issue-101'] },
    },
    {
      id: '4',
      type: 'suggestion',
      title: 'Escalation Recommended',
      description: 'Issue complexity suggests escalation to senior staff',
      confidence: 72,
      priority: 'high',
      category: 'Escalation',
      actionable: true,
      metadata: { complexityScore: 8.5, escalationLevel: 2 },
    },
  ];

  useEffect(() => {
    if (open) {
      loadAIInsights();
      initializeConversation();
    }
  }, [open, currentIssue]);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInsights(mockInsights);
    } catch (error) {
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const initializeConversation = () => {
    const welcomeMessage: AIConversation = {
      id: 'welcome',
      message: `Hello! I'm your AI assistant for issue management. I can help you analyze issues, provide recommendations, and predict outcomes. How can I assist you today?`,
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: [
        'Analyze current issue',
        'Predict resolution time',
        'Find similar issues',
        'Recommend staff assignment',
      ],
    };
    setConversation([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: AIConversation = {
      id: `user-${Date.now()}`,
      message: userInput,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateAIResponse(userInput);
      const aiMessage: AIConversation = {
        id: `ai-${Date.now()}`,
        message: aiResponse.message,
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: aiResponse.suggestions,
      };

      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (input: string): { message: string; suggestions?: string[] } => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('analyze') || lowerInput.includes('analysis')) {
      return {
        message: `I've analyzed the current issue. Here are my findings:\n\n• **Priority Assessment**: This appears to be a high-priority technical issue\n• **Complexity Score**: 7.5/10 (moderately complex)\n• **Similar Issues**: Found 3 similar cases in the last 30 days\n• **Recommended Assignee**: Mike Johnson (95% success rate with similar issues)\n• **Predicted Resolution Time**: 4-6 hours\n\nWould you like me to provide more detailed analysis on any specific aspect?`,
        suggestions: ['Show detailed analysis', 'Find similar issues', 'Recommend solutions', 'Predict timeline'],
      };
    }
    
    if (lowerInput.includes('predict') || lowerInput.includes('timeline')) {
      return {
        message: `Based on historical data and issue characteristics, here's my prediction:\n\n• **Resolution Time**: 4-6 hours (78% confidence)\n• **SLA Risk**: Medium risk of SLA breach\n• **Escalation Probability**: 25% chance of escalation\n• **Customer Satisfaction**: Predicted 4.2/5 rating\n\nFactors affecting timeline:\n- Issue complexity: Moderate\n- Staff availability: Good\n- Similar past issues: 3 resolved in 4-5 hours`,
        suggestions: ['Optimize timeline', 'Prevent escalation', 'Improve satisfaction', 'Show risk factors'],
      };
    }
    
    if (lowerInput.includes('similar') || lowerInput.includes('duplicate')) {
      return {
        message: `I found 3 similar issues in our database:\n\n1. **Issue #456** - "Login system timeout" (Resolved in 4.2 hours)\n2. **Issue #789** - "Authentication failure" (Resolved in 5.1 hours)\n3. **Issue #101** - "Session management error" (Resolved in 3.8 hours)\n\n**Common patterns**:\n- All were technical issues\n- Average resolution time: 4.4 hours\n- All resolved by senior staff\n- Customer satisfaction: 4.3/5 average`,
        suggestions: ['View similar issues', 'Apply solutions', 'Contact previous resolvers', 'Update knowledge base'],
      };
    }
    
    if (lowerInput.includes('assign') || lowerInput.includes('staff')) {
      return {
        message: `Here are my staff assignment recommendations:\n\n**Top Recommendation**: Mike Johnson\n- Success rate with similar issues: 95%\n- Average resolution time: 3.8 hours\n- Current workload: Moderate\n- Availability: Available now\n\n**Alternative**: Sarah Wilson\n- Success rate: 87%\n- Average resolution time: 4.2 hours\n- Current workload: Light\n- Availability: Available in 1 hour`,
        suggestions: ['Assign to Mike', 'Assign to Sarah', 'Check availability', 'View workload'],
      };
    }
    
    return {
      message: `I understand you're asking about "${input}". I can help you with:\n\n• Issue analysis and predictions\n• Staff assignment recommendations\n• Finding similar issues and solutions\n• SLA and timeline predictions\n• Escalation recommendations\n\nWhat specific aspect would you like me to focus on?`,
      suggestions: ['Analyze issue', 'Predict timeline', 'Find solutions', 'Recommend staff'],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  const handleInsightAction = (insight: AIInsight) => {
    switch (insight.type) {
      case 'prediction':
        toast.info(`Applying prediction: ${insight.title}`);
        break;
      case 'recommendation':
        toast.success(`Applying recommendation: ${insight.title}`);
        break;
      case 'analysis':
        toast.info(`Viewing analysis: ${insight.title}`);
        break;
      case 'suggestion':
        toast.warning(`Considering suggestion: ${insight.title}`);
        break;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <TrendingUpIcon color="info" />;
      case 'recommendation':
        return <CheckCircleIcon color="success" />;
      case 'analysis':
        return <AnalyticsIcon color="primary" />;
      case 'suggestion':
        return <LightbulbIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              AI Issue Assistant
            </Typography>
            <Chip label="Beta" color="primary" size="small" />
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="AI assistant tabs">
          <Tab icon={<PsychologyIcon />} label="Chat" />
          <Tab icon={<AutoAwesomeIcon />} label="Insights" />
          <Tab icon={<AnalyticsIcon />} label="Analysis" />
        </Tabs>

        {/* Chat Tab */}
        {activeTab === 0 && (
          <Box sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
              {conversation.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: msg.isUser ? 'primary.main' : 'grey.100',
                      color: msg.isUser ? 'white' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </Typography>
                    {msg.suggestions && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {msg.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100' }}>
                    <LinearProgress sx={{ width: 200 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      AI is thinking...
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything about issue management..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={loading || !userInput.trim()}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Insights Tab */}
        {activeTab === 1 && (
          <Box>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <Stack spacing={2}>
              {insights.map((insight) => (
                <Card key={insight.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getInsightIcon(insight.type)}
                        <Typography variant="h6" fontWeight="bold">
                          {insight.title}
                        </Typography>
                        <Chip
                          label={`${insight.confidence}% confidence`}
                          size="small"
                          color={getConfidenceColor(insight.confidence) as any}
                        />
                      </Box>
                      <Chip
                        label={insight.priority}
                        size="small"
                        color={insight.priority === 'high' ? 'error' : insight.priority === 'medium' ? 'warning' : 'success'}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {insight.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={insight.category} size="small" variant="outlined" />
                      {insight.actionable && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleInsightAction(insight)}
                        >
                          Apply
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Analysis Tab */}
        {activeTab === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                AI Analysis provides deep insights into issue patterns, staff performance, and optimization opportunities.
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Issue Pattern Analysis
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <BugReportIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Technical Issues"
                          secondary="35% of total issues"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssignmentIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Facility Issues"
                          secondary="25% of total issues"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Booking Issues"
                          secondary="20% of total issues"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Insights
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SpeedIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Avg Resolution Time"
                          secondary="2.5 hours (improved 15%)"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Staff Efficiency"
                          secondary="Top performer: Mike Johnson"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUpIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="SLA Compliance"
                          secondary="92% (target: 90%)"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadAIInsights}>
          Refresh Insights
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssueAIAssistant;
