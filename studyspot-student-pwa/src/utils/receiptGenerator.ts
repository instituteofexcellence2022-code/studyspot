/**
 * 📄 RECEIPT GENERATOR
 * 
 * Generates PDF receipts for bookings
 */

import jsPDF from 'jspdf';

interface ReceiptData {
  bookingId: string;
  date: string;
  libraryName: string;
  seats: string[];
  duration: string;
  basePrice: number;
  addons: {
    locker?: number;
    snacks?: number;
    wifi?: number;
  };
  totalAmount: number;
  paymentMethod: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
}

export const generateReceipt = (data: ReceiptData) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = '#2563eb';
  const grayColor = '#6b7280';
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('StudySpot', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Booking Receipt', 105, 25, { align: 'center' });
  doc.text(`Booking ID: ${data.bookingId}`, 105, 33, { align: 'center' });
  
  // Reset color
  doc.setTextColor(0, 0, 0);
  
  // Library Info
  let yPos = 55;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Library Information', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.libraryName}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Booking Date: ${new Date(data.date).toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Duration: ${data.duration.charAt(0).toUpperCase() + data.duration.slice(1)}`, 20, yPos);
  
  // Customer Info
  if (data.studentName) {
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${data.studentName}`, 20, yPos);
    
    if (data.studentEmail) {
      yPos += 6;
      doc.text(`Email: ${data.studentEmail}`, 20, yPos);
    }
    
    if (data.studentPhone) {
      yPos += 6;
      doc.text(`Phone: ${data.studentPhone}`, 20, yPos);
    }
  }
  
  // Seat Details
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Seat Details', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Selected Seats: ${data.seats.join(', ')}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Total Seats: ${data.seats.length}`, 20, yPos);
  
  // Divider line
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  
  // Pricing Breakdown
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Pricing Breakdown', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Base price
  doc.text(`Base Price (${data.seats.length} seat${data.seats.length > 1 ? 's' : ''})`, 20, yPos);
  doc.text(`₹${data.basePrice.toFixed(2)}`, 190, yPos, { align: 'right' });
  
  // Add-ons
  if (data.addons.locker) {
    yPos += 6;
    doc.text('Personal Locker', 20, yPos);
    doc.text(`₹${data.addons.locker.toFixed(2)}`, 190, yPos, { align: 'right' });
  }
  
  if (data.addons.snacks) {
    yPos += 6;
    doc.text('Snacks Package', 20, yPos);
    doc.text(`₹${data.addons.snacks.toFixed(2)}`, 190, yPos, { align: 'right' });
  }
  
  if (data.addons.wifi) {
    yPos += 6;
    doc.text('Premium WiFi', 20, yPos);
    doc.text(`₹${data.addons.wifi.toFixed(2)}`, 190, yPos, { align: 'right' });
  }
  
  // Total
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount', 20, yPos);
  doc.setTextColor(37, 99, 235);
  doc.text(`₹${data.totalAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Payment Method
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 20, yPos);
  
  yPos += 6;
  doc.setTextColor(0, 150, 0);
  doc.text('✓ Payment Confirmed', 20, yPos);
  doc.setTextColor(0, 0, 0);
  
  // Terms & Conditions
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Terms & Conditions:', 20, yPos);
  yPos += 5;
  doc.text('• Please arrive 10 minutes before your booking time', 20, yPos);
  yPos += 5;
  doc.text('• Carry a valid ID card for verification', 20, yPos);
  yPos += 5;
  doc.text('• Follow library rules and maintain silence', 20, yPos);
  yPos += 5;
  doc.text('• No refunds for no-shows without prior cancellation', 20, yPos);
  
  // Footer
  yPos = 280;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, yPos, 210, 17, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text('Thank you for choosing StudySpot!', 105, yPos + 6, { align: 'center' });
  doc.text('For support: support@studyspot.com | +91 98765 43210', 105, yPos + 11, { align: 'center' });
  
  // Generate filename
  const filename = `StudySpot_Receipt_${data.bookingId}.pdf`;
  
  // Download PDF
  doc.save(filename);
  
  return filename;
};

/**
 * Generate HTML receipt for preview or printing
 */
export const generateHTMLReceipt = (data: ReceiptData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Booking Receipt - ${data.bookingId}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .receipt {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
          margin: -40px -40px 30px -40px;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
        }
        .header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
          color: #6b7280;
        }
        .info-value {
          font-weight: 600;
        }
        .total {
          font-size: 24px;
          color: #2563eb;
          font-weight: bold;
          text-align: right;
          margin-top: 20px;
        }
        .seats {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        .seat-chip {
          background: #2563eb;
          color: white;
          padding: 5px 15px;
          border-radius: 16px;
          font-size: 14px;
        }
        .success-badge {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>🎓 StudySpot</h1>
          <p>Booking Receipt</p>
          <p><strong>ID: ${data.bookingId}</strong></p>
        </div>

        <div class="section">
          <h2>📚 Library Details</h2>
          <div class="info-row">
            <span class="info-label">Library Name:</span>
            <span class="info-value">${data.libraryName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking Date:</span>
            <span class="info-value">${new Date(data.date).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value">${data.duration.charAt(0).toUpperCase() + data.duration.slice(1)}</span>
          </div>
        </div>

        <div class="section">
          <h2>🪑 Seat Information</h2>
          <div class="info-row">
            <span class="info-label">Number of Seats:</span>
            <span class="info-value">${data.seats.length}</span>
          </div>
          <div class="seats">
            ${data.seats.map(seat => `<span class="seat-chip">${seat}</span>`).join('')}
          </div>
        </div>

        <div class="section">
          <h2>💰 Payment Details</h2>
          <div class="info-row">
            <span class="info-label">Base Price (${data.seats.length} seat${data.seats.length > 1 ? 's' : ''}):</span>
            <span class="info-value">₹${data.basePrice.toFixed(2)}</span>
          </div>
          ${data.addons.locker ? `
            <div class="info-row">
              <span class="info-label">Personal Locker:</span>
              <span class="info-value">₹${data.addons.locker.toFixed(2)}</span>
            </div>
          ` : ''}
          ${data.addons.snacks ? `
            <div class="info-row">
              <span class="info-label">Snacks Package:</span>
              <span class="info-value">₹${data.addons.snacks.toFixed(2)}</span>
            </div>
          ` : ''}
          ${data.addons.wifi ? `
            <div class="info-row">
              <span class="info-label">Premium WiFi:</span>
              <span class="info-value">₹${data.addons.wifi.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total">Total: ₹${data.totalAmount.toFixed(2)}</div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${data.paymentMethod.toUpperCase()}</span>
          </div>
        </div>

        <div class="success-badge">
          ✅ Payment Confirmed
        </div>

        <div class="section">
          <h2>📋 Important Information</h2>
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.8;">
            <li>Please arrive 10 minutes before your booking time</li>
            <li>Carry a valid ID card for verification</li>
            <li>Show this receipt at the library entrance</li>
            <li>Follow library rules and maintain silence</li>
            <li>No refunds for no-shows without prior cancellation (24hrs)</li>
          </ul>
        </div>

        ${data.studentName ? `
          <div class="section">
            <h2>👤 Student Details</h2>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${data.studentName}</span>
            </div>
            ${data.studentEmail ? `
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${data.studentEmail}</span>
              </div>
            ` : ''}
            ${data.studentPhone ? `
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${data.studentPhone}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <p><strong>Thank you for choosing StudySpot!</strong></p>
          <p>For support: support@studyspot.com | +91 98765 43210</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Generated on ${new Date().toLocaleString('en-IN')}
          </p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Download HTML receipt
 */
export const downloadHTMLReceipt = (data: ReceiptData) => {
  const html = generateHTMLReceipt(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StudySpot_Receipt_${data.bookingId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return `StudySpot_Receipt_${data.bookingId}.html`;
};

/**
 * Print receipt in new window
 */
export const printReceipt = (data: ReceiptData) => {
  const html = generateHTMLReceipt(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }
};

