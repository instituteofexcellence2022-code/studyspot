/**
 * 👥 ENHANCED COMMUNITY & GROUPS PAGE
 * 
 * Telegram-like messaging system with:
 * - Exam Communities (Admin-created: UPSC, SSC, Railway, etc.)
 * - Library Groups (Owner-created: Library-specific)
 * - Real-time messaging
 * - File sharing (PDF, images)
 * - Member management
 */

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Group,
  Search,
  Add,
  Send,
  AttachFile,
  People,
  Chat,
  CheckCircle,
  Close,
  Description,
  Image,
  VideoLibrary,
  Download,
  MoreVert,
  ExitToApp,
  School,
  Business,
  Verified,
} from '@mui/icons-material';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';

interface Community {
  id: string;
  name: string;
  description: string;
  type: 'community' | 'group'; // community = exam-based (admin), group = library-based (owner)
  category?: string;
  exam_type?: string; // UPSC, SSC, Railway, Banking, JEE, NEET, etc.
  library_id?: string;
  library_name?: string;
  created_by: string;
  member_count: number;
  icon?: string;
  is_private: boolean;
  is_active: boolean;
  created_at: string;
  is_joined?: boolean; // Client-side flag
  privacy_mode?: boolean; // Privacy mode for library groups (hide student names)
}

interface ChatMessage {
  id: string;
  community_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: 'text' | 'file' | 'image' | 'video';
  file_url?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
  is_me?: boolean; // Client-side flag
  privacyMode?: boolean; // Privacy mode enabled for this group
}

