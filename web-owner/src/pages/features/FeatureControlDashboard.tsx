import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  EventSeat as SeatIcon,
  AccessTime as TimeIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Book as BookIcon,
  BugReport as BugIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Tune as TuneIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  partial?: boolean;
  dependencies?: string[];
  usage?: number;
  popularity?: 'high' | 'medium' | 'low';
  lastUsed?: string;
  required?: boolean;
}

interface FeatureCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: Feature[];
}

interface FeatureUsage {
  featureId: string;
  usage: number;
  trend: 'up' | 'down' | 'stable';
  lastUsed: string;
}

const FeatureControlDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [showDependenciesDialog, setShowDependenciesDialog] = useState(false);
  const [pendingDependencies, setPendingDependencies] = useState<string[]>([]);

  const [features, setFeatures] = useState<Feature[]>([
    // Authentication & Security Features
    { id: 'email_login', name: 'Email/Mobile Login', description: 'Allow students to login with email or mobile', category: 'auth', enabled: true, usage: 95, popularity: 'high' },
    { id: 'social_login', name: 'Social Login', description: 'Google/Facebook login integration', category: 'auth', enabled: true, usage: 78, popularity: 'high' },
    { id: 'aadhaar_kyc', name: 'Aadhaar-based KYC', description: 'Aadhaar verification for student registration', category: 'auth', enabled: false, usage: 25, popularity: 'low' },
    { id: 'otp_verification', name: 'OTP Verification', description: 'SMS/Email OTP verification', category: 'auth', enabled: true, usage: 88, popularity: 'high' },
    { id: 'biometric_login', name: 'Biometric Login', description: 'Fingerprint/Face recognition login', category: 'auth', enabled: true, usage: 65, popularity: 'medium' },
    { id: 'two_factor', name: 'Two-Factor Authentication', description: 'Enhanced security with 2FA', category: 'auth', enabled: true, usage: 45, popularity: 'medium' },
    { id: 'ip_whitelisting', name: 'IP Whitelisting', description: 'Restrict access to specific IP addresses', category: 'auth', enabled: false, usage: 15, popularity: 'low' },
    { id: 'session_timeout', name: 'Session Timeout', description: 'Automatic session expiration', category: 'auth', enabled: true, usage: 92, popularity: 'high' },
    { id: 'password_policy', name: 'Password Policy Enforcement', description: 'Strong password requirements', category: 'auth', enabled: true, usage: 85, popularity: 'high' },
    { id: 'device_management', name: 'Device Management', description: 'Track and manage user devices', category: 'auth', enabled: false, usage: 30, popularity: 'low' },

    // Student Management Features
    { id: 'student_registration', name: 'Student Registration', description: 'Digital student registration process', category: 'student', enabled: true, usage: 98, popularity: 'high' },
    { id: 'digital_id_cards', name: 'Digital ID Cards', description: 'Generate digital student ID cards', category: 'student', enabled: true, usage: 89, popularity: 'high' },
    { id: 'document_upload', name: 'Document Upload', description: 'Upload and manage student documents', category: 'student', enabled: true, usage: 76, popularity: 'medium' },
    { id: 'bulk_import', name: 'Bulk Student Import', description: 'Import multiple students via CSV', category: 'student', enabled: true, usage: 55, popularity: 'medium' },
    { id: 'library_discovery', name: 'Library Discovery', description: 'Find and discover libraries', category: 'student', enabled: true, usage: 82, popularity: 'high' },
    { id: 'location_search', name: 'Location-based Search', description: 'Search libraries by location', category: 'student', enabled: true, usage: 75, popularity: 'medium' },
    { id: 'advanced_filters', name: 'Advanced Filters', description: 'Advanced search and filter options', category: 'student', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'map_view', name: 'Map View', description: 'Interactive map view of libraries', category: 'student', enabled: true, usage: 72, popularity: 'medium' },
    { id: 'ratings_reviews', name: 'Ratings & Reviews', description: 'Student ratings and reviews', category: 'student', enabled: true, usage: 58, popularity: 'medium' },

    // Seat & Booking Features
    { id: 'seat_booking', name: 'Seat Booking', description: 'Book seats in advance', category: 'seat', enabled: true, usage: 98, popularity: 'high' },
    { id: 'real_time_availability', name: 'Real-time Availability', description: 'Live seat availability updates', category: 'seat', enabled: true, usage: 95, popularity: 'high' },
    { id: 'shift_booking', name: 'Shift-based Booking', description: 'Book seats for specific time shifts', category: 'seat', enabled: true, usage: 88, popularity: 'high' },
    { id: 'group_booking', name: 'Group Booking', description: 'Book multiple seats together', category: 'seat', enabled: true, usage: 65, popularity: 'medium' },
    { id: 'auto_extension', name: 'Auto-extension', description: 'Automatically extend booking time', category: 'seat', enabled: false, usage: 35, popularity: 'low' },
    { id: 'layout_designer', name: 'Seat Layout Designer', description: 'Design custom seat layouts', category: 'seat', enabled: true, usage: 72, popularity: 'medium' },
    { id: 'zone_management', name: 'Zone Management', description: 'Manage different library zones', category: 'seat', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'capacity_planning', name: 'Capacity Planning', description: 'Plan and optimize seating capacity', category: 'seat', enabled: true, usage: 55, popularity: 'medium' },
    { id: '3d_preview', name: '3D Layout Preview', description: '3D visualization of seat layouts', category: 'seat', enabled: false, usage: 20, popularity: 'low' },
    { id: 'seat_attributes', name: 'Seat Attributes', description: 'Custom attributes for seats', category: 'seat', enabled: true, usage: 62, popularity: 'medium' },

    // Attendance & Access Features
    { id: 'qr_attendance', name: 'QR Code Attendance', description: 'Check-in using QR codes', category: 'attendance', enabled: true, usage: 95, popularity: 'high' },
    { id: 'face_recognition', name: 'Face Recognition', description: 'Biometric face recognition attendance', category: 'attendance', enabled: false, usage: 45, popularity: 'medium', dependencies: ['advanced_analytics'] },
    { id: 'manual_entry', name: 'Manual Entry', description: 'Manual attendance entry by staff', category: 'attendance', enabled: true, usage: 85, popularity: 'high' },
    { id: 'rfid_nfc', name: 'RFID/NFC', description: 'RFID and NFC card attendance', category: 'attendance', enabled: false, usage: 25, popularity: 'low' },
    { id: 'biometric_devices', name: 'Biometric Devices', description: 'Physical biometric device integration', category: 'attendance', enabled: false, usage: 15, popularity: 'low' },
    { id: 'real_time_presence', name: 'Real-time Presence', description: 'Track real-time student presence', category: 'attendance', enabled: true, usage: 92, popularity: 'high' },
    { id: 'overstay_alerts', name: 'Overstay Alerts', description: 'Alerts for students staying beyond time', category: 'attendance', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'attendance_reports', name: 'Attendance Reports', description: 'Generate attendance reports', category: 'attendance', enabled: true, usage: 88, popularity: 'high' },
    { id: 'session_duration', name: 'Session Duration', description: 'Track session duration and timing', category: 'attendance', enabled: true, usage: 82, popularity: 'high' },
    { id: 'auto_logout', name: 'Auto Logout', description: 'Automatic logout after session end', category: 'attendance', enabled: false, usage: 40, popularity: 'low' },

    // Payment & Billing Features
    { id: 'payment_gateway', name: 'Payment Gateway Integration', description: 'Online payment processing', category: 'payment', enabled: true, usage: 92, popularity: 'high' },
    { id: 'qr_payments', name: 'QR Code Payments', description: 'Pay using QR codes', category: 'payment', enabled: true, usage: 85, popularity: 'high' },
    { id: 'upi_payments', name: 'UPI Payments', description: 'UPI payment integration', category: 'payment', enabled: true, usage: 88, popularity: 'high' },
    { id: 'wallet_payments', name: 'Wallet Payments', description: 'Digital wallet payment support', category: 'payment', enabled: true, usage: 72, popularity: 'medium' },
    { id: 'auto_receipt', name: 'Auto Receipt Generation', description: 'Automatic receipt generation', category: 'payment', enabled: true, usage: 95, popularity: 'high' },
    { id: 'cash_payments', name: 'Cash Payments', description: 'Offline cash payment support', category: 'payment', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'cheque_payments', name: 'Cheque Payments', description: 'Cheque payment processing', category: 'payment', enabled: true, usage: 45, popularity: 'low' },
    { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer payments', category: 'payment', enabled: true, usage: 55, popularity: 'medium' },
    { id: 'payment_verification', name: 'Payment Verification', description: 'Verify and track payments', category: 'payment', enabled: true, usage: 88, popularity: 'high' },
    { id: 'manual_receipts', name: 'Manual Receipts', description: 'Generate manual payment receipts', category: 'payment', enabled: true, usage: 82, popularity: 'high' },
    { id: 'fee_plan_management', name: 'Fee Plan Management', description: 'Manage different fee plans', category: 'payment', enabled: true, usage: 85, popularity: 'high' },
    { id: 'discount_system', name: 'Discount System', description: 'Apply discounts and promotions', category: 'payment', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'tax_configuration', name: 'Tax Configuration', description: 'Configure tax settings', category: 'payment', enabled: true, usage: 75, popularity: 'medium' },
    { id: 'revenue_analytics', name: 'Advanced Revenue Analytics', description: 'Detailed revenue analysis', category: 'payment', enabled: false, usage: 35, popularity: 'low' },
    { id: 'payment_reminders', name: 'Payment Reminders', description: 'Automated payment reminders', category: 'payment', enabled: true, usage: 88, popularity: 'high' },

    // Communication Features
    { id: 'push_notifications', name: 'Push Notifications', description: 'Mobile push notifications', category: 'communication', enabled: true, usage: 85, popularity: 'high' },
    { id: 'sms_messages', name: 'SMS Messages', description: 'Send SMS notifications', category: 'communication', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'whatsapp_messages', name: 'WhatsApp Messages', description: 'WhatsApp message integration', category: 'communication', enabled: true, usage: 82, popularity: 'high' },
    { id: 'email_notifications', name: 'Email Notifications', description: 'Email notification system', category: 'communication', enabled: true, usage: 92, popularity: 'high' },
    { id: 'in_app_messages', name: 'In-app Messages', description: 'Messages within the application', category: 'communication', enabled: true, usage: 88, popularity: 'high' },
    { id: 'fee_reminders', name: 'Fee Reminders', description: 'Automated fee payment reminders', category: 'communication', enabled: true, usage: 85, popularity: 'high' },
    { id: 'booking_confirmations', name: 'Booking Confirmations', description: 'Automatic booking confirmations', category: 'communication', enabled: true, usage: 92, popularity: 'high' },
    { id: 'attendance_alerts', name: 'Attendance Alerts', description: 'Attendance-related notifications', category: 'communication', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'ai_personalization', name: 'AI Personalization', description: 'AI-powered message personalization', category: 'communication', enabled: false, usage: 25, popularity: 'low' },
    { id: 'bulk_messaging', name: 'Bulk Messaging', description: 'Send messages to multiple users', category: 'communication', enabled: true, usage: 72, popularity: 'medium' },

    // Resource Management Features
    { id: 'ebook_upload', name: 'E-books Upload', description: 'Upload and manage e-books', category: 'resources', enabled: true, usage: 65, popularity: 'medium' },
    { id: 'study_materials', name: 'Study Materials', description: 'Digital study materials library', category: 'resources', enabled: true, usage: 72, popularity: 'medium' },
    { id: 'digital_newspapers', name: 'Digital Newspapers', description: 'Access to digital newspapers', category: 'resources', enabled: true, usage: 45, popularity: 'low' },
    { id: 'video_lectures', name: 'Video Lectures', description: 'Video lecture content', category: 'resources', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'resource_analytics', name: 'Resource Analytics', description: 'Usage analytics for resources', category: 'resources', enabled: false, usage: 30, popularity: 'low' },
    { id: 'resource_categorization', name: 'Resource Categorization', description: 'Organize resources by categories', category: 'resources', enabled: true, usage: 75, popularity: 'medium' },
    { id: 'access_control', name: 'Access Control', description: 'Control resource access permissions', category: 'resources', enabled: true, usage: 82, popularity: 'high' },
    { id: 'download_tracking', name: 'Download Tracking', description: 'Track resource downloads', category: 'resources', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'search_functionality', name: 'Search Functionality', description: 'Search within resources', category: 'resources', enabled: true, usage: 85, popularity: 'high' },
    { id: 'usage_analytics', name: 'Usage Analytics', description: 'Detailed usage analytics', category: 'resources', enabled: false, usage: 35, popularity: 'low' },

    // Issue Reporting Features
    { id: 'category_reporting', name: 'Category-based Reporting', description: 'Report issues by category', category: 'issues', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'photo_attachment', name: 'Photo Attachment', description: 'Attach photos to issue reports', category: 'issues', enabled: true, usage: 72, popularity: 'medium' },
    { id: 'anonymous_reporting', name: 'Anonymous Reporting', description: 'Submit anonymous issue reports', category: 'issues', enabled: true, usage: 65, popularity: 'medium' },
    { id: 'status_tracking', name: 'Status Tracking', description: 'Track issue resolution status', category: 'issues', enabled: true, usage: 85, popularity: 'high' },
    { id: 'feedback_system', name: 'Feedback System', description: 'Collect user feedback', category: 'issues', enabled: true, usage: 75, popularity: 'medium' },
    { id: 'issue_dashboard', name: 'Issue Dashboard', description: 'Centralized issue management', category: 'issues', enabled: true, usage: 82, popularity: 'high' },
    { id: 'staff_assignment', name: 'Staff Assignment', description: 'Assign issues to staff members', category: 'issues', enabled: true, usage: 78, popularity: 'medium' },
    { id: 'response_templates', name: 'Response Templates', description: 'Predefined response templates', category: 'issues', enabled: true, usage: 68, popularity: 'medium' },
    { id: 'issue_analytics', name: 'Issue Analytics', description: 'Analytics for issue management', category: 'issues', enabled: true, usage: 62, popularity: 'medium' },
    { id: 'auto_escalation', name: 'Auto-escalation', description: 'Automatic issue escalation', category: 'issues', enabled: false, usage: 35, popularity: 'low' },

    // IoT Features
    { id: 'smart_lighting', name: 'Smart Lighting Control', description: 'Control smart lighting systems', category: 'iot', enabled: false, usage: 20, popularity: 'low' },
    { id: 'climate_control', name: 'Climate Control', description: 'Control AC and fans', category: 'iot', enabled: false, usage: 25, popularity: 'low' },
    { id: 'power_management', name: 'Power Management', description: 'Manage power consumption', category: 'iot', enabled: false, usage: 15, popularity: 'low' },
    { id: 'energy_monitoring', name: 'Energy Monitoring', description: 'Monitor energy usage', category: 'iot', enabled: false, usage: 18, popularity: 'low' },
    { id: 'automation_rules', name: 'Automation Rules', description: 'Set up automation rules', category: 'iot', enabled: false, usage: 12, popularity: 'low' },
    { id: 'smart_life_integration', name: 'Smart Life/Tuya Integration', description: 'Integrate with Smart Life/Tuya', category: 'iot', enabled: false, usage: 8, popularity: 'low' },
    { id: 'google_home_alexa', name: 'Google Home/Alexa', description: 'Voice control integration', category: 'iot', enabled: false, usage: 10, popularity: 'low' },
    { id: 'ifttt_automation', name: 'IFTTT Automation', description: 'IFTTT automation support', category: 'iot', enabled: false, usage: 5, popularity: 'low' },
    { id: 'custom_iot_protocols', name: 'Custom IoT Protocols', description: 'Support for custom IoT protocols', category: 'iot', enabled: false, usage: 3, popularity: 'low' },

    // Analytics & Reporting Features
    { id: 'basic_reports', name: 'Basic Reports', description: 'Essential reporting features', category: 'analytics', enabled: true, usage: 88, popularity: 'high' },
    { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Advanced data analytics', category: 'analytics', enabled: false, usage: 45, popularity: 'medium' },
    { id: 'predictive_analytics', name: 'Predictive Analytics', description: 'Predictive data analysis', category: 'analytics', enabled: false, usage: 25, popularity: 'low' },
    { id: 'custom_report_builder', name: 'Custom Report Builder', description: 'Build custom reports', category: 'analytics', enabled: false, usage: 35, popularity: 'low' },
    { id: 'real_time_dashboards', name: 'Real-time Dashboards', description: 'Live data dashboards', category: 'analytics', enabled: false, usage: 40, popularity: 'low' },
    { id: 'attendance_analytics', name: 'Attendance Analytics', description: 'Detailed attendance analysis', category: 'analytics', enabled: true, usage: 82, popularity: 'high' },
    { id: 'revenue_reports', name: 'Revenue Reports', description: 'Financial revenue reports', category: 'analytics', enabled: true, usage: 85, popularity: 'high' },
    { id: 'behavior_analytics', name: 'Student Behavior Analytics', description: 'Analyze student behavior patterns', category: 'analytics', enabled: false, usage: 30, popularity: 'low' },
    { id: 'staff_performance', name: 'Staff Performance', description: 'Staff performance metrics', category: 'analytics', enabled: false, usage: 35, popularity: 'low' },
    { id: 'capacity_utilization', name: 'Capacity Utilization', description: 'Analyze capacity usage', category: 'analytics', enabled: false, usage: 40, popularity: 'low' },

    // AI-Powered Features
    { id: 'ai_forecasting', name: 'AI Forecasting', description: 'AI-powered demand forecasting', category: 'ai', enabled: false, usage: 20, popularity: 'low', dependencies: ['advanced_analytics'] },
    { id: 'personalized_recommendations', name: 'Personalized Recommendations', description: 'AI-powered recommendations', category: 'ai', enabled: false, usage: 25, popularity: 'low' },
    { id: 'churn_prediction', name: 'Churn Prediction', description: 'Predict student churn', category: 'ai', enabled: false, usage: 15, popularity: 'low' },
    { id: 'smart_messaging', name: 'Smart Messaging', description: 'AI-optimized messaging', category: 'ai', enabled: false, usage: 18, popularity: 'low' },
    { id: 'predictive_maintenance', name: 'Predictive Maintenance', description: 'Predict maintenance needs', category: 'ai', enabled: false, usage: 12, popularity: 'low' },
    { id: 'face_recognition_ai', name: 'Face Recognition AI', description: 'Advanced face recognition', category: 'ai', enabled: false, usage: 35, popularity: 'medium' },
    { id: 'nlp_processing', name: 'Natural Language Processing', description: 'NLP for text analysis', category: 'ai', enabled: false, usage: 20, popularity: 'low' },
    { id: 'behavior_analysis', name: 'Behavior Analysis', description: 'AI behavior analysis', category: 'ai', enabled: false, usage: 15, popularity: 'low' },
    { id: 'automated_optimization', name: 'Automated Optimization', description: 'AI-powered system optimization', category: 'ai', enabled: false, usage: 10, popularity: 'low' },
    { id: 'smart_alerts', name: 'Smart Alerts', description: 'Intelligent alert system', category: 'ai', enabled: false, usage: 25, popularity: 'low' }
  ]);

  const categories: FeatureCategory[] = [
    {
      id: 'auth',
      name: 'Authentication & Security',
      icon: <SecurityIcon />,
      description: 'User authentication and security features',
      features: features.filter(f => f.category === 'auth')
    },
    {
      id: 'student',
      name: 'Student Management',
      icon: <PersonIcon />,
      description: 'Student registration and management features',
      features: features.filter(f => f.category === 'student')
    },
    {
      id: 'seat',
      name: 'Seat & Booking',
      icon: <SeatIcon />,
      description: 'Seat management and booking features',
      features: features.filter(f => f.category === 'seat')
    },
    {
      id: 'attendance',
      name: 'Attendance & Access',
      icon: <TimeIcon />,
      description: 'Attendance tracking and access control',
      features: features.filter(f => f.category === 'attendance')
    },
    {
      id: 'payment',
      name: 'Payment & Billing',
      icon: <PaymentIcon />,
      description: 'Payment processing and billing features',
      features: features.filter(f => f.category === 'payment')
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: <MessageIcon />,
      description: 'Communication and notification features',
      features: features.filter(f => f.category === 'communication')
    },
    {
      id: 'resources',
      name: 'Resource Management',
      icon: <BookIcon />,
      description: 'Digital resource management',
      features: features.filter(f => f.category === 'resources')
    },
    {
      id: 'issues',
      name: 'Issue Reporting',
      icon: <BugIcon />,
      description: 'Issue reporting and management',
      features: features.filter(f => f.category === 'issues')
    },
    {
      id: 'iot',
      name: 'Smart IoT Controls',
      icon: <HomeIcon />,
      description: 'IoT device control and automation',
      features: features.filter(f => f.category === 'iot')
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      icon: <AnalyticsIcon />,
      description: 'Data analytics and reporting',
      features: features.filter(f => f.category === 'analytics')
    },
    {
      id: 'ai',
      name: 'AI & Machine Learning',
      icon: <PsychologyIcon />,
      description: 'AI-powered features and automation',
      features: features.filter(f => f.category === 'ai')
    }
  ];

  const handleFeatureToggle = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    // Check dependencies
    if (!feature.enabled && feature.dependencies) {
      const missingDependencies = feature.dependencies.filter(depId => 
        !features.find(f => f.id === depId)?.enabled
      );
      
      if (missingDependencies.length > 0) {
        setPendingDependencies(missingDependencies);
        setShowDependenciesDialog(true);
        return;
      }
    }

    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || !bulkCategory) return;

    const targetFeatures = bulkCategory === 'all' 
      ? features 
      : features.filter(f => f.category === bulkCategory);

    const updatedFeatures = features.map(feature => {
      if (targetFeatures.includes(feature)) {
        switch (bulkAction) {
          case 'enable':
            return { ...feature, enabled: true };
          case 'disable':
            return { ...feature, enabled: false };
          case 'reset':
            return { ...feature, enabled: feature.required || false };
          default:
            return feature;
        }
      }
      return feature;
    });

    setFeatures(updatedFeatures);
    setShowBulkDialog(false);
    setBulkAction('');
    setBulkCategory('');
  };

  const getFeatureStatus = () => {
    const enabled = features.filter(f => f.enabled).length;
    const disabled = features.filter(f => !f.enabled).length;
    const partial = features.filter(f => f.partial).length;
    const total = features.length;
    const usage = Math.round((enabled / total) * 100);

    return { enabled, disabled, partial, total, usage };
  };

  const getMostUsedFeatures = () => {
    return features
      .filter(f => f.enabled)
      .sort((a, b) => (b.usage || 0) - (a.usage || 0))
      .slice(0, 5);
  };

  const getUnderutilizedFeatures = () => {
    return features
      .filter(f => f.enabled && (f.usage || 0) < 50)
      .sort((a, b) => (a.usage || 0) - (b.usage || 0))
      .slice(0, 3);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    features: category.features.filter(feature =>
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.features.length > 0);

  const status = getFeatureStatus();
  const mostUsed = getMostUsedFeatures();
  const underutilized = getUnderutilizedFeatures();

  const renderFeatureCard = (feature: Feature) => (
    <Card key={feature.id} variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {feature.name}
              </Typography>
              {feature.required && (
                <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
              )}
              {feature.partial && (
                <Chip label="Partial" size="small" color="warning" sx={{ ml: 1 }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {feature.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Usage:
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={feature.usage || 0}
                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {feature.usage || 0}%
                </Typography>
              </Box>
              <Chip
                label={feature.popularity || 'low'}
                size="small"
                color={
                  feature.popularity === 'high' ? 'success' :
                  feature.popularity === 'medium' ? 'warning' : 'default'
                }
              />
            </Box>
          </Box>
          <Box sx={{ ml: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={feature.enabled}
                  onChange={() => handleFeatureToggle(feature.id)}
                  disabled={feature.required}
                />
              }
              label=""
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            {filteredCategories.map((category) => (
              <Accordion key={category.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {category.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${category.features.filter(f => f.enabled).length}/${category.features.length}`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {category.features.map(renderFeatureCard)}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              📈 Feature Usage Analytics
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🏆 Most Used Features
                    </Typography>
                    <List>
                      {mostUsed.map((feature, index) => (
                        <ListItem key={feature.id}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={feature.name}
                            secondary={`${feature.usage}% adoption`}
                          />
                          <Chip
                            label={feature.popularity}
                            size="small"
                            color={
                              feature.popularity === 'high' ? 'success' :
                              feature.popularity === 'medium' ? 'warning' : 'default'
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Usage Trends
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Weekly Active Features"
                          secondary={`${status.enabled}/${status.total}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Feature Adoption Rate"
                          secondary={`${status.usage}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Most Requested Feature"
                          secondary="Face Recognition"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Underutilized Feature"
                          secondary={underutilized[0]?.name || 'None'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎯 Recommendations
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Enable Face Recognition"
                      secondary="High demand from users (45% usage)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Disable Aadhaar KYC"
                      secondary="Low usage (25% adoption)"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Promote Resource Library features"
                      secondary="Underutilized (45% average usage)"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              🎯 Bulk Operations
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  🔧 Apply to Multiple Features
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Action</InputLabel>
                      <Select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                      >
                        <MenuItem value="enable">Enable All</MenuItem>
                        <MenuItem value="disable">Disable All</MenuItem>
                        <MenuItem value="reset">Reset to Default</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setShowBulkDialog(true)}
                      disabled={!bulkCategory || !bulkAction}
                    >
                      Apply Action
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  ⚡ Quick Presets
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ height: 80 }}
                      onClick={() => {
                        // Apply basic library preset
                        const basicFeatures = ['email_login', 'student_registration', 'seat_booking', 'qr_attendance', 'payment_gateway'];
                        setFeatures(prev => prev.map(f => ({
                          ...f,
                          enabled: basicFeatures.includes(f.id) || (f.required || false)
                        })));
                      }}
                    >
                      <Box>
                        <SchoolIcon sx={{ mb: 1 }} />
                        <Typography variant="body2">🎓 Basic Library</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ height: 80 }}
                      onClick={() => {
                        // Apply standard library preset
                        const standardFeatures = ['email_login', 'social_login', 'student_registration', 'seat_booking', 'qr_attendance', 'payment_gateway', 'push_notifications', 'basic_reports'];
                        setFeatures(prev => prev.map(f => ({
                          ...f,
                          enabled: standardFeatures.includes(f.id) || (f.required || false)
                        })));
                      }}
                    >
                      <Box>
                        <BusinessIcon sx={{ mb: 1 }} />
                        <Typography variant="body2">🏢 Standard Library</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ height: 80 }}
                      onClick={() => {
                        // Apply premium library preset
                        setFeatures(prev => prev.map(f => ({
                          ...f,
                          enabled: true
                        })));
                      }}
                    >
                      <Box>
                        <StarIcon sx={{ mb: 1 }} />
                        <Typography variant="body2">🚀 Premium Library</Typography>
                      </Box>
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ height: 80 }}
                      onClick={() => {
                        // Reset to current selection
                        console.log('Current selection preserved');
                      }}
                    >
                      <Box>
                        <TuneIcon sx={{ mb: 1 }} />
                        <Typography variant="body2">🔧 Custom</Typography>
                      </Box>
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  📋 Preset Details:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="• Basic Library: Essential features only"
                      secondary="Email login, student registration, seat booking, QR attendance, payment gateway"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="• Standard Library: Basic + Communication + Reports"
                      secondary="All basic features plus social login, notifications, and basic reports"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="• Premium Library: All features enabled"
                      secondary="Complete feature set including AI, IoT, and advanced analytics"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="• Custom: Your current selection"
                      secondary="Maintain your current feature configuration"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        ⚙️ Feature Control Center - [Library Name]
      </Typography>
      
      {/* Quick Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </CardContent>
      </Card>

      {/* Feature Status Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {status.enabled}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ✅ Enabled Features
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main" fontWeight={700}>
                  {status.disabled}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ❌ Disabled Features
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {status.partial}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🔄 Partial Features
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {status.usage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📊 Feature Adoption
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              🚀 Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  setFeatures(prev => prev.map(f => ({ ...f, enabled: true })));
                }}
              >
                Enable All
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setFeatures(prev => prev.map(f => ({ ...f, enabled: f.required || false })));
                }}
              >
                Disable All
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestoreIcon />}
                onClick={() => {
                  // Reset to default configuration
                  window.location.reload();
                }}
              >
                Reset to Default
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => {
                  // Save current configuration
                  console.log('Saving feature configuration:', features);
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Feature Toggles" />
            <Tab label="Usage Analytics" />
            <Tab label="Bulk Operations" />
          </Tabs>
        </Box>
        <CardContent>
          {renderTabContent()}
        </CardContent>
      </Card>

      {/* Dependencies Dialog */}
      <Dialog open={showDependenciesDialog} onClose={() => setShowDependenciesDialog(false)}>
        <DialogTitle>⚠️ Feature Dependencies</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            The following features need to be enabled first:
          </Typography>
          <List>
            {pendingDependencies.map((depId) => {
              const dep = features.find(f => f.id === depId);
              return dep ? (
                <ListItem key={depId}>
                  <ListItemText primary={dep.name} secondary={dep.description} />
                </ListItem>
              ) : null;
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDependenciesDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Enable dependencies
              setFeatures(prev => prev.map(f => 
                pendingDependencies.includes(f.id) ? { ...f, enabled: true } : f
              ));
              setShowDependenciesDialog(false);
              setPendingDependencies([]);
            }}
          >
            Enable Dependencies
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={showBulkDialog} onClose={() => setShowBulkDialog(false)}>
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {bulkAction} all features in the {bulkCategory} category?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeatureControlDashboard;
