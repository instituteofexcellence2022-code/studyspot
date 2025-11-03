// ============================================
// PAYMENT MANAGEMENT - API SERVICE
// ============================================

import { ApiResponse } from '../../types';
import {
  PaymentTransaction,
  Settlement,
  PaymentAnalytics,
  PendingSettlement,
  PaymentFilters,
  GatewayConfiguration,
  FeeStructure,
  SettlementConfiguration,
  PaymentDashboard,
  InitiateSettlementData,
  ProcessRefundData,
} from '../../modules/payments/types';

// Mock Mode Toggle
const MOCK_MODE = true;

// ============================================
// FEE CALCULATION HELPERS
// ============================================

const GATEWAY_CHARGES_PERCENT = 2; // 2%
const GATEWAY_CHARGES_FIXED = 2; // ₹2
const PLATFORM_FEE_PERCENT = 3; // 3%
const PLATFORM_FEE_FLAT = 0; // ₹0 (not used by default)

// Fee configuration (can be updated via settings)
let currentFeeConfig = {
  platformFeeType: 'percentage' as 'percentage' | 'flat',
  platformFeePercent: PLATFORM_FEE_PERCENT,
  platformFeeFlat: PLATFORM_FEE_FLAT,
  gatewayChargesType: 'percentage' as 'percentage' | 'flat',
  gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
  gatewayChargesFixed: GATEWAY_CHARGES_FIXED,
};

