import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  Merge as MergeIcon,
  Star as StarIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { 
  issueService, 
  Issue, 
  IssueCategory, 
  IssuePriority, 
  IssueStatus, 
  IssueComment,
  UpdateIssueData 
} from '../../services/issueService';

interface IssueDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | null;
  onUpdate: (issueId: string, data: UpdateIssueData) => Promise<void>;
  categories: IssueCategory[];
  priorities: IssuePriority[];
  statuses: IssueStatus[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`issue-tabpanel-${index}`}
      aria-labelledby={`issue-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IssueDetailsDialog: React.FC<IssueDetailsDialogProps> = ({
  open,
  onClose,
  issue,
  onUpdate,
  categories,
  priorities,
  statuses,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateIssueData>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      priority_id: '',
      status_id: '',
      assigned_to_user_id: '',
      student_count: 1,
      satisfaction_rating: undefined,
      satisfaction_feedback: '',
    },
  });

  // Load comments when dialog opens
  useEffect(() => {
    if (open && issue) {
      loadComments();
      reset({
        title: issue.title,
        description: issue.description,
        category_id: issue.category_name,
        priority_id: issue.priority_name,
        status_id: issue.status_name,
        student_count: issue.student_count,
        satisfaction_rating: issue.satisfaction_rating,
        satisfaction_feedback: issue.satisfaction_feedback || '',
      });
    }
  }, [open, issue, reset]);

  const loadComments = async () => {
    if (!issue) return;
    
    try {
      const response = await issueService.getIssueComments(issue.id);
      setComments(response.data);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleUpdate = async (data: UpdateIssueData) => {
    if (!issue) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert names back to IDs
      const updateData: UpdateIssueData = {
        ...data,
        category_id: categories.find(c => c.name === data.category_id)?.id,
        priority_id: priorities.find(p => p.name === data.priority_id)?.id,
        status_id: statuses.find(s => s.name === data.status_id)?.id,
      };

      await onUpdate(issue.id, updateData);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update issue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!issue || !newComment.trim()) return;
    
    try {
      setAddingComment(true);
      await issueService.addIssueComment(issue.id, {
        comment: newComment.trim(),
        is_internal: false,
      });
      
      setNewComment('');
      await loadComments();
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleClose = () => {
    setEditing(false);
    setActiveTab(0);
    setError(null);
    setNewComment('');
    onClose();
  };

  const getPriorityIcon = (level: number) => {
    switch (level) {
      case 1: return <ErrorIcon sx={{ color: '#F44336' }} />;
      case 2: return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 3: return <InfoIcon sx={{ color: '#2196F3' }} />;
      case 4: return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      default: return <InfoIcon />;
    }
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'open': return <AssignmentIcon sx={{ color: '#FF9800' }} />;
      case 'assigned': return <ScheduleIcon sx={{ color: '#2196F3' }} />;
      case 'in_progress': return <TrendingUpIcon sx={{ color: '#9C27B0' }} />;
      case 'resolved': return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'closed': return <CheckCircleIcon sx={{ color: '#9E9E9E' }} />;
      case 'cancelled': return <CancelIcon sx={{ color: '#607D8B' }} />;
      default: return <AssignmentIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSLAProgress = () => {
    if (!issue) return 0;
    return issueService.getSLAProgress(issue);
  };

  const getSLAStatus = () => {
    if (!issue) return 'on_time';
    return issueService.getSLAStatus(issue);
  };

  if (!issue) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Issue Details
            </Typography>
            {issue.is_overdue && (
              <Chip label="Overdue" color="error" size="small" />
            )}
          </Box>
          <Box>
            <Tooltip title={editing ? "Cancel Edit" : "Edit Issue"}>
              <IconButton onClick={() => setEditing(!editing)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Details" />
            <Tab label="Comments" />
            <Tab label="History" />
            <Tab label="Satisfaction" />
          </Tabs>
        </Box>

        {/* Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Issue Information */}
            <Box sx={{ flex: '1 1 600px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Issue Information
                  </Typography>
                  
                  {editing ? (
                    <form onSubmit={handleSubmit(handleUpdate)}>
                      <Stack spacing={2}>
                        <Controller
                          name="title"
                          control={control}
                          rules={{ required: 'Title is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Title"
                              fullWidth
                              error={!!errors.title}
                              helperText={errors.title?.message}
                            />
                          )}
                        />
                        
                        <Controller
                          name="description"
                          control={control}
                          rules={{ required: 'Description is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Description"
                              fullWidth
                              multiline
                              rows={4}
                              error={!!errors.description}
                              helperText={errors.description?.message}
                            />
                          )}
                        />
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ flex: '1 1 200px' }}>
                            <Controller
                              name="category_id"
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Category</InputLabel>
                                  <Select {...field} label="Category">
                                    {categories.map((category) => (
                                      <MenuItem key={category.id} value={category.name}>
                                        {category.display_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Box>
                          
                          <Box sx={{ flex: '1 1 200px' }}>
                            <Controller
                              name="priority_id"
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Priority</InputLabel>
                                  <Select {...field} label="Priority">
                                    {priorities.map((priority) => (
                                      <MenuItem key={priority.id} value={priority.name}>
                                        {priority.display_name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Box>
                        </Box>
                        
                        <Controller
                          name="student_count"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Students Affected"
                              type="number"
                              fullWidth
                              inputProps={{ min: 1 }}
                            />
                          )}
                        />
                      </Stack>
                    </form>
                  ) : (
                    <Stack spacing={2}>
                      <Typography variant="h5" fontWeight="bold">
                        {issue.title}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary">
                        {issue.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={issue.category_display_name}
                          icon={<Typography>{issue.category_icon}</Typography>}
                          sx={{ bgcolor: issue.category_color, color: 'white' }}
                        />
                        <Chip
                          label={issue.priority_display_name}
                          icon={getPriorityIcon(issue.priority_level)}
                          sx={{ bgcolor: issue.priority_color, color: 'white' }}
                        />
                        <Chip
                          label={issue.status_display_name}
                          icon={getStatusIcon(issue.status_name)}
                          sx={{ bgcolor: issue.status_color, color: 'white' }}
                        />
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Issue Metadata */}
            <Box sx={{ flex: '1 1 300px' }}>
              <Stack spacing={2}>
                {/* SLA Progress */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      SLA Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimerIcon />
                      <Typography variant="body2">
                        {getSLAProgress()}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getSLAProgress()} 
                      color={getSLAStatus() === 'overdue' ? 'error' : getSLAStatus() === 'warning' ? 'warning' : 'primary'}
                    />
                    {issue.sla_deadline && (
                      <Typography variant="caption" color="text.secondary">
                        Deadline: {formatDate(issue.sla_deadline)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Assignment
                    </Typography>
                    {issue.assigned_to_first_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {issue.assigned_to_first_name[0]}{issue.assigned_to_last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.assigned_to_first_name} {issue.assigned_to_last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issue.assigned_to_email}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Reporter Information */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Reporter
                    </Typography>
                    <Stack spacing={1}>
                      {issue.reported_by_first_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="body2">{issue.reported_by_first_name} {issue.reported_by_last_name}</Typography>
                        </Box>
                      )}
                      {issue.reported_by_email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" />
                          <Typography variant="body2">{issue.reported_by_email}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Timeline
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        <Typography variant="body2">
                          Reported: {formatDate(issue.reported_at)}
                        </Typography>
                      </Box>
                      {issue.first_response_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" />
                          <Typography variant="body2">
                            First Response: {formatDate(issue.first_response_at)}
                          </Typography>
                        </Box>
                      )}
                      {issue.resolved_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon fontSize="small" />
                          <Typography variant="body2">
                            Resolved: {formatDate(issue.resolved_at)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </TabPanel>

        {/* Comments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={2}>
            {/* Add Comment */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Comment
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    fullWidth
                    multiline
                    rows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                    startIcon={<SendIcon />}
                  >
                    {addingComment ? 'Adding...' : 'Add'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Comments List */}
            <Stack spacing={2}>
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {comment.first_name[0]}{comment.last_name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {comment.first_name} {comment.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      {comment.is_internal && (
                        <Chip label="Internal" size="small" color="warning" />
                      )}
                    </Box>
                    <Typography variant="body2">
                      {comment.comment}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Issue History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issue history and audit trail will be displayed here.
          </Typography>
        </TabPanel>

        {/* Satisfaction Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Satisfaction
              </Typography>
              {issue.satisfaction_rating ? (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="warning" />
                    <Typography variant="h5" fontWeight="bold">
                      {issue.satisfaction_rating}/5
                    </Typography>
                  </Box>
                  {issue.satisfaction_feedback && (
                    <Typography variant="body2">
                      {issue.satisfaction_feedback}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Submitted: {issue.reported_at ? formatDate(issue.reported_at) : 'N/A'}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No satisfaction rating submitted yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>
          Close
        </Button>
        {editing && (
          <Button
            variant="contained"
            onClick={handleSubmit(handleUpdate)}
            disabled={loading || !isDirty}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default IssueDetailsDialog;
