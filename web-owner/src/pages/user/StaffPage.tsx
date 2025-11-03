import React, { useState, useMemo } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Avatar, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel,
  Select, Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert,
  Snackbar, Tooltip, IconButton, InputAdornment, TablePagination, TableSortLabel,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Add as AddIcon, Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon,
} from '@mui/icons-material';

const INITIAL_STAFF = [
  { id: 1, name: 'Suresh Gupta', email: 'suresh@studyspot.com', phone: '+91 98765 11111', role: 'Branch Manager', department: 'Operations', status: 'active', joinDate: '2024-01-15' },
  { id: 2, name: 'Meena Reddy', email: 'meena@studyspot.com', phone: '+91 98765 22222', role: 'Front Desk Staff', department: 'Customer Service', status: 'active', joinDate: '2024-02-20' },
  { id: 3, name: 'Ravi Kumar', email: 'ravi@studyspot.com', phone: '+91 98765 33333', role: 'Facility Manager', department: 'Maintenance', status: 'inactive', joinDate: '2023-12-10' },
  { id: 4, name: 'Anjali Sharma', email: 'anjali@studyspot.com', phone: '+91 98765 44444', role: 'Finance Manager', department: 'Finance', status: 'active', joinDate: '2024-03-01' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@studyspot.com', phone: '+91 98765 55555', role: 'Front Desk Staff', department: 'Customer Service', status: 'active', joinDate: '2025-01-10' },
];

interface Staff {
  id: number; name: string; email: string; phone: string; role: string;
  department: string; status: string; joinDate: string;
}

type SortField = keyof Staff;
type SortOrder = 'asc' | 'desc';

const StaffPageEnhanced: React.FC = () => {
  // Load staff from localStorage (from onboarding) or use initial data
  const getInitialStaff = () => {
    try {
      const onboardingStaff = localStorage.getItem('onboardingStaffData');
      if (onboardingStaff) {
        const parsedStaff = JSON.parse(onboardingStaff);
        // Convert onboarding staff format to main staff format
        return parsedStaff.map((s: any) => ({
          id: parseInt(s.id) || Date.now(),
          name: s.name,
          email: s.email,
          phone: s.phone || '',
          role: s.role,
          department: s.department || 'General',
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error loading onboarding staff data:', error);
    }
    return INITIAL_STAFF;
  };

  const [staff, setStaff] = useState<Staff[]>(getInitialStaff());
  
  // Sync staff changes to localStorage
  const syncStaffToStorage = (updatedStaff: Staff[]) => {
    try {
      localStorage.setItem('onboardingStaffData', JSON.stringify(updatedStaff));
    } catch (error) {
      console.error('Error syncing staff data:', error);
    }
  };
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Partial<Staff>>({
    name: '', email: '', phone: '', role: 'Front Desk Staff', department: 'Customer Service', status: 'active', joinDate: new Date().toISOString().split('T')[0]
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Partial<Record<keyof Staff, string>>>({});

  const validateStaff = (staff: Partial<Staff>): boolean => {
    const newErrors: Partial<Record<keyof Staff, string>> = {};
    if (!staff.name || staff.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!staff.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staff.email)) newErrors.email = 'Valid email required';
    if (!staff.phone || staff.phone.trim().length < 10) newErrors.phone = 'Valid phone number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredStaff = useMemo(() => {
    let filtered = staff.filter(member => {
      const matchesSearch = searchTerm === '' || member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter.length === 0 || roleFilter.includes(member.role);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(member.status);
      const matchesDepartment = departmentFilter.length === 0 || departmentFilter.includes(member.department);
      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
    
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [staff, searchTerm, roleFilter, statusFilter, departmentFilter, sortField, sortOrder]);

  const paginatedStaff = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStaff.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStaff, page, rowsPerPage]);

  const handleOpenDialog = (member?: Staff) => {
    if (member) {
      setEditMode(true);
      setCurrentStaff(member);
    } else {
      setEditMode(false);
      setCurrentStaff({ name: '', email: '', phone: '', role: 'Front Desk Staff', department: 'Customer Service', status: 'active', joinDate: new Date().toISOString().split('T')[0] });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!validateStaff(currentStaff)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      let updatedStaff: Staff[];
      if (editMode && currentStaff.id) {
        updatedStaff = staff.map(s => s.id === currentStaff.id ? currentStaff as Staff : s);
        setStaff(updatedStaff);
        setSnackbar({ open: true, message: 'Staff updated!', severity: 'success' });
      } else {
        const newStaff: Staff = { id: Math.max(...staff.map(s => s.id), 0) + 1, ...currentStaff as Omit<Staff, 'id'> };
        updatedStaff = [...staff, newStaff];
        setStaff(updatedStaff);
        setSnackbar({ open: true, message: 'Staff added!', severity: 'success' });
      }
      // Sync to localStorage
      syncStaffToStorage(updatedStaff);
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (member: Staff) => {
    setStaffToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (staffToDelete) {
      setLoading(true);
      setTimeout(() => {
        const updatedStaff = staff.filter(s => s.id !== staffToDelete.id);
        setStaff(updatedStaff);
        // Sync to localStorage
        syncStaffToStorage(updatedStaff);
        setSnackbar({ open: true, message: 'Staff removed!', severity: 'success' });
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
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
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Join Date'];
    const csvContent = [headers.join(','), ...filteredStaff.map(s => [s.id, s.name, s.email, s.phone, s.role, s.department, s.status, s.joinDate].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Staff list exported!', severity: 'success' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Branch Manager': return 'error';
      case 'Finance Manager': return 'warning';
      case 'Facility Manager': return 'info';
      default: return 'default';
    }
  };

  const activeStaff = staff.filter(s => s.status === 'active').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Staff Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} /></Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} disabled={filteredStaff.length === 0}>Export CSV</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Staff</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PersonIcon sx={{ color: 'primary.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Total Staff</Typography></Box><Typography variant="h4">{staff.length}</Typography><Typography variant="caption" color="text.secondary">Showing: {filteredStaff.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PersonIcon sx={{ color: 'success.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Active Staff</Typography></Box><Typography variant="h4" color="success.main">{activeStaff}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PersonIcon sx={{ color: 'text.secondary', mr: 1 }} /><Typography variant="body2" color="text.secondary">Managers</Typography></Box><Typography variant="h4">{staff.filter(s => s.role.includes('Manager')).length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PersonIcon sx={{ color: 'text.secondary', mr: 1 }} /><Typography variant="body2" color="text.secondary">Departments</Typography></Box><Typography variant="h4">{new Set(staff.map(s => s.department)).size}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select multiple value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as string[])} input={<OutlinedInput label="Role" />} renderValue={(selected) => `${selected.length} selected`}>
                {['Branch Manager', 'Front Desk Staff', 'Facility Manager', 'Finance Manager'].map((role) => (
                  <MenuItem key={role} value={role}>
                    <Checkbox checked={roleFilter.indexOf(role) > -1} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select multiple value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value as string[])} input={<OutlinedInput label="Department" />} renderValue={(selected) => `${selected.length} selected`}>
                {['Operations', 'Customer Service', 'Maintenance', 'Finance'].map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    <Checkbox checked={departmentFilter.indexOf(dept) > -1} />
                    <ListItemText primary={dept} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select multiple value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as string[])} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(', ')}>
                {['active', 'inactive'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button fullWidth variant="outlined" onClick={() => { setSearchTerm(''); setRoleFilter([]); setStatusFilter([]); setDepartmentFilter([]); }}>Clear Filters</Button>
          </Grid>
        </Grid>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortOrder : 'asc'} onClick={() => handleSort('name')}>Name</TableSortLabel></TableCell>
              <TableCell>Contact</TableCell>
              <TableCell><TableSortLabel active={sortField === 'role'} direction={sortField === 'role' ? sortOrder : 'asc'} onClick={() => handleSort('role')}>Role</TableSortLabel></TableCell>
              <TableCell><TableSortLabel active={sortField === 'department'} direction={sortField === 'department' ? sortOrder : 'asc'} onClick={() => handleSort('department')}>Department</TableSortLabel></TableCell>
              <TableCell>Status</TableCell>
              <TableCell><TableSortLabel active={sortField === 'joinDate'} direction={sortField === 'joinDate' ? sortOrder : 'asc'} onClick={() => handleSort('joinDate')}>Join Date</TableSortLabel></TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStaff.map((member) => (
              <TableRow key={member.id} hover>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{member.name.charAt(0)}</Avatar><Box><Typography variant="body2" fontWeight="bold">{member.name}</Typography></Box></Box></TableCell>
                <TableCell><Typography variant="body2">{member.email}</Typography><Typography variant="caption" color="text.secondary">{member.phone}</Typography></TableCell>
                <TableCell><Chip label={member.role} size="small" color={getRoleColor(member.role) as any} /></TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell><Chip label={member.status} size="small" color={member.status === 'active' ? 'success' : 'default'} /></TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(member)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(member)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedStaff.length === 0 && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No staff found.</Typography></TableCell></TableRow>)}
          </TableBody>
        </Table>
        <TablePagination component="div" count={filteredStaff.length} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Full Name" value={currentStaff.name} onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })} fullWidth required error={!!errors.name} helperText={errors.name} />
            <TextField label="Email" type="email" value={currentStaff.email} onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })} fullWidth required error={!!errors.email} helperText={errors.email} />
            <TextField label="Phone" value={currentStaff.phone} onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })} fullWidth required error={!!errors.phone} helperText={errors.phone} />
            <TextField select label="Role" value={currentStaff.role} onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })} fullWidth>
              <MenuItem value="Branch Manager">Branch Manager</MenuItem>
              <MenuItem value="Front Desk Staff">Front Desk Staff</MenuItem>
              <MenuItem value="Facility Manager">Facility Manager</MenuItem>
              <MenuItem value="Finance Manager">Finance Manager</MenuItem>
            </TextField>
            <TextField select label="Department" value={currentStaff.department} onChange={(e) => setCurrentStaff({ ...currentStaff, department: e.target.value })} fullWidth>
              <MenuItem value="Operations">Operations</MenuItem>
              <MenuItem value="Customer Service">Customer Service</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </TextField>
            <TextField select label="Status" value={currentStaff.status} onChange={(e) => setCurrentStaff({ ...currentStaff, status: e.target.value })} fullWidth>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" disabled={loading || !currentStaff.name || !currentStaff.email || !currentStaff.phone} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {editMode ? 'Update' : 'Add'} Staff
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Remove <strong>{staffToDelete?.name}</strong> from staff?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffPageEnhanced;

