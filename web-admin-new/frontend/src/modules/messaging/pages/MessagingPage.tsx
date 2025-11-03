// ============================================
// MESSAGING PAGE - Inbox, Sent, Drafts & Templates
// Complete messaging center
// ============================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stack,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Inbox,
  Send,
  Drafts,
  Article,
  Add,
  Delete,
  Reply,
  Forward,
  Star,
  StarBorder,
  Email,
  Sms,
  WhatsApp,
  Search,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`messaging-tabpanel-${index}`}
      aria-labelledby={`messaging-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock data for inbox
  const inboxMessages = [
    { id: 1, from: 'Rahul Mehta', subject: 'Seat availability query', preview: 'Hi, I would like to know about available seats...', time: '10:30 AM', unread: true, starred: false, type: 'email' },
    { id: 2, from: 'Priya Sharma', subject: 'Payment confirmation needed', preview: 'I made a payment but did not receive confirmation...', time: '9:15 AM', unread: true, starred: true, type: 'email' },
    { id: 3, from: 'Vikram Singh', subject: 'Membership renewal', preview: 'I want to renew my library membership for next month...', time: 'Yesterday', unread: false, starred: false, type: 'sms' },
    { id: 4, from: 'Anita Patel', subject: 'New library inquiry', preview: 'Interested in opening a new library branch...', time: '2 days ago', unread: false, starred: true, type: 'whatsapp' },
    { id: 5, from: 'System', subject: 'Daily summary report', preview: 'Your daily summary for October 30, 2025...', time: '3 days ago', unread: false, starred: false, type: 'email' },
    { id: 6, from: 'Rohit Kumar', subject: 'Feature request', preview: 'Can you add a mobile app for students...', time: '4 days ago', unread: false, starred: false, type: 'email' },
  ];

  // Mock data for sent
  const sentMessages = [
    { id: 1, to: 'All Libraries', subject: 'New feature announcement', preview: 'We are excited to announce a new feature...', time: '11:45 AM', type: 'email' },
    { id: 2, to: 'Rahul Mehta', subject: 'Re: Seat availability query', preview: 'Thank you for your inquiry. We currently have...', time: '10:45 AM', type: 'email' },
    { id: 3, to: 'Premium Members', subject: 'Special offer', preview: 'Get 20% off on your next renewal...', time: 'Yesterday', type: 'sms' },
    { id: 4, to: 'New Signups', subject: 'Welcome to StudySpot', preview: 'Welcome! We are glad to have you...', time: '2 days ago', type: 'whatsapp' },
  ];

  // Mock data for drafts
  const drafts = [
    { id: 1, to: 'Marketing List', subject: 'Monthly newsletter', preview: 'Dear subscribers, here is our monthly...', time: '2 hours ago', type: 'email' },
    { id: 2, to: 'Support Team', subject: 'Team meeting notes', preview: 'Notes from today\'s team meeting...', time: '1 day ago', type: 'email' },
    { id: 3, to: 'Students', subject: 'Exam preparation tips', preview: 'Here are some tips to help you prepare...', time: '3 days ago', type: 'email' },
  ];

  const stats = {
    unreadCount: inboxMessages.filter(m => m.unread).length,
    totalInbox: inboxMessages.length,
    totalSent: sentMessages.length,
    totalDrafts: drafts.length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Email fontSize="small" />;
      case 'sms':
        return <Sms fontSize="small" />;
      case 'whatsapp':
        return <WhatsApp fontSize="small" />;
      default:
        return <Email fontSize="small" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return '#2196F3';
      case 'sms':
        return '#FF9800';
      case 'whatsapp':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const InboxTab = () => (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search messages..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button variant="outlined" startIcon={<Reply />}>
            Reply
          </Button>
          <Button variant="outlined" startIcon={<Delete />} color="error">
            Delete
          </Button>
        </Stack>

        <List>
          {inboxMessages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {message.time}
                    </Typography>
                    <IconButton edge="end" size="small">
                      {message.starred ? <Star sx={{ color: '#FF9800' }} /> : <StarBorder />}
                    </IconButton>
                  </Stack>
                }
                sx={{
                  bgcolor: message.unread ? '#F3E5F5' : 'transparent',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: message.unread ? '#FCE4EC' : '#F5F5F5',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={getTypeIcon(message.type)}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: getTypeColor(message.type),
                        color: 'white',
                        right: -3,
                        bottom: -3,
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#E91E63' }}>
                      {message.from.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body1"
                        fontWeight={message.unread ? 700 : 400}
                      >
                        {message.from}
                      </Typography>
                      {message.unread && (
                        <Chip label="New" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        fontWeight={message.unread ? 600 : 400}
                        sx={{ display: 'block' }}
                      >
                        {message.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.preview}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const SentTab = () => (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search sent messages..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button variant="outlined" startIcon={<Forward />}>
            Forward
          </Button>
          <Button variant="outlined" startIcon={<Delete />} color="error">
            Delete
          </Button>
        </Stack>

        <List>
          {sentMessages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                secondaryAction={
                  <Typography variant="caption" color="text.secondary">
                    {message.time}
                  </Typography>
                }
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#F5F5F5',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={getTypeIcon(message.type)}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: getTypeColor(message.type),
                        color: 'white',
                        right: -3,
                        bottom: -3,
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#4CAF50' }}>
                      <Send />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body1">To: {message.to}</Typography>}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" fontWeight={600} sx={{ display: 'block' }}>
                        {message.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.preview}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const DraftsTab = () => (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search drafts..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button variant="outlined" startIcon={<Delete />} color="error">
            Delete
          </Button>
        </Stack>

        <List>
          {drafts.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                secondaryAction={
                  <Typography variant="caption" color="text.secondary">
                    {message.time}
                  </Typography>
                }
                sx={{
                  bgcolor: '#FFF9C4',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#FFF59D',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={getTypeIcon(message.type)}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: getTypeColor(message.type),
                        color: 'white',
                        right: -3,
                        bottom: -3,
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#FF9800' }}>
                      <Drafts />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1">To: {message.to}</Typography>
                      <Chip label="Draft" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" fontWeight={600} sx={{ display: 'block' }}>
                        {message.subject}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.preview}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Messaging Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all your communications - Inbox, Sent, Drafts & Templates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setComposeOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 100%)',
            },
          }}
        >
          Compose Message
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Unread</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.unreadCount}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#F44336', width: 56, height: 56 }}>
                <Badge badgeContent={stats.unreadCount} color="error">
                  <Inbox sx={{ color: 'white' }} />
                </Badge>
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Inbox</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.totalInbox}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#2196F3', width: 56, height: 56 }}>
                <Inbox sx={{ color: 'white' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Sent</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.totalSent}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#4CAF50', width: 56, height: 56 }}>
                <Send sx={{ color: 'white' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Drafts</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.totalDrafts}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#FF9800', width: 56, height: 56 }}>
                <Drafts sx={{ color: 'white' }} />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: '#E91E63',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#E91E63',
            },
          }}
        >
          <Tab icon={<Badge badgeContent={stats.unreadCount} color="error"><Inbox /></Badge>} iconPosition="start" label={`Inbox (${stats.totalInbox})`} />
          <Tab icon={<Send />} iconPosition="start" label={`Sent (${stats.totalSent})`} />
          <Tab icon={<Drafts />} iconPosition="start" label={`Drafts (${stats.totalDrafts})`} />
          <Tab icon={<Article />} iconPosition="start" label="Templates" onClick={() => window.location.href = '/messaging/templates'} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <InboxTab />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SentTab />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <DraftsTab />
      </TabPanel>

      {/* Compose Message Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compose New Message</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Message Type</InputLabel>
              <Select label="Message Type" defaultValue="email">
                <MenuItem value="email">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Email /> <span>Email</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="sms">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Sms /> <span>SMS</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="whatsapp">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <WhatsApp /> <span>WhatsApp</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="To" placeholder="Select recipients..." />
            <TextField fullWidth label="Subject" />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={8}
              placeholder="Type your message here..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button variant="outlined" onClick={() => setComposeOpen(false)}>
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={() => setComposeOpen(false)}
            sx={{
              background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagingPage;

