/**
 * Audit Log Viewer Page
 * Comprehensive audit log viewing and filtering interface
 * 
 * @author Agent 2 - Senior Frontend Developer (20+ years)
 * @date October 21, 2025
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
// import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Download as DownloadIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '../../store';
import {
  fetchAuditLogs,
  exportAuditLogs,
  clearAuditLogFilters,
  setAuditLogFilters
} from '../../store/slices/rbacSlice';
import { AuditLog } from '../../types';

type AuditStatus = 'success' | 'failure' | 'warning';
type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'login_failed';
const AuditLogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs, auditLogFilters } = useSelector((state: RootState) => state.rbac);
  const { user } = useSelector((state: RootState) => state.auth);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = auditLogFilters || { page: 1, limit: 10 };

  useEffect(() => {
    dispatch(fetchAuditLogs(filters) as any);
  }, [dispatch, filters]);

  const handleRefresh = () => {
    dispatch(fetchAuditLogs(filters) as any);
  };

  const handleExport = () => {
    dispatch(exportAuditLogs(filters) as any);
  };

  const handleClearFilters = () => {
    dispatch(clearAuditLogFilters());
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleFilterChange = (key: string, value: unknown) => {
    dispatch(setAuditLogFilters({ ...filters, [key]: value }));
  };

  const getStatusColor = (status: AuditStatus): 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failure':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getActionColor = (action: AuditAction): string => {
    const colorMap: Record<string, string> = {
      create: '#4caf50',
      update: '#2196f3',
      delete: '#f44336',
      view: '#9e9e9e',
      login: '#00bcd4',
      logout: '#607d8b',
      login_failed: '#ff5722'};
    return colorMap[action] || '#9e9e9e';
  };

  // Simple table instead of DataGrid to avoid chunk loading issues

  if (auditLogs.loading && auditLogs.items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            Audit Logs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={auditLogs.loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          View and analyze system activity and user actions
        </Typography>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={auditLogs.filters.action || 'all'}
                  label="Action"
                  onChange={(e) => handleFilterChange('action', e.target.value === 'all' ? undefined : e.target.value)}
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="view">View</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="logout">Logout</MenuItem>
                  <MenuItem value="login_failed">Login Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={auditLogs.filters.status || 'all'}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failure">Failure</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={auditLogs.filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                size="small"
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={auditLogs.filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                size="small"
                fullWidth
                label="Search"
                placeholder="Search by user, resource, or IP"
                value={auditLogs.filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <Button variant="outlined" onClick={handleClearFilters} fullWidth>
                Clear All Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error Alert */}
      {auditLogs.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {auditLogs.error}
        </Alert>
      )}

      {/* Audit Logs Table */}
      <Paper sx={{ width: '100%' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs.loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : auditLogs.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No audit logs found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {log.userName || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.userEmail || 'No email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getActionColor(log.action),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {log.resource}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status?.toUpperCase() || 'UNKNOWN'}
                        size="small"
                        color={getStatusColor(log.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(log)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {format(new Date(selectedLog.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">User</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedLog.userName}</Typography>
                  <Typography variant="caption">{selectedLog.userEmail}</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">Action</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.action.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{ backgroundColor: getActionColor(selectedLog.action), color: 'white' }}
                    />
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedLog.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(selectedLog.status)}
                    />
                  </Box>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">Resource</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedLog.resource}</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">Resource ID</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedLog.resourceId || 'N/A'}</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">IP Address</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedLog.ipAddress}</Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">User Agent</Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                    {selectedLog.userAgent || 'N/A'}
                  </Typography>
                </Grid>
                {selectedLog.changes && (
                  <Grid xs={12}>
                    <Typography variant="caption" color="text.secondary">Changes</Typography>
                    <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(selectedLog.changes, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <Grid xs={12}>
                    <Typography variant="caption" color="text.secondary">Metadata</Typography>
                    <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                      <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuditLogPage;

