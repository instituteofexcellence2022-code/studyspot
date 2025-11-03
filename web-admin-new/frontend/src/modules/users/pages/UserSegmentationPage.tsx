// ============================================
// USER SEGMENTATION PAGE
// Advanced segmentation, filtering, and bulk operations
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import {
  Add,
  FilterList,
  Download,
  Send,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Save,
  Close,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { showSuccess, showError } from '../../../store/slices/uiSlice';

interface Segment {
  id: string;
  name: string;
  description: string;
  filters: {
    role?: string[];
    status?: string[];
    tenantId?: string[];
    lastLoginDays?: number;
    registrationDays?: number;
  };
  userCount: number;
  createdAt: Date;
}

const UserSegmentationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { platformUsers } = useAppSelector((state) => state.user);

  const [segments, setSegments] = useState<Segment[]>([
    {
      id: '1',
      name: 'Active Library Owners',
      description: 'Library owners who logged in within last 7 days',
      filters: { role: ['library_owner'], status: ['active'], lastLoginDays: 7 },
      userCount: 45,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Inactive Students',
      description: 'Students who haven\'t logged in for 30+ days',
      filters: { role: ['student'], lastLoginDays: 30 },
      userCount: 128,
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'New Registrations',
      description: 'Users registered in last 7 days',
      filters: { registrationDays: 7 },
      userCount: 34,
      createdAt: new Date(),
    },
  ]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  
  // Helper to get selection count
  const getSelectionCount = () => {
    return selectedUsers.length;
  };

  // New segment form
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    roles: [] as string[],
    statuses: [] as string[],
    lastLoginDays: '',
  });

  const handleCreateSegment = () => {
    const segment: Segment = {
      id: Date.now().toString(),
      name: newSegment.name,
      description: newSegment.description,
      filters: {
        role: newSegment.roles.length > 0 ? newSegment.roles : undefined,
        status: newSegment.statuses.length > 0 ? newSegment.statuses : undefined,
        lastLoginDays: newSegment.lastLoginDays ? parseInt(newSegment.lastLoginDays) : undefined,
      },
      userCount: 0, // Calculate based on filters
      createdAt: new Date(),
    };

    setSegments([...segments, segment]);
    dispatch(showSuccess('Segment created successfully'));
    setCreateDialogOpen(false);
    setNewSegment({ name: '', description: '', roles: [], statuses: [], lastLoginDays: '' });
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter(s => s.id !== segmentId));
    dispatch(showSuccess('Segment deleted'));
  };

  const handleBulkAction = (action: string) => {
    const count = getSelectionCount();
    if (count === 0) {
      dispatch(showError('Please select users first'));
      return;
    }

    switch (action) {
      case 'activate':
        dispatch(showSuccess(`Activated ${count} users`));
        break;
      case 'suspend':
        dispatch(showSuccess(`Suspended ${count} users`));
        break;
      case 'delete':
        dispatch(showSuccess(`Deleted ${count} users`));
        break;
      case 'email':
        setBulkActionDialogOpen(true);
        break;
    }
  };

  const handleExportSegment = (segment: Segment) => {
    dispatch(showSuccess(`Exporting ${segment.name} segment`));
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value?.replace('_', ' ')}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
    { field: 'tenantName', headerName: 'Tenant', flex: 1, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Segmentation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage user segments for targeted operations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Segment
        </Button>
      </Box>

      {/* Segments Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {segment.name}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Export">
                    <IconButton size="small" onClick={() => handleExportSegment(segment)}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDeleteSegment(segment.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {segment.description}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {segment.filters.role?.map((role) => (
                  <Chip key={role} label={role.replace('_', ' ')} size="small" />
                ))}
                {segment.filters.status?.map((status) => (
                  <Chip key={status} label={status} size="small" color="primary" />
                ))}
                {segment.filters.lastLoginDays && (
                  <Chip label={`Last ${segment.filters.lastLoginDays}d`} size="small" color="secondary" />
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {segment.userCount}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSelectedSegment(segment)}
                >
                  View Users
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Selected Segment Users */}
      {selectedSegment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedSegment.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getSelectionCount()} users selected
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedSegment(null)}>
                <Close />
              </IconButton>
            </Stack>

            {/* Bulk Actions */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={() => handleBulkAction('activate')}
                disabled={getSelectionCount() === 0}
              >
                Activate
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Block />}
                onClick={() => handleBulkAction('suspend')}
                disabled={getSelectionCount() === 0}
              >
                Suspend
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Send />}
                onClick={() => handleBulkAction('email')}
                disabled={getSelectionCount() === 0}
              >
                Send Email
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleBulkAction('delete')}
                disabled={getSelectionCount() === 0}
              >
                Delete
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download />}
                onClick={() => handleExportSegment(selectedSegment)}
              >
                Export
              </Button>
            </Stack>

            {/* Users DataGrid */}
            <Box sx={{ height: 500 }}>
              <DataGrid
                rows={platformUsers}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newSelection) => setSelectedUsers(newSelection as any)}
                rowSelectionModel={selectedUsers as any}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 25 } },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Create Segment Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Segment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Segment Name"
              required
              fullWidth
              value={newSegment.name}
              onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
              placeholder="e.g., Active Library Owners"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newSegment.description}
              onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
              placeholder="Describe this segment..."
            />

            <FormControl fullWidth>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={newSegment.roles}
                onChange={(e) => setNewSegment({ ...newSegment, roles: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value.replace('_', ' ')} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="library_owner">Library Owner</MenuItem>
                <MenuItem value="library_admin">Library Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="parent">Parent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={newSegment.statuses}
                onChange={(e) => setNewSegment({ ...newSegment, statuses: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Last Login (Days)"
              type="number"
              fullWidth
              value={newSegment.lastLoginDays}
              onChange={(e) => setNewSegment({ ...newSegment, lastLoginDays: e.target.value })}
              placeholder="e.g., 7"
              helperText="Users who logged in within last X days"
            />

            <Alert severity="info">
              Segment will be created with these filters. User count will be calculated automatically.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSegment}
            disabled={!newSegment.name}
          >
            Create Segment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Email Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Bulk Email</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Sending email to {getSelectionCount()} selected users
            </Alert>

            <TextField
              label="Subject"
              required
              fullWidth
              placeholder="Email subject..."
            />

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              rows={6}
              placeholder="Email message..."
            />

            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="Send as notification in platform"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => {
              dispatch(showSuccess(`Email sent to ${getSelectionCount()} users`));
              setBulkActionDialogOpen(false);
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSegmentationPage;

