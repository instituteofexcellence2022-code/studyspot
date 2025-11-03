import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Timer,
  MenuBook,
  LocalFireDepartment,
  EmojiEvents,
  School,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

export default function AnalyticsPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Subject-wise study time data
  const subjectData = [
    { subject: 'Mathematics', hours: 45, progress: 75, target: 60, color: '#667eea' },
    { subject: 'Physics', hours: 38, progress: 63, target: 60, color: '#764ba2' },
    { subject: 'Chemistry', hours: 42, progress: 70, target: 60, color: '#f093fb' },
    { subject: 'English', hours: 25, progress: 62, target: 40, color: '#4facfe' },
    { subject: 'Biology', hours: 30, progress: 60, target: 50, color: '#43e97b' },
  ];

  // Weekly study time trend
  const weeklyData = [
    { day: 'Mon', hours: 6, focus: 85, breaks: 3 },
    { day: 'Tue', hours: 7, focus: 90, breaks: 2 },
    { day: 'Wed', hours: 5, focus: 75, breaks: 4 },
    { day: 'Thu', hours: 8, focus: 95, breaks: 2 },
    { day: 'Fri', hours: 6, focus: 80, breaks: 3 },
    { day: 'Sat', hours: 9, focus: 92, breaks: 2 },
    { day: 'Sun', hours: 4, focus: 70, breaks: 5 },
  ];

  // Productivity metrics
  const productivityData = [
    { metric: 'Focus', score: 85 },
    { metric: 'Consistency', score: 92 },
    { metric: 'Goal Achievement', score: 78 },
    { metric: 'Time Management', score: 88 },
    { metric: 'Attendance', score: 95 },
    { metric: 'Resource Usage', score: 70 },
  ];

  // Study session distribution
  const sessionData = [
    { name: 'Morning (6AM-12PM)', value: 35, sessions: 42 },
    { name: 'Afternoon (12PM-6PM)', value: 40, sessions: 48 },
    { name: 'Evening (6PM-11PM)', value: 25, sessions: 30 },
  ];

  const stats = {
    totalHours: 180,
    avgDaily: 6.4,
    focusScore: 85,
    streak: 12,
    rank: 145,
    totalStudents: 1250,
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📊 Study Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your study patterns and productivity insights
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{stats.totalHours}h</Typography>
                    <Typography variant="body2">Total Study Time</Typography>
                  </Box>
                  <Timer sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{stats.avgDaily}h</Typography>
                    <Typography variant="body2">Avg. Daily</Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{stats.focusScore}%</Typography>
                    <Typography variant="body2">Focus Score</Typography>
                  </Box>
                  <LocalFireDepartment sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">{stats.streak}</Typography>
                    <Typography variant="body2">Day Streak 🔥</Typography>
                  </Box>
                  <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Subject-wise" />
          <Tab label="Time Trends" />
          <Tab label="Productivity" />
          <Tab label="Comparison" />
        </Tabs>

        {/* Tab 1: Subject-wise Analysis */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Study Hours by Subject
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#667eea" />
                      <Bar dataKey="target" fill="#e0e0e0" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Subject Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        dataKey="hours"
                        nameKey="subject"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Subject Progress
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Hours Studied</TableCell>
                          <TableCell>Target</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subjectData.map((subject) => (
                          <TableRow key={subject.subject}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: subject.color }} />
                                {subject.subject}
                              </Box>
                            </TableCell>
                            <TableCell>{subject.hours}h</TableCell>
                            <TableCell>{subject.target}h</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={subject.progress} 
                                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2">{subject.progress}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={subject.progress >= 100 ? 'Completed' : subject.progress >= 75 ? 'On Track' : 'Needs Focus'} 
                                size="small"
                                color={subject.progress >= 100 ? 'success' : subject.progress >= 75 ? 'primary' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Time Trends */}
        {tab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Weekly Study Hours
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hours" stroke="#667eea" strokeWidth={3} name="Study Hours" />
                      <Line type="monotone" dataKey="focus" stroke="#43e97b" strokeWidth={2} name="Focus Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Study Session Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sessionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.value}%`}
                      >
                        {sessionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Daily Breakdown
                  </Typography>
                  {sessionData.map((session, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{session.name}</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {session.sessions} sessions • {session.value}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={session.value} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': { bgcolor: COLORS[index] }
                        }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab 3: Productivity */}
        {tab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Productivity Radar
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={productivityData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Your Score" dataKey="score" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Productivity Metrics
                  </Typography>
                  {productivityData.map((metric, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{metric.metric}</Typography>
                        <Typography variant="body2" fontWeight="600">{metric.score}/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={metric.score} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': { 
                            background: metric.score >= 80 ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : 
                                       metric.score >= 60 ? 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)' :
                                       'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                          }
                        }}
                      />
                    </Box>
                  ))}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">Overall Score</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {Math.round(productivityData.reduce((sum, m) => sum + m.score, 0) / productivityData.length)}%
                    </Typography>
                    <Chip label="Excellent" sx={{ bgcolor: 'white', color: 'primary.main', mt: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab 4: Comparison */}
        {tab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Your Rank
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h1" fontWeight="bold" color="primary.main">
                      #{stats.rank}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      out of {stats.totalStudents} students
                    </Typography>
                    <Chip 
                      label="Top 12%" 
                      color="success" 
                      sx={{ fontSize: 16, px: 2, py: 1, height: 'auto' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Comparison with Average
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { metric: 'Study Hours', you: 180, avg: 140 },
                      { metric: 'Focus Score', you: 85, avg: 72 },
                      { metric: 'Attendance', you: 95, avg: 78 },
                      { metric: 'Resources', you: 25, avg: 18 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="you" fill="#667eea" name="You" />
                      <Bar dataKey="avg" fill="#e0e0e0" name="Average" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Weekly Comparison
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData.map((day, i) => ({
                      ...day,
                      avgHours: [5, 5.5, 6, 6.5, 5.5, 7, 4][i],
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="hours" stroke="#667eea" strokeWidth={3} name="Your Hours" />
                      <Line type="monotone" dataKey="avgHours" stroke="#e0e0e0" strokeWidth={2} strokeDasharray="5 5" name="Avg. Hours" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Personalized Recommendations */}
        <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              💡 Personalized Recommendations
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>📚 Focus Area</Typography>
                  <Typography variant="body2">
                    Increase English study time by 30% to reach your target
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>⏰ Best Time</Typography>
                  <Typography variant="body2">
                    Your focus is highest on Thursday afternoons (95% score)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>🎯 Improvement</Typography>
                  <Typography variant="body2">
                    Take more breaks on Wednesday to improve focus score
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
}

