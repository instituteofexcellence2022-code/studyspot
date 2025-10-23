import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckInIcon,
  ExitToApp as CheckOutIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

// Mock attendance data
const MOCK_ATTENDANCE = [
  {
    id: 1,
    studentName: 'Rajesh Kumar',
    seatNumber: 'A01',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    duration: '8h 0m',
    status: 'checked-out',
    date: '2025-10-23',
  },
  {
    id: 2,
    studentName: 'Priya Sharma',
    seatNumber: 'B05',
    checkIn: '10:30 AM',
    checkOut: '-',
    duration: '2h 30m',
    status: 'checked-in',
    date: '2025-10-23',
  },
  {
    id: 3,
    studentName: 'Amit Patel',
    seatNumber: 'C12',
    checkIn: '08:00 AM',
    checkOut: '-',
    duration: '5h 0m',
    status: 'checked-in',
    date: '2025-10-23',
  },
];

interface AttendanceRecord {
  id: number;
  studentName: string;
  seatNumber: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: string;
  date: string;
}

const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkType, setCheckType] = useState<'in' | 'out'>('in');
  const [newRecord, setNewRecord] = useState({
    studentName: '',
    seatNumber: '',
    checkIn: '',
    checkOut: '',
  });

  const handleCheckIn = () => {
    const record: AttendanceRecord = {
      id: records.length + 1,
      studentName: newRecord.studentName,
      seatNumber: newRecord.seatNumber,
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      checkOut: '-',
      duration: '0h 0m',
      status: 'checked-in',
      date: new Date().toISOString().split('T')[0],
    };
    setRecords([...records, record]);
    setDialogOpen(false);
    setNewRecord({ studentName: '', seatNumber: '', checkIn: '', checkOut: '' });
  };

  const getStatusColor = (status: string) => {
    return status === 'checked-in' ? 'success' : 'default';
  };

  const todayCount = records.filter(r => r.date === new Date().toISOString().split('T')[0]).length;
  const checkedInCount = records.filter(r => r.status === 'checked-in').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Attendance Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setCheckType('in'); setDialogOpen(true); }}
        >
          Manual Check-In
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckInIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Visitors Today
                </Typography>
              </Box>
              <Typography variant="h4">{todayCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Currently Active
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {checkedInCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckOutIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Checked Out
                </Typography>
              </Box>
              <Typography variant="h4">{todayCount - checkedInCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimeIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Avg. Duration
                </Typography>
              </Box>
              <Typography variant="h4">6h 15m</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Seat</TableCell>
              <TableCell>Check-In</TableCell>
              <TableCell>Check-Out</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {record.studentName.charAt(0)}
                    </Avatar>
                    {record.studentName}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={record.seatNumber} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell>{record.duration}</TableCell>
                <TableCell>
                  <Chip
                    label={record.status}
                    size="small"
                    color={getStatusColor(record.status) as any}
                  />
                </TableCell>
                <TableCell>{record.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Manual Entry Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manual Check-In</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Student Name"
              value={newRecord.studentName}
              onChange={(e) => setNewRecord({ ...newRecord, studentName: e.target.value })}
              placeholder="e.g., Rajesh Kumar"
              fullWidth
              required
            />
            <TextField
              select
              label="Seat Number"
              value={newRecord.seatNumber}
              onChange={(e) => setNewRecord({ ...newRecord, seatNumber: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="A01">A01 - AC Zone</MenuItem>
              <MenuItem value="A02">A02 - AC Zone</MenuItem>
              <MenuItem value="B05">B05 - Non-AC Zone</MenuItem>
              <MenuItem value="C12">C12 - Quiet Zone</MenuItem>
            </TextField>
            <Typography variant="caption" color="text.secondary">
              Check-in time will be recorded as current time: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCheckIn}
            variant="contained"
            disabled={!newRecord.studentName || !newRecord.seatNumber}
          >
            Check-In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendancePage;

