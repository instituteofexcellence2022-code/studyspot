import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  SmartToy,
  Send,
  AutoAwesome,
  School,
  TrendingUp,
  Lightbulb,
  Schedule,
  Star,
  Refresh,
} from '@mui/icons-material';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'resource' | 'schedule' | 'improvement';
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

const AIStudyAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Study Assistant. I can help you with personalized study recommendations, optimal scheduling, and performance insights. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Show my study recommendations',
        'What are my weak areas?',
        'Create a study plan',
        'Show my progress',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Focus on Mathematics',
      description: 'Your performance in mathematics has decreased by 15% this week. Consider dedicating more time to practice.',
      category: 'improvement',
      priority: 'high',
      icon: <TrendingUp />,
    },
    {
      id: '2',
      title: 'Recommended Study Time',
      description: 'Based on your patterns, studying between 6 AM - 9 AM yields 40% better retention.',
      category: 'schedule',
      priority: 'high',
      icon: <Schedule />,
    },
    {
      id: '3',
      title: 'New Resource Available',
      description: 'Advanced calculus video lectures added to your recommended resources.',
      category: 'resource',
      priority: 'medium',
      icon: <School />,
    },
    {
      id: '4',
      title: 'Study Streak Milestone',
      description: 'You\'re on a 7-day study streak! Keep it up to unlock new rewards.',
      category: 'study',
      priority: 'low',
      icon: <Star />,
    },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: [
          'Tell me more',
          'Create a study plan',
          'Show detailed analytics',
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('recommendation') || lowerInput.includes('suggest')) {
      return 'Based on your recent study patterns, I recommend focusing on mathematics for the next 3 days. I\'ve noticed a 15% decrease in your performance in this subject. Would you like me to create a personalized study plan?';
    } else if (lowerInput.includes('weak') || lowerInput.includes('improve')) {
      return 'Your weak areas include: 1) Advanced Mathematics (65% accuracy), 2) Physics Mechanics (70% accuracy). I suggest dedicating 30 minutes daily to practice problems in these areas.';
    } else if (lowerInput.includes('plan') || lowerInput.includes('schedule')) {
      return 'I\'ve created an optimal study plan for you:\n- 6:00 AM - 7:30 AM: Mathematics (Peak productivity time)\n- 8:00 AM - 9:00 AM: Physics Review\n- 4:00 PM - 5:30 PM: Practice Problems\nThis schedule aligns with your best performance times.';
    } else if (lowerInput.includes('progress')) {
      return 'Great news! Your overall progress has improved by 12% this month. You\'ve completed 85% of your weekly goals and maintained a 7-day study streak. Keep up the excellent work!';
    } else {
      return 'I\'m here to help with study recommendations, scheduling, performance insights, and personalized learning paths. What would you like to know more about?';
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study':
        return 'primary';
      case 'resource':
        return 'success';
      case 'schedule':
        return 'warning';
      case 'improvement':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Study Assistant
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Get personalized study recommendations and insights powered by AI
      </Typography>

      {/* Quick Recommendations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h6">Today's Recommendations</Typography>
            </Box>
            <Tooltip title="Refresh Recommendations">
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          
          <List>
            {recommendations.map((rec) => (
              <ListItem
                key={rec.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${getCategoryColor(rec.category)}.main` }}>
                    {rec.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rec.title}
                      </Typography>
                      <Chip
                        label={rec.priority}
                        size="small"
                        color={getPriorityColor(rec.priority) as any}
                        sx={{ height: 20 }}
                      />
                    </Box>
                  }
                  secondary={rec.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SmartToy color="primary" />
            <Typography variant="h6">Chat with AI Assistant</Typography>
          </Box>

          {/* Messages */}
          <Paper
            sx={{
              height: 400,
              overflowY: 'auto',
              p: 2,
              mb: 2,
              bgcolor: 'background.default',
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    gap: 1,
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32,
                    }}
                  >
                    {message.type === 'user' ? 'U' : <SmartToy />}
                  </Avatar>
                  <Box>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {message.content}
                      </Typography>
                    </Paper>
                    {message.suggestions && message.type === 'assistant' && (
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            onClick={() => handleSuggestionClick(suggestion)}
                            icon={<Lightbulb />}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  <SmartToy />
                </Avatar>
                <Paper sx={{ p: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    AI is typing...
                  </Typography>
                  <LinearProgress sx={{ mt: 1, width: 100 }} />
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Input */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask me anything about your studies..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              size="small"
            />
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIStudyAssistant;

