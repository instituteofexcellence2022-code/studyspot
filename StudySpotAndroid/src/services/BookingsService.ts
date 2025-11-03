/**
 * StudySpot Mobile App - Bookings Service
 * Service for handling booking-related API calls
 */

import axios, {AxiosResponse} from 'axios';
import {API_CONFIG} from '@constants/index';
import {ApiResponse, Booking, BookingRequest, SeatAvailability, TimeSlot} from '../types/index';

class BookingsService {
  private baseURL = API_CONFIG.BASE_URL;
  private timeout = API_CONFIG.TIMEOUT;

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  async getAvailability(
    libraryId: string,
    date: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<SeatAvailability>> {
    return this.makeRequest('GET', `${API_CONFIG.ENDPOINTS.BOOKINGS.AVAILABILITY}?libraryId=${libraryId}&date=${date}`, undefined, headers);
  }

  async createBooking(
    bookingData: BookingRequest,
    headers?: Record<string, string>
  ): Promise<ApiResponse<Booking>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, bookingData, headers);
  }

  async getBookings(
    page: number = 1,
    limit: number = 20,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{bookings: Booking[]; pagination: any}>> {
    return this.makeRequest('GET', `${API_CONFIG.ENDPOINTS.BOOKINGS.LIST}?page=${page}&limit=${limit}`, undefined, headers);
  }

  async getBookingDetails(
    bookingId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<Booking>> {
    return this.makeRequest('GET', API_CONFIG.ENDPOINTS.BOOKINGS.DETAILS.replace(':id', bookingId), undefined, headers);
  }

  async cancelBooking(
    bookingId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{message: string}>> {
    return this.makeRequest('DELETE', API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL.replace(':id', bookingId), undefined, headers);
  }

  async checkIn(
    bookingId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{message: string; checkInTime: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.BOOKINGS.CHECKIN.replace(':id', bookingId), undefined, headers);
  }

  async checkOut(
    bookingId: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<{message: string; checkOutTime: string}>> {
    return this.makeRequest('POST', API_CONFIG.ENDPOINTS.BOOKINGS.CHECKOUT.replace(':id', bookingId), undefined, headers);
  }

  async getTimeSlots(
    libraryId: string,
    date: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<TimeSlot[]>> {
    return this.makeRequest('GET', `${API_CONFIG.ENDPOINTS.BOOKINGS.AVAILABILITY}?libraryId=${libraryId}&date=${date}&type=slots`, undefined, headers);
  }
}

export const bookingsService = new BookingsService();
export default bookingsService;
