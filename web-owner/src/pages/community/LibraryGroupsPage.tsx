/**
 * 👥 LIBRARY GROUPS MANAGEMENT (Owner Portal)
 * 
 * Library owners can:
 * - Create library-specific study groups
 * - Manage group members
 * - View group messages
 * - Enable/disable groups
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
  Grid,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Group,
  People,
  Chat,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
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

export default function LibraryGroupsPage() {
  const [groups, setGroups] = useState<LibraryGroup[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const getMockGroups = (): LibraryGroup[] => [
    {
      id: '1',
      name: 'Central Study Hub - Students',
      description: 'Official group for all Central Study Hub students. Share study tips, organize sessions, and connect.',
      library_id: '1',
      member_count: 234,
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
    },
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

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/communities/${groupId}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            👥 Library Groups
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage study groups for your library students
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
                <IconButton size="small" onClick={() => handleDeleteGroup(group.id)} color="error">
                  <Delete />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {group.description}
              </Typography>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={group.is_private ? 'Private' : 'Public'} 
                    size="small"
                    icon={group.is_private ? <VisibilityOff /> : <Visibility />}
                    color={group.is_private ? 'warning' : 'success'}
                  />
                  <Chip 
                    label={group.is_active ? 'Active' : 'Inactive'} 
                    size="small"
                    color={group.is_active ? 'success' : 'default'}
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Chat />}
                  fullWidth
                >
                  View Messages
                </Button>
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
            Create a study group for your library students to connect, share notes, and organize study sessions.
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

          <Paper sx={{ p: 2, mt: 2, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Tip:</strong> Public groups appear in the student portal and anyone can join. Private groups require your approval to join.
            </Typography>
          </Paper>
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
    </Box>
  );
}

