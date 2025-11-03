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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  status: string;
}

interface Document {
  id: string;
  studentId: string;
  studentName: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category: string;
  subcategory?: string;
  description?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  isPublic: boolean;
  isVerified: boolean;
  downloadCount: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    pages?: number;
    duration?: number;
    resolution?: string;
    author?: string;
  };
}

interface DocumentCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
  color: string;
}

interface StudentDocumentManagementProps {
  students: Student[];
  onDocumentUpdate: (document: Document) => void;
}

const StudentDocumentManagement: React.FC<StudentDocumentManagementProps> = ({
  students,
  onDocumentUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const documentCategories: DocumentCategory[] = [
    {
      id: 'academic',
      name: 'Academic Records',
      icon: <SchoolIcon />,
      subcategories: ['Transcripts', 'Certificates', 'Awards', 'Test Results'],
      color: 'primary',
    },
    {
      id: 'kyc',
      name: 'KYC Documents',
      icon: <VerifiedIcon />,
      subcategories: ['ID Proof', 'Address Proof', 'Photo', 'Signature'],
      color: 'success',
    },
    {
      id: 'financial',
      name: 'Financial Documents',
      icon: <AssignmentIcon />,
      subcategories: ['Fee Receipts', 'Payment Proof', 'Scholarship', 'Loan Documents'],
      color: 'warning',
    },
    {
      id: 'medical',
      name: 'Medical Records',
      icon: <InfoIcon />,
      subcategories: ['Health Certificate', 'Vaccination', 'Medical Reports', 'Insurance'],
      color: 'error',
    },
    {
      id: 'personal',
      name: 'Personal Documents',
      icon: <PersonIcon />,
      subcategories: ['Birth Certificate', 'Passport', 'Visa', 'Other'],
      color: 'info',
    },
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        studentId: 'STU001',
        studentName: 'John Doe',
        fileName: 'transcript_2024.pdf',
        originalName: 'Academic Transcript 2024.pdf',
        fileType: 'application/pdf',
        fileSize: 2048576,
        category: 'academic',
        subcategory: 'Transcripts',
        description: 'Official academic transcript for 2024',
        tags: ['transcript', 'academic', '2024'],
        uploadedBy: 'Admin',
        uploadedAt: '2024-01-15T10:30:00Z',
        lastModified: '2024-01-15T10:30:00Z',
        version: 1,
        isPublic: false,
        isVerified: true,
        downloadCount: 5,
        url: '/documents/transcript_2024.pdf',
        metadata: { pages: 3, author: 'Registrar Office' },
      },
      {
        id: '2',
        studentId: 'STU001',
        studentName: 'John Doe',
        fileName: 'id_proof.jpg',
        originalName: 'Aadhar Card.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024000,
        category: 'kyc',
        subcategory: 'ID Proof',
        description: 'Aadhar card for KYC verification',
        tags: ['kyc', 'id-proof', 'aadhar'],
        uploadedBy: 'John Doe',
        uploadedAt: '2024-01-10T14:20:00Z',
        lastModified: '2024-01-10T14:20:00Z',
        version: 1,
        isPublic: false,
        isVerified: true,
        downloadCount: 2,
        url: '/documents/id_proof.jpg',
        thumbnailUrl: '/thumbnails/id_proof_thumb.jpg',
        metadata: { resolution: '1920x1080' },
      },
    ];

    setDocuments(mockDocuments);
  }, []);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon color="error" />;
    if (fileType.includes('image')) return <ImageIcon color="primary" />;
    if (fileType.includes('video')) return <VideoIcon color="secondary" />;
    if (fileType.includes('audio')) return <AudioIcon color="info" />;
    return <FileIcon color="action" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList) => {
    setLoading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const newDocument: Document = {
        id: Date.now().toString() + i,
        studentId: selectedStudent,
        studentName: students.find(s => s.id === selectedStudent)?.firstName + ' ' + students.find(s => s.id === selectedStudent)?.lastName || '',
        fileName: file.name,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: selectedCategory,
        description: '',
        tags: [],
        uploadedBy: 'Admin',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        isPublic: false,
        isVerified: false,
        downloadCount: 0,
        url: `/documents/${file.name}`,
      };

      setDocuments(prev => [...prev, newDocument]);
    }

    setLoading(false);
    setUploadDialogOpen(false);
    setSnackbar({ open: true, message: `✅ Successfully uploaded ${files.length} file(s)!`, severity: 'success' });
  };

  const handleDeleteDocument = async (documentId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setSnackbar({ open: true, message: '✅ Document deleted successfully!', severity: 'success' });
    setLoading(false);
  };

  const handleDownloadDocument = (document: Document) => {
    // Simulate download
    setSnackbar({ open: true, message: `📥 Downloading ${document.originalName}...`, severity: 'info' });
    
    // Update download count
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, downloadCount: doc.downloadCount + 1 }
        : doc
    ));
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedStudent && doc.studentId !== selectedStudent) return false;
    if (selectedCategory && doc.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryStats = () => {
    const stats = documentCategories.map(category => ({
      ...category,
      count: documents.filter(doc => doc.category === category.id).length,
      totalSize: documents
        .filter(doc => doc.category === category.id)
        .reduce((sum, doc) => sum + doc.fileSize, 0),
    }));
    return stats;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon color="primary" />
          Student Document Management
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

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="#">
          Students
        </Link>
        <Link color="inherit" href="#">
          Document Management
        </Link>
        <Typography color="text.primary">All Documents</Typography>
      </Breadcrumbs>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
        {getCategoryStats().map((category) => (
          <Box key={category.id} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {category.name}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color={`${category.color}.main`}>
                      {category.count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(category.totalSize)}
                    </Typography>
                  </Box>
                  <Box sx={{ color: `${category.color}.main`, opacity: 0.8 }}>
                    {category.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="All Documents" icon={<DescriptionIcon />} />
          <Tab label="By Category" icon={<FolderIcon />} />
          <Tab label="Upload History" icon={<CloudUploadIcon />} />
          <Tab label="Document Analytics" icon={<AssignmentIcon />} />
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
              
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {documentCategories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
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
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Downloads</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFileIcon(document.fileType)}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {document.originalName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {document.fileType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {document.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.studentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={documentCategories.find(c => c.id === document.category)?.name || document.category}
                          size="small"
                          color={documentCategories.find(c => c.id === document.category)?.color as any}
                        />
                      </TableCell>
                      <TableCell>
                        {formatFileSize(document.fileSize)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {document.uploadedBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {document.isVerified && (
                            <Chip
                              icon={<VerifiedIcon />}
                              label="Verified"
                              color="success"
                              size="small"
                            />
                          )}
                          {document.isPublic ? (
                            <Chip
                              icon={<PublicIcon />}
                              label="Public"
                              color="info"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<LockIcon />}
                              label="Private"
                              color="default"
                              size="small"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {document.downloadCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => { setCurrentDocument(document); setViewDialogOpen(true); }}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small" onClick={() => handleDownloadDocument(document)}>
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => { setCurrentDocument(document); setEditDialogOpen(true); }}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteDocument(document.id)}>
                              <DeleteIcon />
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
          {documentCategories.map((category) => (
            <Accordion key={category.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Box sx={{ color: `${category.color}.main` }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6">{category.name}</Typography>
                  <Chip label={documents.filter(doc => doc.category === category.id).length} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.subcategories.join(', ')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {documents
                    .filter(doc => doc.category === category.id)
                    .map((document) => (
                      <Chip
                        key={document.id}
                        label={document.originalName}
                        onClick={() => { setCurrentDocument(document); setViewDialogOpen(true); }}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>Upload History</Typography>
          <Alert severity="info">
            Upload history and activity logs would be displayed here with detailed timestamps and user actions.
          </Alert>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>Document Analytics</Typography>
          <Alert severity="info">
            Document usage analytics, storage statistics, and performance metrics would be displayed here.
          </Alert>
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Upload Documents</Typography>
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

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {documentCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop files here or click to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports PDF, Images, Videos, and other document formats
              </Typography>
              <input
                id="file-upload"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
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

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {currentDocument?.originalName}
            </Typography>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentDocument && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Document preview and details would be displayed here.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File Type: {currentDocument.fileType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {formatFileSize(currentDocument.fileSize)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uploaded: {new Date(currentDocument.uploadedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download
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

export default StudentDocumentManagement;
