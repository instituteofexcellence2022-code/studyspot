/**
 * 👥 ENHANCED LIBRARY GROUPS MANAGEMENT
 * 
 * Comprehensive member management:
 * - Add students to groups
 * - Block/Unblock users
 * - Generate invite links
 * - Make admin/Remove admin
 * - View all members
 * - Search students
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Group,
  People,
  Chat,
  Delete,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Block,
  CheckCircle,
  Share,
  ContentCopy,
  Search,
  MoreVert,
  AdminPanelSettings,
  PersonRemove,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface LibraryGroup {
  id: string;
  name: string;
  description: string;
  library_id: string;
  member_count: number;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  role: 'admin' | 'member';
  joined_at: string;
  is_blocked?: boolean;
  block_reason?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export default function EnhancedLibraryGroupsPage() {
  const [groups, setGroups] = useState<LibraryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<LibraryGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [inviteLinkDialogOpen, setInviteLinkDialogOpen] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState(24); // hours
  const [memberTab, setMemberTab] = useState(0);
  
  // Menu
  const [menuAnchor, setMenuAnchor] = useState<{element: HTMLElement, member: Member} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const libraryId = localStorage.getItem('currentLibraryId') || '1';
      const response = await axios.get<{ success: boolean; data: LibraryGroup[] }>(`${API_BASE_URL}/api/groups/library/${libraryId}`);
      setGroups(response.data?.data || getMockGroups());
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups(getMockGroups());
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const response = await axios.get<{ success: boolean; data: Member[] }>(`${API_BASE_URL}/api/communities/${groupId}/members`);
      setMembers(response.data?.data || getMockMembers());
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers(getMockMembers());
    }
  };

  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setStudents([]);
      return;
    }

    try {
      const libraryId = localStorage.getItem('currentLibraryId') || '1';
      const response = await axios.get<{ success: boolean; data: Student[] }>(`${API_BASE_URL}/api/students/search?q=${query}&libraryId=${libraryId}`);
      setStudents(response.data?.data || getMockStudents());
    } catch (error) {
      console.error('Error searching students:', error);
      setStudents(getMockStudents());
    }
  };

  const getMockGroups = (): LibraryGroup[] => [
    {
      id: '1',
      name: 'Central Study Hub - Students',
      description: 'Official group for all Central Study Hub students',
      library_id: '1',
      member_count: 234,
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const getMockMembers = (): Member[] => [
    {
      id: '1',
      user_id: 'student-001',
      user_name: 'Rahul Sharma',
      role: 'admin',
      joined_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: '2',
      user_id: 'student-002',
      user_name: 'Priya Singh',
      role: 'member',
      joined_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: '3',
      user_id: 'student-003',
      user_name: 'Amit Kumar',
      role: 'member',
      joined_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      is_blocked: true,
      block_reason: 'Spam posting',
    },
  ];

  const getMockStudents = (): Student[] => [
    { id: 'student-004', first_name: 'Anjali', last_name: 'Verma', email: 'anjali@example.com', phone: '+91 98765 43210' },
    { id: 'student-005', first_name: 'Vikram', last_name: 'Patel', email: 'vikram@example.com', phone: '+91 98765 43211' },
  ];

  const handleCreateGroup = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const libraryId = localStorage.getItem('currentLibraryId') || '1';
      const ownerId = localStorage.getItem('userId') || 'owner-001';

      await axios.post(`${API_BASE_URL}/api/groups`, {
        name: formData.name,
        description: formData.description,
        libraryId,
        createdBy: ownerId,
        isPrivate: formData.isPrivate,
      });

      toast.success('Library group created successfully!');
      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', isPrivate: false });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleOpenMembersDialog = (group: LibraryGroup) => {
    setSelectedGroup(group);
    fetchMembers(group.id);
    setMembersDialogOpen(true);
  };

  const handleAddMember = async (studentId: string, studentName: string) => {
    if (!selectedGroup) return;

    try {
      const ownerId = localStorage.getItem('userId') || 'owner-001';
      
      await axios.post(`${API_BASE_URL}/api/communities/${selectedGroup.id}/add-member`, {
        userId: studentId,
        userName: studentName,
        addedBy: ownerId,
      });

      toast.success(`${studentName} added to group!`);
      setAddMemberDialogOpen(false);
      setSearchQuery('');
      setStudents([]);
      fetchMembers(selectedGroup.id);
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!selectedGroup) return;
    if (!window.confirm(`Remove ${userName} from this group?`)) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/communities/${selectedGroup.id}/members/${userId}`);
      toast.success('Member removed');
      fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    if (!selectedGroup) return;
    const reason = prompt(`Why are you blocking ${userName}?`);
    if (!reason) return;

    try {
      await axios.post(`${API_BASE_URL}/api/communities/${selectedGroup.id}/block/${userId}`, {
        reason,
      });
      toast.success(`${userName} blocked`);
      fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string, userName: string) => {
    if (!selectedGroup) return;

    try {
      await axios.post(`${API_BASE_URL}/api/communities/${selectedGroup.id}/unblock/${userId}`);
      toast.success(`${userName} unblocked`);
      fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleMakeAdmin = async (userId: string, userName: string) => {
    if (!selectedGroup) return;

    try {
      await axios.post(`${API_BASE_URL}/api/communities/${selectedGroup.id}/make-admin/${userId}`);
      toast.success(`${userName} is now an admin`);
      fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error('Error making admin:', error);
      toast.error('Failed to make admin');
    }
  };

  const handleRemoveAdmin = async (userId: string, userName: string) => {
    if (!selectedGroup) return;

    try {
      await axios.post(`${API_BASE_URL}/api/communities/${selectedGroup.id}/remove-admin/${userId}`);
      toast.success(`${userName} admin privileges removed`);
      fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  const handleGenerateInviteLink = async () => {
    if (!selectedGroup) return;

    try {
      const response = await axios.post<{ success: boolean; data: { inviteLink: string; expiresAt: string | null } }>(`${API_BASE_URL}/api/communities/${selectedGroup.id}/invite-link`, {
        expiresIn: inviteExpiry,
      });

      setInviteLink(response.data?.data?.inviteLink || '');
      toast.success('Invite link generated!');
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('Failed to generate invite link');
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  const activeMembers = members.filter(m => !m.is_blocked);
  const blockedMembers = members.filter(m => m.is_blocked);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            👥 Library Groups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create groups, manage members, and build your library community
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Group
        </Button>
      </Box>

      {/* Groups List */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          md: 'repeat(2, 1fr)', 
          lg: 'repeat(3, 1fr)' 
        }, 
        gap: 3 
      }}>
        {groups.map((group) => (
          <Card key={group.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <Group />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="600" noWrap>
                      {group.name}
                    </Typography>
                    <Chip 
                      label={`${group.member_count} members`} 
                      size="small"
                      icon={<People />}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                {group.description}
              </Typography>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={group.is_private ? 'Private' : 'Public'} 
                    size="small"
                    icon={group.is_private ? <VisibilityOff /> : <Visibility />}
                    color={group.is_private ? 'warning' : 'success'}
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                  <Chip 
                    label={group.is_active ? 'Active' : 'Inactive'} 
                    size="small"
                    color={group.is_active ? 'success' : 'default'}
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<People />}
                  onClick={() => handleOpenMembersDialog(group)}
                  fullWidth
                >
                  Manage Members
                </Button>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Share />}
                    onClick={() => {
                      setSelectedGroup(group);
                      setInviteLinkDialogOpen(true);
                    }}
                    fullWidth
                  >
                    Invite
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Chat />}
                    fullWidth
                  >
                    Chat
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Library Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a study group for your library students
          </Typography>

          <TextField
            fullWidth
            label="Group Name"
            placeholder="e.g., Central Study Hub - Students"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            placeholder="Describe the purpose of this group..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              />
            }
            label="Make this group private (invite-only)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateGroup}
            startIcon={<Add />}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members Management Dialog */}
      <Dialog 
        open={membersDialogOpen} 
        onClose={() => setMembersDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Group />
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedGroup?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage members and permissions
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setMembersDialogOpen(false)}>
              <Delete />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Actions */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setAddMemberDialogOpen(true)}
              fullWidth
            >
              Add Student
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={() => setInviteLinkDialogOpen(true)}
              fullWidth
            >
              Invite Link
            </Button>
          </Stack>

          {/* Tabs */}
          <Tabs value={memberTab} onChange={(e, v) => setMemberTab(v)} sx={{ mb: 2 }}>
            <Tab label={`Active (${activeMembers.length})`} />
            <Tab label={`Blocked (${blockedMembers.length})`} />
          </Tabs>

          {/* Members List */}
          <List>
            {(memberTab === 0 ? activeMembers : blockedMembers).map((member) => (
              <ListItem key={member.id} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: member.role === 'admin' ? 'primary.main' : 'grey.400' }}>
                    {member.user_name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="600">
                        {member.user_name}
                      </Typography>
                      {member.role === 'admin' && (
                        <Chip icon={<AdminPanelSettings />} label="Admin" size="small" color="primary" sx={{ height: 20 }} />
                      )}
                      {member.is_blocked && (
                        <Chip icon={<Block />} label="Blocked" size="small" color="error" sx={{ height: 20 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Joined: {new Date(member.joined_at).toLocaleDateString()}
                      </Typography>
                      {member.is_blocked && member.block_reason && (
                        <Typography variant="caption" color="error.main" display="block">
                          Reason: {member.block_reason}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={(e) => setMenuAnchor({ element: e.currentTarget, member })}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student to Group</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Search for students from your library and add them to the group
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchStudents(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            margin="normal"
          />

          {students.length > 0 && (
            <List sx={{ mt: 2 }}>
              {students.map((student) => (
                <ListItem key={student.id} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar>{student.first_name[0]}{student.last_name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${student.first_name} ${student.last_name}`}
                    secondary={student.email}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleAddMember(student.id, `${student.first_name} ${student.last_name}`)}
                  >
                    Add
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog open={inviteLinkDialogOpen} onClose={() => setInviteLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Invite Link</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this link with students to join the group
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Link Expiry (hours)"
            value={inviteExpiry}
            onChange={(e) => setInviteExpiry(Number(e.target.value))}
            margin="normal"
            helperText="Set to 0 for no expiry"
          />

          <Button
            fullWidth
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleGenerateInviteLink}
            sx={{ mt: 2, mb: 2 }}
          >
            Generate Link
          </Button>

          {inviteLink && (
            <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Invite Link:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={inviteLink}
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy link">
                  <IconButton onClick={handleCopyInviteLink} color="primary">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                Share this link via WhatsApp, Email, or SMS. Expires in {inviteExpiry} hours.
              </Alert>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteLinkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {menuAnchor?.member && !menuAnchor.member.is_blocked && (
          <>
            {menuAnchor.member.role === 'member' ? (
              <MenuItem onClick={() => {
                handleMakeAdmin(menuAnchor.member.user_id, menuAnchor.member.user_name);
                setMenuAnchor(null);
              }}>
                <AdminPanelSettings sx={{ mr: 1 }} fontSize="small" />
                Make Admin
              </MenuItem>
            ) : (
              <MenuItem onClick={() => {
                handleRemoveAdmin(menuAnchor.member.user_id, menuAnchor.member.user_name);
                setMenuAnchor(null);
              }}>
                <PersonRemove sx={{ mr: 1 }} fontSize="small" />
                Remove Admin
              </MenuItem>
            )}
            <MenuItem onClick={() => {
              handleBlockUser(menuAnchor.member.user_id, menuAnchor.member.user_name);
              setMenuAnchor(null);
            }}>
              <Block sx={{ mr: 1 }} fontSize="small" color="error" />
              Block User
            </MenuItem>
          </>
        )}
        {menuAnchor?.member && menuAnchor.member.is_blocked && (
          <MenuItem onClick={() => {
            handleUnblockUser(menuAnchor.member.user_id, menuAnchor.member.user_name);
            setMenuAnchor(null);
          }}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" color="success" />
            Unblock User
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => {
          if (menuAnchor?.member) {
            handleRemoveMember(menuAnchor.member.user_id, menuAnchor.member.user_name);
          }
          setMenuAnchor(null);
        }}>
          <PersonRemove sx={{ mr: 1 }} fontSize="small" color="error" />
          Remove from Group
        </MenuItem>
      </Menu>
    </Box>
  );
}

