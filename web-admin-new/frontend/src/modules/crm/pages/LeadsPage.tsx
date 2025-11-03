// ============================================
// CRM - LEADS MANAGEMENT PAGE
// Lead pipeline, conversion tracking & assignment
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  GridLegacy as Grid,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Stack,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add,
  MoreVert,
  TrendingUp,
  People,
  CheckCircle,
  Schedule,
  ViewKanban,
  ViewList,
  DragIndicator,
  Email,
  Phone as PhoneIcon,
  LocationOn,
  Star,
  Edit,
  Delete,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeadsPage: React.FC = () => {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Mock Leads Data
  const leads = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', source: 'Website', stage: 'New', score: 85, assignedTo: 'Amit', createdDate: '2025-10-30', city: 'Mumbai', libraryType: 'Study Center' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43211', source: 'Referral', stage: 'Qualified', score: 92, assignedTo: 'Sneha', createdDate: '2025-10-29', city: 'Delhi', libraryType: 'Co-working' },
    { id: 3, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98765 43212', source: 'Google Ads', stage: 'Demo', score: 78, assignedTo: 'Amit', createdDate: '2025-10-28', city: 'Bangalore', libraryType: 'Library' },
    { id: 4, name: 'Anita Desai', email: 'anita@example.com', phone: '+91 98765 43213', source: 'LinkedIn', stage: 'Negotiation', score: 88, assignedTo: 'Rahul', createdDate: '2025-10-27', city: 'Pune', libraryType: 'Study Center' },
    { id: 5, name: 'Rohan Patel', email: 'rohan@example.com', phone: '+91 98765 43214', source: 'Website', stage: 'Won', score: 95, assignedTo: 'Sneha', createdDate: '2025-10-25', city: 'Ahmedabad', libraryType: 'Co-working' },
    { id: 6, name: 'Neha Reddy', email: 'neha@example.com', phone: '+91 98765 43215', source: 'Referral', stage: 'Lost', score: 45, assignedTo: 'Amit', createdDate: '2025-10-24', city: 'Hyderabad', libraryType: 'Library' },
    { id: 7, name: 'Sanjay Gupta', email: 'sanjay@example.com', phone: '+91 98765 43216', source: 'Cold Call', stage: 'New', score: 65, assignedTo: 'Rahul', createdDate: '2025-10-30', city: 'Chennai', libraryType: 'Study Center' },
    { id: 8, name: 'Kavita Mehta', email: 'kavita@example.com', phone: '+91 98765 43217', source: 'Website', stage: 'Qualified', score: 80, assignedTo: 'Sneha', createdDate: '2025-10-29', city: 'Kolkata', libraryType: 'Co-working' },
  ];

  // Pipeline Stats
  const pipelineStats = [
    { stage: 'New', count: 2, value: 150000 },
    { stage: 'Qualified', count: 2, value: 180000 },
    { stage: 'Demo', count: 1, value: 100000 },
    { stage: 'Negotiation', count: 1, value: 120000 },
    { stage: 'Won', count: 1, value: 150000 },
    { stage: 'Lost', count: 1, value: 0 },
  ];

  // Source Distribution
  const sourceData = [
    { name: 'Website', value: 37.5, count: 3 },
    { name: 'Referral', value: 25, count: 2 },
    { name: 'Google Ads', value: 12.5, count: 1 },
    { name: 'LinkedIn', value: 12.5, count: 1 },
    { name: 'Cold Call', value: 12.5, count: 1 },
  ];

  const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New': return 'info';
      case 'Qualified': return 'primary';
      case 'Demo': return 'secondary';
      case 'Negotiation': return 'warning';
      case 'Won': return 'success';
      case 'Lost': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Lead Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 140 },
    { field: 'source', headerName: 'Source', width: 120 },
    { 
      field: 'stage', 
      headerName: 'Stage', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStageColor(params.value) as any}
          size="small"
        />
      )
    },
    { 
      field: 'score', 
      headerName: 'Score', 
      width: 80,
      renderCell: (params) => (
        <Typography 
          fontWeight="bold" 
          color={params.value >= 80 ? 'success.main' : params.value >= 60 ? 'warning.main' : 'text.secondary'}
        >
          {params.value}
        </Typography>
      )
    },
    { field: 'assignedTo', headerName: 'Assigned To', width: 120 },
    { field: 'createdDate', headerName: 'Created', width: 110 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: () => (
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Lead Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and convert leads to customers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setAddLeadOpen(true)}>
          Add Lead
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Total Leads</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">8</Typography>
              <Typography variant="caption" color="success.main">+2 this week</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">12.5%</Typography>
              <Typography variant="caption" color="text.secondary">1 won / 8 total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Avg. Lead Time</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">5.5 days</Typography>
              <Typography variant="caption" color="text.secondary">New → Won</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Pipeline Value</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">₹7L</Typography>
              <Typography variant="caption" color="success.main">Active leads</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pipeline & Source Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Sales Pipeline
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipelineStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#2196f3" name="Lead Count" />
                  <Bar yAxisId="right" dataKey="value" fill="#4caf50" name="Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Lead Sources
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leads View */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">All Leads</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search leads..."
                sx={{ width: 250 }}
              />
              <Tabs value={viewMode} onChange={(_, val) => setViewMode(val)}>
                <Tab value="table" icon={<ViewList />} label="Table" />
                <Tab value="kanban" icon={<ViewKanban />} label="Kanban" />
              </Tabs>
            </Stack>
          </Box>

          {/* Table View */}
          {viewMode === 'table' && (
            <DataGrid
              rows={leads}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
            />
          )}

          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
              {['New', 'Qualified', 'Demo', 'Negotiation', 'Won', 'Lost'].map((stage) => {
                const stageLeads = leads.filter(l => l.stage === stage);
                const stageValue = stageLeads.reduce((sum, l) => {
                  const pipelineStat = pipelineStats.find(p => p.stage === stage);
                  return sum + (pipelineStat ? pipelineStat.value / stageLeads.length : 0);
                }, 0);

                return (
                  <Paper 
                    key={stage} 
                    sx={{ 
                      minWidth: 300, 
                      bgcolor: 'grey.50', 
                      p: 2,
                      borderTop: 3,
                      borderColor: stage === 'Won' ? 'success.main' : stage === 'Lost' ? 'error.main' : 'primary.main'
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {stage}
                        </Typography>
                        <Badge badgeContent={stageLeads.length} color="primary">
                          <Chip size="small" label={`₹${(stageValue / 1000).toFixed(0)}K`} />
                        </Badge>
                      </Stack>
                    </Box>

                    <Stack spacing={1.5}>
                      {stageLeads.map((lead) => (
                        <Paper 
                          key={lead.id} 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 3, bgcolor: 'white' },
                            transition: 'all 0.2s'
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                {lead.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{lead.name}</Typography>
                                <Chip label={lead.source} size="small" sx={{ mt: 0.3, height: 18, fontSize: '0.7rem' }} />
                              </Box>
                            </Box>
                            <IconButton size="small">
                              <DragIndicator fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Stack spacing={0.5} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">{lead.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">{lead.phone}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">{lead.city} • {lead.libraryType}</Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 1 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Star sx={{ fontSize: 16, color: lead.score >= 80 ? '#FFD700' : '#ccc' }} />
                              <Typography variant="caption" fontWeight={600}>
                                {lead.score}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" color="primary">
                                <Edit sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </Stack>

                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Assigned to: {lead.assignedTo} • {lead.createdDate}
                          </Typography>
                        </Paper>
                      ))}

                      {stageLeads.length === 0 && (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'white' }}>
                          <Typography variant="caption" color="text.secondary">
                            No leads in this stage
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onClose={() => setAddLeadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Lead Name" sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone" sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Source</InputLabel>
              <Select label="Source">
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Referral">Referral</MenuItem>
                <MenuItem value="Google Ads">Google Ads</MenuItem>
                <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                <MenuItem value="Cold Call">Cold Call</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="City" sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Library Type</InputLabel>
              <Select label="Library Type">
                <MenuItem value="Study Center">Study Center</MenuItem>
                <MenuItem value="Co-working">Co-working Space</MenuItem>
                <MenuItem value="Library">Library</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select label="Assign To">
                <MenuItem value="Amit">Amit</MenuItem>
                <MenuItem value="Sneha">Sneha</MenuItem>
                <MenuItem value="Rahul">Rahul</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddLeadOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddLeadOpen(false)}>
            Add Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>View Details</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit Lead</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Change Stage</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Assign To</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Add Note</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default LeadsPage;
