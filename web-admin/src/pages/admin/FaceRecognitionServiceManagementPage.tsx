import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import { useServiceManagement } from '../../hooks/useServiceManagement';

const FaceRecognitionServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createEnrollmentOpen, setCreateEnrollmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use real Face Recognition service hook
  const {
    status,
    metrics,
    error,
    serviceControl,
    refresh,
    refreshMetrics} = useServiceManagement('faceRecognition');

  // Mock data for face enrollments
  const [enrollments, setEnrollments] = useState([
    {
      id: '1',
      userId: 'user123',
      name: 'John Doe',
      status: 'enrolled',
      confidence: 95.8,
      enrolledAt: '2024-01-15 10:30:00',
      lastUsed: '2024-01-15 14:20:00'},
    {
      id: '2',
      userId: 'user456',
      name: 'Jane Smith',
      status: 'enrolled',
      confidence: 92.3,
      enrolledAt: '2024-01-14 09:15:00',
      lastUsed: '2024-01-15 11:45:00'},
    {
      id: '3',
      userId: 'user789',
      name: 'Mike Johnson',
      status: 'pending',
      confidence: 0,
      enrolledAt: '2024-01-15 16:45:00',
      lastUsed: null},
  ]);

  useEffect(() => {
    refresh();
    refreshMetrics();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = async () => {
    try {
      await refresh();
      await refreshMetrics();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const handleCreateEnrollment = async (enrollmentData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newEnrollment = {
        id: Date.now().toString(),
        ...enrollmentData,
        status: 'pending',
        confidence: 0,
        enrolledAt: new Date().toISOString(),
        lastUsed: null};
      setEnrollments(prev => [...prev, newEnrollment]);
      alert('Face enrollment created successfully!');
      setCreateEnrollmentOpen(false);
    } catch (err) {
      alert(`Failed to create enrollment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceControl = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setIsLoading(true);
      switch (action) {
        case 'start':
          await serviceControl.start();
          break;
        case 'stop':
          await serviceControl.stop();
          break;
        case 'restart':
          await serviceControl.restart();
          break;
      }
      alert(`Service ${action}ed successfully!`);
      await refreshData();
    } catch (err) {
      alert(`Failed to ${action} service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Face Recognition Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage face enrollment, detection, and recognition systems
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => handleServiceControl('restart')}
            disabled={isLoading}
            color="warning"
          >
            Restart Service
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateEnrollmentOpen(true)}
          >
            Add Enrollment
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <FaceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Enrolled Faces</Typography>
                  <Typography variant="h4" color="primary">
                    {enrollments.filter((e: any) => e.status === 'enrolled').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {enrollments.length} enrollments
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <VerifiedUserIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Recognition Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.totalRequests || 0}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Active: {metrics?.activeConnections || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Avg Confidence</Typography>
                  <Typography variant="h4" color="primary">
                    {enrollments.length > 0 ? Math.round(enrollments.reduce((acc, e) => acc + e.confidence, 0) / enrollments.length) : 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Recognition accuracy
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <AnalyticsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Error Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.errorRate || 0}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.errorRate || 0} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Service Status</Typography>
            <Chip
              label={status.status}
              color={status.status === 'healthy' ? 'success' : 'error'}
              icon={status.status === 'healthy' ? <CheckIcon /> : <ErrorIcon />}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Uptime</Typography>
              <Typography variant="body1">{status.uptime || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Version</Typography>
              <Typography variant="body1">{status.version || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{metrics?.lastUpdated || 'N/A'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Enrollments" />
            <Tab label="Performance" />
            <Tab label="Security" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Enrollments Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Face Enrollments</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateEnrollmentOpen(true)}
                >
                  Add Enrollment
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Enrolled At</TableCell>
                      <TableCell>Last Used</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{enrollment.userId}</TableCell>
                        <TableCell>{enrollment.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={enrollment.status} 
                            color={enrollment.status === 'enrolled' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>{enrollment.confidence}%</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollment.confidence} 
                              sx={{ width: 50, height: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(enrollment.enrolledAt).toLocaleString()}</TableCell>
                        <TableCell>{enrollment.lastUsed ? new Date(enrollment.lastUsed).toLocaleString() : 'Never'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Performance Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Trend</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Recognition Speed</TableCell>
                      <TableCell>{metrics?.responseTime || 0}ms</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-25%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Throughput</TableCell>
                      <TableCell>{metrics?.activeConnections || 0} faces/sec</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+15%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Good" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Error Rate</TableCell>
                      <TableCell>{metrics?.errorRate || 0}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-8%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Good" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Security Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Security Monitoring</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SecurityIcon sx={{ mr: 2, color: '#6366f1' }} />
                      <Typography variant="h6">Security Score</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">98.5%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      High security rating
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VerifiedUserIcon sx={{ mr: 2, color: '#10b981' }} />
                      <Typography variant="h6">Verified Users</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">2,847</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successfully verified today
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Typography variant="h6">Failed Attempts</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">23</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Security alerts today
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HistoryIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                      <Typography variant="h6">Audit Logs</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">15,432</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Events logged today
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Enrollment Dialog */}
      <Dialog
        open={createEnrollmentOpen}
        onClose={() => setCreateEnrollmentOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Face Enrollment
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="User ID"
              fullWidth
              variant="outlined"
              id="user-id"
            />
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              id="user-name"
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              type="email"
              id="user-email"
            />
            <TextField
              label="Department"
              fullWidth
              variant="outlined"
              id="user-department"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEnrollmentOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const userId = (document.getElementById('user-id') as HTMLInputElement)?.value;
              const name = (document.getElementById('user-name') as HTMLInputElement)?.value;
              const email = (document.getElementById('user-email') as HTMLInputElement)?.value;
              const department = (document.getElementById('user-department') as HTMLInputElement)?.value;
              
              if (!userId || !name || !email) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateEnrollment({
                userId,
                name,
                email,
                department});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FaceRecognitionServiceManagement;