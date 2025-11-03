import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Description as TemplateIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  Pause as PauseIcon,
  Phone as PhoneIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  Sms as SmsIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  WhatsApp as WhatsAppIcon

  } from '@mui/icons-material';
import { useServiceManagement } from '../../hooks/useServiceManagement';

const CommunicationServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use real Communication service hook
  const {
    status,
    metrics,
    error,
    serviceControl,
    refresh,
    refreshMetrics} = useServiceManagement('communication');

  // Mock data for messages, templates, and campaigns
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'email',
      recipient: 'user@example.com',
      subject: 'Welcome to StudySpot',
      content: 'Welcome to our platform!',
      status: 'sent',
      sentAt: '2024-01-15 10:30:00',
      deliveryStatus: 'delivered'},
    {
      id: '2',
      type: 'sms',
      recipient: '+1234567890',
      content: 'Your payment has been processed successfully.',
      status: 'sent',
      sentAt: '2024-01-15 11:15:00',
      deliveryStatus: 'delivered'},
    {
      id: '3',
      type: 'whatsapp',
      recipient: '+1234567890',
      content: 'Thank you for your feedback!',
      status: 'pending',
      sentAt: null,
      deliveryStatus: 'pending'},
  ]);

  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to StudySpot',
      content: 'Dear {{name}}, welcome to StudySpot!',
      variables: ['name', 'email'],
      usageCount: 1247,
      lastUsed: '2024-01-15 09:30:00'},
    {
      id: '2',
      name: 'Payment Confirmation SMS',
      type: 'sms',
      content: 'Payment of ${{amount}} confirmed for {{service}}',
      variables: ['amount', 'service'],
      usageCount: 3421,
      lastUsed: '2024-01-15 11:45:00'},
    {
      id: '3',
      name: 'Appointment Reminder',
      type: 'whatsapp',
      content: 'Reminder: You have an appointment tomorrow at {{time}}',
      variables: ['time', 'location'],
      usageCount: 856,
      lastUsed: '2024-01-14 16:20:00'},
  ]);

  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'New User Onboarding',
      type: 'email',
      status: 'active',
      recipients: 1250,
      sent: 1180,
      delivered: 1156,
      opened: 892,
      clicked: 234,
      scheduledAt: '2024-01-15 08:00:00'},
    {
      id: '2',
      name: 'Payment Reminder',
      type: 'sms',
      status: 'completed',
      recipients: 500,
      sent: 500,
      delivered: 498,
      opened: 0,
      clicked: 0,
      scheduledAt: '2024-01-14 10:00:00'},
    {
      id: '3',
      name: 'Feature Announcement',
      type: 'whatsapp',
      status: 'scheduled',
      recipients: 2000,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      scheduledAt: '2024-01-16 14:00:00'},
  ]);

  useEffect(() => {
    refresh();
    refreshMetrics();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = async () => {
    try {
      await refresh();
      await refreshMetrics();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const handleSendMessage = async (messageData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newMessage = {
        id: Date.now().toString(),
        ...messageData,
        status: 'sent',
        sentAt: new Date().toISOString(),
        deliveryStatus: 'delivered'};
      setMessages(prev => [...prev, newMessage]);
      alert('Message sent successfully!');
      setSendMessageOpen(false);
    } catch (err) {
      alert(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTemplate = {
        id: Date.now().toString(),
        ...templateData,
        usageCount: 0,
        lastUsed: null};
      setTemplates(prev => [...prev, newTemplate]);
      alert('Template created successfully!');
      setCreateTemplateOpen(false);
    } catch (err) {
      alert(`Failed to create template: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newCampaign = {
        id: Date.now().toString(),
        ...campaignData,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0};
      setCampaigns(prev => [...prev, newCampaign]);
      alert('Campaign created successfully!');
      setCreateCampaignOpen(false);
    } catch (err) {
      alert(`Failed to create campaign: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceControl = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setIsLoading(true);
      switch (action) {
        case 'start':
          await serviceControl.start();
          break;
        case 'stop':
          await serviceControl.stop();
          break;
        case 'restart':
          await serviceControl.restart();
          break;
      }
      alert(`Service ${action}ed successfully!`);
      await refreshData();
    } catch (err) {
      alert(`Failed to ${action} service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Communication Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage messages, templates, and communication campaigns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => handleServiceControl('restart')}
            disabled={isLoading}
            color="warning"
          >
            Restart Service
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setSendMessageOpen(true)}
          >
            Send Message
          </Button>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => setCreateTemplateOpen(true)}
          >
            Create Template
          </Button>
          <Button
            variant="outlined"
            startIcon={<CampaignIcon />}
            onClick={() => setCreateCampaignOpen(true)}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <MessageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Messages Sent</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.totalRequests || 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Today: {messages.filter((m: any) => m.status === 'sent').length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <TemplateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Templates</Typography>
                  <Typography variant="h4" color="primary">
                    {templates.length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Active: {metrics?.activeConnections || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b', mr: 2 }}>
                  <CampaignIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Campaigns</Typography>
                  <Typography variant="h4" color="primary">
                    {campaigns.filter((c: any) => c.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {campaigns.length} campaigns
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <AnalyticsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Delivery Rate</Typography>
                  <Typography variant="h4" color="primary">
                    {metrics?.errorRate ? (100 - metrics.errorRate).toFixed(1) : 98.5}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.errorRate ? (100 - metrics.errorRate) : 98.5} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Service Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Service Status</Typography>
            <Chip
              label={status.status}
              color={status.status === 'healthy' ? 'success' : 'error'}
              icon={status.status === 'healthy' ? <CheckIcon /> : <ErrorIcon />}
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Uptime</Typography>
              <Typography variant="body1">{status.uptime || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Version</Typography>
              <Typography variant="body1">{status.version || 'N/A'}</Typography>
            </Box>
            <Box sx={{ flex: '1 1 200px' }}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{metrics?.lastUpdated || 'N/A'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Messages" />
            <Tab label="Templates" />
            <Tab label="Campaigns" />
            <Tab label="Performance" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Messages Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Communication Messages</Typography>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setSendMessageOpen(true)}
                >
                  Send Message
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Subject/Content</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent At</TableCell>
                      <TableCell>Delivery</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <Chip 
                            label={message.type} 
                            color={
                              message.type === 'email' ? 'primary' : 
                              message.type === 'sms' ? 'secondary' : 
                              'success'
                            }
                            size="small"
                            icon={
                              message.type === 'email' ? <EmailIcon /> :
                              message.type === 'sms' ? <SmsIcon /> :
                              <WhatsAppIcon />
                            }
                          />
                        </TableCell>
                        <TableCell>{message.recipient}</TableCell>
                        <TableCell>
                          {message.subject || message.content.substring(0, 50) + '...'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={message.status} 
                            color={message.status === 'sent' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{message.sentAt || 'Pending'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={message.deliveryStatus} 
                            color={message.deliveryStatus === 'delivered' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Templates Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Message Templates</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateTemplateOpen(true)}
                >
                  Create Template
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {templates.map((template) => (
                  <Card key={template.id} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{template.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{template.type}</Typography>
                        </Box>
                        <Chip
                          label={`${template.usageCount} uses`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {template.subject || template.content.substring(0, 100) + '...'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Variables</Typography>
                          <Typography variant="body1">{template.variables.length}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Last Used</Typography>
                          <Typography variant="body1">{template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Campaigns Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Communication Campaigns</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell>Sent</TableCell>
                      <TableCell>Delivered</TableCell>
                      <TableCell>Opened</TableCell>
                      <TableCell>Clicked</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>{campaign.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={campaign.type} 
                            color={
                              campaign.type === 'email' ? 'primary' : 
                              campaign.type === 'sms' ? 'secondary' : 
                              'success'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={campaign.status} 
                            color={
                              campaign.status === 'active' ? 'success' : 
                              campaign.status === 'completed' ? 'primary' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{campaign.recipients}</TableCell>
                        <TableCell>{campaign.sent}</TableCell>
                        <TableCell>{campaign.delivered}</TableCell>
                        <TableCell>{campaign.opened}</TableCell>
                        <TableCell>{campaign.clicked}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Performance Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Trend</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Message Delivery Time</TableCell>
                      <TableCell>{metrics?.responseTime || 0}ms</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-15%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Throughput</TableCell>
                      <TableCell>{metrics?.activeConnections || 0} msg/min</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">+22%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Excellent" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Error Rate</TableCell>
                      <TableCell>{metrics?.errorRate || 0}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ color: '#16a34a', mr: 1 }} />
                          <Typography variant="body2" color="success.main">-5%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label="Good" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Send Message Dialog */}
      <Dialog
        open={sendMessageOpen}
        onClose={() => setSendMessageOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Send Message
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Message Type</InputLabel>
              <Select label="Message Type" id="message-type">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Recipient"
              fullWidth
              variant="outlined"
              id="recipient"
              placeholder="email@example.com or +1234567890"
            />
            <TextField
              label="Subject (for email)"
              fullWidth
              variant="outlined"
              id="subject"
            />
            <TextField
              label="Message Content"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              id="content"
              placeholder="Enter your message content here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendMessageOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const type = (document.getElementById('message-type') as HTMLSelectElement)?.value;
              const recipient = (document.getElementById('recipient') as HTMLInputElement)?.value;
              const subject = (document.getElementById('subject') as HTMLInputElement)?.value;
              const content = (document.getElementById('content') as HTMLInputElement)?.value;
              
              if (!type || !recipient || !content) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleSendMessage({
                type,
                recipient,
                subject,
                content});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog
        open={createTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Message Template
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Template Name"
              fullWidth
              variant="outlined"
              id="template-name"
            />
            <FormControl fullWidth>
              <InputLabel>Template Type</InputLabel>
              <Select label="Template Type" id="template-type">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Subject (for email)"
              fullWidth
              variant="outlined"
              id="template-subject"
            />
            <TextField
              label="Template Content"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              id="template-content"
              placeholder="Use {{variable}} for dynamic content..."
            />
            <TextField
              label="Variables (comma-separated)"
              fullWidth
              variant="outlined"
              id="template-variables"
              placeholder="name, email, amount"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTemplateOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('template-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('template-type') as HTMLSelectElement)?.value;
              const subject = (document.getElementById('template-subject') as HTMLInputElement)?.value;
              const content = (document.getElementById('template-content') as HTMLInputElement)?.value;
              const variablesStr = (document.getElementById('template-variables') as HTMLInputElement)?.value;
              
              if (!name || !type || !content) {
                alert('Please fill in all required fields');
                return;
              }
              
              const variables = variablesStr ? variablesStr.split(',').map((v: any) => v.trim()) : [];
              
              handleCreateTemplate({
                name,
                type,
                subject,
                content,
                variables});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog
        open={createCampaignOpen}
        onClose={() => setCreateCampaignOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Communication Campaign
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Campaign Name"
              fullWidth
              variant="outlined"
              id="campaign-name"
            />
            <FormControl fullWidth>
              <InputLabel>Campaign Type</InputLabel>
              <Select label="Campaign Type" id="campaign-type">
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Recipients Count"
              fullWidth
              variant="outlined"
              type="number"
              id="recipients-count"
            />
            <TextField
              label="Schedule Date & Time"
              fullWidth
              variant="outlined"
              type="datetime-local"
              id="schedule-time"
            />
            <FormControlLabel
              control={<Switch defaultChecked id="is-active" />}
              label="Activate Campaign"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateCampaignOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('campaign-name') as HTMLInputElement)?.value;
              const type = (document.getElementById('campaign-type') as HTMLSelectElement)?.value;
              const recipients = parseInt((document.getElementById('recipients-count') as HTMLInputElement)?.value || '0');
              const scheduledAt = (document.getElementById('schedule-time') as HTMLInputElement)?.value;
              const isActive = (document.getElementById('is-active') as HTMLInputElement)?.checked;
              
              if (!name || !type || !recipients) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateCampaign({
                name,
                type,
                status: isActive ? 'active' : 'scheduled',
                recipients,
                scheduledAt: scheduledAt || new Date().toISOString()});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationServiceManagement;