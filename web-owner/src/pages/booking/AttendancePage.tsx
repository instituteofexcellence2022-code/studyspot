import React, { useState, useMemo } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Avatar, FormControl, InputLabel, Select,
  Checkbox, ListItemText, OutlinedInput, CircularProgress, Alert, Snackbar,
  Tooltip, IconButton, InputAdornment, TablePagination, TableSortLabel,
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  CheckCircle as CheckInIcon, ExitToApp as CheckOutIcon, Add as AddIcon,
  AccessTime as TimeIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, FileDownload as ExportIcon,
} from '@mui/icons-material';

const INITIAL_ATTENDANCE = [
  { id: 1, studentName: 'Rajesh Kumar', seatNumber: 'A01', checkIn: '09:00 AM', checkOut: '05:00 PM', duration: '8h 0m', status: 'checked-out', date: '2025-10-23' },
  { id: 2, studentName: 'Priya Sharma', seatNumber: 'B05', checkIn: '10:30 AM', checkOut: '-', duration: '2h 30m', status: 'checked-in', date: '2025-10-23' },
  { id: 3, studentName: 'Amit Patel', seatNumber: 'C12', checkIn: '08:00 AM', checkOut: '-', duration: '5h 0m', status: 'checked-in', date: '2025-10-23' },
  { id: 4, studentName: 'Sneha Reddy', seatNumber: 'A03', checkIn: '11:00 AM', checkOut: '03:00 PM', duration: '4h 0m', status: 'checked-out', date: '2025-10-22' },
  { id: 5, studentName: 'Vikram Singh', seatNumber: 'B02', checkIn: '09:30 AM', checkOut: '06:30 PM', duration: '9h 0m', status: 'checked-out', date: '2025-10-22' },
  { id: 6, studentName: 'Anita Desai', seatNumber: 'C01', checkIn: '08:30 AM', checkOut: '04:30 PM', duration: '8h 0m', status: 'checked-out', date: '2025-10-21' },
];

interface AttendanceRecord {
  id: number; studentName: string; seatNumber: string; checkIn: string;
  checkOut: string; duration: string; status: string; date: string;
}

type SortField = keyof AttendanceRecord;
type SortOrder = 'asc' | 'desc';

