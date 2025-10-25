import React, { useState } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const HelpPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const helpSections = [
    {
      id: 'getting-started',
      icon: <HelpOutlineIcon />,
      title: 'Getting Started',
      color: '#1976d2',
      topics: [
        {
          question: 'How do I register for StudySpot?',
          answer: 'Click on "Sign Up" in the top right corner, fill in your details including name, email, and password, then verify your email address through the link sent to your inbox.',
        },
        {
          question: 'How do I login to my account?',
          answer: 'Click "Login" and enter your registered email and password. If you forget your password, use the "Forgot Password" link to reset it.',
        },
        {
          question: 'How do I set up my profile?',
          answer: 'After logging in, go to Profile > Settings. Upload a profile picture, update your contact information, and set your notification preferences.',
        },
      ],
    },
    {
      id: 'booking',
      icon: <BookIcon />,
      title: 'Booking a Seat',
      color: '#2e7d32',
      topics: [
        {
          question: 'How do I find libraries near me?',
          answer: 'Go to "Libraries" from the main menu. Use the search bar to enter your location or browse the map view. You can filter by amenities, price range, and availability.',
        },
        {
          question: 'How do I select and book a seat?',
          answer: 'Choose a library, view its seat map, select an available seat (shown in green), choose your time slot, and click "Book Now". Review the details and proceed to payment.',
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We accept credit/debit cards, UPI, net banking, and wallet payments through our secure payment gateway powered by Stripe.',
        },
      ],
    },
    {
      id: 'managing-bookings',
      icon: <PaymentIcon />,
      title: 'Managing Bookings',
      color: '#ed6c02',
      topics: [
        {
          question: 'How can I view my bookings?',
          answer: 'Click on "My Bookings" in the main menu to see all your current and past bookings. You can filter by status (active, completed, cancelled).',
        },
        {
          question: 'Can I cancel my booking?',
          answer: 'Yes, go to "My Bookings", select the booking you want to cancel, and click "Cancel Booking". Cancellation must be done at least 24 hours before the booking start time.',
        },
        {
          question: 'What is the refund policy?',
          answer: 'Cancellations made 24+ hours before: 100% refund. 12-24 hours before: 50% refund. Less than 12 hours: No refund. Refunds are processed within 5-7 business days.',
        },
      ],
    },
    {
      id: 'account',
      icon: <PersonIcon />,
      title: 'Account Settings',
      color: '#9c27b0',
      topics: [
        {
          question: 'How do I update my profile information?',
          answer: 'Go to Profile > Settings. Here you can update your name, email, phone number, and profile picture. Changes are saved automatically.',
        },
        {
          question: 'How do I change my password?',
          answer: 'Go to Profile > Settings > Security. Click "Change Password", enter your current password, then your new password twice for confirmation.',
        },
        {
          question: 'How do I manage notification preferences?',
          answer: 'Go to Profile > Settings > Notifications. Toggle on/off email and SMS notifications for bookings, reminders, and promotional updates.',
        },
      ],
    },
    {
      id: 'library-owners',
      icon: <BusinessIcon />,
      title: 'For Library Owners',
      color: '#d32f2f',
      topics: [
        {
          question: 'How do I add my library to StudySpot?',
          answer: 'Click "Add Library" from your dashboard. Fill in library details including name, address, amenities, pricing, and upload photos. Submit for verification.',
        },
        {
          question: 'How do I manage seats and availability?',
          answer: 'Go to Library Management > Seat Configuration. Set up your seat layout, mark seats as available/unavailable, and set pricing for different zones.',
        },
        {
          question: 'How can I view analytics and revenue?',
          answer: 'Access your Analytics Dashboard to view booking trends, revenue reports, occupancy rates, and customer insights. Export reports as PDF or Excel.',
        },
      ],
    },
    {
      id: 'subscription',
      icon: <SecurityIcon />,
      title: 'Subscriptions & Plans',
      color: '#0288d1',
      topics: [
        {
          question: 'What subscription plans are available?',
          answer: 'We offer Free (₹0/mo), Starter (₹99/mo), Professional (₹249/mo), and Enterprise (₹599/mo) plans. Each plan has different limits on libraries, users, and SMS credits.',
        },
        {
          question: 'How do I upgrade my plan?',
          answer: 'Go to Subscription > Plans, select the plan you want, and click "Upgrade". Payment will be pro-rated based on your current billing cycle.',
        },
        {
          question: 'Can I cancel my subscription?',
          answer: 'Yes, go to Subscription > Manage and click "Cancel Subscription". You will retain access until the end of your current billing period.',
        },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption (SSL/TLS) and PCI-DSS compliant payment processing through Stripe. We never store your complete card details.',
    },
    {
      question: 'Can I book multiple seats at once?',
      answer: 'Yes, select multiple seats on the seat map before proceeding to checkout. All seats will be reserved under a single booking.',
    },
    {
      question: 'Do I need to verify my email?',
      answer: 'Yes, email verification is required to activate your account and ensure account security. Check your inbox for the verification link.',
    },
    {
      question: 'What happens if I miss my booking?',
      answer: 'Missed bookings (no-shows) are automatically marked as completed. No refund is provided. Please cancel in advance if you cannot attend.',
    },
    {
      question: 'How do I contact support?',
      answer: 'Email us at support@studyspot.com or use the chat widget in the bottom-right corner for instant support. We respond within 24 hours.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <HelpOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          Help Center
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Everything you need to know about StudySpot
        </Typography>
      </Box>

      {/* Quick Links */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6 }}>
        {helpSections.map((section) => (
          <Box key={section.id} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: '100%' }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => setExpanded(section.id)}
            >
              <CardContent>
                <Box sx={{ color: section.color, mb: 2 }}>
                  {React.cloneElement(section.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {section.topics.length} topics
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Detailed Topics */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Detailed Guides
      </Typography>

      {helpSections.map((section) => (
        <Box key={section.id} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ color: section.color, mr: 2 }}>
              {section.icon}
            </Box>
            <Typography variant="h5">{section.title}</Typography>
          </Box>
          {section.topics.map((topic, index) => (
            <Accordion
              key={index}
              expanded={expanded === `${section.id}-${index}`}
              onChange={handleChange(`${section.id}-${index}`)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{topic.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{topic.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      <Divider sx={{ my: 6 }} />

      {/* FAQs */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Frequently Asked Questions
      </Typography>

      <List>
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <ListItem disableGutters>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={faq.question} />
              </ListItem>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary" sx={{ pl: 7 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </List>

      <Divider sx={{ my: 6 }} />

      {/* Contact Support */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Still Need Help?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Our support team is here to assist you 24/7
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="secondary" size="large">
            Contact Support
          </Button>
          <Button variant="outlined" sx={{ bgcolor: 'white', color: 'primary.main' }} size="large">
            Live Chat
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Chip label="Email: support@studyspot.com" sx={{ bgcolor: 'white', mr: 1 }} />
          <Chip label="Phone: 1800-123-4567" sx={{ bgcolor: 'white' }} />
        </Box>
      </Card>
    </Container>
  );
};

export default HelpPage;


