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
  Autocomplete,
  Divider,
  alpha,
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
  CheckCircle,
  LocationOn,
} from '@mui/icons-material';
import studentsService, { Student as APIStudent, StudentsFilters } from '../../services/studentsService';

// Use API Student interface
interface Student {
  id: string;
  firstName: string;
  lastName?: string; // Optional - not required
  email: string;
  phone?: string;
  studentId: string;
  feeStatus: string;
  currentPlan?: string;
  status: string;
  enrollmentDate: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

const StudentsPageEnhanced: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student & { 
    studentId?: string; 
    district?: string; 
    city?: string; 
    state?: string;
    pincode?: string;
    addressLine1?: string;
    addressLine2?: string;
    country?: string;
  }>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    district: '',
    city: '',
    state: '',
    country: 'India',
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
  const [fetchingPincode, setFetchingPincode] = useState(false);
  
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

  // Auto-generate student ID
  const generateStudentId = (firstName: string, lastName?: string): string => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    const timestamp = Date.now().toString().slice(-6);
    return `${firstInitial}${lastInitial}${timestamp}`;
  };

  // Auto-fill from email domain (smart defaults)
  const autoFillFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return;
    
    const domain = email.split('@')[1];
    const emailName = email.split('@')[0];
    
    // Auto-suggest first name from email if empty
    if (!currentStudent.firstName && emailName) {
      const suggestedName = emailName.split('.')[0] || emailName.split('_')[0];
      if (suggestedName.length >= 2) {
        setCurrentStudent(prev => ({ ...prev, firstName: suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1) }));
      }
    }
  };

  // PIN code lookup for address auto-fill
  const handlePincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setCurrentStudent(prev => ({ ...prev, pincode: numericPincode }));

    // Only fetch if PIN code is 6 digits
    if (numericPincode.length === 6) {
      setFetchingPincode(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${numericPincode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            const prevAny = currentStudent as any;
            
            setCurrentStudent(prev => {
              const prevAny = prev as any;
              return {
                ...prev,
                district: postOffice.District || prevAny.district,
                city: postOffice.District || prevAny.city,
                state: postOffice.State || prevAny.state,
                pincode: numericPincode,
                // Also update address object
                address: {
                  ...(prevAny.address || {}),
                  city: postOffice.District || prevAny.address?.city,
                  state: postOffice.State || prevAny.address?.state,
                  postalCode: numericPincode,
                },
              };
            });

            setSnackbar({ 
              open: true, 
              message: `Address auto-filled: ${postOffice.District}, ${postOffice.State}`, 
              severity: 'success' 
            });
          } else {
            console.log('PIN code not found in database');
          }
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  // Validation function - lastName is now optional
  const validateStudent = (student: Partial<Student>): boolean => {
    const newErrors: Partial<Record<keyof Student, string>> = {};
    
    if (!student.firstName || student.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name is optional - only validate if provided
    if (student.lastName && student.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters if provided';
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
      // Auto-generate student ID and set smart defaults
      const defaultStudentId = generateStudentId('', '');
      setCurrentStudent({
        firstName: '',
        lastName: '', // Optional - not required
        email: '',
        phone: '',
        studentId: defaultStudentId,
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        district: '',
        city: '',
        state: '',
        country: 'India',
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
          lastName: currentStudent.lastName || '', // Optional - can be empty
          email: currentStudent.email!,
          phone: currentStudent.phone,
          currentPlan: currentStudent.currentPlan,
          feeStatus: currentStudent.feeStatus,
          status: currentStudent.status,
        });
        setSnackbar({ open: true, message: '✅ Student updated successfully!', severity: 'success' });
      } else {
        // Create new student - auto-generate student ID if not provided
        console.log('➕ Creating new student');
        const studentId = currentStudent.studentId || generateStudentId(
          currentStudent.firstName!,
          currentStudent.lastName
        );
        
        const studentData: any = {
          firstName: currentStudent.firstName!,
          lastName: currentStudent.lastName || '', // Optional - can be empty
          email: currentStudent.email!,
          phone: currentStudent.phone,
          currentPlan: currentStudent.currentPlan || 'Monthly Premium',
          feeStatus: currentStudent.feeStatus || 'pending',
          status: currentStudent.status || 'active',
        };

        // Add address if provided
        if ((currentStudent as any).pincode || (currentStudent as any).addressLine1 || 
            (currentStudent as any).district || (currentStudent as any).city || 
            (currentStudent as any).state) {
          studentData.address = {
            line1: (currentStudent as any).addressLine1 || currentStudent.address?.line1,
            line2: (currentStudent as any).addressLine2 || currentStudent.address?.line2,
            city: (currentStudent as any).city || currentStudent.address?.city,
            state: (currentStudent as any).state || currentStudent.address?.state,
            postalCode: (currentStudent as any).pincode || currentStudent.address?.postalCode,
            country: (currentStudent as any).country || currentStudent.address?.country || 'India',
          };
        }

        await studentsService.createStudent(studentData);
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
                        {student.firstName.charAt(0)}{student.lastName?.charAt(0) || ''}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {student.firstName} {student.lastName || ''}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {editMode ? 'Edit Student' : 'Add New Student'}
              {!editMode && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Quick registration - only first name and email required
                </Typography>
              )}
            </Box>
            {!editMode && currentStudent.studentId && (
              <Chip 
                label={`ID: ${currentStudent.studentId}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {!editMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Quick Add:</strong> Fill in first name and email to create student. Other fields can be added later.
              </Typography>
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={currentStudent.firstName || ''}
                onChange={(e) => {
                  const firstName = e.target.value;
                  setCurrentStudent({ 
                    ...currentStudent, 
                    firstName,
                    // Auto-generate student ID when name changes
                    studentId: generateStudentId(firstName, currentStudent.lastName)
                  });
                }}
                error={!!errors.firstName}
                helperText={errors.firstName || 'Required - minimum 2 characters'}
                autoFocus
                placeholder="Enter first name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name (Optional)"
                value={currentStudent.lastName || ''}
                onChange={(e) => {
                  const lastName = e.target.value;
                  setCurrentStudent({ 
                    ...currentStudent, 
                    lastName,
                    // Auto-generate student ID when name changes
                    studentId: generateStudentId(currentStudent.firstName || '', lastName)
                  });
                }}
                error={!!errors.lastName}
                helperText={errors.lastName || 'Optional - leave blank if not applicable'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={currentStudent.email || ''}
                onChange={(e) => {
                  const email = e.target.value;
                  setCurrentStudent({ ...currentStudent, email });
                  // Auto-fill suggestions from email
                  autoFillFromEmail(email);
                }}
                error={!!errors.email}
                helperText={errors.email || 'We\'ll use this for communication and login'}
                placeholder="student@example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone (Optional)"
                value={currentStudent.phone || ''}
                onChange={(e) => {
                  let phone = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  if (phone.length > 10) phone = phone.slice(0, 10);
                  setCurrentStudent({ ...currentStudent, phone });
                }}
                error={!!errors.phone}
                helperText={errors.phone || '10-digit mobile number (optional)'}
                placeholder="9876543210"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Plan (Default: Monthly Premium)"
                value={currentStudent.currentPlan || 'Monthly Premium'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, currentPlan: e.target.value })}
                helperText="Can be changed later"
              >
                <MenuItem value="Hourly Plan">Hourly Plan</MenuItem>
                <MenuItem value="Daily Plan">Daily Plan</MenuItem>
                <MenuItem value="Weekly Plan">Weekly Plan</MenuItem>
                <MenuItem value="Monthly Premium">Monthly Premium (Recommended)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Fee Status (Default: Pending)"
                value={currentStudent.feeStatus || 'pending'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, feeStatus: e.target.value })}
                helperText="Auto-set to pending for new students"
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending (Default)</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status (Default: Active)"
                value={currentStudent.status || 'active'}
                onChange={(e) => setCurrentStudent({ ...currentStudent, status: e.target.value })}
                helperText="New students are active by default"
              >
                <MenuItem value="active">Active (Default)</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            {/* Address Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Address (Optional)" size="small" />
              </Divider>
            </Grid>

            {/* PIN Code - Enter First for Auto-fill */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PIN Code (Enter first to auto-fill)"
                value={(currentStudent as any).pincode || ''}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="110001"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                  endAdornment: fetchingPincode ? (
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                  ) : (currentStudent as any).pincode?.length === 6 ? (
                    <CheckCircle sx={{ fontSize: 18, color: '#10b981', mr: 1 }} />
                  ) : null,
                }}
                helperText={
                  fetchingPincode 
                    ? 'Loading address...'
                    : (currentStudent as any).pincode?.length === 6 && !fetchingPincode
                    ? 'City, State & District auto-filled'
                    : 'Enter 6-digit PIN code to auto-fill address'
                }
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="District"
                value={(currentStudent as any).district || ''}
                onChange={(e) => setCurrentStudent({ ...currentStudent, district: e.target.value })}
                placeholder="District"
                InputProps={{
                  startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                  endAdornment: (currentStudent as any).district && !fetchingPincode ? (
                    <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                  ) : null,
                }}
              />
            </Grid>

            {/* City with Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={[
                  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
                  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
                  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
                  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad'
                ]}
                value={(currentStudent as any).city || ''}
                onChange={(event, newValue) => {
                  setCurrentStudent({ ...currentStudent, city: newValue || '' });
                }}
                onInputChange={(event, newInputValue) => {
                  setCurrentStudent({ ...currentStudent, city: newInputValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    placeholder="City"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                      endAdornment: (currentStudent as any).city && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                      ) : params.InputProps.endAdornment,
                    }}
                  />
                )}
              />
            </Grid>

            {/* State with Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={[
                  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
                  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                ]}
                value={(currentStudent as any).state || ''}
                onChange={(event, newValue) => {
                  setCurrentStudent({ ...currentStudent, state: newValue || '' });
                }}
                onInputChange={(event, newInputValue) => {
                  setCurrentStudent({ ...currentStudent, state: newInputValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State"
                    placeholder="State"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                      endAdornment: (currentStudent as any).state && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                      ) : params.InputProps.endAdornment,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Address Line 1 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={(currentStudent as any).addressLine1 || currentStudent.address?.line1 || ''}
                onChange={(e) => setCurrentStudent({ 
                  ...currentStudent, 
                  addressLine1: e.target.value,
                  address: { ...currentStudent.address, line1: e.target.value }
                })}
                placeholder="House/Flat No., Building Name, Street"
              />
            </Grid>

            {/* Address Line 2 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                value={(currentStudent as any).addressLine2 || currentStudent.address?.line2 || ''}
                onChange={(e) => setCurrentStudent({ 
                  ...currentStudent, 
                  addressLine2: e.target.value,
                  address: { ...currentStudent.address, line2: e.target.value }
                })}
                placeholder="Area, Landmark (Optional)"
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={(currentStudent as any).country || currentStudent.address?.country || 'India'}
                onChange={(e) => setCurrentStudent({ 
                  ...currentStudent, 
                  country: e.target.value,
                  address: { ...currentStudent.address, country: e.target.value }
                })}
                disabled
                helperText="Currently only India is supported"
              />
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
            Are you sure you want to delete student "{studentToDelete?.firstName} {studentToDelete?.lastName || ''}"?
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
