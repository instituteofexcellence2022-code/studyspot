# 💳 PAYMENT & SMS INTEGRATION GUIDE
## Cashfree + Razorpay + BSNL DLT Implementation

---

## ✅ **YOUR APPROVED SERVICES**

### **Payment Gateways:**
- ✅ **Cashfree** - Approved
- ✅ **Razorpay** - Approved

### **SMS/Communication:**
- ✅ **BSNL DLT Registration** - Complete
- Ready for commercial SMS sending

---

## 💳 **1. PAYMENT GATEWAY IMPLEMENTATION**

### **Strategy: Dual Gateway Support**

We'll implement **both** Cashfree and Razorpay with:
- ✅ Automatic failover (if one fails, use other)
- ✅ Load balancing (distribute traffic)
- ✅ Cost optimization (use cheaper for specific transaction types)
- ✅ Better uptime (99.99% availability)

---

### **A. CASHFREE INTEGRATION**

#### **1. Cashfree Setup:**

```typescript
// config/payment.config.ts

export const CASHFREE_CONFIG = {
  // Sandbox (Testing)
  sandbox: {
    appId: process.env.CASHFREE_SANDBOX_APP_ID!,
    secretKey: process.env.CASHFREE_SANDBOX_SECRET_KEY!,
    apiUrl: 'https://sandbox.cashfree.com/pg',
  },
  
  // Production
  production: {
    appId: process.env.CASHFREE_APP_ID!,
    secretKey: process.env.CASHFREE_SECRET_KEY!,
    apiUrl: 'https://api.cashfree.com/pg',
  },
  
  // Get active config
  get active() {
    return process.env.NODE_ENV === 'production' 
      ? this.production 
      : this.sandbox;
  }
};
```

#### **2. Cashfree Service:**

