// ============================================
// CRM - CONTACTS LIST PAGE
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
  Avatar,
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
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  type: 'customer' | 'lead' | 'partner' | 'vendor';
  status: 'active' | 'inactive' | 'pending';
  tags: string[];
  assignedTo: string;
  lastContact: string;
  createdAt: string;
  notes: string;
}

const ContactsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Mock contacts data
  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Alice Thompson',
      email: 'alice.thompson@techcorp.com',
      phone: '+1 (555) 111-2222',
      company: 'TechCorp Solutions',
      position: 'CTO',
      type: 'customer',
      status: 'active',
      tags: ['VIP', 'Enterprise'],
      assignedTo: 'Sarah Mitchell',
      lastContact: '2024-10-30T09:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      notes: 'Key decision maker for enterprise deals',
    },
    {
      id: '2',
      name: 'Robert Chen',
      email: 'robert.chen@innovate.io',
      phone: '+1 (555) 222-3333',
      company: 'Innovate Inc',
      position: 'VP of Operations',
      type: 'lead',
      status: 'active',
      tags: ['Hot Lead', 'Enterprise'],
      assignedTo: 'John Anderson',
      lastContact: '2024-10-29T15:30:00Z',
      createdAt: '2024-10-20T11:00:00Z',
      notes: 'Interested in premium plan',
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.g@datatech.com',
      phone: '+1 (555) 333-4444',
      company: 'DataTech Systems',
      position: 'CEO',
      type: 'partner',
      status: 'active',
      tags: ['Partner', 'Strategic'],
      assignedTo: 'Sarah Mitchell',
      lastContact: '2024-10-28T14:20:00Z',
      createdAt: '2023-11-10T09:00:00Z',
      notes: 'Strategic partner for data integration',
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'jwilson@cloudbase.net',
      phone: '+1 (555) 444-5555',
      company: 'CloudBase Networks',
      position: 'Director of IT',
      type: 'customer',
      status: 'active',
      tags: ['Enterprise', 'Long-term'],
      assignedTo: 'Alex Johnson',
      lastContact: '2024-10-27T10:15:00Z',
      createdAt: '2023-08-22T08:30:00Z',
      notes: 'Excellent relationship, multiple renewals',
    },
    {
      id: '5',
      name: 'Sophie Martin',
      email: 'smartin@startup.co',
      phone: '+1 (555) 555-6666',
      company: 'Startup Co',
      position: 'Founder',
      type: 'lead',
      status: 'pending',
      tags: ['Startup', 'Growth'],
      assignedTo: 'John Anderson',
      lastContact: '2024-10-26T16:45:00Z',
      createdAt: '2024-10-25T13:00:00Z',
      notes: 'Looking for startup-friendly pricing',
    },
    {
      id: '6',
      name: 'David Kim',
      email: 'dkim@vendors.com',
      phone: '+1 (555) 666-7777',
      company: 'VendorTech',
      position: 'Sales Manager',
      type: 'vendor',
      status: 'active',
      tags: ['Vendor', 'Supplier'],
      assignedTo: 'Sarah Mitchell',
      lastContact: '2024-10-25T11:30:00Z',
      createdAt: '2024-05-18T10:00:00Z',
      notes: 'Reliable vendor for cloud services',
    },
    {
      id: '7',
      name: 'Emma Rodriguez',
      email: 'emma.r@bigcorp.com',
      phone: '+1 (555) 777-8888',
      company: 'BigCorp Industries',
      position: 'Project Manager',
      type: 'customer',
      status: 'active',
      tags: ['Enterprise', 'Multi-site'],
      assignedTo: 'Alex Johnson',
      lastContact: '2024-10-30T08:00:00Z',
      createdAt: '2023-12-05T09:15:00Z',
      notes: 'Managing rollout across 5 locations',
    },
    {
      id: '8',
      name: 'Michael Brown',
      email: 'mbrown@techno.io',
      phone: '+1 (555) 888-9999',
      company: 'Techno Solutions',
      position: 'IT Manager',
      type: 'lead',
      status: 'inactive',
      tags: ['Cold', 'Follow-up'],
      assignedTo: 'John Anderson',
      lastContact: '2024-09-15T14:00:00Z',
      createdAt: '2024-09-01T10:30:00Z',
      notes: 'Lost interest, follow up in Q1',
    },
    {
      id: '9',
      name: 'Lisa Anderson',
      email: 'landerson@partners.net',
      phone: '+1 (555) 999-0000',
      company: 'PartnerNetwork',
      position: 'Business Development',
      type: 'partner',
      status: 'active',
      tags: ['Partner', 'Referral'],
      assignedTo: 'Sarah Mitchell',
      lastContact: '2024-10-29T12:00:00Z',
      createdAt: '2024-03-10T11:00:00Z',
      notes: 'Excellent referral source',
    },
    {
      id: '10',
      name: 'Thomas Lee',
      email: 'tlee@digital.com',
      phone: '+1 (555) 000-1111',
      company: 'Digital Networks',
      position: 'COO',
      type: 'customer',
      status: 'active',
      tags: ['VIP', 'Strategic'],
      assignedTo: 'Alex Johnson',
      lastContact: '2024-10-30T07:30:00Z',
      createdAt: '2023-06-20T08:00:00Z',
      notes: 'Strategic account, quarterly reviews',
    },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contact: Contact) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleView = () => {
    if (selectedContact) {
      toast.info(`Viewing contact: ${selectedContact.name}`);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (selectedContact) {
      toast.info(`Editing contact: ${selectedContact.name}`);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedContact) {
      toast.success(`Contact "${selectedContact.name}" deleted successfully`);
      handleMenuClose();
    }
  };

  const handleSendEmail = () => {
    if (selectedContact) {
      toast.success(`Email sent to ${selectedContact.email}`);
      handleMenuClose();
    }
  };

  const handleCall = () => {
    if (selectedContact) {
      toast.info(`Calling ${selectedContact.phone}`);
      handleMenuClose();
    }
  };

  const handleRefresh = () => {
    toast.success('Contacts list refreshed');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'success';
      case 'lead':
        return 'info';
      case 'partner':
        return 'primary';
      case 'vendor':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter contacts
  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch =
      searchQuery === '' ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'type', headerName: 'Type', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { field: 'lastContact', headerName: 'Last Contact', width: 180 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="partner">Partner</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => {}}>
            New Contact
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredContacts}
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

export default ContactsListPage;
