import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Add,
  CheckCircle,
  RadioButtonUnchecked,
  Delete,
  Edit,
  Flag,
  CalendarToday,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface Task {
  id: string;
  title: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string;
  category: string;
}

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'General'];

export default function TasksGoalsPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [taskDialog, setTaskDialog] = useState(false);
  const [goalDialog, setGoalDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'daily' | 'weekly' | 'monthly',
    target: 0,
    unit: 'hours',
    category: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchGoals();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data.data || mockTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks(mockTasks);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/goals');
      setGoals(response.data.data || mockGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      setGoals(mockGoals);
    }
  };

  const mockTasks: Task[] = [
    { id: '1', title: 'Complete Chapter 5 - Calculus', subject: 'Mathematics', priority: 'high', completed: false },
    { id: '2', title: 'Solve 20 physics numericals', subject: 'Physics', priority: 'high', completed: false },
    { id: '3', title: 'Revise organic chemistry reactions', subject: 'Chemistry', priority: 'medium', completed: true },
    { id: '4', title: 'Practice essay writing', subject: 'English', priority: 'low', completed: false },
    { id: '5', title: 'Read Chapter 3 - Cell Biology', subject: 'Biology', priority: 'medium', completed: false },
  ];

  const mockGoals: Goal[] = [
    {
      id: '1',
      title: 'Study 40 hours this week',
      description: 'Complete focused study sessions across all subjects',
      type: 'weekly',
      target: 40,
      current: 28,
      unit: 'hours',
      startDate: '2024-11-01',
      endDate: '2024-11-07',
      category: 'Study Time',
    },
    {
      id: '2',
      title: '100% attendance this month',
      description: 'Attend library every day without missing',
      type: 'monthly',
      target: 30,
      current: 22,
      unit: 'days',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      category: 'Attendance',
    },
    {
      id: '3',
      title: 'Complete 5 mock tests',
      description: 'Take and analyze 5 full-length practice tests',
      type: 'monthly',
      target: 5,
      current: 3,
      unit: 'tests',
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      category: 'Practice',
    },
  ];

  const handleAddTask = async () => {
    try {
      await api.post('/api/tasks', taskForm);
      setTaskDialog(false);
      setTaskForm({ title: '', subject: '', priority: 'medium' });
      fetchTasks();
    } catch (error) {
      // Add locally
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskForm,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setTaskDialog(false);
      setTaskForm({ title: '', subject: '', priority: 'medium' });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}/toggle`);
    } catch (error) {
      // Toggle locally
    }
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
    } catch (error) {
      // Delete locally
    }
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddGoal = async () => {
    try {
      await api.post('/api/goals', goalForm);
      setGoalDialog(false);
      setGoalForm({ title: '', description: '', type: 'weekly', target: 0, unit: 'hours', category: '' });
      fetchGoals();
    } catch (error) {
      // Add locally
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...goalForm,
        current: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setGoals([...goals, newGoal]);
      setGoalDialog(false);
      setGoalForm({ title: '', description: '', type: 'weekly', target: 0, unit: 'hours', category: '' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ✅ Tasks & Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Plan your study, track progress, and achieve your goals
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`Daily Tasks (${tasks.filter(t => !t.completed).length})`} />
          <Tab label={`Goals (${goals.length})`} />
          <Tab label="Progress" />
        </Tabs>

        {/* Daily Tasks Tab */}
        {tab === 0 && (
          <Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTaskDialog(true)}
              sx={{ mb: 3 }}
            >
              Add Task
            </Button>

            {/* Task List by Subject */}
            {SUBJECTS.map(subject => {
              const subjectTasks = tasks.filter(t => t.subject === subject);
              if (subjectTasks.length === 0) return null;

              return (
                <Card key={subject} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {subject}
                    </Typography>
                    <List>
                      {subjectTasks.map((task) => (
                        <ListItem
                          key={task.id}
                          secondaryAction={
                            <Box>
                              <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle color="success" />}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                              >
                                {task.title}
                              </Typography>
                            }
                            secondary={
                              <Chip 
                                label={task.priority} 
                                size="small" 
                                color={getPriorityColor(task.priority) as any}
                                sx={{ mt: 0.5 }}
                              />
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              );
            })}

            {/* Completed Tasks */}
            {tasks.filter(t => t.completed).length > 0 && (
              <Card sx={{ bgcolor: 'success.light', color: 'success.dark' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    ✅ Completed Today ({tasks.filter(t => t.completed).length})
                  </Typography>
                  <List dense>
                    {tasks.filter(t => t.completed).map((task) => (
                      <ListItem key={task.id}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={task.title}
                          secondary={task.subject}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Goals Tab */}
        {tab === 1 && (
          <Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setGoalDialog(true)}
              sx={{ mb: 3 }}
            >
              Add Goal
            </Button>

            <Grid container spacing={3}>
              {goals.map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                return (
                  <Grid item xs={12} md={6} key={goal.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Chip label={goal.type} size="small" color="primary" sx={{ mb: 1 }} />
                            <Typography variant="h6" fontWeight="600">
                              {goal.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {goal.description}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: progress >= 100 ? 'success.main' : 'primary.main' }}>
                            {progress >= 100 ? <EmojiEvents /> : <Flag />}
                          </Avatar>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {goal.current} / {goal.target} {goal.unit}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(progress, 100)} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                background: progress >= 100 
                                  ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                                  : progress >= 75
                                  ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                  : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                              }
                            }}
                          />
                          <Typography variant="h5" fontWeight="bold" color={getProgressColor(progress)} sx={{ mt: 1 }}>
                            {progress}%
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                          </Typography>
                          <Chip 
                            label={goal.category} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>

                        {progress >= 100 && (
                          <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="body2" color="success.dark" fontWeight="600">
                              🎉 Goal Achieved!
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Progress Tab */}
        {tab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📈 Weekly Progress
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h1" fontWeight="bold" color="primary.main">
                      {tasks.filter(t => t.completed).length}/{tasks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Tasks Completed
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(tasks.filter(t => t.completed).length / tasks.length) * 100} 
                      sx={{ height: 12, borderRadius: 6 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🎯 Goal Achievement Rate
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h1" fontWeight="bold" color="success.main">
                      {goals.filter(g => (g.current / g.target) >= 1).length}/{goals.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Goals Achieved
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(goals.filter(g => (g.current / g.target) >= 1).length / goals.length) * 100} 
                      sx={{ height: 12, borderRadius: 6 }}
                      color="success"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📊 Subject-wise Task Completion
                  </Typography>
                  {SUBJECTS.filter(s => tasks.some(t => t.subject === s)).map(subject => {
                    const subjectTasks = tasks.filter(t => t.subject === subject);
                    const completed = subjectTasks.filter(t => t.completed).length;
                    const percentage = (completed / subjectTasks.length) * 100;

                    return (
                      <Box key={subject} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{subject}</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {completed}/{subjectTasks.length} ({Math.round(percentage)}%)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Add Task Dialog */}
        <Dialog open={taskDialog} onClose={() => setTaskDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              margin="normal"
              placeholder="e.g., Complete Chapter 5"
            />
            <TextField
              fullWidth
              select
              label="Subject"
              value={taskForm.subject}
              onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
              margin="normal"
            >
              {SUBJECTS.map(subject => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
              margin="normal"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddTask} disabled={!taskForm.title}>
              Add Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Goal Dialog */}
        <Dialog open={goalDialog} onClose={() => setGoalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Set New Goal</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Goal Title"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              margin="normal"
              placeholder="e.g., Study 40 hours this week"
            />
            <TextField
              fullWidth
              label="Description"
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              select
              label="Goal Type"
              value={goalForm.type}
              onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value as any })}
              margin="normal"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Target"
                value={goalForm.target || ''}
                onChange={(e) => setGoalForm({ ...goalForm, target: parseFloat(e.target.value) })}
                margin="normal"
              />
              <TextField
                fullWidth
                select
                label="Unit"
                value={goalForm.unit}
                onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                margin="normal"
              >
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="tasks">Tasks</MenuItem>
                <MenuItem value="tests">Tests</MenuItem>
                <MenuItem value="chapters">Chapters</MenuItem>
              </TextField>
            </Box>
            <TextField
              fullWidth
              label="Category"
              value={goalForm.category}
              onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
              margin="normal"
              placeholder="e.g., Study Time, Attendance, Practice"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGoalDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddGoal} disabled={!goalForm.title || !goalForm.target}>
              Set Goal
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

function getProgressColor(progress: number): any {
  if (progress >= 100) return 'success.main';
  if (progress >= 75) return 'primary.main';
  if (progress >= 50) return 'warning.main';
  return 'error.main';
}

