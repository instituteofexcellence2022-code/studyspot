/**
 * 💬 MESSAGES INBOX PAGE (Owner Portal)
 * 
 * Library owners can:
 * - View messages from students
 * - Reply to messages
 * - Mark as read
 * - Delete messages
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Message as MessageIcon,
  Send,
  Delete,
  MarkEmailRead,
  Search,
  FilterList,
  Refresh,
  Reply,
  Close,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  library_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_role: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  parent_message_id?: string;
}

export default function MessagesInboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(false);

  const { socket, connected } = useSocket('library_owner');

  useEffect(() => {
    fetchMessages();
  }, []);

  // Real-time message notifications
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('message:new', (data) => {
      toast.info(`New message from ${data.senderName}`);
      fetchMessages();
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
        msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterUnread) {
      filtered = filtered.filter(msg => !msg.is_read);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterUnread]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // For now, using hardcoded library ID - should come from user context
      const libraryId = localStorage.getItem('currentLibraryId') || '1';
      
      const response = await axios.get<{ success: boolean; data: Message[] }>(`${API_BASE_URL}/api/messages/library/${libraryId}`);
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
      sender_id: 'student-001',
      sender_name: 'Rahul Kumar',
      sender_role: 'student',
      receiver_id: 'owner-001',
      receiver_role: 'library_owner',
      message: 'Hi, I wanted to know if individual cabins are available for tomorrow morning shift?',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      library_id: '1',
      sender_id: 'student-002',
      sender_name: 'Priya Sharma',
      sender_role: 'student',
      receiver_id: 'owner-001',
      receiver_role: 'library_owner',
      message: 'Do you have AC in the reading zone? Also, what are the timings for weekend?',
      is_read: true,
      read_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      library_id: '1',
      sender_id: 'student-003',
      sender_name: 'Amit Verma',
      sender_role: 'student',
      receiver_id: 'owner-001',
      receiver_role: 'library_owner',
      message: 'Is parking available? I have a two-wheeler.',
      is_read: false,
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/messages/${messageId}/read`);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ));
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      // Get owner info from localStorage or user context
      const ownerId = localStorage.getItem('userId') || 'owner-001';
      const ownerName = localStorage.getItem('userName') || 'Library Owner';

      await axios.post(`${API_BASE_URL}/api/messages/${selectedMessage.id}/reply`, {
        senderId: ownerId,
        senderName: ownerName,
        message: replyText,
      });

      toast.success('Reply sent successfully!');
      setReplyDialogOpen(false);
      setReplyText('');
      setSelectedMessage(null);
      
      // Mark original message as read
      if (!selectedMessage.is_read) {
        handleMarkAsRead(selectedMessage.id);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            💬 Messages
            {connected && (
              <Chip icon={<CheckCircle />} label="Live" color="success" size="small" />
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {messages.length} total messages • {unreadCount} unread
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

      {/* Search & Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search messages..."
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
          <Button
            variant={filterUnread ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setFilterUnread(!filterUnread)}
            sx={{ minWidth: 150 }}
          >
            Unread Only
          </Button>
        </Stack>
      </Paper>

      {/* Messages List */}
      {loading ? (
        <Typography>Loading messages...</Typography>
      ) : filteredMessages.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No messages found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMessages.map((message) => (
            <Grid key={message.id} item xs={12} md={6} lg={4}>
              <Card 
                sx={{ 
                  border: 2,
                  borderColor: message.is_read ? 'divider' : 'primary.main',
                  bgcolor: message.is_read ? 'background.paper' : 'primary.light',
                  transition: 'all 0.3s',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {message.sender_name[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="600" noWrap>
                          {message.sender_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    {!message.is_read && (
                      <Badge color="error" variant="dot" />
                    )}
                  </Box>

                  {/* Message Content */}
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {message.message}
                  </Typography>

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Reply />}
                      onClick={() => {
                        setSelectedMessage(message);
                        setReplyDialogOpen(true);
                      }}
                      fullWidth
                    >
                      Reply
                    </Button>
                    {!message.is_read && (
                      <Tooltip title="Mark as read">
                        <IconButton 
                          size="small"
                          onClick={() => handleMarkAsRead(message.id)}
                          color="primary"
                        >
                          <MarkEmailRead fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small"
                        onClick={() => handleDelete(message.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reply Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={() => {
          setReplyDialogOpen(false);
          setReplyText('');
          setSelectedMessage(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Reply color="primary" />
          Reply to {selectedMessage?.sender_name}
        </DialogTitle>
        <DialogContent>
          {/* Original Message */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Original Message:
            </Typography>
            <Typography variant="body2">
              "{selectedMessage?.message}"
            </Typography>
          </Paper>

          {/* Reply Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            variant="outlined"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setReplyDialogOpen(false);
              setReplyText('');
              setSelectedMessage(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReply}
            variant="contained"
            startIcon={<Send />}
            disabled={!replyText.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

