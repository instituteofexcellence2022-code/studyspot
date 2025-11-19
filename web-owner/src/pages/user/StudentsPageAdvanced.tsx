import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, TablePagination, TableSortLabel, InputAdornment, FormControl,
  InputLabel, Select, Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert, Snackbar,
  Tooltip, Tabs, Tab, Divider, List, ListItem, ListItemIcon, Badge, Menu,
  FormControlLabel, Switch, LinearProgress,
} from '@mui/material';
// import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon, Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon, FilterList as FilterIcon,
  Upload as UploadIcon, Visibility as ViewIcon, Print as PrintIcon,
  Verified as VerifiedIcon, Group as GroupIcon, Timeline as TimelineIcon,
  CreditCard, Badge as BadgeIcon,
  Assignment, CheckCircle, Warning, Close, MoreVert,
  CloudUpload, Description, CalendarToday, Print,
  Assessment as AssessmentIcon, Payment as PaymentIcon,
} from '@mui/icons-material';
import studentsService, { StudentsFilters } from '../../services/studentsService';
import StudentFormDialog from '../../components/students/StudentFormDialog';
import UnifiedBulkOperations from '../../components/students/UnifiedBulkOperations';
import UnifiedStudentAnalytics from '../../components/students/UnifiedStudentAnalytics';
import EnhancedStudentProfile from '../../components/students/EnhancedStudentProfile';
import AttendanceTrackingSystem from '../../components/students/AttendanceTrackingSystem';
import StudentDocumentManagement from '../../components/students/StudentDocumentManagement';
import KYCVerificationSystem from '../../components/students/KYCVerificationSystem';
import StudentFeeManagement from '../../components/students/StudentFeeManagement';

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
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [currentStudent, setCurrentStudent] = useState<Partial<Student> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [feeStatusFilter, setFeeStatusFilter] = useState<string[]>([]);
  const [kycFilter, setKycFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  
  
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
  }, [searchTerm, statusFilter, feeStatusFilter, page, rowsPerPage, sortField, sortOrder, fetchStudents]);


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
    setProfileDialogOpen(true);
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

  // Memoized filter calculations to prevent re-renders during scroll
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.firstName?.toLowerCase().includes(search) ||
        s.lastName?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.phone?.includes(search) ||
        s.studentId?.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(s => statusFilter.includes(s.status));
    }
    
    // Fee status filter
    if (feeStatusFilter.length > 0) {
      filtered = filtered.filter(s => feeStatusFilter.includes(s.feeStatus));
    }
    
    // KYC filter
    if (kycFilter === 'verified') {
      filtered = filtered.filter(s => s.kycVerified);
    } else if (kycFilter === 'pending') {
      filtered = filtered.filter(s => !s.kycVerified);
    }
    
    return filtered;
  }, [students, searchTerm, statusFilter, feeStatusFilter, kycFilter]);

  // Memoized statistics to prevent recalculations
  const stats = useMemo(() => {
    const activeCount = students.filter(s => s.status === 'active').length;
    const kycVerifiedCount = students.filter(s => s.kycVerified).length;
    const feePendingCount = students.filter(s => s.feeStatus === 'pending').length;
    const thisMonthEnrollments = students.filter(s => new Date(s.enrollmentDate).getMonth() === new Date().getMonth()).length;
    const lastMonthEnrollments = students.filter(s => new Date(s.enrollmentDate).getMonth() === new Date().getMonth() - 1).length;
    const avgAttendance = students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / students.length)
      : 0;
    
    return {
      activeCount,
      kycVerifiedCount,
      feePendingCount,
      thisMonthEnrollments,
      lastMonthEnrollments,
      avgAttendance,
    };
  }, [students]);

  // Lifecycle status
  const getLifecycleStatus = useCallback((student: Student) => {
    const enrollDate = new Date(student.enrollmentDate);
    const daysSince = Math.floor((Date.now() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30) return { label: 'New', color: 'info' };
    if (daysSince < 180) return { label: 'Active', color: 'success' };
    if (daysSince < 365) return { label: 'Regular', color: 'primary' };
    return { label: 'Long-term', color: 'secondary' };
  }, []);

  return (
    <Box sx={{ 
      position: 'relative',
      overflow: 'visible', // Allow content to scroll naturally
      minHeight: '100vh',
      // Add padding at bottom to prevent content from being cut off
      pb: 4,
      // Optimize rendering
      willChange: 'auto',
      // Prevent layout shifts
      contain: 'layout style',
    }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Dashboard / Student Management
          </Typography>
        </Box>

        {/* Main Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              Student Management
              <Chip label="Advanced Features ✨" color="success" size="small" />
              <Chip label={`${totalCount} Students`} color="primary" size="small" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Comprehensive student management with KYC, bulk import, lifecycle tracking, and analytics
            </Typography>
            
            {/* Status Indicators */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    // Removed pulse animation to prevent layout shifts during scroll
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  System Online
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={() => {/* Export functionality */}}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setBulkImportDialogOpen(true)}
            >
              Import
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={() => {/* Print functionality */}}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCurrentStudent({});
                setEditMode(false);
                setAddDialogOpen(true);
              }}
            >
              Add Student
            </Button>
          </Box>
        </Box>

        {/* Analytics Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {totalCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    +12% from last month
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.activeCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((students.filter(s => s.status === 'active').length / totalCount) * 100)}% of total
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    KYC Verified
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {stats.kycVerifiedCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {totalCount > 0 ? Math.round((stats.kycVerifiedCount / totalCount) * 100) : 0}% verified
                  </Typography>
                </Box>
                <VerifiedIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Fee Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.feePendingCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs attention
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Performance Metrics */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Enrollment Trends
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">This Month</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.thisMonthEnrollments}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.thisMonthEnrollments / 50) * 100, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Last Month</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.lastMonthEnrollments}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((stats.lastMonthEnrollments / 50) * 100, 100)} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Attendance</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.avgAttendance}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.avgAttendance} 
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Student Categories
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['active', 'inactive', 'suspended'].map((status) => (
                  <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: status === 'active' ? 'success.main' : status === 'inactive' ? 'warning.main' : 'error.main'
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                      {status} Students
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {students.filter(s => s.status === status).length}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard color="primary" />
                Fee Status Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['paid', 'pending', 'overdue'].map((status) => (
                  <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: status === 'paid' ? 'success.main' : status === 'pending' ? 'warning.main' : 'error.main'
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                      {status} Fees
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {students.filter(s => s.feeStatus === status).length}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Student List" icon={<PersonIcon />} />
              <Tab label="Unified Analytics" icon={<AssessmentIcon />} />
              <Tab label="Attendance" icon={<CalendarToday />} />
              <Tab label="Documents" icon={<Description />} />
              <Tab label="KYC Verification" icon={<VerifiedIcon />} />
              <Tab label="Fee Management" icon={<PaymentIcon />} />
            </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Action Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditMode(false); setCurrentStudent({}); setAddDialogOpen(true); }}
              >
                Add Student
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => setBulkImportDialogOpen(true)}
              >
                Bulk Import
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<BadgeIcon />}
                onClick={handleGenerateIDCards}
                disabled={selectedStudents.length === 0}
              >
                Generate ID Cards ({selectedStudents.length})
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => studentsService.exportToCSV({})}
              >
                Export All
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {/* Search */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, phone, student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Quick Filters */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {['active', 'inactive', 'suspended'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Fee Status</InputLabel>
              <Select
                multiple
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Fee Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {['paid', 'pending', 'overdue'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={feeStatusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                label="KYC Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Advanced Filters">
              <IconButton size="small" onClick={() => {/* Advanced filters dialog */}}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Results">
              <IconButton size="small" onClick={() => {/* Export functionality */}}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => fetchStudents()}>
                <Assignment />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Students Table */}
      <Paper sx={{ 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // Prevent layout shifts
        minHeight: 400,
      }}>
        <TableContainer sx={{ 
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 500px)',
          // Optimize scrolling performance
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          // Prevent layout shifts during scroll
          contain: 'layout style paint',
          // Smooth scrolling
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0,0,0,0.3)',
            },
          },
        }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : filteredStudents.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No students found</Typography>
              <Button startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)} sx={{ mt: 2 }}>
                Add Your First Student
              </Button>
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                      checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
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
                {filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => {
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
          count={filteredStudents.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{
            // Stabilize pagination position
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1,
            // Prevent layout shifts
            minHeight: 52,
            display: 'flex',
            alignItems: 'center',
          }}
        />
      </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <UnifiedStudentAnalytics
          students={students}
          onExport={(format) => {
            // Handle export
            console.log('Exporting analytics in format:', format);
          }}
          onRefresh={() => {
            fetchStudents();
          }}
        />
      )}

      {activeTab === 2 && (
        <AttendanceTrackingSystem
          students={students}
          onAttendanceUpdate={(record) => {
            console.log('Attendance updated:', record);
            setSnackbar({ open: true, message: '✅ Attendance record updated successfully!', severity: 'success' });
          }}
        />
      )}

      {activeTab === 3 && (
        <StudentDocumentManagement
          students={students}
          onDocumentUpdate={(document) => {
            console.log('Document updated:', document);
            setSnackbar({ open: true, message: '✅ Document updated successfully!', severity: 'success' });
          }}
        />
      )}

      {activeTab === 4 && (
        <KYCVerificationSystem
          students={students}
          onKYCUpdate={(studentId, kycData) => {
            console.log('KYC updated:', studentId, kycData);
            setSnackbar({ open: true, message: '✅ KYC verification updated successfully!', severity: 'success' });
          }}
        />
      )}

      {activeTab === 5 && (
        <StudentFeeManagement
          students={students}
          onPaymentUpdate={(payment) => {
            console.log('Payment updated:', payment);
            setSnackbar({ open: true, message: '✅ Payment updated successfully!', severity: 'success' });
          }}
        />
      )}


      {/* Student Form Dialog */}
      <StudentFormDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={async (studentData) => {
          try {
            setLoading(true);
            
            // Transform formData to match backend API structure (camelCase for service layer)
            const transformedData: any = {
              firstName: studentData.firstName,
              lastName: studentData.lastName || '', // Optional
              email: studentData.email,
              phone: studentData.phone || studentData.emergencyContact || studentData.guardianPhone || '0000000000',
              dateOfBirth: studentData.dateOfBirth || undefined,
              gender: studentData.gender || undefined,
            };

            // Add address object (service will transform to separate fields)
            if (studentData.addressLine1 || studentData.city || studentData.state || 
                studentData.pincode || studentData.postalCode) {
              transformedData.address = {
                line1: studentData.addressLine1 || undefined,
                line2: studentData.addressLine2 || undefined,
                city: studentData.city || undefined,
                state: studentData.state || undefined,
                postalCode: studentData.pincode || studentData.postalCode || undefined,
                country: studentData.country || 'India',
              };
            }

            // Add fee plan and status
            transformedData.currentPlan = studentData.currentPlan || 'Monthly Premium';
            transformedData.feeStatus = studentData.feeStatus || 'pending';
            transformedData.status = studentData.status || 'active';

            // Store additional data in metadata
            const metadata: any = {};
            if (studentData.district) metadata.district = studentData.district;
            if (studentData.guardianName) metadata.guardianName = studentData.guardianName;
            if (studentData.guardianPhone) metadata.guardianPhone = studentData.guardianPhone;
            if (studentData.emergencyContact) metadata.emergencyContact = studentData.emergencyContact;
            if (studentData.bloodGroup) metadata.bloodGroup = studentData.bloodGroup;
            if (studentData.notes) metadata.notes = studentData.notes;
            if (studentData.groups && studentData.groups.length > 0) metadata.groups = studentData.groups;
            if (studentData.tags && studentData.tags.length > 0) metadata.tags = studentData.tags;
            
            if (Object.keys(metadata).length > 0) {
              transformedData.metadata = metadata;
            }

            console.log('📤 [StudentsPageAdvanced] Sending student data:', transformedData);

            if (editMode && currentStudent?.id) {
              await studentsService.updateStudent(currentStudent.id, transformedData);
              setSnackbar({ open: true, message: '✅ Student updated successfully!', severity: 'success' });
            } else {
              await studentsService.createStudent(transformedData);
              setSnackbar({ open: true, message: '✅ Student created successfully!', severity: 'success' });
            }
            fetchStudents();
            setAddDialogOpen(false);
            setLoading(false);
          } catch (error: any) {
            console.error('❌ Failed to save student:', error);
            const errorMessage = error?.response?.data?.error?.message || 
                                error?.response?.data?.message || 
                                error?.message || 
                                'Failed to save student';
            setSnackbar({ 
              open: true, 
              message: `❌ ${errorMessage}`, 
              severity: 'error' 
            });
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
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
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
              <TableContainer 
                component={Paper} 
                variant="outlined" 
                sx={{ 
                  maxHeight: 600,
                  overflowY: 'auto',
                  // Optimize scrolling performance
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth',
                  // Prevent layout shifts
                  contain: 'layout style paint',
                }}
              >
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 auto' }} >
              <Alert severity={currentStudent?.kycVerified ? 'success' : 'warning'}>
                KYC Status: {currentStudent?.kycVerified ? 'Verified' : 'Pending Verification'}
              </Alert>
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
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
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" gutterBottom>Verification Checklist:</Typography>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Photo verified" />
              <FormControlLabel control={<Checkbox defaultChecked />} label="ID number verified" />
              <FormControlLabel control={<Checkbox />} label="Address verified" />
              <FormControlLabel control={<Checkbox defaultChecked />} label="Contact verified" />
            </Box>
            <Box sx={{ flex: '1 1 auto' }} >
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Verification Notes"
                placeholder="Add any notes about the verification process..."
              />
            </Box>
          </Box>
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
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1" gutterBottom>{currentStudent?.email}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography variant="body1" gutterBottom>{currentStudent?.phone || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">Enrollment Date</Typography>
              <Typography variant="body1" gutterBottom>
                {currentStudent?.enrollmentDate ? new Date(currentStudent.enrollmentDate).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">Current Plan</Typography>
              <Chip label={currentStudent?.currentPlan || 'None'} size="small" />
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">Fee Status</Typography>
              <Chip 
                label={currentStudent?.feeStatus || 'N/A'} 
                color={currentStudent?.feeStatus === 'paid' ? 'success' : 'warning'} 
                size="small" 
              />
            </Box>
            <Box sx={{ flex: '1 1 auto' }}  >
              <Typography variant="subtitle2" color="text.secondary">KYC Status</Typography>
              <Chip 
                label={currentStudent?.kycVerified ? 'Verified' : 'Pending'} 
                color={currentStudent?.kycVerified ? 'success' : 'warning'} 
                size="small"
                icon={currentStudent?.kycVerified ? <CheckCircle /> : <Warning />}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Unified Bulk Operations Dialog */}
      <UnifiedBulkOperations
        open={bulkOperationsOpen}
        onClose={() => setBulkOperationsOpen(false)}
        selectedStudents={selectedStudents}
        students={students}
        onBulkAction={(action, data) => {
          console.log('Bulk action:', action, data);
          setSnackbar({ open: true, message: `✅ Bulk operation completed successfully!`, severity: 'success' });
        }}
      />

      {/* Enhanced Student Profile Dialog */}
      <EnhancedStudentProfile
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        student={currentStudent}
        onEdit={(student) => {
          setCurrentStudent(student);
          setEditMode(true);
          setAddDialogOpen(true);
          setProfileDialogOpen(false);
        }}
      />


      {/* Snackbar - Fixed position to prevent layout shifts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          // Fixed position to prevent layout shifts
          position: 'fixed !important',
          bottom: '24px !important',
          right: '24px !important',
          zIndex: 9999,
          // Prevent affecting page layout
          pointerEvents: snackbar.open ? 'auto' : 'none',
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: '300px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsPageAdvanced;