const calculateFees = (amountPaid: number) => {
  // Calculate gateway charges based on type
  let gatewayCharges = 0;
  if (currentFeeConfig.gatewayChargesType === 'percentage') {
    gatewayCharges = (amountPaid * currentFeeConfig.gatewayChargesPercent) / 100 + currentFeeConfig.gatewayChargesFixed;
  } else {
    gatewayCharges = currentFeeConfig.gatewayChargesFixed;
  }
  
  // Calculate platform fee based on type
  let platformFee = 0;
  if (currentFeeConfig.platformFeeType === 'percentage') {
    platformFee = (amountPaid * currentFeeConfig.platformFeePercent) / 100;
  } else {
    platformFee = currentFeeConfig.platformFeeFlat;
  }
  
  const netToLibrary = amountPaid - gatewayCharges - platformFee;
  
  return {
    gatewayCharges: Math.round(gatewayCharges * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    netToLibrary: Math.round(netToLibrary * 100) / 100,
  };
};

// ============================================
// MOCK DATA - LIBRARIES
// ============================================

const MOCK_LIBRARIES = [
  {
    id: 'lib-1',
    name: 'Central Library',
    accountHolder: 'Central Library Pvt Ltd',
    accountNumber: '1234567890',
    ifsc: 'SBIN0001234',
    upiId: 'centrallibrary@paytm',
  },
  {
    id: 'lib-2',
    name: 'Smart Study Center',
    accountHolder: 'Smart Study Center',
    accountNumber: '9876543210',
    ifsc: 'HDFC0002345',
    upiId: 'smartstudy@oksbi',
  },
  {
    id: 'lib-3',
    name: 'Elite Coaching',
    accountHolder: 'Elite Coaching Institute',
    accountNumber: '5555666677',
    ifsc: 'ICIC0003456',
    upiId: 'elitecoaching@paytm',
  },
  {
    id: 'lib-4',
    name: 'Knowledge Hub',
    accountHolder: 'Knowledge Hub Learning',
    accountNumber: '1111222233',
    ifsc: 'AXIS0004567',
    upiId: 'knowledgehub@ybl',
  },
  {
    id: 'lib-5',
    name: 'Study Point',
    accountHolder: 'Study Point Academy',
    accountNumber: '9999888877',
    ifsc: 'SBIN0005678',
    upiId: 'studypoint@paytm',
  },
];

// ============================================
// MOCK DATA - STUDENTS
// ============================================

const MOCK_STUDENTS = [
  { id: 'std-1', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91-9876543210' },
  { id: 'std-2', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91-9876543211' },
  { id: 'std-3', name: 'Amit Patel', email: 'amit@example.com', phone: '+91-9876543212' },
  { id: 'std-4', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91-9876543213' },
  { id: 'std-5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91-9876543214' },
  { id: 'std-6', name: 'Anita Desai', email: 'anita@example.com', phone: '+91-9876543215' },
  { id: 'std-7', name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91-9876543216' },
  { id: 'std-8', name: 'Deepak Joshi', email: 'deepak@example.com', phone: '+91-9876543217' },
  { id: 'std-9', name: 'Kavita Nair', email: 'kavita@example.com', phone: '+91-9876543218' },
  { id: 'std-10', name: 'Suresh Iyer', email: 'suresh@example.com', phone: '+91-9876543219' },
  { id: 'std-11', name: 'Meera Kapoor', email: 'meera@example.com', phone: '+91-9876543220' },
  { id: 'std-12', name: 'Arjun Malhotra', email: 'arjun@example.com', phone: '+91-9876543221' },
  { id: 'std-13', name: 'Pooja Gupta', email: 'pooja@example.com', phone: '+91-9876543222' },
  { id: 'std-14', name: 'Sanjay Mehta', email: 'sanjay@example.com', phone: '+91-9876543223' },
  { id: 'std-15', name: 'Neha Agarwal', email: 'neha@example.com', phone: '+91-9876543224' },
];

// ============================================
// MOCK DATA - PAYMENT TRANSACTIONS
// ============================================

const generateMockTransactions = (): PaymentTransaction[] => {
  const transactions: PaymentTransaction[] = [];
  let transactionCounter = 1;
  
  // Generate 50 transactions with various scenarios
  const amounts = [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000];
  const methods: Array<'upi' | 'card' | 'netbanking' | 'wallet'> = ['upi', 'card', 'netbanking', 'wallet'];
  const providers = {
    upi: ['PhonePe', 'Google Pay', 'Paytm', 'BHIM'],
    card: ['Razorpay', 'Razorpay', 'Razorpay'],
    netbanking: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'],
    wallet: ['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay'],
  };
  
  // Success transactions (40)
  for (let i = 0; i < 40; i++) {
    const student = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
    const library = MOCK_LIBRARIES[i % MOCK_LIBRARIES.length];
    const amount = amounts[i % amounts.length];
    const fees = calculateFees(amount);
    const method = methods[i % methods.length];
    const provider = providers[method][Math.floor(Math.random() * providers[method].length)];
    
    const daysAgo = Math.floor(i / 2); // Spread over 20 days
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
    
    // Determine settlement status based on age
    let settlementStatus: 'pending' | 'processing' | 'completed' = 'completed';
    let settlementDate: string | undefined = undefined;
    let settlementId: string | undefined = undefined;
    
    if (daysAgo < 3) {
      settlementStatus = 'pending';
    } else if (daysAgo < 5) {
      settlementStatus = 'processing';
    } else {
      settlementStatus = 'completed';
      settlementDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      settlementId = `SET-2024-${String(Math.floor(i / 5) + 1).padStart(3, '0')}`;
    }
    
    transactions.push({
      id: `pay-${transactionCounter}`,
      transactionId: `PAY-2024-${String(transactionCounter).padStart(6, '0')}`,
      gatewayTransactionId: `RZP${Date.now()}${transactionCounter}`,
      
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      
      libraryId: library.id,
      libraryName: library.name,
      libraryAccountNumber: library.accountNumber,
      libraryUpiId: library.upiId,
      libraryIfscCode: library.ifsc,
      
      amountPaid: amount,
      gatewayCharges: fees.gatewayCharges,
      gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
      platformFee: fees.platformFee,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      netToLibrary: fees.netToLibrary,
      
      paymentMethod: method,
      paymentProvider: provider,
      cardLast4: method === 'card' ? String(Math.floor(Math.random() * 10000)).padStart(4, '0') : undefined,
      cardType: method === 'card' ? (Math.random() > 0.5 ? 'Visa' : 'Mastercard') : undefined,
      bankName: method === 'netbanking' ? provider : undefined,
      upiId: method === 'upi' ? `${student.name.toLowerCase().replace(' ', '')}@${provider.toLowerCase().replace(' ', '')}` : undefined,
      
      status: 'success',
      settlementStatus,
      
      gatewayStatus: 'captured',
      gatewayResponseCode: '200',
      gatewayResponseMessage: 'Payment successful',
      
      settlementId,
      settlementDate,
      settlementMethod: settlementStatus === 'completed' ? (Math.random() > 0.5 ? 'bank_transfer' : 'upi') : undefined,
      settlementReference: settlementStatus === 'completed' ? `UTR${Date.now()}${i}` : undefined,
      
      purpose: i % 3 === 0 ? 'Monthly Library Fee' : i % 3 === 1 ? 'Seat Booking Fee' : 'Registration Fee',
      description: `Payment for ${i % 3 === 0 ? 'monthly subscription' : i % 3 === 1 ? 'seat booking' : 'new registration'}`,
      receiptUrl: `/receipts/${transactionCounter}.pdf`,
      
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
    
    transactionCounter++;
  }
  
  // Pending transactions (5)
  for (let i = 0; i < 5; i++) {
    const student = MOCK_STUDENTS[i];
    const library = MOCK_LIBRARIES[i % MOCK_LIBRARIES.length];
    const amount = amounts[i % amounts.length];
    const fees = calculateFees(amount);
    const method = methods[i % methods.length];
    const provider = providers[method][Math.floor(Math.random() * providers[method].length)];
    
    const hoursAgo = i + 1;
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    transactions.push({
      id: `pay-${transactionCounter}`,
      transactionId: `PAY-2024-${String(transactionCounter).padStart(6, '0')}`,
      gatewayTransactionId: `RZP${Date.now()}${transactionCounter}`,
      
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      
      libraryId: library.id,
      libraryName: library.name,
      libraryAccountNumber: library.accountNumber,
      libraryUpiId: library.upiId,
      libraryIfscCode: library.ifsc,
      
      amountPaid: amount,
      gatewayCharges: fees.gatewayCharges,
      gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
      platformFee: fees.platformFee,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      netToLibrary: fees.netToLibrary,
      
      paymentMethod: method,
      paymentProvider: provider,
      
      status: 'pending',
      settlementStatus: 'pending',
      
      gatewayStatus: 'authorized',
      gatewayResponseCode: '100',
      gatewayResponseMessage: 'Payment authorized, awaiting capture',
      
      purpose: 'Monthly Library Fee',
      description: 'Payment pending confirmation',
      
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
    
    transactionCounter++;
  }
  
  // Failed transactions (3)
  for (let i = 0; i < 3; i++) {
    const student = MOCK_STUDENTS[i + 5];
    const library = MOCK_LIBRARIES[i % MOCK_LIBRARIES.length];
    const amount = amounts[i % amounts.length];
    const fees = calculateFees(amount);
    const method = methods[i % methods.length];
    const provider = providers[method][Math.floor(Math.random() * providers[method].length)];
    
    const hoursAgo = (i + 1) * 2;
    const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    const failureReasons = [
      'Insufficient funds',
      'Payment declined by bank',
      'Transaction timeout',
    ];
    
    transactions.push({
      id: `pay-${transactionCounter}`,
      transactionId: `PAY-2024-${String(transactionCounter).padStart(6, '0')}`,
      gatewayTransactionId: `RZP${Date.now()}${transactionCounter}`,
      
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      
      libraryId: library.id,
      libraryName: library.name,
      libraryAccountNumber: library.accountNumber,
      libraryUpiId: library.upiId,
      libraryIfscCode: library.ifsc,
      
      amountPaid: amount,
      gatewayCharges: 0,
      gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
      platformFee: 0,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      netToLibrary: 0,
      
      paymentMethod: method,
      paymentProvider: provider,
      
      status: 'failed',
      settlementStatus: 'pending',
      
      gatewayStatus: 'failed',
      gatewayResponseCode: '400',
      gatewayResponseMessage: failureReasons[i],
      
      purpose: 'Monthly Library Fee',
      description: `Payment failed: ${failureReasons[i]}`,
      
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
    
    transactionCounter++;
  }
  
  // Refunded transactions (2)
  for (let i = 0; i < 2; i++) {
    const student = MOCK_STUDENTS[i + 8];
    const library = MOCK_LIBRARIES[i % MOCK_LIBRARIES.length];
    const amount = amounts[i % amounts.length];
    const fees = calculateFees(amount);
    const method = methods[i % methods.length];
    const provider = providers[method][Math.floor(Math.random() * providers[method].length)];
    
    const daysAgo = 10 + i;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const refundedAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: `pay-${transactionCounter}`,
      transactionId: `PAY-2024-${String(transactionCounter).padStart(6, '0')}`,
      gatewayTransactionId: `RZP${Date.now()}${transactionCounter}`,
      
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      
      libraryId: library.id,
      libraryName: library.name,
      libraryAccountNumber: library.accountNumber,
      libraryUpiId: library.upiId,
      libraryIfscCode: library.ifsc,
      
      amountPaid: amount,
      gatewayCharges: fees.gatewayCharges,
      gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
      platformFee: fees.platformFee,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      netToLibrary: 0, // Refunded, so net is 0
      
      paymentMethod: method,
      paymentProvider: provider,
      
      status: 'refunded',
      settlementStatus: 'pending',
      
      gatewayStatus: 'refunded',
      gatewayResponseCode: '200',
      gatewayResponseMessage: 'Payment refunded',
      
      refundAmount: amount,
      refundReason: i === 0 ? 'Duplicate payment' : 'Service not provided',
      refundedAt: refundedAt.toISOString(),
      
      purpose: 'Monthly Library Fee',
      description: 'Payment refunded to student',
      
      createdAt: createdAt.toISOString(),
      updatedAt: refundedAt.toISOString(),
    });
    
    transactionCounter++;
  }
  
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const ALL_TRANSACTIONS = generateMockTransactions();

// ============================================
// MOCK DATA - SETTLEMENTS
// ============================================

const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: 'set-1',
    settlementId: 'SET-2024-001',
    libraryId: 'lib-1',
    libraryName: 'Central Library',
    accountHolderName: 'Central Library Pvt Ltd',
    bankAccountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
    transactionIds: ['pay-1', 'pay-6', 'pay-11', 'pay-16', 'pay-21'],
    transactionCount: 5,
    totalAmount: 10000,
    totalGatewayCharges: 210,
    totalPlatformFees: 300,
    netPayable: 9490,
    settlementMethod: 'bank_transfer',
    settlementReference: 'UTR202410310001',
    status: 'completed',
    transferProof: '/proofs/set-001.pdf',
    notes: 'Settled via NEFT',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    initiatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: 'admin-1',
    processedByName: 'Admin User',
  },
  {
    id: 'set-2',
    settlementId: 'SET-2024-002',
    libraryId: 'lib-2',
    libraryName: 'Smart Study Center',
    accountHolderName: 'Smart Study Center',
    upiId: 'smartstudy@oksbi',
    transactionIds: ['pay-2', 'pay-7', 'pay-12', 'pay-17'],
    transactionCount: 4,
    totalAmount: 8000,
    totalGatewayCharges: 168,
    totalPlatformFees: 240,
    netPayable: 7592,
    settlementMethod: 'upi',
    settlementReference: 'UPI202410310002',
    status: 'completed',
    notes: 'Settled via UPI',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    initiatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    processedBy: 'admin-1',
    processedByName: 'Admin User',
  },
];

// ============================================
// API METHODS
// ============================================

export const paymentService = {
  // Get all transactions with filters
  async getAllTransactions(filters?: Partial<PaymentFilters>): Promise<ApiResponse<PaymentTransaction[]>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filtered = [...ALL_TRANSACTIONS];
      
      if (filters) {
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(t => t.status === filters.status);
        }
        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
          filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
        }
        if (filters.settlementStatus && filters.settlementStatus !== 'all') {
          filtered = filtered.filter(t => t.settlementStatus === filters.settlementStatus);
        }
        if (filters.libraryId && filters.libraryId !== 'all') {
          filtered = filtered.filter(t => t.libraryId === filters.libraryId);
        }
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(t =>
            t.transactionId.toLowerCase().includes(query) ||
            t.studentName.toLowerCase().includes(query) ||
            t.libraryName.toLowerCase().includes(query)
          );
        }
        if (filters.minAmount) {
          filtered = filtered.filter(t => t.amountPaid >= filters.minAmount!);
        }
        if (filters.maxAmount) {
          filtered = filtered.filter(t => t.amountPaid <= filters.maxAmount!);
        }
      }
      
      return { success: true, data: filtered };
    }
    
    throw new Error('API not implemented');
  },

  // Get transaction by ID
  async getTransactionById(id: string): Promise<ApiResponse<PaymentTransaction>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const transaction = ALL_TRANSACTIONS.find(t => t.id === id);
      if (!transaction) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found',
            statusCode: 404,
          },
        };
      }
      
      return { success: true, data: transaction };
    }
    
    throw new Error('API not implemented');
  },

  // Get pending settlements grouped by library
  async getPendingSettlements(): Promise<ApiResponse<PendingSettlement[]>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pendingTransactions = ALL_TRANSACTIONS.filter(
        t => t.status === 'success' && t.settlementStatus === 'pending'
      );
      
      const grouped = new Map<string, PendingSettlement>();
      
      pendingTransactions.forEach(transaction => {
        if (!grouped.has(transaction.libraryId)) {
          const library = MOCK_LIBRARIES.find(l => l.id === transaction.libraryId)!;
          grouped.set(transaction.libraryId, {
            libraryId: transaction.libraryId,
            libraryName: transaction.libraryName,
            accountHolderName: library.accountHolder,
            bankAccountNumber: library.accountNumber,
            ifscCode: library.ifsc,
            upiId: library.upiId,
            transactionCount: 0,
            totalAmount: 0,
            gatewayCharges: 0,
            platformFees: 0,
            netPayable: 0,
            oldestTransactionDate: transaction.createdAt,
            transactions: [],
          });
        }
        
        const settlement = grouped.get(transaction.libraryId)!;
        settlement.transactionCount++;
        settlement.totalAmount += transaction.amountPaid;
        settlement.gatewayCharges += transaction.gatewayCharges;
        settlement.platformFees += transaction.platformFee;
        settlement.netPayable += transaction.netToLibrary;
        settlement.transactions.push(transaction);
        
        if (new Date(transaction.createdAt) < new Date(settlement.oldestTransactionDate)) {
          settlement.oldestTransactionDate = transaction.createdAt;
        }
      });
      
      return { success: true, data: Array.from(grouped.values()) };
    }
    
    throw new Error('API not implemented');
  },

  // Get completed settlements
  async getCompletedSettlements(): Promise<ApiResponse<Settlement[]>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, data: MOCK_SETTLEMENTS };
    }
    
    throw new Error('API not implemented');
  },

  // Get failed transactions
  async getFailedTransactions(): Promise<ApiResponse<PaymentTransaction[]>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const failed = ALL_TRANSACTIONS.filter(t => t.status === 'failed');
      return { success: true, data: failed };
    }
    
    throw new Error('API not implemented');
  },

  // Get payment analytics
  async getAnalytics(): Promise<ApiResponse<PaymentAnalytics>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const successTransactions = ALL_TRANSACTIONS.filter(t => t.status === 'success');
      const pendingSettlements = ALL_TRANSACTIONS.filter(
        t => t.status === 'success' && t.settlementStatus === 'pending'
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = ALL_TRANSACTIONS.filter(
        t => new Date(t.createdAt) >= today
      );
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const thisMonthTransactions = successTransactions.filter(
        t => new Date(t.createdAt) >= thisMonth
      );
      
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthTransactions = successTransactions.filter(
        t => new Date(t.createdAt) >= lastMonth && new Date(t.createdAt) < thisMonth
      );
      
      const totalAmount = successTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
      const totalGatewayCharges = successTransactions.reduce((sum, t) => sum + t.gatewayCharges, 0);
      const totalPlatformFees = successTransactions.reduce((sum, t) => sum + t.platformFee, 0);
      const totalSettled = successTransactions.reduce((sum, t) => sum + t.netToLibrary, 0);
      const pendingAmount = pendingSettlements.reduce((sum, t) => sum + t.netToLibrary, 0);
      
      const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => sum + t.platformFee, 0);
      const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + t.platformFee, 0);
      const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      
      // Payment methods distribution
      const methodsMap = new Map<string, { count: number; amount: number }>();
      successTransactions.forEach(t => {
        const method = t.paymentMethod;
        if (!methodsMap.has(method)) {
          methodsMap.set(method, { count: 0, amount: 0 });
        }
        const data = methodsMap.get(method)!;
        data.count++;
        data.amount += t.amountPaid;
      });
      
      const paymentMethods = Array.from(methodsMap.entries()).map(([method, data]) => ({
        method: method.toUpperCase(),
        count: data.count,
        amount: data.amount,
        percentage: (data.count / successTransactions.length) * 100,
      }));
      
      // Transaction status distribution
      const statusMap = new Map<string, { count: number; amount: number }>();
      ALL_TRANSACTIONS.forEach(t => {
        if (!statusMap.has(t.status)) {
          statusMap.set(t.status, { count: 0, amount: 0 });
        }
        const data = statusMap.get(t.status)!;
        data.count++;
        data.amount += t.amountPaid;
      });
      
      const transactionStatus = Array.from(statusMap.entries()).map(([status, data]) => ({
        status: status.toUpperCase(),
        count: data.count,
        amount: data.amount,
        percentage: (data.count / ALL_TRANSACTIONS.length) * 100,
      }));
      
      // Top libraries
      const librariesMap = new Map<string, { transactions: number; amount: number; netPayable: number }>();
      successTransactions.forEach(t => {
        if (!librariesMap.has(t.libraryId)) {
          librariesMap.set(t.libraryId, { transactions: 0, amount: 0, netPayable: 0 });
        }
        const data = librariesMap.get(t.libraryId)!;
        data.transactions++;
        data.amount += t.amountPaid;
        data.netPayable += t.netToLibrary;
      });
      
      const topLibraries = Array.from(librariesMap.entries())
        .map(([libraryId, data]) => {
          const library = MOCK_LIBRARIES.find(l => l.id === libraryId)!;
          return {
            libraryId,
            libraryName: library.name,
            transactions: data.transactions,
            amount: data.amount,
            netPayable: data.netPayable,
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);
      
      // Trend data (last 30 days)
      const trendData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayTransactions = successTransactions.filter(
          t => new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate
        );
        
        trendData.push({
          date: date.toISOString().split('T')[0],
          processed: dayTransactions.reduce((sum, t) => sum + t.amountPaid, 0),
          gatewayCharges: dayTransactions.reduce((sum, t) => sum + t.gatewayCharges, 0),
          platformFees: dayTransactions.reduce((sum, t) => sum + t.platformFee, 0),
          netToLibraries: dayTransactions.reduce((sum, t) => sum + t.netToLibrary, 0),
        });
      }
      
      // Hourly pattern
      const hourlyMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, 0);
      }
      ALL_TRANSACTIONS.forEach(t => {
        const hour = new Date(t.createdAt).getHours();
        hourlyMap.set(hour, hourlyMap.get(hour)! + 1);
      });
      
      const hourlyPattern = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
        hour,
        count,
      }));
      
      const analytics: PaymentAnalytics = {
        summary: {
          totalTransactions: ALL_TRANSACTIONS.length,
          totalAmountProcessed: totalAmount,
          totalGatewayCharges,
          totalPlatformFees,
          totalSettledToLibraries: totalSettled,
          pendingSettlements: pendingSettlements.length,
          pendingSettlementAmount: pendingAmount,
          successRate: (successTransactions.length / ALL_TRANSACTIONS.length) * 100,
          todayTransactions: todayTransactions.length,
          todayAmount: todayTransactions.reduce((sum, t) => sum + t.amountPaid, 0),
        },
        revenue: {
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth,
          netProfit: totalPlatformFees - totalGatewayCharges,
          averageTransactionValue: totalAmount / successTransactions.length,
        },
        paymentMethods,
        transactionStatus,
        topLibraries,
        trendData,
        hourlyPattern,
      };
      
      return { success: true, data: analytics };
    }
    
    throw new Error('API not implemented');
  },

  // Initiate settlement
  async initiateSettlement(data: InitiateSettlementData): Promise<ApiResponse<Settlement>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transactions = ALL_TRANSACTIONS.filter(t => data.transactionIds.includes(t.id));
      const library = MOCK_LIBRARIES.find(l => l.id === data.libraryId)!;
      
      const settlement: Settlement = {
        id: `set-${Date.now()}`,
        settlementId: `SET-2024-${String(MOCK_SETTLEMENTS.length + 1).padStart(3, '0')}`,
        libraryId: data.libraryId,
        libraryName: library.name,
        accountHolderName: library.accountHolder,
        bankAccountNumber: library.accountNumber,
        ifscCode: library.ifsc,
        upiId: library.upiId,
        transactionIds: data.transactionIds,
        transactionCount: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amountPaid, 0),
        totalGatewayCharges: transactions.reduce((sum, t) => sum + t.gatewayCharges, 0),
        totalPlatformFees: transactions.reduce((sum, t) => sum + t.platformFee, 0),
        netPayable: transactions.reduce((sum, t) => sum + t.netToLibrary, 0),
        settlementMethod: data.settlementMethod,
        settlementReference: data.settlementReference || `REF-${Date.now()}`,
        status: 'processing',
        notes: data.notes,
        createdAt: new Date().toISOString(),
        initiatedAt: new Date().toISOString(),
        processedBy: 'admin-1',
        processedByName: 'Admin User',
      };
      
      return { success: true, data: settlement };
    }
    
    throw new Error('API not implemented');
  },

  // Process refund
  async processRefund(data: ProcessRefundData): Promise<ApiResponse<PaymentTransaction>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transaction = ALL_TRANSACTIONS.find(t => t.transactionId === data.transactionId);
      if (!transaction) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found',
            statusCode: 404,
          },
        };
      }
      
      const refundedTransaction: PaymentTransaction = {
        ...transaction,
        status: 'refunded',
        refundAmount: data.amount,
        refundReason: data.reason,
        refundedAt: new Date().toISOString(),
        notes: data.notes,
        updatedAt: new Date().toISOString(),
      };
      
      return { success: true, data: refundedTransaction };
    }
    
    throw new Error('API not implemented');
  },

  // Get gateway configuration
  async getGatewayConfig(): Promise<ApiResponse<GatewayConfiguration>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const config: GatewayConfiguration = {
        id: 'gw-1',
        name: 'Razorpay',
        isActive: true,
        isTestMode: false,
        apiKey: 'rzp_live_***************',
        apiSecret: '***************',
        webhookUrl: 'https://studyspot.com/api/webhooks/razorpay',
        merchantId: 'MERCHANT123',
        gatewayChargesPercent: GATEWAY_CHARGES_PERCENT,
        gatewayChargesFixed: GATEWAY_CHARGES_FIXED,
      };
      
      return { success: true, data: config };
    }
    
    throw new Error('API not implemented');
  },

  // Get fee structure
  async getFeeStructure(): Promise<ApiResponse<FeeStructure>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const feeStructure: FeeStructure = {
        id: 'fee-1',
        platformFeeType: currentFeeConfig.platformFeeType,
        platformFeePercent: currentFeeConfig.platformFeePercent,
        platformFeeFlat: currentFeeConfig.platformFeeFlat,
        gatewayChargesType: currentFeeConfig.gatewayChargesType,
        gatewayChargesPercent: currentFeeConfig.gatewayChargesPercent,
        gatewayChargesFixed: currentFeeConfig.gatewayChargesFixed,
        minimumTransactionAmount: 100,
        maximumTransactionAmount: 100000,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-1',
      };
      
      return { success: true, data: feeStructure };
    }
    
    throw new Error('API not implemented');
  },

  // Update fee structure
  async updateFeeStructure(feeStructure: Partial<FeeStructure>): Promise<ApiResponse<FeeStructure>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the current fee configuration
      if (feeStructure.platformFeeType) currentFeeConfig.platformFeeType = feeStructure.platformFeeType;
      if (feeStructure.platformFeePercent !== undefined) currentFeeConfig.platformFeePercent = feeStructure.platformFeePercent;
      if (feeStructure.platformFeeFlat !== undefined) currentFeeConfig.platformFeeFlat = feeStructure.platformFeeFlat;
      if (feeStructure.gatewayChargesType) currentFeeConfig.gatewayChargesType = feeStructure.gatewayChargesType;
      if (feeStructure.gatewayChargesPercent !== undefined) currentFeeConfig.gatewayChargesPercent = feeStructure.gatewayChargesPercent;
      if (feeStructure.gatewayChargesFixed !== undefined) currentFeeConfig.gatewayChargesFixed = feeStructure.gatewayChargesFixed;
      
      const updatedFeeStructure: FeeStructure = {
        id: 'fee-1',
        platformFeeType: currentFeeConfig.platformFeeType,
        platformFeePercent: currentFeeConfig.platformFeePercent,
        platformFeeFlat: currentFeeConfig.platformFeeFlat,
        gatewayChargesType: currentFeeConfig.gatewayChargesType,
        gatewayChargesPercent: currentFeeConfig.gatewayChargesPercent,
        gatewayChargesFixed: currentFeeConfig.gatewayChargesFixed,
        minimumTransactionAmount: 100,
        maximumTransactionAmount: 100000,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-1',
      };
      
      return { success: true, data: updatedFeeStructure };
    }
    
    throw new Error('API not implemented');
  },

  // Get settlement configuration
  async getSettlementConfig(): Promise<ApiResponse<SettlementConfiguration>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const config: SettlementConfiguration = {
        id: 'set-config-1',
        // Settlement Mode
        settlementMode: 'hybrid',
        autoSettlement: true,
        // Automated Settlement Settings
        settlementFrequency: 'weekly',
        settlementDay: 5, // Friday
        settlementTime: '18:00',
        minimumSettlementAmount: 1000,
        // Manual Approval Settings
        requireManualApproval: true,
        requireManagerApproval: false,
        approvalThresholdAmount: 50000, // Settlements above ₹50,000 require manual approval
        // Verification & Notifications
        requireBankVerification: true,
        notifyLibraryOnSettlement: true,
        notifyAdminOnPendingApproval: true,
        // Auto-retry Failed Settlements
        autoRetryFailedSettlements: true,
        maxRetryAttempts: 3,
        retryIntervalHours: 24,
        // Metadata
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-1',
      };
      
      return { success: true, data: config };
    }
    
    throw new Error('API not implemented');
  },

  // Update settlement configuration
  async updateSettlementConfig(config: Partial<SettlementConfiguration>): Promise<ApiResponse<SettlementConfiguration>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would update the database
      const updatedConfig: SettlementConfiguration = {
        id: 'set-config-1',
        settlementMode: config.settlementMode || 'hybrid',
        autoSettlement: config.autoSettlement !== undefined ? config.autoSettlement : true,
        settlementFrequency: config.settlementFrequency || 'weekly',
        settlementDay: config.settlementDay || 5,
        settlementTime: config.settlementTime || '18:00',
        minimumSettlementAmount: config.minimumSettlementAmount || 1000,
        requireManualApproval: config.requireManualApproval !== undefined ? config.requireManualApproval : true,
        requireManagerApproval: config.requireManagerApproval !== undefined ? config.requireManagerApproval : false,
        approvalThresholdAmount: config.approvalThresholdAmount || 50000,
        requireBankVerification: config.requireBankVerification !== undefined ? config.requireBankVerification : true,
        notifyLibraryOnSettlement: config.notifyLibraryOnSettlement !== undefined ? config.notifyLibraryOnSettlement : true,
        notifyAdminOnPendingApproval: config.notifyAdminOnPendingApproval !== undefined ? config.notifyAdminOnPendingApproval : true,
        autoRetryFailedSettlements: config.autoRetryFailedSettlements !== undefined ? config.autoRetryFailedSettlements : true,
        maxRetryAttempts: config.maxRetryAttempts || 3,
        retryIntervalHours: config.retryIntervalHours || 24,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-1',
      };
      
      return { success: true, data: updatedConfig };
    }
    
    throw new Error('API not implemented');
  },

  // Get libraries list
  async getLibraries(): Promise<ApiResponse<typeof MOCK_LIBRARIES>> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, data: MOCK_LIBRARIES };
    }
    
    throw new Error('API not implemented');
  },
};














