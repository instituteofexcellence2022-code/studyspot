import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Badge,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Divider,
} from '@mui/material';
import {
  Campaign,
  Notifications,
  LocalOffer,
  Build,
  School,
  TrendingUp,
  Star,
  Circle,
  Search,
  FilterList,
  MarkEmailRead,
} from '@mui/icons-material';
import Layout from '../components/MobileLayout';
import api from '../services/api';

interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'library' | 'platform' | 'offer' | 'maintenance' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  imageUrl?: string;
  link?: string;
  libraryName?: string;
}

const ANNOUNCEMENT_CATEGORIES = [
  { value: 'all', label: 'All', icon: <Campaign />, color: '#1976d2' },
  { value: 'library', label: 'Library', icon: <School />, color: '#388e3c' },
  { value: 'platform', label: 'Platform', icon: <TrendingUp />, color: '#7b1fa2' },
  { value: 'offer', label: 'Offers', icon: <LocalOffer />, color: '#f57c00' },
  { value: 'maintenance', label: 'Maintenance', icon: <Build />, color: '#d32f2f' },
  { value: 'achievement', label: 'Achievements', icon: <Star />, color: '#fbc02d' },
];

export default function AnnouncementsPage({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/api/announcements');
      setAnnouncements(response.data.data || mockAnnouncements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements(mockAnnouncements);
    }
  };

  const mockAnnouncements: Announcement[] = [
    {
      id: '1',
      title: '🎉 New Study Rooms Available!',
      message: 'We have added 5 new private study rooms with AC and WiFi. Book now for group study sessions!',
      category: 'library',
      priority: 'high',
      isRead: false,
      createdAt: '2024-11-03T10:00:00Z',
      libraryName: 'Central Library',
      imageUrl: 'https://via.placeholder.com/400x200?text=New+Study+Rooms',
    },
    {
      id: '2',
      title: '🏆 Congratulations! You earned a badge!',
      message: 'You have completed 30 days of continuous attendance! You earned the "Consistency Master" badge and 500 bonus points.',
      category: 'achievement',
      priority: 'medium',
      isRead: false,
      createdAt: '2024-11-03T08:00:00Z',
    },
    {
      id: '3',
      title: '💰 Flash Sale: 50% OFF on Monthly Plans',
      message: 'Limited time offer! Get 50% discount on all monthly seat bookings. Use code: FLASH50. Valid till Nov 5th.',
      category: 'offer',
      priority: 'high',
      isRead: false,
      createdAt: '2024-11-02T18:00:00Z',
      expiresAt: '2024-11-05T23:59:59Z',
    },
    {
      id: '4',
      title: '⚠️ Scheduled Maintenance',
      message: 'Library will be closed for maintenance on Nov 5th from 2 PM to 4 PM. All bookings during this time will be rescheduled.',
      category: 'maintenance',
      priority: 'high',
      isRead: true,
      createdAt: '2024-11-01T15:00:00Z',
      libraryName: 'Central Library',
    },
    {
      id: '5',
      title: '📱 Mobile App Update Available',
      message: 'We have released a new version of the app with improved performance and new features. Update now!',
      category: 'platform',
      priority: 'medium',
      isRead: true,
      createdAt: '2024-10-31T12:00:00Z',
    },
    {
      id: '6',
      title: '📚 New E-books Added',
      message: 'We have added 50+ new e-books for UPSC, JEE, and NEET preparation. Check the Resources section now!',
      category: 'library',
      priority: 'low',
      isRead: true,
      createdAt: '2024-10-30T09:00:00Z',
      libraryName: 'Central Library',
    },
    {
      id: '7',
      title: '🎁 Referral Program: Earn ₹500',
      message: 'Refer a friend and earn ₹500 when they make their first booking. Your friend also gets ₹200 discount!',
      category: 'offer',
      priority: 'medium',
      isRead: true,
      createdAt: '2024-10-28T10:00:00Z',
    },
  ];

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await api.post(`/api/announcements/${announcementId}/read`);
      setAnnouncements(announcements.map(a => 
        a.id === announcementId ? { ...a, isRead: true } : a
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // Update locally anyway
      setAnnouncements(announcements.map(a => 
        a.id === announcementId ? { ...a, isRead: true } : a
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/announcements/read-all');
      setAnnouncements(announcements.map(a => ({ ...a, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setAnnouncements(announcements.map(a => ({ ...a, isRead: true })));
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesTab = tab === 0 || (tab === 1 && !announcement.isRead);
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    const matchesSearch = announcement.title.toLowerCase().includes(search.toLowerCase()) ||
                         announcement.message.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const unreadCount = announcements.filter(a => !a.isRead).length;

  const getCategoryIcon = (category: string) => {
    const cat = ANNOUNCEMENT_CATEGORIES.find(c => c.value === category);
    return cat?.icon || <Notifications />;
  };

  const getCategoryColor = (category: string) => {
    const cat = ANNOUNCEMENT_CATEGORIES.find(c => c.value === category);
    return cat?.color || '#1976d2';
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <Chip label="Important" color="error" size="small" />;
    if (priority === 'medium') return <Chip label="Notice" color="warning" size="small" />;
    return null;
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📢 Announcements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Stay updated with latest news and offers
            </Typography>
          </Box>
          <Badge badgeContent={unreadCount} color="error">
            <Button
              variant="outlined"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
          </Badge>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Category Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {ANNOUNCEMENT_CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              icon={cat.icon}
              label={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              color={selectedCategory === cat.value ? 'primary' : 'default'}
              variant={selectedCategory === cat.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`All (${announcements.length})`} />
          <Tab 
            label={`Unread (${unreadCount})`} 
            icon={unreadCount > 0 ? <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }} /> : undefined}
            iconPosition="start"
          />
        </Tabs>

        {/* Announcements List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              sx={{ 
                position: 'relative',
                borderLeft: announcement.isRead ? 'none' : '4px solid',
                borderColor: getCategoryColor(announcement.category),
                bgcolor: announcement.isRead ? 'background.paper' : 'action.hover',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: getCategoryColor(announcement.category), width: 56, height: 56 }}>
                    {getCategoryIcon(announcement.category)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      {!announcement.isRead && (
                        <Circle sx={{ fontSize: 12, color: 'primary.main' }} />
                      )}
                      <Chip 
                        label={announcement.category} 
                        size="small" 
                        sx={{ bgcolor: getCategoryColor(announcement.category), color: 'white' }}
                      />
                      {getPriorityBadge(announcement.priority)}
                      {announcement.libraryName && (
                        <Chip label={announcement.libraryName} size="small" variant="outlined" />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {new Date(announcement.createdAt).toLocaleDateString()} • {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {announcement.message}
                    </Typography>
                    {announcement.imageUrl && (
                      <Box sx={{ mb: 2 }}>
                        <img src={announcement.imageUrl} alt={announcement.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                      </Box>
                    )}
                    {announcement.expiresAt && (
                      <Typography variant="caption" color="error.main">
                        ⏰ Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {announcement.link && (
                        <Button size="small" variant="contained">
                          Learn More
                        </Button>
                      )}
                      {!announcement.isRead && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleMarkAsRead(announcement.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {filteredAnnouncements.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No announcements found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for updates
            </Typography>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

