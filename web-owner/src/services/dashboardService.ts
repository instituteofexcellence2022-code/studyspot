/**
 * Dashboard Service
 * Aggregates data from multiple services for dashboard statistics
 */

import { libraryService } from './libraryService';
import studentsService from './studentsService';
import { BookingService } from './bookingService';
import { apiService } from './api';

export interface DashboardStats {
  totalLibraries: number;
  totalSeats: number;
  availableSeats: number;
  activeStudents: number;
  todayAttendance: number;
  totalRevenue: number;
  activeFeePlans: number;
  totalStaff: number;
  pendingPayments: number;
  recentBookings: any[];
  recentActivity: any[];
}

export class DashboardService {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(dateRange: string = 'today'): Promise<DashboardStats> {
    try {
      // Calculate date range
      const today = new Date();
      const startDate = this.getStartDate(dateRange, today);
      const endDate = today.toISOString().split('T')[0];

      // Fetch data in parallel
      const [
        librariesResponse,
        studentsResponse,
        bookingsResponse,
        revenueData,
        feePlansData,
        staffData,
      ] = await Promise.allSettled([
        // Libraries
        libraryService.getLibraries(1, 1000),
        
        // Students (active)
        studentsService.getStudents({
          status: ['active'],
          page: 1,
          limit: 1000,
        }),
        
        // Bookings (today)
        this.bookingService.getBookings({
          startDate: startDate,
          endDate: endDate,
          page: 1,
          limit: 100,
        }),
        
        // Revenue (try to fetch from analytics or calculate from bookings)
        this.getRevenueData(startDate, endDate),
        
        // Fee Plans
        this.getFeePlans(),
        
        // Staff
        this.getStaffCount(),
      ]);

      // Extract data from responses
      const libraries = librariesResponse.status === 'fulfilled' 
        ? (Array.isArray(librariesResponse.value) 
            ? librariesResponse.value 
            : librariesResponse.value?.data || librariesResponse.value?.items || [])
        : [];
      
      const students = studentsResponse.status === 'fulfilled'
        ? (Array.isArray(studentsResponse.value)
            ? studentsResponse.value
            : studentsResponse.value?.students || studentsResponse.value?.data || [])
        : [];
      
      const bookings = bookingsResponse.status === 'fulfilled'
        ? (Array.isArray(bookingsResponse.value)
            ? bookingsResponse.value
            : bookingsResponse.value?.bookings || bookingsResponse.value?.data || bookingsResponse.value?.items || [])
        : [];

      // Calculate statistics
      const totalLibraries = Array.isArray(libraries) ? libraries.length : 0;
      
      // Calculate total seats from libraries
      let totalSeats = 0;
      let availableSeats = 0;
      if (Array.isArray(libraries)) {
        libraries.forEach((lib: any) => {
          const capacity = lib.capacity || lib.seatCount || 0;
          const occupancy = lib.currentOccupancy || 0;
          totalSeats += capacity;
          availableSeats += Math.max(0, capacity - occupancy);
        });
      }

      const activeStudents = Array.isArray(students) ? students.length : 0;
      
      // Today's attendance (check-ins)
      const todayBookings = Array.isArray(bookings) 
        ? bookings.filter((b: any) => {
            const bookingDate = new Date(b.startTime || b.date || b.createdAt);
            return bookingDate.toDateString() === today.toDateString();
          })
        : [];
      const todayAttendance = todayBookings.length;

      // Revenue
      const totalRevenue = revenueData.status === 'fulfilled'
        ? revenueData.value?.totalRevenue || revenueData.value || 0
        : 0;

      // Fee Plans
      const activeFeePlans = feePlansData.status === 'fulfilled'
        ? (Array.isArray(feePlansData.value) ? feePlansData.value.length : 0)
        : 0;

      // Staff
      const totalStaff = staffData.status === 'fulfilled'
        ? staffData.value || 0
        : 0;

      // Pending payments (calculate from bookings with pending status)
      const pendingBookings = Array.isArray(bookings)
        ? bookings.filter((b: any) => b.paymentStatus === 'pending' || b.status === 'pending')
        : [];
      const pendingPayments = pendingBookings.reduce((sum: number, b: any) => {
        return sum + (parseFloat(b.totalAmount || b.amount || 0));
      }, 0);

      // Recent bookings (last 10)
      const recentBookings = Array.isArray(bookings)
        ? bookings.slice(0, 10).map((b: any) => ({
            id: b.id,
            studentName: b.studentName || b.userName || 'Unknown',
            libraryName: b.libraryName || b.library?.name || 'Unknown',
            date: b.date || b.startTime,
            status: b.status,
            amount: b.totalAmount || b.amount,
          }))
        : [];

      // Recent activity (from bookings and students)
      const recentActivity = this.buildRecentActivity(bookings, students);

      return {
        totalLibraries,
        totalSeats,
        availableSeats,
        activeStudents,
        todayAttendance,
        totalRevenue,
        activeFeePlans,
        totalStaff,
        pendingPayments,
        recentBookings,
        recentActivity,
      };
    } catch (error: any) {
      console.error('❌ [DashboardService] Failed to fetch dashboard stats:', error);
      // Return default values on error
      return {
        totalLibraries: 0,
        totalSeats: 0,
        availableSeats: 0,
        activeStudents: 0,
        todayAttendance: 0,
        totalRevenue: 0,
        activeFeePlans: 0,
        totalStaff: 0,
        pendingPayments: 0,
        recentBookings: [],
        recentActivity: [],
      };
    }
  }

