/**
 * i18n Service Management Page
 * Comprehensive internationalization service monitoring and configuration
 * 
 * Features:
 * - Multi-language Support
 * - Translation Management
 * - Language Detection
 * - Localization Analytics
 * - RTL Support
 * - Pluralization Rules
 * - Language Switching
 * - Translation Quality Metrics
 */

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Chip, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Alert, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignRight as FormatAlignRightIcon,
  Group as GroupIcon,
  Language as LanguageIcon,
  Memory as MemoryIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Stop as StopIcon,
  TextFields as TextFieldsIcon,
  Translate as TranslateIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer

  } from 'recharts';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  country: string;
  script: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  pluralRules: any;
  region: string;
  speakers: string;
  officialStatus: string;
  isActive: boolean;
  translationProgress: number;
  lastUpdated: string;
}

interface Translation {
  id: string;
  key: string;
  namespace: string;
  language: string;
  text: string;
  status: 'translated' | 'pending' | 'review' | 'approved' | 'rejected';
  translator: string;
  reviewer?: string;
  quality: number;
  createdAt: string;
  updatedAt: string;
  context?: string;
  notes?: string;
}

interface TranslationRequest {
  id: string;
  key: string;
  namespace: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  assignedTo?: string;
  estimatedTime?: number;
  actualTime?: number;
}

interface LanguageDetection {
  id: string;
  text: string;
  detectedLanguage: string;
  confidence: number;
  alternatives: LanguageAlternative[];
  timestamp: string;
  userId?: string;
}

interface LanguageAlternative {
  language: string;
  confidence: number;
}

interface LocalizationMetrics {
  id: string;
  language: string;
  totalKeys: number;
  translatedKeys: number;
  pendingKeys: number;
  reviewKeys: number;
  approvedKeys: number;
  rejectedKeys: number;
  translationProgress: number;
  qualityScore: number;
  lastActivity: string;
}

