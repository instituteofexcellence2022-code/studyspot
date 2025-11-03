// ============================================
// LIBRARY DETAILS PAGE
// Complete library information and analytics
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
  Stack,
  Avatar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import {
  Business,
  LocationOn,
  Phone,
  Email,
  Language,
  Schedule,
  EventSeat,
  People,
  Payment,
  Star,
  TrendingUp,
  AttachMoney,
  CheckCircle,
  Cancel,
  Wifi,
  AcUnit,
  LocalParking,
  Coffee,
  Print,
  Videocam,
  QrCode,
  Face,
  Sensors,
  Edit,
  Block,
  Send,
  Download,
  Refresh,
  Note,
  Message,
  History,
  Add,
  Delete,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const LibraryDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [sendMessageDialogOpen, setSendMessageDialogOpen] = useState(false);
  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
  });
  const [messageFormData, setMessageFormData] = useState({
    channel: 'email',
    subject: '',
    message: '',
  });
  const [noteFormData, setNoteFormData] = useState({
    note: '',
    type: 'general',
    priority: 'low',
  });
  const [suspendReason, setSuspendReason] = useState('');

  // Mock Complete Library Data
  const library = {
    id: 'LIB001',
    libraryId: 'SS-LIB-001',
    name: 'Central Library',
    description: 'Premium study library with state-of-the-art facilities, high-speed WiFi, and comfortable seating arrangements. Perfect for serious students and professionals.',
    type: 'Study Library',
    status: 'active',
    
    // Tenant Info
    tenantId: 'TEN001',
    tenantName: 'Central Library Network',
    tenantEmail: 'admin@centrallibrary.com',
    tenantPhone: '+91 98765 43210',
    tenantPlan: 'Enterprise',
    
    // Location
    address: {
      street: '123, MG Road, Near Metro Station',
      landmark: 'Opposite City Mall',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      coordinates: { latitude: 19.0760, longitude: 72.8777 },
    },
    
    // Capacity & Layout
    capacity: {
      total: 200,
      occupied: 145,
      available: 55,
      reserved: 15,
      underMaintenance: 5,
    },
    
    zones: [
      { id: 'Z1', name: 'Silent Zone', type: 'silent', seatCount: 80, available: 25, priceMultiplier: 1.0 },
      { id: 'Z2', name: 'Discussion Area', type: 'discussion', seatCount: 50, available: 15, priceMultiplier: 0.8 },
      { id: 'Z3', name: 'Premium Cabin', type: 'premium', seatCount: 30, available: 8, priceMultiplier: 1.5 },
      { id: 'Z4', name: 'General Area', type: 'general', seatCount: 40, available: 12, priceMultiplier: 0.9 },
    ],
    
    // Amenities
    amenities: [
      { icon: 'Wifi', name: 'High-Speed WiFi', available: true },
      { icon: 'AcUnit', name: 'Air Conditioning', available: true },
      { icon: 'LocalParking', name: 'Parking', available: true },
      { icon: 'Coffee', name: 'Cafeteria', available: true },
      { icon: 'Print', name: 'Printing', available: false },
      { icon: 'Videocam', name: 'CCTV', available: true },
    ],
    
    // Features
    features: {
      qrCheckIn: true,
      faceRecognition: true,
      biometric: false,
      iotSensors: true,
      smartLighting: true,
      cctv: true,
    },
    
    // Operating Hours
    operatingHours: {
      monday: { open: '06:00 AM', close: '11:00 PM', isOpen: true },
      tuesday: { open: '06:00 AM', close: '11:00 PM', isOpen: true },
      wednesday: { open: '06:00 AM', close: '11:00 PM', isOpen: true },
      thursday: { open: '06:00 AM', close: '11:00 PM', isOpen: true },
      friday: { open: '06:00 AM', close: '11:00 PM', isOpen: true },
      saturday: { open: '08:00 AM', close: '10:00 PM', isOpen: true },
      sunday: { open: '08:00 AM', close: '10:00 PM', isOpen: true },
    },
    currentStatus: 'Open Now',
    
    // Performance Stats
    stats: {
      totalStudents: 245,
      activeStudents: 223,
      totalBookings: 5623,
      monthlyBookings: 523,
      averageOccupancy: 72.5,
      peakOccupancy: 95,
      totalRevenue: 678000,
      monthlyRevenue: 45600,
      averageRevenuePerSeat: 228,
      averageSessionDuration: 245,
      bookingUtilization: 85.3,
    },
    
    // Ratings
    ratings: {
      overall: 4.8,
      cleanliness: 4.9,
      facilities: 4.7,
      staff: 4.8,
      value: 4.6,
      reviewCount: 145,
      positiveReviews: 132,
      negativeReviews: 13,
    },
    
    // Pricing
    pricing: {
      hourly: 75,
      daily: 500,
      weekly: 3000,
      monthly: 10000,
      currency: 'INR',
    },
    
    // Contact
    contactInfo: {
      phone: '+91 98765 00001',
      email: 'contact@centrallibrary.com',
      website: 'www.centrallibrary.com',
    },
    
    createdAt: '2024-01-15',
    approvedAt: '2024-01-16',
  };

  // Performance Trends
  const revenueTrend = [
    { month: 'May', revenue: 42500, bookings: 478 },
    { month: 'Jun', revenue: 43200, bookings: 492 },
    { month: 'Jul', revenue: 44100, bookings: 501 },
    { month: 'Aug', revenue: 44800, bookings: 512 },
    { month: 'Sep', revenue: 45200, bookings: 518 },
    { month: 'Oct', revenue: 45600, bookings: 523 },
  ];

  const occupancyTrend = [
    { month: 'May', occupancy: 70.2 },
    { month: 'Jun', occupancy: 71.5 },
    { month: 'Jul', occupancy: 72.1 },
    { month: 'Aug', occupancy: 73.2 },
    { month: 'Sep', occupancy: 72.8 },
    { month: 'Oct', occupancy: 72.5 },
  ];

  const studentGrowth = [
    { month: 'May', students: 212 },
    { month: 'Jun', students: 218 },
    { month: 'Jul', students: 225 },
    { month: 'Aug', students: 232 },
    { month: 'Sep', students: 238 },
    { month: 'Oct', students: 245 },
  ];

  // Notes & Communication History
  const libraryNotes = [
    {
      id: 1,
      note: 'Library requested additional CCTV cameras installation. Follow up scheduled for next week.',
      createdBy: 'Admin - Rajesh Kumar',
      createdAt: '2025-10-28 10:30 AM',
      type: 'maintenance',
      priority: 'medium',
    },
    {
      id: 2,
      note: 'Tenant upgraded from Professional to Enterprise plan. Updated features activated.',
      createdBy: 'System',
      createdAt: '2025-10-20 03:15 PM',
      type: 'upgrade',
      priority: 'high',
    },
    {
      id: 3,
      note: 'Resolved student complaint about AC in Zone A. Temperature adjusted.',
      createdBy: 'Support - Priya Sharma',
      createdAt: '2025-10-15 11:45 AM',
      type: 'issue',
      priority: 'low',
    },
    {
      id: 4,
      note: 'Excellent performance this month. Occupancy consistently above 70%. Sent appreciation email to tenant.',
      createdBy: 'Admin - Amit Patel',
      createdAt: '2025-10-10 09:00 AM',
      type: 'appreciation',
      priority: 'low',
    },
  ];

  const communicationHistory = [
    {
      id: 1,
      type: 'email',
      subject: 'Monthly Performance Report - October 2025',
      message: 'Dear Central Library Team, Your library achieved 72.5% occupancy this month with ₹45.6K revenue. Great job!',
      sentTo: 'admin@centrallibrary.com',
      sentBy: 'Platform Admin',
      sentAt: '2025-11-01 09:00 AM',
      status: 'delivered',
      channel: 'Email',
    },
    {
      id: 2,
      type: 'whatsapp',
      subject: 'Payment Reminder',
      message: 'Hi, Your subscription payment of ₹15,000 is due on 5th Nov. Please pay to avoid service interruption.',
      sentTo: '+91 98765 43210',
      sentBy: 'Automated System',
      sentAt: '2025-10-30 10:00 AM',
      status: 'read',
      channel: 'WhatsApp',
    },
    {
      id: 3,
      type: 'sms',
      subject: 'New Feature Available',
      message: 'Face Recognition attendance is now live! Upgrade your plan to activate. Contact support for details.',
      sentTo: '+91 98765 43210',
      sentBy: 'Platform Admin',
      sentAt: '2025-10-25 02:30 PM',
      status: 'delivered',
      channel: 'SMS',
    },
    {
      id: 4,
      type: 'email',
      subject: 'Congratulations on 200+ Students!',
      message: 'Your library has crossed 200 active students! As a reward, enjoy 20% off on next credit purchase.',
      sentTo: 'admin@centrallibrary.com',
      sentBy: 'Marketing Team',
      sentAt: '2025-10-20 11:15 AM',
      status: 'delivered',
      channel: 'Email',
    },
    {
      id: 5,
      type: 'phone',
      subject: 'Follow-up Call - CCTV Installation',
      message: 'Discussed CCTV camera installation request. Quoted ₹50,000 for 8 additional cameras. Tenant to confirm by 5th Nov.',
      sentTo: '+91 98765 43210',
      sentBy: 'Support - Rahul Singh',
      sentAt: '2025-10-18 04:00 PM',
      status: 'completed',
      channel: 'Phone Call',
    },
  ];

  const zoneUtilization = library.zones.map(zone => ({
    ...zone,
    utilization: ((zone.seatCount - zone.available) / zone.seatCount) * 100,
  }));

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Wifi: Wifi,
      AcUnit: AcUnit,
      LocalParking: LocalParking,
      Coffee: Coffee,
      Print: Print,
      Videocam: Videocam,
    };
    const IconComp = icons[iconName] || CheckCircle;
    return <IconComp />;
  };

  // ============================================
  // HANDLER FUNCTIONS
  // ============================================

  const handleEditClick = () => {
    setEditFormData({
      name: library.name,
      description: library.description,
      phone: library.contactInfo.phone,
      email: library.contactInfo.email,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    console.log('Saving library details:', editFormData);
    // Here you would call the API to update library
    alert(`Library "${editFormData.name}" updated successfully!`);
    setEditDialogOpen(false);
  };

  const handleSuspendClick = () => {
    setSuspendDialogOpen(true);
  };

  const handleSuspendConfirm = () => {
    console.log('Suspending library with reason:', suspendReason);
    // Here you would call the API to suspend library
    alert(`Library suspended. Reason: ${suspendReason}`);
    setSuspendDialogOpen(false);
    setSuspendReason('');
  };

  const handleSendMessageClick = () => {
    setSendMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    console.log('Sending message:', messageFormData);
    // Here you would call the API to send message
    alert(`Message sent via ${messageFormData.channel} to tenant!`);
    setSendMessageDialogOpen(false);
    setMessageFormData({ channel: 'email', subject: '', message: '' });
  };

  const handleAddNoteClick = () => {
    setAddNoteDialogOpen(true);
  };

  const handleAddNote = () => {
    console.log('Adding note:', noteFormData);
    // Here you would call the API to add note
    alert(`Note added successfully!`);
    setAddNoteDialogOpen(false);
    setNoteFormData({ note: '', type: 'general', priority: 'low' });
  };

  const handleContactTenant = () => {
    // Open email client or show contact options
    window.location.href = `mailto:${library.tenantEmail}?subject=Regarding ${library.name}`;
  };

  const handleViewTenant = () => {
    // Navigate to tenant details page
    alert(`Navigating to tenant details for: ${library.tenantName}`);
    // In real app: navigate(`/tenants/${library.tenantId}`);
  };

  const handleExport = () => {
    alert('Exporting library report...');
    // Here you would call the API to export library report
  };

  const handleRefresh = () => {
    alert('Refreshing library data...');
    // Here you would call the API to refresh data
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main', 
              fontSize: 32,
              background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
            }}
          >
            {library.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {library.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={library.libraryId} size="small" variant="outlined" />
              <Chip label={library.type} color="primary" size="small" />
              <Chip label={library.status.toUpperCase()} color="success" size="small" />
              <Chip 
                label={library.currentStatus} 
                color="success" 
                size="small"
                icon={<CheckCircle />}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {library.address.city}, {library.address.state} • Managed by <strong>{library.tenantName}</strong>
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Edit />} onClick={handleEditClick}>
            Edit
          </Button>
          <Button variant="outlined" startIcon={<Send />} onClick={handleContactTenant}>
            Contact Tenant
          </Button>
          <Button variant="outlined" color="error" startIcon={<Block />} onClick={handleSuspendClick}>
            Suspend
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total Capacity
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {library.capacity.total} seats
          </Typography>
          <Typography variant="caption" color="success.main">
            Available: {library.capacity.available}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Occupancy Rate
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {library.stats.averageOccupancy}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={library.stats.averageOccupancy}
            color="success"
            sx={{ mt: 1, height: 6, borderRadius: 1 }}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total Students
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {library.stats.totalStudents}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Active: {library.stats.activeStudents}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Monthly Revenue
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            ₹{(library.stats.monthlyRevenue / 1000).toFixed(0)}K
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total: ₹{(library.stats.totalRevenue / 1000).toFixed(0)}K
          </Typography>
        </Paper>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Overview" icon={<Business />} iconPosition="start" />
          <Tab label="Performance" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Students" icon={<People />} iconPosition="start" />
          <Tab label="Zones & Capacity" icon={<EventSeat />} iconPosition="start" />
          <Tab label="Reviews" icon={<Star />} iconPosition="start" />
          <Tab label="Notes" icon={<Note />} iconPosition="start" />
          <Tab label="Communications" icon={<Message />} iconPosition="start" />
          <Tab label="Tenant Info" icon={<Business />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 1: Overview */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              {/* Basic Information */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Basic Information
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Library Name
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {library.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Library ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {library.libraryId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Chip label={library.type} color="primary" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {library.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Location & Contact */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Location & Contact
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {library.address.street}<br />
                      {library.address.landmark}<br />
                      {library.address.city}, {library.address.state} - {library.address.zipCode}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{library.contactInfo.phone}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{library.contactInfo.email}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Website
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Language fontSize="small" color="action" />
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                        {library.contactInfo.website}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Operating Hours */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Operating Hours
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {Object.entries(library.operatingHours).map(([day, hours]: [string, any]) => (
                    <Stack key={day} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                        {day}
                      </Typography>
                      <Typography variant="body2" color={hours.isOpen ? 'success.main' : 'error.main'}>
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              {/* Amenities & Features */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Amenities & Features
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Available Amenities
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {library.amenities.map((amenity, index) => (
                        <Chip
                          key={index}
                          label={amenity.name}
                          size="small"
                          color={amenity.available ? 'success' : 'default'}
                          icon={amenity.available ? <CheckCircle /> : <Cancel />}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Technology Features
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                      {library.features.qrCheckIn && (
                        <Chip label="QR Check-in" icon={<QrCode />} size="small" color="primary" sx={{ mb: 1 }} />
                      )}
                      {library.features.faceRecognition && (
                        <Chip label="Face Recognition" icon={<Face />} size="small" color="secondary" sx={{ mb: 1 }} />
                      )}
                      {library.features.iotSensors && (
                        <Chip label="IoT Sensors" icon={<Sensors />} size="small" color="info" sx={{ mb: 1 }} />
                      )}
                      {library.features.cctv && (
                        <Chip label="CCTV" icon={<Videocam />} size="small" color="warning" sx={{ mb: 1 }} />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Pricing */}
            <Card sx={{ mt: 3, bgcolor: '#F3E5F5' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Pricing Structure
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      ₹{library.pricing.hourly}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per Hour
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      ₹{library.pricing.daily}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per Day
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      ₹{library.pricing.weekly.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per Week
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      ₹{library.pricing.monthly.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per Month
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab 2: Performance */}
          <TabPanel value={activeTab} index={1}>
            {/* KPIs */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {library.stats.monthlyBookings}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Total: {library.stats.totalBookings.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Avg Session Duration
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {library.stats.averageSessionDuration} min
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Per booking
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Booking Utilization
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {library.stats.bookingUtilization}%
                  </Typography>
                  <LinearProgress variant="determinate" value={library.stats.bookingUtilization} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Box>

            {/* Performance Charts */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Revenue Trend (Last 6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4CAF50"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue (₹)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Student Growth
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#2196F3"
                        strokeWidth={2}
                        name="Total Students"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Occupancy Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={occupancyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[65, 75]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="occupancy"
                        stroke="#E91E63"
                        strokeWidth={2}
                        name="Occupancy %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Bookings Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#9C27B0" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Tab 3: Students */}
          <TabPanel value={activeTab} index={2}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Showing all students registered at this library
            </Alert>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Students
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {library.stats.totalStudents}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Active Students
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {library.stats.activeStudents}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Inactive Students
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {library.stats.totalStudents - library.stats.activeStudents}
                </Typography>
              </Paper>
            </Box>
            <Button variant="contained" fullWidth startIcon={<People />}>
              View All Students from this Library
            </Button>
          </TabPanel>

          {/* Tab 4: Zones & Capacity */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Zone-wise Seat Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {zoneUtilization.map((zone) => (
                <Paper key={zone.id} sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <EventSeat />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {zone.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone • {zone.priceMultiplier}x pricing
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {zone.seatCount - zone.available}/{zone.seatCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {zone.utilization.toFixed(1)}% utilized
                      </Typography>
                    </Box>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={zone.utilization}
                    sx={{ height: 8, borderRadius: 1 }}
                    color={zone.utilization >= 80 ? 'error' : zone.utilization >= 60 ? 'success' : 'warning'}
                  />
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Available: {zone.available} seats
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Occupied: {zone.seatCount - zone.available} seats
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>

            {/* Capacity Summary */}
            <Card sx={{ mt: 3, bgcolor: '#E3F2FD' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Overall Capacity Summary
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                    <Typography variant="h6" fontWeight="bold">{library.capacity.total}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Occupied</Typography>
                    <Typography variant="h6" fontWeight="bold" color="error.main">{library.capacity.occupied}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Available</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">{library.capacity.available}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reserved</Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">{library.capacity.reserved}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Maintenance</Typography>
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">{library.capacity.underMaintenance}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Tab 5: Reviews */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Overall Rating
                  </Typography>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h2" fontWeight="bold" color="primary">
                      {library.ratings.overall}
                    </Typography>
                    <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ my: 1 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} sx={{ color: star <= library.ratings.overall ? '#FFD700' : '#E0E0E0', fontSize: 32 }} />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Based on {library.ratings.reviewCount} reviews
                    </Typography>
                  </Box>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption">Cleanliness</Typography>
                        <Typography variant="caption" fontWeight="bold">{library.ratings.cleanliness}/5</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={library.ratings.cleanliness * 20} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption">Facilities</Typography>
                        <Typography variant="caption" fontWeight="bold">{library.ratings.facilities}/5</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={library.ratings.facilities * 20} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption">Staff</Typography>
                        <Typography variant="caption" fontWeight="bold">{library.ratings.staff}/5</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={library.ratings.staff * 20} />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption">Value for Money</Typography>
                        <Typography variant="caption" fontWeight="bold">{library.ratings.value}/5</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={library.ratings.value * 20} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Review Statistics
                  </Typography>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Reviews
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {library.ratings.reviewCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Positive Reviews</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {library.ratings.positiveReviews} ({((library.ratings.positiveReviews / library.ratings.reviewCount) * 100).toFixed(1)}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(library.ratings.positiveReviews / library.ratings.reviewCount) * 100}
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Negative Reviews</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {library.ratings.negativeReviews} ({((library.ratings.negativeReviews / library.ratings.reviewCount) * 100).toFixed(1)}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(library.ratings.negativeReviews / library.ratings.reviewCount) * 100}
                        color="error"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Tab 6: Notes */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Library Notes & Activity Log
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddNoteClick}>
                Add Note
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Internal Notes:</strong> Track important events, issues, and communications about this library
            </Alert>

            <Stack spacing={2}>
              {libraryNotes.map((note) => (
                <Paper 
                  key={note.id} 
                  sx={{ 
                    p: 2,
                    bgcolor: note.priority === 'high' ? '#FFEBEE' : note.priority === 'medium' ? '#FFF3E0' : '#F5F5F5',
                    borderLeft: `4px solid ${note.priority === 'high' ? '#F44336' : note.priority === 'medium' ? '#FF9800' : '#9E9E9E'}`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={note.type.toUpperCase()}
                        size="small"
                        color={
                          note.type === 'upgrade' ? 'success' :
                          note.type === 'maintenance' ? 'warning' :
                          note.type === 'issue' ? 'error' : 'default'
                        }
                      />
                      <Chip
                        label={note.priority.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <MuiTooltip title="Edit Note">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Delete Note">
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
                    </Stack>
                  </Stack>
                  <Typography variant="body1" paragraph>
                    {note.note}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Added by:</strong> {note.createdBy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Date:</strong> {note.createdAt}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </TabPanel>

          {/* Tab 7: Communication History */}
          <TabPanel value={activeTab} index={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Communication History
              </Typography>
              <Button variant="contained" startIcon={<Send />} onClick={handleSendMessageClick}>
                Send Message
              </Button>
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Complete Audit Trail:</strong> All communications with this library/tenant are logged here
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Date & Time</strong></TableCell>
                    <TableCell><strong>Channel</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                    <TableCell><strong>Sent By</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {communicationHistory.map((comm) => (
                    <TableRow key={comm.id} hover>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {comm.sentAt}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={comm.channel} 
                          size="small"
                          color={
                            comm.channel === 'WhatsApp' ? 'success' :
                            comm.channel === 'Email' ? 'primary' :
                            comm.channel === 'SMS' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {comm.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {comm.message.substring(0, 80)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {comm.sentBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={comm.status.toUpperCase()} 
                          size="small"
                          color={
                            comm.status === 'delivered' ? 'success' :
                            comm.status === 'read' ? 'primary' :
                            comm.status === 'completed' ? 'success' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Communication Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 3 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {communicationHistory.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Communications
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {communicationHistory.filter(c => c.channel === 'Email').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Emails Sent
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {communicationHistory.filter(c => c.channel === 'WhatsApp').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  WhatsApp Messages
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {communicationHistory.filter(c => c.channel === 'SMS').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SMS Sent
                </Typography>
              </Paper>
            </Box>
          </TabPanel>

          {/* Tab 8: Tenant Info */}
          <TabPanel value={activeTab} index={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tenant Information
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tenant Name
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {library.tenantName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tenant ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {library.tenantId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subscription Plan
                  </Typography>
                  <Chip label={library.tenantPlan} color="secondary" />
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Email
                  </Typography>
                  <Typography variant="body1">{library.tenantEmail}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Phone
                  </Typography>
                  <Typography variant="body1">{library.tenantPhone}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Library Added On
                  </Typography>
                  <Typography variant="body1">{library.createdAt}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Approved On
                  </Typography>
                  <Typography variant="body1">{library.approvedAt}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="contained" fullWidth startIcon={<Business />} onClick={handleViewTenant}>
                  View Tenant Details
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Send />} onClick={handleContactTenant}>
                  Contact Tenant
                </Button>
              </Stack>
            </Paper>
          </TabPanel>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* DIALOGS */}
      {/* ============================================ */}

      {/* Edit Library Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Edit color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Edit Library Details
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <MuiTextField
              label="Library Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              fullWidth
            />
            <MuiTextField
              label="Description"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <MuiTextField
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              fullWidth
            />
            <MuiTextField
              label="Email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suspend Library Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Block color="error" />
            <Typography variant="h6" fontWeight="bold">
              Suspend Library
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> Suspending this library will prevent all bookings and student access until reactivated.
          </Alert>
          <MuiTextField
            label="Reason for Suspension"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            multiline
            rows={4}
            fullWidth
            placeholder="Enter the reason for suspending this library..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleSuspendConfirm}
            disabled={!suspendReason}
          >
            Suspend Library
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={sendMessageDialogOpen} onClose={() => setSendMessageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Send color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Send Message to Tenant
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Select Channel</FormLabel>
              <RadioGroup
                row
                value={messageFormData.channel}
                onChange={(e) => setMessageFormData({ ...messageFormData, channel: e.target.value })}
              >
                <FormControlLabel value="email" control={<Radio />} label="Email" />
                <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
                <FormControlLabel value="sms" control={<Radio />} label="SMS" />
              </RadioGroup>
            </FormControl>
            
            {messageFormData.channel === 'email' && (
              <MuiTextField
                label="Subject"
                value={messageFormData.subject}
                onChange={(e) => setMessageFormData({ ...messageFormData, subject: e.target.value })}
                fullWidth
              />
            )}
            
            <MuiTextField
              label="Message"
              value={messageFormData.message}
              onChange={(e) => setMessageFormData({ ...messageFormData, message: e.target.value })}
              multiline
              rows={6}
              fullWidth
              placeholder={`Write your message to ${library.tenantName}...`}
            />

            <Alert severity="info">
              <strong>Recipient:</strong> {library.tenantEmail} • {library.tenantPhone}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendMessageDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSendMessage}
            disabled={!messageFormData.message}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={addNoteDialogOpen} onClose={() => setAddNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Note color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Add Library Note
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Note Type</InputLabel>
              <Select
                value={noteFormData.type}
                onChange={(e) => setNoteFormData({ ...noteFormData, type: e.target.value })}
                label="Note Type"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="upgrade">Upgrade</MenuItem>
                <MenuItem value="issue">Issue</MenuItem>
                <MenuItem value="appreciation">Appreciation</MenuItem>
                <MenuItem value="reminder">Reminder</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={noteFormData.priority}
                onChange={(e) => setNoteFormData({ ...noteFormData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <MuiTextField
              label="Note"
              value={noteFormData.note}
              onChange={(e) => setNoteFormData({ ...noteFormData, note: e.target.value })}
              multiline
              rows={4}
              fullWidth
              placeholder="Enter note details..."
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNoteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAddNote}
            disabled={!noteFormData.note}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryDetailsPage;

