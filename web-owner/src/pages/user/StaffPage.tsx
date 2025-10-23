import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// Mock staff data
const MOCK_STAFF = [
  {
    id: 1,
    name: 'Suresh Gupta',
    email: 'suresh@studyspot.com',
    phone: '+91 98765 11111',
    role: 'Branch Manager',
    status: 'active',
    joinDate: '2025-01-15',
  },
  {
    id: 2,
    name: 'Meena Reddy',
    email: 'meena@studyspot.com',
    phone: '+91 98765 22222',
    role: 'Front Desk Staff',
    status: 'active',
    joinDate: '2025-02-20',
  },
  {
    id: 3,
    name: 'Ravi Kumar',
    email: 'ravi@studyspot.com',
    phone: '+91 98765 33333',
    role: 'Facility Manager',
    status: 'inactive',
    joinDate: '2024-12-10',
  },
];

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
}

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Front Desk Staff',
    status: 'active',
  });

  const handleAddStaff = () => {
    const staffMember: Staff = {
      id: staff.length + 1,
      ...newStaff,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setStaff([...staff, staffMember]);
    setDialogOpen(false);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: 'Front Desk Staff',
      status: 'active',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Branch Manager':
        return 'error';
      case 'Front Desk Staff':
        return 'info';
      case 'Facility Manager':
        return 'warning';
      case 'Finance Manager':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Staff
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Staff
              </Typography>
              <Typography variant="h4">{staff.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Staff
              </Typography>
              <Typography variant="h4" color="success.main">
                {staff.filter(s => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Managers
              </Typography>
              <Typography variant="h4">
                {staff.filter(s => s.role.includes('Manager')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Front Desk
              </Typography>
              <Typography variant="h4">
                {staff.filter(s => s.role === 'Front Desk Staff').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Member</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {member.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{member.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.role}
                    size="small"
                    color={getRoleColor(member.role) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={member.status}
                    size="small"
                    color={getStatusColor(member.status) as any}
                  />
                </TableCell>
                <TableCell>{member.joinDate}</TableCell>
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

      {/* Add Staff Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              placeholder="e.g., Suresh Gupta"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              placeholder="e.g., staff@studyspot.com"
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              placeholder="e.g., +91 98765 43210"
              fullWidth
              required
            />
            <TextField
              select
              label="Role"
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="Branch Manager">Branch Manager</MenuItem>
              <MenuItem value="Front Desk Staff">Front Desk Staff</MenuItem>
              <MenuItem value="Facility Manager">Facility Manager</MenuItem>
              <MenuItem value="Finance Manager">Finance Manager</MenuItem>
              <MenuItem value="Analytics Manager">Analytics Manager</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={newStaff.status}
              onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddStaff}
            variant="contained"
            disabled={!newStaff.name || !newStaff.email || !newStaff.phone}
          >
            Add Staff
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffPage;

