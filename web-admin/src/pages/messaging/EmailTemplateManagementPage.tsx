import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Select,
  Tabs,
  Tab,
  Avatar,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  CardContent,
  Paper
} from '@mui/material';
/**
 * Email Template Management Page
 * 
 * Features:
 * - Email template creation and editing
 * - Template categories and organization
 * - Variable substitution and personalization
 * - Template testing and preview
 * - Template versioning and approval workflow
 * - Template analytics and performance tracking
 */

import React, { useState, useEffect } from 'react';
import { Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Assignment as AuditIcon,
  Backup as BackupIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ChevronRight as ChevronRightIcon,
  ContentCopy as CopyIcon,
  DataUsage as DataIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Fingerprint as FingerprintIcon,
  Flag as FlagIcon,
  Group as GroupIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PieChart as PieChartIcon,
  PlayArrow as PlayIcon,
  Preview as PreviewIcon,
  PrivacyTip as PrivacyIcon,
  QrCode as QrCodeIcon,
  Refresh as RefreshIcon,
  Report as ReportIcon,
  RestartAlt as RestartIcon,
  Science as ScienceIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  ShowChart as ShowChartIcon,
  Smartphone as SmartphoneIcon,
  Sms as SmsIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  VerifiedUser as VerifiedUserIcon,
  Visibility as ViewIcon,
  VpnKey as VpnKeyIcon,
  Warning as WarningIcon } from '@mui/icons-material';
;
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  status: 'draft' | 'active' | 'archived' | 'pending_approval';
  language: string;
  variables: string[];
  lastUsed: string;
  usageCount: number;
  openRate: number;
  clickRate: number;
  unsubRate: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  version: number;
  isDefault: boolean;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templateCount: number;
  color: string;
}

const EmailTemplateManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  useEffect(() => {
    setTemplates([
      {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to StudySpot, {{user.name}}!',
        category: 'Onboarding',
        status: 'active',
        language: 'en',
        variables: ['user.name', 'user.email', 'tenant.name'],
        lastUsed: '2024-01-15T10:30:00Z',
        usageCount: 1250,
        openRate: 78.5,
        clickRate: 24.3,
        unsubRate: 0.8,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        createdBy: 'admin@company.com',
        approvedBy: 'manager@company.com',
        version: 3,
        isDefault: true
      },
      {
        id: '2',
        name: 'Booking Confirmation',
        subject: 'Your seat is confirmed - {{booking.seat}}',
        category: 'Booking',
        status: 'active',
        language: 'en',
        variables: ['booking.seat', 'booking.date', 'booking.time', 'user.name'],
        lastUsed: '2024-01-15T09:15:00Z',
        usageCount: 3420,
        openRate: 85.2,
        clickRate: 31.7,
        unsubRate: 0.3,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        createdBy: 'product@company.com',
        approvedBy: 'manager@company.com',
        version: 2,
        isDefault: true
      },
      {
        id: '3',
        name: 'Payment Reminder',
        subject: 'Payment due for {{tenant.name}}',
        category: 'Billing',
        status: 'pending_approval',
        language: 'en',
        variables: ['tenant.name', 'amount', 'due_date'],
        lastUsed: 'Never',
        usageCount: 0,
        openRate: 0,
        clickRate: 0,
        unsubRate: 0,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        createdBy: 'billing@company.com',
        version: 1,
        isDefault: false
      }
    ]);

    setCategories([
      { id: '1', name: 'Onboarding', description: 'Welcome and setup emails', templateCount: 5, color: 'primary' },
      { id: '2', name: 'Booking', description: 'Seat booking related emails', templateCount: 8, color: 'success' },
      { id: '3', name: 'Billing', description: 'Payment and subscription emails', templateCount: 6, color: 'warning' },
      { id: '4', name: 'Marketing', description: 'Promotional and newsletter emails', templateCount: 12, color: 'info' },
      { id: '5', name: 'System', description: 'System notifications and alerts', templateCount: 4, color: 'error' }
    ]);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'default';
      case 'archived': return 'error';
      case 'pending_approval': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.name === category);
    return cat?.color || 'default';
  };

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const templateMetrics = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter((t: any) => t.status === 'active').length,
    pendingApproval: templates.filter((t: any) => t.status === 'pending_approval').length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    averageOpenRate: templates.reduce((sum, t) => sum + t.openRate, 0) / templates.length,
    averageClickRate: templates.reduce((sum, t) => sum + t.clickRate, 0) / templates.length
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Email Template Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, manage, and optimize email templates for all communication needs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {/* Template Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 3 
      }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <EmailIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Total Templates</Typography>
                <Typography variant="h4">{templateMetrics.totalTemplates}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {templateMetrics.activeTemplates} active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Pending Approval</Typography>
                <Typography variant="h4">{templateMetrics.pendingApproval}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting review
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Open Rate</Typography>
                <Typography variant="h4">{templateMetrics.averageOpenRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all templates
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Avg Click Rate</Typography>
                <Typography variant="h4">{templateMetrics.averageClickRate.toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Across all templates
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Templates" />
          <Tab label="Categories" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Email Templates</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending_approval">Pending Approval</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Template</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <EmailIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{template.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.subject}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.category}
                        color={getCategoryColor(template.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.status.replace('_', ' ')}
                        color={getStatusColor(template.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.usageCount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">
                          Open: {template.openRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">
                          Click: {template.clickRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {template.lastUsed === 'Never' ? 'Never' : new Date(template.lastUsed).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setSelectedTemplate(template)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <PreviewIcon />
                        </IconButton>
                        <IconButton size="small">
                          <CopyIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Categories Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Template Categories</Typography>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create Category
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {category.description}
                      </Typography>
                      <Chip
                        label={`${category.templateCount} templates`}
                        color={category.color as any}
                        size="small"
                      />
                    </Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Templates
                    </Button>
                    <Button size="small" startIcon={<AddIcon />}>
                      Add Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Template Performance Analytics</Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3 
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Open Rate Trends</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Click Rate by Category</Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Chart placeholder</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Performing Templates</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Booking Confirmation"
                    secondary="Open Rate: 85.2% | Click Rate: 31.7% | Usage: 3,420"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Welcome Email"
                    secondary="Open Rate: 78.5% | Click Rate: 24.3% | Usage: 1,250"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Payment Reminder"
                    secondary="Open Rate: 0% | Click Rate: 0% | Usage: 0 (Pending Approval)"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Email Template Settings</Typography>
          
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Template Configuration</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require approval for template changes"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable template versioning"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Allow HTML in templates"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable template analytics"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Variable Management</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Manage available variables for template personalization
                </Alert>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="User variables (comma separated)"
                    defaultValue="user.name, user.email, user.phone"
                    size="small"
                  />
                  <TextField
                    label="Tenant variables (comma separated)"
                    defaultValue="tenant.name, tenant.logo, tenant.address"
                    size="small"
                  />
                  <TextField
                    label="Booking variables (comma separated)"
                    defaultValue="booking.seat, booking.date, booking.time"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on template approval requests"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notify on template performance alerts"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Notify on template usage milestones"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Template Details Dialog */}
      <Dialog open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)} maxWidth="md" fullWidth>
        <DialogTitle>Template Details</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTemplate.subject}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Template Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Category: {selectedTemplate.category}</Typography>
                      <Typography variant="body2">Status: {selectedTemplate.status}</Typography>
                      <Typography variant="body2">Language: {selectedTemplate.language}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Version: {selectedTemplate.version}</Typography>
                      <Typography variant="body2">Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}</Typography>
                      <Typography variant="body2">Updated: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="body2">Usage Count: {selectedTemplate.usageCount.toLocaleString()}</Typography>
                      <Typography variant="body2">Open Rate: {selectedTemplate.openRate.toFixed(1)}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Click Rate: {selectedTemplate.clickRate.toFixed(1)}%</Typography>
                      <Typography variant="body2">Unsubscribe Rate: {selectedTemplate.unsubRate.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Available Variables</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedTemplate.variables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{{${variable}}}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="contained">Edit Template</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplateManagementPage;
