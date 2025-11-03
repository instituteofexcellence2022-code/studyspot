import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Schedule,
  CalendarMonth,
  Timer,
  TrendingUp,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/StudyFocusedLayout';
import api from '../services/api';

interface AttendancePageProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function AttendancePage({ setIsAuthenticated }: AttendancePageProps) {
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    averageSessionDuration: 0,
    currentStreak: 0,
    longestStreak: 0,
    thisMonth: 0,
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6.0 },
    { day: 'Wed', hours: 5.5 },
    { day: 'Thu', hours: 7.0 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 8.0 },
    { day: 'Sun', hours: 5.0 },
  ]);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/api/attendance/history');
      setAttendanceHistory(response.data.sessions || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      // Mock data
      setAttendanceHistory([
        {
          id: 1,
          libraryName: 'Central Library',
          checkInTime: '2025-11-03T10:00:00',
          checkOutTime: '2025-11-03T14:30:00',
          duration: 270,
          seatNumber: 'A-15',
          date: '2025-11-03',
        },
        {
          id: 2,
          libraryName: 'Tech Hub Library',
          checkInTime: '2025-11-02T14:00:00',
          checkOutTime: '2025-11-02T18:00:00',
          duration: 240,
          seatNumber: 'B-23',
          date: '2025-11-02',
        },
        {
          id: 3,
          libraryName: 'Green Study Center',
          checkInTime: '2025-11-01T09:00:00',
          checkOutTime: '2025-11-01T13:00:00',
          duration: 240,
          seatNumber: 'C-08',
          date: '2025-11-01',
        },
      ]);

      setStats({
        totalSessions: 45,
        totalHours: 180,
        averageSessionDuration: 4.0,
        currentStreak: 7,
        longestStreak: 15,
        thisMonth: 32,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const statsCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2563eb',
    },
    {
      title: 'Total Hours',
      value: stats.totalHours,
      icon: <Timer sx={{ fontSize: 40 }} />,
      color: '#10b981',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
    },
    {
      title: 'This Month',
      value: `${stats.thisMonth}h`,
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
    },
  ];

  if (loading) {
    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Attendance 📊
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: card.color, mr: 2 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Weekly Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Study Time This Week
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} hours`, 'Study Time']} />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours >= 6 ? '#10b981' : '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
                <Typography variant="caption">6+ hours</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#2563eb', borderRadius: 1 }} />
                <Typography variant="caption">{'< 6 hours'}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Recent Sessions
        </Typography>

        {attendanceHistory.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No attendance records yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check in at a library to start tracking your attendance
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {attendanceHistory.map((session) => (
              <Grid item xs={12} key={session.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="h6" fontWeight="bold">
                          {session.libraryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(session.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {new Date(session.checkInTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Check-in
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle fontSize="small" color="success" />
                          <Box>
                            <Typography variant="body2">
                              {new Date(session.checkOutTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Check-out
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={formatDuration(session.duration)}
                          color="primary"
                          icon={<Timer />}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}

