import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { issueService, CreateIssueData, IssueCategory, IssuePriority, DuplicateIssue } from '../../services/issueService';

interface IssueCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueData) => Promise<void>;
  categories: IssueCategory[];
  priorities: IssuePriority[];
}

interface FormData {
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
  library_id?: string;
  reported_by_name?: string;
  reported_by_email?: string;
  reported_by_phone?: string;
  student_count: number;
  tags: string[];
  attachments: any[];
}

const IssueCreateDialog: React.FC<IssueCreateDialogProps> = ({
  open,
  onClose,
  onSubmit,
  categories,
  priorities,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateIssue[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [newTag, setNewTag] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      priority_id: '',
      library_id: '',
      reported_by_name: '',
      reported_by_email: '',
      reported_by_phone: '',
      student_count: 1,
      tags: [],
      attachments: [],
    },
    mode: 'onChange',
  });

  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedCategoryId = watch('category_id');
  const watchedPriorityId = watch('priority_id');

  // Check for duplicates when title or description changes
  useEffect(() => {
    const checkDuplicates = async () => {
      if (watchedTitle && watchedDescription && watchedTitle.length > 10 && watchedDescription.length > 20) {
        setCheckingDuplicates(true);
        try {
          const result = await issueService.findDuplicates({
            title: watchedTitle,
            description: watchedDescription,
          });
          setDuplicates(result.data);
        } catch (err) {
          console.error('Error checking duplicates:', err);
        } finally {
          setCheckingDuplicates(false);
        }
      } else {
        setDuplicates([]);
      }
    };

    const timeoutId = setTimeout(checkDuplicates, 1000);
    return () => clearTimeout(timeoutId);
  }, [watchedTitle, watchedDescription]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up data
      const submitData: CreateIssueData = {
        ...data,
        library_id: data.library_id || undefined,
        reported_by_name: data.reported_by_name || undefined,
        reported_by_email: data.reported_by_email || undefined,
        reported_by_phone: data.reported_by_phone || undefined,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setDuplicates([]);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !watch('tags').includes(newTag.trim())) {
      setValue('tags', [...watch('tags'), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watch('tags').filter(tag => tag !== tagToRemove));
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

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return '#F44336';
      case 2: return '#FF9800';
      case 3: return '#2196F3';
      case 4: return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Report New Issue
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Duplicate Detection */}
          {duplicates.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Similar Issues Found ({duplicates.length})
              </Typography>
              <Typography variant="body2">
                Consider checking these similar issues before creating a new one:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {duplicates.slice(0, 3).map((duplicate) => (
                  <Chip
                    key={duplicate.id}
                    label={`${duplicate.title} (${duplicate.student_count} students)`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                    color="warning"
                  />
                ))}
              </Box>
            </Alert>
          )}

          {checkingDuplicates && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Checking for similar issues...
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Box>

            <Box>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Issue Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    placeholder="Brief description of the issue"
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required', minLength: { value: 20, message: 'Description must be at least 20 characters' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Issue Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    placeholder="Detailed description of the issue, including steps to reproduce if applicable"
                  />
                )}
              />
            </Box>

            {/* Category and Priority */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px' }}>
              <Controller
                name="category_id"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{category.icon}</Typography>
                            <Typography>{category.display_name}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>

              <Box sx={{ flex: '1 1 300px' }}>
              <Controller
                name="priority_id"
                control={control}
                rules={{ required: 'Priority is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.priority_id}>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      {priorities.map((priority) => (
                        <MenuItem key={priority.id} value={priority.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getPriorityIcon(priority.level)}
                            <Typography>{priority.display_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({priority.sla_hours}h SLA)
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
            </Box>

            {/* Student Count */}
            <Box sx={{ flex: '1 1 300px' }}>
              <Controller
                name="student_count"
                control={control}
                rules={{ required: 'Student count is required', min: { value: 1, message: 'At least 1 student must be affected' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Number of Students Affected"
                    type="number"
                    fullWidth
                    error={!!errors.student_count}
                    helperText={errors.student_count?.message}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {watch('tags').map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
            </Box>
          </Box>

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* Reporter Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Reporter Information (Optional)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 250px' }}>
              <Controller
                name="reported_by_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reporter Name"
                    fullWidth
                    placeholder="Name of person reporting"
                  />
                )}
              />
            </Box>

              <Box sx={{ flex: '1 1 250px' }}>
              <Controller
                name="reported_by_email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reporter Email"
                    type="email"
                    fullWidth
                    error={!!errors.reported_by_email}
                    helperText={errors.reported_by_email?.message}
                    placeholder="email@example.com"
                  />
                )}
              />
            </Box>

              <Box sx={{ flex: '1 1 250px' }}>
              <Controller
                name="reported_by_phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reporter Phone"
                    fullWidth
                    placeholder="+1 (555) 123-4567"
                  />
                )}
              />
            </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isValid}
            startIcon={loading ? undefined : <AddIcon />}
          >
            {loading ? 'Creating...' : 'Create Issue'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IssueCreateDialog;
