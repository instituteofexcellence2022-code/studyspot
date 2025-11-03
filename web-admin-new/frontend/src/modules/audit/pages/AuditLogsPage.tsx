// Audit Logs Page
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, GridLegacy as Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Security, GetApp, FilterList, Info, Warning, Error } from '@mui/icons-material';

const AuditLogsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('2025-10-25');
  const [dateTo, setDateTo] = useState('2025-10-31');

  const logs = [
    { id: 1, timestamp: '2025-10-31 14:45:22', user: 'admin@studyspot.com', action: 'User Created', resource: 'Platform User', details: 'Created user: john.doe@example.com', ip: '192.168.1.100', severity: 'Info' },
    { id: 2, timestamp: '2025-10-31 14:30:15', user: 'amit@studyspot.com', action: 'Payment Processed', resource: 'Payment', details: 'Payment ID: PAY001234, Amount: ₹3000', ip: '192.168.1.101', severity: 'Info' },
    { id: 3, timestamp: '2025-10-31 12:15:45', user: 'sneha@studyspot.com', action: 'Subscription Updated', resource: 'Subscription', details: 'Changed plan: Starter → Pro', ip: '192.168.1.102', severity: 'Warning' },
    { id: 4, timestamp: '2025-10-31 10:30:00', user: 'system', action: 'Login Failed', resource: 'Authentication', details: 'Failed login attempt from unknown user', ip: '45.67.89.123', severity: 'Warning' },
    { id: 5, timestamp: '2025-10-31 09:20:33', user: 'rahul@studyspot.com', action: 'Settings Changed', resource: 'Platform Settings', details: 'Updated SMTP configuration', ip: '192.168.1.103', severity: 'Warning' },
    { id: 6, timestamp: '2025-10-30 18:45:10', user: 'admin@studyspot.com', action: 'User Deleted', resource: 'Platform User', details: 'Deleted user: inactive@example.com', ip: '192.168.1.100', severity: 'Error' },
    { id: 7, timestamp: '2025-10-30 16:15:22', user: 'amit@studyspot.com', action: 'Tenant Onboarded', resource: 'Tenant', details: 'Onboarded: New Study Center', ip: '192.168.1.101', severity: 'Info' },
    { id: 8, timestamp: '2025-10-30 14:00:00', user: 'sneha@studyspot.com', action: 'Role Assigned', resource: 'RBAC', details: 'Assigned Manager role to user ID: 45', ip: '192.168.1.102', severity: 'Info' },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Info': return <Info fontSize="small" />;
      case 'Warning': return <Warning fontSize="small" />;
      case 'Error': return <Error fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Info': return 'info';
      case 'Warning': return 'warning';
      case 'Error': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
    { field: 'user', headerName: 'User', width: 200 },
    { field: 'action', headerName: 'Action', width: 180 },
    { field: 'resource', headerName: 'Resource', width: 150 },
    { field: 'details', headerName: 'Details', width: 300 },
    { field: 'ip', headerName: 'IP Address', width: 140 },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={getSeverityIcon(params.value)}
          label={params.value} 
          color={getSeverityColor(params.value) as any}
          size="small"
        />
      )
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">Complete audit trail of all system activities</Typography>
        </Box>
        <Button variant="contained" startIcon={<GetApp />}>Export Logs</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Total Logs (Today)</Typography>
            <Typography variant="h4" fontWeight="bold">8</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">User Actions</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary.main">7</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Warnings</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">3</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Errors</Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">1</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card><CardContent>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="From Date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <TextField label="To Date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} size="small" />
          <TextField size="small" placeholder="Search logs..." sx={{ width: 250 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severity</InputLabel>
            <Select label="Severity" defaultValue="All">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Info">Info</MenuItem>
              <MenuItem value="Warning">Warning</MenuItem>
              <MenuItem value="Error">Error</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<FilterList />}>Apply Filters</Button>
        </Box>
        <DataGrid rows={logs} columns={columns} autoHeight pageSizeOptions={[10, 25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} checkboxSelection />
      </CardContent></Card>
    </Box>
  );
};

export default AuditLogsPage;

