// ============================================
// MESSAGING - COMMUNICATIONS PAGE
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Inbox as InboxIcon,
  Send as SentIcon,
  Drafts as DraftsIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  from: string;
  fromEmail: string;
  fromAvatar: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  channel: 'email' | 'sms' | 'whatsapp';
  type: 'inbox' | 'sent' | 'draft';
}

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageText, setMessageText] = useState('');

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: '1',
      from: 'Sarah Mitchell',
      fromEmail: 'sarah.mitchell@studyspot.com',
      fromAvatar: '',
      subject: 'New tenant registration inquiry',
      preview: 'Hi, I would like to know more about the tenant registration process...',
      body: 'Hi, I would like to know more about the tenant registration process. Can you please provide details on the pricing plans and features available for new tenants?',
      timestamp: '2024-10-30T10:30:00Z',
      read: false,
      starred: true,
      channel: 'email',
      type: 'inbox',
    },
    {
      id: '2',
      from: 'John Anderson',
      fromEmail: 'john.anderson@techcorp.com',
      fromAvatar: '',
      subject: 'API integration support',
      preview: 'We are facing issues with the API integration. Could you assist?',
      body: 'We are facing issues with the API integration. The webhook is not triggering properly. Could you assist with debugging this issue?',
      timestamp: '2024-10-30T09:15:00Z',
      read: true,
      starred: false,
      channel: 'email',
      type: 'inbox',
    },
    {
      id: '3',
      from: 'Emily Johnson',
      fromEmail: 'emily.j@innovate.io',
      fromAvatar: '',
      subject: 'Billing question',
      preview: 'I have a question regarding our monthly billing cycle...',
      body: 'I have a question regarding our monthly billing cycle. Can we upgrade our plan mid-cycle and how would the proration work?',
      timestamp: '2024-10-29T16:45:00Z',
      read: true,
      starred: false,
      channel: 'email',
      type: 'inbox',
    },
    {
      id: '4',
      from: 'Michael Brown',
      fromEmail: 'mbrown@datatech.com',
      fromAvatar: '',
      subject: 'Feature request',
      preview: 'Would it be possible to add a custom reporting feature?',
      body: 'Would it be possible to add a custom reporting feature to the dashboard? We need specific metrics for our business.',
      timestamp: '2024-10-29T14:20:00Z',
      read: false,
      starred: true,
      channel: 'email',
      type: 'inbox',
    },
    {
      id: '5',
      from: 'Lisa Davis',
      fromEmail: 'lisa.davis@cloudbase.net',
      fromAvatar: '',
      subject: 'Re: Welcome to StudySpot',
      preview: 'Thank you for the onboarding session...',
      body: 'Thank you for the onboarding session. It was very helpful and our team is excited to start using the platform!',
      timestamp: '2024-10-28T11:30:00Z',
      read: true,
      starred: false,
      channel: 'email',
      type: 'sent',
    },
    {
      id: '6',
      from: 'You',
      fromEmail: 'admin@studyspot.com',
      fromAvatar: '',
      subject: 'System maintenance notification',
      preview: 'This is to inform you about the scheduled maintenance...',
      body: 'This is to inform you about the scheduled maintenance on November 5th from 2 AM to 4 AM EST. Please plan accordingly.',
      timestamp: '2024-10-27T09:00:00Z',
      read: true,
      starred: false,
      channel: 'email',
      type: 'draft',
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedMessage(null);
  };

  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    message.read = true;
    toast.info(`Opened message from ${message.from}`);
  };

  const handleStarToggle = (message: Message) => {
    message.starred = !message.starred;
    toast.success(message.starred ? 'Message starred' : 'Message unstarred');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.warning('Please enter a message');
      return;
    }
    toast.success('Message sent successfully!');
    setMessageText('');
  };

  const handleDeleteMessage = (message: Message) => {
    toast.success(`Message from "${message.from}" moved to trash`);
    setSelectedMessage(null);
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EmailIcon fontSize="small" />;
      case 'sms':
        return <SmsIcon fontSize="small" />;
      case 'whatsapp':
        return <WhatsAppIcon fontSize="small" />;
      default:
        return <EmailIcon fontSize="small" />;
    }
  };

  const getFilteredMessages = () => {
    let filtered = mockMessages;

    // Filter by tab
    if (activeTab === 0) {
      filtered = filtered.filter(m => m.type === 'inbox');
    } else if (activeTab === 1) {
      filtered = filtered.filter(m => m.type === 'sent');
    } else if (activeTab === 2) {
      filtered = filtered.filter(m => m.type === 'draft');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        m =>
          m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredMessages = getFilteredMessages();
  const unreadCount = mockMessages.filter(m => !m.read && m.type === 'inbox').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Messaging & Communications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage email, SMS, and WhatsApp communications
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SendIcon />} onClick={() => toast.info('Compose coming soon!')}>
          Compose
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <InboxIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                Inbox
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockMessages.filter(m => m.type === 'inbox').length}
            </Typography>
            <Typography variant="caption" color="error.main">
              {unreadCount} unread
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <SentIcon color="success" />
              <Typography variant="body2" color="text.secondary">
                Sent
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockMessages.filter(m => m.type === 'sent').length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <DraftsIcon color="warning" />
              <Typography variant="body2" color="text.secondary">
                Drafts
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockMessages.filter(m => m.type === 'draft').length}
            </Typography>
          </Box>
        </Card>
        <Card>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <StarIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                Starred
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {mockMessages.filter(m => m.starred).length}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Main Content */}
      <Card sx={{ height: '600px', display: 'flex' }}>
        {/* Left Panel - Message List */}
        <Box sx={{ width: '350px', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error">
                  Inbox
                </Badge>
              }
            />
            <Tab label="Sent" />
            <Tab label="Drafts" />
          </Tabs>

          {/* Search */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Message List */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List sx={{ p: 0 }}>
              {filteredMessages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItemButton
                    selected={selectedMessage?.id === message.id}
                    onClick={() => handleMessageSelect(message)}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar>{message.from[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            fontWeight={!message.read ? 'bold' : 'normal'}
                            sx={{ flex: 1 }}
                          >
                            {message.from}
                          </Typography>
                          {getChannelIcon(message.channel)}
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleStarToggle(message); }}>
                            {message.starred ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            fontWeight={!message.read ? 'bold' : 'normal'}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {message.subject}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {message.preview}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(message.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                  {index < filteredMessages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>

        {/* Right Panel - Message View */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {selectedMessage.subject}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32 }}>{selectedMessage.from[0]}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedMessage.from}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedMessage.fromEmail}
                        </Typography>
                      </Box>
                      <Chip
                        label={selectedMessage.channel}
                        size="small"
                        icon={getChannelIcon(selectedMessage.channel)}
                      />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleStarToggle(selectedMessage)}>
                      {selectedMessage.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteMessage(selectedMessage)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {new Date(selectedMessage.timestamp).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>

              {/* Message Body */}
              <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.body}
                </Typography>
              </Box>

              {/* Reply Box */}
              <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }} elevation={0}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Type your reply..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <IconButton size="small">
                      <AttachFileIcon />
                    </IconButton>
                    <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendMessage}>
                      Send Reply
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stack alignItems="center" spacing={2}>
                <EmailIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary">
                  Select a message to view
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default MessagingPage;

