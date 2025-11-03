import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Alert,
  Stack,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  School as SchoolIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  AttachFile as AttachFileIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  ContactPhone as ContactPhoneIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';

interface EnhancedStudentProfileProps {
  open: boolean;
  onClose: () => void;
  student: any;
  onEdit?: (student: any) => void;
}

const EnhancedStudentProfile: React.FC<EnhancedStudentProfileProps> = ({
  open,
  onClose,
  student,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      case 'graduated': return 'info';
      default: return 'default';
    }
  };

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'partial': return 'info';
      default: return 'default';
    }
  };

  const getKYCStatus = () => {
    if (student.kycVerified) {
      return <Chip label="Verified" color="success" size="small" icon={<CheckCircleIcon />} />;
    }
    return <Chip label="Pending" color="warning" size="small" icon={<WarningIcon />} />;
  };

  const mockActivity = [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:30 AM',
      type: 'enrollment',
      title: 'Student Enrolled',
      description: 'Student successfully enrolled in the library system',
      icon: <PersonIcon />,
      color: 'success',
    },
    {
      id: 2,
      date: '2024-01-16',
      time: '2:15 PM',
      type: 'kyc',
      title: 'KYC Verification',
      description: 'KYC documents submitted and verified',
      icon: <SecurityIcon />,
      color: 'info',
    },
    {
      id: 3,
      date: '2024-01-20',
      time: '9:00 AM',
      type: 'payment',
      title: 'Fee Payment',
      description: 'Monthly fee payment received',
      icon: <CreditCardIcon />,
      color: 'success',
    },
    {
      id: 4,
      date: '2024-01-25',
      time: '11:45 AM',
      type: 'visit',
      title: 'Library Visit',
      description: 'Student visited library for study session',
      icon: <SchoolIcon />,
      color: 'primary',
    },
  ];

  const mockDocuments = [
    { id: 1, name: 'Aadhar Card', type: 'identity', status: 'verified', uploadedDate: '2024-01-16' },
    { id: 2, name: 'Passport Photo', type: 'photo', status: 'verified', uploadedDate: '2024-01-16' },
    { id: 3, name: 'Address Proof', type: 'address', status: 'pending', uploadedDate: '2024-01-17' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            Student Profile
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Student">
              <IconButton onClick={() => onEdit?.(student)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Profile">
              <IconButton>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Profile">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Header Section */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Chip 
                  label={student.status} 
                  color={getStatusColor(student.status) as any}
                  size="small"
                  sx={{ color: 'white' }}
                />
              }
            >
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                {student.firstName?.[0]}{student.lastName?.[0]}
              </Avatar>
            </Badge>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Student ID: {student.studentId}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={student.feeStatus} 
                  color={getFeeStatusColor(student.feeStatus) as any}
                  size="small"
                  sx={{ color: 'white' }}
                />
                {getKYCStatus()}
                {student.currentPlan && (
                  <Chip 
                    label={student.currentPlan} 
                    color="info"
                    size="small"
                    sx={{ color: 'white' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" icon={<PersonIcon />} />
            <Tab label="Academic" icon={<SchoolIcon />} />
            <Tab label="Financial" icon={<CreditCardIcon />} />
            <Tab label="Documents" icon={<AttachFileIcon />} />
            <Tab label="Activity" icon={<TimelineIcon />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Personal Information */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      Personal Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={student.email}
                        />
                      </ListItem>
                      {student.phone && (
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={student.phone}
                          />
                        </ListItem>
                      )}
                      {student.dateOfBirth && (
                        <ListItem>
                          <ListItemIcon>
                            <CalendarTodayIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date of Birth"
                            secondary={new Date(student.dateOfBirth).toLocaleDateString()}
                          />
                        </ListItem>
                      )}
                      {student.gender && (
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Gender"
                            secondary={student.gender}
                          />
                        </ListItem>
                      )}
                      {student.bloodGroup && (
                        <ListItem>
                          <ListItemIcon>
                            <LocalHospitalIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Blood Group"
                            secondary={student.bloodGroup}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Contact Information */}
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ContactPhoneIcon color="primary" />
                      Contact Information
                    </Typography>
                    <List dense>
                      {student.address && (
                        <ListItem>
                          <ListItemIcon>
                            <LocationOnIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Address"
                            secondary={
                              <Box>
                                {student.address.line1 && <Typography variant="body2">{student.address.line1}</Typography>}
                                {student.address.city && <Typography variant="body2">{student.address.city}</Typography>}
                                {student.address.state && <Typography variant="body2">{student.address.state}</Typography>}
                                {student.address.postalCode && <Typography variant="body2">{student.address.postalCode}</Typography>}
                              </Box>
                            }
                          />
                        </ListItem>
                      )}
                      {student.guardianName && (
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Guardian Name"
                            secondary={student.guardianName}
                          />
                        </ListItem>
                      )}
                      {student.guardianPhone && (
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Guardian Phone"
                            secondary={student.guardianPhone}
                          />
                        </ListItem>
                      )}
                      {student.emergencyContact && (
                        <ListItem>
                          <ListItemIcon>
                            <ContactPhoneIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Emergency Contact"
                            secondary={student.emergencyContact}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Academic Progress */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="primary" />
                  Academic Progress
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {student.attendancePercentage || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Rate
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={student.attendancePercentage || 0} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {student.totalFeesPaid || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Fees Paid
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {student.outstandingBalance || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding Balance
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Information
              </Typography>
              <Alert severity="info">
                Academic records, course enrollment, grades, and performance metrics would be displayed here.
              </Alert>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Information
              </Typography>
              <Alert severity="info">
                Payment history, fee structure, outstanding balances, and financial reports would be displayed here.
              </Alert>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon color="primary" />
                Documents & Certificates
              </Typography>
              <List>
                {mockDocuments.map((doc) => (
                  <ListItem key={doc.id} divider>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.name}
                      secondary={`Uploaded: ${new Date(doc.uploadedDate).toLocaleDateString()}`}
                    />
                    <Chip 
                      label={doc.status} 
                      color={doc.status === 'verified' ? 'success' : 'warning'}
                      size="small"
                    />
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="primary" />
                Activity Timeline
              </Typography>
              <Timeline>
                {mockActivity.map((activity, index) => (
                  <TimelineItem key={activity.id}>
                    <TimelineOppositeContent
                      sx={{ m: 'auto 0' }}
                      align="right"
                      variant="body2"
                      color="text.secondary"
                    >
                      {activity.date}
                      <br />
                      {activity.time}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot color={activity.color as any}>
                        {activity.icon}
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                      <Typography variant="h6" component="span">
                        {activity.title}
                      </Typography>
                      <Typography>{activity.description}</Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => onEdit?.(student)}
        >
          Edit Student
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedStudentProfile;
