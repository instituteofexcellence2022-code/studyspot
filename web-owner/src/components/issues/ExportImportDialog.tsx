import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface ExportImportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, filters: any) => void;
  onImport: (file: File, options: any) => void;
  totalIssues: number;
  filters: any;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({
  open,
  onClose,
  onExport,
  onImport,
  totalIssues,
  filters,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({
    includeResolved: true,
    includeComments: false,
    includeAttachments: false,
    dateRange: 'all',
    customDateRange: {
      start: '',
      end: '',
    },
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipDuplicates: true,
    validateData: true,
    notifyUsers: false,
  });
  const [importStep, setImportStep] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  const exportFormats = [
    {
      id: 'csv',
      label: 'CSV (Excel)',
      description: 'Comma-separated values for Excel',
      icon: <TableChartIcon />,
      color: 'success',
    },
    {
      id: 'pdf',
      label: 'PDF Report',
      description: 'Formatted PDF report',
      icon: <PictureAsPdfIcon />,
      color: 'error',
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'Structured data format',
      icon: <DescriptionIcon />,
      color: 'info',
    },
  ];

  const handleExport = () => {
    onExport(exportFormat, exportFilters);
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStep(1);
    }
  };

  const handleImport = () => {
    if (importFile) {
      onImport(importFile, importOptions);
      // Simulate import progress
      setImportStep(2);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setImportProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setImportStep(3);
          }, 500);
        }
      }, 200);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportStep(0);
    setImportProgress(0);
    setImportOptions({
      updateExisting: false,
      skipDuplicates: true,
      validateData: true,
      notifyUsers: false,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeTab === 0 ? <DownloadIcon /> : <UploadIcon />}
            {activeTab === 0 ? 'Export Issues' : 'Import Issues'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Export" icon={<DownloadIcon />} />
            <Tab label="Import" icon={<UploadIcon />} />
          </Tabs>
        </Box>

        {/* Export Tab */}
        {activeTab === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Export <strong>{totalIssues}</strong> issues with current filters applied
              </Typography>
            </Alert>

            <Typography variant="h6" gutterBottom>
              Select Export Format:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              {exportFormats.map((format) => (
                <Paper
                  key={format.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: exportFormat === format.id ? 2 : 1,
                    borderColor: exportFormat === format.id ? `${format.color}.main` : 'divider',
                    flex: 1,
                    '&:hover': { boxShadow: 3 },
                  }}
                  onClick={() => setExportFormat(format.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {format.icon}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {format.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format.description}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Export Options:
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportFilters.includeResolved}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeResolved: e.target.checked })}
                  />
                }
                label="Include resolved issues"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportFilters.includeComments}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeComments: e.target.checked })}
                  />
                }
                label="Include comments and history"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportFilters.includeAttachments}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeAttachments: e.target.checked })}
                  />
                }
                label="Include attachment references"
              />
              
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={exportFilters.dateRange}
                  onChange={(e) => setExportFilters({ ...exportFilters, dateRange: e.target.value })}
                  label="Date Range"
                >
                  <MenuItem value="all">All Issues</MenuItem>
                  <MenuItem value="last_week">Last Week</MenuItem>
                  <MenuItem value="last_month">Last Month</MenuItem>
                  <MenuItem value="last_quarter">Last Quarter</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>

              {exportFilters.dateRange === 'custom' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={exportFilters.customDateRange.start}
                    onChange={(e) => setExportFilters({
                      ...exportFilters,
                      customDateRange: { ...exportFilters.customDateRange, start: e.target.value }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={exportFilters.customDateRange.end}
                    onChange={(e) => setExportFilters({
                      ...exportFilters,
                      customDateRange: { ...exportFilters.customDateRange, end: e.target.value }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Import Tab */}
        {activeTab === 1 && (
          <Box>
            {importStep === 0 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Import issues from a CSV or Excel file. Make sure your file follows the required format.
                  </Typography>
                </Alert>

                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FileUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Select File to Import
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Supported formats: CSV, Excel (.xlsx)
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept=".csv,.xlsx"
                      onChange={handleFileSelect}
                    />
                  </Button>
                </Box>
              </Box>
            )}

            {importStep === 1 && importFile && (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    File selected: <strong>{importFile.name}</strong> ({(importFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom>
                  Import Options:
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importOptions.updateExisting}
                        onChange={(e) => setImportOptions({ ...importOptions, updateExisting: e.target.checked })}
                      />
                    }
                    label="Update existing issues (if ID matches)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importOptions.skipDuplicates}
                        onChange={(e) => setImportOptions({ ...importOptions, skipDuplicates: e.target.checked })}
                      />
                    }
                    label="Skip duplicate issues"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importOptions.validateData}
                        onChange={(e) => setImportOptions({ ...importOptions, validateData: e.target.checked })}
                      />
                    }
                    label="Validate data before import"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={importOptions.notifyUsers}
                        onChange={(e) => setImportOptions({ ...importOptions, notifyUsers: e.target.checked })}
                      />
                    }
                    label="Notify users of new issues"
                  />
                </Stack>
              </Box>
            )}

            {importStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Importing Issues...
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={importProgress} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {importProgress}% complete
                  </Typography>
                </Box>
              </Box>
            )}

            {importStep === 3 && (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Import completed successfully! Issues have been imported.
                  </Typography>
                </Alert>
                <Button onClick={resetImport} variant="outlined">
                  Import Another File
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {activeTab === 0 && (
          <Button 
            onClick={handleExport} 
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Export Issues
          </Button>
        )}
        {activeTab === 1 && importStep === 1 && (
          <Button 
            onClick={handleImport} 
            variant="contained"
            startIcon={<SendIcon />}
          >
            Start Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExportImportDialog;













