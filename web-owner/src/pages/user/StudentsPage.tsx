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

// Mock students data
const MOCK_STUDENTS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    feeStatus: 'paid',
    plan: 'Monthly Premium',
    status: 'active',
    lastVisit: '2025-10-23',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    feeStatus: 'pending',
    plan: 'Weekly Plan',
    status: 'active',
    lastVisit: '2025-10-22',
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    feeStatus: 'overdue',
    plan: 'Daily Plan',
    status: 'inactive',
    lastVisit: '2025-10-15',
  },
];

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  feeStatus: string;
  plan: string;
  status: string;
  lastVisit: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Monthly Premium',
    feeStatus: 'pending',
    status: 'active',
  });

  const handleAddStudent = () => {
    const student: Student = {
      id: students.length + 1,
      ...newStudent,
      lastVisit: new Date().toISOString().split('T')[0],
    };
    setStudents([...students, student]);
    setDialogOpen(false);
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      plan: 'Monthly Premium',
      feeStatus: 'pending',
      status: 'active',
    });
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
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
          Student Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Student
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
              <Typography variant="h4">{students.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Students
              </Typography>
              <Typography variant="h4" color="success.main">
                {students.filter(s => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fee Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {students.filter(s => s.feeStatus === 'pending' || s.feeStatus === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Overdue Fees
              </Typography>
              <Typography variant="h4" color="error.main">
                {students.filter(s => s.feeStatus === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Fee Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {student.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {student.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{student.email}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {student.phone}
                  </Typography>
                </TableCell>
                <TableCell>{student.plan}</TableCell>
                <TableCell>
                  <Chip
                    label={student.feeStatus}
                    size="small"
                    color={getFeeStatusColor(student.feeStatus) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={student.status}
                    size="small"
                    color={getStatusColor(student.status) as any}
                  />
                </TableCell>
                <TableCell>{student.lastVisit}</TableCell>
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

      {/* Add Student Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="e.g., Rajesh Kumar"
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="e.g., student@example.com"
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              placeholder="e.g., +91 98765 43210"
              fullWidth
              required
            />
            <TextField
              select
              label="Plan"
              value={newStudent.plan}
              onChange={(e) => setNewStudent({ ...newStudent, plan: e.target.value })}
              fullWidth
            >
              <MenuItem value="Hourly Plan">Hourly Plan</MenuItem>
              <MenuItem value="Daily Plan">Daily Plan</MenuItem>
              <MenuItem value="Weekly Plan">Weekly Plan</MenuItem>
              <MenuItem value="Monthly Premium">Monthly Premium</MenuItem>
            </TextField>
            <TextField
              select
              label="Fee Status"
              value={newStudent.feeStatus}
              onChange={(e) => setNewStudent({ ...newStudent, feeStatus: e.target.value })}
              fullWidth
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={newStudent.status}
              onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
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
            onClick={handleAddStudent}
            variant="contained"
            disabled={!newStudent.name || !newStudent.email || !newStudent.phone}
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage;