  /**
   * Get revenue data
   */
  private async getRevenueData(startDate: string, endDate: string): Promise<any> {
    try {
      // Try to fetch from revenue/analytics endpoint
      const response = await apiService.get<any>(
        `/api/v1/analytics/revenue?startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      // If analytics endpoint doesn't exist, calculate from bookings
      try {
        const bookings = await this.bookingService.getBookings({
          startDate,
          endDate,
          status: 'confirmed',
        });
        const bookingsList = Array.isArray(bookings)
          ? bookings
          : (bookings?.bookings || bookings?.data || bookings?.items || []);
        const totalRevenue = bookingsList.reduce((sum: number, b: any) => {
          return sum + (parseFloat(b.totalAmount || b.amount || 0));
        }, 0);
        return { totalRevenue };
      } catch (err) {
        return { totalRevenue: 0 };
      }
    }
  }

  /**
   * Get fee plans
   */
  private async getFeePlans(): Promise<any[]> {
    try {
      const response = await apiService.get<any>('/api/v1/fee-plans');
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get staff count
   */
  private async getStaffCount(): Promise<number> {
    try {
      const response = await apiService.get<any>('/api/v1/users?role=staff');
      const users = Array.isArray(response) ? response : (response.data || response.users || []);
      return users.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Build recent activity feed
   */
  private buildRecentActivity(bookings: any[], students: any[]): any[] {
    const activities: any[] = [];

    // Add recent bookings
    bookings.slice(0, 5).forEach((booking: any) => {
      activities.push({
        type: 'booking',
        message: `${booking.studentName || 'Student'} booked seat at ${booking.libraryName || 'Library'}`,
        time: this.getTimeAgo(new Date(booking.createdAt || booking.date)),
        icon: 'booking',
        color: 'info',
      });
    });

    // Add recent student registrations
    if (Array.isArray(students)) {
      students.slice(0, 3).forEach((student: any) => {
        const enrollDate = new Date(student.enrollmentDate || student.createdAt);
        if (this.isRecent(enrollDate)) {
          activities.push({
            type: 'student',
            message: `New student ${student.firstName} ${student.lastName} registered`,
            time: this.getTimeAgo(enrollDate),
            icon: 'student',
            color: 'primary',
          });
        }
      });
    }

    return activities.sort((a, b) => {
      // Sort by time (most recent first)
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    }).slice(0, 10);
  }

  /**
   * Get start date based on range
   */
  private getStartDate(range: string, today: Date): string {
    const date = new Date(today);
    switch (range) {
      case 'today':
        return date.toISOString().split('T')[0];
      case 'week':
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
      case 'month':
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        return date.toISOString().split('T')[0];
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Check if date is recent (within last 7 days)
   */
  private isRecent(date: Date): boolean {
    const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }

  /**
   * Get time ago string
   */
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} sec ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export const dashboardService = new DashboardService();

