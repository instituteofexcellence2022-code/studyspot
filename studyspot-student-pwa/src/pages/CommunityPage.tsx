import { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
} from '@mui/material';
import {
  Group,
  Search,
  Add,
  Send,
  AttachFile,
  MoreVert,
  People,
  Book,
  Chat,
  Favorite,
  Comment,
  Share,
  ThumbUp,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface StudyGroup {
  id: string;
  name: string;
  category: string;
  members: number;
  description: string;
  isJoined: boolean;
  avatar?: string;
  lastActivity?: string;
}

interface Post {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  groupName: string;
  timestamp: string;
  likes: number;
  comments: number;
  attachments?: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}

export default function CommunityPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [chatDialog, setChatDialog] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [postDialog, setPostDialog] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', attachments: [] });

  useEffect(() => {
    fetchGroups();
    fetchPosts();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/api/study-groups');
      setGroups(response.data.data || mockGroups);
    } catch (error) {
      setGroups(mockGroups);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/api/study-groups/posts');
      setPosts(response.data.data || mockPosts);
    } catch (error) {
      setPosts(mockPosts);
    }
  };

  const mockGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'UPSC 2025 Aspirants',
      category: 'UPSC',
      members: 1250,
      description: 'Join fellow UPSC aspirants for discussions, notes sharing, and motivation',
      isJoined: true,
      lastActivity: '5 min ago',
    },
    {
      id: '2',
      name: 'JEE Main & Advanced',
      category: 'JEE',
      members: 2340,
      description: 'IIT JEE preparation - solve doubts, share tricks, practice together',
      isJoined: true,
      lastActivity: '15 min ago',
    },
    {
      id: '3',
      name: 'NEET UG 2025',
      category: 'NEET',
      members: 1890,
      description: 'Medical entrance preparation group - Biology, Chemistry, Physics',
      isJoined: false,
      lastActivity: '1 hour ago',
    },
    {
      id: '4',
      name: 'SSC CGL Preparation',
      category: 'SSC',
      members: 980,
      description: 'SSC Combined Graduate Level exam preparation and discussion',
      isJoined: false,
    },
    {
      id: '5',
      name: 'Banking & Insurance Exams',
      category: 'Banking',
      members: 750,
      description: 'Prepare for IBPS, SBI, RBI, and insurance exams together',
      isJoined: false,
    },
  ];

  const mockPosts: Post[] = [
    {
      id: '1',
      author: 'Rahul Sharma',
      content: 'Just completed a mock test! Scored 85%. Sharing my approach for Prelims preparation. Focus on current affairs and practice daily.',
      groupName: 'UPSC 2025 Aspirants',
      timestamp: '2024-11-03T10:30:00Z',
      likes: 45,
      comments: 12,
    },
    {
      id: '2',
      author: 'Priya Singh',
      content: 'Looking for Physics study partner for evening sessions. Anyone interested? We can solve numericals together.',
      groupName: 'JEE Main & Advanced',
      timestamp: '2024-11-03T09:00:00Z',
      likes: 23,
      comments: 8,
      attachments: ['Physics_Chapter5_Notes.pdf'],
    },
    {
      id: '3',
      author: 'Amit Kumar',
      content: '📚 Sharing my handwritten notes on Organic Chemistry. Hope it helps! Download link in comments.',
      groupName: 'NEET UG 2025',
      timestamp: '2024-11-02T18:00:00Z',
      likes: 89,
      comments: 34,
    },
  ];

  const mockMessages: ChatMessage[] = [
    { id: '1', sender: 'Rahul', message: 'Hey! Ready for today\'s study session?', timestamp: '10:00 AM', isMe: false },
    { id: '2', sender: 'You', message: 'Yes! Starting in 10 minutes. What chapter are we covering?', timestamp: '10:02 AM', isMe: true },
    { id: '3', sender: 'Rahul', message: 'Let\'s finish Chapter 5 - Modern History', timestamp: '10:03 AM', isMe: false },
    { id: '4', sender: 'You', message: 'Perfect! See you soon 👍', timestamp: '10:04 AM', isMe: true },
  ];

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.post(`/api/study-groups/${groupId}/join`);
      setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: true, members: g.members + 1 } : g));
    } catch (error) {
      setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: true, members: g.members + 1 } : g));
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await api.post(`/api/study-groups/${groupId}/leave`);
      setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: false, members: g.members - 1 } : g));
    } catch (error) {
      setGroups(groups.map(g => g.id === groupId ? { ...g, isJoined: false, members: g.members - 1 } : g));
    }
  };

  const handleOpenChat = (group: StudyGroup) => {
    setSelectedGroup(group);
    setMessages(mockMessages);
    setChatDialog(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              👥 Study Community
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join study groups, share notes, and learn together
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setPostDialog(true)}>
            New Post
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`My Groups (${groups.filter(g => g.isJoined).length})`} />
          <Tab label="Discover Groups" />
          <Tab label={`Feed (${posts.length})`} />
        </Tabs>

        {/* My Groups Tab */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {groups.filter(g => g.isJoined).map((group) => (
              <Grid item xs={12} md={6} key={group.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                        <Group />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="600">{group.name}</Typography>
                        <Chip label={group.category} size="small" color="primary" sx={{ mr: 1 }} />
                        <Chip label={`${group.members} members`} size="small" variant="outlined" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                    {group.lastActivity && (
                      <Typography variant="caption" color="text.secondary">
                        Last activity: {group.lastActivity}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<Chat />}
                        onClick={() => handleOpenChat(group)}
                      >
                        Open Chat
                      </Button>
                      <Button variant="outlined" onClick={() => handleLeaveGroup(group.id)}>
                        Leave
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Discover Groups Tab */}
        {tab === 1 && (
          <Box>
            <TextField
              fullWidth
              placeholder="Search groups..."
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
            <Grid container spacing={3}>
              {filteredGroups.map((group) => (
                <Grid item xs={12} md={6} key={group.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: group.isJoined ? 'success.main' : 'primary.main' }}>
                          <Group />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="600">{group.name}</Typography>
                          <Chip label={group.category} size="small" color="primary" sx={{ mr: 1 }} />
                          <Chip label={`${group.members} members`} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {group.description}
                      </Typography>
                      <Button 
                        variant={group.isJoined ? "outlined" : "contained"} 
                        fullWidth
                        startIcon={group.isJoined ? <CheckCircle /> : <Add />}
                        onClick={() => group.isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
                      >
                        {group.isJoined ? 'Joined' : 'Join Group'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Feed Tab */}
        {tab === 2 && (
          <Box>
            {posts.map((post) => (
              <Card key={post.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar>{post.author[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {post.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.groupName} • {new Date(post.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {post.content}
                  </Typography>

                  {post.attachments && post.attachments.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {post.attachments.map((file, index) => (
                        <Chip
                          key={index}
                          label={file}
                          size="small"
                          icon={<AttachFile />}
                          clickable
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<ThumbUp />}
                      onClick={() => handleLike(post.id)}
                    >
                      {post.likes}
                    </Button>
                    <Button size="small" startIcon={<Comment />}>
                      {post.comments}
                    </Button>
                    <Button size="small" startIcon={<Share />}>
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Chat Dialog */}
        <Dialog open={chatDialog} onClose={() => setChatDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Group />
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedGroup?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedGroup?.members} members • Online now
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.isMe ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: msg.isMe ? 'primary.main' : 'grey.200',
                      color: msg.isMe ? 'white' : 'text.primary',
                    }}
                  >
                    {!msg.isMe && (
                      <Typography variant="caption" fontWeight="600" display="block">
                        {msg.sender}
                      </Typography>
                    )}
                    <Typography variant="body2">{msg.message}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {msg.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSendMessage} color="primary">
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Post Dialog */}
        <Dialog open={postDialog} onClose={() => setPostDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Post</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Select Group"
              select
              margin="normal"
              defaultValue={groups.find(g => g.isJoined)?.id}
            >
              {groups.filter(g => g.isJoined).map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="What's on your mind?"
              multiline
              rows={4}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              margin="normal"
            />
            <Button component="label" startIcon={<AttachFile />} sx={{ mt: 1 }}>
              Attach File
              <input type="file" hidden />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPostDialog(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Send />}>
              Post
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

function CheckCircle() {
  return <Group />;
}

