import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  CheckCircle as ValidateIcon,
  CloudDownload as ExportIcon,
  CloudUpload as IngestIcon,
  DataObject as DataObjectIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Stop as StopIcon,
  Storage as StorageIcon,
  Transform as TransformIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon

  } from '@mui/icons-material';
import { useServiceManagement } from '../../hooks/useServiceManagement';

const DataPipelineServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use real Data Pipeline service hook
  const {
    status,
    metrics,
    error,
    serviceControl,
    refresh,
    refreshMetrics} = useServiceManagement('dataPipeline');

  // Mock data for data jobs
  const [jobs, setJobs] = useState([
    {
      id: '1',
      name: 'User Data ETL',
      type: 'etl',
      status: 'running',
      source: 'PostgreSQL',
      destination: 'Data Warehouse',
      recordsProcessed: 125000,
      totalRecords: 150000,
      startTime: '2024-01-15 10:30:00',
      lastRun: '2024-01-15 10:30:00',
      nextRun: '2024-01-15 11:30:00'},
    {
      id: '2',
      name: 'Analytics Data Sync',
      type: 'sync',
      status: 'completed',
      source: 'MongoDB',
      destination: 'Analytics DB',
      recordsProcessed: 50000,
      totalRecords: 50000,
      startTime: '2024-01-15 09:00:00',
      lastRun: '2024-01-15 09:45:00',
      nextRun: '2024-01-16 09:00:00'},
    {
      id: '3',
      name: 'Log Data Processing',
      type: 'processing',
      status: 'failed',
      source: 'Log Files',
      destination: 'Elasticsearch',
      recordsProcessed: 0,
      totalRecords: 10000,
      startTime: '2024-01-15 08:00:00',
      lastRun: '2024-01-15 08:15:00',
      nextRun: '2024-01-15 12:00:00'},
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

  const handleCreateJob = async (jobData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        status: 'pending',
        recordsProcessed: 0,
        startTime: new Date().toISOString(),
        lastRun: null,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()};
      setJobs(prev => [...prev, newJob]);
      alert('Data job created successfully!');
      setCreateJobOpen(false);
    } catch (err) {
      alert(`Failed to create job: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            Data Pipeline Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage data ingestion, transformation, and processing jobs
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
            onClick={() => setCreateJobOpen(true)}
          >
            Create Job
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
                  <DataObjectIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Jobs</Typography>
                  <Typography variant="h4" color="primary">
                    {jobs.filter((j: any) => j.status === 'running').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {jobs.length} jobs
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <IngestIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Records Processed</Typography>
                  <Typography variant="h4" color="primary">
                    {jobs.reduce((acc, j) => acc + j.recordsProcessed, 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Today: {metrics?.totalRequests || 0}
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
                  <TransformIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Processing Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.responseTime || 0} rec/sec
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Average processing speed
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <ValidateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.errorRate ? (100 - metrics.errorRate).toFixed(1) : 95.8}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.errorRate ? (100 - metrics.errorRate) : 95.8} 
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
            <Tab label="Data Jobs" />
            <Tab label="Performance" />
            <Tab label="Monitoring" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Data Jobs Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Data Processing Jobs</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateJobOpen(true)}
                >
                  Create Job
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.type.toUpperCase()} 
                            color={
                              job.type === 'etl' ? 'primary' : 
                              job.type === 'sync' ? 'secondary' : 
                              'success'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.status} 
                            color={
                              job.status === 'running' ? 'success' : 
                              job.status === 'completed' ? 'primary' : 
                              'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{job.source}</TableCell>
                        <TableCell>{job.destination}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {job.totalRecords > 0 ? Math.round((job.recordsProcessed / job.totalRecords) * 100) : 0}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={job.totalRecords > 0 ? (job.recordsProcessed / job.totalRecords) * 100 : 0} 
                              sx={{ width: 100, height: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
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
                      <TableCell>Processing Speed</TableCell>
                      <TableCell>{metrics?.responseTime || 0} records/sec</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+18%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Throughput</TableCell>
                      <TableCell>{metrics?.activeConnections || 0} jobs/min</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+12%</Typography>
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
                          <Typography variant="body2" color="success.main">-7%</Typography>
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

          {/* Monitoring Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>System Monitoring</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StorageIcon sx={{ mr: 2, color: '#6366f1' }} />
                      <Typography variant="h6">Storage Usage</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">67%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      2.1TB of 3.2TB used
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 2, color: '#10b981' }} />
                      <Typography variant="h6">Scheduled Jobs</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">24</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next run in 2h 15m
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AnalyticsIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Typography variant="h6">Data Quality</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">94.2%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validation success rate
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HistoryIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                      <Typography variant="h6">Job History</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">1,247</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jobs completed today
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Job Dialog */}
      <Dialog
        open={createJobOpen}
        onClose={() => setCreateJobOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Data Processing Job
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Job Name"
              fullWidth
              variant="outlined"
              id="job-name"
            />
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select label="Job Type" id="job-type">
                <MenuItem value="etl">ETL (Extract, Transform, Load)</MenuItem>
                <MenuItem value="sync">Data Synchronization</MenuItem>
                <MenuItem value="processing">Data Processing</MenuItem>
                <MenuItem value="migration">Data Migration</MenuItem>
                <MenuItem value="validation">Data Validation</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Source System"
              fullWidth
              variant="outlined"
              id="source-system"
            />
            <TextField
              label="Destination System"
              fullWidth
              variant="outlined"
              id="destination-system"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              id="job-description"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateJobOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('job-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('job-type') as HTMLSelectElement)?.value;
              const source = (document.getElementById('source-system') as HTMLInputElement)?.value;
              const destination = (document.getElementById('destination-system') as HTMLInputElement)?.value;
              const description = (document.getElementById('job-description') as HTMLInputElement)?.value;
              
              if (!name || !type || !source || !destination) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateJob({
                name,
                type,
                source,
                destination,
                description});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataPipelineServiceManagement;