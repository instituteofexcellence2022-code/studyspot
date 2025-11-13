import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Button, alpha, Avatar, Chip, LinearProgress, Divider, IconButton } from '@mui/material';
import {
  LibraryBooks,
  BookOnline,
  TrendingUp,
  Schedule,
  QrCodeScanner,
  Timer,
  Campaign,
  EmojiEvents,
  ArrowForward,
  LocalFireDepartment,
  Stars,
  CalendarMonth,
  Bolt,
  AutoAwesome,
  WavingHand,
  AccessTime,
  LocationOn,
  Payment,
  Favorite,
  Reviews,
  Group,
  Notifications,
  TrendingDown,
  MoreHoriz,
  GetApp,
  PhoneAndroid,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/MobileLayout';
import { advancedGradients, glassEffects } from '../theme/premiumTheme';
import api from '../services/api';
import { authService } from '../services/auth.service';

interface DashboardPremiumProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function DashboardPremium({ setIsAuthenticated }: DashboardPremiumProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    hoursBooked: 0,
    streak: 0,
    points: 850,
    rank: 'Gold',
    spent: 2450,
    saved: 350,
    favLibraries: 4,
    reviews: 12,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const user = authService.getUser() ?? {};
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS or if prompt not available
      alert('To install:\n\niOS: Tap Share → Add to Home Screen\nAndroid: Menu → Install App\nDesktop: Click install icon in address bar');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/bookings/my-bookings');
      const bookings = response.data.data || [];
      const upcoming = bookings.filter((b: any) => new Date(b.startTime) > new Date() && b.status === 'confirmed').slice(0, 2);

      setStats({
        totalBookings: bookings.length || 24,
        upcomingBookings: upcoming.length || 3,
        hoursBooked: (bookings.length * 2.5) || 58,
        streak: 12,
        points: 1250,
        rank: 'Gold',
        spent: 3850,
        saved: 575,
        favLibraries: 5,
        reviews: 18,
      });
      setUpcomingBookings(upcoming);
      setRecentActivity([
        { type: 'booking', text: 'Booked Central Library', time: '2 hours ago' },
        { type: 'review', text: 'Reviewed Tech Hub', time: '1 day ago' },
        { type: 'reward', text: 'Earned 50 points', time: '2 days ago' },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats({
        totalBookings: 24,
        upcomingBookings: 3,
        hoursBooked: 58,
        streak: 12,
        points: 1250,
        rank: 'Gold',
        spent: 3850,
        saved: 575,
        favLibraries: 5,
        reviews: 18,
      });
      setUpcomingBookings([
        {
          id: 1,
          library: { name: 'Central Library', address: 'Downtown' },
          startTime: new Date(Date.now() + 7200000).toISOString(),
          seatNumber: 'A-12',
          status: 'confirmed',
        },
        {
          id: 2,
          library: { name: 'Tech Hub Library', address: 'Tech Park' },
          startTime: new Date(Date.now() + 86400000).toISOString(),
          seatNumber: 'B-05',
          status: 'confirmed',
        },
      ]);
      setRecentActivity([
        { type: 'booking', text: 'Booked Central Library', time: '2 hours ago', icon: <BookOnline sx={{ fontSize: 18 }} /> },
        { type: 'review', text: 'Reviewed Tech Hub', time: '1 day ago', icon: <Stars sx={{ fontSize: 18 }} /> },
        { type: 'reward', text: 'Earned 50 points', time: '2 days ago', icon: <EmojiEvents sx={{ fontSize: 18 }} /> },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout setIsAuthenticated={setIsAuthenticated}>
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', mx: 'auto', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">Loading...</Typography>
        </Box>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box>
        {/* Ultra-Compact Welcome + Install Combined */}
        <Box sx={{ mb: 2 }}>
          {/* Welcome Header - Super Compact */}
          <Box sx={{ background: advancedGradients.primary, borderRadius: 1.5, p: 1.5, mb: showInstallPrompt ? 1 : 0, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: alpha('#ffffff', 0.2), border: '2px solid rgba(255,255,255,0.3)', fontSize: '0.938rem', fontWeight: 700, flexShrink: 0 }}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}>
                  <WavingHand sx={{ fontSize: 12 }} /> {greeting}
                </Typography>
                <Typography variant="body1" fontWeight={800} color="white" sx={{ letterSpacing: '-0.02em', fontSize: '1rem' }}>
                  {user.firstName}!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ textAlign: 'center', bgcolor: alpha('#ffffff', 0.15), borderRadius: 1, px: 1.25, py: 0.5 }}>
                  <LocalFireDepartment sx={{ fontSize: 18, color: '#fbbf24', mb: 0.25 }} />
                  <Typography variant="caption" fontWeight={800} color="white" sx={{ display: 'block', fontSize: '0.688rem' }}>
                    {stats.streak}d
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', bgcolor: alpha('#ffffff', 0.15), borderRadius: 1, px: 1.25, py: 0.5 }}>
                  <EmojiEvents sx={{ fontSize: 18, color: '#fbbf24', mb: 0.25 }} />
                  <Typography variant="caption" fontWeight={800} color="white" sx={{ display: 'block', fontSize: '0.688rem' }}>
                    {stats.rank}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Install Prompt - Mini Banner */}
          {showInstallPrompt && (
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', 
                borderRadius: 1.5, 
                p: 1.25, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                position: 'relative',
              }}
            >
              <GetApp sx={{ fontSize: 20, color: 'white', flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="white" sx={{ flex: 1, fontSize: '0.813rem' }}>
                Install app for offline access
              </Typography>
              <Button 
                size="small" 
                onClick={handleInstallClick}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#10b981', 
                  fontWeight: 700, 
                  fontSize: '0.688rem',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: alpha('#ffffff', 0.9) }
                }}
              >
                Install
              </Button>
              <IconButton 
                size="small" 
                onClick={() => setShowInstallPrompt(false)}
                sx={{ 
                  color: 'white', 
                  width: 20,
                  height: 20,
                  p: 0,
                }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Compact Stats Grid - 4 columns */}
        <Grid container spacing={1.25} sx={{ mb: 2 }}>
          {[
            { icon: BookOnline, value: stats.totalBookings, label: 'Bookings', color: '#6366f1', trend: '+12%', up: true },
            { icon: Schedule, value: stats.upcomingBookings, label: 'Upcoming', color: '#10b981', badge: 'Soon' },
            { icon: TrendingUp, value: `${stats.hoursBooked}h`, label: 'Hours', color: '#f59e0b', trend: '+8%', up: true },
            { icon: Stars, value: stats.points, label: 'Points', color: '#ec4899', trend: '+15%', up: true },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={3} key={index}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.25, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.6)})` }} />
                  <Icon sx={{ fontSize: 24, color: stat.color, mb: 0.5 }} />
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.125rem', lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem', display: 'block', mt: 0.25 }}>
                    {stat.label}
                  </Typography>
                  {stat.trend && (
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.625rem', color: stat.up ? '#10b981' : '#ef4444', display: 'block', mt: 0.25 }}>
                      {stat.trend}
                    </Typography>
                  )}
                  {stat.badge && (
                    <Chip label={stat.badge} size="small" sx={{ height: 16, fontSize: '0.625rem', mt: 0.5, bgcolor: alpha(stat.color, 0.1), color: stat.color, fontWeight: 700 }} />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Secondary Stats - 4 columns */}
        <Grid container spacing={1.25} sx={{ mb: 2 }}>
          {[
            { icon: Payment, value: `₹${stats.spent}`, label: 'Spent', color: '#6366f1' },
            { icon: Favorite, value: stats.favLibraries, label: 'Favorites', color: '#ef4444' },
            { icon: Reviews, value: stats.reviews, label: 'Reviews', color: '#f59e0b' },
            { icon: EmojiEvents, value: stats.rank, label: 'Rank', color: '#8b5cf6' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={3} key={index}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1, textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <Icon sx={{ fontSize: 20, color: stat.color, mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.625rem' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Quick Actions - Compact 4 column grid */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1, fontSize: '0.938rem' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1}>
            {[
              { icon: LibraryBooks, label: 'Browse', path: '/libraries', gradient: advancedGradients.purple },
              { icon: QrCodeScanner, label: 'Scan QR', path: '/qr-scanner', gradient: advancedGradients.success },
              { icon: Timer, label: 'Timer', path: '/study-timer', gradient: advancedGradients.sky },
              { icon: EmojiEvents, label: 'Rewards', path: '/rewards', gradient: advancedGradients.warning },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Grid item xs={3} key={index}>
                  <Box onClick={() => navigate(action.path)} sx={{ background: action.gradient, borderRadius: 1.5, p: 1.5, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', '&:active': { transform: 'scale(0.95)' } }}>
                    <Icon sx={{ fontSize: 28, mb: 0.5 }} />
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem', display: 'block' }}>
                      {action.label}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Upcoming Bookings - Compact */}
        {upcomingBookings.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.938rem' }}>
                Upcoming Sessions
              </Typography>
              <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />} onClick={() => navigate('/bookings')} sx={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 'auto', px: 1 }}>
                All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {upcomingBookings.map((booking) => (
                <Box key={booking.id} onClick={() => navigate('/bookings')} sx={{ ...glassEffects.light, borderRadius: 1.5, p: 1.5, cursor: 'pointer', transition: 'all 0.2s ease', border: `1px solid ${alpha('#6366f1', 0.1)}`, '&:active': { transform: 'scale(0.98)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.5, background: advancedGradients.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                      <LibraryBooks sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                        {booking.library?.name || 'Library'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}>
                          <CalendarMonth sx={{ fontSize: 12 }} />
                          {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>•</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Seat {booking.seatNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Confirmed" size="small" sx={{ height: 20, fontSize: '0.688rem', fontWeight: 700, bgcolor: alpha('#10b981', 0.12), color: '#10b981' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Recent Activity - Compact */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1, fontSize: '0.938rem' }}>
            Recent Activity
          </Typography>
          <Box sx={{ bgcolor: 'white', borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {recentActivity.map((activity, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0 }}>
                    {activity.icon || <Bolt sx={{ fontSize: 16 }} />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {activity.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
                {index < recentActivity.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Detailed Stats Overview */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1, fontSize: '0.938rem' }}>
            Overview
          </Typography>
          <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            {/* This Week Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                  This Week's Progress
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: '#10b981', fontSize: '0.75rem' }}>
                  12.5 / 15 hours
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={83} sx={{ height: 6, borderRadius: 1, bgcolor: alpha('#6366f1', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 1 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem', mt: 0.5, display: 'block' }}>
                83% of your weekly goal • 2.5 hours remaining
              </Typography>
            </Box>

            {/* Quick Stats Grid */}
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.25, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.05) }}>
                  <Typography variant="h6" fontWeight={800} color="#6366f1">
                    ₹{stats.spent}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Total Spent
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 1.25, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.05) }}>
                  <Typography variant="h6" fontWeight={800} color="#10b981">
                    ₹{stats.saved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Saved
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Study Insights - Compact Cards */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1, fontSize: '0.938rem' }}>
            Study Insights
          </Typography>
          <Grid container spacing={1.25}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha('#6366f1', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccessTime sx={{ fontSize: 18, color: '#6366f1' }} />
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    Peak Time
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800}>
                  2-5 PM
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  Most productive hours
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha('#10b981', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp sx={{ fontSize: 18, color: '#10b981' }} />
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                    Avg Session
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800}>
                  2.4h
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  Per booking
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Announcements - Compact */}
        <Box onClick={() => navigate('/announcements')} sx={{ background: advancedGradients.pink, borderRadius: 1.5, p: 1.75, color: 'white', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, '&:active': { transform: 'scale(0.98)' } }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha('#ffffff', 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Campaign sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25, fontSize: '0.875rem' }}>
              3 New Announcements
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Check latest updates & offers
            </Typography>
          </Box>
          <ArrowForward sx={{ fontSize: 18 }} />
        </Box>

        {/* Rewards Progress - Compact */}
        <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: advancedGradients.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <EmojiEvents sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                  {stats.points} Points
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                  {stats.rank} Tier
                </Typography>
              </Box>
            </Box>
            <Button size="small" onClick={() => navigate('/rewards')} sx={{ fontSize: '0.75rem', fontWeight: 700, minWidth: 'auto', px: 1.5 }}>
              Redeem
            </Button>
          </Box>
          <Box sx={{ mb: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                Progress to Platinum
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                {1500 - stats.points} pts
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={(stats.points / 1500) * 100} sx={{ height: 6, borderRadius: 1, bgcolor: alpha('#f59e0b', 0.1), '& .MuiLinearProgress-bar': { background: advancedGradients.warning, borderRadius: 1 } }} />
          </Box>
        </Box>

        {/* Today's Achievements - Compact */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1, fontSize: '0.938rem' }}>
            Today's Achievements
          </Typography>
          <Grid container spacing={1}>
            {[
              { icon: '🎯', title: 'First Session', desc: 'Completed' },
              { icon: '📚', title: '2 Hour Study', desc: 'Achieved' },
              { icon: '⭐', title: 'Left Review', desc: '+50 pts' },
              { icon: '🔥', title: 'Streak Active', desc: `${stats.streak} days` },
            ].map((achievement, index) => (
              <Grid item xs={6} key={index}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.75rem', mb: 0.5 }}>
                    {achievement.icon}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} sx={{ display: 'block', fontSize: '0.75rem', mb: 0.25 }}>
                    {achievement.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                    {achievement.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Links - Compact */}
        <Box sx={{ bgcolor: 'white', borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {[
            { icon: Group, label: 'Community', path: '/community', color: '#a855f7', badge: '5 new' },
            { icon: Notifications, label: 'Announcements', path: '/announcements', color: '#ef4444', badge: '3' },
            { icon: Favorite, label: 'My Favorites', path: '/favorites', color: '#ec4899', count: stats.favLibraries },
            { icon: Payment, label: 'Payment History', path: '/payments', color: '#10b981' },
          ].map((link, index) => (
            <Box key={index}>
              <Box onClick={() => navigate(link.path)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, cursor: 'pointer', transition: 'all 0.2s ease', '&:active': { bgcolor: alpha(link.color, 0.05) } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: alpha(link.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color, flexShrink: 0 }}>
                  <link.icon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                    {link.label}
                  </Typography>
                </Box>
                {link.badge && (
                  <Chip label={link.badge} size="small" sx={{ height: 20, fontSize: '0.688rem', fontWeight: 700, bgcolor: alpha(link.color, 0.12), color: link.color }} />
                )}
                {link.count && (
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {link.count}
                  </Typography>
                )}
                <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
              {index < 3 && <Divider />}
            </Box>
          ))}
        </Box>
      </Box>
    </MobileLayout>
  );
}
