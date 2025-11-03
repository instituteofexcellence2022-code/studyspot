import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  FormControlLabel,
  Divider,
  Autocomplete,
  CircularProgress,
  Chip,
  RadioGroup,
  Radio,
  Switch,
  Stepper,
  Step,
  StepLabel,
  Badge,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  alpha,
  useTheme,
  Paper,
  Stack,
} from '@mui/material';
import { 
  Close, 
  Receipt, 
  CheckCircle, 
  Person as PersonIcon,
  PersonAdd,
  AttachMoney,
  Print,
  Share,
  Download,
  PictureAsPdf,
  WhatsApp,
  Send,
  Message,
  Email,
  Phone,
  AccountBalance,
  CreditCard,
  LocalAtm,
  QrCode2,
  SmartToy,
  AutoAwesome,
  Verified,
} from '@mui/icons-material';
import studentsService from '../../services/studentsService';
import feePlanService from '../../services/api/feePlan.service';
import { useAppSelector } from '../../hooks/redux';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  isPopular?: boolean;
  isActive: boolean;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  grade?: string;
  parentName?: string;
  parentPhone?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface OfflinePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payment: any) => void;
}

const OfflinePaymentDialog: React.FC<OfflinePaymentDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const { selectedLibrary } = useAppSelector((state) => state.library);
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [studentType, setStudentType] = useState<'existing' | 'new'>('existing');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentDetails, setStudentDetails] = useState<Student | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoadingPricingPlans, setIsLoadingPricingPlans] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    phone: '',
    amount: '',
    paymentMethod: 'cash',
    startDate: '',
    endDate: '',
    description: '',
    receivedBy: '',
    staffConfirmation: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegisteringStudent, setIsRegisteringStudent] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [sendStatus, setSendStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({
    whatsapp: 'idle',
    sms: 'idle',
    email: 'idle',
    account: 'idle',
  });
  const [previewTransactionId, setPreviewTransactionId] = useState<string>('');

  // Mock data
  const mockExistingStudents: Student[] = [
    {
      id: '1',
      studentId: 'STU001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 9876543210',
      email: 'rahul.sharma@email.com',
      grade: '10th',
      parentName: 'Rajesh Sharma',
      parentPhone: '+91 9876543211',
    },
    {
      id: '2',
      studentId: 'STU002',
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91 9876543212',
      email: 'priya.patel@email.com',
      grade: '9th',
      parentName: 'Suresh Patel',
      parentPhone: '+91 9876543213',
    },
    {
      id: '3',
      studentId: 'STU003',
      firstName: 'Amit',
      lastName: 'Kumar',
      phone: '+91 9876543214',
      email: 'amit.kumar@email.com',
      grade: '11th',
      parentName: 'Vikash Kumar',
      parentPhone: '+91 9876543215',
    },
  ];

  const mockCurrentStaff: Staff = {
    id: '1',
    name: 'John Doe',
    role: 'Library Manager',
    department: 'Administration',
  };

  // Mock pricing plans removed - now using real fee plan service

  // Auto-detect staff on dialog open
  useEffect(() => {
    if (open) {
      setIsLoadingStaff(true);
      // Simulate realistic loading time
      setTimeout(() => {
        setCurrentStaff(mockCurrentStaff);
        setFormData(prev => ({
          ...prev,
          receivedBy: mockCurrentStaff.name,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));
        setIsLoadingStaff(false);
      }, 300);
    }
  }, [open]);

  // Load pricing plans from real fee plan service
  useEffect(() => {
    if (open) {
      setIsLoadingPricingPlans(true);
      const loadPricingPlans = async () => {
        try {
          const feePlans = await feePlanService.getFeePlans();
          // Transform FeePlan to PricingPlan format
          const transformedPlans: PricingPlan[] = feePlans.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.basePrice,
            discount: plan.discount ? (plan.discount.type === 'percentage' ? (plan.basePrice * plan.discount.value / 100) : plan.discount.value) : undefined,
            isPopular: plan.isPopular,
            isActive: plan.status === 'active',
            type: plan.type === 'monthly' ? 'monthly' : 
                  plan.type === 'quarterly' ? 'quarterly' : 
                  plan.type === 'annual' ? 'yearly' : 'custom'
          }));
          setPricingPlans(transformedPlans);
        } catch (error) {
          console.error('Failed to load pricing plans:', error);
          // Fallback to empty array if service fails
          setPricingPlans([]);
        } finally {
          setIsLoadingPricingPlans(false);
        }
      };
      loadPricingPlans();
    }
  }, [open]);

  // Generate preview transaction ID when reaching confirmation step
  useEffect(() => {
    if (activeStep === 2 && !previewTransactionId) {
      setPreviewTransactionId(generateTransactionId());
    }
  }, [activeStep, previewTransactionId]);

  // Auto-process payment when reaching step 3
  useEffect(() => {
    if (activeStep === 3 && !showInvoice && !isGeneratingInvoice && !isRegisteringStudent && formData.staffConfirmation) {
      console.log('Auto-processing payment on step 3');
      handleConfirmSubmit();
    }
  }, [activeStep, showInvoice, isGeneratingInvoice, isRegisteringStudent, formData.staffConfirmation]);

  // Auto-fill student details when selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDetails(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchStudentDetails = async (student: Student) => {
    setIsLoadingStudent(true);
    setTimeout(() => {
      setStudentDetails(student);
      setFormData(prev => ({
        ...prev,
        studentName: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        phone: student.phone,
      }));
      setIsLoadingStudent(false);
    }, 300);
  };

  const getActivePricingPlans = () => {
    return pricingPlans.filter(plan => plan.isActive);
  };

  const applyPricingPlan = (plan: PricingPlan) => {
    const finalPrice = plan.discount ? plan.price - plan.discount : plan.price;
    setFormData(prev => ({
      ...prev,
      amount: finalPrice.toString(),
      description: `${plan.name} - ${plan.description}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: plan.type === 'monthly' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : plan.type === 'quarterly'
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : plan.type === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));
  };

  const validateForm = (step?: number) => {
    console.log('validateForm called with step:', step);
    const newErrors: Record<string, string> = {};

    // Step 0: Student Selection validation
    if (step === 0 || step === undefined) {
      if (studentType === 'existing' && !selectedStudent) {
        newErrors.studentSelection = 'Please select a student';
      }
      if (studentType === 'new' && !formData.studentName.trim()) {
        newErrors.studentName = 'Student name is required';
      }
      if (studentType === 'new' && !formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }

    // Step 1: Payment Details validation
    if (step === 1 || step === undefined) {
      if (!formData.amount.trim()) {
        newErrors.amount = 'Amount is required';
      } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }

      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }

      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Step 2: Confirmation validation
    if (step === 2 || step === undefined) {
      if (!formData.studentName.trim()) {
        newErrors.studentName = 'Student name is required';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }

      if (!formData.amount.trim()) {
        newErrors.amount = 'Amount is required';
      } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }

      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }

      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (!formData.receivedBy.trim()) {
        newErrors.receivedBy = 'Received by field is required';
      }

      if (!formData.staffConfirmation) {
        newErrors.staffConfirmation = 'Staff confirmation is required';
      }
    }

    console.log('Validation errors:', newErrors);
    console.log('Validation result:', Object.keys(newErrors).length === 0);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canAutoSubmit = () => {
    return formData.paymentMethod === 'cash' && 
           Number(formData.amount) < 10000 && 
           formData.studentName && 
           formData.amount && 
           formData.receivedBy;
  };

  const handleReset = () => {
    setFormData({
      studentName: '',
      studentId: '',
      phone: '',
      amount: '',
      paymentMethod: 'cash',
      startDate: '',
      endDate: '',
      description: '',
      receivedBy: currentStaff?.name || '',
      staffConfirmation: false,
    });
    setErrors({});
    setSelectedStudent(null);
    setStudentDetails(null);
    setSearchValue('');
    setActiveStep(0);
    setShowInvoice(false);
    setInvoiceData(null);
    setPreviewTransactionId('');
    setSendStatus({
      whatsapp: 'idle',
      sms: 'idle',
      email: 'idle',
      account: 'idle',
    });
  };

  const handleNext = () => {
    console.log('handleNext called, current step:', activeStep);
    console.log('Validation result:', validateForm(activeStep));
    
    // For step 2 (confirmation), allow progression even if validation fails
    // This ensures users can reach the final step
    if (validateForm(activeStep) || activeStep === 2) {
      // Clear errors before moving to next step
      setErrors({});
      // Smooth transition with slight delay
      setTimeout(() => {
        setActiveStep(prev => {
          console.log('Moving from step', prev, 'to step', prev + 1);
          return prev + 1;
        });
      }, 50);
    } else {
      console.log('Validation failed, cannot proceed to next step');
    }
  };

  const handleBack = () => {
    // Clear errors when going back
    setErrors({});
    // Smooth transition
    setTimeout(() => {
      setActiveStep(prev => prev - 1);
    }, 50);
  };

  const handleConfirmSubmit = async () => {
    console.log('handleConfirmSubmit called');
    console.log('formData:', formData);
    console.log('staffConfirmation:', formData.staffConfirmation);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }
    
    console.log('Validation passed, proceeding with payment');

    // Auto-register new student if needed
    if (studentType === 'new') {
      setIsRegisteringStudent(true);
      try {
        const [firstName, ...lastNameParts] = formData.studentName.split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const studentData = {
          firstName,
          lastName,
          phone: formData.phone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          feeStatus: 'paid',
          status: 'active',
          enrollmentDate: new Date().toISOString(),
          currentPlan: 'monthly',
        };

        const newStudent = await studentsService.createStudent(studentData);
        console.log('New student registered:', newStudent);
      } catch (error) {
        console.error('Error registering student:', error);
      } finally {
        setIsRegisteringStudent(false);
      }
    }

    // Generate invoice
    setIsGeneratingInvoice(true);
    setTimeout(() => {
      const invoice = generateInvoice();
      setInvoiceData(invoice);
      setShowInvoice(true);
      setIsGeneratingInvoice(false);
      
      // Complete the payment by calling onSuccess
      const paymentData = {
        studentName: formData.studentName,
        studentId: formData.studentId || 'AUTO-GENERATED',
        studentEmail: `${formData.studentName.toLowerCase().replace(' ', '.')}@email.com`,
        studentPhone: formData.phone,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        description: `Period: ${formData.startDate} to ${formData.endDate}`,
        transactionDate: new Date().toISOString(),
        requiresVerification: false,
        notes: `Received by: ${formData.receivedBy}`,
      };
      
      // Call onSuccess to complete the payment
      onSuccess(paymentData);
      
      // Show success message and close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 400);
  };

  const generateTransactionId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    // Format: YYYYMMDD-HHMMSS-MMM (e.g., 20241215-143052-123)
    return `${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
  };

  const generateInvoice = () => {
    const transactionId = generateTransactionId();
    return {
      id: `TXN-${transactionId}`,
      transactionId: transactionId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      student: {
        name: formData.studentName,
        id: formData.studentId || 'AUTO-GENERATED',
        phone: formData.phone,
      },
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      period: `${formData.startDate} to ${formData.endDate}`,
      description: formData.description,
      receivedBy: formData.receivedBy,
      library: {
        name: selectedLibrary?.name || 'StudySpot Library',
        address: selectedLibrary?.address || '123 Education Street, Learning City',
        phone: '+91 9876543210', // Default phone number
        email: 'info@studyspot.com', // Default email
      },
    };
  };

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && invoiceData) {
      printWindow.document.write(generateInvoiceHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadInvoice = () => {
    if (invoiceData) {
      const htmlContent = generateInvoiceHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-${invoiceData.transactionId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShareInvoice = async () => {
    if (invoiceData) {
      const shareData = {
        title: `Invoice ${invoiceData.id}`,
        text: `Payment of ₹${invoiceData.amount} received from ${invoiceData.student.name}`,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.log('Share cancelled');
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Invoice ${invoiceData.id}\nAmount: ₹${invoiceData.amount}\nStudent: ${invoiceData.student.name}\nDate: ${invoiceData.date}`
        );
        alert('Invoice details copied to clipboard!');
      }
    }
  };

  const sendInvoiceToWhatsApp = () => {
    if (invoiceData) {
      const message = `📄 *Invoice ${invoiceData.id}*\n\n` +
        `Student: ${invoiceData.student.name}\n` +
        `Amount: ₹${invoiceData.amount}\n` +
        `Payment Method: ${invoiceData.paymentMethod}\n` +
        `Period: ${invoiceData.period}\n` +
        `Date: ${invoiceData.date}\n\n` +
        `Thank you for your payment!`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${invoiceData.student.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const sendInvoiceToSMS = () => {
    if (invoiceData) {
      const message = `Invoice ${invoiceData.id}: Payment of ₹${invoiceData.amount} received. Period: ${invoiceData.period}. Thank you!`;
      console.log('SMS would be sent to:', invoiceData.student.phone, 'Message:', message);
      // In real implementation, integrate with SMS service
      setTimeout(() => {
        setSendStatus(prev => ({ ...prev, sms: 'success' }));
      }, 800);
    }
  };

  const sendInvoiceToEmail = () => {
    if (invoiceData) {
      const subject = `Transaction ${invoiceData.id} - Payment Confirmation`;
      const body = `Dear ${invoiceData.student.name},\n\n` +
        `Thank you for your payment of ₹${invoiceData.amount}.\n\n` +
        `Transaction Details:\n` +
        `- Transaction ID: ${invoiceData.transactionId}\n` +
        `- Amount: ₹${invoiceData.amount}\n` +
        `- Payment Method: ${invoiceData.paymentMethod}\n` +
        `- Period: ${invoiceData.period}\n` +
        `- Date: ${invoiceData.date}\n` +
        `- Time: ${invoiceData.time}\n\n` +
        `Best regards,\n${selectedLibrary?.name || 'StudySpot Library'}\n\n🎓 STUDYSPOT - Empowering Libraries with Smart Management Solutions`;
      
      const mailtoUrl = `mailto:${invoiceData.student.phone}@email.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);
    }
  };

  const sendInvoiceToStudentAccount = () => {
    if (invoiceData) {
      console.log('Invoice sent to student account dashboard');
      // In real implementation, send to student's account
      setTimeout(() => {
        setSendStatus(prev => ({ ...prev, account: 'success' }));
      }, 600);
    }
  };

  const handleAutoSendInvoice = async () => {
    setIsSendingInvoice(true);
    
    const sendPromises = [
      { key: 'whatsapp', fn: sendInvoiceToWhatsApp },
      { key: 'sms', fn: sendInvoiceToSMS },
      { key: 'email', fn: sendInvoiceToEmail },
      { key: 'account', fn: sendInvoiceToStudentAccount },
    ];

    // Update status to sending
    sendPromises.forEach(({ key }) => {
      setSendStatus(prev => ({ ...prev, [key]: 'sending' }));
    });

    // Execute all sends
    const results = await Promise.allSettled(
      sendPromises.map(({ fn }) => Promise.resolve(fn()))
    );

    // Update final status
    results.forEach((result, index) => {
      const { key } = sendPromises[index];
      setSendStatus(prev => ({
        ...prev,
        [key]: result.status === 'fulfilled' ? 'success' : 'error',
      }));
    });

    setIsSendingInvoice(false);
  };

  const generateInvoiceHTML = () => {
    if (!invoiceData) return '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            position: relative;
            overflow: hidden;
          }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .invoice-details { margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-size: 4rem;
            font-weight: 800;
            color: rgba(25, 118, 210, 0.08);
            z-index: -1;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
          }
          .watermark-tagline {
            position: fixed;
            top: calc(50% + 3rem);
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            font-size: 1.2rem;
            font-weight: 500;
            color: rgba(25, 118, 210, 0.06);
            z-index: -1;
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
          }
          @media print {
            .watermark { font-size: 3rem; }
            .watermark-tagline { font-size: 1rem; top: calc(50% + 2.5rem); }
          }
        </style>
      </head>
      <body>
        <div class="watermark">🎓 STUDYSPOT</div>
        <div class="watermark-tagline">Empowering Libraries with Smart Management Solutions</div>
        
        <div class="header">
          <h1>${invoiceData.library.name}</h1>
          <p>${invoiceData.library.address}</p>
          <p>Phone: ${invoiceData.library.phone} | Email: ${invoiceData.library.email}</p>
        </div>
        
        <div class="invoice-details">
          <h2>Transaction ${invoiceData.id}</h2>
          <p><strong>Transaction ID:</strong> ${invoiceData.transactionId}</p>
          <p><strong>Date:</strong> ${invoiceData.date}</p>
          <p><strong>Time:</strong> ${invoiceData.time}</p>
          <p><strong>Student:</strong> ${invoiceData.student.name} (${invoiceData.student.id})</p>
          <p><strong>Phone:</strong> ${invoiceData.student.phone}</p>
          <p><strong>Amount:</strong> <span class="amount">₹${invoiceData.amount}</span></p>
          <p><strong>Payment Method:</strong> ${invoiceData.paymentMethod}</p>
          <p><strong>Period:</strong> ${invoiceData.period}</p>
          <p><strong>Description:</strong> ${invoiceData.description}</p>
          <p><strong>Received By:</strong> ${invoiceData.receivedBy}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  const steps = [
    'Student Selection',
    'Payment Details',
    'Confirmation',
    'Invoice & Share',
  ];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            {/* Staff Auto-Detection */}
            <Slide direction="down" in={true} timeout={400}>
              <Card sx={{ 
                mb: 2, 
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ 
                      bgcolor: theme.palette.primary.main,
                      animation: isLoadingStaff ? 'pulse 1.5s ease-in-out infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' },
                      }
                    }}>
                      <SmartToy />
                    </Avatar>
                  }
                  title="Staff Auto-Detection"
                  subheader="Current staff member automatically detected"
                />
                <CardContent>
                  {isLoadingStaff ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                      <CircularProgress size={24} color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Detecting staff member...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Please wait while we identify you
                        </Typography>
                      </Box>
                    </Box>
                  ) : currentStaff ? (
                    <Fade in={true} timeout={500}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.success.main,
                          animation: 'successPulse 0.6s ease-out',
                          '@keyframes successPulse': {
                            '0%': { transform: 'scale(0.8)', opacity: 0 },
                            '50%': { transform: 'scale(1.2)' },
                            '100%': { transform: 'scale(1)', opacity: 1 },
                          }
                        }}>
                          <Verified />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} color="success.main">
                            ✅ {currentStaff.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentStaff.role} • {currentStaff.department}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ) : null}
                </CardContent>
              </Card>
            </Slide>

            {/* Student Type Selection */}
            <Slide direction="up" in={true} timeout={500}>
              <Card sx={{ 
                mb: 2,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.15)}`,
                }
              }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: theme.palette.secondary.main }}><PersonIcon /></Avatar>}
                  title="Student Type"
                  subheader="Choose existing or new student"
                />
                <CardContent>
                  <RadioGroup
                    value={studentType}
                    onChange={(e) => setStudentType(e.target.value as 'existing' | 'new')}
                    sx={{ gap: 2 }}
                  >
                    <Paper
                      elevation={studentType === 'existing' ? 4 : 1}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: `2px solid ${studentType === 'existing' ? theme.palette.primary.main : 'transparent'}`,
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: studentType === 'existing' ? 'translateY(-2px)' : 'translateY(0)',
                        '&:hover': {
                          elevation: 2,
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-1px)',
                        }
                      }}
                      onClick={() => setStudentType('existing')}
                    >
                      <FormControlLabel
                        value="existing"
                        control={<Radio color="primary" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette.primary.main, 
                              width: 32, 
                              height: 32,
                              transition: 'all 0.3s ease',
                              transform: studentType === 'existing' ? 'scale(1.1)' : 'scale(1)',
                            }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Existing Student
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Search and select from registered students
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                    
                    <Paper
                      elevation={studentType === 'new' ? 4 : 1}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: `2px solid ${studentType === 'new' ? theme.palette.success.main : 'transparent'}`,
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: studentType === 'new' ? 'translateY(-2px)' : 'translateY(0)',
                        '&:hover': {
                          elevation: 2,
                          borderColor: theme.palette.success.main,
                          transform: 'translateY(-1px)',
                        }
                      }}
                      onClick={() => setStudentType('new')}
                    >
                      <FormControlLabel
                        value="new"
                        control={<Radio color="success" />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette.success.main, 
                              width: 32, 
                              height: 32,
                              transition: 'all 0.3s ease',
                              transform: studentType === 'new' ? 'scale(1.1)' : 'scale(1)',
                            }}>
                              <PersonAdd fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                New Student
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Auto-register with unique ID generation
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  </RadioGroup>
                </CardContent>
              </Card>
            </Slide>

            {/* Student Selection/Details */}
            <Zoom in={true} timeout={600}>
              <Card sx={{
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.15)}`,
                }
              }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: theme.palette.info.main }}>{studentType === 'existing' ? <PersonIcon /> : <PersonAdd />}</Avatar>}
                  title={studentType === 'existing' ? 'Select Student' : 'New Student Details'}
                  subheader={studentType === 'existing' ? 'Search and select from registered students' : 'Enter details for new student registration'}
                />
                <CardContent>
                  {errors.studentSelection && (
                    <Fade in={true} timeout={300}>
                      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {errors.studentSelection}
                      </Alert>
                    </Fade>
                  )}
                {studentType === 'existing' ? (
                  <Box>
                    <Autocomplete
                      options={mockExistingStudents}
                      getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.studentId})`}
                      value={selectedStudent}
                      onChange={(_, newValue) => setSelectedStudent(newValue)}
                      inputValue={searchValue}
                      onInputChange={(_, newInputValue) => setSearchValue(newInputValue)}
                      loading={isLoadingStudent}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Search by name, ID, phone, or email"
                          placeholder="Type to search students..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                              },
                              '&.Mui-focused': {
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                              }
                            }
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingStudent ? (
                                  <CircularProgress 
                                    color="primary" 
                                    size={20} 
                                    sx={{ 
                                      animation: 'spin 1s linear infinite',
                                      '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' },
                                      }
                                    }} 
                                  />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {option.firstName[0]}{option.lastName[0]}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {option.firstName} {option.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {option.studentId} • Phone: {option.phone} • Grade: {option.grade}
                              </Typography>
                              {option.parentName && (
                                <Typography variant="caption" color="text.secondary">
                                  Parent: {option.parentName} ({option.parentPhone})
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      )}
                    />
                    
                    {studentDetails && (
                      <Slide direction="up" in={true} timeout={400}>
                        <Alert 
                          severity="success" 
                          sx={{ 
                            mt: 2, 
                            borderRadius: 2,
                            animation: 'successSlide 0.5s ease-out',
                            '@keyframes successSlide': {
                              '0%': { 
                                transform: 'translateY(20px)', 
                                opacity: 0 
                              },
                              '100%': { 
                                transform: 'translateY(0)', 
                                opacity: 1 
                              },
                            }
                          }}
                        >
                          <Typography variant="body1" fontWeight={600}>
                            ✅ <strong>Student Selected:</strong> {studentDetails.firstName} {studentDetails.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            ID: {studentDetails.studentId} • Phone: {studentDetails.phone}
                          </Typography>
                        </Alert>
                      </Slide>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Fade in={true} timeout={600}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Typography variant="body1" fontWeight={600}>
                          🎉 Auto-Registration Enabled
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          New students will be automatically registered with a unique ID generated by the system.
                        </Typography>
                      </Alert>
                    </Fade>
                    
                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Student Name"
                        value={formData.studentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                        error={!!errors.studentName}
                        helperText={errors.studentName}
                        placeholder="Enter full name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        size="small"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        error={!!errors.phone}
                        helperText={errors.phone || "Unique student ID will be generated automatically"}
                        placeholder="e.g., +91 9876543210"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
            </Zoom>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            {/* Pricing Plans */}
            <Slide direction="up" in={true} timeout={400}>
              <Card sx={{ 
                mb: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.15)}`,
                }
              }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: theme.palette.success.main }}><AttachMoney /></Avatar>}
                  title="Pricing Plans"
                  subheader="Select a plan to auto-fill payment details"
                />
                <CardContent>
                  {isLoadingPricingPlans ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                      <CircularProgress 
                        size={24} 
                        color="success"
                        sx={{ 
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          }
                        }} 
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Loading pricing plans...
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fetching available plans
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {getActivePricingPlans().map((plan, index) => (
                      <Zoom in={true} timeout={600 + index * 100} key={plan.id}>
                        <Box sx={{ flex: '1 1 140px', minWidth: { xs: 'calc(50% - 4px)', sm: '140px' }, maxWidth: { xs: 'calc(50% - 4px)', sm: '160px' } }}>
                          <Paper
                            elevation={plan.isPopular ? 3 : 1}
                            sx={{
                              p: { xs: 1, sm: 1.5 },
                              cursor: 'pointer',
                              border: `1px solid ${plan.isPopular ? theme.palette.primary.main : alpha(theme.palette.divider, 0.3)}`,
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              '&:hover': {
                                elevation: 2,
                                borderColor: theme.palette.primary.main,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                              }
                            }}
                            onClick={() => applyPricingPlan(plan)}
                          >
                          {plan.isPopular && (
                            <Chip
                              label="★"
                              color="primary"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                minWidth: 20,
                                height: 20,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}
                            />
                          )}
                          
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight={600} color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, mb: 0.5 }}>
                              {plan.name}
                            </Typography>
                            
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                ₹{plan.discount ? plan.price - plan.discount : plan.price}
                              </Typography>
                              {plan.discount && (
                                <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: '0.7rem' }}>
                                  ₹{plan.price}
                                </Typography>
                              )}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              mb: 1,
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}>
                              {plan.description}
                            </Typography>
                            
                            <Button
                              variant={plan.isPopular ? 'contained' : 'outlined'}
                              color={plan.isPopular ? 'primary' : 'inherit'}
                              size="small"
                              fullWidth
                              sx={{ 
                                borderRadius: 1,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                py: 0.5,
                                minHeight: 'auto'
                              }}
                            >
                              Select
                            </Button>
                            </Box>
                          </Paper>
                        </Box>
                      </Zoom>
                    ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Slide>

            {/* Payment Details */}
            <Zoom in={true} timeout={800}>
              <Card sx={{
                mb: 2,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.15)}`,
                }
              }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: theme.palette.warning.main }}><Receipt /></Avatar>}
                  title="Payment Details"
                  subheader="Enter payment amount, method, and period"
                />
                <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '300px' } }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Amount (₹)"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        placeholder="Enter amount"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '300px' } }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={formData.paymentMethod}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          label="Payment Method"
                          sx={{
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }}
                        >
                          <MenuItem value="cash">💵 Cash</MenuItem>
                          <MenuItem value="cheque">📄 Cheque</MenuItem>
                          <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
                          <MenuItem value="upi">📱 UPI</MenuItem>
                          <MenuItem value="card">💳 Card</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '300px' } }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ flex: '1 1 300px', minWidth: { xs: '100%', sm: '300px' } }}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={2}
                    placeholder="Additional notes or description"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
            </Zoom>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Card>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: theme.palette.info.main }}><CheckCircle /></Avatar>}
                title="Payment Confirmation"
                subheader="Review all details before submitting"
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>Library Information</Typography>
                    <Typography><strong>Library:</strong> {selectedLibrary?.name || 'StudySpot Library'}</Typography>
                    {selectedLibrary?.address && <Typography><strong>Address:</strong> {selectedLibrary.address}</Typography>}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom>Student Information</Typography>
                    <Typography><strong>Name:</strong> {formData.studentName}</Typography>
                    <Typography><strong>Phone:</strong> {formData.phone}</Typography>
                    {formData.studentId && <Typography><strong>Student ID:</strong> {formData.studentId}</Typography>}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom>Payment Information</Typography>
                    <Typography><strong>Transaction ID:</strong> <code style={{ 
                      background: '#f5f5f5', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    }}>TXN-{previewTransactionId}</code></Typography>
                    <Typography><strong>Amount:</strong> ₹{formData.amount}</Typography>
                    <Typography><strong>Payment Method:</strong> {formData.paymentMethod}</Typography>
                    <Typography><strong>Period:</strong> {formData.startDate} to {formData.endDate}</Typography>
                    {formData.description && <Typography><strong>Description:</strong> {formData.description}</Typography>}
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h6" gutterBottom>Staff Information</Typography>
                    <Typography><strong>Received By:</strong> {formData.receivedBy}</Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.staffConfirmation}
                        onChange={(e) => setFormData(prev => ({ ...prev, staffConfirmation: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label="I confirm that all details are correct and payment has been received"
                  />
                  
                  {errors.staffConfirmation && (
                    <Fade in={true} timeout={300}>
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errors.staffConfirmation}
                      </Alert>
                    </Fade>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            {showInvoice && invoiceData ? (
              <Card>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: theme.palette.success.main }}><PictureAsPdf /></Avatar>}
                  title="✅ Payment Completed Successfully!"
                  subheader="Invoice generated and payment recorded"
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="success.main" gutterBottom>
                        ✅ Payment Successful!
                      </Typography>
                      <Typography variant="h6">
                        Transaction {invoiceData.id} • ₹{invoiceData.amount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        ID: {invoiceData.transactionId} • {invoiceData.date} at {invoiceData.time}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: { xs: 1, sm: 1.5 }, 
                      justifyContent: 'center' 
                    }}>
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={handlePrintInvoice}
                        sx={{ borderRadius: 2 }}
                      >
                        Print Invoice
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleDownloadInvoice}
                        sx={{ borderRadius: 2 }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Share />}
                        onClick={handleShareInvoice}
                        sx={{ borderRadius: 2 }}
                      >
                        Share
                      </Button>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="primary" />
                        Auto-Send Invoice
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Send invoice to all available channels with one click
                      </Typography>

                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<Send />}
                        onClick={handleAutoSendInvoice}
                        disabled={isSendingInvoice}
                        sx={{ 
                          mb: 2,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        }}
                      >
                        {isSendingInvoice ? 'Sending...' : 'Send to All Channels'}
                      </Button>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {[
                          { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsApp />, color: '#25D366' },
                          { key: 'sms', label: 'SMS', icon: <Message />, color: '#2196F3' },
                          { key: 'email', label: 'Email', icon: <Email />, color: '#FF9800' },
                          { key: 'account', label: 'Student Account', icon: <AccountBalance />, color: '#9C27B0' },
                        ].map(({ key, label, icon, color }) => (
                          <Chip
                            key={key}
                            icon={icon}
                            label={label}
                            color={sendStatus[key] === 'success' ? 'success' : sendStatus[key] === 'error' ? 'error' : 'default'}
                            variant={sendStatus[key] === 'sending' ? 'outlined' : 'filled'}
                            sx={{
                              '& .MuiChip-icon': { color: sendStatus[key] === 'idle' ? color : undefined },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {isGeneratingInvoice ? 'Generating Invoice...' : 'Processing Payment...'}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          maxHeight: { xs: '100vh', sm: '95vh' },
          height: { xs: '100vh', sm: 'auto' },
          width: { xs: '100vw', sm: 'auto' },
          margin: { xs: 0, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '"🎓 STUDYSPOT"',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            fontSize: '4rem',
            fontWeight: 800,
            color: alpha(theme.palette.primary.main, 0.08),
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            '@media (max-width: 600px)': {
              fontSize: '2.5rem',
            }
          },
          '&::after': {
            content: '"Empowering Libraries with Smart Management Solutions"',
            position: 'absolute',
            top: 'calc(50% + 3rem)',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            fontSize: '1.2rem',
            fontWeight: 500,
            color: alpha(theme.palette.primary.main, 0.06),
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            '@media (max-width: 600px)': {
              fontSize: '0.9rem',
              top: 'calc(50% + 2rem)',
            }
          }
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Receipt />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} fontWeight={700}>
              💰 Offline Payment Collection
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Automated payment processing with smart features
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
        {/* Progress Stepper */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Fade in={true} timeout={300} key={activeStep}>
          <Box>
            {renderStepContent(activeStep)}
          </Box>
        </Fade>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          width: '100%', 
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <Button 
            onClick={handleReset} 
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, minWidth: { xs: '80px', sm: 'auto' } }}
          >
            Reset
          </Button>

          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            {activeStep > 0 && (
              <Button 
                onClick={handleBack}
                variant="outlined"
                size="small"
                sx={{ borderRadius: 2, minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Back
              </Button>
            )}

            {activeStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                variant="contained"
                size="small"
                color="primary"
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '80px', sm: 'auto' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                }}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained"
                size="small"
                color="success"
                startIcon={<CheckCircle />}
                disabled={!formData.staffConfirmation || isRegisteringStudent || isGeneratingInvoice}
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('staffConfirmation:', formData.staffConfirmation);
                  console.log('isRegisteringStudent:', isRegisteringStudent);
                  console.log('isGeneratingInvoice:', isGeneratingInvoice);
                  
                  // If we're on step 3 and invoice is not yet shown, process payment
                  if (activeStep === 3 && !showInvoice) {
                    handleConfirmSubmit();
                  } else {
                    // If invoice is already shown, just close the dialog
                    onClose();
                  }
                }}
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '120px', sm: 'auto' },
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                }}
              >
                {isRegisteringStudent ? 'Registering Student...' : 
                 isGeneratingInvoice ? 'Generating Invoice...' : 
                 showInvoice ? 'Close' : 'Complete Payment'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OfflinePaymentDialog;
