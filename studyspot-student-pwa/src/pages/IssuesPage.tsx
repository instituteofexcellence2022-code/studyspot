import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Rating,
  LinearProgress,
  Alert,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport,
  Lightbulb,
  Report,
  Help,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  PhotoCamera,
  Close,
  Send,
  Visibility,
  Comment,
  ThumbUp,
} from '@mui/icons-material';
import Layout from '../components/MobileLayout';
import api from '../services/api';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  libraryName?: string;
  createdAt: string;
  resolvedAt?: string;
  photos?: string[];
  isAnonymous: boolean;
  rating?: number;
  feedback?: string;
  response?: string;
}

const ISSUE_CATEGORIES = [
  { value: 'facility', label: 'Facility Issue', icon: '🏢', color: '#1976d2' },
  { value: 'cleanliness', label: 'Cleanliness', icon: '🧹', color: '#388e3c' },
  { value: 'noise', label: 'Noise Complaint', icon: '🔇', color: '#f57c00' },
  { value: 'equipment', label: 'Equipment Issue', icon: '🖥️', color: '#7b1fa2' },
  { value: 'ac_heating', label: 'AC/Heating', icon: '❄️', color: '#0097a7' },
  { value: 'internet', label: 'Internet/WiFi', icon: '📶', color: '#c62828' },
  { value: 'lighting', label: 'Lighting', icon: '💡', color: '#fbc02d' },
  { value: 'bathroom', label: 'Bathroom', icon: '🚽', color: '#5d4037' },
  { value: 'safety', label: 'Safety Concern', icon: '⚠️', color: '#d32f2f' },
  { value: 'suggestion', label: 'Suggestion', icon: '💭', color: '#00796b' },
  { value: 'other', label: 'Other', icon: '📝', color: '#616161' },
];

export default function IssuesPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    isAnonymous: false,
  });
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await api.get('/api/issues/my-issues');
      setIssues(response.data.data || mockIssues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setIssues(mockIssues);
    }
  };

  const mockIssues: Issue[] = [
    {
      id: '1',
      title: 'AC not working in Study Hall A',
      description: 'The air conditioning has been broken for 2 days. Temperature is very uncomfortable.',
      category: 'ac_heating',
      status: 'resolved',
      priority: 'high',
      libraryName: 'Central Library',
      createdAt: '2024-11-01T10:00:00Z',
      resolvedAt: '2024-11-02T15:30:00Z',
      isAnonymous: false,
      rating: 5,
      feedback: 'Fixed quickly! Thank you.',
      response: 'AC has been repaired. Thank you for reporting.',
    },
    {
      id: '2',
      title: 'Slow internet speed',
      description: 'WiFi connection is very slow in the evening hours.',
      category: 'internet',
      status: 'in_progress',
      priority: 'medium',
      libraryName: 'Central Library',
      createdAt: '2024-11-02T14:00:00Z',
      isAnonymous: true,
    },
    {
      id: '3',
      title: 'Add more charging points',
      description: 'There are not enough charging points for laptops and phones.',
      category: 'suggestion',
      status: 'open',
      priority: 'low',
      libraryName: 'Central Library',
      createdAt: '2024-11-03T09:00:00Z',
      isAnonymous: false,
    },
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      alert('Maximum 3 photos allowed');
      return;
    }
    
    setPhotos([...photos, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreview(photoPreview.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.category) {
      alert('Please select a category');
      return;
    }
    if (activeStep === 1 && (!formData.title || !formData.description)) {
      alert('Please fill in all details');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('isAnonymous', String(formData.isAnonymous));
      
      photos.forEach((photo, index) => {
        formDataToSend.append(`photos`, photo);
      });

      await api.post('/api/issues', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Issue reported successfully!');
      setCreateDialog(false);
      resetForm();
      fetchIssues();
    } catch (error) {
      console.error('Failed to report issue:', error);
      alert('Failed to report issue. Please try again.');
    }
  };

  const handleRateIssue = async () => {
    try {
      await api.post(`/api/issues/${selectedIssue?.id}/rate`, {
        rating,
        feedback,
      });
      alert('Thank you for your feedback!');
      setRatingDialog(false);
      fetchIssues();
    } catch (error) {
      console.error('Failed to rate:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      priority: 'medium',
      isAnonymous: false,
    });
    setPhotos([]);
    setPhotoPreview([]);
    setActiveStep(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle color="success" />;
      case 'in_progress': return <HourglassEmpty color="warning" />;
      case 'closed': return <Cancel color="error" />;
      default: return <Report color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'in_progress': return 'warning';
      case 'closed': return 'error';
      default: return 'info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (tab === 0) return true; // All
    if (tab === 1) return issue.status === 'open' || issue.status === 'in_progress'; // Active
    if (tab === 2) return issue.status === 'resolved'; // Resolved
    return true;
  });

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              🐛 Issues & Feedback
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Report problems and track their resolution
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
            size="large"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: 3,
            }}
          >
            Report Issue
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">{issues.length}</Typography>
              <Typography variant="body2">Total Issues</Typography>
            </CardContent>
          </Card>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {issues.filter(i => i.status === 'open' || i.status === 'in_progress').length}
              </Typography>
              <Typography variant="body2">Active</Typography>
            </CardContent>
          </Card>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {issues.filter(i => i.status === 'resolved').length}
              </Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold">
                {Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100) || 0}%
              </Typography>
              <Typography variant="body2">Resolution Rate</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`All (${issues.length})`} />
          <Tab label={`Active (${issues.filter(i => i.status === 'open' || i.status === 'in_progress').length})`} />
          <Tab label={`Resolved (${issues.filter(i => i.status === 'resolved').length})`} />
        </Tabs>

        {/* Issues List */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          {filteredIssues.map((issue) => {
            const category = ISSUE_CATEGORIES.find(c => c.value === issue.category);
            return (
              <Card key={issue.id} sx={{ '&:hover': { boxShadow: 4 }, cursor: 'pointer' }}>
                <CardContent onClick={() => { setSelectedIssue(issue); setDetailsDialog(true); }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                      <Avatar sx={{ bgcolor: category?.color || '#ccc', width: 56, height: 56 }}>
                        <Typography variant="h4">{category?.icon}</Typography>
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip 
                            label={category?.label} 
                            size="small" 
                            sx={{ bgcolor: category?.color, color: 'white' }}
                          />
                          <Chip 
                            label={issue.status.replace('_', ' ')} 
                            size="small" 
                            color={getStatusColor(issue.status) as any}
                            icon={getStatusIcon(issue.status)}
                          />
                          <Chip 
                            label={issue.priority} 
                            size="small" 
                            color={getPriorityColor(issue.priority) as any}
                          />
                          {issue.isAnonymous && <Chip label="Anonymous" size="small" variant="outlined" />}
                        </Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {issue.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {issue.description.length > 150 
                            ? issue.description.substring(0, 150) + '...' 
                            : issue.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {issue.libraryName} • {new Date(issue.createdAt).toLocaleDateString()}
                          {issue.resolvedAt && ` • Resolved: ${new Date(issue.resolvedAt).toLocaleDateString()}`}
                        </Typography>
                      </Box>
                    </Box>
                    {issue.status === 'resolved' && !issue.rating && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ThumbUp />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                          setRatingDialog(true);
                        }}
                      >
                        Rate
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {filteredIssues.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BugReport sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No issues found
            </Typography>
          </Box>
        )}

        {/* Create Issue Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
              Report an Issue
              <IconButton onClick={() => setCreateDialog(false)} sx={{ ml: 'auto' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
              <Step><StepLabel>Category</StepLabel></Step>
              <Step><StepLabel>Details</StepLabel></Step>
              <Step><StepLabel>Photos (Optional)</StepLabel></Step>
              <Step><StepLabel>Review</StepLabel></Step>
            </Stepper>

            {/* Step 1: Category */}
            {activeStep === 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                {ISSUE_CATEGORIES.map((cat) => (
                  <Card
                    key={cat.value}
                    sx={{
                      cursor: 'pointer',
                      border: formData.category === cat.value ? 3 : 1,
                      borderColor: formData.category === cat.value ? cat.color : 'divider',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>{cat.icon}</Typography>
                      <Typography variant="body2" fontWeight="600">{cat.label}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Step 2: Details */}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Brief summary of the issue"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the issue in detail..."
                />
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low - Can wait</MenuItem>
                  <MenuItem value="medium">Medium - Should be fixed soon</MenuItem>
                  <MenuItem value="high">High - Urgent</MenuItem>
                </TextField>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  />
                  <Typography variant="body2">Report anonymously</Typography>
                </Box>
              </Box>
            )}

            {/* Step 3: Photos */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add up to 3 photos (optional)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                  {photoPreview.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }} />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white' }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  {photos.length < 3 && (
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{ height: 150, borderStyle: 'dashed' }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <PhotoCamera sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="caption">Add Photo</Typography>
                      </Box>
                      <input type="file" hidden accept="image/*" onChange={handlePhotoSelect} />
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 4: Review */}
            {activeStep === 3 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please review your issue before submitting
                </Alert>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Category</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {ISSUE_CATEGORIES.find(c => c.value === formData.category)?.label}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{formData.title}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{formData.description}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Priority</Typography>
                  <Chip label={formData.priority} color={getPriorityColor(formData.priority) as any} size="small" />
                  
                  {photos.length > 0 && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Photos ({photos.length})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {photoPreview.map((preview, index) => (
                          <img key={index} src={preview} alt={`Preview ${index + 1}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                        ))}
                      </Box>
                    </>
                  )}
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {activeStep > 0 && (
              <Button onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
            )}
            <Button onClick={() => { setCreateDialog(false); resetForm(); }}>Cancel</Button>
            {activeStep < 3 ? (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            ) : (
              <Button variant="contained" startIcon={<Send />} onClick={handleSubmit}>
                Submit Issue
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Issue Details Dialog */}
        <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
          {selectedIssue && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip 
                    label={ISSUE_CATEGORIES.find(c => c.value === selectedIssue.category)?.label} 
                    size="small" 
                    sx={{ bgcolor: ISSUE_CATEGORIES.find(c => c.value === selectedIssue.category)?.color, color: 'white' }}
                  />
                  <Chip 
                    label={selectedIssue.status.replace('_', ' ')} 
                    size="small" 
                    color={getStatusColor(selectedIssue.status) as any}
                  />
                </Box>
                {selectedIssue.title}
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedIssue.description}</Typography>
                
                {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Photos:</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {selectedIssue.photos.map((photo, index) => (
                        <img key={index} src={photo} alt={`Photo ${index + 1}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedIssue.response && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Response:</Typography>
                    <Typography variant="body2">{selectedIssue.response}</Typography>
                  </Alert>
                )}

                {selectedIssue.rating && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Your Rating:</Typography>
                    <Rating value={selectedIssue.rating} readOnly />
                    {selectedIssue.feedback && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedIssue.feedback}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reported: {new Date(selectedIssue.createdAt).toLocaleDateString()}
                  </Typography>
                  {selectedIssue.resolvedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Resolved: {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Rating Dialog */}
        <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rate Resolution</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" gutterBottom>
                How satisfied are you with the resolution?
              </Typography>
              <Rating
                value={rating}
                onChange={(e, value) => setRating(value || 0)}
                size="large"
                sx={{ my: 2 }}
              />
              <TextField
                fullWidth
                label="Feedback (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                multiline
                rows={3}
                placeholder="Share your experience..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRateIssue} disabled={rating === 0}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

