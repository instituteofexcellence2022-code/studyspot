// ============================================
// FEE PLAN OVERSIGHT DASHBOARD
// Monitor and manage all subscription and fee plans
// ============================================

import React, { useState, useMemo } from 'react';
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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  People,
  Edit,
  Add,
  Refresh,
  Download,
  Visibility,
  Star,
  Timeline,
  Assessment,
  CheckCircle,
  Close,
  Info,
  Subscriptions,
  SwapHoriz,
  Schedule,
  Warning,
  ExpandMore,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Default permissions structure
const getDefaultPermissions = () => ({
  modules: {
    studentManagement: true,
    attendanceTracking: true,
    feeManagement: true,
    seatAllocation: true,
    staffManagement: true,
    reportGeneration: true,
    basicAnalytics: true,
    advancedAnalytics: false,
    customReports: false,
    dashboard: true,
  },
  communication: {
    emailNotifications: true,
    smsNotifications: false,
    whatsappIntegration: false,
    pushNotifications: false,
    parentPortal: false,
    inAppMessaging: false,
    bulkMessaging: false,
    automatedReminders: false,
  },
  financial: {
    feeCollection: true,
    paymentGateway: false,
    invoiceGeneration: true,
    receiptGeneration: true,
    lateFeePenalties: false,
    discountManagement: false,
    refundProcessing: false,
    multiCurrencySupport: false,
    recurringBilling: false,
    paymentPlans: false,
  },
  attendance: {
    manualAttendance: true,
    qrCodeScanning: false,
    biometricIntegration: false,
    faceRecognition: false,
    gpsTracking: false,
    bulkAttendance: false,
    attendanceReports: true,
    lateComers: false,
    absenteeAlerts: false,
  },
  analytics: {
    basicDashboard: true,
    advancedCharts: false,
    customReportBuilder: false,
    exportToPDF: true,
    exportToExcel: true,
    scheduledReports: false,
    emailReports: false,
    realtimeAnalytics: false,
    predictiveAnalytics: false,
    trendsAnalysis: false,
  },
  integrations: {
    restAPI: false,
    webhooks: false,
    zapierIntegration: false,
    googleCalendar: false,
    microsoftOffice: false,
    accountingSoftware: false,
    customIntegrations: false,
    ssoLogin: false,
    ldapIntegration: false,
  },
  mobileAccess: {
    mobileApp: true,
    iosApp: true,
    androidApp: true,
    progressiveWebApp: true,
    offlineMode: false,
    mobilePayments: false,
    mobileReports: false,
  },
  security: {
    dataEncryption: true,
    regularBackups: true,
    twoFactorAuth: false,
    ssoSupport: false,
    ipWhitelisting: false,
    auditLogs: false,
    gdprCompliance: true,
    customSecurity: false,
    roleBasedAccess: false,
  },
  advanced: {
    bulkOperations: false,
    dataImportExport: true,
    customBranding: false,
    whiteLabeling: false,
    multiLocationSupport: false,
    multiLanguageSupport: false,
    customWorkflows: false,
    automationRules: false,
    aiPoweredInsights: false,
  },
  support: {
    emailSupport: true,
    chatSupport: false,
    phoneSupport: false,
    prioritySupport: false,
    dedicatedManager: false,
    onboarding: false,
    training: false,
    customDevelopment: false,
    slaGuarantee: false,
  },
  limits: {
    maxStudents: 100,
    maxStaff: 5,
    maxLocations: 1,
    maxAdmins: 2,
    storageGB: 5,
    apiCallsPerMonth: 0,
    smsPerMonth: 0,
    emailsPerMonth: 1000,
    whatsappPerMonth: 0,
    concurrentUsers: 10,
    dataRetentionYears: 1,
    backupFrequencyDays: 7,
  },
  resources: {
    maxSeats: 100,
    maxShifts: 2,
    maxClassrooms: 5,
    maxCourses: 10,
    maxBatches: 20,
    customFields: 5,
    savedReports: 10,
    dashboardWidgets: 6,
  }
});

const FeePlanOversightDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    type: 'Starter',
    description: '',
    price: '',
    billingCycle: 'monthly',
    annualPrice: '',
    trialDays: '14',
    maxStudents: '100',
    maxStaff: '5',
    features: [
      'Student management',
      'Attendance tracking',
      'Mobile app access',
      'Email notifications',
      'Data security & backup'
    ] as string[],
    newFeature: '',
    isPopular: false,
    status: 'active',
    // Discount settings per billing cycle
    discounts: {
      monthly: { enabled: false, type: 'percentage', value: '', label: '' },
      quarterly: { enabled: false, type: 'percentage', value: '', label: '' },
      halfYearly: { enabled: false, type: 'percentage', value: '', label: '' },
      annual: { enabled: false, type: 'percentage', value: '', label: '' },
    },
    permissions: getDefaultPermissions()
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subscriptionSearchQuery, setSubscriptionSearchQuery] = useState('');

  // Handlers for create plan
  const handleCreatePlan = () => {
    setCreatePlanOpen(true);
  };

  const handleClosePlanDialog = () => {
    setCreatePlanOpen(false);
    // Reset form with default features
    setNewPlan({
      name: '',
      type: 'Starter',
      description: '',
      price: '',
      billingCycle: 'monthly',
      annualPrice: '',
      trialDays: '14',
      maxStudents: '100',
      maxStaff: '5',
      features: [
        'Student management',
        'Attendance tracking',
        'Mobile app access',
        'Email notifications',
        'Data security & backup'
      ],
      newFeature: '',
      isPopular: false,
      status: 'active',
      discounts: {
        monthly: { enabled: false, type: 'percentage', value: '', label: '' },
        quarterly: { enabled: false, type: 'percentage', value: '', label: '' },
        halfYearly: { enabled: false, type: 'percentage', value: '', label: '' },
        annual: { enabled: false, type: 'percentage', value: '', label: '' },
      },
      permissions: getDefaultPermissions()
    });
  };

  // Auto-generate plan name, description AND permissions based on type
  const handlePlanTypeChange = (type: string) => {
    const billingLabel = newPlan.billingCycle === 'monthly' ? 'Monthly' : 
                         newPlan.billingCycle === 'annual' ? 'Annual' : 
                         newPlan.billingCycle === 'quarterly' ? 'Quarterly' : 'Plan';
    
    // Pre-filled descriptions for each type
    const descriptions: Record<string, string> = {
      Free: 'Perfect for individuals or small groups just getting started. No credit card required.',
      Trial: 'Try all premium features risk-free for a limited time. Experience the full power of our platform.',
      Starter: 'Ideal for small to medium libraries looking to streamline their operations with essential tools.',
      Professional: 'Best for growing libraries needing advanced analytics, unlimited students, and priority support.',
      Enterprise: 'Complete solution for large institutions with custom integrations, dedicated support, and unlimited resources.',
      Custom: 'Create a custom plan tailored to specific requirements.',
    };

    // Auto-set defaults based on type
    const updates: any = {
      type,
      name: type === 'Custom' ? '' : `${type} ${billingLabel}`,
      description: descriptions[type] || '',
    };

    if (type === 'Free') {
      updates.price = '0';
      updates.trialDays = '0';
      updates.maxStudents = '10';
      updates.maxStaff = '2';
    } else if (type === 'Trial') {
      updates.trialDays = '30';
      updates.maxStudents = '0';
      updates.maxStaff = '0';
    } else if (type === 'Enterprise') {
      updates.maxStudents = '0';
      updates.maxStaff = '0';
    } else if (type === 'Starter') {
      updates.maxStudents = '100';
      updates.maxStaff = '5';
      updates.trialDays = '14';
    } else if (type === 'Professional') {
      updates.maxStudents = '500';
      updates.maxStaff = '20';
      updates.trialDays = '14';
    }

    setNewPlan(prev => ({ ...prev, ...updates }));
    
    // Auto-trigger common features to also set permissions
    setTimeout(() => addCommonFeatures(), 0);
  };

  // Auto-calculate annual price with 17% discount
  const handlePriceChange = (price: string) => {
    setNewPlan({ ...newPlan, price });
    if (price && !isNaN(Number(price)) && Number(price) > 0) {
      const annualDiscount = Number(price) * 12 * 0.83; // 17% discount
      setNewPlan(prev => ({ ...prev, price, annualPrice: Math.round(annualDiscount).toString() }));
    }
  };

  // Auto-add common features AND configure permissions based on plan type
  const addCommonFeatures = () => {
    const commonFeatures: Record<string, string[]> = {
      Free: [
        'Basic student enrollment',
        'Manual attendance marking',
        'Up to 10 students',
        'Up to 2 staff members',
        'Email support (48hr response)',
        'Basic dashboard view',
        'Student profile management',
        'Simple attendance reports'
      ],
      Trial: [
        'All Professional features',
        '30-day full access trial',
        'Unlimited students & staff',
        'Priority email & chat support',
        'Advanced analytics & reports',
        'Mobile app access (iOS & Android)',
        'No credit card required',
        'Full data export on trial end'
      ],
      Starter: [
        'Student enrollment & management',
        'QR code/Biometric attendance',
        'Up to 100 students',
        'Up to 5 staff accounts',
        'Email & SMS notifications',
        'Basic analytics dashboard',
        'Attendance reports & alerts',
        'Fee payment tracking',
        'Seat allocation system',
        'Mobile app access',
        'Email support (24hr response)',
        'Data export (CSV/Excel)'
      ],
      Professional: [
        'Everything in Starter plan',
        'Unlimited students',
        'Up to 20 staff accounts',
        'Advanced analytics & insights',
        'Custom report builder',
        'Automated fee reminders',
        'Late fee management',
        'Multi-shift management',
        'Resource booking system',
        'Parent/Guardian portal',
        'WhatsApp integration',
        'API access for integrations',
        'Priority support (12hr response)',
        'Role-based permissions',
        'Bulk operations & imports'
      ],
      Enterprise: [
        'Everything in Professional',
        'Unlimited students & staff',
        'Dedicated account manager',
        'Custom integrations & APIs',
        'White-label mobile apps',
        'Multi-location support',
        'Advanced security (SSO/LDAP)',
        'Custom workflows & automation',
        'SLA guarantee (99.9% uptime)',
        '24/7 phone & priority support',
        'On-premise deployment option',
        'Custom feature development',
        'Dedicated training sessions',
        'Advanced audit logs',
        'Custom domain & branding'
      ],
      Custom: [
        'Tailored feature selection',
        'Flexible student/staff limits',
        'Custom pricing structure',
        'Select modules as needed',
        'Hybrid deployment options'
      ]
    };

    // Auto-configure permissions based on plan type
    const permissionPresets: Record<string, any> = {
      Free: {
        modules: { studentManagement: true, attendanceTracking: true, feeManagement: true, seatAllocation: false, staffManagement: true, reportGeneration: true, basicAnalytics: true, advancedAnalytics: false, customReports: false, dashboard: true },
        communication: { emailNotifications: true, smsNotifications: false, whatsappIntegration: false, pushNotifications: false, parentPortal: false, inAppMessaging: false, bulkMessaging: false, automatedReminders: false },
        financial: { feeCollection: true, paymentGateway: false, invoiceGeneration: false, receiptGeneration: true, lateFeePenalties: false, discountManagement: false, refundProcessing: false, multiCurrencySupport: false, recurringBilling: false, paymentPlans: false },
        attendance: { manualAttendance: true, qrCodeScanning: false, biometricIntegration: false, faceRecognition: false, gpsTracking: false, bulkAttendance: false, attendanceReports: true, lateComers: false, absenteeAlerts: false },
        analytics: { basicDashboard: true, advancedCharts: false, customReportBuilder: false, exportToPDF: true, exportToExcel: false, scheduledReports: false, emailReports: false, realtimeAnalytics: false, predictiveAnalytics: false, trendsAnalysis: false },
        integrations: { restAPI: false, webhooks: false, zapierIntegration: false, googleCalendar: false, microsoftOffice: false, accountingSoftware: false, customIntegrations: false, ssoLogin: false, ldapIntegration: false },
        mobileAccess: { mobileApp: true, iosApp: true, androidApp: true, progressiveWebApp: true, offlineMode: false, mobilePayments: false, mobileReports: false },
        security: { dataEncryption: true, regularBackups: true, twoFactorAuth: false, ssoSupport: false, ipWhitelisting: false, auditLogs: false, gdprCompliance: true, customSecurity: false, roleBasedAccess: false },
        advanced: { bulkOperations: false, dataImportExport: true, customBranding: false, whiteLabeling: false, multiLocationSupport: false, multiLanguageSupport: false, customWorkflows: false, automationRules: false, aiPoweredInsights: false },
        support: { emailSupport: true, chatSupport: false, phoneSupport: false, prioritySupport: false, dedicatedManager: false, onboarding: false, training: false, customDevelopment: false, slaGuarantee: false },
        limits: { maxStudents: 10, maxStaff: 2, maxLocations: 1, maxAdmins: 1, storageGB: 1, apiCallsPerMonth: 0, smsPerMonth: 0, emailsPerMonth: 100, whatsappPerMonth: 0, concurrentUsers: 5, dataRetentionYears: 1, backupFrequencyDays: 30 },
        resources: { maxSeats: 10, maxShifts: 1, maxClassrooms: 1, maxCourses: 5, maxBatches: 5, customFields: 3, savedReports: 3, dashboardWidgets: 4 }
      },
      Starter: {
        modules: { studentManagement: true, attendanceTracking: true, feeManagement: true, seatAllocation: true, staffManagement: true, reportGeneration: true, basicAnalytics: true, advancedAnalytics: false, customReports: false, dashboard: true },
        communication: { emailNotifications: true, smsNotifications: true, whatsappIntegration: false, pushNotifications: true, parentPortal: false, inAppMessaging: false, bulkMessaging: false, automatedReminders: true },
        financial: { feeCollection: true, paymentGateway: true, invoiceGeneration: true, receiptGeneration: true, lateFeePenalties: false, discountManagement: false, refundProcessing: false, multiCurrencySupport: false, recurringBilling: true, paymentPlans: false },
        attendance: { manualAttendance: true, qrCodeScanning: true, biometricIntegration: false, faceRecognition: false, gpsTracking: false, bulkAttendance: false, attendanceReports: true, lateComers: true, absenteeAlerts: true },
        analytics: { basicDashboard: true, advancedCharts: false, customReportBuilder: false, exportToPDF: true, exportToExcel: true, scheduledReports: false, emailReports: false, realtimeAnalytics: false, predictiveAnalytics: false, trendsAnalysis: false },
        integrations: { restAPI: false, webhooks: false, zapierIntegration: false, googleCalendar: false, microsoftOffice: false, accountingSoftware: false, customIntegrations: false, ssoLogin: false, ldapIntegration: false },
        mobileAccess: { mobileApp: true, iosApp: true, androidApp: true, progressiveWebApp: true, offlineMode: false, mobilePayments: false, mobileReports: true },
        security: { dataEncryption: true, regularBackups: true, twoFactorAuth: false, ssoSupport: false, ipWhitelisting: false, auditLogs: false, gdprCompliance: true, customSecurity: false, roleBasedAccess: false },
        advanced: { bulkOperations: false, dataImportExport: true, customBranding: false, whiteLabeling: false, multiLocationSupport: false, multiLanguageSupport: false, customWorkflows: false, automationRules: false, aiPoweredInsights: false },
        support: { emailSupport: true, chatSupport: false, phoneSupport: false, prioritySupport: false, dedicatedManager: false, onboarding: false, training: false, customDevelopment: false, slaGuarantee: false },
        limits: { maxStudents: 100, maxStaff: 5, maxLocations: 1, maxAdmins: 2, storageGB: 5, apiCallsPerMonth: 0, smsPerMonth: 100, emailsPerMonth: 1000, whatsappPerMonth: 0, concurrentUsers: 10, dataRetentionYears: 1, backupFrequencyDays: 7 },
        resources: { maxSeats: 100, maxShifts: 2, maxClassrooms: 5, maxCourses: 10, maxBatches: 20, customFields: 5, savedReports: 10, dashboardWidgets: 6 }
      },
      Professional: {
        modules: { studentManagement: true, attendanceTracking: true, feeManagement: true, seatAllocation: true, staffManagement: true, reportGeneration: true, basicAnalytics: true, advancedAnalytics: true, customReports: true, dashboard: true },
        communication: { emailNotifications: true, smsNotifications: true, whatsappIntegration: true, pushNotifications: true, parentPortal: true, inAppMessaging: true, bulkMessaging: true, automatedReminders: true },
        financial: { feeCollection: true, paymentGateway: true, invoiceGeneration: true, receiptGeneration: true, lateFeePenalties: true, discountManagement: true, refundProcessing: true, multiCurrencySupport: false, recurringBilling: true, paymentPlans: true },
        attendance: { manualAttendance: true, qrCodeScanning: true, biometricIntegration: true, faceRecognition: false, gpsTracking: false, bulkAttendance: true, attendanceReports: true, lateComers: true, absenteeAlerts: true },
        analytics: { basicDashboard: true, advancedCharts: true, customReportBuilder: true, exportToPDF: true, exportToExcel: true, scheduledReports: true, emailReports: true, realtimeAnalytics: true, predictiveAnalytics: false, trendsAnalysis: true },
        integrations: { restAPI: true, webhooks: true, zapierIntegration: false, googleCalendar: true, microsoftOffice: true, accountingSoftware: true, customIntegrations: false, ssoLogin: false, ldapIntegration: false },
        mobileAccess: { mobileApp: true, iosApp: true, androidApp: true, progressiveWebApp: true, offlineMode: true, mobilePayments: true, mobileReports: true },
        security: { dataEncryption: true, regularBackups: true, twoFactorAuth: true, ssoSupport: false, ipWhitelisting: false, auditLogs: true, gdprCompliance: true, customSecurity: false, roleBasedAccess: true },
        advanced: { bulkOperations: true, dataImportExport: true, customBranding: false, whiteLabeling: false, multiLocationSupport: false, multiLanguageSupport: true, customWorkflows: false, automationRules: true, aiPoweredInsights: false },
        support: { emailSupport: true, chatSupport: true, phoneSupport: false, prioritySupport: true, dedicatedManager: false, onboarding: true, training: false, customDevelopment: false, slaGuarantee: false },
        limits: { maxStudents: 0, maxStaff: 20, maxLocations: 1, maxAdmins: 5, storageGB: 50, apiCallsPerMonth: 10000, smsPerMonth: 1000, emailsPerMonth: 10000, whatsappPerMonth: 500, concurrentUsers: 100, dataRetentionYears: 3, backupFrequencyDays: 1 },
        resources: { maxSeats: 0, maxShifts: 10, maxClassrooms: 20, maxCourses: 0, maxBatches: 0, customFields: 20, savedReports: 50, dashboardWidgets: 12 }
      },
      Enterprise: {
        modules: { studentManagement: true, attendanceTracking: true, feeManagement: true, seatAllocation: true, staffManagement: true, reportGeneration: true, basicAnalytics: true, advancedAnalytics: true, customReports: true, dashboard: true },
        communication: { emailNotifications: true, smsNotifications: true, whatsappIntegration: true, pushNotifications: true, parentPortal: true, inAppMessaging: true, bulkMessaging: true, automatedReminders: true },
        financial: { feeCollection: true, paymentGateway: true, invoiceGeneration: true, receiptGeneration: true, lateFeePenalties: true, discountManagement: true, refundProcessing: true, multiCurrencySupport: true, recurringBilling: true, paymentPlans: true },
        attendance: { manualAttendance: true, qrCodeScanning: true, biometricIntegration: true, faceRecognition: true, gpsTracking: true, bulkAttendance: true, attendanceReports: true, lateComers: true, absenteeAlerts: true },
        analytics: { basicDashboard: true, advancedCharts: true, customReportBuilder: true, exportToPDF: true, exportToExcel: true, scheduledReports: true, emailReports: true, realtimeAnalytics: true, predictiveAnalytics: true, trendsAnalysis: true },
        integrations: { restAPI: true, webhooks: true, zapierIntegration: true, googleCalendar: true, microsoftOffice: true, accountingSoftware: true, customIntegrations: true, ssoLogin: true, ldapIntegration: true },
        mobileAccess: { mobileApp: true, iosApp: true, androidApp: true, progressiveWebApp: true, offlineMode: true, mobilePayments: true, mobileReports: true },
        security: { dataEncryption: true, regularBackups: true, twoFactorAuth: true, ssoSupport: true, ipWhitelisting: true, auditLogs: true, gdprCompliance: true, customSecurity: true, roleBasedAccess: true },
        advanced: { bulkOperations: true, dataImportExport: true, customBranding: true, whiteLabeling: true, multiLocationSupport: true, multiLanguageSupport: true, customWorkflows: true, automationRules: true, aiPoweredInsights: true },
        support: { emailSupport: true, chatSupport: true, phoneSupport: true, prioritySupport: true, dedicatedManager: true, onboarding: true, training: true, customDevelopment: true, slaGuarantee: true },
        limits: { maxStudents: 0, maxStaff: 0, maxLocations: 0, maxAdmins: 0, storageGB: 0, apiCallsPerMonth: 0, smsPerMonth: 0, emailsPerMonth: 0, whatsappPerMonth: 0, concurrentUsers: 0, dataRetentionYears: 10, backupFrequencyDays: 1 },
        resources: { maxSeats: 0, maxShifts: 0, maxClassrooms: 0, maxCourses: 0, maxBatches: 0, customFields: 0, savedReports: 0, dashboardWidgets: 0 }
      },
      Trial: {
        modules: { studentManagement: true, attendanceTracking: true, feeManagement: true, seatAllocation: true, staffManagement: true, reportGeneration: true, basicAnalytics: true, advancedAnalytics: true, customReports: true, dashboard: true },
        communication: { emailNotifications: true, smsNotifications: true, whatsappIntegration: true, pushNotifications: true, parentPortal: true, inAppMessaging: true, bulkMessaging: true, automatedReminders: true },
        financial: { feeCollection: true, paymentGateway: true, invoiceGeneration: true, receiptGeneration: true, lateFeePenalties: true, discountManagement: true, refundProcessing: true, multiCurrencySupport: false, recurringBilling: true, paymentPlans: true },
        attendance: { manualAttendance: true, qrCodeScanning: true, biometricIntegration: true, faceRecognition: false, gpsTracking: false, bulkAttendance: true, attendanceReports: true, lateComers: true, absenteeAlerts: true },
        analytics: { basicDashboard: true, advancedCharts: true, customReportBuilder: true, exportToPDF: true, exportToExcel: true, scheduledReports: true, emailReports: true, realtimeAnalytics: true, predictiveAnalytics: false, trendsAnalysis: true },
        integrations: { restAPI: true, webhooks: true, zapierIntegration: false, googleCalendar: true, microsoftOffice: true, accountingSoftware: true, customIntegrations: false, ssoLogin: false, ldapIntegration: false },
        mobileAccess: { mobileApp: true, iosApp: true, androidApp: true, progressiveWebApp: true, offlineMode: true, mobilePayments: true, mobileReports: true },
        security: { dataEncryption: true, regularBackups: true, twoFactorAuth: true, ssoSupport: false, ipWhitelisting: false, auditLogs: true, gdprCompliance: true, customSecurity: false, roleBasedAccess: true },
        advanced: { bulkOperations: true, dataImportExport: true, customBranding: false, whiteLabeling: false, multiLocationSupport: false, multiLanguageSupport: true, customWorkflows: false, automationRules: true, aiPoweredInsights: false },
        support: { emailSupport: true, chatSupport: true, phoneSupport: false, prioritySupport: true, dedicatedManager: false, onboarding: true, training: false, customDevelopment: false, slaGuarantee: false },
        limits: { maxStudents: 0, maxStaff: 0, maxLocations: 1, maxAdmins: 3, storageGB: 50, apiCallsPerMonth: 10000, smsPerMonth: 1000, emailsPerMonth: 10000, whatsappPerMonth: 500, concurrentUsers: 100, dataRetentionYears: 3, backupFrequencyDays: 1 },
        resources: { maxSeats: 0, maxShifts: 10, maxClassrooms: 20, maxCourses: 0, maxBatches: 0, customFields: 20, savedReports: 50, dashboardWidgets: 12 }
      },
      Custom: getDefaultPermissions()
    };

    const features = commonFeatures[newPlan.type] || [];
    const permissions = permissionPresets[newPlan.type] || getDefaultPermissions();
    
    setNewPlan(prev => ({ ...prev, features, permissions }));
  };

  const handleAddFeature = () => {
    if (newPlan.newFeature.trim()) {
      setNewPlan({
        ...newPlan,
        features: [...newPlan.features, newPlan.newFeature.trim()],
        newFeature: '',
      });
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan({
      ...newPlan,
      features: newPlan.features.filter((_, i) => i !== index),
    });
  };

  const handleSavePlan = () => {
    // TODO: Add API call to save the plan
    console.log('Saving plan:', newPlan);
    handleClosePlanDialog();
    // Show success message
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'cancelled': return 'error';
      case 'expired': return 'default';
      case 'past_due': return 'warning';
      default: return 'default';
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'upgrade': return 'success';
      case 'downgrade': return 'warning';
      case 'cancel': return 'error';
      case 'renewal': return 'info';
      case 'reactivate': return 'success';
      default: return 'default';
    }
  };

  // KPIs
  const kpis = {
    totalPlans: 12,
    activePlans: 8,
    totalSubscribers: 12859,
    totalMRR: 48500000,
    avgPlanPrice: 3770,
    mostPopular: 'Professional',
    highestRevenue: 'Enterprise',
    conversionRate: 42.3,
  };

  // Mock fee plans data
  const feePlans = [
    { 
      id: 1, 
      name: 'Free Tier', 
      type: 'Free', 
      price: 0, 
      billingCycle: 'N/A', 
      subscribers: 3245, 
      mrr: 0, 
      status: 'active',
      features: ['1 Library', '50 Seats', 'Basic Support'],
      conversionRate: 12.5,
      churnRate: 45.2,
    },
    { 
      id: 2, 
      name: 'Starter Monthly', 
      type: 'Starter', 
      price: 2999, 
      billingCycle: 'Monthly', 
      subscribers: 4523, 
      mrr: 13567000, 
      status: 'active',
      features: ['2 Libraries', '200 Seats', 'Email Support'],
      conversionRate: 35.6,
      churnRate: 8.3,
    },
    { 
      id: 3, 
      name: 'Starter Annual', 
      type: 'Starter', 
      price: 28990, 
      billingCycle: 'Annual', 
      subscribers: 1234, 
      mrr: 2982000, 
      status: 'active',
      features: ['2 Libraries', '200 Seats', 'Email Support', '2 months free'],
      conversionRate: 25.3,
      churnRate: 3.2,
    },
    { 
      id: 4, 
      name: 'Professional Monthly', 
      type: 'Professional', 
      price: 9999, 
      billingCycle: 'Monthly', 
      subscribers: 2145, 
      mrr: 21447000, 
      status: 'active',
      features: ['5 Libraries', '1000 Seats', 'Priority Support', 'Advanced Analytics'],
      conversionRate: 45.8,
      churnRate: 4.5,
    },
    { 
      id: 5, 
      name: 'Professional Annual', 
      type: 'Professional', 
      price: 95990, 
      billingCycle: 'Annual', 
      subscribers: 678, 
      mrr: 5424000, 
      status: 'active',
      features: ['5 Libraries', '1000 Seats', 'Priority Support', 'Advanced Analytics', '2 months free'],
      conversionRate: 38.2,
      churnRate: 1.8,
    },
    { 
      id: 6, 
      name: 'Enterprise Monthly', 
      type: 'Enterprise', 
      price: 24999, 
      billingCycle: 'Monthly', 
      subscribers: 823, 
      mrr: 20574000, 
      status: 'active',
      features: ['Unlimited', 'White Label', 'Dedicated Support', 'Custom Development'],
      conversionRate: 62.4,
      churnRate: 2.1,
    },
    { 
      id: 7, 
      name: 'Enterprise Annual', 
      type: 'Enterprise', 
      price: 239990, 
      billingCycle: 'Annual', 
      subscribers: 211, 
      mrr: 4217000, 
      status: 'active',
      features: ['Unlimited', 'White Label', 'Dedicated Support', 'Custom Development', '2 months free'],
      conversionRate: 55.3,
      churnRate: 0.5,
    },
    { 
      id: 8, 
      name: 'Trial Plan', 
      type: 'Trial', 
      price: 0, 
      billingCycle: '14 Days', 
      subscribers: 567, 
      mrr: 0, 
      status: 'active',
      features: ['Full Features', 'Limited Time'],
      conversionRate: 42.3,
      churnRate: 85.4,
    },
  ];

  // Analytics data
  const planRevenueData = [
    { plan: 'Free', revenue: 0, subscribers: 3245 },
    { plan: 'Starter', revenue: 16549000, subscribers: 5757 },
    { plan: 'Professional', revenue: 26871000, subscribers: 2823 },
    { plan: 'Enterprise', revenue: 24791000, subscribers: 1034 },
  ];

  const monthlyRevenueByPlan = [
    { month: 'May', Starter: 12500000, Professional: 24000000, Enterprise: 22000000 },
    { month: 'Jun', Starter: 13200000, Professional: 24800000, Enterprise: 23500000 },
    { month: 'Jul', Starter: 14100000, Professional: 25600000, Enterprise: 23800000 },
    { month: 'Aug', Starter: 15300000, Professional: 26200000, Enterprise: 24200000 },
    { month: 'Sep', Starter: 15800000, Professional: 26500000, Enterprise: 24500000 },
    { month: 'Oct', Starter: 16549000, Professional: 26871000, Enterprise: 24791000 },
  ];

  const subscriberGrowthData = [
    { month: 'May', Free: 2890, Starter: 5234, Professional: 2456, Enterprise: 945 },
    { month: 'Jun', Free: 3012, Starter: 5378, Professional: 2567, Enterprise: 978 },
    { month: 'Jul', Free: 3089, Starter: 5489, Professional: 2634, Enterprise: 989 },
    { month: 'Aug', Free: 3134, Starter: 5567, Professional: 2712, Enterprise: 1012 },
    { month: 'Sep', Free: 3178, Starter: 5656, Professional: 2789, Enterprise: 1023 },
    { month: 'Oct', Free: 3245, Starter: 5757, Professional: 2823, Enterprise: 1034 },
  ];

  const conversionFunnelData = [
    { stage: 'Visitors', count: 25000, percentage: 100 },
    { stage: 'Sign Ups', count: 12500, percentage: 50 },
    { stage: 'Trial Started', count: 8750, percentage: 35 },
    { stage: 'Paid Plan', count: 5250, percentage: 21 },
    { stage: 'Annual Plan', count: 2100, percentage: 8.4 },
  ];

  // Active Subscriptions Data (from Subscriptions module)
  const activeSubscriptions = [
    { id: 1, tenantId: 'T001', tenantName: 'Central Library Network', planName: 'Professional Monthly', status: 'active', billingCycle: 'monthly', amount: 9999, nextBillingDate: '2025-12-01', startDate: '2025-01-15' },
    { id: 2, tenantId: 'T002', tenantName: 'Tech Hub Libraries', planName: 'Enterprise Annual', status: 'active', billingCycle: 'annual', amount: 239990, nextBillingDate: '2026-03-15', startDate: '2025-03-15' },
    { id: 3, tenantId: 'T003', tenantName: 'Study Center Pro', planName: 'Starter Monthly', status: 'trial', billingCycle: 'monthly', amount: 2999, nextBillingDate: '2025-11-10', startDate: '2025-10-27' },
    { id: 4, tenantId: 'T004', tenantName: 'Knowledge Base', planName: 'Professional Annual', status: 'active', billingCycle: 'annual', amount: 95990, nextBillingDate: '2026-06-20', startDate: '2025-06-20' },
    { id: 5, tenantId: 'T005', tenantName: 'City Library', planName: 'Starter Annual', status: 'active', billingCycle: 'annual', amount: 28990, nextBillingDate: '2026-01-05', startDate: '2025-01-05' },
    { id: 6, tenantId: 'T006', tenantName: 'Premium Study', planName: 'Enterprise Monthly', status: 'past_due', billingCycle: 'monthly', amount: 24999, nextBillingDate: '2025-10-28', startDate: '2024-08-10' },
  ];

  // Subscription Changes Data
  const subscriptionChanges = [
    { id: 1, timestamp: '2025-10-30T14:30:00', tenantName: 'Central Library Network', changeType: 'upgrade', oldPlanName: 'Starter Monthly', newPlanName: 'Professional Monthly', revenueImpact: 7000 },
    { id: 2, timestamp: '2025-10-28T10:15:00', tenantName: 'Study Center Pro', changeType: 'renewal', oldPlanName: 'Starter Monthly', newPlanName: 'Starter Monthly', revenueImpact: 2999 },
    { id: 3, timestamp: '2025-10-25T16:45:00', tenantName: 'Knowledge Base', changeType: 'downgrade', oldPlanName: 'Enterprise Annual', newPlanName: 'Professional Annual', revenueImpact: -144000 },
    { id: 4, timestamp: '2025-10-22T09:20:00', tenantName: 'City Library', changeType: 'cancel', oldPlanName: 'Professional Monthly', newPlanName: null, revenueImpact: -9999 },
    { id: 5, timestamp: '2025-10-20T13:10:00', tenantName: 'Premium Study', changeType: 'reactivate', oldPlanName: null, newPlanName: 'Enterprise Monthly', revenueImpact: 24999 },
  ];

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return activeSubscriptions.filter(sub => {
      const matchesSearch = sub.tenantName.toLowerCase().includes(subscriptionSearchQuery.toLowerCase()) ||
                          sub.planName.toLowerCase().includes(subscriptionSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [subscriptionSearchQuery]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return feePlans.filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      const matchesType = typeFilter === 'all' || plan.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Plan Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
          <Chip label={params.row.type} size="small" sx={{ mt: 0.5 }} />
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold">
          ₹{params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'billingCycle',
      headerName: 'Billing',
      width: 120,
    },
    {
      field: 'subscribers',
      headerName: 'Subscribers',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">{params.value.toLocaleString()}</Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min((params.value / 5000) * 100, 100)} 
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
    {
      field: 'mrr',
      headerName: 'MRR',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{(params.value / 1000).toFixed(0)}K
        </Typography>
      ),
    },
    {
      field: 'conversionRate',
      headerName: 'Conversion',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={`${params.value}%`} 
          size="small" 
          color={params.value > 40 ? 'success' : params.value > 25 ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'churnRate',
      headerName: 'Churn',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={`${params.value}%`} 
          size="small" 
          color={params.value < 5 ? 'success' : params.value < 15 ? 'warning' : 'error'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'active' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: () => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info">
            <Visibility fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Tab 1: All Plans
  const renderAllPlansTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Starter">Starter</MenuItem>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<Add />} fullWidth onClick={handleCreatePlan}>
              Create Plan
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing {filteredPlans.length} of {feePlans.length} plans
          </Typography>
        </CardContent>
      </Card>

      {/* Plans DataGrid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Fee Plans Overview
          </Typography>
          <DataGrid
            rows={filteredPlans}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Revenue Analytics
  const renderRevenueTab = () => (
    <Box>
      {/* Plan Revenue Comparison */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            💰 Revenue by Plan Type
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={planRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plan" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#4CAF50" name="Revenue (₹)" />
              <Bar yAxisId="right" dataKey="subscribers" fill="#2196F3" name="Subscribers" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend by Plan */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📈 Monthly Revenue Trend by Plan
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyRevenueByPlan}>
              <defs>
                <linearGradient id="colorStarter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E91E63" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="Starter" stroke="#2196F3" fill="url(#colorStarter)" />
              <Area type="monotone" dataKey="Professional" stroke="#4CAF50" fill="url(#colorPro)" />
              <Area type="monotone" dataKey="Enterprise" stroke="#E91E63" fill="url(#colorEnt)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue Share by Plan
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planRevenueData.filter(p => p.revenue > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.plan}: ${((entry.revenue / kpis.totalMRR) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {planRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Metrics by Plan
            </Typography>
            <Stack spacing={2}>
              {feePlans.filter(p => p.mrr > 0).sort((a, b) => b.mrr - a.mrr).slice(0, 5).map((plan) => (
                <Paper key={plan.id} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plan.subscribers.toLocaleString()} subscribers
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        ₹{(plan.mrr / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="caption" color="text.secondary">MRR</Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Tab 3: Subscriber Growth
  const renderGrowthTab = () => (
    <Box>
      {/* Subscriber Growth by Plan */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Subscriber Growth by Plan (6 Months)
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={subscriberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="Free" stroke="#9E9E9E" strokeWidth={2} name="Free" />
              <Line type="monotone" dataKey="Starter" stroke="#2196F3" strokeWidth={2} name="Starter" />
              <Line type="monotone" dataKey="Professional" stroke="#4CAF50" strokeWidth={2} name="Professional" />
              <Line type="monotone" dataKey="Enterprise" stroke="#E91E63" strokeWidth={2} name="Enterprise" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🎯 Conversion Funnel
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={conversionFunnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="count" fill="#9C27B0" name="Users" />
            </BarChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
            {conversionFunnelData.map((stage, index) => (
              <Paper key={index} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">{stage.stage}</Typography>
                <Typography variant="h6" fontWeight="bold">{stage.count.toLocaleString()}</Typography>
                <Typography variant="caption" color="primary">{stage.percentage}%</Typography>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 1: Active Subscriptions (from Subscriptions module)
  const renderActiveSubscriptionsTab = () => (
    <Box>
      {/* Subscription Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search subscriptions..."
              size="small"
              value={subscriptionSearchQuery}
              onChange={(e) => setSubscriptionSearchQuery(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`All (${activeSubscriptions.length})`} color="default" />
              <Chip label={`Active (${activeSubscriptions.filter(s => s.status === 'active').length})`} color="success" variant="outlined" />
              <Chip label={`Trial (${activeSubscriptions.filter(s => s.status === 'trial').length})`} color="info" variant="outlined" />
              <Chip label={`Past Due (${activeSubscriptions.filter(s => s.status === 'past_due').length})`} color="error" variant="outlined" />
            </Box>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Refresh />}>Refresh</Button>
              <Button variant="contained" startIcon={<Download />}>Export</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Active Tenant Subscriptions
          </Typography>
          <DataGrid
            rows={filteredSubscriptions}
            columns={[
              {
                field: 'tenantName',
                headerName: 'Tenant',
                flex: 1,
                minWidth: 200,
                renderCell: (params: GridRenderCellParams) => (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.tenantId}</Typography>
                  </Box>
                ),
              },
              {
                field: 'planName',
                headerName: 'Plan',
                width: 180,
                renderCell: (params: GridRenderCellParams) => (
                  <Chip label={params.value} color="primary" size="small" variant="outlined" />
                ),
              },
              {
                field: 'status',
                headerName: 'Status',
                width: 120,
                renderCell: (params: GridRenderCellParams) => (
                  <Chip 
                    label={params.value} 
                    color={getSubscriptionStatusColor(params.value as string) as any} 
                    size="small" 
                  />
                ),
              },
              {
                field: 'billingCycle',
                headerName: 'Billing',
                width: 100,
                renderCell: (params: GridRenderCellParams) => (
                  params.value === 'monthly' ? 'Monthly' : 'Annual'
                ),
              },
              {
                field: 'amount',
                headerName: 'Amount',
                width: 130,
                renderCell: (params: GridRenderCellParams) => (
                  <Typography variant="body2" fontWeight="bold">{formatCurrency(params.value)}</Typography>
                ),
              },
              {
                field: 'nextBillingDate',
                headerName: 'Next Billing',
                width: 130,
                renderCell: (params: GridRenderCellParams) => (
                  params.value ? new Date(params.value).toLocaleDateString() : '-'
                ),
              },
              {
                field: 'startDate',
                headerName: 'Started',
                width: 120,
                renderCell: (params: GridRenderCellParams) => (
                  new Date(params.value).toLocaleDateString()
                ),
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 120,
                renderCell: () => (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="info">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Stack>
                ),
              },
            ]}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 2: Subscription Changes (from Subscriptions module)
  const renderSubscriptionChangesTab = () => (
    <Box>
      {/* Changes Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search changes..."
              size="small"
              sx={{ minWidth: 300 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="All" color="default" />
              <Chip label="Upgrades" color="success" variant="outlined" />
              <Chip label="Downgrades" color="warning" variant="outlined" />
              <Chip label="Cancellations" color="error" variant="outlined" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Changes Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Subscription Change History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Tenant</strong></TableCell>
                  <TableCell><strong>Change Type</strong></TableCell>
                  <TableCell><strong>Old Plan</strong></TableCell>
                  <TableCell><strong>New Plan</strong></TableCell>
                  <TableCell><strong>Revenue Impact</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptionChanges.map((change) => (
                  <TableRow key={change.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                    <TableCell>{new Date(change.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{change.tenantName}</TableCell>
                    <TableCell>
                      <Chip
                        label={change.changeType}
                        color={getChangeTypeColor(change.changeType) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{change.oldPlanName || '-'}</TableCell>
                    <TableCell>{change.newPlanName || '-'}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={change.revenueImpact >= 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {change.revenueImpact >= 0 ? '+' : ''}{formatCurrency(Math.abs(change.revenueImpact))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  // Tab 4: Plan Comparison
  const renderComparisonTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Compare pricing tiers, features, and performance metrics across all plans
        </Typography>
      </Alert>

      {/* Plan Comparison Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Plan Feature Comparison
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Feature</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Free</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Starter</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Professional</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>Price</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>₹0</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>₹2,999/mo</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>₹9,999/mo</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>₹24,999/mo</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>Libraries</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>1</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>2</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>5</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Unlimited</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>Seats</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>50</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>200</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>1,000</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Unlimited</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>Support</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Email</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Email</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Priority</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Dedicated</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>Analytics</strong></td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Basic</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Basic</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Advanced</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Custom</td>
                </tr>
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {feePlans.filter(p => p.type !== 'Free' && p.type !== 'Trial').map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom>{plan.name}</Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Subscribers</Typography>
                  <Typography variant="h6" fontWeight="bold">{plan.subscribers.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Conversion</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={plan.conversionRate} 
                    color={plan.conversionRate > 40 ? 'success' : 'warning'}
                  />
                  <Typography variant="caption">{plan.conversionRate}%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Churn Rate</Typography>
                  <Chip 
                    label={`${plan.churnRate}%`} 
                    size="small" 
                    color={plan.churnRate < 5 ? 'success' : 'warning'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  // Tab 7: Plan Configuration - Create/Edit Plans
  const renderPlanConfigurationTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Plan Configuration
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan}>
          Create New Plan
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Create and configure subscription plans. Edit pricing, features, trial periods, and plan visibility.
        </Typography>
      </Alert>

      {/* Plan Cards for Configuration */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {feePlans.filter(p => p.status === 'active').map((plan) => (
          <Card
            key={plan.id}
            sx={{
              border: plan.type === 'Professional' ? '2px solid #4CAF50' : '1px solid #eee',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            {plan.type === 'Professional' && (
              <Chip
                label="Most Popular"
                color="success"
                size="small"
                sx={{ position: 'absolute', top: 10, right: 10 }}
              />
            )}
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {plan.name}
              </Typography>
              <Chip label={plan.type} size="small" sx={{ mb: 2 }} />

              <Box sx={{ my: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  ₹{plan.price.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.billingCycle}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, my: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{plan.subscribers.toLocaleString()}</strong> subscribers
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{plan.features.length}</strong> features
                </Typography>
                <Typography variant="body2">
                  MRR: <strong>₹{(plan.mrr / 1000).toFixed(0)}K</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption">{feature}</Typography>
                  </Box>
                ))}
                {plan.features.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{plan.features.length - 3} more features
                  </Typography>
                )}
              </Stack>

              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Edit />}
                >
                  Edit Plan
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Visibility />}
                  size="small"
                >
                  View Details
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Create Plan Dialog */}
      <Dialog 
        open={createPlanOpen} 
        onClose={handleClosePlanDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.50', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add />
            <Typography variant="h6" fontWeight="bold">Create New Subscription Plan</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {/* Quick Templates - Compact at Top */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">Quick Templates:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { 
                    type: 'Free', 
                    price: '0', 
                    students: '10', 
                    staff: '2', 
                    trial: '0', 
                    icon: '🎁',
                    description: 'Perfect for individuals or small groups just getting started. No credit card required.'
                  },
                  { 
                    type: 'Starter', 
                    price: '2999', 
                    students: '100', 
                    staff: '5', 
                    trial: '14', 
                    icon: '🚀',
                    description: 'Ideal for small to medium libraries looking to streamline their operations with essential tools.'
                  },
                  { 
                    type: 'Professional', 
                    price: '9999', 
                    students: '500', 
                    staff: '20', 
                    trial: '14', 
                    icon: '⭐',
                    description: 'Best for growing libraries needing advanced analytics, unlimited students, and priority support.'
                  },
                  { 
                    type: 'Enterprise', 
                    price: '29999', 
                    students: '0', 
                    staff: '0', 
                    trial: '30', 
                    icon: '👑',
                    description: 'Complete solution for large institutions with custom integrations, dedicated support, and unlimited resources.'
                  },
                ].map((template) => (
                  <Chip
                    key={template.type}
                    label={`${template.icon} ${template.type}`}
                    onClick={() => {
                      // Save current type to use in addCommonFeatures
                      const tempPlan = {
                        ...newPlan,
                        type: template.type,
                        name: `${template.type} Monthly`,
                        description: template.description,
                        price: template.price,
                        maxStudents: template.students,
                        maxStaff: template.staff,
                        trialDays: template.trial,
                        annualPrice: template.price !== '0' ? Math.round(Number(template.price) * 12 * 0.83).toString() : '0',
                      };
                      setNewPlan(tempPlan);
                      
                      // Auto-apply common features and permissions
                      setTimeout(() => {
                        // Manually trigger the feature and permission setup
                        const commonFeaturesMap: Record<string, string[]> = {
                          Free: ['Basic student enrollment', 'Manual attendance marking', 'Up to 10 students', 'Up to 2 staff members', 'Email support (48hr response)', 'Basic dashboard view', 'Student profile management', 'Simple attendance reports'],
                          Starter: ['Student enrollment & management', 'QR code/Biometric attendance', 'Up to 100 students', 'Up to 5 staff accounts', 'Email & SMS notifications', 'Basic analytics dashboard', 'Attendance reports & alerts', 'Fee payment tracking', 'Seat allocation system', 'Mobile app access', 'Email support (24hr response)', 'Data export (CSV/Excel)'],
                          Professional: ['Everything in Starter plan', 'Unlimited students', 'Up to 20 staff accounts', 'Advanced analytics & insights', 'Custom report builder', 'Automated fee reminders', 'Late fee management', 'Multi-shift management', 'Resource booking system', 'Parent/Guardian portal', 'WhatsApp integration', 'API access for integrations', 'Priority support (12hr response)', 'Role-based permissions', 'Bulk operations & imports'],
                          Enterprise: ['Everything in Professional', 'Unlimited students & staff', 'Dedicated account manager', 'Custom integrations & APIs', 'White-label mobile apps', 'Multi-location support', 'Advanced security (SSO/LDAP)', 'Custom workflows & automation', 'SLA guarantee (99.9% uptime)', '24/7 phone & priority support', 'On-premise deployment option', 'Custom feature development', 'Dedicated training sessions', 'Advanced audit logs', 'Custom domain & branding'],
                        };
                        
                        // Get the permission preset for this type (will be defined in addCommonFeatures)
                        addCommonFeatures();
                      }, 0);
                    }}
                    color={newPlan.type === template.type ? 'primary' : 'default'}
                    variant={newPlan.type === template.type ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          </Alert>

          {/* All Fields in One Detailed View */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                📋 Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                <TextField
                  label="Plan Name"
                  placeholder="e.g., Professional Monthly"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  fullWidth
                  required
                  helperText="Auto-generated based on type, can customize"
                />
                <FormControl fullWidth required>
                  <InputLabel>Plan Type</InputLabel>
                  <Select
                    value={newPlan.type}
                    onChange={(e) => handlePlanTypeChange(e.target.value)}
                    label="Plan Type"
                  >
                    <MenuItem value="Free">🎁 Free</MenuItem>
                    <MenuItem value="Trial">⏱️ Trial</MenuItem>
                    <MenuItem value="Starter">🚀 Starter</MenuItem>
                    <MenuItem value="Professional">⭐ Professional</MenuItem>
                    <MenuItem value="Enterprise">👑 Enterprise</MenuItem>
                    <MenuItem value="Custom">🎨 Custom</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                label="Description"
                placeholder="Brief description of what this plan offers"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                sx={{ mt: 2 }}
              />
            </Box>

            {/* Pricing */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                💰 Pricing
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                <TextField
                  label="Monthly Price"
                  placeholder="2999"
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  fullWidth
                  required
                  disabled={newPlan.type === 'Free'}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  helperText={newPlan.type === 'Free' ? 'Free plan' : 'Monthly billing amount'}
                />
                <FormControl fullWidth required>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={newPlan.billingCycle}
                    onChange={(e) => setNewPlan({ ...newPlan, billingCycle: e.target.value })}
                    label="Billing Cycle"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                    <MenuItem value="one-time">One-time</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Annual Price (Optional)"
                  placeholder="Auto-calculated"
                  type="number"
                  value={newPlan.annualPrice}
                  onChange={(e) => setNewPlan({ ...newPlan, annualPrice: e.target.value })}
                  fullWidth
                  disabled={newPlan.type === 'Free'}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  helperText="Auto: 17% discount applied"
                />
              </Box>
            </Box>

            {/* Limits & Trial Period */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                ⚙️ Limits & Trial Period
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                <TextField
                  label="Max Students"
                  placeholder="100"
                  type="number"
                  value={newPlan.maxStudents}
                  onChange={(e) => setNewPlan({ ...newPlan, maxStudents: e.target.value })}
                  fullWidth
                  helperText="0 for unlimited"
                />
                <TextField
                  label="Max Staff"
                  placeholder="5"
                  type="number"
                  value={newPlan.maxStaff}
                  onChange={(e) => setNewPlan({ ...newPlan, maxStaff: e.target.value })}
                  fullWidth
                  helperText="0 for unlimited"
                />
                <TextField
                  label="Trial Days"
                  placeholder="14"
                  type="number"
                  value={newPlan.trialDays}
                  onChange={(e) => setNewPlan({ ...newPlan, trialDays: e.target.value })}
                  fullWidth
                  helperText="0 for no trial"
                />
              </Box>
            </Box>

            {/* Features */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  ✨ Features {newPlan.features.length > 0 && `(${newPlan.features.length})`}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={addCommonFeatures}
                >
                  Add Common Features
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Add Feature"
                  placeholder="Press Enter to add quickly"
                  value={newPlan.newFeature}
                  onChange={(e) => setNewPlan({ ...newPlan, newFeature: e.target.value })}
                  fullWidth
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddFeature}
                  disabled={!newPlan.newFeature.trim()}
                  sx={{ minWidth: 80 }}
                  size="small"
                >
                  Add
                </Button>
              </Box>

              {newPlan.features.length > 0 && (
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {newPlan.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      onDelete={() => handleRemoveFeature(index)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Advanced Permissions (Backend Enforceable) */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                🔐 Advanced Permissions (Backend Controls) - {
                  Object.values(newPlan.permissions.modules).filter(Boolean).length +
                  Object.values(newPlan.permissions.communication).filter(Boolean).length +
                  Object.values(newPlan.permissions.financial).filter(Boolean).length +
                  Object.values(newPlan.permissions.attendance).filter(Boolean).length +
                  Object.values(newPlan.permissions.analytics).filter(Boolean).length +
                  Object.values(newPlan.permissions.integrations).filter(Boolean).length +
                  Object.values(newPlan.permissions.mobileAccess).filter(Boolean).length +
                  Object.values(newPlan.permissions.security).filter(Boolean).length +
                  Object.values(newPlan.permissions.advanced).filter(Boolean).length +
                  Object.values(newPlan.permissions.support).filter(Boolean).length
                } features enabled
              </Typography>

              {/* Each category as separate accordion in 2-column layout */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 2 }}>
                {/* LEFT COLUMN */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Core Modules */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        📦 Core Modules ({Object.values(newPlan.permissions.modules).filter(Boolean).length}/{Object.keys(newPlan.permissions.modules).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.modules).map(([module, enabled]) => (
                          <FormControlLabel
                            key={module}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    modules: { ...newPlan.permissions.modules, [module]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{module}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Communication */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        💬 Communication ({Object.values(newPlan.permissions.communication).filter(Boolean).length}/{Object.keys(newPlan.permissions.communication).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.communication).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    communication: { ...newPlan.permissions.communication, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Financial */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        💰 Financial ({Object.values(newPlan.permissions.financial).filter(Boolean).length}/{Object.keys(newPlan.permissions.financial).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.financial).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    financial: { ...newPlan.permissions.financial, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Attendance */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        ✅ Attendance ({Object.values(newPlan.permissions.attendance).filter(Boolean).length}/{Object.keys(newPlan.permissions.attendance).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.attendance).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    attendance: { ...newPlan.permissions.attendance, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Analytics */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        📊 Analytics ({Object.values(newPlan.permissions.analytics).filter(Boolean).length}/{Object.keys(newPlan.permissions.analytics).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.analytics).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    analytics: { ...newPlan.permissions.analytics, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Usage Limits */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        📏 Usage Limits
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        {Object.entries(newPlan.permissions.limits).map(([key, value]) => (
                          <TextField
                            key={key}
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            type="number"
                            size="small"
                            value={value}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              permissions: {
                                ...newPlan.permissions,
                                limits: { ...newPlan.permissions.limits, [key]: Number(e.target.value) }
                              }
                            })}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>

                {/* RIGHT COLUMN */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Integrations */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        🔌 Integrations ({Object.values(newPlan.permissions.integrations).filter(Boolean).length}/{Object.keys(newPlan.permissions.integrations).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.integrations).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    integrations: { ...newPlan.permissions.integrations, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Mobile Access */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        📱 Mobile ({Object.values(newPlan.permissions.mobileAccess).filter(Boolean).length}/{Object.keys(newPlan.permissions.mobileAccess).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.mobileAccess).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    mobileAccess: { ...newPlan.permissions.mobileAccess, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Security */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        🔒 Security ({Object.values(newPlan.permissions.security).filter(Boolean).length}/{Object.keys(newPlan.permissions.security).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.security).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    security: { ...newPlan.permissions.security, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Advanced Features */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        ⚡ Advanced ({Object.values(newPlan.permissions.advanced).filter(Boolean).length}/{Object.keys(newPlan.permissions.advanced).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.advanced).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    advanced: { ...newPlan.permissions.advanced, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Support */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        🎧 Support ({Object.values(newPlan.permissions.support).filter(Boolean).length}/{Object.keys(newPlan.permissions.support).length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {Object.entries(newPlan.permissions.support).map(([feature, enabled]) => (
                          <FormControlLabel
                            key={feature}
                            control={
                              <Switch
                                size="small"
                                checked={enabled as boolean}
                                onChange={(e) => setNewPlan({
                                  ...newPlan,
                                  permissions: {
                                    ...newPlan.permissions,
                                    support: { ...newPlan.permissions.support, [feature]: e.target.checked }
                                  }
                                })}
                              />
                            }
                            label={<Typography variant="caption">{feature}</Typography>}
                            sx={{ m: 0 }}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Resource Limits */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="caption" fontWeight="bold">
                        🗂️ Resource Limits
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        {Object.entries(newPlan.permissions.resources).map(([key, value]) => (
                          <TextField
                            key={key}
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            type="number"
                            size="small"
                            value={value}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              permissions: {
                                ...newPlan.permissions,
                                resources: { ...newPlan.permissions.resources, [key]: Number(e.target.value) }
                              }
                            })}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            </Box>

            {/* Additional Settings */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                🔧 Display Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newPlan.isPopular}
                        onChange={(e) => setNewPlan({ ...newPlan, isPopular: e.target.checked })}
                      />
                    }
                    label="Mark as 'Most Popular'"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newPlan.status}
                      onChange={(e) => setNewPlan({ ...newPlan, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="active">✅ Active</MenuItem>
                      <MenuItem value="draft">📝 Draft</MenuItem>
                      <MenuItem value="archived">📦 Archived</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider />

                {/* Discount Section - Per Billing Cycle */}
                <Box>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    💸 Discounts & Promotions (Per Billing Cycle)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Set different discounts for each billing period to incentivize longer commitments
                  </Typography>

                  {/* Monthly Discount */}
                  <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={newPlan.discounts.monthly.enabled}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              monthly: { ...newPlan.discounts.monthly, enabled: e.target.checked }
                            }
                          })}
                        />
                      }
                      label={<Typography variant="caption" fontWeight="bold">📅 Monthly Discount</Typography>}
                    />
                    {newPlan.discounts.monthly.enabled && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={newPlan.discounts.monthly.type}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              discounts: {
                                ...newPlan.discounts,
                                monthly: { ...newPlan.discounts.monthly, type: e.target.value }
                              }
                            })}
                            label="Type"
                          >
                            <MenuItem value="percentage">%</MenuItem>
                            <MenuItem value="flat">₹</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Value"
                          type="number"
                          size="small"
                          value={newPlan.discounts.monthly.value}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              monthly: { ...newPlan.discounts.monthly, value: e.target.value }
                            }
                          })}
                          InputProps={{
                            endAdornment: <Typography variant="caption">{newPlan.discounts.monthly.type === 'percentage' ? '%' : '₹'}</Typography>
                          }}
                        />
                        <TextField
                          label="Label"
                          size="small"
                          placeholder="Early Bird"
                          value={newPlan.discounts.monthly.label}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              monthly: { ...newPlan.discounts.monthly, label: e.target.value }
                            }
                          })}
                        />
                      </Box>
                    )}
                  </Card>

                  {/* Quarterly Discount */}
                  <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={newPlan.discounts.quarterly.enabled}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              quarterly: { ...newPlan.discounts.quarterly, enabled: e.target.checked }
                            }
                          })}
                        />
                      }
                      label={<Typography variant="caption" fontWeight="bold">📆 Quarterly Discount (3 months)</Typography>}
                    />
                    {newPlan.discounts.quarterly.enabled && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={newPlan.discounts.quarterly.type}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              discounts: {
                                ...newPlan.discounts,
                                quarterly: { ...newPlan.discounts.quarterly, type: e.target.value }
                              }
                            })}
                            label="Type"
                          >
                            <MenuItem value="percentage">%</MenuItem>
                            <MenuItem value="flat">₹</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Value"
                          type="number"
                          size="small"
                          value={newPlan.discounts.quarterly.value}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              quarterly: { ...newPlan.discounts.quarterly, value: e.target.value }
                            }
                          })}
                          InputProps={{
                            endAdornment: <Typography variant="caption">{newPlan.discounts.quarterly.type === 'percentage' ? '%' : '₹'}</Typography>
                          }}
                        />
                        <TextField
                          label="Label"
                          size="small"
                          placeholder="Save More"
                          value={newPlan.discounts.quarterly.label}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              quarterly: { ...newPlan.discounts.quarterly, label: e.target.value }
                            }
                          })}
                        />
                      </Box>
                    )}
                  </Card>

                  {/* Half-Yearly Discount */}
                  <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={newPlan.discounts.halfYearly.enabled}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              halfYearly: { ...newPlan.discounts.halfYearly, enabled: e.target.checked }
                            }
                          })}
                        />
                      }
                      label={<Typography variant="caption" fontWeight="bold">📊 Half-Yearly Discount (6 months)</Typography>}
                    />
                    {newPlan.discounts.halfYearly.enabled && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={newPlan.discounts.halfYearly.type}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              discounts: {
                                ...newPlan.discounts,
                                halfYearly: { ...newPlan.discounts.halfYearly, type: e.target.value }
                              }
                            })}
                            label="Type"
                          >
                            <MenuItem value="percentage">%</MenuItem>
                            <MenuItem value="flat">₹</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Value"
                          type="number"
                          size="small"
                          value={newPlan.discounts.halfYearly.value}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              halfYearly: { ...newPlan.discounts.halfYearly, value: e.target.value }
                            }
                          })}
                          InputProps={{
                            endAdornment: <Typography variant="caption">{newPlan.discounts.halfYearly.type === 'percentage' ? '%' : '₹'}</Typography>
                          }}
                        />
                        <TextField
                          label="Label"
                          size="small"
                          placeholder="Best Value"
                          value={newPlan.discounts.halfYearly.label}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              halfYearly: { ...newPlan.discounts.halfYearly, label: e.target.value }
                            }
                          })}
                        />
                      </Box>
                    )}
                  </Card>

                  {/* Annual Discount */}
                  <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={newPlan.discounts.annual.enabled}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              annual: { ...newPlan.discounts.annual, enabled: e.target.checked }
                            }
                          })}
                        />
                      }
                      label={<Typography variant="caption" fontWeight="bold">🎉 Annual Discount (12 months)</Typography>}
                    />
                    {newPlan.discounts.annual.enabled && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={newPlan.discounts.annual.type}
                            onChange={(e) => setNewPlan({
                              ...newPlan,
                              discounts: {
                                ...newPlan.discounts,
                                annual: { ...newPlan.discounts.annual, type: e.target.value }
                              }
                            })}
                            label="Type"
                          >
                            <MenuItem value="percentage">%</MenuItem>
                            <MenuItem value="flat">₹</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          label="Value"
                          type="number"
                          size="small"
                          value={newPlan.discounts.annual.value}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              annual: { ...newPlan.discounts.annual, value: e.target.value }
                            }
                          })}
                          InputProps={{
                            endAdornment: <Typography variant="caption">{newPlan.discounts.annual.type === 'percentage' ? '%' : '₹'}</Typography>
                          }}
                        />
                        <TextField
                          label="Label"
                          size="small"
                          placeholder="Save Big"
                          value={newPlan.discounts.annual.label}
                          onChange={(e) => setNewPlan({
                            ...newPlan,
                            discounts: {
                              ...newPlan.discounts,
                              annual: { ...newPlan.discounts.annual, label: e.target.value }
                            }
                          })}
                        />
                      </Box>
                    )}
                  </Card>

                  {/* Discount Summary */}
                  {(newPlan.discounts.monthly.enabled || newPlan.discounts.quarterly.enabled || 
                    newPlan.discounts.halfYearly.enabled || newPlan.discounts.annual.enabled) && newPlan.price && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
                        💰 Pricing Summary (Base: ₹{Number(newPlan.price).toLocaleString()}/month)
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        {newPlan.discounts.monthly.enabled && newPlan.discounts.monthly.value && (
                          <Typography variant="caption">
                            <strong>Monthly:</strong> ₹{
                              newPlan.discounts.monthly.type === 'percentage'
                                ? Math.round(Number(newPlan.price) * (1 - Number(newPlan.discounts.monthly.value) / 100)).toLocaleString()
                                : Math.round(Number(newPlan.price) - Number(newPlan.discounts.monthly.value)).toLocaleString()
                            } ({newPlan.discounts.monthly.label || 'Discounted'})
                          </Typography>
                        )}
                        {newPlan.discounts.quarterly.enabled && newPlan.discounts.quarterly.value && (
                          <Typography variant="caption">
                            <strong>Quarterly:</strong> ₹{
                              newPlan.discounts.quarterly.type === 'percentage'
                                ? (Math.round(Number(newPlan.price) * (1 - Number(newPlan.discounts.quarterly.value) / 100)) * 3).toLocaleString()
                                : (Math.round(Number(newPlan.price) - Number(newPlan.discounts.quarterly.value)) * 3).toLocaleString()
                            } for 3 months ({newPlan.discounts.quarterly.label || 'Discounted'})
                          </Typography>
                        )}
                        {newPlan.discounts.halfYearly.enabled && newPlan.discounts.halfYearly.value && (
                          <Typography variant="caption">
                            <strong>Half-Yearly:</strong> ₹{
                              newPlan.discounts.halfYearly.type === 'percentage'
                                ? (Math.round(Number(newPlan.price) * (1 - Number(newPlan.discounts.halfYearly.value) / 100)) * 6).toLocaleString()
                                : (Math.round(Number(newPlan.price) - Number(newPlan.discounts.halfYearly.value)) * 6).toLocaleString()
                            } for 6 months ({newPlan.discounts.halfYearly.label || 'Discounted'})
                          </Typography>
                        )}
                        {newPlan.discounts.annual.enabled && newPlan.discounts.annual.value && (
                          <Typography variant="caption">
                            <strong>Annual:</strong> ₹{
                              newPlan.discounts.annual.type === 'percentage'
                                ? (Math.round(Number(newPlan.price) * (1 - Number(newPlan.discounts.annual.value) / 100)) * 12).toLocaleString()
                                : (Math.round(Number(newPlan.price) - Number(newPlan.discounts.annual.value)) * 12).toLocaleString()
                            } for 12 months ({newPlan.discounts.annual.label || 'Discounted'})
                          </Typography>
                        )}
                      </Box>
                    </Alert>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClosePlanDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSavePlan} 
            variant="contained"
            disabled={!newPlan.name || !newPlan.price}
            startIcon={<CheckCircle />}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          💳 Subscriptions & Fee Plans Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage tenant subscriptions and pricing plans • {activeSubscriptions.length} active subscriptions • {kpis.totalPlans} plans • {kpis.totalSubscribers.toLocaleString()} total subscribers
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: 'white' }}>Total MRR</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                  ₹{(kpis.totalMRR / 100000).toFixed(2)}L
                </Typography>
                <Typography variant="caption" sx={{ color: 'white' }}>
                  +12.5% vs last month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                <AttachMoney />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Subscribers</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.totalSubscribers.toLocaleString()}
                </Typography>
                <Chip label="+8.3%" size="small" color="success" icon={<TrendingUp />} sx={{ mt: 0.5 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <People />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Avg Plan Price</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{kpis.avgPlanPrice.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  per month
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AttachMoney />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {kpis.conversionRate}%
                </Typography>
                <Chip label="Good" size="small" color="success" sx={{ mt: 0.5 }} />
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <TrendingUp />
              </Avatar>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Plans" icon={<Timeline />} iconPosition="start" />
          <Tab label="Revenue Analytics" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Subscriber Growth" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Plan Comparison" icon={<Assessment />} iconPosition="start" />
          <Tab label="Plan Configuration" icon={<Edit />} iconPosition="start" />
          <Tab label={`Active Subscriptions (${activeSubscriptions.length})`} icon={<Subscriptions />} iconPosition="start" />
          <Tab label={`Subscription Changes (${subscriptionChanges.length})`} icon={<SwapHoriz />} iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderAllPlansTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderRevenueTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderGrowthTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            {renderComparisonTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            {renderPlanConfigurationTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            {renderActiveSubscriptionsTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={6}>
            {renderSubscriptionChangesTab()}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FeePlanOversightDashboard;
