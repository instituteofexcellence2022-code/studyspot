import React, { useState, useMemo } from 'react';
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
  TablePagination,
  TableSortLabel,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

// Enhanced mock students data (more samples for pagination/sorting demo)
const INITIAL_STUDENTS = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', feeStatus: 'paid', plan: 'Monthly Premium', status: 'active', lastVisit: '2025-10-23' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43211', feeStatus: 'pending', plan: 'Weekly Plan', status: 'active', lastVisit: '2025-10-22' },
  { id: 3, name: 'Amit Patel', email: 'amit@example.com', phone: '+91 98765 43212', feeStatus: 'overdue', plan: 'Daily Plan', status: 'inactive', lastVisit: '2025-10-15' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 98765 43213', feeStatus: 'paid', plan: 'Monthly Premium', status: 'active', lastVisit: '2025-10-23' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 43214', feeStatus: 'pending', plan: 'Weekly Plan', status: 'active', lastVisit: '2025-10-21' },
  { id: 6, name: 'Anita Desai', email: 'anita@example.com', phone: '+91 98765 43215', feeStatus: 'paid', plan: 'Hourly Plan', status: 'active', lastVisit: '2025-10-23' },
  { id: 7, name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 98765 43216', feeStatus: 'overdue', plan: 'Daily Plan', status: 'inactive', lastVisit: '2025-10-10' },
  { id: 8, name: 'Pooja Nair', email: 'pooja@example.com', phone: '+91 98765 43217', feeStatus: 'paid', plan: 'Monthly Premium', status: 'active', lastVisit: '2025-10-22' },
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

type SortField = keyof Student;
type SortOrder = 'asc' | 'desc';

const StudentsPageEnhanced: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    plan: 'Monthly Premium',
    feeStatus: 'pending',
    status: 'active',
  });
  
  // Enhanced features state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [feeStatusFilter, setFeeStatusFilter] = useState<string[]>([]);
  const [planFilter, setPlanFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});

  // Validation function
  const validateStudent = (student: Partial<Student>): boolean => {
    const newErrors: Partial<Record<keyof Student, string>> = {};
    
    if (!student.name || student.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!student.phone || !/^\+?[\d\s-]{10,}$/.test(student.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(student.status);
      
      // Fee status filter
      const matchesFeeStatus = feeStatusFilter.length === 0 || feeStatusFilter.includes(student.feeStatus);
      
      // Plan filter
      const matchesPlan = planFilter.length === 0 || planFilter.includes(student.plan);
      
      return matchesSearch && matchesStatus && matchesFeeStatus && matchesPlan;
    });
    
    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [students, searchTerm, statusFilter, feeStatusFilter, planFilter, sortField, sortOrder]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  // Handlers
  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditMode(true);
      setCurrentStudent(student);
    } else {
      setEditMode(false);
      setCurrentStudent({
        name: '',
        email: '',
        phone: '',
        plan: 'Monthly Premium',
        feeStatus: 'pending',
        status: 'active',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveStudent = () => {
    if (!validateStudent(currentStudent)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (editMode && currentStudent.id) {
        // Update existing student
        setStudents(students.map(s => s.id === currentStudent.id ? currentStudent as Student : s));
        setSnackbar({ open: true, message: 'Student updated successfully!', severity: 'success' });
      } else {
        // Add new student
        const newStudent: Student = {
          id: Math.max(...students.map(s => s.id), 0) + 1,
          ...currentStudent as Omit<Student, 'id'>,
          lastVisit: new Date().toISOString().split('T')[0],
        };
        setStudents([...students, newStudent]);
        setSnackbar({ open: true, message: 'Student added successfully!', severity: 'success' });
      }
      
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setSnackbar({ open: true, message: 'Student deleted successfully!', severity: 'success' });
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
        setLoading(false);
      }, 500);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Plan', 'Fee Status', 'Status', 'Last Visit'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s => 
        [s.id, s.name, s.email, s.phone, s.plan, s.feeStatus, s.status, s.lastVisit].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Students exported to CSV!', severity: 'success' });
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
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
          Student Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Students</Typography>
              <Typography variant="h4">{students.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Showing: {filteredStudents.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Students</Typography>
              <Typography variant="h4" color="success.main">
                {students.filter(s => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Fee Pending</Typography>
              <Typography variant="h4" color="warning.main">
                {students.filter(s => s.feeStatus === 'pending' || s.feeStatus === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Overdue Fees</Typography>
              <Typography variant="h4" color="error.main">
                {students.filter(s => s.feeStatus === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string[])}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['active', 'inactive'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Fee Status</InputLabel>
              <Select
                multiple
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value as string[])}
                input={<OutlinedInput label="Fee Status" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {['paid', 'pending', 'overdue'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={feeStatusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                multiple
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as string[])}
                input={<OutlinedInput label="Plan" />}
                renderValue={(selected) => selected.length + ' selected'}
              >
                {['Hourly Plan', 'Daily Plan', 'Weekly Plan', 'Monthly Premium'].map((plan) => (
                  <MenuItem key={plan} value={plan}>
                    <Checkbox checked={planFilter.indexOf(plan) > -1} />
                    <ListItemText primary={plan} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter([]);
                setFeeStatusFilter([]);
                setPlanFilter([]);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Student
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortOrder : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Contact
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'plan'}
                  direction={sortField === 'plan' ? sortOrder : 'asc'}
                  onClick={() => handleSort('plan')}
                >
                  Plan
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'feeStatus'}
                  direction={sortField === 'feeStatus' ? sortOrder : 'asc'}
                  onClick={() => handleSort('feeStatus')}
                >
                  Fee Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'lastVisit'}
                  direction={sortField === 'lastVisit' ? sortOrder : 'asc'}
                  onClick={() => handleSort('lastVisit')}
                >
                  Last Visit
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow key={student.id} hover>
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
                  <Tooltip title="Edit">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(student)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(student)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No students found. Try adjusting your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Add/Edit Student Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              value={currentStudent.name}
              onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
              placeholder="e.g., Rajesh Kumar"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              type="email"
              value={currentStudent.email}
              onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
              placeholder="e.g., student@example.com"
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone"
              value={currentStudent.phone}
              onChange={(e) => setCurrentStudent({ ...currentStudent, phone: e.target.value })}
              placeholder="e.g., +91 98765 43210"
              fullWidth
              required
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              select
              label="Plan"
              value={currentStudent.plan}
              onChange={(e) => setCurrentStudent({ ...currentStudent, plan: e.target.value })}
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
              value={currentStudent.feeStatus}
              onChange={(e) => setCurrentStudent({ ...currentStudent, feeStatus: e.target.value })}
              fullWidth
            >
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={currentStudent.status}
              onChange={(e) => setCurrentStudent({ ...currentStudent, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSaveStudent}
            variant="contained"
            disabled={loading || !currentStudent.name || !currentStudent.email || !currentStudent.phone}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editMode ? 'Update' : 'Add'} Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{studentToDelete?.name}</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsPageEnhanced;