const I18nServiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [languages, setLanguages] = useState<Language[]>([
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      isRTL: false,
      country: 'US',
      script: 'Latin',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      pluralRules: { one: 'n == 1', other: 'n != 1' },
      region: 'Global',
      speakers: '1.5 billion',
      officialStatus: 'Global language',
      isActive: true,
      translationProgress: 100,
      lastUpdated: '2025-10-27'},
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      isRTL: false,
      country: 'IN',
      script: 'Devanagari',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      pluralRules: { one: 'n == 1', other: 'n != 1' },
      region: 'North India',
      speakers: '528 million',
      officialStatus: 'Official language of India',
      isActive: true,
      translationProgress: 85,
      lastUpdated: '2025-10-26'},
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      isRTL: false,
      country: 'ES',
      script: 'Latin',
      currency: 'EUR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      pluralRules: { one: 'n == 1', other: 'n != 1' },
      region: 'Europe',
      speakers: '500 million',
      officialStatus: 'Official language of Spain',
      isActive: true,
      translationProgress: 92,
      lastUpdated: '2025-10-25'},
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      isRTL: true,
      country: 'SA',
      script: 'Arabic',
      currency: 'SAR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      pluralRules: { zero: 'n == 0', one: 'n == 1', two: 'n == 2', few: 'n % 100 >= 3 && n % 100 <= 10', many: 'n % 100 >= 11', other: 'n % 100 >= 0 && n % 100 <= 2' },
      region: 'Middle East',
      speakers: '400 million',
      officialStatus: 'Official language of Saudi Arabia',
      isActive: true,
      translationProgress: 78,
      lastUpdated: '2025-10-24'},
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '中文',
      isRTL: false,
      country: 'CN',
      script: 'Han',
      currency: 'CNY',
      dateFormat: 'YYYY/MM/DD',
      timeFormat: '24h',
      pluralRules: { other: 'n != 1' },
      region: 'East Asia',
      speakers: '1.1 billion',
      officialStatus: 'Official language of China',
      isActive: false,
      translationProgress: 45,
      lastUpdated: '2025-10-20'},
  ]);

  const [translations, setTranslations] = useState<Translation[]>([
    {
      id: 't1',
      key: 'welcome.message',
      namespace: 'common',
      language: 'hi',
      text: 'आपका स्वागत है',
      status: 'approved',
      translator: 'translator_1',
      reviewer: 'reviewer_1',
      quality: 95,
      createdAt: '2025-10-25',
      updatedAt: '2025-10-26',
      context: 'Welcome message displayed on homepage'},
    {
      id: 't2',
      key: 'booking.confirmation',
      namespace: 'booking',
      language: 'es',
      text: 'Su reserva ha sido confirmada',
      status: 'translated',
      translator: 'translator_2',
      quality: 88,
      createdAt: '2025-10-24',
      updatedAt: '2025-10-24',
      context: 'Booking confirmation message'},
    {
      id: 't3',
      key: 'payment.failed',
      namespace: 'payment',
      language: 'ar',
      text: 'فشل في المعالجة',
      status: 'review',
      translator: 'translator_3',
      quality: 82,
      createdAt: '2025-10-23',
      updatedAt: '2025-10-24',
      context: 'Payment failure notification'},
    {
      id: 't4',
      key: 'user.profile',
      namespace: 'user',
      language: 'zh',
      text: '用户资料',
      status: 'pending',
      translator: 'translator_4',
      quality: 0,
      createdAt: '2025-10-22',
      updatedAt: '2025-10-22',
      context: 'User profile section'},
  ]);

  const [requests, setRequests] = useState<TranslationRequest[]>([
    {
      id: 'r1',
      key: 'dashboard.analytics',
      namespace: 'dashboard',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
      sourceText: 'Analytics Dashboard',
      priority: 'high',
      status: 'in_progress',
      requestedBy: 'admin_1',
      requestedAt: '2025-10-27 10:00:00',
      assignedTo: 'translator_1',
      estimatedTime: 2},
    {
      id: 'r2',
      key: 'settings.notifications',
      namespace: 'settings',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      sourceText: 'Notification Settings',
      priority: 'medium',
      status: 'pending',
      requestedBy: 'admin_2',
      requestedAt: '2025-10-27 09:30:00',
      estimatedTime: 1},
    {
      id: 'r3',
      key: 'error.network',
      namespace: 'error',
      sourceLanguage: 'en',
      targetLanguage: 'ar',
      sourceText: 'Network connection error',
      priority: 'urgent',
      status: 'completed',
      requestedBy: 'admin_3',
      requestedAt: '2025-10-26 16:00:00',
      completedAt: '2025-10-26 16:30:00',
      assignedTo: 'translator_3',
      estimatedTime: 1,
      actualTime: 0.5},
  ]);

  const [detections, setDetections] = useState<LanguageDetection[]>([
    {
      id: 'd1',
      text: 'Hello, how are you?',
      detectedLanguage: 'en',
      confidence: 98.5,
      alternatives: [
        { language: 'en', confidence: 98.5 },
        { language: 'es', confidence: 1.2 },
        { language: 'fr', confidence: 0.3 },
      ],
      timestamp: '2025-10-27 14:20:00',
      userId: 'u1'},
    {
      id: 'd2',
      text: 'नमस्ते, आप कैसे हैं?',
      detectedLanguage: 'hi',
      confidence: 96.8,
      alternatives: [
        { language: 'hi', confidence: 96.8 },
        { language: 'ne', confidence: 2.1 },
        { language: 'mr', confidence: 1.1 },
      ],
      timestamp: '2025-10-27 14:18:00',
      userId: 'u2'},
    {
      id: 'd3',
      text: 'Hola, ¿cómo estás?',
      detectedLanguage: 'es',
      confidence: 97.2,
      alternatives: [
        { language: 'es', confidence: 97.2 },
        { language: 'pt', confidence: 2.5 },
        { language: 'it', confidence: 0.3 },
      ],
      timestamp: '2025-10-27 14:15:00',
      userId: 'u3'},
  ]);

  const [metrics, setMetrics] = useState<LocalizationMetrics[]>([
    {
      id: 'm1',
      language: 'en',
      totalKeys: 1250,
      translatedKeys: 1250,
      pendingKeys: 0,
      reviewKeys: 0,
      approvedKeys: 1250,
      rejectedKeys: 0,
      translationProgress: 100,
      qualityScore: 98.5,
      lastActivity: '2025-10-27'},
    {
      id: 'm2',
      language: 'hi',
      totalKeys: 1250,
      translatedKeys: 1062,
      pendingKeys: 150,
      reviewKeys: 38,
      approvedKeys: 1024,
      rejectedKeys: 0,
      translationProgress: 85,
      qualityScore: 92.3,
      lastActivity: '2025-10-26'},
    {
      id: 'm3',
      language: 'es',
      totalKeys: 1250,
      translatedKeys: 1150,
      pendingKeys: 75,
      reviewKeys: 25,
      approvedKeys: 1125,
      rejectedKeys: 0,
      translationProgress: 92,
      qualityScore: 94.7,
      lastActivity: '2025-10-25'},
    {
      id: 'm4',
      language: 'ar',
      totalKeys: 1250,
      translatedKeys: 975,
      pendingKeys: 200,
      reviewKeys: 75,
      approvedKeys: 900,
      rejectedKeys: 0,
      translationProgress: 78,
      qualityScore: 89.1,
      lastActivity: '2025-10-24'},
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TranslationRequest | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<LanguageDetection | null>(null);
  const [languageDetailsOpen, setLanguageDetailsOpen] = useState(false);
  const [translationDetailsOpen, setTranslationDetailsOpen] = useState(false);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [detectionDetailsOpen, setDetectionDetailsOpen] = useState(false);
  const [createTranslationOpen, setCreateTranslationOpen] = useState(false);

  // Mock data for charts
  const languageUsageData = [
    { language: 'English', users: 4500, percentage: 45, color: '#6366f1' },
    { language: 'Hindi', users: 2800, percentage: 28, color: '#16a34a' },
    { language: 'Spanish', users: 1500, percentage: 15, color: '#d97706' },
    { language: 'Arabic', users: 800, percentage: 8, color: '#dc2626' },
    { language: 'Chinese', users: 400, percentage: 4, color: '#8b5cf6' },
  ];

  const translationProgressData = [
    { language: 'English', progress: 100, quality: 98.5 },
    { language: 'Hindi', progress: 85, quality: 92.3 },
    { language: 'Spanish', progress: 92, quality: 94.7 },
    { language: 'Arabic', progress: 78, quality: 89.1 },
    { language: 'Chinese', progress: 45, quality: 85.2 },
  ];

  const requestVolumeData = [
    { time: '00:00', requests: 5, completed: 4 },
    { time: '04:00', requests: 3, completed: 2 },
    { time: '08:00', requests: 15, completed: 12 },
    { time: '12:00', requests: 25, completed: 20 },
    { time: '16:00', requests: 20, completed: 18 },
    { time: '20:00', requests: 12, completed: 10 },
  ];

  const qualityTrendData = [
    { day: 'Mon', english: 98.5, hindi: 92.3, spanish: 94.7, arabic: 89.1 },
    { day: 'Tue', english: 98.7, hindi: 92.8, spanish: 95.1, arabic: 89.5 },
    { day: 'Wed', english: 98.3, hindi: 91.9, spanish: 94.2, arabic: 88.8 },
    { day: 'Thu', english: 98.9, hindi: 93.2, spanish: 95.5, arabic: 89.8 },
    { day: 'Fri', english: 98.6, hindi: 92.5, spanish: 94.9, arabic: 89.3 },
    { day: 'Sat', english: 98.4, hindi: 92.1, spanish: 94.4, arabic: 88.9 },
    { day: 'Sun', english: 98.2, hindi: 91.8, spanish: 94.1, arabic: 88.6 },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'translated': return '#16a34a';
      case 'approved': return '#16a34a';
      case 'completed': return '#16a34a';
      case 'active': return '#16a34a';
      case 'in_progress': return '#d97706';
      case 'review': return '#d97706';
      case 'pending': return '#6366f1';
      case 'rejected': return '#dc2626';
      case 'failed': return '#dc2626';
      case 'inactive': return '#6b7280';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'translated': return <CheckIcon />;
      case 'approved': return <CheckIcon />;
      case 'completed': return <CheckIcon />;
      case 'active': return <CheckIcon />;
      case 'in_progress': return <PlayIcon />;
      case 'review': return <WarningIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'rejected': return <ErrorIcon />;
      case 'failed': return <ErrorIcon />;
      case 'inactive': return <ErrorIcon />;
      case 'cancelled': return <StopIcon />;
      default: return <ErrorIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#d97706';
      case 'medium': return '#6366f1';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const handleLanguageClick = (language: Language) => {
    setSelectedLanguage(language);
    setLanguageDetailsOpen(true);
  };

  const handleTranslationClick = (translation: Translation) => {
    setSelectedTranslation(translation);
    setTranslationDetailsOpen(true);
  };

  const handleRequestClick = (request: TranslationRequest) => {
    setSelectedRequest(request);
    setRequestDetailsOpen(true);
  };

  const handleDetectionClick = (detection: LanguageDetection) => {
    setSelectedDetection(detection);
    setDetectionDetailsOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const refreshData = () => {
    console.log('Refreshing i18n service data...');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            i18n Service Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitor languages, translations, and localization analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateTranslationOpen(true)}
          >
            Add Translation
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                  <LanguageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Active Languages</Typography>
                  <Typography variant="h4" color="primary">
                    {languages.filter((l: any) => l.isActive).length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {languages.length} languages
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#16a34a', mr: 2 }}>
                  <CheckIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Translated Keys</Typography>
                  <Typography variant="h4" color="success.main">
                    {translations.filter((t: any) => t.status === 'translated' || t.status === 'approved').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {translations.length} keys
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d97706', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Pending Requests</Typography>
                  <Typography variant="h4" color="warning.main">
                    {requests.filter((r: any) => r.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {requests.length} requests
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#dc2626', mr: 2 }}>
                  <AutoAwesomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Language Detections</Typography>
                  <Typography variant="h4" color="error.main">
                    {detections.length}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Last 24 hours
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Languages" />
          <Tab label="Translations" />
          <Tab label="Requests" />
          <Tab label="Detections" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {languages.map((language) => (
            <Box sx={{ flex: '1 1 350px', minWidth: 350 }} key={language.code}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4}}}
                onClick={() => handleLanguageClick(language)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(language.isActive ? 'active' : 'inactive'), mr: 2 }}>
                      <LanguageIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{language.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {language.nativeName} ({language.code})
                      </Typography>
                    </Box>
                    {language.isRTL && (
                      <Chip
                        label="RTL"
                        size="small"
                        variant="outlined"
                        icon={<FormatAlignRightIcon />}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {language.region} • {language.speakers} speakers
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {language.translationProgress}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {language.isActive ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={language.translationProgress}
                    sx={{ mb: 2 }}
                    color={language.translationProgress > 90 ? 'success' : language.translationProgress > 70 ? 'warning' : 'error'}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Script: {language.script}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {language.lastUpdated}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <SettingsIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Translation Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Quality</TableCell>
                    <TableCell>Translator</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {translations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {translation.key}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {translation.namespace}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={translation.language.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {translation.text}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={translation.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(translation.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {translation.quality}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={translation.quality}
                            sx={{ width: 50, height: 6 }}
                            color={translation.quality > 90 ? 'success' : translation.quality > 70 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{translation.translator}</TableCell>
                      <TableCell>{translation.updatedAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleTranslationClick(translation)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Translation Requests
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Source → Target</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {request.key}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.namespace}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.sourceLanguage.toUpperCase()} → {request.targetLanguage.toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.sourceText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(request.priority),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(request.status),
                            color: 'white'}}
                        />
                      </TableCell>
                      <TableCell>{request.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>{request.requestedAt}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleRequestClick(request)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          {request.status === 'pending' && (
                            <IconButton size="small" color="primary">
                              <PlayIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Language Detection Results
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Text</TableCell>
                    <TableCell>Detected Language</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Alternatives</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detections.map((detection) => (
                    <TableRow key={detection.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {detection.text}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={detection.detectedLanguage.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {detection.confidence}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={detection.confidence}
                            sx={{ width: 50, height: 6 }}
                            color={detection.confidence > 95 ? 'success' : detection.confidence > 80 ? 'warning' : 'error'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {detection.alternatives.slice(0, 2).map((alt) => (
                            <Chip
                              key={alt.language}
                              label={`${alt.language}: ${alt.confidence}%`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{detection.timestamp}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleDetectionClick(detection)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language Usage
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="users"
                    >
                      {languageUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Translation Progress
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={translationProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="language" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="progress" fill="#6366f1" name="Progress (%)" />
                    <Bar dataKey="quality" fill="#16a34a" name="Quality (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Volume (24h)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={requestVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="2"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '2 1 600px', minWidth: 400 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quality Trend (7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="english" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="hindi" stroke="#16a34a" strokeWidth={2} />
                    <Line type="monotone" dataKey="spanish" stroke="#d97706" strokeWidth={2} />
                    <Line type="monotone" dataKey="arabic" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Language Details Dialog */}
      <Dialog
        open={languageDetailsOpen}
        onClose={() => setLanguageDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLanguage?.name} - Language Details
        </DialogTitle>
        <DialogContent>
          {selectedLanguage && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Native Name
                  </Typography>
                  <Typography variant="h6">
                    {selectedLanguage.nativeName}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Code
                  </Typography>
                  <Typography variant="h6">
                    {selectedLanguage.code}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Script
                  </Typography>
                  <Typography variant="h6">
                    {selectedLanguage.script}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    RTL Support
                  </Typography>
                  <Chip
                    label={selectedLanguage.isRTL ? 'Yes' : 'No'}
                    sx={{
                      bgcolor: selectedLanguage.isRTL ? '#16a34a' : '#6b7280',
                      color: 'white'}}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Language Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Region
                  </Typography>
                  <Typography variant="body2">
                    {selectedLanguage.region}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Speakers
                  </Typography>
                  <Typography variant="body2">
                    {selectedLanguage.speakers}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body2">
                    {selectedLanguage.currency}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date Format
                  </Typography>
                  <Typography variant="body2">
                    {selectedLanguage.dateFormat}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Translation Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {selectedLanguage.translationProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedLanguage.translationProgress}
                  sx={{ flexGrow: 1 }}
                  color={selectedLanguage.translationProgress > 90 ? 'success' : selectedLanguage.translationProgress > 70 ? 'warning' : 'error'}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Official Status
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedLanguage.officialStatus}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Edit Language
          </Button>
        </DialogActions>
      </Dialog>

      {/* Translation Details Dialog */}
      <Dialog
        open={translationDetailsOpen}
        onClose={() => setTranslationDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTranslation?.key} - Translation Details
        </DialogTitle>
        <DialogContent>
          {selectedTranslation && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedTranslation.status}
                    sx={{
                      bgcolor: getStatusColor(selectedTranslation.status),
                      color: 'white'}}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="h6">
                    {selectedTranslation.language.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quality
                  </Typography>
                  <Typography variant="h6">
                    {selectedTranslation.quality}%
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Translator
                  </Typography>
                  <Typography variant="h6">
                    {selectedTranslation.translator}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Translation Text
              </Typography>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body2">
                  {selectedTranslation.text}
                </Typography>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Context
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedTranslation.context || 'No context provided'}
              </Typography>
              
              {selectedTranslation.notes && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedTranslation.notes}
                  </Typography>
                </>
              )}
              
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Namespace
                  </Typography>
                  <Typography variant="body2">
                    {selectedTranslation.namespace}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {selectedTranslation.createdAt}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body2">
                    {selectedTranslation.updatedAt}
                  </Typography>
                </Box>
                {selectedTranslation.reviewer && (
                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reviewer
                    </Typography>
                    <Typography variant="body2">
                      {selectedTranslation.reviewer}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTranslationDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained">
            Edit Translation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Translation Dialog */}
      <Dialog
        open={createTranslationOpen}
        onClose={() => setCreateTranslationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Translation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Translation Key"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Namespace</InputLabel>
              <Select label="Namespace">
                <MenuItem value="common">Common</MenuItem>
                <MenuItem value="booking">Booking</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="dashboard">Dashboard</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select label="Language">
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="ar">Arabic</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Translation Text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
            <TextField
              label="Context (Optional)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTranslationOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Add Translation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default I18nServiceManagement;










