// ============================================
// AUDIT LOGS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}

const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Mock audit log data
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-10-30 09:15:32',
      user: 'admin@studyspot.com',
      action: 'CREATE',
      resource: 'Tenant',
      resourceId: 'tenant-001',
      details: 'Created new tenant: Tech Institute Library',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      timestamp: '2024-10-30 09:10:18',
      user: 'john.admin@studyspot.com',
      action: 'UPDATE',
      resource: 'User',
      resourceId: 'user-045',
      details: 'Updated user role from Viewer to Admin',
      ip: '192.168.1.105',
      status: 'success',
    },
    {
      id: '3',
      timestamp: '2024-10-30 08:55:42',
      user: 'sarah.support@studyspot.com',
      action: 'DELETE',
      resource: 'User',
      resourceId: 'user-032',
      details: 'Deleted user account: test@example.com',
      ip: '192.168.1.110',
      status: 'success',
    },
    {
      id: '4',
      timestamp: '2024-10-30 08:45:15',
      user: 'admin@studyspot.com',
      action: 'LOGIN',
      resource: 'Auth',
      resourceId: 'session-789',
      details: 'Successful login from new device',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '5',
      timestamp: '2024-10-30 08:30:28',
      user: 'unknown@example.com',
      action: 'LOGIN',
      resource: 'Auth',
      resourceId: 'session-788',
      details: 'Failed login attempt - invalid credentials',
      ip: '10.0.0.50',
      status: 'failed',
    },
    {
      id: '6',
      timestamp: '2024-10-30 08:20:55',
      user: 'david.superadmin@studyspot.com',
      action: 'UPDATE',
      resource: 'Settings',
      resourceId: 'settings-general',
      details: 'Changed system maintenance mode to enabled',
      ip: '192.168.1.115',
      status: 'warning',
    },
    {
      id: '7',
      timestamp: '2024-10-30 08:15:11',
      user: 'alex.admin@studyspot.com',
      action: 'CREATE',
      resource: 'User',
      resourceId: 'user-046',
      details: 'Created new user: rachel.green@studyspot.com',
      ip: '192.168.1.120',
      status: 'success',
    },
    {
      id: '8',
      timestamp: '2024-10-30 08:05:33',
      user: 'emily.admin@studyspot.com',
      action: 'UPDATE',
      resource: 'Tenant',
      resourceId: 'tenant-002',
      details: 'Updated tenant subscription plan from Basic to Premium',
      ip: '192.168.1.125',
      status: 'success',
    },
    {
      id: '9',
      timestamp: '2024-10-30 07:55:47',
      user: 'admin@studyspot.com',
      action: 'DELETE',
      resource: 'Tenant',
      resourceId: 'tenant-003',
      details: 'Deleted tenant: Old Test Library',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: '10',
      timestamp: '2024-10-30 07:45:22',
      user: 'system',
      action: 'BACKUP',
      resource: 'Database',
      resourceId: 'backup-daily-001',
      details: 'Automated daily backup completed successfully',
      ip: 'localhost',
      status: 'success',
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    toast.success('Audit logs refreshed');
  };

  const handleExport = () => {
    toast.success('Exporting audit logs...');
    setTimeout(() => {
      toast.success('Audit logs exported successfully!');
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <AddIcon fontSize="small" color="success" />;
      case 'UPDATE':
        return <EditIcon fontSize="small" color="info" />;
      case 'DELETE':
        return <DeleteIcon fontSize="small" color="error" />;
      case 'LOGIN':
        return <PersonIcon fontSize="small" color="primary" />;
      case 'BACKUP':
        return <SecurityIcon fontSize="small" color="action" />;
      default:
        return <SettingsIcon fontSize="small" />;
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'User':
        return <PersonIcon fontSize="small" />;
      case 'Tenant':
        return <BusinessIcon fontSize="small" />;
      case 'Settings':
        return <SettingsIcon fontSize="small" />;
      default:
        return <SecurityIcon fontSize="small" />;
    }
  };

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesAction && matchesStatus;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track all system activities and changes
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="LOGIN">Login</MenuItem>
            <MenuItem value="BACKUP">Backup</MenuItem>
          </TextField>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
          </TextField>
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="1d">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </TextField>
          <Tooltip title="Refresh">
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton color="primary" onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Logs
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {filteredLogs.length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Successful
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {filteredLogs.filter((log) => log.status === 'success').length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Failed
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {filteredLogs.filter((log) => log.status === 'failed').length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Warnings
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {filteredLogs.filter((log) => log.status === 'warning').length}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Audit Logs Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Resource</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.timestamp}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.user}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getActionIcon(log.action)}
                        <Typography variant="body2">{log.action}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getResourceIcon(log.resource)}
                        <Typography variant="body2">{log.resource}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={log.details}>
                        {log.details}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.ip}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={getStatusColor(log.status) as any}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default AuditLogsPage;

