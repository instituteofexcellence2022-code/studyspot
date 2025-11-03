// ============================================
// COMPREHENSIVE TICKET MANAGEMENT PAGE
// AI-Powered Support with Automation
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Button,
  GridLegacy as Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  LinearProgress,
  Paper,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  AvatarGroup,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  SupportAgent,
  Add,
  Assignment,
  Timer,
  CheckCircle,
  SmartToy,
  AutoFixHigh,
  Psychology,
  TrendingUp,
  Visibility,
  Edit,
  Delete,
  AttachFile,
  Send,
  FilterList,
  Search,
  ExpandMore,
  Notifications,
  Speed,
  Star,
  Message,
  LocalOffer,
  Schedule,
  PriorityHigh,
  TrendingDown,
  AutoAwesome,
  BugReport,
  Build,
  Support,
  QuestionAnswer,
  Settings,
  Refresh,
  People,
  Save,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const TicketManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editRuleDialogOpen, setEditRuleDialogOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  
  // Create ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    tenant: '',
    category: '',
    priority: 'Medium',
    assignTo: 'Auto',
  });

  // Rule form state
  const [newRule, setNewRule] = useState({
    type: 'Auto-Assignment',
    condition: '',
    action: '',
    enabled: true,
  });

  // Enhanced ticket data with AI features
  const tickets = [
    { 
      id: 1, 
      ticketId: 'TKT-001', 
      title: 'Payment gateway not working', 
      description: 'Razorpay integration showing error on payment page',
      tenant: 'Central Library', 
      tenantEmail: 'admin@centrallib.com',
      priority: 'Critical', 
      status: 'Open', 
      assignedTo: 'Amit Kumar', 
      assignedAvatar: 'AK',
      createdDate: '2025-11-02 14:30', 
      updatedDate: '2025-11-02 14:30',
      category: 'Technical',
      tags: ['payment', 'integration', 'urgent'],
      aiSuggestion: 'Check Razorpay API keys and webhook configuration',
      aiConfidence: 95,
      estimatedTime: '2 hours',
      sla: '4 hours',
      timeRemaining: '1.5 hours',
      comments: 3,
      attachments: 2,
      sentiment: 'Frustrated',
      similarTickets: 2,
    },
    { 
      id: 2, 
      ticketId: 'TKT-002', 
      title: 'Need help with seat booking', 
      description: 'How to configure seat booking time slots?',
      tenant: 'Tech Library', 
      tenantEmail: 'contact@techlib.com',
      priority: 'Medium', 
      status: 'In Progress', 
      assignedTo: 'Sneha Reddy', 
      assignedAvatar: 'SR',
      createdDate: '2025-11-01 10:15', 
      updatedDate: '2025-11-02 09:00',
      category: 'Support',
      tags: ['booking', 'configuration', 'how-to'],
      aiSuggestion: 'Send knowledge base article on seat configuration',
      aiConfidence: 88,
      estimatedTime: '30 minutes',
      sla: '24 hours',
      timeRemaining: '14 hours',
      comments: 5,
      attachments: 0,
      sentiment: 'Neutral',
      similarTickets: 8,
    },
    { 
      id: 3, 
      ticketId: 'TKT-003', 
      title: 'Invoice not generated', 
      description: 'Monthly invoice for October 2025 is missing',
      tenant: 'Knowledge Hub', 
      tenantEmail: 'info@knowledgehub.com',
      priority: 'High', 
      status: 'Open', 
      assignedTo: 'Rahul Verma', 
      assignedAvatar: 'RV',
      createdDate: '2025-11-01 16:45', 
      updatedDate: '2025-11-01 16:45',
      category: 'Billing',
      tags: ['invoice', 'billing', 'urgent'],
      aiSuggestion: 'Run invoice generation script for October 2025',
      aiConfidence: 92,
      estimatedTime: '15 minutes',
      sla: '8 hours',
      timeRemaining: '6 hours',
      comments: 1,
      attachments: 1,
      sentiment: 'Concerned',
      similarTickets: 0,
    },
    { 
      id: 4, 
      ticketId: 'TKT-004', 
      title: 'Feature request: Bulk upload', 
      description: 'Need ability to upload multiple students via CSV',
      tenant: 'Study Center', 
      tenantEmail: 'admin@studycenter.com',
      priority: 'Low', 
      status: 'Closed', 
      assignedTo: 'Amit Kumar', 
      assignedAvatar: 'AK',
      createdDate: '2025-10-28 11:00', 
      updatedDate: '2025-10-31 15:00',
      category: 'Feature',
      tags: ['feature-request', 'bulk-upload', 'enhancement'],
      aiSuggestion: 'Feature planned for Q1 2026 release',
      aiConfidence: 75,
      estimatedTime: 'Backlog',
      sla: 'No SLA',
      timeRemaining: '-',
      comments: 12,
      attachments: 3,
      sentiment: 'Positive',
      similarTickets: 15,
      resolution: 'Feature added to roadmap',
      resolvedDate: '2025-10-31 15:00',
      satisfaction: 4,
    },
    { 
      id: 5, 
      ticketId: 'TKT-005', 
      title: 'SMS notifications not received', 
      description: 'Students are not receiving SMS notifications for bookings',
      tenant: 'Wisdom Library', 
      tenantEmail: 'support@wisdomlib.com',
      priority: 'High', 
      status: 'In Progress', 
      assignedTo: 'Sneha Reddy', 
      assignedAvatar: 'SR',
      createdDate: '2025-10-31 08:30', 
      updatedDate: '2025-11-02 11:00',
      category: 'Technical',
      tags: ['sms', 'notifications', 'messaging'],
      aiSuggestion: 'Check SMS gateway status and credit balance',
      aiConfidence: 90,
      estimatedTime: '1 hour',
      sla: '8 hours',
      timeRemaining: '4 hours',
      comments: 7,
      attachments: 1,
      sentiment: 'Frustrated',
      similarTickets: 3,
    },
    { 
      id: 6, 
      ticketId: 'TKT-006', 
      title: 'How to setup custom branding?', 
      description: 'Want to add our library logo and colors to the platform',
      tenant: 'Elite Study', 
      tenantEmail: 'admin@elitestudy.com',
      priority: 'Medium', 
      status: 'Resolved', 
      assignedTo: 'Rahul Verma', 
      assignedAvatar: 'RV',
      createdDate: '2025-10-30 13:20', 
      updatedDate: '2025-11-01 10:30',
      category: 'Support',
      tags: ['branding', 'customization', 'design'],
      aiSuggestion: 'Share white-labeling documentation and schedule demo',
      aiConfidence: 85,
      estimatedTime: '45 minutes',
      sla: '24 hours',
      timeRemaining: '-',
      comments: 4,
      attachments: 5,
      sentiment: 'Positive',
      similarTickets: 12,
      resolution: 'Provided documentation and setup assistance',
      resolvedDate: '2025-11-01 10:30',
      satisfaction: 5,
    },
  ];

  // AI Analytics Data
  const aiInsights = {
    autoResolved: 12,
    avgResolutionTime: '2.5 hours',
    predictedEscalations: 3,
    sentimentScore: 3.8,
    knowledgeBaseHits: 45,
    automationRate: 68,
  };

  // Ticket trends over time
  const ticketTrends = [
    { date: 'Oct 27', created: 8, resolved: 6, open: 2 },
    { date: 'Oct 28', created: 12, resolved: 10, open: 4 },
    { date: 'Oct 29', created: 6, resolved: 8, open: 2 },
    { date: 'Oct 30', created: 10, resolved: 9, open: 3 },
    { date: 'Oct 31', created: 7, resolved: 5, open: 5 },
    { date: 'Nov 01', created: 9, resolved: 11, open: 3 },
    { date: 'Nov 02', created: 4, resolved: 2, open: 5 },
  ];

  // Category distribution
  const categoryData = [
    { category: 'Technical', count: 2, avgTime: '3.2h', color: '#f44336' },
    { category: 'Support', count: 2, avgTime: '1.5h', color: '#2196f3' },
    { category: 'Billing', count: 1, avgTime: '0.8h', color: '#4caf50' },
    { category: 'Feature', count: 1, avgTime: 'N/A', color: '#ff9800' },
  ];

  // AI automated actions
  const automatedActions = [
    { id: 1, action: 'Auto-assigned TKT-001 to Amit (Payment expert)', time: '5 min ago', icon: <AutoFixHigh /> },
    { id: 2, action: 'Suggested KB article for TKT-002', time: '15 min ago', icon: <Psychology /> },
    { id: 3, action: 'Detected sentiment change in TKT-005 (Frustrated)', time: '1 hour ago', icon: <Notifications /> },
    { id: 4, action: 'Predicted escalation for TKT-003', time: '2 hours ago', icon: <Speed /> },
  ];

  // Team performance
  const teamPerformance = [
    { name: 'Amit Kumar', assigned: 8, resolved: 7, avgTime: '2.1h', satisfaction: 4.5, avatar: 'AK', specialization: 'Technical' },
    { name: 'Sneha Reddy', assigned: 12, resolved: 10, avgTime: '1.8h', satisfaction: 4.7, avatar: 'SR', specialization: 'Support' },
    { name: 'Rahul Verma', assigned: 6, resolved: 5, avgTime: '2.4h', satisfaction: 4.3, avatar: 'RV', specialization: 'Billing' },
  ];

  const statusData = [
    { name: 'Open', value: 2, color: '#f44336' },
    { name: 'In Progress', value: 2, color: '#ff9800' },
    { name: 'Resolved', value: 1, color: '#4caf50' },
    { name: 'Closed', value: 1, color: '#9e9e9e' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Frustrated': return 'error';
      case 'Concerned': return 'warning';
      case 'Neutral': return 'info';
      case 'Positive': return 'success';
      default: return 'default';
    }
  };

  // Handler functions
  const handleViewTicket = (ticket: any) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleEditTicket = (ticket: any) => {
    alert(`Edit ticket: ${ticket.ticketId}`);
    // In production: Open edit dialog with ticket data
  };

  const handleDeleteTicket = (ticket: any) => {
    setTicketToDelete(ticket);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    alert(`Ticket ${ticketToDelete?.ticketId} deleted successfully!`);
    setDeleteConfirmOpen(false);
    setTicketToDelete(null);
    // In production: Call API to delete ticket
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.tenant) {
      alert('Please fill in all required fields');
      return;
    }

    const assignedAgent = newTicket.assignTo === 'Auto' 
      ? (newTicket.category === 'Technical' ? 'Amit Kumar' : 
         newTicket.category === 'Billing' ? 'Rahul Verma' : 'Sneha Reddy')
      : newTicket.assignTo;

    alert(`Ticket created successfully!\nAssigned to: ${assignedAgent}\nAI will analyze and suggest solutions.`);
    setCreateDialogOpen(false);
    setNewTicket({
      title: '',
      description: '',
      tenant: '',
      category: '',
      priority: 'Medium',
      assignTo: 'Auto',
    });
    // In production: Call API to create ticket
  };

  const handleRefresh = () => {
    alert('Refreshing ticket data...');
    // In production: Reload tickets from API
  };

  const handleExportSelected = () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to export');
      return;
    }
    alert(`Exporting ${selectedTickets.length} selected tickets...`);
    // In production: Generate CSV/PDF export
  };

  const handleBulkAssign = () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to assign');
      return;
    }
    alert(`Bulk assigning ${selectedTickets.length} tickets...`);
    // In production: Open bulk assign dialog
  };

  const handleBulkClose = () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to close');
      return;
    }
    if (window.confirm(`Close ${selectedTickets.length} selected tickets?`)) {
      alert('Tickets closed successfully!');
      setSelectedTickets([]);
    }
  };

  const handleAddRule = () => {
    setNewRule({
      type: 'Auto-Assignment',
      condition: '',
      action: '',
      enabled: true,
    });
    setEditRuleDialogOpen(true);
  };

  const handleEditRule = (rule: string) => {
    // Pre-populate form with existing rule
    setNewRule({
      type: 'Auto-Assignment',
      condition: rule,
      action: '',
      enabled: true,
    });
    setEditRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (!newRule.condition || !newRule.action) {
      alert('Please fill in all required fields');
      return;
    }
    alert(`Rule saved successfully!\nCondition: ${newRule.condition}\nAction: ${newRule.action}\nStatus: ${newRule.enabled ? 'Active' : 'Inactive'}`);
    setEditRuleDialogOpen(false);
    // In production: Call API to save rule
  };

  const columns: GridColDef[] = [
    { 
      field: 'ticketId', 
      headerName: 'Ticket ID', 
      width: 110,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <Typography 
            variant="body2" 
            fontWeight="bold" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleViewTicket(params.row)}
          >
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      width: 280,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
          {params.row.aiSuggestion && aiSuggestionsEnabled && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <SmartToy sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" color="primary">
                AI: {params.row.aiSuggestion.substring(0, 40)}...
              </Typography>
            </Box>
          )}
        </Box>
      )
    },
    { 
      field: 'tenant', 
      headerName: 'Library', 
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.sentiment}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    { 
      field: 'priority', 
      headerName: 'Priority', 
      width: 110,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getPriorityColor(params.value) as any} 
          size="small"
          icon={params.value === 'Critical' ? <PriorityHigh /> : undefined}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value) as any} 
          size="small"
        />
      )
    },
    { 
      field: 'assignedTo', 
      headerName: 'Assigned To', 
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
            {params.row.assignedAvatar}
          </Avatar>
          <Typography variant="caption">{params.value.split(' ')[0]}</Typography>
        </Box>
      )
    },
    { 
      field: 'timeRemaining', 
      headerName: 'SLA', 
      width: 110,
      renderCell: (params) => {
        if (params.value === '-') return <Typography variant="caption">-</Typography>;
        const isUrgent = parseFloat(params.value) < 2;
        return (
          <Chip 
            label={params.value} 
            size="small" 
            color={isUrgent ? 'error' : 'default'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" color="primary" onClick={() => handleViewTicket(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditTicket(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={`${params.row.comments} Comments`}>
            <Badge badgeContent={params.row.comments} color="primary">
              <IconButton size="small" onClick={() => handleViewTicket(params.row)}>
                <Message fontSize="small" />
              </IconButton>
            </Badge>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || ticket.category === filterCategory;
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ticket Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-Powered Support & Automation
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch 
                checked={aiSuggestionsEnabled} 
                onChange={(e) => setAiSuggestionsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SmartToy fontSize="small" />
                <Typography variant="caption">AI Assist</Typography>
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Switch 
                checked={autoAssignEnabled} 
                onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AutoFixHigh fontSize="small" />
                <Typography variant="caption">Auto-Assign</Typography>
              </Box>
            }
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            Create Ticket
          </Button>
        </Stack>
      </Box>

      {/* AI Insights Banner */}
      {aiSuggestionsEnabled && (
        <Alert severity="info" icon={<Psychology />} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight="bold">AI Insights:</Typography>
            <Chip label={`${aiInsights.autoResolved} auto-resolved today`} size="small" color="success" variant="outlined" />
            <Chip label={`${aiInsights.predictedEscalations} predicted escalations`} size="small" color="warning" variant="outlined" />
            <Chip label={`${aiInsights.automationRate}% automation rate`} size="small" color="primary" variant="outlined" />
            <Chip label={`Sentiment: ${aiInsights.sentimentScore}/5`} size="small" color="info" variant="outlined" />
          </Box>
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 3, borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Tickets
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {tickets.length}
                  </Typography>
                  <Chip label="This month" size="small" sx={{ mt: 1 }} />
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 3, borderColor: 'error.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Open Tickets
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {tickets.filter(t => t.status === 'Open').length}
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    Needs attention
                  </Typography>
                </Box>
                <Timer sx={{ fontSize: 40, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 3, borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg Resolution
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    2.5h
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingDown sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" color="success.main">
                      0.5h faster
                    </Typography>
                  </Box>
                </Box>
                <Speed sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 3, borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Satisfaction
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    4.5/5
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.25, mt: 0.5 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} sx={{ fontSize: 14, color: i <= 4.5 ? 'warning.main' : 'action.disabled' }} />
                    ))}
                  </Box>
                </Box>
                <SupportAgent sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment />
              All Tickets
              <Chip label={tickets.length} size="small" />
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportAgent />
              My Tickets
              <Chip label={tickets.filter(t => t.assignedTo === 'Amit Kumar').length} size="small" />
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              AI Automation
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Analytics
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People />
              Team
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings />
              Automation Rules
            </Box>
          } 
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select 
                    label="Priority" 
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select 
                    label="Status" 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    label="Category" 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Support">Support</MenuItem>
                    <MenuItem value="Billing">Billing</MenuItem>
                    <MenuItem value="Feature">Feature</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="text" 
                  startIcon={<FilterList />}
                  onClick={() => {
                    setFilterPriority('All');
                    setFilterStatus('All');
                    setFilterCategory('All');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" fontWeight="bold">
                  {selectedTickets.length} tickets selected
                </Typography>
                <Button size="small" variant="outlined" onClick={handleBulkAssign}>
                  Bulk Assign
                </Button>
                <Button size="small" variant="outlined" onClick={handleBulkClose}>
                  Bulk Close
                </Button>
                <Button size="small" variant="outlined" onClick={handleExportSelected}>
                  Export Selected
                </Button>
                <Button size="small" variant="text" onClick={() => setSelectedTickets([])}>
                  Clear Selection
                </Button>
              </Box>
            </Alert>
          )}

          {/* Tickets Table */}
          <Card>
            <CardContent>
              <DataGrid
                rows={filteredTickets}
                columns={columns}
                autoHeight
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newSelection) => {
                  const selectedIds = Array.isArray(newSelection) 
                    ? newSelection.map(id => Number(id)) 
                    : [];
                  const selected = filteredTickets.filter(ticket => 
                    selectedIds.includes(ticket.id)
                  );
                  setSelectedTickets(selected);
                }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              My Assigned Tickets
            </Typography>
            <DataGrid
              rows={tickets.filter(t => t.assignedTo === 'Amit Kumar')}
              columns={columns}
              autoHeight
              pageSizeOptions={[10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Recent AI Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesome />
                  Recent AI Actions
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                  {automatedActions.map((action) => (
                    <ListItem key={action.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {action.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={action.action}
                        secondary={action.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  AI Performance Metrics
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Auto-Resolution Rate</Typography>
                      <Typography variant="body2" fontWeight="bold">{aiInsights.automationRate}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={aiInsights.automationRate} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Prediction Accuracy</Typography>
                      <Typography variant="body2" fontWeight="bold">92%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={92} color="success" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Knowledge Base Usage</Typography>
                      <Typography variant="body2" fontWeight="bold">85%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="info" />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Sentiment Analysis Accuracy</Typography>
                      <Typography variant="body2" fontWeight="bold">88%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={88} color="warning" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Ticket Trends */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  7-Day Ticket Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ticketTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="created" stackId="1" stroke="#2196f3" fill="#2196f3" name="Created" />
                    <Area type="monotone" dataKey="resolved" stackId="2" stroke="#4caf50" fill="#4caf50" name="Resolved" />
                    <Area type="monotone" dataKey="open" stackId="3" stroke="#f44336" fill="#f44336" name="Open" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Status & Category Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          {teamPerformance.map((member) => (
            <Grid item xs={12} md={4} key={member.name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>
                      {member.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{member.name}</Typography>
                      <Chip label={member.specialization} size="small" />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Assigned</Typography>
                      <Typography variant="h6" fontWeight="bold">{member.assigned}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Resolved</Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">{member.resolved}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Avg Time</Typography>
                      <Typography variant="h6" fontWeight="bold">{member.avgTime}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="h6" fontWeight="bold">{member.satisfaction}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          {[
            { title: 'Auto-Assignment Rules', icon: <AutoFixHigh />, rules: ['Assign Technical tickets to Amit', 'Assign Billing to Rahul', 'Assign Support to Sneha'] },
            { title: 'Escalation Rules', icon: <Speed />, rules: ['Escalate Critical after 2 hours', 'Escalate High after 4 hours', 'Auto-notify manager'] },
            { title: 'AI Suggestions', icon: <Psychology />, rules: ['Suggest KB articles', 'Detect similar tickets', 'Predict resolution time'] },
            { title: 'Notifications', icon: <Notifications />, rules: ['Email on new ticket', 'Slack on escalation', 'SMS for Critical'] },
          ].map((section, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.icon}
                    {section.title}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {section.rules.map((rule, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={rule}
                          secondary={
                            <Chip label="Active" size="small" color="success" sx={{ mt: 0.5 }} />
                          }
                        />
                        <IconButton size="small" onClick={() => handleEditRule(rule)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }} startIcon={<Add />} onClick={handleAddRule}>
                    Add Rule
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Create New Ticket</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Title" 
                  placeholder="Brief description of the issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  placeholder="Detailed description of the issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tenant/Library</InputLabel>
                  <Select 
                    label="Tenant/Library"
                    value={newTicket.tenant}
                    onChange={(e) => setNewTicket({ ...newTicket, tenant: e.target.value })}
                  >
                    <MenuItem value="Central Library">Central Library</MenuItem>
                    <MenuItem value="Tech Library">Tech Library</MenuItem>
                    <MenuItem value="Knowledge Hub">Knowledge Hub</MenuItem>
                    <MenuItem value="Study Center">Study Center</MenuItem>
                    <MenuItem value="Wisdom Library">Wisdom Library</MenuItem>
                    <MenuItem value="Elite Study">Elite Study</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    label="Category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Support">Support</MenuItem>
                    <MenuItem value="Billing">Billing</MenuItem>
                    <MenuItem value="Feature">Feature Request</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select 
                    label="Priority" 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select 
                    label="Assign To" 
                    value={newTicket.assignTo}
                    onChange={(e) => setNewTicket({ ...newTicket, assignTo: e.target.value })}
                  >
                    <MenuItem value="Auto">🤖 AI Auto-Assign</MenuItem>
                    <MenuItem value="Amit Kumar">Amit Kumar (Technical)</MenuItem>
                    <MenuItem value="Sneha Reddy">Sneha Reddy (Support)</MenuItem>
                    <MenuItem value="Rahul Verma">Rahul Verma (Billing)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" startIcon={<AttachFile />}>
                  Attach Files
                </Button>
              </Grid>
            </Grid>

            {aiSuggestionsEnabled && newTicket.category && (
              <Alert severity="info" icon={<SmartToy />} sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>AI Suggestion:</strong> Based on the category "{newTicket.category}", this ticket will be auto-assigned to {
                    newTicket.category === 'Technical' ? 'Amit Kumar (Technical Expert)' :
                    newTicket.category === 'Billing' ? 'Rahul Verma (Billing Specialist)' :
                    'Sneha Reddy (Support Specialist)'
                  }.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />} 
            onClick={handleCreateTicket}
            disabled={!newTicket.title || !newTicket.description || !newTicket.tenant}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete ticket <strong>"{ticketToDelete?.ticketId}"</strong>?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All comments and attachments will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Rule Dialog */}
      <Dialog open={editRuleDialogOpen} onClose={() => setEditRuleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHigh color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {newRule.condition ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" icon={<SmartToy />} sx={{ mb: 3 }}>
              <Typography variant="body2">
                Automation rules help streamline ticket management by automatically performing actions based on conditions.
              </Typography>
            </Alert>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Rule Type</InputLabel>
              <Select
                label="Rule Type"
                value={newRule.type}
                onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
              >
                <MenuItem value="Auto-Assignment">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoFixHigh />
                    Auto-Assignment Rules
                  </Box>
                </MenuItem>
                <MenuItem value="Escalation">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed />
                    Escalation Rules
                  </Box>
                </MenuItem>
                <MenuItem value="AI Suggestions">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Psychology />
                    AI Suggestion Rules
                  </Box>
                </MenuItem>
                <MenuItem value="Notifications">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notifications />
                    Notification Rules
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Condition (When)"
              placeholder="e.g., Category is Technical, Priority is Critical"
              value={newRule.condition}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
              sx={{ mb: 3 }}
              required
              helperText="Define when this rule should trigger"
            />

            <TextField
              fullWidth
              label="Action (Then)"
              placeholder="e.g., Assign to Amit Kumar, Send email notification"
              value={newRule.action}
              onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
              sx={{ mb: 3 }}
              required
              helperText="Define what action should be taken"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newRule.enabled}
                  onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                  color="success"
                />
              }
              label="Enable this rule immediately"
            />

            <Divider sx={{ my: 3 }} />

            {/* Rule Examples */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              💡 Example Rules:
            </Typography>
            <Stack spacing={1}>
              <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', cursor: 'pointer' }} 
                onClick={() => setNewRule({ 
                  type: 'Auto-Assignment', 
                  condition: 'Category is Technical', 
                  action: 'Assign to Amit Kumar',
                  enabled: true 
                })}>
                <Typography variant="caption" color="primary">
                  <strong>When:</strong> Category is Technical → <strong>Then:</strong> Assign to Amit Kumar
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', cursor: 'pointer' }}
                onClick={() => setNewRule({ 
                  type: 'Escalation', 
                  condition: 'Priority is Critical AND Open for 2 hours', 
                  action: 'Escalate to manager and send Slack notification',
                  enabled: true 
                })}>
                <Typography variant="caption" color="warning.main">
                  <strong>When:</strong> Critical + 2h open → <strong>Then:</strong> Escalate to manager
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider', cursor: 'pointer' }}
                onClick={() => setNewRule({ 
                  type: 'Notifications', 
                  condition: 'New ticket created', 
                  action: 'Send email to assigned agent',
                  enabled: true 
                })}>
                <Typography variant="caption" color="info.main">
                  <strong>When:</strong> New ticket → <strong>Then:</strong> Email agent
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRuleDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Save />}
            onClick={handleSaveRule}
            disabled={!newRule.condition || !newRule.action}
          >
            Save Rule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketManagementPage;
