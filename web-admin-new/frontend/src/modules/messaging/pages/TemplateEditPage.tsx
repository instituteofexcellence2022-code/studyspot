// ============================================
// TEMPLATE EDIT PAGE
// Edit existing template
// ============================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  GridLegacy as Grid,
  Alert,
  Chip,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Send,
  Visibility,
  Add,
  Close,
} from '@mui/icons-material';

const TemplateEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Fee Due Reminder',
    category: 'Fees',
    type: 'SMS',
    content: 'Dear {student_name}, your library fee of ₹{amount} is due on {due_date}. Please pay to avoid service interruption. - {library_name}',
    autoSend: true,
    triggerEvent: 'fee_due',
    sendTiming: '-3',
    status: 'Active',
  });

  const [characterCount, setCharacterCount] = useState(142);
  const [variables, setVariables] = useState(['student_name', 'amount', 'due_date', 'library_name']);
  const [showPreview, setShowPreview] = useState(false);

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
    setCharacterCount(value.length);
    
    // Extract variables
    const regex = /\{([^}]+)\}/g;
    const matches = value.match(regex);
    if (matches) {
      const extractedVars = matches.map(match => match.replace(/[{}]/g, ''));
      setVariables([...new Set(extractedVars)]);
    }
  };

  const handleSave = () => {
    alert('Template updated successfully!');
    navigate(`/messaging/templates/${id}`);
  };

  const handleTestSend = () => {
    alert('Test message sent to your registered mobile number!');
  };

  const insertVariable = (variable: string) => {
    const newContent = formData.content + ` {${variable}}`;
    handleContentChange(newContent);
  };

  const availableVariables = [
    { category: 'Student', vars: ['student_name', 'student_id', 'email', 'phone'] },
    { category: 'Library', vars: ['library_name', 'library_address', 'library_phone'] },
    { category: 'Payment', vars: ['amount', 'due_date', 'receipt_no', 'balance'] },
    { category: 'Booking', vars: ['seat_no', 'date', 'time_slot'] },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/messaging/templates/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Template Details
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Edit Template
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Make changes to your template and save
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Visibility />} onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button variant="outlined" startIcon={<Send />} onClick={handleTestSend}>
              Send Test
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={showPreview ? 6 : 8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Template Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Template Name */}
              <TextField
                fullWidth
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 3 }}
              />

              {/* Category and Type */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      label="Category"
                    >
                      <MenuItem value="Fees">Fees</MenuItem>
                      <MenuItem value="Payment">Payment</MenuItem>
                      <MenuItem value="Booking">Booking</MenuItem>
                      <MenuItem value="Onboarding">Onboarding</MenuItem>
                      <MenuItem value="Subscription">Subscription</MenuItem>
                      <MenuItem value="Reports">Reports</MenuItem>
                      <MenuItem value="Marketing">Marketing</MenuItem>
                      <MenuItem value="Alerts">Alerts</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      label="Type"
                    >
                      <MenuItem value="SMS">SMS</MenuItem>
                      <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                      <MenuItem value="Email">Email</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Content */}
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Template Content"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                helperText={`${characterCount} characters | ${variables.length} variables detected`}
                sx={{ mb: 2 }}
              />

              {/* Character Counter */}
              {formData.type === 'SMS' && (
                <Alert severity={characterCount > 160 ? 'warning' : 'info'} sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    {characterCount > 160 
                      ? `⚠️ Message exceeds 160 characters. It will be sent as ${Math.ceil(characterCount / 160)} SMS segments.`
                      : `✓ Message is within SMS limit (${160 - characterCount} characters remaining)`
                    }
                  </Typography>
                </Alert>
              )}

              {/* Variables Detected */}
              {variables.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Variables Detected ({variables.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {variables.map((variable, index) => (
                      <Chip
                        key={index}
                        label={`{${variable}}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Auto-Send Settings */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Auto-Send Settings
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoSend}
                    onChange={(e) => setFormData({ ...formData, autoSend: e.target.checked })}
                    color="success"
                  />
                }
                label="Enable Auto-Send"
                sx={{ mb: 2 }}
              />

              {formData.autoSend && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Trigger Event</InputLabel>
                      <Select
                        value={formData.triggerEvent}
                        onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                        label="Trigger Event"
                      >
                        <MenuItem value="fee_due">Fee Due Date</MenuItem>
                        <MenuItem value="payment_received">Payment Received</MenuItem>
                        <MenuItem value="booking_confirmed">Booking Confirmed</MenuItem>
                        <MenuItem value="subscription_expiring">Subscription Expiring</MenuItem>
                        <MenuItem value="account_created">Account Created</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Send Timing</InputLabel>
                      <Select
                        value={formData.sendTiming}
                        onChange={(e) => setFormData({ ...formData, sendTiming: e.target.value })}
                        label="Send Timing"
                      >
                        <MenuItem value="0">Immediately</MenuItem>
                        <MenuItem value="-1">1 day before</MenuItem>
                        <MenuItem value="-3">3 days before</MenuItem>
                        <MenuItem value="-7">1 week before</MenuItem>
                        <MenuItem value="1">1 day after</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={showPreview ? 6 : 4}>
          {showPreview ? (
            /* Preview */
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, minHeight: 400 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {formData.type} Message:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {formData.content.replace(/\{(\w+)\}/g, (match, variable) => {
                      const examples: any = {
                        student_name: 'Rajesh Kumar',
                        amount: '500',
                        due_date: '2024-02-28',
                        library_name: 'Sunrise Library',
                        student_id: 'STU-2024-001',
                        seat_no: '12',
                        receipt_no: 'RCP-001',
                      };
                      return examples[variable] || match;
                    })}
                  </Typography>
                </Paper>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    This is how your message will look to recipients
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            /* Variable Library */
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Variable Library
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Click to insert into content
                </Typography>
                <Divider sx={{ my: 2 }} />

                {availableVariables.map((group, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {group.category}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {group.vars.map((variable, i) => (
                        <Chip
                          key={i}
                          label={`{${variable}}`}
                          size="small"
                          onClick={() => insertVariable(variable)}
                          icon={<Add />}
                          color={variables.includes(variable) ? 'primary' : 'default'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    💡 Variables will be automatically replaced with actual values when sending
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateEditPage;

