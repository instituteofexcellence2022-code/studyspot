const express = require('express');
const router = express.Router();
const {
  asyncHandler
} = require('../middleware/errorHandler');

// Mock data for demonstration
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
router.get('/auto-staff', asyncHandler(async (req, res) => {
  // In real implementation, this would get the current logged-in user
  // or the first available staff member
  res.json(mockStaff);
}));

// Search students by multiple criteria
router.get('/search-students', asyncHandler(async (req, res) => {
  const {
    q
  } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }
  const query = q.toLowerCase();
  const results = mockStudents.filter(student => student.firstName.toLowerCase().includes(query) || student.lastName.toLowerCase().includes(query) || student.studentId.toLowerCase().includes(query) || student.email.toLowerCase().includes(query) || student.phone.includes(query));
  res.json(results);
}));

// Get student details
router.get('/student/:id', asyncHandler(async (req, res) => {
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
}));

// Create offline payment
router.post('/', asyncHandler(async (req, res) => {
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
}));

// Generate receipt
router.get('/:id/receipt', asyncHandler(async (req, res) => {
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
}));

// Send notification
router.post('/:id/notify', asyncHandler(async (req, res) => {
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

  // In real implementation, this would send actual notifications
  console.log(`Sending ${type} notification for payment ${id}`);
  res.json({
    message: `${type.toUpperCase()} notification sent successfully`
  });
}));

// Verify payment with photo
router.post('/:id/verify', asyncHandler(async (req, res) => {
  const {
    id
  } = req.params;
  const payment = mockPayments.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({
      message: 'Payment not found'
    });
  }

  // Update payment status
  payment.status = 'verified';
  payment.verifiedAt = new Date().toISOString();
  payment.photoUrl = 'uploaded-photo-url'; // In real implementation, this would be the uploaded photo URL

  res.json(payment);
}));

// Get payment history
router.get('/history', asyncHandler(async (req, res) => {
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
}));

// Get payment analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const {
    period
  } = req.query;

  // Mock analytics data
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
}));
module.exports = router;