import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  LinearProgress,
  GridLegacy as Grid,
} from '@mui/material';
import {
  Schedule,
  AutoAwesome,
  WbSunny,
  Brightness3,
  Coffee,
  Psychology,
  TrendingUp,
  CheckCircle,
  Edit,
  Add,
  Refresh,
  Timer,
  EventAvailable,
} from '@mui/icons-material';

interface StudyBlock {
  id: string;
  time: string;
  subject: string;
  topic: string;
  duration: number;
  type: 'study' | 'break' | 'review';
  productivity: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
}

interface TimeSlot {
  time: string;
  productivity: number;
  recommended: boolean;
  activities: string[];
}

const SmartScheduler: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // AI-generated optimal schedule
  const optimizedSchedule: StudyBlock[] = [
    {
      id: '1',
      time: '6:00 AM - 7:30 AM',
      subject: 'Mathematics',
      topic: 'Advanced Calculus - Derivatives',
      duration: 90,
      type: 'study',
      productivity: 95,
      difficulty: 'hard',
      reason: 'Peak productivity hour - Best for complex topics',
    },
    {
      id: '2',
      time: '7:30 AM - 7:45 AM',
      subject: 'Break',
      topic: 'Rest & Refresh',
      duration: 15,
      type: 'break',
      productivity: 0,
      difficulty: 'easy',
      reason: 'Prevent mental fatigue',
    },
    {
      id: '3',
      time: '7:45 AM - 9:00 AM',
      subject: 'Physics',
      topic: 'Newton\'s Laws Review',
      duration: 75,
      type: 'study',
      productivity: 90,
      difficulty: 'medium',
      reason: 'High energy level - Good for problem-solving',
    },
    {
      id: '4',
      time: '9:00 AM - 9:30 AM',
      subject: 'Break',
      topic: 'Light Exercise',
      duration: 30,
      type: 'break',
      productivity: 0,
      difficulty: 'easy',
      reason: 'Physical activity improves focus',
    },
    {
      id: '5',
      time: '4:00 PM - 5:00 PM',
      subject: 'Biology',
      topic: 'Cell Structure Notes',
      duration: 60,
      type: 'review',
      productivity: 70,
      difficulty: 'easy',
      reason: 'Lower energy - Better for reviewing',
    },
    {
      id: '6',
      time: '5:00 PM - 6:00 PM',
      subject: 'Practice',
      topic: 'Mixed Subject Problems',
      duration: 60,
      type: 'study',
      productivity: 75,
      difficulty: 'medium',
      reason: 'Active recall practice',
    },
  ];

  // Productivity by time of day
  const productivityByTime: TimeSlot[] = [
    {
      time: '5:00 AM',
      productivity: 85,
      recommended: true,
      activities: ['Deep Work', 'Complex Problems', 'New Learning'],
    },
    {
      time: '6:00 AM',
      productivity: 95,
      recommended: true,
      activities: ['Peak Performance', 'Hardest Topics', 'Critical Thinking'],
    },
    {
      time: '9:00 AM',
      productivity: 80,
      recommended: true,
      activities: ['Problem Solving', 'Practice', 'Application'],
    },
    {
      time: '12:00 PM',
      productivity: 60,
      recommended: false,
      activities: ['Light Review', 'Easy Tasks', 'Break'],
    },
    {
      time: '4:00 PM',
      productivity: 70,
      recommended: true,
      activities: ['Review', 'Consolidation', 'Practice'],
    },
    {
      time: '8:00 PM',
      productivity: 50,
      recommended: false,
      activities: ['Light Reading', 'Review Only', 'Planning'],
    },
  ];

  const studyInsights = [
    {
      title: 'Peak Performance Windows',
      description: 'Your cognitive performance peaks between 6-9 AM. Schedule your most challenging tasks during this time.',
      icon: <WbSunny />,
      color: 'warning',
    },
    {
      title: 'Optimal Break Timing',
      description: 'Taking breaks every 45-60 minutes improves retention by 30%. Your schedule includes optimal break intervals.',
      icon: <Coffee />,
      color: 'info',
    },
    {
      title: 'Subject Sequencing',
      description: 'Alternating between different subjects prevents mental fatigue and improves overall performance.',
      icon: <Psychology />,
      color: 'success',
    },
    {
      title: 'Energy Management',
      description: 'Difficult topics are scheduled during high-energy periods, with easier reviews during lower-energy times.',
      icon: <TrendingUp />,
      color: 'primary',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <Psychology />;
      case 'break':
        return <Coffee />;
      case 'review':
        return <Refresh />;
      default:
        return <Schedule />;
    }
  };

  const getTimeOfDayIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return <WbSunny />;
    if (hour >= 12 && hour < 18) return <WbSunny />;
    return <Brightness3 />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Study Scheduler
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-optimized study schedule based on your productivity patterns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Edit />}>
            Customize
          </Button>
          <Button variant="contained" startIcon={<AutoAwesome />}>
            Regenerate Schedule
          </Button>
        </Box>
      </Box>

      {/* Schedule Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Timer />
                </Avatar>
                <Box>
                  <Typography variant="h6">360 min</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Study Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">4 Subjects</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Covered Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6">85%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Productivity
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Coffee />
                </Avatar>
                <Box>
                  <Typography variant="h6">3 Breaks</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimal Rest
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesome color="primary" />
            <Typography variant="h6">AI Schedule Insights</Typography>
          </Box>
          <Grid container spacing={2}>
            {studyInsights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Avatar sx={{ bgcolor: `${insight.color}.main` }}>
                    {insight.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Optimized Study Schedule</Typography>
              <Chip
                label="Today"
                color="primary"
                icon={<EventAvailable />}
              />
            </Box>
            <List>
              {optimizedSchedule.map((block, index) => (
                <React.Fragment key={block.id}>
                  <ListItem
                    sx={{
                      bgcolor: block.type === 'break' ? 'action.hover' : 'background.paper',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: block.type === 'break' ? 'info.main' : 'primary.main',
                        }}
                      >
                        {getTypeIcon(block.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {block.subject}
                          </Typography>
                          {block.type !== 'break' && (
                            <>
                              <Chip
                                label={block.difficulty}
                                size="small"
                                color={getDifficultyColor(block.difficulty) as any}
                                sx={{ height: 20 }}
                              />
                              <Chip
                                label={`${block.duration} min`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            </>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {block.time} • {block.topic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            💡 {block.reason}
                          </Typography>
                          {block.type !== 'break' && (
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption">
                                  Expected Productivity
                                </Typography>
                                <Typography variant="caption" fontWeight="bold">
                                  {block.productivity}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={block.productivity}
                                sx={{ height: 4, borderRadius: 1 }}
                              />
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <Edit fontSize="small" />
                    </IconButton>
                  </ListItem>
                  {index < optimizedSchedule.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              sx={{ mt: 2 }}
            >
              Add Study Block
            </Button>
          </Paper>
        </Grid>

        {/* Productivity Timeline */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Productivity by Time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your cognitive performance throughout the day
            </Typography>
            <List>
              {productivityByTime.map((slot, index) => (
                <ListItem key={index} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                    {getTimeOfDayIcon(slot.time)}
                    <Typography variant="body2" fontWeight="bold">
                      {slot.time}
                    </Typography>
                    {slot.recommended && (
                      <Chip label="Recommended" size="small" color="success" sx={{ ml: 'auto', height: 20 }} />
                    )}
                  </Box>
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={slot.productivity}
                      color={slot.recommended ? 'success' : 'warning'}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {slot.productivity}% productivity
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {slot.activities.map((activity, idx) => (
                      <Chip
                        key={idx}
                        label={activity}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    ))}
                  </Box>
                  {index < productivityByTime.length - 1 && <Divider sx={{ width: '100%', mt: 2 }} />}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SmartScheduler;
