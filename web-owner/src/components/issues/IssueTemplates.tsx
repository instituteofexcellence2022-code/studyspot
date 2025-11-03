import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Send as SendIcon,
  Description as TemplateIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { issueService, IssueResponseTemplate } from '../../services/issueService';

interface IssueTemplatesProps {
  open: boolean;
  onClose: () => void;
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
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface CreateTemplateForm {
  name: string;
  subject: string;
  body: string;
  category_id?: string;
  priority_id?: string;
}

const IssueTemplates: React.FC<IssueTemplatesProps> = ({
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<IssueResponseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IssueResponseTemplate | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateForm>({
    defaultValues: {
      name: '',
      subject: '',
      body: '',
      category_id: '',
      priority_id: '',
    },
  });

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await issueService.getResponseTemplates();
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (data: CreateTemplateForm) => {
    try {
      setLoading(true);
      setError(null);
      
      const templateData = {
        ...data,
        category_id: data.category_id || undefined,
        priority_id: data.priority_id || undefined,
      };

      await issueService.createResponseTemplate(templateData);
      setCreateDialogOpen(false);
      reset();
      await loadTemplates();
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: IssueResponseTemplate) => {
    setEditingTemplate(template);
    reset({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category_id: template.category_id || '',
      priority_id: template.priority_id || '',
    });
    setCreateDialogOpen(true);
  };

  const handleUpdateTemplate = async (data: CreateTemplateForm) => {
    if (!editingTemplate) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        ...data,
        category_id: data.category_id || undefined,
        priority_id: data.priority_id || undefined,
      };

      await issueService.updateResponseTemplate(editingTemplate.id, updateData);
      setCreateDialogOpen(false);
      setEditingTemplate(null);
      reset();
      await loadTemplates();
    } catch (err) {
      setError('Failed to update template');
      console.error('Error updating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setLoading(true);
      await issueService.deleteResponseTemplate(templateId);
      await loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab(0);
    setError(null);
    setCreateDialogOpen(false);
    setEditingTemplate(null);
    reset();
    onClose();
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setEditingTemplate(null);
    reset();
  };

  const handleCopyTemplate = (template: IssueResponseTemplate) => {
    navigator.clipboard.writeText(template.body);
    // You could add a toast notification here
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TemplateIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Response Templates
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                New Template
              </Button>
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
              <Tab label="All Templates" />
              <Tab label="By Category" />
              <Tab label="Most Used" />
            </Tabs>
          </Box>

          {/* All Templates Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {templates.map((template) => (
                <Box sx={{ flex: '1 1 400px', minWidth: '400px' }} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {template.name}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            {template.subject}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyTemplate(template)}
                            title="Copy to clipboard"
                          >
                            <CopyIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTemplate(template)}
                            title="Edit template"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTemplate(template.id)}
                            title="Delete template"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                        }}
                      >
                        {template.body}
                      </Typography>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {template.category_name && (
                          <Chip
                            label={template.category_display_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {template.priority_name && (
                          <Chip
                            label={template.priority_display_name}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`Used ${template.usage_count} times`}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </TabPanel>

          {/* By Category Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Templates by Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Templates organized by issue category will be displayed here.
            </Typography>
          </TabPanel>

          {/* Most Used Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              Most Used Templates
            </Typography>
            <Stack spacing={2}>
              {templates
                .sort((a, b) => b.usage_count - a.usage_count)
                .slice(0, 10)
                .map((template) => (
                  <Card key={template.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.subject}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${template.usage_count} uses`}
                            size="small"
                            color="primary"
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyTemplate(template)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Template Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </Typography>
        </DialogTitle>

        <form onSubmit={handleSubmit(editingTemplate ? handleUpdateTemplate : handleCreateTemplate)}>
          <DialogContent>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Template name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Template Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., Technical Issue Response"
                  />
                )}
              />

              <Controller
                name="subject"
                control={control}
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Subject"
                    fullWidth
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    placeholder="e.g., Re: Technical Issue - Ticket #12345"
                  />
                )}
              />

              <Controller
                name="body"
                control={control}
                rules={{ required: 'Template body is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Template Body"
                    fullWidth
                    multiline
                    rows={8}
                    error={!!errors.body}
                    helperText={errors.body?.message}
                    placeholder="Enter the template content here. You can use variables like {{issue_title}}, {{student_name}}, etc."
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
                        <InputLabel>Category (Optional)</InputLabel>
                        <Select {...field} label="Category (Optional)">
                          <MenuItem value="">
                            <em>All Categories</em>
                          </MenuItem>
                          <MenuItem value="technical">Technical Issues</MenuItem>
                          <MenuItem value="facility">Facility Issues</MenuItem>
                          <MenuItem value="booking">Booking Issues</MenuItem>
                          <MenuItem value="payment">Payment Issues</MenuItem>
                          <MenuItem value="student">Student Issues</MenuItem>
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
                        <InputLabel>Priority (Optional)</InputLabel>
                        <Select {...field} label="Priority (Optional)">
                          <MenuItem value="">
                            <em>All Priorities</em>
                          </MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseCreateDialog}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={editingTemplate ? <EditIcon /> : <AddIcon />}
            >
              {loading ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default IssueTemplates;
