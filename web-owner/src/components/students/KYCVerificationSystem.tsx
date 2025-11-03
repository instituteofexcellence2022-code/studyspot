import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  ImageList,
  ImageListItem,
  Rating,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  PhotoCamera as PhotoCameraIcon,
  Fingerprint as FingerprintIcon,
  CreditCard as CreditCardIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  AutoAwesome as AutoAwesomeIcon,
  Gavel as GavelIcon,
  DocumentScanner as DocumentScannerIcon,
  Face as FaceIcon,
  Badge as BadgeIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  studentId: string;
  status: string;
  kycVerified?: boolean;
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'under_review';
  kycScore?: number;
}

interface KYCDocument {
  id: string;
  studentId: string;
  documentType: string;
  documentName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'rejected' | 'under_review';
  verificationScore: number;
  verifiedBy?: string;
  rejectionReason?: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    extractedData?: any;
    confidence?: number;
    quality?: number;
  };
}

interface KYCVerificationSystemProps {
  students: Student[];
  onKYCUpdate: (studentId: string, kycData: any) => void;
}

const KYCVerificationSystem: React.FC<KYCVerificationSystemProps> = ({
  students,
  onKYCUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<KYCDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const documentTypes = [
    {
      id: 'id_proof',
      name: 'ID Proof',
      icon: <BadgeIcon />,
      required: true,
      examples: ['Aadhar Card', 'PAN Card', 'Driving License', 'Passport'],
      color: 'primary',
    },
    {
      id: 'address_proof',
      name: 'Address Proof',
      icon: <LocationOnIcon />,
      required: true,
      examples: ['Utility Bill', 'Bank Statement', 'Rental Agreement', 'Voter ID'],
      color: 'success',
    },
    {
      id: 'photo',
      name: 'Passport Photo',
      icon: <PhotoCameraIcon />,
      required: true,
      examples: ['Recent Passport Size Photo', 'Clear Face Photo'],
      color: 'info',
    },
    {
      id: 'signature',
      name: 'Signature',
      icon: <EditIcon />,
      required: true,
      examples: ['Digital Signature', 'Scanned Signature'],
      color: 'warning',
    },
    {
      id: 'academic_proof',
      name: 'Academic Proof',
      icon: <SchoolIcon />,
      required: false,
      examples: ['Degree Certificate', 'Mark Sheets', 'School Certificate'],
      color: 'secondary',
    },
    {
      id: 'financial_proof',
      name: 'Financial Proof',
      icon: <CreditCardIcon />,
      required: false,
      examples: ['Bank Statement', 'Income Certificate', 'Scholarship Letter'],
      color: 'error',
    },
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockDocuments: KYCDocument[] = [
      {
        id: '1',
        studentId: 'STU001',
        documentType: 'id_proof',
        documentName: 'Aadhar Card',
        fileName: 'aadhar_card.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024000,
        uploadedAt: '2024-01-15T10:30:00Z',
        verifiedAt: '2024-01-15T11:00:00Z',
        status: 'verified',
        verificationScore: 95,
        verifiedBy: 'Admin',
        url: '/documents/aadhar_card.jpg',
        thumbnailUrl: '/thumbnails/aadhar_card_thumb.jpg',
        metadata: {
          extractedData: {
            name: 'John Doe',
            aadharNumber: '1234-5678-9012',
            dob: '1995-01-01',
          },
          confidence: 95,
          quality: 90,
        },
      },
      {
        id: '2',
        studentId: 'STU001',
        documentType: 'address_proof',
        documentName: 'Electricity Bill',
        fileName: 'electricity_bill.pdf',
        fileType: 'application/pdf',
        fileSize: 2048576,
        uploadedAt: '2024-01-15T10:35:00Z',
        status: 'pending',
        verificationScore: 0,
        url: '/documents/electricity_bill.pdf',
      },
    ];

    setKycDocuments(mockDocuments);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'rejected': return 'error';
      case 'under_review': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'under_review': return <PendingIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <InfoIcon />;
    }
  };

  const getKYCScore = (studentId: string) => {
    const studentDocs = kycDocuments.filter(doc => doc.studentId === studentId);
    if (studentDocs.length === 0) return 0;
    
    const verifiedDocs = studentDocs.filter(doc => doc.status === 'verified');
    const totalScore = verifiedDocs.reduce((sum, doc) => sum + doc.verificationScore, 0);
    return Math.round(totalScore / verifiedDocs.length);
  };

  const getKYCStatus = (studentId: string) => {
    const studentDocs = kycDocuments.filter(doc => doc.studentId === studentId);
    const requiredDocs = documentTypes.filter(doc => doc.required);
    
    if (studentDocs.length === 0) return 'pending';
    
    const verifiedRequiredDocs = studentDocs.filter(doc => 
      doc.status === 'verified' && requiredDocs.some(req => req.id === doc.documentType)
    );
    
    if (verifiedRequiredDocs.length === requiredDocs.length) return 'verified';
    if (studentDocs.some(doc => doc.status === 'rejected')) return 'rejected';
    if (studentDocs.some(doc => doc.status === 'under_review')) return 'under_review';
    return 'pending';
  };

  const handleDocumentUpload = async (files: FileList, documentType: string) => {
    setLoading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const newDocument: KYCDocument = {
        id: Date.now().toString() + i,
        studentId: selectedStudent,
        documentType,
        documentName: documentTypes.find(dt => dt.id === documentType)?.name || documentType,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        verificationScore: 0,
        url: `/documents/${file.name}`,
      };

      setKycDocuments(prev => [...prev, newDocument]);
    }

    setLoading(false);
    setUploadDialogOpen(false);
    setSnackbar({ open: true, message: `✅ Successfully uploaded ${files.length} document(s)!`, severity: 'success' });
  };

  const handleVerifyDocument = async (documentId: string, action: 'verify' | 'reject', reason?: string) => {
    setLoading(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setKycDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            status: action === 'verify' ? 'verified' : 'rejected',
            verifiedAt: action === 'verify' ? new Date().toISOString() : undefined,
            verifiedBy: 'Admin',
            verificationScore: action === 'verify' ? Math.floor(Math.random() * 20) + 80 : 0,
            rejectionReason: action === 'reject' ? reason : undefined,
          }
        : doc
    ));
    
    setSnackbar({ 
      open: true, 
      message: `✅ Document ${action === 'verify' ? 'verified' : 'rejected'} successfully!`, 
      severity: 'success' 
    });
    setLoading(false);
    setVerificationDialogOpen(false);
  };

  const filteredDocuments = kycDocuments.filter(doc => {
    if (selectedStudent && doc.studentId !== selectedStudent) return false;
    return true;
  });

  const getKYCStats = () => {
    const totalStudents = students.length;
    const verifiedStudents = students.filter(s => getKYCStatus(s.id) === 'verified').length;
    const pendingStudents = students.filter(s => getKYCStatus(s.id) === 'pending').length;
    const rejectedStudents = students.filter(s => getKYCStatus(s.id) === 'rejected').length;
    
    return {
      totalStudents,
      verifiedStudents,
      pendingStudents,
      rejectedStudents,
      verificationRate: totalStudents > 0 ? Math.round((verifiedStudents / totalStudents) * 100) : 0,
    };
  };

  const stats = getKYCStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          KYC Verification System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadDialogOpen(true)}>
            Upload Documents
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Registered students
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Verified
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {stats.verifiedStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.verificationRate}% verification rate
                  </Typography>
                </Box>
                <VerifiedIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {stats.pendingStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Awaiting verification
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Rejected
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {stats.rejectedStudents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Needs attention
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Document Verification" icon={<DocumentScannerIcon />} />
          <Tab label="Student KYC Status" icon={<PersonIcon />} />
          <Tab label="Verification Queue" icon={<ScheduleIcon />} />
          <Tab label="Analytics & Reports" icon={<AssignmentIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Student</InputLabel>
                <Select
                  value={selectedStudent}
                  label="Student"
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map(student => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="outlined" startIcon={<SearchIcon />}>
                Search
              </Button>
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Advanced Filters
              </Button>
            </Box>
          </Paper>

          {/* Documents Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Verified By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {document.documentName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {document.fileName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {students.find(s => s.id === document.studentId)?.firstName} {students.find(s => s.id === document.studentId)?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={documentTypes.find(dt => dt.id === document.documentType)?.name || document.documentType}
                          size="small"
                          color={documentTypes.find(dt => dt.id === document.documentType)?.color as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(document.status)}
                          label={document.status.toUpperCase()}
                          color={getStatusColor(document.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating
                            value={document.verificationScore / 20}
                            readOnly
                            size="small"
                            precision={0.1}
                          />
                          <Typography variant="body2">
                            {document.verificationScore}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(document.uploadedAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {document.verifiedBy || '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => { setCurrentDocument(document); setVerificationDialogOpen(true); }}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Verify">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleVerifyDocument(document.id, 'verify')}
                              disabled={document.status === 'verified'}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleVerifyDocument(document.id, 'reject', 'Document quality insufficient')}
                              disabled={document.status === 'rejected'}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>Student KYC Status</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {students.map((student) => {
              const kycStatus = getKYCStatus(student.id);
              const kycScore = getKYCScore(student.id);
              const studentDocs = kycDocuments.filter(doc => doc.studentId === student.id);
              
              return (
                <Card key={student.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {student.firstName} {student.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentId} • {student.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={`${getStatusColor(kycStatus)}.main`}>
                            {kycScore}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            KYC Score
                          </Typography>
                        </Box>
                        <Chip
                          icon={getStatusIcon(kycStatus)}
                          label={kycStatus.toUpperCase()}
                          color={getStatusColor(kycStatus) as any}
                          size="medium"
                        />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {documentTypes.map((docType) => {
                        const doc = studentDocs.find(d => d.documentType === docType.id);
                        return (
                          <Chip
                            key={docType.id}
                            icon={docType.icon}
                            label={docType.name}
                            color={doc ? getStatusColor(doc.status) as any : 'default'}
                            variant={doc ? 'filled' : 'outlined'}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Verification Queue</Typography>
          <Alert severity="info">
            Documents pending verification and automated verification results would be displayed here.
          </Alert>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Analytics & Reports</Typography>
          <Alert severity="info">
            KYC verification analytics, compliance reports, and performance metrics would be displayed here.
          </Alert>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Upload KYC Documents</Typography>
            <IconButton onClick={() => setUploadDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map(student => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>Document Types</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {documentTypes.map((docType) => (
                <Card key={docType.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: `${docType.color}.main` }}>
                          {docType.icon}
                        </Box>
                        <Box>
                          <Typography variant="h6">
                            {docType.name}
                            {docType.required && <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {docType.examples.join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,.pdf';
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) handleDocumentUpload(files, docType.id);
                          };
                          input.click();
                        }}
                        disabled={!selectedStudent}
                      >
                        Upload
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Document Verification - {currentDocument?.documentName}
            </Typography>
            <IconButton onClick={() => setVerificationDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentDocument && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Document verification interface with AI-powered analysis would be displayed here.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File: {currentDocument.fileName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded: {new Date(currentDocument.uploadedAt).toLocaleString()}
              </Typography>
              {currentDocument.metadata?.extractedData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Extracted Data:</Typography>
                  <pre>{JSON.stringify(currentDocument.metadata.extractedData, null, 2)}</pre>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => currentDocument && handleVerifyDocument(currentDocument.id, 'verify')}
          >
            Verify Document
          </Button>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => currentDocument && handleVerifyDocument(currentDocument.id, 'reject', 'Document quality insufficient')}
          >
            Reject Document
          </Button>
        </DialogActions>
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

export default KYCVerificationSystem;











