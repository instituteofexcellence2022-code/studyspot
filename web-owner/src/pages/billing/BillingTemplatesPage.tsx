import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Slider, Divider, Alert, Snackbar, IconButton,
  Tooltip, Badge, Tabs, Tab, Paper, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Palette as PaletteIcon, ViewModule as TemplateIcon, Preview as PreviewIcon,
  Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, ContentCopy as CopyIcon,
  Download as DownloadIcon, Upload as UploadIcon, Save as SaveIcon,
  Business as BusinessIcon, School as SchoolIcon, Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon, Description as DescriptionIcon,
  Settings as SettingsIcon, Visibility as ViewIcon, Star as StarIcon,
} from '@mui/icons-material';

interface BillingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'library' | 'tuition' | 'membership' | 'custom' | 'professional';
  layout: 'modern' | 'classic' | 'minimal' | 'elegant' | 'corporate';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  logo: {
    enabled: boolean;
    position: 'top-left' | 'top-center' | 'top-right';
    size: 'small' | 'medium' | 'large';
  };
  header: {
    showBusinessInfo: boolean;
    showContactInfo: boolean;
    showInvoiceNumber: boolean;
    showDate: boolean;
  };
  items: {
    showDescription: boolean;
    showQuantity: boolean;
    showRate: boolean;
    showAmount: boolean;
    showTax: boolean;
  };
  footer: {
    showTerms: boolean;
    showNotes: boolean;
    showPaymentInfo: boolean;
    showSignature: boolean;
  };
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

