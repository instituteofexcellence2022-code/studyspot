import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Timer,
  Coffee,
  Refresh,
  Settings,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';

interface StudyTimerPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

type TimerMode = 'pomodoro' | 'short-break' | 'long-break' | 'deep-work';

export default function StudyTimerPage({ setIsAuthenticated }: StudyTimerPageProps) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    deepWork: 90,
    sessionsUntilLongBreak: 4,
  });

  const [todaySessions, setTodaySessions] = useState([
    { time: '09:00 AM', duration: 25, type: 'Pomodoro' },
    { time: '09:30 AM', duration: 5, type: 'Break' },
    { time: '09:40 AM', duration: 25, type: 'Pomodoro' },
  ]);

  const [weeklyData, setWeeklyData] = useState([
    { name: 'Study', value: 65, color: '#2563eb' },
    { name: 'Break', value: 20, color: '#10b981' },
    { name: 'Idle', value: 15, color: '#e5e7eb' },
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for timer completion sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS56+yMQgoUT6zn77FYFAg+l93wxnMpBSh+zPLaizsKFGGz6Oubm5ubm5ubm5ubm5ubm5ubm5ubm5v///8AAP//AAD//wAA//8AAP//AAD/');
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log('Audio play failed'));
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: mode === 'pomodoro' || mode === 'deep-work' 
          ? 'Great work! Time for a break!' 
          : 'Break is over! Ready to focus?',
        icon: '/pwa-192x192.png',
      });
    }

    // Update session count
    if (mode === 'pomodoro' || mode === 'deep-work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTotalFocusTime(totalFocusTime + settings[mode]);
      
      // Save to backend
      saveSession(mode, settings[mode]);

      // Auto-start break
      if (newCount % settings.sessionsUntilLongBreak === 0) {
        startTimer('long-break');
      } else {
        startTimer('short-break');
      }
    } else {
      // Break ended, back to pomodoro
      startTimer('pomodoro');
    }
  };

  const saveSession = async (sessionType: string, duration: number) => {
    try {
      await api.post('/study-tools/sessions', {
        type: sessionType,
        duration,
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save session');
    }
  };

  const startTimer = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setIsRunning(true);
  };

  const handlePlayPause = () => {
    if (!isRunning && timeLeft === 0) {
      // Start new session
      setTimeLeft(settings[mode] * 60);
    }
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((settings[mode] * 60 - timeLeft) / (settings[mode] * 60)) * 100;

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Study Timer ⏱️
          </Typography>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
        </Box>

        {/* Timer Mode Selection */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => newMode && handleModeChange(newMode)}
          fullWidth
          sx={{ mb: 4 }}
        >
          <ToggleButton value="pomodoro">
            <Timer sx={{ mr: 1 }} /> Pomodoro
          </ToggleButton>
          <ToggleButton value="short-break">
            <Coffee sx={{ mr: 1 }} /> Short Break
          </ToggleButton>
          <ToggleButton value="long-break">
            <Coffee sx={{ mr: 1 }} /> Long Break
          </ToggleButton>
          <ToggleButton value="deep-work">
            <TrendingUp sx={{ mr: 1 }} /> Deep Work
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Main Timer Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" sx={{ color: 'white', fontSize: '96px', fontWeight: 'bold', mb: 2 }}>
                {formatTime(timeLeft)}
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePlayPause}
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#667eea',
                    px: 4,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleStop}
                  startIcon={<Stop />}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {sessionCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sessions Today
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center' }}>
                  <Timer sx={{ fontSize: 40, color: '#2563eb', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {totalFocusTime}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Minutes Today
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {sessionCount > 0 ? Math.round((totalFocusTime / sessionCount) * 10) / 10 : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Focus Score
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Today's Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Today's Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={weeklyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  {weeklyData.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%' }} />
                      <Typography variant="caption">{item.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Sessions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Today's Sessions
                </Typography>
                {todaySessions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No sessions yet today
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {todaySessions.map((session, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${session.type} - ${session.duration} min`}
                          secondary={session.time}
                        />
                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Timer Tips */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Timer Tips 💡
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Pomodoro (25 min):</strong> Best for focused study sessions with short breaks
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Deep Work (90 min):</strong> For intensive study or complex topics
          </Typography>
          <Typography variant="body2">
            <strong>Breaks:</strong> Use them! Walk around, stretch, or grab water
          </Typography>
        </Paper>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="number"
              label="Pomodoro Duration (minutes)"
              value={settings.pomodoro}
              onChange={(e) => setSettings({ ...settings, pomodoro: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 1, max: 60 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Short Break (minutes)"
              value={settings.shortBreak}
              onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 1, max: 15 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Long Break (minutes)"
              value={settings.longBreak}
              onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 5, max: 30 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Deep Work Duration (minutes)"
              value={settings.deepWork}
              onChange={(e) => setSettings({ ...settings, deepWork: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 30, max: 120 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Sessions Until Long Break"
              value={settings.sessionsUntilLongBreak}
              onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 2, max: 8 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setSettingsOpen(false);
              setTimeLeft(settings[mode] * 60);
            }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

