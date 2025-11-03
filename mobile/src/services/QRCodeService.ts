/**
 * StudySpot Mobile App - QR Code Service
 * Service for generating and managing QR codes
 */

import React from 'react';
import QRCode from 'react-native-qrcode-svg';

export interface QRCodeData {
  libraryId: string;
  seatId?: string;
  bookingId?: string;
  type: 'checkin' | 'checkout' | 'library' | 'seat';
  timestamp: string;
  signature?: string;
}

export interface QRCodeParams {
  data: QRCodeData;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

class QRCodeService {
  /**
   * Generate QR code data for library check-in/out
   */
  generateQRData(
    libraryId: string,
    type: 'checkin' | 'checkout' | 'library' | 'seat',
    seatId?: string,
    bookingId?: string
  ): QRCodeData {
    const qrData: QRCodeData = {
      libraryId,
      type,
      timestamp: new Date().toISOString(),
    };

    if (seatId) {
      qrData.seatId = seatId;
    }

    if (bookingId) {
      qrData.bookingId = bookingId;
    }

    // In a real app, you would add a signature for security
    // qrData.signature = this.generateSignature(qrData);

    return qrData;
  }

  /**
   * Convert QR data to JSON string
   */
  qrDataToString(data: QRCodeData): string {
    return JSON.stringify(data);
  }

  /**
   * Parse QR code string to QR data
   */
  parseQRString(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString);

      // Validate required fields
      if (!data.libraryId || !data.type || !data.timestamp) {
        return null;
      }

      return data as QRCodeData;
    } catch (error) {
      console.error('Failed to parse QR code:', error);
      return null;
    }
  }

  /**
   * Validate QR code data
   */
  validateQRData(data: QRCodeData): boolean {
    // Check if required fields exist
    if (!data.libraryId || !data.type || !data.timestamp) {
      return false;
    }

    // Check if timestamp is not too old (e.g., 24 hours)
    const timestamp = new Date(data.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return false;
    }

    // In a real app, you would verify the signature here
    // return this.verifySignature(data);

    return true;
  }

  /**
   * Generate QR code parameters for component rendering
   * Returns props that can be passed to the QRCode component
   */
  generateQRCodeProps(
    data: QRCodeData,
    size: number = 200,
    color: string = '#000000',
    backgroundColor: string = '#FFFFFF'
  ): QRCodeParams {
    return {
      data,
      size,
      color,
      backgroundColor,
    };
  }

  /**
   * Generate signature for QR code security (placeholder)
   */
  private generateSignature(data: QRCodeData): string {
    // In a real app, you would use HMAC or similar to generate a signature
    // This is just a placeholder
    // Use base64 encoding for React Native
    const str = JSON.stringify(data) + 'secret_key';
    return Buffer.from(str).toString('base64');
  }

  /**
   * Verify signature for QR code security (placeholder)
   */
  private verifySignature(data: QRCodeData): boolean {
    // In a real app, you would verify the signature
    // This is just a placeholder
    return true;
  }

  /**
   * Get QR code type description
   */
  getQRTypeDescription(type: QRCodeData['type']): string {
    switch (type) {
      case 'checkin':
        return 'Library Check-in QR Code';
      case 'checkout':
        return 'Library Check-out QR Code';
      case 'library':
        return 'Library Information QR Code';
      case 'seat':
        return 'Seat QR Code';
      default:
        return 'Unknown QR Code';
    }
  }

  /**
   * Get QR code type icon
   */
  getQRTypeIcon(type: QRCodeData['type']): string {
    switch (type) {
      case 'checkin':
        return 'login';
      case 'checkout':
        return 'logout';
      case 'library':
        return 'library-books';
      case 'seat':
        return 'chair';
      default:
        return 'qr-code';
    }
  }
}

export const qrCodeService = new QRCodeService();
export default qrCodeService;


