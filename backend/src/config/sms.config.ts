// ============================================
// SMS CONFIGURATION
// MSG91 + BSNL DLT (Approved)
// ============================================

import dotenv from 'dotenv';

dotenv.config();

export const SMS_CONFIG = {
  provider: 'msg91',
  
  // MSG91 Configuration
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY || '',
    senderId: process.env.MSG91_SENDER_ID || 'STDYSP',
    route: process.env.MSG91_ROUTE || '4', // 4 = Transactional
    country: '91', // India
    apiUrl: 'https://api.msg91.com/api',
  },
  
  // BSNL DLT Configuration
  dlt: {
    entityId: process.env.DLT_ENTITY_ID || '',
    registered: true,
    provider: 'BSNL',
  },
  
  // Approved BSNL DLT Templates
  templates: {
    otp: {
      id: process.env.DLT_TEMPLATE_OTP_ID || '',
      text: 'Your OTP for StudySpot is {#var#}. Valid for 10 minutes. Do not share with anyone.',
      variables: 1,
    },
    welcome: {
      id: process.env.DLT_TEMPLATE_WELCOME_ID || '',
      text: 'Welcome to StudySpot! Your registration is successful. Student ID: {#var#}',
      variables: 1,
    },
    payment_success: {
      id: process.env.DLT_TEMPLATE_PAYMENT_SUCCESS_ID || '',
      text: 'Payment of Rs.{#var#} received successfully. Receipt: {#var#}. Thank you!',
      variables: 2,
    },
    payment_reminder: {
      id: process.env.DLT_TEMPLATE_PAYMENT_REMINDER_ID || '',
      text: 'Payment reminder: Rs.{#var#} due on {#var#}. Please pay to continue services.',
      variables: 2,
    },
    booking_confirmed: {
      id: process.env.DLT_TEMPLATE_BOOKING_ID || '',
      text: 'Booking confirmed! Seat: {#var#}, Date: {#var#}, Library: {#var#}',
      variables: 3,
    },
    subscription_expiry: {
      id: process.env.DLT_TEMPLATE_EXPIRY_ID || '',
      text: 'Your subscription expires on {#var#}. Renew now to continue services.',
      variables: 1,
    },
  },
};

