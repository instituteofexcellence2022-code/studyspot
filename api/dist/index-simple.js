/**
 * Simple API Server for Referral & Discount System
 * Clean, minimal server that just works
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 STUDYSPOT - Simple API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// SIMPLE AUTH ROUTES
// ============================================

app.post('/api/auth/login', (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Simple test credentials
  if (email === 'admin@studyspot.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'admin@studyspot.com',
          name: 'Admin User',
          role: 'library_owner',
          tenant_id: 'default-tenant'
        },
        token: 'test-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});
app.post('/api/auth/register', (req, res) => {
  const {
    email,
    password,
    name,
    role
  } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: Date.now().toString(),
        email,
        name,
        role: role || 'library_owner',
        tenant_id: 'default-tenant'
      },
      token: 'test-token-123'
    }
  });
});
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'admin@studyspot.com',
      name: 'Admin User',
      role: 'library_owner',
      tenant_id: 'default-tenant'
    }
  });
});

// ============================================
// OFFLINE PAYMENTS ROUTES
// ============================================

// Mock data for offline payments
const mockStaff = {
  id: 'staff-1',
  firstName: 'John',
  lastName: 'Doe',
  role: 'library_staff',
  libraryId: 'lib-1',
  isActive: true
};
const mockStudents = [{
  id: 'student-1',
  studentId: 'STU001',
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@email.com',
  phone: '+91 9876543210',
  libraryId: 'lib-1',
  currentPlan: {
    id: 'plan-1',
    name: 'Monthly Plan',
    amount: 500,
    duration: 30
  },
  outstandingBalance: 0,
  lastPaymentDate: '2024-01-15'
}, {
  id: 'student-2',
  studentId: 'STU002',
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bob.smith@email.com',
  phone: '+91 9876543211',
  libraryId: 'lib-1',
  currentPlan: {
    id: 'plan-1',
    name: 'Monthly Plan',
    amount: 500,
    duration: 30
  },
  outstandingBalance: 250,
  lastPaymentDate: '2024-01-10'
}];
const mockPayments = [];

// Auto-select staff member
app.get('/api/offline-payments/auto-staff', (req, res) => {
  res.json(mockStaff);
});

// Search students by multiple criteria
app.get('/api/offline-payments/search-students', (req, res) => {
  const {
    q
  } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }
  const query = q.toLowerCase();
  const results = mockStudents.filter(student => student.firstName.toLowerCase().includes(query) || student.lastName.toLowerCase().includes(query) || student.studentId.toLowerCase().includes(query) || student.email.toLowerCase().includes(query) || student.phone.includes(query));
  res.json(results);
});

// Get student details
app.get('/api/offline-payments/student/:id', (req, res) => {
  const {
    id
  } = req.params;
  const student = mockStudents.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({
      message: 'Student not found'
    });
  }
  res.json(student);
});

// Create offline payment
app.post('/api/offline-payments', (req, res) => {
  const paymentData = req.body;
  const payment = {
    id: `payment-${Date.now()}`,
    ...paymentData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  };
  mockPayments.push(payment);
  res.status(201).json(payment);
});

// Generate receipt
app.get('/api/offline-payments/:id/receipt', (req, res) => {
  const {
    id
  } = req.params;
  const payment = mockPayments.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({
      message: 'Payment not found'
    });
  }
  const receipt = {
    id: payment.id,
    receiptNumber: payment.receiptNumber,
    studentName: payment.studentName,
    studentEmail: payment.studentEmail,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    receivedBy: payment.receivedByName,
    date: payment.createdAt,
    qrCode: `QR-${payment.receiptNumber}`,
    libraryName: 'StudySpot Library',
    libraryAddress: '123 Education Street, Learning City, LC 12345'
  };
  res.json(receipt);
});

// Send notification
app.post('/api/offline-payments/:id/notify', (req, res) => {
  const {
    id
  } = req.params;
  const {
    type
  } = req.body;
  const payment = mockPayments.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({
      message: 'Payment not found'
    });
  }
  console.log(`Sending ${type} notification for payment ${id}`);
  res.json({
    message: `${type.toUpperCase()} notification sent successfully`
  });
});

// Get payment history
app.get('/api/offline-payments/history', (req, res) => {
  const {
    studentId,
    staffId,
    dateFrom,
    dateTo,
    status
  } = req.query;
  let filteredPayments = [...mockPayments];
  if (studentId) {
    filteredPayments = filteredPayments.filter(p => p.studentId === studentId);
  }
  if (staffId) {
    filteredPayments = filteredPayments.filter(p => p.receivedBy === staffId);
  }
  if (status) {
    filteredPayments = filteredPayments.filter(p => p.status === status);
  }
  if (dateFrom) {
    filteredPayments = filteredPayments.filter(p => new Date(p.createdAt) >= new Date(dateFrom));
  }
  if (dateTo) {
    filteredPayments = filteredPayments.filter(p => new Date(p.createdAt) <= new Date(dateTo));
  }
  res.json(filteredPayments);
});

// Get payment analytics
app.get('/api/offline-payments/analytics', (req, res) => {
  const {
    period
  } = req.query;
  const analytics = {
    totalAmount: 15000,
    totalPayments: 30,
    averageAmount: 500,
    paymentMethods: [{
      method: 'cash',
      count: 20,
      amount: 10000
    }, {
      method: 'card',
      count: 8,
      amount: 4000
    }, {
      method: 'upi',
      count: 2,
      amount: 1000
    }],
    staffPerformance: [{
      staffName: 'John Doe',
      count: 15,
      amount: 7500
    }, {
      staffName: 'Jane Smith',
      count: 10,
      amount: 5000
    }, {
      staffName: 'Mike Johnson',
      count: 5,
      amount: 2500
    }]
  };
  res.json(analytics);
});

// ============================================
// REFERRAL & DISCOUNT ROUTES
// ============================================

// Mock data
const mockReferralPrograms = [{
  id: '1',
  name: 'Default Referral Program',
  description: 'Standard referral program for all users',
  referral_code: 'REFER2024',
  referrer_bonus_type: 'percentage',
  referrer_bonus_value: 10,
  referee_bonus_type: 'percentage',
  referee_bonus_value: 15,
  is_active: true,
  total_referrals: 25,
  successful_referrals: 18,
  total_referral_value: 4500
}];
const mockDiscountCoupons = [{
  id: '1',
  code: 'WELCOME10',
  name: 'Welcome Discount',
  description: '10% off for new users',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_amount: 100,
  usage_count: 15,
  usage_limit: 100,
  is_active: true
}, {
  id: '2',
  code: 'STUDENT20',
  name: 'Student Special',
  description: '20% off for students',
  discount_type: 'percentage',
  discount_value: 20,
  min_order_amount: 200,
  usage_count: 8,
  usage_limit: 50,
  is_active: true
}];
const mockCampaigns = [{
  id: '1',
  name: 'Summer Study Campaign',
  description: 'Promote study sessions during summer',
  campaign_type: 'seasonal',
  target_audience: 'all',
  budget: 50000,
  spent_amount: 15000,
  expected_reach: 10000,
  actual_reach: 3500,
  expected_conversions: 1000,
  actual_conversions: 450,
  conversion_rate: 12.9,
  roi: 85.5,
  status: 'active'
}];

// Referral Programs
app.get('/api/referral-discount/referral-programs', (req, res) => {
  res.json({
    success: true,
    data: mockReferralPrograms,
    count: mockReferralPrograms.length
  });
});
app.post('/api/referral-discount/referral-programs', (req, res) => {
  const newProgram = {
    id: Date.now().toString(),
    ...req.body,
    is_active: true,
    total_referrals: 0,
    successful_referrals: 0,
    total_referral_value: 0
  };
  mockReferralPrograms.push(newProgram);
  res.status(201).json({
    success: true,
    data: newProgram
  });
});

// Discount Coupons
app.get('/api/referral-discount/coupons', (req, res) => {
  res.json({
    success: true,
    data: mockDiscountCoupons,
    count: mockDiscountCoupons.length
  });
});
app.post('/api/referral-discount/coupons', (req, res) => {
  const newCoupon = {
    id: Date.now().toString(),
    ...req.body,
    usage_count: 0,
    is_active: true
  };
  mockDiscountCoupons.push(newCoupon);
  res.status(201).json({
    success: true,
    data: newCoupon
  });
});

// Promotional Campaigns
app.get('/api/referral-discount/campaigns', (req, res) => {
  res.json({
    success: true,
    data: mockCampaigns,
    count: mockCampaigns.length
  });
});
app.post('/api/referral-discount/campaigns', (req, res) => {
  const newCampaign = {
    id: Date.now().toString(),
    ...req.body,
    spent_amount: 0,
    actual_reach: 0,
    actual_conversions: 0,
    conversion_rate: 0,
    roi: 0,
    status: 'draft'
  };
  mockCampaigns.push(newCampaign);
  res.status(201).json({
    success: true,
    data: newCampaign
  });
});

// Analytics
app.get('/api/referral-discount/analytics/referrals', (req, res) => {
  res.json({
    success: true,
    data: {
      total_referrals: 25,
      successful_referrals: 18,
      pending_referrals: 7,
      total_referral_value: 4500,
      total_bonus_paid: 1200,
      avg_referral_value: 180,
      unique_referrers: 12
    }
  });
});
app.get('/api/referral-discount/analytics/discounts', (req, res) => {
  res.json({
    success: true,
    data: {
      total_redemptions: 23,
      unique_coupons_used: 2,
      unique_users: 18,
      total_discount_given: 850,
      total_original_amount: 4250,
      total_final_amount: 3400,
      avg_discount_per_redemption: 37
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🎓 STUDYSPOT - Simple API Server');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/`);
  console.log('========================================');
});
module.exports = app;