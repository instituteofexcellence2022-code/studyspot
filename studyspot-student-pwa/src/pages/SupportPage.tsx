import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Help,
  Phone,
  Email,
  WhatsApp,
  PlayCircleOutline,
  LibraryBooks,
  Close,
  Send,
  LiveHelp,
  Description,
  ContactSupport,
  VideoLibrary,
} from '@mui/icons-material';
import Layout from '../components/StudyFocusedLayout';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
}

interface LibraryContact {
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address: string;
  hours: string;
}

export default function SupportPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactDialog, setContactDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [message, setMessage] = useState({
    subject: '',
    body: '',
  });

  const faqCategories = [
    { value: 'all', label: 'All', icon: '📚', color: '#1976d2' },
    { value: 'booking', label: 'Booking', icon: '📅', color: '#f57c00' },
    { value: 'payment', label: 'Payment', icon: '💳', color: '#388e3c' },
    { value: 'account', label: 'Account', icon: '👤', color: '#7b1fa2' },
    { value: 'attendance', label: 'Attendance', icon: '📊', color: '#0097a7' },
    { value: 'rewards', label: 'Rewards', icon: '🎁', color: '#c62828' },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'booking',
      question: 'How do I book a seat?',
      answer: 'To book a seat: 1) Go to Libraries page, 2) Select your preferred library, 3) Choose date and shift, 4) Select an available seat from the layout, 5) Confirm booking and make payment.',
      helpful: 45,
    },
    {
      id: '2',
      category: 'booking',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 24 hours before the scheduled time. Go to My Bookings, select the booking, and click Cancel. Refund will be processed within 5-7 business days.',
      helpful: 32,
    },
    {
      id: '3',
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept UPI, Credit/Debit cards, Net Banking, and various digital wallets. You can also pay cash directly at the library.',
      helpful: 28,
    },
    {
      id: '4',
      category: 'payment',
      question: 'How do I get a refund?',
      answer: 'Refunds are processed automatically after cancellation. It takes 5-7 business days to reflect in your account. For cash payments, refunds are issued at the library.',
      helpful: 19,
    },
    {
      id: '5',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on Forgot Password on the login page, enter your registered email, and follow the reset link sent to your email.',
      helpful: 54,
    },
    {
      id: '6',
      category: 'account',
      question: 'Can I change my registered phone number?',
      answer: 'Yes, go to Profile > Settings > Personal Info and update your phone number. You will receive an OTP for verification.',
      helpful: 23,
    },
    {
      id: '7',
      category: 'attendance',
      question: 'How do I check-in using QR code?',
      answer: 'Open the QR Scanner from the menu, scan the QR code displayed at the library entrance. Your attendance will be marked automatically.',
      helpful: 67,
    },
    {
      id: '8',
      category: 'attendance',
      question: 'What if I forget to check-out?',
      answer: 'You can manually check-out from the QR Scanner page. If you forget, the system will auto check-out after 12 hours.',
      helpful: 41,
    },
    {
      id: '9',
      category: 'rewards',
      question: 'How do I earn reward points?',
      answer: 'Earn points by: Regular attendance (10 points/day), Completing 7-day streak (50 points), Using study timer (5 points/session), Referring friends (100 points/referral).',
      helpful: 89,
    },
    {
      id: '10',
      category: 'rewards',
      question: 'How do I redeem reward points?',
      answer: 'Go to Rewards page, select a coupon or discount, and click Redeem. The discount will be automatically applied to your next booking.',
      helpful: 56,
    },
  ];

  const videos = [
    {
      id: '1',
      title: 'How to Book a Seat',
      duration: '2:30',
      thumbnail: 'https://via.placeholder.com/300x200?text=Book+Seat',
      url: 'https://www.youtube.com/watch?v=example',
    },
    {
      id: '2',
      title: 'QR Code Check-in Guide',
      duration: '1:45',
      thumbnail: 'https://via.placeholder.com/300x200?text=QR+Check-in',
      url: 'https://www.youtube.com/watch?v=example',
    },
    {
      id: '3',
      title: 'Payment Methods Explained',
      duration: '3:15',
      thumbnail: 'https://via.placeholder.com/300x200?text=Payment',
      url: 'https://www.youtube.com/watch?v=example',
    },
    {
      id: '4',
      title: 'Earning Reward Points',
      duration: '2:00',
      thumbnail: 'https://via.placeholder.com/300x200?text=Rewards',
      url: 'https://www.youtube.com/watch?v=example',
    },
  ];

  const libraryContact: LibraryContact = {
    name: 'Central Library',
    phone: '+91 98765 43210',
    email: 'support@centrallibrary.com',
    whatsapp: '+91 98765 43210',
    address: '123 Main Street, City Center, Mumbai - 400001',
    hours: 'Mon-Sat: 6:00 AM - 11:00 PM, Sun: 8:00 AM - 8:00 PM',
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = async () => {
    try {
      // API call to send message
      alert('Message sent successfully! We will get back to you within 24 hours.');
      setMessageDialog(false);
      setMessage({ subject: '', body: '' });
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            💬 Help & Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers to common questions or contact support
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
              onClick={() => setContactDialog(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Phone sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">Call Us</Typography>
                <Typography variant="caption">Get immediate help</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6 },
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
              onClick={() => setMessageDialog(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Email sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">Email Us</Typography>
                <Typography variant="caption">Send a message</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6 },
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
              component="a"
              href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
              target="_blank"
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <WhatsApp sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">WhatsApp</Typography>
                <Typography variant="caption">Chat with us</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6 },
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
              }}
              onClick={() => setTab(2)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <VideoLibrary sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="600">Video Tutorials</Typography>
                <Typography variant="caption">Watch and learn</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab icon={<LiveHelp />} label="FAQs" />
          <Tab icon={<ContactSupport />} label="Contact" />
          <Tab icon={<VideoLibrary />} label="Videos" />
        </Tabs>

        {/* FAQ Tab */}
        {tab === 0 && (
          <Box>
            <TextField
              fullWidth
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filters */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {faqCategories.map((cat) => (
                <Chip
                  key={cat.value}
                  label={`${cat.icon} ${cat.label}`}
                  onClick={() => setSelectedCategory(cat.value)}
                  color={selectedCategory === cat.value ? 'primary' : 'default'}
                  variant={selectedCategory === cat.value ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* FAQ List */}
            {filteredFAQs.map((faq) => (
              <Accordion key={faq.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar sx={{ bgcolor: faqCategories.find(c => c.value === faq.category)?.color }}>
                      <Help />
                    </Avatar>
                    <Typography variant="body1" fontWeight="600" sx={{ flex: 1 }}>
                      {faq.question}
                    </Typography>
                    <Chip label={`${faq.helpful} helpful`} size="small" color="success" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {faq.answer}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">Helpful</Button>
                    <Button size="small">Not Helpful</Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}

            {filteredFAQs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Help sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No FAQs found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try different search terms or contact support
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Contact Tab */}
        {tab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Library Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <LibraryBooks />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={libraryContact.name}
                    secondary={libraryContact.address}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Phone />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Phone"
                    secondary={
                      <Button
                        variant="text"
                        href={`tel:${libraryContact.phone}`}
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      >
                        {libraryContact.phone}
                      </Button>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main' }}>
                      <Email />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Email"
                    secondary={
                      <Button
                        variant="text"
                        href={`mailto:${libraryContact.email}`}
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      >
                        {libraryContact.email}
                      </Button>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#25D366' }}>
                      <WhatsApp />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="WhatsApp"
                    secondary={
                      <Button
                        variant="text"
                        href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      >
                        {libraryContact.whatsapp}
                      </Button>
                    }
                  />
                </ListItem>
              </List>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Operating Hours:</strong> {libraryContact.hours}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Videos Tab */}
        {tab === 2 && (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => {
                    setSelectedVideo(video);
                    setVideoDialog(true);
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <PlayCircleOutline sx={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                    </Box>
                    <Chip
                      label={video.duration}
                      size="small"
                      sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="body1" fontWeight="600">
                      {video.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Contact Dialog */}
        <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Contact Library</DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={libraryContact.phone}
                />
                <Button variant="contained" href={`tel:${libraryContact.phone}`} startIcon={<Phone />}>
                  Call Now
                </Button>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="WhatsApp"
                  secondary={libraryContact.whatsapp}
                />
                <Button
                  variant="contained"
                  href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  startIcon={<WhatsApp />}
                  sx={{ bgcolor: '#25D366' }}
                >
                  Chat
                </Button>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContactDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Send Message to Support</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Subject"
              value={message.subject}
              onChange={(e) => setMessage({ ...message, subject: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Message"
              value={message.body}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              multiline
              rows={4}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<Send />} onClick={handleSendMessage}>
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Dialog */}
        <Dialog open={videoDialog} onClose={() => setVideoDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedVideo?.title}
            <IconButton
              onClick={() => setVideoDialog(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ width: '100%', height: 400, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="white">Video Player Placeholder</Typography>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  );
}