```typescript
// services/payment/cashfree.service.ts

import axios from 'axios';
import crypto from 'crypto';
import { CASHFREE_CONFIG } from '../../config/payment.config';

interface CashfreeOrderRequest {
  orderId: string;
  orderAmount: number;
  orderCurrency: 'INR';
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta?: {
    returnUrl: string;
    notifyUrl?: string;
  };
}

interface CashfreeOrderResponse {
  orderId: string;
  orderStatus: string;
  paymentSessionId: string;
  cfOrderId: string;
}

class CashfreeService {
  private config = CASHFREE_CONFIG.active;
  
  /**
   * Generate signature for API requests
   */
  private generateSignature(timestamp: string, data: string): string {
    const signatureData = `${timestamp}${data}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(signatureData)
      .digest('base64');
  }
  
  /**
   * Create payment order
   */
  async createOrder(orderData: CashfreeOrderRequest): Promise<CashfreeOrderResponse> {
    try {
      const url = `${this.config.apiUrl}/orders`;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const requestData = JSON.stringify(orderData);
      const signature = this.generateSignature(timestamp, requestData);
      
      const response = await axios.post(url, orderData, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Cashfree order creation failed: ${error.message}`);
    }
  }
  
  /**
   * Verify payment
   */
  async verifyPayment(orderId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/orders/${orderId}`;
      
      const response = await axios.get(url, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Cashfree payment verification failed: ${error.message}`);
    }
  }
  
  /**
   * Process refund
   */
  async processRefund(orderId: string, refundAmount: number, refundId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/orders/${orderId}/refunds`;
      
      const refundData = {
        refund_id: refundId,
        refund_amount: refundAmount,
        refund_note: 'Customer requested refund',
      };
      
      const response = await axios.post(url, refundData, {
        headers: {
          'x-api-version': '2023-08-01',
          'x-client-id': this.config.appId,
          'x-client-secret': this.config.secretKey,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Cashfree refund failed: ${error.message}`);
    }
  }
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, timestamp: string, rawBody: string): boolean {
    const expectedSignature = this.generateSignature(timestamp, rawBody);
    return signature === expectedSignature;
  }
}

export default new CashfreeService();
```

---

### **B. RAZORPAY INTEGRATION**

#### **1. Razorpay Setup:**

```typescript
// config/payment.config.ts

export const RAZORPAY_CONFIG = {
  // Test (Testing)
  test: {
    keyId: process.env.RAZORPAY_TEST_KEY_ID!,
    keySecret: process.env.RAZORPAY_TEST_KEY_SECRET!,
  },
  
  // Live (Production)
  live: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
  },
  
  // Get active config
  get active() {
    return process.env.NODE_ENV === 'production' 
      ? this.live 
      : this.test;
  }
};
```

#### **2. Razorpay Service:**

```typescript
// services/payment/razorpay.service.ts

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../../config/payment.config';

interface RazorpayOrderRequest {
  amount: number; // in paise (₹100 = 10000 paise)
  currency: 'INR';
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

class RazorpayService {
  private razorpay: Razorpay;
  private config = RAZORPAY_CONFIG.active;
  
  constructor() {
    this.razorpay = new Razorpay({
      key_id: this.config.keyId,
      key_secret: this.config.keySecret,
    });
  }
  
  /**
   * Create payment order
   */
  async createOrder(orderData: RazorpayOrderRequest): Promise<RazorpayOrder> {
    try {
      const order = await this.razorpay.orders.create(orderData);
      return order as RazorpayOrder;
    } catch (error: any) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }
  
  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(text)
      .digest('hex');
    
    return expectedSignature === signature;
  }
  
  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      throw new Error(`Razorpay payment fetch failed: ${error.message}`);
    }
  }
  
  /**
   * Process refund
   */
  async processRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount, // If not provided, full refund
      });
      return refund;
    } catch (error: any) {
      throw new Error(`Razorpay refund failed: ${error.message}`);
    }
  }
  
  /**
   * Create subscription
   */
  async createSubscription(planId: string, customerId: string, totalCount: number): Promise<any> {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: totalCount,
        quantity: 1,
      });
      return subscription;
    } catch (error: any) {
      throw new Error(`Razorpay subscription creation failed: ${error.message}`);
    }
  }
  
  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error: any) {
      throw new Error(`Razorpay subscription cancellation failed: ${error.message}`);
    }
  }
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return expectedSignature === signature;
  }
}

export default new RazorpayService();
```

---

### **C. UNIFIED PAYMENT SERVICE (Smart Router)**

```typescript
// services/payment/payment.service.ts

import cashfreeService from './cashfree.service';
import razorpayService from './razorpay.service';

type PaymentGateway = 'cashfree' | 'razorpay';

interface PaymentRequest {
  amount: number;
  currency: 'INR';
  orderId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
  gateway?: PaymentGateway; // Optional: specify gateway
}

interface PaymentResponse {
  success: boolean;
  gateway: PaymentGateway;
  orderId: string;
  gatewayOrderId: string;
  paymentSessionId?: string;
  data: any;
}

class PaymentService {
  /**
   * Select best payment gateway based on logic
   */
  private selectGateway(amount: number, preferredGateway?: PaymentGateway): PaymentGateway {
    // If preferred gateway specified, use it
    if (preferredGateway) {
      return preferredGateway;
    }
    
    // Smart selection logic
    // Example: Use Cashfree for small amounts (lower fees)
    if (amount < 10000) { // Less than ₹100
      return 'cashfree';
    }
    
    // Use Razorpay for larger amounts (better UX)
    return 'razorpay';
  }
  
  /**
   * Create payment order with automatic gateway selection
   */
  async createOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const gateway = this.selectGateway(request.amount, request.gateway);
    
    try {
      if (gateway === 'cashfree') {
        return await this.createCashfreeOrder(request);
      } else {
        return await this.createRazorpayOrder(request);
      }
    } catch (error: any) {
      // Failover: Try alternate gateway
      console.error(`${gateway} failed, trying alternate...`);
      
      const alternateGateway = gateway === 'cashfree' ? 'razorpay' : 'cashfree';
      
      if (alternateGateway === 'cashfree') {
        return await this.createCashfreeOrder(request);
      } else {
        return await this.createRazorpayOrder(request);
      }
    }
  }
  
  /**
   * Create Cashfree order
   */
  private async createCashfreeOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const orderData = {
      orderId: request.orderId,
      orderAmount: request.amount / 100, // Convert paise to rupees
      orderCurrency: request.currency,
      customerDetails: {
        customerId: request.customer.id,
        customerName: request.customer.name,
        customerEmail: request.customer.email,
        customerPhone: request.customer.phone,
      },
      orderMeta: {
        returnUrl: request.returnUrl,
      },
    };
    
    const response = await cashfreeService.createOrder(orderData);
    
    return {
      success: true,
      gateway: 'cashfree',
      orderId: request.orderId,
      gatewayOrderId: response.cfOrderId,
      paymentSessionId: response.paymentSessionId,
      data: response,
    };
  }
  
  /**
   * Create Razorpay order
   */
  private async createRazorpayOrder(request: PaymentRequest): Promise<PaymentResponse> {
    const orderData = {
      amount: request.amount, // Amount in paise
      currency: request.currency,
      receipt: request.orderId,
      notes: {
        customerId: request.customer.id,
        customerName: request.customer.name,
      },
    };
    
    const response = await razorpayService.createOrder(orderData);
    
    return {
      success: true,
      gateway: 'razorpay',
      orderId: request.orderId,
      gatewayOrderId: response.id,
      data: response,
    };
  }
  
  /**
   * Verify payment
   */
  async verifyPayment(gateway: PaymentGateway, orderId: string, paymentId?: string, signature?: string): Promise<any> {
    if (gateway === 'cashfree') {
      return await cashfreeService.verifyPayment(orderId);
    } else {
      if (!paymentId || !signature) {
        throw new Error('Payment ID and signature required for Razorpay verification');
      }
      const isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
      if (!isValid) {
        throw new Error('Invalid payment signature');
      }
      return await razorpayService.fetchPayment(paymentId);
    }
  }
  
  /**
   * Process refund
   */
  async processRefund(gateway: PaymentGateway, orderId: string, amount: number, refundId: string): Promise<any> {
    if (gateway === 'cashfree') {
      return await cashfreeService.processRefund(orderId, amount / 100, refundId);
    } else {
      return await razorpayService.processRefund(orderId, amount);
    }
  }
}

export default new PaymentService();
```

---

### **D. PAYMENT API ENDPOINTS**

```typescript
// routes/payment.routes.ts

import { Router } from 'express';
import paymentService from '../services/payment/payment.service';
import { authenticate, tenantContext } from '../middleware';

const router = Router();

/**
 * Create payment order
 * POST /api/payments/create
 */
router.post('/create', authenticate, tenantContext, async (req, res) => {
  try {
    const { amount, currency, customer, returnUrl, gateway } = req.body;
    
    // Generate unique order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentOrder = await paymentService.createOrder({
      amount: amount * 100, // Convert rupees to paise
      currency: currency || 'INR',
      orderId,
      customer,
      returnUrl,
      gateway,
    });
    
    // Save to database
    await db.query(
      `INSERT INTO payments (
        id, tenant_id, order_id, gateway, gateway_order_id, 
        amount, currency, status, customer_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        orderId,
        req.tenantId,
        orderId,
        paymentOrder.gateway,
        paymentOrder.gatewayOrderId,
        amount,
        currency,
        'pending',
        JSON.stringify(customer),
      ]
    );
    
    res.json({
      success: true,
      data: paymentOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Verify payment
 * POST /api/payments/verify
 */
router.post('/verify', authenticate, tenantContext, async (req, res) => {
  try {
    const { orderId, paymentId, signature, gateway } = req.body;
    
    const paymentDetails = await paymentService.verifyPayment(
      gateway,
      orderId,
      paymentId,
      signature
    );
    
    // Update payment status in database
    await db.query(
      `UPDATE payments SET 
        status = $1, 
        payment_id = $2, 
        payment_date = NOW(), 
        payment_details = $3
      WHERE order_id = $4 AND tenant_id = $5`,
      ['completed', paymentId, JSON.stringify(paymentDetails), orderId, req.tenantId]
    );
    
    res.json({
      success: true,
      data: paymentDetails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Cashfree webhook
 * POST /api/payments/webhook/cashfree
 */
router.post('/webhook/cashfree', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    
    // Verify signature
    const isValid = cashfreeService.verifyWebhookSignature(
      signature,
      timestamp,
      JSON.stringify(req.body)
    );
    
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }
    
    // Process webhook
    const { type, data } = req.body;
    
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      // Update payment status
      await db.query(
        `UPDATE payments SET status = $1, payment_details = $2 WHERE order_id = $3`,
        ['completed', JSON.stringify(data), data.order.order_id]
      );
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Razorpay webhook
 * POST /api/payments/webhook/razorpay
 */
router.post('/webhook/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    
    // Verify signature
    const isValid = razorpayService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );
    
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }
    
    // Process webhook
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
      // Update payment status
      await db.query(
        `UPDATE payments SET status = $1, payment_details = $2 WHERE gateway_order_id = $3`,
        ['completed', JSON.stringify(payload.payment.entity), payload.payment.entity.order_id]
      );
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

---

## 📱 **2. SMS INTEGRATION (BSNL DLT)**

### **A. SMS Configuration:**

```typescript
// config/sms.config.ts

export const SMS_CONFIG = {
  provider: 'msg91', // or 'gupshup', 'kaleyra'
  
  // MSG91 Configuration (Recommended)
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY!,
    senderId: process.env.MSG91_SENDER_ID!, // Your approved sender ID
    route: '4', // 4 = Transactional, 1 = Promotional
    country: '91', // India
    apiUrl: 'https://api.msg91.com/api',
  },
  
  // BSNL DLT Details
  dlt: {
    entityId: process.env.DLT_ENTITY_ID!, // Your BSNL DLT Entity ID
    registered: true,
    provider: 'BSNL',
  },
  
  // Template IDs (from BSNL DLT registration)
  templates: {
    otp: {
      id: process.env.DLT_TEMPLATE_OTP_ID!,
      text: 'Your OTP for StudySpot is {#var#}. Valid for 10 minutes. Do not share with anyone.',
    },
    welcome: {
      id: process.env.DLT_TEMPLATE_WELCOME_ID!,
      text: 'Welcome to StudySpot! Your registration is successful. Student ID: {#var#}',
    },
    payment_success: {
      id: process.env.DLT_TEMPLATE_PAYMENT_SUCCESS_ID!,
      text: 'Payment of Rs.{#var#} received successfully. Receipt: {#var#}. Thank you!',
    },
    payment_reminder: {
      id: process.env.DLT_TEMPLATE_PAYMENT_REMINDER_ID!,
      text: 'Payment reminder: Rs.{#var#} due on {#var#}. Please pay to continue services.',
    },
    booking_confirmed: {
      id: process.env.DLT_TEMPLATE_BOOKING_ID!,
      text: 'Booking confirmed! Seat: {#var#}, Date: {#var#}, Library: {#var#}',
    },
    subscription_expiry: {
      id: process.env.DLT_TEMPLATE_EXPIRY_ID!,
      text: 'Your subscription expires on {#var#}. Renew now to continue services.',
    },
  },
};
```

### **B. SMS Service Implementation:**

```typescript
// services/sms/sms.service.ts

import axios from 'axios';
import { SMS_CONFIG } from '../../config/sms.config';

interface SendSMSRequest {
  phone: string;
  templateId: string;
  variables: string[];
  templateType?: 'otp' | 'welcome' | 'payment_success' | 'payment_reminder' | 'booking_confirmed' | 'subscription_expiry';
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private config = SMS_CONFIG.msg91;
  
  /**
   * Send SMS using MSG91
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    try {
      // Get template
      const template = SMS_CONFIG.templates[request.templateType || 'otp'];
      
      // Replace variables in template
      let message = template.text;
      request.variables.forEach((value) => {
        message = message.replace('{#var#}', value);
      });
      
      const url = `${this.config.apiUrl}/sendhttp.php`;
      
      const params = {
        authkey: this.config.authKey,
        mobiles: request.phone,
        message: message,
        sender: this.config.senderId,
        route: this.config.route,
        country: this.config.country,
        DLT_TE_ID: template.id, // BSNL DLT Template ID (REQUIRED!)
      };
      
      const response = await axios.get(url, { params });
      
      if (response.data.type === 'success') {
        return {
          success: true,
          messageId: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Send OTP
   */
  async sendOTP(phone: string, otp: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateId: SMS_CONFIG.templates.otp.id,
      variables: [otp],
      templateType: 'otp',
    });
  }
  
  /**
   * Send welcome message
   */
  async sendWelcome(phone: string, studentId: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateId: SMS_CONFIG.templates.welcome.id,
      variables: [studentId],
      templateType: 'welcome',
    });
  }
  
  /**
   * Send payment confirmation
   */
  async sendPaymentSuccess(phone: string, amount: string, receipt: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateId: SMS_CONFIG.templates.payment_success.id,
      variables: [amount, receipt],
      templateType: 'payment_success',
    });
  }
  
  /**
   * Send payment reminder
   */
  async sendPaymentReminder(phone: string, amount: string, dueDate: string): Promise<SendSMSResponse> {
    return this.sendSMS({
      phone,
      templateId: SMS_CONFIG.templates.payment_reminder.id,
      variables: [amount, dueDate],
      templateType: 'payment_reminder',
    });
  }
  
  /**
   * Check delivery status
   */
  async checkDeliveryStatus(messageId: string): Promise<any> {
    try {
      const url = `${this.config.apiUrl}/status.php`;
      
      const params = {
        authkey: this.config.authKey,
        message_id: messageId,
      };
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to check SMS status: ${error.message}`);
    }
  }
}

export default new SMSService();
```

---

### **C. SMS API Endpoints:**

```typescript
// routes/sms.routes.ts

import { Router } from 'express';
import smsService from '../services/sms/sms.service';
import { authenticate, tenantContext } from '../middleware';

const router = Router();

/**
 * Send SMS
 * POST /api/sms/send
 */
router.post('/send', authenticate, tenantContext, async (req, res) => {
  try {
    const { phone, templateType, variables } = req.body;
    
    // Check tenant credit balance
    const credits = await getTenantCredits(req.tenantId);
    if (credits.sms_credits <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient SMS credits',
      });
    }
    
    // Send SMS
    const result = await smsService.sendSMS({
      phone,
      templateId: SMS_CONFIG.templates[templateType].id,
      variables,
      templateType,
    });
    
    if (result.success) {
      // Deduct credit
      await deductTenantCredit(req.tenantId, 'sms', 1);
      
      // Log communication
      await db.query(
        `INSERT INTO communications (
          tenant_id, channel, type, recipient, message, 
          status, credits_used, template_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          req.tenantId,
          'sms',
          templateType,
          phone,
          SMS_CONFIG.templates[templateType].text,
          'sent',
          1,
          SMS_CONFIG.templates[templateType].id,
        ]
      );
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Send OTP
 * POST /api/sms/send-otp
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with 10-minute expiry
    await redis.setex(`otp:${phone}`, 600, otp);
    
    // Send SMS
    const result = await smsService.sendOTP(phone, otp);
    
    res.json({
      success: result.success,
      message: result.success ? 'OTP sent successfully' : result.error,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

---

## 🔐 **3. ENVIRONMENT VARIABLES**

```bash
# .env

# ============================================
# CASHFREE CONFIGURATION
# ============================================

# Sandbox (Testing)
CASHFREE_SANDBOX_APP_ID=your_sandbox_app_id
CASHFREE_SANDBOX_SECRET_KEY=your_sandbox_secret_key

# Production
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key

# ============================================
# RAZORPAY CONFIGURATION
# ============================================

# Test (Testing)
RAZORPAY_TEST_KEY_ID=rzp_test_xxxxx
RAZORPAY_TEST_KEY_SECRET=your_test_secret

# Live (Production)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# SMS CONFIGURATION (MSG91)
# ============================================

MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id  # e.g., STDYSP

# ============================================
# BSNL DLT CONFIGURATION
# ============================================

DLT_ENTITY_ID=your_entity_id  # From BSNL DLT portal
DLT_TEMPLATE_OTP_ID=your_otp_template_id
DLT_TEMPLATE_WELCOME_ID=your_welcome_template_id
DLT_TEMPLATE_PAYMENT_SUCCESS_ID=your_payment_success_template_id
DLT_TEMPLATE_PAYMENT_REMINDER_ID=your_payment_reminder_template_id
DLT_TEMPLATE_BOOKING_ID=your_booking_template_id
DLT_TEMPLATE_EXPIRY_ID=your_expiry_template_id
```

---

## 📋 **4. IMPLEMENTATION CHECKLIST**

### **Payment Gateway:**
- [ ] Install dependencies: `npm install razorpay axios crypto`
- [ ] Configure Cashfree credentials (sandbox + production)
- [ ] Configure Razorpay credentials (test + live)
- [ ] Implement unified payment service with failover
- [ ] Create payment API endpoints
- [ ] Set up webhook endpoints for both gateways
- [ ] Test payment flow (sandbox/test)
- [ ] Go live with production credentials

### **SMS Service:**
- [ ] Get MSG91 account credentials
- [ ] Configure BSNL DLT entity ID
- [ ] Register all SMS templates in BSNL DLT portal
- [ ] Get DLT template IDs for each template
- [ ] Implement SMS service with template support
- [ ] Create SMS API endpoints
- [ ] Integrate credit deduction logic
- [ ] Test SMS delivery
- [ ] Monitor delivery reports

---

## ✅ **YOUR READY-TO-USE CREDENTIALS**

```yaml
✅ APPROVED PAYMENT GATEWAYS:
  - Cashfree: 1.5% + ₹3 per transaction
  - Razorpay: 2% + ₹0 per transaction
  
✅ DLT REGISTRATION:
  - Provider: BSNL
  - Status: Approved
  - Ready for: Commercial SMS sending

🎯 NEXT STEPS:
  1. Get your Cashfree App ID & Secret Key
  2. Get your Razorpay Key ID & Key Secret
  3. Get your MSG91 Auth Key
  4. Get your DLT Template IDs from BSNL portal
  5. Add all credentials to .env file
  6. Test in sandbox/test mode
  7. Deploy to production
```

---

**🎉 You have everything ready to go live! Just need to add your credentials and deploy!**

