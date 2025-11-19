import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Chip, Typography, alpha, Button } from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  LocationOn,
  AccessTime,
  QrCode2,
  Receipt,
  LibraryBooks,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/MobileLayout';
import { SectionHeader, ListItem, EmptyState, LoadingState, BadgeChip } from '../components/MobileComponents';
import { CompactCard } from '../components/MobileCard';
import { gradients } from '../theme/mobileTheme';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingsMobileProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function BookingsMobile({ setIsAuthenticated }: BookingsMobileProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // Mock data
      setBookings([
        {
          id: 1,
          library: { name: 'Central Library', address: 'Downtown, City Center' },
          seatNumber: 'A-12',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 90000000).toISOString(),
          status: 'confirmed',
          totalAmount: 150,
          date: new Date(Date.now() + 86400000).toLocaleDateString(),
        },
        {
          id: 2,
          library: { name: 'Tech Hub Library', address: 'Tech Park, Phase 1' },
          seatNumber: 'B-05',
          startTime: new Date(Date.now() + 172800000).toISOString(),
          endTime: new Date(Date.now() + 176400000).toISOString(),
          status: 'confirmed',
          totalAmount: 200,
          date: new Date(Date.now() + 172800000).toLocaleDateString(),
        },
        {
          id: 3,
          library: { name: 'Green Study Center', address: 'Green Avenue' },
          seatNumber: 'C-08',
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() - 82800000).toISOString(),
          status: 'completed',
          totalAmount: 120,
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
        },
        {
          id: 4,
          library: { name: 'Elite Study Lounge', address: 'Business District' },
          seatNumber: 'D-03',
          startTime: new Date(Date.now() - 172800000).toISOString(),
          endTime: new Date(Date.now() - 169200000).toISOString(),
          status: 'cancelled',
          totalAmount: 300,
          date: new Date(Date.now() - 172800000).toLocaleDateString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'completed':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 20 }} />;
      case 'pending':
        return <Pending sx={{ fontSize: 20 }} />;
      default:
        return <Schedule sx={{ fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#6366f1';
      case 'cancelled':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 0) return booking.status === 'confirmed';
    if (activeTab === 1) return booking.status === 'completed';
    if (activeTab === 2) return ['cancelled', 'pending'].includes(booking.status);
    return true;
  });

  const upcomingCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const otherCount = bookings.filter(b => ['cancelled', 'pending'].includes(b.status)).length;

  if (loading) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <LoadingState message={t('bookings.loading')} />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ animation: 'fadeIn 0.4s ease-in' }}>
        {/* Header */}
        <SectionHeader
          title={t('bookings.title')}
          subtitle={t('bookings.subtitle')}
        />

        {/* Tabs */}
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 2.5,
            p: 0.75,
            mb: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                borderRadius: 1.5,
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: alpha('#6366f1', 0.12),
                  color: '#6366f1',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab label={`${t('bookings.upcoming')} (${upcomingCount})`} />
            <Tab label={`${t('status.completed')} (${completedCount})`} />
            <Tab label={`${t('bookings.other')} (${otherCount})`} />
          </Tabs>
        </Box>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredBookings.map((booking) => {
              const statusColor = getStatusColor(booking.status);
              
              return (
                <CompactCard key={booking.id} sx={{ p: 0, overflow: 'hidden' }}>
                  {/* Header with Status */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: alpha(statusColor, 0.08),
                      borderBottom: `1px solid ${alpha(statusColor, 0.12)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: statusColor, display: 'flex' }}>
                        {getStatusIcon(booking.status)}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                        {booking.status}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      #{booking.id}
                    </Typography>
                  </Box>

                  {/* Booking Details */}
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          background: gradients.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        <LibraryBooks sx={{ fontSize: 28 }} />
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.063rem' }}>
                          {booking.library.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="truncate">
                          <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.25 }} />
                          {booking.library.address}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Booking Info */}
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                        mb: 2,
                        p: 1.5,
                        bgcolor: alpha('#6366f1', 0.04),
                        borderRadius: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t('bookings.date')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          <CalendarMonth sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          {booking.date}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t('bookings.seat')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {t('bookings.seat')} {booking.seatNumber}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t('bookings.time')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                          {new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {t('bookings.amount')}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          ₹{booking.totalAmount}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    {booking.status === 'confirmed' && (
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<QrCode2 />}
                          fullWidth
                          sx={{ borderRadius: 1.5, fontWeight: 600 }}
                        >
                          {t('bookings.qrCode')}
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Receipt />}
                          fullWidth
                          sx={{
                            background: gradients.primary,
                            borderRadius: 1.5,
                            fontWeight: 600,
                          }}
                        >
                          {t('bookings.receipt')}
                        </Button>
                      </Box>
                    )}
                    
                    {booking.status === 'completed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ borderRadius: 1.5, fontWeight: 600 }}
                      >
                        {t('bookings.leaveReview')}
                      </Button>
                    )}
                  </Box>
                </CompactCard>
              );
            })}
          </Box>
        ) : (
          <EmptyState
            icon={<BookOnline />}
            title={t('bookings.noBookings')}
            description={t('bookings.noBookingsInCategory')}
            action={
              <Button
                variant="contained"
                startIcon={<LibraryBooks />}
                onClick={() => navigate('/libraries')}
                sx={{
                  background: gradients.primary,
                  borderRadius: 2,
                  px: 3,
                }}
              >
                {t('bookings.browseLibraries')}
              </Button>
            }
          />
        )}
      </Box>
    </MobileLayout>
  );
}

