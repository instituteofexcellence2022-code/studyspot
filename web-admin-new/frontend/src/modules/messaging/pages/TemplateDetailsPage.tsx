// ============================================
// TEMPLATE DETAILS PAGE
// View and manage individual template details
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
  Paper,
  Divider,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  ContentCopy,
  Send,
  Star,
  CheckCircle,
  Schedule,
  TrendingUp,
  Visibility,
  Settings,
  Warning,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const TemplateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);

  // Mock template data
  const template = {
    id: 1,
    name: 'Fee Due Reminder',
    category: 'Fees',
    type: 'SMS',
    content: 'Dear {student_name}, your library fee of ₹{amount} is due on {due_date}. Please pay to avoid service interruption. - {library_name}',
    variables: ['student_name', 'amount', 'due_date', 'library_name'],
    requiredPermissions: ['sms_enabled', 'fee_management', 'auto_payment_reminders'],
    status: 'Active',
    approvalStatus: 'Approved',
    isDefault: true,
    autoSend: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20',
    createdBy: 'Admin User',
    usageCount: 1567,
    lastUsed: '2 hours ago',
    deliveryRate: 96.8,
    characterCount: 142,
  };

  // Permission definitions
  const permissionDefinitions: any = {
    sms_enabled: { label: 'SMS Messaging', description: 'Basic permission to send SMS', critical: true },
    fee_management: { label: 'Fee Management', description: 'Access to fee and payment features', critical: true },
    auto_payment_reminders: { label: 'Auto Payment Reminders', description: 'Automated payment reminder messages', critical: false },
    seat_allocation: { label: 'Seat Allocation', description: 'Booking and seat management', critical: true },
    booking_confirmations: { label: 'Booking Confirmations', description: 'Send booking confirmation messages', critical: false },
    student_management: { label: 'Student Management', description: 'Student registration and management', critical: true },
    marketing_enabled: { label: 'Marketing Messages', description: 'Promotional and marketing communications', critical: false },
  };

  // Usage analytics data
  const usageData = [
    { date: 'Jan 15', sent: 45, delivered: 44, failed: 1 },
    { date: 'Jan 16', sent: 52, delivered: 50, failed: 2 },
    { date: 'Jan 17', sent: 38, delivered: 37, failed: 1 },
    { date: 'Jan 18', sent: 67, delivered: 65, failed: 2 },
    { date: 'Jan 19', sent: 89, delivered: 86, failed: 3 },
    { date: 'Jan 20', sent: 73, delivered: 71, failed: 2 },
    { date: 'Jan 21', sent: 56, delivered: 54, failed: 2 },
  ];

  const recentUsage = [
    { id: 1, recipient: 'Rajesh Kumar', phone: '+91 98765 43210', sentAt: '2024-02-20 14:30', status: 'Delivered', deliveryTime: '2s' },
    { id: 2, recipient: 'Priya Sharma', phone: '+91 98765 43211', sentAt: '2024-02-20 14:15', status: 'Delivered', deliveryTime: '1s' },
    { id: 3, recipient: 'Amit Patel', phone: '+91 98765 43212', sentAt: '2024-02-20 13:45', status: 'Delivered', deliveryTime: '3s' },
    { id: 4, recipient: 'Sneha Reddy', phone: '+91 98765 43213', sentAt: '2024-02-20 13:30', status: 'Failed', deliveryTime: '-' },
    { id: 5, recipient: 'Vikram Singh', phone: '+91 98765 43214', sentAt: '2024-02-20 13:00', status: 'Delivered', deliveryTime: '2s' },
  ];

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      alert('Template deleted successfully!');
      navigate('/messaging/templates');
    }
  };

  const handleDuplicate = () => {
    alert('Template duplicated successfully!');
    navigate('/messaging/templates');
  };

  const handleEdit = () => {
    navigate(`/messaging/templates/${id}/edit`);
  };

  const handleTestSend = () => {
    alert('Test message sent to your registered mobile number!');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/messaging/templates')}
          sx={{ mb: 2 }}
        >
          Back to Templates
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                {template.name}
              </Typography>
              {template.isDefault && <Chip icon={<Star />} label="Default Template" color="warning" />}
              <Chip 
                label={template.approvalStatus} 
                color={template.approvalStatus === 'Approved' ? 'success' : 'warning'}
                icon={<CheckCircle />}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={template.type} size="small" color="primary" />
              <Chip label={template.category} size="small" />
              <Typography variant="body2" color="text.secondary">
                Created on {template.createdAt} by {template.createdBy}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Send />} onClick={handleTestSend}>
              Send Test
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button variant="contained" startIcon={<Edit />} onClick={handleEdit}>
              Edit
            </Button>
            <IconButton color="error" onClick={handleDelete}>
              <Delete />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Sent</Typography>
                  <Typography variant="h4" fontWeight="bold">{template.usageCount}</Typography>
                  <Typography variant="caption" color="success.main">messages</Typography>
                </Box>
                <Send color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Delivery Rate</Typography>
                  <Typography variant="h4" fontWeight="bold">{template.deliveryRate}%</Typography>
                  <Typography variant="caption" color="success.main">success rate</Typography>
                </Box>
                <CheckCircle color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Last Used</Typography>
                  <Typography variant="h6" fontWeight="bold">{template.lastUsed}</Typography>
                  <Typography variant="caption" color="text.secondary">recently active</Typography>
                </Box>
                <Schedule color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Characters</Typography>
                  <Typography variant="h4" fontWeight="bold">{template.characterCount}</Typography>
                  <Typography variant="caption" color="text.secondary">avg length</Typography>
                </Box>
                <Settings color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Template Content */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Template Content</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSendEnabled}
                      onChange={(e) => setAutoSendEnabled(e.target.checked)}
                      color="success"
                    />
                  }
                  label="Auto-Send Enabled"
                />
              </Box>
              <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {template.content}
                </Typography>
              </Paper>
            </CardContent>
          </Card>

          {/* Usage Trend */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                7-Day Usage Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#2196F3" strokeWidth={2} name="Sent" />
                  <Line type="monotone" dataKey="delivered" stroke="#4CAF50" strokeWidth={2} name="Delivered" />
                  <Line type="monotone" dataKey="failed" stroke="#F44336" strokeWidth={2} name="Failed" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Usage */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Usage
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Delivery Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsage.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.recipient}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.sentAt}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            size="small"
                            color={row.status === 'Delivered' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{row.deliveryTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Variables */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Variables ({template.variables.length})
              </Typography>
              <Stack spacing={1}>
                {template.variables.map((variable, index) => (
                  <Paper key={index} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="bold" color="primary">
                      {`{${variable}}`}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  These variables will be automatically replaced with actual values when sending.
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Required Permissions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Required Library Permissions
              </Typography>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Libraries must have these permissions for auto-send to work
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1.5}>
                {template.requiredPermissions.map((permission, index) => {
                  const permInfo = permissionDefinitions[permission];
                  return (
                    <Paper 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        border: 1, 
                        borderColor: permInfo?.critical ? 'error.light' : 'divider',
                        bgcolor: permInfo?.critical ? 'error.50' : 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {permInfo?.critical && <Warning fontSize="small" color="error" />}
                        <Typography variant="body2" fontWeight="bold">
                          {permInfo?.label || permission}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {permInfo?.description || 'Permission required'}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  ⚠️ If a library doesn't have these permissions, auto-send will be skipped for that library.
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          {/* Auto-Send Settings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Auto-Send Settings
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Trigger Event</Typography>
                  <Chip label="Fee Due Date" color="primary" sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Send Time</Typography>
                  <Typography variant="body1" fontWeight="bold">3 days before due date</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={autoSendEnabled ? "Active" : "Inactive"} 
                    color={autoSendEnabled ? "success" : "default"} 
                    size="small"
                  />
                </Box>
              </Stack>
              <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<Settings />}>
                Configure Rules
              </Button>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Template Info
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2">{template.createdAt}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2">{template.updatedAt}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Created By</Typography>
                  <Typography variant="body2">{template.createdBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={template.status} size="small" color="success" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TemplateDetailsPage;

