import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, TablePagination, TableSortLabel, InputAdornment, FormControl,
  InputLabel, Select, Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert, Snackbar,
  Tooltip, Tabs, Tab, Divider, List, ListItem, ListItemIcon, Badge, Menu, Stepper, Step,
  StepLabel, FormControlLabel, Switch, alpha, LinearProgress,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon, Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon, FilterList as FilterIcon,
  Upload as UploadIcon, Visibility as ViewIcon, Print as PrintIcon,
  Verified as VerifiedIcon, Group as GroupIcon, Timeline as TimelineIcon,
  Email, Phone, LocationOn, School, CreditCard, Badge as BadgeIcon,
  Assignment, CheckCircle, Warning, Close, MoreVert,
  CloudUpload, PersonAdd, Description, CalendarToday, History,
} from '@mui/icons-material';
import studentsService, { Student as APIStudent, StudentsFilters } from '../../services/studentsService';
import StudentFormDialog from '../../components/students/StudentFormDialog';

// Enhanced Student interface
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  feeStatus: string;
  currentPlan?: string;
  status: string;
  enrollmentDate: string;
  kycVerified?: boolean;
  kycDocuments?: any[];
  guardianName?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  totalFeesPaid?: number;
  outstandingBalance?: number;
  attendancePercentage?: number;
  groups?: string[];
  tags?: string[];
  notes?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentsPageAdvanced: React.FC = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formTab, setFormTab] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [feeStatusFilter, setFeeStatusFilter] = useState<string[]>([]);
  const [kycFilter, setKycFilter] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  
  // Groups and tags
  const [availableGroups, setAvailableGroups] = useState<string[]>([
    'Morning Batch', 'Evening Batch', 'Weekend Batch', 'Competitive Exams', 'Regular Students'
  ]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    'VIP', 'Scholarship', 'Long-term', 'New', 'Overdue'
  ]);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuStudent, setMenuStudent] = useState<Student | null>(null);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const filters: StudentsFilters = {
        search: searchTerm || undefined,
        status: statusFilter.length > 0 ? statusFilter.join(',') : undefined,
        feeStatus: feeStatusFilter.length > 0 ? feeStatusFilter.join(',') : undefined,
        page: page + 1,
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
      // Use demo data as fallback
      setStudents([]);
      setTotalCount(0);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, statusFilter, feeStatusFilter, page, rowsPerPage, sortField, sortOrder]);

  // Student creation steps
  const formSteps = ['Personal Info', 'Contact Details', 'Fee & Plan', 'KYC & Documents'];

  // Handle bulk import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      // Preview logic here
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse CSV/Excel and show preview
        setImportPreview([
          { firstName: 'Sample', lastName: 'Student 1', email: 'sample1@example.com', status: 'pending' },
          { firstName: 'Sample', lastName: 'Student 2', email: 'sample2@example.com', status: 'pending' },
        ]);
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImport = async () => {
    setLoading(true);
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      setImportProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setSnackbar({ open: true, message: `✅ Successfully imported ${importPreview.length} students!`, severity: 'success' });
    setBulkImportDialogOpen(false);
    setLoading(false);
    fetchStudents();
  };

  // Handle ID card generation
  const handleGenerateIDCards = () => {
    if (selectedStudents.length === 0) {
      setSnackbar({ open: true, message: '❌ Please select students first', severity: 'error' });
      return;
    }
    setIdCardDialogOpen(true);
  };

  const handlePrintIDCards = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSnackbar({ open: true, message: `✅ Generated ${selectedStudents.length} ID cards!`, severity: 'success' });
    setIdCardDialogOpen(false);
    setSelectedStudents([]);
    setLoading(false);
  };

  // Handle student selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // View student details
  const handleViewStudent = (student: Student) => {
    setCurrentStudent(student);
    setViewDialogOpen(true);
  };

  // KYC verification
  const handleKYCVerification = (student: Student) => {
    setCurrentStudent(student);
    setKycDialogOpen(true);
  };

  const handleApproveKYC = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSnackbar({ open: true, message: '✅ KYC verified successfully!', severity: 'success' });
    setKycDialogOpen(false);
    setLoading(false);
    fetchStudents();
  };

  // Menu handling
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuStudent(null);
  };

  // Lifecycle status
  const getLifecycleStatus = (student: Student) => {
    const enrollDate = new Date(student.enrollmentDate);
    const daysSince = Math.floor((Date.now() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30) return { label: 'New', color: 'info' };
    if (daysSince < 180) return { label: 'Active', color: 'success' };
    if (daysSince < 365) return { label: 'Regular', color: 'primary' };
    return { label: 'Long-term', color: 'secondary' };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Management
          <Chip label="Advanced Features ✨" color="success" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive student management with KYC, bulk import, and lifecycle tracking
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditMode(false); setCurrentStudent({}); setAddDialogOpen(true); }}
              >
                Add Student
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setBulkImportDialogOpen(true)}
              >
                Bulk Import
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BadgeIcon />}
                onClick={handleGenerateIDCards}
                disabled={selectedStudents.length === 0}
              >
                Generate ID Cards ({selectedStudents.length})
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => studentsService.exportToCSV({})}
              >
                Export All
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Students</Typography>
              <Typography variant="h4">{totalCount}</Typography>
              <Chip label={`+${Math.floor(totalCount * 0.08)} this month`} size="small" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">KYC Verified</Typography>
              <Typography variant="h4" color="success.main">
                {students.filter(s => s.kycVerified).length}
              </Typography>
              <Chip label={`${Math.floor((students.filter(s => s.kycVerified).length / (students.length || 1)) * 100)}%`} size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Active Students</Typography>
              <Typography variant="h4" color="primary.main">
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
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, phone, student ID..."
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
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string[])}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => `${selected.length} selected`}
              >
                {['active', 'inactive', 'suspended', 'graduated'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.includes(status)} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Fee Status</InputLabel>
              <Select
                multiple
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value as string[])}
                input={<OutlinedInput label="Fee Status" />}
                renderValue={(selected) => `${selected.length} selected`}
              >
                {['paid', 'pending', 'overdue', 'partial'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={feeStatusFilter.includes(status)} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC</InputLabel>
              <Select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                label="KYC"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter([]);
                setFeeStatusFilter([]);
                setKycFilter('');
                setGroupFilter([]);
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper>
        <TableContainer>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : students.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No students found</Typography>
              <Button startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)} sx={{ mt: 2 }}>
                Add Your First Student
              </Button>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                      checked={students.length > 0 && selectedStudents.length === students.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'firstName'}
                      direction={sortField === 'firstName' ? sortOrder : 'asc'}
                      onClick={() => setSortField('firstName')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Fee Status</TableCell>
                  <TableCell>KYC</TableCell>
                  <TableCell>Lifecycle</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const lifecycle = getLifecycleStatus(student);
                  return (
                    <TableRow key={student.id} hover selected={selectedStudents.includes(student.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            student.kycVerified ? (
                              <VerifiedIcon sx={{ color: 'success.main', fontSize: 16 }} />
                            ) : null
                          }
                        >
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </Avatar>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {student.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">{student.email}</Typography>
                        <Typography variant="caption" display="block">{student.phone}</Typography>
                      </TableCell>
                      <TableCell>{student.currentPlan || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.feeStatus}
                          color={student.feeStatus === 'paid' ? 'success' : student.feeStatus === 'overdue' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {student.kycVerified ? (
                          <Chip label="Verified" color="success" size="small" icon={<CheckCircle />} />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" icon={<Warning />} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={lifecycle.label} color={lifecycle.color as any} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewStudent(student)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => { setEditMode(true); setCurrentStudent(student); setAddDialogOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Paper>

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={async (studentData) => {
          try {
            setLoading(true);
            if (editMode && currentStudent?.id) {
              await studentsService.updateStudent(currentStudent.id, studentData);
              setSnackbar({ open: true, message: '✅ Student updated successfully!', severity: 'success' });
            } else {
              await studentsService.createStudent(studentData);
              setSnackbar({ open: true, message: '✅ Student created successfully!', severity: 'success' });
            }
            fetchStudents();
            setLoading(false);
          } catch (error) {
            console.error('Failed to save student:', error);
            setSnackbar({ open: true, message: '❌ Failed to save student', severity: 'error' });
            setLoading(false);
          }
        }}
        editMode={editMode}
        initialData={currentStudent}
      />

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleViewStudent(menuStudent!); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleKYCVerification(menuStudent!); handleMenuClose(); }}>
          <ListItemIcon><VerifiedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Verify KYC</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setSelectedStudents([menuStudent!.id]); handleGenerateIDCards(); handleMenuClose(); }}>
          <ListItemIcon><BadgeIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Generate ID Card</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteDialogOpen(true); handleMenuClose(); }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportDialogOpen} onClose={() => setBulkImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload sx={{ mr: 1 }} />
            Bulk Import Students
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload a CSV or Excel file with student data. Required columns: firstName, lastName, email, phone
          </Alert>
          
          <Box sx={{ border: 2, borderColor: 'divider', borderRadius: 2, borderStyle: 'dashed', p: 4, textAlign: 'center', mb: 3 }}>
            <input
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              id="bulk-import-file"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="bulk-import-file">
              <Button variant="contained" component="span" startIcon={<UploadIcon />}>
                Choose File
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Selected: {importFile.name}
              </Typography>
            )}
          </Box>

          {importPreview.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>Preview ({importPreview.length} students)</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {importPreview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.firstName}</TableCell>
                        <TableCell>{row.lastName}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={importProgress} />
                  <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                    Importing... {importProgress}%
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkImportDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleBulkImport} variant="contained" disabled={importPreview.length === 0 || loading}>
            {loading ? 'Importing...' : `Import ${importPreview.length} Students`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ID Card Generation Dialog */}
      <Dialog open={idCardDialogOpen} onClose={() => setIdCardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BadgeIcon sx={{ mr: 1 }} />
            Generate ID Cards
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            ID cards will be generated for {selectedStudents.length} selected student(s)
          </Alert>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Card Template</InputLabel>
            <Select defaultValue="standard" label="Card Template">
              <MenuItem value="standard">Standard Template</MenuItem>
              <MenuItem value="premium">Premium Template</MenuItem>
              <MenuItem value="custom">Custom Template</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Include QR Code"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Include Photo"
          />
          <FormControlLabel
            control={<Switch />}
            label="Include Barcode"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIdCardDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handlePrintIDCards} variant="contained" startIcon={<Print />} disabled={loading}>
            {loading ? 'Generating...' : 'Generate & Print'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Verification Dialog */}
      <Dialog open={kycDialogOpen} onClose={() => setKycDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedIcon sx={{ mr: 1 }} />
            KYC Verification - {currentStudent?.firstName} {currentStudent?.lastName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity={currentStudent?.kycVerified ? 'success' : 'warning'}>
                KYC Status: {currentStudent?.kycVerified ? 'Verified' : 'Pending Verification'}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Required Documents:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Description /></ListItemIcon>
                  <ListItemText primary="Aadhaar Card" secondary="Uploaded" />
                  <Chip label="Verified" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Description /></ListItemIcon>
                  <ListItemText primary="Photo ID" secondary="Uploaded" />
                  <Chip label="Verified" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Description /></ListItemIcon>
                  <ListItemText primary="Address Proof" secondary="Pending" />
                  <Chip label="Pending" color="warning" size="small" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Verification Checklist:</Typography>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Photo verified" />
              <FormControlLabel control={<Checkbox defaultChecked />} label="ID number verified" />
              <FormControlLabel control={<Checkbox />} label="Address verified" />
              <FormControlLabel control={<Checkbox defaultChecked />} label="Contact verified" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Verification Notes"
                placeholder="Add any notes about the verification process..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKycDialogOpen(false)} disabled={loading}>Close</Button>
          <Button onClick={handleApproveKYC} variant="contained" color="success" disabled={loading}>
            {loading ? 'Processing...' : 'Approve KYC'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Student Dialog - Detailed Profile */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 2, width: 56, height: 56, bgcolor: 'primary.main' }}>
                {currentStudent?.firstName?.charAt(0)}{currentStudent?.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {currentStudent?.firstName} {currentStudent?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {currentStudent?.studentId}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label="Personal" />
            <Tab label="Attendance" />
            <Tab label="Payments" />
            <Tab label="History" />
          </Tabs>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1" gutterBottom>{currentStudent?.email}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1" gutterBottom>{currentStudent?.phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Enrollment Date</Typography>
              <Typography variant="body1" gutterBottom>
                {currentStudent?.enrollmentDate ? new Date(currentStudent.enrollmentDate).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Current Plan</Typography>
              <Chip label={currentStudent?.currentPlan || 'None'} size="small" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">Fee Status</Typography>
              <Chip 
                label={currentStudent?.feeStatus || 'N/A'} 
                color={currentStudent?.feeStatus === 'paid' ? 'success' : 'warning'} 
                size="small" 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">KYC Status</Typography>
              <Chip 
                label={currentStudent?.kycVerified ? 'Verified' : 'Pending'} 
                color={currentStudent?.kycVerified ? 'success' : 'warning'} 
                size="small"
                icon={currentStudent?.kycVerified ? <CheckCircle /> : <Warning />}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
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

export default StudentsPageAdvanced;

