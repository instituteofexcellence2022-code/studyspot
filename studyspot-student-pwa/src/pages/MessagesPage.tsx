/**
 * 💬 MESSAGES PAGE (Student Portal)
 * 
 * Students can:
 * - View sent messages
 * - See replies from library owners
 * - Track message status (read/unread)
 * - Real-time notifications
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  InputAdornment,
  Tooltip,
  Container,
} from '@mui/material';
import {
  Message as MessageIcon,
  Search,
  Refresh,
  Reply,
  CheckCircle,
  Schedule,
  LibraryBooks,
} from '@mui/icons-material';
import StudyFocusedLayout from '../components/StudyFocusedLayout';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  library_id: string;
  library_name?: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  replies?: Message[];
}

export default function MessagesPage({ darkMode, setDarkMode }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { socket, connected } = useSocket('student');
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  // Real-time reply notifications
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('message:new', (data) => {
      if (data.isReply) {
        toast.info(`New reply from library owner`);
        fetchMessages();
      }
    });

    socket.on('message:read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, is_read: true, read_at: data.readAt } : msg
      ));
    });

    return () => {
      socket.off('message:new');
      socket.off('message:read');
    };
  }, [socket, connected]);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(msg => 
        (msg.library_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'student-001';
      const response = await api.get(`/api/messages/user/${userId}`);
      setMessages(response.data?.data || getMockMessages());
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages(getMockMessages());
    } finally {
      setLoading(false);
    }
  };

  const getMockMessages = (): Message[] => [
    {
      id: '1',
      library_id: '1',
      library_name: 'Central Study Hub',
      sender_id: 'student-001',
      sender_name: user?.firstName || 'You',
      receiver_id: 'owner-001',
      message: 'Hi, I wanted to know if individual cabins are available for tomorrow morning shift?',
      is_read: true,
      read_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
      replies: [
        {
          id: '1-reply-1',
          library_id: '1',
          sender_id: 'owner-001',
          sender_name: 'Library Owner',
          receiver_id: 'student-001',
          message: 'Yes, we have individual cabins available. You can book them directly from our app. Premium cabins are in Zone A.',
          is_read: false,
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    },
    {
      id: '2',
      library_id: '2',
      library_name: 'Knowledge Point Library',
      sender_id: 'student-001',
      sender_name: user?.firstName || 'You',
      receiver_id: 'owner-002',
      message: 'Do you have AC in the reading zone? Also, what are the timings for weekend?',
      is_read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return (
    <StudyFocusedLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💬 My Messages
              {connected && (
                <Chip icon={<CheckCircle />} label="Live" color="success" size="small" />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {messages.length} messages sent
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchMessages}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search messages or libraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Messages List */}
        {loading ? (
          <Typography>Loading messages...</Typography>
        ) : filteredMessages.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send a message to a library owner to start a conversation
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {filteredMessages.map((message) => (
              <Card key={message.id} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  {/* Message Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <LibraryBooks />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="600">
                          {message.library_name || 'Library'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    {message.is_read ? (
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Read" 
                        size="small" 
                        color="success"
                        sx={{ height: 24 }}
                      />
                    ) : (
                      <Chip 
                        icon={<Schedule />} 
                        label="Sent" 
                        size="small" 
                        sx={{ height: 24 }}
                      />
                    )}
                  </Box>

                  {/* Your Message */}
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Your Message:
                    </Typography>
                    <Typography variant="body2">
                      {message.message}
                    </Typography>
                  </Paper>

                  {/* Replies */}
                  {message.replies && message.replies.length > 0 && (
                    <Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Reply fontSize="small" />
                        Reply from Library Owner:
                      </Typography>
                      {message.replies.map((reply) => (
                        <Paper key={reply.id} sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="caption" fontWeight="600">
                              {reply.sender_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(reply.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {reply.message}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </StudyFocusedLayout>
  );
}

