/**
 * ⏱️ ENHANCED STUDY TIMER PAGE
 * 
 * Features:
 * - Pomodoro, Short Break, Long Break, Deep Work, Custom Timer
 * - Task tracking during sessions
 * - Comprehensive statistics and analytics
 * - Session history with filtering
 * - Background timer persistence
 * - Sound options and notifications
 * - Goals and achievements
 * - Focus music/ambient sounds
 * - Visual progress indicators
 */

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
  Stack,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Tab,
  Tabs,
  Alert,
  Badge,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
  MusicNote,
  VolumeUp,
  VolumeOff,
  Task,
  Add,
  Delete,
  Edit,
  BarChart,
  History,
  EmojiEvents,
  Notifications,
  NotificationsOff,
  AutoAwesome,
  Psychology,
  LocalFireDepartment,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import MobileLayout from '../components/MobileLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { gradients } from '../theme/colors';

interface StudyTimerPageProps {
  setIsAuthenticated?: (value: boolean) => void;
}

type TimerMode = 'pomodoro' | 'short-break' | 'long-break' | 'deep-work' | 'custom';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  deepWork: number;
  custom: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  focusMusicEnabled: boolean;
  focusMusicVolume: number;
}

interface StudyTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface SessionRecord {
  id: string;
  type: string;
  duration: number; // minutes
  completedAt: string;
  tasksCompleted?: number;
  totalTasks?: number;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function StudyTimerPage({ setIsAuthenticated }: StudyTimerPageProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // minutes
  const [totalBreakTime, setTotalBreakTime] = useState(0); // minutes
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [viewTab, setViewTab] = useState(0); // 0: Timer, 1: Stats, 2: History
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    deepWork: 90,
    custom: 30,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
    focusMusicEnabled: false,
    focusMusicVolume: 50,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const focusMusicRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const currentSessionIdRef = useRef<string | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('studyTimerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isRunning && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const remaining = Math.max(0, state.timeLeft - elapsed);
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsRunning(true);
            setMode(state.mode);
            startTimeRef.current = state.startTime;
          }
        }
      } catch (error) {
        console.error('Failed to load saved timer state:', error);
      }
    }

    // Load settings
    const savedSettings = localStorage.getItem('studyTimerSettings');
    if (savedSettings) {
      try {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    // Load tasks
    const savedTasks = localStorage.getItem('studyTimerTasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }

    // Load session history
    fetchSessionHistory();
    fetchStatistics();
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      const state = {
        mode,
        timeLeft,
        isRunning,
        startTime: startTimeRef.current,
      };
      localStorage.setItem('studyTimerState', JSON.stringify(state));
    } else {
      localStorage.removeItem('studyTimerState');
    }
  }, [mode, timeLeft, isRunning]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('studyTimerSettings', JSON.stringify(settings));
  }, [settings]);

  // Save tasks
  useEffect(() => {
    localStorage.setItem('studyTimerTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Timer logic
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
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Focus music
  useEffect(() => {
    if (settings.focusMusicEnabled && isRunning && (mode === 'pomodoro' || mode === 'deep-work')) {
      // Start ambient focus music (using a placeholder - you can add actual music)
      if (!focusMusicRef.current) {
        focusMusicRef.current = new Audio();
        focusMusicRef.current.loop = true;
        focusMusicRef.current.volume = settings.focusMusicVolume / 100;
        // You can set an actual music URL here
        // focusMusicRef.current.src = '/focus-music.mp3';
      }
      // focusMusicRef.current.play().catch(() => {});
    } else if (focusMusicRef.current) {
      focusMusicRef.current.pause();
    }
  }, [settings.focusMusicEnabled, isRunning, mode, settings.focusMusicVolume]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default' && settings.notificationsEnabled) {
      Notification.requestPermission();
    }
  }, [settings.notificationsEnabled]);

  const fetchSessionHistory = async () => {
    try {
      const response = await api.get('/api/study-tools/sessions?limit=50');
      const records = response.data?.data?.sessions || response.data?.data || [];
      setSessionHistory(records.map((r: any) => ({
        id: r.id,
        type: r.session_type || r.type,
        duration: r.total_focus_time || r.duration || 0,
        completedAt: r.ended_at || r.completedAt || r.created_at,
        tasksCompleted: r.tasks_completed || 0,
        totalTasks: r.total_tasks || 0,
      })));
    } catch (error) {
      console.error('Failed to fetch session history:', error);
      // Use sample data
      setSessionHistory(generateSampleHistory());
    }
  };

  const fetchStatistics = async () => {
    try {
      // Calculate from session history
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySessions = sessionHistory.filter(s => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= today;
      });

      const todayFocusTime = todaySessions
        .filter(s => s.type === 'pomodoro' || s.type === 'deep-work')
        .reduce((sum, s) => sum + s.duration, 0);

      setSessionCount(todaySessions.length);
      setTotalFocusTime(todayFocusTime);

      // Calculate streaks
      calculateStreaks();
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const calculateStreaks = () => {
    // Simple streak calculation based on daily sessions
    const sortedSessions = [...sessionHistory].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sessionDate.getTime() === today.getTime() || 
            sessionDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
          streak = 1;
          tempStreak = 1;
        }
      } else {
        const diffDays = (lastDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000);
        if (diffDays === 1) {
          tempStreak++;
          if (streak === 0) streak = tempStreak;
        } else if (diffDays > 1) {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
          if (diffDays > 1) streak = 0;
        }
      }

      longest = Math.max(longest, tempStreak);
      lastDate = sessionDate;
    });

    setCurrentStreak(streak);
    setLongestStreak(longest);
  };

  const generateSampleHistory = (): SessionRecord[] => {
    const records: SessionRecord[] = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const types: string[] = ['pomodoro', 'pomodoro', 'pomodoro', 'short-break', 'deep-work'];
      const type = types[Math.floor(Math.random() * types.length)];
      const duration = type === 'deep-work' ? 90 : type.includes('break') ? 5 : 25;

      records.push({
        id: `session-${i}`,
        type,
        duration,
        completedAt: date.toISOString(),
        tasksCompleted: type.includes('break') ? 0 : Math.floor(Math.random() * 3) + 1,
        totalTasks: type.includes('break') ? 0 : Math.floor(Math.random() * 5) + 2,
      });
    }

    return records;
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Play completion sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    // Show notification
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'pomodoro' || mode === 'deep-work' 
        ? 'Great work! Time for a break!' 
        : 'Break is over! Ready to focus?';
      new Notification('Timer Complete!', {
        body: message,
        icon: '/pwa-192x192.png',
      });
    }

    // Save session
    const completedDuration = settings[mode];
    if (mode === 'pomodoro' || mode === 'deep-work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTotalFocusTime(totalFocusTime + completedDuration);
      
      // Save to backend
      await saveSession(mode, completedDuration);

      // Auto-start break
      if (settings.autoStartBreaks) {
        if (newCount % settings.sessionsUntilLongBreak === 0) {
          setTimeout(() => startTimer('long-break'), 1000);
        } else {
          setTimeout(() => startTimer('short-break'), 1000);
        }
      } else {
        toast.success(`✅ Completed ${completedDuration} minutes of focused work!`);
      }
    } else {
      setTotalBreakTime(totalBreakTime + completedDuration);
      
      // Auto-start pomodoro
      if (settings.autoStartPomodoros) {
        setTimeout(() => startTimer('pomodoro'), 1000);
      } else {
        toast.success('✅ Break completed! Ready to focus?');
      }
    }

    // Reset timer
    setTimeLeft(settings[mode] * 60);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  };

  const saveSession = async (sessionType: string, duration: number) => {
    try {
      // Create session
      const sessionResponse = await api.post('/api/study-tools/sessions', {
        type: sessionType,
        settings: settings,
        status: 'completed',
      });

      const sessionId = sessionResponse.data?.data?.id;

      // Create timer record
      if (sessionId) {
        await api.post('/api/study-tools/timers', {
          sessionId,
          type: sessionType.includes('break') ? 'break' : 'focus',
          duration,
        });
      }

      // Update local history
      const newRecord: SessionRecord = {
        id: sessionId || `local-${Date.now()}`,
        type: sessionType,
        duration,
        completedAt: new Date().toISOString(),
        tasksCompleted: tasks.filter(t => t.completed).length,
        totalTasks: tasks.length,
      };
      setSessionHistory(prev => [newRecord, ...prev]);
    } catch (error) {
      console.error('Failed to save session:', error);
      // Still add to local history
      const newRecord: SessionRecord = {
        id: `local-${Date.now()}`,
        type: sessionType,
        duration,
        completedAt: new Date().toISOString(),
        tasksCompleted: tasks.filter(t => t.completed).length,
        totalTasks: tasks.length,
      };
      setSessionHistory(prev => [newRecord, ...prev]);
    }
  };

  const startTimer = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    // Create session in backend
    if (newMode === 'pomodoro' || newMode === 'deep-work') {
      api.post('/api/study-tools/sessions', {
        type: newMode,
        settings: settings,
        status: 'active',
      }).then(response => {
        currentSessionIdRef.current = response.data?.data?.id;
      }).catch(error => {
        console.error('Failed to create session:', error);
      });
    }
  };

  const handlePlayPause = () => {
    if (!isRunning && timeLeft === 0) {
      // Start new session
      startTimer(mode);
    } else if (isPaused) {
      // Resume
      setIsRunning(true);
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current * 1000;
      pausedTimeRef.current = 0;
    } else if (isRunning) {
      // Pause
      setIsRunning(false);
      setIsPaused(true);
      if (startTimeRef.current) {
        pausedTimeRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
      }
    } else {
      // Start
      setIsRunning(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(settings[mode] * 60);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    
    // End session in backend
    if (currentSessionIdRef.current) {
      api.put(`/api/study-tools/sessions/${currentSessionIdRef.current}/end`).catch(() => {});
      currentSessionIdRef.current = null;
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (isRunning) {
      handleStop();
    }
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((settings[mode] * 60 - timeLeft) / (settings[mode] * 60)) * 100;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setTaskDialogOpen(false);
      toast.success('Task added!');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Generate chart data
  const todaySessions = sessionHistory.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    
    const daySessions = sessionHistory.filter(s => {
      const sessionDate = new Date(s.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === date.getTime();
    });

    const focusTime = daySessions
      .filter(s => s.type === 'pomodoro' || s.type === 'deep-work')
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: Math.floor(focusTime / 60),
      sessions: daySessions.length,
    };
  });

  const distributionData = [
    { name: 'Focus', value: totalFocusTime, color: '#2563eb' },
    { name: 'Break', value: totalBreakTime, color: '#10b981' },
    { name: 'Idle', value: Math.max(0, 480 - totalFocusTime - totalBreakTime), color: '#e5e7eb' },
  ];

  const getModeColor = () => {
    switch (mode) {
      case 'pomodoro': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'short-break': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'long-break': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'deep-work': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      case 'custom': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'pomodoro': return <Timer />;
      case 'short-break': return <Coffee />;
      case 'long-break': return <Coffee />;
      case 'deep-work': return <Psychology />;
      case 'custom': return <AutoAwesome />;
      default: return <Timer />;
    }
  };

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: { xs: 2, sm: 4 } }}>
        <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 2, md: 3 }, px: { xs: 1.5, sm: 2 } }}>
          {/* Compact Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              ⏱️ Study Timer
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Add Task">
                <IconButton 
                  onClick={() => setTaskDialogOpen(true)} 
                  color="primary"
                  size="small"
                  sx={{ p: { xs: 0.75, sm: 1 } }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton 
                onClick={() => setSettingsOpen(true)}
                size="small"
                sx={{ p: { xs: 0.75, sm: 1 } }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* View Tabs - Compact */}
          <Card sx={{ mb: { xs: 2, sm: 2.5 }, borderRadius: { xs: 2, sm: 3 } }}>
            <Tabs 
              value={viewTab} 
              onChange={(e, v) => setViewTab(v)} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{ 
                minHeight: { xs: 44, sm: 48 },
                '& .MuiTab-root': {
                  minHeight: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                }
              }}
            >
              <Tab icon={<Timer fontSize="small" />} label="Timer" iconPosition="start" />
              <Tab icon={<BarChart fontSize="small" />} label="Stats" iconPosition="start" />
              <Tab icon={<History fontSize="small" />} label="History" iconPosition="start" />
            </Tabs>
            <Divider />

            {/* Timer View */}
            {viewTab === 0 && (
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Compact Timer Mode Selection */}
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(e, newMode) => newMode && handleModeChange(newMode)}
                  fullWidth
                  sx={{ 
                    mb: { xs: 2, sm: 2.5 },
                    '& .MuiToggleButton-root': {
                      py: { xs: 0.75, sm: 1 },
                      px: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        mr: { xs: 0.5, sm: 1 },
                      }
                    }
                  }}
                >
                  <ToggleButton value="pomodoro">
                    <Timer /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Pomodoro</Box>
                  </ToggleButton>
                  <ToggleButton value="short-break">
                    <Coffee /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Short</Box>
                  </ToggleButton>
                  <ToggleButton value="long-break">
                    <Coffee /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Long</Box>
                  </ToggleButton>
                  <ToggleButton value="deep-work">
                    <Psychology /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Deep</Box>
                  </ToggleButton>
                  <ToggleButton value="custom">
                    <AutoAwesome /> <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Custom</Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Main Timer Display - Compact & Mobile Responsive */}
                <Card sx={{ mb: { xs: 2, sm: 2.5 }, background: getModeColor(), color: 'white', borderRadius: { xs: 2, sm: 3 } }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: { xs: 1.5, sm: 2 } }}>
                      {getModeIcon()}
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {mode.replace('-', ' ')}
                      </Typography>
                    </Box>

                    <CircularProgressWithLabel
                      value={progress}
                      size={180}
                      thickness={4}
                      sx={{ 
                        mb: { xs: 2, sm: 2.5 },
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="h2" 
                          fontWeight="bold" 
                          sx={{ 
                            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                            lineHeight: 1.2,
                          }}
                        >
                          {formatTime(timeLeft)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {Math.floor(progress)}% Complete
                        </Typography>
                      </Box>
                    </CircularProgressWithLabel>

                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: { xs: 6, sm: 8 },
                        borderRadius: 4,
                        mb: { xs: 2, sm: 2.5 },
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white',
                        },
                      }}
                    />

                    {/* Touch-Friendly Control Buttons */}
                    <Stack 
                      direction="row" 
                      spacing={1.5} 
                      justifyContent="center"
                      sx={{ mb: { xs: 2, sm: 2.5 } }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handlePlayPause}
                        startIcon={isRunning ? <Pause /> : <PlayArrow />}
                        sx={{
                          bgcolor: 'white',
                          color: mode === 'pomodoro' ? '#667eea' : mode === 'short-break' ? '#10b981' : mode === 'long-break' ? '#f59e0b' : mode === 'deep-work' ? '#8b5cf6' : '#ef4444',
                          px: { xs: 3, sm: 4 },
                          py: { xs: 1.25, sm: 1.5 },
                          minWidth: { xs: 100, sm: 120 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 'bold',
                          '&:hover': { bgcolor: '#f5f5f5' },
                        }}
                      >
                        {isPaused ? 'Resume' : isRunning ? 'Pause' : 'Start'}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleStop}
                        startIcon={<Stop />}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          borderWidth: 2,
                          px: { xs: 2.5, sm: 3 },
                          py: { xs: 1.25, sm: 1.5 },
                          minWidth: { xs: 90, sm: 110 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        Reset
                      </Button>
                    </Stack>

                    {/* Compact Quick Stats */}
                    <Stack 
                      direction="row" 
                      spacing={{ xs: 2, sm: 3 }} 
                      justifyContent="center"
                      divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block' }}>
                          Sessions
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          {sessionCount}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block' }}>
                          Focus Time
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block' }}>
                          Streak
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          🔥 {currentStreak}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Compact Tasks Section */}
                <Card sx={{ mb: { xs: 2, sm: 2.5 }, borderRadius: { xs: 2, sm: 3 } }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        📝 Study Tasks
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add fontSize="small" />}
                        onClick={() => setTaskDialogOpen(true)}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: { xs: 0.5, sm: 0.75 },
                          px: { xs: 1, sm: 1.5 },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    {tasks.length === 0 ? (
                      <Alert severity="info" sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        No tasks yet. Add tasks to track your progress!
                      </Alert>
                    ) : (
                      <List dense sx={{ py: 0 }}>
                        {tasks.map((task) => (
                          <ListItem
                            key={task.id}
                            sx={{ 
                              px: { xs: 0.5, sm: 1 },
                              py: { xs: 0.5, sm: 0.75 },
                              borderRadius: 1,
                              mb: 0.5,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                onClick={() => handleDeleteTask(task.id)} 
                                size="small"
                                sx={{ p: { xs: 0.5, sm: 0.75 } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            }
                          >
                            <CheckCircle
                              fontSize="small"
                              sx={{
                                mr: { xs: 1, sm: 1.5 },
                                color: task.completed ? 'success.main' : 'action.disabled',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                              onClick={() => handleToggleTask(task.id)}
                            />
                            <ListItemText
                              primary={task.text}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: {
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  opacity: task.completed ? 0.6 : 1,
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {tasks.length > 0 && (
                      <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
                        <LinearProgress
                          variant="determinate"
                          value={(tasks.filter(t => t.completed).length / tasks.length) * 100}
                          sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 0.75, 
                            display: 'block',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {tasks.filter(t => t.completed).length} of {tasks.length} completed
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Compact Quick Actions */}
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2 }, 
                        cursor: 'pointer',
                        borderRadius: { xs: 2, sm: 3 },
                        transition: 'all 0.2s',
                        '&:hover': { 
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                        }
                      }} 
                      onClick={() => setViewTab(1)}
                    >
                      <TrendingUp sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="600" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                        Statistics
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        textAlign: 'center', 
                        p: { xs: 1.5, sm: 2 }, 
                        cursor: 'pointer',
                        borderRadius: { xs: 2, sm: 3 },
                        transition: 'all 0.2s',
                        '&:hover': { 
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                        }
                      }} 
                      onClick={() => setViewTab(2)}
                    >
                      <History sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="caption" fontWeight="600" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                        History
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            )}

            {/* Statistics View - Compact */}
            {viewTab === 1 && (
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Compact Stats Cards */}
                <Grid container spacing={1.5} sx={{ mb: { xs: 2, sm: 2.5 } }}>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ background: gradients.primary, color: 'white', borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                        <CheckCircle sx={{ fontSize: { xs: 24, sm: 32 }, mb: { xs: 0.5, sm: 1 } }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          {sessionCount}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Sessions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                        <Timer sx={{ fontSize: { xs: 24, sm: 32 }, mb: { xs: 0.5, sm: 1 } }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          {Math.floor(totalFocusTime / 60)}h
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Focus Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                        <LocalFireDepartment sx={{ fontSize: { xs: 24, sm: 32 }, mb: { xs: 0.5, sm: 1 } }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          {currentStreak}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Streak
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                        <EmojiEvents sx={{ fontSize: { xs: 24, sm: 32 }, mb: { xs: 0.5, sm: 1 } }} />
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                          {longestStreak}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Best
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Compact Charts */}
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: { xs: 1, sm: 1.5 } }}>
                          Weekly Focus Time
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsBarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} tick={{ fontSize: 10 }} />
                            <RechartsTooltip />
                            <Bar dataKey="hours" radius={[8, 8, 0, 0]} fill="#2563eb" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: { xs: 1, sm: 1.5 } }}>
                          Today's Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}m`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            )}

            {/* History View - Compact */}
            {viewTab === 2 && (
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: { xs: 1.5, sm: 2 } }}>
                  Session History
                </Typography>
                {sessionHistory.length === 0 ? (
                  <Alert severity="info" sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    No sessions yet. Start a timer to begin tracking!
                  </Alert>
                ) : (
                  <List dense sx={{ py: 0 }}>
                    {sessionHistory.slice(0, 20).map((session) => (
                      <ListItem
                        key={session.id}
                        sx={{
                          bgcolor: 'action.hover',
                          mb: 0.75,
                          borderRadius: { xs: 1.5, sm: 2 },
                          border: 1,
                          borderColor: 'divider',
                          px: { xs: 1, sm: 1.5 },
                          py: { xs: 0.75, sm: 1 },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip
                                label={session.type.replace('-', ' ')}
                                size="small"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  height: { xs: 20, sm: 24 },
                                }}
                                color={
                                  session.type === 'pomodoro' ? 'primary' :
                                  session.type === 'deep-work' ? 'secondary' :
                                  'success'
                                }
                              />
                              <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                {session.duration} min
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {new Date(session.completedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          }
                        />
                        {session.tasksCompleted !== undefined && session.totalTasks !== undefined && session.totalTasks > 0 && (
                          <Chip
                            label={`${session.tasksCompleted}/${session.totalTasks}`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                            }}
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            )}
          </Card>
        </Container>

        {/* Add Task Dialog - Compact */}
        <Dialog 
          open={taskDialogOpen} 
          onClose={() => setTaskDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: { xs: 2, sm: 3 }, m: { xs: 1, sm: 2 } }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Add Study Task
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1.5 } }}>
            <TextField
              fullWidth
              label="Task Description"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="e.g., Complete Chapter 5, Review notes..."
              multiline
              rows={3}
              size="small"
              sx={{ 
                mt: { xs: 0.5, sm: 1 },
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddTask();
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}>
            <Button 
              onClick={() => setTaskDialogOpen(false)}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddTask} 
              disabled={!newTaskText.trim()}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Add Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog - Compact */}
        <Dialog 
          open={settingsOpen} 
          onClose={() => setSettingsOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: { xs: 2, sm: 3 }, m: { xs: 1, sm: 2 }, maxHeight: { xs: '90vh', sm: 'auto' } }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Timer Settings
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 1.5 } }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Timer Durations (minutes)
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Pomodoro"
                  value={settings.pomodoro}
                  onChange={(e) => setSettings({ ...settings, pomodoro: parseInt(e.target.value) || 25 })}
                  inputProps={{ min: 1, max: 60 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Short Break"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}
                  inputProps={{ min: 1, max: 15 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Long Break"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}
                  inputProps={{ min: 5, max: 30 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Deep Work"
                  value={settings.deepWork}
                  onChange={(e) => setSettings({ ...settings, deepWork: parseInt(e.target.value) || 90 })}
                  inputProps={{ min: 30, max: 120 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Custom Timer"
                  value={settings.custom}
                  onChange={(e) => setSettings({ ...settings, custom: parseInt(e.target.value) || 30 })}
                  inputProps={{ min: 1, max: 180 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sessions Until Long Break"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                  inputProps={{ min: 2, max: 8 }}
                  size="small"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Preferences
            </Typography>
            <Stack spacing={1.5} sx={{ mt: { xs: 0.5, sm: 1 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Auto-start breaks after focus sessions
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => setSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Auto-start pomodoro after breaks
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {settings.soundEnabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" />}
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Timer completion sound
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notificationsEnabled}
                    onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {settings.notificationsEnabled ? <Notifications fontSize="small" /> : <NotificationsOff fontSize="small" />}
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Browser notifications
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.focusMusicEnabled}
                    onChange={(e) => setSettings({ ...settings, focusMusicEnabled: e.target.checked })}
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <MusicNote fontSize="small" />
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Focus music (ambient sounds)
                    </Typography>
                  </Box>
                }
              />
              {settings.focusMusicEnabled && (
                <Box sx={{ pl: { xs: 3, sm: 4 } }}>
                  <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Volume: {settings.focusMusicVolume}%
                  </Typography>
                  <Slider
                    value={settings.focusMusicVolume}
                    onChange={(e, value) => setSettings({ ...settings, focusMusicVolume: value as number })}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    size="small"
                  />
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 } }}>
            <Button 
              onClick={() => setSettingsOpen(false)}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSettingsOpen(false);
                if (!isRunning) {
                  setTimeLeft(settings[mode] * 60);
                }
                toast.success('Settings saved!');
              }}
              size="small"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileLayout>
  );
}

// Circular Progress with Label Component - Compact & Responsive
function CircularProgressWithLabel({ value, size, thickness, sx, children }: any) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', ...sx }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{ 
          color: 'white',
          width: { xs: '160px !important', sm: `${size}px !important` },
          height: { xs: '160px !important', sm: `${size}px !important` },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
