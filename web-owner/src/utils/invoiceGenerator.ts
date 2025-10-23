// Invoice/Receipt Generator Utility

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed' | 'refunded';
  paymentMethod?: string;
  paidAmount?: number;
  notes?: string;
}

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const prefix = 'INV';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};

// Generate invoice for fee plan subscription
export const generateFeePlanInvoice = (
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  },
  plan: {
    name: string;
    basePrice: number;
    type: string;
    discount?: { type: 'percentage' | 'fixed'; value: number };
  },
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed' | 'refunded' = 'pending',
  paymentMethod?: string
): InvoiceData => {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

  // Calculate amounts
  const quantity = 1;
  const rate = plan.basePrice;
  const subtotal = rate * quantity;
  
  let discount = 0;
  if (plan.discount) {
    if (plan.discount.type === 'percentage') {
      discount = (subtotal * plan.discount.value) / 100;
    } else {
      discount = plan.discount.value;
    }
  }

  const tax = (subtotal - discount) * 0.18; // 18% GST
  const total = subtotal - discount + tax;

  const items: InvoiceItem[] = [
    {
      description: `${plan.name} - ${plan.type} subscription`,
      quantity,
      rate,
      amount: subtotal,
    },
  ];

  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: now.toISOString(),
    dueDate: paymentStatus === 'pending' ? dueDate.toISOString() : undefined,
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student.id,
    studentEmail: student.email,
    studentPhone: student.phone || '',
    items,
    subtotal,
    discount,
    tax,
    total,
    paymentStatus,
    paymentMethod,
    paidAmount: paymentStatus === 'paid' ? total : undefined,
    notes: paymentStatus === 'paid' 
      ? 'Thank you for your payment! Your subscription is now active.' 
      : 'Please make payment before the due date to continue your subscription.',
  };
};

// Generate invoice for one-time payment
export const generatePaymentInvoice = (
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  },
  description: string,
  amount: number,
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed' | 'refunded' = 'pending',
  paymentMethod?: string
): InvoiceData => {
  const now = new Date();
  
  const items: InvoiceItem[] = [
    {
      description,
      quantity: 1,
      rate: amount,
      amount,
    },
  ];

  const subtotal = amount;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: now.toISOString(),
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student.id,
    studentEmail: student.email,
    studentPhone: student.phone || '',
    items,
    subtotal,
    tax,
    total,
    paymentStatus,
    paymentMethod,
    paidAmount: paymentStatus === 'paid' ? total : undefined,
    notes: paymentStatus === 'paid' 
      ? 'Payment received. Thank you!' 
      : 'Please make payment at your earliest convenience.',
  };
};

// Generate receipt for completed payment
export const generateReceipt = (
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  },
  items: InvoiceItem[],
  paymentMethod: string,
  discount?: number
): InvoiceData => {
  const now = new Date();
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = (subtotal - (discount || 0)) * 0.18; // 18% GST
  const total = subtotal - (discount || 0) + tax;

  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: now.toISOString(),
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student.id,
    studentEmail: student.email,
    studentPhone: student.phone || '',
    items,
    subtotal,
    discount,
    tax,
    total,
    paymentStatus: 'paid',
    paymentMethod,
    paidAmount: total,
    notes: 'Thank you for your payment! This is your official receipt.',
  };
};

// Demo invoice data
export const getDemoInvoice = (): InvoiceData => {
  return {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    studentName: 'Rajesh Kumar',
    studentId: 'STU-001',
    studentEmail: 'rajesh.kumar@example.com',
    studentPhone: '+91 9876543210',
    items: [
      {
        description: 'Premium Monthly Plan - AC Zone',
        quantity: 1,
        rate: 5000,
        amount: 5000,
      },
      {
        description: 'Locker Rental',
        quantity: 1,
        rate: 500,
        amount: 500,
      },
    ],
    subtotal: 5500,
    discount: 550, // 10% discount
    tax: 891, // 18% GST
    total: 5841,
    paymentStatus: 'paid',
    paymentMethod: 'Online - UPI',
    paidAmount: 5841,
    notes: 'Thank you for your payment! Your subscription is now active.',
  };
};

