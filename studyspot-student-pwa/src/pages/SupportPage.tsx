import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Stack,
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
  BugReport,
  Assignment,
  PriorityHigh,
  CheckCircle,
} from '@mui/icons-material';
import MobileLayout from '../components/MobileLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { alpha } from '@mui/material';
import { gradients } from '../theme/colors';
import { useNavigate } from 'react-router-dom';

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
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactDialog, setContactDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [message, setMessage] = useState({
    subject: '',
    body: '',
  });
  const [ticket, setTicket] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
  });

  const faqCategories = [
    { value: 'all', label: t('support.all'), icon: '📚', color: '#1976d2' },
    { value: 'booking', label: t('support.booking'), icon: '📅', color: '#f57c00' },
    { value: 'payment', label: t('support.payment'), icon: '💳', color: '#388e3c' },
    { value: 'account', label: t('support.account'), icon: '👤', color: '#7b1fa2' },
    { value: 'attendance', label: t('support.attendance'), icon: '📊', color: '#0097a7' },
    { value: 'rewards', label: t('support.rewards'), icon: '🎁', color: '#c62828' },
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
      toast.success(t('support.messageSentSuccess'));
      setMessageDialog(false);
      setMessage({ subject: '', body: '' });
    } catch (error) {
      toast.error(t('support.failedToSend'));
    }
  };

  const handleCreateTicket = async () => {
    try {
      // API call to create ticket
      toast.success(language === 'hi' ? 'टिकट सफलतापूर्वक बनाया गया! टिकट ID: #' + Math.floor(Math.random() * 10000) : 'Ticket created successfully! Ticket ID: #' + Math.floor(Math.random() * 10000));
      setTicketDialog(false);
      setTicket({ category: '', priority: 'medium', subject: '', description: '' });
    } catch (error) {
      toast.error(language === 'hi' ? 'टिकट बनाने में विफल' : 'Failed to create ticket');
    }
  };

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 3 }, pb: 10 }}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '2rem' }, mb: 0.5 }}>
            {t('support.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {t('support.subtitle')}
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(25% - 12px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: gradients.primary,
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
              onClick={() => setContactDialog(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <Phone sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.callUs')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {t('support.getImmediateHelp')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(25% - 12px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
              onClick={() => setMessageDialog(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <Email sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.emailUs')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {t('support.sendMessage')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(25% - 12px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
            >
              <Box
              component="a"
              href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
              target="_blank"
                sx={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
              >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <WhatsApp sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.whatsapp')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {t('support.chatWithUs')}
                </Typography>
              </CardContent>
              </Box>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(25% - 12px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
              onClick={() => setTab(2)}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <VideoLibrary sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.videoTutorials')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {t('support.watchAndLearn')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Additional Quick Actions */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(50% - 8px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 8px)' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
              onClick={() => setTicketDialog(true)}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <Assignment sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.ticketSystem')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {t('support.createTicket')}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(50% - 8px)' }, minWidth: { xs: 'calc(50% - 4px)', sm: 'calc(50% - 8px)' } }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                '&:active': { transform: 'scale(0.98)' },
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                borderRadius: { xs: 1.5, sm: 2 },
                transition: 'all 0.2s ease',
              }}
              onClick={() => navigate('/issues')}
            >
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2.5 }, px: { xs: 1, sm: 1.5 } }}>
                <BugReport sx={{ fontSize: { xs: 28, sm: 40 }, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  {t('support.reportIssue')}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mt: 0.5 }}>
                  {language === 'hi' ? 'समस्या की रिपोर्ट करें' : 'Report a problem'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            minHeight: { xs: 40, sm: 48 },
            '& .MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 40, sm: 48 },
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 1.5 },
            },
            '& .MuiTabs-indicator': {
              height: 3,
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<LiveHelp sx={{ fontSize: { xs: 18, sm: 20 } }} />} iconPosition="start" label={t('support.faqs')} />
          <Tab icon={<ContactSupport sx={{ fontSize: { xs: 18, sm: 20 } }} />} iconPosition="start" label={t('support.contact')} />
          <Tab icon={<VideoLibrary sx={{ fontSize: { xs: 18, sm: 20 } }} />} iconPosition="start" label={t('support.videos')} />
        </Tabs>

        {/* FAQ Tab */}
        {tab === 0 && (
          <Box>
            <TextField
              fullWidth
              placeholder={t('support.searchForHelp')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filters */}
            <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, mb: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
              {faqCategories.map((cat) => (
                <Chip
                  key={cat.value}
                  label={`${cat.icon} ${cat.label}`}
                  onClick={() => setSelectedCategory(cat.value)}
                  color={selectedCategory === cat.value ? 'primary' : 'default'}
                  variant={selectedCategory === cat.value ? 'filled' : 'outlined'}
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    height: { xs: 26, sm: 32 },
                    px: { xs: 0.5, sm: 1 },
                  }}
                />
              ))}
            </Box>

            {/* FAQ List */}
            {filteredFAQs.map((faq) => (
              <Accordion 
                key={faq.id} 
                sx={{ 
                  mb: { xs: 1, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                  sx={{
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                    minHeight: { xs: 48, sm: 56 },
                    '&:hover': {
                      bgcolor: alpha('#667eea', 0.05),
                    },
                    '& .MuiAccordionSummary-content': {
                      my: { xs: 0.5, sm: 1 },
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, width: '100%', pr: 1 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: faqCategories.find(c => c.value === faq.category)?.color,
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                      }}
                    >
                      <Help sx={{ fontSize: { xs: 16, sm: 20 } }} />
                    </Avatar>
                    <Typography 
                      variant="body1" 
                      fontWeight={600} 
                      sx={{ 
                        flex: 1,
                        fontSize: { xs: '0.813rem', sm: '1rem' },
                        lineHeight: 1.3,
                      }}
                    >
                      {faq.question}
                    </Typography>
                    <Chip 
                      label={`${faq.helpful}`} 
                      size="small" 
                      color="success"
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        height: { xs: 20, sm: 24 },
                        display: { xs: 'none', sm: 'flex' }
                      }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 } }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.813rem' },
                        borderRadius: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.75 },
                        minWidth: 'auto',
                      }}
                    >
                      {t('support.helpful')}
                    </Button>
                    <Button 
                      size="small"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.813rem' },
                        borderRadius: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.75 },
                        minWidth: 'auto',
                      }}
                    >
                      {t('support.notHelpful')}
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}

            {filteredFAQs.length === 0 && (
              <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                <Help sx={{ fontSize: { xs: 40, sm: 64 }, color: 'text.secondary', mb: { xs: 1.5, sm: 2 } }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('support.noFaqsFound')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('support.tryDifferentSearch')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Contact Tab */}
        {tab === 1 && (
          <Card sx={{ borderRadius: { xs: 1.5, sm: 2 }, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: { xs: 1.5, sm: 2 } }}>
                {t('support.libraryContactInfo')}
              </Typography>
              <List sx={{ py: 0 }}>
                <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                      <LibraryBooks sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={libraryContact.name}
                    secondary={libraryContact.address}
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 600 
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      sx: { mt: 0.5 }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                      <Phone sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('support.phone')}
                    secondary={
                      <Button
                        variant="text"
                        href={`tel:${libraryContact.phone}`}
                        sx={{ 
                          p: 0, 
                          minWidth: 'auto', 
                          textTransform: 'none', 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mt: 0.5,
                        }}
                      >
                        {libraryContact.phone}
                      </Button>
                    }
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 600 
                    }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'error.main', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                      <Email sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('support.email')}
                    secondary={
                      <Button
                        variant="text"
                        href={`mailto:${libraryContact.email}`}
                        sx={{ 
                          p: 0, 
                          minWidth: 'auto', 
                          textTransform: 'none', 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mt: 0.5,
                        }}
                      >
                        {libraryContact.email}
                      </Button>
                    }
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 600 
                    }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#25D366', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                      <WhatsApp sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('support.whatsapp')}
                    secondary={
                      <Button
                        variant="text"
                        href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        sx={{ 
                          p: 0, 
                          minWidth: 'auto', 
                          textTransform: 'none', 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mt: 0.5,
                        }}
                      >
                        {libraryContact.whatsapp}
                      </Button>
                    }
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 600 
                    }}
                  />
                </ListItem>
              </List>
              <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                <strong>{t('support.operatingHours')}</strong> {libraryContact.hours}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Videos Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('support.videoTutorials')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
            {videos.map((video) => (
                <Box key={video.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
                <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
                      '&:active': { transform: 'scale(0.98)' },
                      borderRadius: { xs: 1.5, sm: 2 },
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                    }}
                  onClick={() => {
                    setSelectedVideo(video);
                    setVideoDialog(true);
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                          width: '100%',
                          height: { xs: 120, sm: 200 },
                          bgcolor: alpha('#667eea', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PlayCircleOutline sx={{ fontSize: { xs: 40, sm: 64 }, color: '#667eea', opacity: 0.8 }} />
                    </Box>
                    <Chip
                      label={video.duration}
                      size="small"
                        sx={{ 
                          position: 'absolute', 
                          bottom: { xs: 6, sm: 8 }, 
                          right: { xs: 6, sm: 8 }, 
                          bgcolor: 'rgba(0,0,0,0.7)', 
                          color: 'white',
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                        }}
                    />
                  </Box>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.813rem', sm: '1rem' }, lineHeight: 1.3 }}>
                      {video.title}
                    </Typography>
                  </CardContent>
                </Card>
                </Box>
            ))}
            </Box>
          </Box>
        )}

        {/* Contact Dialog */}
        <Dialog 
          open={contactDialog} 
          onClose={() => setContactDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              mx: { xs: 1, sm: 2 },
              my: { xs: 1, sm: 2 },
            }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            {t('support.contactLibrary')}
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
            <List sx={{ py: 0 }}>
              <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 } }}>
                <ListItemText
                  primary={t('support.phone')}
                  secondary={libraryContact.phone}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  sx={{ mb: { xs: 0.5, sm: 0 } }}
                />
                <Button 
                  variant="contained" 
                  href={`tel:${libraryContact.phone}`} 
                  startIcon={<Phone sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  sx={{ 
                    borderRadius: { xs: 1, sm: 1.5 }, 
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 1 },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {t('support.callNow')}
                </Button>
              </ListItem>
              <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.5 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 } }}>
                <ListItemText
                  primary={t('support.whatsapp')}
                  secondary={libraryContact.whatsapp}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  sx={{ mb: { xs: 0.5, sm: 0 } }}
                />
                <Button
                  variant="contained"
                  href={`https://wa.me/${libraryContact.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  startIcon={<WhatsApp sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  sx={{ 
                    bgcolor: '#25D366', 
                    borderRadius: { xs: 1, sm: 1.5 }, 
                    fontWeight: 600, 
                    '&:hover': { bgcolor: '#20ba5a' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 1 },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {t('support.chat')}
                </Button>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 } }}>
            <Button 
              onClick={() => setContactDialog(false)}
              sx={{ 
                borderRadius: { xs: 1, sm: 1.5 }, 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {t('support.close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Message Dialog */}
        <Dialog 
          open={messageDialog} 
          onClose={() => setMessageDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              mx: { xs: 1, sm: 2 },
              my: { xs: 1, sm: 2 },
            }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            {t('support.sendMessageToSupport')}
          </DialogTitle>
          <DialogContent sx={{ pt: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
            <TextField
              fullWidth
              label={t('support.subject')}
              value={message.subject}
              onChange={(e) => setMessage({ ...message, subject: e.target.value })}
              margin="normal"
              size="small"
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }
              }}
            />
            <TextField
              fullWidth
              label={t('support.message')}
              value={message.body}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              multiline
              rows={4}
              margin="normal"
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 }, gap: { xs: 1, sm: 1.5 } }}>
            <Button 
              onClick={() => setMessageDialog(false)}
              sx={{ 
                borderRadius: { xs: 1, sm: 1.5 }, 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Send sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
              onClick={handleSendMessage}
              sx={{ 
                borderRadius: { xs: 1, sm: 1.5 }, 
                fontWeight: 700, 
                background: gradients.primary,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {t('support.send')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Dialog */}
        <Dialog 
          open={videoDialog} 
          onClose={() => setVideoDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              mx: { xs: 1, sm: 2 },
              my: { xs: 1, sm: 2 },
            }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, position: 'relative', fontSize: { xs: '1rem', sm: '1.25rem' }, pr: { xs: 5, sm: 6 } }}>
            {selectedVideo?.title}
            <IconButton
              onClick={() => setVideoDialog(false)}
              sx={{ 
                position: 'absolute', 
                right: { xs: 4, sm: 8 }, 
                top: { xs: 4, sm: 8 },
                p: { xs: 0.5, sm: 1 }
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 1.5, sm: 2 }, pb: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ 
              width: '100%', 
              height: { xs: 200, sm: 400 }, 
              bgcolor: '#000', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: { xs: 1.5, sm: 2 },
            }}>
              <Typography color="white" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                {language === 'hi' ? 'वीडियो प्लेयर प्लेसहोल्डर' : 'Video Player Placeholder'}
              </Typography>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Ticket Dialog */}
        <Dialog 
          open={ticketDialog} 
          onClose={() => setTicketDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              mx: { xs: 1, sm: 2 },
              my: { xs: 1, sm: 2 },
            }
          }}
        >
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
            {t('support.createTicket')}
          </DialogTitle>
          <DialogContent sx={{ pt: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{language === 'hi' ? 'श्रेणी' : 'Category'}</InputLabel>
                <Select
                  value={ticket.category}
                  onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  label={language === 'hi' ? 'श्रेणी' : 'Category'}
                  sx={{ 
                    borderRadius: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  <MenuItem value="booking" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('support.booking')}</MenuItem>
                  <MenuItem value="payment" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('support.payment')}</MenuItem>
                  <MenuItem value="account" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('support.account')}</MenuItem>
                  <MenuItem value="attendance" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{t('support.attendance')}</MenuItem>
                  <MenuItem value="technical" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{language === 'hi' ? 'तकनीकी' : 'Technical'}</MenuItem>
                  <MenuItem value="other" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{language === 'hi' ? 'अन्य' : 'Other'}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{language === 'hi' ? 'प्राथमिकता' : 'Priority'}</InputLabel>
                <Select
                  value={ticket.priority}
                  onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                  label={language === 'hi' ? 'प्राथमिकता' : 'Priority'}
                  sx={{ 
                    borderRadius: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  <MenuItem value="low" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: '#10b981' }} />
                      {language === 'hi' ? 'कम' : 'Low'}
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityHigh sx={{ fontSize: { xs: 14, sm: 16 }, color: '#f59e0b' }} />
                      {language === 'hi' ? 'मध्यम' : 'Medium'}
                    </Box>
                  </MenuItem>
                  <MenuItem value="high" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriorityHigh sx={{ fontSize: { xs: 14, sm: 16 }, color: '#ef4444' }} />
                      {language === 'hi' ? 'उच्च' : 'High'}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={t('support.subject')}
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }
                }}
              />
              <TextField
                fullWidth
                label={language === 'hi' ? 'विवरण' : 'Description'}
                value={ticket.description}
                onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                multiline
                rows={4}
                size="small"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 }, gap: { xs: 1, sm: 1.5 } }}>
            <Button 
              onClick={() => {
                setTicketDialog(false);
                setTicket({ category: '', priority: 'medium', subject: '', description: '' });
              }}
              sx={{ 
                borderRadius: { xs: 1, sm: 1.5 }, 
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Assignment sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
              onClick={handleCreateTicket}
              disabled={!ticket.category || !ticket.subject || !ticket.description}
              sx={{ 
                borderRadius: { xs: 1, sm: 1.5 }, 
                fontWeight: 700, 
                background: gradients.primary,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {t('support.createTicket')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileLayout>
  );
}

