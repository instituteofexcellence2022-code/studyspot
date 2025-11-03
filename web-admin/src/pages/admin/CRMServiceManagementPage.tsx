import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  ContactMail as ContactIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Error as ErrorIcon,
  FilterList as FilterListIcon,
  Group as CustomerIcon,
  History as HistoryIcon,
  LocationOn as LocationIcon,
  MonetizationOn as DealIcon,
  People as PeopleIcon,
  PersonAdd as LeadIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Sort as SortIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon

  } from '@mui/icons-material';
import { useServiceManagement } from '../../hooks/useServiceManagement';

const CRMServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [createContactOpen, setCreateContactOpen] = useState(false);
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use real CRM service hook
  const {
    status,
    metrics,
    error,
    serviceControl,
    refresh,
    refreshMetrics} = useServiceManagement('crm');

  // Mock data for leads, contacts, deals, and customers
  const [leads, setLeads] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1234567890',
      company: 'Tech Corp',
      status: 'new',
      source: 'website',
      score: 85,
      createdAt: '2024-01-15 10:30:00',
      lastContact: '2024-01-15 14:20:00'},
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+1987654321',
      company: 'Marketing Inc',
      status: 'qualified',
      source: 'referral',
      score: 92,
      createdAt: '2024-01-14 09:15:00',
      lastContact: '2024-01-15 11:45:00'},
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.w@business.net',
      phone: '+1555123456',
      company: 'StartupXYZ',
      status: 'contacted',
      source: 'social',
      score: 78,
      createdAt: '2024-01-13 16:45:00',
      lastContact: '2024-01-14 10:30:00'},
  ]);

  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Alice Brown',
      email: 'alice.brown@enterprise.com',
      phone: '+1444555666',
      company: 'Enterprise Solutions',
      title: 'CTO',
      status: 'active',
      lastContact: '2024-01-15 16:30:00',
      totalDeals: 3,
      totalValue: 45000},
    {
      id: '2',
      name: 'Bob Davis',
      email: 'bob.davis@corp.com',
      phone: '+1777888999',
      company: 'Corp Industries',
      title: 'VP Sales',
      status: 'active',
      lastContact: '2024-01-14 13:20:00',
      totalDeals: 5,
      totalValue: 78000},
    {
      id: '3',
      name: 'Carol White',
      email: 'carol.white@global.com',
      phone: '+1333444555',
      company: 'Global Systems',
      title: 'Director',
      status: 'inactive',
      lastContact: '2024-01-10 09:15:00',
      totalDeals: 2,
      totalValue: 25000},
  ]);

  const [deals, setDeals] = useState([
    {
      id: '1',
      title: 'Enterprise Software License',
      contact: 'Alice Brown',
      company: 'Enterprise Solutions',
      value: 25000,
      stage: 'negotiation',
      probability: 75,
      closeDate: '2024-02-15',
      createdAt: '2024-01-10 10:00:00',
      lastActivity: '2024-01-15 14:30:00'},
    {
      id: '2',
      title: 'Cloud Migration Project',
      contact: 'Bob Davis',
      company: 'Corp Industries',
      value: 45000,
      stage: 'proposal',
      probability: 60,
      closeDate: '2024-03-01',
      createdAt: '2024-01-12 11:30:00',
      lastActivity: '2024-01-15 16:45:00'},
    {
      id: '3',
      title: 'Support Contract Renewal',
      contact: 'Carol White',
      company: 'Global Systems',
      value: 12000,
      stage: 'closed-won',
      probability: 100,
      closeDate: '2024-01-20',
      createdAt: '2024-01-05 09:00:00',
      lastActivity: '2024-01-20 10:00:00'},
  ]);

  const [customers, setCustomers] = useState([
    {
      id: '1',
      name: 'Tech Solutions Ltd',
      email: 'contact@techsolutions.com',
      phone: '+1111222333',
      industry: 'Technology',
      status: 'active',
      totalSpent: 125000,
      lastPurchase: '2024-01-10',
      customerSince: '2023-06-15'},
    {
      id: '2',
      name: 'Innovation Corp',
      email: 'info@innovation.com',
      phone: '+1222333444',
      industry: 'Manufacturing',
      status: 'active',
      totalSpent: 89000,
      lastPurchase: '2024-01-08',
      customerSince: '2023-08-20'},
    {
      id: '3',
      name: 'Digital Agency',
      email: 'hello@digitalagency.com',
      phone: '+1333444555',
      industry: 'Marketing',
      status: 'inactive',
      totalSpent: 45000,
      lastPurchase: '2023-12-15',
      customerSince: '2023-04-10'},
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

  const handleCreateLead = async (leadData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newLead = {
        id: Date.now().toString(),
        ...leadData,
        status: 'new',
        score: Math.floor(Math.random() * 40) + 60,
        createdAt: new Date().toISOString(),
        lastContact: null};
      setLeads(prev => [...prev, newLead]);
      alert('Lead created successfully!');
      setCreateLeadOpen(false);
    } catch (err) {
      alert(`Failed to create lead: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContact = async (contactData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newContact = {
        id: Date.now().toString(),
        ...contactData,
        status: 'active',
        lastContact: new Date().toISOString(),
        totalDeals: 0,
        totalValue: 0};
      setContacts(prev => [...prev, newContact]);
      alert('Contact created successfully!');
      setCreateContactOpen(false);
    } catch (err) {
      alert(`Failed to create contact: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeal = async (dealData: any) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newDeal = {
        id: Date.now().toString(),
        ...dealData,
        stage: 'prospecting',
        probability: 25,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()};
      setDeals(prev => [...prev, newDeal]);
      alert('Deal created successfully!');
      setCreateDealOpen(false);
    } catch (err) {
      alert(`Failed to create deal: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            CRM Service Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage leads, contacts, deals, and customer relationships
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
            startIcon={<LeadIcon />}
            onClick={() => setCreateLeadOpen(true)}
          >
            Add Lead
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContactIcon />}
            onClick={() => setCreateContactOpen(true)}
          >
            Add Contact
          </Button>
          <Button
            variant="outlined"
            startIcon={<DealIcon />}
            onClick={() => setCreateDealOpen(true)}
          >
            Add Deal
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
                  <LeadIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Leads</Typography>
                  <Typography variant="h4" color="primary">
                    {leads.filter((l: any) => l.status !== 'converted').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {leads.length} leads
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                  <ContactIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Contacts</Typography>
                  <Typography variant="h4" color="primary">
                    {contacts.filter((c: any) => c.status === 'active').length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#16a34a', mr: 1, fontSize: 16 }} />
                <Typography variant="body2" color="success.main">
                  Total: {contacts.length} contacts
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
                  <DealIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Open Deals</Typography>
                  <Typography variant="h4" color="primary">
                    {deals.filter((d: any) => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Value: ${deals.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mr: 2 }}>
                  <CustomerIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Customers</Typography>
                  <Typography variant="h4" color="primary">
                    {customers.length}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(customers.filter((c: any) => c.status === 'active').length / customers.length) * 100} 
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
            <Tab label="Leads" />
            <Tab label="Contacts" />
            <Tab label="Deals" />
            <Tab label="Customers" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Leads Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Lead Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateLeadOpen(true)}
                >
                  Add Lead
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>
                          <Chip 
                            label={lead.status} 
                            color={
                              lead.status === 'new' ? 'primary' : 
                              lead.status === 'qualified' ? 'success' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>{lead.score}</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={lead.score} 
                              sx={{ width: 50, height: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Contacts Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Contact Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateContactOpen(true)}
                >
                  Add Contact
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total Deals</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.company}</TableCell>
                        <TableCell>{contact.title}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>
                          <Chip 
                            label={contact.status} 
                            color={contact.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{contact.totalDeals}</TableCell>
                        <TableCell>${contact.totalValue.toLocaleString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Deals Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Deal Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDealOpen(true)}
                >
                  Add Deal
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Stage</TableCell>
                      <TableCell>Probability</TableCell>
                      <TableCell>Close Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>{deal.title}</TableCell>
                        <TableCell>{deal.contact}</TableCell>
                        <TableCell>{deal.company}</TableCell>
                        <TableCell>${deal.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={deal.stage} 
                            color={
                              deal.stage === 'closed-won' ? 'success' : 
                              deal.stage === 'closed-lost' ? 'error' : 
                              'primary'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>{deal.probability}%</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={deal.probability} 
                              sx={{ width: 50, height: 4 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(deal.closeDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Customers Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Customer Management</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Company</TableCell>
                      <TableCell>Industry</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total Spent</TableCell>
                      <TableCell>Last Purchase</TableCell>
                      <TableCell>Customer Since</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.industry}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.status} 
                            color={customer.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell>{new Date(customer.lastPurchase).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(customer.customerSince).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>CRM Analytics</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon sx={{ mr: 2, color: '#6366f1' }} />
                      <Typography variant="h6">Lead Conversion</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">23.5%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      +5.2% from last month
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DealIcon sx={{ mr: 2, color: '#10b981' }} />
                      <Typography variant="h6">Deal Win Rate</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">67.8%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      +2.1% from last month
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AnalyticsIcon sx={{ mr: 2, color: '#f59e0b' }} />
                      <Typography variant="h6">Avg Deal Size</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">$28.5K</Typography>
                    <Typography variant="body2" color="text.secondary">
                      +8.3% from last month
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CustomerIcon sx={{ mr: 2, color: '#8b5cf6' }} />
                      <Typography variant="h6">Customer Retention</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">89.2%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      +1.5% from last month
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Lead Dialog */}
      <Dialog
        open={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Lead
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              id="lead-name"
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              type="email"
              id="lead-email"
            />
            <TextField
              label="Phone"
              fullWidth
              variant="outlined"
              id="lead-phone"
            />
            <TextField
              label="Company"
              fullWidth
              variant="outlined"
              id="lead-company"
            />
            <FormControl fullWidth>
              <InputLabel>Lead Source</InputLabel>
              <Select label="Lead Source" id="lead-source">
                <MenuItem value="website">Website</MenuItem>
                <MenuItem value="referral">Referral</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="email">Email Campaign</MenuItem>
                <MenuItem value="phone">Phone Call</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateLeadOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('lead-name') as HTMLInputElement)?.value;
              const email = (document.getElementById('lead-email') as HTMLInputElement)?.value;
              const phone = (document.getElementById('lead-phone') as HTMLInputElement)?.value;
              const company = (document.getElementById('lead-company') as HTMLInputElement)?.value;
              const source = (document.getElementById('lead-source') as HTMLSelectElement)?.value;
              
              if (!name || !email || !company || !source) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateLead({
                name,
                email,
                phone,
                company,
                source});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Lead'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Contact Dialog */}
      <Dialog
        open={createContactOpen}
        onClose={() => setCreateContactOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Contact
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              id="contact-name"
            />
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              type="email"
              id="contact-email"
            />
            <TextField
              label="Phone"
              fullWidth
              variant="outlined"
              id="contact-phone"
            />
            <TextField
              label="Company"
              fullWidth
              variant="outlined"
              id="contact-company"
            />
            <TextField
              label="Job Title"
              fullWidth
              variant="outlined"
              id="contact-title"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateContactOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const name = (document.getElementById('contact-name') as HTMLInputElement)?.value;
              const email = (document.getElementById('contact-email') as HTMLInputElement)?.value;
              const phone = (document.getElementById('contact-phone') as HTMLInputElement)?.value;
              const company = (document.getElementById('contact-company') as HTMLInputElement)?.value;
              const title = (document.getElementById('contact-title') as HTMLInputElement)?.value;
              
              if (!name || !email || !company) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateContact({
                name,
                email,
                phone,
                company,
                title});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Contact'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Deal Dialog */}
      <Dialog
        open={createDealOpen}
        onClose={() => setCreateDealOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Deal
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Deal Title"
              fullWidth
              variant="outlined"
              id="deal-title"
            />
            <TextField
              label="Contact Name"
              fullWidth
              variant="outlined"
              id="deal-contact"
            />
            <TextField
              label="Company"
              fullWidth
              variant="outlined"
              id="deal-company"
            />
            <TextField
              label="Deal Value ($)"
              fullWidth
              variant="outlined"
              type="number"
              id="deal-value"
            />
            <TextField
              label="Expected Close Date"
              fullWidth
              variant="outlined"
              type="date"
              id="deal-close-date"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDealOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              const title = (document.getElementById('deal-title') as HTMLInputElement)?.value;
              const contact = (document.getElementById('deal-contact') as HTMLInputElement)?.value;
              const company = (document.getElementById('deal-company') as HTMLInputElement)?.value;
              const value = parseInt((document.getElementById('deal-value') as HTMLInputElement)?.value || '0');
              const closeDate = (document.getElementById('deal-close-date') as HTMLInputElement)?.value;
              
              if (!title || !contact || !company || !value) {
                alert('Please fill in all required fields');
                return;
              }
              
              handleCreateDeal({
                title,
                contact,
                company,
                value,
                closeDate: closeDate || new Date().toISOString().split('T')[0]});
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Deal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CRMServiceManagement;