// ============================================
// TICKET DETAILS PAGE
// AI-Powered Ticket Resolution
// ============================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  GridLegacy as Grid,
  TextField,
  Avatar,
  Stack,
  Divider,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Badge,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Send,
  AttachFile,
  SmartToy,
  Psychology,
  AutoFixHigh,
  CheckCircle,
  Schedule,
  Person,
  Email,
  Phone,
  LocalOffer,
  TrendingUp,
  Lightbulb,
  Article,
  Link,
  Download,
  Close,
} from '@mui/icons-material';

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Critical');
  const [assignee, setAssignee] = useState('Amit Kumar');
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [satisfaction, setSatisfaction] = useState(0);
  const [askAiDialogOpen, setAskAiDialogOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  // Mock ticket data
  const ticket = {
    id: 1,
    ticketId: 'TKT-001',
    title: 'Payment gateway not working',
    description: 'Our Razorpay integration is showing errors on the payment page. Students are unable to complete their fee payments. This is affecting around 50 students who tried to pay today.',
    tenant: 'Central Library',
    tenantEmail: 'admin@centrallib.com',
    tenantPhone: '+91 98765 43210',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Technical',
    assignedTo: 'Amit Kumar',
    assignedAvatar: 'AK',
    createdBy: 'Rajesh Kumar',
    createdDate: '2025-11-02 14:30',
    updatedDate: '2025-11-02 15:45',
    tags: ['payment', 'integration', 'urgent'],
    sla: '4 hours',
    timeElapsed: '1.5 hours',
    timeRemaining: '2.5 hours',
    sentiment: 'Frustrated',
    attachments: [
      { name: 'error-screenshot.png', size: '245 KB', url: '#' },
      { name: 'console-logs.txt', size: '12 KB', url: '#' },
    ],
    comments: [
      {
        id: 1,
        author: 'Amit Kumar',
        avatar: 'AK',
        text: 'I\'ve started investigating the issue. Checking the Razorpay dashboard for any API errors.',
        timestamp: '2025-11-02 14:45',
        isInternal: false,
      },
      {
        id: 2,
        author: 'System',
        avatar: '🤖',
        text: 'AI Suggestion: Similar issue was resolved in TKT-045 by updating the webhook URL.',
        timestamp: '2025-11-02 14:50',
        isInternal: true,
      },
      {
        id: 3,
        author: 'Rajesh Kumar',
        avatar: 'RK',
        text: 'Thanks for the quick response. Please let me know if you need any additional details.',
        timestamp: '2025-11-02 15:00',
        isInternal: false,
      },
    ],
    aiSuggestions: [
      {
        type: 'Solution',
        icon: <Lightbulb />,
        title: 'Possible Solutions',
        confidence: 95,
        suggestions: [
          'Check Razorpay API keys in environment variables',
          'Verify webhook URL configuration',
          'Review recent payment gateway updates',
          'Check server logs for API errors',
        ],
      },
      {
        type: 'Knowledge Base',
        icon: <Article />,
        title: 'Related Articles',
        suggestions: [
          'How to troubleshoot Razorpay integration',
          'Common payment gateway errors and fixes',
          'Webhook configuration guide',
        ],
      },
      {
        type: 'Similar Tickets',
        icon: <Link />,
        title: 'Similar Resolved Tickets',
        suggestions: [
          'TKT-045: Payment gateway timeout (Resolved - 2h)',
          'TKT-032: Razorpay webhook error (Resolved - 1.5h)',
        ],
      },
    ],
    timeline: [
      { event: 'Ticket Created', time: '2025-11-02 14:30', user: 'Rajesh Kumar' },
      { event: 'Auto-assigned to Amit Kumar', time: '2025-11-02 14:31', user: 'AI System' },
      { event: 'Status changed to In Progress', time: '2025-11-02 14:45', user: 'Amit Kumar' },
      { event: 'AI suggested similar tickets', time: '2025-11-02 14:50', user: 'AI System' },
    ],
  };

  // Handler functions
  const handleSendComment = () => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }
    alert(`Comment sent: ${comment}`);
    setComment('');
    // In production: Call API to add comment
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    alert(`Status updated to: ${newStatus}`);
    // In production: Call API to update status
  };

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    alert(`Priority updated to: ${newPriority}`);
    // In production: Call API to update priority
  };

  const handleAssigneeChange = (newAssignee: string) => {
    setAssignee(newAssignee);
    alert(`Ticket reassigned to: ${newAssignee}`);
    // In production: Call API to reassign ticket
  };

  const handleEdit = () => {
    alert('Opening edit dialog...');
    // In production: Open edit dialog with ticket data
  };

  const handleResolve = () => {
    setResolveDialogOpen(true);
  };

  const handleConfirmResolve = () => {
    if (!resolution.trim()) {
      alert('Please enter resolution details');
      return;
    }
    alert(`Ticket resolved!\nResolution: ${resolution}\nSatisfaction: ${satisfaction}/5`);
    setResolveDialogOpen(false);
    setStatus('Resolved');
    navigate('/tickets');
    // In production: Call API to resolve ticket
  };

  const handleAskAi = () => {
    setAskAiDialogOpen(true);
  };

  const handleAiQuerySubmit = () => {
    if (!aiQuery.trim()) {
      alert('Please enter a question');
      return;
    }
    alert(`AI analyzing: "${aiQuery}"\n\nSuggested Answer: Based on the error logs, the issue appears to be related to expired API keys. Please regenerate the Razorpay keys.`);
    setAiQuery('');
    setAskAiDialogOpen(false);
    // In production: Call AI API for analysis
  };

  const handleApplySolution = (solution: string) => {
    alert(`Applying solution: ${solution}`);
    setComment(`Applied AI suggestion: ${solution}`);
    // In production: Auto-fill comment with solution
  };

  const handleDownloadAttachment = (filename: string) => {
    alert(`Downloading: ${filename}`);
    // In production: Download file from server
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {ticket.ticketId}
              </Typography>
              <Chip label={ticket.category} variant="outlined" />
              <Chip label={ticket.priority} color="error" />
              <Chip label={ticket.status} color="warning" />
            </Box>
            <Typography variant="h5" gutterBottom>
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {ticket.createdDate} by {ticket.createdBy}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="contained" startIcon={<CheckCircle />} onClick={handleResolve}>
              Resolve
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* SLA Warning */}
      <Alert severity="warning" icon={<Schedule />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>SLA:</strong> {ticket.timeRemaining} remaining (Target: {ticket.sla})
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Ticket Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </Typography>
              
              {ticket.tags.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {ticket.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" icon={<LocalOffer />} variant="outlined" />
                  ))}
                </Box>
              )}

              {ticket.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Attachments ({ticket.attachments.length})
                  </Typography>
                  {ticket.attachments.map((file, index) => (
                    <Paper key={index} sx={{ p: 1.5, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFile />
                        <Box>
                          <Typography variant="body2">{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{file.size}</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => handleDownloadAttachment(file.name)}>
                        <Download />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card sx={{ mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SmartToy color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  AI Recommendations
                </Typography>
                <Chip label="95% Confidence" size="small" color="success" />
              </Box>
              
              {ticket.aiSuggestions.map((suggestion, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {suggestion.icon}
                    {suggestion.title}
                  </Typography>
                  <List dense>
                    {suggestion.suggestions.map((item, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={item} />
                        {suggestion.type === 'Solution' && (
                          <Button size="small" variant="outlined" onClick={() => handleApplySolution(item)}>
                            Apply
                          </Button>
                        )}
                        {suggestion.type === 'Similar Tickets' && (
                          <Button size="small" variant="text" onClick={() => navigate(`/tickets/${item.split(':')[0]}`)}>
                            View
                          </Button>
                        )}
                        {suggestion.type === 'Knowledge Base' && (
                          <Button size="small" variant="text">
                            Read
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Comments / Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Activity & Comments
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <List>
                {ticket.comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ mb: 2 }}>
                    <ListItemAvatar>
                      <Avatar>{comment.avatar}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comment.timestamp}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {comment.text}
                          </Typography>
                          {comment.isInternal && (
                            <Chip label="Internal Note" size="small" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Add Comment */}
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleSendComment}
                    disabled={!comment}
                  >
                    Send
                  </Button>
                  <Button variant="outlined" startIcon={<AttachFile />}>
                    Attach
                  </Button>
                  <Button variant="text" startIcon={<Psychology />} onClick={handleAskAi}>
                    Ask AI
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Ticket Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Ticket Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <Select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <Select value={priority} onChange={(e) => handlePriorityChange(e.target.value)}>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                    <Select value={assignee} onChange={(e) => handleAssigneeChange(e.target.value)}>
                      <MenuItem value="Amit Kumar">Amit Kumar</MenuItem>
                      <MenuItem value="Sneha Reddy">Sneha Reddy</MenuItem>
                      <MenuItem value="Rahul Verma">Rahul Verma</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2" fontWeight="medium">{ticket.createdDate}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2" fontWeight="medium">{ticket.updatedDate}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Time Elapsed</Typography>
                  <Typography variant="body2" fontWeight="medium">{ticket.timeElapsed}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Sentiment</Typography>
                  <Chip label={ticket.sentiment} size="small" color="error" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Requester Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Requester Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Library</Typography>
                    <Typography variant="body2" fontWeight="medium">{ticket.tenant}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body2" fontWeight="medium">{ticket.tenantEmail}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="body2" fontWeight="medium">{ticket.tenantPhone}</Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Timeline
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Stepper orientation="vertical">
                {ticket.timeline.map((item, index) => (
                  <Step key={index} active completed={index < ticket.timeline.length - 1}>
                    <StepLabel>
                      <Typography variant="body2" fontWeight="medium">{item.event}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time} - {item.user}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resolve Ticket Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Resolve Ticket</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Resolution Details"
              placeholder="Describe how the issue was resolved..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <Typography variant="body2" gutterBottom>
              Customer Satisfaction (Optional)
            </Typography>
            <Rating
              value={satisfaction}
              onChange={(_, newValue) => setSatisfaction(newValue || 0)}
              size="large"
              sx={{ mb: 2 }}
            />

            <Alert severity="success" icon={<CheckCircle />}>
              <Typography variant="body2">
                Once resolved, the ticket will be closed and the customer will be notified.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckCircle />}
            onClick={handleConfirmResolve}
            disabled={!resolution.trim()}
          >
            Resolve & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ask AI Dialog */}
      <Dialog open={askAiDialogOpen} onClose={() => setAskAiDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology color="primary" />
            <Typography variant="h6" fontWeight="bold">Ask AI Assistant</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" icon={<SmartToy />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                AI can analyze ticket details, error logs, and suggest solutions based on similar past tickets.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ask AI a Question"
              placeholder="e.g., What's causing the payment gateway error?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              💡 Examples: "What's the likely cause?", "How to fix this?", "Similar solutions?"
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskAiDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Psychology />}
            onClick={handleAiQuerySubmit}
            disabled={!aiQuery.trim()}
          >
            Ask AI
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetailsPage;

