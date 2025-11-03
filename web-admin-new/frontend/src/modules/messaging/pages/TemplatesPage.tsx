// ============================================
// COMPREHENSIVE TEMPLATE MANAGEMENT PAGE
// SMS, WhatsApp & Email templates for all platform needs
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  GridLegacy as Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
  Alert,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Sms,
  WhatsApp,
  Email,
  Add,
  Edit,
  Delete,
  Visibility,
  ContentCopy,
  Schedule,
  CheckCircle,
  Pending,
  Error,
  ExpandMore,
  Category,
  Settings,
  Analytics,
  Send,
  Group,
  AttachMoney,
  EventAvailable,
  School,
  Notifications,
  Warning,
  Star,
  TrendingUp,
  People,
} from '@mui/icons-material';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [templateType, setTemplateType] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);

  // Comprehensive SMS Templates with Permission Requirements
  const smsTemplates = [
    // FEES & PAYMENTS
    { id: 1, name: 'Fee Due Reminder', category: 'Fees', content: 'Dear {student_name}, your library fee of ₹{amount} is due on {due_date}. Please pay to avoid service interruption. - {library_name}', variables: 4, status: 'Active', usageCount: 156, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'fee_management', 'auto_payment_reminders'] },
    { id: 2, name: 'Payment Received', category: 'Payment', content: 'Thank you {student_name}! We received your payment of ₹{amount} for {month}. Receipt: {receipt_no}. - {library_name}', variables: 4, status: 'Active', usageCount: 142, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, requiredPermissions: ['sms_enabled', 'fee_management', 'payment_confirmations'] },
    { id: 3, name: 'Payment Pending Warning', category: 'Fees', content: '⚠️ URGENT: {student_name}, payment of ₹{amount} is overdue by {days_overdue} days. Pay now: {payment_link} - {library_name}', variables: 5, status: 'Active', usageCount: 89, isDefault: true, approvalStatus: 'Approved', lastUsed: '30 min ago', autoSend: true, requiredPermissions: ['sms_enabled', 'fee_management', 'overdue_alerts'] },
    { id: 4, name: 'Partial Payment Alert', category: 'Payment', content: 'Hi {student_name}, we received ₹{paid_amount} out of ₹{total_amount}. Remaining: ₹{balance}. Complete payment soon. - {library_name}', variables: 4, status: 'Active', usageCount: 45, isDefault: false, approvalStatus: 'Approved', lastUsed: '5 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'fee_management'] },
    { id: 5, name: 'Refund Confirmation', category: 'Payment', content: 'Refund of ₹{amount} processed for {student_name}. Refund ID: {refund_id}. Amount credited to {account_details}. - {library_name}', variables: 4, status: 'Active', usageCount: 12, isDefault: false, approvalStatus: 'Approved', lastUsed: '2 days ago', autoSend: true, requiredPermissions: ['sms_enabled', 'fee_management'] },
    
    // BOOKING & SEATS
    { id: 6, name: 'Booking Confirmation', category: 'Booking', content: 'Hi {student_name}, your seat #{seat_no} is confirmed for {date} at {library_name}. Timing: {time_slot}. See you soon!', variables: 5, status: 'Active', usageCount: 98, isDefault: true, approvalStatus: 'Approved', lastUsed: '15 min ago', autoSend: true, requiredPermissions: ['sms_enabled', 'seat_allocation', 'booking_confirmations'] },
    { id: 7, name: 'Booking Cancellation', category: 'Booking', content: 'Hi {student_name}, your booking for {date} at {time_slot} is cancelled. Refund: ₹{refund_amount}. - {library_name}', variables: 5, status: 'Active', usageCount: 34, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, requiredPermissions: ['sms_enabled', 'seat_allocation'] },
    { id: 8, name: 'Booking Reminder', category: 'Booking', content: 'Reminder: {student_name}, your seat #{seat_no} is booked for today at {time_slot}. Arrive on time. - {library_name}', variables: 4, status: 'Active', usageCount: 67, isDefault: true, approvalStatus: 'Approved', lastUsed: '10 min ago', autoSend: true, requiredPermissions: ['sms_enabled', 'seat_allocation', 'booking_reminders'] },
    { id: 9, name: 'Waitlist Notification', category: 'Booking', content: 'Good news {student_name}! Seat #{seat_no} is now available for {date}. Book now: {booking_link} - {library_name}', variables: 5, status: 'Active', usageCount: 23, isDefault: false, approvalStatus: 'Approved', lastUsed: '3 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'seat_allocation'] },
    { id: 10, name: 'No Show Warning', category: 'Booking', content: 'Hi {student_name}, you missed your booking on {date}. Please update or cancel in advance. - {library_name}', variables: 3, status: 'Active', usageCount: 56, isDefault: false, approvalStatus: 'Approved', lastUsed: '20 min ago', autoSend: true, requiredPermissions: ['sms_enabled', 'seat_allocation', 'attendance_tracking'] },
    
    // ONBOARDING & WELCOME
    { id: 11, name: 'Welcome Message', category: 'Onboarding', content: 'Welcome to {library_name}! Your registration is complete. Student ID: {student_id}. Download our app for easy bookings.', variables: 2, status: 'Active', usageCount: 45, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, requiredPermissions: ['sms_enabled', 'student_management'] },
    { id: 12, name: 'Account Activated', category: 'Onboarding', content: 'Hi {student_name}, your {library_name} account is now active. Login: {login_url} Username: {username} Password: {password}', variables: 5, status: 'Active', usageCount: 38, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'student_management'] },
    { id: 13, name: 'Email Verification', category: 'Onboarding', content: 'Verify your email for {library_name} account. Use code: {verification_code}. Valid for 10 mins. - {library_name}', variables: 3, status: 'Active', usageCount: 29, isDefault: true, approvalStatus: 'Approved', lastUsed: '30 min ago', autoSend: true, requiredPermissions: ['sms_enabled'] },
    { id: 14, name: 'Mobile Verification', category: 'Onboarding', content: 'Your {library_name} verification code is {otp}. Valid for 5 minutes. Do not share with anyone.', variables: 2, status: 'Active', usageCount: 52, isDefault: true, approvalStatus: 'Approved', lastUsed: '15 min ago', autoSend: true, requiredPermissions: ['sms_enabled'] },
    
    // SUBSCRIPTION & MEMBERSHIP
    { id: 15, name: 'Subscription Renewal', category: 'Subscription', content: 'Hi {student_name}, your subscription expires on {expiry_date}. Renew now to continue enjoying uninterrupted access. - {library_name}', variables: 3, status: 'Active', usageCount: 67, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, requiredPermissions: ['sms_enabled', 'subscription_management', 'renewal_reminders'] },
    { id: 16, name: 'Subscription Expired', category: 'Subscription', content: 'Hi {student_name}, your subscription expired on {expiry_date}. Renew now: {renewal_link} to regain access. - {library_name}', variables: 4, status: 'Active', usageCount: 34, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'subscription_management'] },
    { id: 17, name: 'Upgrade Promotion', category: 'Subscription', content: 'Upgrade to Premium plan and save 30%! More seats, priority booking, exclusive amenities. {upgrade_link} - {library_name}', variables: 2, status: 'Active', usageCount: 78, isDefault: false, approvalStatus: 'Approved', lastUsed: '5 hours ago', autoSend: false, requiredPermissions: ['sms_enabled', 'marketing_enabled'] },
    
    // ATTENDANCE & REPORTS
    { id: 18, name: 'Low Attendance Alert', category: 'Attendance', content: 'Hi {student_name}, your attendance is {attendance_percent}% this month. Please attend more to maintain membership. - {library_name}', variables: 3, status: 'Active', usageCount: 89, isDefault: true, approvalStatus: 'Approved', lastUsed: '30 min ago', autoSend: true, requiredPermissions: ['sms_enabled', 'attendance_tracking', 'attendance_alerts'] },
    { id: 19, name: 'Monthly Report', category: 'Reports', content: 'Monthly Summary: {classes_attended} classes, {hours_studied} hours, ₹{fees_paid}. View full report: {report_link} - {library_name}', variables: 5, status: 'Active', usageCount: 234, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'report_generation', 'automated_reports'] },
    { id: 20, name: 'ID Card Expiry', category: 'Membership', content: 'Your {library_name} ID card expires on {expiry_date}. Renew to continue library access. Visit reception. - {library_name}', variables: 3, status: 'Active', usageCount: 45, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 day ago', autoSend: true, requiredPermissions: ['sms_enabled', 'student_management'] },
    
    // MARKETING & PROMOTIONS
    { id: 21, name: 'New Facility Launch', category: 'Marketing', content: 'Great news! {library_name} now has {new_facility}. Book now at special rates: {promo_code} - Limited time!', variables: 4, status: 'Active', usageCount: 156, isDefault: false, approvalStatus: 'Approved', lastUsed: '6 hours ago', autoSend: false, requiredPermissions: ['sms_enabled', 'marketing_enabled'] },
    { id: 22, name: 'Referral Reward', category: 'Referrals', content: 'Congrats {student_name}! You earned ₹{reward_amount} for referring {friend_name}. Keep referring, keep earning! - {library_name}', variables: 4, status: 'Active', usageCount: 67, isDefault: false, approvalStatus: 'Approved', lastUsed: '3 hours ago', autoSend: true, requiredPermissions: ['sms_enabled', 'referral_program'] },
    { id: 23, name: 'Birthday Wish', category: 'Marketing', content: '🎂 Happy Birthday {student_name}! Enjoy 20% off on your next booking. Use code: BIRTHDAY20. - {library_name}', variables: 2, status: 'Active', usageCount: 45, isDefault: false, approvalStatus: 'Approved', lastUsed: '5 hours ago', autoSend: false, requiredPermissions: ['sms_enabled', 'marketing_enabled'] },
    
    // NOTIFICATIONS & ALERTS
    { id: 24, name: 'Maintenance Notice', category: 'Alerts', content: 'Notice: {library_name} will be closed for maintenance on {date} from {time}. Sorry for inconvenience. - {library_name}', variables: 4, status: 'Active', usageCount: 12, isDefault: false, approvalStatus: 'Approved', lastUsed: '1 day ago', autoSend: false, requiredPermissions: ['sms_enabled'] },
    { id: 25, name: 'Security Alert', category: 'Alerts', content: 'Security Alert: Unusual login detected for {student_name}. If not you, reset password: {reset_link} - {library_name}', variables: 3, status: 'Active', usageCount: 5, isDefault: false, approvalStatus: 'Approved', lastUsed: '3 days ago', autoSend: true, requiredPermissions: ['sms_enabled'] },
    { id: 26, name: 'System Update', category: 'Alerts', content: 'New features launched! Faster bookings, better seats, more perks. Update app now. - {library_name}', variables: 1, status: 'Active', usageCount: 234, isDefault: false, approvalStatus: 'Approved', lastUsed: '4 hours ago', autoSend: false, requiredPermissions: ['sms_enabled'] },
    { id: 27, name: 'Holiday Greeting', category: 'Marketing', content: 'Happy {holiday_name}! {library_name} wishes you joy. Enjoy 15% off on bookings this week. - {library_name}', variables: 3, status: 'Active', usageCount: 89, isDefault: false, approvalStatus: 'Approved', lastUsed: '2 days ago', autoSend: false, requiredPermissions: ['sms_enabled', 'marketing_enabled'] },
  ];

  // WhatsApp Templates with rich formatting
  const whatsappTemplates = [
    { id: 1, name: 'Fee Due Reminder', category: 'Fees', content: '🔔 *Fee Reminder*\n\nDear {student_name},\n\nYour library fee of *₹{amount}* is due on {due_date}.\n\nPay now: {payment_link}\n\n- {library_name}', variables: 4, status: 'Active', usageCount: 234, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, hasButtons: true, buttons: ['Pay Now', 'View Invoice'] },
    { id: 2, name: 'Payment Thank You', category: 'Payment', content: '✅ *Payment Received*\n\nThank you {student_name}!\n\nAmount: ₹{amount}\nMonth: {month}\nReceipt: {receipt_no}\n\n- {library_name}', variables: 4, status: 'Active', usageCount: 198, isDefault: true, approvalStatus: 'Approved', lastUsed: '30 min ago', autoSend: true, hasButtons: false },
    { id: 3, name: 'Seat Booking Confirmed', category: 'Booking', content: '🎯 *Booking Confirmed*\n\nHi {student_name},\n\nSeat: #{seat_no}\nDate: {date}\nTime: {time_slot}\n\nLocation: {library_name}', variables: 5, status: 'Active', usageCount: 156, isDefault: true, approvalStatus: 'Approved', lastUsed: '15 min ago', autoSend: true, hasButtons: true, buttons: ['View Booking', 'Cancel'] },
    { id: 4, name: 'Welcome Package', category: 'Onboarding', content: '👋 *Welcome to {library_name}!*\n\nYour account is ready:\nID: {student_id}\nPlan: {plan_type}\n\nDownload app: {app_link}', variables: 4, status: 'Active', usageCount: 45, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, hasButtons: true, buttons: ['Download App', 'Get Started'] },
    { id: 5, name: 'Monthly Summary', category: 'Reports', content: '📊 *Monthly Report*\n\n{classes_attended} classes\n{hours_studied} hours\n₹{fees_paid} paid\n\nFull report: {report_link}', variables: 5, status: 'Active', usageCount: 289, isDefault: true, approvalStatus: 'Approved', lastUsed: '3 hours ago', autoSend: true, hasButtons: true, buttons: ['View Report'] },
    { id: 6, name: 'Subscription Expiring', category: 'Subscription', content: '⏰ *Renewal Due*\n\nHi {student_name},\n\nYour subscription ends {days_remaining} days.\n\nRenew: {renewal_link}', variables: 4, status: 'Active', usageCount: 67, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, hasButtons: true, buttons: ['Renew Now', 'View Plans'] },
    { id: 7, name: 'Special Promotion', category: 'Marketing', content: '🎉 *Special Offer!*\n\n{library_name} exclusive:\n*{offer_description}*\n\nUse code: {promo_code}\nValid: {valid_until}', variables: 5, status: 'Active', usageCount: 156, isDefault: false, approvalStatus: 'Approved', lastUsed: '5 hours ago', autoSend: false, hasButtons: true, buttons: ['Claim Now'] },
    { id: 8, name: 'Referral Success', category: 'Referrals', content: '🎁 *Referral Reward!*\n\nYou earned ₹{reward_amount} for {friend_name} joining {library_name}.\n\nRefer more: {referral_link}', variables: 5, status: 'Active', usageCount: 89, isDefault: false, approvalStatus: 'Approved', lastUsed: '4 hours ago', autoSend: true, hasButtons: true, buttons: ['Refer More', 'Withdraw'] },
    { id: 9, name: 'Upgrade Suggestion', category: 'Subscription', content: '⭐ *Upgrade Recommendation*\n\nHi {student_name}, upgrade to Premium for:\n✅ Priority booking\n✅ Exclusive seats\n✅ Free snacks\n\nSpecial price: ₹{discounted_price}', variables: 3, status: 'Active', usageCount: 98, isDefault: false, approvalStatus: 'Approved', lastUsed: '6 hours ago', autoSend: false, hasButtons: true, buttons: ['Upgrade Now'] },
  ];

  // Email Templates
  const emailTemplates = [
    { id: 1, name: 'Fee Due Reminder', category: 'Fees', subject: 'Library Fee Payment Reminder - {student_name}', content: 'HTML template with payment details, invoice link, and payment options...', variables: 6, status: 'Active', usageCount: 89, isDefault: true, approvalStatus: 'Approved', lastUsed: '2 hours ago', autoSend: true, isHTML: true, openRate: 65.2 },
    { id: 2, name: 'Payment Receipt', category: 'Payment', subject: 'Payment Receipt - {receipt_no}', content: 'HTML template with detailed invoice, transaction details, and download option...', variables: 8, status: 'Active', usageCount: 95, isDefault: true, approvalStatus: 'Approved', lastUsed: '1 hour ago', autoSend: true, isHTML: true, openRate: 72.5 },
    { id: 3, name: 'Welcome Email', category: 'Onboarding', subject: 'Welcome to {library_name}!', content: 'HTML template with welcome message, setup guide, and onboarding checklist...', variables: 5, status: 'Active', usageCount: 45, isDefault: true, approvalStatus: 'Approved', lastUsed: '3 hours ago', autoSend: true, isHTML: true, openRate: 85.3 },
    { id: 4, name: 'Booking Confirmation', category: 'Booking', subject: 'Seat Booking Confirmed - {date}', content: 'HTML template with booking details, QR code, and cancellation policy...', variables: 7, status: 'Active', usageCount: 67, isDefault: true, approvalStatus: 'Approved', lastUsed: '30 min ago', autoSend: true, isHTML: true, openRate: 78.9 },
    { id: 5, name: 'Subscription Renewal', category: 'Subscription', subject: 'Time to Renew Your Subscription', content: 'HTML template with renewal options, pricing comparison, and upgrade benefits...', variables: 4, status: 'Active', usageCount: 34, isDefault: true, approvalStatus: 'Approved', lastUsed: '4 hours ago', autoSend: true, isHTML: true, openRate: 56.7 },
    { id: 6, name: 'Monthly Report', category: 'Reports', subject: 'Your {library_name} Monthly Report', content: 'HTML template with attendance stats, hours logged, progress charts, and achievements...', variables: 9, status: 'Active', usageCount: 234, isDefault: true, approvalStatus: 'Approved', lastUsed: '5 hours ago', autoSend: true, isHTML: true, openRate: 68.2 },
    { id: 7, name: 'Account Security Alert', category: 'Alerts', subject: 'Security Alert - Account Activity', content: 'HTML template with security notice, login details, and password reset instructions...', variables: 6, status: 'Active', usageCount: 5, isDefault: false, approvalStatus: 'Approved', lastUsed: '2 days ago', autoSend: true, isHTML: true, openRate: 45.3 },
    { id: 8, name: 'Newsletter', category: 'Marketing', subject: '{library_name} Monthly Newsletter', content: 'HTML template with news, events, tips, promotions, and community highlights...', variables: 10, status: 'Active', usageCount: 456, isDefault: false, approvalStatus: 'Approved', lastUsed: '1 day ago', autoSend: false, isHTML: true, openRate: 32.1 },
  ];

  const categories = [
    { label: 'All Categories', value: 'all', icon: <Category />, count: smsTemplates.length + whatsappTemplates.length + emailTemplates.length },
    { label: 'Fees', value: 'Fees', icon: <AttachMoney />, count: smsTemplates.filter(t => t.category === 'Fees').length + whatsappTemplates.filter(t => t.category === 'Fees').length + emailTemplates.filter(t => t.category === 'Fees').length },
    { label: 'Payment', value: 'Payment', icon: <CheckCircle />, count: smsTemplates.filter(t => t.category === 'Payment').length + whatsappTemplates.filter(t => t.category === 'Payment').length + emailTemplates.filter(t => t.category === 'Payment').length },
    { label: 'Booking', value: 'Booking', icon: <EventAvailable />, count: smsTemplates.filter(t => t.category === 'Booking').length + whatsappTemplates.filter(t => t.category === 'Booking').length + emailTemplates.filter(t => t.category === 'Booking').length },
    { label: 'Onboarding', value: 'Onboarding', icon: <School />, count: smsTemplates.filter(t => t.category === 'Onboarding').length + whatsappTemplates.filter(t => t.category === 'Onboarding').length + emailTemplates.filter(t => t.category === 'Onboarding').length },
    { label: 'Subscription', value: 'Subscription', icon: <Star />, count: smsTemplates.filter(t => t.category === 'Subscription').length + whatsappTemplates.filter(t => t.category === 'Subscription').length + emailTemplates.filter(t => t.category === 'Subscription').length },
    { label: 'Attendance', value: 'Attendance', icon: <Group />, count: smsTemplates.filter(t => t.category === 'Attendance').length + whatsappTemplates.filter(t => t.category === 'Attendance').length + emailTemplates.filter(t => t.category === 'Attendance').length },
    { label: 'Reports', value: 'Reports', icon: <Analytics />, count: smsTemplates.filter(t => t.category === 'Reports').length + whatsappTemplates.filter(t => t.category === 'Reports').length + emailTemplates.filter(t => t.category === 'Reports').length },
    { label: 'Marketing', value: 'Marketing', icon: <TrendingUp />, count: smsTemplates.filter(t => t.category === 'Marketing').length + whatsappTemplates.filter(t => t.category === 'Marketing').length + emailTemplates.filter(t => t.category === 'Marketing').length },
    { label: 'Referrals', value: 'Referrals', icon: <People />, count: smsTemplates.filter(t => t.category === 'Referrals').length + whatsappTemplates.filter(t => t.category === 'Referrals').length + emailTemplates.filter(t => t.category === 'Referrals').length },
    { label: 'Alerts', value: 'Alerts', icon: <Warning />, count: smsTemplates.filter(t => t.category === 'Alerts').length + whatsappTemplates.filter(t => t.category === 'Alerts').length + emailTemplates.filter(t => t.category === 'Alerts').length },
  ];

  // Handler functions
  const handleViewTemplate = (template: any) => {
    navigate(`/messaging/templates/${template.id}`);
  };

  const handleEditTemplate = (template: any) => {
    navigate(`/messaging/templates/${template.id}/edit`);
  };

  const handleDuplicateTemplate = (template: any) => {
    alert(`Template "${template.name}" duplicated successfully!`);
    // In production, this would create a copy of the template
  };

  const handleDeleteClick = (template: any) => {
    setTemplateToDelete(template);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    alert(`Template "${templateToDelete?.name}" deleted successfully!`);
    setDeleteConfirmOpen(false);
    setTemplateToDelete(null);
    // In production, this would delete the template from backend
  };

  const handleCreateTemplate = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitTemplate = () => {
    alert('Template submitted for approval successfully!');
    setCreateDialogOpen(false);
    // In production, this would save the template to backend
  };

  const getColumns = (type: string): GridColDef[] => [
    { field: 'name', headerName: 'Template Name', width: 220, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {params.row.isDefault && <Star sx={{ fontSize: 16, color: 'orange' }} />}
        <Typography variant="body2" fontWeight={params.row.isDefault ? 'bold' : 'normal'}>
          {params.value}
        </Typography>
      </Box>
    )},
    { field: 'category', headerName: 'Category', width: 130 },
    ...(type === 'email' ? [{ field: 'subject', headerName: 'Subject', width: 250 }] : []),
    { 
      field: 'content', 
      headerName: 'Preview', 
      width: 320,
      renderCell: (params) => (
        <Tooltip title={params.value} arrow>
          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'variables', 
      headerName: 'Variables', 
      width: 100,
      renderCell: (params) => (
        <Chip label={`${params.value} vars`} size="small" color="info" />
      )
    },
    { 
      field: 'usageCount', 
      headerName: 'Used', 
      width: 90,
      renderCell: (params) => (
        <Typography fontWeight="bold">{params.value}</Typography>
      )
    },
    { 
      field: 'approvalStatus', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'Approved' ? 'Approved' : params.value} 
          color={params.value === 'Approved' ? 'success' : 'warning'}
          size="small"
          icon={params.value === 'Approved' ? <CheckCircle /> : <Pending />}
        />
      )
    },
    {
      field: 'autoSend',
      headerName: 'Auto',
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'ON' : 'OFF'} 
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleViewTemplate(params.row)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleEditTemplate(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton 
              size="small"
              onClick={() => handleDuplicateTemplate(params.row)}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getFilteredTemplates = (type: string) => {
    let templates: any[] = [];
    if (type === 'sms') templates = smsTemplates;
    else if (type === 'whatsapp') templates = whatsappTemplates;
    else if (type === 'email') templates = emailTemplates;

    if (filterCategory !== 'all') {
      templates = templates.filter(t => t.category === filterCategory);
    }
    if (filterStatus !== 'all') {
      templates = templates.filter(t => t.status === filterStatus);
    }
    return templates;
  };

  const renderTabContent = (type: string, templates: any[], stats: any) => (
    <Box>
      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat: any, index: number) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderLeft: 3, borderColor: stat.color, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">Filters:</Typography>
            {categories.slice(0, 6).map((cat) => (
              <Chip
                key={cat.value}
                label={`${cat.label} (${cat.count})`}
                onClick={() => setFilterCategory(cat.value)}
                color={filterCategory === cat.value ? 'primary' : 'default'}
                variant={filterCategory === cat.value ? 'filled' : 'outlined'}
                size="small"
                icon={cat.icon}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardContent>
          <DataGrid
            rows={getFilteredTemplates(type)}
            columns={getColumns(type)}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            autoHeight
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>
    </Box>
  );

  const renderSMSTab = () => renderTabContent('sms', smsTemplates, [
    { label: 'Total SMS Templates', value: smsTemplates.length, color: 'primary', icon: <Sms /> },
    { label: 'Total SMS Sent', value: '3,245', color: 'success', icon: <Send /> },
    { label: 'Avg Character Count', value: '142', color: 'info', icon: <Settings /> },
    { label: 'Delivery Rate', value: '96.8%', color: 'warning', icon: <CheckCircle /> },
  ]);

  const renderWhatsAppTab = () => renderTabContent('whatsapp', whatsappTemplates, [
    { label: 'Total Templates', value: whatsappTemplates.length, color: 'success', icon: <WhatsApp /> },
    { label: 'Messages Sent', value: '2,456', color: 'primary', icon: <Send /> },
    { label: 'Delivery Rate', value: '98.5%', color: 'success', icon: <CheckCircle /> },
    { label: 'Templates with Buttons', value: '6', color: 'info', icon: <Settings /> },
  ]);

  const renderEmailTab = () => renderTabContent('email', emailTemplates, [
    { label: 'Total Templates', value: emailTemplates.length, color: 'primary', icon: <Email /> },
    { label: 'Emails Sent', value: '1,089', color: 'success', icon: <Send /> },
    { label: 'Avg Open Rate', value: '68.2%', color: 'info', icon: <Analytics /> },
    { label: 'Avg Click Rate', value: '34.1%', color: 'warning', icon: <TrendingUp /> },
  ]);

  const renderAutomationTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold">🤖 Auto-Send Rules</Typography>
        <Typography variant="body2">
          Templates with Auto-Send enabled will trigger automatically based on events. Configure triggers below.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {[
          { event: 'Payment Received', templates: ['Payment Received', 'Payment Receipt'], icon: <CheckCircle />, color: 'success' },
          { event: 'Fee Due Date', templates: ['Fee Due Reminder', 'Payment Pending Warning'], icon: <Schedule />, color: 'warning' },
          { event: 'Booking Confirmed', templates: ['Booking Confirmation', 'Booking Reminder'], icon: <EventAvailable />, color: 'primary' },
          { event: 'Account Created', templates: ['Welcome Message', 'Email Verification'], icon: <School />, color: 'info' },
          { event: 'Subscription Expiring', templates: ['Subscription Renewal', 'Subscription Expired'], icon: <Star />, color: 'secondary' },
          { event: 'Low Attendance', templates: ['Low Attendance Alert'], icon: <Warning />, color: 'error' },
        ].map((rule, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ borderLeft: 3, borderColor: `${rule.color}.main` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ color: `${rule.color}.main` }}>
                    {rule.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">{rule.event}</Typography>
                  <Chip label="Active" size="small" color={rule.color as any} sx={{ ml: 'auto' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Triggers these templates:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {rule.templates.map((template, i) => (
                    <Chip key={i} label={template} size="small" variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderVariablesTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold">📝 Available Variables</Typography>
        <Typography variant="body2">
          Use these variables in your templates. They will be automatically replaced with actual values.
        </Typography>
      </Alert>

      {[
        { category: 'Student Information', variables: [
          { name: '{student_name}', description: 'Full name of the student', example: 'Rajesh Kumar' },
          { name: '{student_id}', description: 'Unique student identifier', example: 'STU-2024-001' },
          { name: '{username}', description: 'Login username', example: 'rajeshkumar' },
          { name: '{email}', description: 'Student email address', example: 'rajesh@example.com' },
          { name: '{phone}', description: 'Student phone number', example: '+91 9876543210' },
        ]},
        { category: 'Library Information', variables: [
          { name: '{library_name}', description: 'Name of the library', example: 'Sunrise Library' },
          { name: '{library_address}', description: 'Library address', example: '123 Main St, City' },
          { name: '{library_phone}', description: 'Library contact number', example: '+91 1234567890' },
          { name: '{library_email}', description: 'Library email', example: 'info@sunriselib.com' },
        ]},
        { category: 'Payment & Financial', variables: [
          { name: '{amount}', description: 'Payment amount', example: '₹500' },
          { name: '{receipt_no}', description: 'Receipt number', example: 'RCP-2024-001' },
          { name: '{refund_amount}', description: 'Refunded amount', example: '₹250' },
          { name: '{refund_id}', description: 'Refund transaction ID', example: 'REF-2024-001' },
          { name: '{total_amount}', description: 'Total payable amount', example: '₹1,000' },
          { name: '{paid_amount}', description: 'Amount paid', example: '₹500' },
          { name: '{balance}', description: 'Outstanding balance', example: '₹500' },
        ]},
        { category: 'Booking & Seats', variables: [
          { name: '{seat_no}', description: 'Seat number', example: '12' },
          { name: '{date}', description: 'Booking date', example: '2024-01-15' },
          { name: '{time_slot}', description: 'Time slot', example: '9:00 AM - 12:00 PM' },
          { name: '{booking_link}', description: 'Link to view booking', example: 'https://...' },
          { name: '{payment_link}', description: 'Payment gateway link', example: 'https://...' },
        ]},
        { category: 'Subscription & Membership', variables: [
          { name: '{expiry_date}', description: 'Subscription expiry date', example: '2024-12-31' },
          { name: '{renewal_link}', description: 'Link to renew subscription', example: 'https://...' },
          { name: '{plan_type}', description: 'Subscription plan', example: 'Premium' },
          { name: '{days_remaining}', description: 'Days until expiry', example: '30' },
        ]},
        { category: 'Reports & Analytics', variables: [
          { name: '{attendance_percent}', description: 'Attendance percentage', example: '85%' },
          { name: '{classes_attended}', description: 'Number of classes', example: '42' },
          { name: '{hours_studied}', description: 'Total study hours', example: '120' },
          { name: '{fees_paid}', description: 'Fees paid this month', example: '₹1,000' },
          { name: '{report_link}', description: 'Link to detailed report', example: 'https://...' },
        ]},
        { category: 'Marketing & Promotions', variables: [
          { name: '{promo_code}', description: 'Promotional code', example: 'SAVE20' },
          { name: '{offer_description}', description: 'Offer details', example: '30% off Premium Plan' },
          { name: '{valid_until}', description: 'Offer validity', example: '2024-12-31' },
          { name: '{referral_link}', description: 'Referral sharing link', example: 'https://...' },
        ]},
      ].map((group, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight="bold">{group.category}</Typography>
            <Chip label={`${group.variables.length} variables`} size="small" sx={{ ml: 2 }} />
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {group.variables.map((variable, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="bold" color="primary">
                        {variable.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {variable.description}
                    </Typography>
                    <Chip 
                      label={`Example: ${variable.example}`} 
                      size="small" 
                      sx={{ mt: 1 }} 
                      color="default"
                      variant="outlined"
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Template Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage SMS, WhatsApp & Email templates for automated communications
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Analytics />}>
              Analytics
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </Stack>
        </Box>

        {/* Summary Chips */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Sms />} 
            label={`${smsTemplates.length} SMS Templates`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            icon={<WhatsApp />} 
            label={`${whatsappTemplates.length} WhatsApp Templates`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            icon={<Email />} 
            label={`${emailTemplates.length} Email Templates`} 
            color="warning" 
            variant="outlined"
          />
          <Chip 
            icon={<Send />} 
            label="Total Sent: 6,790" 
            color="info" 
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          icon={<Sms />} 
          label={<Box><span>SMS</span><Chip label={smsTemplates.length} size="small" sx={{ ml: 1 }} /></Box>}
          iconPosition="start" 
        />
        <Tab 
          icon={<WhatsApp />} 
          label={<Box><span>WhatsApp</span><Chip label={whatsappTemplates.length} size="small" sx={{ ml: 1 }} /></Box>}
          iconPosition="start" 
        />
        <Tab 
          icon={<Email />} 
          label={<Box><span>Email</span><Chip label={emailTemplates.length} size="small" sx={{ ml: 1 }} /></Box>}
          iconPosition="start" 
        />
        <Tab 
          icon={<Settings />} 
          label="Automation" 
          iconPosition="start" 
        />
        <Tab 
          icon={<Category />} 
          label="Variables" 
          iconPosition="start" 
        />
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && renderSMSTab()}
      {activeTab === 1 && renderWhatsAppTab()}
      {activeTab === 2 && renderEmailTab()}
      {activeTab === 3 && renderAutomationTab()}
      {activeTab === 4 && renderVariablesTab()}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility />
              <Typography variant="h6">Template Preview - {selectedTemplate?.name}</Typography>
            </Box>
            {selectedTemplate?.isDefault && <Chip label="Default" color="warning" icon={<Star />} size="small" />}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Chip label={selectedTemplate.category} size="small" sx={{ mr: 1 }} />
                <Chip label={`${selectedTemplate.variables} Variables`} size="small" color="info" sx={{ mr: 1 }} />
                <Chip 
                  label={selectedTemplate.approvalStatus} 
                  size="small" 
                  color={selectedTemplate.approvalStatus === 'Approved' ? 'success' : 'warning'}
                  icon={selectedTemplate.approvalStatus === 'Approved' ? <CheckCircle /> : <Pending />}
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {selectedTemplate.content}
                </Typography>
              </Box>

              {selectedTemplate.hasButtons && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Quick Action Buttons:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedTemplate.buttons?.map((btn: string, i: number) => (
                      <Button key={i} variant="outlined" size="small">{btn}</Button>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Used</Typography>
                  <Typography variant="h6">{selectedTemplate.usageCount} times</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Last Used</Typography>
                  <Typography variant="h6">{selectedTemplate.lastUsed}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Auto-Send</Typography>
                  <Chip 
                    label={selectedTemplate.autoSend ? 'Enabled' : 'Disabled'} 
                    color={selectedTemplate.autoSend ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                {selectedTemplate.openRate && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Open Rate</Typography>
                    <Typography variant="h6">{selectedTemplate.openRate}%</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Available Variables: {selectedTemplate.variables} (e.g., {'{student_name}'}, {'{amount}'}, {'{date}'})
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button 
            variant="outlined" 
            startIcon={<ContentCopy />}
            onClick={() => {
              setPreviewOpen(false);
              handleDuplicateTemplate(selectedTemplate);
            }}
          >
            Duplicate
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Edit />}
            onClick={() => {
              setPreviewOpen(false);
              handleEditTemplate(selectedTemplate);
            }}
          >
            Edit Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Create New Template</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ py: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as any)}
                label="Template Type"
              >
                <MenuItem value="sms">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sms />
                    SMS Template
                  </Box>
                </MenuItem>
                <MenuItem value="whatsapp">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WhatsApp />
                    WhatsApp Template
                  </Box>
                </MenuItem>
                <MenuItem value="email">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email />
                    Email Template
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Template Name"
              placeholder="e.g., Payment Reminder"
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="Fees">Fees</MenuItem>
                <MenuItem value="Payment">Payment</MenuItem>
                <MenuItem value="Booking">Booking</MenuItem>
                <MenuItem value="Onboarding">Onboarding</MenuItem>
                <MenuItem value="Subscription">Subscription</MenuItem>
                <MenuItem value="Reports">Reports</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Alerts">Alerts</MenuItem>
              </Select>
            </FormControl>

            {templateType === 'email' && (
              <TextField
                fullWidth
                label="Email Subject"
                placeholder="e.g., Payment Reminder - {student_name}"
                sx={{ mb: 3 }}
              />
            )}

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Template Content"
              placeholder="Enter your message here. Use variables like {student_name}, {amount}, etc."
              sx={{ mb: 2 }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                💡 Tip: Click on "Variables" tab to see all available variables with examples
              </Typography>
            </Alert>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Auto-Send"
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" color="text.secondary">
              Note: Templates will be submitted for approval before going live.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />} onClick={handleSubmitTemplate}>
            Submit for Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete the template <strong>"{templateToDelete?.name}"</strong>?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The template will be permanently removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;
