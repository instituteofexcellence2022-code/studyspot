import { useState } from 'react';
import { Box, Typography, Avatar, Button, alpha, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid } from '@mui/material';
import {
  Edit,
  Phone,
  Email,
  LocationOn,
  ChevronRight,
  Logout,
  Payment,
  Notifications,
  Security,
  Language,
  Help,
  Info,
  Share,
  Star,
  BookOnline,
  EmojiEvents,
  LocalFireDepartment,
  Close,
  Camera,
  Save,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/MobileLayout';
import { GradientCard } from '../components/MobileCard';
import { ListItem, StatCard, SectionHeader } from '../components/MobileComponents';
import { gradients } from '../theme/mobileTheme';
import { authService } from '../services/auth.service';

interface ProfileMobileProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function ProfileMobile({ setIsAuthenticated }: ProfileMobileProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getUser() ?? {});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    city: user.city || '',
  });
  
  const stats = {
    bookings: 24,
    reviews: 12,
    points: 850,
    streak: 7,
  };

  const handleEditProfile = () => {
    setEditedUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      city: user.city || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    authService.updateUser(editedUser);
    setUser(authService.getUser() ?? {});
    setEditDialogOpen(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Failed to logout cleanly', error);
      } finally {
        setIsAuthenticated(false);
        navigate('/login');
      }
    }
  };

  const handleShareProfile = () => {
    const shareText = `Check out my StudySpot profile! I've completed ${stats.bookings} bookings and have a ${stats.streak}-day streak! 🔥`;
    if (navigator.share) {
      navigator.share({
        title: 'My StudySpot Profile',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Profile info copied to clipboard!');
    }
  };

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ animation: 'fadeIn 0.4s ease-in' }}>
        {/* Profile Header Card */}
        <GradientCard gradient={gradients.primary} sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                bgcolor: alpha('#ffffff', 0.25),
                border: '4px solid rgba(255,255,255,0.4)',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'white',
                color: 'primary.main',
                width: 28,
                height: 28,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <Camera sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            {user.firstName} {user.lastName}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            {user.email}
          </Typography>

          {user.phone && (
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 2 }}>
              📱 {user.phone}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditProfile}
              sx={{
                bgcolor: alpha('#ffffff', 0.25),
                '&:hover': { bgcolor: alpha('#ffffff', 0.35) },
                backdropFilter: 'blur(10px)',
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.813rem',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={handleShareProfile}
              sx={{
                bgcolor: alpha('#ffffff', 0.25),
                '&:hover': { bgcolor: alpha('#ffffff', 0.35) },
                backdropFilter: 'blur(10px)',
                borderRadius: 1.5,
                fontWeight: 700,
                fontSize: '0.813rem',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              Share
            </Button>
          </Box>
        </GradientCard>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 1,
          mb: 2
        }}>
          <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha('#6366f1', 0.12),
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.75,
              }}
            >
              <BookOnline sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.125rem' }}>
              {stats.bookings}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
              Bookings
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha('#f59e0b', 0.12),
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.75,
              }}
            >
              <Star sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.125rem' }}>
              {stats.reviews}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
              Reviews
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha('#10b981', 0.12),
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.75,
              }}
            >
              <EmojiEvents sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.125rem' }}>
              {stats.points}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
              Points
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', bgcolor: 'white', borderRadius: 1.5, p: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha('#ef4444', 0.12),
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 0.75,
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.125rem' }}>
              {stats.streak}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
              Days
            </Typography>
          </Box>
        </Box>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<Payment />}
            title="Payment Methods"
            subtitle="Manage your payment options"
            onClick={() => navigate('/payments')}
            color="#10b981"
          />
          <ListItem
            icon={<BookOnline />}
            title="My Bookings"
            subtitle="View booking history"
            onClick={() => navigate('/bookings')}
            color="#6366f1"
          />
          <ListItem
            icon={<Star />}
            title="My Reviews"
            subtitle="Reviews you've written"
            onClick={() => navigate('/reviews')}
            color="#f59e0b"
          />
        </Box>

        {/* Settings Section */}
        <SectionHeader title="Settings" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<Notifications />}
            title="Notifications"
            subtitle="Manage notification preferences"
            onClick={() => alert('Notification settings coming soon!')}
            color="#8b5cf6"
          />
          <ListItem
            icon={<Security />}
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onClick={() => alert('Privacy settings coming soon!')}
            color="#ef4444"
          />
          <ListItem
            icon={<Language />}
            title="Language"
            subtitle="English"
            onClick={() => alert('Language selection coming soon!')}
            color="#3b82f6"
          />
        </Box>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<Help />}
            title="Help Center"
            subtitle="Get help with your account"
            onClick={() => navigate('/support')}
            color="#10b981"
          />
          <ListItem
            icon={<Share />}
            title="Share App"
            subtitle="Invite friends to StudySpot"
            onClick={handleShareProfile}
            color="#ec4899"
          />
          <ListItem
            icon={<Info />}
            title="About"
            subtitle="Version 1.0.0"
            onClick={() => alert('StudySpot Student Portal v1.0.0\n\nUltra-premium mobile experience\nDesigned for modern students')}
            color="#64748b"
          />
        </Box>

        {/* Logout Button */}
        <Box
          onClick={handleLogout}
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha('#ef4444', 0.1),
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            fontWeight: 700,
            mb: 2,
            border: `1px solid ${alpha('#ef4444', 0.2)}`,
            '&:active': {
              transform: 'scale(0.98)',
              bgcolor: alpha('#ef4444', 0.15),
            },
          }}
        >
          <Logout />
          <Typography variant="body1" fontWeight={700}>
            Logout
          </Typography>
        </Box>

        {/* Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: 2,
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>
                Edit Profile
              </Typography>
              <IconButton size="small" onClick={() => setEditDialogOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    size="small"
                    placeholder="+91 98765 43210"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editedUser.city}
                    onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
                    size="small"
                    placeholder="Mumbai, Delhi, etc."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              sx={{ borderRadius: 1.5, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveProfile}
              startIcon={<Save />}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 700,
                background: gradients.primary,
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileLayout>
  );
}
