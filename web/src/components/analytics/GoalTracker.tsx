import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  GridLegacy as Grid,
} from '@mui/material';
import {
  Add,
  EmojiEvents,
  TrendingUp,
  CheckCircle,
  RadioButtonUnchecked,
  Flag,
  Edit,
  Delete,
  Timer,
  CalendarToday,
  Star,
  LocalFireDepartment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'long-term';
  target: number;
  current: number;
  unit: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'overdue';
  icon: React.ReactNode;
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  achieved: boolean;
  impact: string;
}

const GoalTracker: React.FC = () => {
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

  // Goals
  const goals: Goal[] = [
    {
      id: '1',
      title: 'Mathematics Mastery',
      description: 'Achieve 80% in all mathematics tests',
      category: 'monthly',
      target: 80,
      current: 65,
      unit: '%',
      deadline: '2024-02-15',
      priority: 'high',
      status: 'active',
      icon: <Flag />,
    },
    {
      id: '2',
      title: 'Daily Study Streak',
      description: 'Maintain 30-day study streak',
      category: 'long-term',
      target: 30,
      current: 21,
      unit: 'days',
      deadline: '2024-02-20',
      priority: 'high',
      status: 'active',
      icon: <LocalFireDepartment />,
    },
    {
      id: '3',
      title: 'Study Hours This Week',
      description: 'Complete 20 hours of focused study',
      category: 'weekly',
      target: 20,
      current: 14,
      unit: 'hours',
      deadline: '2024-01-28',
      priority: 'medium',
      status: 'active',
      icon: <Timer />,
    },
    {
      id: '4',
      title: 'Practice Problems',
      description: 'Solve 100 practice problems',
      category: 'weekly',
      target: 100,
      current: 100,
      unit: 'problems',
      deadline: '2024-01-27',
      priority: 'medium',
      status: 'completed',
      icon: <CheckCircle />,
    },
    {
      id: '5',
      title: 'Reading Completion',
      description: 'Finish 3 textbook chapters',
      category: 'weekly',
      target: 3,
      current: 2,
      unit: 'chapters',
      deadline: '2024-01-28',
      priority: 'low',
      status: 'active',
      icon: <Star />,
    },
  ];

  // Progress over time
  const progressData = [
    { date: 'Week 1', math: 45, overall: 50, target: 80 },
    { date: 'Week 2', math: 52, overall: 55, target: 80 },
    { date: 'Week 3', math: 58, overall: 62, target: 80 },
    { date: 'Week 4', math: 62, overall: 68, target: 80 },
    { date: 'Week 5', math: 65, overall: 72, target: 80 },
  ];

  // Milestones
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First 70% Score in Mathematics',
      date: '2024-01-15',
      achieved: false,
      impact: 'Major breakthrough in weak subject',
    },
    {
      id: '2',
      title: '7-Day Study Streak',
      date: '2024-01-12',
      achieved: true,
      impact: 'Built consistent study habit',
    },
    {
      id: '3',
      title: 'Completed 500 Practice Problems',
      date: '2024-01-18',
      achieved: true,
      impact: 'Strengthened problem-solving skills',
    },
    {
      id: '4',
      title: 'All Subjects Above 70%',
      date: '2024-01-25',
      achieved: false,
      impact: 'Balanced performance across subjects',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      default:
        return 'primary';
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'long-term':
        return 'Long-term';
      default:
        return category;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Goal Tracker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your progress and achieve your academic goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddGoalDialogOpen(true)}
        >
          Add Goal
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Flag />
                </Avatar>
                <Box>
                  <Typography variant="h6">{activeGoals.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Goals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6">{completedGoals.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LocalFireDepartment />
                </Avatar>
                <Box>
                  <Typography variant="h6">21 Days</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Study Streak
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h6">68%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Goal Progress Over Time
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Track your journey towards achieving your goals
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="math"
              stackId="1"
              stroke="#1976d2"
              fill="#1976d2"
              name="Mathematics Progress"
            />
            <Area
              type="monotone"
              dataKey="overall"
              stackId="2"
              stroke="#2e7d32"
              fill="#2e7d32"
              name="Overall Progress"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#d32f2f"
              strokeDasharray="5 5"
              name="Target"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        {/* Active Goals */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Goals
            </Typography>
            <List>
              {activeGoals.map((goal) => {
                const progress = calculateProgress(goal.current, goal.target);
                return (
                  <ListItem
                    key={goal.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {goal.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {goal.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {goal.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={getCategoryLabel(goal.category)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={goal.priority}
                          size="small"
                          color={getPriorityColor(goal.priority) as any}
                        />
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ width: '100%', mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          Progress: {goal.current} / {goal.target} {goal.unit}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progress.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 1 }}
                        color={
                          progress >= 80 ? 'success' :
                          progress >= 50 ? 'warning' :
                          'error'
                        }
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Milestones */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEvents color="primary" />
              <Typography variant="h6">Milestones</Typography>
            </Box>
            <List>
              {milestones.map((milestone) => (
                <ListItem
                  key={milestone.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    opacity: milestone.achieved ? 0.7 : 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: milestone.achieved ? 'success.main' : 'grey.400' }}>
                      {milestone.achieved ? <CheckCircle /> : <RadioButtonUnchecked />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="bold">
                        {milestone.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(milestone.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {milestone.impact}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Goal Dialog */}
      <Dialog open={addGoalDialogOpen} onClose={() => setAddGoalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Goal Title" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="long-term">Long-term</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority">
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Target" type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Unit" placeholder="e.g., hours, %, problems" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Deadline" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGoalDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddGoalDialogOpen(false)}>
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalTracker;