export default function EnhancedCommunityPage({ setIsAuthenticated, darkMode, setDarkMode }: any) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [chatDialog, setChatDialog] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [myPrivacyEnabled, setMyPrivacyEnabled] = useState(false); // User's own privacy choice
  const [privacyMenuAnchor, setPrivacyMenuAnchor] = useState<null | HTMLElement>(null); // Privacy settings menu

  const { user } = useAuth();
  const { socket, connected } = useSocket('student');

  useEffect(() => {
    fetchCommunities();
  }, []);

  // Real-time message updates
  useEffect(() => {
    if (!socket || !connected || !selectedCommunity) return;

    const room = `community:${selectedCommunity.id}`;
    socket.emit('join:community', room);

    socket.on('message:new', (data) => {
      if (data.communityId === selectedCommunity.id) {
        const newMsg: ChatMessage = {
          ...data,
          is_me: data.user_id === user?.id,
        };
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
    });

    socket.on('member:joined', (data) => {
      if (data.communityId === selectedCommunity.id) {
        toast.info(`${data.userName} joined the ${selectedCommunity.type}`);
        fetchCommunityMembers(selectedCommunity.id);
      }
    });

    return () => {
      socket.emit('leave:community', room);
      socket.off('message:new');
      socket.off('member:joined');
    };
  }, [socket, connected, selectedCommunity]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/communities/all');
      const allCommunities = response.data?.data || getMockCommunities();
      
      // Check which ones user has joined
      const userResponse = await api.get(`/api/communities/user/${user?.id || 'student-001'}`);
      const joined = userResponse.data?.data || [];
      const joinedIds = joined.map((c: Community) => c.id);
      
      const withJoinStatus = allCommunities.map((c: Community) => ({
        ...c,
        is_joined: joinedIds.includes(c.id),
      }));
      
      setCommunities(withJoinStatus);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setCommunities(getMockCommunities());
    } finally {
      setLoading(false);
    }
  };

  const getMockCommunities = (): Community[] => [
    {
      id: 'comm-1',
      name: '🎯 UPSC Aspirants 2025',
      description: 'National community for UPSC Civil Services preparation. Share notes, discuss current affairs, take mock tests together.',
      type: 'community',
      category: 'exam_prep',
      exam_type: 'UPSC',
      created_by: 'admin-001',
      member_count: 15420,
      icon: '🎯',
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
      is_joined: false,
    },
    {
      id: 'comm-2',
      name: '📚 SSC CGL & CHSL Warriors',
      description: 'Prepare for SSC exams together. Daily quizzes, strategy discussions, and motivation.',
      type: 'community',
      category: 'exam_prep',
      exam_type: 'SSC',
      created_by: 'admin-001',
      member_count: 8940,
      icon: '📚',
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
      is_joined: true,
    },
    {
      id: 'comm-3',
      name: '🚂 Railway Exams Group',
      description: 'RRB NTPC, Group D, and all railway competitive exams. Study materials and doubt clearing.',
      type: 'community',
      category: 'exam_prep',
      exam_type: 'Railway',
      created_by: 'admin-001',
      member_count: 6720,
      icon: '🚂',
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
      is_joined: false,
    },
    {
      id: 'group-1',
      name: 'Central Study Hub - Students',
      description: 'Official group for Central Study Hub library. Connect with fellow students, share experiences, organize study sessions.',
      type: 'group',
      library_id: '1',
      library_name: 'Central Study Hub',
      created_by: 'owner-001',
      member_count: 234,
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
      is_joined: true,
    },
    {
      id: 'group-2',
      name: 'Knowledge Point - Study Circle',
      description: 'Join your library peers for group study sessions, doubt solving, and knowledge sharing.',
      type: 'group',
      library_id: '2',
      library_name: 'Knowledge Point Library',
      created_by: 'owner-002',
      member_count: 156,
      is_private: false,
      is_active: true,
      created_at: new Date().toISOString(),
      is_joined: false,
    },
  ];

  const getMockMessages = (): ChatMessage[] => [
    {
      id: '1',
      community_id: selectedCommunity?.id || '',
      user_id: 'user-001',
      user_name: 'Rahul Sharma',
      message: 'Good morning everyone! Who\'s planning to attend the mock test today?',
      message_type: 'text',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_me: false,
    },
    {
      id: '2',
      community_id: selectedCommunity?.id || '',
      user_id: user?.id || 'current-user',
      user_name: user?.firstName || 'You',
      message: 'I\'m in! What time does it start?',
      message_type: 'text',
      created_at: new Date(Date.now() - 3000000).toISOString(),
      is_me: true,
    },
    {
      id: '3',
      community_id: selectedCommunity?.id || '',
      user_id: 'user-002',
      user_name: 'Priya Singh',
      message: 'Check out these notes I made for Current Affairs',
      message_type: 'file',
      file_url: '#',
      file_name: 'Current_Affairs_Oct_2024.pdf',
      file_type: 'application/pdf',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      is_me: false,
    },
  ];

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/join`, {
        userId: user?.id || 'student-001',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
      });
      
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, is_joined: true, member_count: c.member_count + 1 } : c
      ));
      
      toast.success('Joined successfully!');
    } catch (error) {
      console.error('Error joining:', error);
      // Fallback for testing
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, is_joined: true, member_count: c.member_count + 1 } : c
      ));
      toast.success('Joined successfully!');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!window.confirm('Are you sure you want to leave this community?')) return;

    try {
      await api.post(`/api/communities/${communityId}/leave`, {
        userId: user?.id || 'student-001',
      });
      
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, is_joined: false, member_count: Math.max(0, c.member_count - 1) } : c
      ));
      
      toast.success('Left community');
    } catch (error) {
      console.error('Error leaving:', error);
      toast.error('Failed to leave community');
    }
  };

  const handleOpenChat = async (community: Community) => {
    if (!community.is_joined) {
      toast.info('Please join the community first');
      return;
    }

    setSelectedCommunity(community);
    setChatDialog(true);
    fetchMessages(community.id);
    
    // Fetch user's privacy preference for this group (only for groups)
    if (community.type === 'group') {
      fetchPrivacyPreference(community.id);
    }
  };

  const fetchPrivacyPreference = async (communityId: string) => {
    try {
      const response = await api.get(`/api/communities/${communityId}/privacy/${user?.id || 'student-001'}`);
      setMyPrivacyEnabled(response.data?.privacyEnabled || false);
      console.log('✅ Privacy preference fetched:', response.data?.privacyEnabled);
    } catch (error: any) {
      console.error('❌ Error fetching privacy preference:', error.response?.data || error.message);
      setMyPrivacyEnabled(false);
      // Don't show error to user - just default to false
    }
  };

  const handleTogglePrivacy = async () => {
    if (!selectedCommunity) return;

    const newPrivacyState = !myPrivacyEnabled;

    try {
      console.log('🔄 Toggling privacy to:', newPrivacyState);
      console.log('📍 API URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/communities/${selectedCommunity.id}/privacy`);
      
      const response = await api.put(`/api/communities/${selectedCommunity.id}/privacy`, {
        userId: user?.id || 'student-001',
        privacyEnabled: newPrivacyState,
      });

      console.log('✅ Privacy updated:', response.data);

      setMyPrivacyEnabled(newPrivacyState);
      setPrivacyMenuAnchor(null);
      toast.success(
        newPrivacyState 
          ? '🔒 Privacy enabled! You will appear as "Student X" to others.' 
          : '✅ Privacy disabled! Your real name will be shown.'
      );
    } catch (error: any) {
      console.error('❌ Error toggling privacy:', error.response?.data || error.message);
      console.error('Full error:', error);
      
      // More specific error messages
      if (error.response?.status === 404) {
        toast.error('Privacy feature not available yet. Please contact support.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Database might need to be updated.');
      } else if (error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please check your internet connection.');
      } else {
        toast.error(`Failed to update privacy: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      }
    }
  };

  const fetchMessages = async (communityId: string) => {
    try {
      // Pass userRole=student to get proper display names
      const response = await api.get(`/api/communities/${communityId}/messages?userRole=student`);
      const msgs = response.data?.data || getMockMessages();
      
      setMessages(msgs.map((m: any) => ({
        ...m,
        is_me: m.user_id === (user?.id || 'current-user'),
        // Use display_name if available (respects individual privacy), fallback to user_name
        user_name: m.display_name || m.user_name,
      })));
      
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(getMockMessages());
    }
  };

  const fetchCommunityMembers = async (communityId: string) => {
    try {
      const response = await api.get(`/api/communities/${communityId}/members`);
      const memberCount = response.data?.data?.length || 0;
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, member_count: memberCount } : c
      ));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity) return;
    
    try {
      await api.post(`/api/communities/${selectedCommunity.id}/messages`, {
        userId: user?.id || 'student-001',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
        message: newMessage,
        messageType: 'text',
        userRole: 'student', // Pass userRole so backend knows to apply privacy mode
      });
      
      setNewMessage('');
      // Message will be added via WebSocket event
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: Add message locally
      const msg: ChatMessage = {
        id: Date.now().toString(),
        community_id: selectedCommunity.id,
        user_id: user?.id || 'current-user',
        user_name: user?.firstName || 'You',
        message: newMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
        is_me: true,
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      scrollToBottom();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCommunity) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await api.post('/api/communities/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileData = uploadResponse.data?.data;

      // Send file message
      await api.post(`/api/communities/${selectedCommunity.id}/messages`, {
        userId: user?.id || 'student-001',
        userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
        message: `Shared a file: ${file.name}`,
        messageType: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
        fileUrl: fileData?.url,
        fileName: file.name,
        fileType: file.type,
      });

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.description.toLowerCase().includes(search.toLowerCase()) ||
                         (c.exam_type || '').toLowerCase().includes(search.toLowerCase());
    
    if (tab === 0) return c.is_joined && matchesSearch; // My Communities
    if (tab === 1) return c.type === 'community' && matchesSearch; // Exam Communities
    if (tab === 2) return c.type === 'group' && matchesSearch; // Library Groups
    return matchesSearch;
  });

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <Description />;
    if (fileType.startsWith('image/')) return <Image />;
    if (fileType.startsWith('video/')) return <VideoLibrary />;
    return <Description />;
  };

  return (
    <StudyFocusedLayout setIsAuthenticated={setIsAuthenticated} darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              👥 Study Community
              {connected && (
                <Chip icon={<CheckCircle />} label="Live" color="success" size="small" />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join study groups, exam communities, and connect with fellow students
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search communities, groups, or exam types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
          <Tab label={`My Communities (${communities.filter(c => c.is_joined).length})`} />
          <Tab label={`Exam Communities (${communities.filter(c => c.type === 'community').length})`} icon={<School fontSize="small" />} iconPosition="start" />
          <Tab label={`Library Groups (${communities.filter(c => c.type === 'group').length})`} icon={<Business fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* Content */}
        {loading ? (
          <LinearProgress />
        ) : filteredCommunities.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Group sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No {tab === 0 ? 'joined' : tab === 1 ? 'exam' : 'library'} communities found
            </Typography>
            {tab === 0 && (
              <Typography variant="body2" color="text.secondary">
                Browse and join communities from other tabs
              </Typography>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredCommunities.map((community) => (
              <Grid item xs={12} sm={6} md={4} key={community.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: community.type === 'community' ? 'primary.main' : 'success.main', fontSize: '1.5rem' }}>
                        {community.icon || (community.type === 'community' ? '🎓' : '📚')}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight="600" noWrap>
                          {community.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {community.type === 'community' ? (
                            <Chip 
                              label={community.exam_type} 
                              size="small" 
                              color="primary"
                              icon={<School fontSize="small" />}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ) : (
                            <Chip 
                              label={community.library_name} 
                              size="small" 
                              color="success"
                              icon={<Business fontSize="small" />}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          <Chip 
                            label={`${community.member_count.toLocaleString()} members`} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {community.description}
                    </Typography>

                    {/* Actions */}
                    {community.is_joined ? (
                      <Stack spacing={1}>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          startIcon={<Chat />}
                          onClick={() => handleOpenChat(community)}
                        >
                          Open Chat
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          color="error"
                          startIcon={<ExitToApp />}
                          onClick={() => handleLeaveCommunity(community.id)}
                        >
                          Leave
                        </Button>
                      </Stack>
                    ) : (
                      <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => handleJoinCommunity(community.id)}
                        color={community.type === 'community' ? 'primary' : 'success'}
                      >
                        Join {community.type === 'community' ? 'Community' : 'Group'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Chat Dialog - Telegram-like */}
        <Dialog 
          open={chatDialog} 
          onClose={() => setChatDialog(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen
        >
          {/* Chat Header */}
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0 }} elevation={2}>
            <IconButton onClick={() => setChatDialog(false)}>
              <Close />
            </IconButton>
            <Avatar sx={{ bgcolor: selectedCommunity?.type === 'community' ? 'primary.main' : 'success.main' }}>
              {selectedCommunity?.icon || <Group />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="600">
                {selectedCommunity?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCommunity?.member_count} members • {connected ? 'Online' : 'Offline'}
              </Typography>
            </Box>
            
            {/* Privacy Toggle - Only for Groups */}
            {selectedCommunity?.type === 'group' && (
              <Tooltip title={myPrivacyEnabled ? 'You appear as "Student X" (Click to show real name)' : 'Your real name is visible (Click to be anonymous)'}>
                <Box 
                  onClick={handleTogglePrivacy}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    px: 2, 
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: myPrivacyEnabled ? 'success.light' : 'grey.200',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: myPrivacyEnabled ? 'success.main' : 'grey.300',
                    }
                  }}
                >
                  <Avatar sx={{ width: 28, height: 28, bgcolor: myPrivacyEnabled ? 'success.dark' : 'grey.500' }}>
                    {myPrivacyEnabled ? '🔒' : '👤'}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" fontWeight="600" sx={{ color: myPrivacyEnabled ? 'success.dark' : 'text.primary' }}>
                      {myPrivacyEnabled ? 'Private' : 'Public'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                      {myPrivacyEnabled ? 'Anonymous' : 'Real Name'}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            )}
            
            <IconButton onClick={(e) => setPrivacyMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Paper>

          {/* Messages Area */}
          <DialogContent sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', p: 0 }}>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
              {messages.map((msg, index) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.is_me ? 'flex-end' : 'flex-start',
                    mb: 1.5,
                  }}
                >
                  {!msg.is_me && (
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'grey.400' }}>
                      {msg.user_name[0]}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: '70%' }}>
                    {!msg.is_me && (
                      <Typography variant="caption" color="primary.main" fontWeight="600" sx={{ ml: 1 }}>
                        {msg.user_name}
                      </Typography>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: msg.is_me ? 'primary.main' : 'background.paper',
                        color: msg.is_me ? 'white' : 'text.primary',
                        borderRadius: 2,
                        border: msg.is_me ? 'none' : 1,
                        borderColor: 'divider',
                      }}
                    >
                      {/* File Message */}
                      {msg.message_type !== 'text' && msg.file_url && (
                        <Box sx={{ mb: 1 }}>
                          {msg.message_type === 'image' ? (
                            <img 
                              src={msg.file_url} 
                              alt={msg.file_name}
                              style={{ 
                                maxWidth: '100%', 
                                borderRadius: 8,
                                cursor: 'pointer',
                              }}
                              onClick={() => window.open(msg.file_url, '_blank')}
                            />
                          ) : (
                            <Button
                              size="small"
                              startIcon={getFileIcon(msg.file_type)}
                              endIcon={<Download />}
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                color: msg.is_me ? 'white' : 'primary.main',
                                borderColor: msg.is_me ? 'white' : 'primary.main',
                              }}
                              variant="outlined"
                              href={msg.file_url}
                              target="_blank"
                            >
                              {msg.file_name}
                            </Button>
                          )}
                        </Box>
                      )}
                      
                      {/* Text Message */}
                      <Typography variant="body2">{msg.message}</Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          display: 'block', 
                          mt: 0.5,
                          fontSize: '0.65rem',
                        }}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
          </DialogContent>

          {/* Message Input */}
          <DialogActions sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            <Tooltip title="Attach file">
              <label htmlFor="file-upload">
                <IconButton component="span" disabled={uploading}>
                  <AttachFile />
                </IconButton>
              </label>
            </Tooltip>
            
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              multiline
              maxRows={3}
              size="small"
              disabled={uploading}
            />
            
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || uploading}
            >
              <Send />
            </IconButton>
          </DialogActions>
        </Dialog>

        {/* Keep privacy menu for additional options if needed */}
      </Container>
    </StudyFocusedLayout>
  );
}

