/**
 * Direct UPI Payment Utility
 * Generates UPI deep links to open UPI apps directly (bypassing payment gateways)
 */

export interface UPIPaymentParams {
  upiId: string; // Merchant UPI ID (e.g., merchant@paytm)
  merchantName: string; // Merchant name
  amount: number; // Amount in INR
  transactionId: string; // Unique transaction reference
  description?: string; // Payment description
}

/**
 * Generate UPI deep link URL
 * Format: upi://pay?pa=<UPI_ID>&pn=<MERCHANT_NAME>&am=<AMOUNT>&cu=INR&tn=<TRANSACTION_NOTE>
 */
export function generateUPIDeeplink(params: UPIPaymentParams): string {
  const { upiId, merchantName, amount, transactionId, description } = params;
  
  // Encode parameters
  const encodedUpiId = encodeURIComponent(upiId);
  const encodedMerchantName = encodeURIComponent(merchantName);
  const encodedAmount = amount.toFixed(2);
  const transactionNote = description || `Payment for ${transactionId}`;
  const encodedNote = encodeURIComponent(transactionNote);
  
  // Build UPI deep link
  const upiLink = `upi://pay?pa=${encodedUpiId}&pn=${encodedMerchantName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}&tr=${transactionId}`;
  
  return upiLink;
}

/**
 * Generate UPI Intent URL (for Android)
 * This is an alternative format that works better on Android
 */
export function generateUPIIntent(params: UPIPaymentParams): string {
  const { upiId, merchantName, amount, transactionId, description } = params;
  
  const encodedUpiId = encodeURIComponent(upiId);
  const encodedMerchantName = encodeURIComponent(merchantName);
  const encodedAmount = amount.toFixed(2);
  const transactionNote = description || `Payment for ${transactionId}`;
  const encodedNote = encodeURIComponent(transactionNote);
  
  // Android Intent URL format
  const intentUrl = `intent://pay?pa=${encodedUpiId}&pn=${encodedMerchantName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}&tr=${transactionId}#Intent;scheme=upi;end`;
  
  return intentUrl;
}

/**
 * Open UPI payment in user's default UPI app
 */
export function openUPIPayment(params: UPIPaymentParams): boolean {
  try {
    // Try Android Intent first (better compatibility)
    const intentUrl = generateUPIIntent(params);
    
    // Try to open with intent URL
    const intentWindow = window.open(intentUrl, '_blank');
    
    // If intent doesn't work, try deep link
    if (!intentWindow || intentWindow.closed) {
      const deepLink = generateUPIDeeplink(params);
      window.location.href = deepLink;
    }
    
    return true;
  } catch (error) {
    console.error('[UPI] Failed to open UPI payment:', error);
    return false;
  }
}

/**
 * Check if device supports UPI
 */
export function isUPISupported(): boolean {
  // Check if we're on Android or iOS
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // UPI works on both Android and iOS
  return isAndroid || isIOS;
}

/**
 * Generate QR code data for UPI payment
 * Returns UPI string that can be used to generate QR code
 */
export function generateUPIQRString(params: UPIPaymentParams): string {
  const { upiId, merchantName, amount, transactionId, description } = params;
  
  const encodedUpiId = encodeURIComponent(upiId);
  const encodedMerchantName = encodeURIComponent(merchantName);
  const encodedAmount = amount.toFixed(2);
  const transactionNote = description || `Payment for ${transactionId}`;
  const encodedNote = encodeURIComponent(transactionNote);
  
  // UPI QR code format
  return `${encodedUpiId}?pn=${encodedMerchantName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}&tr=${transactionId}`;
}