const MOCK_TEMPLATES: BillingTemplate[] = [
  {
    id: 'modern-library',
    name: 'Modern Library',
    description: 'Clean, contemporary design perfect for modern libraries',
    category: 'library',
    layout: 'modern',
    colors: {
      primary: '#1976d2',
      secondary: '#42a5f5',
      accent: '#90caf9',
      background: '#ffffff',
      text: '#212121',
    },
    fonts: {
      heading: 'Roboto',
      body: 'Roboto',
      monospace: 'Roboto Mono',
    },
    logo: {
      enabled: true,
      position: 'top-left',
      size: 'medium',
    },
    header: {
      showBusinessInfo: true,
      showContactInfo: true,
      showInvoiceNumber: true,
      showDate: true,
    },
    items: {
      showDescription: true,
      showQuantity: true,
      showRate: true,
      showAmount: true,
      showTax: true,
    },
    footer: {
      showTerms: true,
      showNotes: true,
      showPaymentInfo: true,
      showSignature: false,
    },
    isDefault: true,
    isCustom: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-01',
    preview: 'Modern layout with clean typography and blue accent colors',
  },
  {
    id: 'classic-tuition',
    name: 'Classic Tuition',
    description: 'Traditional design for educational institutions',
    category: 'tuition',
    layout: 'classic',
    colors: {
      primary: '#2e7d32',
      secondary: '#4caf50',
      accent: '#81c784',
      background: '#ffffff',
      text: '#212121',
    },
    fonts: {
      heading: 'Times New Roman',
      body: 'Times New Roman',
      monospace: 'Courier New',
    },
    logo: {
      enabled: true,
      position: 'top-center',
      size: 'large',
    },
    header: {
      showBusinessInfo: true,
      showContactInfo: true,
      showInvoiceNumber: true,
      showDate: true,
    },
    items: {
      showDescription: true,
      showQuantity: true,
      showRate: true,
      showAmount: true,
      showTax: true,
    },
    footer: {
      showTerms: true,
      showNotes: true,
      showPaymentInfo: true,
      showSignature: true,
    },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-11-15',
    preview: 'Classic layout with formal styling and green accent colors',
  },
  {
    id: 'minimal-membership',
    name: 'Minimal Membership',
    description: 'Simple, clean design for membership fees',
    category: 'membership',
    layout: 'minimal',
    colors: {
      primary: '#424242',
      secondary: '#757575',
      accent: '#bdbdbd',
      background: '#ffffff',
      text: '#212121',
    },
    fonts: {
      heading: 'Helvetica',
      body: 'Helvetica',
      monospace: 'Monaco',
    },
    logo: {
      enabled: false,
      position: 'top-left',
      size: 'small',
    },
    header: {
      showBusinessInfo: true,
      showContactInfo: false,
      showInvoiceNumber: true,
      showDate: true,
    },
    items: {
      showDescription: true,
      showQuantity: false,
      showRate: true,
      showAmount: true,
      showTax: false,
    },
    footer: {
      showTerms: false,
      showNotes: true,
      showPaymentInfo: true,
      showSignature: false,
    },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-10-01',
    preview: 'Minimal layout with essential information only',
  },
  {
    id: 'elegant-custom',
    name: 'Elegant Custom',
    description: 'Sophisticated design for premium services',
    category: 'custom',
    layout: 'elegant',
    colors: {
      primary: '#d32f2f',
      secondary: '#f44336',
      accent: '#ef5350',
      background: '#fafafa',
      text: '#212121',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Source Sans Pro',
      monospace: 'Fira Code',
    },
    logo: {
      enabled: true,
      position: 'top-right',
      size: 'medium',
    },
    header: {
      showBusinessInfo: true,
      showContactInfo: true,
      showInvoiceNumber: true,
      showDate: true,
    },
    items: {
      showDescription: true,
      showQuantity: true,
      showRate: true,
      showAmount: true,
      showTax: true,
    },
    footer: {
      showTerms: true,
      showNotes: true,
      showPaymentInfo: true,
      showSignature: true,
    },
    isDefault: false,
    isCustom: true,
    createdAt: '2024-03-01',
    updatedAt: '2024-12-01',
    preview: 'Elegant layout with sophisticated typography and red accent colors',
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Professional design for corporate clients',
    category: 'professional',
    layout: 'corporate',
    colors: {
      primary: '#1565c0',
      secondary: '#1976d2',
      accent: '#42a5f5',
      background: '#ffffff',
      text: '#212121',
    },
    fonts: {
      heading: 'Open Sans',
      body: 'Open Sans',
      monospace: 'Roboto Mono',
    },
    logo: {
      enabled: true,
      position: 'top-left',
      size: 'large',
    },
    header: {
      showBusinessInfo: true,
      showContactInfo: true,
      showInvoiceNumber: true,
      showDate: true,
    },
    items: {
      showDescription: true,
      showQuantity: true,
      showRate: true,
      showAmount: true,
      showTax: true,
    },
    footer: {
      showTerms: true,
      showNotes: true,
      showPaymentInfo: true,
      showSignature: true,
    },
    isDefault: false,
    isCustom: false,
    createdAt: '2024-04-01',
    updatedAt: '2024-11-01',
    preview: 'Corporate layout with professional styling and blue color scheme',
  },
];