const AttendancePageEnhanced: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [currentRecord, setCurrentRecord] = useState<Partial<AttendanceRecord>>({
    studentName: '', seatNumber: '', checkIn: '', checkOut: '', status: 'checked-in', date: new Date().toISOString().split('T')[0]
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [errors, setErrors] = useState<Partial<Record<keyof AttendanceRecord, string>>>({});

  const validateRecord = (record: Partial<AttendanceRecord>): boolean => {
    const newErrors: Partial<Record<keyof AttendanceRecord, string>> = {};
    if (!record.studentName || record.studentName.trim().length < 2) newErrors.studentName = 'Student name required';
    if (!record.seatNumber || record.seatNumber.trim().length < 2) newErrors.seatNumber = 'Seat number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesSearch = searchTerm === '' || record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || record.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(record.status);
      const matchesDate = !dateFilter || record.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [records, searchTerm, statusFilter, dateFilter, sortField, sortOrder]);

  const paginatedRecords = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecords, page, rowsPerPage]);

  const handleOpenDialog = (record?: AttendanceRecord) => {
    if (record) {
      setEditMode(true);
      setCurrentRecord(record);
    } else {
      setEditMode(false);
      setCurrentRecord({ studentName: '', seatNumber: '', checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), checkOut: '-', status: 'checked-in', date: new Date().toISOString().split('T')[0], duration: '0h 0m' });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleSaveRecord = () => {
    if (!validateRecord(currentRecord)) {
      setSnackbar({ open: true, message: 'Please fix validation errors', severity: 'error' });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      if (editMode && currentRecord.id) {
        setRecords(records.map(r => r.id === currentRecord.id ? currentRecord as AttendanceRecord : r));
        setSnackbar({ open: true, message: 'Attendance updated!', severity: 'success' });
      } else {
        const newRecord: AttendanceRecord = { id: Math.max(...records.map(r => r.id), 0) + 1, ...currentRecord as Omit<AttendanceRecord, 'id'> };
        setRecords([...records, newRecord]);
        setSnackbar({ open: true, message: 'Attendance recorded!', severity: 'success' });
      }
      setDialogOpen(false);
      setLoading(false);
    }, 500);
  };

  const handleDeleteClick = (record: AttendanceRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      setLoading(true);
      setTimeout(() => {
        setRecords(records.filter(r => r.id !== recordToDelete.id));
        setSnackbar({ open: true, message: 'Record deleted!', severity: 'success' });
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
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
    const headers = ['ID', 'Student', 'Seat', 'Check-In', 'Check-Out', 'Duration', 'Status', 'Date'];
    const csvContent = [headers.join(','), ...filteredRecords.map(r => [r.id, r.studentName, r.seatNumber, r.checkIn, r.checkOut, r.duration, r.status, r.date].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Attendance exported!', severity: 'success' });
  };

  const getStatusColor = (status: string) => status === 'checked-in' ? 'success' : 'default';
  const todayCount = records.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
  const checkedInCount = records.filter(r => r.status === 'checked-in').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Attendance Management <Chip label="Enhanced @ 60%" color="primary" size="small" sx={{ ml: 2 }} /></Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} disabled={filteredRecords.length === 0}>Export CSV</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Manual Check-In</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CheckInIcon sx={{ color: 'success.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Visitors Today</Typography></Box><Typography variant="h4">{todayCount}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><TimeIcon sx={{ color: 'primary.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Currently Active</Typography></Box><Typography variant="h4" color="success.main">{checkedInCount}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CheckOutIcon sx={{ color: 'text.secondary', mr: 1 }} /><Typography variant="body2" color="text.secondary">Checked Out</Typography></Box><Typography variant="h4">{todayCount - checkedInCount}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><TimeIcon sx={{ color: 'warning.main', mr: 1 }} /><Typography variant="body2" color="text.secondary">Total Records</Typography></Box><Typography variant="h4">{records.length}</Typography><Typography variant="caption" color="text.secondary">Showing: {filteredRecords.length}</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField fullWidth placeholder="Search by student name or seat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select multiple value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as string[])} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(', ')}>
                {['checked-in', 'checked-out'].map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={statusFilter.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth type="date" label="Filter by Date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <Button fullWidth variant="outlined" onClick={() => { setSearchTerm(''); setStatusFilter([]); setDateFilter(''); }}>Clear Filters</Button>
          </Grid>
        </Grid>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><TableSortLabel active={sortField === 'studentName'} direction={sortField === 'studentName' ? sortOrder : 'asc'} onClick={() => handleSort('studentName')}>Student</TableSortLabel></TableCell>
              <TableCell><TableSortLabel active={sortField === 'seatNumber'} direction={sortField === 'seatNumber' ? sortOrder : 'asc'} onClick={() => handleSort('seatNumber')}>Seat</TableSortLabel></TableCell>
              <TableCell><TableSortLabel active={sortField === 'checkIn'} direction={sortField === 'checkIn' ? sortOrder : 'asc'} onClick={() => handleSort('checkIn')}>Check-In</TableSortLabel></TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell><TableSortLabel active={sortField === 'duration'} direction={sortField === 'duration' ? sortOrder : 'asc'} onClick={() => handleSort('duration')}>Duration</TableSortLabel></TableCell>
              <TableCell>Status</TableCell>
              <TableCell><TableSortLabel active={sortField === 'date'} direction={sortField === 'date' ? sortOrder : 'asc'} onClick={() => handleSort('date')}>Date</TableSortLabel></TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>{record.studentName.charAt(0)}</Avatar>{record.studentName}</Box></TableCell>
                <TableCell><Chip label={record.seatNumber} size="small" variant="outlined" /></TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell>{record.duration}</TableCell>
                <TableCell><Chip label={record.status} size="small" color={getStatusColor(record.status) as any} /></TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(record)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(record)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedRecords.length === 0 && (<TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No records found.</Typography></TableCell></TableRow>)}
          </TableBody>
        </Table>
        <TablePagination component="div" count={filteredRecords.length} page={page} onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25, 50]} />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Attendance' : 'Manual Check-In'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Student Name" value={currentRecord.studentName} onChange={(e) => setCurrentRecord({ ...currentRecord, studentName: e.target.value })} fullWidth required error={!!errors.studentName} helperText={errors.studentName} />
            <TextField label="Seat Number" value={currentRecord.seatNumber} onChange={(e) => setCurrentRecord({ ...currentRecord, seatNumber: e.target.value })} fullWidth required error={!!errors.seatNumber} helperText={errors.seatNumber} />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={currentRecord.status} onChange={(e) => setCurrentRecord({ ...currentRecord, status: e.target.value })} label="Status">
                <MenuItem value="checked-in">Checked In</MenuItem>
                <MenuItem value="checked-out">Checked Out</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSaveRecord} variant="contained" disabled={loading || !currentRecord.studentName || !currentRecord.seatNumber} startIcon={loading ? <CircularProgress size={20} /> : null}>
            {editMode ? 'Update' : 'Check-In'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Delete record for <strong>{recordToDelete?.studentName}</strong>?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendancePageEnhanced;

