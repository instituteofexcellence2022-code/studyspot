import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Avatar, Button, alpha, Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, CircularProgress, Alert, Badge, Switch, FormControlLabel, Stack, Chip, MenuItem, Select, FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails, Autocomplete } from '@mui/material';
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
  Email as EmailIcon,
  PhoneAndroid,
  NotificationsActive,
  CalendarToday,
  CreditCard,
  LocalOffer,
  EmojiEvents as AchievementIcon,
  LibraryBooks,
  Groups,
  VolumeUp,
  Vibration,
  Schedule,
  ExpandMore,
  CheckCircle,
  Settings,
  NotificationsOff,
  DoNotDisturb,
  FlashOn,
  HourglassEmpty,
  Today,
  Lock,
  Visibility,
  VisibilityOff,
  Delete,
  Download,
  Devices,
  History,
  Shield,
  VerifiedUser,
  Person,
  Public,
  LockOutlined,
  Key,
  Fingerprint,
  Warning,
  Translate,
  Check,
  WhatsApp,
  Facebook,
  Twitter,
  ContentCopy,
  QrCode,
  Link as LinkIcon,
  Message,
  Badge as BadgeIcon,
  VerifiedUser as VerifiedUserIcon,
  Assignment,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileLayout from '../components/MobileLayout';
