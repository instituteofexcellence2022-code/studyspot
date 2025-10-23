import React, { useState, useEffect } from 'react';
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
import studentsService, { Student as APIStudent, StudentsFilters } from '../../services/studentsService';

// Use API Student interface
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  feeStatus: string;
  currentPlan?: string;
  status: string;
  enrollmentDate: string;
}

const StudentsPageEnhanced: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPlan: 'Monthly Premium',
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
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Build filters for API
      const filters: StudentsFilters = {
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
        feeStatus: feeStatusFilter.length > 0 ? feeStatusFilter.join(',') : undefined,
        plan: planFilter.length > 0 ? planFilter.join(',') : undefined,
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        sortBy: sortField,
        sortOrder,
      };
      
      console.log('🔍 Fetching students with filters:', filters);
      const response = await studentsService.getStudents(filters);
      console.log('✅ Students fetched:', response);
      setStudents(response.students as any);
      setTotalCount(response.totalCount);
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Failed to fetch students:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to load students. Using demo data.',
        severity: 'error' 
      });
      setLoading(false);
      
      // Use demo data as fallback
      setStudents([]);
      setTotalCount(0);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchStudents();
  }, [searchTerm, statusFilter, feeStatusFilter, planFilter, page, rowsPerPage, sortField, sortOrder]);

  // Validation function
  const validateStudent = (student: Partial<Student>): boolean => {
    const newErrors: Partial<Record<keyof Student, string>> = {};
    
    if (!student.firstName || student.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!student.lastName || student.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (student.phone && !/^\+?[\d\s-]{10,}$/.test(student.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditMode(true);
      setCurrentStudent(student);
    } else {
      setEditMode(false);
      setCurrentStudent({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPlan: 'Monthly Premium',
        feeStatus: 'pending',
        status: 'active',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveStudent = async () => {
    if (!validateStudent(currentStudent)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      if (editMode && currentStudent.id) {
        // Update existing student
        console.log('📝 Updating student:', currentStudent.id);
        await studentsService.updateStudent(currentStudent.id, {
          firstName: currentStudent.firstName!,
          lastName: currentStudent.lastName!,
          email: currentStudent.email!,
          phone: currentStudent.phone,
          currentPlan: currentStudent.currentPlan,
          feeStatus: currentStudent.feeStatus,
          status: currentStudent.status,
        });
        setSnackbar({ open: true, message: '✅ Student updated successfully!', severity: 'success' });
      } else {
        // Create new student
        console.log('➕ Creating new student');
        await studentsService.createStudent({
          firstName: currentStudent.firstName!,
          lastName: currentStudent.lastName!,
          email: currentStudent.email!,
          phone: currentStudent.phone,
          currentPlan: currentStudent.currentPlan,
          feeStatus: currentStudent.feeStatus,
          status: currentStudent.status,
        });
        setSnackbar({ open: true, message: '✅ Student created successfully!', severity: 'success' });
      }
      
      setDialogOpen(false);
      setLoading(false);
      
      // Refresh the list
      await fetchStudents();
    } catch (error: any) {
      console.error('❌ Failed to save student:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to save student',
        severity: 'error' 
      });
      setLoading(false);
    }
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      setLoading(true);
      console.log('🗑️ Deleting student:', studentToDelete.id);
      await studentsService.deleteStudent(studentToDelete.id);
      setSnackbar({ open: true, message: '✅ Student deleted successfully!', severity: 'success' });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      setLoading(false);
      
      // Refresh the list
      await fetchStudents();
    } catch (error: any) {
      console.error('❌ Failed to delete student:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to delete student',
        severity: 'error' 
      });
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      console.log('📥 Exporting students to CSV...');
      
      // Build filters for export
      const filters: StudentsFilters = {
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
        feeStatus: feeStatusFilter.length > 0 ? feeStatusFilter.join(',') : undefined,
        plan: planFilter.length > 0 ? planFilter.join(',') : undefined,
      };
      
      const blob = await studentsService.exportToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: '✅ CSV exported successfully!', severity: 'success' });
      setLoading(false);
    } catch (error: any) {
      console.error('❌ Failed to export CSV:', error);
      setSnackbar({ 
        open: true, 
        message: error?.response?.data?.error || 'Failed to export CSV',
        severity: 'error' 
      });
      setLoading(false);
    }
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
          Student Management <Chip label="API Integrated ✅" color="success" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportCSV}
            disabled={loading || totalCount === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
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
              <Typography variant="h4">{totalCount}</Typography>
              <Typography variant="caption" color="text.secondary">
                Page: {students.length}
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
          <Grid item xs={12} sm={4} md={2}>
            <Tooltip title="Clear all filters">
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter([]);
                  setFeeStatusFilter([]);
                  setPlanFilter([]);
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : students.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or add a new student
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'firstName'}
                      direction={sortField === 'firstName' ? sortOrder : 'asc'}
                      onClick={() => handleSort('firstName')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortOrder : 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Fee Status</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Enrollment Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {student.studentId}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || 'N/A'}</TableCell>
                    <TableCell>{student.currentPlan || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.feeStatus}
                        color={getFeeStatusColor(student.feeStatus) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={student.status}
                        color={getStatusColor(student.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(student.enrollmentDate).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(student)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(student)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={currentStudent.firstName || ''}
                onChange={(e) => setCurrentStudent({ ...currentStudent, firstName: e.target.value })}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={currentStudent.lastName || ''}
                onChange={(e) => setCurrentStudent({ ...currentStudent, lastName: e.target.value })}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={currentStudent.email || ''}
                onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={currentStudent.phone || ''}
                onChange={(e) => setCurrentStudent({ ...currentStudent, phone: e.target.value })}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Plan"
                value={currentStudent.currentPlan || 'Monthly Premium'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, currentPlan: e.target.value })}
              >
                <MenuItem value="Hourly Plan">Hourly Plan</MenuItem>
                <MenuItem value="Daily Plan">Daily Plan</MenuItem>
                <MenuItem value="Weekly Plan">Weekly Plan</MenuItem>
                <MenuItem value="Monthly Premium">Monthly Premium</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Fee Status"
                value={currentStudent.feeStatus || 'pending'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, feeStatus: e.target.value })}
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={currentStudent.status || 'active'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveStudent} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete student "{studentToDelete?.firstName} {studentToDelete?.lastName}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsPageEnhanced;
