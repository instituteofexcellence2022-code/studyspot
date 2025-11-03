// Roles & Permissions Page
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, Button, Chip, GridLegacy as Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { AdminPanelSettings, Add, Edit, Delete, People } from '@mui/icons-material';

const RolesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const roles = [
    { id: 1, name: 'Super Admin', users: 2, description: 'Full system access', permissions: 50, status: 'Active', createdDate: '2025-01-01' },
    { id: 2, name: 'Admin', users: 3, description: 'Manage tenants & users', permissions: 35, status: 'Active', createdDate: '2025-01-01' },
    { id: 3, name: 'Manager', users: 2, description: 'Manage operations', permissions: 25, status: 'Active', createdDate: '2025-02-15' },
    { id: 4, name: 'Support', users: 5, description: 'Handle support tickets', permissions: 15, status: 'Active', createdDate: '2025-03-01' },
    { id: 5, name: 'Analyst', users: 3, description: 'View reports & analytics', permissions: 10, status: 'Active', createdDate: '2025-04-10' },
  ];

  const permissions = [
    { module: 'Dashboard', view: true, create: false, edit: false, delete: false },
    { module: 'Tenants', view: true, create: true, edit: true, delete: true },
    { module: 'Platform Users', view: true, create: true, edit: true, delete: false },
    { module: 'Admin Users', view: true, create: true, edit: true, delete: true },
    { module: 'Revenue & Billing', view: true, create: false, edit: true, delete: false },
    { module: 'Payments', view: true, create: false, edit: true, delete: false },
    { module: 'Credits', view: true, create: true, edit: true, delete: false },
    { module: 'Subscriptions', view: true, create: false, edit: true, delete: false },
    { module: 'CRM & Leads', view: true, create: true, edit: true, delete: true },
    { module: 'Templates', view: true, create: true, edit: true, delete: true },
    { module: 'Analytics', view: true, create: false, edit: false, delete: false },
    { module: 'Reports', view: true, create: true, edit: false, delete: false },
    { module: 'System Health', view: true, create: false, edit: true, delete: false },
    { module: 'Tickets', view: true, create: true, edit: true, delete: false },
    { module: 'Audit Logs', view: true, create: false, edit: false, delete: false },
    { module: 'Roles & Permissions', view: true, create: true, edit: true, delete: true },
    { module: 'Settings', view: true, create: false, edit: true, delete: false },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Role Name', width: 200 },
    { field: 'description', headerName: 'Description', width: 250 },
    { 
      field: 'users', 
      headerName: 'Users', 
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" size="small" icon={<People fontSize="small" />} />
      )
    },
    { field: 'permissions', headerName: 'Permissions', width: 130, renderCell: (params) => `${params.value} permissions` },
    { field: 'createdDate', headerName: 'Created Date', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 110,
      renderCell: (params) => <Chip label={params.value} color="success" size="small" />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: () => (
        <Box>
          <IconButton size="small" color="primary"><Edit fontSize="small" /></IconButton>
          <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Roles & Permissions</Typography>
          <Typography variant="body2" color="text.secondary">Manage access control and permissions</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Create Role</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Total Roles</Typography>
            <Typography variant="h4" fontWeight="bold">5</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Total Users</Typography>
            <Typography variant="h4" fontWeight="bold">15</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Active Roles</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">5</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Permission Modules</Typography>
            <Typography variant="h4" fontWeight="bold">17</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Roles" />
        <Tab label="Permission Matrix" />
      </Tabs>

      {activeTab === 0 && (
        <Card><CardContent>
          <DataGrid rows={roles} columns={columns} autoHeight pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} />
        </CardContent></Card>
      )}

      {activeTab === 1 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Permission Matrix (Super Admin Role)</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Module</strong></TableCell>
                  <TableCell align="center"><strong>View</strong></TableCell>
                  <TableCell align="center"><strong>Create</strong></TableCell>
                  <TableCell align="center"><strong>Edit</strong></TableCell>
                  <TableCell align="center"><strong>Delete</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((perm, index) => (
                  <TableRow key={index}>
                    <TableCell>{perm.module}</TableCell>
                    <TableCell align="center"><Checkbox checked={perm.view} color="primary" /></TableCell>
                    <TableCell align="center"><Checkbox checked={perm.create} color="success" /></TableCell>
                    <TableCell align="center"><Checkbox checked={perm.edit} color="warning" /></TableCell>
                    <TableCell align="center"><Checkbox checked={perm.delete} color="error" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent></Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Role Name" sx={{ mb: 2 }} />
            <TextField fullWidth label="Description" multiline rows={3} sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Assign Permissions:</Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary">Select modules and permissions in the next step</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Create Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesPage;

