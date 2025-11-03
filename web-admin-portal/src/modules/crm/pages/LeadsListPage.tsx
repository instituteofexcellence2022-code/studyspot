// ============================================
// CRM - LEADS LIST PAGE
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Menu,
  MenuItem as MenuItemAction,
  ListItemIcon,
  Paper,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  value: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}

const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Mock leads data
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Solutions',
      status: 'new',
      source: 'Website',
      value: 15000,
      assignedTo: 'Sarah Mitchell',
      createdAt: '2024-10-30T09:00:00Z',
      lastContact: '2024-10-30T09:00:00Z',
    },
    {
      id: '2',
      name: 'Emily Johnson',
      email: 'emily.j@innovate.io',
      phone: '+1 (555) 234-5678',
      company: 'Innovate Inc',
      status: 'contacted',
      source: 'Referral',
      value: 25000,
      assignedTo: 'John Anderson',
      createdAt: '2024-10-29T14:30:00Z',
      lastContact: '2024-10-30T08:15:00Z',
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'mbrown@datatech.com',
      phone: '+1 (555) 345-6789',
      company: 'DataTech Systems',
      status: 'qualified',
      source: 'LinkedIn',
      value: 35000,
      assignedTo: 'Sarah Mitchell',
      createdAt: '2024-10-28T11:20:00Z',
      lastContact: '2024-10-29T16:45:00Z',
    },
    {
      id: '4',
      name: 'Sarah Davis',
      email: 'sdavis@cloudbase.net',
      phone: '+1 (555) 456-7890',
      company: 'CloudBase Networks',
      status: 'converted',
      source: 'Trade Show',
      value: 50000,
      assignedTo: 'Alex Johnson',
      createdAt: '2024-10-25T10:00:00Z',
      lastContact: '2024-10-28T14:30:00Z',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'dwilson@startup.co',
      phone: '+1 (555) 567-8901',
      company: 'Startup Co',
      status: 'lost',
      source: 'Cold Call',
      value: 8000,
      assignedTo: 'John Anderson',
      createdAt: '2024-10-20T13:15:00Z',
      lastContact: '2024-10-27T09:30:00Z',
    },
    {
      id: '6',
      name: 'Jennifer Lee',
      email: 'jlee@bigcorp.com',
      phone: '+1 (555) 678-9012',
      company: 'BigCorp Industries',
      status: 'qualified',
      source: 'Website',
      value: 42000,
      assignedTo: 'Sarah Mitchell',
      createdAt: '2024-10-27T15:45:00Z',
      lastContact: '2024-10-30T07:20:00Z',
    },
    {
      id: '7',
      name: 'Robert Martinez',
      email: 'rmartinez@techno.io',
      phone: '+1 (555) 789-0123',
      company: 'Techno Solutions',
      status: 'contacted',
      source: 'Email Campaign',
      value: 18000,
      assignedTo: 'Alex Johnson',
      createdAt: '2024-10-29T08:30:00Z',
      lastContact: '2024-10-29T16:00:00Z',
    },
    {
      id: '8',
      name: 'Lisa Anderson',
      email: 'landerson@digital.net',
      phone: '+1 (555) 890-1234',
      company: 'Digital Networks',
      status: 'new',
      source: 'Referral',
      value: 12000,
      assignedTo: 'John Anderson',
      createdAt: '2024-10-30T10:15:00Z',
      lastContact: '2024-10-30T10:15:00Z',
    },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLead(null);
  };

  const handleView = () => {
    if (selectedLead) {
      toast.info(`Viewing lead: ${selectedLead.name}`);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (selectedLead) {
      toast.info(`Editing lead: ${selectedLead.name}`);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedLead) {
      toast.success(`Lead "${selectedLead.name}" deleted successfully`);
      handleMenuClose();
    }
  };

  const handleSendEmail = () => {
    if (selectedLead) {
      toast.success(`Email sent to ${selectedLead.email}`);
      handleMenuClose();
    }
  };

  const handleConvert = () => {
    if (selectedLead) {
      toast.success(`Lead "${selectedLead.name}" converted to customer`);
      handleMenuClose();
    }
  };

  const handleRefresh = () => {
    toast.success('Leads list refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'primary';
      case 'qualified':
        return 'success';
      case 'converted':
        return 'success';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter leads
  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Lead Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.company}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'email',
      headerName: 'Contact',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.phone}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 130,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'qualified'
              ? 'success'
              : params.value === 'contacted'
              ? 'info'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'score',
      headerName: 'Score',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value >= 80 ? 'success' : params.value >= 50 ? 'warning' : 'error'
          }
          size="small"
        />
      ),
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Leads
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="contacted">Contacted</MenuItem>
              <MenuItem value="qualified">Qualified</MenuItem>
              <MenuItem value="lost">Lost</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              label="Source"
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="referral">Referral</MenuItem>
              <MenuItem value="social">Social Media</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => {}}>
            New Lead
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredLeads}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
};

export default LeadsListPage;
