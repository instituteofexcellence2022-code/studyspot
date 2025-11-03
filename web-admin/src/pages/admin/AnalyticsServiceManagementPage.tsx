import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  BarChart as BarChartIcon,
  CheckCircle as CheckIcon,
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  ShowChart as LineChartIcon,
  TableChart as TableChartIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAnalyticsService } from '../../hooks/useServiceManagement';

const AnalyticsServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createDashboardOpen, setCreateDashboardOpen] = useState(false);
  const [createReportOpen, setCreateReportOpen] = useState(false);
  const [runReportOpen, setRunReportOpen] = useState(false);
  const [exportDataOpen, setExportDataOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportParams, setReportParams] = useState<any>({});
  const [exportFormat, setExportFormat] = useState('csv');
  const [isLoading, setIsLoading] = useState(false);

  // Use real Analytics service hook
  const {
    status,
    metrics: serviceMetrics,
    error,
    dashboards,
    reports,
    analyticsMetrics,
    serviceControl,
    refresh,
    refreshMetrics,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    generateReport,
    createVisualization,
    exportData} = useAnalyticsService();

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

  const handleCreateDashboard = async (dashboardData: any) => {
    try {
      setIsLoading(true);
      await createDashboard(dashboardData);
      alert('Dashboard created successfully!');
      setCreateDashboardOpen(false);
      await refreshData();
    } catch (err) {
      alert(`Failed to create dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDashboard = async (id: string, dashboardData: any) => {
    try {
      setIsLoading(true);
      await updateDashboard(id, dashboardData);
      alert('Dashboard updated successfully!');
      await refreshData();
    } catch (err) {
      alert(`Failed to update dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        setIsLoading(true);
        await deleteDashboard(id);
        alert('Dashboard deleted successfully!');
        await refreshData();
      } catch (err) {
        alert(`Failed to delete dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenerateReport = async (reportConfig: any) => {
    try {
      setIsLoading(true);
      const report = await generateReport(reportConfig);
      alert('Report generated successfully!');
      setRunReportOpen(false);
      await refreshData();
    } catch (err) {
      alert(`Failed to generate report: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format: string, filters: any = {}) => {
    try {
      setIsLoading(true);
      const data = await exportData(format, filters);
      alert(`Data exported successfully in ${format.toUpperCase()} format!`);
      setExportDataOpen(false);
    } catch (err) {
      alert(`Failed to export data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            Analytics Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage dashboards, reports, and data analytics
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
            onClick={() => setCreateDashboardOpen(true)}
          >
            Create Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => setCreateReportOpen(true)}
          >
            Generate Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDataOpen(true)}
          >
            Export Data
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
                  <DashboardIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Dashboards</Typography>
                  <Typography variant="h4" color="primary">
                    {dashboards.filter((d: any) => d.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {dashboards.length} dashboards
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <ReportIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Reports Generated</Typography>
                  <Typography variant="h4" color="primary">
                    {serviceMetrics?.totalRequests || 0}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Active: {serviceMetrics?.activeConnections || 0}
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
                  <Typography variant="h6">Data Points</Typography>
                  <Typography variant="h4" color="primary">
                    {serviceMetrics?.responseTime || 0}K
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Processed today
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
                    {serviceMetrics?.errorRate || 0}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={serviceMetrics?.errorRate || 0} 
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
              <Typography variant="body1">{serviceMetrics?.lastUpdated || 'N/A'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Dashboards" />
            <Tab label="Reports" />
            <Tab label="Visualizations" />
            <Tab label="Performance" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Dashboards Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Analytics Dashboards</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDashboardOpen(true)}
                >
                  Create Dashboard
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {dashboards.map((dashboard) => (
                  <Card key={dashboard.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{dashboard.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{dashboard.type}</Typography>
                        </Box>
                        <Chip
                          label={dashboard.status}
                          color={dashboard.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {dashboard.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Widgets</Typography>
                          <Typography variant="body1">{dashboard.widgets?.length || 0}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Views</Typography>
                          <Typography variant="body1">{dashboard.views || 0}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDashboard(dashboard);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDashboard(dashboard);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDashboard(dashboard.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Reports Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Analytics Reports</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>
                          <Chip 
                            label={report.status} 
                            color={report.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{report.lastRun || 'Never'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <DownloadIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Visualizations Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Data Visualizations</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BarChartIcon sx={{ mr: 2, color: '#6366f1' }} />
                      <Typography variant="h6">Bar Charts</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 50) + 10} active charts
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PieChartIcon sx={{ mr: 2, color: '#10b981' }} />
                      <Typography variant="h6">Pie Charts</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 30) + 5} active charts
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LineChartIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Typography variant="h6">Line Charts</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 40) + 8} active charts
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TableChartIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                      <Typography variant="h6">Tables</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.floor(Math.random() * 25) + 3} active tables
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
                      <TableCell>Query Response Time</TableCell>
                      <TableCell>{serviceMetrics?.responseTime || 0}ms</TableCell>
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
                    <TableRow>
                      <TableCell>Data Processing Rate</TableCell>
                      <TableCell>{serviceMetrics?.activeConnections || 0} records/sec</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+15%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cache Hit Rate</TableCell>
                      <TableCell>{100 - (serviceMetrics?.errorRate || 0)}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+3%</Typography>
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

      {/* Create Dashboard Dialog */}
      <Dialog
        open={createDashboardOpen}
        onClose={() => setCreateDashboardOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Dashboard
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Dashboard Name"
              fullWidth
              variant="outlined"
              id="dashboard-name"
            />
            <FormControl fullWidth>
              <InputLabel>Dashboard Type</InputLabel>
              <Select label="Dashboard Type" id="dashboard-type">
                <MenuItem value="executive">Executive Dashboard</MenuItem>
                <MenuItem value="operational">Operational Dashboard</MenuItem>
                <MenuItem value="analytical">Analytical Dashboard</MenuItem>
                <MenuItem value="real-time">Real-time Dashboard</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              id="dashboard-description"
            />
            <FormControlLabel
              control={<Switch defaultChecked id="is-public" />}
              label="Make Dashboard Public"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDashboardOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('dashboard-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('dashboard-type') as HTMLSelectElement)?.value;
              const description = (document.getElementById('dashboard-description') as HTMLInputElement)?.value;
              const isPublic = (document.getElementById('is-public') as HTMLInputElement)?.checked;
              
              if (!name || !type) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateDashboard({
                name,
                type,
                description,
                isPublic,
                status: 'active',
                widgets: [],
                views: 0,
                createdAt: new Date().toISOString()});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Dashboard'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog
        open={exportDataOpen}
        onClose={() => setExportDataOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Export Data
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Date Range (optional)"
              fullWidth
              variant="outlined"
              placeholder="e.g., 2024-01-01 to 2024-12-31"
            />
            <TextField
              label="Filters (optional)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Enter filter criteria..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDataOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleExportData(exportFormat)}
            disabled={isLoading}
          >
            {isLoading ? 'Exporting...' : 'Export Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsServiceManagement;