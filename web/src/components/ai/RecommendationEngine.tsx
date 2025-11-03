import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Rating,
  GridLegacy as Grid,
} from '@mui/material';
import {
  AutoAwesome,
  MenuBook,
  Schedule,
  TrendingUp,
  Lightbulb,
  VideoLibrary,
  Article,
  Psychology,
  CheckCircle,
  ArrowForward,
  Bookmark,
  BookmarkBorder,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'topic' | 'schedule' | 'technique';
  relevanceScore: number;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reasons: string[];
  completed: boolean;
  bookmarked: boolean;
}

interface StudyInsight {
  id: string;
  title: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  actionable: boolean;
  icon: React.ReactNode;
}

const RecommendationEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      title: 'Advanced Calculus - Derivatives',
      description: 'Master derivative concepts with interactive examples and practice problems.',
      type: 'resource',
      relevanceScore: 95,
      estimatedTime: '2 hours',
      difficulty: 'intermediate',
      reasons: [
        'Weak performance in recent tests (65%)',
        'High correlation with upcoming exam topics',
        'Recommended by 120 students with similar profiles',
      ],
      completed: false,
      bookmarked: false,
    },
    {
      id: '2',
      title: 'Morning Study Sessions (6-9 AM)',
      description: 'Your peak productivity hours based on historical performance data.',
      type: 'schedule',
      relevanceScore: 92,
      estimatedTime: 'Ongoing',
      difficulty: 'beginner',
      reasons: [
        '40% better retention during these hours',
        'Less distraction probability',
        'Aligns with your natural circadian rhythm',
      ],
      completed: false,
      bookmarked: true,
    },
    {
      id: '3',
      title: 'Pomodoro Technique for Deep Work',
      description: 'Structured 25-minute focus sessions with 5-minute breaks.',
      type: 'technique',
      relevanceScore: 88,
      estimatedTime: '30 min to learn',
      difficulty: 'beginner',
      reasons: [
        'Proven to increase focus by 35%',
        'Reduces study fatigue',
        'Matches your current attention span patterns',
      ],
      completed: false,
      bookmarked: false,
    },
    {
      id: '4',
      title: 'Physics: Newton\'s Laws Deep Dive',
      description: 'Comprehensive video series on mechanics fundamentals.',
      type: 'topic',
      relevanceScore: 85,
      estimatedTime: '1.5 hours',
      difficulty: 'intermediate',
      reasons: [
        'Foundation for upcoming advanced physics',
        '70% of students found this helpful',
        'Addresses your identified weak areas',
      ],
      completed: true,
      bookmarked: true,
    },
    {
      id: '5',
      title: 'Active Recall Practice',
      description: 'Improve memory retention by 50% using active recall techniques.',
      type: 'technique',
      relevanceScore: 82,
      estimatedTime: '45 min',
      difficulty: 'beginner',
      reasons: [
        'Most effective study method for long-term retention',
        'Complements your current study style',
        'Recommended by learning science research',
      ],
      completed: false,
      bookmarked: false,
    },
  ]);

  const insights: StudyInsight[] = [
    {
      id: '1',
      title: 'Peak Performance Time',
      insight: 'You perform 40% better when studying between 6-9 AM. Consider scheduling important topics during this window.',
      impact: 'high',
      category: 'Schedule',
      actionable: true,
      icon: <Schedule />,
    },
    {
      id: '2',
      title: 'Study Pattern Detected',
      insight: 'Your study sessions are most effective when limited to 45-minute blocks. Longer sessions show diminishing returns.',
      impact: 'high',
      category: 'Technique',
      actionable: true,
      icon: <Psychology />,
    },
    {
      id: '3',
      title: 'Resource Utilization',
      insight: 'Video-based learning increases your retention by 30% compared to text-only materials.',
      impact: 'medium',
      category: 'Resources',
      actionable: true,
      icon: <VideoLibrary />,
    },
    {
      id: '4',
      title: 'Weak Area Alert',
      insight: 'Mathematics performance has decreased by 15% over the last two weeks. Immediate attention recommended.',
      impact: 'high',
      category: 'Performance',
      actionable: true,
      icon: <TrendingUp />,
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleToggleBookmark = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, bookmarked: !rec.bookmarked } : rec
    ));
  };

  const handleMarkComplete = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, completed: !rec.completed } : rec
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return <MenuBook />;
      case 'topic':
        return <Article />;
      case 'schedule':
        return <Schedule />;
      case 'technique':
        return <Psychology />;
      default:
        return <Lightbulb />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return rec.type === 'resource' || rec.type === 'topic';
    if (activeTab === 2) return rec.type === 'schedule';
    if (activeTab === 3) return rec.type === 'technique';
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Personalized Recommendations
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered study recommendations based on your performance and learning patterns
      </Typography>

      {/* Study Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h6">AI-Powered Insights</Typography>
          </Box>
          <Grid container spacing={2}>
            {insights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.id}>
                <Paper
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: `${getImpactColor(insight.impact)}.main`,
                    borderLeft: '4px solid',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${getImpactColor(insight.impact)}.main` }}>
                      {insight.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.impact}
                          size="small"
                          color={getImpactColor(insight.impact) as any}
                          sx={{ height: 20 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {insight.insight}
                      </Typography>
                      <Chip label={insight.category} size="small" variant="outlined" />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recommended for You
          </Typography>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="All" />
            <Tab label="Resources & Topics" />
            <Tab label="Schedule" />
            <Tab label="Techniques" />
          </Tabs>

          {/* Recommendation List */}
          <List>
            {filteredRecommendations.map((rec) => (
              <Paper
                key={rec.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: rec.completed ? 0.6 : 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    {getTypeIcon(rec.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {rec.title}
                        </Typography>
                        {rec.completed && (
                          <CheckCircle color="success" fontSize="small" />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={rec.bookmarked ? 'Remove Bookmark' : 'Bookmark'}>
                          <IconButton size="small" onClick={() => handleToggleBookmark(rec.id)}>
                            {rec.bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Helpful">
                          <IconButton size="small">
                            <ThumbUp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not helpful">
                          <IconButton size="small">
                            <ThumbDown fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {rec.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        label={`${rec.relevanceScore}% match`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={rec.difficulty}
                        size="small"
                        color={getDifficultyColor(rec.difficulty) as any}
                      />
                      <Chip
                        label={rec.estimatedTime}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={rec.type}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        Why recommended:
                      </Typography>
                      <List dense>
                        {rec.reasons.map((reason, index) => (
                          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                            <Typography variant="caption" color="text.secondary">
                              • {reason}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!rec.completed ? (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForward />}
                          >
                            Start Now
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleMarkComplete(rec.id)}
                          >
                            Mark Complete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleMarkComplete(rec.id)}
                        >
                          Completed
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Relevance Score
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {rec.relevanceScore}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={rec.relevanceScore}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecommendationEngine;
