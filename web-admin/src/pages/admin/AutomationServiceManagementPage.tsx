import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AutomationIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon,
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
  Task as TaskIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon

  } from '@mui/icons-material';
import { useServiceManagement } from '../../hooks/useServiceManagement';

const AutomationServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [scheduleTaskOpen, setScheduleTaskOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use real Automation service hook
  const {
    status,
    metrics,
    error,
    serviceControl,
    refresh,
    refreshMetrics} = useServiceManagement('automation');

  // Mock data for workflows and tasks
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'User Registration Workflow',
      description: 'Automated workflow for new user registration',
      status: 'active',
      triggers: ['user_signup'],
      steps: 5,
      executions: 1247,
      lastRun: '2024-01-15 10:30:00',
      successRate: 98.5},
    {
      id: '2',
      name: 'Payment Processing Workflow',
      description: 'Automated payment processing and confirmation',
      status: 'active',
      triggers: ['payment_initiated'],
      steps: 8,
      executions: 3421,
      lastRun: '2024-01-15 11:45:00',
      successRate: 99.2},
    {
      id: '3',
      name: 'Data Backup Workflow',
      description: 'Scheduled daily data backup process',
      status: 'paused',
      triggers: ['schedule_daily'],
      steps: 3,
      executions: 365,
      lastRun: '2024-01-14 02:00:00',
      successRate: 100},
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      name: 'Send Welcome Email',
      type: 'email',
      status: 'completed',
      priority: 'high',
      scheduledAt: '2024-01-15 09:00:00',
      completedAt: '2024-01-15 09:02:00',
      duration: '2m'},
    {
      id: '2',
      name: 'Process Payment Refund',
      type: 'payment',
      status: 'running',
      priority: 'medium',
      scheduledAt: '2024-01-15 10:15:00',
      completedAt: null,
      duration: '5m'},
    {
      id: '3',
      name: 'Generate Monthly Report',
      type: 'report',
      status: 'pending',
      priority: 'low',
      scheduledAt: '2024-01-16 00:00:00',
      completedAt: null,
      duration: '15m'},
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

  const handleCreateWorkflow = async (workflowData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newWorkflow = {
        id: Date.now().toString(),
        ...workflowData,
        status: 'active',
        steps: 0,
        executions: 0,
        lastRun: null,
        successRate: 0};
      setWorkflows(prev => [...prev, newWorkflow]);
      alert('Workflow created successfully!');
      setCreateWorkflowOpen(false);
    } catch (err) {
      alert(`Failed to create workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTask = {
        id: Date.now().toString(),
        ...taskData,
        status: 'pending',
        completedAt: null,
        duration: '0m'};
      setTasks(prev => [...prev, newTask]);
      alert('Task created successfully!');
      setCreateTaskOpen(false);
    } catch (err) {
      alert(`Failed to create task: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setWorkflows(prev => prev.map((w: any) => 
        w.id === workflowId 
          ? { ...w, executions: w.executions + 1, lastRun: new Date().toISOString() }
          : w
      ));
      alert('Workflow executed successfully!');
    } catch (err) {
      alert(`Failed to execute workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            Automation Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage workflows, tasks, and automation processes
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
            onClick={() => setCreateWorkflowOpen(true)}
          >
            Create Workflow
          </Button>
          <Button
            variant="outlined"
            startIcon={<TaskIcon />}
            onClick={() => setCreateTaskOpen(true)}
          >
            Create Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleTaskOpen(true)}
          >
            Schedule Task
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
                  <AutomationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Workflows</Typography>
                  <Typography variant="h4" color="primary">
                    {workflows.filter((w: any) => w.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {workflows.length} workflows
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <TaskIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Tasks Executed</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.totalRequests || 0}
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Success Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {workflows.length > 0 ? Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length) : 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Average across workflows
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Scheduled Tasks</Typography>
                  <Typography variant="h4" color="primary">
                    {tasks.filter((t: any) => t.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(tasks.filter((t: any) => t.status === 'completed').length / tasks.length) * 100} 
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
            <Tab label="Workflows" />
            <Tab label="Tasks" />
            <Tab label="Schedules" />
            <Tab label="Performance" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Workflows Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Automation Workflows</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateWorkflowOpen(true)}
                >
                  Create Workflow
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {workflows.map((workflow) => (
                  <Card key={workflow.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{workflow.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{workflow.triggers.join(', ')}</Typography>
                        </Box>
                        <Chip
                          label={workflow.status}
                          color={workflow.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {workflow.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Steps</Typography>
                          <Typography variant="body1">{workflow.steps}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Executions</Typography>
                          <Typography variant="body1">{workflow.executions}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                          <Typography variant="body1">{workflow.successRate}%</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkflow(workflow);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteWorkflow(workflow.id);
                          }}
                          disabled={isLoading}
                        >
                          <PlayIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkflow(workflow);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Tasks Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Automation Tasks</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Scheduled At</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status} 
                            color={
                              task.status === 'completed' ? 'success' : 
                              task.status === 'running' ? 'primary' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority} 
                            color={
                              task.priority === 'high' ? 'error' : 
                              task.priority === 'medium' ? 'warning' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{task.scheduledAt}</TableCell>
                        <TableCell>{task.duration}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Schedules Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Scheduled Tasks</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 2, color: '#6366f1' }} />
                      <Typography variant="h6">Daily Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 10) + 5} scheduled
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 2, color: '#10b981' }} />
                      <Typography variant="h6">Weekly Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 5) + 2} scheduled
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Typography variant="h6">Monthly Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 3) + 1} scheduled
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                      <Typography variant="h6">Custom Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 8) + 3} scheduled
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Performance Tab */}
          {activeTab === 3 && (
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
                      <TableCell>Workflow Execution Time</TableCell>
                      <TableCell>{metrics?.responseTime || 0}ms</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-12%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Task Processing Rate</TableCell>
                      <TableCell>{metrics?.activeConnections || 0} tasks/min</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+8%</Typography>
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
                          <Typography variant="body2" color="success.main">-3%</Typography>
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
        </CardContent>
      </Card>

      {/* Create Workflow Dialog */}
      <Dialog
        open={createWorkflowOpen}
        onClose={() => setCreateWorkflowOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Workflow
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Workflow Name"
              fullWidth
              variant="outlined"
              id="workflow-name"
            />
            <FormControl fullWidth>
              <InputLabel>Trigger Type</InputLabel>
              <Select label="Trigger Type" id="trigger-type">
                <MenuItem value="user_signup">User Signup</MenuItem>
                <MenuItem value="payment_initiated">Payment Initiated</MenuItem>
                <MenuItem value="schedule_daily">Daily Schedule</MenuItem>
                <MenuItem value="schedule_weekly">Weekly Schedule</MenuItem>
                <MenuItem value="api_call">API Call</MenuItem>
                <MenuItem value="webhook">Webhook</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              id="workflow-description"
            />
            <FormControlLabel
              control={<Switch defaultChecked id="is-active" />}
              label="Activate Workflow"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateWorkflowOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('workflow-name') as HTMLInputElement)?.value;
              const triggerType = (document.getElementById('trigger-type') as HTMLSelectElement)?.value;
              const description = (document.getElementById('workflow-description') as HTMLInputElement)?.value;
              const isActive = (document.getElementById('is-active') as HTMLInputElement)?.checked;
              
              if (!name || !triggerType) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateWorkflow({
                name,
                triggers: [triggerType],
                description,
                status: isActive ? 'active' : 'paused'});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Task
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Task Name"
              fullWidth
              variant="outlined"
              id="task-name"
            />
            <FormControl fullWidth>
              <InputLabel>Task Type</InputLabel>
              <Select label="Task Type" id="task-type">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="report">Report</MenuItem>
                <MenuItem value="notification">Notification</MenuItem>
                <MenuItem value="data_processing">Data Processing</MenuItem>
                <MenuItem value="api_call">API Call</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" id="task-priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              id="task-description"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('task-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('task-type') as HTMLSelectElement)?.value;
              const priority = (document.getElementById('task-priority') as HTMLSelectElement)?.value;
              const description = (document.getElementById('task-description') as HTMLInputElement)?.value;
              
              if (!name || !type || !priority) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateTask({
                name,
                type,
                priority,
                description,
                scheduledAt: new Date().toISOString()});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationServiceManagement;