import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  users: number;
  libraries: number;
  monthlyRevenue: number;
  createdAt: string;
  lastActive: string;
}

const TenantManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Mock data - replace with actual API call
  const tenants: Tenant[] = [
    {
      id: '1',
      name: 'University Library',
      domain: 'university.studyspot.com',
      subscriptionPlan: 'enterprise',
      status: 'active',
      users: 1250,
      libraries: 5,
      monthlyRevenue: 2500,
      createdAt: '2024-01-15',
      lastActive: '2024-01-20',
    },
    {
      id: '2',
      name: 'City Public Library',
      domain: 'city.studyspot.com',
      subscriptionPlan: 'premium',
      status: 'active',
      users: 850,
      libraries: 3,
      monthlyRevenue: 1200,
      createdAt: '2024-01-10',
      lastActive: '2024-01-19',
    },
    {
      id: '3',
      name: 'Tech Institute',
      domain: 'tech.studyspot.com',
      subscriptionPlan: 'basic',
      status: 'trial',
      users: 200,
      libraries: 1,
      monthlyRevenue: 0,
      createdAt: '2024-01-18',
      lastActive: '2024-01-20',
    },
  ];

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'default';
      case 'premium':
        return 'primary';
      case 'enterprise':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'trial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleCreateTenant = () => {
    setCreateDialogOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditDialogOpen(true);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    // TODO: Implement delete functionality after backend integration
    // This will require confirmation dialog and API call
  };

  const handleViewTenant = (tenant: Tenant) => {
    // TODO: Implement view functionality - navigate to tenant details
    // navigate(`/admin/tenants/${tenant.id}`);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tenant Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ color: 'text.secondary' }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.domain}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getPlanColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'libraries',
      headerName: 'Libraries',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          {params.value}
        </Box>
      ),
    },
    {
      field: 'monthlyRevenue',
      headerName: 'Revenue',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          ${params.value.toLocaleString()}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      type: 'date',
      valueGetter: (params: any) => new Date(params.value),
      renderCell: (params: any) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleViewTenant(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditTenant(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteTenant(params.row)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: 300 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTenant}
        >
          Add Tenant
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">{tenants.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tenants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    {tenants.reduce((sum, tenant) => sum + tenant.users, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    ${tenants.reduce((sum, tenant) => sum + tenant.monthlyRevenue, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ color: 'info.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h6">
                    {tenants.reduce((sum, tenant) => sum + tenant.libraries, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Libraries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTenants}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tenant</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tenant creation form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Tenant: {selectedTenant?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tenant edit form will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;

