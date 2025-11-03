/**
 * StudySpot Mobile App - Bookings Slice
 * Redux slice for managing booking state
 */

import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Booking, BookingRequest, SeatAvailability, TimeSlot} from '../../types/index';
import {bookingsService} from '@services/BookingsService';

// =============================================================================
// INITIAL STATE
// =============================================================================

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  availability: SeatAvailability | null;
  timeSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  availability: null,
  timeSlots: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Get user bookings
 */
export const getBookings = createAsyncThunk(
  'bookings/getBookings',
  async (params: {page?: number; limit?: number; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.getBookings(
        params.page || 1,
        params.limit || 20,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

/**
 * Get booking details
 */
export const getBookingDetails = createAsyncThunk(
  'bookings/getBookingDetails',
  async (params: {bookingId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.getBookingDetails(
        params.bookingId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking details');
    }
  }
);

/**
 * Create new booking
 */
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (params: {bookingData: BookingRequest; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.createBooking(
        params.bookingData,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

/**
 * Cancel booking
 */
export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (params: {bookingId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.cancelBooking(
        params.bookingId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return {bookingId: params.bookingId, message: response.data.message};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

/**
 * Check in to booking
 */
export const checkIn = createAsyncThunk(
  'bookings/checkIn',
  async (params: {bookingId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.checkIn(
        params.bookingId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return {bookingId: params.bookingId, checkInTime: response.data.checkInTime};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

/**
 * Check out from booking
 */
export const checkOut = createAsyncThunk(
  'bookings/checkOut',
  async (params: {bookingId: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.checkOut(
        params.bookingId,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return {bookingId: params.bookingId, checkOutTime: response.data.checkOutTime};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

/**
 * Get seat availability
 */
export const getAvailability = createAsyncThunk(
  'bookings/getAvailability',
  async (params: {libraryId: string; date: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.getAvailability(
        params.libraryId,
        params.date,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

/**
 * Get time slots
 */
export const getTimeSlots = createAsyncThunk(
  'bookings/getTimeSlots',
  async (params: {libraryId: string; date: string; accessToken: string}, {rejectWithValue}) => {
    try {
      const response = await bookingsService.getTimeSlots(
        params.libraryId,
        params.date,
        {Authorization: `Bearer ${params.accessToken}`}
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time slots');
    }
  }
);

// =============================================================================
// BOOKINGS SLICE
// =============================================================================

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Clear current booking
    clearCurrentBooking: state => {
      state.currentBooking = null;
    },

    // Clear availability data
    clearAvailability: state => {
      state.availability = null;
      state.timeSlots = [];
    },

    // Set current booking
    setCurrentBooking: (state, action: PayloadAction<Booking>) => {
      state.currentBooking = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Get Bookings
      .addCase(getBookings.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Booking Details
      .addCase(getBookingDetails.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Booking
      .addCase(createBooking.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Cancel Booking
      .addCase(cancelBooking.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const bookingId = action.payload.bookingId;
        state.bookings = state.bookings.map(booking =>
          booking.id === bookingId
            ? {...booking, status: 'cancelled' as const}
            : booking
        );
        if (state.currentBooking?.id === bookingId) {
          state.currentBooking = {...state.currentBooking, status: 'cancelled' as const};
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check In
      .addCase(checkIn.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isLoading = false;
        const {bookingId, checkInTime} = action.payload;
        state.bookings = state.bookings.map(booking =>
          booking.id === bookingId
            ? {...booking, checkInTime, status: 'confirmed' as const}
            : booking
        );
        if (state.currentBooking?.id === bookingId) {
          state.currentBooking = {...state.currentBooking, checkInTime, status: 'confirmed' as const};
        }
        state.error = null;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Check Out
      .addCase(checkOut.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.isLoading = false;
        const {bookingId, checkOutTime} = action.payload;
        state.bookings = state.bookings.map(booking =>
          booking.id === bookingId
            ? {...booking, checkOutTime, status: 'completed' as const}
            : booking
        );
        if (state.currentBooking?.id === bookingId) {
          state.currentBooking = {...state.currentBooking, checkOutTime, status: 'completed' as const};
        }
        state.error = null;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Availability
      .addCase(getAvailability.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availability = action.payload;
        state.error = null;
      })
      .addCase(getAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get Time Slots
      .addCase(getTimeSlots.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTimeSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSlots = action.payload;
        state.error = null;
      })
      .addCase(getTimeSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const {
  clearError,
  setLoading,
  clearCurrentBooking,
  clearAvailability,
  setCurrentBooking,
} = bookingsSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectBookings = (state: {bookings: BookingsState}) => state.bookings.bookings;
export const selectCurrentBooking = (state: {bookings: BookingsState}) => state.bookings.currentBooking;
export const selectAvailability = (state: {bookings: BookingsState}) => state.bookings.availability;
export const selectTimeSlots = (state: {bookings: BookingsState}) => state.bookings.timeSlots;
export const selectBookingsLoading = (state: {bookings: BookingsState}) => state.bookings.isLoading;
export const selectBookingsError = (state: {bookings: BookingsState}) => state.bookings.error;
export const selectBookingsPagination = (state: {bookings: BookingsState}) => state.bookings.pagination;

// =============================================================================
// EXPORTS
// =============================================================================

export default bookingsSlice.reducer;
