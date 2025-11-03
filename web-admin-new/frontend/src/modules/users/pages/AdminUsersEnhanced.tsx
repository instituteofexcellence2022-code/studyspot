// ============================================
// ADMIN USERS PAGE - ENHANCED
// Team management, permissions, activity tracking
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  AvatarGroup,
  Divider,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AdminPanelSettings,
  Group,
  Security,
  History,
  CheckCircle,
  Block,
  Save,
  ExpandMore,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import { showSuccess } from '../../../store/slices/uiSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members?: string[];
  departments?: string[];
  permissions: string[];
  createdAt: Date;
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: Date;
  ipAddress: string;
}

const AdminUsersEnhanced: React.FC = () => {
  const dispatch = useAppDispatch();
  const { adminUsers } = useAppSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [permissionMatrix, setPermissionMatrix] = useState<any>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string>('management');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [userDepartments, setUserDepartments] = useState<string[]>(['management']);
  const [userExpandedModules, setUserExpandedModules] = useState<string[]>([]);
  const [customRoleMode, setCustomRoleMode] = useState(false);
  const [customRoleDepartment, setCustomRoleDepartment] = useState<string>('management');
  const [customRoleModules, setCustomRoleModules] = useState<string[]>([]);
  const [customRoleName, setCustomRoleName] = useState<string>('');

  // Hierarchical permission structure: Department → Module → Tabs → CRUD
  const permissionHierarchy = {
    management: {
      name: 'Management',
      icon: '👥',
      color: 'primary',
      modules: {
        tenants: {
          name: 'Tenants & Libraries',
          icon: '🏢',
          tabs: [
            { name: 'Overview', view: true, create: false, edit: true, delete: false },
            { name: 'All Libraries', view: true, create: true, edit: true, delete: true },
            { name: 'Onboarding', view: true, create: true, edit: true, delete: false },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
          ]
        },
        platformUsers: {
          name: 'Platform Users',
          icon: '👥',
          tabs: [
            { name: 'User List', view: true, create: true, edit: true, delete: false },
            { name: 'User Details', view: true, create: false, edit: true, delete: false },
            { name: 'Segmentation', view: true, create: true, edit: true, delete: true },
          ]
        },
        students: {
          name: 'Student Management',
          icon: '🎓',
          tabs: [
            { name: 'Student Dashboard', view: true, create: false, edit: false, delete: false },
            { name: 'Student List', view: true, create: true, edit: true, delete: true },
            { name: 'Student Details', view: true, create: false, edit: true, delete: false },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'Messaging', view: true, create: true, edit: false, delete: false },
          ]
        },
        adminUsers: {
          name: 'Admin Users & Roles',
          icon: '👨‍💼',
          tabs: [
            { name: 'Admin Users', view: true, create: true, edit: true, delete: true },
            { name: 'Teams', view: true, create: true, edit: true, delete: true },
            { name: 'Roles & Permissions', view: true, create: true, edit: true, delete: true },
            { name: 'Activity Log', view: true, create: false, edit: false, delete: false },
          ]
        },
        attendance: {
          name: 'Attendance Oversight',
          icon: '📅',
          tabs: [
            { name: 'Today\'s Attendance', view: true, create: false, edit: true, delete: false },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'Reports', view: true, create: true, edit: false, delete: false },
          ]
        },
      }
    },
    finance: {
      name: 'Finance',
      icon: '💰',
      color: 'success',
      modules: {
        revenue: {
          name: 'Revenue & Billing',
          icon: '💰',
          tabs: [
            { name: 'Dashboard', view: true, create: false, edit: false, delete: false },
            { name: 'Revenue Analytics', view: true, create: false, edit: true, delete: false },
            { name: 'Invoices', view: true, create: true, edit: true, delete: false },
            { name: 'Reports', view: true, create: true, edit: false, delete: false },
          ]
        },
        payments: {
          name: 'Payment Management',
          icon: '💳',
          tabs: [
            { name: 'All Payments', view: true, create: false, edit: true, delete: false },
            { name: 'Pending', view: true, create: false, edit: true, delete: false },
            { name: 'Failed', view: true, create: false, edit: true, delete: false },
            { name: 'Refunds', view: true, create: true, edit: true, delete: false },
          ]
        },
        credits: {
          name: 'Credit Management',
          icon: '💸',
          tabs: [
            { name: 'Overview', view: true, create: false, edit: false, delete: false },
            { name: 'Buy Credits', view: true, create: true, edit: false, delete: false },
            { name: 'Packages & Pricing', view: true, create: true, edit: true, delete: true },
            { name: 'Tenant Wallets', view: true, create: false, edit: true, delete: false },
            { name: 'Profit Analytics', view: true, create: false, edit: false, delete: false },
          ]
        },
        subscriptions: {
          name: 'Subscriptions & Plans',
          icon: '📋',
          tabs: [
            { name: 'All Plans', view: true, create: true, edit: true, delete: true },
            { name: 'Active Subscriptions', view: true, create: false, edit: true, delete: false },
            { name: 'Plan Configuration', view: true, create: true, edit: true, delete: true },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
          ]
        },
      }
    },
    operations: {
      name: 'Operations',
      icon: '🎯',
      color: 'info',
      modules: {
        crm: {
          name: 'CRM & Leads',
          icon: '🎯',
          tabs: [
            { name: 'Leads (Table View)', view: true, create: true, edit: true, delete: true },
            { name: 'Leads (Kanban View)', view: true, create: true, edit: true, delete: true },
            { name: 'Lead Details', view: true, create: false, edit: true, delete: false },
          ]
        },
        templates: {
          name: 'Template Management',
          icon: '📝',
          tabs: [
            { name: 'SMS Templates', view: true, create: true, edit: true, delete: true },
            { name: 'WhatsApp Templates', view: true, create: true, edit: true, delete: true },
            { name: 'Email Templates', view: true, create: true, edit: true, delete: true },
            { name: 'Automation', view: true, create: true, edit: true, delete: false },
            { name: 'Variables', view: true, create: false, edit: false, delete: false },
          ]
        },
        messaging: {
          name: 'Messaging',
          icon: '💬',
          tabs: [
            { name: 'Inbox', view: true, create: true, edit: false, delete: true },
            { name: 'Sent', view: true, create: false, edit: false, delete: false },
            { name: 'Drafts', view: true, create: true, edit: true, delete: true },
          ]
        },
        tickets: {
          name: 'Ticket Management',
          icon: '🎫',
          tabs: [
            { name: 'All Tickets', view: true, create: true, edit: true, delete: false },
            { name: 'My Tickets', view: true, create: true, edit: true, delete: false },
            { name: 'AI Automation', view: true, create: false, edit: true, delete: false },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'Team Performance', view: true, create: false, edit: false, delete: false },
            { name: 'Automation Rules', view: true, create: true, edit: true, delete: true },
          ]
        },
        referrals: {
          name: 'Referrals & Loyalty',
          icon: '🎁',
          tabs: [
            { name: 'Referrals', view: true, create: true, edit: true, delete: false },
            { name: 'Loyalty Members', view: true, create: false, edit: true, delete: false },
            { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'Programs', view: true, create: true, edit: true, delete: true },
          ]
        },
      }
    },
    insights: {
      name: 'Insights',
      icon: '📈',
      color: 'secondary',
      modules: {
        analytics: {
          name: 'Analytics',
          icon: '📈',
          tabs: [
            { name: 'Overview', view: true, create: false, edit: false, delete: false },
            { name: 'Revenue Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'User Analytics', view: true, create: false, edit: false, delete: false },
            { name: 'Custom Reports', view: true, create: true, edit: false, delete: false },
          ]
        },
        reports: {
          name: 'Reports',
          icon: '📄',
          tabs: [
            { name: 'All Reports', view: true, create: true, edit: false, delete: false },
            { name: 'Scheduled Reports', view: true, create: true, edit: true, delete: true },
            { name: 'Export', view: true, create: true, edit: false, delete: false },
          ]
        },
      }
    },
    system: {
      name: 'System',
      icon: '⚙️',
      color: 'warning',
      modules: {
        systemHealth: {
          name: 'System Health',
          icon: '🏥',
          tabs: [
            { name: 'Overview', view: true, create: false, edit: false, delete: false },
            { name: 'Performance', view: true, create: false, edit: true, delete: false },
            { name: 'Services', view: true, create: false, edit: true, delete: false },
          ]
        },
        compliance: {
          name: 'Compliance & Privacy',
          icon: '🔐',
          tabs: [
            { name: 'Data Requests', view: true, create: false, edit: true, delete: false },
            { name: 'Consent Management', view: true, create: false, edit: true, delete: false },
            { name: 'Audit Logs', view: true, create: false, edit: false, delete: false },
          ]
        },
        auditLogs: {
          name: 'Audit Logs',
          icon: '🔍',
          tabs: [
            { name: 'All Logs', view: true, create: false, edit: false, delete: false },
            { name: 'User Actions', view: true, create: false, edit: false, delete: false },
            { name: 'System Events', view: true, create: false, edit: false, delete: false },
          ]
        },
        settings: {
          name: 'Settings',
          icon: '⚙️',
          tabs: [
            { name: 'General Settings', view: true, create: false, edit: true, delete: false },
            { name: 'Security Settings', view: true, create: false, edit: true, delete: false },
            { name: 'Integration Settings', view: true, create: false, edit: true, delete: false },
          ]
        },
      }
    },
  };

  // Mock teams data
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Super Admins',
      description: 'Full system access across all departments',
      memberCount: 3,
      members: ['John Doe', 'Sarah Wilson', 'Mike Chen'],
      departments: ['Management', 'Finance', 'Operations', 'Insights', 'System'],
      permissions: ['All Modules', 'All Permissions'],
      createdAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      name: 'Finance Team',
      description: 'Revenue, billing, payments & credit management',
      memberCount: 5,
      members: ['Emily Rodriguez', 'David Kim', 'Lisa Wang', 'Tom Brown', 'Anna Lee'],
      departments: ['Finance'],
      permissions: ['Revenue Analytics', 'Payment Management', 'Credit Management', 'Subscriptions'],
      createdAt: new Date('2025-02-01'),
    },
    {
      id: '3',
      name: 'Support Team',
      description: 'Customer support, tickets & student assistance',
      memberCount: 8,
      members: ['Alex Johnson', 'Maria Garcia', 'Chris Taylor', 'Sophie Martin', 'James Anderson', 'Emma Davis', 'Ryan Lee', 'Olivia Brown'],
      departments: ['Operations'],
      permissions: ['Tickets', 'Messaging', 'Students', 'Templates'],
      createdAt: new Date('2025-01-20'),
    },
    {
      id: '4',
      name: 'Operations Team',
      description: 'CRM, leads, automation & workflow management',
      memberCount: 6,
      members: ['Daniel Park', 'Jessica Liu', 'Michael Scott', 'Rachel Green', 'Kevin Malone', 'Pam Beesly'],
      departments: ['Operations', 'Management'],
      permissions: ['CRM & Leads', 'Templates', 'Attendance', 'Referrals'],
      createdAt: new Date('2025-02-10'),
    },
    {
      id: '5',
      name: 'Analytics Team',
      description: 'Data analysis, reporting & business intelligence',
      memberCount: 4,
      members: ['Dr. Alan Smith', 'Nina Patel', 'Carlos Rodriguez', 'Yuki Tanaka'],
      departments: ['Insights'],
      permissions: ['Analytics Dashboard', 'Reports & Exports'],
      createdAt: new Date('2025-02-15'),
    },
  ]);

  // Mock activities
  const activities: Activity[] = [
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      action: 'Created new tenant',
      module: 'Tenants',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      ipAddress: '192.168.1.1',
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jane Smith',
      action: 'Updated payment settings',
      module: 'Payments',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      ipAddress: '192.168.1.2',
    },
    {
      id: '3',
      userId: '1',
      userName: 'John Doe',
      action: 'Suspended user account',
      module: 'Users',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      ipAddress: '192.168.1.1',
    },
  ];

  // Activity chart data
  const activityChartData = [
    { hour: '00:00', activities: 5 },
    { hour: '04:00', activities: 3 },
    { hour: '08:00', activities: 15 },
    { hour: '12:00', activities: 25 },
    { hour: '16:00', activities: 20 },
    { hour: '20:00', activities: 10 },
  ];

  // All available permissions
  const allPermissions = [
    { id: 'tenants', name: 'Tenant Management' },
    { id: 'users', name: 'User Management' },
    { id: 'revenue', name: 'Revenue & Billing' },
    { id: 'payments', name: 'Payment Management' },
    { id: 'credits', name: 'Credit Management' },
    { id: 'subscriptions', name: 'Subscriptions' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'reports', name: 'Reports' },
    { id: 'settings', name: 'Settings' },
    { id: 'messaging', name: 'Messaging' },
    { id: 'tickets', name: 'Tickets' },
  ];

  // Admin Users columns
  const userColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>{params.value.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color="primary"
          size="small"
          icon={<AdminPanelSettings />}
        />
      ),
    },
    {
      field: 'team',
      headerName: 'Team',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.row.team ? (
          <Chip
            label={params.row.team}
            color="info"
            size="small"
            icon={<Group />}
            variant="outlined"
          />
        ) : (
          <Typography variant="caption" color="text.secondary">No team</Typography>
        )
      ),
    },
    {
      field: 'departments',
      headerName: 'Departments',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.departments || ['Management']).slice(0, 2).map((dept: string) => (
            <Chip key={dept} label={dept} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ))}
          {(params.row.departments || []).length > 2 && (
            <Chip label={`+${(params.row.departments || []).length - 2}`} size="small" sx={{ fontSize: '0.7rem' }} />
          )}
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 130,
      valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : 'Never'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => handleEditPermissions(params.row)}>
            <Security fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleEditUser(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Team columns
  const teamColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Team Name',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <Group />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.description}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'members',
      headerName: 'Team Members',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const members = params.row.members || [];
        const memberCount = params.row.memberCount || 0;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {members.slice(0, 3).map((member: string, idx: number) => (
                <Avatar 
                  key={idx} 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    fontSize: '0.75rem',
                    ml: idx > 0 ? -1 : 0,
                    border: 2,
                    borderColor: 'background.paper'
                  }}
                >
                  {member.charAt(0)}
                </Avatar>
              ))}
              {memberCount > 3 && (
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    fontSize: '0.7rem',
                    ml: -1,
                    border: 2,
                    borderColor: 'background.paper',
                    bgcolor: 'grey.400'
                  }}
                >
                  +{memberCount - 3}
                </Avatar>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'departments',
      headerName: 'Access Scope',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.row.departments || ['Management']).slice(0, 2).map((dept: string) => (
            <Chip key={dept} label={dept} size="small" color="primary" variant="outlined" />
          ))}
          {(params.row.departments || []).length > 2 && (
            <Chip label={`+${(params.row.departments || []).length - 2}`} size="small" />
          )}
        </Stack>
      ),
    },
    {
      field: 'permissions',
      headerName: 'Key Permissions',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {(params.value as string[]).slice(0, 2).map((perm) => (
            <Chip key={perm} label={perm} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ))}
          {(params.value as string[]).length > 2 && (
            <Chip label={`+${(params.value as string[]).length - 2} more`} size="small" sx={{ fontSize: '0.7rem' }} />
          )}
        </Stack>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Activity columns
  const activityColumns: GridColDef[] = [
    {
      field: 'userName',
      headerName: 'User',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'action', headerName: 'Action', flex: 1, minWidth: 200 },
    {
      field: 'module',
      headerName: 'Module',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 150,
      valueGetter: (value) => {
        const date = new Date(value);
        return date.toLocaleString();
      },
    },
    { field: 'ipAddress', headerName: 'IP Address', width: 130 },
  ];

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setCreateDialogOpen(true);
  };

  const handleEditPermissions = (user: any) => {
    setSelectedUser(user);
    setPermissionDialogOpen(true);
  };

  const handleCreateRole = () => {
    setCreateRoleOpen(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setCreateRoleOpen(true);
  };

  const handleDeleteRole = (role: any) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      alert(`Role "${role.name}" deleted successfully!`);
      // In production: Call API to delete role
    }
  };

  const handleSaveRole = () => {
    alert('Role saved successfully!');
    setCreateRoleOpen(false);
    setSelectedRole(null);
    // In production: Call API to save role
  };

  const handleSavePermissions = () => {
    alert('Permissions saved successfully!');
    // In production: Call API to update permissions
  };

  const handleResetPermissions = () => {
    if (window.confirm('Reset all permissions to default?')) {
      alert('Permissions reset to default!');
      // In production: Reset permission matrix
    }
  };

  const handlePermissionChange = (module: string, permissionType: string, checked: boolean) => {
    alert(`${module} ${permissionType}: ${checked ? 'Enabled' : 'Disabled'}`);
    // In production: Update permission state
  };

  const handleCreateTeam = () => {
    setTeamDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      alert(`User "${selectedUser.name}" updated successfully!`);
    } else {
      alert('New admin user created successfully!');
    }
    setCreateDialogOpen(false);
    setSelectedUser(null);
    // In production: Call API to save user
  };

  // Tab 1: Admin Users
  const renderUsersTab = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Admin Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform administrators, their roles, teams & permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Admin User
        </Button>
      </Stack>

      {/* Filters & Search */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search by name, email, role..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ width: 300 }}
            />
            <Divider orientation="vertical" flexItem />
            <Chip label="All Users" color="primary" onClick={() => {}} />
            <Chip label="Active" variant="outlined" onClick={() => {}} />
            <Chip label="Inactive" variant="outlined" onClick={() => {}} />
            <Divider orientation="vertical" flexItem />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Team</InputLabel>
              <Select defaultValue="all" label="Filter by Team">
                <MenuItem value="all">All Teams</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                ))}
                <MenuItem value="no_team">No Team</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select defaultValue="all" label="Filter by Role">
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="platform_admin">Platform Admin</MenuItem>
                <MenuItem value="finance_manager">Finance Manager</MenuItem>
                <MenuItem value="support_agent">Support Agent</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={adminUsers}
              columns={userColumns}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Teams
  const renderTeamsTab = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Teams & Groups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize admin users into teams with shared permissions and access scope
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTeam}
        >
          Create Team
        </Button>
      </Stack>

      {/* Team Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Total Teams</Typography>
            <Typography variant="h4" fontWeight="bold">{teams.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Total Members</Typography>
            <Typography variant="h4" fontWeight="bold">
              {teams.reduce((sum, team) => sum + team.memberCount, 0)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Avg Team Size</Typography>
            <Typography variant="h4" fontWeight="bold">
              {Math.round(teams.reduce((sum, team) => sum + team.memberCount, 0) / teams.length)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Cross-Dept Teams</Typography>
            <Typography variant="h4" fontWeight="bold">
              {teams.filter(t => (t.departments || []).length > 1).length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Search teams..."
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ width: 250 }}
            />
            <Chip label="All Teams" color="primary" onClick={() => {}} />
            <Chip label="Management" variant="outlined" onClick={() => {}} />
            <Chip label="Finance" variant="outlined" onClick={() => {}} />
            <Chip label="Operations" variant="outlined" onClick={() => {}} />
            <Chip label="Cross-Department" variant="outlined" onClick={() => {}} />
          </Stack>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={teams}
              columns={teamColumns}
              pageSizeOptions={[10, 25]}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 3: Roles & Permissions
  const renderRolesPermissionsTab = () => {
    const roles = [
      { id: 1, name: 'Super Admin', users: 2, description: 'Full system access', permissions: 50, status: 'Active', createdDate: '2025-01-01', color: 'error' },
      { id: 2, name: 'Admin', users: 3, description: 'Manage tenants & users', permissions: 35, status: 'Active', createdDate: '2025-01-01', color: 'primary' },
      { id: 3, name: 'Manager', users: 2, description: 'Manage operations', permissions: 25, status: 'Active', createdDate: '2025-02-15', color: 'warning' },
      { id: 4, name: 'Support', users: 5, description: 'Handle support tickets', permissions: 15, status: 'Active', createdDate: '2025-03-01', color: 'info' },
      { id: 5, name: 'Analyst', users: 3, description: 'View reports & analytics', permissions: 10, status: 'Active', createdDate: '2025-04-10', color: 'success' },
    ];

    // Hierarchical permission structure: Department → Module → Tabs → CRUD
    const permissionHierarchy = {
      management: {
        name: 'Management',
        icon: '👥',
        color: 'primary',
        modules: {
          tenants: {
            name: 'Tenants & Libraries',
            icon: '🏢',
            tabs: [
              { name: 'Overview', view: true, create: false, edit: true, delete: false },
              { name: 'All Libraries', view: true, create: true, edit: true, delete: true },
              { name: 'Onboarding', view: true, create: true, edit: true, delete: false },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            ]
          },
          platformUsers: {
            name: 'Platform Users',
            icon: '👥',
            tabs: [
              { name: 'User List', view: true, create: true, edit: true, delete: false },
              { name: 'User Details', view: true, create: false, edit: true, delete: false },
              { name: 'Segmentation', view: true, create: true, edit: true, delete: true },
            ]
          },
          students: {
            name: 'Student Management',
            icon: '🎓',
            tabs: [
              { name: 'Student Dashboard', view: true, create: false, edit: false, delete: false },
              { name: 'Student List', view: true, create: true, edit: true, delete: true },
              { name: 'Student Details', view: true, create: false, edit: true, delete: false },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'Messaging', view: true, create: true, edit: false, delete: false },
            ]
          },
          adminUsers: {
            name: 'Admin Users & Roles',
            icon: '👨‍💼',
            tabs: [
              { name: 'Admin Users', view: true, create: true, edit: true, delete: true },
              { name: 'Teams', view: true, create: true, edit: true, delete: true },
              { name: 'Roles & Permissions', view: true, create: true, edit: true, delete: true },
              { name: 'Activity Log', view: true, create: false, edit: false, delete: false },
            ]
          },
          attendance: {
            name: 'Attendance Oversight',
            icon: '📅',
            tabs: [
              { name: 'Today\'s Attendance', view: true, create: false, edit: true, delete: false },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'Reports', view: true, create: true, edit: false, delete: false },
            ]
          },
        }
      },
      finance: {
        name: 'Finance',
        icon: '💰',
        color: 'success',
        modules: {
          revenue: {
            name: 'Revenue & Billing',
            icon: '💰',
            tabs: [
              { name: 'Dashboard', view: true, create: false, edit: false, delete: false },
              { name: 'Revenue Analytics', view: true, create: false, edit: true, delete: false },
              { name: 'Invoices', view: true, create: true, edit: true, delete: false },
              { name: 'Reports', view: true, create: true, edit: false, delete: false },
            ]
          },
          payments: {
            name: 'Payment Management',
            icon: '💳',
            tabs: [
              { name: 'All Payments', view: true, create: false, edit: true, delete: false },
              { name: 'Pending', view: true, create: false, edit: true, delete: false },
              { name: 'Failed', view: true, create: false, edit: true, delete: false },
              { name: 'Refunds', view: true, create: true, edit: true, delete: false },
            ]
          },
          credits: {
            name: 'Credit Management',
            icon: '💸',
            tabs: [
              { name: 'Overview', view: true, create: false, edit: false, delete: false },
              { name: 'Buy Credits', view: true, create: true, edit: false, delete: false },
              { name: 'Packages & Pricing', view: true, create: true, edit: true, delete: true },
              { name: 'Tenant Wallets', view: true, create: false, edit: true, delete: false },
              { name: 'Profit Analytics', view: true, create: false, edit: false, delete: false },
            ]
          },
          subscriptions: {
            name: 'Subscriptions & Plans',
            icon: '📋',
            tabs: [
              { name: 'All Plans', view: true, create: true, edit: true, delete: true },
              { name: 'Active Subscriptions', view: true, create: false, edit: true, delete: false },
              { name: 'Plan Configuration', view: true, create: true, edit: true, delete: true },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
            ]
          },
        }
      },
      operations: {
        name: 'Operations',
        icon: '🎯',
        color: 'info',
        modules: {
          crm: {
            name: 'CRM & Leads',
            icon: '🎯',
            tabs: [
              { name: 'Leads (Table View)', view: true, create: true, edit: true, delete: true },
              { name: 'Leads (Kanban View)', view: true, create: true, edit: true, delete: true },
              { name: 'Lead Details', view: true, create: false, edit: true, delete: false },
            ]
          },
          templates: {
            name: 'Template Management',
            icon: '📝',
            tabs: [
              { name: 'SMS Templates', view: true, create: true, edit: true, delete: true },
              { name: 'WhatsApp Templates', view: true, create: true, edit: true, delete: true },
              { name: 'Email Templates', view: true, create: true, edit: true, delete: true },
              { name: 'Automation', view: true, create: true, edit: true, delete: false },
              { name: 'Variables', view: true, create: false, edit: false, delete: false },
            ]
          },
          messaging: {
            name: 'Messaging',
            icon: '💬',
            tabs: [
              { name: 'Inbox', view: true, create: true, edit: false, delete: true },
              { name: 'Sent', view: true, create: false, edit: false, delete: false },
              { name: 'Drafts', view: true, create: true, edit: true, delete: true },
            ]
          },
          tickets: {
            name: 'Ticket Management',
            icon: '🎫',
            tabs: [
              { name: 'All Tickets', view: true, create: true, edit: true, delete: false },
              { name: 'My Tickets', view: true, create: true, edit: true, delete: false },
              { name: 'AI Automation', view: true, create: false, edit: true, delete: false },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'Team Performance', view: true, create: false, edit: false, delete: false },
              { name: 'Automation Rules', view: true, create: true, edit: true, delete: true },
            ]
          },
          referrals: {
            name: 'Referrals & Loyalty',
            icon: '🎁',
            tabs: [
              { name: 'Referrals', view: true, create: true, edit: true, delete: false },
              { name: 'Loyalty Members', view: true, create: false, edit: true, delete: false },
              { name: 'Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'Programs', view: true, create: true, edit: true, delete: true },
            ]
          },
        }
      },
      insights: {
        name: 'Insights',
        icon: '📈',
        color: 'secondary',
        modules: {
          analytics: {
            name: 'Analytics',
            icon: '📈',
            tabs: [
              { name: 'Overview', view: true, create: false, edit: false, delete: false },
              { name: 'Revenue Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'User Analytics', view: true, create: false, edit: false, delete: false },
              { name: 'Custom Reports', view: true, create: true, edit: false, delete: false },
            ]
          },
          reports: {
            name: 'Reports',
            icon: '📄',
            tabs: [
              { name: 'All Reports', view: true, create: true, edit: false, delete: false },
              { name: 'Scheduled Reports', view: true, create: true, edit: true, delete: true },
              { name: 'Export', view: true, create: true, edit: false, delete: false },
            ]
          },
        }
      },
      system: {
        name: 'System',
        icon: '⚙️',
        color: 'warning',
        modules: {
          systemHealth: {
            name: 'System Health',
            icon: '🏥',
            tabs: [
              { name: 'Overview', view: true, create: false, edit: false, delete: false },
              { name: 'Performance', view: true, create: false, edit: true, delete: false },
              { name: 'Services', view: true, create: false, edit: true, delete: false },
            ]
          },
          compliance: {
            name: 'Compliance & Privacy',
            icon: '🔐',
            tabs: [
              { name: 'Data Requests', view: true, create: false, edit: true, delete: false },
              { name: 'Consent Management', view: true, create: false, edit: true, delete: false },
              { name: 'Audit Logs', view: true, create: false, edit: false, delete: false },
            ]
          },
          auditLogs: {
            name: 'Audit Logs',
            icon: '🔍',
            tabs: [
              { name: 'All Logs', view: true, create: false, edit: false, delete: false },
              { name: 'User Actions', view: true, create: false, edit: false, delete: false },
              { name: 'System Events', view: true, create: false, edit: false, delete: false },
            ]
          },
          settings: {
            name: 'Settings',
            icon: '⚙️',
            tabs: [
              { name: 'General Settings', view: true, create: false, edit: true, delete: false },
              { name: 'Security Settings', view: true, create: false, edit: true, delete: false },
              { name: 'Integration Settings', view: true, create: false, edit: true, delete: false },
            ]
          },
        }
      },
    };

    const roleColumns: GridColDef[] = [
      { field: 'name', headerName: 'Role Name', width: 200, renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
      )},
      { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
      { 
        field: 'users', 
        headerName: 'Users', 
        width: 100,
        renderCell: (params) => (
          <Chip label={params.value} color="primary" size="small" />
        )
      },
      { 
        field: 'permissions', 
        headerName: 'Permissions', 
        width: 130, 
        renderCell: (params) => (
          <Chip label={`${params.value} perms`} size="small" variant="outlined" />
        )
      },
      { field: 'createdDate', headerName: 'Created', width: 130 },
      { 
        field: 'status', 
        headerName: 'Status', 
        width: 110,
        renderCell: (params) => <Chip label={params.value} color="success" size="small" />
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => (
          <Box>
            <IconButton size="small" color="primary" onClick={() => handleEditRole(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDeleteRole(params.row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ];

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Roles & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage access control and permission matrix
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateRole}>
            Create Role
          </Button>
        </Stack>

        {/* Roles Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <DataGrid
              rows={roles}
              columns={roleColumns}
              autoHeight
              pageSizeOptions={[10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
            />
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Permission Matrix {selectedRole ? `- ${selectedRole.name}` : '- Super Admin'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure module-level permissions (View, Create, Edit, Delete)
                </Typography>
              </Box>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole?.id || 1}
                  onChange={(e) => {
                    const role = roles.find(r => r.id === e.target.value);
                    setSelectedRole(role);
                  }}
                  label="Select Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      <Chip label={role.name} size="small" color={role.color as any} sx={{ mr: 1 }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Department Selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Select Department
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {Object.entries(permissionHierarchy).map(([key, dept]: [string, any]) => (
                  <Chip
                    key={key}
                    label={`${dept.icon} ${dept.name}`}
                    onClick={() => setSelectedDepartment(key)}
                    color={selectedDepartment === key ? dept.color : 'default'}
                    variant={selectedDepartment === key ? 'filled' : 'outlined'}
                    sx={{ px: 2, py: 2.5, fontSize: '0.9rem' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Hierarchical Permission Matrix */}
            <Box>
              {Object.entries(permissionHierarchy[selectedDepartment as keyof typeof permissionHierarchy].modules).map(([moduleKey, moduleData]: [string, any]) => {
                const isExpanded = expandedModules.includes(moduleKey);
                
                return (
                  <Card key={moduleKey} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                    <CardContent>
                      {/* Module Header */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          cursor: 'pointer',
                          mb: isExpanded ? 2 : 0
                        }}
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedModules(expandedModules.filter(m => m !== moduleKey));
                          } else {
                            setExpandedModules([...expandedModules, moduleKey]);
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h5">{moduleData.icon}</Typography>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {moduleData.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {moduleData.tabs.length} tabs • Click to expand
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton>
                          {isExpanded ? <ExpandMore /> : <ExpandMore sx={{ transform: 'rotate(-90deg)' }} />}
                        </IconButton>
                      </Box>

                      {/* Tabs Permissions */}
                      {isExpanded && (
                        <Box>
                          <Divider sx={{ mb: 2 }} />
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                  <Typography variant="caption" fontWeight="bold">Tab/Page</Typography>
                                </th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px' }}>
                                  <Typography variant="caption" fontWeight="bold" color="primary">👁️ View</Typography>
                                </th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px' }}>
                                  <Typography variant="caption" fontWeight="bold" color="success.main">➕ Create</Typography>
                                </th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px' }}>
                                  <Typography variant="caption" fontWeight="bold" color="warning.main">✏️ Edit</Typography>
                                </th>
                                <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px' }}>
                                  <Typography variant="caption" fontWeight="bold" color="error.main">🗑️ Delete</Typography>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {moduleData.tabs.map((tab: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '8px' }}>
                                    <Typography variant="body2">{tab.name}</Typography>
                                  </td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <Switch
                                      checked={tab.view}
                                      color="primary"
                                      size="small"
                                      onChange={(e) => alert(`${moduleData.name} → ${tab.name} → View: ${e.target.checked ? 'ON' : 'OFF'}`)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <Switch
                                      checked={tab.create}
                                      color="success"
                                      size="small"
                                      onChange={(e) => alert(`${moduleData.name} → ${tab.name} → Create: ${e.target.checked ? 'ON' : 'OFF'}`)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <Switch
                                      checked={tab.edit}
                                      color="warning"
                                      size="small"
                                      onChange={(e) => alert(`${moduleData.name} → ${tab.name} → Edit: ${e.target.checked ? 'ON' : 'OFF'}`)}
                                    />
                                  </td>
                                  <td style={{ padding: '8px', textAlign: 'center' }}>
                                    <Switch
                                      checked={tab.delete}
                                      color="error"
                                      size="small"
                                      onChange={(e) => alert(`${moduleData.name} → ${tab.name} → Delete: ${e.target.checked ? 'ON' : 'OFF'}`)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleResetPermissions}>
                Reset to Default
              </Button>
              <Button variant="contained" startIcon={<CheckCircle />} onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Tab 4: Activity Log
  const renderActivityTab = () => (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Activity Log
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track all admin user activities and changes
      </Typography>

      {/* Activity Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Activity Trend (Last 24 Hours)
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="activities" stroke="#E91E63" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={activities}
              columns={activityColumns}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Users, Roles & Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage admin users, teams, roles, permissions, and track all activities
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Admins
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {adminUsers.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <AdminPanelSettings />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Active Now
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {adminUsers.filter((u) => u.status === 'active').length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckCircle />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Teams
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {teams.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Group />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Today's Activities
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {activities.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <History />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab label="Admin Users" icon={<AdminPanelSettings />} iconPosition="start" />
          <Tab label="Teams" icon={<Group />} iconPosition="start" />
          <Tab label="Roles & Permissions" icon={<Security />} iconPosition="start" />
          <Tab label="Activity Log" icon={<History />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && renderUsersTab()}
          {activeTab === 1 && renderTeamsTab()}
          {activeTab === 2 && renderRolesPermissionsTab()}
          {activeTab === 3 && renderActivityTab()}
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {selectedUser ? 'Edit Admin User' : 'Add New Admin User'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Systematic Flow:</strong> Basic info → Select role → Configure department-level permissions
              </Typography>
            </Alert>

            <Stack spacing={3}>
              {/* Step 1: Basic Information */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="1" size="small" color="primary" />
                  Basic Information
                </Typography>
                <Stack spacing={2}>
                  <TextField 
                    label="Full Name" 
                    required 
                    fullWidth 
                    defaultValue={selectedUser?.name}
                    placeholder="e.g., John Doe"
                  />
                  
                  <TextField 
                    label="Email Address" 
                    required 
                    fullWidth 
                    type="email" 
                    defaultValue={selectedUser?.email}
                    placeholder="john.doe@example.com"
                  />

                  <TextField 
                    label="Phone Number" 
                    fullWidth 
                    defaultValue={selectedUser?.phone}
                    placeholder="+91 98765 43210"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Step 2: Role Selection */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="2" size="small" color="primary" />
                  Select Role (Quick Assignment)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Type to enter your own role or choose from suggestions below
                </Typography>
                <Autocomplete
                  freeSolo
                  options={[
                    { value: 'super_admin', label: 'Super Admin', icon: '🔓', desc: 'Full system access' },
                    { value: 'platform_admin', label: 'Platform Admin', icon: '👨‍💼', desc: 'Tenants, users & operations' },
                    { value: 'finance_manager', label: 'Finance Manager', icon: '💰', desc: 'Revenue, payments, billing' },
                    { value: 'operations_manager', label: 'Operations Manager', icon: '🎯', desc: 'CRM, tickets, messaging' },
                    { value: 'support_agent', label: 'Support Agent', icon: '🎫', desc: 'Tickets & customer support' },
                    { value: 'content_manager', label: 'Content Manager', icon: '📝', desc: 'Templates & messaging' },
                    { value: 'analytics_specialist', label: 'Analytics Specialist', icon: '📊', desc: 'Reports & analytics' },
                    { value: 'billing_specialist', label: 'Billing Specialist', icon: '💳', desc: 'Payments & invoices' },
                    { value: 'student_support', label: 'Student Support', icon: '🎓', desc: 'Student management' },
                    { value: 'marketing_manager', label: 'Marketing Manager', icon: '📢', desc: 'CRM & campaigns' },
                    { value: 'read_only', label: 'Read Only', icon: '👁️', desc: 'View-only access' },
                  ]}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.label;
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{option.icon}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.desc}</Typography>
                      </Box>
                    </Box>
                  )}
                  value={customRoleName || selectedUser?.role || ''}
                  onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                      setCustomRoleName(newValue);
                    } else if (newValue) {
                      setCustomRoleName(newValue.label);
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    setCustomRoleName(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Role Name"
                      placeholder="Type custom role or select from suggestions..."
                      required
                      helperText="Type your own role (e.g., 'Senior QA Engineer') or select from predefined roles"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <Box sx={{ ml: 1, mr: 0.5 }}>
                            <Typography>🏷️</Typography>
                          </Box>
                        ),
                      }}
                    />
                  )}
                />

                {/* Team Assignment */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Assign to Team (Optional)</InputLabel>
                  <Select defaultValue={selectedUser?.team || ''} label="Assign to Team (Optional)">
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">No Team</Typography>
                    </MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Group fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{team.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {team.memberCount} members • {team.departments?.join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              {/* Step 3: Hierarchical Permissions (Multi-Select: Departments → Modules → Tabs) */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="3" size="small" color="primary" />
                  Configure Permissions (Multi-Select: Departments → Modules → Tabs)
                  <Chip label="Required" size="small" color="error" />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select multiple departments, modules, and tabs with CRUD permissions
                </Typography>

                {/* 3a: Select Multiple Departments */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="3a" size="small" variant="outlined" />
                  Select Departments (Multiple)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {Object.entries(permissionHierarchy).map(([key, dept]: [string, any]) => (
                    <Chip
                      key={key}
                      label={`${dept.icon} ${dept.name}`}
                      onClick={() => {
                        if (userDepartments.includes(key)) {
                          setUserDepartments(userDepartments.filter(d => d !== key));
                        } else {
                          setUserDepartments([...userDepartments, key]);
                        }
                      }}
                      color={userDepartments.includes(key) ? dept.color : 'default'}
                      variant={userDepartments.includes(key) ? 'filled' : 'outlined'}
                      size="medium"
                      icon={userDepartments.includes(key) ? <CheckCircle fontSize="small" /> : undefined}
                    />
                  ))}
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Selected:</strong> {userDepartments.length} department(s) • Click departments above to select/deselect
                  </Typography>
                </Alert>

                {/* 3b: Select Modules from Selected Departments */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="3b" size="small" variant="outlined" />
                  Choose Modules & Configure Tabs (Multiple)
                </Typography>
                
                <Box sx={{ maxHeight: 400, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'grey.50' }}>
                  {userDepartments.map((deptKey) => {
                    const dept = permissionHierarchy[deptKey as keyof typeof permissionHierarchy];
                    return (
                      <Box key={deptKey} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography>{dept.icon}</Typography>
                          {dept.name}
                          <Chip label={`${Object.keys(dept.modules).length} modules`} size="small" color={dept.color as any} />
                        </Typography>
                        
                        {Object.entries(dept.modules).map(([moduleKey, moduleData]: [string, any]) => {
                          const fullModuleKey = `${deptKey}_${moduleKey}`;
                          const isExpanded = userExpandedModules.includes(fullModuleKey);
                          return (
                            <Box key={fullModuleKey} sx={{ mb: 1, ml: 2 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 1.5,
                                  bgcolor: 'background.paper',
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                  border: 1,
                                  borderColor: isExpanded ? 'primary.main' : 'divider',
                                  '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' }
                                }}
                                onClick={() => {
                                  if (isExpanded) {
                                    setUserExpandedModules(userExpandedModules.filter(m => m !== fullModuleKey));
                                  } else {
                                    setUserExpandedModules([...userExpandedModules, fullModuleKey]);
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Checkbox checked={isExpanded} color="primary" size="small" />
                                  <Typography>{moduleData.icon}</Typography>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">{moduleData.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {moduleData.tabs.length} tabs available
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton size="small">
                                  {isExpanded ? <ExpandMore /> : <ExpandMore sx={{ transform: 'rotate(-90deg)' }} />}
                                </IconButton>
                              </Box>

                              {/* 3c: Tab-Level Permissions */}
                              {isExpanded && (
                                <Box sx={{ mt: 1, ml: 4, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'primary.light' }}>
                                  <Typography variant="caption" fontWeight="bold" gutterBottom display="block" sx={{ mb: 1, color: 'primary.main' }}>
                                    ✓ Configure permissions for each tab (View/Create/Edit/Delete)
                                  </Typography>
                                  {moduleData.tabs.map((tab: any, index: number) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: index < moduleData.tabs.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                                      <Typography variant="caption" fontWeight="medium">{tab.name}</Typography>
                                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        <Tooltip title="View"><Switch defaultChecked={tab.view} color="primary" size="small" /></Tooltip>
                                        <Tooltip title="Create"><Switch defaultChecked={tab.create} color="success" size="small" /></Tooltip>
                                        <Tooltip title="Edit"><Switch defaultChecked={tab.edit} color="warning" size="small" /></Tooltip>
                                        <Tooltip title="Delete"><Switch defaultChecked={tab.delete} color="error" size="small" /></Tooltip>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>

                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Modules Selected:</strong> {userExpandedModules.length} module(s) from {userDepartments.length} department(s)
                  </Typography>
                </Alert>
              </Box>

              <Divider />

              {/* Step 4: Additional Settings */}
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="4" size="small" color="primary" />
                  Additional Settings
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Switch defaultChecked={selectedUser?.status === 'active'} />}
                    label="Active Status"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked={false} />}
                    label="Send Welcome Email"
                  />

                  <FormControlLabel
                    control={<Switch defaultChecked={true} />}
                    label="Require Password Change on First Login"
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setSelectedUser(null);
            setCustomRoleName('');
            setUserDepartments(['management']);
            setUserExpandedModules([]);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
          >
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Create New Team</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Teams allow you to group admin users with similar responsibilities and assign permissions collectively
              </Typography>
            </Alert>

            <Stack spacing={3}>
              <TextField 
                label="Team Name" 
                required 
                fullWidth 
                placeholder="e.g., Support Team" 
              />
              
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                placeholder="Describe team's responsibilities and objectives..."
              />

              <Divider />

              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Team Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose a template to auto-configure team permissions
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                  { name: 'Finance Team', icon: '💰', perms: 'Revenue, Payments, Credits', color: 'success' },
                  { name: 'Support Team', icon: '🎫', perms: 'Tickets, Students, Messaging', color: 'info' },
                  { name: 'Operations Team', icon: '🎯', perms: 'CRM, Templates, Attendance', color: 'primary' },
                  { name: 'Marketing Team', icon: '📢', perms: 'CRM, Campaigns, Referrals', color: 'warning' },
                  { name: 'Analytics Team', icon: '📊', perms: 'Analytics, Reports (View)', color: 'secondary' },
                  { name: 'Custom Team', icon: '⚙️', perms: 'Configure manually', color: 'default' },
                ].map((template) => (
                  <Card
                    key={template.name}
                    sx={{
                      cursor: 'pointer',
                      border: 2,
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: `${template.color}.main`,
                        bgcolor: `${template.color}.50`
                      }
                    }}
                    onClick={() => alert(`Applied "${template.name}" template\nPermissions: ${template.perms}`)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>{template.icon}</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {template.perms}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Divider />

              <Typography variant="subtitle2" fontWeight="bold">
                Module Permissions
              </Typography>
              <FormGroup>
                {allPermissions.slice(0, 8).map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={<Checkbox />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{perm.name}</Typography>
                        <Chip label="Module" size="small" variant="outlined" />
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              dispatch(showSuccess('Team created successfully'));
              setTeamDialogOpen(false);
            }}
          >
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Permissions - {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Grant specific module permissions to this admin user
            </Alert>
            <FormGroup>
              {allPermissions.map((perm) => (
                <FormControlLabel
                  key={perm.id}
                  control={<Checkbox defaultChecked={Math.random() > 0.5} />}
                  label={perm.name}
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              dispatch(showSuccess('Permissions updated successfully'));
              setPermissionDialogOpen(false);
              setSelectedUser(null);
            }}
          >
            Update Permissions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Role Dialog */}
      <Dialog open={createRoleOpen} onClose={() => setCreateRoleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              placeholder="e.g., Finance Manager"
              defaultValue={selectedRole?.name}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              placeholder="Brief description of this role's responsibilities..."
              multiline
              rows={3}
              defaultValue={selectedRole?.description}
              sx={{ mb: 3 }}
              required
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Role Templates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose a template to auto-configure permissions, or select Custom to build your own
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
              {[
                { 
                  name: 'Super Admin', 
                  desc: 'Full system access - All modules', 
                  icon: '🔓', 
                  color: 'error',
                  permissions: 'View, Create, Edit, Delete (All 19 modules)',
                  count: 76
                },
                { 
                  name: 'Platform Admin', 
                  desc: 'Manage tenants, users & operations', 
                  icon: '👨‍💼', 
                  color: 'primary',
                  permissions: 'Tenants, Users, Students, CRM, Analytics',
                  count: 42
                },
                { 
                  name: 'Finance Manager', 
                  desc: 'Revenue, payments, billing, credits', 
                  icon: '💰', 
                  color: 'success',
                  permissions: 'Revenue, Payments, Credits, Subscriptions',
                  count: 28
                },
                { 
                  name: 'Operations Manager', 
                  desc: 'CRM, tickets, messaging, templates', 
                  icon: '🎯', 
                  color: 'info',
                  permissions: 'CRM, Tickets, Messaging, Templates, Students',
                  count: 35
                },
                { 
                  name: 'Support Agent', 
                  desc: 'Tickets, students, messaging only', 
                  icon: '🎫', 
                  color: 'warning',
                  permissions: 'Tickets (All), Students (View, Edit), Messaging',
                  count: 18
                },
                { 
                  name: 'Content Manager', 
                  desc: 'Templates, messaging, marketing', 
                  icon: '📝', 
                  color: 'secondary',
                  permissions: 'Templates (All), Messaging, Marketing',
                  count: 12
                },
                { 
                  name: 'Analytics Specialist', 
                  desc: 'View reports, analytics, dashboard', 
                  icon: '📊', 
                  color: 'info',
                  permissions: 'Analytics, Reports, Dashboard (View only)',
                  count: 8
                },
                { 
                  name: 'Billing Specialist', 
                  desc: 'Payments, invoices, refunds only', 
                  icon: '💳', 
                  color: 'success',
                  permissions: 'Payments (View, Edit), Revenue (View)',
                  count: 6
                },
                { 
                  name: 'Student Support', 
                  desc: 'Student management & attendance', 
                  icon: '🎓', 
                  color: 'primary',
                  permissions: 'Students (All), Attendance (View, Edit)',
                  count: 16
                },
                { 
                  name: 'Marketing Manager', 
                  desc: 'CRM, campaigns, referrals', 
                  icon: '📢', 
                  color: 'warning',
                  permissions: 'CRM (All), Templates, Messaging, Referrals',
                  count: 24
                },
                { 
                  name: 'Compliance Officer', 
                  desc: 'Audit logs, security, compliance', 
                  icon: '🔐', 
                  color: 'error',
                  permissions: 'Audit Logs, Compliance, Security Settings',
                  count: 10
                },
                { 
                  name: 'Read Only', 
                  desc: 'View-only access to all modules', 
                  icon: '👁️', 
                  color: 'default',
                  permissions: 'View only (All modules)',
                  count: 19
                },
                { 
                  name: 'Custom Role', 
                  desc: 'Build your own permission set', 
                  icon: '⚙️', 
                  color: 'secondary',
                  permissions: 'Configure manually in permission matrix',
                  count: 0,
                  isCustom: true
                },
              ].map((template: any) => (
                <Card 
                  key={template.name} 
                  sx={{ 
                    cursor: 'pointer', 
                    border: 2, 
                    borderColor: customRoleMode && template.isCustom ? 'secondary.main' : 'divider',
                    bgcolor: customRoleMode && template.isCustom ? 'secondary.50' : 'background.paper',
                    '&:hover': { 
                      borderColor: `${template.color}.main`, 
                      bgcolor: `${template.color}.50`,
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    if (template.isCustom) {
                      setCustomRoleMode(true);
                    } else {
                      setCustomRoleMode(false);
                      alert(`Applied "${template.name}" template\n\nPermissions: ${template.permissions}\nTotal: ${template.count} permissions configured`);
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h3">{template.icon}</Typography>
                      {template.count > 0 && (
                        <Chip label={`${template.count} perms`} size="small" color={template.color as any} />
                      )}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {template.desc}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="primary" sx={{ fontSize: '0.7rem' }}>
                      {template.permissions}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Specialized Roles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Additional role templates for specific use cases
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
              {[
                { name: 'Revenue Analyst', icon: '💹', perms: 8, desc: 'Revenue analytics only' },
                { name: 'Credit Manager', icon: '💸', perms: 12, desc: 'Credit & reseller management' },
                { name: 'Subscription Admin', icon: '📋', perms: 16, desc: 'Plans & subscriptions' },
                { name: 'Attendance Monitor', icon: '📅', perms: 6, desc: 'Attendance tracking only' },
                { name: 'Referral Manager', icon: '🎁', perms: 10, desc: 'Referrals & loyalty program' },
                { name: 'Security Admin', icon: '🛡️', perms: 14, desc: 'System security & compliance' },
                { name: 'API Manager', icon: '🔌', perms: 8, desc: 'Developer API & integrations' },
                { name: 'Report Generator', icon: '📈', perms: 5, desc: 'Reports & exports only' },
              ].map((role) => (
                <Card 
                  key={role.name}
                  sx={{ 
                    cursor: 'pointer',
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                  }}
                  onClick={() => alert(`Applied "${role.name}" role\n${role.desc}\n${role.perms} permissions`)}
                >
                  <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 0.5 }}>{role.icon}</Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ display: 'block' }}>
                      {role.name}
                    </Typography>
                    <Chip label={`${role.perms}p`} size="small" sx={{ mt: 0.5 }} />
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Custom Role Configurator */}
            {customRoleMode && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>✨ Custom Role Mode Active</strong>
                    <br />
                    Build your role from scratch by selecting departments → modules → tab permissions below.
                  </Typography>
                </Alert>

                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚙️ Custom Permission Configuration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Systematic permission configuration: Select department → Choose modules → Configure tab-level permissions
                </Typography>

                {/* Select Department */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="1" size="small" variant="outlined" color="secondary" />
                  Select Department(s)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {Object.entries(permissionHierarchy).map(([key, dept]: [string, any]) => (
                    <Chip
                      key={key}
                      label={`${dept.icon} ${dept.name}`}
                      onClick={() => setCustomRoleDepartment(key)}
                      color={customRoleDepartment === key ? dept.color : 'default'}
                      variant={customRoleDepartment === key ? 'filled' : 'outlined'}
                      size="medium"
                    />
                  ))}
                </Box>

                {/* Select Modules */}
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="2" size="small" variant="outlined" color="secondary" />
                  Choose Modules from <strong>{permissionHierarchy[customRoleDepartment as keyof typeof permissionHierarchy].name}</strong>
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'grey.50' }}>
                  {Object.entries(permissionHierarchy[customRoleDepartment as keyof typeof permissionHierarchy].modules).map(([moduleKey, moduleData]: [string, any]) => {
                    const isExpanded = customRoleModules.includes(moduleKey);
                    return (
                      <Box key={moduleKey} sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: 1,
                            borderColor: isExpanded ? 'secondary.main' : 'divider',
                            '&:hover': { bgcolor: 'grey.100' }
                          }}
                          onClick={() => {
                            if (isExpanded) {
                              setCustomRoleModules(customRoleModules.filter(m => m !== moduleKey));
                            } else {
                              setCustomRoleModules([...customRoleModules, moduleKey]);
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox checked={isExpanded} color="secondary" />
                            <Typography>{moduleData.icon}</Typography>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{moduleData.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {moduleData.tabs.length} tabs available
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton size="small">
                            {isExpanded ? <ExpandMore /> : <ExpandMore sx={{ transform: 'rotate(-90deg)' }} />}
                          </IconButton>
                        </Box>

                        {/* Tab-Level Permissions */}
                        {isExpanded && (
                          <Box sx={{ mt: 1, ml: 4, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'secondary.light' }}>
                            <Typography variant="caption" fontWeight="bold" gutterBottom display="block" sx={{ mb: 1, color: 'secondary.main' }}>
                              ✓ Configure permissions for each tab (View/Create/Edit/Delete)
                            </Typography>
                            {moduleData.tabs.map((tab: any, index: number) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: index < moduleData.tabs.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                                <Typography variant="caption" fontWeight="medium">{tab.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  <Tooltip title="View"><Switch defaultChecked={tab.view} color="primary" size="small" /></Tooltip>
                                  <Tooltip title="Create"><Switch defaultChecked={tab.create} color="success" size="small" /></Tooltip>
                                  <Tooltip title="Edit"><Switch defaultChecked={tab.edit} color="warning" size="small" /></Tooltip>
                                  <Tooltip title="Delete"><Switch defaultChecked={tab.delete} color="error" size="small" /></Tooltip>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Modules Selected:</strong> {customRoleModules.length} module(s) from {permissionHierarchy[customRoleDepartment as keyof typeof permissionHierarchy].name}
                  </Typography>
                </Alert>
              </>
            )}

            {!customRoleMode && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  💡 <strong>Tip:</strong> After creating the role, go to the "Roles & Permissions" tab to fine-tune detailed permissions.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          {customRoleMode && (
            <Button 
              onClick={() => setCustomRoleMode(false)}
              color="secondary"
              sx={{ mr: 'auto' }}
            >
              ← Back to Templates
            </Button>
          )}
          <Button onClick={() => {
            setCreateRoleOpen(false);
            setSelectedRole(null);
            setCustomRoleMode(false);
            setCustomRoleModules([]);
          }}>
            Cancel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleSaveRole}>
            {selectedRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersEnhanced;

