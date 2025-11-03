// ============================================
// COMPLIANCE & PRIVACY DASHBOARD
// GDPR compliance tools and data privacy management
// ============================================

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Security,
  VerifiedUser,
  Policy,
  DeleteForever,
  Download,
  Block,
  CheckCircle,
  Warning,
  Error,
  Info,
  Visibility,
  Assessment,
  Edit,
  Add,
  Description,
  LocalPolice,
  Shield,
  Storage as StorageIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const CompliancePrivacyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // KPIs
  const kpis = {
    dataRequests: 156,
    pendingRequests: 23,
    completedRequests: 133,
    avgProcessingTime: 2.5,
    consentRate: 94.3,
    optOutRate: 5.7,
    dataBreaches: 0,
    complianceScore: 98.5,
  };

  // Mock data requests (GDPR)
  const dataRequests = [
    { id: 1, userId: 'USR001', userName: 'Rahul Sharma', email: 'rahul@email.com', requestType: 'data_export', status: 'completed', requestDate: '2025-10-28', completionDate: '2025-10-29', daysToComplete: 1 },
    { id: 2, userId: 'USR002', userName: 'Priya Patel', email: 'priya@email.com', requestType: 'data_deletion', status: 'pending', requestDate: '2025-10-31', completionDate: null, daysToComplete: null },
    { id: 3, userId: 'USR003', userName: 'Amit Kumar', email: 'amit@email.com', requestType: 'data_access', status: 'in_progress', requestDate: '2025-10-30', completionDate: null, daysToComplete: null },
    { id: 4, userId: 'USR004', userName: 'Sneha Reddy', email: 'sneha@email.com', requestType: 'data_rectification', status: 'completed', requestDate: '2025-10-25', completionDate: '2025-10-27', daysToComplete: 2 },
    { id: 5, userId: 'USR005', userName: 'Vikram Singh', email: 'vikram@email.com', requestType: 'opt_out', status: 'completed', requestDate: '2025-10-29', completionDate: '2025-10-29', daysToComplete: 0 },
  ];

  // Consent tracking
  const consentData = [
    { category: 'Marketing Emails', consented: 11234, declined: 1234, pending: 456 },
    { category: 'SMS Notifications', consented: 9876, declined: 2345, pending: 678 },
    { category: 'Data Analytics', consented: 10987, declined: 987, pending: 234 },
    { category: 'Third-Party Sharing', consented: 5678, declined: 6789, pending: 345 },
  ];

  // Analytics data
  const requestTrendData = [
    { month: 'May', export: 12, deletion: 5, access: 8, rectification: 3 },
    { month: 'Jun', export: 15, deletion: 7, access: 10, rectification: 4 },
    { month: 'Jul', export: 18, deletion: 8, access: 12, rectification: 5 },
    { month: 'Aug', export: 22, deletion: 10, access: 15, rectification: 6 },
    { month: 'Sep', export: 25, deletion: 12, access: 18, rectification: 7 },
    { month: 'Oct', export: 28, deletion: 14, access: 20, rectification: 8 },
  ];

  const complianceMetrics = [
    { metric: 'Data Encryption', score: 100, status: 'compliant' },
    { metric: 'Access Controls', score: 98, status: 'compliant' },
    { metric: 'Audit Logging', score: 95, status: 'compliant' },
    { metric: 'Data Retention', score: 92, status: 'warning' },
    { metric: 'User Consent', score: 94, status: 'compliant' },
    { metric: 'Privacy Policy', score: 100, status: 'compliant' },
  ];

  const requestTypeDistribution = [
    { name: 'Data Export', value: 85, color: '#2196F3' },
    { name: 'Data Deletion', value: 42, color: '#F44336' },
    { name: 'Data Access', value: 56, color: '#4CAF50' },
    { name: 'Rectification', value: 23, color: '#FF9800' },
    { name: 'Opt-Out', value: 37, color: '#9C27B0' },
  ];

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return dataRequests.filter(req => {
      const matchesSearch = req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = requestTypeFilter === 'all' || req.requestType === requestTypeFilter;
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, requestTypeFilter, statusFilter]);

  // DataGrid columns
  const requestColumns: GridColDef[] = [
    {
      field: 'userName',
      headerName: 'User',
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{params.row.userName}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'requestType',
      headerName: 'Request Type',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const typeLabels: any = {
          data_export: 'Data Export',
          data_deletion: 'Data Deletion',
          data_access: 'Data Access',
          data_rectification: 'Rectification',
          opt_out: 'Opt-Out',
        };
        return <Chip label={typeLabels[params.value]} size="small" />;
      },
    },
    {
      field: 'requestDate',
      headerName: 'Request Date',
      width: 130,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig: any = {
          completed: { label: 'Completed', color: 'success', icon: <CheckCircle /> },
          pending: { label: 'Pending', color: 'warning', icon: <Warning /> },
          in_progress: { label: 'In Progress', color: 'info', icon: <Info /> },
        };
        const config = statusConfig[params.value] || statusConfig.pending;
        return <Chip label={config.label} size="small" color={config.color} icon={config.icon} />;
      },
    },
    {
      field: 'daysToComplete',
      headerName: 'Days',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        params.value !== null ? (
          <Chip 
            label={`${params.value}d`} 
            size="small" 
            color={params.value <= 2 ? 'success' : params.value <= 5 ? 'warning' : 'error'}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary">
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton size="small" color="success">
            <Download fontSize="small" />
          </IconButton>
          {params.row.requestType === 'data_deletion' && (
            <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(true)}>
              <DeleteForever fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  // Tab 1: Data Requests (GDPR)
  const renderDataRequestsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Request Type</InputLabel>
              <Select value={requestTypeFilter} onChange={(e) => setRequestTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="data_export">Data Export</MenuItem>
                <MenuItem value="data_deletion">Data Deletion</MenuItem>
                <MenuItem value="data_access">Data Access</MenuItem>
                <MenuItem value="data_rectification">Rectification</MenuItem>
                <MenuItem value="opt_out">Opt-Out</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add />} fullWidth>
              New Request
            </Button>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>GDPR Compliance:</strong> All requests must be processed within 30 days. Currently {kpis.pendingRequests} pending requests.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Requests DataGrid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            GDPR Data Subject Requests
          </Typography>
          <DataGrid
            rows={filteredRequests}
            columns={requestColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Consent Management
  const renderConsentTab = () => (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Consent Rate: {kpis.consentRate}%</strong> • {kpis.optOutRate}% users opted out
        </Typography>
      </Alert>

      {/* Consent Categories */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Consent Tracking by Category
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Consented</strong></TableCell>
                  <TableCell align="right"><strong>Declined</strong></TableCell>
                  <TableCell align="right"><strong>Pending</strong></TableCell>
                  <TableCell align="right"><strong>Consent Rate</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consentData.map((row, index) => {
                  const total = row.consented + row.declined + row.pending;
                  const rate = (row.consented / total) * 100;
                  return (
                    <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell align="right">
                        <Chip label={row.consented.toLocaleString()} size="small" color="success" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={row.declined.toLocaleString()} size="small" color="error" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={row.pending.toLocaleString()} size="small" color="warning" />
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{rate.toFixed(1)}%</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={rate} 
                            sx={{ mt: 0.5 }}
                            color={rate > 80 ? 'success' : rate > 60 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Compliance Analytics
  const renderAnalyticsTab = () => (
    <Box>
      {/* Request Trend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 GDPR Request Trend (6 Months)
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={requestTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="export" fill="#2196F3" name="Data Export" stackId="a" />
              <Bar dataKey="deletion" fill="#F44336" name="Data Deletion" stackId="a" />
              <Bar dataKey="access" fill="#4CAF50" name="Data Access" stackId="a" />
              <Bar dataKey="rectification" fill="#FF9800" name="Rectification" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Request Type Distribution & Compliance Score */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Request Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Compliance Score Breakdown
            </Typography>
            <Stack spacing={2}>
              {complianceMetrics.map((metric, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2">{metric.metric}</Typography>
                    <Chip 
                      label={`${metric.score}%`} 
                      size="small" 
                      color={metric.status === 'compliant' ? 'success' : 'warning'}
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.score} 
                    color={metric.status === 'compliant' ? 'success' : 'warning'}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Overall Compliance Score</Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {kpis.complianceScore}%
              </Typography>
              <Chip label="Excellent" size="small" color="success" sx={{ mt: 1 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 4: Audit Logs
  const renderAuditLogsTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Audit Trail:</strong> All data access and modifications are logged for compliance. Logs are retained for 7 years.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Audit Events
          </Typography>
          <Stack spacing={2}>
            {[
              { time: '2025-11-02 14:30:45', user: 'Admin User', action: 'Data Export Request Completed', severity: 'info', details: 'User: Rahul Sharma' },
              { time: '2025-11-02 13:15:22', user: 'System', action: 'Automatic Data Purge', severity: 'success', details: 'Deleted 1,234 records per retention policy' },
              { time: '2025-11-02 11:45:10', user: 'Admin User', action: 'Consent Updated', severity: 'info', details: 'User: Priya Patel opted out of marketing' },
              { time: '2025-11-02 10:20:33', user: 'System', action: 'Failed Access Attempt', severity: 'warning', details: 'Unauthorized data access blocked' },
              { time: '2025-11-02 09:15:18', user: 'Admin User', action: 'Data Rectification', severity: 'info', details: 'Updated user profile for Amit Kumar' },
            ].map((log, index) => (
              <Paper key={index} sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Chip 
                        label={log.severity} 
                        size="small" 
                        color={log.severity === 'warning' ? 'warning' : log.severity === 'success' ? 'success' : 'info'}
                      />
                      <Typography variant="caption" color="text.secondary">{log.time}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={600}>{log.action}</Typography>
                    <Typography variant="caption" color="text.secondary">By {log.user} • {log.details}</Typography>
                  </Box>
                  <IconButton size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 5: Data Retention
  const renderRetentionTab = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Data Retention Policy:</strong> User data is retained according to legal requirements. Automated purge runs monthly.
        </Typography>
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active User Data
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">2.4 GB</Typography>
            <Typography variant="caption" color="text.secondary">12,859 active users</Typography>
            <LinearProgress variant="determinate" value={45} sx={{ mt: 2 }} color="success" />
            <Typography variant="caption" color="text.secondary">45% of total storage</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Archived Data
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="info.main">1.8 GB</Typography>
            <Typography variant="caption" color="text.secondary">5,234 archived users</Typography>
            <LinearProgress variant="determinate" value={35} sx={{ mt: 2 }} color="info" />
            <Typography variant="caption" color="text.secondary">35% of total storage</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Scheduled for Deletion
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">1.1 GB</Typography>
            <Typography variant="caption" color="text.secondary">3,456 users (30+ days inactive)</Typography>
            <LinearProgress variant="determinate" value={20} sx={{ mt: 2 }} color="error" />
            <Typography variant="caption" color="text.secondary">20% of total storage</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Retention Schedule */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Data Retention Schedule
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Data Type</strong></TableCell>
                  <TableCell><strong>Retention Period</strong></TableCell>
                  <TableCell><strong>Auto-Purge</strong></TableCell>
                  <TableCell><strong>Records</strong></TableCell>
                  <TableCell><strong>Next Purge</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { type: 'User Profiles (Active)', period: 'Indefinite', autoPurge: 'No', records: 12859, nextPurge: 'N/A' },
                  { type: 'User Profiles (Inactive)', period: '2 years', autoPurge: 'Yes', records: 5234, nextPurge: '2025-12-01' },
                  { type: 'Transaction History', period: '7 years', autoPurge: 'Yes', records: 45678, nextPurge: '2025-11-15' },
                  { type: 'Audit Logs', period: '7 years', autoPurge: 'Yes', records: 234567, nextPurge: '2025-11-20' },
                  { type: 'Marketing Consent', period: '2 years', autoPurge: 'Yes', records: 11234, nextPurge: '2025-12-05' },
                ].map((row, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.autoPurge} 
                        size="small" 
                        color={row.autoPurge === 'Yes' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{row.records.toLocaleString()}</TableCell>
                    <TableCell>{row.nextPurge}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🔒 Compliance & Privacy Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          GDPR compliance tools and data privacy management • {kpis.dataRequests} total requests
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: 'white' }}>Compliance Score</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                  {kpis.complianceScore}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  Excellent
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                <VerifiedUser />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Pending Requests</Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {kpis.pendingRequests}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg {kpis.avgProcessingTime} days to complete
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <Warning />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Consent Rate</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {kpis.consentRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpis.optOutRate}% opted out
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Data Breaches</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {kpis.dataBreaches}
                </Typography>
                <Chip label="Secure" size="small" color="success" sx={{ mt: 0.5 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Shield />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Data Requests" icon={<Description />} iconPosition="start" />
          <Tab label="Consent Management" icon={<VerifiedUser />} iconPosition="start" />
          <Tab label="Analytics" icon={<Assessment />} iconPosition="start" />
          <Tab label="Audit Logs" icon={<LocalPolice />} iconPosition="start" />
          <Tab label="Data Retention" icon={<StorageIcon />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderDataRequestsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderConsentTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderAnalyticsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            {renderAuditLogsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            {renderRetentionTab()}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Data Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action is irreversible. All user data will be permanently deleted.
            </Typography>
          </Alert>
          <Typography variant="body2">
            Are you sure you want to proceed with this data deletion request? This will remove all personal information, transaction history, and associated records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" startIcon={<DeleteForever />}>
            Confirm Deletion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompliancePrivacyDashboard;