const BillingTemplatesPage: React.FC = () => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<BillingTemplate[]>(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<BillingTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const handleEditTemplate = (template: BillingTemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: BillingTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleDuplicateTemplate = (template: BillingTemplate) => {
    const newTemplate: BillingTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setTemplates(prev => [...prev, newTemplate]);
    setSnackbar({
      open: true,
      message: `Template "${template.name}" duplicated successfully!`,
      severity: 'success',
    });
  };

  const handleDeleteTemplate = (template: BillingTemplate) => {
    if (template.isDefault) {
      setSnackbar({
        open: true,
        message: 'Cannot delete default template!',
        severity: 'error',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      setSnackbar({
        open: true,
        message: `Template "${template.name}" deleted successfully!`,
        severity: 'success',
      });
    }
  };

  const handleSetDefault = (template: BillingTemplate) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === template.id
    })));
    setSnackbar({
      open: true,
      message: `Template "${template.name}" set as default!`,
      severity: 'success',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'library':
        return <SchoolIcon />;
      case 'tuition':
        return <ReceiptIcon />;
      case 'membership':
        return <MoneyIcon />;
      case 'custom':
        return <TemplateIcon />;
      case 'professional':
        return <BusinessIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'library':
        return 'primary';
      case 'tuition':
        return 'success';
      case 'membership':
        return 'warning';
      case 'custom':
        return 'secondary';
      case 'professional':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return template.isDefault;
    if (tabValue === 2) return template.isCustom;
    if (tabValue === 3) return template.category === 'library';
    if (tabValue === 4) return template.category === 'tuition';
    if (tabValue === 5) return template.category === 'membership';
    return false;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🎨 Billing Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and customize professional invoice templates
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            Import Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Templates" />
          <Tab label="Default" />
          <Tab label="Custom" />
          <Tab label="Library" />
          <Tab label="Tuition" />
          <Tab label="Membership" />
        </Tabs>
      </Card>

      {/* Templates Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredTemplates.map((template) => (
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }} key={template.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              {template.isDefault && (
                <Badge
                  badgeContent="Default"
                  color="primary"
                  sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                />
              )}
              <CardContent>
                {/* Template Preview */}
                <Box
                  sx={{
                    height: 120,
                    bgcolor: template.colors.background,
                    border: `2px solid ${template.colors.primary}`,
                    borderRadius: 1,
                    mb: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Mock Invoice Preview */}
                  <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 30,
                          height: 8,
                          bgcolor: template.colors.primary,
                          borderRadius: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: template.colors.text,
                          fontSize: '8px',
                          fontFamily: template.fonts.heading,
                        }}
                      >
                        INV-001
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: '80%',
                          height: 4,
                          bgcolor: template.colors.secondary,
                          borderRadius: 0.5,
                        }}
                      />
                      <Box
                        sx={{
                          width: '60%',
                          height: 3,
                          bgcolor: template.colors.accent,
                          borderRadius: 0.5,
                        }}
                      />
                      <Box
                        sx={{
                          width: '40%',
                          height: 3,
                          bgcolor: template.colors.accent,
                          borderRadius: 0.5,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 4,
                          bgcolor: template.colors.primary,
                          borderRadius: 0.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: template.colors.text,
                          fontSize: '8px',
                          fontFamily: template.fonts.body,
                        }}
                      >
                        ₹5,000
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Template Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={getCategoryIcon(template.category)}
                      label={template.category}
                      size="small"
                      color={getCategoryColor(template.category) as any}
                    />
                    <Chip
                      label={template.layout}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Color Palette */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Tooltip title="Primary">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: template.colors.primary,
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Secondary">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: template.colors.secondary,
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Accent">
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: template.colors.accent,
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handlePreviewTemplate(template)}
                    fullWidth
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditTemplate(template)}
                    variant="outlined"
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleDuplicateTemplate(template)}
                    variant="outlined"
                  >
                    Copy
                  </Button>
                  {!template.isDefault && (
                    <Button
                      size="small"
                      startIcon={<StarIcon />}
                      onClick={() => handleSetDefault(template)}
                      variant="outlined"
                    >
                      Set Default
                    </Button>
                  )}
                  {!template.isDefault && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Template creation wizard will be implemented here with step-by-step customization options.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will include:
            <br />• Template name and description
            <br />• Category and layout selection
            <br />• Color scheme customization
            <br />• Font selection
            <br />• Logo and branding options
            <br />• Header and footer configuration
            <br />• Item display options
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create Template</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Template: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Template editor will be implemented here with live preview and customization options.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will include:
            <br />• Live preview of changes
            <br />• Color picker for all elements
            <br />• Font family and size selection
            <br />• Layout configuration
            <br />• Logo upload and positioning
            <br />• Header and footer toggles
            <br />• Item display options
            <br />• Save and preview functionality
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Template Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedTemplate.preview}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Category: ${selectedTemplate.category}`} size="small" />
                <Chip label={`Layout: ${selectedTemplate.layout}`} size="small" />
                <Chip label={`Font: ${selectedTemplate.fonts.heading}`} size="small" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>Download</Button>
          <Button variant="contained" startIcon={<EditIcon />}>Edit</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BillingTemplatesPage;
