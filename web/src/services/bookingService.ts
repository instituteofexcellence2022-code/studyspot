import { Booking, PaginatedResponse } from '../types';
import { apiService } from './api';
import { API_CONFIG } from '../constants';

export interface BookingSearchParams {
  userId?: string;
  libraryId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class BookingService {
  async getBookings(params: BookingSearchParams = {}): Promise<PaginatedResponse<Booking>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return await apiService.get<PaginatedResponse<Booking>>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.LIST}?${searchParams}`
    );
  }

  async getBookingById(id: string): Promise<Booking> {
    return await apiService.get<Booking>(
      API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id)
    );
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return await apiService.post<Booking>(
      API_CONFIG.ENDPOINTS.BOOKINGS.CREATE,
      bookingData
    );
  }

  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return await apiService.put<Booking>(
      API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE.replace(':id', id),
      bookingData
    );
  }

  async deleteBooking(id: string): Promise<void> {
    return await apiService.delete<void>(
      API_CONFIG.ENDPOINTS.BOOKINGS.DELETE.replace(':id', id)
    );
  }

  async getUserBookings(userId: string, params: Omit<BookingSearchParams, 'userId'> = {}): Promise<PaginatedResponse<Booking>> {
    return await this.getBookings({ ...params, userId });
  }

  async getLibraryBookings(libraryId: string, params: Omit<BookingSearchParams, 'libraryId'> = {}): Promise<PaginatedResponse<Booking>> {
    return await this.getBookings({ ...params, libraryId });
  }

  async cancelBooking(id: string): Promise<Booking> {
    return await apiService.patch<Booking>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id)}/cancel`,
      {}
    );
  }

  async checkInBooking(id: string): Promise<Booking> {
    return await apiService.patch<Booking>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id)}/checkin`,
      {}
    );
  }

  async checkOutBooking(id: string): Promise<Booking> {
    return await apiService.patch<Booking>(
      `${API_CONFIG.ENDPOINTS.BOOKINGS.BY_ID.replace(':id', id)}/checkout`,
      {}
    );
  }

  async getBookingAvailability(libraryId: string, date: string): Promise<{
    availableSeats: number;
    totalSeats: number;
    bookings: Array<{
      seatId: string;
      startTime: string;
      endTime: string;
    }>;
  }> {
    const params = new URLSearchParams({
      libraryId,
      date,
    });

    return await apiService.get<{
      availableSeats: number;
      totalSeats: number;
      bookings: Array<{
        seatId: string;
        startTime: string;
        endTime: string;
      }>;
    }>(`${API_CONFIG.ENDPOINTS.BOOKINGS.LIST}/availability?${params}`);
  }

  async getBookingStats(libraryId?: string, startDate?: string, endDate?: string): Promise<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    totalRevenue: number;
    averageBookingDuration: number;
  }> {
    const params = new URLSearchParams();
    if (libraryId) params.append('libraryId', libraryId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return await apiService.get<{
      totalBookings: number;
      completedBookings: number;
      cancelledBookings: number;
      noShowBookings: number;
      totalRevenue: number;
      averageBookingDuration: number;
    }>(`${API_CONFIG.ENDPOINTS.BOOKINGS.LIST}/stats?${params}`);
  }
}

export const bookingService = new BookingService();