import { GradientCard } from '../components/MobileCard';
import { ListItem, StatCard, SectionHeader } from '../components/MobileComponents';
import { gradients } from '../theme/mobileTheme';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileMobileProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function ProfileMobile({ setIsAuthenticated }: ProfileMobileProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState(() => authService.getUser() ?? {});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user.profileImage || user.avatar || null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [privacySecurityOpen, setPrivacySecurityOpen] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // 'public' | 'friends' | 'private'
    showEmail: true,
    showPhone: false,
    showLocation: true,
    allowFriendRequests: true,
    allowMessages: true,
    showActivityStatus: true,
    dataSharing: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [shareAppDialogOpen, setShareAppDialogOpen] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [kycStep, setKycStep] = useState<'aadhaar' | 'otp'>('aadhaar');
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone' | null>(null);
  const [sendingVerificationOtp, setSendingVerificationOtp] = useState(false);
  const [verifyingVerificationOtp, setVerifyingVerificationOtp] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [kycData, setKycData] = useState({
    aadhaarNumber: '',
    otp: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    pincode: '',
    status: 'pending', // 'pending' | 'verified' | 'rejected'
  });
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarned: 0,
  });
  const { language: selectedLanguage, setLanguage, t, language } = useLanguage();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    paymentReminders: true,
    promotionalOffers: true,
    achievementAlerts: true,
    libraryUpdates: true,
    communityUpdates: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationSound: true,
    vibrationEnabled: true,
    notificationFrequency: 'real-time', // 'real-time' | 'hourly' | 'daily'
    priorityOnly: false,
  });
  const [editedUser, setEditedUser] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    addressLine1: (user as any).addressLine1 || '',
    addressLine2: (user as any).addressLine2 || '',
    city: user.city || '',
    state: (user as any).state || '',
    district: (user as any).district || '',
    pincode: (user as any).pincode || '',
    country: (user as any).country || 'India',
  });
  const [fetchingPincode, setFetchingPincode] = useState(false);
  
  const stats = {
    bookings: 24,
    reviews: 12,
    points: 850,
    streak: 7,
  };

  // Sync profile image when user changes
  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileImage(currentUser.profileImage || currentUser.avatar || null);
      
      // Check verification status from user metadata
      const metadata = (currentUser as any).metadata || {};
      setEmailVerified(metadata.emailVerified || false);
      setPhoneVerified(metadata.phoneVerified || false);
    }
  }, []);

  // Load KYC data from backend
  useEffect(() => {
    const loadKycData = async () => {
      try {
        const response = await api.get('/api/users/kyc');
        const kyc = response.data?.data || response.data;
        if (kyc) {
          setKycData({
            aadhaarNumber: kyc.aadhaarNumber || '',
            otp: '',
            fullName: kyc.fullName || '',
            dateOfBirth: kyc.dateOfBirth || '',
            gender: kyc.gender || '',
            address: kyc.address || '',
            pincode: kyc.pincode || '',
            status: kyc.status || 'pending',
          });
        }
      } catch (error) {
        console.warn('Failed to load KYC data:', error);
        // Keep default empty state
      }
    };

    loadKycData();
  }, []);

  // Reset KYC step when dialog closes
  useEffect(() => {
    if (!kycDialogOpen) {
      setKycStep('aadhaar');
      setKycData(prev => ({ ...prev, otp: '' }));
    }
  }, [kycDialogOpen]);

  // Load notification settings from localStorage and backend
  useEffect(() => {
    const loadNotificationSettings = async () => {
      // First, try to load from backend
      try {
        const response = await api.get('/api/users/profile');
        const userProfile = response.data?.data?.user || response.data?.user;
        if (userProfile?.notificationSettings) {
          const backendSettings = {
            emailNotifications: userProfile.notificationSettings.emailNotifications ?? true,
            pushNotifications: userProfile.notificationSettings.pushNotifications ?? true,
            smsNotifications: userProfile.notificationSettings.smsNotifications ?? false,
            bookingReminders: userProfile.notificationSettings.bookingReminders ?? true,
            paymentReminders: userProfile.notificationSettings.paymentReminders ?? true,
            promotionalOffers: userProfile.notificationSettings.promotionalOffers ?? true,
            achievementAlerts: userProfile.notificationSettings.achievementAlerts ?? true,
            libraryUpdates: userProfile.notificationSettings.libraryUpdates ?? true,
            communityUpdates: userProfile.notificationSettings.communityUpdates ?? false,
            quietHoursEnabled: userProfile.notificationSettings.quietHoursEnabled ?? false,
            quietHoursStart: userProfile.notificationSettings.quietHoursStart ?? '22:00',
            quietHoursEnd: userProfile.notificationSettings.quietHoursEnd ?? '08:00',
            notificationSound: userProfile.notificationSettings.notificationSound ?? true,
            vibrationEnabled: userProfile.notificationSettings.vibrationEnabled ?? true,
            notificationFrequency: userProfile.notificationSettings.notificationFrequency ?? 'real-time',
            priorityOnly: userProfile.notificationSettings.priorityOnly ?? false,
          };
          setNotificationSettings(backendSettings);
          // Also save to localStorage for offline access
          localStorage.setItem('notificationSettings', JSON.stringify(backendSettings));
          return;
        }
      } catch (error) {
        console.warn('Failed to load notification settings from backend:', error);
      }

      // Fallback to localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          // Merge with defaults to ensure all properties exist
          setNotificationSettings(prev => ({
            ...prev,
            ...parsed,
          }));
        } catch (error) {
          console.error('Failed to parse notification settings:', error);
        }
      }
    };

    loadNotificationSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch unread notifications count and referral stats
  useEffect(() => {
    const fetchData = async () => {
      await fetchUnreadNotifications();
      await fetchReferralStats();
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    // Refresh when page comes into focus
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await api.get('/api/referrals/my-referrals');
      const referrals = response.data?.data || response.data || [];
      const successful = referrals.filter((r: any) => r.status === 'completed').length;
      const earned = referrals.filter((r: any) => r.status === 'completed').reduce((sum: number, r: any) => sum + (r.reward || 0), 0);
      setReferralStats({
        totalReferrals: referrals.length,
        successfulReferrals: successful,
        totalEarned: earned,
      });
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
      // Keep default stats (0, 0, 0) on error
    }
  };

  // Refresh notifications when navigating back to profile page
  useEffect(() => {
    if (location.pathname === '/profile') {
      fetchUnreadNotifications();
    }
  }, [location.pathname]);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get('/api/announcements');
      const announcements = response.data?.data || response.data || [];
      const unreadCount = announcements.filter((a: any) => !a.isRead).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Use mock data for unread count
      setUnreadNotifications(3);
    }
  };

  // Helper function to check if any notification channel is enabled
  const isAnyChannelEnabled = () => {
    return notificationSettings.emailNotifications || 
           notificationSettings.pushNotifications || 
           notificationSettings.smsNotifications;
  };

  // Auto-disable sound and vibration when push notifications are disabled
  useEffect(() => {
    if (!notificationSettings.pushNotifications) {
      setNotificationSettings(prev => ({
        ...prev,
        notificationSound: false,
        vibrationEnabled: false,
      }));
    }
  }, [notificationSettings.pushNotifications]);

  // Handle delete account countdown
  useEffect(() => {
    if (deleteCountdown > 0) {
      const interval = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [deleteCountdown]);

  const handleSaveNotificationSettings = async () => {
    try {
      // Validate quiet hours if enabled
      if (notificationSettings.quietHoursEnabled) {
        const start = new Date(`2000-01-01T${notificationSettings.quietHoursStart}`);
        const end = new Date(`2000-01-01T${notificationSettings.quietHoursEnd}`);
        
        // Validate that times are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          toast.error('Invalid quiet hours time format');
          return;
        }
      }

      // Validate that at least one channel is enabled if any notification type is enabled
      const hasEnabledTypes = notificationSettings.bookingReminders || 
                              notificationSettings.paymentReminders ||
                              notificationSettings.achievementAlerts ||
                              notificationSettings.promotionalOffers ||
                              notificationSettings.libraryUpdates ||
                              notificationSettings.communityUpdates;

      if (hasEnabledTypes && !isAnyChannelEnabled()) {
        toast.error('Please enable at least one notification channel to receive notifications');
        return;
      }

      // Save to localStorage first (for immediate access)
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      // Try to save to backend
      try {
        await api.put('/api/users/profile', {
          notificationSettings,
        });
        toast.success('Notification settings saved successfully!');
      } catch (error: any) {
        // If backend fails, still show success since we saved to localStorage
        console.warn('Failed to save notification settings to backend:', error);
        toast.success('Notification settings saved locally!');
      }

      setNotificationSettingsOpen(false);
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings. Please try again.');
    }
  };

  const handleEditProfile = () => {
    setEditedUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      addressLine1: (user as any).addressLine1 || '',
      addressLine2: (user as any).addressLine2 || '',
      city: user.city || '',
      state: (user as any).state || '',
      district: (user as any).district || '',
      pincode: (user as any).pincode || '',
      country: (user as any).country || 'India',
    });
    setEditDialogOpen(true);
  };

  // Auto-fill address from PIN code
  const handlePincodeChange = async (pincode: string) => {
    const numericPincode = pincode.replace(/\D/g, '').slice(0, 6);
    setEditedUser({ ...editedUser, pincode: numericPincode });

    // Only fetch if PIN code is 6 digits
    if (numericPincode.length === 6) {
      setFetchingPincode(true);
      try {
        // Use India Post API (free, no API key required)
        const response = await fetch(`https://api.postalpincode.in/pincode/${numericPincode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            
            // Auto-fill city, state, and district
            setEditedUser(prev => ({
              ...prev,
              city: postOffice.District || prev.city,
              state: postOffice.State || prev.state,
              district: postOffice.District || prev.district,
              pincode: numericPincode,
            }));

            toast.success(
              language === 'hi' 
                ? `पता स्वचालित रूप से भर दिया गया: ${postOffice.District}, ${postOffice.State}`
                : `Address auto-filled: ${postOffice.District}, ${postOffice.State}`,
              { autoClose: 2000 }
            );
          } else {
            // PIN code not found, but don't show error - user can manually enter
            console.log('PIN code not found in database');
          }
        }
      } catch (error) {
        console.error('Error fetching PIN code data:', error);
        // Don't show error to user - allow manual entry
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  // Load privacy & security settings
  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const response = await api.get('/api/users/profile');
        const userProfile = response.data?.data?.user || response.data?.user;
        if (userProfile?.privacySettings) {
          setPrivacySettings({
            ...privacySettings,
            ...userProfile.privacySettings,
          });
        }
        if (userProfile?.securitySettings) {
          setSecuritySettings({
            ...securitySettings,
            ...userProfile.securitySettings,
          });
        }
      } catch (error) {
        // Load from localStorage as fallback
        const savedPrivacy = localStorage.getItem('privacySettings');
        const savedSecurity = localStorage.getItem('securitySettings');
        if (savedPrivacy) {
          try {
            setPrivacySettings({ ...privacySettings, ...JSON.parse(savedPrivacy) });
          } catch (e) {
            console.error('Failed to parse privacy settings:', e);
          }
        }
        if (savedSecurity) {
          try {
            setSecuritySettings({ ...securitySettings, ...JSON.parse(savedSecurity) });
          } catch (e) {
            console.error('Failed to parse security settings:', e);
          }
        }
      }
    };
    loadPrivacySettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangePassword = async () => {
    // Validate password fields
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-+=])[A-Za-z\d@$!%*?&#^~_\-+=]{8,}$/;
    if (!passwordRegex.test(passwordChange.newPassword)) {
      toast.error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
      return;
    }

    if (passwordChange.currentPassword === passwordChange.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/api/users/change-password', {
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to change password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePrivacySecurity = async () => {
    try {
      // Save to localStorage first
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));

      // Try to save to backend
      try {
        await api.put('/api/users/profile', {
          privacySettings,
          securitySettings,
        });
        toast.success('Privacy & security settings saved successfully!');
      } catch (error: any) {
        console.warn('Failed to save to backend:', error);
        toast.success('Settings saved locally!');
      }

      setPrivacySecurityOpen(false);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for base64, 5MB for upload)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);

      // Convert image to base64 for local storage
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;
          
          // Store base64 image locally immediately
          const updatedUser = { 
            ...user, 
            profileImage: base64Image, 
            avatar: base64Image 
          };
          authService.setUser(updatedUser);
          setUser(updatedUser);
          setProfileImage(base64Image);
          
          // Try to upload to backend (optional - don't fail if this doesn't work)
          try {
            // Try FormData upload first
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('userId', user.id || '');

            const uploadResponse = await api.post('/api/users/profile/picture', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 10000, // 10 second timeout
            });

            const imageUrl = uploadResponse.data?.data?.profileImage || uploadResponse.data?.profileImage;
            
            if (imageUrl && imageUrl.startsWith('http')) {
              // If backend returns a URL, use that instead of base64
              const updatedUserWithUrl = { 
                ...user, 
                profileImage: imageUrl, 
                avatar: imageUrl 
              };
              authService.setUser(updatedUserWithUrl);
              setUser(updatedUserWithUrl);
              setProfileImage(imageUrl);
            }
          } catch (uploadError: any) {
            // Backend upload failed, but we already saved locally
            console.warn('Backend upload failed, using local storage:', uploadError);
            // Don't show error - local storage already worked
          }

          // Try to update profile with base64 (alternative approach)
          try {
            await api.put('/api/users/profile', {
              profileImage: base64Image,
              avatar: base64Image,
            }).catch(() => {
              // Ignore if endpoint doesn't exist
            });
          } catch (profileError) {
            // Ignore profile update errors
            console.warn('Profile update failed:', profileError);
          }

          toast.success('Profile picture updated successfully!');
        } catch (error: any) {
          console.error('Profile picture processing error:', error);
          toast.error('Failed to process profile picture');
        } finally {
          setUploadingPhoto(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        setUploadingPhoto(false);
        toast.error('Failed to read image file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      // Read file as data URL (base64)
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      setUploadingPhoto(false);
      toast.error('Failed to upload profile picture');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUpdatingProfile(true);

      // Update profile via API
      const response = await api.put('/api/users/profile', editedUser);
      const updatedUserData = response.data?.data?.user || response.data?.user || response.data?.data;

      if (updatedUserData) {
        // Update local storage
        const updatedUser = { ...user, ...updatedUserData };
        authService.setUser(updatedUser);
        setUser(updatedUser);
        setEditDialogOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        // Fallback to local update if API doesn't return user
    authService.updateUser(editedUser);
    setUser(authService.getUser() ?? {});
    setEditDialogOpen(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      // Fallback to local update on error
      authService.updateUser(editedUser);
      setUser(authService.getUser() ?? {});
      setEditDialogOpen(false);
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t('privacy.areYouSureLogout'))) {
      try {
        await authService.logout();
        toast.success(t('auth.loggedOutSuccessfully'));
      } catch (error) {
        console.warn('Failed to logout cleanly', error);
        toast.warning('Logout completed (some cleanup may have failed)');
      } finally {
        setIsAuthenticated(false);
        navigate('/login');
      }
    }
  };

  // Generate referral code and link
  const referralCode = `STUDY${user.id?.slice(-6).toUpperCase() || 'CODE123'}`;
  const appUrl = window.location.origin;
  const referralLink = `${appUrl}/register?ref=${referralCode}`;
  const shareMessage = language === 'hi' 
    ? `StudySpot में शामिल हों! सबसे अच्छी लाइब्रेरी सीट बुकिंग ऐप। मेरे रेफरल कोड का उपयोग करें: ${referralCode} और ₹200 OFF पाएं!\n\n${referralLink}`
    : `Join StudySpot! The best library seat booking app. Use my referral code: ${referralCode} and get ₹200 OFF!\n\n${referralLink}`;

  const handleShareApp = () => {
    setShareAppDialogOpen(true);
  };

  const handleSendOtp = async () => {
    // Validate Aadhaar number (12 digits)
    if (!/^\d{12}$/.test(kycData.aadhaarNumber.replace(/\s/g, ''))) {
      toast.error(t('kyc.invalidAadhaar'));
      return;
    }

    setSendingOtp(true);
    try {
      const response = await api.post('/api/users/kyc/send-otp', {
        aadhaarNumber: kycData.aadhaarNumber.replace(/\s/g, ''),
      }) as any;

      if (response.data?.success) {
        toast.success(language === 'hi' ? 'OTP आपके Aadhaar से जुड़े मोबाइल नंबर पर भेजा गया है' : 'OTP sent to your Aadhaar-linked mobile number');
        setKycStep('otp');
      } else {
        toast.error(response.data?.error?.message || t('kyc.failedToSubmit'));
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || t('kyc.failedToSubmit');
      toast.error(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Validate OTP (6 digits)
    if (!/^\d{6}$/.test(kycData.otp.replace(/\s/g, ''))) {
      toast.error(language === 'hi' ? 'कृपया वैध 6 अंकों का OTP दर्ज करें' : 'Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await api.post('/api/users/kyc/verify-otp', {
        aadhaarNumber: kycData.aadhaarNumber.replace(/\s/g, ''),
        otp: kycData.otp.replace(/\s/g, ''),
      }) as any;

      if (response.data?.success) {
        // Update KYC data with verified information
        const verifiedData = response.data?.data || {};
        
        // Update KYC data with all verified details
        setKycData(prev => ({
          ...prev,
          fullName: verifiedData.fullName || prev.fullName,
          dateOfBirth: verifiedData.dateOfBirth || prev.dateOfBirth,
          gender: verifiedData.gender || prev.gender,
          address: verifiedData.address || prev.address,
          pincode: verifiedData.pincode || prev.pincode,
          status: 'verified',
        }));

        // Update user profile with all verified details from Aadhaar
        try {
          const profileUpdates: any = {};
          
          // Update profile picture if available
          if (verifiedData.photo) {
            profileUpdates.profileImage = verifiedData.photo;
            profileUpdates.avatar = verifiedData.photo;
            
            // Update profile picture via API
            await api.post('/api/users/profile/picture', {
              profileImage: verifiedData.photo,
              avatar: verifiedData.photo,
            });
            
            // Update local profile image
            setProfileImage(verifiedData.photo);
          }

          // Update name fields if available
          if (verifiedData.firstName) {
            profileUpdates.firstName = verifiedData.firstName;
          }
          if (verifiedData.lastName) {
            profileUpdates.lastName = verifiedData.lastName;
          }
          if (verifiedData.fullName && !profileUpdates.firstName) {
            // Split full name if firstName/lastName not available
            const nameParts = verifiedData.fullName.trim().split(/\s+/);
            if (nameParts.length > 0) {
              profileUpdates.firstName = nameParts[0];
              if (nameParts.length > 1) {
                profileUpdates.lastName = nameParts.slice(1).join(' ');
              }
            }
          }

          // Update phone if available and not already set
          if (verifiedData.mobile && !user.phone) {
            profileUpdates.phone = verifiedData.mobile;
          }

          // Update email if available and not already set
          if (verifiedData.email && !user.email) {
            profileUpdates.email = verifiedData.email;
          }

          // Update city if available
          if (verifiedData.city) {
            profileUpdates.city = verifiedData.city;
          }

          // Update profile with all extracted details
          if (Object.keys(profileUpdates).length > 0) {
            await api.put('/api/users/profile', profileUpdates);
            
            // Update local user state
            const currentUser = authService.getUser();
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                ...profileUpdates,
                profileImage: profileUpdates.profileImage || currentUser.profileImage,
                avatar: profileUpdates.avatar || currentUser.avatar,
              };
              authService.setUser(updatedUser);
              setUser(updatedUser);
            }
          }
        } catch (error) {
          console.warn('Failed to update profile with Aadhaar details:', error);
          // Don't fail the entire KYC process if profile update fails
        }

        toast.success(t('kyc.kycSubmitted'));
        setKycDialogOpen(false);
        setKycStep('aadhaar');
        setKycData(prev => ({ ...prev, otp: '' }));
      } else {
        toast.error(response.data?.error?.message || t('kyc.failedToSubmit'));
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || t('kyc.failedToSubmit');
      toast.error(errorMessage);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSendVerificationOtp = async (type: 'email' | 'phone') => {
    setVerificationType(type);
    setSendingVerificationOtp(true);
    try {
      const endpoint = type === 'email' 
        ? '/api/users/verify/send-email-otp'
        : '/api/users/verify/send-phone-otp';
      
      const response = await api.post(endpoint) as any;
      
      if (response.data?.success) {
        toast.success(
          type === 'email'
            ? (language === 'hi' ? 'OTP आपके ईमेल पर भेजा गया है' : 'OTP sent to your email')
            : (language === 'hi' ? 'OTP आपके फोन पर भेजा गया है' : 'OTP sent to your phone')
        );
        setVerificationDialogOpen(true);
      } else {
        toast.error(response.data?.error?.message || t('kyc.failedToSubmit'));
      }
    } catch (error: any) {
      console.error('Failed to send verification OTP:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || t('kyc.failedToSubmit');
      toast.error(errorMessage);
    } finally {
      setSendingVerificationOtp(false);
    }
  };

  const handleVerifyEmailOrPhone = async () => {
    if (!verificationType || !/^\d{6}$/.test(verificationOtp.replace(/\s/g, ''))) {
      toast.error(language === 'hi' ? 'कृपया वैध 6 अंकों का OTP दर्ज करें' : 'Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingVerificationOtp(true);
    try {
      const endpoint = verificationType === 'email'
        ? '/api/users/verify/verify-email-otp'
        : '/api/users/verify/verify-phone-otp';
      
      const response = await api.post(endpoint, {
        otp: verificationOtp.replace(/\s/g, ''),
      }) as any;

      if (response.data?.success) {
        if (verificationType === 'email') {
          setEmailVerified(true);
        } else {
          setPhoneVerified(true);
        }
        toast.success(
          verificationType === 'email'
            ? (language === 'hi' ? 'ईमेल सफलतापूर्वक सत्यापित किया गया!' : 'Email verified successfully!')
            : (language === 'hi' ? 'फोन सफलतापूर्वक सत्यापित किया गया!' : 'Phone verified successfully!')
        );
        setVerificationDialogOpen(false);
        setVerificationOtp('');
        setVerificationType(null);
      } else {
        toast.error(response.data?.error?.message || t('kyc.failedToSubmit'));
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || t('kyc.failedToSubmit');
      toast.error(errorMessage);
    } finally {
      setVerifyingVerificationOtp(false);
    }
  };

  const handleShareMethod = async (method: string) => {
    try {
      switch (method) {
        case 'native':
    if (navigator.share) {
            await navigator.share({
              title: language === 'hi' ? 'StudySpot - लाइब्रेरी सीट बुकिंग' : 'StudySpot - Library Seat Booking',
              text: shareMessage,
              url: referralLink,
            });
            toast.success(language === 'hi' ? 'ऐप सफलतापूर्वक साझा किया गया!' : 'App shared successfully!');
    } else {
            await navigator.clipboard.writeText(referralLink);
            toast.success(language === 'hi' ? 'लिंक क्लिपबोर्ड पर कॉपी किया गया!' : 'Link copied to clipboard!');
          }
          break;

        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
          window.open(whatsappUrl, '_blank');
          toast.success(language === 'hi' ? 'WhatsApp खोला गया' : 'WhatsApp opened');
          break;

        case 'email':
          const emailSubject = language === 'hi' 
            ? 'StudySpot में शामिल हों - ₹200 OFF पाएं!'
            : 'Join StudySpot - Get ₹200 OFF!';
          const emailBody = encodeURIComponent(shareMessage);
          window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;
          toast.success(language === 'hi' ? 'ईमेल ऐप खोला गया' : 'Email app opened');
          break;

        case 'sms':
          const smsBody = encodeURIComponent(shareMessage);
          window.location.href = `sms:?body=${smsBody}`;
          toast.success(language === 'hi' ? 'SMS ऐप खोला गया' : 'SMS app opened');
          break;

        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
          window.open(facebookUrl, '_blank', 'width=600,height=400');
          toast.success(language === 'hi' ? 'Facebook खोला गया' : 'Facebook opened');
          break;

        case 'twitter':
          const twitterText = language === 'hi'
            ? `StudySpot में शामिल हों! रेफरल कोड: ${referralCode} - ₹200 OFF!`
            : `Join StudySpot! Referral code: ${referralCode} - ₹200 OFF!`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(referralLink)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          toast.success(language === 'hi' ? 'Twitter खोला गया' : 'Twitter opened');
          break;

        case 'copy':
          await navigator.clipboard.writeText(referralLink);
          toast.success(language === 'hi' ? 'लिंक क्लिपबोर्ड पर कॉपी किया गया!' : 'Link copied to clipboard!');
          break;

        case 'copy-code':
          await navigator.clipboard.writeText(referralCode);
          toast.success(language === 'hi' ? 'कोड क्लिपबोर्ड पर कॉपी किया गया!' : 'Code copied to clipboard!');
          break;

        default:
          break;
      }
      setShareAppDialogOpen(false);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.error(language === 'hi' ? 'साझा करने में त्रुटि' : 'Error sharing');
      }
    }
  };

  return (
    <MobileLayout setIsAuthenticated={setIsAuthenticated}>
      <Box sx={{ animation: 'fadeIn 0.4s ease-in' }}>
        {/* Profile Header Card */}
        <GradientCard gradient={gradients.primary} sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
            <Avatar
                src={profileImage || undefined}
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
                {!profileImage && `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
            </Avatar>
              {uploadingPhoto && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#000000', 0.5),
                    borderRadius: '50%',
                  }}
                >
                  <CircularProgress size={32} sx={{ color: 'white' }} />
                </Box>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={handleProfilePictureClick}
              disabled={uploadingPhoto}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'white',
                color: 'primary.main',
                width: 32,
                height: 32,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: 'grey.100' },
                '&:disabled': { opacity: 0.6 },
              }}
            >
              <Camera sx={{ fontSize: 18 }} />
            </IconButton>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
            />
          </Box>
          
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            {user.firstName} {user.lastName}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            {user.email}
          </Typography>

          {user.phone && (
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 0.5 }}>
              📱 {user.phone}
            </Typography>
          )}
          {((user as any).addressLine1 || user.city || (user as any).pincode) && (
            <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mb: 2, textAlign: 'center', maxWidth: '80%' }}>
              📍 {[
                (user as any).addressLine1,
                (user as any).addressLine2,
                user.city,
                (user as any).district,
                (user as any).state,
                (user as any).pincode
              ].filter(Boolean).join(', ')}
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
              onClick={handleShareApp}
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
              {t('profile.share')}
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
              {t('profile.bookings')}
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
              {t('profile.reviews')}
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
              {t('profile.points')}
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
              {t('profile.days')}
            </Typography>
          </Box>
        </Box>

        {/* Account Section */}
        <SectionHeader title={t('profile.account')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<BadgeIcon sx={{ color: kycData.status === 'verified' ? '#10b981' : kycData.status === 'rejected' ? '#ef4444' : '#f59e0b' }} />}
            title={t('profile.aadhaarKyc')}
            subtitle={
              kycData.status === 'verified' 
                ? t('kyc.statusVerified')
                : kycData.status === 'rejected'
                ? t('kyc.statusRejected')
                : kycData.aadhaarNumber
                ? t('kyc.statusPending')
                : t('profile.verifyIdentity')
            }
            onClick={() => setKycDialogOpen(true)}
            color={kycData.status === 'verified' ? '#10b981' : kycData.status === 'rejected' ? '#ef4444' : '#f59e0b'}
            rightContent={kycData.status === 'verified' ? <VerifiedUserIcon sx={{ fontSize: 16, color: '#10b981' }} /> : undefined}
          />
          <ListItem
            icon={<Payment />}
            title={t('profile.paymentMethods')}
            subtitle={t('profile.managePaymentOptions')}
            onClick={() => navigate('/payments')}
            color="#10b981"
          />
          <ListItem
            icon={<BookOnline />}
            title={t('nav.myBookings')}
            subtitle={t('profile.viewBookingHistory')}
            onClick={() => navigate('/bookings')}
            color="#6366f1"
          />
          <ListItem
            icon={<Star />}
            title={t('nav.myReviews')}
            subtitle={t('profile.reviewsWritten')}
            onClick={() => navigate('/reviews')}
            color="#f59e0b"
          />
        </Box>

        {/* Settings Section */}
        <SectionHeader title={t('profile.settings')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<Notifications />}
            title={t('notifications.title')}
            subtitle={t('profile.manageNotificationPreferences')}
            onClick={() => setNotificationSettingsOpen(true)}
            color="#8b5cf6"
          />
          <ListItem
            icon={<Security />}
            title={t('privacy.title')}
            subtitle={t('profile.controlPrivacySettings')}
            onClick={() => setPrivacySecurityOpen(true)}
            color="#ef4444"
          />
          <ListItem
            icon={<Language />}
            title={t('profile.language')}
            subtitle={selectedLanguage === 'en' ? 'English' : 'हिंदी'}
            onClick={() => setLanguageDialogOpen(true)}
            color="#3b82f6"
          />
        </Box>

        {/* Support Section */}
        <SectionHeader title={t('profile.support')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <ListItem
            icon={<Help />}
            title={t('profile.helpCenter')}
            subtitle={t('profile.getHelpWithAccount')}
            onClick={() => navigate('/support')}
            color="#10b981"
          />
          <ListItem
            icon={<Share />}
            title={t('profile.shareApp')}
            subtitle={t('profile.inviteFriends')}
            onClick={handleShareApp}
            color="#ec4899"
          />
          <ListItem
            icon={<Info />}
            title={t('profile.about')}
            subtitle={`${t('profile.version')} 1.0.0`}
            onClick={() => {
              toast.info(
                language === 'hi' 
                  ? 'StudySpot Student Portal v1.0.0\n\nअल्ट्रा-प्रीमियम मोबाइल अनुभव\nआधुनिक छात्रों के लिए डिज़ाइन किया गया'
                  : 'StudySpot Student Portal v1.0.0\n\nUltra-premium mobile experience\nDesigned for modern students',
                {
                  autoClose: 5000,
                }
              );
            }}
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
            {t('nav.logout')}
          </Typography>
        </Box>

        {/* Enhanced Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: { xs: 3, sm: 4 },
              mx: { xs: 1, sm: 2 },
              my: { xs: 1, sm: 2 },
              maxHeight: { xs: '90vh', sm: '85vh' },
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: { xs: 2, sm: 2.5 },
            pt: { xs: 2, sm: 2.5 },
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}>
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    borderRadius: 2.5,
                    bgcolor: alpha('#ffffff', 0.25),
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <Edit sx={{ fontSize: { xs: 22, sm: 26 } }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.125rem', sm: '1.375rem' }, mb: 0.25 }}>
                    {t('profile.editProfile')}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.95, fontSize: { xs: '0.688rem', sm: '0.813rem' }, fontWeight: 500 }}>
                    {language === 'hi' ? 'अपनी जानकारी अपडेट करें' : 'Update your information'}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setEditDialogOpen(false)}
                sx={{ 
                  color: 'white',
                  bgcolor: alpha('#ffffff', 0.2),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  '&:hover': { 
                    bgcolor: alpha('#ffffff', 0.3),
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Close sx={{ fontSize: { xs: 20, sm: 22 } }} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ 
            px: { xs: 2, sm: 3 }, 
            pt: { xs: 3, sm: 3.5 }, 
            pb: { xs: 2, sm: 2.5 },
            background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.02), transparent)',
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Profile Picture Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2,
                pb: 3,
                borderBottom: 2,
                borderColor: alpha('#667eea', 0.1),
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 2,
                  background: gradients.primary,
                  borderRadius: 2,
                },
              }}>
                <Box sx={{ 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha('#667eea', 0.2)}, ${alpha('#764ba2', 0.2)})`,
                    zIndex: 0,
                  },
                }}>
                  <Avatar
                    src={profileImage || undefined}
                    sx={{
                      width: { xs: 110, sm: 130 },
                      height: { xs: 110, sm: 130 },
                      bgcolor: gradients.primary,
                      fontSize: { xs: '2.75rem', sm: '3.25rem' },
                      fontWeight: 800,
                      border: '5px solid white',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {!profileImage && `${editedUser.firstName?.[0] || ''}${editedUser.lastName?.[0] || ''}`}
                  </Avatar>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      bgcolor: gradients.primary,
                      color: 'white',
                      width: { xs: 40, sm: 44 },
                      height: { xs: 40, sm: 44 },
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      zIndex: 2,
                      '&:hover': {
                        bgcolor: '#4f46e5',
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {uploadingPhoto ? <CircularProgress size={22} color="inherit" /> : <Camera sx={{ fontSize: { xs: 20, sm: 22 } }} />}
                  </IconButton>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" fontWeight={700} sx={{ 
                    fontSize: { xs: '1rem', sm: '1.125rem' }, 
                    mb: 0.5,
                    background: gradients.primary,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {editedUser.firstName} {editedUser.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.813rem' },
                    fontWeight: 500,
                  }}>
                    {language === 'hi' ? 'प्रोफ़ाइल फोटो बदलने के लिए कैमरा आइकन पर क्लिक करें' : 'Click camera icon to change profile photo'}
                  </Typography>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleProfilePictureChange}
                />
              </Box>

              {/* Personal Information Section */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  pb: 1,
                  borderBottom: `2px solid ${alpha('#667eea', 0.1)}`,
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: gradients.primary,
                  }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'text.primary',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {language === 'hi' ? 'व्यक्तिगत जानकारी' : 'Personal Information'}
                  </Typography>
                </Box>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      fullWidth
                      label={t('profile.firstName')}
                      value={editedUser.firstName}
                      onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                      size="small"
                      InputProps={{
                        startAdornment: <Person sx={{ fontSize: 20, color: '#667eea', mr: 1 }} />,
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          bgcolor: alpha('#667eea', 0.02),
                          '&:hover': {
                            bgcolor: alpha('#667eea', 0.04),
                          },
                          '&.Mui-focused': {
                            bgcolor: alpha('#667eea', 0.06),
                            '& fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 600,
                          '&.Mui-focused': {
                            color: '#667eea',
                          },
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label={t('profile.lastName')}
                      value={editedUser.lastName}
                      onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          bgcolor: alpha('#667eea', 0.02),
                          '&:hover': {
                            bgcolor: alpha('#667eea', 0.04),
                          },
                          '&.Mui-focused': {
                            bgcolor: alpha('#667eea', 0.06),
                            '& fieldset': {
                              borderColor: '#667eea',
                              borderWidth: 2,
                            },
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 600,
                          '&.Mui-focused': {
                            color: '#667eea',
                          },
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Contact Information Section */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  pb: 1,
                  borderBottom: `2px solid ${alpha('#667eea', 0.1)}`,
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: gradients.primary,
                  }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'text.primary',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {language === 'hi' ? 'संपर्क जानकारी' : 'Contact Information'}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      label={t('profile.email')}
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      size="small"
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                        endAdornment: emailVerified ? (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: 14 }} />}
                            label={language === 'hi' ? 'सत्यापित' : 'Verified'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              bgcolor: alpha('#10b981', 0.1),
                              color: '#10b981',
                              border: `1px solid ${alpha('#10b981', 0.3)}`,
                              '& .MuiChip-icon': {
                                fontSize: 14,
                                color: '#10b981',
                              },
                            }}
                          />
                        ) : undefined,
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 1.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        flex: 1
                      }}
                    />
                    {!emailVerified && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSendVerificationOtp('email')}
                        disabled={sendingVerificationOtp || !editedUser.email}
                        startIcon={sendingVerificationOtp ? <CircularProgress size={14} /> : <VerifiedUserIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: 1.5,
                          fontWeight: 600,
                          fontSize: { xs: '0.688rem', sm: '0.75rem' },
                          minWidth: { xs: 90, sm: 100 },
                          whiteSpace: 'nowrap',
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          px: { xs: 1, sm: 1.5 },
                          '&:hover': {
                            borderColor: '#2563eb',
                            bgcolor: alpha('#3b82f6', 0.08),
                          },
                        }}
                      >
                        {sendingVerificationOtp ? (language === 'hi' ? 'भेजा...' : 'Sending...') : (language === 'hi' ? 'सत्यापित करें' : 'Verify')}
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      label={t('profile.phone')}
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      size="small"
                      placeholder="+91 98765 43210"
                      InputProps={{
                        startAdornment: <Phone sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                        endAdornment: phoneVerified ? (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: 14 }} />}
                            label={language === 'hi' ? 'सत्यापित' : 'Verified'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              bgcolor: alpha('#10b981', 0.1),
                              color: '#10b981',
                              border: `1px solid ${alpha('#10b981', 0.3)}`,
                              '& .MuiChip-icon': {
                                fontSize: 14,
                                color: '#10b981',
                              },
                            }}
                          />
                        ) : undefined,
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 1.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        flex: 1
                      }}
                    />
                    {!phoneVerified && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSendVerificationOtp('phone')}
                        disabled={sendingVerificationOtp || !editedUser.phone}
                        startIcon={sendingVerificationOtp ? <CircularProgress size={14} /> : <VerifiedUserIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          borderRadius: 1.5,
                          fontWeight: 600,
                          fontSize: { xs: '0.688rem', sm: '0.75rem' },
                          minWidth: { xs: 90, sm: 100 },
                          whiteSpace: 'nowrap',
                          borderColor: '#3b82f6',
                          color: '#3b82f6',
                          px: { xs: 1, sm: 1.5 },
                          '&:hover': {
                            borderColor: '#2563eb',
                            bgcolor: alpha('#3b82f6', 0.08),
                          },
                        }}
                      >
                        {sendingVerificationOtp ? (language === 'hi' ? 'भेजा...' : 'Sending...') : (language === 'hi' ? 'सत्यापित करें' : 'Verify')}
                      </Button>
                    )}
                  </Box>
                </Stack>
              </Box>

              {/* Address Section */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  pb: 1,
                  borderBottom: `2px solid ${alpha('#667eea', 0.1)}`,
                }}>
                  <Box sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: gradients.primary,
                  }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    color: 'text.primary',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    {language === 'hi' ? 'पता' : 'Address'}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  {/* Address Line 1 */}
                  <TextField
                    fullWidth
                    label={language === 'hi' ? 'पता लाइन 1 (सड़क/मकान नंबर)' : 'Address Line 1 (Street/House No.)'}
                    value={editedUser.addressLine1}
                    onChange={(e) => setEditedUser({ ...editedUser, addressLine1: e.target.value })}
                    size="small"
                    placeholder={language === 'hi' ? 'उदा: 123, मुख्य सड़क' : 'e.g., 123, Main Street'}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        bgcolor: alpha('#667eea', 0.02),
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.04),
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha('#667eea', 0.06),
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: '#667eea',
                        },
                      }
                    }}
                  />
                  
                  {/* Address Line 2 */}
                  <TextField
                    fullWidth
                    label={language === 'hi' ? 'पता लाइन 2 (क्षेत्र/कॉलोनी)' : 'Address Line 2 (Area/Colony)'}
                    value={editedUser.addressLine2}
                    onChange={(e) => setEditedUser({ ...editedUser, addressLine2: e.target.value })}
                    size="small"
                    placeholder={language === 'hi' ? 'उदा: कॉलोनी नाम, क्षेत्र' : 'e.g., Colony Name, Area'}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        bgcolor: alpha('#667eea', 0.02),
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.04),
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha('#667eea', 0.06),
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: '#667eea',
                        },
                      }
                    }}
                  />

                  {/* PIN Code - Enter First for Auto-fill */}
                  <Box>
                    <TextField
                      fullWidth
                      label={language === 'hi' ? 'पिन कोड (स्वचालित भरने के लिए पहले दर्ज करें)' : 'PIN Code (Enter first to auto-fill)'}
                      value={editedUser.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      size="small"
                      placeholder={language === 'hi' ? '110001' : '110001'}
                      inputProps={{ maxLength: 6 }}
                      InputProps={{
                        endAdornment: fetchingPincode ? (
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                        ) : editedUser.pincode.length === 6 ? (
                          <CheckCircle sx={{ fontSize: 18, color: '#10b981', mr: 1 }} />
                        ) : null,
                      }}
                      helperText={
                        fetchingPincode 
                          ? (language === 'hi' ? 'पता लोड हो रहा है...' : 'Loading address...')
                          : editedUser.pincode.length === 6 && !fetchingPincode
                          ? (language === 'hi' ? 'शहर, राज्य और जिला स्वचालित रूप से भर दिया गया' : 'City, State & District auto-filled')
                          : (language === 'hi' ? '6 अंकों का PIN कोड दर्ज करें' : 'Enter 6-digit PIN code')
                      }
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 1.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        },
                        '& .MuiFormHelperText-root': {
                          fontSize: { xs: '0.625rem', sm: '0.688rem' },
                        }
                      }}
                    />
                  </Box>

                  {/* District */}
                  <TextField
                    fullWidth
                    label={language === 'hi' ? 'जिला (District)' : 'District'}
                    value={editedUser.district}
                    onChange={(e) => setEditedUser({ ...editedUser, district: e.target.value })}
                    size="small"
                    placeholder={language === 'hi' ? 'जिला' : 'District'}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                      endAdornment: editedUser.district && !fetchingPincode ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                      ) : null,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        bgcolor: alpha('#667eea', 0.02),
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.04),
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha('#667eea', 0.06),
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: '#667eea',
                        },
                      }
                    }}
                  />

                  {/* City, State Row */}
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    {/* City with Autocomplete */}
                    <Autocomplete
                      freeSolo
                      options={[
                        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
                        'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
                        'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
                        'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad'
                      ]}
                      value={editedUser.city}
                      onChange={(event, newValue) => {
                        setEditedUser({ ...editedUser, city: newValue || '' });
                      }}
                      onInputChange={(event, newInputValue) => {
                        setEditedUser({ ...editedUser, city: newInputValue });
                      }}
                      ListboxProps={{
                        style: {
                          maxHeight: '300px',
                          fontSize: '0.875rem',
                        }
                      }}
                      PaperComponent={({ children, ...other }) => (
                        <Box
                          {...other}
                          sx={{
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            borderRadius: 2,
                            mt: 0.5,
                            '& .MuiAutocomplete-option': {
                              fontSize: '0.875rem',
                              padding: '12px 16px',
                              minHeight: '48px',
                            }
                          }}
                        >
                          {children}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('profile.city')}
                          size="small"
                          placeholder={language === 'hi' ? 'शहर' : 'City'}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: editedUser.city && !fetchingPincode ? (
                              <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                            ) : params.InputProps.endAdornment,
                          }}
                          sx={{ 
                            flex: 1,
                            minWidth: { xs: '100%', sm: 220 },
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              fontSize: { xs: '0.875rem', sm: '0.938rem' },
                              bgcolor: alpha('#667eea', 0.02),
                              '&:hover': {
                                bgcolor: alpha('#667eea', 0.04),
                              },
                              '&.Mui-focused': {
                                bgcolor: alpha('#667eea', 0.06),
                                '& fieldset': {
                                  borderColor: '#667eea',
                                  borderWidth: 2,
                                },
                              },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.875rem', sm: '0.938rem' },
                              padding: { xs: '10px 12px', sm: '11px 14px' },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.813rem', sm: '0.875rem' },
                              fontWeight: 600,
                              '&.Mui-focused': {
                                color: '#667eea',
                              },
                            }
                          }}
                        />
                      )}
                    />

                    {/* State with Autocomplete */}
                    <Autocomplete
                      freeSolo
                      options={[
                        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
                        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
                        'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                      ]}
                      value={editedUser.state}
                      onChange={(event, newValue) => {
                        setEditedUser({ ...editedUser, state: newValue || '' });
                      }}
                      onInputChange={(event, newInputValue) => {
                        setEditedUser({ ...editedUser, state: newInputValue });
                      }}
                      ListboxProps={{
                        style: {
                          maxHeight: '300px',
                          fontSize: '0.875rem',
                        }
                      }}
                      PaperComponent={({ children, ...other }) => (
                        <Box
                          {...other}
                          sx={{
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            borderRadius: 2,
                            mt: 0.5,
                            '& .MuiAutocomplete-option': {
                              fontSize: '0.875rem',
                              padding: '12px 16px',
                              minHeight: '48px',
                            }
                          }}
                        >
                          {children}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={language === 'hi' ? 'राज्य' : 'State'}
                          size="small"
                          placeholder={language === 'hi' ? 'राज्य' : 'State'}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: editedUser.state && !fetchingPincode ? (
                              <CheckCircle sx={{ fontSize: 16, color: '#10b981', mr: 1 }} />
                            ) : params.InputProps.endAdornment,
                          }}
                          sx={{ 
                            flex: 1,
                            minWidth: { xs: '100%', sm: 220 },
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 2,
                              fontSize: { xs: '0.875rem', sm: '0.938rem' },
                              bgcolor: alpha('#667eea', 0.02),
                              '&:hover': {
                                bgcolor: alpha('#667eea', 0.04),
                              },
                              '&.Mui-focused': {
                                bgcolor: alpha('#667eea', 0.06),
                                '& fieldset': {
                                  borderColor: '#667eea',
                                  borderWidth: 2,
                                },
                              },
                            },
                            '& .MuiInputBase-input': {
                              fontSize: { xs: '0.875rem', sm: '0.938rem' },
                              padding: { xs: '10px 12px', sm: '11px 14px' },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: { xs: '0.813rem', sm: '0.875rem' },
                              fontWeight: 600,
                              '&.Mui-focused': {
                                color: '#667eea',
                              },
                            }
                          }}
                        />
                      )}
                    />
                  </Box>

                  {/* Country */}
                  <TextField
                    fullWidth
                    label={language === 'hi' ? 'देश' : 'Country'}
                    value={editedUser.country}
                    onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                    size="small"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        bgcolor: alpha('#667eea', 0.02),
                        '&:hover': {
                          bgcolor: alpha('#667eea', 0.04),
                        },
                        '&.Mui-focused': {
                          bgcolor: alpha('#667eea', 0.06),
                          '& fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: '#667eea',
                        },
                      }
                    }}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Stack>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            pt: { xs: 2, sm: 2.5 },
            borderTop: `2px solid ${alpha('#667eea', 0.1)}`,
            gap: { xs: 1.5, sm: 2 },
            background: alpha('#f8f9ff', 0.5),
          }}>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              disabled={updatingProfile}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 700,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1, sm: 1.25 },
                border: `2px solid ${alpha('#667eea', 0.2)}`,
                color: '#667eea',
                '&:hover': {
                  bgcolor: alpha('#667eea', 0.08),
                  borderColor: '#667eea',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveProfile}
              disabled={updatingProfile}
              startIcon={updatingProfile ? <CircularProgress size={18} color="inherit" /> : <Save sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 800,
                background: gradients.primary,
                minWidth: { xs: 140, sm: 160 },
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3d91 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: alpha('#667eea', 0.5),
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {updatingProfile ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Notification Settings Dialog */}
        <Dialog 
          open={notificationSettingsOpen} 
          onClose={() => setNotificationSettingsOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: { xs: 1, sm: 2 },
              maxHeight: { xs: '90vh', sm: '85vh' },
            }
          }}
        >
          <DialogTitle sx={{ pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha('#8b5cf6', 0.12),
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Notifications fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {t('notifications.title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {t('notifications.manageHowYouReceive')}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setNotificationSettingsOpen(false)}
                sx={{ 
                  bgcolor: alpha('#000', 0.05),
                  '&:hover': { bgcolor: alpha('#000', 0.1) }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={2.5}>
              {/* Quick Actions */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                p: 1.5, 
                bgcolor: alpha('#8b5cf6', 0.08),
                borderRadius: 2,
                border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
              }}>
                <Button
                  size="small"
                  variant={(notificationSettings.pushNotifications && notificationSettings.emailNotifications) ? "contained" : "outlined"}
                  startIcon={(notificationSettings.pushNotifications && notificationSettings.emailNotifications) ? <CheckCircle /> : <NotificationsOff />}
                  onClick={() => {
                    const allEnabled = notificationSettings.pushNotifications && notificationSettings.emailNotifications;
                    setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: !allEnabled,
                      emailNotifications: !allEnabled,
                      smsNotifications: !allEnabled ? false : notificationSettings.smsNotifications, // Keep SMS as is or disable if enabling all
                    });
                  }}
                  sx={{ 
                    flex: 1,
                    fontSize: '0.75rem',
                    py: 0.75,
                    borderRadius: 1.5,
                    ...((notificationSettings.pushNotifications && notificationSettings.emailNotifications) && {
                      background: gradients.primary,
                    })
                  }}
                >
                  {(notificationSettings.pushNotifications && notificationSettings.emailNotifications) ? t('notifications.allEnabled') : t('notifications.enableAll')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DoNotDisturb />}
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: false,
                    emailNotifications: false,
                    smsNotifications: false,
                  })}
                  sx={{ 
                    flex: 1,
                    fontSize: '0.75rem',
                    py: 0.75,
                    borderRadius: 1.5,
                    borderColor: alpha('#ef4444', 0.3),
                    color: '#ef4444',
                  }}
                >
                  {t('notifications.disableAll')}
                </Button>
              </Box>

              {/* Notification Channels - Enhanced */}
              <Accordion defaultExpanded sx={{ boxShadow: 'none', border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Settings fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('notifications.channels')}
                    </Typography>
                    <Chip 
                      label={`${[notificationSettings.emailNotifications, notificationSettings.pushNotifications, notificationSettings.smsNotifications].filter(Boolean).length}/3`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha('#1976d2', 0.2)}`,
                        bgcolor: notificationSettings.emailNotifications ? alpha('#1976d2', 0.05) : 'transparent',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <EmailIcon fontSize="small" color="primary" />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                {t('notifications.emailNotifications')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {t('notifications.receiveViaEmail')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                        bgcolor: notificationSettings.pushNotifications ? alpha('#8b5cf6', 0.05) : 'transparent',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              pushNotifications: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <NotificationsActive fontSize="small" sx={{ color: '#8b5cf6' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                {t('notifications.pushNotifications')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {t('notifications.receiveOnDevice')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha('#10b981', 0.2)}`,
                        bgcolor: notificationSettings.smsNotifications ? alpha('#10b981', 0.05) : 'transparent',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <PhoneAndroid fontSize="small" sx={{ color: '#10b981' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                {t('notifications.smsNotifications')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {t('notifications.receiveViaSMS')}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Notification Types - Enhanced */}
              <Accordion defaultExpanded sx={{ boxShadow: 'none', border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <NotificationsActive fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('notifications.types')}
                    </Typography>
                    <Chip 
                      label={`${[
                        notificationSettings.bookingReminders,
                        notificationSettings.paymentReminders,
                        notificationSettings.achievementAlerts,
                        notificationSettings.promotionalOffers,
                        notificationSettings.libraryUpdates,
                        notificationSettings.communityUpdates,
                      ].filter(Boolean).length}/6`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={1.5}>
                    {[
                      { key: 'bookingReminders', label: t('notifications.bookingReminders'), icon: <CalendarToday fontSize="small" />, color: '#6366f1', desc: language === 'hi' ? 'आगामी बुकिंग के लिए अनुस्मारक' : 'Reminders for upcoming bookings' },
                      { key: 'paymentReminders', label: t('notifications.paymentReminders'), icon: <CreditCard fontSize="small" />, color: '#10b981', desc: language === 'hi' ? 'भुगतान देय और लेनदेन अलर्ट' : 'Payment due and transaction alerts' },
                      { key: 'achievementAlerts', label: t('notifications.achievementAlerts'), icon: <AchievementIcon fontSize="small" />, color: '#f59e0b', desc: language === 'hi' ? 'बैज, स्ट्रीक और मील के पत्थर' : 'Badges, streaks, and milestones' },
                      { key: 'promotionalOffers', label: t('notifications.promotionalOffers'), icon: <LocalOffer fontSize="small" />, color: '#ec4899', desc: language === 'hi' ? 'छूट और विशेष ऑफ़र' : 'Discounts and special offers' },
                      { key: 'libraryUpdates', label: t('notifications.libraryUpdates'), icon: <LibraryBooks fontSize="small" />, color: '#8b5cf6', desc: language === 'hi' ? 'नई सुविधाएं और पुस्तकालय समाचार' : 'New features and library news' },
                      { key: 'communityUpdates', label: t('notifications.communityUpdates'), icon: <Groups fontSize="small" />, color: '#06b6d4', desc: language === 'hi' ? 'समुदाय पोस्ट और चर्चाएं' : 'Community posts and discussions' },
                    ].map((item) => {
                      const isEnabled = notificationSettings[item.key as keyof typeof notificationSettings] as boolean;
                      const channelsEnabled = isAnyChannelEnabled();
                      
                      return (
                        <Box
                          key={item.key}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${alpha(item.color, isEnabled ? 0.3 : 0.1)}`,
                            bgcolor: isEnabled ? alpha(item.color, 0.05) : 'transparent',
                            opacity: channelsEnabled ? 1 : 0.5,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={isEnabled}
                                onChange={(e) => {
                                  const newValue = e.target.checked;
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    [item.key]: newValue
                                  } as any);
                                  
                                  // Show feedback if trying to enable without channels
                                  if (newValue && !channelsEnabled) {
                                    setTimeout(() => {
                                      toast.error('Please enable at least one notification channel first');
                                    }, 100);
                                    // Revert the change
                                    setNotificationSettings({
                                      ...notificationSettings,
                                      [item.key]: false
                                    } as any);
                                  }
                                }}
                                size="small"
                                disabled={!channelsEnabled}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <Box sx={{ color: item.color }}>{item.icon}</Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                    {item.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {item.desc}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Advanced Settings */}
              <Accordion sx={{ boxShadow: 'none', border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Settings fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('notifications.advancedSettings')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={2.5}>
                    {/* Notification Frequency */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Schedule fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          {t('notifications.frequency')}
                        </Typography>
                      </Box>
                      <Select
                        fullWidth
                        size="small"
                        value={notificationSettings.notificationFrequency}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          notificationFrequency: e.target.value as any
                        })}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="real-time">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FlashOn fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('notifications.realTime')}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'तत्काल सूचनाएं' : 'Immediate notifications'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="hourly">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HourglassEmpty fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('notifications.hourly')} {language === 'hi' ? 'सारांश' : 'Digest'}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'हर घंटे सारांश' : 'Summary every hour'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="daily">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Today fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('notifications.daily')} {language === 'hi' ? 'सारांश' : 'Digest'}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'प्रति दिन एक बार सारांश' : 'Summary once per day'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </Box>

                    {/* Quiet Hours */}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.quietHoursEnabled}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              quietHoursEnabled: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DoNotDisturb fontSize="small" />
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                              {t('notifications.quietHours')}
                            </Typography>
                          </Box>
                        }
                      />
                      {notificationSettings.quietHoursEnabled && (
                        <Box sx={{ mt: 1.5, pl: 4, display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                          <TextField
                            type="time"
                            label={language === 'hi' ? 'प्रारंभ समय' : 'Start Time'}
                            value={notificationSettings.quietHoursStart}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              quietHoursStart: e.target.value
                            })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                          <TextField
                            type="time"
                            label={language === 'hi' ? 'समाप्ति समय' : 'End Time'}
                            value={notificationSettings.quietHoursEnd}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              quietHoursEnd: e.target.value
                            })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Sound & Vibration */}
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                        {t('notifications.soundVibration')}
                      </Typography>
                      <Stack spacing={1.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationSettings.notificationSound && notificationSettings.pushNotifications}
                              onChange={(e) => {
                                if (notificationSettings.pushNotifications) {
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    notificationSound: e.target.checked
                                  });
                                }
                              }}
                              size="small"
                              disabled={!notificationSettings.pushNotifications}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: notificationSettings.pushNotifications ? 1 : 0.5 }}>
                              <VolumeUp fontSize="small" />
                              <Box>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {language === 'hi' ? 'सूचना ध्वनि' : 'Notification Sound'}
                                </Typography>
                                {!notificationSettings.pushNotifications && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {language === 'hi' ? 'पहले पुश सूचनाएं सक्षम करें' : 'Enable push notifications first'}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={notificationSettings.vibrationEnabled && notificationSettings.pushNotifications}
                              onChange={(e) => {
                                if (notificationSettings.pushNotifications) {
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    vibrationEnabled: e.target.checked
                                  });
                                }
                              }}
                              size="small"
                              disabled={!notificationSettings.pushNotifications}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: notificationSettings.pushNotifications ? 1 : 0.5 }}>
                              <Vibration fontSize="small" />
                              <Box>
                                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                  {language === 'hi' ? 'कंपन' : 'Vibration'}
                                </Typography>
                                {!notificationSettings.pushNotifications && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {language === 'hi' ? 'पहले पुश सूचनाएं सक्षम करें' : 'Enable push notifications first'}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </Stack>
                    </Box>

                    {/* Priority Only */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha('#f59e0b', 0.05),
                        border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.priorityOnly}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              priorityOnly: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                              {t('notifications.priorityOnly')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {language === 'hi' ? 'केवल उच्च-प्राथमिकता वाली सूचनाएं प्राप्त करें' : 'Only receive high-priority notifications'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Summary Card */}
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha('#8b5cf6', 0.08),
                border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
              }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.75rem' }}>
                  {language === 'hi' ? 'वर्तमान सेटिंग्स सारांश' : 'Current Settings Summary'}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.75 }}>
                  {notificationSettings.emailNotifications && (
                    <Chip label="Email" size="small" icon={<EmailIcon />} sx={{ fontSize: '0.7rem', height: 24 }} />
                  )}
                  {notificationSettings.pushNotifications && (
                    <Chip label="Push" size="small" icon={<NotificationsActive />} sx={{ fontSize: '0.7rem', height: 24 }} />
                  )}
                  {notificationSettings.smsNotifications && (
                    <Chip label="SMS" size="small" icon={<PhoneAndroid />} sx={{ fontSize: '0.7rem', height: 24 }} />
                  )}
                  {notificationSettings.quietHoursEnabled && (
                    <Chip label="Quiet Hours" size="small" icon={<DoNotDisturb />} sx={{ fontSize: '0.7rem', height: 24 }} />
                  )}
                  {notificationSettings.priorityOnly && (
                    <Chip label={t('notifications.priorityOnly')} size="small" color="warning" sx={{ fontSize: '0.7rem', height: 24 }} />
                  )}
                  <Chip 
                    label={`${notificationSettings.notificationFrequency === 'real-time' ? 'Real-time' : notificationSettings.notificationFrequency === 'hourly' ? 'Hourly' : 'Daily'}`}
                    size="small"
                    icon={<Schedule />}
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 1.5, gap: 1 }}>
            <Button 
              onClick={() => setNotificationSettingsOpen(false)}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNotificationSettings}
              startIcon={<Save />}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 700,
                background: gradients.primary,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
              }}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Privacy & Security Settings Dialog */}
        <Dialog 
          open={privacySecurityOpen} 
          onClose={() => setPrivacySecurityOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: { xs: 1, sm: 2 },
              maxHeight: { xs: '90vh', sm: '85vh' },
            }
          }}
        >
          <DialogTitle sx={{ pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha('#ef4444', 0.12),
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {t('privacy.title')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {language === 'hi' ? 'अपने खाते की सुरक्षा और गोपनीयता प्रबंधित करें' : 'Manage your account security and privacy'}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setPrivacySecurityOpen(false)}
                sx={{ 
                  bgcolor: alpha('#000', 0.05),
                  '&:hover': { bgcolor: alpha('#000', 0.1) }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={2.5}>
              {/* Change Password Section */}
              <Accordion defaultExpanded sx={{ boxShadow: 'none', border: `1px solid ${alpha('#ef4444', 0.2)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Key fontSize="small" color="error" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('privacy.changePassword')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      type={passwordChange.showCurrentPassword ? 'text' : 'password'}
                      label={t('privacy.currentPassword')}
                      value={passwordChange.currentPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            size="small"
                            onClick={() => setPasswordChange({ ...passwordChange, showCurrentPassword: !passwordChange.showCurrentPassword })}
                            edge="end"
                          >
                            {passwordChange.showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                    <TextField
                      fullWidth
                      type={passwordChange.showNewPassword ? 'text' : 'password'}
                      label={t('privacy.newPassword')}
                      value={passwordChange.newPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                      size="small"
                      helperText={language === 'hi' ? 'कम से कम 8 वर्ण, बड़े अक्षर, छोटे अक्षर, संख्या और विशेष वर्ण होने चाहिए' : 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            size="small"
                            onClick={() => setPasswordChange({ ...passwordChange, showNewPassword: !passwordChange.showNewPassword })}
                            edge="end"
                          >
                            {passwordChange.showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                    <TextField
                      fullWidth
                      type={passwordChange.showConfirmPassword ? 'text' : 'password'}
                      label={t('privacy.confirmPassword')}
                      value={passwordChange.confirmPassword}
                      onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                      size="small"
                      error={passwordChange.confirmPassword !== '' && passwordChange.newPassword !== passwordChange.confirmPassword}
                      helperText={passwordChange.confirmPassword !== '' && passwordChange.newPassword !== passwordChange.confirmPassword ? (language === 'hi' ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match') : ''}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            size="small"
                            onClick={() => setPasswordChange({ ...passwordChange, showConfirmPassword: !passwordChange.showConfirmPassword })}
                            edge="end"
                          >
                            {passwordChange.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={changingPassword || !passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword}
                      startIcon={changingPassword ? <CircularProgress size={16} /> : <Lock />}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 700,
                        background: gradients.primary,
                        mt: 1,
                      }}
                    >
                      {changingPassword ? (language === 'hi' ? 'पासवर्ड बदला जा रहा है...' : 'Changing Password...') : t('privacy.changePassword')}
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Security Settings */}
              <Accordion defaultExpanded sx={{ boxShadow: 'none', border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Shield fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('privacy.securitySettings')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha('#8b5cf6', 0.2)}`,
                        bgcolor: securitySettings.twoFactorEnabled ? alpha('#8b5cf6', 0.05) : 'transparent',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securitySettings.twoFactorEnabled}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              twoFactorEnabled: e.target.checked
                            })}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Fingerprint fontSize="small" sx={{ color: '#8b5cf6' }} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                {t('privacy.twoFactorAuth')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {language === 'hi' ? 'अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें' : 'Add an extra layer of security to your account'}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.loginAlerts}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            loginAlerts: e.target.checked
                          })}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <NotificationsActive fontSize="small" />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {t('privacy.loginAlerts')}
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.suspiciousActivityAlerts}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            suspiciousActivityAlerts: e.target.checked
                          })}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Warning fontSize="small" color="warning" />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {t('privacy.suspiciousActivityAlerts')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Privacy Settings */}
              <Accordion defaultExpanded sx={{ boxShadow: 'none', border: `1px solid ${alpha('#000', 0.1)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Person fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('privacy.privacySettings')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={2.5}>
                    {/* Profile Visibility */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Public fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                          {t('privacy.profileVisibility')}
                        </Typography>
                      </Box>
                      <Select
                        fullWidth
                        size="small"
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value as any
                        })}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="public">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Public fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('privacy.public')}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'कोई भी आपकी प्रोफ़ाइल देख सकता है' : 'Anyone can see your profile'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="friends">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('privacy.friends')} {language === 'hi' ? 'केवल' : 'Only'}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'केवल आपके दोस्त आपकी प्रोफ़ाइल देख सकते हैं' : 'Only your friends can see your profile'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="private">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Lock fontSize="small" />
                            <Box>
                              <Typography variant="body2">{t('privacy.private')}</Typography>
                              <Typography variant="caption" color="text.secondary">{language === 'hi' ? 'केवल आप अपनी प्रोफ़ाइल देख सकते हैं' : 'Only you can see your profile'}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </Box>

                    <Divider />

                    {/* Information Visibility */}
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                        {language === 'hi' ? 'सूचना दृश्यता' : 'Information Visibility'}
                      </Typography>
                      <Stack spacing={1.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.showEmail}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                showEmail: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {t('privacy.showEmail')} {language === 'hi' ? 'पता' : 'Address'}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.showPhone}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                showPhone: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneAndroid fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {t('privacy.showPhone')} {language === 'hi' ? 'नंबर' : 'Number'}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.showLocation}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                showLocation: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {t('privacy.showLocation')}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.showActivityStatus}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                showActivityStatus: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {language === 'hi' ? 'गतिविधि स्थिति दिखाएं' : 'Show Activity Status'}
                              </Typography>
                            </Box>
                          }
                        />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Interaction Settings */}
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                        {language === 'hi' ? 'इंटरैक्शन सेटिंग्स' : 'Interaction Settings'}
                      </Typography>
                      <Stack spacing={1.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.allowFriendRequests}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                allowFriendRequests: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {language === 'hi' ? 'मित्र अनुरोध की अनुमति दें' : 'Allow Friend Requests'}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.allowMessages}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                allowMessages: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {language === 'hi' ? 'संदेशों की अनुमति दें' : 'Allow Messages'}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={privacySettings.dataSharing}
                              onChange={(e) => setPrivacySettings({
                                ...privacySettings,
                                dataSharing: e.target.checked
                              })}
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Share fontSize="small" />
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                {language === 'hi' ? 'विश्लेषण के लिए डेटा साझाकरण' : 'Data Sharing for Analytics'}
                              </Typography>
                            </Box>
                          }
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Account Actions */}
              <Accordion sx={{ boxShadow: 'none', border: `1px solid ${alpha('#ef4444', 0.2)}`, borderRadius: 2, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2, py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Warning fontSize="small" color="error" />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {t('privacy.accountActions')}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Stack spacing={1.5}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => toast.info('Data download feature coming soon!')}
                      sx={{ 
                        borderRadius: 1.5,
                        justifyContent: 'flex-start',
                        borderColor: alpha('#6366f1', 0.3),
                        color: '#6366f1',
                      }}
                    >
                      {t('privacy.downloadData')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Devices />}
                      onClick={() => toast.info('Active sessions feature coming soon!')}
                      sx={{ 
                        borderRadius: 1.5,
                        justifyContent: 'flex-start',
                        borderColor: alpha('#10b981', 0.3),
                        color: '#10b981',
                      }}
                    >
                      {t('privacy.activeSessions')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<History />}
                      onClick={() => toast.info('Login history feature coming soon!')}
                      sx={{ 
                        borderRadius: 1.5,
                        justifyContent: 'flex-start',
                        borderColor: alpha('#f59e0b', 0.3),
                        color: '#f59e0b',
                      }}
                    >
                      {t('privacy.loginHistory')}
                    </Button>
                    <Divider sx={{ my: 1 }} />
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setDeleteAccountDialogOpen(true)}
                      sx={{ 
                        borderRadius: 1.5,
                        justifyContent: 'flex-start',
                        borderColor: alpha('#ef4444', 0.3),
                        color: '#ef4444',
                      }}
                    >
                      {t('privacy.deleteAccount')}
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 1.5, gap: 1 }}>
            <Button 
              onClick={() => setPrivacySecurityOpen(false)}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSavePrivacySecurity}
              startIcon={<Save />}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 700,
                background: gradients.primary,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
              }}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog 
          open={deleteAccountDialogOpen} 
          onClose={() => {
            if (!deletingAccount) {
              setDeleteAccountDialogOpen(false);
              setDeleteConfirmation('');
              setDeleteCountdown(0);
            }
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: { xs: 1, sm: 2 },
            }
          }}
        >
          <DialogTitle sx={{ pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha('#ef4444', 0.12),
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Warning fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {t('privacy.deleteAccount')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {t('privacy.deleteAccountWarning')}
                  </Typography>
                </Box>
              </Box>
              {!deletingAccount && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setDeleteAccountDialogOpen(false);
                    setDeleteConfirmation('');
                    setDeleteCountdown(0);
                  }}
                  sx={{ 
                    bgcolor: alpha('#000', 0.05),
                    '&:hover': { bgcolor: alpha('#000', 0.1) }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={2.5}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {t('privacy.warningPermanent')}
                </Typography>
                <Typography variant="caption">
                  {t('privacy.deletingAccountWarning')}
                </Typography>
              </Alert>

              {deleteCountdown > 0 ? (
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha('#ef4444', 0.08),
                  border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" fontWeight={700} color="error" sx={{ mb: 1 }}>
                    {deleteCountdown}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('privacy.waitBeforeConfirming')}
                  </Typography>
                  <CircularProgress 
                    size={24} 
                    sx={{ mt: 1, color: '#ef4444' }}
                    variant="determinate"
                    value={(30 - deleteCountdown) / 30 * 100}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                    {t('privacy.toConfirmTypeDelete')}
                  </Typography>
                  <TextField
                    fullWidth
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                    placeholder={t('privacy.typeDeleteToConfirm')}
                    size="small"
                    error={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'}
                    helperText={
                      deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'
                        ? t('privacy.typeDeleteExactly')
                        : t('privacy.deleteAccountWarning')
                    }
                    disabled={deletingAccount}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 1.5,
                        '&.Mui-error': {
                          borderColor: alpha('#ef4444', 0.5),
                        }
                      } 
                    }}
                  />
                </Box>
              )}

              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#f59e0b', 0.08),
                border: `1px solid ${alpha('#f59e0b', 0.2)}`,
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  {t('privacy.whatWillBeDeleted')}
                </Typography>
                <Stack spacing={0.5}>
                  {[
                    t('privacy.allPersonalInfo'),
                    t('privacy.bookingHistory'),
                    t('privacy.reviewsRatings'),
                    t('privacy.paymentInfo'),
                    t('privacy.achievementsPoints'),
                    t('privacy.messagesConversations'),
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 4, 
                        height: 4, 
                        borderRadius: '50%', 
                        bgcolor: '#f59e0b' 
                      }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 1.5, gap: 1 }}>
            <Button 
              onClick={() => {
                setDeleteAccountDialogOpen(false);
                setDeleteConfirmation('');
                setDeleteCountdown(0);
              }}
              disabled={deletingAccount}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={deletingAccount ? <CircularProgress size={16} /> : <Delete />}
              onClick={async () => {
                // Start countdown if not started and DELETE is typed
                if (deleteCountdown === 0 && deleteConfirmation === 'DELETE') {
                  setDeleteCountdown(30);
                  return;
                }

                // Final deletion after countdown completes
                if (deleteCountdown === 0 && deleteConfirmation === 'DELETE') {
                  try {
                    setDeletingAccount(true);
                    
                    // Call delete account API
                    await api.delete('/api/users/account');
                    
                    toast.success(t('privacy.accountDeletedSuccess'));
                    
                    // Logout and redirect
                    authService.logout();
                    setIsAuthenticated(false);
                    navigate('/login');
                  } catch (error: any) {
                    console.error('Account deletion error:', error);
                    const errorMessage = error.response?.data?.error?.message || t('privacy.failedToDeleteAccount');
                    toast.error(errorMessage);
                    setDeletingAccount(false);
                  }
                }
              }}
              disabled={
                deletingAccount || 
                deleteConfirmation !== 'DELETE' || 
                deleteCountdown > 0
              }
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 700,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
                bgcolor: '#ef4444',
                '&:hover': {
                  bgcolor: '#dc2626',
                },
                '&:disabled': {
                  bgcolor: alpha('#ef4444', 0.3),
                }
              }}
            >
              {deletingAccount 
                ? t('privacy.deletingAccount')
                : deleteCountdown > 0 
                  ? (language === 'hi' ? `${deleteCountdown} सेकंड प्रतीक्षा करें` : `Wait ${deleteCountdown}s`)
                  : t('privacy.deleteAccount')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Language Settings Dialog - Matching Notification Dialog Style */}
        <Dialog 
          open={languageDialogOpen} 
          onClose={() => setLanguageDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              mx: { xs: 1, sm: 2 },
              maxHeight: { xs: '90vh', sm: '85vh' },
            }
          }}
        >
          <DialogTitle sx={{ pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha('#667eea', 0.12),
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Translate fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {selectedLanguage === 'en' ? 'Language Settings' : 'भाषा सेटिंग्स'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {selectedLanguage === 'en' ? 'Choose your preferred language for the app' : 'ऐप के लिए अपनी पसंदीदा भाषा चुनें'}
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setLanguageDialogOpen(false)}
                sx={{ 
                  bgcolor: alpha('#000', 0.05),
                  '&:hover': { bgcolor: alpha('#000', 0.1) }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={2.5}>
              {/* Current Language Display */}
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#667eea', 0.08),
                border: `1px solid ${alpha('#667eea', 0.2)}`,
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  {selectedLanguage === 'en' ? 'Current Language' : 'वर्तमान भाषा'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: selectedLanguage === 'en' ? gradients.primary : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      background: selectedLanguage === 'en' ? gradients.primary : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedLanguage === 'en' ? 'EN' : 'हि'}
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                    {selectedLanguage === 'en' ? 'English' : 'हिंदी'}
                  </Typography>
                  <Chip 
                    label={selectedLanguage === 'en' ? 'Active' : 'सक्रिय'} 
                    size="small" 
                    color="primary"
                    sx={{ height: 20, fontSize: '0.65rem', ml: 'auto' }}
                  />
                </Box>
              </Box>

              {/* Language Options */}
              <Stack spacing={1.5}>
                {/* English Option */}
                <Box
                  onClick={() => setLanguage('en')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${selectedLanguage === 'en' ? '#667eea' : alpha('#000', 0.1)}`,
                    bgcolor: selectedLanguage === 'en' ? alpha('#667eea', 0.05) : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: selectedLanguage === 'en' ? '#667eea' : alpha('#667eea', 0.3),
                      bgcolor: alpha('#667eea', 0.05),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: selectedLanguage === 'en' ? gradients.primary : alpha('#667eea', 0.12),
                          background: selectedLanguage === 'en' ? gradients.primary : alpha('#667eea', 0.12),
                          color: selectedLanguage === 'en' ? 'white' : '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                        }}
                      >
                        EN
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                          English
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {selectedLanguage === 'en' ? 'India' : 'भारत'}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedLanguage === 'en' && (
                      <CheckCircle sx={{ color: '#667eea', fontSize: 24 }} />
                    )}
                  </Box>
                </Box>

                {/* Hindi Option */}
                <Box
                  onClick={() => setLanguage('hi')}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${selectedLanguage === 'hi' ? '#10b981' : alpha('#000', 0.1)}`,
                    bgcolor: selectedLanguage === 'hi' ? alpha('#10b981', 0.05) : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: selectedLanguage === 'hi' ? '#10b981' : alpha('#10b981', 0.3),
                      bgcolor: alpha('#10b981', 0.05),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: selectedLanguage === 'hi' ? '#10b981' : alpha('#10b981', 0.12),
                          background: selectedLanguage === 'hi' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : alpha('#10b981', 0.12),
                          color: selectedLanguage === 'hi' ? 'white' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.125rem',
                        }}
                      >
                        हि
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                          हिंदी
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {selectedLanguage === 'en' ? 'India' : 'भारत'}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedLanguage === 'hi' && (
                      <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                    )}
                  </Box>
                </Box>
              </Stack>

              {/* Language Info Card */}
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha('#f59e0b', 0.08),
                border: `1px solid ${alpha('#f59e0b', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Info fontSize="small" sx={{ color: '#f59e0b', mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      {selectedLanguage === 'en' ? 'Note' : 'नोट'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.5 }}>
                      {selectedLanguage === 'en' 
                        ? 'Changing the language will update the interface immediately. The app will reload to apply all changes.'
                        : 'भाषा बदलने से इंटरफ़ेस तुरंत अपडेट हो जाएगा। सभी परिवर्तन लागू करने के लिए ऐप पुनः लोड होगा।'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, pt: 1.5, gap: 1 }}>
            <Button 
              onClick={() => setLanguageDialogOpen(false)}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                toast.success(
                  selectedLanguage === 'en' 
                    ? 'Language changed to English' 
                    : 'भाषा हिंदी में बदल दी गई',
                  { autoClose: 2000 }
                );
                setLanguageDialogOpen(false);
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
              startIcon={<Save />}
              sx={{ 
                borderRadius: 1.5, 
                fontWeight: 700,
                background: gradients.primary,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: { xs: 2, sm: 3 },
              }}
            >
              {selectedLanguage === 'en' ? 'Save Changes' : 'परिवर्तन सहेजें'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Share App Dialog */}
        <Dialog
          open={shareAppDialogOpen}
          onClose={() => setShareAppDialogOpen(false)}
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
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, position: 'relative' }}>
            {language === 'hi' ? 'ऐप साझा करें' : 'Share App'}
            <IconButton
              onClick={() => setShareAppDialogOpen(false)}
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
          <DialogContent sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={2}>
              {/* Referral Stats Summary */}
              {(referralStats.totalReferrals > 0 || referralStats.totalEarned > 0) && (
                <Box sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: alpha('#10b981', 0.08),
                  border: `1px solid ${alpha('#10b981', 0.2)}`,
                }}>
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1, display: 'block', color: 'text.secondary' }}>
                    {language === 'hi' ? 'आपकी रेफरल सांख्यिकी' : 'Your Referral Stats'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: '#10b981' }}>
                        {referralStats.totalReferrals}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, color: 'text.secondary' }}>
                        {language === 'hi' ? 'आमंत्रित' : 'Invited'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: '#f59e0b' }}>
                        {referralStats.successfulReferrals}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, color: 'text.secondary' }}>
                        {language === 'hi' ? 'सफल' : 'Successful'}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: '#ec4899' }}>
                        ₹{referralStats.totalEarned}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, color: 'text.secondary' }}>
                        {language === 'hi' ? 'कमाया' : 'Earned'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Referral Code Display */}
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                background: gradients.primary,
                color: 'white',
                textAlign: 'center',
              }}>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, opacity: 0.9, mb: 0.5, display: 'block' }}>
                  {language === 'hi' ? 'आपका रेफरल कोड' : 'Your Referral Code'}
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 1, letterSpacing: 2 }}>
                  {referralCode}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, opacity: 0.8 }}>
                  {language === 'hi' ? '₹200 OFF जब कोई आपके कोड का उपयोग करता है!' : '₹200 OFF when someone uses your code!'}
                </Typography>
              </Box>

              {/* Referral Link */}
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha('#667eea', 0.08),
                border: `1px solid ${alpha('#667eea', 0.2)}`,
              }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1, display: 'block', color: 'text.secondary' }}>
                  {language === 'hi' ? 'रेफरल लिंक' : 'Referral Link'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={referralLink}
                    size="small"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        bgcolor: 'background.paper',
                      }
                    }}
                  />
                  <IconButton
                    onClick={() => handleShareMethod('copy')}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      borderRadius: { xs: 1, sm: 1.5 },
                    }}
                  >
                    <ContentCopy sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Share Options */}
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1.5 }}>
                  {language === 'hi' ? 'साझा करने के विकल्प' : 'Share Options'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {/* Native Share */}
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Share sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                        onClick={() => handleShareMethod('native')}
                        sx={{
                          borderRadius: { xs: 1, sm: 1.5 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.25 },
                          flexDirection: 'column',
                          gap: 0.5,
                          height: 'auto',
                        }}
                      >
                        {language === 'hi' ? 'साझा करें' : 'Share'}
                      </Button>
                    </Box>
                  )}

                  {/* WhatsApp */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<WhatsApp sx={{ fontSize: { xs: 18, sm: 20 }, color: '#25D366' }} />}
                      onClick={() => handleShareMethod('whatsapp')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                        borderColor: '#25D366',
                        color: '#25D366',
                        '&:hover': { borderColor: '#20ba5a', bgcolor: alpha('#25D366', 0.05) },
                      }}
                    >
                      WhatsApp
                    </Button>
                  </Box>

                  {/* Email */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Email sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                      onClick={() => handleShareMethod('email')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                      }}
                    >
                      {language === 'hi' ? 'ईमेल' : 'Email'}
                    </Button>
                  </Box>

                  {/* SMS */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Message sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                      onClick={() => handleShareMethod('sms')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                      }}
                    >
                      SMS
                    </Button>
                  </Box>

                  {/* Facebook */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Facebook sx={{ fontSize: { xs: 18, sm: 20 }, color: '#1877F2' }} />}
                      onClick={() => handleShareMethod('facebook')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                        borderColor: '#1877F2',
                        color: '#1877F2',
                        '&:hover': { borderColor: '#166FE5', bgcolor: alpha('#1877F2', 0.05) },
                      }}
                    >
                      Facebook
                    </Button>
                  </Box>

                  {/* Twitter */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Twitter sx={{ fontSize: { xs: 18, sm: 20 }, color: '#1DA1F2' }} />}
                      onClick={() => handleShareMethod('twitter')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                        borderColor: '#1DA1F2',
                        color: '#1DA1F2',
                        '&:hover': { borderColor: '#1A91DA', bgcolor: alpha('#1DA1F2', 0.05) },
                      }}
                    >
                      Twitter
                    </Button>
                  </Box>

                  {/* Copy Code */}
                  <Box sx={{ flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.333% - 10px)' }, minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.333% - 10px)' } }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ContentCopy sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                      onClick={() => handleShareMethod('copy-code')}
                      sx={{
                        borderRadius: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.25 },
                        flexDirection: 'column',
                        gap: 0.5,
                        height: 'auto',
                      }}
                    >
                      {language === 'hi' ? 'कोड कॉपी करें' : 'Copy Code'}
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Info Box */}
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha('#10b981', 0.08),
                border: `1px solid ${alpha('#10b981', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: { xs: 18, sm: 20 }, mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: 'block', mb: 0.5 }}>
                      {language === 'hi' ? 'कैसे काम करता है?' : 'How it works?'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.5 }}>
                      {language === 'hi'
                        ? 'जब कोई आपके रेफरल लिंक या कोड का उपयोग करके साइन अप करता है, तो आप दोनों को ₹200 OFF मिलेगा!'
                        : 'When someone signs up using your referral link or code, both of you will get ₹200 OFF!'
                      }
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Link to Refer & Earn Page */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<EmojiEvents sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                onClick={() => {
                  setShareAppDialogOpen(false);
                  navigate('/referral');
                }}
                sx={{
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  py: { xs: 1.25, sm: 1.5 },
                  background: gradients.primary,
                  '&:hover': {
                    background: gradients.primary,
                    transform: 'translateY(-2px)',
                    boxShadow: 6,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {language === 'hi' ? 'रेफर और कमाएं पेज देखें' : 'View Refer & Earn Page'}
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 } }}>
            <Button
              onClick={() => setShareAppDialogOpen(false)}
              sx={{
                borderRadius: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Aadhaar KYC Dialog */}
        <Dialog
          open={kycDialogOpen}
          onClose={() => setKycDialogOpen(false)}
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
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, position: 'relative' }}>
            {t('kyc.title')}
            <IconButton
              onClick={() => setKycDialogOpen(false)}
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
          <DialogContent sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={2}>
              {/* Info Box */}
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha('#3b82f6', 0.08),
                border: `1px solid ${alpha('#3b82f6', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Info sx={{ color: '#3b82f6', fontSize: { xs: 18, sm: 20 }, mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: 'block', mb: 0.5 }}>
                      {t('kyc.whyVerify')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.5 }}>
                      {t('kyc.whyVerifyDesc')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Verification Status */}
              {kycData.status === 'verified' && (
                <Box sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: alpha('#10b981', 0.08),
                  border: `1px solid ${alpha('#10b981', 0.2)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#10b981', fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {t('kyc.status')}: {t('kyc.statusVerified')}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Step 1: Aadhaar Number */}
              {kycStep === 'aadhaar' && (
                <>
                  <TextField
                    fullWidth
                    label={t('kyc.aadhaarNumber')}
                    placeholder={t('kyc.aadhaarNumberPlaceholder')}
                    value={kycData.aadhaarNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setKycData({ ...kycData, aadhaarNumber: value });
                    }}
                    size="small"
                    disabled={kycData.status === 'verified'}
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: 'text.secondary', mr: 1 }} />,
                    }}
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
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, textAlign: 'center' }}>
                    {language === 'hi' ? 'OTP आपके Aadhaar से जुड़े मोबाइल नंबर पर भेजा जाएगा' : 'OTP will be sent to your Aadhaar-linked mobile number'}
                  </Typography>
                </>
              )}

              {/* Step 2: OTP Verification */}
              {kycStep === 'otp' && (
                <>
                  <Box sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    bgcolor: alpha('#10b981', 0.08),
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#10b981', fontSize: { xs: 18, sm: 20 } }} />
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {t('kyc.otpSent')}
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    label={t('kyc.enterOtp')}
                    placeholder={language === 'hi' ? '6 अंकों का OTP दर्ज करें' : 'Enter 6-digit OTP'}
                    value={kycData.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setKycData({ ...kycData, otp: value });
                    }}
                    size="small"
                    InputProps={{
                      startAdornment: <Message sx={{ fontSize: { xs: 18, sm: 20 }, color: 'text.secondary', mr: 1 }} />,
                    }}
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
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      setKycStep('aadhaar');
                      setKycData(prev => ({ ...prev, otp: '' }));
                    }}
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      textTransform: 'none',
                    }}
                  >
                    {t('kyc.changeAadhaar')}
                  </Button>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 1, sm: 1 }, gap: { xs: 1, sm: 1.5 } }}>
            <Button
              onClick={() => {
                setKycDialogOpen(false);
                setKycStep('aadhaar');
                setKycData(prev => ({ ...prev, otp: '' }));
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
            {kycData.status !== 'verified' && (
              <>
                {kycStep === 'aadhaar' ? (
                  <Button
                    variant="contained"
                    startIcon={sendingOtp ? <CircularProgress size={16} color="inherit" /> : <BadgeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !/^\d{12}$/.test(kycData.aadhaarNumber.replace(/\s/g, ''))}
                    sx={{
                      borderRadius: { xs: 1, sm: 1.5 },
                      fontWeight: 700,
                      background: gradients.primary,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.75, sm: 1 },
                    }}
                  >
                    {sendingOtp ? t('kyc.sendingOtp') : t('kyc.sendOtp')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={verifyingOtp ? <CircularProgress size={16} color="inherit" /> : <VerifiedUserIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || !/^\d{6}$/.test(kycData.otp.replace(/\s/g, ''))}
                    sx={{
                      borderRadius: { xs: 1, sm: 1.5 },
                      fontWeight: 700,
                      background: gradients.primary,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.75, sm: 1 },
                    }}
                  >
                    {verifyingOtp ? t('kyc.verifyingOtp') : t('kyc.verifyOtp')}
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Email/Phone Verification OTP Dialog */}
        <Dialog
          open={verificationDialogOpen}
          onClose={() => {
            setVerificationDialogOpen(false);
            setVerificationOtp('');
            setVerificationType(null);
          }}
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
          <DialogTitle sx={{ pb: { xs: 1, sm: 1.5 }, fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, position: 'relative' }}>
            {verificationType === 'email' 
              ? (language === 'hi' ? 'ईमेल सत्यापन' : 'Email Verification')
              : (language === 'hi' ? 'फोन सत्यापन' : 'Phone Verification')}
            <IconButton
              onClick={() => {
                setVerificationDialogOpen(false);
                setVerificationOtp('');
                setVerificationType(null);
              }}
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
          <DialogContent sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={2}>
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha('#10b981', 0.08),
                border: `1px solid ${alpha('#10b981', 0.2)}`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: { xs: 18, sm: 20 } }} />
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {verificationType === 'email'
                      ? (language === 'hi' ? 'OTP आपके ईमेल पर भेजा गया है' : 'OTP sent to your email')
                      : (language === 'hi' ? 'OTP आपके फोन पर भेजा गया है' : 'OTP sent to your phone')}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                label={language === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'}
                placeholder={language === 'hi' ? '6 अंकों का OTP' : '6-digit OTP'}
                value={verificationOtp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationOtp(value);
                }}
                size="small"
                InputProps={{
                  startAdornment: <Message sx={{ fontSize: { xs: 18, sm: 20 }, color: 'text.secondary', mr: 1 }} />,
                }}
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
                setVerificationDialogOpen(false);
                setVerificationOtp('');
                setVerificationType(null);
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
              startIcon={verifyingVerificationOtp ? <CircularProgress size={16} color="inherit" /> : <VerifiedUserIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              onClick={handleVerifyEmailOrPhone}
              disabled={verifyingVerificationOtp || !/^\d{6}$/.test(verificationOtp.replace(/\s/g, ''))}
              sx={{
                borderRadius: { xs: 1, sm: 1.5 },
                fontWeight: 700,
                background: gradients.primary,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
              }}
            >
              {verifyingVerificationOtp 
                ? (language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying...')
                : (language === 'hi' ? 'सत्यापित करें' : 'Verify')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MobileLayout>
  );
}
